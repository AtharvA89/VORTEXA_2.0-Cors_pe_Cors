import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { 
  Calendar,
  Crop,
  MapPin,
  User,
  Droplets,
  Tractor,
  CheckCircle2,
  Clock,
  Sprout
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const cropIcons = {
  wheat: "🌾",
  maize: "🌽", 
  rice: "🌾",
  tomato: "🍅",
  potato: "🥔",
  cotton: "🌱",
  soybean: "🫘",
  barley: "🌾"
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'growing':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'planted':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'harvested':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'harvesting':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'growing':
      return <Crop className="h-3 w-3" />
    case 'planted':
      return <Sprout className="h-3 w-3" />
    case 'harvested':
      return <CheckCircle2 className="h-3 w-3" />
    case 'preparing':
      return <Tractor className="h-3 w-3" />
    case 'harvesting':
      return <Clock className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

const formatDate = (dateString) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function CropDataTable({ data: initialData }) {
  const [data, setData] = React.useState(() => initialData || [])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [sorting, setSorting] = React.useState([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const columns = [
    {
      accessorKey: "fieldName",
      header: "Field Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <MapPin className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.fieldName}</div>
            <div className="text-sm text-muted-foreground">ID: {row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "cropType",
      header: "Crop Type",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{cropIcons[row.original.cropType] || "🌱"}</span>
          <span className="capitalize font-medium">{row.original.cropType}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={`${getStatusColor(row.original.status)} flex items-center space-x-1`}>
          {getStatusIcon(row.original.status)}
          <span className="capitalize">{row.original.status}</span>
        </Badge>
      ),
    },
    {
      accessorKey: "plantingDate",
      header: "Planting Date",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.original.plantingDate)}</span>
        </div>
      ),
    },
    {
      accessorKey: "expectedHarvest",
      header: "Expected Harvest",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.original.expectedHarvest)}</span>
        </div>
      ),
    },
    {
      accessorKey: "area",
      header: "Area",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono">
          {row.original.area}
        </Badge>
      ),
    },
    {
      accessorKey: "farmer",
      header: "Farmer",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.farmer}</span>
        </div>
      ),
    },
    {
      accessorKey: "soilType",
      header: "Soil Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.soilType}
        </Badge>
      ),
    },
    {
      accessorKey: "irrigationType",
      header: "Irrigation",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          <span className="text-sm">{row.original.irrigationType}</span>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="field-search" className="sr-only">Search fields</Label>
          <Input
            id="field-search"
            placeholder="Search fields..."
            value={table.getColumn("fieldName")?.getFilterValue() ?? ""}
            onChange={(event) =>
              table.getColumn("fieldName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={table.getColumn("cropType")?.getFilterValue() ?? ""}
            onValueChange={(value) =>
              table.getColumn("cropType")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              <SelectItem value="wheat">🌾 Wheat</SelectItem>
              <SelectItem value="maize">🌽 Maize</SelectItem>
              <SelectItem value="rice">🌾 Rice</SelectItem>
              <SelectItem value="tomato">🍅 Tomato</SelectItem>
              <SelectItem value="potato">🥔 Potato</SelectItem>
              <SelectItem value="cotton">🌱 Cotton</SelectItem>
              <SelectItem value="soybean">🫘 Soybean</SelectItem>
              <SelectItem value="barley">🌾 Barley</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={table.getColumn("status")?.getFilterValue() ?? ""}
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="growing">Growing</SelectItem>
              <SelectItem value="planted">Planted</SelectItem>
              <SelectItem value="harvested">Harvested</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="harvesting">Harvesting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Crop className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No fields found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} field(s) total
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              {"<<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              {"<"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              {">"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}