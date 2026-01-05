#!/usr/bin/env python3

import pandas as pd
import json
import pycountry
from pycountry_convert import country_alpha2_to_continent_code
import sys

if len(sys.argv) < 4:
    print("Usage: python extract_unhcr.py <input_file> <output_file> <origin_filter>")
    sys.exit(1)


INPUT_FILE = sys.argv[1]
OUTPUT_FILE = sys.argv[2]
ORIGIN_FILTER = sys.argv[3]


# Convert ISO3 (3-letter) to Continent
def get_continent_key(iso3_code):
    """
    Converts ISO3 code (e.g. 'DEU') to a readable continent key (e.g. 'europe').
    """
    try:
        # 1. Convert ISO3 to ISO2
        country = pycountry.countries.get(alpha_3=iso3_code)
        if not country:
            return "other"

        iso2 = country.alpha_2

        # 2. Convert ISO2 to Continent Code (EU, AS, NA, AF, SA, OC)
        continent_code = country_alpha2_to_continent_code(iso2)

        # 3. Map to readable keys
        mapping = {
            "EU": "europe",
            "AS": "other",
            "NA": "other",  # North America
            "SA": "other",  # South America
            "AF": "africa",
            "OC": "other",
            "AN": "other",  # Antarctica
        }
        return mapping.get(continent_code, "other")
    except Exception as e:
        return "other"


def process_data():
    print(f"Loading {INPUT_FILE}...")
    df = pd.read_csv(INPUT_FILE)

    # Ensure numeric columns are actually numbers (handle missing values)
    cols_to_sum = ["Refugees", "Asylum-seekers", "IDPs"]
    for col in cols_to_sum:
        if df[col].dtype == object:
            df[col] = df[col].str.replace(",", "")
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df = df[df["Country of Origin ISO"] == ORIGIN_FILTER]
    df["Total_External"] = df["Refugees"] + df["Asylum-seekers"]

    # We exclude Syria itself (IDPs) from the "Top Host" ranking
    external_df = df[df["Country of Asylum ISO"] != "SYR"]

    # Group by Country ISO to find the all-time largest hosts
    top_hosts = (
        external_df.groupby("Country of Asylum ISO")["Total_External"].sum().nlargest(5)
    )
    top_5_isos = top_hosts.index.tolist()

    print(f"Top 5 Host Countries Found: {top_5_isos}")

    years = sorted(df["Year"].unique())
    final_data = []

    for year in years:
        year_df = df[df["Year"] == year]

        entry = {
            "date": f"{year}-01-01",
            "year": int(year),
            "idp": 0,
            "totalRefugees": 0,
            **{
                pycountry.countries.get(alpha_3=iso).name.lower().replace(" ", "_"): 0
                for iso in top_5_isos
            },
            "europe": 0,
            "africa": 0,
            "other": 0,
        }

        idp_rows = year_df[year_df["Country of Asylum ISO"] == "SYR"]
        entry["idp"] = int(idp_rows["IDPs"].sum())

        external_rows = year_df[year_df["Country of Asylum ISO"] != "SYR"]

        for _, row in external_rows.iterrows():
            count = row["Total_External"]
            iso = row["Country of Asylum ISO"]

            if iso in top_5_isos:
                target_key = (
                    pycountry.countries.get(alpha_3=iso).name.lower().replace(" ", "_")
                )
                entry[target_key] += int(count)

            else:
                continent_key = get_continent_key(iso)
                entry[continent_key] += int(count)

        # Sum up all keys except date, year, and idp
        entry["totalRefugees"] = sum(
            v
            for k, v in entry.items()
            if k not in ["date", "year", "idp"] and isinstance(v, (int, float))
        )

        final_data.append(entry)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(final_data, f, indent=4)

    print(f"Successfully converted. Saved to {OUTPUT_FILE}")
    print("Copy the JSON content into your React component or load it dynamically.")


if __name__ == "__main__":
    process_data()
