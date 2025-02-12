import { ColumnDef, flexRender } from "@tanstack/react-table";

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
import { filesApi } from "@/api/filesApi";
import { ApiResponse, FileStats } from "@/types";
import { TableSkeleton } from "./TableSkeleton";
import { Puff } from "react-loader-spinner";
import { useTable } from "@/lib/hooks/useTable";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onEndFilesClick: (apiResponseData: ApiResponse<FileStats>) => void;
  onDataChange: (data: FileStats[], message: string) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEndFilesClick,
  onDataChange,
}: DataTableProps<TData, TValue>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { table, setIsEndingFiles, isEndingFiles } = useTable({
    data,
    columns,
    onDataChange,
  });

  const handleEndFiles = async () => {
    const selectedValues = table
      .getSelectedRowModel()
      .rows.map(({ original }) => original);

    if (selectedValues.length === 0) {
      return;
    }
    setIsLoading(true);
    setIsEndingFiles(true);
    const response = await filesApi.endFiles(selectedValues as FileStats[]);
    console.log("🚀 ~ handleEndFiles ~ response:", response);
    onEndFilesClick(response);

    setIsLoading(false);
    setIsEndingFiles(false);
  };

  return (
    <>
      {isLoading && <TableSkeleton />}
      {!isLoading && (
        <div className="mx-auto max-w-[90%] xl:max-w-[80%] space-y-4">
          <div
            className="
            ps-2 md:ps-0
            h-14 space-y-2 md:space-y-4
            flex flex-col items-start justify-center
            md:flex-row md:items-center md:justify-between 
            "
          >
            <Button
              className="
          h-fit w-fit mb-4 md:my-4
          bg-primary hover:bg-green-300 disabled:bg-gray-400
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
            <div className="pb-2 flex justify-end items-center gap-4 md:gap-6">
              <Input
                placeholder="Buscar número"
                value={
                  (table.getColumn("num")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("num")?.setFilterValue(event.target.value)
                }
                className="
                w-[14rem] border-b-1 rounded-none 
                text-gray-400
                border-gray-400 border-t-transparent border-x-transparent
                "
              />
              <Input
                placeholder="Filtrar por estado"
                value={
                  (table.getColumn("prevStatus")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn("prevStatus")
                    ?.setFilterValue(event.target.value)
                }
                className="
                w-[14rem] border-b-1 rounded-none 
                text-gray-400
                border-gray-400 border-t-transparent border-x-transparent
                "
              />
              <Input
                placeholder="Filtrar por ubicación"
                value={
                  (table.getColumn("location")?.getFilterValue() as string) ??
                  ""
                }
                onChange={(event) =>
                  table
                    .getColumn("location")
                    ?.setFilterValue(event.target.value)
                }
                className="
                w-[14rem] border-b-1 rounded-none 
                text-gray-400
                border-gray-400 border-t-transparent border-x-transparent
                "
              />
            </div>
          </div>
          <div className="rounded-md">
            <Table className="mt-4">
              <TableHeader className="border-none">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-none hover:bg-inherit [&>*]:font-bold [&>*>*]:font-bold"
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="pb-2">
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
              <TableBody className="text-gray-700">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="bg-white hover:bg-gray-100 border-gray-200 border"
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
                  <TableRow className="h-52 text-center bg-white hover:bg-white">
                    <TableCell colSpan={columns.length}>
                      {"Sin resultados."}
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
              className="text-gray-500"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-gray-500"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
