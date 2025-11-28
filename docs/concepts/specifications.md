---
id: specifications
title: Specifications
sidebar_position: 4
---

# Specifications & Standards

DotRing implements multiple cryptographic specifications and standards.

## Implemented Standards

### RFC 9381 - ECVRF

**Verifiable Random Functions using Elliptic Curves**

- **Status**: Proposed Standard
- **Link**: [RFC 9381](https://www.rfc-editor.org/rfc/rfc9381.html)
- **Implementation**: `IETF_VRF` class

Key features:
- Elliptic curve VRF construction
- Schnorr-style proofs
- Hash-to-curve integration

### RFC 9380 - Hash to Curve

**Hashing to Elliptic Curves**

- **Status**: Proposed Standard
- **Link**: [RFC 9380](https://www.rfc-editor.org/rfc/rfc9380.html)
- **Implementation**: All curves support compliant hash-to-curve

Supported methods:
- `_RO` - Random Oracle (default)
- `_NU` - Non-Uniform

### Bandersnatch VRF Specification

**Pedersen VRF on Bandersnatch Curve**

- **Status**: Draft
- **Link**: [bandersnatch-vrf-spec](https://github.com/davxy/bandersnatch-vrf-spec)
- **Implementation**: `PedersenVRF` class

Key features:
- Pedersen commitment-based key blinding
- Unlinkable proofs
- Deterministic blinding derivation

### Ring Proof Specification

**Ring VRF with KZG Commitments**

- **Status**: Draft  
- **Link**: [ring-proof-spec](https://github.com/davxy/ring-proof-spec)
- **Implementation**: `RingVRF` class

Key features:
- Constant-size ring proofs
- KZG polynomial commitments
- Plonk constraint system

## Test Vectors

DotRing includes test vectors from:

### IETF Test Vectors

Located in `tests/vectors/`:

```
tests/vectors/
├── ietf/
│   ├── bandersnatch.json
│   ├── ed25519.json
│   └── secp256k1.json
```

### ark-vrf Compatibility

Test vectors compatible with [ark-vrf](https://github.com/davxy/ark-vrf) Rust implementation:

```python
# Cross-validate with ark-vrf
from dot_ring import Bandersnatch, IETF_VRF

# Test vector from ark-vrf
sk = bytes.fromhex("...")
alpha = bytes.fromhex("...")
expected_proof = bytes.fromhex("...")

proof = IETF_VRF[Bandersnatch].prove(alpha, sk, b'')
assert proof.to_bytes() == expected_proof
```

## Curve Specifications

### Bandersnatch

- **Type**: Twisted Edwards
- **Defined over**: BLS12-381 scalar field
- **Prime Field**: `p = 0x73eda753...00000001` (BLS12-381 scalar field)
- **Order**: `q = 0x1cfb69d4...876e7e1`
- **Cofactor**: 4
- **Edwards a**: -5
- **Spec**: [Bandersnatch (MSZ21)](https://eprint.iacr.org/2021/1152)

### Ed25519

- **Type**: Twisted Edwards
- **RFC**: [RFC 8032](https://www.rfc-editor.org/rfc/rfc8032.html)
- **Field**: $\mathbb{F}_p$ where $p = 2^{255} - 19$
- **Order**: $q \approx 2^{252}$

### secp256k1

- **Type**: Short Weierstrass
- **Spec**: [SEC 2](https://www.secg.org/sec2-v2.pdf)
- **Field**: 256-bit prime field
- **Used by**: Bitcoin, Ethereum

### BLS12-381

- **Type**: Pairing-friendly
- **Spec**: [BLS12-381](https://electriccoin.co/blog/new-snark-curve/)
- **Groups**: G1 (48 bytes), G2 (96 bytes)
- **Used for**: KZG commitments, BLS signatures

## Cryptographic Primitives

### Hash Functions

| Usage | Algorithm |
|-------|-----------|
| VRF Challenge | SHA-512 |
| Output Hash | SHA-256 |
| Fiat-Shamir | Keccak256 |
| Hash-to-Curve | SHA-256/SHA-512 |

### Pairing Operations

Ring VRF uses BLS12-381 pairings via [blst](https://github.com/supranational/blst):

```python
# blst provides:
# - Fast pairing computation
# - G1/G2 point operations
# - Scalar multiplication
```

## Compliance Testing

### Run Specification Tests

```bash
# IETF VRF tests
pytest tests/test_ietf/ -v

# Pedersen VRF tests
pytest tests/test_pedersen/ -v

# Ring VRF tests
pytest tests/test_ring_vrf/ -v

# Hash-to-curve tests
pytest tests/test_h2c_suites/ -v
```

### Cross-Implementation Testing

DotRing proofs are compatible with:

| Implementation | Language | Compatibility |
|----------------|----------|---------------|
| ark-vrf | Rust | ✅ Full |
| w3f-ring-proof | Rust | ✅ Full |

## Security Considerations

### Trusted Setup

Ring VRF uses powers of tau from:
- **Ceremony**: Zcash Powers of Tau
- **Participants**: 1000+
- **Security**: Secure if ≥1 honest participant

### Constant-Time Operations

All secret-dependent operations use constant-time implementations to prevent timing attacks.

### Random Number Generation

Secret keys should be generated using cryptographically secure RNG:

```python
import secrets
secret_key = secrets.token_bytes(32)  # ✅ Secure

import random
secret_key = random.randbytes(32)  # ❌ NOT secure for crypto
```

## Version Compatibility

| DotRing Version | Python | ark-vrf | w3f-ring-proof |
|-----------------|--------|---------|----------------|
| 0.1.x | 3.12+ | 0.5.x | 0.1.x |

## References

### Papers

1. **VRF**: Micali, Rabin, Vadhan (1999) - "Verifiable Random Functions"
2. **Pedersen**: Pedersen (1992) - "Non-Interactive and Information-Theoretic Secure Verifiable Secret Sharing"
3. **KZG**: Kate, Zaverucha, Goldberg (2010) - "Constant-Size Commitments to Polynomials"
4. **Plonk**: Gabizon et al. (2019) - "PLONK: Permutations over Lagrange-bases"
5. **Ring VRF**: BCGSV23 - Ring VRF paper

### Implementations

- [ark-vrf](https://github.com/davxy/ark-vrf) - Rust reference implementation
- [w3f-ring-proof](https://github.com/w3f/ring-proof) - W3F Rust implementation
- [blst](https://github.com/supranational/blst) - BLS12-381 library
