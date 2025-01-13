import fileUpload, { UploadedFile } from "express-fileupload";
import express, { json, Request, Response } from "express";
import cors from "cors";
import { PORT, UPLOADS_FOLDER } from "./config";
import { parseRawFiles, convertToJson, getFilesRawDataFromFile } from "./lib";
import { searchFilesStats } from "./scrapper/searchFilesStats";
import { endFiles } from "./scrapper/endFiles";
import morgan from "morgan";
import { FileId, RawFile } from "./types";

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

app.get("/files/stats", async (_, res) => {
  try {
    const csvFile = await getFilesRawDataFromFile({
      folder: UPLOADS_FOLDER.FOLDER,
      fileName: UPLOADS_FOLDER.FILES_CSV,
    });

    const data = await convertToJson(csvFile);
    const { ok, parsedData } = await parseRawFiles(data);
    if (!ok) {
      res.status(400).json({
        message: "Invalid raw data",
        data: parsedData as RawFile[],
      });
      return;
    }

    const scrappedData = await searchFilesStats(parsedData as FileId[]);
    res.json({ message: "Stats retrieved successfully", data: scrappedData });
  } catch (error: any) {
    console.log("🚀 ~ app.get/files/stats ~ error:", error);
    res.status(500).json({ message: "Error al buscar datos de los archivos" });
  }
});

app.post("/files", async (req, res) => {
  try {
    if (!req.files) {
      res.status(400).send({
        message: "No file uploaded",
      });
      return;
    }

    const file = req.files.file as UploadedFile;

    // validate file format
    if (!file.mimetype.includes("csv")) {
      res.status(400).json({ message: "Invalid file format" });
      return;
    }

    const data = file.data.toString("utf-8");
    const jsonData = await convertToJson(data);
    const { ok, parsedData } = await parseRawFiles(jsonData);
    if (!ok) {
      console.log("🚀 ~ Invalid raw data", parsedData);
      res.status(400).json({
        message: "Invalid raw data",
        data: parsedData as RawFile[],
      });
      return;
    }
    console.log("🚀 ~ app.post ~ files recieved:", parsedData.length);

    // save the file to further requests vía GET files/stats
    file.mv(`./${UPLOADS_FOLDER.FOLDER}/${UPLOADS_FOLDER.FILES_CSV}`);

    const scrappedData = await searchFilesStats(parsedData as FileId[]);
    // console.log("🚀 ~ app.post ~ scrappedData:", scrappedData);

    res.status(201).json({
      message: "Archivo subido y analizado",
      data: scrappedData,
    });
  } catch (error: any) {
    console.log("🚀 ~ app.post/files ~ error:", error);
    res.status(500).json({ message: "Error al buscar datos de los archivos" });
  }
});

app.post("/files/end", async (req: Request, res: Response) => {
  try {
    const files = req.body;
    console.log("🚀 ~ app.post ~ files/end:", files.length);

    if (!files) {
      res.status(400).json({ message: "No files provided" });
      return;
    }

    const endedFiles = await endFiles({ files });
    if (endedFiles.length === 0) {
      res.status(200).json({ message: "No files to end" });
      return;
    }
    // console.log("🚀 ~ app.post ~ endedFiles:", endedFiles);

    /**
   * [
  {
    num: 'DE-0010-00485568-0',
    title: '',
    status: 'FINALIZADO',
    location: 'D123 - DCION. TECNICO ADMINISTRATIVA'
  },
  {
    num: 'DE-0512-00503161-2',
    title: '',
    status: 'SISTEMA ANTERIOR',
    location: 'S58 - SUB. DEL HABITAT Y LA VIVIENDA'
  },
  {
    num: 'DE-0010-00485568-0',
    title: '',
    status: 'FINALIZADO',
    location: 'D123 - DCION. TECNICO ADMINISTRATIVA'
  }
]
   * 
   *  */

    res
      .status(200)
      .json({ message: "Files ending process result", data: endedFiles });
  } catch (error: any) {
    console.log("🚀 ~ app.post/files/end ~ error:", error);
    res
      .status(500)
      .json({ message: "Error al procesar la finalización de los archivos" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
