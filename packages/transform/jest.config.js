module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: [
        "<rootDir>/src"
    ],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    globals: {
        "window": {}
    }
};