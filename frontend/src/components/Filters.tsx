interface FilterProps {
  search: string
  onSearchChange: (value: string) => void
  onlyNumeric: boolean
  onOnlyNumericChange: (value: boolean) => void
  showNew: boolean
  onShowNewChange: (value: boolean) => void
  showMissing: boolean
  onShowMissingChange: (value: boolean) => void
}

export function Filters({
  search,
  onSearchChange,
  onlyNumeric,
  onOnlyNumericChange,
  showNew,
  onShowNewChange,
  showMissing,
  onShowMissingChange
}: FilterProps) {
  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Buscar por código o descripción"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={onlyNumeric}
          onChange={(e) => onOnlyNumericChange(e.target.checked)}
        />
        Mostrar solo cambios numéricos
      </label>
      <label>
        <input
          type="checkbox"
          checked={showNew}
          onChange={(e) => onShowNewChange(e.target.checked)}
        />
        Mostrar solo productos nuevos
      </label>
      <label>
        <input
          type="checkbox"
          checked={showMissing}
          onChange={(e) => onShowMissingChange(e.target.checked)}
        />
        Mostrar solo productos faltantes hoy
      </label>
    </div>
  )
}
