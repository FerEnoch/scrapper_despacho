import { API_BASE_URL } from "@/config";
import {
  ApiResponseStats,
  FileEndedStats,
  FileStats,
  RawFile,
} from "@/models/types";

export const api = {
  getFilesStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/stats`, {
        method: "GET",
      });

      if (response.ok) {
        const data = (await response.json()) as ApiResponseStats<FileStats>;
        return data;
      }
    } catch (error) {
      console.log("🚀 ~ getFilesStats ~ error:", error);
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
        data: [],
      };
    } catch (error) {
      console.log("🚀 ~ uploadFile ~ error:", error);
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
        (await response.json()) as ApiResponseStats<FileEndedStats>;
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
