from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from .excel_reader import ProductRow, load_products


@dataclass
class FileInfo:
    name: str
    modified_at: str


@dataclass
class ChangeRecord:
    code: str
    description: str
    price_yesterday: Optional[float]
    price_today: Optional[float]
    difference_type: str
    difference_value: Optional[float]
    difference_label: str
    status: str


class NotEnoughFilesError(Exception):
    pass


def select_today_yesterday(files: List[Path]) -> Tuple[Path, Path]:
    if len(files) < 2:
        raise NotEnoughFilesError("Not enough files to compare (need at least two .xls files).")
    # Files are already sorted by modified time descending
    today_file, yesterday_file = files[0], files[1]
    return today_file, yesterday_file


def file_info(path: Path) -> FileInfo:
    modified = datetime.fromtimestamp(path.stat().st_mtime).isoformat()
    return FileInfo(name=path.name, modified_at=modified)


def _format_difference_label(value: Optional[float], difference_type: str) -> str:
    if difference_type == "Numeric" and value is not None:
        sign = "+" if value > 0 else ("" if value == 0 else "-")
        return f"{sign}{abs(value):.2f} %"
    if difference_type == "NoEnAyer":
        return "No en ayer"
    if difference_type == "NoEnHoy":
        return "No en hoy"
    return "Dato inválido"


def _build_change_record(
    code: str,
    today_row: Optional[ProductRow],
    yesterday_row: Optional[ProductRow],
) -> ChangeRecord:
    today_price = today_row.price_as_float() if today_row else None
    yesterday_price = yesterday_row.price_as_float() if yesterday_row else None

    difference_type = "Invalid"
    difference_value: Optional[float] = None
    status = "Existing"

    if today_row and not yesterday_row:
        difference_type = "NoEnAyer"
        status = "NewToday"
    elif yesterday_row and not today_row:
        difference_type = "NoEnHoy"
        status = "MissingToday"
    else:
        if today_price is not None and yesterday_price is not None and yesterday_price != 0:
            difference_value = ((today_price - yesterday_price) / yesterday_price) * 100
            difference_type = "Numeric"
        else:
            difference_type = "Invalid"

    description = ""
    if today_row:
        description = today_row.description
    elif yesterday_row:
        description = yesterday_row.description

    difference_label = _format_difference_label(difference_value, difference_type)

    return ChangeRecord(
        code=code,
        description=description,
        price_yesterday=yesterday_price,
        price_today=today_price,
        difference_type=difference_type,
        difference_value=difference_value,
        difference_label=difference_label,
        status=status,
    )


def compare(today_file: Path, yesterday_file: Path) -> List[ChangeRecord]:
    today_products = load_products(today_file)
    yesterday_products = load_products(yesterday_file)

    changes: List[ChangeRecord] = []

    all_codes = set(today_products.keys()) | set(yesterday_products.keys())
    for code in sorted(all_codes):
        today_row = today_products.get(code)
        yesterday_row = yesterday_products.get(code)
        changes.append(_build_change_record(code, today_row, yesterday_row))

    return changes
