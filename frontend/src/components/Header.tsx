import { FileInfo } from '../types'

interface Props {
  today?: FileInfo
  yesterday?: FileInfo
  onReload: () => void
}

export function Header({ today, yesterday, onReload }: Props) {
  return (
    <header className="header">
      <div>
        <h1>Comparación de precios (Hoy vs Ayer)</h1>
        <p className="file-info">
          <strong>Archivo de hoy:</strong> {today ? today.name : 'No disponible'}{' '}
          {today && <span className="muted">(modificado: {new Date(today.modified_at).toLocaleString()})</span>}
        </p>
        <p className="file-info">
          <strong>Archivo de ayer:</strong> {yesterday ? yesterday.name : 'No disponible'}{' '}
          {yesterday && <span className="muted">(modificado: {new Date(yesterday.modified_at).toLocaleString()})</span>}
        </p>
      </div>
      <button className="primary" onClick={onReload}>Recargar comparación</button>
    </header>
  )
}
