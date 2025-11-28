---
id: installation
title: Installation
sidebar_position: 1
---

# Installation

## Requirements

- **Python 3.12+** (Python 3.12 or 3.13 recommended)
- **pip** package manager

## Install from PyPI

The simplest way to install DotRing:

```bash
pip install dot-ring
```

## Verify Installation

```python
import dot_ring
print(dot_ring.__version__)  # 0.1.2
```

Test that all components work:

```python
from dot_ring import Bandersnatch, IETF_VRF

# Generate a test proof
secret_key = bytes(32)  # 32 zero bytes for testing
proof = IETF_VRF[Bandersnatch].prove(b'test', secret_key, b'')
print("Installation successful!")
```

## Dependencies

DotRing automatically installs these dependencies:

| Package | Purpose |
|---------|---------|
| `numpy` | Numerical operations |
| `sympy` | Symbolic mathematics |
| `gmpy2` | Fast arbitrary-precision arithmetic |
| `py-ecc` | Elliptic curve operations |

## Optional: Development Installation

For contributing or running tests:

```bash
git clone https://github.com/chainscore/dot-ring.git
cd dot-ring
pip install -e ".[dev]"
```

Run tests:

```bash
pytest tests/
```

## Platform Support

| Platform | Architecture | Status |
|----------|--------------|--------|
| Linux | x86_64 | ✅ Supported |
| macOS | x86_64 | ✅ Supported |
| macOS | ARM64 (Apple Silicon) | ✅ Supported |
| Windows | x86_64 | ⚠️ Experimental |

## Troubleshooting

### ImportError: blst module not found

The blst bindings are included in the wheel. If you see this error:

```bash
pip install --force-reinstall --no-cache-dir dot-ring
```

### gmpy2 installation fails

On macOS, install GMP first:

```bash
brew install gmp
pip install dot-ring
```

On Ubuntu/Debian:

```bash
sudo apt-get install libgmp-dev
pip install dot-ring
```
