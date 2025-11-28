---
id: ietf-vrf
title: IETF VRF
sidebar_position: 1
---

# IETF VRF API Reference

The `IETF_VRF` class implements the standard Verifiable Random Function following [RFC 9381](https://www.rfc-editor.org/rfc/rfc9381.html).

## Import

```python
from dot_ring import IETF_VRF, Bandersnatch
```

## Usage Pattern

All VRF classes use the subscript pattern `VRF[Curve]`:

```python
# Create a curve-specific VRF instance
vrf = IETF_VRF[Bandersnatch]

# Generate proof
proof = vrf.prove(alpha, secret_key, additional_data)
```

## Class Methods

### `prove(alpha, secret_key, additional_data)`

Generate a VRF proof for the given input.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `alpha` | `bytes` | Input data to sign |
| `secret_key` | `bytes` | 32-byte secret key |
| `additional_data` | `bytes` | Optional additional data bound to proof |

**Returns:** `IETFProof` object

**Example:**

```python
from dot_ring import IETF_VRF, Bandersnatch
import secrets

secret_key = secrets.token_bytes(32)
alpha = b'my input data'
additional_data = b''

proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)
```

---

### `get_public_key(secret_key)`

Derive the public key from a secret key.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `secret_key` | `bytes` | 32-byte secret key |

**Returns:** `bytes` - The serialized public key

**Example:**

```python
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)
```

---

### `from_bytes(proof_bytes)`

Deserialize a proof from bytes.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `proof_bytes` | `bytes` | Serialized proof bytes |

**Returns:** `IETFProof` object

**Example:**

```python
proof_bytes = proof.to_bytes()
restored_proof = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)
```

---

## IETFProof Object

The proof object returned by `prove()`.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `output_point` | `Point` | VRF output point (Γ) |
| `c` | `int` | Challenge scalar |
| `s` | `int` | Response scalar |

### Methods

#### `verify(public_key, alpha, additional_data)`

Verify the proof is valid.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `public_key` | `bytes` | Signer's serialized public key |
| `alpha` | `bytes` | Original input data |
| `additional_data` | `bytes` | Original additional data |

**Returns:** `bool` - `True` if valid, `False` otherwise

**Example:**

```python
is_valid = proof.verify(public_key, alpha, additional_data)
```

---

#### `to_bytes()`

Serialize the proof to bytes.

**Returns:** `bytes` - Serialized proof

**Example:**

```python
proof_bytes = proof.to_bytes()
print(f"Proof size: {len(proof_bytes)} bytes")
```

---

#### `proof_to_hash(output_point)`

Convert the VRF output point to a pseudo-random hash.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `output_point` | `Point` | The VRF output point from the proof |

**Returns:** `bytes` - Hash output (typically 64 bytes for SHA-512)

**Example:**

```python
random_output = IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point)
print(f"Random: {random_output.hex()}")
```

---

## Complete Example

```python
from dot_ring import IETF_VRF, Bandersnatch
import secrets

# Setup
secret_key = secrets.token_bytes(32)
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)

# Generate proof
alpha = b'lottery-round-42'
additional_data = b'context-data'
proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)

# Verify
is_valid = proof.verify(public_key, alpha, additional_data)
assert is_valid, "Proof verification failed!"

# Get random output
random_bytes = IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point)
random_int = int.from_bytes(random_bytes, 'big')
print(f"Random number: {random_int}")

# Serialization round-trip
proof_bytes = proof.to_bytes()
restored = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)
assert restored.verify(public_key, alpha, additional_data)
```

## Proof Size

The IETF VRF proof size depends on the curve:

| Curve | Proof Size |
|-------|------------|
| Bandersnatch | 96 bytes |
| Ed25519 | 80 bytes |
| secp256k1 | 97 bytes |

## Supported Curves

IETF VRF supports all 18 curves in DotRing. See [Curves Reference](/api/curves).
