#!/usr/bin/env python3
import csv
import json
import sys


def extract_gdp_data(input_csv, output_json, country_name=None):
    try:
        with open(input_csv, "r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)

            # Get all fieldnames to identify year columns
            fieldnames = reader.fieldnames

            # Year columns are numeric strings
            year_columns = [
                col for col in fieldnames if col.isdigit() and len(col) == 4
            ]
            year_columns.sort()

            data_by_country = {}

            for row in reader:
                # Only process GDP rows
                if row.get("Indicator Name") != "GDP (current US$)":
                    continue

                country = row.get("Country Name")

                # Skip if filtering by country and this isn't it
                if country_name and country != country_name:
                    continue

                # Extract year-value pairs
                gdp_data = []
                for year in year_columns:
                    value = row.get(year, "").strip()

                    # Skip empty values
                    if not value:
                        continue

                    try:
                        gdp_value = float(value)
                        gdp_data.append(
                            {"year": f"{year}-01-01", "gdp": gdp_value}
                        )
                    except ValueError:
                        # Skip non-numeric values
                        continue

                if gdp_data:
                    data_by_country[country] = gdp_data

        # Determine output format
        if country_name and country_name in data_by_country:
            # Single country - output as array
            output_data = data_by_country[country_name]
        elif country_name:
            print(f"Error: Country '{country_name}' not found in CSV", file=sys.stderr)
            return False
        else:
            # All countries - output as object with country names as keys
            output_data = data_by_country

        # Write JSON file
        with open(output_json, "w", encoding="utf-8") as jsonfile:
            json.dump(output_data, jsonfile, indent=2)

        # Print summary
        if isinstance(output_data, list):
            print(
                f"✓ Extracted {len(output_data)} GDP data points for {country_name}"
            )
            print(
                f"  Years: {output_data[0]['year'].split('-')[0]} to {output_data[-1]['year'].split('-')[0]}"
            )
        else:
            total_points = sum(len(v) for v in output_data.values())
            print(
                f"✓ Extracted {len(output_data)} countries with {total_points} GDP data points"
            )

        print(f"✓ Output saved to: {output_json}")
        return True

    except FileNotFoundError:
        print(f"Error: Input file '{input_csv}' not found", file=sys.stderr)
        return False
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return False


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    country = "Syrian Arab Republic"

    success = extract_gdp_data(input_file, output_file, country)
    sys.exit(0 if success else 1)
