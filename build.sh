#!/bin/bash

#  make sure to start the data api server first
# to make script excutable run `chmod u+x build.sh`
pnpm run build
python3 prepare_assets.py
