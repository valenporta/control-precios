from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd

REQUIRED_COLUMNS = {"Código", "Descripción", "Lista 1"}


@dataclass
class ProductRow:
    code: str
    description: str
    raw_price: object

    def price_as_float(self) -> Optional[float]:
        """Attempt to parse the raw price into a float.

        Returns None when parsing fails or the value is missing.
        """
        if self.raw_price is None or (isinstance(self.raw_price, float) and pd.isna(self.raw_price)):
            return None
        try:
            # Some files might come with numeric columns parsed as strings
            value = float(str(self.raw_price).replace(",", "."))
            return value
        except (ValueError, TypeError):
            return None


def list_xls_files(folder: Path) -> List[Path]:
    return sorted((p for p in folder.glob("*.xls") if p.is_file()), key=lambda p: p.stat().st_mtime, reverse=True)


def _read_dataframe(file_path: Path) -> pd.DataFrame:
    """Read a spreadsheet file that is expected to be .xls.

    A fallback to CSV/TSV is provided so bundled sample files can be simple tabular text
    while still using the .xls extension.
    """
    errors = []

    # Primary attempt: legacy .xls files
    try:
        return pd.read_excel(file_path, engine="xlrd")
    except Exception as exc:
        errors.append(f"xlrd: {exc}")

    # Secondary attempt: some providers ship modern Excel files with .xls extensions
    try:
        return pd.read_excel(file_path, engine="openpyxl")
    except Exception as exc:
        errors.append(f"openpyxl: {exc}")

    # Fallback for plain-text tabular data with various encodings
    for encoding in ("utf-8", "latin1"):
        try:
            return pd.read_csv(file_path, sep="\t", encoding=encoding)
        except UnicodeDecodeError as exc:
            errors.append(f"csv-{encoding}: {exc}")
        except Exception as exc:  # pragma: no cover - unexpected formats
            errors.append(f"csv-{encoding}: {exc}")

    joined_errors = "; ".join(errors)
    raise ValueError(f"Unable to read file '{file_path.name}': {joined_errors}")


def load_products(file_path: Path) -> Dict[str, ProductRow]:
    """Load products from a .xls file.

    If duplicated codes exist, the first occurrence is kept and later rows are ignored.
    """
    df = _read_dataframe(file_path)
    df.columns = [str(col).strip() for col in df.columns]
    if not REQUIRED_COLUMNS.issubset(df.columns):
        missing = REQUIRED_COLUMNS - set(df.columns)
        raise ValueError(
            f"File '{file_path.name}' is missing required columns: {', '.join(sorted(missing))}"
        )

    products: Dict[str, ProductRow] = {}
    for _, row in df.iterrows():
        code = str(row["Código"]).strip()
        if code == "nan" or code == "":
            continue
        if code in products:
            # Keep first occurrence
            continue
        description = str(row["Descripción"]).strip()
        raw_price = row["Lista 1"]
        products[code] = ProductRow(code=code, description=description, raw_price=raw_price)
    return products
