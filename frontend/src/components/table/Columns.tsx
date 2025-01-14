import { ColumnDef } from "@tanstack/react-table";
import { FileEndedStats, FileStats } from "../../models/types";
import { Button } from "../ui/button";
import { SIEM_URL_FILE_ID } from "@/config";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { api } from "@/api";

export const Columns: ColumnDef<FileStats | FileEndedStats>[] = [
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
          href={`${SIEM_URL_FILE_ID}${fileShortNum}`}
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
      let statusColor;
      switch (fileStatus) {
        case "EN CURSO":
          statusColor = "text-green-700";
          break;
        case "FINALIZADO":
          statusColor = "text-red-700";
          break;
        case "SISTEMA ANTERIOR":
          statusColor = "text-yellow-600";
          break;
        default:
          statusColor = "text-gray-500";
      }

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
      const newStatus = row.getValue("newStatus") as
        | FileEndedStats["newStatus"]
        | undefined;

      if (!newStatus) return <></>;

      const { status = "", message = "", detail = "" } = newStatus;

      let statusColor;
      switch (status) {
        case "EN CURSO":
          statusColor = "text-green-700";
          break;
        case "FINALIZADO":
          statusColor = "text-red-700";
          break;
        case "SISTEMA ANTERIOR":
          statusColor = "text-yellow-600";
          break;
        default:
          statusColor = "text-gray-500";
      }

      return (
        <p
          className={`
          text-xs font-medium ${statusColor}
          flex flex-col space-between gap-2 
        `}
        >
          {status && (
            <p className="text-pretty">
              <span className={`text-xs ${statusColor}`}>{status}</span>
            </p>
          )}
          {message && (
            <p className="text-pretty text-xs leading-6">
              <span className={`${statusColor}`}>{message}</span>
            </p>
          )}
          {detail && (
            <p className="text-pretty text-[.5rem] leading-6">
              <span className={`${statusColor}`}>{detail}</span>
            </p>
          )}
        </p>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fileStatus = row.getValue("prevStatus");
      const disabled = fileStatus === "FINALIZADO";

      const handleEndFilesClick = async () => {
        const selectedNum = row.getValue("num");
        const selectedTitle = row.getValue("title");
        const selectedPrevStatus = row.getValue("prevStatus");
        const selectedLocation = row.getValue("location");

        const selectedValues = {
          num: selectedNum,
          title: selectedTitle,
          prevStatus: selectedPrevStatus,
          location: selectedLocation,
        };

        const response = await api.endFiles([selectedValues] as FileStats[]);
        console.log("Ending response:", response);
      };

      return (
        <Button
          className="bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400"
          disabled={disabled}
          onClick={handleEndFilesClick}
        >
          Finalizar
        </Button>
      );
    },
  },
];
