---
id: serialization
title: Serialization Guide
sidebar_position: 4
---

# Serialization Guide

How to serialize and deserialize VRF proofs, keys, and ring commitments.

## Overview

All DotRing objects can be converted to bytes for:
- **Storage** - Save to database or file
- **Transmission** - Send over network
- **Interoperability** - Exchange with other systems

## IETF VRF Serialization

### Proof

```python
from dot_ring import Bandersnatch, IETF_VRF
import secrets

# Generate proof
secret_key = secrets.token_bytes(32)
proof = IETF_VRF[Bandersnatch].prove(b'input', secret_key, b'')

# Serialize
proof_bytes = proof.to_bytes()
print(f"IETF proof: {len(proof_bytes)} bytes")

# Deserialize
restored = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)

# Verify
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)
assert restored.verify(public_key, b'input', b'')
```

### Proof Size by Curve

| Curve | Proof Size |
|-------|------------|
| Bandersnatch | 96 bytes |
| Ed25519 | 80 bytes |
| secp256k1 | 97 bytes |
| P-256 | 97 bytes |
| BLS12-381 G1 | 144 bytes |

---

## Pedersen VRF Serialization

### Proof

```python
from dot_ring import Bandersnatch, PedersenVRF

proof = PedersenVRF[Bandersnatch].prove(b'input', secret_key, b'')

# Serialize
proof_bytes = proof.to_bytes()
print(f"Pedersen proof: {len(proof_bytes)} bytes")

# Deserialize
restored = PedersenVRF[Bandersnatch].from_bytes(proof_bytes)

# Verify (no public key needed)
assert restored.verify(b'input', b'')
```

---

## Ring VRF Serialization

### Proof

```python
from dot_ring import Bandersnatch, RingVRF

# Generate ring proof
proof = RingVRF[Bandersnatch].prove(
    alpha, ad, secret_key, public_key, ring_keys
)

# Serialize (~784 bytes for ring proof)
proof_bytes = proof.to_bytes()
print(f"Ring proof: {len(proof_bytes)} bytes")  # 768

# Deserialize
restored = RingVRF[Bandersnatch].from_bytes(proof_bytes)
```

### Ring Root

```python
from dot_ring.vrf.ring.ring_root import RingRoot

# Build ring root
ring_root = RingVRF[Bandersnatch].construct_ring_root(ring_keys)

# Serialize (always 144 bytes = 3 × 48-byte G1 points)
ring_root_bytes = ring_root.to_bytes()
print(f"Ring root: {len(ring_root_bytes)} bytes")  # 144

# Deserialize
restored_root = RingRoot.from_bytes(ring_root_bytes)

# Verify proof with restored ring root
assert proof.verify(alpha, ad, restored_root)
```

### Public Keys

```python
# Parse concatenated public key bytes
keys_hex = "7b32d917d5aa771d493c47b0e096886827cd056c82dbdba19e60baa8b2c60313..."
keys_bytes = bytes.fromhex(keys_hex)

# Each Bandersnatch key is 32 bytes
ring_keys = RingVRF[Bandersnatch].parse_keys(keys_bytes)
print(f"Parsed {len(ring_keys)} keys")
```

---

## Public Key Serialization

Public keys are returned as serialized bytes from `get_public_key()`:

```python
from dot_ring import Bandersnatch, IETF_VRF

# Get public key (already serialized)
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)
print(f"Public key: {len(public_key)} bytes")  # 32 bytes for Bandersnatch
```

### Public Key Sizes

| Curve | Size |
|-------|------|
| Bandersnatch | 32 bytes |
| Ed25519 | 32 bytes |
| secp256k1 | 33 bytes (compressed) |
| P-256 | 33 bytes (compressed) |
| BLS12-381 G1 | 48 bytes |
| BLS12-381 G2 | 96 bytes |

---

## Database Storage Example

```python
import sqlite3
from dot_ring import Bandersnatch, IETF_VRF
import secrets

# Create database
conn = sqlite3.connect(':memory:')
conn.execute('''
    CREATE TABLE vrf_proofs (
        id INTEGER PRIMARY KEY,
        input BLOB,
        proof BLOB,
        output BLOB,
        public_key BLOB
    )
''')

# Generate and store proof
secret_key = secrets.token_bytes(32)
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)
input_data = b'lottery-round-42'

proof = IETF_VRF[Bandersnatch].prove(input_data, secret_key, b'')

conn.execute('''
    INSERT INTO vrf_proofs (input, proof, output, public_key)
    VALUES (?, ?, ?, ?)
''', (input_data, proof.to_bytes(), IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point), public_key))
conn.commit()

# Retrieve and verify
row = conn.execute('SELECT * FROM vrf_proofs WHERE id = 1').fetchone()
restored_proof = IETF_VRF[Bandersnatch].from_bytes(row[2])
restored_pk = ... # Deserialize public key

is_valid = restored_proof.verify(restored_pk, row[1], b'')
print(f"Verified from database: {is_valid}")
```

---

## Network Transmission Example

```python
import json
import base64
from dot_ring import Bandersnatch, RingVRF

# Sender: Create proof and serialize
proof = RingVRF[Bandersnatch].prove(alpha, ad, sk, pk, keys)
ring_root = RingVRF[Bandersnatch].construct_ring_root(keys)

message = {
    'alpha': base64.b64encode(alpha).decode(),
    'additional_data': base64.b64encode(ad).decode(),
    'proof': base64.b64encode(proof.to_bytes()).decode(),
    'ring_root': base64.b64encode(ring_root.to_bytes()).decode()
}

json_payload = json.dumps(message)
# Send json_payload over network...

# Receiver: Deserialize and verify
from dot_ring.vrf.ring.ring_root import RingRoot

received = json.loads(json_payload)

alpha = base64.b64decode(received['alpha'])
ad = base64.b64decode(received['additional_data'])
proof_bytes = base64.b64decode(received['proof'])
ring_root_bytes = base64.b64decode(received['ring_root'])

proof = RingVRF[Bandersnatch].from_bytes(proof_bytes)
ring_root = RingRoot.from_bytes(ring_root_bytes)

is_valid = proof.verify(alpha, ad, ring_root)
print(f"Network proof valid: {is_valid}")
```

---

## Hex Encoding

For human-readable formats:

```python
# Bytes to hex
proof_hex = proof.to_bytes().hex()
print(f"Proof (hex): {proof_hex}")

# Hex to bytes
proof_bytes = bytes.fromhex(proof_hex)
restored = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)
```

---

## Size Summary

| Object | IETF | Pedersen | Ring |
|--------|------|----------|------|
| Proof | 96 bytes | 192 bytes | ~784 bytes |
| Ring Root | N/A | N/A | 144 bytes |

Ring proof size is **constant** regardless of ring size - a key advantage of KZG commitments!

---

## Best Practices

1. **Always verify after deserializing** - Don't trust deserialized proofs without verification

2. **Use binary format for efficiency** - Only convert to hex/base64 when needed

3. **Cache ring roots** - They're expensive to compute but cheap to verify

4. **Version your serialization format** - For future compatibility

```python
# Example: Versioned format
versioned_proof = bytes([1]) + proof.to_bytes()  # Version 1
```
