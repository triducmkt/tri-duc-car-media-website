# Founder photo

`tang-tri-duc.png` is the live founder portrait, referenced by
`components/FounderPortrait.tsx` (falls back to a "TTĐ" monogram card if the
file is ever missing). Portrait orientation, at least 1200×1500px.

Current file is ~4.6MB — Next.js's image optimizer will resize/compress it
per breakpoint automatically, but a pre-compressed source (under ~1MB, saved
at 85% JPG/WebP quality) would speed up builds and keep git history smaller.
