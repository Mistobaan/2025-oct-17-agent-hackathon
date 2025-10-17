#!/bin/bash

# setup.sh - Self-contained Jupyter and VSCode environment setup using uv
# Requirements: Only requires uv to be installed
# Usage: ./setup.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if uv is installed
check_uv() {
    if ! command -v uv &> /dev/null; then
        log_error "uv is not installed. Please install uv first:"
        log_info "curl -LsSf https://astral.sh/uv/install.sh | sh"
        exit 1
    fi
    log_success "uv is installed: $(uv --version)"
}

# Create project structure
create_project_structure() {
    log_info "Creating project structure..."

    # Create directories
    mkdir -p notebooks
    mkdir -p .jupyter
    mkdir -p .vscode

    log_success "Project structure created"
}

# Initialize uv project and install dependencies
setup_python_environment() {
    log_info "Setting up Python environment with uv..."

    # Initialize uv project if pyproject.toml doesn't exist
    if [ ! -f "pyproject.toml" ]; then
        uv init --no-readme --python 3.11
        log_success "Initialized uv project"
    fi

    # Install core Jupyter dependencies
    log_info "Installing Jupyter and scientific computing packages..."
    uv add jupyter jupyterlab ipykernel
    uv add numpy pandas matplotlib seaborn plotly
    uv add requests beautifulsoup4 lxml
    uv add black isort flake8 mypy
    uv add ipywidgets tqdm

    log_success "Python packages installed"
}

# Configure Jupyter settings
setup_jupyter_config() {
    log_info "Configuring Jupyter settings..."

    # Create Jupyter config directory
    mkdir -p .jupyter

    # Generate Jupyter config
    cat > .jupyter/jupyter_lab_config.py << 'EOF'
# Jupyter Lab Configuration
c = get_config()

# Server settings
c.ServerApp.ip = '127.0.0.1'
c.ServerApp.port = 8888
c.ServerApp.open_browser = False
c.ServerApp.token = ''
c.ServerApp.password = ''
c.ServerApp.allow_origin = '*'
c.ServerApp.allow_remote_access = True

# Lab settings
c.LabApp.collaborative = True
c.LabApp.dev_mode = False

# Content manager
c.ContentsManager.allow_hidden = True

# Kernel settings
c.MappingKernelManager.default_kernel_name = 'python3'

# Extension settings
c.LabServerApp.blacklist_uris = []
c.LabServerApp.whitelist_uris = []
EOF

    # Create Jupyter notebook config
    cat > .jupyter/jupyter_notebook_config.py << 'EOF'
# Jupyter Notebook Configuration
c = get_config()

# Server settings
c.NotebookApp.ip = '127.0.0.1'
c.NotebookApp.port = 8888
c.NotebookApp.open_browser = False
c.NotebookApp.token = ''
c.NotebookApp.password = ''
c.NotebookApp.allow_origin = '*'
c.NotebookApp.allow_remote_access = True

# Content settings
c.ContentsManager.allow_hidden = True
c.NotebookApp.contents_manager_class = 'notebook.services.contents.largefilemanager.LargeFileManager'

# Kernel settings
c.MappingKernelManager.default_kernel_name = 'python3'
EOF

    log_success "Jupyter configuration created"
}

# Setup IPython kernel
setup_ipython_kernel() {
    log_info "Setting up IPython kernel..."

    # Install kernel in the virtual environment
    uv run python -m ipykernel install --user --name="$(basename $(pwd))" --display-name="Python ($(basename $(pwd)))"

    log_success "IPython kernel installed"
}

# Configure VSCode settings
setup_vscode_config() {
    log_info "Configuring VSCode settings..."

    # Create VSCode settings
    cat > .vscode/settings.json << 'EOF'
{
    "python.defaultInterpreterPath": "./.venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "python.formatting.provider": "black",
    "python.formatting.blackArgs": ["--line-length", "88"],
    "python.sortImports.args": ["--profile", "black"],
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "jupyter.jupyterServerType": "local",
    "jupyter.notebookFileRoot": "${workspaceFolder}",
    "jupyter.defaultKernel": "Python (markdown-formatter)",
    "jupyter.alwaysTrustNotebooks": true,
    "jupyter.askForKernelRestart": false,
    "jupyter.interactiveWindow.creationMode": "perFile",
    "jupyter.interactiveWindow.textEditor.executeSelection": true,
    "jupyter.interactiveWindow.textEditor.magicCommandsAsComments": true,
    "jupyter.debugging.enabled": true,
    "jupyter.variableExplorerExclude": "module;function;builtin_function_or_method",
    "notebook.cellToolbarLocation": {
        "default": "right",
        "jupyter-notebook": "left"
    },
    "notebook.showCellStatusBar": "visible",
    "notebook.compactView": false,
    "files.associations": {
        "*.ipynb": "jupyter-notebook"
    }
}
EOF

    # Create launch configuration for debugging
    cat > .vscode/launch.json << 'EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "${file}",
            "console": "integratedTerminal",
            "python": "./.venv/bin/python"
        },
        {
            "name": "Python: Jupyter Notebook",
            "type": "python",
            "request": "launch",
            "module": "jupyter",
            "args": ["notebook", "--config=.jupyter/jupyter_notebook_config.py"],
            "console": "integratedTerminal",
            "python": "./.venv/bin/python"
        }
    ]
}
EOF

    # Create recommended extensions
    cat > .vscode/extensions.json << 'EOF'
{
    "recommendations": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "ms-toolsai.jupyter",
        "ms-python.black-formatter",
        "ms-python.isort",
        "ms-python.flake8",
        "ms-python.mypy-type-checker",
        "njpwerner.autodocstring",
        "charliermarsh.ruff"
    ]
}
EOF

    log_success "VSCode configuration created"
}

