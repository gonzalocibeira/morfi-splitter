// Test-only module replacement. This configuration is never used for production builds.
import { defineConfig, mergeConfig } from "vite";
import { fileURLToPath } from "node:url";
import baseConfig from "./vite.config.mjs";
export default defineConfig((env) => {
    if (env.mode !== "e2e") throw new Error("Browser fixtures require --mode e2e.");
    return mergeConfig(baseConfig(env), {
        define: { "process.env.REACT_APP_FIREBASE_API_KEY": JSON.stringify("browser-fixture-key") },
        plugins: [
            {
                name: "isolated-firebase-fixtures",
                enforce: "pre",
                resolveId(source) {
                    if (source === "firebase/auth")
                        return fileURLToPath(
                            new URL("./tests/browser/fixtures/auth.js", import.meta.url),
                        );
                    if (source.endsWith("/firebase/expenseStore"))
                        return fileURLToPath(
                            new URL("./tests/browser/fixtures/store.js", import.meta.url),
                        );
                },
            },
        ],
    });
});
