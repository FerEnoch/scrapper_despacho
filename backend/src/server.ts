import { initializeApp } from "./app";
import { API_PORT } from "./config";
import { FilesScrapper } from "./models/filesScrapper.model";

async function init() {
  const filesScrapper = new FilesScrapper();

  const filesScrapperApp = await initializeApp({ model: filesScrapper });

  filesScrapperApp.listen(API_PORT, () => {
    console.log("🚀 ~ Files scrapper app is running on port ~", API_PORT);
  });
}

init();
