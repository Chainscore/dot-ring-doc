---
id: ring-tutorial
title: Ring VRF Tutorial
sidebar_position: 3
---

# Ring VRF Tutorial

A complete guide to using Ring VRF for anonymous membership proofs.

## Overview

Ring VRF combines Pedersen VRF with ring signatures to provide **full anonymity** within a set of public keys. The verifier knows the signer is a member of the ring but cannot determine which member.

## Concept

```
Ring = {PK₁, PK₂, PK₃, ..., PKₙ}

Prover: "I am one of these keys, but I won't tell you which one"
Verifier: "I believe you. Here's your verifiable random output."
```

## Use Cases

- **Anonymous Blockchain Validators** - Prove block authorship without revealing identity
- **Private Group Membership** - Prove you belong to a group anonymously
- **Whistleblower Systems** - Verify authenticity without exposing source
- **Anonymous Credentials** - Prove qualifications without identification

:::caution Curve Requirement
Ring VRF **only supports the Bandersnatch curve**. This is required for the KZG polynomial commitments.
:::

## Step 1: Create the Ring

First, gather public keys for all ring members:

```python
from dot_ring import Bandersnatch, RingVRF
import secrets

# Create ring members (in practice, these come from a registry)
ring_keys = []
for i in range(8):  # 8 members in the ring
    sk = secrets.token_bytes(32)
    pk = RingVRF[Bandersnatch].get_public_key(sk)
    ring_keys.append(pk)

print(f"Ring size: {len(ring_keys)} members")
```

## Step 2: Your Keys

You need your own key pair, and your public key must be in the ring:

```python
# Your secret key
my_secret_key = secrets.token_bytes(32)
my_public_key = RingVRF[Bandersnatch].get_public_key(my_secret_key)

# Add yourself to the ring (position doesn't matter)
ring_keys[0] = my_public_key  # Replace first key with yours

# Alternatively, append:
# ring_keys.append(my_public_key)
```

## Step 3: Build Ring Commitment

The ring commitment is a KZG polynomial commitment to all public keys:

```python
# Build ring root (can be cached and reused)
ring_root = RingVRF[Bandersnatch].construct_ring_root(ring_keys)

# Serialize for storage/distribution
ring_root_bytes = ring_root.to_bytes()
print(f"Ring root size: {len(ring_root_bytes)} bytes")  # 144 bytes
```

## Step 4: Generate Anonymous Proof

```python
# Input data
alpha = b'block-selection-round-42'
additional_data = b''

# Generate proof (proves membership without revealing which member)
proof = RingVRF[Bandersnatch].prove(
    alpha,
    additional_data,
    my_secret_key,
    my_public_key,
    ring_keys
)

print("Anonymous ring proof generated!")
```

## Step 5: Verify the Proof

The verifier only needs the ring root, not the individual keys:

```python
# Verifier only has ring_root, not ring_keys
is_valid = proof.verify(alpha, additional_data, ring_root)

if is_valid:
    print("✅ Proof valid: Signer is a ring member (identity unknown)")
else:
    print("❌ Invalid proof")
```

## Complete Example: Anonymous Validator Selection

