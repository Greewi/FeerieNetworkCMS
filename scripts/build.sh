#!/bin /sh

# Creating paths
mkdir -p dist
mkdir -p dist/data
mkdir -p dist/cache

cp src/.htaccess* dist/

# Copying PHP
cp -rf src/*.php src/php dist/

# Building JS
cp -rf src/js dist/
echo "TODO : Webpack ?"

# Compiling CSS
cp -rf src/templates dist/
sass dist/templates/feerieNetwork/style.scss dist/templates/feerieNetwork/style.css
