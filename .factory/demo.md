# Objective Loop demo sandbox

- Demo URLs: `/demo` and `/?demo=1`. Both open the same isolated sample
  notebook with the persistent **Demo — sample data, nothing is saved to your
  notebook** banner and **Reset demo** control.
- First-use action: **Try it with sample data** opens the demo in one click. The
  persistent navigation also offers **Try sample data** when a real notebook is
  already populated.
- Sample: three learning objectives, three short-answer prompts, one evidence
  link, one prior review, two due prompts, and one upcoming prompt.
- Storage: IndexedDB database `objective-loop-demo`, with
  `demo:objective-loop:state` as its failure fallback. Real data remains in
  `objective-loop` / `objective-loop:state` and is never read in demo mode.
- **Reset demo** replaces demo changes with the original sample.
- **Open my notebook** deletes the demo namespace before returning to the real
  empty or existing notebook. Its nearby note says that demo changes are
  discarded.

Older `?demo=1#/today` links redirect to `/demo` before the notebook opens.

The service worker caches the same application shell for both modes, so the
sample remains usable during an offline visit after the shell is installed.
