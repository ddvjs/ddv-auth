module.exports = AuthSha256
var util = require('../../util')
var url = require('../../util/url')
var time = require('../../util/time')
var sign = require('../../util/sign')
var AuthSha256Prototype = {}
var urlKeys = 'scheme host user pass  port path query fragment'.split(' ')

function AuthSha256 (uri, method, authVersion, path, query, noSignQueryKeys, headers, noSignHeadersKeys) {
  if (this instanceof AuthSha256) {
    var agrs = util.argsToArray(arguments)
    return this.construct.apply(this, agrs)
  } else {
    return new AuthSha256(uri, method, authVersion, path, query, noSignQueryKeys, headers, noSignHeadersKeys)
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
    this.user = ''
    this.pass = ''
    this.host = ''
    this.fragment = ''
    this.query = {}
    this.noSignQueryKeys = []
    this.headers = {}
    this.noSignHeadersKeys = []
  },
  construct: function construct (uri, method, authVersion, path, query, noSignQueryKeys, headers, noSignHeadersKeys) {
    this.baseInit()
    this.setMethod(method || 'GET')
    this.setUri(uri || null)
    this.setPath(path || null)
    this.setQuery(query || {})
    this.setNoSignQueryKeys(noSignQueryKeys || [])
    this.setHeaders(headers || {})
    this.setNoSignHeadersKeys(noSignHeadersKeys || [])
    this.setAuthVersion(authVersion || 'ddv-auth-v1')
  },
  /**
   * 获取uri
   * @return {String} uri [请求对象]
   */
  getUri: function getUri () {
    var i, key
    var t = {}
    for (i = 0; i < urlKeys.length; i++) {
      key = urlKeys[i]
      if (key && this[key]) {
        t[key] = this[key]
      }
    }
    if (t.query) {
      // 编译get请求的参数
      t.query = url.buildQuery(t.query, true)
    }
    key = void 0
    // 编译生成url
    this.uri = url.build(t)
    return this.uri
  },
  /**
   * 设置uri
   * @param  {String}      uri [请求uri]
   * @return {AuthSha256} this [请求对象]
   */
  setUri: function setUri (uri) {
    var uriObj
    uri = uri || ''
    // 解析uri
    uriObj = url.parse(uri)
    if (typeof uriObj['host'] !== 'undefined' && uriObj['host']) {
      this.setHost(uriObj['host'])
    }
    if (typeof uriObj['user'] !== 'undefined' && uriObj['user']) {
      this.setHost(uriObj['user'])
    }
    if (typeof uriObj['pass'] !== 'undefined' && uriObj['pass']) {
      this.setHost(uriObj['pass'])
    }
    if (typeof uriObj['path'] !== 'undefined' && uriObj['path']) {
      this.setPath(uriObj['path'])
    }
    if (typeof uriObj['query'] !== 'undefined' && uriObj['query']) {
      this.setQuery(uriObj['query'])
    }
    if (typeof uriObj['fragment'] !== 'undefined' && uriObj['fragment']) {
      this.setFragment(uriObj['fragment'])
    }
    return this
  },
  /**
   * 设置fragment
   * @param  {String} fragment [description]
   * @return {AuthSha256} this [请求对象]
   */
  setFragment: function setFragment (fragment) {
    this.fragment = (typeof fragment === 'undefined' || (!fragment)) ? '' : fragment
    return this
  },
  /**
   * 设置path
   * @param  {String} path [相对跟路径]
   * @return {AuthSha256} this [请求对象]
   */
  setPath: function setPath (path) {
    // 解析uri
    var uriObj = url.parse(path)
    this.path = uriObj['path'] || this.path || '/'
    this.path = (this.path.charAt(0) === '/' ? '' : '/') + this.path
    if (uriObj['query']) {
      this.setQuery(url.parseQuery(uriObj['query']))
    }
    return this
  },
  setHost: function setHost (host) {
    this.host = (typeof host === 'undefined' || (!host)) ? '' : host
    return this
  },
  /**
   * 设置请求参数
   * @param  {Array}  query   [请求参数]
   * @param  {Boolean} isClean [是否清除原有的]
   * @return {AuthSha256} this [请求对象]
   */
  setQuery: function setQuery (query, isClean) {
    isClean = isClean || false

    if (typeof query !== 'undefined' && query && typeof query === 'string') {
      query = url.parseQuery(query)
    }
    if (isClean !== false) {
      this.query = []
    }
    this.query = util.extend(this.query, util.clone(query))
    return this
  },
  /**
   * 设置忽略签名的请求参数的key数组
   * @param  {Array}  query   [请求参数]
   * @param  {Noolean} isClean [是否清除原有的]
   * @return {AuthSha256} this [请求对象]
   */
  setNoSignQueryKeys: function setNoSignQueryKeys (noSignQueryKeys, isClean) {
    isClean = isClean || false

    if (isClean !== false) {
      this.noSignQueryKeys = []
    }

    if (typeof noSignQueryKeys === 'string') {
      this.noSignQueryKeys.push(noSignQueryKeys)
    } else if (Array.isArray(noSignQueryKeys)) {
      for (var i = 0, len = noSignQueryKeys.length; i < len; i++) {
        this.noSignQueryKeys.push(noSignQueryKeys[i])
      }
    }

    return this
  },
  /**
   * 设置请求头的数组
   * @param  {Array}  headers   [请求头]
   * @param  {Boolean} isClean [是否清除原有的]
   * @return {AuthSha256} this [请求对象]
   */
  setHeaders: function setHeaders (headers, isClean) {
    if (typeof headers === 'string' && typeof isClean !== 'undefined') {
      var headersTemp = {}
      headersTemp[headers] = isClean
      return this.setHeaders(headersTemp)
    }
    isClean = isClean || false

    if (isClean !== false) {
      this.headers = {}
    }

    if (typeof headers === 'object') {
      var keys = Object.keys(headers)
      var len = keys.length
      for (var i = 0; i < len; i++) {
        this.headers[keys[i]] = Array.isArray(headers[keys[i]]) ? headers[keys[i]].join('; ') : headers[keys[i]]
      }
    }

    return this
  },
  /**
   * 设置忽略签名的请求头的key数组
   * @param  {Array}  headers   [请求头key]
   * @param  {Boolean} isClean [是否清除原有的]
   * @return {AuthSha256} this [请求对象]
   */
  setNoSignHeadersKeys: function setNoSignHeadersKeys (noSignHeadersKeys, isClean) {
    isClean = isClean || false

    if (isClean !== false) {
      this.noSignHeadersKeys = []
    }

    if (typeof noSignHeadersKeys === 'string') {
      this.noSignHeadersKeys.push(noSignHeadersKeys.toLocaleLowerCase())
    } else if (Array.isArray(noSignHeadersKeys)) {
      for (var i = 0, len = noSignHeadersKeys.length; i < len; i++) {
        noSignHeadersKeys[i] = (typeof noSignHeadersKeys[i] === 'string' || typeof noSignHeadersKeys[i] === 'number') ? noSignHeadersKeys[i].toString() : ''
        this.noSignHeadersKeys.push(noSignHeadersKeys[i].toLocaleLowerCase())
      }
    }

    return this
  },
  setAuthVersion: function setAuthVersion (authVersion) {
    this.authVersion = authVersion
    return this
  },
  /**
   * 授权id
   * @param  {String} accessKeyId [授权id]
   * @return {AuthSha256} this [请求对象]
   */
  setAccessKeyId: function setAccessKeyId (accessKeyId) {
    this.accessKeyId = accessKeyId
    return this
  },
  /**
   * 授权key
   * @param  {String} accessKey [授权key]
   * @return {AuthSha256} this [请求对象]
   */
  setAccessKey: function setAccessKey (accessKey) {
    this.accessKey = accessKey
    return this
  },
  /**
   * 设置请求id
   * @param  {String} requestId [请求id]
   * @return {AuthSha256} this [请求对象]
   */
  setRequestId: function setRequestId (requestId) {
    this.requestId = requestId
    return this
  },
  /**
   * 设备cardid
   * @param  {String} deviceCard [设备cardid]
   * @return {AuthSha256} this [请求对象]
   */
  setDeviceCard: function setDeviceCard (deviceCard) {
    this.deviceCard = deviceCard
    return this
  },
  /**
   * 设置请求方式
   * @param  {String} method [请求方式]
   * @return {AuthSha256} this [请求对象]
   */
  setMethod: function setMethod (method) {
    this.method = method
    return this
  },
  /**
   * 设置过期时间偏移值
   * @param  {Int}                 expiredTimeOffset [description]
   * @return {AuthSha256} this [请求对象]
   */
  setExpiredTimeOffset: function setExpiredTimeOffset (expiredTimeOffset) {
    this.expiredTimeOffset = expiredTimeOffset
    return this
  },
  setSignTimeString: function setSignTimeString (signTimeString) {
    if (typeof signTimeString === 'number') {
      signTimeString = time.gmdate('Y-m-dTH:i:sZ', signTimeString)
    } else if (signTimeString instanceof Date) {
      signTimeString = time.gmdate('Y-m-dTH:i:sZ', parseInt(signTimeString.getTime() / 1000))
    }
    this.signTimeString = signTimeString
    return this
  },
  getSigningKey: function getSigningKey (authString) {
    if (authString) {
      authString = this.getAuthStringPrefix()
    }
    // 生成加密key
    var signingKey = sign.HmacSHA256(authString, this.accessKey)
    return signingKey
  },
  getAuthStringPrefix: function getAuthStringPrefix () {
    // 授权字符串
    var authString = this.authVersion
    if (this.requestId) {
      authString += ('/' + this.requestId)
    }
    authString += ('/' + this.accessKeyId)
    if (this.deviceCard) {
      authString += ('/' + this.deviceCard)
    }
    authString += ('/' + this.signTimeString + '/' + this.expiredTimeOffset)
    return authString
  },
  getAuthString: function getAuthString () {
    var authObj = this.getAuthArray()
    return authObj['authString']
  },
  checkSignTime: function checkSignTime () {
    // 签名时间
    var signTime = !this.signTimeString ? 0 : time.strtotime(this.signTimeString.toLocaleUpperCase())
    // 过期
    var expiredTimeOffset = !this.expiredTimeOffset ? 0 : parseInt(this.expiredTimeOffset)
    // 签名过期
    if (time.time() > (signTime + expiredTimeOffset)) {
      // 抛出过期
      throw new Error('Request authorization expired!', 'AUTHORIZATION_REQUEST_EXPIRED')
    } else if ((signTime - expiredTimeOffset) > time()) {
      // 签名期限还没有到
      throw new Error('Request authorization has not yet entered into force!', 'AUTHORIZATION_REQUEST_NOT_ENABLE')
    }
    return this
  },
  getAuthArray: function getAuthArray () {
    // 获取auth
    var authString = this.getAuthStringPrefix()
    // 生成临时key
    var signingKey = this.getSigningKey(authString)
    // 获取path
    var canonicalPath = url.urlEncodeExceptSlash(this.path)
    var keys, i, len

    var signQuery = {}
    keys = Object.keys(this.query)
    for (i = 0, len = keys.length; i < len; i++) {
      if (this.noSignQueryKeys.indexOf(keys[i]) <= -1) {
        signQuery[keys[i]] = this.query[keys[i]]
      }
    }

    // 重新排序编码
    var canonicalQuery = sign.canonicalQuerySort(url.buildQuery(signQuery))

    var signHeaders = {}
    keys = Object.keys(this.headers)
    for (i = 0, len = keys.length; i < len; i++) {
      keys[i] = (typeof keys[i] === 'string' || typeof keys[i] === 'number') ? keys[i].toString() : ''
      if (this.noSignHeadersKeys.indexOf(keys[i].toLocaleLowerCase()) <= -1) {
        signHeaders[keys[i]] = this.headers[keys[i]]
      }
    }
    // 通过
    keys = Object.keys(signHeaders)
    var signHeaderKeysStr = keys.join(';')
    // 获取签名头
    var canonicalHeaders = sign.getCanonicalHeaders(signHeaders)
    // 生成需要签名的信息体
    var canonicalRequest = this.method + '\n' + canonicalPath + '\n' + canonicalQuery + '\n' + canonicalHeaders

    // 服务端模拟客户端算出的签名信息
    var signMsg = sign.HmacSHA256(canonicalRequest, signingKey)
    // 组成最终签名串
    authString += ('/' + signHeaderKeysStr + '/' + signMsg)

    return {
      'requestId.server': this.requestId,
      'accessKeyId.server': this.accessKeyId,
      'accessKey.server': this.accessKey,
      'deviceCard.server': this.deviceCard,
      'signingKey.server': signingKey,
      'signHeaderKeysStr.server': signHeaderKeysStr,
      'canonicalRequest.server': canonicalRequest,
      'sign': signMsg,
      'authString': authString
    }
  }
})
