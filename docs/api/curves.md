---
id: curves
title: Curves Reference
sidebar_position: 4
---

# Curves Reference

DotRing supports 18 elliptic curves across multiple families. Each curve has specific use cases and performance characteristics.

## Import

```python
from dot_ring import (
    # Primary curves
    Bandersnatch,
    
    # Edwards curves
    Ed25519, Ed448,
    
    # Montgomery curves
    Curve25519, Curve448,
    
    # NIST curves
    P256, P384, P521, Secp256k1,
    
    # ZK-friendly curves
    JubJub, BabyJubJub,
    
    # BLS12-381 groups
    BLS12_381_G1, BLS12_381_G2,
)
```

## Primary Curves

### Bandersnatch

The recommended curve for Polkadot ecosystem and Ring VRF.

| Property | Value |
|----------|-------|
| Type | Twisted Edwards |
| Field Size | 255 bits |
| Security | ~128 bits |
| Ring VRF | ✅ Supported |

```python
from dot_ring import Bandersnatch, IETF_VRF

proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, ad)
```

**Best for:** Polkadot validators, Ring VRF, privacy applications

---

## Edwards Curves

### Ed25519

The most widely used Edwards curve, standardized in RFC 8032.

| Property | Value |
|----------|-------|
| Type | Twisted Edwards |
| Field Size | 255 bits |
| Security | ~128 bits |
| Ring VRF | ❌ Not supported |

```python
from dot_ring import Ed25519, IETF_VRF

proof = IETF_VRF[Ed25519].prove(alpha, secret_key, ad)
```

**Best for:** General purpose signing, SSH keys, TLS

---

### Ed448

Higher security Edwards curve from RFC 8032.

| Property | Value |
|----------|-------|
| Type | Twisted Edwards |
| Field Size | 448 bits |
| Security | ~224 bits |
| Ring VRF | ❌ Not supported |

```python
from dot_ring import Ed448, IETF_VRF

proof = IETF_VRF[Ed448].prove(alpha, secret_key, ad)
```

**Best for:** High-security applications requiring 224-bit security

---

## Montgomery Curves

### Curve25519

The Montgomery form of Ed25519, commonly used for key exchange.

| Property | Value |
|----------|-------|
| Type | Montgomery |
| Field Size | 255 bits |
| Security | ~128 bits |

```python
from dot_ring import Curve25519, IETF_VRF

proof = IETF_VRF[Curve25519].prove(alpha, secret_key, ad)
```

**Best for:** Key exchange (X25519), interoperability

---

### Curve448

The Montgomery form of Ed448.

| Property | Value |
|----------|-------|
| Type | Montgomery |
| Field Size | 448 bits |
| Security | ~224 bits |

```python
from dot_ring import Curve448, IETF_VRF

proof = IETF_VRF[Curve448].prove(alpha, secret_key, ad)
```

---

## NIST Curves

### P-256 (secp256r1)

NIST standard curve, widely used in enterprise and government.

| Property | Value |
|----------|-------|
| Type | Short Weierstrass |
| Field Size | 256 bits |
| Security | ~128 bits |

```python
from dot_ring import P256, IETF_VRF

proof = IETF_VRF[P256].prove(alpha, secret_key, ad)
```

**Best for:** TLS certificates, government compliance, WebAuthn

---

### P-384 (secp384r1)

Higher security NIST curve.

| Property | Value |
|----------|-------|
| Type | Short Weierstrass |
| Field Size | 384 bits |
| Security | ~192 bits |

```python
from dot_ring import P384, IETF_VRF

proof = IETF_VRF[P384].prove(alpha, secret_key, ad)
```

---

### P-521 (secp521r1)

Highest security NIST curve.

| Property | Value |
|----------|-------|
| Type | Short Weierstrass |
| Field Size | 521 bits |
| Security | ~256 bits |

