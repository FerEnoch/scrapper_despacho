import { initializeApp } from "./app";
import { PORT } from "./config";
import { FilesScrapper } from "./models/filesScrapper.model";
import { modelTypes } from "./types";

async function init({ model }: { model: modelTypes }) {
  const filesScrapperApp = await initializeApp({ model });

  filesScrapperApp.listen(PORT, () => {
    console.log("🚀 ~ Files scrapper app is running on port ~", PORT);
  });
}

init({ model: new FilesScrapper() });
