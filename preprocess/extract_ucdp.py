#!/usr/bin/env python3

import pandas as pd
import json
import sys


def extract_ucdp_data(input_file, output_file):
    # Read the CSV file
    try:
        df = pd.read_csv(input_file)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # 1. Normalize Date
    df["date_start"] = pd.to_datetime(df["date_start"])

    start_date = pd.Timestamp("2010-07-01")
    end_date = pd.Timestamp("2021-01-01")
    df = df[(df["date_start"] >= start_date) & (df["date_start"] <= end_date)]

    if df.empty:
        print("Warning: No data found.")
        return

    # Filter out country-level aggregation records (where adm_1 is null)
    # These are yearly summaries that don't belong to a specific region
    df = df[df["adm_1"].notna()]

    if df.empty:
        print("Warning: No regional data found after filtering aggregations.")
        return

    # 2. Normalize Regions
    def normalize_region(adm_1):
        if pd.isna(adm_1):
            return "Other"

        val = str(adm_1).lower()

        if "aleppo" in val or "halab" in val:
            return "Aleppo"
        elif "damascus" in val or "dimashq" in val:
            return "Damascus"
        elif "idlib" in val or "edleb" in val:
            return "Idlib"
        elif "daraa" in val or "dara" in val:
            return "Daraa"
        elif "homs" in val or "hims" in val:
            return "Homs"
        else:
            return "Other"

    df["normalized_region"] = df["adm_1"].apply(normalize_region)

    # 3. Aggregate Data by Month
    # Group by the start of the month
    df["month_date"] = df["date_start"].dt.to_period("M").dt.to_timestamp()

    output_data = []

    # Get all unique months and sort them
    unique_months = sorted(df["month_date"].unique())

    # Define the specific keys the React component looks for
    target_regions = ["Aleppo", "Damascus", "Idlib", "Daraa", "Homs", "Other"]

    for month in unique_months:
        # Filter data for this specific month
        month_data = df[df["month_date"] == month]

        # Create the base entry object
        entry = {"date": month.isoformat(), "month": month.strftime("%B %Y")}

        # Calculate totals for each region for this month
        for region in target_regions:
            region_data = month_data[month_data["normalized_region"] == region]

            # Sum civilians (deaths_civilians)
            civilian_sum = region_data["deaths_civilians"].sum()

            # Sum combatants (deaths_a + deaths_b)
            combatant_sum = (
                region_data["deaths_a"].sum() + region_data["deaths_b"].sum()
            )

            entry[region] = {
                "Civilian": int(civilian_sum),
                "Combatant": int(combatant_sum),
            }

        output_data.append(entry)

    # Write to JSON file
    try:
        with open(output_file, "w") as f:
            json.dump(output_data, f, indent=2)
        print(
            f"Successfully processed {len(df)} rows into {len(output_data)} monthly entries (2011-2020)."
        )
        print(f"Output saved to: {output_file}")
    except Exception as e:
        print(f"Error writing JSON: {e}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 extract_ucdp.py <input_csv> <output_json>")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    extract_ucdp_data(input_path, output_path)
