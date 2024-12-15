Digits          ← ⌈ₙ10+1
Even            ← ¬◿2
Split           ← ⍜°⋕(↯2_∞)
Replace         ← ⨬(1◌|Split|×2024) ⊗1[⊃(=0|Even Digits)].
ReplaceAndGroup ← (
  °⊟              # uncouple counts from stone numbers
  ≡(□ Replace)    # replace each stone (into box)
  ≡◇⧻.            # count how many stones each stone generated (as X)
  ⊙▽:             # repeat the original stone counts by X (as Y)
  ⊟/◇⊂            # remove boxes from stone array, couple with counts
  ⊏⊙⍉⍏⊢.          # sort by the stone number & transpose
  ⊜□+1≡⊢.         # chunk by the stone number
  ⇌⍉≡(⊟⊙⊢/+:°⊟◇⍉) # sum up the counts for each chunk, take the first stone number, each chunk only had one unique stone number anyway
)
Blink ← (
  ⊙(⊟ :1)          # attach stone counts to stone array
  ⍥ReplaceAndGroup # repeat replacement by second argument
  /+⊢⇌             # sum the counts
)
Blink 25 125_17
Blink 25 ⊜⋕≠@ .▽≠@\n.&fras "input.txt"
Blink 75 ⊜⋕≠@ .▽≠@\n.&fras "input.txt"
