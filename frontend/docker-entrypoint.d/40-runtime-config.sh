#!/bin/sh
set -eu

envsubst '${MEMORY_UPLOAD_MODE} ${MEMORY_UPLOAD_OPEN_AT}' \
  < /usr/share/nginx/html/runtime-config.template.js \
  > /usr/share/nginx/html/runtime-config.js
