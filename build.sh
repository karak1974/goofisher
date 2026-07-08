#!/bin/bash
echo "Building Goofisher $(awk -F'"' '/"version"/ {print $4}' src/manifest.json)"
rm -rf artifacts
web-ext  --source-dir src --artifacts-dir artifacts build
