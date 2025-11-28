---
id: intro
title: Introduction
slug: /
---

# DotRing

**DotRing** is a Python library for generating and verifying cryptographic proofs using Verifiable Random Functions (VRFs). It provides implementations of three VRF schemes designed for blockchain and privacy-preserving applications.

## Features

- **IETF VRF** - Standards-compliant VRF following [RFC 9381](https://www.rfc-editor.org/rfc/rfc9381.html)
- **Pedersen VRF** - Privacy-enhanced VRF with blinded public keys
- **Ring VRF** - Anonymous membership proofs using ring signatures and KZG commitments
- **18 Elliptic Curves** - Including Bandersnatch, Ed25519, secp256k1, BLS12-381, and more
- **High Performance** - Cython-optimized field arithmetic and blst bindings for pairings

## Installation

```bash
pip install dot-ring
```

## Quick Start

```python
from dot_ring import Bandersnatch, IETF_VRF, PedersenVRF, RingVRF

# Generate a secret key (32 bytes)
secret_key = bytes.fromhex('3d6406500d4009fdf2604546093665911e753f2213570a29521fd88bc30ede18')

# Input data
alpha = b'my input data'
additional_data = b''

# IETF VRF - Standard verifiable random function
proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)
is_valid = proof.verify(public_key, alpha, additional_data)
print(f"IETF VRF valid: {is_valid}")  # True

# Pedersen VRF - Privacy-enhanced with blinded public key
ped_proof = PedersenVRF[Bandersnatch].prove(alpha, secret_key, additional_data)
is_valid = ped_proof.verify(alpha, additional_data)
print(f"Pedersen VRF valid: {is_valid}")  # True
```

## VRF Schemes

| Scheme | Use Case | Privacy Level |
|--------|----------|---------------|
| **IETF VRF** | Standard randomness beacon, lottery | Public key visible |
| **Pedersen VRF** | Enhanced privacy applications | Public key blinded |
| **Ring VRF** | Anonymous membership proofs | Full anonymity within ring |

## Next Steps

- [Installation Guide](/getting-started/installation) - Detailed setup instructions
- [Basic Concepts](/getting-started/concepts) - Understand VRF fundamentals
- [API Reference](/api/ietf-vrf) - Complete method documentation
- [Tutorials](/guides/ietf-tutorial) - Step-by-step guides