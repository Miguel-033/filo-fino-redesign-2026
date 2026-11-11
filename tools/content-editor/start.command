#!/bin/sh
set -eu
cd "$(dirname "$0")"
PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export PATH
for tool in node ffmpeg ffprobe; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf 'Требуется %s. Если установлен Homebrew, выполните: brew install node ffmpeg\n' "$tool"
    exit 1
  fi
done
exec node server.mjs --open
