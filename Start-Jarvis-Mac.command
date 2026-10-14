#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js is missing. Install the latest LTS from https://nodejs.org, then try again.\n'
  printf 'Press Enter to close... '
  read -r _
  exit 1
fi
node scripts/launch.mjs
status=$?
if [ "$status" -ne 0 ]; then
  printf 'JARVIS could not start. Read the instructions above, then press Enter to close... '
  read -r _
fi
exit "$status"
