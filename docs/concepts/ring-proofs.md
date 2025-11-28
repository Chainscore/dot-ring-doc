---
id: ring-proofs
title: Ring Proofs & KZG
sidebar_position: 3
---

# Ring Proofs & KZG Commitments

Understanding the cryptographic mechanisms behind Ring VRF's anonymous membership proofs.

## What is a Ring Signature?

A **ring signature** proves that a message was signed by one member of a group (ring) without revealing which member:

```
Ring = {PK₁, PK₂, PK₃, ..., PKₙ}

Sign(sk_i, message, Ring) → signature

Verify(signature, message, Ring) → bool
```

The verifier learns:
- ✅ The signer is one of the ring members
- ❌ Which specific member signed (anonymous)

## Ring VRF

Ring VRF combines:
1. **Pedersen VRF** - Verifiable random output with blinded key
2. **Ring Signature** - Proves membership in a set

This enables **anonymous verifiable randomness** within a group.

## The Challenge: Efficient Ring Proofs

Traditional ring signatures scale linearly with ring size:

| Ring Size | Proof Size | Verify Time |
|-----------|------------|-------------|
| 10 | ~3 KB | ~10 ms |
| 100 | ~30 KB | ~100 ms |
| 1000 | ~300 KB | ~1 sec |

DotRing uses **KZG polynomial commitments** for constant-size proofs:

| Ring Size | Proof Size | Verify Time |
|-----------|------------|-------------|
| 10 | ~784 bytes | ~100 ms |
| 100 | ~784 bytes | ~100 ms |
| 1000 | ~784 bytes | ~100 ms |

## KZG Commitments

### What is KZG?

**KZG (Kate-Zaverucha-Goldberg)** is a polynomial commitment scheme using elliptic curve pairings.

Given a polynomial $f(x)$, KZG produces:
- A **commitment** $C$ (single group element)
- An **opening proof** that $f(z) = y$ for any point $z$

### How It Works

#### Setup (Trusted)

Generate powers of a secret $\tau$:

$$
\text{SRS} = (G, \tau G, \tau^2 G, ..., \tau^n G)
$$

The secret $\tau$ is destroyed after setup (trusted setup ceremony).

#### Commit

For polynomial $f(x) = \sum_i a_i x^i$:

$$
C = \sum_i a_i \cdot \tau^i G = f(\tau) \cdot G
$$

#### Open

To prove $f(z) = y$:

1. Compute quotient: $q(x) = \frac{f(x) - y}{x - z}$
2. Opening proof: $\pi = q(\tau) \cdot G$

#### Verify

Using pairings $e: G_1 \times G_2 \rightarrow G_T$:

$$
e(C - y \cdot G, H) = e(\pi, \tau H - z \cdot H)
$$

## Ring Membership as a Polynomial

### Key Insight

The ring $\{pk_1, pk_2, ..., pk_n\}$ can be encoded as polynomial evaluations:

$$
	ext{Key}(i) = pk_i, \quad i = 1, 2, \ldots, n
$$

Using Lagrange interpolation, there exists a unique polynomial $P(x)$ such that:

$$
P(\omega^i) = pk_i
$$

Where $\omega$ is an $n$-th root of unity.

### Proving Membership

The ring proof proves knowledge of secret index $k$ and blinding factor $t$ such that:

$$R = PK_k + t \cdot H$$

Where:
- $R$ is the blinded public key from the Pedersen proof ($\bar{Y}$)
- $PK_k$ is the prover's public key at index $k$ in the ring
- $t$ is the blinding factor
- $H$ is the blinding base point

The proof uses:
1. **Bits polynomial** $b(x)$ - Encodes the secret index $k$ and blinding $t$ in binary
2. **Conditional accumulator** - Computes $\sum_{i} b_i \cdot P_i$ using elliptic curve additions
3. **Inner product** - Ensures exactly one ring key is selected

## Plonk Protocol

DotRing uses **Plonk** (Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge) for constraint verification.

### Constraint System

The ring membership is expressed as arithmetic constraints:

