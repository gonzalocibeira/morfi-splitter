module.exports = {
    testEnvironment: "<rootDir>/tests/jsdom.environment.cjs",
    roots: ["<rootDir>/src"],
    transform: { "^.+\\.[jt]sx?$": "babel-jest" },
    setupFiles: ["<rootDir>/tests/jest.setup.cjs"],
    moduleNameMapper: {
        "\\.(css)$": "<rootDir>/tests/style.mock.cjs",
        "\\.(png|jpg|svg)$": "<rootDir>/tests/file.mock.cjs"
    },
    clearMocks: true,
    resetMocks: true
};
