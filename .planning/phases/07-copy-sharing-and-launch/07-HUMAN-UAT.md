---
status: partial
phase: 07-copy-sharing-and-launch
source: [07-07-PLAN.md, 07-VALIDATION.md]
started: 2026-11-12T00:00:00Z
updated: 2026-11-12T00:00:00Z
---

## Note

These checks are optional and non-blocking (D-12). Launch does not wait on them. They are a record of the human passes worth doing, and any failure is logged as a follow-up fix rather than a launch gate.

## Tests

### 1. Five-second test with someone new
steps: Show the live site (https://yahya-hallani.dev/) to someone who has not seen it for five seconds, then hide it.
expected: They can say who Yahya is, name one proof point, and say how to contact him.
result: [pending]

### 2. Screen-reader walk-through
steps: With VoiceOver (Safari) or NVDA (Firefox or Chrome), walk Index, one inner page, the Facturo deep dive and the 404. Check headings, landmarks, the letter links and the skip link.
expected: Each page announces a sensible heading and one main landmark; the letters read as links to named pages; the skip link works.
result: [pending]

### 3. LinkedIn Post Inspector
steps: After the launch deploy, run https://yahya-hallani.dev/ through LinkedIn Post Inspector (this also refreshes LinkedIn's cache).
expected: The share card, title and description show correctly.
result: [pending]

### 4. Favicon in browser tabs
steps: View the site in a light and a dark browser tab at 16px.
expected: The icon reads as a Y in both.
result: [pending]

### 5. Final copy on real phones
steps: Read every page on a real iPhone and a real Android phone.
expected: Copy reads well, nothing clips or wraps badly.
result: [pending]

### 6. Search Console sitemap (optional)
steps: After launch, submit https://yahya-hallani.dev/sitemap.xml in Google Search Console.
expected: Sitemap is accepted and all seven routes are discovered.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
