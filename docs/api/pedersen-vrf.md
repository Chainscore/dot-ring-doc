---
id: pedersen-vrf
title: Pedersen VRF
sidebar_position: 2
---

# Pedersen VRF API Reference

The `PedersenVRF` class implements a privacy-enhanced VRF using Pedersen commitments. The public key is blinded within the proof, preventing verifiers from linking proofs to specific signers.

## Import

```python
from dot_ring import PedersenVRF, Bandersnatch
```

## Key Difference from IETF VRF

In Pedersen VRF, the **public key is embedded in the proof** using a blinding factor. This means:

- ✅ Verifier does not need the public key
- ✅ Proofs from the same key cannot be linked
- ✅ Enhanced privacy for the signer

```python
# IETF VRF - requires public key
ietf_valid = ietf_proof.verify(public_key, alpha, ad)

# Pedersen VRF - no public key needed!
pedersen_valid = pedersen_proof.verify(alpha, ad)
```

## Class Methods

### `prove(alpha, secret_key, additional_data)`

Generate a privacy-enhanced VRF proof with blinded public key.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `alpha` | `bytes` | Input data to sign |
| `secret_key` | `bytes` | 32-byte secret key |
| `additional_data` | `bytes` | Optional additional data bound to proof |

**Returns:** `PedersenProof` object

**Example:**

```python
from dot_ring import PedersenVRF, Bandersnatch
import secrets

secret_key = secrets.token_bytes(32)
alpha = b'anonymous-lottery'
additional_data = b''

proof = PedersenVRF[Bandersnatch].prove(alpha, secret_key, additional_data)
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
public_key = PedersenVRF[Bandersnatch].get_public_key(secret_key)
```

---

### `from_bytes(proof_bytes)`

Deserialize a proof from bytes.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `proof_bytes` | `bytes` | Serialized proof bytes |

**Returns:** `PedersenProof` object

**Example:**

```python
proof_bytes = proof.to_bytes()
restored = PedersenVRF[Bandersnatch].from_bytes(proof_bytes)
```

---

### `blinding(secret, input_point, additional_data)`

Compute the blinding factor used in the proof.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `secret` | `bytes` | Secret key bytes |
| `input_point` | `bytes` | Serialized input point |
| `additional_data` | `bytes` | Additional data |

**Returns:** `int` - The blinding scalar

---

## PedersenProof Object

The proof object returned by `prove()`.

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `output_point` | `Point` | VRF output point (Γ) |
| `blinded_pk` | `Point` | Blinded public key commitment ($\bar{Y}$) |
| `result_point` | `Point` | Proof R component |
| `ok` | `Point` | Proof $O_k$ component |
| `s` | `int` | Response scalar |
| `sb` | `int` | Blinding response scalar |

### Methods

#### `verify(alpha, additional_data)`

Verify the proof is valid. **No public key required.**

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `alpha` | `bytes` | Original input data |
| `additional_data` | `bytes` | Original additional data |

**Returns:** `bool` - `True` if valid, `False` otherwise

**Example:**

```python
is_valid = proof.verify(alpha, additional_data)
```

---

#### `to_bytes()`

Serialize the proof to bytes.

**Returns:** `bytes` - Serialized proof

---

#### `proof_to_hash(output_point)`

Convert the VRF output point to a pseudo-random hash. This is a class method.

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `output_point` | `Point` | The VRF output point from the proof |

**Returns:** `bytes` - Hash output

**Example:**

```python
random_output = PedersenVRF[Bandersnatch].proof_to_hash(proof.output_point)
```

---

## Complete Example

```python
from dot_ring import PedersenVRF, Bandersnatch
import secrets

# Setup
secret_key = secrets.token_bytes(32)

# Generate proof
alpha = b'private-lottery-entry'
additional_data = b''
proof = PedersenVRF[Bandersnatch].prove(alpha, secret_key, additional_data)

# Verify - no public key needed!
is_valid = proof.verify(alpha, additional_data)
assert is_valid, "Proof verification failed!"

# Get random output
random_bytes = PedersenVRF[Bandersnatch].proof_to_hash(proof.output_point)
print(f"Random output: {random_bytes.hex()}")

# Serialization
proof_bytes = proof.to_bytes()
print(f"Proof size: {len(proof_bytes)} bytes")

restored = PedersenVRF[Bandersnatch].from_bytes(proof_bytes)
assert restored.verify(alpha, additional_data)
```

## Privacy Properties

### Unlinkability

Two proofs from the same signer **cannot be linked**:

```python
# Same key, different inputs
proof1 = PedersenVRF[Bandersnatch].prove(b'input1', secret_key, b'')
proof2 = PedersenVRF[Bandersnatch].prove(b'input2', secret_key, b'')

# Both are valid
assert proof1.verify(b'input1', b'')
assert proof2.verify(b'input2', b'')

# But verifier cannot tell they came from the same key!
```

### Blinding Factor

The blinding factor is deterministically derived from the secret key, input point, and additional data.

This ensures:
- Same inputs produce same blinding (deterministic)
- Different inputs produce different blindings (unlinkable)

## Proof Size

Pedersen VRF proofs are larger than IETF proofs due to the blinding commitment:

| Curve | Proof Size |
|-------|------------|
| Bandersnatch | 192 bytes |

## Supported Curves

Pedersen VRF supports all 18 curves in DotRing. See [Curves Reference](/api/curves).
