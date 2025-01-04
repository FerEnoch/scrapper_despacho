import express, { json } from "express";
import cors from "cors";
import { PORT } from "./config";
import { convertToJson } from "./lib/getFiles";
import { parseFilesNums } from "./lib/parseFiles";

const app = express();

app.use(json());
app.use(cors());

app.post("/files/stats", async (req, res) => {
  const rawData = req.body;
  console.log(rawData);
  res.json("Hello World!");
});

app.post("/files/end", (req, res) => {
  res.json("Hello World!");
});

app.post("/files/end/:id", (req, res) => {
  res.json("Hello World!");
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
