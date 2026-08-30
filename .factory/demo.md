# Objective Loop demo sandbox

- Demo URL: `/demo`.
- First-use action: **Try it with sample data** opens the demo in one click.
- Sample: three learning objectives, three short-answer prompts, one evidence
  link, one prior review, two due prompts, and one upcoming prompt.
- Storage: IndexedDB database `objective-loop-demo`, with
  `demo:objective-loop:state` as its failure fallback. Real data remains in
  `objective-loop` / `objective-loop:state` and is never read in demo mode.
- **Reset demo** replaces demo changes with the original sample.
- **Start for real** deletes the demo namespace before returning to the real
  empty or existing notebook.

Older `?demo=1#/today` links redirect to `/demo` before the notebook opens.

The service worker caches the same application shell for both modes, so the
sample remains usable during an offline visit after the shell is installed.
