import { initializeApp } from "./app";
import { PORT } from "./config";
import { FilesScrapper } from "./models/filesScrapper.model";
import { modelTypes } from "./types";

async function init(model: modelTypes) {
  const filesScrapperApp = await initializeApp(model);

  filesScrapperApp.listen(PORT, () => {
    console.log("🚀 ~ Files scrapper app is running on port ~", PORT);
  });
}

const filesScrapperModel = FilesScrapper;
init(filesScrapperModel);