# Create sample notebook
create_sample_notebook() {
    log_info "Creating sample notebook..."

    cat > notebooks/sample.ipynb << 'EOF'
{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# Sample Jupyter Notebook\n",
    "\n",
    "This is a sample notebook to test your setup."
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "import sys\n",
    "import numpy as np\n",
    "import pandas as pd\n",
    "import matplotlib.pyplot as plt\n",
    "\n",
    "print(f\"Python version: {sys.version}\")\n",
    "print(f\"NumPy version: {np.__version__}\")\n",
    "print(f\"Pandas version: {pd.__version__}\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Sample data visualization\n",
    "x = np.linspace(0, 10, 100)\n",
    "y = np.sin(x)\n",
    "\n",
    "plt.figure(figsize=(10, 6))\n",
    "plt.plot(x, y, 'b-', linewidth=2, label='sin(x)')\n",
    "plt.xlabel('x')\n",
    "plt.ylabel('sin(x)')\n",
    "plt.title('Sample Plot')\n",
    "plt.legend()\n",
    "plt.grid(True, alpha=0.3)\n",
    "plt.show()"
   ]
  },
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "## Data Analysis Example"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Create sample DataFrame\n",
    "data = {\n",
    "    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],\n",
    "    'age': [25, 30, 35, 28],\n",
    "    'score': [85, 92, 78, 88]\n",
    "}\n",
    "\n",
    "df = pd.DataFrame(data)\n",
    "print(\"Sample DataFrame:\")\n",
    "print(df)\n",
    "print(f\"\\nMean age: {df['age'].mean():.1f}\")\n",
    "print(f\"Mean score: {df['score'].mean():.1f}\")"
   ]
  }
 ],
 "metadata": {
  "kernels": [
   {
    "display_name": "Python (markdown-formatter)",
    "language": "python",
    "name": "markdown-formatter"
   }
  ],
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.11.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}
EOF

    log_success "Sample notebook created"
}

# Create utility scripts
create_utility_scripts() {
    log_info "Creating utility scripts..."

    # Create start script
    cat > start_jupyter.sh << 'EOF'
#!/bin/bash
# Start Jupyter Lab
echo "Starting Jupyter Lab..."
uv run jupyter lab --config=.jupyter/jupyter_lab_config.py --notebook-dir=notebooks
EOF
    chmod +x start_jupyter.sh

    # Create notebook script
    cat > start_notebook.sh << 'EOF'
#!/bin/bash
# Start Jupyter Notebook
echo "Starting Jupyter Notebook..."
uv run jupyter notebook --config=.jupyter/jupyter_notebook_config.py --notebook-dir=notebooks
EOF
    chmod +x start_notebook.sh

    # Create environment info script
    cat > env_info.sh << 'EOF'
#!/bin/bash
# Display environment information
echo "=== Environment Information ==="
echo "uv version: $(uv --version)"
echo "Python version: $(uv run python --version)"
echo ""
echo "=== Installed Packages ==="
uv run pip list
echo ""
echo "=== Jupyter Kernels ==="
uv run jupyter kernelspec list
EOF
    chmod +x env_info.sh

    log_success "Utility scripts created"
}

# Create README for the setup
create_readme() {
    log_info "Creating setup README..."

    cat > JUPYTER_SETUP.md << 'EOF'
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
EOF

    log_success "README created"
}

# Main setup function
main() {
    log_info "Starting Jupyter environment setup..."

    check_uv
    create_project_structure
    setup_python_environment
    setup_jupyter_config
    setup_ipython_kernel
    setup_vscode_config
    create_sample_notebook
    create_utility_scripts
    create_readme

    log_success "Setup completed successfully!"
    log_info ""
    log_info "Next steps:"
    log_info "1. Open VSCode in this directory"
    log_info "2. Install recommended extensions when prompted"
    log_info "3. Run './start_jupyter.sh' to start Jupyter Lab"
    log_info "4. Open 'notebooks/sample.ipynb' to test the setup"
    log_info ""
    log_info "For more information, see JUPYTER_SETUP.md"
}

# Run main function
main "$@"