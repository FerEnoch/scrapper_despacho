import { API_BASE_URL } from "@/config";
import { ApiResponse, FileStats, RawFile } from "@/types";
import { FILES_API_ERRORS, FILE_EXPORT_STATS } from "@/types/enums";
import { mkConfig, generateCsv, download } from "export-to-csv";

export const filesApi = {
  getFilesStats: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/stats/${id}`, {
        method: "GET",
      });

      const responseData = (await response.json()) as ApiResponse<FileStats>;
      if (response.ok) {
        return responseData;
      }
      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ getFilesStats ~ error:", error);
      return {
        message: FILES_API_ERRORS.GENERIC_ERROR,
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

      const responseData = (await response.json()) as ApiResponse<
        FileStats | RawFile
      >;
      console.log("🚀 ~ uploadFile: ~ responseData:", responseData);

      if (response.ok) {
        return responseData;
      }
      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ uploadFile ~ error:", error);
      return {
        message: FILES_API_ERRORS.GENERIC_ERROR,
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
        console.log("🚀 ~ endFiles ~ ", FILES_API_ERRORS.NO_FILES_TO_END);
        return {
          message: FILES_API_ERRORS.NO_FILES_TO_END,
          data: [],
        };
      }

      const response = await fetch(`${API_BASE_URL}/files/end`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(filesToEnd),
      });

      const responseData = (await response.json()) as ApiResponse<FileStats>;

      return {
        message: responseData.message ?? "",
        data: responseData?.data ?? [],
      };
    } catch (error) {
      console.log("🚀 ~ endFiles ~ error:", error);
      return {
        message: FILES_API_ERRORS.GENERIC_ERROR,
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

      download(csvConfig)(csv);
    } catch (error) {
      console.log("🚀 ~ downloadFiles ~ error:", error);
      throw new Error(FILES_API_ERRORS.GENERIC_ERROR);
    }
  },
};
