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

import { useCallback, useEffect, useState } from "react";

interface useTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  onDataChange: (data: FileStats[], message: string) => void;
  onFilterData: (filteredFiles: FileStats[]) => void;
}

export function useTable<TData, TValue>({
  data,
  columns,
  onDataChange,
  onFilterData,
}: useTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<Record<number, boolean>>({});
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
      updateData: (
        apiResponse: ApiResponse<FileStats>,
        selectedNum: string
      ) => {
        const apiResponseMessage = apiResponse.message;
        const updatedFileStats = apiResponse.data?.[0];

        setIsEndingFiles(true);
        const newData = ([...data] as FileStats[]).map((file, index) => {
          if (rowSelection[index]) {
            if (!updatedFileStats) return file;
            if (selectedNum !== file.num) return file;
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

  const getFilteredValues = useCallback(() => {
    return (
      data as unknown as {
        [key: string]: string | undefined;
      }[]
    ).filter((file) => {
      return columnFilters.every(({ id, value }) => {
        return RegExp(value as string, "i").test(file[id] as string);
      });
    });
  }, [columnFilters, data]);

  useEffect(() => {
    const filtered = getFilteredValues() as unknown as FileStats[];
    onFilterData(filtered);
  }, [columnFilters, getFilteredValues, onFilterData]);

  return { table, setIsEndingFiles, isEndingFiles, getFilteredValues };
}
