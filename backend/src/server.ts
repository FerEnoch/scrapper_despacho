import { initializeApp } from "./app";
import { API_PORT, CURRENT_PROD_VERSION } from "./config";
import chalk from "chalk";
import { FilesScrapperV1 } from "./models/filesScrapper.model";
import { modelTypes } from "./types";

async function init(version: number) {
  let filesScrapper: modelTypes["IFileScrapper"];
  
  if (version === 1) {
    filesScrapper = new FilesScrapperV1();
  }

  const filesScrapperApp = await initializeApp({
    model: filesScrapper,
    version,
  });

  if (!filesScrapper || !filesScrapperApp) {
    console.log(
      chalk.red.bgGrey(" 😢 ~ Files scrapper app is not running! ~ ")
    );
    return;
  }

  filesScrapperApp.listen(API_PORT, () => {
    console.log(
      chalk.greenBright.bgWhite(
        " 🚀 ~ Files scrapper app is running on port ~",
        ` ${API_PORT} `
      )
    );
  });
}

init(CURRENT_PROD_VERSION);
