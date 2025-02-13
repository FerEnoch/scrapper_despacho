import { FilesScrapper } from "../../../models/filesScrapper.model";
import {
  getFilesBatches,
  parseFileStats,
} from "../../../models/lib/filesScrapper";
import { FileEndedStats, FileStats } from "../../../models/types";
import { FilesService } from "../../../sevices/files.service";
import { BatchOpResultType } from "../../../sevices/types";
import { modelTypes } from "../../../types";

const filesScrapper: modelTypes["IFileScrapper"] = new FilesScrapper();
const filesService = new FilesService({ model: filesScrapper });

export async function fakeEndFiles({ files }: { files: FileStats[] }) {
  const filesEndedResult: Array<FileEndedStats> = [];

  const batched =
    files.length > 10 // this.MAX_BATCH_SIZE
      ? getFilesBatches<FileStats>({
          arr: files,
          size: 10, // this.MAX_BATCH_SIZE,
        })
      : [files];

  const results = (await Promise.allSettled(
    batched.map(async (batch) => {
      return Promise.all(
        batch.map(async (file) => {
          try {
            const { prevStatus } = file;
            if (prevStatus === "FINALIZADO" /*this.ENDED_FILE_STATUS_TEXT*/) {
              return {
                ...file,
                newStatus: null,
              };
            }

            const [{ num }] = parseFileStats([file]);
            const { message, detail } = await filesService.endFileByNum(num);

            const fileNewData: FileStats = await filesService.model.collectData(
              {
                file: {
                  ...file,
                  num, // only middle long number
                },
                page: null,
              }
            );

            return {
              ...file,
              newStatus: {
                status: fileNewData?.prevStatus ?? "",
                message,
                detail,
              },
            };
          } catch (error) {
            return { error };
          }
        })
      );
    })
  )) as Array<BatchOpResultType<FileEndedStats>>;

  results.forEach((batchResult) => {
    if (batchResult.status === "fulfilled") {
      batchResult.value.forEach((file) => {
        filesEndedResult.push(file);
      });
    } else {
      // throw new ApiError({
      //   statusCode: 400,
      //   message: ERRORS.NO_FILES_ENDED,
      //   data: [],
      // });
    }
  });

  filesEndedResult.sort((a, b) => a.index - b.index);
  return filesEndedResult;
}
