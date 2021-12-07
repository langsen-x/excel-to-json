import path from 'path'
import resolve from 'rollup-plugin-node-resolve' // 依赖引用插件
import {uglify} from 'rollup-plugin-uglify'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const getPath = _path => path.resolve(__dirname, _path)
const extensions = ['.ts']
// ts
const tsPlugin = typescript({
    tsconfig: getPath('./tsconfig.json'), // 导入本地ts配置
    tsconfigOverride: {compilerOptions: {module: 'es2015'}},
    extensions
})


// 基础配置
const config = {
    input: getPath('./src/index.ts'),
    output: {
        file: pkg.main,
        format: 'cjs',
    },
    plugins: [
        resolve({extensions}),
        uglify(),
        tsPlugin,
    ]
}
module.exports = config


