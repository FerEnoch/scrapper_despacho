import { ApiResponse, FileStats } from "@/types";
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table";

import { useState } from "react";

interface useTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  onDataChange: (data: FileStats[], message: string) => void;
}

export function useTable<TData, TValue>({
  data,
  columns,
  onDataChange,
}: useTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isEndingFiles, setIsEndingFiles] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 120, //default page size
  });
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    meta: {
      updateData: (rowIndex: number, apiResponse: ApiResponse<FileStats>) => {
        const apiResponseMessage = apiResponse.message;
        const updatedFileStats = apiResponse.data?.[0];

        setIsEndingFiles(true);
        const newData = [...data].map((file, index) => {
          if (index === rowIndex) {
            if (!updatedFileStats) return file;
            return {
              ...updatedFileStats,
              prevStatus:
                (updatedFileStats.newStatus
                  ? updatedFileStats.newStatus?.status
                  : updatedFileStats.prevStatus) ?? "",
            };
          }
          return file;
        }) as FileStats[];

        onDataChange(newData, apiResponseMessage);
        setIsEndingFiles(false);
      },
    },
  });

  return { table, setIsEndingFiles, isEndingFiles };
}
