import { initializeApp } from "./app";
import { API_PORT } from "./config";
import { FilesScrapper } from "./models/filesScrapper.model";
import { modelTypes } from "./types";

async function init({ model }: { model: modelTypes["IFileScrapper"] }) {
  const filesScrapperApp = await initializeApp({ model });

  filesScrapperApp.listen(API_PORT, () => {
    console.log("🚀 ~ Files scrapper app is running on port ~", API_PORT);
  });
}

init({ model: new FilesScrapper() });
