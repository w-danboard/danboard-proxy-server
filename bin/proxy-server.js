#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')
const cli = require('../cli')

// 设置当前的脚手架版本号
program.version(pkg.version, '-v', '--version')
  .usage('<command> [options]')

// 控制台启动
program.command('start')
  .description('start server...')
  // .option('-f, --filters [filters], 以哪些开头的使用代理，并替换掉')
  .option('-s, --staticPath [staticPath], 静态文件根目录')
  .option('-t, --target [target], 需要代理到的服务地址')
  .option('-i, --index [index], 静态文件首页')
  .action(options => {
    cli.exec('start', options)
  })

// UI页面启动服务
program.command('ui')
  .description('start ui...')
  .action(options => {
    cli.exec('ui', options)
  })


program.parse(process.argv)