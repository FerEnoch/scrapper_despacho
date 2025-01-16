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
import { ApiResponseStats, FileStats } from "@/types";
import { TableSkeleton } from "./TableSkeleton";
import { Puff } from "react-loader-spinner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  fileName: string;
  onEndFilesClick: (apiResponseData: ApiResponseStats<FileStats>) => void;
  onDataChange: (data: FileStats[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fileName,
  onEndFilesClick,
  onDataChange,
}: DataTableProps<TData, TValue>) {
  const [isEndingFiles, setIsEndingFiles] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 60, //default page size
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
      updateData: (rowIndex: number, value: FileStats) => {
        setIsEndingFiles(true);
        const newData = [...data].map((file, index) => {
          if (index === rowIndex) {
            return {
              ...value,
              prevStatus:
                (value.newStatus
                  ? value.newStatus?.status
                  : value.prevStatus) ?? "",
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

  const handleDownloadFiles = async () => {
    setIsDownloading(true);

    const selectedValues = table
      .getSelectedRowModel()
      .rows.map(({ original }) => original);

    if (selectedValues.length === 0) {
      setIsDownloading(false);
      return;
    }

    await api.downloadFiles(selectedValues as FileStats[], fileName);
    setIsDownloading(false);
  };

  return (
    <div className="mx-auto max-w-[90%] xl:max-w-[80%]">
      <div className="flex items-center justify-between my-4">
        <Button
          className="
          h-fit w-fit
          bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400
          "
          disabled={isLoading}
          onClick={handleEndFiles}
        >
          {"Finalizar expedientes"}
          {isEndingFiles && (
            <Puff
              visible={true}
              height="100"
              width="100"
              color="#000"
              ariaLabel="puff-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          )}
        </Button>
        <div className="flex justify-end items-center gap-2">
          <Input
            placeholder="Buscar número"
            value={(table.getColumn("num")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("num")?.setFilterValue(event.target.value)
            }
            className="w-[16rem]"
          />
          <Input
            placeholder="Filtrar por estado"
            value={
              (table.getColumn("prevStatus")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("prevStatus")?.setFilterValue(event.target.value)
            }
            className="w-[16rem]"
          />
          <Input
            placeholder="Filtrar por ubicación"
            value={
              (table.getColumn("location")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("location")?.setFilterValue(event.target.value)
            }
            className="w-[16rem]"
          />
        </div>
        <Button
          className="
          h-fit w-fit
          bg-gray-800 text-white hover:bg-gray-600 disabled:bg-gray-400
          "
          disabled={isDownloading}
          onClick={handleDownloadFiles}
        >
          {"Descargar .csv"}
          {isDownloading && (
            <Puff
              visible={true}
              height="100"
              width="100"
              color="#000"
              ariaLabel="puff-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          )}
        </Button>
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
