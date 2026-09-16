# Finish the fast-paced roulette + improvement ideas

## Finish what didn't save last turn

In `src/lib/generateHTML.ts` the timing constants were sped up (10s submit, 3s vote) but the user-facing text and animation timings still reflect the old slow values. Fix these:

1. **Toast labels** (lines ~666, 669)
   - `"🔗 Submit your link! (15s)"` → `"🔗 Submit your link! (10s)"`
   - `"👍 Vote now! (5s)"` → `"👍 Vote now! (3s)"`
2. **Spin animation duration** (line ~778): `const dur = 4000;` → `1800` so the wheel resolves in under 2s instead of 4.
3. **Overlay auto-close delay** (line ~709): `25000` → `6000` so the winner popup clears quickly and the next 30s idle starts feeling snappy.
4. **Vote-phase banner** already reads `"👍 VOTE (3s)"` — leave it.
5. Re-verify the `SUBMIT` banner still says `(10s)`.

No other files change. After the edit, re-download the HTML from the app for it to take effect locally.

## What would improve this (suggestions — pick any, I won't build unasked)

- **Live vote counts on the wheel slices** during the 3s vote phase so people can see momentum instead of a blind vote.
- **Skip idle when the room is empty**: if 0 online users, freeze the 30s idle timer so cycles don't burn while nobody's around.
- **Winner "shooter" fallback**: if the chosen shooter is offline or doesn't pick a target within ~8s, auto-blast a random online user so a cycle never stalls.
- **Anti-spam on `/send` `/corn` `/virus`**: per-tag rate limit (e.g. max 1 per 10s) so one user can't flood others outside the roulette.
- **Sound cues**: a short blip on phase change (submit / vote / spin / winner) — helps when the tab is disguised as Google Docs.
- **Persistent admin session**: remember admin mode in `sessionStorage` so a refresh doesn't force you to re-enter the key sequence.
- **Roulette history**: last 5 winning links + submitter tags in a small collapsible panel, so late joiners see what happened.
- **In-app preview parity**: `ChatRoom.tsx` currently has no roulette — mirror it so testing doesn't require downloading the HTML every time.

## Technical notes

Only `src/lib/generateHTML.ts` is edited. Four targeted line replacements, no structural changes, no schema or Cloud changes.
