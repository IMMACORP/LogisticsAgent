"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LogisticsService } from "@/lib/data/services";
import { cn } from "@/lib/utils";

interface ServicesTableProps {
  services: LogisticsService[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [filter, setFilter] = useState("");

  const columns = useMemo<ColumnDef<LogisticsService>[]>(
    () => [
      {
        accessorKey: "name",
        header: "サービス名",
        cell: ({ row }) => (
          <span className="font-medium text-[#1e3a5f]">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "category",
        header: "カテゴリ",
        cell: ({ row }) => (
          <span className="rounded-full bg-[#1e3a5f]/10 px-2.5 py-0.5 text-xs font-medium text-[#1e3a5f]">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "概要",
        cell: ({ row }) => (
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {row.original.description}
          </p>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: services,
    columns,
    state: {
      globalFilter: filter,
    },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue).toLowerCase();
      const { name, category, description } = row.original;
      return [name, category, description].some((value) =>
        value.toLowerCase().includes(query),
      );
    },
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="サービス名・カテゴリで検索..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(row.original.highlight && "bg-sky-50/60")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  該当するサービスがありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
