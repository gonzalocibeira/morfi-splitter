<h1>Morfi Splitter</h1>

<h3>A React SPA to split monthly costs between 2 people.</h3>

## Development

Use Node.js 24 (`nvm use`) and install the locked dependencies with `npm ci`.
Set `REACT_APP_FIREBASE_API_KEY` in `.env.local` or the Netlify environment.
The Vite build preserves this existing environment variable name.

- `npm start` starts the local development server.
- `npm run build` creates the production site in `build`.
- `npm run preview` serves the production build locally.
- `npm run test:ci` runs the unit and component tests.
- `npm run test:rules` runs Firestore rules tests; Java 21+ is required on `PATH`.
- `npm audit` checks production and development dependencies.

Netlify builds the `main` branch using Node.js 24 and the settings in `netlify.toml`.
The month selector uses the browser's native month input, with a `YYYY-MM`
text fallback in browsers that do not provide a month picker.

Security overrides in `package.json` keep Firebase's gRPC transport and CLI
dependencies patched until upstream adopts those versions. The CLI uses
Chokidar 4 to remove the unpatched `braces` dependency; its Firestore rules
watcher accepts a file path. Jest's coverage configuration loader uses
JS-YAML 4 to remove the unpatched `sprintf-js` chain. Recheck these overrides
when upgrading Firebase tools or Jest.
<br>

<h4><strong>---New users need to be added upon request, self-registration will come soon!---</strong></h4>
<br>

<p>Easy UI to add expenses</p>
<img src="https://iili.io/HSbYjNj.md.png" width=30% alt="Add new expenses">
<br>
<br>

<p>Total expenses on the current month</p>
<img src="https://iili.io/HSbYVSe.md.png" width=30% alt="Expenses by Category">
<br>
<br>

<p>Calculates who owes who!</p>
<img src="https://iili.io/HSblf9e.md.png" width=30% alt="Expenses by Category">
<br>
<br>

<p>Breakdown by day, category and user!</p>
<img src="https://iili.io/HSbYhAb.md.png" width=30% alt="Expenses by Category">
<img src="https://iili.io/HSbYXHu.md.png" width=30% alt="Expenses by Category">
<img src="https://iili.io/HSblBwb.md.png" width=30% alt="Expenses by Category">
<br>
<br>

<p>Detailed day-to-day overview</p>
<img src="https://iili.io/HSblqAu.md.png" width=30% alt="Expenses by Category">
<br>
<br>
