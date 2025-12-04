from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .comparator import compare, file_info, select_today_yesterday, NotEnoughFilesError
from .config import get_settings
from .excel_reader import list_xls_files

app = FastAPI(title="Control de Precios API")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/comparison")
async def get_comparison():
    try:
        files = list_xls_files(settings.prices_folder_path)
        today_file, yesterday_file = select_today_yesterday(files)
        changes = compare(today_file, yesterday_file)
        return {
            "success": True,
            "today_file": file_info(today_file).__dict__,
            "yesterday_file": file_info(yesterday_file).__dict__,
            "changes": [c.__dict__ for c in changes],
        }
    except NotEnoughFilesError as exc:
        return JSONResponse(
            status_code=400,
            content={"success": False, "error": str(exc)},
        )
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"success": False, "error": str(exc)})
    except Exception as exc:  # pragma: no cover - safety net
        return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})


@app.get("/api/config")
async def get_config():
    return {"prices_folder_path": str(settings.prices_folder_path)}
