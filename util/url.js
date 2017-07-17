'use strict'
var util = require('./')
var url = require('./url.base.fn.js')
var parseStrByPhp = require('../util/parse_str')
// 工具
module.exports = url
Object.assign(url, {
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
    var r
    parseStrByPhp(query, r)
    return r
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
    result = result.replace(/[!'()*]/g, function (key) {
      return url.kEscapedMap[key]
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
Object.assign(url, {
  /**
   * Build a URL.
   *
   * The parts of the second URL will be merged into the first according to
   * the flags argument.
   *
   * @param mixed urli     (part(s) of) an URL in form of a string or
   *                       associative array like parse_url() returns
   * @param mixed parts   same as the first argument
   * @param int   flags   a bitmask of binary or'ed HTTP_URL constants;
   *                       HTTP_URL_REPLACE is the default
   * @param array new_url if set, it will be filled with the parts of the
   *                       composed url like parse_url() would return
   * @return string
   */
  build: function build (urli, parts, flags) {
    urli = urli || {}
    parts = parts || {}
    flags = flags || url.HTTP_URL_REPLACE
    typeof url === 'object' || (urli = url.parse(url))
    typeof parts === 'object' || (parts = url.parse(parts))

    // isset(urli['query']) && is_string(urli['query']) || urli['query'] = null;
    // isset(parts['query']) && is_string(parts['query']) || parts['query'] = null;

    var keys = ['user', 'pass', 'port', 'path', 'query', 'fragment']
    // $keys = array('user', 'pass', 'port', 'path', 'query', 'fragment');

    // HTTP_URL_STRIP_ALL and HTTP_URL_STRIP_AUTH cover several other flags.
    if (flags & url.HTTP_URL_STRIP_ALL) {
      flags |= url.HTTP_URL_STRIP_USER | url.HTTP_URL_STRIP_PASS |
        url.HTTP_URL_STRIP_PORT | url.HTTP_URL_STRIP_PATH |
        url.HTTP_URL_STRIP_QUERY | url.HTTP_URL_STRIP_FRAGMENT
    } else if (flags & url.HTTP_URL_STRIP_AUTH) {
      flags |= url.HTTP_URL_STRIP_USER | url.HTTP_URL_STRIP_PASS
    }

    // Schema and host are alwasy replaced
    var t = ['scheme', 'host']
    var i
    for (i = 0; i < t.length; i++) {
      if (parts && t[i] && parts[t[i]]) {
        urli[t[i]] = parts[t[i]]
      }
    }

    if (flags & url.HTTP_URL_REPLACE) {
      for (i = 0; i < keys.length; i++) {
        if (parts && keys[i] && parts[keys[i]]) {
          urli[keys[i]] = parts[keys[i]]
        }
      }
    } else {
      if (parts && parts['path'] && (flags & url.HTTP_URL_JOIN_PATH)) {
        if (urli && urli['path'] && (parts['path']).substr(0, 1) !== '/') {
          var leftTemp, rigthTemp
          // Workaround for trailing slashes
          leftTemp = rigthTemp = ''
          if (parts['path']) {
            parts['path'] = (parts['path'] || '').toString()
            i = parts['path'].indexOf('/')
            if (i > -1) {
              rigthTemp = parts['path'].substr(i + 1)
            }
          }
          if (urli['path']) {
            urli['path'] = (urli['path'] || '').toString()
            i = urli['path'].lastIndexOf('/')
            if (i > -1) {
              leftTemp = urli['path'].substr(0, i)
            }
          }
          urli['path'] = rigthTemp ? leftTemp : (leftTemp + '/' + rigthTemp)
        } else {
          urli['path'] = parts['path']
        }
      }

      if (parts && parts['query'] && (flags & url.HTTP_URL_JOIN_QUERY)) {
        if (urli && urli['query']) {
          var urliQuery = url.parseQuery(urli['query'])
          var partsQuery = url.parseQuery(parts['query'])
          urli['query'] = url.buildQuery(util.extend({}, urliQuery, partsQuery))
        } else {
          urli['query'] = parts['query']
        }
      }
    }

    if (urli && urli['path'] && urli['path'] !== '' && (urli['path'] || '').substr(0, 1) !== '/') {
      urli['path'] = '/'.urli['path']
    }

    var strip
    for (i = 0; i < keys.length; i++) {
      strip = 'HTTP_URL_STRIP_' + (keys[i] || '').toUpperCase()
      if (flags & url[strip]) {
        delete urli[keys[i] || '']
      }
    }

    var parsedString = ''

    if (urli['scheme']) {
      parsedString += urli['scheme'] + '://'
    }

    if (urli['user']) {
      parsedString += urli['user']

      if (urli['pass']) {
        parsedString += ':' + urli['pass']
      }

      parsedString += '@'
    }

    if (urli['host']) {
      parsedString += urli['host']
    }

    if (urli['port']) {
      parsedString += ':' + urli['port']
    }

    if (urli['path']) {
      parsedString += urli['path']
    }

    if (urli['query']) {
      parsedString += '?' + urli['query']
    }

    if (urli['fragment']) {
      parsedString += '#' + urli['fragment']
    }

    return parsedString
  }
})

Object.assign(url, {
  'HTTP_URL_REPLACE': 1,
  'HTTP_URL_JOIN_PATH': 2,
  'HTTP_URL_JOIN_QUERY': 4,
  'HTTP_URL_STRIP_USER': 8,
  'HTTP_URL_STRIP_PASS': 16,
  'HTTP_URL_STRIP_AUTH': 32,
  'HTTP_URL_STRIP_PORT': 64,
  'HTTP_URL_STRIP_PATH': 128,
  'HTTP_URL_STRIP_QUERY': 256,
  'HTTP_URL_STRIP_FRAGMENT': 512,
  'HTTP_URL_STRIP_ALL': 1024
})
