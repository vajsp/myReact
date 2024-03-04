import { resolvePkgPath, getPackageJSON, getBaseRollupPlugins } from './utils';
import generatePackageJSON from 'rollup-plugin-generate-package-json';

const { name, module } = getPackageJSON('react');
// react包路径
const pkgPath = resolvePkgPath(name);
// react产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
    // react
    {
        input: `${pkgPath}/${module}`,
        output: {
            file: `${pkgDistPath}/index.js`,
            name: 'index.js',
            format: 'umd',
        },
        plugins: [
            ...getBaseRollupPlugins(),
            generatePackageJSON({
                inputFolder: pkgPath,
                outputFolder: pkgDistPath,
                baseContents: ({ name, description, version }) => {
                    return { name, description, version, main: 'index.js' };
                },
            }),
        ],
    },
    // jsx-runtime
    {
        input: `${pkgPath}/src/jsx.ts`,
        output: [
            // jsx-runtime
            {
                file: `${pkgDistPath}/jsx-runtime.js`,
                name: 'jsx-runtime.js',
                formate: 'umd',
            },
            {
                file: `${pkgDistPath}/jsx-dev-runtime.js`,
                name: 'jsx-dev-runtime.js',
                formate: 'umd',
            },
        ],
        plugins: getBaseRollupPlugins(),
    },
];
