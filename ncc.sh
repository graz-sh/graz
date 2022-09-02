#!/usr/bin/env bash
ncc build node_modules/p-map/index.js -o packages/graz/compiled/p-map/ -m
cp node_modules/p-map/index.d.ts packages/graz/compiled/p-map/
mv packages/graz/compiled/p-map/index.js packages/graz/compiled/p-map/index.mjs
rm -rf packages/graz/compiled/p-map/package.json
