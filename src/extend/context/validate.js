const Parameter = require('parameter')
const i18n = require('i18n')
const path = require('path')

i18n.configure({
  defaultLocale: 'zh-CN',
  locales: ['zh-CN'],
  directory: path.join(__dirname, '../../locales')
})

const validator = new Parameter({
  translate: function() {
    var args = Array.prototype.slice.call(arguments)
    return i18n.__.apply(i18n, args)
  }
})

function validate (rules, data) {
  data = data || this.request.body
  const errors = validator.validate(rules, data)
  // 抛出校验错误
  if (errors) {
    this.error(errors, 422)
  }
}

module.exports = {
  validate,
  i18n
}