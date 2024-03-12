/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { defaults } = require('jest-config');

module.exports = {
    ...defaults,
    roots: [process.cwd()],
    modulePathIgnorePatterns: ['<rootDir>/.history'],
    moduleDirectories: [
        // 对于 React ReactDom
        'dist/node_modeules',
        // 对于第三方的依赖
        ...defaults.moduleDirectories,
    ],
    testEnvironment: 'jsdom',
};
