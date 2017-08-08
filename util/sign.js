var sign = {}
// 工具
var util = require('./')
var url = require('./url.js')
var cryptoJsCore = require('crypto-js/core')
var cryptoJsHex = require('crypto-js/enc-hex')
var cryptoJsBase64 = require('crypto-js/enc-base64')
// var cryptoJsHmacSha256 =
require('crypto-js/hmac-sha256')
// var cryptoJsMd5 =
require('crypto-js/md5')
module.exports = sign
Object.assign(sign, {
  canonicalQuerySort: function canonicalQuerySort (canonicalQuery) {
    // 拆分get请求的参数
    if ((!util.isArray(canonicalQuery)) && typeof canonicalQuery === 'object') {
      canonicalQuery = url.buildQuery(canonicalQuery, true)
    }
    if (typeof canonicalQuery === 'string') {
      canonicalQuery = canonicalQuery.split('&')
    }
    if (!util.isArray(canonicalQuery)) {
      canonicalQuery = (canonicalQuery || '').toString().split('&')
    }
    var i, len, temp, queryArray, tempIndex, key, value, r
    len = canonicalQuery.length
    queryArray = []
    for (i = 0; i < len; i++) {
      temp = canonicalQuery[i]
      if (!temp) {
        continue
      }
      tempIndex = temp.indexOf('=')
      if (tempIndex < 0) {
        continue
      }
      // 取得key
      key = util.trim(temp.substr(0, tempIndex))
      // 取得value
      value = util.trim(temp.substr(tempIndex + 1))
      // 去空格
      // 插入新数组
      queryArray.push(url.urlEncode(url.urlDecode(key)) + '=' + url.urlEncode(url.urlDecode(value)))
    }
    // 排序
    queryArray.sort()
    // 用&拼接
    r = queryArray.join('&')
    // 回收内存
    i = len = temp = queryArray = tempIndex = key = value = void 0

    return r
  },
  getCanonicalHeaders: function getCanonicalHeaders (signHeaders) {
    var r, canonicalHeader, key, value
    // 重新编码
    canonicalHeader = []
    for (key in signHeaders) {
      value = signHeaders[key]
      canonicalHeader.push((url.urlEncode(util.trim(key)) || '').toLowerCase() + ':' + url.urlEncode(util.trim(util.isArray(value) ? value.join('; ') : value)))
    }
    canonicalHeader.sort()
    // 服务器模拟客户端生成的头
    r = canonicalHeader.join('\n')
    canonicalHeader = key = value = void 0
    return r
  },
  getHeaderKeysByStr: function getHeaderKeysByStr (signHeaderKeys) {
    var key, value, signHeaderKeysNew
    if (typeof signHeaderKeys === 'string') {
      // 拆分头键名为数组 方便后期处理
      signHeaderKeys = signHeaderKeys.split(';')
    }
    if (!util.isArray(signHeaderKeys)) {
      signHeaderKeys = (signHeaderKeys || '').toString().split(';')
    }
    // 定义一个空数组来存储对授权头key预处理
    signHeaderKeysNew = []
    // 遍历授权头的key
    for (key in signHeaderKeys) {
      value = util.trim(signHeaderKeys[key])
      // 去空格
      util.inArray(value, signHeaderKeysNew) || signHeaderKeysNew.push(value)
    }
    // 把处理后的头的key覆盖原来的变量，释放内存
    signHeaderKeys = signHeaderKeysNew
    // 移除数组中重复的值
    key = value = signHeaderKeys = void 0
    return signHeaderKeysNew
  },
  createGuid: function createGuid (opt) {
    return (opt ? '{' : '') + util.createGuid() + (opt ? '}' : '')
  },
  md5Hex: function (str, isToString) {
    str = str || ''
    if (isToString !== false) {
      str = (str || '').toString()
    }
    return cryptoJsCore.MD5(str).toString(cryptoJsHex)
  },
  md5Base64: function (str, isToString) {
    str = str || ''
    if (isToString !== false) {
      str = (str || '').toString()
    }
    return cryptoJsCore.MD5(str).toString(cryptoJsBase64)
  },
  /**
   * HmacSHA256
   * @param    {String}               str        [description]
   * @param    {String}               key        [description]
   * @param    {Boolean}              isToString [description]
   */
  HmacSHA256: function (str, key, isToString) {
    str = str || ''
    if (isToString !== false) {
      str = (str || '').toString()
    }
    return cryptoJsCore.HmacSHA256(str, key).toString(cryptoJsHex)
  }
})
