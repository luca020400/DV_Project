import pandas as pd
import json
import sys

# --- 1. Command Line Arguments ---
if len(sys.argv) < 3:
    print("Usage: python extract_ged.py <input_csv> <output_json>")
    sys.exit(1)

INPUT_FILE = sys.argv[1]
OUTPUT_FILE = sys.argv[2]

# --- 2. Region Mapping Configuration ---
REGION_MAP = {
    # Standard Matches
    "Aleppo": "Aleppo",
    "Damascus": "Damascus",
    "Tartus": "Tartus",
    "Idlib": "Idlib",
    "Quneitra": "Quneitra",
    "Homs": "Homs (Hims)",
    "Hims": "Homs (Hims)",
    "Hasaka": "Hasaka (Al Haksa)",
    "Al-Hasakah": "Hasaka (Al Haksa)",
    "Hassakeh": "Hasaka (Al Haksa)",
    "Al Hasakah": "Hasaka (Al Haksa)",
    "Raqqa": "Ar Raqqah",
    "Ar Raqqah": "Ar Raqqah",
    "Ar-Raqqah": "Ar Raqqah",
    "Latakia": "Lattakia",
    "Lattakia": "Lattakia",
    "As Suwayda": "As Suwayda'",
    "As-Suwayda": "As Suwayda'",
    "Sweida": "As Suwayda'",
    "Daraa": "Dar`a",
    "Dar'a": "Dar`a",
    "Dar`a": "Dar`a",
    "Deir ez-Zor": "Dayr Az Zawr",
    "Deir Al-Zor": "Dayr Az Zawr",
    "Dayr Az Zawr": "Dayr Az Zawr",
    "Deir ez Zor": "Dayr Az Zawr",
    "Hama": "Hamah",
    "Hamah": "Hamah",
    "Rif Dimashq": "Rif Dimashq",
    "Rural Damascus": "Rif Dimashq",
}


def process_ucdp_data():
    try:
        print(f"Loading {INPUT_FILE}...")
        df = pd.read_csv(INPUT_FILE, low_memory=False)

        # Normalize columns
        df.columns = df.columns.str.strip().str.lower()

        # Identify columns
        if "best" in df.columns:
            fatality_col = "best"
        elif "best_est" in df.columns:
            fatality_col = "best_est"
        else:
            print("Error: Missing 'best' or 'best_est' column.")
            return

        if "adm_1" in df.columns:
            region_col = "adm_1"
        elif "region" in df.columns:
            region_col = "region"
        else:
            print("Error: Missing 'adm_1' or 'region' column.")
            return

        if "country" in df.columns:
            country_col = "country"
        else:
            country_col = None

        # --- 3. Filtering ---
        print("Filtering data...")

        # Filter by Country
        if country_col:
            df = df[
                df[country_col].astype(str).str.contains("Syria", case=False, na=False)
            ]

        # Filter by Date
        df["date_start"] = pd.to_datetime(df["date_start"], errors="coerce")
        df = df.dropna(subset=["date_start"])

        start_date = pd.Timestamp("2010-01-01")
        end_date = pd.Timestamp("2021-01-01")
        df = df[(df["date_start"] > start_date) & (df["date_start"] < end_date)]

        if df.empty:
            print("Warning: No data found after filtering.")
            return

        # --- 4. Extract ---
        df_clean = df[["date_start", region_col, fatality_col]].copy()
        df_clean = df_clean.rename(
            columns={
                "date_start": "date",
                region_col: "region",
                fatality_col: "fatalities",
            }
        )

        # --- 5. Clean & Map Regions ---

        # Drop NaN regions immediately (Fixes 'nan' warning)
        df_clean = df_clean.dropna(subset=["region"])

        # Remove ' governorate'
        df_clean["region"] = (
            df_clean["region"]
            .astype(str)
            .str.replace(r" governorate", "", case=False, regex=True)
            .str.strip()
        )

        # Apply Mapping
        df_clean["region"] = df_clean["region"].map(lambda x: REGION_MAP.get(x, x))

        # --- 6. Final Formatting ---
        df_clean["date"] = df_clean["date"].dt.strftime("%Y-%m-%d")
        df_clean["fatalities"] = (
            pd.to_numeric(df_clean["fatalities"], errors="coerce").fillna(0).astype(int)
        )

        # --- 7. Validation ---
        unique_regions = df_clean["region"].unique()
        print("\n--- Region Validation ---")
        expected_set = set(REGION_MAP.values())
        for r in unique_regions:
            if r not in expected_set:
                print(f"⚠️ Warning: Region '{r}' not in target list.")

        # --- 8. Export ---
        json_output = df_clean.to_dict(orient="records")
        with open(OUTPUT_FILE, "w") as f:
            json.dump(json_output, f, indent=4)

        print(f"\nSuccess! Saved {len(json_output)} events to {OUTPUT_FILE}")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    process_ucdp_data()
