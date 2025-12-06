import React from "react";
import { Table } from "react-bootstrap";

// columns: [{ key, header, render?: (row, idx) => ReactNode, className? }]
// data: array of objects
// onRowClick?: (row) => void
// emptyText?: string
const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  emptyText = "No data",
}) => {
  return (
    <Table responsive striped hover>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className={col.className || ""}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="text-center text-muted">
              {emptyText}
            </td>
          </tr>
        )}
        {data.map((row, idx) => (
          <tr
            key={row.id ?? idx}
            style={{ cursor: onRowClick ? "pointer" : undefined }}
            onClick={() => onRowClick?.(row)}
          >
            {columns.map((col) => (
              <td key={col.key} className={col.className || ""}>
                {col.render ? col.render(row, idx) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DataTable;
