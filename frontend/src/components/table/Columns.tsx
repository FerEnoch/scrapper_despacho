import { ColumnDef } from "@tanstack/react-table";
import { FileEndedStats, FileStats } from "../../models/types";
import { Button } from "../ui/button";
import { SIEM_URL_FILE_ID } from "@/config";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

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
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const fileStatus = row.getValue("prevStatus");
  //     const disabled = fileStatus === "FINALIZADO";

  //     return (
  //       <Button
  //         className="bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400"
  //         disabled={disabled}
  //         onClick={() => console.log(row.getValue("num"))}
  //       >
  //         Finalizar
  //       </Button>
  //     );
  //   },
  // },
];
