"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { FileSpreadsheet, Filter, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import Paginator from "./paginator"
import { DownloadCommonMorphs } from "../dashboard/reptiles/morphs/DownloadCommonMorphs"
import { useScreenSize } from "@/lib/hooks/useScreenSize"
import { Badge } from "./badge"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onAddNew?: () => void
  onDownload?: () => void
  onImport?: () => void
  filterButton?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAddNew,
  onDownload,
  onImport,
  filterButton,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const screenSize = useScreenSize();
  const [pagination, setPagination] = useState({
    pageIndex: 0, 
    pageSize: screenSize === "large" ? 5 : 10,
  });
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize: screenSize === "large" ? 5 : 10
    }));
  }, [screenSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="space-y-2 sm:space-y-4 w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          {filterButton ? (
            filterButton
          ) : (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          )}
          {onImport && (
              <Button 
                variant="outline" 
                onClick={onImport}
                size="sm"
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Import
              </Button>
          )}
          {onAddNew && (
            <Button variant="default" size="sm" onClick={onAddNew}>
               New
              <Plus className="h-4 w-4 " />
            </Button>
          )}
          {onDownload && (
             <div className="flex items-center gap-2">
             <DownloadCommonMorphs showInMorphsTab={true} />
           </div> 
          )}
        </div>
        <div className="flex items-center relative  w-full md:w-auto">
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm pl-7 text-xs md:text-sm"
          />
        </div>
      </div>
      <div className="rounded-md lg:min-h-[270px] max-w-[350px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-full lg:w-full overflow-x-auto ">
          <Badge variant="outline" className="md:hidden float-right my-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {data.length}  {' Total Records'} 
          </Badge>
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full items-center justify-center md:justify-between gap-3 mt-5 sm:mt-6 xl:mt-7">
             <p className="text-[0.6rem] sm:text-xs md:text-[0.8rem] 3xl:text-sm hidden md:block">
               {data.length}  {' Total Records'} 
            </p>
          <div className="flex items-center justify-end space-x-2">
            <Paginator
                currentPage={table.getState().pagination.pageIndex + 1}
                totalPages={table.getPageCount()}
                onPageChange={(page) => table.setPageIndex(page - 1)}
                showPreviousNext={true}
            />
          </div>
      </div>

    </div>
  )
}