import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { useState } from "react";
import { Input } from "../ui/input";
import { api } from "@/api";
import { ApiResponseStats, FileStats } from "@/models/types";
import { TableSkeleton } from "./TableSkeleton";
import { ProgressBar } from "react-loader-spinner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEndFilesClick: (apiResponseData: ApiResponseStats<FileStats>) => void;
  onDataChange: (data: FileStats[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEndFilesClick,
  onDataChange,
}: DataTableProps<TData, TValue>) {
  const [isEndingFiles, setIsEndingFiles] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    meta: {
      updateData: (rowIndex: number, value: FileStats) => {
        setIsEndingFiles(true);
        const newData = [...data].map((file, index) => {
          if (index === rowIndex) {
            return {
              ...value,
              prevStatus: value.newStatus?.status ?? "",
            };
          }
          return file;
        }) as FileStats[];

        onDataChange(newData);
        setIsEndingFiles(false);
      },
    },
  });

  const handleEndFiles = async () => {
    setIsLoading(true);
    setIsEndingFiles(true);

    const selectedValues = table
      .getSelectedRowModel()
      .rows.map(({ original }) => original);

    if (selectedValues.length === 0) {
      setIsLoading(false);
      return;
    }

    const response = await api.endFiles(selectedValues as FileStats[]);
    if (!response) return;

    onEndFilesClick(response);
    setIsLoading(false);
    setIsEndingFiles(false);
  };

  return (
    <div className="mx-auto max-w-[90%] xl:max-w-[80%]">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex justify-start items-center">
          <Button
            className="bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400"
            disabled={isLoading}
            onClick={handleEndFiles}
          >
            Finalizar expedientes
          </Button>
          {isEndingFiles && (
            <ProgressBar
              visible={true}
              height="40"
              width="60"
              barColor="#86efac"
              borderColor="#232323"
              ariaLabel="progress-bar-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          )}
        </div>
        <div className="flex justify-end items-center gap-4">
          <Input
            placeholder="Filtrar por estado..."
            value={
              (table.getColumn("prevStatus")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("prevStatus")?.setFilterValue(event.target.value)
            }
            className="max-w-smps-12"
          />
          <Input
            placeholder="Filtrar por ubicación..."
            value={
              (table.getColumn("location")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("location")?.setFilterValue(event.target.value)
            }
            className="max-w-smps-12"
          />
        </div>
      </div>
      {isLoading && <TableSkeleton />}
      {!isLoading && (
        <>
          <div className="rounded-md border shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="p-4 leading-snug">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Sin resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-center space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
