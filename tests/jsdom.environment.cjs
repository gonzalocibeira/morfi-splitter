const { TestEnvironment } = require("jest-environment-jsdom");

// jsdom does not provide the Fetch API required by the Firebase Node SDK.
// Use Node's native implementation rather than adding a fetch polyfill.
module.exports = class extends TestEnvironment {
    async setup() {
        await super.setup();
        Object.assign(this.global, {
            fetch,
            Headers,
            Request,
            Response
        });
    }
};
