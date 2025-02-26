import { API_BASE_URL } from "@/config";
import { loginFormSchema } from "@/schemas/forms";
import { ActiveUserInfo, ApiResponse, UserSessionData } from "@/types";
import { AUTH_API_ERRORS } from "@/types/enums";
import { z } from "zod";

export const authApi = {
  revalidateAccessToken: async (userSession: ActiveUserInfo) => {
    try {
      const { userId, username, password } = userSession;

      const response = await fetch(`${API_BASE_URL}/auth/revalidate-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          userId,
          user: username,
          pass: password,
        }),
      });

      const responseData =
        (await response.json()) as ApiResponse<UserSessionData>;
      console.log("🚀 ~ responseData:", responseData);

      if (response.ok) {
        return responseData;
      }

      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ revalidateAccessToken ~ error:", error);
      return {
        message: AUTH_API_ERRORS.GENERIC_ERROR,
        data: [],
      };
    }
  },

  getUserById: async ({ userId }: { userId: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      const responseData =
        (await response.json()) as ApiResponse<UserSessionData>;
      console.log("🚀 ~ responseData:", responseData);

      if (response.ok) {
        return responseData;
      }

      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ getUserById ~ error:", error);
      return {
        message: AUTH_API_ERRORS.GENERIC_ERROR,
        data: [],
      };
    }
  },

  login: async (data: z.infer<typeof loginFormSchema>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData =
        (await response.json()) as ApiResponse<UserSessionData>;
      console.log("🚀 ~ responseData:", responseData);

      if (response.ok) {
        return responseData;
      }

      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ login ~ error:", error);
      return {
        message: AUTH_API_ERRORS.GENERIC_ERROR,
        data: [],
      };
    }
  },

  updateCredentials: async (
    userId: string,
    data: z.infer<typeof loginFormSchema>
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData =
        (await response.json()) as ApiResponse<UserSessionData>;
      console.log("🚀 ~ responseData:", responseData);

      if (response.ok) {
        return responseData;
      }

      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ changeCredentials ~ error:", error);
      return {
        message: AUTH_API_ERRORS.GENERIC_ERROR,
        data: [],
      };
    }
  },

  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      const responseData =
        (await response.json()) as ApiResponse<UserSessionData>;
      console.log("🚀 ~ responseData:", responseData);

      if (response.ok) {
        return responseData;
      }

      return {
        message: AUTH_API_ERRORS.LOGOUT_FAILED,
        data: [],
      };
    } catch (error) {
      console.log("🚀 ~ logout ~ error:", error);
      return {
        message: AUTH_API_ERRORS.GENERIC_ERROR,
        data: [],
      };
    }
  },
};
