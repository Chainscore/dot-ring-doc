---
id: pedersen-commitments
title: Pedersen Commitments
sidebar_position: 2
---

# Pedersen Commitments

Understanding the cryptographic foundation of Pedersen VRF's privacy features.

## What is a Pedersen Commitment?

A **Pedersen Commitment** is a cryptographic scheme that allows you to commit to a value while keeping it hidden, with the ability to reveal it later.

$$
\text{Commit}(m, r) = m \cdot G + r \cdot H
$$

Where:
- $m$ is the message (value being committed)
- $r$ is the blinding factor (random)
- $G, H$ are independent generator points

## Properties

### Hiding

The commitment reveals nothing about $m$:

$$
\text{Commit}(m_1, r_1) \approx_c \text{Commit}(m_2, r_2)
$$

An adversary cannot determine $m$ from the commitment alone.

### Binding

Once committed, you cannot change the value:

$$
	ext{Commit}(m_1, r_1) = \text{Commit}(m_2, r_2) \Rightarrow m_1 = m_2
$$

This holds with overwhelming probability assuming the discrete log relationship between $G$ and $H$ is unknown.

### Homomorphic

Commitments can be combined:

$$
\text{Commit}(m_1, r_1) + \text{Commit}(m_2, r_2) = \text{Commit}(m_1 + m_2, r_1 + r_2)
$$

This enables advanced protocols like range proofs and anonymous credentials.

## Pedersen VRF: Hiding the Public Key

In standard VRF, the verifier knows the signer's public key. Pedersen VRF hides it:

### Standard VRF Verification

```
Verify(pk, input, output, proof) → bool
         ↑
         Public key is visible
```

### Pedersen VRF Verification

```
Verify(input, output, proof) → bool
         ↑
         No public key needed!
         (it's blinded in the proof)
```

## How It Works

### Key Commitment

Instead of revealing $pk$, the prover commits to it:

$$
C_{pk} = pk + b \cdot B
$$

Where:
- $pk$ is the actual public key
- $b$ is a blinding factor
- $B$ is a blinding base point

### Blinding Factor Derivation

The blinding factor is deterministically derived:

$$
b = \operatorname{Hash}(sk, \alpha, ad)
$$

This ensures:
- **Determinism**: Same inputs produce same blinding
- **Unlinkability**: Different inputs produce different blindings
- **Unpredictability**: Adversary cannot predict blindings

### Proof Structure

A Pedersen VRF proof contains (based on the [Bandersnatch VRF Specification](https://github.com/davxy/bandersnatch-vrf-spec)):

1. **$O$** - VRF output point (same as IETF: $O = sk \cdot I$)
2. **$\bar{Y}$** - Blinded public key commitment ($\bar{Y} = sk \cdot G + b \cdot B$)
3. **$R$** - Commitment: $R = k \cdot G + k_b \cdot B$
4. **$O_k$** - VRF commitment: $O_k = k \cdot I$
5. **$s$** - Response scalar: $s = k + c \cdot sk$
6. **$s_b$** - Blinding response: $s_b = k_b + c \cdot b$

Where:
- $k$ is a nonce derived from $sk$ and input
- $k_b$ is a nonce derived from $b$ and input
- $c$ is the challenge: $c = \text{Hash}(\bar{Y}, I, O, R, O_k, ad)$

### Verification Equations

The verifier checks two equations:

**Equation 1 (VRF relation):**
$$
O_k + c \cdot O = s \cdot I
$$

**Equation 2 (Key commitment relation):**
$$
R + c \cdot \bar{Y} = s \cdot G + s_b \cdot B
$$

Both equations must hold for the proof to be valid. The verifier never learns $pk$ or $b$ individually!

## Privacy Analysis

### What the Verifier Learns

- ✅ The proof is valid
- ✅ The signer knows a valid secret key
- ✅ The random output is correct

### What the Verifier Does NOT Learn

- ❌ Which public key was used
- ❌ Whether two proofs came from the same key
- ❌ Any information linking proofs together

## Unlinkability

Two proofs from the same key cannot be linked:

```python
# Same key, different inputs → different blindings
proof1 = PedersenVRF.prove(input1, sk, ad)  # blinding b1
proof2 = PedersenVRF.prove(input2, sk, ad)  # blinding b2

# b1 ≠ b2, so C_pk values are different
# Verifier cannot tell they came from the same key
```

## Comparison with Standard VRF

| Property | IETF VRF | Pedersen VRF |
|----------|----------|--------------|
| Public Key Revealed | ✅ Yes | ❌ No (blinded) |
| Proofs Linkable | ✅ Yes | ❌ No |
| Proof Size | Smaller | Larger |
| Verification | Requires pk | No pk needed |

## Mathematical Details

### Generators

Pedersen VRF requires two independent generators $G$ and $B$:

$$
\log_G(B) = \text{unknown}
$$

If someone knew $x$ such that $B = x \cdot G$, they could:
- Forge commitments
- Break the binding property

### Security Assumption

Security relies on the **Discrete Log Problem**:

Given $G$ and $B = x \cdot G$, it's computationally hard to find $x$.

## Use Cases

### Anonymous Authentication

Prove you have valid credentials without revealing identity:

```python
# User proves membership without identification
proof = PedersenVRF.prove(challenge, user_secret_key, context)
```

### Private Voting

Cast verifiable votes without exposing voter identity:

```python
# Vote is verifiable but voter is anonymous
vote_proof = PedersenVRF.prove(ballot_id, voter_key, vote_choice)
```

### Unlinkable Tokens

Generate tokens that cannot be traced back:

```python
# Each token is unlinkable to the issuer's identity
token = PedersenVRF.prove(token_id, issuer_key, metadata)
```

## Further Reading

- Pedersen, T.P. (1992) - "Non-Interactive and Information-Theoretic Secure Verifiable Secret Sharing"
- [Bandersnatch VRF Specification](https://github.com/davxy/bandersnatch-vrf-spec)
