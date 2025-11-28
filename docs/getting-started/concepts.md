---
id: concepts
title: Basic Concepts
sidebar_position: 2
---

# Basic Concepts

Understanding the fundamentals of VRFs and cryptographic proofs.

## What is a VRF?

A **Verifiable Random Function (VRF)** is a cryptographic primitive that produces:

1. **A pseudo-random output** - Deterministic but unpredictable without the secret key
2. **A proof** - Allows anyone to verify the output was correctly computed

```
VRF(secret_key, input) → (output, proof)
```

### Key Properties

| Property | Description |
|----------|-------------|
| **Deterministic** | Same input + key always produces same output |
| **Unpredictable** | Cannot guess output without the secret key |
| **Verifiable** | Anyone can verify the output using the public key |
| **Unique** | Only one valid output exists for each input |

## VRF Components

### Secret Key
A 32-byte random value known only to the prover:

```python
import secrets
secret_key = secrets.token_bytes(32)
```

### Public Key
Derived from the secret key, can be shared publicly:

```python
from dot_ring import Bandersnatch, IETF_VRF

public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)
```

### Input (Alpha)
The data being signed. Can be any bytes:

```python
alpha = b'block-123-slot-456'
```

### Additional Data
Optional context data bound to the proof (VRF-AD):

```python
additional_data = b'my-application-context'
```

### Proof
The cryptographic proof that the output was correctly computed:

```python
proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)
```

### Output Hash
The pseudo-random output derived from the proof:

```python
output_hash = IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point)  # 32 bytes
```

## The Three VRF Schemes

### IETF VRF

The standard VRF following [RFC 9381](https://www.rfc-editor.org/rfc/rfc9381.html):

- ✅ Widely standardized
- ✅ Simple to use
- ❌ Public key is visible to verifier

```python
from dot_ring import Bandersnatch, IETF_VRF

proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)
is_valid = proof.verify(public_key, alpha, additional_data)
```

### Pedersen VRF

Enhanced privacy using Pedersen commitments:

- ✅ Public key is blinded in the proof
- ✅ Verifier cannot link proofs to a specific key
- ❌ Slightly larger proofs

```python
from dot_ring import Bandersnatch, PedersenVRF

proof = PedersenVRF[Bandersnatch].prove(alpha, secret_key, additional_data)
is_valid = proof.verify(alpha, additional_data)  # No public key needed!
```

### Ring VRF

Full anonymity within a ring of public keys:

- ✅ Proves membership in a set without revealing which member
- ✅ Uses KZG polynomial commitments for efficiency
- ❌ Requires pre-computed ring commitment
- ❌ Currently only supports Bandersnatch curve

```python
from dot_ring import Bandersnatch, RingVRF

# Build ring from list of public keys
ring_root = RingVRF[Bandersnatch].construct_ring_root(keys_list)

# Prove membership anonymously
proof = RingVRF[Bandersnatch].prove(alpha, ad, secret_key, my_public_key, keys_list)
is_valid = proof.verify(alpha, ad, ring_root)
```

## Choosing a Scheme

| Use Case | Recommended Scheme |
|----------|-------------------|
| Standard randomness beacon | IETF VRF |
| Lottery / random selection | IETF VRF |
| Privacy-preserving authentication | Pedersen VRF |
| Anonymous voting | Ring VRF |
| Blockchain validator selection | Ring VRF |

## Elliptic Curves

DotRing supports 18 elliptic curves. The most commonly used:

| Curve | Best For |
|-------|----------|
| **Bandersnatch** | Polkadot ecosystem, Ring VRF |
| **Ed25519** | General purpose, widely supported |
| **secp256k1** | Bitcoin/Ethereum compatibility |
| **BLS12-381** | Pairing-based cryptography |

See the [Curves Reference](/api/curves) for the complete list.
