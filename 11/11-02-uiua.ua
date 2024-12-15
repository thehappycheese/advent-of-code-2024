Digits    ← ⌈ₙ10+1
Even      ← ¬◿2
Split     ← ⍜°⋕(↯2_∞)
Replace   ← ⨬(1◌|Split|×2024) ⊗1[⊃(=0|Even Digits)].
Blink     ← /◇⊂°□∵(□Replace)
JoinBoxed ← /◇⊂
CountOcc  ← ≡/+⊞=.

Bonk ← (
  °⊟
  ∵(□ Replace)
  ≡◇⧻.
  /◇⊂:▽⊙:
  ⊃(◰|⊟ CountOcc).
  ⊙(⍉⍜⊢×)

  ⍉▽
  ⇌
)

Bunk ← (
  °⊟
  ∵(□ Replace)
  ≡◇⧻.
  ⊙▽:
  JoinBoxed
  ⊟
  ⊙⍉⍏⊢.
  ⊏
  ≡⊢.
  +1
  ⊜□
  ⇌⍉≡(⊟⊙⊢/+:°⊟◇⍉)
)
Process ← /+⊢⇌⍥Bunk :⊟ : 1:
Process 25 125_17
Process 25 ⊜⋕≠@ .▽≠@\n.&fras "input.txt"
Process 75 ⊜⋕≠@ .▽≠@\n.&fras "input.txt"
