import { ChangeRecord } from '../types'

export type SortColumn = 'code' | 'description' | 'difference'
export type SortDirection = 'asc' | 'desc'

interface Props {
  rows: ChangeRecord[]
  sortColumn: SortColumn
  sortDirection: SortDirection
  onSortChange: (column: SortColumn) => void
}

function formatPrice(value: number | null): string {
  if (value === null || Number.isNaN(value)) return ''
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getDifferenceClass(row: ChangeRecord) {
  if (row.difference_type !== 'Numeric' || row.difference_value === null) return ''
  if (row.difference_value > 0) return 'increase'
  if (row.difference_value < 0) return 'decrease'
  return 'neutral'
}

function sortRows(rows: ChangeRecord[], column: SortColumn, direction: SortDirection): ChangeRecord[] {
  const sorted = [...rows].sort((a, b) => {
    if (column === 'code') {
      return a.code.localeCompare(b.code)
    }
    if (column === 'description') {
      return a.description.localeCompare(b.description)
    }

    const aVal = a.difference_value
    const bVal = b.difference_value

    if (a.difference_type !== 'Numeric' && b.difference_type === 'Numeric') return 1
    if (a.difference_type === 'Numeric' && b.difference_type !== 'Numeric') return -1
    if (aVal === null && bVal === null) return 0
    if (aVal === null) return 1
    if (bVal === null) return -1
    return aVal - bVal
  })

  return direction === 'asc' ? sorted : sorted.reverse()
}

export function ComparisonTable({ rows, sortColumn, sortDirection, onSortChange }: Props) {
  const sortedRows = sortRows(rows, sortColumn, sortDirection)

  const toggleSort = (column: SortColumn) => {
    onSortChange(column)
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort('code')}>
              Código {sortColumn === 'code' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => toggleSort('description')}>
              Descripción {sortColumn === 'description' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
            <th>Precio ayer</th>
            <th>Precio hoy</th>
            <th onClick={() => toggleSort('difference')}>
              Diferencia {sortColumn === 'difference' && (sortDirection === 'asc' ? '▲' : '▼')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.code} className={row.status.toLowerCase()}>
              <td>{row.code}</td>
              <td>{row.description}</td>
              <td>{formatPrice(row.price_yesterday)}</td>
              <td>{formatPrice(row.price_today)}</td>
              <td className={`difference ${row.difference_type.toLowerCase()} ${getDifferenceClass(row)}`}>
                {row.difference_label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
