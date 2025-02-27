#!/bin/bash
# Install Python dependencies
cd src
pip install -r requirements.txt

cd ..

# Install Node.js dependencies
cd frontend/text-to-calendar
npm install
cd ../..