```python
from dot_ring import Bandersnatch, RingVRF
import secrets
from dataclasses import dataclass

@dataclass
class ValidatorSet:
    """A set of validators with anonymous block production."""
    ring_keys: list
    ring_root: bytes
    
    @classmethod
    def from_validators(cls, validator_public_keys: list):
        ring_root = RingVRF[Bandersnatch].construct_ring_root(validator_public_keys)
        return cls(
            ring_keys=validator_public_keys,
            ring_root=ring_root.to_bytes()
        )

@dataclass
class AnonymousBlock:
    """A block produced by an anonymous validator."""
    slot: int
    data: bytes
    proof: bytes

class AnonymousBlockchain:
    def __init__(self, validators: ValidatorSet):
        self.validators = validators
        self.blocks: list[AnonymousBlock] = []
    
    def produce_block(
        self, 
        slot: int, 
        data: bytes,
        validator_secret_key: bytes,
        validator_public_key
    ) -> AnonymousBlock:
        """Produce a block with anonymous authorship proof."""
        
        # VRF input includes slot number
        alpha = f"block-slot-{slot}".encode()
        
        # Generate anonymous proof
        proof = RingVRF[Bandersnatch].prove(
            alpha,
            data,  # Block data as additional_data
            validator_secret_key,
            validator_public_key,
            self.validators.ring_keys
        )
        
        block = AnonymousBlock(
            slot=slot,
            data=data,
            proof=proof.to_bytes()
        )
        
        self.blocks.append(block)
        return block
    
    def verify_block(self, block: AnonymousBlock) -> bool:
        """Verify block was produced by a valid (anonymous) validator."""
        from dot_ring.vrf.ring.ring_root import RingRoot
        
        alpha = f"block-slot-{block.slot}".encode()
        ring_root = RingRoot.from_bytes(self.validators.ring_root)
        proof = RingVRF[Bandersnatch].from_bytes(block.proof)
        
        return proof.verify(alpha, block.data, ring_root)

# Setup validators
validator_keys = []
validator_secrets = []
for _ in range(10):
    sk = secrets.token_bytes(32)
    pk = RingVRF[Bandersnatch].get_public_key(sk)
    validator_secrets.append(sk)
    validator_keys.append(pk)

validator_set = ValidatorSet.from_validators(validator_keys)
blockchain = AnonymousBlockchain(validator_set)

# Validator 3 produces a block (anonymously!)
block = blockchain.produce_block(
    slot=42,
    data=b'block data here',
    validator_secret_key=validator_secrets[3],
    validator_public_key=validator_keys[3]
)

# Anyone can verify the block is from a valid validator
# But cannot determine WHICH validator produced it
is_valid = blockchain.verify_block(block)
print(f"Block valid: {is_valid}")  # True
print("Block author: Unknown (one of 10 validators)")
```

## Working with Serialized Keys

Parse concatenated public key bytes:

```python
# Keys might come as concatenated hex
keys_hex = "7b32d917d5aa771d493c47b0e096886827cd056c82dbdba19e60baa8b2c60313..."
keys_bytes = bytes.fromhex(keys_hex)

# Parse into list of points
ring_keys = RingVRF[Bandersnatch].parse_keys(keys_bytes)
print(f"Parsed {len(ring_keys)} keys")
```

## Serialization

### Proof Serialization

```python
# Serialize proof (~784 bytes)
proof_bytes = proof.to_bytes()
print(f"Proof size: {len(proof_bytes)} bytes")

# Deserialize
restored_proof = RingVRF[Bandersnatch].from_bytes(proof_bytes)
```

### Ring Root Serialization

```python
from dot_ring.vrf.ring.ring_root import RingRoot

# Serialize ring root (144 bytes = 3 × 48-byte G1 points)
ring_root_bytes = ring_root.to_bytes()

# Deserialize
restored_root = RingRoot.from_bytes(ring_root_bytes)
```

## Ring Membership Requirements

⚠️ **Your public key MUST be in the ring:**

```python
# This will fail if my_public_key is not in ring_keys
proof = RingVRF[Bandersnatch].prove(
    alpha, ad, my_secret_key, my_public_key, ring_keys
)

# Ensure your key is in the ring:
assert my_public_key in ring_keys, "Your key must be in the ring!"
```

## Security Considerations

1. **Ring Size** - Larger rings provide better anonymity
2. **Ring Stability** - Changing ring membership requires new ring root
3. **Key Reuse** - Same key can be in multiple rings
4. **Output Uniqueness** - VRF output is deterministic per input

## Comparison with Other VRFs

| Feature | IETF VRF | Pedersen VRF | Ring VRF |
|---------|----------|--------------|----------|
| Identity Hidden | ❌ | ✅ Blinded | ✅ Anonymous |
| Linkability | Linkable | Unlinkable | Unlinkable |
| Proof Size | ~96 bytes | ~192 bytes | ~784 bytes |
| Setup Required | None | None | Ring Root |
| Supported Curves | All 18 | All 18 | Bandersnatch only |

## Next Steps

- [Serialization Guide](/guides/serialization) - Working with proof bytes
- [API Reference](/api/ring-vrf) - Complete method documentation
- [Ring Proof Theory](/concepts/ring-proofs) - Deep dive into KZG and Plonk
