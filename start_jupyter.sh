#!/bin/bash
# Start Jupyter Lab
echo "Starting Jupyter Lab..."
uv run jupyter lab --config=.jupyter/jupyter_lab_config.py --notebook-dir=notebooks
