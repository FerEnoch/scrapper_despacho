import { useUserSession } from "@/utils/hooks/use-user-session";
import { ColumnDef } from "@tanstack/react-table";
import { FileStats } from "../../types";
import { Button } from "../ui/button";
import { SIEM_FILE_STATS_URL } from "@/config";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { filesApi } from "@/api/filesApi";
import { getMessageColor, getStatusColor } from "@/utils";
import { useState } from "react";
import { Puff } from "react-loader-spinner";
import { AUTH_API_ERRORS } from "@/types/enums";

// TO DO -> make a component  / inc. useMemo() ?
export const Columns: ColumnDef<FileStats>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="ps-2 grid place-content-center">
        <Checkbox
          className="w-6 h-6"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          id="select-all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="grid place-content-center">
        <Checkbox
          className="w-6 h-6"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "num",
    header: () => {
      return (
        <div className="ps-4 grid place-content-start w-[24ch]">
          <label className="text-sm cursor-pointer" htmlFor="select-all">
            {"Número"}
          </label>
        </div>
      );
    },
    cell: ({ row }) => {
      const fileCompleteNum = row.getValue("num") as string;
      const [, repOrNum, num] = (fileCompleteNum ?? "").split("-");
      return (
        <div className="grid place-content-center w-[24ch] tracking-wide">
          <a
            href={`${SIEM_FILE_STATS_URL}${num?.length >= 5 ? num : repOrNum}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-gray-950"
          >
            {row.getValue("num")}
          </a>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Carátula",
    cell: ({ row }) => {
      const fileTitle = row.getValue("title") as string;
      return (
        <div className="grid place-content-start w-[30ch] text-pretty">
          {fileTitle}
        </div>
      );
    },
  },
  {
    accessorKey: "prevStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const fileStatus = row.getValue("prevStatus") as string;
      const statusColor = getStatusColor(fileStatus);

      return (
        <div
          className={`
          grid place-content-start w-[16ch] 
          text-xs font-medium ${statusColor}
        `}
        >
          {fileStatus}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Ubicación",
    cell: ({ row }) => {
      const fileLocation = row.getValue("location") as string;
      return (
        <div className="grid place-content-start w-[16ch] text-pretty">
          {fileLocation}
        </div>
      );
    },
  },
  {
    accessorKey: "newStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Resultado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const newStatus = row.getValue("newStatus") as FileStats["newStatus"];

      if (!newStatus) return <div className="w-[1rem]"></div>;

      const { /*status = "",*/ message = "", detail = "" } = newStatus;

      // const statusColor = getStatusColor(status);
      const messageColor = getMessageColor(message);

      return (
        <div
          className={`
          max-w-[16ch]
          text-xs
          flex flex-col space-between gap-1 
        `}
        >
          {/* {status && (
            <p className="text-xs leading-4">
              <span className={`${statusColor}`}>{status}</span>
            </p>
          )} */}
          {message && (
            <p className="text-xs leading-4">
              <span className={`${messageColor}`}>{message}</span>
            </p>
          )}
          {detail && (
            <p className="text-pretty font-light text-xs leading-1">
              <span>{detail}</span>
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      /* eslint-disable react-hooks/rules-of-hooks */
      const { handleActiveUser, handleRevalidateAccessToken } =
        useUserSession();
      const [isSearchingStats, setIsSearchingStats] = useState<boolean>(false);
      const [isEndingFile, setIsEndingFile] = useState<boolean>(false);

      const isEnded = row.getValue("prevStatus") === "FINALIZADO";
      const isSelected = row.getIsSelected();
      const endButtonDisabled = isEnded || !isSelected || isEndingFile;
      const searchButtonDisabled = !isSelected || isSearchingStats;

      const handleEndFilesClick = async () => {
        if (!isSelected) return;
        setIsEndingFile(true);

        const selectedNum = row.getValue("num") as string;
        const selectedTitle = row.getValue("title") as string;
        const selectedPrevStatus = row.getValue("prevStatus") as string;
        const selectedLocation = row.getValue("location") as string;

        const selectedValues = {
          num: selectedNum,
          title: selectedTitle,
          prevStatus: selectedPrevStatus,
          location: selectedLocation,
        };

        let revalidateApiResponse;

        const apiResponse = await filesApi.endFiles([
          selectedValues,
        ] as FileStats[]);
        const { message } = apiResponse;

        if (message === AUTH_API_ERRORS.ACCESS_TOKEN_EXPIRED) {
          const revalidateResponseData = await handleRevalidateAccessToken();
          handleActiveUser(revalidateResponseData);
          revalidateApiResponse = await filesApi.endFiles([
            selectedValues,
          ] as FileStats[]);
        }

        setIsEndingFile(false);
        table.options.meta?.updateData(
          revalidateApiResponse ?? apiResponse,
          selectedNum
        );
      };

      const handleSearchFileClick = async () => {
        setIsSearchingStats(true);
        if (!isSelected) return;

        const selectedNum = row.getValue("num") as string;
        const apiResponse = await filesApi.getFilesStats(selectedNum);

        table.options.meta?.updateData(apiResponse, selectedNum);
        setIsSearchingStats(false);
      };

      return (
        <div className="flex flex-col space-between gap-2">
          <Button
            className="
             flex items-center justify-center gap-2
             bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400
               "
            disabled={endButtonDisabled}
            onClick={handleEndFilesClick}
          >
            <p>{"Finalizar"}</p>
            {isEndingFile && (
              <Puff
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="puff-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            )}
          </Button>
          <Button
            className="
            flex items-center justify-center gap-2
            bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400
             "
            disabled={searchButtonDisabled}
            onClick={handleSearchFileClick}
          >
            <p>{"Actualizar estado"}</p>
            {isSearchingStats && (
              <Puff
                visible={true}
                height="40"
                width="40"
                color="#000"
                ariaLabel="puff-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            )}
          </Button>
        </div>
      );
    },
  },
];
