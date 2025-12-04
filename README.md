# Control de precios

Aplicación local para comparar listas diarias de precios en archivos `.xls`. Backend en FastAPI y frontend en React/TypeScript.

## Requisitos

- Python 3.11+
- Node.js 18+
- npm o yarn

## Configuración del entorno

1. Copie `.env.example` a `.env` y ajuste la ruta del directorio con los archivos `.xls` si es necesario:

```
PRICES_FOLDER_PATH=./sample_data
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

2. Instale dependencias del backend:

```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Instale dependencias del frontend:

```
cd frontend
npm install
```

## Ejecución en desarrollo

### Backend

Desde la raíz del repo:

```
uvicorn backend.app.main:app --reload --port 8000
```

El backend lee los archivos `.xls` del directorio configurado, ordena por fecha de modificación y compara el más reciente (hoy) con el segundo más reciente (ayer).

### Frontend

En otra terminal:

```
cd frontend
npm run dev
```

Abra `http://localhost:5173` en el navegador. El proxy de Vite reenvía las llamadas `/api` al backend en `localhost:8000`.

## Estructura del backend

- `backend/app/config.py`: carga configuración desde variables de entorno o `.env`.
- `backend/app/excel_reader.py`: listado y lectura de archivos `.xls` (fallback TSV) y parseo de columnas obligatorias (`Código`, `Descripción`, `Lista 1`). Usa el primer registro si hay códigos duplicados.
- `backend/app/comparator.py`: selecciona archivos de hoy/ayer, calcula diferencias porcentuales y marca productos nuevos o faltantes.
- `backend/app/main.py`: aplicación FastAPI con `/api/comparison` y `/api/config`.

## Estructura del frontend

- `frontend/src/api`: cliente para consumir `/api/comparison`.
- `frontend/src/components`: cabecera, filtros y tabla con ordenamiento y estilos de estado.
- `frontend/src/App.tsx`: lógica principal de carga, filtros y estados de UI.

## Datos de ejemplo

Se incluyen dos archivos en `sample_data/`:
- `precios_ayer.xls`
- `precios_hoy.xls`

Son archivos tabulados con cabecera `Código`, `Descripción`, `Lista 1` para poder probar inmediatamente la comparación.

## Comportamiento clave

- Si hay menos de dos archivos `.xls`, el backend responde `success: false` con mensaje claro.
- Los cambios incluyen productos nuevos (no en ayer), faltantes (no en hoy) y diferencias numéricas cuando ambos precios son válidos y el precio de ayer no es cero.
- Valores no numéricos generan etiqueta `Dato inválido`.
- El frontend permite buscar por código o descripción, filtrar por tipo de cambio y ordenar por código, descripción o diferencia.

## Futuras mejoras

- Permitir seleccionar fechas específicas.
- Exportar la tabla de cambios a Excel/CSV.
- Graficar la evolución de precios por producto.
