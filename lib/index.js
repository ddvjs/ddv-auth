'use strict'
// 工具
module.exports = auth
var util = require('../util')
var AuthSha256 = require('./AuthSha256')
Object.assign(auth, {
  util: util,
  AuthSha256: AuthSha256
})
function auth () {

}
