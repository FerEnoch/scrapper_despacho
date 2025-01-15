import { API_BASE_URL } from "@/config";
import { ApiResponseStats, ERRORS, FileStats, RawFile } from "@/models/types";

export const api = {
  getFilesStats: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/stats/${id}`, {
        method: "GET",
      });

      const responseData =
        (await response.json()) as ApiResponseStats<FileStats>;
      if (response.ok) {
        return responseData;
      }
      return {
        message: responseData.message ?? "",
        data: responseData.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ getFilesStats ~ error:", error);
      return {
        message: ERRORS.API_ERROR,
        data: [],
      };
    }
  },

  uploadFile: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        method: "POST",
        headers: {
          encyType: "multipart/form-data",
        },
        body: formData,
      });

      const responseData = (await response.json()) as ApiResponseStats<
        FileStats | RawFile
      >;
      if (response.ok) {
        return responseData;
      }
      return {
        message: responseData.message ?? "",
        data: responseData.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ uploadFile ~ error:", error);
      return {
        message: ERRORS.API_ERROR,
        data: [],
      };
    }
  },

  endFiles: async (files: FileStats[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/end`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(files),
      });

      const responseData =
        (await response.json()) as ApiResponseStats<FileStats>;
      if (response.ok) {
        return responseData;
      }
      return {
        message: responseData.message ?? "",
        data: [],
      };
    } catch (error) {
      console.log("🚀 ~ endFiles ~ error:", error);
    }
  },
};
