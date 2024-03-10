import { resolvePkgPath, getPackageJSON, getBaseRollupPlugins } from './utils';
import generatePackageJSON from 'rollup-plugin-generate-package-json';
import alias from '@rollup/plugin-alias';

const { name, module, peerDependencies } = getPackageJSON('react-dom');
// react-dom 包路径
const pkgPath = resolvePkgPath(name);
// react-dom 产物路径
const pkgDistPath = resolvePkgPath(name, true);

export default [
    // react-dom
    {
        input: `${pkgPath}/${module}`,
        output: [
            {
                file: `${pkgDistPath}/index.js`,
                name: 'index.js',
                format: 'umd',
            },
            {
                file: `${pkgDistPath}/client.js`,
                name: 'client.js',
                format: 'umd',
            },
        ],
        // 排除
        external: [...Object.keys(peerDependencies)],
        plugins: [
            ...getBaseRollupPlugins(),
            // webpack resolve alias
            alias({
                entries: {
                    hostConfig: `${pkgDistPath}/src/hostConfig.ts`,
                },
            }),
            generatePackageJSON({
                inputFolder: pkgPath,
                outputFolder: pkgDistPath,
                baseContents: ({ name, description, version }) => {
                    return {
                        name,
                        description,
                        version,
                        main: 'index.js',
                        peerDependencies: {
                            react: version,
                        },
                    };
                },
            }),
        ],
    },
];
