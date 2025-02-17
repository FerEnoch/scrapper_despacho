import { API_BASE_URL } from "@/config";
import { loginFormSchema } from "@/schemas/forms";
import { ApiResponse, UserSession } from "@/types";
import { AUTH_API_ERRORS } from "@/types/enums";
import { z } from "zod";

export const authApi = {
  register: async (data: z.infer<typeof loginFormSchema>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = (await response.json()) as ApiResponse<UserSession>;

      if (response.ok) {
        return responseData;
      }

      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ register ~ error:", error);
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

      const responseData = (await response.json()) as ApiResponse<UserSession>;

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

  changeCredentials: async (
    userId: string,
    data: z.infer<typeof loginFormSchema>
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
        method: "PATH",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = (await response.json()) as ApiResponse<UserSession>;

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

      const responseData = (await response.json()) as ApiResponse<UserSession>;

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
