import chalk from "chalk";
import { ApiError } from "../errors/api-error";
import { ERRORS } from "../errors/types";
import { AuthModel } from "../models/auth.model";
import { Auth, CompleteAuthWithId } from "../schemas/auth";
import { modelTypes } from "../types";
import { IUserService } from "./types";
import jwt from "jsonwebtoken";
const { TokenExpiredError } = jwt;

export class UserService implements IUserService {
  private readonly authModel: modelTypes["IAuthModel"];

  constructor(private readonly databaseModel: modelTypes["IDatabaseModel"]) {
    this.authModel = new AuthModel(databaseModel);
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.updateUserCredentials = this.updateUserCredentials.bind(this);
    this.handleRefreshToken = this.handleRefreshToken.bind(this);
  }

  async register({ user, pass }: Auth) {
    // const userData = await this.databaseModel.checkIfUserExists({ user });

    // /**
    //  * If user already exists, user is forced to log in because he was already registered
    //  */
    // if (userData) {
    //   return this.login({ user, pass });
    // }

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
    try {
      // Check if user exists, if it doesn't exist, register
      const userExists = await this.databaseModel.checkIfUserExists({
        user,
      });

      if (!userExists) {
        const { user: dbUser, userId: dbUserId } = await this.register({
          user,
          pass,
        });
        await this.handleRefreshToken({ userId: dbUserId });
      }

      // Authenticate user: Verify the user's credentials (username and password).
      const { userId } = await this.databaseModel.login({ user, pass });

      // Generate a new access token for the user.
      const { accessToken } = this.authModel.generateAccessToken({
        userId,
        user,
        pass,
      });

      // Return user, userId and access token.
      return {
        userId,
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

  async updateUserCredentials({
    userId,
    user,
    pass,
  }: CompleteAuthWithId): Promise<{ token: string }> {
    await this.handleRefreshToken({ userId });

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
      token: accessToken,
    };
  }

  async handleRefreshToken({ userId }: { userId: string }): Promise<void> {
    // Check if refresh token is valid: Verify the validity of the existing refresh token.
    let { refreshToken } = await this.databaseModel.getRefreshTokenById({
      userId,
    });

    try {
      this.authModel.verifyJwt({ token: refreshToken });
    } catch (error: any) {
      console.log(chalk.red(error.message));
      if (error instanceof TokenExpiredError) {
        console.log(chalk.blue("Regenerating refresh token"));
        const { refreshToken: freshRefreshToken } =
          this.authModel.generateRefreshToken(userId);
        await this.databaseModel.saveRefreshToken({
          userId,
          refreshToken: freshRefreshToken,
        });
      } else {
        throw error;
      }
    }
  }
}
