import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { AuthModel } from "../models/auth.model";
import { Auth } from "../schemas/auth";
import { modelTypes } from "../types";
import { IUserService } from "./types";

export class UserService implements IUserService {
  databaseModel: modelTypes["IDatabaseModel"];
  authModel: modelTypes["IAuthModel"];

  constructor({ model }: { model: modelTypes["IDatabaseModel"] }) {
    this.databaseModel = model;
    this.authModel = new AuthModel();
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    // this.logout = this.logout.bind(this);
  }

  async register({ user, pass }: Auth) {
    const userExists = await this.databaseModel.checkIfUserExists({ user });

    /**
     * If user already exists, user is forced to log in because he was already registered
     */
    if (userExists) {
      return this.login({ user, pass });
    }

    const { userId } = await this.databaseModel.register({ user, pass });

    const { refreshToken } = this.authModel.generateRefreshToken(userId);
    await this.databaseModel.saveRefreshToken({
      userId,
      refreshToken,
    });

    return {
      userId,
      user,
    };
  }

  async login({ user, pass }: Auth) {
    /**
     * Check if user exists: Verify that the user exists in the database.
     * Authenticate user: Verify the user's credentials (username and password).
     * Generate access token: Generate a new access token for the user.
     * Check if refresh token is valid: Verify the validity of the existing refresh token.
     * Revalidate refresh token if invalid: If the refresh token is invalid, generate a new refresh token.
     * Return userId and access token: Return the userId and the new access token.
     */

    try {
      // 1. Check if user exists
      const userExists = await this.databaseModel.checkIfUserExists({ user });
      if (!userExists) {
        throw new ApiError({
          statusCode: 404,
          message: ERRORS.USER_NOT_FOUND,
        });
      }
      // 2. Authenticate user
      const { userId } = await this.databaseModel.login({ user, pass });

      // 3. Generate access token
      const { accessToken } = this.authModel.generateAccessToken(userId);

      // 4. Check if refresh token is valid
      let { refreshToken } = await this.databaseModel.getRefreshTokenById({
        userId,
      });

      try {
        this.authModel.verifyJwt({ token: refreshToken });
      } catch (error: any) {
        // 5. Revalidate refresh token if invalid
        if (error.message === ERRORS.INVALID_TOKEN) {
          const { refreshToken: freshRefreshToken } =
            this.authModel.generateRefreshToken(userId);
          await this.databaseModel.saveRefreshToken({
            userId,
            refreshToken,
          });
          refreshToken = freshRefreshToken;
        } else {
          throw error;
        }
      }

      return {
        userId,
        user,
        token: accessToken,
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        statusCode: 400,
        message: ERRORS.INVALID_CREDENTIALS,
      });
    }
  }

  async getUserById({ userId }: { userId: string }) {
    return await this.databaseModel.getUserById({ userId });
  }

  /** NOT NEC TO DELETE USER FROM DATABAESE */
  // async logout({ userId }: { userId: string }) {
  // return await this.databaseModel.logout({ userId });
  // }
}
