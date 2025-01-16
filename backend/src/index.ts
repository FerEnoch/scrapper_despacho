import fileUpload, { UploadedFile } from "express-fileupload";
import express, { json, Request, Response } from "express";
import cors from "cors";
import { parseRawFiles, convertToJson } from "./lib";
import { searchFilesStats } from "./scrapper/searchFilesStats";
import { endFiles } from "./scrapper/endFiles";
import morgan from "morgan";
import { FileId, RawFile } from "./types";
import {
  ERROR_NO_FILES_ENDED,
  ERROR_NO_FILE_STATS_RETRIEVED,
  UPLOADS_FOLDER,
} from "./config/constants";
import { PORT } from "./config";

const app = express();

app.use(
  fileUpload({
    createParentPath: true,
    // debug: true,
  })
);

app.use(json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.get("/files/stats/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // read from cache
    // const csvFile = await getFilesRawDataFromFile({
    //   folder: UPLOADS_FOLDER.FOLDER,
    //   fileName: UPLOADS_FOLDER.FILES_CSV,
    // });
    // const jsonData = await convertToJson(csvFile);

    const rawFile: RawFile = {
      Número: id,
      completeNum: id,
    };
    const analyzeWithLetters = false;

    const { ok, parsedData } = await parseRawFiles(
      [rawFile],
      analyzeWithLetters
    );
    if (!ok) {
      console.log("🚀 ~ Invalid raw data", parsedData.length);
      res.status(400).json({
        message: "Invalid raw data",
        data: parsedData as RawFile[],
      });
      return;
    }

    const scrappedData = await searchFilesStats(parsedData as FileId[]);
    res
      .status(200)
      .json({ message: "Stats retrieved successfully", data: scrappedData });
  } catch (error: any) {
    console.log("🚀 ~ app.get/files/stats ~ error:", error);
    res.status(204).json({ message: ERROR_NO_FILE_STATS_RETRIEVED });
  }
});

app.post("/files", async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).send({
        message: "No file uploaded",
        data: [],
      });
      return;
    }

    const file = req.files.file as UploadedFile;

    // validate file format
    if (!file.mimetype.includes("csv")) {
      res.status(400).json({ message: "Invalid file format", data: [] });
      return;
    }

    const data = file.data.toString("utf-8");
    const jsonData = await convertToJson(data);
    const { ok, parsedData } = await parseRawFiles(jsonData);

    if (!ok) {
      console.log("🚀 ~ Invalid raw data", parsedData.length);
      res.status(400).json({
        message: "Invalid raw data",
        data: parsedData as RawFile[],
      });
      return;
    }

    console.log("🚀 ~ app.post ~ files recieved:", {
      length: parsedData.length,
      files: parsedData.map((file) => file?.num).join(", "),
    });

    // save the file as cache data csv
    file.mv(`./${UPLOADS_FOLDER.FOLDER}/${UPLOADS_FOLDER.FILES_CSV}`);

    const scrappedData = await searchFilesStats(parsedData as FileId[]);

    res.status(201).json({
      message: "File uploaded and parsed successfully",
      data: scrappedData,
    });
  } catch (error: any) {
    console.log("🚀 ~ app.post/files ~ error:", error);
    res.status(204).json({ message: ERROR_NO_FILE_STATS_RETRIEVED, data: [] });
  }
});

app.post("/files/end", async (req: Request, res: Response) => {
  try {
    const files = req.body;
    console.log("🚀 ~ app.post ~ files/end:", {
      length: files.length,
      files: files.map(({ num }: { num: string }) => num).join(", "),
    });

    if (!files) {
      res.status(400).json({ message: "No files provided", data: [] });
      return;
    }

    const endedFiles = await endFiles({ files });
    if (endedFiles.length === 0) {
      res.status(204).json({ message: "No files to end", data: [] });
      return;
    }

    res
      .status(200)
      .json({ message: "Files ending process result", data: endedFiles });
  } catch (error: any) {
    console.log("🚀 ~ app.post/files/end ~ error:", error);
    res.status(204).json({ message: ERROR_NO_FILES_ENDED, data: [] });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
