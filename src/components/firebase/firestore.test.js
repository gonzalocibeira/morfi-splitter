jest.mock("firebase/app", () => ({ initializeApp: jest.fn(() => ({})) }));
jest.mock("firebase/auth", () => ({ getAuth: jest.fn(() => ({})) }));
afterEach(() => {
    process.env.REACT_APP_FIREBASE_API_KEY = "unit-test-api-key";
});
test("missing Firebase configuration is exposed without calling initialization", () => {
    delete process.env.REACT_APP_FIREBASE_API_KEY;
    jest.isolateModules(() => {
        const config = require("./firestore");
        expect(config.auth).toBeNull();
        expect(config.firebaseConfigurationError).toMatch(/not configured/);
        expect(require("firebase/app").initializeApp).not.toHaveBeenCalled();
    });
});
test("invalid Firebase configuration is caught rather than crashing module loading", () => {
    jest.isolateModules(() => {
        require("firebase/auth").getAuth.mockImplementation(() => {
            throw new Error("invalid-api-key");
        });
        const config = require("./firestore");
        expect(config.auth).toBeNull();
        expect(config.firebaseConfigurationError).toMatch(/could not start/);
    });
});
