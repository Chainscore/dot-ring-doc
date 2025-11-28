---
id: pedersen-tutorial
title: Pedersen VRF Tutorial
sidebar_position: 2
---

# Pedersen VRF Tutorial

A complete guide to using Pedersen VRF for privacy-enhanced verifiable randomness.

## Overview

Pedersen VRF extends the standard IETF VRF with **privacy features**. The public key is hidden using a Pedersen commitment, meaning verifiers cannot link proofs to a specific signer.

## Key Difference

```python
# IETF VRF: Verifier needs public key
ietf_proof.verify(public_key, alpha, ad)  # Verifier knows who signed

# Pedersen VRF: No public key needed!
pedersen_proof.verify(alpha, ad)  # Verifier cannot identify signer
```

## Use Cases

- **Anonymous Voting** - Prove you voted without revealing identity
- **Private Lotteries** - Participate without exposing public key
- **Unlinkable Authentication** - Multiple proofs cannot be linked
- **Privacy-Preserving Randomness** - Generate verifiable randomness privately

## Step 1: Setup

```python
from dot_ring import Bandersnatch, PedersenVRF
import secrets

# Generate a secret key
secret_key = secrets.token_bytes(32)

# You can derive the public key (but won't share it for verification)
public_key = PedersenVRF[Bandersnatch].get_public_key(secret_key)
```

## Step 2: Generate a Proof

```python
# Input data
alpha = b'anonymous-lottery-entry'
additional_data = b''

# Generate proof with blinded public key
proof = PedersenVRF[Bandersnatch].prove(alpha, secret_key, additional_data)

print("Privacy-enhanced proof generated!")
```

## Step 3: Verify the Proof

```python
# Verify WITHOUT needing the public key
is_valid = proof.verify(alpha, additional_data)

if is_valid:
    print("✅ Proof is valid (signer identity unknown)")
else:
    print("❌ Proof is invalid")
```

## Step 4: Extract Random Output

```python
# Get the pseudo-random output
random_bytes = PedersenVRF[Bandersnatch].proof_to_hash(proof.output_point)
print(f"Random output: {random_bytes.hex()}")
```

## Complete Example: Anonymous Voting

```python
from dot_ring import Bandersnatch, PedersenVRF
import secrets
from dataclasses import dataclass

@dataclass
class AnonymousVote:
    choice: str
    proof: bytes
    random_output: bytes

class AnonymousVotingSystem:
    def __init__(self, poll_id: str):
        self.poll_id = poll_id
        self.votes: list[AnonymousVote] = []
    
    def cast_vote(self, choice: str, voter_secret_key: bytes) -> AnonymousVote:
        """Cast an anonymous vote."""
        # Create unique input for this poll + choice
        alpha = f"{self.poll_id}:{choice}".encode()
        
        # Generate proof
        proof = PedersenVRF[Bandersnatch].prove(alpha, voter_secret_key, b'')
        
        vote = AnonymousVote(
            choice=choice,
            proof=proof.to_bytes(),
            random_output=PedersenVRF[Bandersnatch].proof_to_hash(proof.output_point)
        )
        
        self.votes.append(vote)
        return vote
    
    def verify_vote(self, vote: AnonymousVote) -> bool:
        """Verify a vote is valid (without knowing who cast it)."""
        alpha = f"{self.poll_id}:{vote.choice}".encode()
        proof = PedersenVRF[Bandersnatch].from_bytes(vote.proof)
        return proof.verify(alpha, b'')
    
    def tally(self) -> dict[str, int]:
        """Count verified votes."""
        results = {}
        for vote in self.votes:
            if self.verify_vote(vote):
                results[vote.choice] = results.get(vote.choice, 0) + 1
        return results

# Usage
voting = AnonymousVotingSystem("election-2024")

# Voters cast anonymous votes
voter1_key = secrets.token_bytes(32)
voter2_key = secrets.token_bytes(32)
voter3_key = secrets.token_bytes(32)

voting.cast_vote("Alice", voter1_key)
voting.cast_vote("Bob", voter2_key)
voting.cast_vote("Alice", voter3_key)

# Tally results
results = voting.tally()
print(f"Results: {results}")  # {'Alice': 2, 'Bob': 1}

# Note: We verified all votes without knowing who voted!
```

## Privacy Properties

### Unlinkability

Two proofs from the same key cannot be linked:

```python
# Same key, different inputs
proof1 = PedersenVRF[Bandersnatch].prove(b'input1', secret_key, b'')
proof2 = PedersenVRF[Bandersnatch].prove(b'input2', secret_key, b'')

# Both valid
assert proof1.verify(b'input1', b'')
assert proof2.verify(b'input2', b'')

# Verifier CANNOT tell these came from the same key!
# The blinding factor is different for each input
```

### Why It Works

The blinding factor is deterministically derived from the secret key, input point, and additional data:

```python
# Blinding uses secret key bytes, input point bytes, and additional data
# Different inputs produce different blindings, ensuring unlinkability
# The blinding factor is computed internally during prove()
```

## Proof Structure

```python
# Pedersen proof contains:
print(f"Output Point: {proof.output_point}")    # VRF output point (O)
print(f"Blinded PK: {proof.blinded_pk}")        # Blinded public key (Y_bar)
print(f"Result Point: {proof.result_point}")    # Proof R component
print(f"Ok: {proof.ok}")                        # O_k component
print(f"Response s: {proof.s}")                 # Response scalar
print(f"Response sb: {proof.sb}")               # Blinding response
```

## Serialization

```python
# Serialize
proof_bytes = proof.to_bytes()
print(f"Proof size: {len(proof_bytes)} bytes")

# Deserialize
restored = PedersenVRF[Bandersnatch].from_bytes(proof_bytes)

# Verify restored proof
assert restored.verify(alpha, additional_data)
```

## Comparison with IETF VRF

| Feature | IETF VRF | Pedersen VRF |
|---------|----------|--------------|
| Public Key Required for Verify | ✅ Yes | ❌ No |
| Proofs Linkable | ✅ Yes | ❌ No |
| Proof Size | Smaller | Larger |
| Computation | Faster | Slightly slower |

## When to Use Pedersen VRF

✅ **Use Pedersen VRF when:**
- Signer identity should be hidden
- Proofs should not be linkable
- Privacy is more important than proof size

❌ **Use IETF VRF when:**
- Identity attribution is needed
- Smaller proofs are preferred
- Standards compliance is required

## Best Practices

### 1. Fresh Inputs for Unlinkability

```python
# Include unique identifiers to prevent linking
alpha = f"{session_id}:{timestamp}:{action}".encode()
```

### 2. Consistent Additional Data

```python
# Use same additional_data for prove and verify
ad = b'my-app-context'
proof = PedersenVRF[Curve].prove(alpha, sk, ad)
assert proof.verify(alpha, ad)  # Must match!
```

### 3. Don't Reuse Proof Bytes

```python
# Generate new proof for each verification context
# Don't share proof_bytes across different verifiers if linkability is a concern
```

## Next Steps

- [Ring VRF Tutorial](/guides/ring-tutorial) - Full anonymity within a ring
- [API Reference](/api/pedersen-vrf) - Complete method documentation
- [Pedersen Commitments](/concepts/pedersen-commitments) - Theory deep-dive
