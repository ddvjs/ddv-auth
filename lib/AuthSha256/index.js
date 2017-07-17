'use strict'
module.exports = AuthSha256
var util = require('../../util')
var url = require('../../util/url')
// var sign = require('../../util/sign')
var AuthSha256Prototype = {}

function AuthSha256 (uri, method, authVersion, path, query, noSignQuery, headers, noSignHeaders) {
  if (this instanceof AuthSha256) {
    var agrs = util.argsToArray(arguments)
    return this.construct.apply(this, agrs)
  } else {
    return new AuthSha256(uri, method, authVersion, path, query, noSignQuery, headers, noSignHeaders)
  }
}
// 继承
AuthSha256.prototype = AuthSha256Prototype
Object.assign(AuthSha256Prototype, {
  baseInit: function baseInit () {
    this.authVersion = 'ddv-auth-v1'
    this.accessKeyId = ''
    this.accessKey = ''
    this.requestId = ''
    this.deviceCard = ''
    this.signTimeString = ''
    this.expiredTimeOffset = 1800
    this.method = 'GET'
    this.scheme = 'http'
    this.uri = ''
    this.host = ''
    this.fragment = ''
    this.query = []
    this.noSignQuery = []
    this.headers = []
    this.noSignHeaders = []
  },
  construct: function construct (uri, method, authVersion, path, query, noSignQuery, headers, noSignHeaders) {
    this.baseInit()
    this.setMethod(method || 'GET')
    this.setUri(uri || null)
    this.setPath(path || null)
    this.setQuery(query || [])
    this.setNoSignQuery(noSignQuery || [])
    this.setHeaders(headers || [])
    this.setNoSignHeaders(noSignHeaders || [])
    this.setAuthVersion(authVersion || 'ddv-auth-v1')
  },
  /**
   * 设置uri
   * @param string uri [访问资源地址]
   * @return AuthSha256 this [请求对象]
   */
  setUri: function setUri (uri = '') {
    var uriObj
    this.uri = uri
    // 解析uri
    uriObj = url.parse(uri);
    (typeof uriObj['host'] === 'undefined' || (!uriObj['host'])) || this.setHost(uriObj['host']);
    (typeof uriObj['path'] === 'undefined' || (!uriObj['path'])) || this.setPath(uriObj['path']);
    (typeof uriObj['query'] === 'undefined' || (!uriObj['query'])) || this.setQuery(uriObj['query']);
    (typeof uriObj['fragment'] === 'undefined' || (!uriObj['fragment'])) || this.setFragment(uriObj['fragment'])
    return this
  },
  /**
   * 设置fragment
   * @param [type] fragment [description]
   * @return AuthSha256 this [请求对象]
   */
  setFragment: function setFragment (fragment) {
    this.fragment = (typeof fragment === 'undefined' || (!fragment)) ? '' : fragment
    return this
  },
  /**
   * 设置path
   * @param string path [相对跟路径]
   * @return AuthSha256 this [请求对象]
   */
  setPath: function setPath (path) {
    this.path = (typeof path === 'undefined' || (!path)) ? '' : path
    return this
  },
  setHost: function setHost (host) {
    this.host = (typeof host === 'undefined' || (!host)) ? '' : host
    return this
  },
  /**
   * 设置请求参数
   * @param array  query   [请求参数]
   * @param boolean isClean [是否清除原有的]
   * @return AuthSha256 this [请求对象]
   */
  setQuery: function setQuery (query, isClean = false) {
    if (typeof query !== 'undefined' && query && typeof query === 'string') {
      query = url.parseQuery(query)
    }
    if (isClean !== false) {
      this.query = []
    }
    this.query = Object.assign(this.query, util.clone(query))
    return this
  }
})
