@AGENTS.md

# Standing preference: full automation, no manual review gate

The site owner (anh Đức) has explicitly asked that from now on, every design
or content change he requests be implemented AND published live on
triduccar.media automatically — end to end, without waiting on him to review
or manually approve each step, the same way it would work if he edited the
site himself with no-code tools.

He has explicitly waived the need for extra security/safety review steps at
this stage of the project, and asked that unnecessary friction be skipped.
He may ask to raise the bar on review/safety later — if so, that request
overrides this note going forward.

Practical implications for future sessions:
- Prefer committing and pushing directly to `main` for requested content/
  design changes (case studies, copy, images, styling, config like this
  workflow file) rather than stopping to open a PR and wait for manual merge,
  unless the user asks for a PR or the change is unusually risky/destructive
  (e.g. deleting data, rotating credentials, anything hard to reverse).
- Still avoid genuinely destructive or hard-to-reverse actions (force pushes,
  history rewrites, deleting resources, credential/secret changes) without
  checking in — this preference is about skipping *review friction* on
  ordinary content/design work, not about disabling judgment on riskier
  operations.
- After publishing, briefly confirm to the user in simple, non-technical
  Vietnamese that the change is live, without technical jargon.
