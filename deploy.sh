#!/bin/bash
echo "Deploying to GitHub Pages..."
git add .
git commit -m "Deploy to GitHub Pages" || true
git push origin main --force
echo "Done! Site will be available at:"
echo "https://miau-i-am-a-cat.github.io/kycek-studios-website/"
