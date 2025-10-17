# Jupyter Environment Setup

This directory contains a self-contained Jupyter environment set up with uv.

## Quick Start

1. **Install dependencies**: `./setup.sh` (already done)
2. **Start Jupyter Lab**: `./start_jupyter.sh`
3. **Start Jupyter Notebook**: `./start_notebook.sh`
4. **Check environment**: `./env_info.sh`

## What's Included

### Python Packages
- **Jupyter**: jupyterlab, jupyter, ipykernel
- **Data Science**: numpy, pandas, matplotlib, seaborn, plotly
- **Web Scraping**: requests, beautifulsoup4, lxml
- **Development**: black, isort, flake8, mypy
- **Utilities**: ipywidgets, tqdm

### Configuration
- **Jupyter**: Optimized settings in `.jupyter/`
- **VSCode**: Python and Jupyter integration in `.vscode/`
- **IPython Kernel**: Project-specific kernel installed

### Directory Structure
```
.
├── notebooks/          # Jupyter notebooks
├── .jupyter/           # Jupyter configuration
├── .vscode/            # VSCode settings
├── .venv/              # Python virtual environment (uv managed)
├── start_jupyter.sh    # Start Jupyter Lab
├── start_notebook.sh   # Start Jupyter Notebook
└── env_info.sh         # Environment information
```

## Usage

### VSCode Integration
- Open this directory in VSCode
- Install recommended extensions when prompted
- Open `.ipynb` files directly in VSCode
- Use `Ctrl+Shift+P` → "Jupyter: Select Interpreter" to choose the project kernel

### Command Line
```bash
# Start Jupyter Lab (recommended)
./start_jupyter.sh

# Start classic Jupyter Notebook
./start_notebook.sh

# Check installed packages
./env_info.sh

# Run Python scripts
uv run python script.py

# Install additional packages
uv add package_name
```

### Jupyter Access
- **URL**: http://localhost:8888
- **Token**: None (disabled for development)
- **Kernel**: Python (markdown-formatter)

## Customization

### Add Packages
```bash
uv add package_name
```

### Jupyter Settings
Edit `.jupyter/jupyter_lab_config.py` or `.jupyter/jupyter_notebook_config.py`

### VSCode Settings
Edit `.vscode/settings.json`

## Troubleshooting

### Kernel Issues
```bash
# Reinstall kernel
uv run python -m ipykernel install --user --name="$(basename $(pwd))" --display-name="Python ($(basename $(pwd)))"
```

### Package Issues
```bash
# Sync environment
uv sync

# Check environment
./env_info.sh
```
