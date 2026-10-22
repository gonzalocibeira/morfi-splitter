const { TextDecoder, TextEncoder } = require("node:util");
Object.assign(globalThis, { TextDecoder, TextEncoder });
// Unit tests must not require a real Firebase credential or local .env file.
process.env.REACT_APP_FIREBASE_API_KEY = "unit-test-api-key";
HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
};
HTMLDialogElement.prototype.close = function () {
    this.open = false;
};
