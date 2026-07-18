/**
 * Shared data table shell.
 * @param {{
 *   columns: Array<{ key: string, header: string, align?: 'left'|'right'|'center', width?: string }>,
 *   rows: Array<object>,
 *   renderCell: (row: object, column: object) => React.ReactNode,
 *   getRowKey?: (row: object, index: number) => string|number,
 *   empty?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function DataTable({
  columns = [],
  rows = [],
  renderCell,
  getRowKey = (row, index) => row.id ?? index,
  empty = null,
  className = ""
}) {
  if (!rows.length) {
    return empty || <div className="mt-empty-state"><strong>No rows yet</strong></div>;
  }

  return (
    <div className={`mt-data-table-wrap ${className}`.trim()}>
      <table className="mt-data-table">
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                className={column.align ? `align-${column.align}` : ""}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map(column => (
                <td key={column.key} className={column.align ? `align-${column.align}` : ""}>
                  {renderCell(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
