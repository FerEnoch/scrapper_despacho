import { IDatabaseModel } from "./types";
import { Auth } from "../schemas/auth";
import { ApiError } from "../errors/api-error";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { ERRORS } from "../errors/types";
import { BCRYPT_SALT_ROUNDS } from "../config";
import path from "node:path";
import { cwd } from "node:process";

export class DatabaseModel implements IDatabaseModel {
  database: Database.Database;
  BCRYPT_SALT_ROUNDS: number;

  constructor(private readonly dbName: string) {
    this.database = this.createDB(dbName);
    this.BCRYPT_SALT_ROUNDS = +BCRYPT_SALT_ROUNDS;
    this.createTables(this.database);
    this.getRefreshTokenById = this.getRefreshTokenById.bind(this);
    this.checkIfUserExists = this.checkIfUserExists.bind(this);
    this.saveRefreshToken = this.saveRefreshToken.bind(this);
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getPassByUser = this.getPassByUser.bind(this);
    this.getUserById = this.getUserById.bind(this);
    // this.logout = this.logout.bind(this);
  }

  createDB(name: string = "default.db") {
    const dbPath = path.resolve(cwd(), "./db", name);
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

    const createAutnTokensTable = db.prepare(
      "CREATE TABLE IF NOT EXISTS auth (id TEXT PRIMARY KEY REFERENCES users(id), refreshToken TEXT)"
    );

    createUsersTable.run();
    createAutnTokensTable.run();

    console.log(
      "🚀 ~ DatabaseModel ~ createTables ~ Tables created successfully"
    );
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
          statusCode: 400,
          message: ERRORS.REFRESH_TOKEN_SAVE_FAILED,
          data: [{ userId }],
        });
      }
    } catch (error: any) {
      console.log("🚀 ~ saveRefreshToken ~ error:", error);
      throw new ApiError({
        statusCode: 400,
        message:
          error?.message ?? error?.code ?? ERRORS.REFRESH_TOKEN_SAVE_FAILED,
        data: [{ userId }],
      });
    }
  }

  async register({ user, pass }: Auth) {
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
          statusCode: 400,
          message: ERRORS.DB_TRANSACTION_FAILURE,
        });
      }

      return { userId: id };
    } catch (error: any) {
      console.log("🚀 ~ login ~ error:", error);
      throw new ApiError({
        statusCode: 400,
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
      console.log("🚀 ~ login ~ error:", error);
      throw new ApiError({
        statusCode: 400,
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
      console.log("🚀 ~ getPassByUser ~ error:", error);
      throw new ApiError({
        statusCode: 400,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ user }],
      });
    }
  }

  async getUserById({ userId }: { userId: string }) {
    try {
      const getByIdStmt = this.database.prepare(
        "SELECT id, user FROM users WHERE id = $id"
      );

      const checkInfo = getByIdStmt.get({
        id: userId,
      }) as unknown as { id: string; user: string } | null;

      if (!checkInfo) {
        throw new ApiError({
          statusCode: 404,
          message: ERRORS.USER_NOT_FOUND,
        });
      }

      return {
        userId: checkInfo.id,
        username: checkInfo.user,
      };
    } catch (error: any) {
      console.log("🚀 ~ getUserById ~ error:", error);
      throw new ApiError({
        statusCode: 400,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ userId }],
      });
    }
  }

  /** NOT NEC TO DELETE USER FROM DATABAESE */
  // async logout({ userId }: { userId: string }) {
  //   try {
  //     const deleteAuthStmt = this.database.prepare(
  //       "DELETE FROM auth WHERE id = $id"
  //     );
  //     deleteAuthStmt.run({
  //       id: userId,
  //     });

  //     const logoutStmt = this.database.prepare(
  //       "DELETE FROM users WHERE id = $id"
  //     );

  //     const checkInfo = logoutStmt.run({
  //       id: userId,
  //     });

  //     if (checkInfo.changes === 0) {
  //       throw new ApiError({
  //         statusCode: 404,
  //         message: ERRORS.USER_NOT_FOUND,
  //       });
  //     }

  //     return {
  //       userId,
  //     };
  //   } catch (error: any) {
  //     console.log("🚀 ~ logout ~ error:", error);
  //     throw new ApiError({
  //       statusCode: 500,
  //       message: ERRORS.DB_TRANSACTION_FAILURE,
  //       data: [{ userId }],
  //     });
  //   }
  // }
}
