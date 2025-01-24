import { ColumnDef } from "@tanstack/react-table";
import { FileStats } from "../../types";
import { Button } from "../ui/button";
import { SIEM_FILE_STATS_URL } from "@/config";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { api } from "@/api";
import { getMessageColor, getStatusColor } from "@/lib/utils";
import { useState } from "react";
import { Puff } from "react-loader-spinner";

// TO DO -> make a component  / inc. useMemo() ?
export const Columns: ColumnDef<FileStats>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="w-6 h-6"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="w-6 h-6"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "num",
    header: "Número",
    cell: ({ row }) => {
      const fileCompleteNum = row.getValue("num") as string;
      const [, , fileShortNum] = fileCompleteNum.split("-");
      return (
        <a
          href={`${SIEM_FILE_STATS_URL}${fileShortNum}`}
          target="_blank"
          rel="noreferrer"
        >
          {row.getValue("num")}
        </a>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Carátula",
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
        <span className={`text-xs font-medium ${statusColor}`}>
          {fileStatus}
        </span>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Ubicación",
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

      if (!newStatus) return <></>;

      const { status = "", message = "", detail = "" } = newStatus;

      const statusColor = getStatusColor(status);
      const messageColor = getMessageColor(message);

      return (
        <div
          className={`
          text-xs
          flex flex-col space-between gap-2 
        `}
        >
          {status && (
            <p className="text-xs leading-6">
              <span className={`${statusColor}`}>{status}</span>
            </p>
          )}
          {message && (
            <p className="text-xs leading-6">
              <span className={`${messageColor}`}>{message}</span>
            </p>
          )}
          {detail && (
            <p className="text-pretty font-light text-[.5rem] leading-6">
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

        const apiResponse = await api.endFiles([selectedValues] as FileStats[]);
        const [updatedFileStats] = apiResponse?.data || [];

        setIsEndingFile(false);
        if (!updatedFileStats) return;
        table.options.meta?.updateData(row.index, updatedFileStats);
      };

      const handleSearchFileClick = async () => {
        setIsSearchingStats(true);
        if (!isSelected) return;

        const selectedNum = row.getValue("num") as string;
        const apiResponse = await api.getFilesStats(selectedNum);
        const [updatedFileStats] = apiResponse?.data || [];

        table.options.meta?.updateData(row.index, updatedFileStats);
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
