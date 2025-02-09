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
    this.logout = this.logout.bind(this);
  }

  async register({ user, pass }: Auth) {
    const { userId } = await this.databaseModel.register({ user, pass });

    const { accessToken, refreshToken } =
      this.authModel.generateAccessToken(userId);

    await this.databaseModel.saveRefreshToken({
      userId,
      refreshToken,
    });

    return {
      userId,
      token: accessToken,
    };
  }

  async login({ user, pass }: Auth) {
    const checkInfo = await this.databaseModel.checkIfUserExists({ user });

    if (!checkInfo) {
      throw new ApiError({
        statusCode: 404,
        message: ERRORS.USER_NOT_FOUND,
      });
    }

    const userData = await this.databaseModel.login({ user, pass });

    if (!userData) {
      throw new ApiError({
        statusCode: 404,
        message: ERRORS.INVALID_CREDENTIALS,
      });
    }

    const { userId } = userData;
    const refreshTokenData = await this.databaseModel.getRefreshTokenById({
      userId: userId,
    });

    if (!refreshTokenData) {
      throw new ApiError({
        statusCode: 404,
        message: ERRORS.TOKEN_EXPIRED,
      });
    }

    const { refreshToken } = refreshTokenData;

    const result = this.authModel.verifyRefreshToken({
      refreshToken,
    }) as string;

    return {
      userId: result,
    };
  }

  async getUserById({ userId }: { userId: string }) {
    return await this.databaseModel.getUserById({ userId });
  }

  async logout({ userId }: { userId: string }) {
    return await this.databaseModel.logout({ userId });
  }
}
