import { API_BASE_URL } from "@/config";
import {
  API_ERRORS,
  ApiResponseStats,
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
        message: API_ERRORS.GENERIC_ERROR,
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
      console.log("🚀 ~ uploadFile: ~ responseData:", responseData);

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
        message: API_ERRORS.GENERIC_ERROR,
        data: [],
      };
    }
  },

  endFiles: async (files: FileStats[]) => {
    try {
      const filesToEnd = files.filter(
        (file) =>
          file.prevStatus !== "FINALIZADO" && file.prevStatus !== "Sin datos"
      );

      if (filesToEnd.length === 0) {
        console.log("🚀 ~ endFiles ~ ", API_ERRORS.NO_FILES_TO_END);
        return {
          message: API_ERRORS.NO_FILES_TO_END,
          data: [],
        };
      }

      const response = await fetch(`${API_BASE_URL}/files/end`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(filesToEnd),
      });

      const responseData =
        (await response.json()) as ApiResponseStats<FileStats>;
      if (response.ok) {
        return {
          message: responseData.message ?? "",
          data: responseData.data ?? [],
        };
      }
      return {
        message: responseData.message ?? "",
        data: [],
      };
    } catch (error) {
      console.log("🚀 ~ endFiles ~ error:", error);
      return {
        message: API_ERRORS.GENERIC_ERROR,
        data: [],
      };
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

      console.log(
        "🚀 ~ parsedFiles ~ parsedFiles:",
        csv.toString().replace('"', "")
      );
      download(csvConfig)(csv);
    } catch (error) {
      console.log("🚀 ~ downloadFiles ~ error:", error);
      throw new Error(API_ERRORS.GENERIC_ERROR);
    }
  },
};
