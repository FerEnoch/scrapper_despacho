import { IAuthModel } from "./types";
import { Auth } from "../schemas/auth";
import { ApiError } from "../errors/api-error";
import Database, { Statement } from "better-sqlite3";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { ERRORS } from "../errors/types";
import { MESSAGES } from "../controllers/constants";

export class AuthModel implements IAuthModel {
  database: Database.Database;

  constructor(private readonly db: Database.Database) {
    this.database = db;
  }

  async checkIfUserExists({ user }: { user: string }) {
    const getByNameStmt = this.database.prepare(
      "SELECT id, user FROM users WHERE user = $user"
    );

    return getByNameStmt.get({
      user,
    }) as unknown as { id: string; user: string } | undefined;
  }

  async login({ user, pass }: Auth) {
    try {
      const hashedPass = await bcrypt.hash(pass, 10);
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

  async getUserById({ userId }: { userId: string }) {
    try {
      const getByIdStmt = this.database.prepare(
        "SELECT id, user FROM users WHERE id = $id"
      );

      const checkInfo = getByIdStmt.get({
        id: userId,
      }) as unknown as { id: string; user: string } | undefined;

      console.log("🚀 ~ AuthModel ~ getUserById ~ checkInfo:", checkInfo);

      if (!checkInfo) {
        return {
          ok: false,
          message: MESSAGES.USER_NOT_FOUND,
          userId,
          username: "",
        };
      }

      return {
        ok: true,
        message: MESSAGES.SUCCESS,
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

  async logout({ userId }: { userId: string }) {
    try {
      const logoutStmt = this.database.prepare(
        "DELETE FROM users WHERE id = $id"
      );

      const checkInfo = logoutStmt.run({
        id: userId,
      });

      if (checkInfo.changes === 0) {
        return {
          ok: false,
          message: MESSAGES.USER_NOT_FOUND,
          userId,
        };
      }

      return {
        ok: true,
        message: MESSAGES.SUCCESS,
        userId,
      };
    } catch (error: any) {
      console.log("🚀 ~ logout ~ error:", error);
      throw new ApiError({
        statusCode: 400,
        message: error?.message ?? error?.code ?? ERRORS.DB_TRANSACTION_FAILURE,
        data: [{ userId }],
      });
    }
  }
}
