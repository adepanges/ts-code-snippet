#!/bin/bash
# Configuration
TMP_DIR="tmp"

# rm -rfd $TMP_DIR extracts
# mkdir -p extracts artifacts "$TMP_DIR"

git clone https://github.com/adepanges/teamretro-mcp-server $TMP_DIR

set DATA_DIR=$extracts

# lsif-tsc -p $TMP_DIR/tsconfig.json --stdout > extracts/index.lsif

# Convert LSIF index to qdrant snippets (JavaScript version)
node src/convert-lsif-index.js
