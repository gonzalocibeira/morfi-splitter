# UI rebuild verification — 22 October 2026

## Result

All four routes retain their original capabilities. The interface follows a restrained version of the [claymorphism reference](https://dummy.my/claymorphism), with neutral surfaces, sage/peach/lavender accents, shared controls, and persistent phone navigation. Participant names, categories, notes, EUR amounts, two-person settlement calculations, full-charge purchases, creation timestamps, and legacy amount compatibility are preserved.

The footer includes the original straw-hat artwork and a visible "Developed by Gonzalo Cibeira · 2022" credit on every screen.

Split and Details share the selected month for the current signed-in account. The selection starts on the local current month; Overview always uses the current month. Accounts remain provisioned externally.

## Reliability and usability

- Missing or invalid Firebase initialization produces a configuration message. Unexpected rendering failures have a reload action.
- Protected destinations survive login. Login errors and logout failures remain visible and retryable.
- Month requests deduplicate while pending, expire after 60 seconds, and revalidate on revisit or focus. Request and account guards apply to both fulfilled and rejected responses.
- Writes are locked by operation/document ID. Acknowledged edits and deletions update the local cache, then refresh independently. A refresh failure cannot turn a successful write into a failed save or invite duplicate submission.
- Expense creation and editing accept decimal commas or dots. Failed writes preserve input. Editing supports Enter to save and Cancel/Escape to discard changes.
- Deletion requires a named confirmation dialog, with focus containment, Escape cancellation, and return to the trigger.
- History renders 50 rows at a time; charts and settlements use the complete month. Chart aggregation and memoized chart components are unaffected by typing into an expense editor.
- Controls have visible labels/focus indicators and at least 44px interaction areas. Checkbox interaction includes its full label. Text wraps at narrow widths, with reduced-motion support and 200% text zoom checks.

## Mobile refinements

Screen titles are now Overview, Add expense, Split expenses, and Expense details. Slogans, promotional login copy, repeated form headings, and decorative heading icons on phones have been removed. The login inputs and button fit a 320 × 568px screen without scrolling.

The header and bottom navigation are shorter, the month picker uses one row, and cards, charts, and history rows use less vertical space. Input text remains at least 16px and touch targets remain at least 44px.

The expense save bar is fixed above the bottom navigation with reserved document space. Browser checks verify that the note field can scroll entirely above the bar and remain directly tappable. Keyboard handling supports both a shrinking visual viewport and a browser that resizes the entire page, including switching fields while the keyboard is open. Navigation returns each screen to the top.

## Production bundle comparison

Vite-reported decimal kB; gzip values use Vite's default compression measurement. The baseline was measured from the unchanged checkout before implementation.

| Asset                                                 |              Before raw / gzip |   After raw / gzip |
| ----------------------------------------------------- | -----------------------------: | -----------------: |
| Main JavaScript chunk                                 |             756.85 / 231.74 kB |  280.67 / 89.43 kB |
| Initial JavaScript including preloaded shared helpers |             756.85 / 231.74 kB |  289.04 / 92.69 kB |
| Details route chunk, excluding chart libraries        |              100.31 / 28.30 kB |     7.98 / 2.84 kB |
| Initial stylesheet                                    |                 5.60 / 1.66 kB |    21.17 / 5.77 kB |
| Deferred Firestore module                             | Included in initial JavaScript | 458.46 / 137.22 kB |

Initial compressed JavaScript is approximately 60% smaller. The new shared stylesheet is larger because it contains the complete responsive design. AOS's separate 25.93 kB stylesheet and SweetAlert's runtime were removed. Route and chart code remain lazy loaded. Authenticated sessions still load the Firestore SDK when they need it; it is deferred rather than eliminated.

## Validation

- 56 unit/component tests pass, up from the original 35. Coverage includes the preserved domain behavior, Firebase payloads, configuration errors, shared month state, account changes, request races, independent pending operations, duplicate submission, failed refreshes after committed writes, and dialog editing/deletion behavior.
- 36 browser checks pass across desktop Chromium and phone WebKit. They exercise all routes, login/logout, create/edit/delete, all chart views, month navigation, long content, loading/empty/error states, layout widths of 320/390/768/1440px, touch targets, keyboard focus, 200% text zoom, reduced motion, and keyboard viewport changes.
- The 1,000-expense fixture renders 50 rows initially, then 100 after “Show more.” Its charts include all 1,000 expenses across 20 days, with full category totals checked independently of the visible history.
- Production build succeeds, and `git diff --check` passes.

Sample local interaction timings from the 1,000-expense fixture, with two browser workers:

| Browser      | Details ready | Switch to category chart | Fill and observe edited amount |
| ------------ | ------------: | -----------------------: | -----------------------------: |
| Chromium     |        320 ms |                    92 ms |                          10 ms |
| Phone WebKit |        205 ms |                    42 ms |                          17 ms |

These are development-server wall-clock samples including fixture latency, lazy imports, and browser automation. They are not production latency guarantees or measurements on a physical phone. Each browser run writes fresh `performance.json` samples and screen captures under `test-results/`.

## Reproduce and limitations

Run `npm run test:ci`, `npm run build`, and `npm run test:browser` after `npx playwright install chromium webkit`. The implementation was verified on Node 26.10.0; the project's documented deployment runtime remains Node 24.

Browser data and Auth are replaced only by `vite.e2e.config.mjs`, invoked by `npm run start:test`. The regular production configuration never imports fixture modules. A separate browser check uses the real app configuration with no Firebase key to verify startup recovery and the absence of a Firestore download.

No live account or production expense data was used. Firestore rules were not changed; repository tests verify that the refactored writes preserve existing document paths, server creation timestamps, canonical cent fields, and removal of the legacy amount field on edit. Physical mobile keyboards and live Firebase connectivity still require device/account verification. Keyboard behavior in the automated suite uses a simulated visual viewport.

No data migration, deployment, publication, or Git commit was performed.
