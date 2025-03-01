import { IDatabaseModel } from "./types";
import { Auth, CompleteAuthWithId } from "../schemas/auth";
import { ApiError } from "../errors/api-error";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { ERRORS } from "../errors/types";
import { BCRYPT_SALT_ROUNDS, NODE_ENV } from "../config";
import path from "node:path";
import { cwd } from "node:process";
import chalk from "chalk";

export class DatabaseModel implements IDatabaseModel {
  private readonly database: Database.Database;
  private readonly BCRYPT_SALT_ROUNDS: number;

  constructor(private readonly dbName: string) {
    this.database = this.createDB(dbName);
    this.BCRYPT_SALT_ROUNDS = +BCRYPT_SALT_ROUNDS;
    this.createTables(this.database);
    this.getRefreshTokenById = this.getRefreshTokenById.bind(this);
    this.checkIfUserExists = this.checkIfUserExists.bind(this);
    this.saveRefreshToken = this.saveRefreshToken.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getPassByUser = this.getPassByUser.bind(this);
    this.updateUserCredentials = this.updateUserCredentials.bind(this);
  }

  createDB(name: string = "default.db") {
    let databaseFolder = "db";
    if (NODE_ENV === "test") {
      databaseFolder = "db-test";
    }
    const dbPath = path.resolve(cwd(), databaseFolder, name);
    const db = new Database(dbPath, {
      // verbose: console.log,
    });
    db.pragma("journal_mode = WAL");
    db.pragma("synchonous = 1");
    return db;
  }

  createTables(db: Database.Database) {
    const createUsersTable = db.prepare(
      "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, user TEXT, pass TEXT)"
    );

    const createAuthTokensTable = db.prepare(
      "CREATE TABLE IF NOT EXISTS auth (id TEXT PRIMARY KEY REFERENCES users(id), refreshToken TEXT)"
    );

    createUsersTable.run();
    createAuthTokensTable.run();

    if (NODE_ENV !== "test") {
      console.log(
        chalk.whiteBright.bgGreen.bold(
          " 🚀 ~ DatabaseModel ~ createTables ~ Tables created successfully "
        )
      );
    }
  }

  async getRefreshTokenById({ userId }: { userId: string }) {
    const stmt = this.database.prepare("SELECT * FROM auth WHERE id = $userId");
    const stmtResult = stmt.get({
      userId,
    }) as unknown as { refreshToken: string } | null;

    const { refreshToken } = stmtResult || {};
    if (!refreshToken) {
      throw new ApiError({
        statusCode: 404,
        message: ERRORS.REFRESH_TOKEN_NOT_FOUND,
      });
    }
    return { refreshToken };
  }

  async checkIfUserExists({ user }: { user: string }) {
    const getByNameStmt = this.database.prepare(
      "SELECT id, user FROM users WHERE user = $user"
    );

    return getByNameStmt.get({
      user,
    }) as unknown as { id: string; user: string } | null;
  }

  async saveRefreshToken({
    userId,
    refreshToken,
  }: {
    userId: string;
    refreshToken: string;
  }) {
    try {
      const result = await this.database
        .prepare(
          "INSERT OR REPLACE INTO auth (id, refreshToken) VALUES ($id, $refreshToken)"
        )
        .run({
          id: userId,
          refreshToken,
        });

      if (result.changes === 0) {
        throw new ApiError({
          statusCode: 500,
          message: ERRORS.REFRESH_TOKEN_SAVE_FAILED,
          data: [{ userId }],
        });
      }
    } catch (error: any) {
      console.log(chalk.red(" ~ saveRefreshToken ~ error:", error.message));
      if (error instanceof ApiError) throw error;
      throw new ApiError({
        statusCode: error.statusCode ?? 500,
        message:
          error?.message ?? error?.code ?? ERRORS.REFRESH_TOKEN_SAVE_FAILED,
        data: [{ userId }],
      });
    }
  }

