#!/usr/bin/env node
const { Command } = require('commander')
const sharp = require('sharp')
const fs = require('node:fs')
const chalk = require('chalk')
const path = require('path')

const program = new Command()
program
  .name('转换图片为Webp')
  .description('将jpg、png、gif等转换为Webp')
  .version('1.0.0')

program.option('-s,--source <source>', '源文件/目录')
program.option('-q,--quality <quality>', '图片质量', 75)
program.option('-d,--dist <dist>', '目标目录')

program.parse()
const options = program.opts()
let source = options.source || process.cwd()
const quality = parseInt(options.quality)
let dist = options.dist

const isPic = (file) => {
  if (typeof file !== 'string') return false
  return file.endsWith('.jpeg') || file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.gif')
}

const convert = ({ file, source = '.', quality = 75, dist }) => {

  const filename = file.replace(/\.(jpe?g|png|gif)$/, '')
  sharp(`${source}/${file}`).webp({ quality })
    .toFile(`${dist}/${filename}.webp`)
  console.log(chalk.green.bold(`${source}/${file} 转换为 ${dist}/${filename}.webp`))
}

const traverseFiles = () => {

  // 判断是否为目录
  if (fs.statSync(source).isDirectory()) {
    // 读取文件
    fs.readdir(source, (err, files) => {
      if (err) {
        console.log(chalk.red.bold(err))
        return
      }
      // 判断files是不是图片
      files.forEach(file => {
        if (!isPic(file)) return
        dist = dist || source
        if (!fs.existsSync(dist)) {
          fs.mkdirSync(dist)
        }
        convert({ file, source, quality, dist })
      })
    })
  } else if (fs.statSync(source).isFile()) {
    const file = source
    if (!isPic(source)) return
    // 获取系统的文件分隔符
    const sep = path.sep
    // 拆分文件名
    const arr = file.split(sep)
    const newSource = arr.slice(0, -1).join(sep)
    dist = dist || newSource
    if (!fs.existsSync(dist)) {
      fs.mkdirSync(dist)
    }
    convert({ file, source: newSource, quality, dist })
  } else {
    console.log(chalk.red.bold('没有找到该文件'))
  }
}

traverseFiles()