```python
from dot_ring import P521, IETF_VRF

proof = IETF_VRF[P521].prove(alpha, secret_key, ad)
```

---

### secp256k1

The Bitcoin and Ethereum curve.

| Property | Value |
|----------|-------|
| Type | Short Weierstrass |
| Field Size | 256 bits |
| Security | ~128 bits |

```python
from dot_ring import Secp256k1, IETF_VRF

proof = IETF_VRF[Secp256k1].prove(alpha, secret_key, ad)
```

**Best for:** Bitcoin, Ethereum, blockchain interoperability

---

## ZK-Friendly Curves

### JubJub

ZK-SNARK friendly curve embedded in BLS12-381.

| Property | Value |
|----------|-------|
| Type | Twisted Edwards |
| Field Size | 255 bits |
| Embedded In | BLS12-381 |

```python
from dot_ring import JubJub, IETF_VRF

proof = IETF_VRF[JubJub].prove(alpha, secret_key, ad)
```

**Best for:** Zcash, ZK-SNARK circuits

---

### BabyJubJub

ZK-SNARK friendly curve embedded in BN254.

| Property | Value |
|----------|-------|
| Type | Twisted Edwards |
| Field Size | 251 bits |
| Embedded In | BN254 |

```python
from dot_ring import BabyJubJub, IETF_VRF

proof = IETF_VRF[BabyJubJub].prove(alpha, secret_key, ad)
```

**Best for:** Ethereum ZK rollups, Circom circuits

---

## BLS12-381 Groups

### BLS12-381 G1

First group of the BLS12-381 pairing curve.

| Property | Value |
|----------|-------|
| Type | Short Weierstrass |
| Field Size | 381 bits |
| Point Size | 48 bytes (compressed) |

```python
from dot_ring import BLS12_381_G1, IETF_VRF

proof = IETF_VRF[BLS12_381_G1].prove(alpha, secret_key, ad)
```

**Best for:** BLS signatures, aggregation

---

### BLS12-381 G2

Second group of the BLS12-381 pairing curve.

| Property | Value |
|----------|-------|
| Type | Short Weierstrass (extension field) |
| Field Size | 381 bits |
| Point Size | 96 bytes (compressed) |

```python
from dot_ring import BLS12_381_G2, IETF_VRF

proof = IETF_VRF[BLS12_381_G2].prove(alpha, secret_key, ad)
```

---

## Hash-to-Curve Variants

Many curves support two hash-to-curve methods:

| Suffix | Method | Use Case |
|--------|--------|----------|
| `_RO` | Random Oracle | Default, most secure |
| `_NU` | Non-Uniform | Faster, specific applications |

```python
from dot_ring import Ed25519_RO, Ed25519_NU

# Random Oracle variant (default)
proof_ro = IETF_VRF[Ed25519_RO].prove(alpha, sk, ad)

# Non-Uniform variant
proof_nu = IETF_VRF[Ed25519_NU].prove(alpha, sk, ad)
```

## Curve Comparison

| Curve | Security | Speed | Ring VRF | Use Case |
|-------|----------|-------|----------|----------|
| Bandersnatch | 128-bit | Fast | ✅ | Polkadot, Ring VRF |
| Ed25519 | 128-bit | Fast | ❌ | General purpose |
| secp256k1 | 128-bit | Medium | ❌ | Bitcoin/Ethereum |
| P-256 | 128-bit | Medium | ❌ | Enterprise/TLS |
| BLS12-381 G1 | 128-bit | Slow | ❌ | Pairing-based |

## Choosing a Curve

| Application | Recommended Curve |
|-------------|-------------------|
| Ring VRF / Polkadot | Bandersnatch |
| General signing | Ed25519 |
| Bitcoin/Ethereum | secp256k1 |
| Government/Enterprise | P-256 |
| ZK circuits (Ethereum) | BabyJubJub |
| ZK circuits (Zcash) | JubJub |
| BLS signatures | BLS12-381 G1 |
