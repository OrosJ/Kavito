export default {
    transform: {},
    testEnvironment: "node",
    moduleNameMapper: {
      "^(\\.{1,2}/.*)\\.js$": "$1"
    },
    setupFilesAfterEnv: ["./__tests__/setupTests.js"]
  };