  async registerUser({ user, pass }: Auth) {
    try {
      const hashedPass = await bcrypt.hash(pass, this.BCRYPT_SALT_ROUNDS);
      const id = randomUUID();

      const loginStmt = this.database.prepare(
        "INSERT INTO users (id, user, pass) VALUES ($id, $user, $pass)"
      );

      const loginResult = loginStmt.run({
        id,
        user,
        pass: hashedPass,
      });

      if (loginResult.changes === 0) {
        throw new ApiError({
          statusCode: 500,
          message: ERRORS.DB_TRANSACTION_FAILURE,
        });
      }

      return { userId: id };
    } catch (error: any) {
      console.log(chalk.red(" ~ login ~ error:", error.message));
      if (error instanceof ApiError) throw error;
      throw new ApiError({
        statusCode: error.statusCode ?? 500,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ user }],
      });
    }
  }

  async login({ user, pass }: Auth) {
    try {
      const { pass: dbPass } = await this.getPassByUser({ user });

      const isValidPass = await bcrypt.compare(pass, dbPass);

      if (!isValidPass) {
        throw new ApiError({
          statusCode: 400,
          message: ERRORS.INVALID_CREDENTIALS,
          data: [{ user }],
        });
      }

      const getByIdStmt = this.database.prepare(
        "SELECT id FROM users WHERE user = $user"
      );

      const stmtResult = getByIdStmt.get({
        user,
      }) as unknown as { id: string } | null;

      if (!stmtResult) {
        throw new ApiError({
          statusCode: 404,
          message: ERRORS.NOT_FOUND,
          data: [{ user }],
        });
      }

      return { userId: stmtResult.id };
    } catch (error: any) {
      console.log(chalk.red(" ~ login ~ error:", error.message));
      if (error instanceof ApiError) throw error;
      throw new ApiError({
        statusCode: error.statusCode ?? 500,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ user }],
      });
    }
  }

  async getPassByUser({ user }: { user: string }) {
    try {
      const getByNameStmt = this.database.prepare(
        "SELECT pass FROM users WHERE user = $user"
      );

      const stmtResult = getByNameStmt.get({
        user,
      }) as unknown as { pass: string } | null;

      if (!stmtResult) {
        throw new ApiError({
          statusCode: 404,
          message: ERRORS.NOT_FOUND,
          data: [{ user }],
        });
      }

      return stmtResult;
    } catch (error: any) {
      console.log(chalk.red(" ~ getPassByUser ~ error:", error.message));
      if (error instanceof ApiError) throw error;
      throw new ApiError({
        statusCode: error.statusCode ?? 500,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ user }],
      });
    }
  }

  async getUserById({ userId }: { userId: string }) {
    const stmt = this.database.prepare(
      "SELECT * FROM users WHERE id = $userId"
    );
    const stmtResult = stmt.get({
      userId,
    }) as unknown as { user: string; pass: string } | null;

    const { user, pass } = stmtResult || {};

    if (!user || !pass) {
      throw new ApiError({
        statusCode: 404,
        message: ERRORS.NOT_FOUND,
        data: [{ userId }],
      });
    }

    return {
      user,
      pass,
    };
  }

  async updateUserCredentials({ userId, user, pass }: CompleteAuthWithId) {
    const hashedPass = await bcrypt.hash(pass, this.BCRYPT_SALT_ROUNDS);

    try {
      const updateUserStmt = this.database.prepare(
        "UPDATE users SET user = $user, pass = $pass WHERE id = $id"
      );

      const stmtResult = updateUserStmt.run({
        id: userId,
        user,
        pass: hashedPass,
      });

      if (stmtResult.changes === 0) {
        throw new ApiError({
          statusCode: 500,
          message: ERRORS.DB_TRANSACTION_FAILURE,
        });
      }

      return { userId };
    } catch (error: any) {
      console.log(
        chalk.red(" ~ updateUserCredentials ~ error:", error.message)
      );
      if (error instanceof ApiError) throw error;
      throw new ApiError({
        statusCode: error.statusCode ?? 500,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ userId, user, pass }],
      });
    }
  }
}
