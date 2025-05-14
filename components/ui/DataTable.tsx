// Create components/ui/DataTable.tsx
interface Column<T> {
  id: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  sortConfig?: {
    key: string;
    direction: 'ascending' | 'descending';
  };
  onSort?: (key: string) => void;
  emptyState?: React.ReactNode;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortConfig,
  onSort,
  emptyState
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
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
            data.map(item => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50">
                {columns.map(column => (
                  <td key={column.id} className="px-4 py-3 whitespace-nowrap">
                    {column.cell(item)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyState || 'No data available'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
