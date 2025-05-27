#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$(dirname "$(realpath "$0")")"

# Run start.sh in that directory
"$SCRIPT_DIR/start.sh" &