```
pk_x = P_x(ω^k)  // x-coordinate matches
pk_y = P_y(ω^k)  // y-coordinate matches
pk = sk · G      // Valid key pair
```

### Prover

Generates:
- Column commitments ($C_x$, $C_y$, $C_z$)
- Quotient polynomial commitment ($C_q$)
- Evaluation proofs at challenge point $\zeta$
- Opening proofs ($W_x$, $W_z$)

### Verifier

Checks:
- Commitment openings are correct
- Constraint equations hold at $\zeta$
- Pairing equations verify

## Ring Root Structure

The **Ring Root** in DotRing consists of three KZG commitments (from the [Ring Proof Specification](https://github.com/davxy/ring-proof-spec)):

```python
class RingRoot:
    px: Column  # Commitment to x-coordinates of ring keys + blinding bases
    py: Column  # Commitment to y-coordinates of ring keys + blinding bases 
    s: Column   # Commitment to selector polynomial (1 for ring keys, 0 elsewhere)
```

Total size: 144 bytes (3 × 48-byte BLS12-381 G1 points)

## Proof Structure

A Ring VRF proof contains (based on the specifications):

| Component | Size | Purpose |
|-----------|------|---------|
| Pedersen Proof | 192 bytes | VRF output with blinded key (O, Y_bar, R, O_k, s, s_b) |
| Witness Commitments | 192 bytes | C_b, C_acc_ip, C_acc_x, C_acc_y |
| Zeta Evaluations | 224 bytes | p_x_zeta, p_y_zeta, s_zeta, b_zeta, acc_ip_zeta, acc_x_zeta, acc_y_zeta |
| Quotient Commitment | 48 bytes | C_q |
| Linearization Eval | 32 bytes | l_zeta_omega |
| Opening Proofs | 96 bytes | Pi_zeta, Pi_zeta_omega |
| **Total** | **~784 bytes** | Constant regardless of ring size |

## Security

### Soundness

An adversary cannot create a valid proof without:
- Knowing a secret key $sk$
- Having $pk = sk \cdot G$ in the ring

### Zero-Knowledge

The proof reveals nothing about:
- Which ring member signed
- The secret key value
- The index in the ring

### Assumptions

1. **Discrete Log** - Hard to find $sk$ from $pk$
2. **q-SDH** - Security of KZG commitments
3. **Random Oracle** - Fiat-Shamir transform

## BLS12-381 Pairing Curve

Ring VRF uses **BLS12-381** for KZG because it supports efficient pairings:

### Groups

- $G_1$: 48-byte points (commitments)
- $G_2$: 96-byte points (verification key)
- $G_T$: Target group (pairing result)

### Pairing

$$
e: G_1 \times G_2 \rightarrow G_T
$$

Properties:
- **Bilinear**: $e(aP, bQ) = e(P, Q)^{ab}$
- **Non-degenerate**: $e(G_1, G_2) \neq 1$

### Why Bandersnatch?

The Bandersnatch curve is **embedded** in BLS12-381's scalar field, enabling efficient:
- VRF operations on Bandersnatch
- Ring proofs using BLS12-381 pairings

## Trusted Setup

KZG requires a trusted setup (powers of tau):

```
SRS = (G, τG, τ²G, ..., τⁿG, H, τH)
```

DotRing uses the **Zcash Powers of Tau** ceremony, which had thousands of participants. The setup is secure if **at least one participant was honest**.

## Performance

| Operation | Time | Scales With |
|-----------|------|-------------|
| Ring Root Build | ~1-5s | Ring size |
| Proof Generation | ~2-5s | Ring size |
| Proof Verification | ~100ms | Constant |

The key advantage: **verification is constant time** regardless of ring size!

## Further Reading

- Kate, Zaverucha, Goldberg (2010) - "Constant-Size Commitments to Polynomials"
- Gabizon, Williamson, Ciobotaru (2019) - "PLONK: Permutations over Lagrange-bases"
- [Ring Proof Specification](https://github.com/davxy/ring-proof-spec)
- BCGSV23 - Ring VRF paper
