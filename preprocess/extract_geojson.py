#!/usr/bin/env python3

import json
import sys

if len(sys.argv) != 4:
    print("Usage: python extract_geojson.py <input_file> <output_file> <ids>")
    sys.exit(1)

input_file = sys.argv[1]
output_file = sys.argv[2]
ids = set(sys.argv[3].split(","))

with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

filtered_features = [
    feature
    for feature in data["features"]
    if str(feature["properties"]["iso_a3"]) in ids
]
filtered_geojson = {"type": "FeatureCollection", "features": filtered_features}
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(filtered_geojson, f, ensure_ascii=False, indent=2)
print(f"Extracted {len(filtered_features)} features to {output_file}")
