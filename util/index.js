'use strict'
// 导出模块
module.exports = util
if (typeof window !== 'undefined') {
  require('es5-shim')
  require('es6-shim')
}

// 创建最后总和
var createNewidSumLast = 0
// 创建最后时间
var createNewidTimeLast = 0
// 创建请求id
Object.assign(util, {
  createNewPid: function createNewid (is10) {
    var r
    if (createNewidTimeLast !== util.time()) {
      createNewidTimeLast = util.time()
      createNewidSumLast = 0
    }
    r = createNewidTimeLast.toString() + (++createNewidSumLast).toString()
    // 使用36进制
    if (!is10) {
      r = parseInt(r, 10).toString(36)
    }
    return r
  },
  // 生成guid
  createGuid: function createGuid (s) {
    return (s || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0
      var v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
})

// 生成请求id
Object.assign(util, {
  // 生成请求id
  createRequestId: function createRequestId () {
    var pid, rid, ridLen, ridT, ridNew, i
    // 获取16进制的 pid
    pid = Number(util.createNewPid(true)).toString(16)
    // 种子
    rid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    ridNew = ''
    for (i = rid.length - 1; i >= 0; i--) {
      ridT = rid[i]
      if (ridT === 'x') {
        ridLen = pid.length
        ridT = pid ? pid.charAt(ridLen - 1) : 'x'
        pid = pid.substr(0, ridLen - 1)
      }
      ridNew = ridT + ridNew
    }
    rid = util.createGuid(ridNew)
    i = ridNew = ridT = ridLen = pid = void 0
    return rid
  }
})

// 时间工具
Object.assign(util, {
  // 获取当前时间开始
  now: function now () {
    return (new Date()).getTime()
  },
  // 获取php的时间戳
  time: function time () {
    return parseInt(util.now() / 1000)
  },
  // 获取php的时间戳
  trim: function trim (t) {
    return t.toString().trim()
  }
})

// 基本判断
Object.assign(util, {
  // 判断是一个方法
  isFunction: function isFunction (fn) {
    return typeof fn === 'function'
  },
  // 判断是否为一个数组
  isArray: function isArray () {
    return Array.isArray.apply(this, arguments)
  },
  isNumber: function isNumber (obj) {
    return (typeof obj === 'string' || typeof obj === 'number') && (!util.isArray(obj) && (obj - parseFloat(obj) >= 0))
  },
  // 判断是否一个标准的global
  isGlobal: function isGlobal (obj) {
    return obj !== void 0 && obj === obj.global
  },
  // 类似php里面的inArray
  inArray: function inArray (a, b) {
    if (!util.isArray(b)) {
      return false
    }
    for (var i in b) {
      if (b[i] === a) {
        return true
      }
    }
    return false
  }
})

// 基本工具
Object.assign(util, {
  // 克隆
  clone: function clone (myObj) {
    var i, myNewObj
    if (!(myObj && typeof myObj === 'object')) {
      return myObj
    }
    if (myObj === null || myObj === undefined) {
      return myObj
    }
    myNewObj = ''
    if (util.isArray(myObj)) {
      myNewObj = []
      for (i = 0; i < myObj.length; i++) {
        myNewObj.push(myObj[i])
      }
    } else if (typeof myObj === 'object') {
      myNewObj = {}
      if (myObj.constructor && myObj.constructor !== Object) {
        myNewObj = myObj
      // 防止克隆ie下克隆  Element 出问题
      } else if (myObj.innerHTML !== undefined && myObj.innerText !== undefined && myObj.tagName !== undefined && myObj.tabIndex !== undefined) {
        myNewObj = myObj
      } else {
        for (i in myObj) {
          myNewObj[i] = clone(myObj[i])
        }
      }
    }
    return myNewObj
  },
  // 复制对象，通过制定key
  copyObjByKey: function copyObjByKey (oldObj, newObj, keys) {
    keys = keys || []
    keys.forEach(function (key) {
      oldObj[key] = newObj[key] || oldObj[key]
    })
  },
  // 设置错误id
  setErrorId: function setErrorId (errorId, error) {
    error.errorId = errorId
    error.error_id = errorId
    return error
  },
  // 参数强转数组
  argsToArray: function argsToArray (args) {
    return Array.prototype.slice.call(args)
  }
})

// nextTick
Object.assign(util, {
  nextTick: require('./nextTick.js')
})
// 类型
var class2type = (function () {
  var t = {}
  // Populate the class2type map
  'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach(function (name) {
    t[ '[object ' + name + ']' ] = name.toLowerCase()
  })
  return t
}())

Object.assign(util, {
  type: function type (obj, isType) {
    if (isType !== void 0) {
      return isType === util.type(obj)
    }
    if (obj === void 0) {
      return obj + ''
    }
    // Support: Android<4.0, iOS<6 (functionish RegExp)
    return (typeof obj === 'object' || typeof obj === 'function') ? class2type[ class2type.toString.call(obj) ] || 'object' : typeof obj
  },
  isPlainObject: function isPlainObject (obj) {
    // Not plain objects:
    // - Any object or value whose internal [[Class]] property is not "[object Object]"
    // - DOM nodes
    // - window
    if (util.type(obj) !== 'object' || obj.nodeType || util.isGlobal(obj)) {
      return false
    }

    if (obj.constructor && !Object.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
      return false
    }

    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true
  },
  extend: function extend () {
    var options, name, src, copy, copyIsArray, clone
    var target = arguments[ 0 ] || {}
    var i = 1
    var length = arguments.length
    var deep = false
    // Handle a deep copy situation
    if (typeof target === 'boolean') {
      deep = target

    // Skip the boolean and the target
      target = arguments[ i ] || {}
      i++
    }

    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== 'object' && !util.isFunction(target)) {
      target = {}
    }

    // Extend jQuery itself if only one argument is passed
    if (i === length) {
      target = this
      i--
    }

    for (; i < length; i++) {
      // Only deal with non-null/undefined values
      if ((options = arguments[i]) !== void 0) {
        // Extend the base object
        for (name in options) {
          src = target[ name ]
          copy = options[ name ]

          // Prevent never-ending loop
          if (target === copy) {
            continue
          }

          // Recurse if we're merging plain objects or arrays
          if (deep && copy && (util.isPlainObject(copy) || (copyIsArray = util.isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false
              clone = src && util.isArray(src) ? src : []
            } else {
              clone = src && util.isPlainObject(src) ? src : Object.create(null)
            }

            // Never move original objects, clone them
            target[name] = util.extend(deep, clone, copy)

          // Don't bring in undefined values
          } else if (copy !== undefined) {
            target[name] = copy
          }
        }
      }
    }

    // Return the modified object
    return target
  }
})

function util () {

}
