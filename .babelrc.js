module.exports = {
  presets: [
      [
          "@babel/preset-env",
          {
              "useBuiltIns": "usage", // 是否开启自动支持 polyfill
              "modules": false, // 模块使用 es modules ，不使用 commonJS 规范
          },
      ]
  ],
  plugins: [
      [
          "@babel/plugin-transform-runtime",
          {
              "corejs": 2 // 参考官方文档
          }
      ],
  ]
}