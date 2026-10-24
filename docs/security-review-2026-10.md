# October 2026 security review

Reviewed on October 24, 2026 against the locked dependency tree and current vendor advisories following the incidents referred to as “Black October.”

## Findings and fixes

The initial `npm audit` reported three affected packages (two high, one moderate), all in the development-only `firebase-tools` dependency tree. These packages are not part of the browser application, but are used by local Firebase tooling. The lockfile now contains:

| Package | Previous | Patched | Advisory |
| --- | --- | --- | --- |
| `body-parser` | 1.20.8 / 2.3.0 | 1.20.9 / 2.4.0 | [Compressed request denial of service](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828) |
| `undici` | 6.29.0 / 8.11.2 | 6.29.1 / 8.12.3 | [Excessive content-encodings denial of service](https://github.com/nodejs/undici/security/advisories/GHSA-xjj6-f33q-929c), [EventSource memory exhaustion](https://github.com/nodejs/undici/security/advisories/GHSA-4qv8-2p9j-2685), [Subresource Integrity bypass](https://github.com/nodejs/undici/security/advisories/GHSA-f72v-6w45-q472) |
| `fast-uri` | 3.1.8 | 3.1.9 | [Scheme spoofing](https://github.com/fastify/fast-uri/security/advisories/GHSA-w74x-v6f9-j3xg), [path normalization](https://github.com/fastify/fast-uri/security/advisories/GHSA-xhq7-xmqj-769h), [host confusion](https://github.com/fastify/fast-uri/security/advisories/GHSA-wjr9-j795-jxcr), [scheme injection](https://github.com/fastify/fast-uri/security/advisories/GHSA-333x-w4r6-6crp) |

`qs` also moved from 6.16.0 to 6.16.1 to satisfy the patched parser's dependency range. No new dependency overrides or major application dependency upgrades were needed.

The [Node.js October 21 security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) fixes Brotli remote code execution (CVE-2026-111497), TLS/DNS validation flaws, other runtime issues, and updates CA certificates following the eMudhra incident. Updating an npm copy of `undici` does not patch Node's bundled runtime dependencies. `.nvmrc` and Netlify now select Node 24.22.1; `package.json` accepts patched Node 22.x (22.23.4+) or 24.x (24.22.1+), and `.npmrc` enables strict engine validation. These LTS lines also match the Firebase CLI's supported Node versions.

## Applicability and limits

This repository builds a static React 18/Vite site backed by Firebase. It does not contain PHP, Next.js, React Server Components, a self-managed GitLab installation, LiteLLM, TensorLake, or `@subql/common`. The [October Next.js advisories](https://nextjs.org/blog/nextjs-security-update-october-14-2026) and [PHP emergency release](https://www.php.net/releases/8_5_12.php) therefore do not require package changes here. The checked-in deployment configuration targets Netlify, with no Railway or Zeabur configuration found.

This is a repository dependency/runtime review, not a forensic investigation or an inspection of hosted accounts. No credential exposure was established. Live Firebase infrastructure, deployed rules, hosting account settings, and the runtime used by previous Netlify builds were not inspected or changed.

The machine's default Homebrew Node was 26.10.0 when checked and remains outside this project's patch. Verification uses an official Node 24.22.1 archive downloaded to a temporary directory and checked against Node's published SHA-256 checksum. For ongoing development, install/select the version in `.nvmrc` before running npm. Existing Node processes need to be restarted under a patched runtime.

## Validation

Checks ran under Node 24.22.1:

- Clean locked installation with `npm ci --ignore-scripts`: passed.
- `npm audit --json` and `npm audit --omit=dev --json`: zero reported vulnerabilities in both checks.
- `npm run test:ci`: 14 suites, 58 tests passed.
- `npm run build`: passed.
- `npm run test:browser`: 46 tests passed across desktop Chromium and phone WebKit.
- Firebase CLI version smoke check: 15.33.0, passed with a temporary configuration directory and CI mode to avoid writing to the user's global CLI configuration.
- Unsupported-runtime check: an offline npm install dry run under the default Node 26.10.0 was rejected with `EBADENGINE` before installation.
- `git diff --check`: passed.

The Firestore emulator rules suite was not run: no Java runtime is installed (`java -version` fails); the suite requires Java 21+. Firestore rules and application source were not changed. Browser tests use the existing isolated Firebase fixtures, not live accounts.

## Deployment follow-up

These are local changes. The next Netlify build using the updated configuration should select Node 24.22.1; confirm that version in the build log. No commit, push, or production deployment was performed as part of this review.
