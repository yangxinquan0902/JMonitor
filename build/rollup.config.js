const path = require('path');
// 引入json插件
import json from 'rollup-plugin-json';

// rollup-plugin-node-resolve: 告诉 Rollup 如何查找外部模块
import resolvePlugin from 'rollup-plugin-node-resolve';

/*
 rollup-plugin-commonjs：将CommonJS模块转换为 ES2015 供 Rollup 处理，
 请注意，rollup-plugin-commonjs应该用在其他插件转换你的模块之前 - 这是为了防止其他插件的改变破坏CommonJS的检测
*/
import commonjs from 'rollup-plugin-commonjs';

// es6语法编译成了es5
import babel from 'rollup-plugin-babel';

import { terser } from "rollup-plugin-terser";


const resolve = function (filePath) {
    return path.join(__dirname, '..', filePath);
};



export default {
  // 入口文件
  input: resolve('src/index.js'), 

  // 出口文件
  output: { 
      file: resolve('dist/lib/index.js'),
      format: 'es',
      name: 'performanceApi',
  },

  // 在此处使用插件
  plugins: [ 
    commonjs(),
    resolvePlugin({
        // 将自定义选项传递给解析插件
        customResolveOptions: {
            moduleDirectory: 'node_modules'
        }
    }),
    json(),
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      runtimeHelpers: true,
    }),

    terser({ compress: { drop_console: false } })
  ]
};