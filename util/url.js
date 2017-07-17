'use strict'
var util = require('./')
var url = require('./url.base.fn.js')
// 工具
module.exports = url
Object.assign(url, {
  build: function build (obj) {

  },
  parse: function parse (uri) {
    var r = {
      scheme: 'http',
      host: null,
      port: null,
      user: null,
      pass: null,
      path: '/',
      query: '',
      fragment: ''
    }
    var t = url('{}', uri || '/')
    r.scheme = t.protocol ? t.protocol : r.scheme
    r.host = t.hostname ? t.hostname : r.host
    r.port = t.port ? t.port : r.port
    r.user = t.user ? t.user : r.user
    r.pass = t.pass ? t.pass : r.pass
    r.path = t.path ? t.path : r.path
    r.query = t.query ? t.query : r.query
    r.fragment = t.hash ? t.hash : r.fragment
    return r
  },
  parseQuery: function parseQuery (query) {
    query = query || ''
  },
  buildQuery: function buildQuery (params, isQuery) {
    params = params || {}
    var r = url._buildParamsToArray(params, '').join('&')
    if (isQuery) {
      r = r.replace(/%20/gi, '+')
    }
    return r
  }
})

// urlEncode 编码
Object.assign(url, {
  // 编码对照数组表
  kEscapedMap: {
    '!': '%21',
    '\'': '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A'
  },
  // 编码
  urlDecode: function urlDecode (string) {
    return decodeURIComponent(string)
  },
  // 编码
  urlEncode: function urlEncode (string, encodingSlash) {
    var result = encodeURIComponent(string)
    result = result.replace(/[!'()*]/g, function ($1) {
      return url.kEscapedMap[$1]
    })
    if (encodingSlash === false) {
      result = result.replace(/%2F/gi, '/')
    }
    return result
  },
  // path编码
  urlEncodeExceptSlash: function urlEncodeExceptSlash (value) {
    return url.urlEncode(value, false)
  }
})

// 对象序列化
Object.assign(url, {
  _buildParamsToArray: function _buildParamsToArray (data, prefix) {
    var r = []
    var i, key, keyt, value
    if (typeof data === 'object') {
      // 数组
      if (util.isArray(data)) {
        for (i = 0; i < data.length; i++) {
          // 值
          value = data[i]
          if (value === void 0) continue
          // 键
          keyt = url._buildParamsAddPrefix(i, prefix, (typeof value === 'object'))
          // 递归处理对象和数组
          if (typeof value === 'object') {
            // 插入数组
            r.push.apply(r, url._buildParamsToArray(value, keyt))
          } else {
            // 插入数组
            r.push(url.urlEncode(keyt) + '=' + url.urlEncode(value))
          }
        }
      } else {
        for (key in data) {
          if (!Object.hasOwnProperty.call(data, key)) {
            continue
          }
          // 值
          value = data[key]
          if (value === void 0) continue
          // 键
          keyt = url._buildParamsAddPrefix(key, prefix)
          if (typeof value === 'object') {
            // 插入数组
            r.push.apply(r, url._buildParamsToArray(value, keyt))
          } else {
            // 插入数组
            r.push(url.urlEncode(keyt) + '=' + url.urlEncode(value))
          }
        }
      }
    }
    return r
  },
  _buildParamsAddPrefix: function _buildParamsAddPrefix (key, prefix, isNotArray) {
    if (prefix) {
      return prefix + '[' + (isNotArray !== false ? key : '') + ']'
    } else {
      return key
    }
  }
})
