---
id: quickstart
title: Quick Start
sidebar_position: 3
---

# Quick Start

Get up and running with DotRing in 5 minutes.

## Installation

```bash
pip install dot-ring
```

## Example 1: IETF VRF

Generate and verify a standard VRF proof:

```python
from dot_ring import Bandersnatch, IETF_VRF
import secrets

# Generate a random secret key (32 bytes)
secret_key = secrets.token_bytes(32)

# Derive the public key
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)

# Input data
alpha = b'lottery-round-42'
additional_data = b''

# Generate proof
proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)

# Verify proof
is_valid = proof.verify(public_key, alpha, additional_data)
print(f"Valid: {is_valid}")  # True

# Get the random output
random_output = IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point)
print(f"Random output: {random_output.hex()}")
```

## Example 2: Pedersen VRF

Privacy-enhanced VRF with blinded public key:

```python
from dot_ring import Bandersnatch, PedersenVRF
import secrets

secret_key = secrets.token_bytes(32)
alpha = b'anonymous-lottery'
additional_data = b''

# Generate proof (public key is blinded inside)
proof = PedersenVRF[Bandersnatch].prove(alpha, secret_key, additional_data)

# Verify - no public key needed!
is_valid = proof.verify(alpha, additional_data)
print(f"Valid: {is_valid}")  # True

# Get random output
output = PedersenVRF[Bandersnatch].proof_to_hash(proof.output_point)
print(f"Output: {output.hex()}")
```

## Example 3: Ring VRF

Anonymous membership proof within a ring:

```python
from dot_ring import Bandersnatch, RingVRF
import secrets

# Your secret key
my_secret_key = secrets.token_bytes(32)
my_public_key = RingVRF[Bandersnatch].get_public_key(my_secret_key)

# Create a ring of public keys (yours + others)
ring_keys = [my_public_key]
for _ in range(7):  # Add 7 other members
    sk = secrets.token_bytes(32)
    pk = RingVRF[Bandersnatch].get_public_key(sk)
    ring_keys.append(pk)

# Build ring commitment
ring_root = RingVRF[Bandersnatch].construct_ring_root(ring_keys)

# Generate anonymous proof
alpha = b'block-selection'
additional_data = b''
proof = RingVRF[Bandersnatch].prove(
    alpha, additional_data, my_secret_key, my_public_key, ring_keys
)

# Verify - verifier only knows the ring, not which member signed
is_valid = proof.verify(alpha, additional_data, ring_root)
print(f"Valid: {is_valid}")  # True
```

## Serialization

All proofs can be serialized for storage or transmission:

```python
# Serialize to bytes
proof_bytes = proof.to_bytes()
print(f"Proof size: {len(proof_bytes)} bytes")

# Deserialize
restored_proof = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)

# Verify the restored proof
is_valid = restored_proof.verify(public_key, alpha, additional_data)
```

## Using Different Curves

DotRing supports 18 elliptic curves:

```python
from dot_ring import Ed25519, Secp256k1, P256, IETF_VRF

# Ed25519 (Edwards curve)
proof_ed = IETF_VRF[Ed25519].prove(alpha, secret_key, additional_data)

# secp256k1 (Bitcoin/Ethereum)
proof_secp = IETF_VRF[Secp256k1].prove(alpha, secret_key, additional_data)

# P-256 (NIST curve)
proof_p256 = IETF_VRF[P256].prove(alpha, secret_key, additional_data)
```

## Next Steps

- [API Reference](/api/ietf-vrf) - Detailed method documentation
- [IETF VRF Tutorial](/guides/ietf-tutorial) - In-depth guide
- [Curves Reference](/api/curves) - All supported curves
