---
id: vrf-theory
title: VRF Theory
sidebar_position: 1
---

# VRF Theory

Understanding the mathematics and security properties of Verifiable Random Functions.

## What is a VRF?

A **Verifiable Random Function (VRF)** is a cryptographic primitive that combines:

1. **Pseudo-random function** - Deterministic but unpredictable output
2. **Digital signature** - Proof that the output was correctly computed

```
VRF: (secret_key, input) → (output, proof)
```

## Mathematical Definition

A VRF consists of three algorithms:

### Key Generation

$$
\text{KeyGen}() \rightarrow (sk, pk)
$$

Generates a secret key $sk$ and corresponding public key $pk$.

### Evaluation

$$
\text{Eval}(sk, \alpha) \rightarrow (\beta, \pi)
$$

Given secret key $sk$ and input $\alpha$, produces:
- Output $\beta$ - the pseudo-random value
- Proof $\pi$ - proves $\beta$ was correctly computed

### Verification

$$
\text{Verify}(pk, \alpha, \beta, \pi) \rightarrow \{0, 1\}
$$

Returns 1 (true) if the proof is valid, 0 (false) otherwise.

## Security Properties

### Uniqueness

For any input $\alpha$ and public key $pk$, there exists exactly **one** valid output $\beta$.

For all inputs $\alpha$ and public keys $pk$, there exists a unique output $\beta$ such that $\text{Verify}(pk, \alpha, \beta, \pi) = 1$.

This prevents the prover from choosing among multiple outputs.

### Pseudo-randomness

Without the secret key, the output is computationally indistinguishable from random:

$$
\beta \approx_c \text{Random}(|\beta|)
$$

Even an adversary who:
- Knows the public key
- Can query the VRF on other inputs
- Sees proofs for other inputs

Cannot predict the output for a new input better than random guessing.

### Verifiability

Anyone with the public key can verify the output was correctly computed.

## IETF VRF Construction

The IETF VRF (RFC 9381) uses elliptic curves:

### Setup

- Generator point $G$ on elliptic curve
- Secret key $sk$ - random scalar
- Public key $pk = sk \cdot G$

### Evaluation

1. **Hash to curve**: $I = \text{HashToCurve}(\alpha)$
2. **Compute output point**: $O = sk \cdot I$
3. **Generate proof** (Schnorr-like):
   - Nonce $k$ (deterministically derived)
   - $U = k \cdot G$, $V = k \cdot I$
   - Challenge $c = \text{Hash}(pk, I, O, U, V, ad)$
   - Response $s = k + c \cdot sk$
4. **Output**: $\beta = \text{Hash}(O)$, $\pi = (O, c, s)$

### Verification

1. Recompute $I = \text{HashToCurve}(\alpha)$
2. Compute $U' = s \cdot G - c \cdot pk$
3. Compute $V' = s \cdot I - c \cdot O$
4. Verify $c = \text{Hash}(pk, I, O, U', V', ad)$
5. Output $\beta = \text{Hash}(O)$

## VRF vs Other Primitives

### VRF vs Digital Signature

| Property | Digital Signature | VRF |
|----------|-------------------|-----|
| Output | Arbitrary | Pseudo-random |
| Uniqueness | ❌ Multiple valid signatures | ✅ Exactly one output |
| Deterministic | ❌ Often randomized | ✅ Deterministic |

### VRF vs PRF

| Property | PRF | VRF |
|----------|-----|-----|
| Verifiable | ❌ No | ✅ Yes |
| Public Key | ❌ No | ✅ Yes |

### VRF vs Commitment

| Property | Commitment | VRF |
|----------|------------|-----|
| Binding | ✅ Yes | ✅ Yes (uniqueness) |
| Hiding | ✅ Yes | ✅ Yes (pseudo-randomness) |
| Verifiable Randomness | ❌ No | ✅ Yes |

## Applications

### Randomness Beacons

VRFs generate publicly verifiable random numbers:

```
beacon_output = VRF(sk, round_number)
```

Anyone can verify the randomness without trusting the generator.

### Lottery Systems

Fair, transparent winner selection:

```
ticket_value = VRF(sk, ticket_id)
winner = argmin(ticket_values)
```

### Blockchain Consensus

Leader election in proof-of-stake:

```
leader_score = VRF(validator_sk, slot_number)
if leader_score < threshold:
    produce_block()
```

### Private Information Retrieval

Query databases without revealing what you're looking for.

## Security Assumptions

IETF VRF security relies on:

1. **Discrete Logarithm Problem (DLP)** - Hard to compute $sk$ from $pk = sk \cdot G$
2. **Computational Diffie-Hellman (CDH)** - Hard to compute $sk \cdot H$ from $pk$ and $H$
3. **Random Oracle Model** - Hash functions behave as random oracles

## Further Reading

- [RFC 9381](https://www.rfc-editor.org/rfc/rfc9381.html) - IETF VRF Specification
- [RFC 9380](https://www.rfc-editor.org/rfc/rfc9380.html) - Hash to Curve
- Micali, Rabin, Vadhan (1999) - Original VRF paper
