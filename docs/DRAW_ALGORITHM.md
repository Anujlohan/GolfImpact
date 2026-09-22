# Digital Heroes: Draw Engine Specification & Algorithmic Formulation

## Overview

Digital Heroes supports two distinct lottery draw calculation modes:
1. **Cryptographically Secure Random Draw (`RANDOM`)**
2. **Frequency-Weighted Deterministic Algorithmic Draw (`ALGORITHMIC`)**

Both algorithms draw **5 unique integers** from the closed integer interval $[1, 45]$:
$$S = \{n \in \mathbb{Z} \mid 1 \le n \le 45\}$$

---

## 1. Cryptographically Secure Random Draw (`RANDOM`)

The Random Draw uses standard unbiased pseudo-random number generation (PRNG) with cryptographic entropy:
- Generates 5 unique numbers uniformly from $S$.
- Every subset of size 5 has equal probability:
  $$P(\text{selection}) = \frac{1}{\binom{45}{5}} = \frac{1}{1,221,759} \approx 8.185 \times 10^{-7}$$

---

## 2. Frequency-Weighted Algorithmic Draw (`ALGORITHMIC`)

The PRD permits drawing numbers weighted by score frequency within the current active participant pool. Because the PRD does not fix a closed formula, this document formalizes the exact, deterministic mathematical procedure implemented in Digital Heroes.

### 2.1 Participant Snapshot Aggregation

Let $P = \{p_1, p_2, \dots, p_M\}$ be the set of eligible participants for the draw.
Each participant $p_i$ has a snapshot of exactly $K = 5$ distinct submitted scores:
$$V(p_i) = \{s_{i,1}, s_{i,2}, s_{i,3}, s_{i,4}, s_{i,5}\}, \quad s_{i,j} \in [1, 45]$$

### 2.2 Frequency Histogram

For each candidate number $n \in [1, 45]$, we compute its raw frequency across all eligible participant snapshots:
$$f(n) = \sum_{i=1}^{M} \mathbb{I}(n \in V(p_i))$$
where $\mathbb{I}(\cdot)$ is the indicator function ($1$ if true, $0$ otherwise).

Total occurrences across all numbers:
$$F_{\text{total}} = \sum_{n=1}^{45} f(n) = 5M$$

### 2.3 Laplace Smoothing & Weight Normalization

To prevent numbers that were never selected by any user ($f(n) = 0$) from having a probability of zero, additive Laplace smoothing ($\alpha = 1$) is applied:
$$\tilde{f}(n) = f(n) + \alpha = f(n) + 1$$

The normalized selection weight (probability mass) $w(n)$ for each number is:
$$w(n) = \frac{\tilde{f}(n)}{\sum_{k=1}^{45} \tilde{f}(k)} = \frac{f(n) + 1}{5M + 45}$$

### 2.4 Deterministic Pseudo-Random Sampling with Seed

To guarantee reproducibility and full auditability:
- A seed is constructed from the draw metadata:
  $$\text{Seed} = \text{SHA256}(\text{draw\_id} \mathbin{\Vert} \text{draw\_year} \mathbin{\Vert} \text{draw\_month} \mathbin{\Vert} \text{total\_pool\_amount})$$
- A seeded linear congruential or xoshiro256 generator samples 5 distinct numbers without replacement, where at each step $k \in \{1, 2, 3, 4, 5\}$, the probability of picking unselected number $x$ is:
  $$P(X_k = x) = \frac{w(x)}{\sum_{y \notin \{X_1, \dots, X_{k-1}\}} w(y)}$$

### 2.5 Audit Properties
1. **Reproducibility**: Given the participant snapshot table and the draw seed, anyone can verify the exact numbers generated.
2. **Determinism**: The simulation matches the final published draw if the participant snapshot is identical.
3. **Fairness**: Weight is strictly proportional to community activity with a positive floor for all 45 numbers.

---

## 3. Prize Tier Matching & Pool Distribution

### 3.1 Match Calculation
For a participant $p_i$ with snapshot $V(p_i)$ and winning numbers $W = \{w_1, w_2, w_3, w_4, w_5\}$:
$$m(p_i) = |V(p_i) \cap W|$$

Eligible tiers:
- **Tier 1 (5-Match)**: $m(p_i) = 5$
- **Tier 2 (4-Match)**: $m(p_i) = 4$
- **Tier 3 (3-Match)**: $m(p_i) = 3$

### 3.2 Prize Pool Splitting

Let $T$ be the total monthly prize pool amount (plus previous rollover $R_{\text{prev}}$).
$$T_{\text{effective}} = T + R_{\text{prev}}$$

Allocations:
- **5-Match Tier (40%)**: $A_5 = 0.40 \times T_{\text{effective}}$
- **4-Match Tier (35%)**: $A_4 = 0.35 \times T_{\text{effective}}$
- **3-Match Tier (25%)**: $A_3 = 0.25 \times T_{\text{effective}}$

Let $W_5, W_4, W_3$ be the number of winning participants in each respective tier.

- **Individual Payout**:
  $$\text{Payout}_k = \begin{cases} \lfloor \frac{A_k}{W_k} \rfloor & \text{if } W_k > 0 \\ 0 & \text{if } W_k = 0 \end{cases}$$

### 3.3 Jackpot Rollover Rule
If $W_5 = 0$ (no participant matches all 5 numbers), the entire 5-match tier allocation rolls over to the next month's jackpot:
$$R_{\text{next}} = A_5$$
If $W_4 = 0$ or $W_3 = 0$, unallocated funds are also added to the rollover buffer for future jackpots.
