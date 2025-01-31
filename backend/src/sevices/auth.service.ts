import { authApiResponse } from "../models/types";
import { Auth } from "../schemas/auth";
import { modelTypes } from "../types";
import { IAuthService } from "./types";

export class AuthService implements IAuthService {
  model: modelTypes["IAuthModel"];

  constructor({ model }: { model: modelTypes["IAuthModel"] }) {
    this.model = model;
    this.login = this.login.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.logout = this.logout.bind(this);
  }

  async login({ user, pass }: Auth): Promise<authApiResponse> {
    return await this.model.login({ user, pass });
  }

  async getUserById({ userId }: { userId: string }): Promise<authApiResponse> {
    return await this.model.getUserById({ userId });
  }

  async logout({ userId }: { userId: string }): Promise<authApiResponse> {
    return await this.model.logout({ userId });
  }
}
