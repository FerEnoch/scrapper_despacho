import chalk from "chalk";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { AuthModel } from "../models/auth.model";
import { Auth, CompleteAuthWithId } from "../schemas/auth";
import { modelTypes } from "../types";
import { IUserService } from "./types";
import { UserAuthData } from "../models/types";
import jwt from "jsonwebtoken";
const { TokenExpiredError } = jwt;

export class UserService implements IUserService {
  private readonly authModel: modelTypes["IAuthModel"];

  constructor(private readonly databaseModel: modelTypes["IDatabaseModel"]) {
    this.databaseModel = databaseModel;
    this.authModel = new AuthModel(this.databaseModel);
    this.registerUser = this.registerUser.bind(this);
    this.login = this.login.bind(this);
    this.updateUserCredentials = this.updateUserCredentials.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.setRefreshToken = this.setRefreshToken.bind(this);
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.getRefreshTokenById = this.getRefreshTokenById.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.verifyJwt = this.verifyJwt.bind(this);
  }

  async getUserById({ userId }: { userId: string }) {
    const userData = await this.databaseModel.getUserById({
      userId,
    });

    const { user } = userData;

    return {
      user,
    };
  }

  async setRefreshToken({ userId }: { userId: string }) {
    const { refreshToken } = this.authModel.generateRefreshToken(userId);
    await this.databaseModel.saveRefreshToken({
      userId,
      refreshToken,
    });
    return {
      refreshToken,
    };
  }

  async registerUser({ user, pass }: Auth) {
    const { userId } = await this.databaseModel.registerUser({ user, pass });
    await this.setRefreshToken({ userId });
    return {
      userId,
      user,
    };
  }

  async login({ user, pass }: Auth) {
    try {
      // Check if user exists, if it doesn't exist, register
      const userExists = await this.databaseModel.checkIfUserExists({
        user,
      });

      if (!userExists) {
        await this.registerUser({
          user,
          pass,
        });
      }

      // Authenticate user: Verify the user's credentials (username and password).
      const { userId } = await this.databaseModel.login({ user, pass });

      try {
        const { refreshToken } = await this.getRefreshTokenById({
          userId,
        });
        await this.verifyJwt({ token: refreshToken });
      } catch (error: any) {
        console.log(chalk.red(error.message));
        if (error instanceof TokenExpiredError) {
          console.log(chalk.blue("Regenerating REFRESH token"));
          await this.setRefreshToken({ userId });
        } else {
          throw new ApiError({
            statusCode: 500,
            message: ERRORS.REFRESH_TOKEN_SAVE_FAILED,
          });
        }
      }

      // Generate a new access token for the user.
      const { accessToken } = this.authModel.generateAccessToken({
        userId,
        user,
        pass,
      });

      return {
        userId,
        accessToken,
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

  async updateUserCredentials({ userId, user, pass }: CompleteAuthWithId) {
    // await this.handleRefreshToken({ userId });

    await this.databaseModel.updateUserCredentials({
      userId,
      user,
      pass,
    });

    // Generate access token: Generate a new access token for the user.
    const { accessToken } = this.authModel.generateAccessToken({
      userId,
      user,
      pass,
    });

    return {
      accessToken,
    };
  }

  async getRefreshTokenById({ userId }: { userId: string }) {
    const { refreshToken } = await this.databaseModel.getRefreshTokenById({
      userId,
    });
    return { refreshToken };
  }

  generateAccessToken({ userId, user, pass }: UserAuthData) {
    const { accessToken } = this.authModel.generateAccessToken({
      userId,
      user,
      pass,
    });
    return { accessToken };
  }

  generateRefreshToken(userId: string) {
    const { refreshToken } = this.authModel.generateRefreshToken(userId);
    return { refreshToken };
  }

  verifyJwt({ token }: { token: string }) {
    return this.authModel.verifyJwt({ token });
  }
}
