#!/bin/bash
# Start Jupyter Notebook
echo "Starting Jupyter Notebook..."
uv run jupyter notebook --config=.jupyter/jupyter_notebook_config.py --notebook-dir=notebooks
