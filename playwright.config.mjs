import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
    testDir: "./tests/browser",
    timeout: 30000,
    fullyParallel: true,
    reporter: [["list"]],
    outputDir: "test-results",
    use: {
        baseURL: "http://127.0.0.1:4174",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        timezoneId: "Europe/Madrid",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "webkit-phone", use: { ...devices["iPhone 13"], defaultBrowserType: "webkit" } },
    ],
    webServer: [
        {
            command: "npm run start:test -- --port 4174",
            url: "http://127.0.0.1:4174",
            reuseExistingServer: !process.env.CI,
        },
        {
            command: "npm start -- --port 4176",
            url: "http://127.0.0.1:4176",
            reuseExistingServer: !process.env.CI,
            env: { REACT_APP_FIREBASE_API_KEY: "" },
        },
    ],
});
