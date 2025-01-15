import { API_BASE_URL } from "@/config";
import {
  ApiResponseStats,
  ERRORS,
  FILE_EXPORT_STATS,
  FileStats,
  RawFile,
} from "@/types";
import { mkConfig, generateCsv, download } from "export-to-csv";

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

  downloadFiles: async (files: FileStats[], fileName: string) => {
    try {
      const parsedFiles = files.map((file) => {
        const { num, title, prevStatus, location, newStatus } = file;
        return {
          [FILE_EXPORT_STATS.NUMBER]: num,
          [FILE_EXPORT_STATS.TITLE]: title,
          [FILE_EXPORT_STATS.STATUS]: newStatus?.status
            ? newStatus?.status
            : prevStatus,
          [FILE_EXPORT_STATS.LOCATION]: location,
        };
      });

      const csvConfig = mkConfig({
        filename: fileName,
        useKeysAsHeaders: true,
      });
      const csv = generateCsv(csvConfig)(parsedFiles);

      download(csvConfig)(csv);
    } catch (error) {
      console.log("🚀 ~ downloadFiles ~ error:", error);
      throw new Error(ERRORS.API_ERROR);
    }
  },
};
