import { useEffect, useMemo, useState } from 'react'
import { fetchComparison } from './api/client'
import { ComparisonTable, SortColumn, SortDirection } from './components/ComparisonTable'
import { Filters } from './components/Filters'
import { Header } from './components/Header'
import { ChangeRecord, ComparisonResponse } from './types'

function filterRows(
  rows: ChangeRecord[],
  search: string,
  onlyNumeric: boolean,
  showNew: boolean,
  showMissing: boolean
) {
  const query = search.toLowerCase()
  return rows.filter((row) => {
    const matchesSearch =
      row.code.toLowerCase().includes(query) || row.description.toLowerCase().includes(query)
    const matchesNumeric = !onlyNumeric || row.difference_type === 'Numeric'
    const matchesNew = !showNew || row.status === 'NewToday'
    const matchesMissing = !showMissing || row.status === 'MissingToday'
    return matchesSearch && matchesNumeric && matchesNew && matchesMissing
  })
}

function useSortState() {
  const [sortColumn, setSortColumn] = useState<SortColumn>('difference')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const changeSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return { sortColumn, sortDirection, changeSort }
}

function App() {
  const [data, setData] = useState<ComparisonResponse>({ success: false })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [onlyNumeric, setOnlyNumeric] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showMissing, setShowMissing] = useState(false)

  const { sortColumn, sortDirection, changeSort } = useSortState()

  const loadData = async () => {
    setLoading(true)
    const response = await fetchComparison()
    setData(response)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredRows = useMemo(() => {
    const rows = data.changes ?? []
    return filterRows(rows, search, onlyNumeric, showNew, showMissing)
  }, [data.changes, search, onlyNumeric, showNew, showMissing])

  return (
    <div className="app">
      <Header today={data.today_file} yesterday={data.yesterday_file} onReload={loadData} />

      <section className="card">
        <Filters
          search={search}
          onSearchChange={setSearch}
          onlyNumeric={onlyNumeric}
          onOnlyNumericChange={setOnlyNumeric}
          showNew={showNew}
          onShowNewChange={setShowNew}
          showMissing={showMissing}
          onShowMissingChange={setShowMissing}
        />
      </section>

      <section className="card">
        {loading && <div className="info">Cargando comparación...</div>}
        {!loading && !data.success && <div className="error">{data.error ?? 'Error desconocido'}</div>}
        {!loading && data.success && data.changes && (
          <ComparisonTable
            rows={filteredRows}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortChange={changeSort}
          />
        )}
      </section>
    </div>
  )
}

export default App
