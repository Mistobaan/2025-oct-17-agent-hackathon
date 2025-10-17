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
