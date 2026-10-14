#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js is missing. Install the latest LTS from https://nodejs.org, then try again.\n'
  exit 1
fi
exec node scripts/launch.mjs
