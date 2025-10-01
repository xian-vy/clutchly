"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  RowSelectionState,
  SortingState,
  useReactTable,
  OnChangeFn,
} from "@tanstack/react-table"
import { FileSpreadsheet, Filter, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import Paginator from "./paginator"
import { DownloadCommonMorphs } from "../dashboard/reptiles/morphs/DownloadCommonMorphs"
import { useScreenSize } from "@/lib/hooks/useScreenSize"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onAddNew?: () => void
  onDownload?: () => void
  onImport?: () => void
  filterButton?: React.ReactNode
  isOwner?: boolean
  onSelectionChange?: (selectedRows: TData[]) => void
  batchActions?: React.ReactNode
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAddNew,
  onDownload,
  onImport,
  filterButton,
  isOwner = false,
  onSelectionChange,
  batchActions,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const screenSize = useScreenSize();
  const [pagination, setPagination] = useState({
    pageIndex: 0, 
    pageSize: screenSize === "large" ? 5 : 10,
  });
  const [uncontrolledRowSelection, setUncontrolledRowSelection] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      pageSize: screenSize === "large" ? 5 : 10
    }));
  }, [screenSize]);

  // Use controlled or uncontrolled row selection
  const rowSelection = controlledRowSelection !== undefined ? controlledRowSelection : uncontrolledRowSelection;
  // Wrap setRowSelection to match TanStack Table's OnChangeFn<RowSelectionState> signature
  const setRowSelection: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    if (onRowSelectionChange) {
      // updaterOrValue can be a function or a value
      if (typeof updaterOrValue === 'function') {
        // Compute new value from current
        const newValue = updaterOrValue(rowSelection);
        onRowSelectionChange(newValue);
      } else {
        onRowSelectionChange(updaterOrValue);
      }
    } else {
      if (typeof updaterOrValue === 'function') {
        setUncontrolledRowSelection(updaterOrValue);
      } else {
        setUncontrolledRowSelection(updaterOrValue);
      }
    }
  };

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
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  })

  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map(r => r.original)
      onSelectionChange(selectedRows)
    }
  }, [rowSelection])

  return (
    <div className="space-y-2 sm:space-y-4 w-full">

      <div className="flex  items-center justify-between gap-2 sm:gap-3">
        {batchActions && table.getSelectedRowModel().rows.length > 0 ? (
          <div className="mb-2">{batchActions}</div>
        ) :(
          <div className="flex items-center space-x-2 w-full md:w-auto">
            {filterButton ? (
              filterButton
            ) : (
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            )}
            {onImport && isOwner && (
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
          )}
        <div className={`flex items-center relative  w-full md:w-auto ${batchActions ? 'justify-end' : 'justify-end'}`}>
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm pl-7 text-xs md:text-sm h-8 sm:h-9"
          />
        </div>
      </div>
      <div className="rounded-md lg:min-h-[270px] max-w-[92vw] lg:max-w-full lg:w-full overflow-x-auto ">
          <p  className="md:hidden float-right text-[0.65rem] sm:text-xs  mt-2 mb-3">
          {data.length}  {' Total Records'} 
          </p>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
               {batchActions &&
                  <TableHead key="select-all">
                    <input
                      type="checkbox"
                      checked={table.getIsAllPageRowsSelected()}
                      onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                  </TableHead>
                }
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
                   {batchActions &&
                      <TableCell key={`select-${row.id}`}>
                        <input
                          type="checkbox"
                          checked={row.getIsSelected()}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </TableCell>
                    }
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
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex w-full items-center justify-center md:justify-between gap-4 mt-5 sm:mt-6 xl:mt-7">
        <div className="hidden md:flex items-center gap-3">
          <p className="text-[0.6rem] sm:text-xs md:text-[0.8rem] 3xl:text-sm">
            {data.length}  {'  Records'} 
          </p>
         <span className="text-muted-foreground"> | </span>     
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-6 w-fit text-[0.6rem] sm:text-xs md:text-[0.8rem] cursor-pointer shadow-none border-none p-0 !bg-transparent">
              Show <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
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