#!/bin/bash

# Install Python dependencies
cd src/backend
pip install -r requirements.txt

cd ..

# Install Node.js dependencies
cd frontend
npm install
cd ../..