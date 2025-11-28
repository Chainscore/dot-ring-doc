---
id: ietf-tutorial
title: IETF VRF Tutorial
sidebar_position: 1
---

# IETF VRF Tutorial

A complete guide to using the standard IETF VRF for verifiable randomness.

## Overview

IETF VRF is a cryptographic primitive that produces verifiable pseudo-random output. It's defined in [RFC 9381](https://www.rfc-editor.org/rfc/rfc9381.html) and is the foundation for randomness beacons, lotteries, and leader selection.

## Use Cases

- **Randomness Beacons** - Generate publicly verifiable random numbers
- **Lotteries** - Fair, transparent winner selection
- **Leader Election** - Blockchain consensus mechanisms
- **Random Sampling** - Auditable random selection

## Step 1: Setup

```python
from dot_ring import Bandersnatch, IETF_VRF
import secrets

# Generate a cryptographically secure secret key
secret_key = secrets.token_bytes(32)

# Derive the corresponding public key
public_key = IETF_VRF[Bandersnatch].get_public_key(secret_key)

print(f"Public key generated")
```

## Step 2: Generate a Proof

```python
# The input to the VRF
alpha = b'lottery-round-42'

# Optional additional data (context binding)
additional_data = b'my-application'

# Generate the VRF proof
proof = IETF_VRF[Bandersnatch].prove(alpha, secret_key, additional_data)

print("Proof generated!")
```

## Step 3: Verify the Proof

```python
# Anyone with the public key can verify
is_valid = proof.verify(public_key, alpha, additional_data)

if is_valid:
    print("✅ Proof is valid!")
else:
    print("❌ Proof is invalid!")
```

## Step 4: Extract Random Output

```python
# Get the pseudo-random output
random_bytes = IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point)
print(f"Random output: {random_bytes.hex()}")

# Convert to integer for lottery selection
random_int = int.from_bytes(random_bytes, 'big')
winner_index = random_int % num_participants
print(f"Winner: Participant #{winner_index}")
```

## Complete Example: Lottery System

```python
from dot_ring import Bandersnatch, IETF_VRF
import secrets

class VRFLottery:
    def __init__(self):
        self.secret_key = secrets.token_bytes(32)
        self.public_key = IETF_VRF[Bandersnatch].get_public_key(self.secret_key)
        self.participants = []
    
    def add_participant(self, name: str):
        self.participants.append(name)
    
    def draw_winner(self, round_number: int) -> tuple[str, bytes]:
        """Draw a winner for a given round."""
        # Input includes round number for uniqueness
        alpha = f"lottery-round-{round_number}".encode()
        additional_data = b''
        
        # Generate proof
        proof = IETF_VRF[Bandersnatch].prove(alpha, self.secret_key, additional_data)
        
        # Get random output
        random_bytes = IETF_VRF[Bandersnatch].proof_to_hash(proof.output_point)
        random_int = int.from_bytes(random_bytes, 'big')
        
        # Select winner
        winner_index = random_int % len(self.participants)
        winner = self.participants[winner_index]
        
        return winner, proof.to_bytes()
    
    def verify_draw(self, round_number: int, proof_bytes: bytes) -> bool:
        """Verify a lottery draw was fair."""
        alpha = f"lottery-round-{round_number}".encode()
        proof = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)
        return proof.verify(self.public_key, alpha, b'')

# Usage
lottery = VRFLottery()
lottery.add_participant("Alice")
lottery.add_participant("Bob")
lottery.add_participant("Charlie")

winner, proof = lottery.draw_winner(round_number=1)
print(f"Winner: {winner}")

# Anyone can verify
is_fair = lottery.verify_draw(round_number=1, proof)
print(f"Draw was fair: {is_fair}")
```

## Serialization

### Serialize Proof

```python
# Convert proof to bytes for storage/transmission
proof_bytes = proof.to_bytes()
print(f"Proof size: {len(proof_bytes)} bytes")

# Store in database, send over network, etc.
save_to_database(proof_bytes)
```

### Deserialize Proof

```python
# Restore proof from bytes
proof_bytes = load_from_database()
restored_proof = IETF_VRF[Bandersnatch].from_bytes(proof_bytes)

# Verify the restored proof
is_valid = restored_proof.verify(public_key, alpha, additional_data)
```

## Best Practices

### 1. Unique Inputs

Always include unique identifiers in the input:

```python
# Good: Unique per round
alpha = f"lottery-{lottery_id}-round-{round_number}".encode()

# Bad: Could be replayed
alpha = b"lottery"
```

### 2. Secure Key Storage

```python
# Generate key securely
secret_key = secrets.token_bytes(32)

# Store encrypted, never log
# Use HSM in production
```

### 3. Additional Data for Context

Bind proofs to specific contexts:

```python
# Prevents proof reuse across applications
additional_data = f"app:{app_id}:user:{user_id}".encode()
```

### 4. Verify Before Using Output

```python
# Always verify before trusting output
if not proof.verify(public_key, alpha, additional_data):
    raise ValueError("Invalid VRF proof!")

random_output = proof.proof_to_hash()
```

## Comparison with Other VRFs

| Feature | IETF VRF | Pedersen VRF | Ring VRF |
|---------|----------|--------------|----------|
| Public Key Visible | ✅ Yes | ❌ Blinded | ❌ Anonymous |
| Proof Size | Small | Medium | Large |
| Verification | Fast | Fast | Slower |
| Standards | RFC 9381 | Custom | Custom |

## Next Steps

- [Pedersen VRF Tutorial](/guides/pedersen-tutorial) - Privacy-enhanced VRF
- [Ring VRF Tutorial](/guides/ring-tutorial) - Anonymous membership proofs
- [API Reference](/api/ietf-vrf) - Complete method documentation
