// Create components/ui/DataTable.tsx (Updated Version)
import React from 'react';

interface Column<T> {
  id?: string;
  key?: string;
  header?: React.ReactNode;
  label?: string;
  cell?: (item: T) => React.ReactNode;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (item: T) => string;
  sortConfig?: {
    key: string;
    direction: 'ascending' | 'descending';
  };
  onSort?: (key: string) => void;
  onRowClick?: (item: T, index: number) => void;
  emptyState?: React.ReactNode;
  showPagination?: boolean;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor = (item: any) => item.id || JSON.stringify(item),
  sortConfig,
  onSort,
  onRowClick,
  emptyState,
  showPagination = true
}: DataTableProps<T>) {

  // Normalize column format - support both id/header/cell and key/label/render
  const normalizedColumns = columns.map(col => ({
    id: col.id || col.key || '',
    header: col.header || col.label || '',
    cell: col.cell || ((item: T, index: number) => {
      if (col.render) {
        const value = col.key ? (item as any)[col.key] : item;
        return col.render(value, item, index);
      }
      return col.key ? String((item as any)[col.key] || '') : '';
    }),
    sortable: col.sortable || false
  }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {normalizedColumns.map(column => (
              <th
                key={column.id}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                onClick={() => column.sortable && onSort && onSort(column.id)}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortConfig && sortConfig.key === column.id && (
                    <span className="ml-1">
                      {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item, index)}
              >
                {normalizedColumns.map(column => (
                  <td key={column.id} className="px-4 py-3 whitespace-nowrap">
                    {column.cell(item, index)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={normalizedColumns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyState || 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
