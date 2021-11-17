/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decodeBase64 = exports.lazyStatic = exports.memoizeByReference = exports.memoizeByShallowEquality = exports.objectsHaveShallowEquality = exports.noop = exports.binarySearch = exports.triangle = exports.fract = exports.formatPercent = exports.zeroPad = exports.itReduce = exports.itForEach = exports.itMap = exports.KeyedSet = exports.getOrThrow = exports.getOrElse = exports.getOrInsert = exports.sortBy = exports.lastOf = void 0;

function lastOf(ts) {
  return ts[ts.length - 1] || null;
}

exports.lastOf = lastOf;

function sortBy(ts, key) {
  function comparator(a, b) {
    const keyA = key(a);
    const keyB = key(b);
    return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
  }

  ts.sort(comparator);
}

exports.sortBy = sortBy;

function getOrInsert(map, k, fallback) {
  if (!map.has(k)) map.set(k, fallback(k));
  return map.get(k);
}

exports.getOrInsert = getOrInsert;

function getOrElse(map, k, fallback) {
  if (!map.has(k)) return fallback(k);
  return map.get(k);
}

exports.getOrElse = getOrElse;

function getOrThrow(map, k) {
  if (!map.has(k)) {
    throw new Error(`Expected key ${k}`);
  }

  return map.get(k);
}

exports.getOrThrow = getOrThrow;

class KeyedSet {
  constructor() {
    this.map = new Map();
  }

  getOrInsert(t) {
    const key = t.key;
    const existing = this.map.get(key);
    if (existing) return existing;
    this.map.set(key, t);
    return t;
  }

  forEach(fn) {
    this.map.forEach(fn);
  }

  [Symbol.iterator]() {
    return this.map.values();
  }

}

exports.KeyedSet = KeyedSet;

function* itMap(it, f) {
  for (let t of it) {
    yield f(t);
  }
}

exports.itMap = itMap;

function itForEach(it, f) {
  for (let t of it) {
    f(t);
  }
}

exports.itForEach = itForEach;

function itReduce(it, f, init) {
  let accum = init;

  for (let t of it) {
    accum = f(accum, t);
  }

  return accum;
}

exports.itReduce = itReduce;

function zeroPad(s, width) {
  return new Array(Math.max(width - s.length, 0) + 1).join('0') + s;
}

exports.zeroPad = zeroPad;

function formatPercent(percent) {
  let formattedPercent = `${percent.toFixed(0)}%`;
  if (percent === 100) formattedPercent = '100%';else if (percent > 99) formattedPercent = '>99%';else if (percent < 0.01) formattedPercent = '<0.01%';else if (percent < 1) formattedPercent = `${percent.toFixed(2)}%`;else if (percent < 10) formattedPercent = `${percent.toFixed(1)}%`;
  return formattedPercent;
}

exports.formatPercent = formatPercent;

function fract(x) {
  return x - Math.floor(x);
}

exports.fract = fract;

function triangle(x) {
  return 2.0 * Math.abs(fract(x) - 0.5) - 1.0;
}

exports.triangle = triangle;

function binarySearch(lo, hi, f, target, targetRangeSize = 1) {
  console.assert(!isNaN(targetRangeSize) && !isNaN(target));

  while (true) {
    if (hi - lo <= targetRangeSize) return [lo, hi];
    const mid = (hi + lo) / 2;
    const val = f(mid);
    if (val < target) lo = mid;else hi = mid;
  }
}

exports.binarySearch = binarySearch;

function noop(...args) {}

exports.noop = noop;

function objectsHaveShallowEquality(a, b) {
  for (let key in a) {
    if (a[key] !== b[key]) return false;
  }

  for (let key in b) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

exports.objectsHaveShallowEquality = objectsHaveShallowEquality;

function memoizeByShallowEquality(cb) {
  let last = null;
  return args => {
    let result;

    if (last == null) {
      result = cb(args);
      last = {
        args,
        result
      };
      return result;
    } else if (objectsHaveShallowEquality(last.args, args)) {
      return last.result;
    } else {
      last.args = args;
      last.result = cb(args);
      return last.result;
    }
  };
}

exports.memoizeByShallowEquality = memoizeByShallowEquality;

function memoizeByReference(cb) {
  let last = null;
  return args => {
    let result;

    if (last == null) {
      result = cb(args);
      last = {
        args,
        result
      };
      return result;
    } else if (last.args === args) {
      return last.result;
    } else {
      last.args = args;
      last.result = cb(args);
      return last.result;
    }
  };
}

exports.memoizeByReference = memoizeByReference;

function lazyStatic(cb) {
  let last = null;
  return () => {
    if (last == null) {
      last = {
        result: cb()
      };
    }

    return last.result;
  };
}

exports.lazyStatic = lazyStatic;
const base64lookupTable = lazyStatic(() => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const ret = new Map();

  for (let i = 0; i < alphabet.length; i++) {
    ret.set(alphabet.charAt(i), i);
  }

  ret.set('=', -1);
  return ret;
}); // NOTE: There are probably simpler solutions to this problem, but I have this written already, so
// until we run into problems with this, let's just use this.
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem#The_Unicode_Problem

function decodeBase64(encoded) {
  // Reference: https://www.rfc-editor.org/rfc/rfc4648.txt
  const lookupTable = base64lookupTable(); // 3 byte groups are represented as sequneces of 4 characters.
  //
  // "The encoding process represents 24-bit groups of input bits as output
  //  strings of 4 encoded characters."
  //
  // "Special processing is performed if fewer than 24 bits are available
  //  at the end of the data being encoded.  A full encoding quantum is
  //  always completed at the end of a quantity.  When fewer than 24 input
  //  bits are available in an input group bits with value zero are added
  //  (on the right) to form an integral number of 6-bit groups."

  if (encoded.length % 4 !== 0) {
    throw new Error(`Invalid length for base64 encoded string. Expected length % 4 = 0, got length = ${encoded.length}`);
  }

  const quartetCount = encoded.length / 4;
  let byteCount; // Special processing is performed if fewer than 24 bits are available
  // at the end of the data being encoded.  A full encoding quantum is
  // always completed at the end of a quantity.  When fewer than 24 input
  // bits are available in an input group, bits with value zero are added
  // (on the right) to form an integral number of 6-bit groups.  Padding
  // at the end of the data is performed using the '=' character.  Since
  // all base 64 input is an integral number of octets, only the following
  // cases can arise:
  //
  // (1) The final quantum of encoding input is an integral multiple of 24
  //     bits; here, the final unit of encoded output will be an integral
  //     multiple of 4 characters with no "=" padding.
  //
  // (2) The final quantum of encoding input is exactly 8 bits; here, the
  //     final unit of encoded output will be two characters followed by
  //     two "=" padding characters.
  //
  // (3) The final quantum of encoding input is exactly 16 bits; here, the
  //     final unit of encoded output will be three characters followed by
  //     one "=" padding character.

  if (encoded.length >= 4) {
    if (encoded.charAt(encoded.length - 1) === '=') {
      if (encoded.charAt(encoded.length - 2) === '=') {
        // Case (2)
        byteCount = quartetCount * 3 - 2;
      } else {
        // Case (3)
        byteCount = quartetCount * 3 - 1;
      }
    } else {
      // Case (1)
      byteCount = quartetCount * 3;
    }
  } else {
    // Case (1)
    byteCount = quartetCount * 3;
  }

  const bytes = new Uint8Array(byteCount);
  let offset = 0;

  for (let i = 0; i < quartetCount; i++) {
    const enc1 = encoded.charAt(i * 4 + 0);
    const enc2 = encoded.charAt(i * 4 + 1);
    const enc3 = encoded.charAt(i * 4 + 2);
    const enc4 = encoded.charAt(i * 4 + 3);
    const sextet1 = lookupTable.get(enc1);
    const sextet2 = lookupTable.get(enc2);
    const sextet3 = lookupTable.get(enc3);
    const sextet4 = lookupTable.get(enc4);

    if (sextet1 == null || sextet2 == null || sextet3 == null || sextet4 == null) {
      throw new Error(`Invalid quartet at indices ${i * 4} .. ${i * 4 + 3}: ${encoded.substring(i * 4, i * 4 + 3)}`);
    }

    bytes[offset++] = sextet1 << 2 | sextet2 >> 4;

    if (enc3 !== '=') {
      bytes[offset++] = (sextet2 & 15) << 4 | sextet3 >> 2;
    }

    if (enc4 !== '=') {
      bytes[offset++] = (sextet3 & 7) << 6 | sextet4;
    }
  }

  if (offset !== byteCount) {
    throw new Error(`Expected to decode ${byteCount} bytes, but only decoded ${offset})`);
  }

  return bytes;
}

exports.decodeBase64 = decodeBase64;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function () {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

__exportStar(__webpack_require__(6), exports);

__exportStar(__webpack_require__(10), exports);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ByteFormatter = exports.TimeFormatter = exports.RawValueFormatter = void 0;

const utils_1 = __webpack_require__(0);

class RawValueFormatter {
  constructor() {
    this.unit = 'none';
  }

  format(v) {
    return v.toLocaleString();
  }

}

exports.RawValueFormatter = RawValueFormatter;

class TimeFormatter {
  constructor(unit) {
    this.unit = unit;
    if (unit === 'nanoseconds') this.multiplier = 1e-9;else if (unit === 'microseconds') this.multiplier = 1e-6;else if (unit === 'milliseconds') this.multiplier = 1e-3;else this.multiplier = 1;
  }

  formatUnsigned(v) {
    const s = v * this.multiplier;

    if (s / 60 >= 1) {
      const minutes = Math.floor(s / 60);
      const seconds = Math.floor(s - minutes * 60).toString();
      return `${minutes}:${utils_1.zeroPad(seconds, 2)}`;
    }

    if (s / 1 >= 1) return `${s.toFixed(2)}s`;
    if (s / 1e-3 >= 1) return `${(s / 1e-3).toFixed(2)}ms`;
    if (s / 1e-6 >= 1) return `${(s / 1e-6).toFixed(2)}µs`;else return `${(s / 1e-9).toFixed(2)}ns`;
  }

  format(v) {
    return `${v < 0 ? '-' : ''}${this.formatUnsigned(Math.abs(v))}`;
  }

}

exports.TimeFormatter = TimeFormatter;

class ByteFormatter {
  constructor() {
    this.unit = 'bytes';
  }

  format(v) {
    if (v < 1024) return `${v.toFixed(0)} B`;
    v /= 1024;
    if (v < 1024) return `${v.toFixed(2)} KB`;
    v /= 1024;
    if (v < 1024) return `${v.toFixed(2)} MB`;
    v /= 1024;
    return `${v.toFixed(2)} GB`;
  }

}

exports.ByteFormatter = ByteFormatter;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
  'use strict'; // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

  /* istanbul ignore next */

  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(12)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(this, function ErrorStackParser(StackFrame) {
  'use strict';

  var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
  var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
  var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
  return {
    /**
     * Given an Error object, extract the most information from it.
     *
     * @param {Error} error object
     * @return {Array} of StackFrames
     */
    parse: function ErrorStackParser$$parse(error) {
      if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
        return this.parseOpera(error);
      } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
        return this.parseV8OrIE(error);
      } else if (error.stack) {
        return this.parseFFOrSafari(error);
      } else {
        throw new Error('Cannot parse given Error object');
      }
    },
    // Separate line and column numbers from a string of the form: (URI:Line:Column)
    extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
      // Fail-fast but return locations like "(native)"
      if (urlLike.indexOf(':') === -1) {
        return [urlLike];
      }

      var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
      var parts = regExp.exec(urlLike.replace(/[()]/g, ''));
      return [parts[1], parts[2] || undefined, parts[3] || undefined];
    },
    parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
      var filtered = error.stack.split('\n').filter(function (line) {
        return !!line.match(CHROME_IE_STACK_REGEXP);
      }, this);
      return filtered.map(function (line) {
        if (line.indexOf('(eval ') > -1) {
          // Throw away eval information until we implement stacktrace.js/stackframe#8
          line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
        }

        var sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '('); // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
        // case it has spaces in it, as the string is split on \s+ later on

        var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/); // remove the parenthesized location from the line, if it was matched

        sanitizedLine = location ? sanitizedLine.replace(location[0], '') : sanitizedLine;
        var tokens = sanitizedLine.split(/\s+/).slice(1); // if a location was matched, pass it to extractLocation() otherwise pop the last token

        var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
        var functionName = tokens.join(' ') || undefined;
        var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];
        return new StackFrame({
          functionName: functionName,
          fileName: fileName,
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
          source: line
        });
      }, this);
    },
    parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
      var filtered = error.stack.split('\n').filter(function (line) {
        return !line.match(SAFARI_NATIVE_CODE_REGEXP);
      }, this);
      return filtered.map(function (line) {
        // Throw away eval information until we implement stacktrace.js/stackframe#8
        if (line.indexOf(' > eval') > -1) {
          line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
        }

        if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
          // Safari eval frames only have function names and nothing else
          return new StackFrame({
            functionName: line
          });
        } else {
          var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
          var matches = line.match(functionNameRegex);
          var functionName = matches && matches[1] ? matches[1] : undefined;
          var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));
          return new StackFrame({
            functionName: functionName,
            fileName: locationParts[0],
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
            source: line
          });
        }
      }, this);
    },
    parseOpera: function ErrorStackParser$$parseOpera(e) {
      if (!e.stacktrace || e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
        return this.parseOpera9(e);
      } else if (!e.stack) {
        return this.parseOpera10(e);
      } else {
        return this.parseOpera11(e);
      }
    },
    parseOpera9: function ErrorStackParser$$parseOpera9(e) {
      var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
      var lines = e.message.split('\n');
      var result = [];

      for (var i = 2, len = lines.length; i < len; i += 2) {
        var match = lineRE.exec(lines[i]);

        if (match) {
          result.push(new StackFrame({
            fileName: match[2],
            lineNumber: match[1],
            source: lines[i]
          }));
        }
      }

      return result;
    },
    parseOpera10: function ErrorStackParser$$parseOpera10(e) {
      var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
      var lines = e.stacktrace.split('\n');
      var result = [];

      for (var i = 0, len = lines.length; i < len; i += 2) {
        var match = lineRE.exec(lines[i]);

        if (match) {
          result.push(new StackFrame({
            functionName: match[3] || undefined,
            fileName: match[2],
            lineNumber: match[1],
            source: lines[i]
          }));
        }
      }

      return result;
    },
    // Opera 10.65+ Error.stack very similar to FF/Safari
    parseOpera11: function ErrorStackParser$$parseOpera11(error) {
      var filtered = error.stack.split('\n').filter(function (line) {
        return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
      }, this);
      return filtered.map(function (line) {
        var tokens = line.split('@');
        var locationParts = this.extractLocation(tokens.pop());
        var functionCall = tokens.shift() || '';
        var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\([^)]*\)/g, '') || undefined;
        var argsRaw;

        if (functionCall.match(/\(([^)]*)\)/)) {
          argsRaw = functionCall.replace(/^[^(]+\(([^)]*)\)$/, '$1');
        }

        var args = argsRaw === undefined || argsRaw === '[arguments not available]' ? undefined : argsRaw.split(',');
        return new StackFrame({
          functionName: functionName,
          args: args,
          fileName: locationParts[0],
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
          source: line
        });
      }, this);
    }
  };
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function nullthrows(x, message) {
  if (x != null) {
    return x;
  }

  var error = new Error(message !== undefined ? message : 'Got unexpected ' + x);
  error.framesToPop = 1; // Skip nullthrows's own stack frame.

  throw error;
}

module.exports = nullthrows;
module.exports.default = nullthrows;
Object.defineProperty(module.exports, '__esModule', {
  value: true
});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }

  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
 true ? module.exports : undefined);

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importFromOldV8CPUProfile = exports.importFromChromeCPUProfile = exports.importFromChromeTimeline = exports.isChromeTimeline = void 0;

const profile_1 = __webpack_require__(7);

const utils_1 = __webpack_require__(0);

const value_formatters_1 = __webpack_require__(2);

const v8cpuFormatter_1 = __webpack_require__(9);

function isChromeTimeline(rawProfile) {
  if (!Array.isArray(rawProfile)) return false;
  if (rawProfile.length < 1) return false;
  const first = rawProfile[0];
  if (!('pid' in first && 'tid' in first && 'ph' in first && 'cat' in first)) return false;
  if (!rawProfile.find(e => e.name === 'CpuProfile' || e.name === 'Profile' || e.name === 'ProfileChunk')) return false;
  return true;
}

exports.isChromeTimeline = isChromeTimeline;

function importFromChromeTimeline(events, fileName) {
  // It seems like sometimes Chrome timeline files contain multiple CpuProfiles?
  // For now, choose the first one in the list.
  const cpuProfileByID = new Map(); // Maps profile IDs (like "0x3") to pid/tid pairs formatted as `${pid}:${tid}`

  const pidTidById = new Map(); // Maps pid/tid pairs to thread names

  const threadNameByPidTid = new Map(); // The events aren't necessarily recorded in chronological order. Sort them so
  // that they are.

  utils_1.sortBy(events, e => e.ts);

  for (let event of events) {
    if (event.name === 'CpuProfile') {
      const pidTid = `${event.pid}:${event.tid}`;
      const id = event.id || pidTid;
      cpuProfileByID.set(id, event.args.data.cpuProfile);
      pidTidById.set(id, pidTid);
    }

    if (event.name === 'Profile') {
      const pidTid = `${event.pid}:${event.tid}`;
      cpuProfileByID.set(event.id || pidTid, Object.assign({
        startTime: 0,
        endTime: 0,
        nodes: [],
        samples: [],
        timeDeltas: []
      }, event.args.data));

      if (event.id) {
        pidTidById.set(event.id, `${event.pid}:${event.tid}`);
      }
    }

    if (event.name === 'thread_name') {
      threadNameByPidTid.set(`${event.pid}:${event.tid}`, event.args.name);
    }

    if (event.name === 'ProfileChunk') {
      const pidTid = `${event.pid}:${event.tid}`;
      const cpuProfile = cpuProfileByID.get(event.id || pidTid);

      if (cpuProfile) {
        const chunk = event.args.data;

        if (chunk.cpuProfile) {
          if (chunk.cpuProfile.nodes) {
            cpuProfile.nodes = cpuProfile.nodes.concat(chunk.cpuProfile.nodes);
          }

          if (chunk.cpuProfile.samples) {
            cpuProfile.samples = cpuProfile.samples.concat(chunk.cpuProfile.samples);
          }
        }

        if (chunk.timeDeltas) {
          cpuProfile.timeDeltas = cpuProfile.timeDeltas.concat(chunk.timeDeltas);
        }

        if (chunk.startTime != null) {
          cpuProfile.startTime = chunk.startTime;
        }

        if (chunk.endTime != null) {
          cpuProfile.endTime = chunk.endTime;
        }
      } else {
        console.warn(`Ignoring ProfileChunk for undeclared Profile with id ${event.id || pidTid}`);
      }
    }
  }

  if (cpuProfileByID.size > 0) {
    const profiles = [];
    let indexToView = 0;
    utils_1.itForEach(cpuProfileByID.keys(), profileId => {
      let threadName = null;
      let pidTid = pidTidById.get(profileId);

      if (pidTid) {
        threadName = threadNameByPidTid.get(pidTid) || null;

        if (threadName) {}
      }

      const profile = importFromChromeCPUProfile(cpuProfileByID.get(profileId));

      if (threadName && cpuProfileByID.size > 1) {
        profile.setName(`${fileName} - ${threadName}`);

        if (threadName === 'CrRendererMain') {
          indexToView = profiles.length;
        }
      } else {
        profile.setName(`${fileName}`);
      }

      profiles.push(profile);
    });
    return {
      name: fileName,
      indexToView,
      profiles
    };
  } else {
    throw new Error('Could not find CPU profile in Timeline');
  }
}

exports.importFromChromeTimeline = importFromChromeTimeline;
const callFrameToFrameInfo = new Map();

function frameInfoForCallFrame(callFrame) {
  return utils_1.getOrInsert(callFrameToFrameInfo, callFrame, callFrame => {
    const name = callFrame.functionName || '(anonymous)';
    const file = callFrame.url;
    const line = callFrame.lineNumber;
    const col = callFrame.columnNumber;
    return {
      key: `${name}:${file}:${line}:${col}`,
      name,
      file,
      line,
      col
    };
  });
}

function shouldIgnoreFunction(callFrame) {
  const {
    functionName,
    url
  } = callFrame;

  if (url === 'native dummy.js') {
    // I'm not really sure what this is about, but this seems to be used
    // as a way of avoiding edge cases in V8's implementation.
    // See: https://github.com/v8/v8/blob/b8626ca4/tools/js2c.py#L419-L424
    return true;
  }

  return functionName === '(root)' || functionName === '(idle)';
}

function shouldPlaceOnTopOfPreviousStack(functionName) {
  return functionName === '(garbage collector)' || functionName === '(program)';
}

function importFromChromeCPUProfile(chromeProfile) {
  const profile = new profile_1.CallTreeProfileBuilder(chromeProfile.endTime - chromeProfile.startTime);
  const nodeById = new Map();

  for (let node of chromeProfile.nodes) {
    nodeById.set(node.id, node);
  }

  for (let node of chromeProfile.nodes) {
    if (typeof node.parent === 'number') {
      node.parent = nodeById.get(node.parent);
    }

    if (!node.children) continue;

    for (let childId of node.children) {
      const child = nodeById.get(childId);
      if (!child) continue;
      child.parent = node;
    }
  }

  const samples = [];
  const sampleTimes = []; // The first delta is relative to the profile startTime.
  // Ref: https://github.com/v8/v8/blob/44bd8fd7/src/inspector/js_protocol.json#L1485

  let elapsed = chromeProfile.timeDeltas[0]; // Prevents negative time deltas from causing bad data. See
  // https://github.com/jlfwong/speedscope/pull/305 for details.

  let lastValidElapsed = elapsed;
  let lastNodeId = NaN; // The chrome CPU profile format doesn't collapse identical samples. We'll do that
  // here to save a ton of work later doing mergers.

  for (let i = 0; i < chromeProfile.samples.length; i++) {
    const nodeId = chromeProfile.samples[i];

    if (nodeId != lastNodeId) {
      samples.push(nodeId);

      if (elapsed < lastValidElapsed) {
        sampleTimes.push(lastValidElapsed);
      } else {
        sampleTimes.push(elapsed);
        lastValidElapsed = elapsed;
      }
    }

    if (i === chromeProfile.samples.length - 1) {
      if (!isNaN(lastNodeId)) {
        samples.push(lastNodeId);

        if (elapsed < lastValidElapsed) {
          sampleTimes.push(lastValidElapsed);
        } else {
          sampleTimes.push(elapsed);
          lastValidElapsed = elapsed;
        }
      }
    } else {
      const timeDelta = chromeProfile.timeDeltas[i + 1];
      elapsed += timeDelta;
      lastNodeId = nodeId;
    }
  }

  let prevStack = [];

  for (let i = 0; i < samples.length; i++) {
    const value = sampleTimes[i];
    const nodeId = samples[i];
    let stackTop = nodeById.get(nodeId);
    if (!stackTop) continue; // Find lowest common ancestor of the current stack and the previous one

    let lca = null; // This is O(n^2), but n should be relatively small here (stack height),
    // so hopefully this isn't much of a problem

    for (lca = stackTop; lca && prevStack.indexOf(lca) === -1; lca = shouldPlaceOnTopOfPreviousStack(lca.callFrame.functionName) ? utils_1.lastOf(prevStack) : lca.parent || null) {} // Close frames that are no longer open


    while (prevStack.length > 0 && utils_1.lastOf(prevStack) != lca) {
      const closingNode = prevStack.pop();
      const frame = frameInfoForCallFrame(closingNode.callFrame);
      profile.leaveFrame(frame, value);
    } // Open frames that are now becoming open


    const toOpen = [];

    for (let node = stackTop; node && node != lca && !shouldIgnoreFunction(node.callFrame); // Place Chrome internal functions on top of the previous call stack
    node = shouldPlaceOnTopOfPreviousStack(node.callFrame.functionName) ? utils_1.lastOf(prevStack) : node.parent || null) {
      toOpen.push(node);
    }

    toOpen.reverse();

    for (let node of toOpen) {
      profile.enterFrame(frameInfoForCallFrame(node.callFrame), value);
    }

    prevStack = prevStack.concat(toOpen);
  } // Close frames that are open at the end of the trace


  for (let i = prevStack.length - 1; i >= 0; i--) {
    profile.leaveFrame(frameInfoForCallFrame(prevStack[i].callFrame), utils_1.lastOf(sampleTimes));
  }

  profile.setValueFormatter(new value_formatters_1.TimeFormatter('microseconds'));
  return profile.build();
}

exports.importFromChromeCPUProfile = importFromChromeCPUProfile;

function importFromOldV8CPUProfile(content) {
  return importFromChromeCPUProfile(v8cpuFormatter_1.chromeTreeToNodes(content));
}

exports.importFromOldV8CPUProfile = importFromOldV8CPUProfile;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function () {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);

  __setModuleDefault(result, mod);

  return result;
};

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallTreeProfileBuilder = exports.StackListProfileBuilder = exports.Profile = exports.CallTreeNode = exports.Frame = exports.HasWeights = void 0;

const utils_1 = __webpack_require__(0);

const value_formatters_1 = __webpack_require__(2);

const demangleCppModule = Promise.resolve().then(() => __importStar(__webpack_require__(8))); // Force eager loading of the module

demangleCppModule.then(() => {});

class HasWeights {
  constructor() {
    this.selfWeight = 0;
    this.totalWeight = 0;
  }

  getSelfWeight() {
    return this.selfWeight;
  }

  getTotalWeight() {
    return this.totalWeight;
  }

  addToTotalWeight(delta) {
    this.totalWeight += delta;
  }

  addToSelfWeight(delta) {
    this.selfWeight += delta;
  }

  overwriteWeightWith(other) {
    this.selfWeight = other.selfWeight;
    this.totalWeight = other.totalWeight;
  }

}

exports.HasWeights = HasWeights;

let Frame =
/** @class */
(() => {
  class Frame extends HasWeights {
    constructor(info) {
      super();
      this.key = info.key;
      this.name = info.name;
      this.file = info.file;
      this.line = info.line;
      this.col = info.col;
    }

    static getOrInsert(set, info) {
      return set.getOrInsert(new Frame(info));
    }

  }

  Frame.root = new Frame({
    key: '(speedscope root)',
    name: '(speedscope root)'
  });
  return Frame;
})();

exports.Frame = Frame;

class CallTreeNode extends HasWeights {
  constructor(frame, parent) {
    super();
    this.frame = frame;
    this.parent = parent;
    this.children = []; // If a node is "frozen", it means it should no longer be mutated.

    this.frozen = false;
  }

  isRoot() {
    return this.frame === Frame.root;
  }

  isFrozen() {
    return this.frozen;
  }

  freeze() {
    this.frozen = true;
  }

}

exports.CallTreeNode = CallTreeNode;

class Profile {
  constructor(totalWeight = 0) {
    this.name = '';
    this.frames = new utils_1.KeyedSet(); // Profiles store two call-trees.
    //
    // The "append order" call tree is the one in which nodes are ordered in
    // whatever order they were appended to their parent.
    //
    // The "grouped" call tree is one in which each node has at most one child per
    // frame. Nodes are ordered in decreasing order of weight

    this.appendOrderCalltreeRoot = new CallTreeNode(Frame.root, null);
    this.groupedCalltreeRoot = new CallTreeNode(Frame.root, null); // List of references to CallTreeNodes at the top of the
    // stack at the time of the sample.

    this.samples = [];
    this.weights = [];
    this.valueFormatter = new value_formatters_1.RawValueFormatter();
    this.totalNonIdleWeight = null;
    this.totalWeight = totalWeight;
  }

  getAppendOrderCalltreeRoot() {
    return this.appendOrderCalltreeRoot;
  }

  getGroupedCalltreeRoot() {
    return this.groupedCalltreeRoot;
  }

  formatValue(v) {
    return this.valueFormatter.format(v);
  }

  setValueFormatter(f) {
    this.valueFormatter = f;
  }

  getWeightUnit() {
    return this.valueFormatter.unit;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getTotalWeight() {
    return this.totalWeight;
  }

  getTotalNonIdleWeight() {
    if (this.totalNonIdleWeight === null) {
      this.totalNonIdleWeight = this.groupedCalltreeRoot.children.reduce((n, c) => n + c.getTotalWeight(), 0);
    }

    return this.totalNonIdleWeight;
  } // This is private because it should only be called in the ProfileBuilder
  // classes. Once a Profile instance has been constructed, it should be treated
  // as immutable.


  sortGroupedCallTree() {
    function visit(node) {
      node.children.sort((a, b) => -(a.getTotalWeight() - b.getTotalWeight()));
      node.children.forEach(visit);
    }

    visit(this.groupedCalltreeRoot);
  }

  forEachCallGrouped(openFrame, closeFrame) {
    function visit(node, start) {
      if (node.frame !== Frame.root) {
        openFrame(node, start);
      }

      let childTime = 0;
      node.children.forEach(function (child) {
        visit(child, start + childTime);
        childTime += child.getTotalWeight();
      });

      if (node.frame !== Frame.root) {
        closeFrame(node, start + node.getTotalWeight());
      }
    }

    visit(this.groupedCalltreeRoot, 0);
  }

  forEachCall(openFrame, closeFrame) {
    let prevStack = [];
    let value = 0;
    let sampleIndex = 0;

    for (let stackTop of this.samples) {
      // Find lowest common ancestor of the current stack and the previous one
      let lca = null; // This is O(n^2), but n should be relatively small here (stack height),
      // so hopefully this isn't much of a problem

      for (lca = stackTop; lca && lca.frame != Frame.root && prevStack.indexOf(lca) === -1; lca = lca.parent) {} // Close frames that are no longer open


      while (prevStack.length > 0 && utils_1.lastOf(prevStack) != lca) {
        const node = prevStack.pop();
        closeFrame(node, value);
      } // Open frames that are now becoming open


      const toOpen = [];

      for (let node = stackTop; node && node.frame != Frame.root && node != lca; node = node.parent) {
        toOpen.push(node);
      }

      toOpen.reverse();

      for (let node of toOpen) {
        openFrame(node, value);
      }

      prevStack = prevStack.concat(toOpen);
      value += this.weights[sampleIndex++];
    } // Close frames that are open at the end of the trace


    for (let i = prevStack.length - 1; i >= 0; i--) {
      closeFrame(prevStack[i], value);
    }
  }

  forEachFrame(fn) {
    this.frames.forEach(fn);
  }

  getProfileWithRecursionFlattened() {
    const builder = new CallTreeProfileBuilder();
    const stack = [];
    const framesInStack = new Set();

    function openFrame(node, value) {
      if (framesInStack.has(node.frame)) {
        stack.push(null);
      } else {
        framesInStack.add(node.frame);
        stack.push(node);
        builder.enterFrame(node.frame, value);
      }
    }

    function closeFrame(node, value) {
      const stackTop = stack.pop();

      if (stackTop) {
        framesInStack.delete(stackTop.frame);
        builder.leaveFrame(stackTop.frame, value);
      }
    }

    this.forEachCall(openFrame, closeFrame);
    const flattenedProfile = builder.build();
    flattenedProfile.name = this.name;
    flattenedProfile.valueFormatter = this.valueFormatter; // When constructing a profile with recursion flattened,
    // counter-intuitive things can happen to "self time" measurements
    // for functions.
    // For example, given the following list of stacks w/ weights:
    //
    // a 1
    // a;b;a 1
    // a;b;a;b;a 1
    // a;b;a 1
    //
    // The resulting profile with recursion flattened out will look like this:
    //
    // a 1
    // a;b 3
    //
    // Which is useful to view, but it's counter-intuitive to move self-time
    // for frames around, since analyzing the self-time of functions is an important
    // thing to be able to do accurately, and we don't want this to change when recursion
    // is flattened. To work around that, we'll just copy the weights directly from the
    // un-flattened profile.

    this.forEachFrame(f => {
      flattenedProfile.frames.getOrInsert(f).overwriteWeightWith(f);
    });
    return flattenedProfile;
  }

  getInvertedProfileForCallersOf(focalFrameInfo) {
    const focalFrame = Frame.getOrInsert(this.frames, focalFrameInfo);
    const builder = new StackListProfileBuilder(); // TODO(jlfwong): Could construct this at profile
    // construction time rather than on demand.

    const nodes = [];

    function visit(node) {
      if (node.frame === focalFrame) {
        nodes.push(node);
      } else {
        for (let child of node.children) {
          visit(child);
        }
      }
    }

    visit(this.appendOrderCalltreeRoot);

    for (let node of nodes) {
      const stack = [];

      for (let n = node; n != null && n.frame !== Frame.root; n = n.parent) {
        stack.push(n.frame);
      }

      builder.appendSampleWithWeight(stack, node.getTotalWeight());
    }

    const ret = builder.build();
    ret.name = this.name;
    ret.valueFormatter = this.valueFormatter;
    return ret;
  }

  getProfileForCalleesOf(focalFrameInfo) {
    const focalFrame = Frame.getOrInsert(this.frames, focalFrameInfo);
    const builder = new StackListProfileBuilder();

    function recordSubtree(focalFrameNode) {
      const stack = [];

      function visit(node) {
        stack.push(node.frame);
        builder.appendSampleWithWeight(stack, node.getSelfWeight());

        for (let child of node.children) {
          visit(child);
        }

        stack.pop();
      }

      visit(focalFrameNode);
    }

    function findCalls(node) {
      if (node.frame === focalFrame) {
        recordSubtree(node);
      } else {
        for (let child of node.children) {
          findCalls(child);
        }
      }
    }

    findCalls(this.appendOrderCalltreeRoot);
    const ret = builder.build();
    ret.name = this.name;
    ret.valueFormatter = this.valueFormatter;
    return ret;
  } // Demangle symbols for readability


  demangle() {
    return __awaiter(this, void 0, void 0, function* () {
      let demangleCpp = null;

      for (let frame of this.frames) {
        // This function converts a mangled C++ name such as "__ZNK7Support6ColorFeqERKS0_"
        // into a human-readable symbol (in this case "Support::ColorF::==(Support::ColorF&)")
        if (frame.name.startsWith('__Z')) {
          if (!demangleCpp) {
            demangleCpp = (yield demangleCppModule).demangleCpp;
          }

          frame.name = demangleCpp(frame.name);
        }
      }
    });
  }

  remapNames(callback) {
    for (let frame of this.frames) {
      frame.name = callback(frame.name);
    }
  }

}

exports.Profile = Profile;

class StackListProfileBuilder extends Profile {
  constructor() {
    super(...arguments);
    this.pendingSample = null;
  }

  _appendSample(stack, weight, useAppendOrder) {
    if (isNaN(weight)) throw new Error('invalid weight');
    let node = useAppendOrder ? this.appendOrderCalltreeRoot : this.groupedCalltreeRoot;
    let framesInStack = new Set();

    for (let frameInfo of stack) {
      const frame = Frame.getOrInsert(this.frames, frameInfo);
      const last = useAppendOrder ? utils_1.lastOf(node.children) : node.children.find(c => c.frame === frame);

      if (last && !last.isFrozen() && last.frame == frame) {
        node = last;
      } else {
        const parent = node;
        node = new CallTreeNode(frame, node);
        parent.children.push(node);
      }

      node.addToTotalWeight(weight); // It's possible for the same frame to occur multiple
      // times in the same call stack due to either direct
      // or indirect recursion. We want to avoid counting that
      // frame multiple times for a single sample, we so just
      // track all of the unique frames that participated in
      // this call stack, then add to their weight at the end.

      framesInStack.add(node.frame);
    }

    node.addToSelfWeight(weight);

    if (useAppendOrder) {
      for (let child of node.children) {
        child.freeze();
      }
    }

    if (useAppendOrder) {
      node.frame.addToSelfWeight(weight);

      for (let frame of framesInStack) {
        frame.addToTotalWeight(weight);
      }

      if (node === utils_1.lastOf(this.samples)) {
        this.weights[this.weights.length - 1] += weight;
      } else {
        this.samples.push(node);
        this.weights.push(weight);
      }
    }
  }

  appendSampleWithWeight(stack, weight) {
    if (weight === 0) {
      // Samples with zero weight have no effect, so let's ignore them
      return;
    }

    if (weight < 0) {
      throw new Error('Samples must have positive weights');
    }

    this._appendSample(stack, weight, true);

    this._appendSample(stack, weight, false);
  }

  appendSampleWithTimestamp(stack, timestamp) {
    if (this.pendingSample) {
      if (timestamp < this.pendingSample.centralTimestamp) {
        throw new Error('Timestamps received out of order');
      }

      const endTimestamp = (timestamp + this.pendingSample.centralTimestamp) / 2;
      this.appendSampleWithWeight(this.pendingSample.stack, endTimestamp - this.pendingSample.startTimestamp);
      this.pendingSample = {
        stack,
        startTimestamp: endTimestamp,
        centralTimestamp: timestamp
      };
    } else {
      this.pendingSample = {
        stack,
        startTimestamp: timestamp,
        centralTimestamp: timestamp
      };
    }
  }

  build() {
    if (this.pendingSample) {
      if (this.samples.length > 0) {
        this.appendSampleWithWeight(this.pendingSample.stack, this.pendingSample.centralTimestamp - this.pendingSample.startTimestamp);
      } else {
        // There is only a single sample. In this case, units will be meaningless,
        // so we'll append with a weight of 1 and also clear any value formatter
        this.appendSampleWithWeight(this.pendingSample.stack, 1);
        this.setValueFormatter(new value_formatters_1.RawValueFormatter());
      }
    }

    this.totalWeight = Math.max(this.totalWeight, this.weights.reduce((a, b) => a + b, 0));
    this.sortGroupedCallTree();
    return this;
  }

}

exports.StackListProfileBuilder = StackListProfileBuilder; // As an alternative API for importing profiles more efficiently, provide a
// way to open & close frames directly without needing to construct tons of
// arrays as intermediaries.

class CallTreeProfileBuilder extends Profile {
  constructor() {
    super(...arguments);
    this.appendOrderStack = [this.appendOrderCalltreeRoot];
    this.groupedOrderStack = [this.groupedCalltreeRoot];
    this.framesInStack = new Map();
    this.stack = [];
    this.lastValue = 0;
  }

  addWeightsToFrames(value) {
    const delta = value - this.lastValue;

    for (let frame of this.framesInStack.keys()) {
      frame.addToTotalWeight(delta);
    }

    const stackTop = utils_1.lastOf(this.stack);

    if (stackTop) {
      stackTop.addToSelfWeight(delta);
    }
  }

  addWeightsToNodes(value, stack) {
    const delta = value - this.lastValue;

    for (let node of stack) {
      node.addToTotalWeight(delta);
    }

    const stackTop = utils_1.lastOf(stack);

    if (stackTop) {
      stackTop.addToSelfWeight(delta);
    }
  }

  _enterFrame(frame, value, useAppendOrder) {
    let stack = useAppendOrder ? this.appendOrderStack : this.groupedOrderStack;
    this.addWeightsToNodes(value, stack);
    let prevTop = utils_1.lastOf(stack);

    if (prevTop) {
      if (useAppendOrder) {
        const delta = value - this.lastValue;

        if (delta > 0) {
          this.samples.push(prevTop);
          this.weights.push(value - this.lastValue);
        } else if (delta < 0) {
          throw new Error(`Samples must be provided in increasing order of cumulative value. Last sample was ${this.lastValue}, this sample was ${value}`);
        }
      }

      const last = useAppendOrder ? utils_1.lastOf(prevTop.children) : prevTop.children.find(c => c.frame === frame);
      let node;

      if (last && !last.isFrozen() && last.frame == frame) {
        node = last;
      } else {
        node = new CallTreeNode(frame, prevTop);
        prevTop.children.push(node);
      }

      stack.push(node);
    }
  }

  enterFrame(frameInfo, value) {
    const frame = Frame.getOrInsert(this.frames, frameInfo);
    this.addWeightsToFrames(value);

    this._enterFrame(frame, value, true);

    this._enterFrame(frame, value, false);

    this.stack.push(frame);
    const frameCount = this.framesInStack.get(frame) || 0;
    this.framesInStack.set(frame, frameCount + 1);
    this.lastValue = value;
  }

  _leaveFrame(frame, value, useAppendOrder) {
    let stack = useAppendOrder ? this.appendOrderStack : this.groupedOrderStack;
    this.addWeightsToNodes(value, stack);

    if (useAppendOrder) {
      const leavingStackTop = this.appendOrderStack.pop();

      if (leavingStackTop == null) {
        throw new Error(`Trying to leave ${frame.key} when stack is empty`);
      }

      if (this.lastValue == null) {
        throw new Error(`Trying to leave a ${frame.key} before any have been entered`);
      }

      leavingStackTop.freeze();

      if (leavingStackTop.frame.key !== frame.key) {
        throw new Error(`Tried to leave frame "${frame.name}" while frame "${leavingStackTop.frame.name}" was at the top at ${value}`);
      }

      const delta = value - this.lastValue;

      if (delta > 0) {
        this.samples.push(leavingStackTop);
        this.weights.push(value - this.lastValue);
      } else if (delta < 0) {
        throw new Error(`Samples must be provided in increasing order of cumulative value. Last sample was ${this.lastValue}, this sample was ${value}`);
      }
    } else {
      this.groupedOrderStack.pop();
    }
  }

  leaveFrame(frameInfo, value) {
    const frame = Frame.getOrInsert(this.frames, frameInfo);
    this.addWeightsToFrames(value);

    this._leaveFrame(frame, value, true);

    this._leaveFrame(frame, value, false);

    this.stack.pop();
    const frameCount = this.framesInStack.get(frame);
    if (frameCount == null) return;

    if (frameCount === 1) {
      this.framesInStack.delete(frame);
    } else {
      this.framesInStack.set(frame, frameCount - 1);
    }

    this.lastValue = value;
    this.totalWeight = Math.max(this.totalWeight, this.lastValue);
  }

  build() {
    // Each stack is expected to contain a single node which we initialize to be
    // the root node.
    if (this.appendOrderStack.length > 1 || this.groupedOrderStack.length > 1) {
      throw new Error('Tried to complete profile construction with a non-empty stack');
    }

    this.sortGroupedCallTree();
    return this;
  }

}

exports.CallTreeProfileBuilder = CallTreeProfileBuilder;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.demangleCpp = void 0;
let cppfilt;
const cache = new Map(); // This function converts a mangled C++ name such as "__ZNK7Support6ColorFeqERKS0_"
// into a human-readable symbol (in this case "Support::ColorF::==(Support::ColorF&)")

function demangleCpp(name) {
  if (name.startsWith('__Z')) {
    let result = cache.get(name);

    if (result !== undefined) {
      name = result;
    } else {
      if (!cppfilt) {
        cppfilt = new Function('exports', code)();
      }

      result = cppfilt(name.slice(1));
      result = result === '(null)' ? name : result;
      cache.set(name, result);
      name = result;
    }
  }

  return name;
}

exports.demangleCpp = demangleCpp; // This was taken from https://d.fuqu.jp/c++filtjs/

const code = `
return function(){function r(r){eval.call(null,r)}function a(r){throw print(r+":\\n"+(new Error).stack),ke=!0,"Assertion: "+r}function e(r,e){r||a("Assertion failed: "+e)}function i(r,a,i,v){function t(r,a){if("string"==a){var e=Oe;return le.stackAlloc(r.length+1),A(r,e),e}return r}function f(r,a){return"string"==a?s(r):r}try{func=ce.Module["_"+r]}catch(r){}e(func,"Cannot call unknown function "+r+" (perhaps LLVM optimizations or closure removed it?)");var _=0,n=v?v.map(function(r){return t(r,i[_++])}):[];return f(func.apply(null,n),a)}function v(r,a,e){return function(){return i(r,a,e,Array.prototype.slice.call(arguments))}}function t(r,e,i,v){switch(i=i||"i8","*"===i[i.length-1]&&(i="i32"),i){case"i1":Ae[r]=e;break;case"i8":Ae[r]=e;break;case"i16":ye[r>>1]=e;break;case"i32":Se[r>>2]=e;break;case"i64":Se[r>>2]=e;break;case"float":Ce[r>>2]=e;break;case"double":ze[0]=e,Se[r>>2]=xe[0],Se[r+4>>2]=xe[1];break;default:a("invalid type for setValue: "+i)}}function f(r,e,i){switch(e=e||"i8","*"===e[e.length-1]&&(e="i32"),e){case"i1":return Ae[r];case"i8":return Ae[r];case"i16":return ye[r>>1];case"i32":return Se[r>>2];case"i64":return Se[r>>2];case"float":return Ce[r>>2];case"double":return xe[0]=Se[r>>2],xe[1]=Se[r+4>>2],ze[0];default:a("invalid type for setValue: "+e)}return null}function _(r,a,e){var i,v;"number"==typeof r?(i=!0,v=r):(i=!1,v=r.length);var f="string"==typeof a?a:null,_=[Jr,le.stackAlloc,le.staticAlloc][void 0===e?we:e](Math.max(v,f?1:a.length));if(i)return Fa(_,0,v),_;for(var s,n=0;n<v;){var o=r[n];"function"==typeof o&&(o=le.getFunctionIndex(o)),s=f||a[n],0!==s?("i64"==s&&(s="i32"),t(_+n,o,s),n+=le.getNativeTypeSize(s)):n++}return _}function s(r,a){for(var e,i="undefined"==typeof a,v="",t=0,f=String.fromCharCode(0);;){if(e=String.fromCharCode(ge[r+t]),i&&e==f)break;if(v+=e,t+=1,!i&&t==a)break}return v}function n(r){for(var a="",e=0;e<r.length;e++)a+=String.fromCharCode(r[e]);return a}function o(r){return r+4095>>12<<12}function l(){for(;Le<=Ie;)Le=o(2*Le);var r=Ae,a=new ArrayBuffer(Le);Ae=new Int8Array(a),ye=new Int16Array(a),Se=new Int32Array(a),ge=new Uint8Array(a),me=new Uint16Array(a),Me=new Uint32Array(a),Ce=new Float32Array(a),Re=new Float64Array(a),Ae.set(r)}function b(r){for(;r.length>0;){var a=r.shift(),e=a.func;"number"==typeof e&&(e=pe[e]),e(void 0===a.arg?null:a.arg)}}function k(){b(Ve)}function u(){b(Be),be.print()}function c(r,a){return Array.prototype.slice.call(Ae.subarray(r,r+a))}function h(r,a){for(var e=new Uint8Array(a),i=0;i<a;++i)e[i]=Ae[r+i];return e.buffer}function d(r){for(var a=0;Ae[r+a];)a++;return a}function w(r,a){var e=d(r);a&&e++;var i=c(r,e);return a&&(i[e-1]=0),i}function p(r,a){for(var e=[],i=0;i<r.length;){var v=r.charCodeAt(i);v>255&&(v&=255),e.push(v),i+=1}return a||e.push(0),e}function E(r){for(var a=[],e=0;e<r.length;e++){var i=r[e];i>255&&(i&=255),a.push(String.fromCharCode(i))}return a.join("")}function A(r,a,e){for(var i=0;i<r.length;){var v=r.charCodeAt(i);v>255&&(v&=255),Ae[a+i]=v,i+=1}e||(Ae[a+i]=0)}function g(r,a,e,i){return r>=0?r:a<=32?2*Math.abs(1<<a-1)+r:Math.pow(2,a)+r}function y(r,a,e,i){if(r<=0)return r;var v=a<=32?Math.abs(1<<a-1):Math.pow(2,a-1);return r>=v&&(a<=32||r>v)&&(r=-2*v+r),r}function m(r,a,e){if(0==(0|r)|0==(0|a)|0==(0|e))var i=0;else{Se[r>>2]=0,Se[r+4>>2]=a,Se[r+8>>2]=e;var i=1}var i;return i}function S(r,a,e){if(0==(0|r)|(0|a)<0|0==(0|e))var i=0;else{Se[r>>2]=41,Se[r+4>>2]=a,Se[r+8>>2]=e;var i=1}var i;return i}function M(r,a,e){if(0==(0|r)|0==(0|e))var i=0;else{Se[r>>2]=6,Se[r+4>>2]=a,Se[r+8>>2]=e;var i=1}var i;return i}function C(r,a,e){if(0==(0|r)|0==(0|e))var i=0;else{Se[r>>2]=7,Se[r+4>>2]=a,Se[r+8>>2]=e;var i=1}var i;return i}function R(r,a){var e,i=0==(0|a);do if(i)var v=0;else{var e=(r+32|0)>>2,t=Se[e];if((0|t)>=(0|Se[r+36>>2])){var v=0;break}var f=(t<<2)+Se[r+28>>2]|0;Se[f>>2]=a;var _=Se[e]+1|0;Se[e]=_;var v=1}while(0);var v;return v}function T(r,a){var e,e=(r+12|0)>>2,i=Se[e],v=i+1|0;Se[e]=v;var t=Ae[i]<<24>>24==95;do if(t){var f=i+2|0;if(Se[e]=f,Ae[v]<<24>>24!=90){var _=0;break}var s=O(r,a),_=s}else var _=0;while(0);var _;return _}function O(r,a){var e=r+12|0,i=Ae[Se[e>>2]];r:do if(i<<24>>24==71||i<<24>>24==84)var v=Tr(r),t=v;else{var f=Ar(r),_=0==(0|f)|0==(0|a);do if(!_){if(0!=(1&Se[r+8>>2]|0))break;var s=Me[f>>2],n=(s-25|0)>>>0<3;a:do if(n)for(var o=f;;){var o,l=Me[o+4>>2],b=Me[l>>2];if((b-25|0)>>>0>=3){var k=l,u=b;break a}var o=l}else var k=f,u=s;while(0);var u,k;if(2!=(0|u)){var t=k;break r}var c=k+8|0,h=Me[c>>2],d=(Se[h>>2]-25|0)>>>0<3;a:do if(d)for(var w=h;;){var w,p=Me[w+4>>2];if((Se[p>>2]-25|0)>>>0>=3){var E=p;break a}var w=p}else var E=h;while(0);var E;Se[c>>2]=E;var t=k;break r}while(0);var A=Ae[Se[e>>2]];if(A<<24>>24==0||A<<24>>24==69){var t=f;break}var g=Or(f),y=Sr(r,g),m=D(r,3,f,y),t=m}while(0);var t;return t}function N(r){var a,e,i=Oe;Oe+=4;var v=i,e=v>>2,a=(r+12|0)>>2,t=Me[a],f=Ae[t],_=f<<24>>24;r:do if(f<<24>>24==114||f<<24>>24==86||f<<24>>24==75){var s=I(r,v,0);if(0==(0|s)){var n=0;break}var o=N(r);Se[s>>2]=o;var l=Se[e],b=R(r,l);if(0==(0|b)){var n=0;break}var n=Se[e]}else{do{if(97==(0|_)||98==(0|_)||99==(0|_)||100==(0|_)||101==(0|_)||102==(0|_)||103==(0|_)||104==(0|_)||105==(0|_)||106==(0|_)||108==(0|_)||109==(0|_)||110==(0|_)||111==(0|_)||115==(0|_)||116==(0|_)||118==(0|_)||119==(0|_)||120==(0|_)||121==(0|_)||122==(0|_)){var k=ai+20*(_-97)|0,u=P(r,k);Se[e]=u;var c=r+48|0,h=Se[c>>2]+Se[Se[u+4>>2]+4>>2]|0;Se[c>>2]=h;var d=Se[a]+1|0;Se[a]=d;var n=u;break r}if(117==(0|_)){Se[a]=t+1|0;var w=L(r),p=D(r,34,w,0);Se[e]=p;var E=p}else if(70==(0|_)){var A=F(r);Se[e]=A;var E=A}else if(48==(0|_)||49==(0|_)||50==(0|_)||51==(0|_)||52==(0|_)||53==(0|_)||54==(0|_)||55==(0|_)||56==(0|_)||57==(0|_)||78==(0|_)||90==(0|_)){var g=X(r);Se[e]=g;var E=g}else if(65==(0|_)){var y=j(r);Se[e]=y;var E=y}else if(77==(0|_)){var m=U(r);Se[e]=m;var E=m}else if(84==(0|_)){var S=x(r);if(Se[e]=S,Ae[Se[a]]<<24>>24!=73){var E=S;break}var M=R(r,S);if(0==(0|M)){var n=0;break r}var C=Se[e],T=z(r),O=D(r,4,C,T);Se[e]=O;var E=O}else if(83==(0|_)){var B=ge[t+1|0];if((B-48&255&255)<10|B<<24>>24==95|(B-65&255&255)<26){var H=V(r,0);if(Se[e]=H,Ae[Se[a]]<<24>>24!=73){var n=H;break r}var K=z(r),Y=D(r,4,H,K);Se[e]=Y;var E=Y}else{var G=X(r);if(Se[e]=G,0==(0|G)){var E=0;break}if(21==(0|Se[G>>2])){var n=G;break r}var E=G}}else if(80==(0|_)){Se[a]=t+1|0;var W=N(r),Z=D(r,29,W,0);Se[e]=Z;var E=Z}else if(82==(0|_)){Se[a]=t+1|0;var Q=N(r),q=D(r,30,Q,0);Se[e]=q;var E=q}else if(67==(0|_)){Se[a]=t+1|0;var $=N(r),J=D(r,31,$,0);Se[e]=J;var E=J}else if(71==(0|_)){Se[a]=t+1|0;var rr=N(r),ar=D(r,32,rr,0);Se[e]=ar;var E=ar}else{if(85!=(0|_)){var n=0;break r}Se[a]=t+1|0;var er=L(r);Se[e]=er;var ir=N(r),vr=Se[e],tr=D(r,28,ir,vr);Se[e]=tr;var E=tr}}while(0);var E,fr=R(r,E);if(0==(0|fr)){var n=0;break}var n=Se[e]}while(0);var n;return Oe=i,n}function I(r,a,e){for(var i,v=r+12|0,t=0!=(0|e),f=t?25:22,i=(r+48|0)>>2,_=t?26:23,s=t?27:24,n=a;;){var n,o=Se[v>>2],l=Ae[o];if(l<<24>>24!=114&&l<<24>>24!=86&&l<<24>>24!=75){var b=n;break}var k=o+1|0;if(Se[v>>2]=k,l<<24>>24==114){var u=Se[i]+9|0;Se[i]=u;var c=f}else if(l<<24>>24==86){var h=Se[i]+9|0;Se[i]=h;var c=_}else{var d=Se[i]+6|0;Se[i]=d;var c=s}var c,w=D(r,c,0,0);if(Se[n>>2]=w,0==(0|w)){var b=0;break}var n=w+4|0}var b;return b}function P(r,a){var e=0==(0|a);do if(e)var i=0;else{var v=J(r);if(0==(0|v)){var i=0;break}Se[v>>2]=33,Se[v+4>>2]=a;var i=v}while(0);var i;return i}function D(r,a,e,i){var v,t;do{if(1==(0|a)||2==(0|a)||3==(0|a)||4==(0|a)||10==(0|a)||28==(0|a)||37==(0|a)||43==(0|a)||44==(0|a)||45==(0|a)||46==(0|a)||47==(0|a)||48==(0|a)||49==(0|a)||50==(0|a)){if(0==(0|e)|0==(0|i)){var f=0;t=7;break}t=5;break}if(8==(0|a)||9==(0|a)||11==(0|a)||12==(0|a)||13==(0|a)||14==(0|a)||15==(0|a)||16==(0|a)||17==(0|a)||18==(0|a)||19==(0|a)||20==(0|a)||29==(0|a)||30==(0|a)||31==(0|a)||32==(0|a)||34==(0|a)||38==(0|a)||39==(0|a)||42==(0|a)){if(0==(0|e)){var f=0;t=7;break}t=5;break}if(36==(0|a)){if(0==(0|i)){var f=0;t=7;break}t=5;break}if(35==(0|a)||22==(0|a)||23==(0|a)||24==(0|a)||25==(0|a)||26==(0|a)||27==(0|a))t=5;else{var f=0;t=7}}while(0);do if(5==t){var _=J(r),v=_>>2;if(0==(0|_)){var f=0;break}Se[v]=a,Se[v+1]=e,Se[v+2]=i;var f=_}while(0);var f;return f}function L(r){var a=sr(r);if((0|a)<1)var e=0;else{var i=Rr(r,a);Se[r+44>>2]=i;var e=i}var e;return e}function F(r){var a,a=(r+12|0)>>2,e=Se[a],i=e+1|0;if(Se[a]=i,Ae[e]<<24>>24==70){if(Ae[i]<<24>>24==89){var v=e+2|0;Se[a]=v}var t=Sr(r,1),f=Se[a],_=f+1|0;Se[a]=_;var s=Ae[f]<<24>>24==69?t:0,n=s}else var n=0;var n;return n}function X(r){var a=Ar(r);return a}function j(r){var a,a=(r+12|0)>>2,e=Se[a],i=e+1|0;Se[a]=i;var v=Ae[e]<<24>>24==65;do if(v){var t=Ae[i];if(t<<24>>24==95)var f=0;else if((t-48&255&255)<10){for(var _=i;;){var _,s=_+1|0;if(Se[a]=s,(Ae[s]-48&255&255)>=10)break;var _=s}var n=s-i|0,o=lr(r,i,n);if(0==(0|o)){var l=0;break}var f=o}else{var b=nr(r);if(0==(0|b)){var l=0;break}var f=b}var f,k=Se[a],u=k+1|0;if(Se[a]=u,Ae[k]<<24>>24!=95){var l=0;break}var c=N(r),h=D(r,36,f,c),l=h}else var l=0;while(0);var l;return l}function U(r){var a=Oe;Oe+=4;var e=a,i=r+12|0,v=Se[i>>2],t=v+1|0;Se[i>>2]=t;var f=Ae[v]<<24>>24==77;r:do if(f){var _=N(r),s=I(r,e,1);if(0==(0|s)){var n=0;break}var o=N(r);Se[s>>2]=o;var l=(0|s)==(0|e);do if(!l){if(35==(0|Se[o>>2]))break;var b=Se[e>>2],k=R(r,b);if(0==(0|k)){var n=0;break r}}while(0);var u=Se[e>>2],c=D(r,37,_,u),n=c}else var n=0;while(0);var n;return Oe=a,n}function x(r){var a,a=(r+12|0)>>2,e=Se[a],i=e+1|0;Se[a]=i;var v=Ae[e]<<24>>24==84;do if(v){if(Ae[i]<<24>>24==95)var t=0,f=i;else{var _=sr(r);if((0|_)<0){var s=0;break}var t=_+1|0,f=Se[a]}var f,t;if(Se[a]=f+1|0,Ae[f]<<24>>24!=95){var s=0;break}var n=r+40|0,o=Se[n>>2]+1|0;Se[n>>2]=o;var l=Er(r,t),s=l}else var s=0;while(0);var s;return s}function z(r){var a,e=Oe;Oe+=4;var i=e,v=r+44|0,t=Se[v>>2],a=(r+12|0)>>2,f=Se[a],_=f+1|0;Se[a]=_;var s=Ae[f]<<24>>24==73;r:do if(s){Se[i>>2]=0;for(var n=i;;){var n,o=_r(r);if(0==(0|o)){var l=0;break r}var b=D(r,39,o,0);if(Se[n>>2]=b,0==(0|b)){var l=0;break r}var k=Se[a];if(Ae[k]<<24>>24==69)break;var n=b+8|0}var u=k+1|0;Se[a]=u,Se[v>>2]=t;var l=Se[i>>2]}else var l=0;while(0);var l;return Oe=e,l}function V(r,a){var e,e=(r+12|0)>>2,i=Se[e],v=i+1|0;Se[e]=v;var t=Ae[i]<<24>>24==83;r:do if(t){var f=i+2|0;Se[e]=f;var _=ge[v];if(_<<24>>24==95)var s=0;else{if(!((_-48&255&255)<10|(_-65&255&255)<26)){var n=8&Se[r+8>>2],o=n>>>3,l=0!=(0|n)|0==(0|a);do if(l)var b=o;else{if((Ae[f]-67&255&255)>=2){var b=o;break}var b=1}while(0);for(var b,k=0|ei;;){var k;if(k>>>0>=(ei+196|0)>>>0){var u=0;break r}if(_<<24>>24==Ae[0|k]<<24>>24)break;var k=k+28|0}var c=Se[k+20>>2];if(0!=(0|c)){var h=Se[k+24>>2],d=fr(r,c,h);Se[r+44>>2]=d}if(0==(0|b))var w=k+8|0,p=k+4|0;else var w=k+16|0,p=k+12|0;var p,w,E=Se[w>>2],A=Se[p>>2],g=r+48|0,y=Se[g>>2]+E|0;Se[g>>2]=y;var m=fr(r,A,E),u=m;break}for(var S=_,M=0,C=f;;){var C,M,S;if((S-48&255&255)<10)var R=36*M-48|0;else{if((S-65&255&255)>=26){var u=0;break r}var R=36*M-55|0}var R,T=(S<<24>>24)+R|0;if((0|T)<0){var u=0;break r}var O=C+1|0;Se[e]=O;var N=ge[C];if(N<<24>>24==95)break;var S=N,M=T,C=O}var s=T+1|0}var s;if((0|s)>=(0|Se[r+32>>2])){var u=0;break}var I=r+40|0,P=Se[I>>2]+1|0;Se[I>>2]=P;var u=Se[Se[r+28>>2]+(s<<2)>>2]}else var u=0;while(0);var u;return u}function B(r,a,e,i){var v,t,f,_,s=Oe;Oe+=28;var n,o=s,_=o>>2;Se[_]=r;var l=e+1|0,f=(o+12|0)>>2;Se[f]=l;var b=Jr(l),t=(o+4|0)>>2;if(Se[t]=b,0==(0|b))var k=0,u=1;else{var v=(o+8|0)>>2;Se[v]=0,Se[_+4]=0,Se[_+5]=0;var c=o+24|0;Se[c>>2]=0,H(o,a);var h=Me[t],d=0==(0|h);do{if(!d){var w=Me[v];if(w>>>0>=Me[f]>>>0){n=5;break}Se[v]=w+1|0,Ae[h+w|0]=0,n=6;break}n=5}while(0);5==n&&Y(o,0);var p=Se[t],E=0==(0|p)?Se[c>>2]:Se[f],k=p,u=E}var u,k;return Se[i>>2]=u,Oe=s,k}function H(r,a){var e,i,v,t,f,_,s,n,o,l,b,k,u,c,h,d,w,p,E,A,g,y,m,S,M,C,R,T,O,N,I,P,D,L,F,X,j,U,x,z,V,B,K,G,W,J,vr,tr,fr,_r,sr,nr,or,lr,br,kr,ur,cr,hr,dr,wr,pr=a>>2,Er=r>>2,Ar=Oe;Oe+=184;var gr,yr=Ar,wr=yr>>2,mr=Ar+64,dr=mr>>2,Sr=Ar+72,Mr=Ar+88,Cr=Ar+104,hr=Cr>>2,Rr=Ar+168,Tr=0==(0|a);r:do if(Tr)Z(r);else{var cr=(r+4|0)>>2,Or=Me[cr];if(0==(0|Or))break;var Nr=0|a,Ir=Me[Nr>>2];a:do{if(0==(0|Ir)){if(0!=(4&Se[Er]|0)){var Pr=Se[pr+1],Dr=Se[pr+2];q(r,Pr,Dr);break r}var ur=(r+8|0)>>2,Lr=Me[ur],Fr=a+8|0,Xr=Me[Fr>>2];if((Xr+Lr|0)>>>0>Me[Er+3]>>>0){var jr=Se[pr+1];Q(r,jr,Xr);break r}var Ur=Or+Lr|0,xr=Se[pr+1];Pa(Ur,xr,Xr,1);var zr=Se[ur]+Se[Fr>>2]|0;Se[ur]=zr;break r}if(1==(0|Ir)||2==(0|Ir)){var Vr=Se[pr+1];H(r,Vr);var Br=0==(4&Se[Er]|0),Hr=Me[cr],Kr=0!=(0|Hr);e:do if(Br){do if(Kr){var kr=(r+8|0)>>2,Yr=Me[kr];if((Yr+2|0)>>>0>Me[Er+3]>>>0)break;var Gr=Hr+Yr|0;oe=14906,Ae[Gr]=255&oe,oe>>=8,Ae[Gr+1]=255&oe;var Wr=Se[kr]+2|0;Se[kr]=Wr;break e}while(0);Q(r,0|He.__str120,2)}else{do if(Kr){var Zr=r+8|0,Qr=Me[Zr>>2];if(Qr>>>0>=Me[Er+3]>>>0)break;Se[Zr>>2]=Qr+1|0,Ae[Hr+Qr|0]=46;break e}while(0);Y(r,46)}while(0);var qr=Se[pr+2];H(r,qr);break r}if(3==(0|Ir)){for(var br=(r+20|0)>>2,$r=Me[br],lr=(r+16|0)>>2,Jr=a,ra=0,aa=$r;;){var aa,ra,Jr,ea=Me[Jr+4>>2];if(0==(0|ea)){var ia=ra,va=0;gr=33;break}if(ra>>>0>3){Z(r);break r}var ta=(ra<<4)+yr|0;Se[ta>>2]=aa,Se[br]=ta,Se[((ra<<4)+4>>2)+wr]=ea,Se[((ra<<4)+8>>2)+wr]=0;var fa=Me[lr];Se[((ra<<4)+12>>2)+wr]=fa;var _a=ra+1|0,sa=0|ea,na=Me[sa>>2];if((na-25|0)>>>0>=3){gr=25;break}var Jr=ea,ra=_a,aa=ta}e:do if(25==gr){if(4==(0|na)){Se[dr]=fa,Se[lr]=mr,Se[dr+1]=ea;var oa=Se[sa>>2],la=mr}else var oa=na,la=fa;var la,oa;if(2!=(0|oa)){var ia=_a,va=sa;break}for(var ba=_a,ka=ea+8|0;;){var ka,ba,ua=Me[ka>>2];if((Se[ua>>2]-25|0)>>>0>=3){var ia=ba,va=sa;break e}if(ba>>>0>3)break;var ca=(ba<<4)+yr|0,ha=ba-1|0,da=(ha<<4)+yr|0,or=ca>>2,nr=da>>2;Se[or]=Se[nr],Se[or+1]=Se[nr+1],Se[or+2]=Se[nr+2],Se[or+3]=Se[nr+3],Se[ca>>2]=da,Se[br]=ca,Se[((ha<<4)+4>>2)+wr]=ua,Se[((ha<<4)+8>>2)+wr]=0,Se[((ha<<4)+12>>2)+wr]=la;var ba=ba+1|0,ka=ua+4|0}Z(r);break r}while(0);var va,ia,wa=Se[pr+2];if(H(r,wa),4==(0|Se[va>>2])){var pa=Se[dr];Se[lr]=pa}var Ea=0==(0|ia);e:do if(!Ea)for(var Aa=r+8|0,ga=r+12|0,ya=ia;;){var ya,ma=ya-1|0;if(0==(0|Se[((ma<<4)+8>>2)+wr])){var Sa=Me[cr],Ma=0==(0|Sa);do{if(!Ma){var Ca=Me[Aa>>2];if(Ca>>>0>=Me[ga>>2]>>>0){gr=41;break}Se[Aa>>2]=Ca+1|0,Ae[Sa+Ca|0]=32,gr=42;break}gr=41}while(0);41==gr&&Y(r,32);var Ra=Se[((ma<<4)+4>>2)+wr];$(r,Ra)}if(0==(0|ma))break e;var ya=ma}while(0);Se[br]=$r;break r}if(4==(0|Ir)){var sr=(r+20|0)>>2,Ta=Se[sr];Se[sr]=0;var Oa=Se[pr+1];H(r,Oa);var Na=Me[cr],Ia=0==(0|Na);do{if(!Ia){var _r=(r+8|0)>>2,Da=Me[_r],La=0==(0|Da);do if(!La){if(Ae[Na+(Da-1)|0]<<24>>24!=60)break;Da>>>0<Me[Er+3]>>>0?(Se[_r]=Da+1|0,Ae[Na+Da|0]=32):Y(r,32)}while(0);var Fa=Me[cr];if(0==(0|Fa)){gr=54;break}var Xa=Me[_r];if(Xa>>>0>=Me[Er+3]>>>0){gr=54;break}Se[_r]=Xa+1|0,Ae[Fa+Xa|0]=60,gr=55;break}gr=54}while(0);54==gr&&Y(r,60);var ja=Se[pr+2];H(r,ja);var Ua=Me[cr],xa=0==(0|Ua);do{if(!xa){var fr=(r+8|0)>>2,za=Me[fr],Va=0==(0|za);do if(!Va){if(Ae[Ua+(za-1)|0]<<24>>24!=62)break;za>>>0<Me[Er+3]>>>0?(Se[fr]=za+1|0,Ae[Ua+za|0]=32):Y(r,32)}while(0);var Ba=Me[cr];if(0==(0|Ba)){gr=64;break}var Ha=Me[fr];if(Ha>>>0>=Me[Er+3]>>>0){gr=64;break}Se[fr]=Ha+1|0,Ae[Ba+Ha|0]=62,gr=65;break}gr=64}while(0);64==gr&&Y(r,62),Se[sr]=Ta;break r}if(5==(0|Ir)){var tr=(r+16|0)>>2,Ka=Me[tr];if(0==(0|Ka)){Z(r);break r}for(var Ya=Se[pr+1],Ga=Se[Ka+4>>2];;){var Ga,Ya,Wa=Se[Ga+8>>2];if(0==(0|Wa))break;if(39!=(0|Se[Wa>>2])){Z(r);break r}if((0|Ya)<1){if(0!=(0|Ya))break;var Za=Se[Ka>>2];Se[tr]=Za;var Qa=Se[Wa+4>>2];H(r,Qa),Se[tr]=Ka;break r}var Ya=Ya-1|0,Ga=Wa}Z(r);break r}if(6==(0|Ir)){var qa=Se[pr+2];H(r,qa);break r}if(7==(0|Ir)){var $a=r+8|0,Ja=Me[$a>>2];Ja>>>0<Me[Er+3]>>>0?(Se[$a>>2]=Ja+1|0,Ae[Or+Ja|0]=126):Y(r,126);var re=Se[pr+2];H(r,re);break r}if(8==(0|Ir)){var vr=(r+8|0)>>2,ae=Me[vr];if((ae+11|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str121,11);else{for(var ee=Or+ae|0,ie=0|He.__str121,ve=ee,te=ie+11;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var fe=Se[vr]+11|0;Se[vr]=fe}var _e=Se[pr+1];H(r,_e);break r}if(9==(0|Ir)){var J=(r+8|0)>>2,se=Me[J];if((se+8|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str122,8);else{var ne=Or+se|0,le=0|ne;oe=542397526,Ae[le]=255&oe,oe>>=8,Ae[le+1]=255&oe,oe>>=8,Ae[le+2]=255&oe,oe>>=8,Ae[le+3]=255&oe;var be=ne+4|0;oe=544370534,Ae[be]=255&oe,oe>>=8,Ae[be+1]=255&oe,oe>>=8,Ae[be+2]=255&oe,oe>>=8,Ae[be+3]=255&oe;var ke=Se[J]+8|0;Se[J]=ke}var ue=Se[pr+1];H(r,ue);break r}if(10==(0|Ir)){var W=(r+8|0)>>2,ce=Me[W],he=r+12|0;if((ce+24|0)>>>0>Me[he>>2]>>>0)Q(r,0|He.__str123,24);else{var de=Or+ce|0;Pa(de,0|He.__str123,24,1);var we=Se[W]+24|0;Se[W]=we}var pe=Se[pr+1];H(r,pe);var Ee=Me[cr],ge=0==(0|Ee);do{if(!ge){var ye=Me[W];if((ye+4|0)>>>0>Me[he>>2]>>>0){gr=96;break}var me=Ee+ye|0;oe=762210605,Ae[me]=255&oe,oe>>=8,Ae[me+1]=255&oe,oe>>=8,Ae[me+2]=255&oe,oe>>=8,Ae[me+3]=255&oe;var Ce=Se[W]+4|0;Se[W]=Ce,gr=97;break}gr=96}while(0);96==gr&&Q(r,0|He.__str124,4);var Re=Se[pr+2];H(r,Re);break r}if(11==(0|Ir)){var G=(r+8|0)>>2,Te=Me[G];if((Te+13|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str125,13);else{for(var Ne=Or+Te|0,ie=0|He.__str125,ve=Ne,te=ie+13;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var Ie=Se[G]+13|0;Se[G]=Ie}var Pe=Se[pr+1];H(r,Pe);break r}if(12==(0|Ir)){var K=(r+8|0)>>2,De=Me[K];if((De+18|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str126,18);else{for(var Le=Or+De|0,ie=0|He.__str126,ve=Le,te=ie+18;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var Fe=Se[K]+18|0;Se[K]=Fe}var Xe=Se[pr+1];H(r,Xe);break r}if(13==(0|Ir)){var B=(r+8|0)>>2,je=Me[B];if((je+16|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str127,16);else{for(var Ue=Or+je|0,ie=0|He.__str127,ve=Ue,te=ie+16;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var xe=Se[B]+16|0;Se[B]=xe}var ze=Se[pr+1];H(r,ze);break r}if(14==(0|Ir)){var V=(r+8|0)>>2,Ve=Me[V];if((Ve+21|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str128,21);else{var Be=Or+Ve|0;Pa(Be,0|He.__str128,21,1);var Ke=Se[V]+21|0;Se[V]=Ke}var Ye=Se[pr+1];H(r,Ye);break r}if(15==(0|Ir)){var z=(r+8|0)>>2,Ge=Me[z];if((Ge+17|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str129,17);else{for(var We=Or+Ge|0,ie=0|He.__str129,ve=We,te=ie+17;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var Ze=Se[z]+17|0;Se[z]=Ze}var Qe=Se[pr+1];H(r,Qe);break r}if(16==(0|Ir)){var x=(r+8|0)>>2,qe=Me[x];if((qe+26|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str130,26);else{var $e=Or+qe|0;Pa($e,0|He.__str130,26,1);var Je=Se[x]+26|0;Se[x]=Je}var ri=Se[pr+1];H(r,ri);break r}if(17==(0|Ir)){var U=(r+8|0)>>2,ai=Me[U];if((ai+15|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str131,15);else{for(var ei=Or+ai|0,ie=0|He.__str131,ve=ei,te=ie+15;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var ii=Se[U]+15|0;Se[U]=ii}var vi=Se[pr+1];H(r,vi);break r}if(18==(0|Ir)){var j=(r+8|0)>>2,ti=Me[j];if((ti+19|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str132,19);else{for(var fi=Or+ti|0,ie=0|He.__str132,ve=fi,te=ie+19;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var _i=Se[j]+19|0;Se[j]=_i}var si=Se[pr+1];H(r,si);break r}if(19==(0|Ir)){var X=(r+8|0)>>2,ni=Me[X];if((ni+24|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str133,24);else{var oi=Or+ni|0;Pa(oi,0|He.__str133,24,1);var li=Se[X]+24|0;Se[X]=li}var bi=Se[pr+1];H(r,bi);break r}if(20==(0|Ir)){var F=(r+8|0)>>2,ki=Me[F];if((ki+17|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str134,17);else{for(var ui=Or+ki|0,ie=0|He.__str134,ve=ui,te=ie+17;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var ci=Se[F]+17|0;Se[F]=ci}var hi=Se[pr+1];H(r,hi);break r}if(21==(0|Ir)){var L=(r+8|0)>>2,di=Me[L],wi=a+8|0,pi=Me[wi>>2];if((pi+di|0)>>>0>Me[Er+3]>>>0){var Ei=Se[pr+1];Q(r,Ei,pi);break r}var Ai=Or+di|0,gi=Se[pr+1];Pa(Ai,gi,pi,1);var yi=Se[L]+Se[wi>>2]|0;Se[L]=yi;break r}if(22==(0|Ir)||23==(0|Ir)||24==(0|Ir)){for(var mi=r+20|0;;){var mi,Si=Me[mi>>2];if(0==(0|Si))break a;if(0==(0|Se[Si+8>>2])){var Mi=Me[Se[Si+4>>2]>>2];if((Mi-22|0)>>>0>=3)break a;if((0|Mi)==(0|Ir))break}var mi=0|Si}var Ci=Se[pr+1];H(r,Ci);break r}if(25!=(0|Ir)&&26!=(0|Ir)&&27!=(0|Ir)&&28!=(0|Ir)&&29!=(0|Ir)&&30!=(0|Ir)&&31!=(0|Ir)&&32!=(0|Ir)){if(33==(0|Ir)){var D=(r+8|0)>>2,Ri=Me[D],P=(a+4|0)>>2,I=Me[P]>>2;if(0==(4&Se[Er]|0)){var Ti=Me[I+1];if((Ti+Ri|0)>>>0>Me[Er+3]>>>0){var Oi=Se[I];Q(r,Oi,Ti);break r}var Ni=Or+Ri|0,Ii=Se[I];Pa(Ni,Ii,Ti,1);var Pi=Se[D]+Se[Se[P]+4>>2]|0;Se[D]=Pi;break r}var Di=Me[I+3];if((Di+Ri|0)>>>0>Me[Er+3]>>>0){var Li=Se[I+2];Q(r,Li,Di);break r}var Fi=Or+Ri|0,Xi=Se[I+2];Pa(Fi,Xi,Di,1);var ji=Se[D]+Se[Se[P]+12>>2]|0;Se[D]=ji;break r}if(34==(0|Ir)){var Ui=Se[pr+1];H(r,Ui);break r}if(35==(0|Ir)){var N=(0|r)>>2;if(0!=(32&Se[N]|0)){var xi=Se[Er+5];rr(r,a,xi)}var zi=a+4|0,Vi=0==(0|Se[zi>>2]);e:do if(!Vi){var O=(r+20|0)>>2,Bi=Se[O],Hi=0|Mr;Se[Hi>>2]=Bi,Se[O]=Mr,Se[Mr+4>>2]=a;var Ki=Mr+8|0;Se[Ki>>2]=0;var Yi=Se[Er+4];Se[Mr+12>>2]=Yi;var Gi=Se[zi>>2];H(r,Gi);var Wi=Se[Hi>>2];if(Se[O]=Wi,0!=(0|Se[Ki>>2]))break r;if(0!=(32&Se[N]|0))break;var Zi=Me[cr],Qi=0==(0|Zi);do if(!Qi){var qi=r+8|0,$i=Me[qi>>2];if($i>>>0>=Me[Er+3]>>>0)break;Se[qi>>2]=$i+1|0,Ae[Zi+$i|0]=32;break e}while(0);Y(r,32)}while(0);if(0!=(32&Se[N]|0))break r;var Ji=Se[Er+5];rr(r,a,Ji);break r}if(36==(0|Ir)){var T=(r+20|0)>>2,rv=Me[T],av=0|Cr;Se[hr]=rv,Se[T]=av,Se[hr+1]=a;var ev=Cr+8|0;Se[ev>>2]=0;var iv=Se[Er+4];Se[hr+3]=iv;for(var vv=rv,tv=1;;){var tv,vv;if(0==(0|vv))break;if((Se[Se[vv+4>>2]>>2]-22|0)>>>0>=3)break;var fv=vv+8|0;if(0==(0|Se[fv>>2])){if(tv>>>0>3){Z(r);break r}var _v=(tv<<4)+Cr|0,R=_v>>2,C=vv>>2;Se[R]=Se[C],Se[R+1]=Se[C+1],Se[R+2]=Se[C+2],Se[R+3]=Se[C+3];var sv=Se[T];Se[_v>>2]=sv,Se[T]=_v,Se[fv>>2]=1;var nv=tv+1|0}else var nv=tv;var nv,vv=Se[vv>>2],tv=nv}var ov=Se[pr+2];if(H(r,ov),Se[T]=rv,0!=(0|Se[ev>>2]))break r;if(tv>>>0>1){for(var lv=tv;;){var lv,bv=lv-1|0,kv=Se[((bv<<4)+4>>2)+hr];if($(r,kv),bv>>>0<=1)break;var lv=bv}var uv=Se[T]}else var uv=rv;var uv;ar(r,a,uv);break r}if(37==(0|Ir)){var M=(r+20|0)>>2,cv=Se[M],hv=0|Rr;Se[hv>>2]=cv,Se[M]=Rr,Se[Rr+4>>2]=a;var dv=Rr+8|0;Se[dv>>2]=0;var wv=Se[Er+4];Se[Rr+12>>2]=wv;var pv=a+4|0,Ev=Se[pr+2];H(r,Ev);var Av=0==(0|Se[dv>>2]);e:do if(Av){var gv=Me[cr],yv=0==(0|gv);do{if(!yv){var mv=r+8|0,Sv=Me[mv>>2];if(Sv>>>0>=Me[Er+3]>>>0){gr=187;break}Se[mv>>2]=Sv+1|0,Ae[gv+Sv|0]=32,gr=188;break}gr=187}while(0);187==gr&&Y(r,32);var Mv=Se[pv>>2];H(r,Mv);var Cv=Me[cr],Rv=0==(0|Cv);do if(!Rv){var S=(r+8|0)>>2,Tv=Me[S];if((Tv+3|0)>>>0>Me[Er+3]>>>0)break;var Ov=Cv+Tv|0;Ae[Ov]=Ae[0|He.__str135],Ae[Ov+1]=Ae[(0|He.__str135)+1],Ae[Ov+2]=Ae[(0|He.__str135)+2];var Nv=Se[S]+3|0;Se[S]=Nv;break e}while(0);Q(r,0|He.__str135,3)}while(0);var Iv=Se[hv>>2];Se[M]=Iv;break r}if(38==(0|Ir)||39==(0|Ir)){var Pv=Se[pr+1];H(r,Pv);var Dv=a+8|0;if(0==(0|Se[Dv>>2]))break r;var Lv=Me[cr],Fv=0==(0|Lv);do{if(!Fv){var m=(r+8|0)>>2,Xv=Me[m];if((Xv+2|0)>>>0>Me[Er+3]>>>0){gr=197;break}var jv=Lv+Xv|0;oe=8236,Ae[jv]=255&oe,oe>>=8,Ae[jv+1]=255&oe;var Uv=Se[m]+2|0;Se[m]=Uv,gr=198;break}gr=197}while(0);197==gr&&Q(r,0|He.__str136,2);var xv=Se[Dv>>2];H(r,xv);break r}if(40==(0|Ir)){var y=(r+8|0)>>2,zv=Me[y],g=(r+12|0)>>2;if((zv+8|0)>>>0>Me[g]>>>0)Q(r,0|He.__str137,8);else{var Vv=Or+zv|0,le=0|Vv;oe=1919250543,Ae[le]=255&oe,oe>>=8,Ae[le+1]=255&oe,oe>>=8,Ae[le+2]=255&oe,oe>>=8,Ae[le+3]=255&oe;var be=Vv+4|0;oe=1919906913,Ae[be]=255&oe,oe>>=8,Ae[be+1]=255&oe,oe>>=8,Ae[be+2]=255&oe,oe>>=8,Ae[be+3]=255&oe;var Bv=Se[y]+8|0;Se[y]=Bv}var A=(a+4|0)>>2,Hv=(Ae[Se[Se[A]+4>>2]]-97&255&255)<26;e:do if(Hv){var Kv=Me[cr],Yv=0==(0|Kv);do if(!Yv){var Gv=Me[y];if(Gv>>>0>=Me[g]>>>0)break;Se[y]=Gv+1|0,Ae[Kv+Gv|0]=32;break e}while(0);Y(r,32)}while(0);var Wv=Me[cr],Zv=0==(0|Wv);do{if(!Zv){var Qv=Me[y],qv=Me[A],$v=Me[qv+8>>2];if(($v+Qv|0)>>>0>Me[g]>>>0){var Jv=qv,rt=$v;break}var at=Wv+Qv|0,et=Se[qv+4>>2];Pa(at,et,$v,1);var it=Se[y]+Se[Se[A]+8>>2]|0;Se[y]=it;break r}var vt=Me[A],Jv=vt,rt=Se[vt+8>>2]}while(0);var rt,Jv,tt=Se[Jv+4>>2];Q(r,tt,rt);break r}if(41==(0|Ir)){var E=(r+8|0)>>2,ft=Me[E];if((ft+9|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str10180,9);else{for(var _t=Or+ft|0,ie=0|He.__str10180,ve=_t,te=ie+9;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var st=Se[E]+9|0;Se[E]=st}var nt=Se[pr+2];H(r,nt);break r}if(42==(0|Ir)){var p=(r+8|0)>>2,ot=Me[p];if((ot+9|0)>>>0>Me[Er+3]>>>0)Q(r,0|He.__str10180,9);else{for(var lt=Or+ot|0,ie=0|He.__str10180,ve=lt,te=ie+9;ie<te;ie++,ve++)Ae[ve]=Ae[ie];var bt=Se[p]+9|0;Se[p]=bt}er(r,a);break r}if(43==(0|Ir)){var kt=a+4|0,ut=Se[kt>>2],ct=42==(0|Se[ut>>2]);e:do if(ct){var w=(r+8|0)>>2,ht=Me[w],dt=r+12|0;ht>>>0<Me[dt>>2]>>>0?(Se[w]=ht+1|0,Ae[Or+ht|0]=40):Y(r,40);var wt=Se[kt>>2];er(r,wt);var pt=Me[cr],Et=0==(0|pt);do if(!Et){var At=Me[w];if(At>>>0>=Me[dt>>2]>>>0)break;Se[w]=At+1|0,Ae[pt+At|0]=41;break e}while(0);Y(r,41)}else ir(r,ut);while(0);var gt=Me[cr],yt=0==(0|gt);do{if(!yt){var mt=r+8|0,St=Me[mt>>2];if(St>>>0>=Me[Er+3]>>>0){gr=232;break}Se[mt>>2]=St+1|0,Ae[gt+St|0]=40,gr=233;break}gr=232}while(0);232==gr&&Y(r,40);var Mt=Se[pr+2];H(r,Mt);var Ct=Me[cr],Rt=0==(0|Ct);do if(!Rt){var Tt=r+8|0,Ot=Me[Tt>>2];if(Ot>>>0>=Me[Er+3]>>>0)break;Se[Tt>>2]=Ot+1|0,Ae[Ct+Ot|0]=41;break r}while(0);Y(r,41);break r}if(44==(0|Ir)){var d=(a+8|0)>>2;if(45==(0|Se[Se[d]>>2])){var h=(a+4|0)>>2,Nt=Se[h],It=40==(0|Se[Nt>>2]);do if(It){var Pt=Se[Nt+4>>2];if(1!=(0|Se[Pt+8>>2]))break;if(Ae[Se[Pt+4>>2]]<<24>>24!=62)break;var Dt=r+8|0,Lt=Me[Dt>>2];Lt>>>0<Me[Er+3]>>>0?(Se[Dt>>2]=Lt+1|0,Ae[Or+Lt|0]=40):Y(r,40)}while(0);var Ft=Me[cr],Xt=0==(0|Ft);do{if(!Xt){var jt=r+8|0,Ut=Me[jt>>2];if(Ut>>>0>=Me[Er+3]>>>0){gr=248;break}Se[jt>>2]=Ut+1|0,Ae[Ft+Ut|0]=40,gr=249;break}gr=248}while(0);248==gr&&Y(r,40);var xt=Se[Se[d]+4>>2];H(r,xt);var zt=Me[cr],Vt=0==(0|zt);do{if(!Vt){var c=(r+8|0)>>2,Bt=Me[c];if((Bt+2|0)>>>0>Me[Er+3]>>>0){gr=252;break}var Ht=zt+Bt|0;oe=8233,Ae[Ht]=255&oe,oe>>=8,Ae[Ht+1]=255&oe;var Kt=Se[c]+2|0;Se[c]=Kt,gr=253;break}gr=252}while(0);252==gr&&Q(r,0|He.__str139,2);var Yt=Se[h];ir(r,Yt);var Gt=Me[cr],Wt=0==(0|Gt);do{if(!Wt){var u=(r+8|0)>>2,Zt=Me[u];if((Zt+2|0)>>>0>Me[Er+3]>>>0){gr=256;break}var Qt=Gt+Zt|0;oe=10272,Ae[Qt]=255&oe,oe>>=8,Ae[Qt+1]=255&oe;var qt=Se[u]+2|0;Se[u]=qt,gr=257;break}gr=256}while(0);256==gr&&Q(r,0|He.__str140,2);var $t=Se[Se[d]+8>>2];H(r,$t);var Jt=Me[cr],rf=0==(0|Jt);do{if(!rf){var af=r+8|0,ef=Me[af>>2];if(ef>>>0>=Me[Er+3]>>>0){gr=260;break}Se[af>>2]=ef+1|0,Ae[Jt+ef|0]=41,gr=261;break}gr=260}while(0);260==gr&&Y(r,41);var vf=Se[h];if(40!=(0|Se[vf>>2]))break r;var tf=Se[vf+4>>2];if(1!=(0|Se[tf+8>>2]))break r;if(Ae[Se[tf+4>>2]]<<24>>24!=62)break r;var ff=Me[cr],_f=0==(0|ff);do if(!_f){var sf=r+8|0,nf=Me[sf>>2];if(nf>>>0>=Me[Er+3]>>>0)break;Se[sf>>2]=nf+1|0,Ae[ff+nf|0]=41;break r}while(0);Y(r,41);break r}Z(r);break r}if(45==(0|Ir)){Z(r);break r}if(46==(0|Ir)){var of=a+4|0,k=(a+8|0)>>2,lf=Se[k],bf=47==(0|Se[lf>>2]);do if(bf){if(48!=(0|Se[Se[lf+8>>2]>>2]))break;var b=(r+8|0)>>2,kf=Me[b],l=(r+12|0)>>2;kf>>>0<Me[l]>>>0?(Se[b]=kf+1|0,Ae[Or+kf|0]=40):Y(r,40);var uf=Se[Se[k]+4>>2];H(r,uf);var cf=Me[cr],hf=0==(0|cf);do{if(!hf){var df=Me[b];if((df+2|0)>>>0>Me[l]>>>0){gr=278;break}var wf=cf+df|0;oe=8233,Ae[wf]=255&oe,oe>>=8,Ae[wf+1]=255&oe;var pf=Se[b]+2|0;Se[b]=pf,gr=279;break}gr=278}while(0);278==gr&&Q(r,0|He.__str139,2);var Ef=Se[of>>2];ir(r,Ef);var Af=Me[cr],gf=0==(0|Af);do{if(!gf){var yf=Me[b];if((yf+2|0)>>>0>Me[l]>>>0){gr=282;break}var mf=Af+yf|0;oe=10272,Ae[mf]=255&oe,oe>>=8,Ae[mf+1]=255&oe;var Sf=Se[b]+2|0;Se[b]=Sf,gr=283;break}gr=282}while(0);282==gr&&Q(r,0|He.__str140,2);var Mf=Se[Se[Se[k]+8>>2]+4>>2];H(r,Mf);var Cf=Me[cr],Rf=0==(0|Cf);do{if(!Rf){var Tf=Me[b];if((Tf+5|0)>>>0>Me[l]>>>0){gr=286;break}var Of=Cf+Tf|0;Ae[Of]=Ae[0|He.__str141],Ae[Of+1]=Ae[(0|He.__str141)+1],Ae[Of+2]=Ae[(0|He.__str141)+2],Ae[Of+3]=Ae[(0|He.__str141)+3],Ae[Of+4]=Ae[(0|He.__str141)+4];var Nf=Se[b]+5|0;Se[b]=Nf,gr=287;break}gr=286}while(0);286==gr&&Q(r,0|He.__str141,5);var If=Se[Se[Se[k]+8>>2]+8>>2];H(r,If);var Pf=Me[cr],Df=0==(0|Pf);do if(!Df){var Lf=Me[b];if(Lf>>>0>=Me[l]>>>0)break;Se[b]=Lf+1|0,Ae[Pf+Lf|0]=41;break r}while(0);Y(r,41);break r}while(0);Z(r);break r}if(47==(0|Ir)||48==(0|Ir)){Z(r);break r}if(49==(0|Ir)||50==(0|Ir)){var Ff=a+4|0,Xf=Se[Ff>>2],jf=33==(0|Se[Xf>>2]);do{if(jf){var Uf=Me[Se[Xf+4>>2]+16>>2];if(1==(0|Uf)||2==(0|Uf)||3==(0|Uf)||4==(0|Uf)||5==(0|Uf)||6==(0|Uf)){var xf=a+8|0;if(0!=(0|Se[Se[xf>>2]>>2])){var zf=Uf;break}if(50==(0|Ir)){var Vf=r+8|0,Bf=Me[Vf>>2];Bf>>>0<Me[Er+3]>>>0?(Se[Vf>>2]=Bf+1|0,Ae[Or+Bf|0]=45):Y(r,45)}var Hf=Se[xf>>2];if(H(r,Hf),2==(0|Uf)){var Kf=Me[cr],Yf=0==(0|Kf);do if(!Yf){var Gf=r+8|0,Wf=Me[Gf>>2];if(Wf>>>0>=Me[Er+3]>>>0)break;Se[Gf>>2]=Wf+1|0,Ae[Kf+Wf|0]=117;break r}while(0);Y(r,117);break r}if(3==(0|Uf)){var Zf=Me[cr],Qf=0==(0|Zf);do if(!Qf){var qf=r+8|0,$f=Me[qf>>2];if($f>>>0>=Me[Er+3]>>>0)break;Se[qf>>2]=$f+1|0,Ae[Zf+$f|0]=108;break r}while(0);Y(r,108);break r}if(4==(0|Uf)){var Jf=Me[cr],r_=0==(0|Jf);do if(!r_){var o=(r+8|0)>>2,a_=Me[o];if((a_+2|0)>>>0>Me[Er+3]>>>0)break;var e_=Jf+a_|0;oe=27765,Ae[e_]=255&oe,oe>>=8,Ae[e_+1]=255&oe;var i_=Se[o]+2|0;Se[o]=i_;break r}while(0);Q(r,0|He.__str142,2);break r}if(5==(0|Uf)){var v_=Me[cr],t_=0==(0|v_);do if(!t_){var n=(r+8|0)>>2,f_=Me[n];if((f_+2|0)>>>0>Me[Er+3]>>>0)break;var __=v_+f_|0;oe=27756,Ae[__]=255&oe,oe>>=8,Ae[__+1]=255&oe;var s_=Se[n]+2|0;Se[n]=s_;break r}while(0);Q(r,0|He.__str143,2);break r}if(6==(0|Uf)){var n_=Me[cr],o_=0==(0|n_);do if(!o_){var s=(r+8|0)>>2,l_=Me[s];if((l_+3|0)>>>0>Me[Er+3]>>>0)break;var b_=n_+l_|0;Ae[b_]=Ae[0|He.__str144],Ae[b_+1]=Ae[(0|He.__str144)+1],Ae[b_+2]=Ae[(0|He.__str144)+2];var k_=Se[s]+3|0;Se[s]=k_;break r}while(0);Q(r,0|He.__str144,3);break r}break r}if(7==(0|Uf)){var _=Se[pr+2]>>2;if(0!=(0|Se[_])){var zf=7;break}if(!(1==(0|Se[_+2])&49==(0|Ir))){var zf=Uf;break}var u_=Ae[Se[_+1]]<<24>>24;if(48==(0|u_)){var f=(r+8|0)>>2,c_=Me[f];if((c_+5|0)>>>0>Me[Er+3]>>>0){Q(r,0|He.__str145,5);break r}var h_=Or+c_|0;Ae[h_]=Ae[0|He.__str145],Ae[h_+1]=Ae[(0|He.__str145)+1],Ae[h_+2]=Ae[(0|He.__str145)+2],Ae[h_+3]=Ae[(0|He.__str145)+3],Ae[h_+4]=Ae[(0|He.__str145)+4];var d_=Se[f]+5|0;Se[f]=d_;break r}if(49==(0|u_)){var t=(r+8|0)>>2,w_=Me[t];if((w_+4|0)>>>0>Me[Er+3]>>>0){Q(r,0|He.__str146,4);break r}var p_=Or+w_|0;oe=1702195828,Ae[p_]=255&oe,oe>>=8,Ae[p_+1]=255&oe,oe>>=8,Ae[p_+2]=255&oe,oe>>=8,Ae[p_+3]=255&oe;var E_=Se[t]+4|0;Se[t]=E_;break r}var zf=Uf;break}var zf=Uf;break}var zf=0}while(0);var zf,v=(r+8|0)>>2,A_=Me[v],i=(r+12|0)>>2;A_>>>0<Me[i]>>>0?(Se[v]=A_+1|0,Ae[Or+A_|0]=40):Y(r,40);var g_=Se[Ff>>2];H(r,g_);var y_=Me[cr],m_=0==(0|y_);do{if(!m_){var S_=Me[v];if(S_>>>0>=Me[i]>>>0){gr=335;break}Se[v]=S_+1|0,Ae[y_+S_|0]=41,gr=336;break}gr=335}while(0);335==gr&&Y(r,41);var M_=50==(0|Se[Nr>>2]);e:do if(M_){var C_=Me[cr],R_=0==(0|C_);do if(!R_){var T_=Me[v];if(T_>>>0>=Me[i]>>>0)break;Se[v]=T_+1|0,Ae[C_+T_|0]=45;break e}while(0);Y(r,45)}while(0);if(8==(0|zf)){var O_=Me[cr],N_=0==(0|O_);do{if(!N_){var I_=Me[v];if(I_>>>0>=Me[i]>>>0){gr=345;break}Se[v]=I_+1|0,Ae[O_+I_|0]=91,gr=346;break}gr=345}while(0);345==gr&&Y(r,91);var P_=Se[pr+2];H(r,P_);var D_=Me[cr],L_=0==(0|D_);do if(!L_){var F_=Me[v];if(F_>>>0>=Me[i]>>>0)break;Se[v]=F_+1|0,Ae[D_+F_|0]=93;break r}while(0);Y(r,93);break r}var X_=Se[pr+2];H(r,X_);break r}Z(r);break r}}while(0);var e=(r+20|0)>>2,j_=Se[e],U_=0|Sr;Se[U_>>2]=j_,Se[e]=Sr,Se[Sr+4>>2]=a;var x_=Sr+8|0;Se[x_>>2]=0;var z_=Se[Er+4];Se[Sr+12>>2]=z_;var V_=Se[pr+1];H(r,V_),0==(0|Se[x_>>2])&&$(r,a);var B_=Se[U_>>2];Se[e]=B_}while(0);Oe=Ar}function K(r,a,e,i){var v=i>>2;Se[v]=r,Se[v+1]=r+e|0,Se[v+2]=a,Se[v+3]=r,Se[v+6]=e<<1,Se[v+5]=0,Se[v+9]=e,Se[v+8]=0,Se[v+10]=0,Se[v+11]=0,Se[v+12]=0}function Y(r,a){var e,i=r+4|0,v=Me[i>>2],t=0==(0|v);do if(!t){var e=(r+8|0)>>2,f=Me[e];if(f>>>0<Me[r+12>>2]>>>0)var _=v,s=f;else{tr(r,1);var n=Me[i>>2];if(0==(0|n))break;var _=n,s=Se[e]}var s,_;Ae[_+s|0]=255&a;var o=Se[e]+1|0;Se[e]=o}while(0)}function G(r,a,e,i){var v,t=i>>2,f=Oe;Oe+=4;var _=f,v=_>>2,s=0==(0|r);do if(s){if(0==(0|i)){var n=0;break}Se[t]=-3;var n=0}else{var o=0==(0|e);if(0!=(0|a)&o){if(0==(0|i)){var n=0;break}Se[t]=-3;var n=0}else{var l=W(r,_);if(0==(0|l)){if(0==(0|i)){var n=0;break}if(1==(0|Se[v])){Se[t]=-1;var n=0}else{Se[t]=-2;var n=0}}else{var b=0==(0|a);do if(b){if(o){var k=l;break}var u=Se[v];Se[e>>2]=u;var k=l}else{var c=Ca(l);if(c>>>0<Me[e>>2]>>>0){Ra(a,l);va(l);var k=a}else{va(a);var h=Se[v];Se[e>>2]=h;var k=l}}while(0);var k;if(0==(0|i)){var n=k;break}Se[t]=0;var n=k}}}while(0);var n;return Oe=f,n}function W(r,a){var e,i=Oe;Oe+=52;var v,t=i,e=t>>2;Se[a>>2]=0;var f=Ca(r),_=Ae[r]<<24>>24==95;do{if(_){if(Ae[r+1|0]<<24>>24==90){var s=0;v=13;break}v=3;break}v=3}while(0);do if(3==v){var n=Na(r,0|He.__str117,8);if(0!=(0|n)){var s=1;v=13;break}var o=Ae[r+8|0];if(o<<24>>24!=46&&o<<24>>24!=95&&o<<24>>24!=36){var s=1;v=13;break}var l=r+9|0,b=Ae[l];if(b<<24>>24!=68&&b<<24>>24!=73){
var s=1;v=13;break}if(Ae[r+10|0]<<24>>24!=95){var s=1;v=13;break}var k=f+29|0,u=Jr(k);if(0==(0|u)){Se[a>>2]=1;var c=0;v=19;break}Ae[l]<<24>>24==73?Pa(u,0|He.__str118,30,1):Pa(u,0|He.__str119,29,1);var h=r+11|0,c=(Ia(u,h),u);v=19;break}while(0);if(13==v){var s;K(r,17,f,t);var d=Se[e+6],w=Ta(),p=Oe;Oe+=12*d,Oe=Oe+3>>2<<2;var E=Oe;if(Oe+=4*Se[e+9],Oe=Oe+3>>2<<2,Se[e+4]=p,Se[e+7]=E,s)var A=N(t),g=A;else var y=T(t,1),g=y;var g,m=Ae[Se[e+3]]<<24>>24==0?g:0,S=Se[e+12]+f+10*Se[e+10]|0;if(0==(0|m))var M=0;else var C=S/8+S|0,R=B(17,m,C,a),M=R;var M;Oa(w);var c=M}var c;return Oe=i,c}function Z(r){var a=r+4|0,e=Se[a>>2];va(e),Se[a>>2]=0}function Q(r,a,e){var i,v=r+4|0,t=Me[v>>2],f=0==(0|t);do if(!f){var i=(r+8|0)>>2,_=Me[i];if((_+e|0)>>>0>Me[r+12>>2]>>>0){tr(r,e);var s=Me[v>>2];if(0==(0|s))break;var n=s,o=Se[i]}else var n=t,o=_;var o,n;Pa(n+o|0,a,e,1);var l=Se[i]+e|0;Se[i]=l}while(0)}function q(r,a,e){var i,v,t=a+e|0,f=(0|e)>0;r:do if(f)for(var _=t,s=r+4|0,i=(r+8|0)>>2,n=r+12|0,o=a;;){var o,l=(_-o|0)>3;a:do{if(l){if(Ae[o]<<24>>24!=95){v=21;break}if(Ae[o+1|0]<<24>>24!=95){v=21;break}if(Ae[o+2|0]<<24>>24!=85){v=21;break}for(var b=o+3|0,k=0;;){var k,b;if(b>>>0>=t>>>0){v=21;break a}var u=ge[b],c=u<<24>>24;if((u-48&255&255)<10)var h=c-48|0;else if((u-65&255&255)<6)var h=c-55|0;else{if((u-97&255&255)>=6)break;var h=c-87|0}var h,b=b+1|0,k=(k<<4)+h|0}if(!(u<<24>>24==95&k>>>0<256)){v=21;break}var d=Me[s>>2],w=0==(0|d);do if(!w){var p=Me[i];if(p>>>0>=Me[n>>2]>>>0)break;Se[i]=p+1|0,Ae[d+p|0]=255&k;var E=b;v=25;break a}while(0);Y(r,k);var E=b;v=25;break}v=21}while(0);a:do if(21==v){var A=Me[s>>2],g=0==(0|A);do if(!g){var y=Me[i];if(y>>>0>=Me[n>>2]>>>0)break;var m=Ae[o];Se[i]=y+1|0,Ae[A+y|0]=m;var E=o;break a}while(0);var S=Ae[o]<<24>>24;Y(r,S);var E=o}while(0);var E,M=E+1|0;if(M>>>0>=t>>>0)break r;var o=M}while(0)}function $(r,a){var e,i,v,t,f,_,s,n=r>>2,o=Se[a>>2];r:do if(22==(0|o)||25==(0|o)){var l=Me[n+1],b=0==(0|l);do if(!b){var _=(r+8|0)>>2,k=Me[_];if((k+9|0)>>>0>Me[n+3]>>>0)break;for(var u=l+k|0,c=0|He.__str147,h=u,d=c+9;c<d;c++,h++)Ae[h]=Ae[c];var w=Se[_]+9|0;Se[_]=w;break r}while(0);Q(r,0|He.__str147,9)}else if(23==(0|o)||26==(0|o)){var p=Me[n+1],E=0==(0|p);do if(!E){var f=(r+8|0)>>2,A=Me[f];if((A+9|0)>>>0>Me[n+3]>>>0)break;for(var g=p+A|0,c=0|He.__str148,h=g,d=c+9;c<d;c++,h++)Ae[h]=Ae[c];var y=Se[f]+9|0;Se[f]=y;break r}while(0);Q(r,0|He.__str148,9)}else if(24==(0|o)||27==(0|o)){var m=Me[n+1],S=0==(0|m);do if(!S){var t=(r+8|0)>>2,M=Me[t];if((M+6|0)>>>0>Me[n+3]>>>0)break;var C=m+M|0;Ae[C]=Ae[0|He.__str149],Ae[C+1]=Ae[(0|He.__str149)+1],Ae[C+2]=Ae[(0|He.__str149)+2],Ae[C+3]=Ae[(0|He.__str149)+3],Ae[C+4]=Ae[(0|He.__str149)+4],Ae[C+5]=Ae[(0|He.__str149)+5];var R=Se[t]+6|0;Se[t]=R;break r}while(0);Q(r,0|He.__str149,6)}else if(28==(0|o)){var T=Me[n+1],O=0==(0|T);do{if(!O){var N=r+8|0,I=Me[N>>2];if(I>>>0>=Me[n+3]>>>0){s=17;break}Se[N>>2]=I+1|0,Ae[T+I|0]=32,s=18;break}s=17}while(0);17==s&&Y(r,32);var P=Se[a+8>>2];H(r,P)}else if(29==(0|o)){if(0!=(4&Se[n]|0))break;var D=Me[n+1],L=0==(0|D);do if(!L){var F=r+8|0,X=Me[F>>2];if(X>>>0>=Me[n+3]>>>0)break;Se[F>>2]=X+1|0,Ae[D+X|0]=42;break r}while(0);Y(r,42)}else if(30==(0|o)){var j=Me[n+1],U=0==(0|j);do if(!U){var x=r+8|0,z=Me[x>>2];if(z>>>0>=Me[n+3]>>>0)break;Se[x>>2]=z+1|0,Ae[j+z|0]=38;break r}while(0);Y(r,38)}else if(31==(0|o)){var V=Me[n+1],B=0==(0|V);do if(!B){var v=(r+8|0)>>2,K=Me[v];if((K+8|0)>>>0>Me[n+3]>>>0)break;var G=V+K|0,W=0|G;oe=1886220131,Ae[W]=255&oe,oe>>=8,Ae[W+1]=255&oe,oe>>=8,Ae[W+2]=255&oe,oe>>=8,Ae[W+3]=255&oe;var Z=G+4|0;oe=544761196,Ae[Z]=255&oe,oe>>=8,Ae[Z+1]=255&oe,oe>>=8,Ae[Z+2]=255&oe,oe>>=8,Ae[Z+3]=255&oe;var q=Se[v]+8|0;Se[v]=q;break r}while(0);Q(r,0|He.__str150,8)}else if(32==(0|o)){var $=Me[n+1],J=0==(0|$);do if(!J){var i=(r+8|0)>>2,rr=Me[i];if((rr+10|0)>>>0>Me[n+3]>>>0)break;for(var ar=$+rr|0,c=0|He.__str151,h=ar,d=c+10;c<d;c++,h++)Ae[h]=Ae[c];var er=Se[i]+10|0;Se[i]=er;break r}while(0);Q(r,0|He.__str151,10)}else if(37==(0|o)){var ir=r+4|0,vr=Me[ir>>2],tr=0==(0|vr);do{if(!tr){var fr=r+8|0,_r=Me[fr>>2];if(0!=(0|_r)&&Ae[vr+(_r-1)|0]<<24>>24==40){s=42;break}if(_r>>>0>=Me[n+3]>>>0){s=41;break}Se[fr>>2]=_r+1|0,Ae[vr+_r|0]=32,s=42;break}s=41}while(0);41==s&&Y(r,32);var sr=Se[a+4>>2];H(r,sr);var nr=Me[ir>>2],or=0==(0|nr);do if(!or){var e=(r+8|0)>>2,lr=Me[e];if((lr+3|0)>>>0>Me[n+3]>>>0)break;var br=nr+lr|0;Ae[br]=Ae[0|He.__str135],Ae[br+1]=Ae[(0|He.__str135)+1],Ae[br+2]=Ae[(0|He.__str135)+2];var kr=Se[e]+3|0;Se[e]=kr;break r}while(0);Q(r,0|He.__str135,3)}else if(3==(0|o)){var ur=Se[a+4>>2];H(r,ur)}else H(r,a);while(0)}function J(r){var a=r+20|0,e=Se[a>>2];if((0|e)<(0|Se[r+24>>2])){var i=Se[r+16>>2]+12*e|0,v=e+1|0;Se[a>>2]=v;var t=i}else var t=0;var t;return t}function rr(r,a,e){var i,v,t,f,_=r>>2,s=e,t=s>>2,n=0;r:for(;;){var n,s,o=0==(0|s);do if(!o){if(0!=(0|Se[t+2]))break;var l=Se[Se[t+1]>>2];if(29==(0|l)||30==(0|l)){f=9;break r}if(22==(0|l)||23==(0|l)||24==(0|l)||28==(0|l)||31==(0|l)||32==(0|l)||37==(0|l)){var b=Se[_+1];f=12;break r}var s=Se[t],t=s>>2,n=1;continue r}while(0);if(0!=(0|Se[a+4>>2])&0==(0|n)){f=9;break}var k=0,u=r+4|0,v=u>>2;f=22;break}do if(9==f){var c=Se[_+1];if(0==(0|c)){f=17;break}var h=Se[_+2];if(0==(0|h)){var d=c;f=13;break}var w=Ae[c+(h-1)|0];if(w<<24>>24==40||w<<24>>24==42){f=18;break}var b=c;f=12;break}while(0);do if(12==f){var b;if(0==(0|b)){f=17;break}var d=b;f=13;break}while(0);do if(13==f){var d,p=r+8|0,E=Me[p>>2];if(0!=(0|E)&&Ae[d+(E-1)|0]<<24>>24==32){f=18;break}if(E>>>0>=Me[_+3]>>>0){f=17;break}Se[p>>2]=E+1|0,Ae[d+E|0]=32,f=18;break}while(0);do if(17==f){Y(r,32),f=18;break}while(0);r:do if(18==f){var A=r+4|0,g=Me[A>>2],y=0==(0|g);do if(!y){var m=r+8|0,S=Me[m>>2];if(S>>>0>=Me[_+3]>>>0)break;Se[m>>2]=S+1|0,Ae[g+S|0]=40;var k=1,u=A,v=u>>2;break r}while(0);Y(r,40);var k=1,u=A,v=u>>2}while(0);var u,k,i=(r+20|0)>>2,M=Se[i];Se[i]=0,vr(r,e,0);r:do if(k){var C=Me[v],R=0==(0|C);do if(!R){var T=r+8|0,O=Me[T>>2];if(O>>>0>=Me[_+3]>>>0)break;Se[T>>2]=O+1|0,Ae[C+O|0]=41;break r}while(0);Y(r,41)}while(0);var N=Me[v],I=0==(0|N);do{if(!I){var P=r+8|0,D=Me[P>>2];if(D>>>0>=Me[_+3]>>>0){f=30;break}Se[P>>2]=D+1|0,Ae[N+D|0]=40,f=31;break}f=30}while(0);30==f&&Y(r,40);var L=Se[a+8>>2];0!=(0|L)&&H(r,L);var F=Me[v],X=0==(0|F);do{if(!X){var j=r+8|0,U=Me[j>>2];if(U>>>0>=Me[_+3]>>>0){f=36;break}Se[j>>2]=U+1|0,Ae[F+U|0]=41,f=37;break}f=36}while(0);36==f&&Y(r,41),vr(r,e,1),Se[i]=M}function ar(r,a,e){var i,v,t,f=r>>2,_=0==(0|e);do{if(!_){var s=e,v=s>>2;r:for(;;){var s;if(0==(0|s)){var n=1;t=14;break}if(0==(0|Se[v+2])){var o=36==(0|Se[Se[v+1]>>2]),l=1&o^1;if(o){var n=l;t=14;break}var b=r+4|0,k=Me[b>>2],u=0==(0|k);do{if(!u){var i=(r+8|0)>>2,c=Me[i];if((c+2|0)>>>0>Me[f+3]>>>0){t=9;break}var h=k+c|0;oe=10272,Ae[h]=255&oe,oe>>=8,Ae[h+1]=255&oe;var d=Se[i]+2|0;Se[i]=d,vr(r,e,0),t=10;break}t=9}while(0);9==t&&(Q(r,0|He.__str140,2),vr(r,e,0));var w=Me[b>>2],p=0==(0|w);do if(!p){var E=r+8|0,A=Me[E>>2];if(A>>>0>=Me[f+3]>>>0)break;Se[E>>2]=A+1|0,Ae[w+A|0]=41;var g=l;t=15;break r}while(0);Y(r,41);var g=l;t=15;break}var s=Se[v],v=s>>2}if(14==t){var n;vr(r,e,0);var g=n}var g;if(0!=(0|g)){t=17;break}var y=r+4|0;t=21;break}t=17}while(0);r:do if(17==t){var m=r+4|0,S=Me[m>>2],M=0==(0|S);do if(!M){var C=r+8|0,R=Me[C>>2];if(R>>>0>=Me[f+3]>>>0)break;Se[C>>2]=R+1|0,Ae[S+R|0]=32;var y=m;break r}while(0);Y(r,32);var y=m}while(0);var y,T=Me[y>>2],O=0==(0|T);do{if(!O){var N=r+8|0,I=Me[N>>2];if(I>>>0>=Me[f+3]>>>0){t=24;break}Se[N>>2]=I+1|0,Ae[T+I|0]=91,t=25;break}t=24}while(0);24==t&&Y(r,91);var P=Se[a+4>>2];0!=(0|P)&&H(r,P);var D=Me[y>>2],L=0==(0|D);do{if(!L){var F=r+8|0,X=Me[F>>2];if(X>>>0>=Me[f+3]>>>0){t=30;break}Se[F>>2]=X+1|0,Ae[D+X|0]=93,t=31;break}t=30}while(0);30==t&&Y(r,93)}function er(r,a){var e,i,v,t,f,_,s=Oe;Oe+=8;var n,o=s,_=(a+4|0)>>2,l=Se[_];if(4==(0|Se[l>>2])){var f=(r+20|0)>>2,b=Se[f];Se[f]=0;var t=(r+16|0)>>2,k=Se[t],u=0|o;Se[u>>2]=k,Se[t]=o;var c=Se[_];Se[o+4>>2]=c;var h=Se[c+4>>2];H(r,h);var d=Se[u>>2];Se[t]=d;var v=(r+4|0)>>2,w=Me[v],p=0==(0|w);do{if(!p){var i=(r+8|0)>>2,E=Me[i],A=0==(0|E);do if(!A){if(Ae[w+(E-1)|0]<<24>>24!=60)break;E>>>0<Me[r+12>>2]>>>0?(Se[i]=E+1|0,Ae[w+E|0]=32):Y(r,32)}while(0);var g=Me[v];if(0==(0|g)){n=12;break}var y=Me[i];if(y>>>0>=Me[r+12>>2]>>>0){n=12;break}Se[i]=y+1|0,Ae[g+y|0]=60,n=13;break}n=12}while(0);12==n&&Y(r,60);var m=Se[Se[_]+8>>2];H(r,m);var S=Me[v],M=0==(0|S);do{if(!M){var e=(r+8|0)>>2,C=Me[e],R=0==(0|C);do if(!R){if(Ae[S+(C-1)|0]<<24>>24!=62)break;C>>>0<Me[r+12>>2]>>>0?(Se[e]=C+1|0,Ae[S+C|0]=32):Y(r,32)}while(0);var T=Me[v];if(0==(0|T)){n=22;break}var O=Me[e];if(O>>>0>=Me[r+12>>2]>>>0){n=22;break}Se[e]=O+1|0,Ae[T+O|0]=62,n=23;break}n=22}while(0);22==n&&Y(r,62),Se[f]=b}else H(r,l);Oe=s}function ir(r,a){var e,i=40==(0|Se[a>>2]);r:do if(i){var v=Me[r+4>>2],t=0==(0|v);do{if(!t){var e=(r+8|0)>>2,f=Me[e],_=a+4|0,s=Me[_>>2],n=Me[s+8>>2];if((n+f|0)>>>0>Me[r+12>>2]>>>0){var o=s,l=n;break}var b=v+f|0,k=Se[s+4>>2];Pa(b,k,n,1);var u=Se[e]+Se[Se[_>>2]+8>>2]|0;Se[e]=u;break r}var c=Me[a+4>>2],o=c,l=Se[c+8>>2]}while(0);var l,o,h=Se[o+4>>2];Q(r,h,l)}else H(r,a);while(0)}function vr(r,a,e){var i,v,t,f,_,f=(r+4|0)>>2,s=0==(0|e),t=(r+16|0)>>2;r:do if(s)for(var n=a;;){var n;if(0==(0|n)){_=29;break r}if(0==(0|Se[f])){_=29;break r}var o=n+8|0,l=0==(0|Se[o>>2]);do if(l){var b=n+4|0;if((Se[Se[b>>2]>>2]-25|0)>>>0<3)break;Se[o>>2]=1;var k=Me[t],u=Se[n+12>>2];Se[t]=u;var c=Me[b>>2],h=Se[c>>2];if(35==(0|h)){var d=n,w=k,p=c;_=14;break r}if(36==(0|h)){var E=n,A=k,g=c;_=15;break r}if(2==(0|h)){var y=k,m=b;_=16;break r}$(r,c),Se[t]=k}while(0);var n=Se[n>>2]}else for(var S=a;;){var S;if(0==(0|S)){_=29;break r}if(0==(0|Se[f])){_=29;break r}var M=S+8|0;if(0==(0|Se[M>>2])){Se[M>>2]=1;var C=Me[t],R=Se[S+12>>2];Se[t]=R;var T=S+4|0,O=Me[T>>2],N=Se[O>>2];if(35==(0|N)){var d=S,w=C,p=O;_=14;break r}if(36==(0|N)){var E=S,A=C,g=O;_=15;break r}if(2==(0|N)){var y=C,m=T;_=16;break r}$(r,O),Se[t]=C}var S=Se[S>>2]}while(0);if(14==_){var p,w,d,I=Se[d>>2];rr(r,p,I),Se[t]=w}else if(15==_){var g,A,E,P=Se[E>>2];ar(r,g,P),Se[t]=A}else if(16==_){var m,y,v=(r+20|0)>>2,D=Se[v];Se[v]=0;var L=Se[Se[m>>2]+4>>2];H(r,L),Se[v]=D;var F=0==(4&Se[r>>2]|0),X=Me[f],j=0!=(0|X);r:do if(F){do if(j){var i=(r+8|0)>>2,U=Me[i];if((U+2|0)>>>0>Me[r+12>>2]>>>0)break;var x=X+U|0;oe=14906,Ae[x]=255&oe,oe>>=8,Ae[x+1]=255&oe;var z=Se[i]+2|0;Se[i]=z;break r}while(0);Q(r,0|He.__str120,2)}else{do if(j){var V=r+8|0,B=Me[V>>2];if(B>>>0>=Me[r+12>>2]>>>0)break;Se[V>>2]=B+1|0,Ae[X+B|0]=46;break r}while(0);Y(r,46)}while(0);var K=Me[Se[m>>2]+8>>2],G=(Se[K>>2]-25|0)>>>0<3;r:do if(G)for(var W=K;;){var W,Z=Me[W+4>>2];if((Se[Z>>2]-25|0)>>>0>=3){var q=Z;break r}var W=Z}else var q=K;while(0);var q;H(r,q),Se[t]=y}}function tr(r,a){var e,e=(r+4|0)>>2,i=Se[e],v=0==(0|i);r:do if(!v){for(var t=Se[r+8>>2]+a|0,f=r+12|0,_=Se[f>>2],s=i;;){var s,_;if(t>>>0<=_>>>0)break r;var n=_<<1,o=fa(s,n);if(0==(0|o))break;Se[e]=o,Se[f>>2]=n;var _=n,s=o}var l=Se[e];va(l),Se[e]=0,Se[r+24>>2]=1}while(0)}function fr(r,a,e){var i,v=J(r),i=v>>2;return 0!=(0|v)&&(Se[i]=21,Se[i+1]=a,Se[i+2]=e),v}function _r(r){var a,a=(r+12|0)>>2,e=Se[a],i=Ae[e]<<24>>24;if(88==(0|i)){var v=e+1|0;Se[a]=v;var t=nr(r),f=Se[a],_=f+1|0;Se[a]=_;var s=Ae[f]<<24>>24==69?t:0,n=s}else if(76==(0|i))var o=or(r),n=o;else var l=N(r),n=l;var n;return n}function sr(r){var a,a=(r+12|0)>>2,e=Se[a],i=Ae[e];if(i<<24>>24==110){var v=e+1|0;Se[a]=v;var t=1,f=Ae[v],_=v}else var t=0,f=i,_=e;var _,f,t,s=(f-48&255&255)<10;r:do if(s)for(var n=f,o=0,l=_;;){var l,o,n,b=(n<<24>>24)-48+10*o|0,k=l+1|0;Se[a]=k;var u=ge[k];if((u-48&255&255)>=10){var c=b;break r}var n=u,o=b,l=k}else var c=0;while(0);var c,h=0==(0|t)?c:0|-c;return h}function nr(r){var a,e,a=(r+12|0)>>2,i=Se[a],v=Ae[i];do{if(v<<24>>24==76){var t=or(r),f=t;e=21;break}if(v<<24>>24==84){var _=x(r),f=_;e=21;break}if(v<<24>>24==115){if(Ae[i+1|0]<<24>>24!=114){e=8;break}var s=i+2|0;Se[a]=s;var n=N(r),o=br(r);if(Ae[Se[a]]<<24>>24==73){var l=z(r),b=D(r,4,o,l),k=D(r,1,n,b),f=k;e=21;break}var u=D(r,1,n,o),f=u;e=21;break}e=8}while(0);r:do if(8==e){var c=kr(r);if(0==(0|c)){var f=0;break}var h=0|c,d=Se[h>>2],w=40==(0|d);do{if(w){var p=c+4|0,E=r+48|0,A=Se[Se[p>>2]+8>>2]-2+Se[E>>2]|0;Se[E>>2]=A;var g=Se[h>>2];if(40!=(0|g)){var y=g;e=13;break}var m=Se[p>>2],S=Se[m>>2],M=Da(S,0|He.__str90);if(0!=(0|M)){var C=m;e=15;break}var R=N(r),T=D(r,43,c,R),f=T;break r}var y=d;e=13}while(0);do if(13==e){var y;if(40==(0|y)){var C=Se[c+4>>2];e=15;break}if(41==(0|y)){var O=c+4|0;e=17;break}if(42==(0|y)){e=18;break}var f=0;break r}while(0);do if(15==e){var C,O=C+12|0;e=17;break}while(0);do if(17==e){var O,I=Se[O>>2];if(1==(0|I))break;if(2==(0|I)){var P=nr(r),L=nr(r),F=D(r,45,P,L),X=D(r,44,c,F);return X}if(3==(0|I)){var j=nr(r),U=nr(r),V=nr(r),B=D(r,48,U,V),H=D(r,47,j,B),K=D(r,46,c,H);return K}var f=0;break r}while(0);var Y=nr(r),G=D(r,43,c,Y);return G}while(0);var f;return f}function or(r){var a,a=(r+12|0)>>2,e=Se[a],i=e+1|0;Se[a]=i;var v=Ae[e]<<24>>24==76;r:do if(v){if(Ae[i]<<24>>24==95)var t=T(r,0),f=t;else{var _=N(r);if(0==(0|_)){var s=0;break}var n=33==(0|Se[_>>2]);do if(n){var o=Se[_+4>>2];if(0==(0|Se[o+16>>2]))break;var l=r+48|0,b=Se[l>>2]-Se[o+4>>2]|0;Se[l>>2]=b}while(0);var k=Se[a];if(Ae[k]<<24>>24==110){var u=k+1|0;Se[a]=u;var c=50,h=u}else var c=49,h=k;for(var h,c,d=h;;){var d,w=Ae[d];if(w<<24>>24==69)break;if(w<<24>>24==0){var s=0;break r}var p=d+1|0;Se[a]=p;var d=p}var E=lr(r,h,d-h|0),A=D(r,c,_,E),f=A}var f,g=Se[a],y=g+1|0;Se[a]=y;var m=Ae[g]<<24>>24==69?f:0,s=m}else var s=0;while(0);var s;return s}function lr(r,a,e){var i=J(r),v=m(i,a,e),t=0==(0|v)?0:i;return t}function br(r){var a=r+12|0,e=Me[a>>2],i=ge[e],v=(i-48&255&255)<10;do if(v)var t=L(r),f=t;else if((i-97&255&255)<26){var _=kr(r);if(0==(0|_)){var f=0;break}if(40!=(0|Se[_>>2])){var f=_;break}var s=r+48|0,n=Se[Se[_+4>>2]+8>>2]+Se[s>>2]+7|0;Se[s>>2]=n;var f=_}else if(i<<24>>24==67||i<<24>>24==68)var o=hr(r),f=o;else{if(i<<24>>24!=76){var f=0;break}Se[a>>2]=e+1|0;var l=L(r);if(0==(0|l)){var f=0;break}var b=dr(r),k=0==(0|b)?0:l,f=k}while(0);var f;return f}function kr(r){var a,e,a=(r+12|0)>>2,i=Se[a],v=i+1|0;Se[a]=v;var t=ge[i],f=i+2|0;Se[a]=f;var _=ge[v];do{if(t<<24>>24==118){if((_-48&255&255)>=10){var s=49,n=0;e=6;break}var o=(_<<24>>24)-48|0,l=L(r),b=ur(r,o,l),k=b;e=14;break}if(t<<24>>24==99){if(_<<24>>24!=118){var s=49,n=0;e=6;break}var u=N(r),c=D(r,42,u,0),k=c;e=14;break}var s=49,n=0;e=6}while(0);r:do if(6==e){for(;;){var n,s,h=(s-n)/2+n|0,d=(h<<4)+ri|0,w=Se[d>>2],p=Ae[w],E=t<<24>>24==p<<24>>24;if(E&&_<<24>>24==Ae[w+1|0]<<24>>24)break;var A=t<<24>>24<p<<24>>24;do if(A)var g=h,y=n;else{if(E&&_<<24>>24<Ae[w+1|0]<<24>>24){var g=h,y=n;break}var g=s,y=h+1|0}while(0);var y,g;if((0|y)==(0|g)){var k=0;break r}var s=g,n=y}var m=cr(r,d),k=m}while(0);var k;return k}function ur(r,a,e){var i=J(r),v=S(i,a,e),t=0==(0|v)?0:i;return t}function cr(r,a){var e=J(r);return 0!=(0|e)&&(Se[e>>2]=40,Se[e+4>>2]=a),e}function hr(r){var a,e,i=Se[r+44>>2],e=i>>2,v=0==(0|i);do if(!v){var t=Se[e];if(0==(0|t)){var f=r+48|0,_=Se[f>>2]+Se[e+2]|0;Se[f>>2]=_}else{if(21!=(0|t))break;var s=r+48|0,n=Se[s>>2]+Se[e+2]|0;Se[s>>2]=n}}while(0);var a=(r+12|0)>>2,o=Se[a],l=o+1|0;Se[a]=l;var b=Ae[o]<<24>>24;do if(67==(0|b)){var k=o+2|0;Se[a]=k;var u=Ae[l]<<24>>24;if(49==(0|u))var c=1;else if(50==(0|u))var c=2;else{if(51!=(0|u)){var h=0;break}var c=3}var c,d=wr(r,c,i),h=d}else if(68==(0|b)){var w=o+2|0;Se[a]=w;var p=Ae[l]<<24>>24;if(48==(0|p))var E=1;else if(49==(0|p))var E=2;else{if(50!=(0|p)){var h=0;break}var E=3}var E,A=pr(r,E,i),h=A}else var h=0;while(0);var h;return h}function dr(r){var a=r+12|0,e=Se[a>>2];if(Ae[e]<<24>>24==95){var i=e+1|0;Se[a>>2]=i;var v=sr(r),t=v>>>31^1}else var t=1;var t;return t}function wr(r,a,e){var i=J(r),v=M(i,a,e),t=0==(0|v)?0:i;return t}function pr(r,a,e){var i=J(r),v=C(i,a,e),t=0==(0|v)?0:i;return t}function Er(r,a){var e=J(r);return 0!=(0|e)&&(Se[e>>2]=5,Se[e+4>>2]=a),e}function Ar(r){var a,a=(r+12|0)>>2,e=Se[a],i=Ae[e]<<24>>24;do if(78==(0|i))var v=gr(r),t=v;else if(90==(0|i))var f=yr(r),t=f;else if(76==(0|i))var _=br(r),t=_;else if(83==(0|i)){if(Ae[e+1|0]<<24>>24==116){var s=e+2|0;Se[a]=s;var n=lr(r,0|He.__str152,3),o=br(r),l=D(r,1,n,o),b=r+48|0,k=Se[b>>2]+3|0;Se[b>>2]=k;var u=0,c=l}else var h=V(r,0),u=1,c=h;var c,u;if(Ae[Se[a]]<<24>>24!=73){var t=c;break}if(0==(0|u)){var d=R(r,c);if(0==(0|d)){var t=0;break}}var w=z(r),p=D(r,4,c,w),t=p}else{var E=br(r);if(Ae[Se[a]]<<24>>24!=73){var t=E;break}var A=R(r,E);if(0==(0|A)){var t=0;break}var g=z(r),y=D(r,4,E,g),t=y}while(0);var t;return t}function gr(r){var a,e=Oe;Oe+=4;var i=e,a=(r+12|0)>>2,v=Se[a],t=v+1|0;Se[a]=t;var f=Ae[v]<<24>>24==78;do if(f){var _=I(r,i,1);if(0==(0|_)){var s=0;break}var n=mr(r);if(Se[_>>2]=n,0==(0|n)){var s=0;break}var o=Se[a],l=o+1|0;if(Se[a]=l,Ae[o]<<24>>24!=69){var s=0;break}var s=Se[i>>2]}else var s=0;while(0);var s;return Oe=e,s}function yr(r){var a,a=(r+12|0)>>2,e=Se[a],i=e+1|0;Se[a]=i;var v=Ae[e]<<24>>24==90;do if(v){var t=O(r,0),f=Se[a],_=f+1|0;if(Se[a]=_,Ae[f]<<24>>24!=69){var s=0;break}if(Ae[_]<<24>>24==115){var n=f+2|0;Se[a]=n;var o=dr(r);if(0==(0|o)){var s=0;break}var l=lr(r,0|He.__str168,14),b=D(r,2,t,l),s=b}else{var k=Ar(r),u=dr(r);if(0==(0|u)){var s=0;break}var c=D(r,2,t,k),s=c}}else var s=0;while(0);var s;return s}function mr(r){var a,e=r+12|0,i=0;r:for(;;){var i,v=ge[Se[e>>2]];if(v<<24>>24==0){var t=0;break}var f=(v-48&255&255)<10|(v-97&255&255)<26;do{if(!f){if(v<<24>>24==76||v<<24>>24==68||v<<24>>24==67){a=5;break}if(v<<24>>24==83){var _=V(r,1),s=_;a=10;break}if(v<<24>>24==73){if(0==(0|i)){var t=0;break r}var n=z(r),o=4,l=n;a=11;break}if(v<<24>>24==84){var b=x(r),s=b;a=10;break}if(v<<24>>24==69){var t=i;break r}var t=0;break r}a=5}while(0);do if(5==a){var k=br(r),s=k;a=10;break}while(0);do if(10==a){var s;if(0==(0|i)){var u=s;a=12;break}var o=1,l=s;a=11;break}while(0);if(11==a)var l,o,c=D(r,o,i,l),u=c;var u;if(v<<24>>24!=83)if(Ae[Se[e>>2]]<<24>>24!=69){var h=R(r,u);if(0==(0|h)){var t=0;break}var i=u}else var i=u;else var i=u}var t;return t}function Sr(r,a){var e,i,v=Oe;Oe+=4;var t=v,i=t>>2,e=(r+12|0)>>2,f=Se[e];if(Ae[f]<<24>>24==74){var _=f+1|0;Se[e]=_;var s=1}else var s=a;var s;Se[i]=0;var n=s,o=0,l=t;r:for(;;)for(var l,o,n,b=n,k=o;;){var k,b,u=Ae[Se[e]];if(u<<24>>24==0||u<<24>>24==69){var c=Se[i];if(0==(0|c)){var h=0;break r}var d=0==(0|Se[c+8>>2]);do if(d){var w=Se[c+4>>2];if(33!=(0|Se[w>>2])){var p=c;break}var E=Se[w+4>>2];if(9!=(0|Se[E+16>>2])){var p=c;break}var A=r+48|0,g=Se[A>>2]-Se[E+4>>2]|0;Se[A>>2]=g,Se[i]=0;var p=0}else var p=c;while(0);var p,y=D(r,35,k,p),h=y;break r}var m=N(r);if(0==(0|m)){var h=0;break r}if(0==(0|b)){var S=D(r,38,m,0);if(Se[l>>2]=S,0==(0|S)){var h=0;break r}var n=0,o=k,l=S+8|0;continue r}var b=0,k=m}var h;return Oe=v,h}function Mr(r){for(var a=r;;){var a;if(0==(0|a)){var e=0;break}var i=Se[a>>2];if(1!=(0|i)&&2!=(0|i)){if(6==(0|i)||7==(0|i)||42==(0|i)){var e=1;break}var e=0;break}var a=Se[a+8>>2]}var e;return e}function Cr(r){var a=r>>2;Se[a+3]=0,Se[a+2]=0,Se[a+1]=0,Se[a]=0,Se[a+4]=0}function Rr(r,a){var e,e=(r+12|0)>>2,i=Se[e],v=(Se[r+4>>2]-i|0)<(0|a);r:do if(v)var t=0;else{var f=i+a|0;Se[e]=f;var _=0==(4&Se[r+8>>2]|0);do if(!_){if(Ae[f]<<24>>24!=36)break;var s=a+(i+1)|0;Se[e]=s}while(0);var n=(0|a)>9;do if(n){var o=La(i,0|He.__str117,8);if(0!=(0|o))break;var l=Ae[i+8|0];if(l<<24>>24!=46&&l<<24>>24!=95&&l<<24>>24!=36)break;if(Ae[i+9|0]<<24>>24!=78)break;var b=r+48|0,k=22-a+Se[b>>2]|0;Se[b>>2]=k;var u=lr(r,0|He.__str169,21),t=u;break r}while(0);var c=lr(r,i,a),t=c}while(0);var t;return t}function Tr(r){var a,e,e=(r+48|0)>>2,i=Se[e],v=i+20|0;Se[e]=v;var a=(r+12|0)>>2,t=Se[a],f=t+1|0;Se[a]=f;var _=Ae[t];do if(_<<24>>24==84){var s=t+2|0;Se[a]=s;var n=Ae[f]<<24>>24;if(86==(0|n)){var o=i+15|0;Se[e]=o;var l=N(r),b=D(r,8,l,0),k=b}else if(84==(0|n)){var u=i+10|0;Se[e]=u;var c=N(r),h=D(r,9,c,0),k=h}else if(73==(0|n))var d=N(r),w=D(r,11,d,0),k=w;else if(83==(0|n))var p=N(r),E=D(r,12,p,0),k=E;else if(104==(0|n)){var A=Nr(r,104);if(0==(0|A)){var k=0;break}var g=O(r,0),y=D(r,14,g,0),k=y}else if(118==(0|n)){var m=Nr(r,118);if(0==(0|m)){var k=0;break}var S=O(r,0),M=D(r,15,S,0),k=M}else if(99==(0|n)){var C=Nr(r,0);if(0==(0|C)){var k=0;break}var R=Nr(r,0);if(0==(0|R)){var k=0;break}var T=O(r,0),I=D(r,16,T,0),k=I}else if(67==(0|n)){var P=N(r),L=sr(r);if((0|L)<0){var k=0;break}var F=Se[a],X=F+1|0;if(Se[a]=X,Ae[F]<<24>>24!=95){var k=0;break}var j=N(r),U=Se[e]+5|0;Se[e]=U;var x=D(r,10,j,P),k=x}else if(70==(0|n))var z=N(r),V=D(r,13,z,0),k=V;else{if(74!=(0|n)){var k=0;break}var B=N(r),H=D(r,17,B,0),k=H}}else if(_<<24>>24==71){var K=t+2|0;Se[a]=K;var Y=Ae[f]<<24>>24;if(86==(0|Y))var G=Ar(r),W=D(r,18,G,0),k=W;else if(82==(0|Y))var Z=Ar(r),Q=D(r,19,Z,0),k=Q;else{if(65!=(0|Y)){var k=0;break}var q=O(r,0),$=D(r,20,q,0),k=$}}else var k=0;while(0);var k;return k}function Or(r){for(var a,e=r,a=e>>2;;){var e;if(0==(0|e)){var i=0;break}var v=Se[a];if(4==(0|v)){var t=Se[a+1],f=Mr(t),i=0==(0|f)&1;break}if(25!=(0|v)&&26!=(0|v)&&27!=(0|v)){var i=0;break}var e=Se[a+1],a=e>>2}var i;return i}function Nr(r,a){var e;if(0==(0|a)){var i=r+12|0,v=Se[i>>2],t=v+1|0;Se[i>>2]=t;var f=Ae[v]<<24>>24}else var f=a;var f;do{if(104==(0|f)){var _=(sr(r),r+12|0);e=7;break}if(118==(0|f)){var s=(sr(r),r+12|0),n=Se[s>>2],o=n+1|0;if(Se[s>>2]=o,Ae[n]<<24>>24!=95){var l=0;e=8;break}var _=(sr(r),s);e=7;break}var l=0;e=8}while(0);if(7==e){var _,b=Se[_>>2],k=b+1|0;Se[_>>2]=k;var l=Ae[b]<<24>>24==95&1}var l;return l}function Ir(r){var a,e,i=r>>2,v=Oe;Oe+=56;var t,f=v,_=v+8,s=v+16,n=v+36,e=(0|r)>>2,o=Se[e],l=0==(8192&o|0);r:do{if(l){var a=(r+12|0)>>2,b=Se[a];if(Ae[b]<<24>>24!=63){var k=0;t=111;break}var u=b+1|0;Se[a]=u;var c=Ae[u];do if(c<<24>>24==63){if(Ae[b+2|0]<<24>>24==36){var h=b+3|0;if(Ae[h]<<24>>24!=63){var d=5;t=90;break}Se[a]=h;var w=6,p=h}else var w=0,p=u;var p,w,E=p+1|0;Se[a]=E;var A=Ae[E]<<24>>24;do if(48==(0|A)){var g=1;t=81}else{if(49==(0|A)){var g=2;t=81;break}if(50!=(0|A)){if(51==(0|A)){var y=0|He.__str2172,m=E;t=82;break}if(52==(0|A)){var y=0|He.__str3173,m=E;t=82;break}if(53==(0|A)){var y=0|He.__str4174,m=E;t=82;break}if(54==(0|A)){var y=0|He.__str5175,m=E;t=82;break}if(55==(0|A)){var y=0|He.__str6176,m=E;t=82;break}if(56==(0|A)){var y=0|He.__str7177,m=E;t=82;break}if(57==(0|A)){var y=0|He.__str8178,m=E;t=82;break}if(65==(0|A)){var y=0|He.__str9179,m=E;t=82;break}if(66==(0|A)){Se[a]=p+2|0;var S=0|He.__str10180,M=3;t=88;break}if(67==(0|A)){var y=0|He.__str11181,m=E;t=82;break}if(68==(0|A)){var y=0|He.__str12182,m=E;t=82;break}if(69==(0|A)){var y=0|He.__str13183,m=E;t=82;break}if(70==(0|A)){var y=0|He.__str14184,m=E;t=82;break}if(71==(0|A)){var y=0|He.__str15185,m=E;t=82;break}if(72==(0|A)){var y=0|He.__str16186,m=E;t=82;break}if(73==(0|A)){var y=0|He.__str17187,m=E;t=82;break}if(74==(0|A)){var y=0|He.__str18188,m=E;t=82;break}if(75==(0|A)){var y=0|He.__str19189,m=E;t=82;break}if(76==(0|A)){var y=0|He.__str20190,m=E;t=82;break}if(77==(0|A)){var y=0|He.__str21191,m=E;t=82;break}if(78==(0|A)){var y=0|He.__str22192,m=E;t=82;break}if(79==(0|A)){var y=0|He.__str23193,m=E;t=82;break}if(80==(0|A)){var y=0|He.__str24194,m=E;t=82;break}if(81==(0|A)){var y=0|He.__str25195,m=E;t=82;break}if(82==(0|A)){var y=0|He.__str26196,m=E;t=82;break}if(83==(0|A)){var y=0|He.__str27197,m=E;t=82;break}if(84==(0|A)){var y=0|He.__str28198,m=E;t=82;break}if(85==(0|A)){var y=0|He.__str29199,m=E;t=82;break}if(86==(0|A)){var y=0|He.__str30200,m=E;t=82;break}if(87==(0|A)){var y=0|He.__str31201,m=E;t=82;break}if(88==(0|A)){var y=0|He.__str32202,m=E;t=82;break}if(89==(0|A)){var y=0|He.__str33203,m=E;t=82;break}if(90==(0|A)){var y=0|He.__str34204,m=E;t=82;break}if(95==(0|A)){var C=p+2|0;Se[a]=C;var R=Ae[C]<<24>>24;if(48==(0|R)){var y=0|He.__str35205,m=C;t=82;break}if(49==(0|R)){var y=0|He.__str36206,m=C;t=82;break}if(50==(0|R)){var y=0|He.__str37207,m=C;t=82;break}if(51==(0|R)){var y=0|He.__str38208,m=C;t=82;break}if(52==(0|R)){var y=0|He.__str39209,m=C;t=82;break}if(53==(0|R)){var y=0|He.__str40210,m=C;t=82;break}if(54==(0|R)){var y=0|He.__str41211,m=C;t=82;break}if(55==(0|R)){var y=0|He.__str42212,m=C;t=82;break}if(56==(0|R)){var y=0|He.__str43213,m=C;t=82;break}if(57==(0|R)){var y=0|He.__str44214,m=C;t=82;break}if(65==(0|R)){var y=0|He.__str45215,m=C;t=82;break}if(66==(0|R)){var y=0|He.__str46216,m=C;t=82;break}if(67==(0|R)){Se[a]=p+3|0;var T=0|He.__str47217;t=84;break}if(68==(0|R)){var y=0|He.__str48218,m=C;t=82;break}if(69==(0|R)){var y=0|He.__str49219,m=C;t=82;break}if(70==(0|R)){var y=0|He.__str50220,m=C;t=82;break}if(71==(0|R)){var y=0|He.__str51221,m=C;t=82;break}if(72==(0|R)){var y=0|He.__str52222,m=C;t=82;break}if(73==(0|R)){var y=0|He.__str53223,m=C;t=82;break}if(74==(0|R)){var y=0|He.__str54224,m=C;t=82;break}if(75==(0|R)){var y=0|He.__str55225,m=C;t=82;break}if(76==(0|R)){var y=0|He.__str56226,m=C;t=82;break}if(77==(0|R)){var y=0|He.__str57227,m=C;t=82;break}if(78==(0|R)){var y=0|He.__str58228,m=C;t=82;break}if(79==(0|R)){var y=0|He.__str59229,m=C;t=82;break}if(82==(0|R)){var O=4|o;Se[e]=O;var N=p+3|0;Se[a]=N;var I=Ae[N]<<24>>24;if(48==(0|I)){Se[a]=p+4|0,Cr(s);var P=(Pr(r,_,s,0),Se[_>>2]),D=Se[_+4>>2],L=Dr(r,0|He.__str60230,(ne=Oe,Oe+=8,Se[ne>>2]=P,Se[ne+4>>2]=D,ne)),F=Se[a]-1|0;Se[a]=F;var y=L,m=F;t=82;break}if(49==(0|I)){Se[a]=p+4|0;var X=Lr(r),j=Lr(r),U=Lr(r),x=Lr(r),z=Se[a]-1|0;Se[a]=z;var V=Dr(r,0|He.__str61231,(ne=Oe,Oe+=16,Se[ne>>2]=X,Se[ne+4>>2]=j,Se[ne+8>>2]=U,Se[ne+12>>2]=x,ne)),y=V,m=Se[a];t=82;break}if(50==(0|I)){var y=0|He.__str62232,m=N;t=82;break}if(51==(0|I)){var y=0|He.__str63233,m=N;t=82;break}if(52==(0|I)){var y=0|He.__str64234,m=N;t=82;break}var y=0,m=N;t=82;break}if(83==(0|R)){var y=0|He.__str65235,m=C;t=82;break}if(84==(0|R)){var y=0|He.__str66236,m=C;t=82;break}if(85==(0|R)){var y=0|He.__str67237,m=C;t=82;break}if(86==(0|R)){var y=0|He.__str68238,m=C;t=82;break}if(88==(0|R)){var y=0|He.__str69239,m=C;t=82;break}if(89==(0|R)){var y=0|He.__str70240,m=C;t=82;break}var k=0;t=111;break r}var k=0;t=111;break r}var y=0|He.__str1171,m=E;t=82}while(0);do{if(81==t){var g;Se[a]=p+2|0;var B=g;t=83;break}if(82==t){var m,y;if(Se[a]=m+1|0,1==(0|w)||2==(0|w)){var B=w;t=83;break}if(4==(0|w)){var T=y;t=84;break}if(6!=(0|w)){var S=y,M=w;t=88;break}Cr(n);var H=Xr(r,n,0,60,62);if(0==(0|H))var K=y;else var Y=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=y,Se[ne+4>>2]=H,ne)),K=Y;var K;Se[i+6]=0;var S=K,M=w;t=88;break}}while(0);if(83==t){var B,G=r+40|0,W=Fr(r,0|He._symbol_demangle_dashed_null,-1,G);if(0==(0|W)){var k=0;t=111;break r}var d=B;t=90;break}if(84==t){var T;Se[i+4]=T;var Z=1,Q=T;t=109;break r}if(88==t){var M,S,q=r+40|0,$=Fr(r,S,-1,q);if(0==(0|$)){var k=0;t=111;break r}var d=M;t=90;break}}else{if(c<<24>>24==36){var J=b+2|0;Se[a]=J;var rr=jr(r);Se[i+4]=rr;var ar=0!=(0|rr)&1;t=107;break}var d=0;t=90}while(0);if(90==t){var d,er=Me[a],ir=Ae[er]<<24>>24;if(64==(0|ir))Se[a]=er+1|0;else if(36==(0|ir))t=93;else{var vr=zr(r);if(0==(0|vr)){var k=-1;t=111;break}}if(5==(0|d)){var tr=r+20|0,fr=Se[tr>>2]+1|0;Se[tr>>2]=fr}else if(1==(0|d)||2==(0|d)){if(Me[i+11]>>>0<2){var k=-1;t=111;break}var _r=r+56|0,sr=Me[_r>>2],nr=Se[sr+4>>2];if(1==(0|d))Se[sr>>2]=nr;else{var or=Dr(r,0|He.__str71241,(ne=Oe,Oe+=4,Se[ne>>2]=nr,ne)),lr=Se[_r>>2];Se[lr>>2]=or}var br=4|Se[e];Se[e]=br}else if(3==(0|d)){var kr=Se[e]&-5;Se[e]=kr}var ur=ge[Se[a]];if((ur-48&255&255)<10)var cr=Vr(r),ar=cr;else if((ur-65&255&255)<26)var hr=Br(r,3==(0|d)&1),ar=hr;else{if(ur<<24>>24!=36){var k=-1;t=111;break}var dr=Hr(r),ar=dr}}var ar;if(0==(0|ar)){var k=-1;t=111;break}var Z=ar,Q=Se[i+4];t=109;break}var wr=Pr(r,f,0,0);if(0==(0|wr)){var k=-1;t=111;break}var pr=Se[f>>2],Er=Se[f+4>>2],Ar=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=pr,Se[ne+4>>2]=Er,ne));Se[i+4]=Ar;var Z=1,Q=Ar;t=109;break}while(0);do if(109==t){var Q,Z;if(0!=(0|Q)){var k=Z;break}Xa(0|He.__str72242,1499,0|He.___func___symbol_demangle,0|He.__str73243);var k=Z}while(0);var k;return Oe=v,k}function Pr(r,a,e,i){var v,t,f,_=Oe;Oe+=24;var s=_,n=_+4,o=_+8,l=_+16,b=_+20;0==(0|a)&&Xa(0|He.__str72242,829,0|He.___func___demangle_datatype,0|He.__str121291);var f=(a+4|0)>>2;Se[f]=0;var t=(0|a)>>2;Se[t]=0;var v=(r+12|0)>>2,k=Me[v],u=k+1|0;Se[v]=u;var c=Ae[k],h=c<<24>>24;do if(95==(0|h)){Se[v]=k+2|0;var d=Ae[u],w=Zr(d);Se[t]=w}else if(67==(0|h)||68==(0|h)||69==(0|h)||70==(0|h)||71==(0|h)||72==(0|h)||73==(0|h)||74==(0|h)||75==(0|h)||77==(0|h)||78==(0|h)||79==(0|h)||88==(0|h)||90==(0|h)){var p=Qr(c);Se[t]=p}else if(84==(0|h)||85==(0|h)||86==(0|h)||89==(0|h)){var E=qr(r);if(0==(0|E))break;var A=0==(32768&Se[r>>2]|0);do if(A)if(84==(0|h))var g=0|He.__str122292;else if(85==(0|h))var g=0|He.__str123293;else if(86==(0|h))var g=0|He.__str124294;else{if(89!=(0|h)){var g=0;break}var g=0|He.__str125295}else var g=0;while(0);var g,y=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=g,Se[ne+4>>2]=E,ne));Se[t]=y}else if(63==(0|h))if(0==(0|i))$r(a,r,e,63,0);else{var m=Lr(r);if(0==(0|m))break;var S=Dr(r,0|He.__str126296,(ne=Oe,Oe+=4,Se[ne>>2]=m,ne));Se[t]=S}else if(65==(0|h)||66==(0|h))$r(a,r,e,c,i);else if(81==(0|h)||82==(0|h)||83==(0|h)){var M=0==(0|i)?80:c;$r(a,r,e,M,i)}else if(80==(0|h))if(((Ae[u]<<24>>24)-48|0)>>>0<10){var C=k+2|0;if(Se[v]=C,Ae[u]<<24>>24!=54)break;var R=r+44|0,T=Se[R>>2];Se[v]=k+3|0;var O=Ae[C],N=Se[r>>2]&-17,I=Ur(O,s,n,N);if(0==(0|I))break;var P=Pr(r,o,e,0);if(0==(0|P))break;var D=Xr(r,e,1,40,41);if(0==(0|D))break;Se[R>>2]=T;var L=Se[o>>2],F=Se[o+4>>2],X=Se[s>>2],j=Dr(r,0|He.__str127297,(ne=Oe,Oe+=12,Se[ne>>2]=L,Se[ne+4>>2]=F,Se[ne+8>>2]=X,ne));Se[t]=j;var U=Dr(r,0|He.__str128298,(ne=Oe,Oe+=4,Se[ne>>2]=D,ne));Se[f]=U}else $r(a,r,e,80,i);else if(87==(0|h)){if(Ae[u]<<24>>24!=52)break;Se[v]=k+2|0;var x=qr(r);if(0==(0|x))break;if(0==(32768&Se[r>>2]|0)){var z=Dr(r,0|He.__str129299,(ne=Oe,Oe+=4,Se[ne>>2]=x,ne));Se[t]=z}else Se[t]=x}else if(48==(0|h)||49==(0|h)||50==(0|h)||51==(0|h)||52==(0|h)||53==(0|h)||54==(0|h)||55==(0|h)||56==(0|h)||57==(0|h)){var V=h<<1,B=V-96|0,H=Yr(e,B);Se[t]=H;var K=V-95|0,Y=Yr(e,K);Se[f]=Y}else if(36==(0|h)){var G=k+2|0;Se[v]=G;var W=Ae[u]<<24>>24;if(48==(0|W)){var Z=Lr(r);Se[t]=Z}else if(68==(0|W)){var Q=Lr(r);if(0==(0|Q))break;var q=Dr(r,0|He.__str130300,(ne=Oe,Oe+=4,Se[ne>>2]=Q,ne));Se[t]=q}else if(70==(0|W)){var $=Lr(r);if(0==(0|$))break;var J=Lr(r);if(0==(0|J))break;var rr=Dr(r,0|He.__str131301,(ne=Oe,Oe+=8,Se[ne>>2]=$,Se[ne+4>>2]=J,ne));Se[t]=rr}else if(71==(0|W)){var ar=Lr(r);if(0==(0|ar))break;var er=Lr(r);if(0==(0|er))break;var ir=Lr(r);if(0==(0|ir))break;var vr=Dr(r,0|He.__str132302,(ne=Oe,Oe+=12,Se[ne>>2]=ar,Se[ne+4>>2]=er,Se[ne+8>>2]=ir,ne));Se[t]=vr}else if(81==(0|W)){var tr=Lr(r);if(0==(0|tr))break;var fr=Dr(r,0|He.__str133303,(ne=Oe,Oe+=4,Se[ne>>2]=tr,ne));Se[t]=fr}else{if(36!=(0|W))break;if(Ae[G]<<24>>24!=67)break;Se[v]=k+3|0;var _r=xr(r,l,b);if(0==(0|_r))break;var sr=Pr(r,a,e,i);if(0==(0|sr))break;var nr=Se[t],or=Se[l>>2],lr=Dr(r,0|He.__str83253,(ne=Oe,Oe+=8,Se[ne>>2]=nr,Se[ne+4>>2]=or,ne));Se[t]=lr}}while(0);var br=0!=(0|Se[t])&1;return Oe=_,br}function Dr(r,a){var e,i=Oe;Oe+=4;var v=i,e=v>>2,t=v;Se[t>>2]=arguments[Dr.length];var f=1,_=0;r:for(;;){var _,f,s=Ae[a+_|0];do{if(s<<24>>24==0)break r;if(s<<24>>24==37){var n=_+1|0,o=Ae[a+n|0]<<24>>24;if(115==(0|o)){var l=Se[e],b=l,k=l+4|0;Se[e]=k;var u=Se[b>>2];if(0==(0|u)){var c=f,h=n;break}var d=Ca(u),c=d+f|0,h=n;break}if(99==(0|o)){var w=Se[e]+4|0;Se[e]=w;var c=f+1|0,h=n;break}if(37==(0|o))var p=n;else var p=_;var p,c=f+1|0,h=p}else var c=f+1|0,h=_}while(0);var h,c,f=c,_=h+1|0}var E=Wr(r,f);if(0==(0|E))var A=0;else{Se[t>>2]=arguments[Dr.length];var g=E,y=0;r:for(;;){var y,g,m=Ae[a+y|0];do{if(m<<24>>24==0)break r;if(m<<24>>24==37){var S=y+1|0,M=Ae[a+S|0]<<24>>24;if(115==(0|M)){var C=Se[e],R=C,T=C+4|0;Se[e]=T;var O=Se[R>>2];if(0==(0|O)){var N=g,I=S;break}var P=Ca(O);Pa(g,O,P,1);var N=g+P|0,I=S;break}if(99==(0|M)){var D=Se[e],L=D,F=D+4|0;Se[e]=F,Ae[g]=255&Se[L>>2];var N=g+1|0,I=S;break}if(37==(0|M))var X=S;else var X=y;var X;Ae[g]=37;var N=g+1|0,I=X}else{Ae[g]=m;var N=g+1|0,I=y}}while(0);var I,N,g=N,y=I+1|0}Ae[g]=0;var A=E}var A;return Oe=i,A}function Lr(r){var a,a=(r+12|0)>>2,e=Se[a],i=Ae[e];if(i<<24>>24==63){var v=e+1|0;Se[a]=v;var t=1,f=v,_=Ae[v]}else var t=0,f=e,_=i;var _,f,t,s=(_-48&255&255)<9;do if(s){var n=Wr(r,3),o=0!=(0|t);o&&(Ae[n]=45);var l=Ae[Se[a]]+1&255;Ae[n+t|0]=l;var b=o?2:1;
Ae[n+b|0]=0;var k=Se[a]+1|0;Se[a]=k;var u=n}else if(_<<24>>24==57){var c=Wr(r,4),h=0!=(0|t);h&&(Ae[c]=45),Ae[c+t|0]=49;var d=h?2:1;Ae[c+d|0]=48;var w=h?3:2;Ae[c+w|0]=0;var p=Se[a]+1|0;Se[a]=p;var u=c}else{if((_-65&255&255)>=16){var u=0;break}for(var E=0,A=f;;){var A,E,g=A+1|0;Se[a]=g;var y=(Ae[A]<<24>>24)+((E<<4)-65)|0,m=ge[g];if((m-65&255&255)>=16)break;var E=y,A=g}if(m<<24>>24!=64){var u=0;break}var S=Wr(r,17),M=0!=(0|t)?0|He.__str119289:0|ii,C=(za(S,0|He.__str118288,(ne=Oe,Oe+=8,Se[ne>>2]=M,Se[ne+4>>2]=y,ne)),Se[a]+1|0);Se[a]=C;var u=S}while(0);var u;return u}function Fr(r,a,e,i){var v,t,f,_;0==(0|a)&&Xa(0|He.__str72242,212,0|He.___func___str_array_push,0|He.__str115285),0==(0|i)&&Xa(0|He.__str72242,213,0|He.___func___str_array_push,0|He.__str116286);var f=(i+12|0)>>2,s=Me[f],n=0==(0|s);do{if(n){Se[f]=32;var o=Wr(r,128);if(0==(0|o)){var l=0;_=17;break}Se[i+16>>2]=o,_=11;break}if(Me[i+8>>2]>>>0<s>>>0){_=11;break}var b=s<<3,k=Wr(r,b);if(0==(0|k)){var l=0;_=17;break}var u=k,c=i+16|0,h=Se[c>>2],d=Se[f]<<2;Pa(k,h,d,1);var w=Se[f]<<1;Se[f]=w,Se[c>>2]=u,_=11;break}while(0);do if(11==_){if((0|e)==-1)var p=Ca(a),E=p;else var E=e;var E,A=ja(a),g=E+1|0,y=Wr(r,g),t=(i+4|0)>>2,v=(i+16|0)>>2,m=(Se[t]<<2)+Se[v]|0;Se[m>>2]=y;var S=Se[Se[v]+(Se[t]<<2)>>2];if(0==(0|S)){Xa(0|He.__str72242,233,0|He.___func___str_array_push,0|He.__str117287);var M=Se[Se[v]+(Se[t]<<2)>>2]}else var M=S;var M;Pa(M,A,E,1),va(A),Ae[Se[Se[v]+(Se[t]<<2)>>2]+g|0]=0;var C=Se[t]+1|0;Se[t]=C;var R=i+8|0;if(C>>>0<Me[R>>2]>>>0){var l=1;break}Se[R>>2]=C;var l=1}while(0);var l;return l}function Xr(r,a,e,i,v){var t,f,_=Oe;Oe+=28;var s,n=_,o=_+8;Cr(o);var f=(r+12|0)>>2,l=0==(0|e),t=(0|n)>>2,b=n+4|0;r:do if(l)for(;;){var k=Se[f],u=Ae[k];if(u<<24>>24==0){s=12;break r}if(u<<24>>24==64){var c=k;s=7;break r}var h=Pr(r,n,a,1);if(0==(0|h)){var d=0;s=25;break r}var w=Se[t],p=Se[b>>2],E=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=w,Se[ne+4>>2]=p,ne)),A=Fr(r,E,-1,o);if(0==(0|A)){var d=0;s=25;break r}var g=Se[t],y=Da(g,0|He.__str110280);if(0==(0|y)){s=12;break r}}else for(;;){var m=Se[f],S=Ae[m];if(S<<24>>24==0){s=12;break r}if(S<<24>>24==64){var c=m;s=7;break r}var M=Pr(r,n,a,1);if(0==(0|M)){var d=0;s=25;break r}var C=Se[t],R=Da(C,0|He.__str84254);if(0==(0|R)){s=13;break r}var T=Se[b>>2],O=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=C,Se[ne+4>>2]=T,ne)),N=Fr(r,O,-1,o);if(0==(0|N)){var d=0;s=25;break r}var I=Se[t],P=Da(I,0|He.__str110280);if(0==(0|P)){s=12;break r}}while(0);do if(7==s){var c;Se[f]=c+1|0,s=12;break}while(0);do if(12==s){if(l){s=14;break}s=13;break}while(0);do if(13==s){var D=Se[f],L=D+1|0;if(Se[f]=L,Ae[D]<<24>>24==90){s=14;break}var d=0;s=25;break}while(0);r:do if(14==s){var F=o+4|0,X=Me[F>>2];do{if(0!=(0|X)){if(1==(0|X)){var j=o+16|0,U=Se[Se[j>>2]>>2],x=Da(U,0|He.__str84254);if(0==(0|x)){s=17;break}var z=j;s=20;break}var V=o+16|0;if(X>>>0<=1){var z=V;s=20;break}for(var B=0,H=1;;){var H,B,K=Se[Se[V>>2]+(H<<2)>>2],Y=Dr(r,0|He.__str112282,(ne=Oe,Oe+=8,Se[ne>>2]=B,Se[ne+4>>2]=K,ne)),G=H+1|0;if(G>>>0>=Me[F>>2]>>>0)break;var B=Y,H=G}if(0==(0|Y)){var z=V;s=20;break}var W=Y,Z=Y;s=21;break}s=17}while(0);if(17==s){var Q=i<<24>>24,q=v<<24>>24,$=Dr(r,0|He.__str111281,(ne=Oe,Oe+=8,Se[ne>>2]=Q,Se[ne+4>>2]=q,ne)),d=$;break}if(20==s)var z,W=Se[Se[z>>2]>>2],Z=0;var Z,W,J=v<<24>>24,rr=v<<24>>24==62;do if(rr){var ar=Ca(W);if(Ae[W+(ar-1)|0]<<24>>24!=62)break;var er=i<<24>>24,ir=Se[Se[o+16>>2]>>2],vr=Dr(r,0|He.__str113283,(ne=Oe,Oe+=16,Se[ne>>2]=er,Se[ne+4>>2]=ir,Se[ne+8>>2]=Z,Se[ne+12>>2]=J,ne)),d=vr;break r}while(0);var tr=i<<24>>24,fr=Se[Se[o+16>>2]>>2],_r=Dr(r,0|He.__str114284,(ne=Oe,Oe+=16,Se[ne>>2]=tr,Se[ne+4>>2]=fr,Se[ne+8>>2]=Z,Se[ne+12>>2]=J,ne)),d=_r}while(0);var d;return Oe=_,d}function jr(r){var a,e=Oe;Oe+=20;var i=e,v=r+24|0,t=Se[v>>2],a=(r+20|0)>>2,f=Se[a],_=r+44|0,s=Se[_>>2];Se[a]=t;var n=Kr(r);if(0==(0|n))var o=0;else{Cr(i);var l=Xr(r,i,0,60,62);if(0==(0|l))var b=n;else var k=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=n,Se[ne+4>>2]=l,ne)),b=k;var b;Se[v>>2]=t,Se[a]=f,Se[_>>2]=s;var o=b}var o;return Oe=e,o}function Ur(r,a,e,i){var v,t=a>>2;Se[e>>2]=0,Se[t]=0;var f=0==(18&i|0);do{if(f){var _=r<<24>>24,s=1==((_-65)%2|0);if(0==(1&i|0)){if(s?Se[e>>2]=0|He.__str95265:v=14,65==(0|_)||66==(0|_)){Se[t]=0|He.__str96266,v=21;break}if(67==(0|_)||68==(0|_)){Se[t]=0|He.__str97267,v=21;break}if(69==(0|_)||70==(0|_)){Se[t]=0|He.__str98268,v=21;break}if(71==(0|_)||72==(0|_)){Se[t]=0|He.__str99269,v=21;break}if(73==(0|_)||74==(0|_)){Se[t]=0|He.__str100270,v=21;break}if(75==(0|_)||76==(0|_)){v=21;break}if(77==(0|_)){Se[t]=0|He.__str101271,v=21;break}var n=0;v=22;break}if(s?Se[e>>2]=0|He.__str88258:v=5,65==(0|_)||66==(0|_)){Se[t]=0|He.__str89259,v=21;break}if(67==(0|_)||68==(0|_)){Se[t]=0|He.__str90260,v=21;break}if(69==(0|_)||70==(0|_)){Se[t]=0|He.__str91261,v=21;break}if(71==(0|_)||72==(0|_)){Se[t]=0|He.__str92262,v=21;break}if(73==(0|_)||74==(0|_)){Se[t]=0|He.__str93263,v=21;break}if(75==(0|_)||76==(0|_)){v=21;break}if(77==(0|_)){Se[t]=0|He.__str94264,v=21;break}var n=0;v=22;break}v=21}while(0);if(21==v)var n=1;var n;return n}function xr(r,a,e){var i;Se[e>>2]=0;var i=(r+12|0)>>2,v=Se[i];if(Ae[v]<<24>>24==69){Se[e>>2]=0|He.__str102272;var t=Se[i]+1|0;Se[i]=t;var f=t}else var f=v;var f;Se[i]=f+1|0;var _=Ae[f]<<24>>24;if(65==(0|_)){Se[a>>2]=0;var s=1}else if(66==(0|_)){Se[a>>2]=0|He.__str103273;var s=1}else if(67==(0|_)){Se[a>>2]=0|He.__str104274;var s=1}else if(68==(0|_)){Se[a>>2]=0|He.__str105275;var s=1}else var s=0;var s;return s}function zr(r){var a,e,a=(r+12|0)>>2,i=r+40|0,v=r+20|0,t=0|i,f=r+44|0,_=r+48|0,s=r+52|0,n=r+56|0,o=r+20|0,l=r+24|0,b=r+16|0,k=0;r:for(;;){var k,u=Se[a],c=Ae[u];if(c<<24>>24==64){var h=u+1|0;Se[a]=h;var d=1;break}var w=c<<24>>24;do{if(0==(0|w)){var d=0;break r}if(48==(0|w)||49==(0|w)||50==(0|w)||51==(0|w)||52==(0|w)||53==(0|w)||54==(0|w)||55==(0|w)||56==(0|w)||57==(0|w)){var p=u+1|0;Se[a]=p;var E=(Ae[u]<<24>>24)-48|0,A=Yr(v,E),g=A;e=14;break}if(63==(0|w)){var y=u+1|0;Se[a]=y;var m=Ae[y]<<24>>24;if(36==(0|m)){var S=u+2|0;Se[a]=S;var M=jr(r);if(0==(0|M)){var d=0;break r}var C=Fr(r,M,-1,v);if(0==(0|C)){var d=0;break r}var R=M;e=15;break}if(63==(0|m)){var T=Se[t>>2],O=Se[f>>2],N=Se[_>>2],I=Se[s>>2],P=Se[n>>2],D=Se[o>>2],L=Se[l>>2];Cr(i);var F=Ir(r);if(0==(0|F))var X=k;else var j=Se[b>>2],U=Dr(r,0|He.__str109279,(ne=Oe,Oe+=4,Se[ne>>2]=j,ne)),X=U;var X;Se[o>>2]=D,Se[l>>2]=L,Se[t>>2]=T,Se[f>>2]=O,Se[_>>2]=N,Se[s>>2]=I,Se[n>>2]=P;var g=X;e=14;break}var x=Lr(r);if(0==(0|x)){var d=0;break r}var z=Dr(r,0|He.__str109279,(ne=Oe,Oe+=4,Se[ne>>2]=x,ne)),g=z;e=14;break}var V=Kr(r),g=V;e=14;break}while(0);if(14==e){var g;if(0==(0|g)){var d=0;break}var R=g}var R,B=Fr(r,R,-1,i);if(0==(0|B)){var d=0;break}var k=R}var d;return d}function Vr(r){var a,e,i,v=Oe;Oe+=36;var t,f=v,i=f>>2,_=v+4,s=v+8,e=s>>2,n=v+16;Se[i]=0;var o=0|r,l=Se[o>>2],b=0==(128&l|0),k=r+12|0;do if(b){var u=Ae[Se[k>>2]]<<24>>24;if(48==(0|u))var c=0|He.__str76246,h=k,a=h>>2;else if(49==(0|u))var c=0|He.__str77247,h=k,a=h>>2;else{if(50!=(0|u)){var c=0,h=k,a=h>>2;break}var c=0|He.__str78248,h=k,a=h>>2}}else var c=0,h=k,a=h>>2;while(0);var h,c,d=0==(512&l|0);do if(d){if((Ae[Se[a]]-48&255&255)>=3){var w=0;break}var w=0|He.__str79249}else var w=0;while(0);var w,p=Gr(r,0),E=Se[a],A=E+1|0;Se[a]=A;var g=Ae[E]<<24>>24;do{if(48==(0|g)||49==(0|g)||50==(0|g)||51==(0|g)||52==(0|g)||53==(0|g)){var y=r+44|0,m=Se[y>>2];Cr(n);var S=Pr(r,s,n,0);if(0==(0|S)){var M=0;t=28;break}var C=xr(r,f,_);if(0==(0|C)){var M=0;t=28;break}var R=Se[i],T=0==(0|R),O=Se[_>>2];do if(T)Se[i]=O;else{if(0==(0|O))break;var N=Dr(r,0|He.__str83253,(ne=Oe,Oe+=8,Se[ne>>2]=R,Se[ne+4>>2]=O,ne));Se[i]=N}while(0);Se[y>>2]=m,t=22;break}if(54==(0|g)||55==(0|g)){var I=s+4|0;Se[I>>2]=0,Se[e]=0;var P=xr(r,f,_);if(0==(0|P)){var M=0;t=28;break}if(Ae[Se[a]]<<24>>24==64){t=22;break}var D=qr(r);if(0==(0|D)){var M=0;t=28;break}var L=Dr(r,0|He.__str107277,(ne=Oe,Oe+=4,Se[ne>>2]=D,ne));Se[I>>2]=L,t=22;break}if(56==(0|g)||57==(0|g)){Se[e+1]=0,Se[e]=0,Se[i]=0,t=22;break}var M=0;t=28}while(0);if(22==t){var F=0==(4096&Se[o>>2]|0);do{if(F){var X=Se[e],j=Se[i];if(0==(0|j)){var U=X;t=26;break}var x=0!=(0|X)?0|He.__str87257:0,z=0|He.__str87257,V=j,B=x,H=X;t=27;break}Se[i]=0,Se[e+1]=0,Se[e]=0;var U=0;t=26;break}while(0);if(26==t)var U,K=0!=(0|U)?0|He.__str87257:0,z=K,V=0,B=0,H=U;var H,B,V,z,Y=Se[e+1],G=Dr(r,0|He.__str108278,(ne=Oe,Oe+=32,Se[ne>>2]=c,Se[ne+4>>2]=w,Se[ne+8>>2]=H,Se[ne+12>>2]=B,Se[ne+16>>2]=V,Se[ne+20>>2]=z,Se[ne+24>>2]=p,Se[ne+28>>2]=Y,ne));Se[r+16>>2]=G;var M=1}var M;return Oe=v,M}function Br(r,a){var e,i,v,t,f=Oe;Oe+=44;var _,s=f,t=s>>2,n=f+8,o=f+12,v=o>>2,l=f+16,b=f+20,k=f+40;Se[v]=0;var i=(r+12|0)>>2,u=Se[i],c=u+1|0;Se[i]=c;var h=ge[u],d=h<<24>>24,w=(h-65&255&255)>25;r:do if(w)var p=0;else{var e=(0|r)>>2,E=Me[e],A=0==(128&E|0),g=d-65|0;do if(A){var y=g/8|0;if(0==(0|y))var m=0|He.__str76246,S=g;else if(1==(0|y))var m=0|He.__str77247,S=g;else{if(2!=(0|y)){var m=0,S=g;break}var m=0|He.__str78248,S=g}}else var m=0,S=g;while(0);var S,m,M=0==(512&E|0)&h<<24>>24<89,C=(0|S)%8;do if(M)if(2==(0|C)||3==(0|C))var R=m,T=0|He.__str79249;else if(4==(0|C)||5==(0|C))var R=m,T=0|He.__str80250;else{if(6!=(0|C)&&7!=(0|C)){var R=m,T=0;break}var O=Dr(r,0|He.__str81251,(ne=Oe,Oe+=4,Se[ne>>2]=m,ne)),R=O,T=0|He.__str80250}else var R=m,T=0;while(0);var T,R,N=Gr(r,0),I=6==(0|C);do{if(!I){if(7==((d-56)%8|0)){_=14;break}var P=N;_=15;break}_=14}while(0);if(14==_)var D=Lr(r),L=Dr(r,0|He.__str82252,(ne=Oe,Oe+=8,Se[ne>>2]=N,Se[ne+4>>2]=D,ne)),P=L;var P,F=h<<24>>24>88;do if(F)var X=0;else{if((C-2|0)>>>0<2){var X=0;break}var j=xr(r,o,k);if(0==(0|j)){var p=0;break r}var U=Me[v],x=Se[k>>2];if(0==(0|U)&0==(0|x)){var X=0;break}var z=Dr(r,0|He.__str83253,(ne=Oe,Oe+=8,Se[ne>>2]=U,Se[ne+4>>2]=x,ne));Se[v]=z;var X=z}while(0);var X,V=Se[i],B=V+1|0;Se[i]=B;var H=Ae[V],K=Se[e],Y=Ur(H,n,l,K);if(0==(0|Y)){var p=0;break}Cr(b);var G=Se[i];if(Ae[G]<<24>>24==64){Se[t]=0|He.__str84254,Se[t+1]=0;var W=G+1|0;Se[i]=W}else{var Z=Pr(r,s,b,0);if(0==(0|Z)){var p=0;break}}if(0!=(4&Se[e]|0)&&(Se[t+1]=0,Se[t]=0),0==(0|a))var Q=P;else{var q=0|s,$=Se[q>>2],J=s+4|0,rr=Se[J>>2],ar=Dr(r,0|He.__str85255,(ne=Oe,Oe+=12,Se[ne>>2]=P,Se[ne+4>>2]=$,Se[ne+8>>2]=rr,ne));Se[J>>2]=0,Se[q>>2]=0;var Q=ar}var Q,er=r+44|0,ir=Se[er>>2],vr=Xr(r,b,1,40,41);if(0==(0|vr)){var p=0;break}if(0==(4096&Se[e]|0))var tr=vr,fr=X;else{Se[v]=0;var tr=0,fr=0}var fr,tr;Se[er>>2]=ir;var _r=Se[t],sr=Se[t+1];if(0==(0|_r))var nr=0;else var or=0!=(0|sr)?0:0|He.__str87257,nr=or;var nr,lr=Se[n>>2],br=0!=(0|lr)?0|He.__str87257:0,kr=Se[l>>2],ur=Dr(r,0|He.__str86256,(ne=Oe,Oe+=44,Se[ne>>2]=R,Se[ne+4>>2]=T,Se[ne+8>>2]=_r,Se[ne+12>>2]=nr,Se[ne+16>>2]=lr,Se[ne+20>>2]=br,Se[ne+24>>2]=kr,Se[ne+28>>2]=Q,Se[ne+32>>2]=tr,Se[ne+36>>2]=fr,Se[ne+40>>2]=sr,ne));Se[r+16>>2]=ur;var p=1}while(0);var p;return Oe=f,p}function Hr(r){var a,a=(r+12|0)>>2,e=Se[a];if(Ae[e]<<24>>24==36)var i=e;else{Xa(0|He.__str72242,1252,0|He.___func___handle_template,0|He.__str74244);var i=Se[a]}var i;Se[a]=i+1|0;var v=Kr(r),t=0==(0|v);do if(t)var f=0;else{var _=Xr(r,0,0,60,62);if(0==(0|_)){var f=0;break}var s=Dr(r,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=v,Se[ne+4>>2]=_,ne));Se[r+16>>2]=s;var f=1}while(0);var f;return f}function Kr(r){for(var a,a=(r+12|0)>>2,e=Me[a],i=e,v=Ae[e];;){var v,i;if(!((v-65&255&255)<26|(v-97&255&255)<26|(v-48&255&255)<10)&&v<<24>>24!=95&&v<<24>>24!=36){var t=0;break}var f=i+1|0;Se[a]=f;var _=ge[f];if(_<<24>>24==64){Se[a]=i+2|0;var s=f-e|0,n=r+20|0,o=Fr(r,e,s,n);if(0==(0|o)){var t=0;break}var l=Se[r+24>>2]-1-Se[n>>2]|0,b=Yr(n,l),t=b;break}var i=f,v=_}var t;return t}function Yr(r,a){0==(0|r)&&Xa(0|He.__str72242,263,0|He.___func___str_array_get_ref,0|He.__str75245);var e=Se[r>>2]+a|0;if(e>>>0<Me[r+8>>2]>>>0)var i=Se[Se[r+16>>2]+(e<<2)>>2];else var i=0;var i;return i}function Gr(r,a){var e,e=(r+44|0)>>2,i=Me[e];if(i>>>0>a>>>0){for(var v=r+56|0,t=a,f=0,_=Se[v>>2],s=i;;){var s,_,f,t,n=Me[_+(t<<2)>>2];if(0==(0|n)){Xa(0|He.__str72242,680,0|He.___func___get_class_string,0|He.__str106276);var o=Se[v>>2],l=o,b=Se[o+(t<<2)>>2],k=Se[e]}else var l=_,b=n,k=s;var k,b,l,u=Ca(b),c=u+(f+2)|0,h=t+1|0;if(h>>>0>=k>>>0)break;var t=h,f=c,_=l,s=k}var d=c-1|0}else var d=-1;var d,w=Wr(r,d);if(0==(0|w))var p=0;else{var E=Se[e]-1|0,A=(0|E)<(0|a);r:do if(A)var g=0;else for(var y=r+56|0,m=0,S=E;;){var S,m,M=Se[Se[y>>2]+(S<<2)>>2],C=Ca(M),R=w+m|0;Pa(R,M,C,1);var T=C+m|0;if((0|S)>(0|a)){var O=T+1|0;Ae[w+T|0]=58;var N=T+2|0;Ae[w+O|0]=58;var I=N}else var I=T;var I,P=S-1|0;if((0|P)<(0|a)){var g=I;break r}var m=I,S=P}while(0);var g;Ae[w+g|0]=0;var p=w}var p;return p}function Wr(r,a){var e,i=a>>>0>1020;do if(i){var v=Se[r+4>>2],t=a+4|0,f=pe[v](t);if(0==(0|f)){var _=0;break}var s=r+60|0,n=Se[s>>2],o=f;Se[o>>2]=n,Se[s>>2]=f,Se[r+64>>2]=0;var _=f+4|0}else{var e=(r+64|0)>>2,l=Me[e];if(l>>>0<a>>>0){var b=Se[r+4>>2],k=pe[b](1024);if(0==(0|k)){var _=0;break}var u=r+60|0,c=Se[u>>2],h=k;Se[h>>2]=c,Se[u>>2]=k,Se[e]=1020;var d=1020,w=k}else var d=l,w=Se[r+60>>2];var w,d;Se[e]=d-a|0;var _=w+(1024-d)|0}while(0);var _;return _}function Zr(r){var a=r<<24>>24;if(68==(0|a))var e=0|He.__str157327;else if(69==(0|a))var e=0|He.__str158328;else if(70==(0|a))var e=0|He.__str159329;else if(71==(0|a))var e=0|He.__str160330;else if(72==(0|a))var e=0|He.__str161331;else if(73==(0|a))var e=0|He.__str162332;else if(74==(0|a))var e=0|He.__str163333;else if(75==(0|a))var e=0|He.__str164334;else if(76==(0|a))var e=0|He.__str165335;else if(77==(0|a))var e=0|He.__str166336;else if(78==(0|a))var e=0|He.__str167337;else if(87==(0|a))var e=0|He.__str168338;else var e=0;var e;return e}function Qr(r){var a=r<<24>>24;if(67==(0|a))var e=0|He.__str145315;else if(68==(0|a))var e=0|He.__str146316;else if(69==(0|a))var e=0|He.__str147317;else if(70==(0|a))var e=0|He.__str148318;else if(71==(0|a))var e=0|He.__str149319;else if(72==(0|a))var e=0|He.__str150320;else if(73==(0|a))var e=0|He.__str151321;else if(74==(0|a))var e=0|He.__str152322;else if(75==(0|a))var e=0|He.__str153323;else if(77==(0|a))var e=0|He.__str154324;else if(78==(0|a))var e=0|He.__str155325;else if(79==(0|a))var e=0|He.__str156326;else if(88==(0|a))var e=0|He.__str84254;else if(90==(0|a))var e=0|He.__str110280;else var e=0;var e;return e}function qr(r){var a=r+44|0,e=Se[a>>2],i=zr(r);if(0==(0|i))var v=0;else var t=Gr(r,e),v=t;var v;return Se[a>>2]=e,v}function $r(r,a,e,i,v){var t,f,_,s=Oe;Oe+=16;var n,o=s,_=o>>2,l=s+4,b=s+8,f=b>>2;Se[l>>2]=0|ii;var t=(a+12|0)>>2,k=Se[t];if(Ae[k]<<24>>24==69){Se[l>>2]=0|He.__str134304;var u=k+1|0;Se[t]=u;var c=0|He.__str134304}else var c=0|ii;var c,h=i<<24>>24;do{if(65==(0|h)){var d=Dr(a,0|He.__str135305,(ne=Oe,Oe+=4,Se[ne>>2]=c,ne)),w=d;n=10;break}if(66==(0|h)){var p=Dr(a,0|He.__str136306,(ne=Oe,Oe+=4,Se[ne>>2]=c,ne)),w=p;n=10;break}if(80==(0|h)){var E=Dr(a,0|He.__str137307,(ne=Oe,Oe+=4,Se[ne>>2]=c,ne)),w=E;n=10;break}if(81==(0|h)){var A=Dr(a,0|He.__str138308,(ne=Oe,Oe+=4,Se[ne>>2]=c,ne)),w=A;n=10;break}if(82==(0|h)){var g=Dr(a,0|He.__str139309,(ne=Oe,Oe+=4,Se[ne>>2]=c,ne)),w=g;n=10;break}if(83==(0|h)){var y=Dr(a,0|He.__str140310,(ne=Oe,Oe+=4,Se[ne>>2]=c,ne)),w=y;n=10;break}if(63==(0|h)){var w=0|ii;n=10}else n=31}while(0);r:do if(10==n){var w,m=xr(a,o,l);if(0==(0|m))break;var S=a+44|0,M=Se[S>>2],C=Se[t],R=Ae[C]<<24>>24==89;a:do if(R){var T=C+1|0;Se[t]=T;var O=Lr(a);if(0==(0|O))break r;var N=Ha(O),I=Ae[w]<<24>>24==32,P=Se[_],D=0==(0|P);do{if(I){if(!D){n=17;break}var L=w+1|0;n=18;break}if(D){var L=w;n=18;break}n=17;break}while(0);if(17==n){var F=Dr(a,0|He.__str141311,(ne=Oe,Oe+=8,Se[ne>>2]=P,Se[ne+4>>2]=w,ne));Se[_]=0;var X=F}else if(18==n)var L,j=Dr(a,0|He.__str142312,(ne=Oe,Oe+=4,Se[ne>>2]=L,ne)),X=j;var X;if(0==(0|N)){var U=X;break}for(var x=X,z=N;;){var z,x,V=z-1|0,B=Lr(a),H=Dr(a,0|He.__str143313,(ne=Oe,Oe+=8,Se[ne>>2]=x,Se[ne+4>>2]=B,ne));if(0==(0|V)){var U=H;break a}var x=H,z=V}}else var U=w;while(0);var U,K=Pr(a,b,e,0);if(0==(0|K))break;var Y=Se[_];if(0==(0|Y)){var G=0==(0|v);do if(G){if(Ae[U]<<24>>24==0){var W=U;break}var Z=U+1|0;if(Ae[Z]<<24>>24!=42){var W=U;break}var Q=Se[f],q=Ca(Q);if(Ae[Q+(q-1)|0]<<24>>24!=42){var W=U;break}var W=Z}else var W=U;while(0);var W,$=Se[f],J=Dr(a,0|He.__str170,(ne=Oe,Oe+=8,Se[ne>>2]=$,Se[ne+4>>2]=W,ne));Se[r>>2]=J}else{var rr=Se[f],ar=Dr(a,0|He.__str144314,(ne=Oe,Oe+=12,Se[ne>>2]=rr,Se[ne+4>>2]=Y,Se[ne+8>>2]=U,ne));Se[r>>2]=ar}var er=Se[f+1];Se[r+4>>2]=er,Se[S>>2]=M}while(0);Oe=s}function Jr(r){var a,e=r>>>0<245;do{if(e){if(r>>>0<11)var i=16;else var i=r+11&-8;var i,v=i>>>3,t=Me[vi>>2],f=t>>>(v>>>0);if(0!=(3&f|0)){var _=(1&f^1)+v|0,s=_<<1,n=(s<<2)+vi+40|0,o=(s+2<<2)+vi+40|0,l=Me[o>>2],b=l+8|0,k=Me[b>>2];if((0|n)==(0|k))Se[vi>>2]=t&(1<<_^-1);else{if(k>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[o>>2]=k,Se[k+12>>2]=n}var u=_<<3;Se[l+4>>2]=3|u;var c=l+(4|u)|0,h=1|Se[c>>2];Se[c>>2]=h;var d=b;a=38;break}if(i>>>0<=Me[vi+8>>2]>>>0){var w=i;a=30;break}if(0!=(0|f)){var p=2<<v,E=f<<v&(p|-p),A=(E&-E)-1|0,g=A>>>12&16,y=A>>>(g>>>0),m=y>>>5&8,S=y>>>(m>>>0),M=S>>>2&4,C=S>>>(M>>>0),R=C>>>1&2,T=C>>>(R>>>0),O=T>>>1&1,N=(m|g|M|R|O)+(T>>>(O>>>0))|0,I=N<<1,P=(I<<2)+vi+40|0,D=(I+2<<2)+vi+40|0,L=Me[D>>2],F=L+8|0,X=Me[F>>2];if((0|P)==(0|X))Se[vi>>2]=t&(1<<N^-1);else{if(X>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[D>>2]=X,Se[X+12>>2]=P}var j=N<<3,U=j-i|0;Se[L+4>>2]=3|i;var x=L,z=x+i|0;Se[x+(4|i)>>2]=1|U,Se[x+j>>2]=U;var V=Me[vi+8>>2];if(0!=(0|V)){var B=Se[vi+20>>2],H=V>>>2&1073741822,K=(H<<2)+vi+40|0,Y=Me[vi>>2],G=1<<(V>>>3),W=0==(Y&G|0);do{if(!W){var Z=(H+2<<2)+vi+40|0,Q=Me[Z>>2];if(Q>>>0>=Me[vi+16>>2]>>>0){var q=Q,$=Z;break}throw Ka(),"Reached an unreachable!"}Se[vi>>2]=Y|G;var q=K,$=(H+2<<2)+vi+40|0}while(0);var $,q;Se[$>>2]=B,Se[q+12>>2]=B;var J=B+8|0;Se[J>>2]=q;var rr=B+12|0;Se[rr>>2]=K}Se[vi+8>>2]=U,Se[vi+20>>2]=z;var d=F;a=38;break}if(0==(0|Se[vi+4>>2])){var w=i;a=30;break}var ar=ra(i);if(0==(0|ar)){var w=i;a=30;break}var d=ar;a=38;break}if(r>>>0>4294967231){var w=-1;a=30;break}var er=r+11&-8;if(0==(0|Se[vi+4>>2])){var w=er;a=30;break}var ir=ea(er);if(0==(0|ir)){var w=er;a=30;break}var d=ir;a=38;break}while(0);if(30==a){var w,vr=Me[vi+8>>2];if(w>>>0>vr>>>0){var tr=Me[vi+12>>2];if(w>>>0<tr>>>0){var fr=tr-w|0;Se[vi+12>>2]=fr;var _r=Me[vi+24>>2],sr=_r;Se[vi+24>>2]=sr+w|0,Se[w+(sr+4)>>2]=1|fr,Se[_r+4>>2]=3|w;var d=_r+8|0}else var nr=aa(w),d=nr}else{var or=vr-w|0,lr=Me[vi+20>>2];if(or>>>0>15){var br=lr;Se[vi+20>>2]=br+w|0,Se[vi+8>>2]=or,Se[w+(br+4)>>2]=1|or,Se[br+vr>>2]=or,Se[lr+4>>2]=3|w}else{Se[vi+8>>2]=0,Se[vi+20>>2]=0,Se[lr+4>>2]=3|vr;var kr=vr+(lr+4)|0,ur=1|Se[kr>>2];Se[kr>>2]=ur}var d=lr+8|0}}var d;return d}function ra(r){var a,e,i,v=Se[vi+4>>2],t=(v&-v)-1|0,f=t>>>12&16,_=t>>>(f>>>0),s=_>>>5&8,n=_>>>(s>>>0),o=n>>>2&4,l=n>>>(o>>>0),b=l>>>1&2,k=l>>>(b>>>0),u=k>>>1&1,c=Me[vi+((s|f|o|b|u)+(k>>>(u>>>0))<<2)+304>>2],h=c,e=h>>2,d=(Se[c+4>>2]&-8)-r|0;r:for(;;)for(var d,h,w=h;;){var w,p=Se[w+16>>2];if(0==(0|p)){var E=Se[w+20>>2];if(0==(0|E))break r;var A=E}else var A=p;var A,g=(Se[A+4>>2]&-8)-r|0;if(g>>>0<d>>>0){var h=A,e=h>>2,d=g;continue r}var w=A}var y=h,m=Me[vi+16>>2],S=y>>>0<m>>>0;do if(!S){var M=y+r|0,C=M;if(y>>>0>=M>>>0)break;var R=Me[e+6],T=Me[e+3],O=(0|T)==(0|h);do if(O){var N=h+20|0,I=Se[N>>2];if(0==(0|I)){var P=h+16|0,D=Se[P>>2];if(0==(0|D)){var L=0,a=L>>2;break}var F=P,X=D}else{var F=N,X=I;i=14}for(;;){var X,F,j=X+20|0,U=Se[j>>2];if(0==(0|U)){var x=X+16|0,z=Me[x>>2];if(0==(0|z))break;var F=x,X=z}else var F=j,X=U}if(F>>>0<m>>>0)throw Ka(),"Reached an unreachable!";Se[F>>2]=0;var L=X,a=L>>2}else{var V=Me[e+2];if(V>>>0<m>>>0)throw Ka(),"Reached an unreachable!";Se[V+12>>2]=T,Se[T+8>>2]=V;var L=T,a=L>>2}while(0);var L,B=0==(0|R);r:do if(!B){var H=h+28|0,K=(Se[H>>2]<<2)+vi+304|0,Y=(0|h)==(0|Se[K>>2]);do{if(Y){if(Se[K>>2]=L,0!=(0|L))break;var G=Se[vi+4>>2]&(1<<Se[H>>2]^-1);Se[vi+4>>2]=G;break r}if(R>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";var W=R+16|0;if((0|Se[W>>2])==(0|h)?Se[W>>2]=L:Se[R+20>>2]=L,0==(0|L))break r}while(0);if(L>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+6]=R;var Z=Me[e+4];if(0!=(0|Z)){if(Z>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+4]=Z,Se[Z+24>>2]=L}var Q=Me[e+5];if(0==(0|Q))break;if(Q>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+5]=Q,Se[Q+24>>2]=L}while(0);if(d>>>0<16){var q=d+r|0;Se[e+1]=3|q;var $=q+(y+4)|0,J=1|Se[$>>2];Se[$>>2]=J}else{Se[e+1]=3|r,Se[r+(y+4)>>2]=1|d,Se[y+d+r>>2]=d;var rr=Me[vi+8>>2];if(0!=(0|rr)){var ar=Me[vi+20>>2],er=rr>>>2&1073741822,ir=(er<<2)+vi+40|0,vr=Me[vi>>2],tr=1<<(rr>>>3),fr=0==(vr&tr|0);do{if(!fr){var _r=(er+2<<2)+vi+40|0,sr=Me[_r>>2];if(sr>>>0>=Me[vi+16>>2]>>>0){var nr=sr,or=_r;break}throw Ka(),"Reached an unreachable!"}Se[vi>>2]=vr|tr;var nr=ir,or=(er+2<<2)+vi+40|0}while(0);var or,nr;Se[or>>2]=ar,Se[nr+12>>2]=ar,Se[ar+8>>2]=nr,Se[ar+12>>2]=ir}Se[vi+8>>2]=d,Se[vi+20>>2]=C}return h+8|0}while(0);throw Ka(),"Reached an unreachable!"}function aa(r){var a,e;0==(0|Se[ti>>2])&&ba();var i=0==(4&Se[vi+440>>2]|0);do{if(i){var v=Se[vi+24>>2],t=0==(0|v);do{if(!t){var f=v,_=ua(f);if(0==(0|_)){e=6;break}var s=Se[ti+8>>2],n=r+47-Se[vi+12>>2]+s&-s;if(n>>>0>=2147483647){e=14;break}var o=re(n);if((0|o)==(Se[_>>2]+Se[_+4>>2]|0)){var l=o,b=n,k=o;e=13;break}var u=o,c=n;e=15;break}e=6}while(0);do if(6==e){var h=re(0);if((0|h)==-1){e=14;break}var d=Se[ti+8>>2],w=d+(r+47)&-d,p=h,E=Se[ti+4>>2],A=E-1|0;if(0==(A&p|0))var g=w;else var g=w-p+(A+p&-E)|0;var g;if(g>>>0>=2147483647){e=14;break}var y=re(g);if((0|y)==(0|h)){var l=h,b=g,k=y;e=13;break}var u=y,c=g;e=15;break}while(0);if(13==e){var k,b,l;if((0|l)!=-1){var m=b,S=l;e=26;break}var u=k,c=b}else if(14==e){var M=4|Se[vi+440>>2];Se[vi+440>>2]=M,e=23;break}var c,u,C=0|-c,R=(0|u)!=-1&c>>>0<2147483647;do{if(R){if(c>>>0>=(r+48|0)>>>0){var T=c;e=21;break}var O=Se[ti+8>>2],N=r+47-c+O&-O;if(N>>>0>=2147483647){var T=c;e=21;break}var I=re(N);if((0|I)==-1){re(C);e=22;break}var T=N+c|0;e=21;break}var T=c;e=21}while(0);if(21==e){var T;if((0|u)!=-1){var m=T,S=u;e=26;break}}var P=4|Se[vi+440>>2];Se[vi+440>>2]=P,e=23;break}e=23}while(0);do if(23==e){var D=Se[ti+8>>2],L=D+(r+47)&-D;if(L>>>0>=2147483647){e=49;break}var F=re(L),X=re(0);if(!((0|X)!=-1&(0|F)!=-1&F>>>0<X>>>0)){e=49;break}var j=X-F|0;if(j>>>0<=(r+40|0)>>>0|(0|F)==-1){e=49;break}var m=j,S=F;e=26;break}while(0);r:do if(26==e){var S,m,U=Se[vi+432>>2]+m|0;Se[vi+432>>2]=U,U>>>0>Me[vi+436>>2]>>>0&&(Se[vi+436>>2]=U);var x=Me[vi+24>>2],z=0==(0|x);a:do if(z){var V=Me[vi+16>>2];0==(0|V)|S>>>0<V>>>0&&(Se[vi+16>>2]=S),Se[vi+444>>2]=S,Se[vi+448>>2]=m,Se[vi+456>>2]=0;var B=Se[ti>>2];Se[vi+36>>2]=B,Se[vi+32>>2]=-1,ha(),ca(S,m-40|0)}else{for(var H=vi+444|0,a=H>>2;;){var H;if(0==(0|H))break;var K=Me[a],Y=H+4|0,G=Me[Y>>2],W=K+G|0;if((0|S)==(0|W)){if(0!=(8&Se[a+3]|0))break;var Z=x;if(!(Z>>>0>=K>>>0&Z>>>0<W>>>0))break;Se[Y>>2]=G+m|0;var Q=Se[vi+24>>2],q=Se[vi+12>>2]+m|0;ca(Q,q);break a}var H=Se[a+2],a=H>>2}S>>>0<Me[vi+16>>2]>>>0&&(Se[vi+16>>2]=S);for(var $=S+m|0,J=vi+444|0;;){var J;if(0==(0|J))break;var rr=0|J,ar=Me[rr>>2];if((0|ar)==(0|$)){if(0!=(8&Se[J+12>>2]|0))break;Se[rr>>2]=S;var er=J+4|0,ir=Se[er>>2]+m|0;Se[er>>2]=ir;var vr=da(S,ar,r),tr=vr;e=50;break r}var J=Se[J+8>>2]}Ma(S,m)}while(0);var fr=Me[vi+12>>2];if(fr>>>0<=r>>>0){e=49;break}var _r=fr-r|0;Se[vi+12>>2]=_r;var sr=Me[vi+24>>2],nr=sr;Se[vi+24>>2]=nr+r|0,Se[r+(nr+4)>>2]=1|_r,Se[sr+4>>2]=3|r;var tr=sr+8|0;e=50;break}while(0);if(49==e){var or=Je();Se[or>>2]=12;var tr=0}var tr;return tr}function ea(r){var a,e,i,v,t,f,_=r>>2,s=0|-r,n=r>>>8,o=0==(0|n);do if(o)var l=0;else{if(r>>>0>16777215){var l=31;break}var b=(n+1048320|0)>>>16&8,k=n<<b,u=(k+520192|0)>>>16&4,c=k<<u,h=(c+245760|0)>>>16&2,d=14-(u|b|h)+(c<<h>>>15)|0,l=r>>>((d+7|0)>>>0)&1|d<<1}while(0);var l,w=Me[vi+(l<<2)+304>>2],p=0==(0|w);r:do if(p)var E=0,A=s,g=0;else{if(31==(0|l))var y=0;else var y=25-(l>>>1)|0;for(var y,m=0,S=s,M=w,t=M>>2,C=r<<y,R=0;;){var R,C,M,S,m,T=Se[t+1]&-8,O=T-r|0;if(O>>>0<S>>>0){if((0|T)==(0|r)){var E=M,A=O,g=M;break r}var N=M,I=O}else var N=m,I=S;var I,N,P=Me[t+5],D=Me[((C>>>31<<2)+16>>2)+t],L=0==(0|P)|(0|P)==(0|D)?R:P;if(0==(0|D)){var E=N,A=I,g=L;break r}var m=N,S=I,M=D,t=M>>2,C=C<<1,R=L}}while(0);var g,A,E,F=0==(0|g)&0==(0|E);do if(F){var X=2<<l,j=Se[vi+4>>2]&(X|-X);if(0==(0|j)){var U=g;break}var x=(j&-j)-1|0,z=x>>>12&16,V=x>>>(z>>>0),B=V>>>5&8,H=V>>>(B>>>0),K=H>>>2&4,Y=H>>>(K>>>0),G=Y>>>1&2,W=Y>>>(G>>>0),Z=W>>>1&1,U=Se[vi+((B|z|K|G|Z)+(W>>>(Z>>>0))<<2)+304>>2]}else var U=g;while(0);var U,Q=0==(0|U);r:do if(Q)var q=A,$=E,v=$>>2;else for(var J=U,i=J>>2,rr=A,ar=E;;){var ar,rr,J,er=(Se[i+1]&-8)-r|0,ir=er>>>0<rr>>>0,vr=ir?er:rr,tr=ir?J:ar,fr=Me[i+4];if(0==(0|fr)){var _r=Me[i+5];if(0==(0|_r)){var q=vr,$=tr,v=$>>2;break r}var J=_r,i=J>>2,rr=vr,ar=tr}else var J=fr,i=J>>2,rr=vr,ar=tr}while(0);var $,q,sr=0==(0|$);r:do{if(!sr){if(q>>>0>=(Se[vi+8>>2]-r|0)>>>0){var nr=0;break}var or=$,e=or>>2,lr=Me[vi+16>>2],br=or>>>0<lr>>>0;do if(!br){var kr=or+r|0,ur=kr;if(or>>>0>=kr>>>0)break;var cr=Me[v+6],hr=Me[v+3],dr=(0|hr)==(0|$);do if(dr){var wr=$+20|0,pr=Se[wr>>2];if(0==(0|pr)){var Er=$+16|0,Ar=Se[Er>>2];if(0==(0|Ar)){var gr=0,a=gr>>2;break}var yr=Er,mr=Ar}else{var yr=wr,mr=pr;f=28}for(;;){var mr,yr,Sr=mr+20|0,Mr=Se[Sr>>2];if(0==(0|Mr)){var Cr=mr+16|0,Rr=Me[Cr>>2];if(0==(0|Rr))break;var yr=Cr,mr=Rr}else var yr=Sr,mr=Mr}if(yr>>>0<lr>>>0)throw Ka(),"Reached an unreachable!";Se[yr>>2]=0;var gr=mr,a=gr>>2}else{var Tr=Me[v+2];if(Tr>>>0<lr>>>0)throw Ka(),"Reached an unreachable!";Se[Tr+12>>2]=hr,Se[hr+8>>2]=Tr;var gr=hr,a=gr>>2}while(0);var gr,Or=0==(0|cr);a:do if(!Or){var Nr=$+28|0,Ir=(Se[Nr>>2]<<2)+vi+304|0,Pr=(0|$)==(0|Se[Ir>>2]);do{if(Pr){if(Se[Ir>>2]=gr,0!=(0|gr))break;var Dr=Se[vi+4>>2]&(1<<Se[Nr>>2]^-1);Se[vi+4>>2]=Dr;break a}if(cr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";var Lr=cr+16|0;if((0|Se[Lr>>2])==(0|$)?Se[Lr>>2]=gr:Se[cr+20>>2]=gr,0==(0|gr))break a}while(0);if(gr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+6]=cr;var Fr=Me[v+4];if(0!=(0|Fr)){if(Fr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+4]=Fr,Se[Fr+24>>2]=gr}var Xr=Me[v+5];if(0==(0|Xr))break;if(Xr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+5]=Xr,Se[Xr+24>>2]=gr}while(0);var jr=q>>>0<16;a:do if(jr){var Ur=q+r|0;Se[v+1]=3|Ur;var xr=Ur+(or+4)|0,zr=1|Se[xr>>2];Se[xr>>2]=zr}else if(Se[v+1]=3|r,Se[_+(e+1)]=1|q,Se[(q>>2)+e+_]=q,q>>>0<256){var Vr=q>>>2&1073741822,Br=(Vr<<2)+vi+40|0,Hr=Me[vi>>2],Kr=1<<(q>>>3),Yr=0==(Hr&Kr|0);do{if(!Yr){var Gr=(Vr+2<<2)+vi+40|0,Wr=Me[Gr>>2];if(Wr>>>0>=Me[vi+16>>2]>>>0){var Zr=Wr,Qr=Gr;break}throw Ka(),"Reached an unreachable!"}Se[vi>>2]=Hr|Kr;var Zr=Br,Qr=(Vr+2<<2)+vi+40|0}while(0);var Qr,Zr;Se[Qr>>2]=ur,Se[Zr+12>>2]=ur,Se[_+(e+2)]=Zr,Se[_+(e+3)]=Br}else{var qr=kr,$r=q>>>8,Jr=0==(0|$r);do if(Jr)var ra=0;else{if(q>>>0>16777215){var ra=31;break}var aa=($r+1048320|0)>>>16&8,ea=$r<<aa,ia=(ea+520192|0)>>>16&4,va=ea<<ia,ta=(va+245760|0)>>>16&2,fa=14-(ia|aa|ta)+(va<<ta>>>15)|0,ra=q>>>((fa+7|0)>>>0)&1|fa<<1}while(0);var ra,_a=(ra<<2)+vi+304|0;Se[_+(e+7)]=ra;var sa=r+(or+16)|0;Se[_+(e+5)]=0,Se[sa>>2]=0;var na=Se[vi+4>>2],oa=1<<ra;if(0==(na&oa|0)){var la=na|oa;Se[vi+4>>2]=la,Se[_a>>2]=qr,Se[_+(e+6)]=_a,Se[_+(e+3)]=qr,Se[_+(e+2)]=qr}else{if(31==(0|ra))var ba=0;else var ba=25-(ra>>>1)|0;for(var ba,ka=q<<ba,ua=Se[_a>>2];;){var ua,ka;if((Se[ua+4>>2]&-8|0)==(0|q)){var ca=ua+8|0,ha=Me[ca>>2],da=Me[vi+16>>2],wa=ua>>>0<da>>>0;do if(!wa){if(ha>>>0<da>>>0)break;Se[ha+12>>2]=qr,Se[ca>>2]=qr,Se[_+(e+2)]=ha,Se[_+(e+3)]=ua,Se[_+(e+6)]=0;break a}while(0);throw Ka(),"Reached an unreachable!"}var pa=(ka>>>31<<2)+ua+16|0,Ea=Me[pa>>2];if(0==(0|Ea)){if(pa>>>0>=Me[vi+16>>2]>>>0){Se[pa>>2]=qr,Se[_+(e+6)]=ua,Se[_+(e+3)]=qr,Se[_+(e+2)]=qr;break a}throw Ka(),"Reached an unreachable!"}var ka=ka<<1,ua=Ea}}}while(0);var nr=$+8|0;break r}while(0);throw Ka(),"Reached an unreachable!"}var nr=0}while(0);var nr;return nr}function ia(r){var a;0==(0|Se[ti>>2])&&ba();var e=r>>>0<4294967232;r:do if(e){var i=Me[vi+24>>2];if(0==(0|i)){var v=0;break}var t=Me[vi+12>>2],f=t>>>0>(r+40|0)>>>0;do if(f){var _=Me[ti+8>>2],s=-40-r-1+t+_|0,n=Math.floor((s>>>0)/(_>>>0)),o=(n-1)*_|0,l=i,b=ua(l);if(0!=(8&Se[b+12>>2]|0))break;var k=re(0),a=(b+4|0)>>2;if((0|k)!=(Se[b>>2]+Se[a]|0))break;var u=o>>>0>2147483646?-2147483648-_|0:o,c=0|-u,h=re(c),d=re(0);if(!((0|h)!=-1&d>>>0<k>>>0))break;var w=k-d|0;if((0|k)==(0|d))break;var p=Se[a]-w|0;Se[a]=p;var E=Se[vi+432>>2]-w|0;Se[vi+432>>2]=E;var A=Se[vi+24>>2],g=Se[vi+12>>2]-w|0;ca(A,g);var v=(0|k)!=(0|d);break r}while(0);if(Me[vi+12>>2]>>>0<=Me[vi+28>>2]>>>0){var v=0;break}Se[vi+28>>2]=-1;var v=0}else var v=0;while(0);var v;return 1&v}function va(r){var a,e,i,v,t,f,_,s=r>>2,n=0==(0|r);r:do if(!n){var o=r-8|0,l=o,b=Me[vi+16>>2],k=o>>>0<b>>>0;a:do if(!k){var u=Me[r-4>>2],c=3&u;if(1==(0|c))break;var h=u&-8,f=h>>2,d=r+(h-8)|0,w=d,p=0==(1&u|0);e:do if(p){var E=Me[o>>2];if(0==(0|c))break r;var A=-8-E|0,t=A>>2,g=r+A|0,y=g,m=E+h|0;if(g>>>0<b>>>0)break a;if((0|y)==(0|Se[vi+20>>2])){var v=(r+(h-4)|0)>>2;if(3!=(3&Se[v]|0)){var S=y,i=S>>2,M=m;break}Se[vi+8>>2]=m;var C=Se[v]&-2;Se[v]=C,Se[t+(s+1)]=1|m,Se[d>>2]=m;break r}if(E>>>0<256){var R=Me[t+(s+2)],T=Me[t+(s+3)];if((0|R)!=(0|T)){var O=((E>>>2&1073741822)<<2)+vi+40|0,N=(0|R)!=(0|O)&R>>>0<b>>>0;do if(!N){if(!((0|T)==(0|O)|T>>>0>=b>>>0))break;Se[R+12>>2]=T,Se[T+8>>2]=R;var S=y,i=S>>2,M=m;break e}while(0);throw Ka(),"Reached an unreachable!"}var I=Se[vi>>2]&(1<<(E>>>3)^-1);Se[vi>>2]=I;var S=y,i=S>>2,M=m}else{var P=g,D=Me[t+(s+6)],L=Me[t+(s+3)],F=(0|L)==(0|P);do if(F){var X=A+(r+20)|0,j=Se[X>>2];if(0==(0|j)){var U=A+(r+16)|0,x=Se[U>>2];if(0==(0|x)){var z=0,e=z>>2;break}var V=U,B=x}else{var V=X,B=j;_=21}for(;;){var B,V,H=B+20|0,K=Se[H>>2];if(0==(0|K)){var Y=B+16|0,G=Me[Y>>2];if(0==(0|G))break;var V=Y,B=G}else var V=H,B=K}if(V>>>0<b>>>0)throw Ka(),"Reached an unreachable!";Se[V>>2]=0;var z=B,e=z>>2}else{var W=Me[t+(s+2)];if(W>>>0<b>>>0)throw Ka(),"Reached an unreachable!";Se[W+12>>2]=L,Se[L+8>>2]=W;var z=L,e=z>>2}while(0);var z;if(0==(0|D)){var S=y,i=S>>2,M=m;break}var Z=A+(r+28)|0,Q=(Se[Z>>2]<<2)+vi+304|0,q=(0|P)==(0|Se[Q>>2]);do{if(q){if(Se[Q>>2]=z,0!=(0|z))break;var $=Se[vi+4>>2]&(1<<Se[Z>>2]^-1);Se[vi+4>>2]=$;var S=y,i=S>>2,M=m;break e}if(D>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";var J=D+16|0;if((0|Se[J>>2])==(0|P)?Se[J>>2]=z:Se[D+20>>2]=z,0==(0|z)){var S=y,i=S>>2,M=m;break e}}while(0);if(z>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[e+6]=D;var rr=Me[t+(s+4)];if(0!=(0|rr)){if(rr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[e+4]=rr,Se[rr+24>>2]=z}var ar=Me[t+(s+5)];if(0==(0|ar)){var S=y,i=S>>2,M=m;break}if(ar>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[e+5]=ar,Se[ar+24>>2]=z;var S=y,i=S>>2,M=m}}else var S=l,i=S>>2,M=h;while(0);var M,S,er=S;if(er>>>0>=d>>>0)break;var ir=r+(h-4)|0,vr=Me[ir>>2];if(0==(1&vr|0))break;var tr=0==(2&vr|0);do{if(tr){if((0|w)==(0|Se[vi+24>>2])){var fr=Se[vi+12>>2]+M|0;Se[vi+12>>2]=fr,Se[vi+24>>2]=S;var _r=1|fr;if(Se[i+1]=_r,(0|S)==(0|Se[vi+20>>2])&&(Se[vi+20>>2]=0,Se[vi+8>>2]=0),fr>>>0<=Me[vi+28>>2]>>>0)break r;ia(0);break r}if((0|w)==(0|Se[vi+20>>2])){var sr=Se[vi+8>>2]+M|0;Se[vi+8>>2]=sr,Se[vi+20>>2]=S;var nr=1|sr;Se[i+1]=nr;var or=er+sr|0;Se[or>>2]=sr;break r}var lr=(vr&-8)+M|0,br=vr>>>3,kr=vr>>>0<256;e:do if(kr){var ur=Me[s+f],cr=Me[((4|h)>>2)+s];if((0|ur)!=(0|cr)){var hr=((vr>>>2&1073741822)<<2)+vi+40|0,dr=(0|ur)==(0|hr);do{if(!dr){if(ur>>>0<Me[vi+16>>2]>>>0){_=66;break}_=63;break}_=63}while(0);do if(63==_){if((0|cr)!=(0|hr)&&cr>>>0<Me[vi+16>>2]>>>0)break;Se[ur+12>>2]=cr,Se[cr+8>>2]=ur;break e}while(0);throw Ka(),"Reached an unreachable!"}var wr=Se[vi>>2]&(1<<br^-1);Se[vi>>2]=wr}else{var pr=d,Er=Me[f+(s+4)],Ar=Me[((4|h)>>2)+s],gr=(0|Ar)==(0|pr);do if(gr){var yr=h+(r+12)|0,mr=Se[yr>>2];if(0==(0|mr)){var Sr=h+(r+8)|0,Mr=Se[Sr>>2];if(0==(0|Mr)){var Cr=0,a=Cr>>2;break}var Rr=Sr,Tr=Mr}else{var Rr=yr,Tr=mr;_=73}for(;;){var Tr,Rr,Or=Tr+20|0,Nr=Se[Or>>2];if(0==(0|Nr)){var Ir=Tr+16|0,Pr=Me[Ir>>2];if(0==(0|Pr))break;var Rr=Ir,Tr=Pr}else var Rr=Or,Tr=Nr}if(Rr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[Rr>>2]=0;var Cr=Tr,a=Cr>>2}else{var Dr=Me[s+f];if(Dr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[Dr+12>>2]=Ar,
Se[Ar+8>>2]=Dr;var Cr=Ar,a=Cr>>2}while(0);var Cr;if(0==(0|Er))break;var Lr=h+(r+20)|0,Fr=(Se[Lr>>2]<<2)+vi+304|0,Xr=(0|pr)==(0|Se[Fr>>2]);do{if(Xr){if(Se[Fr>>2]=Cr,0!=(0|Cr))break;var jr=Se[vi+4>>2]&(1<<Se[Lr>>2]^-1);Se[vi+4>>2]=jr;break e}if(Er>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";var Ur=Er+16|0;if((0|Se[Ur>>2])==(0|pr)?Se[Ur>>2]=Cr:Se[Er+20>>2]=Cr,0==(0|Cr))break e}while(0);if(Cr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+6]=Er;var xr=Me[f+(s+2)];if(0!=(0|xr)){if(xr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+4]=xr,Se[xr+24>>2]=Cr}var zr=Me[f+(s+3)];if(0==(0|zr))break;if(zr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[a+5]=zr,Se[zr+24>>2]=Cr}while(0);if(Se[i+1]=1|lr,Se[er+lr>>2]=lr,(0|S)!=(0|Se[vi+20>>2])){var Vr=lr;break}Se[vi+8>>2]=lr;break r}Se[ir>>2]=vr&-2,Se[i+1]=1|M,Se[er+M>>2]=M;var Vr=M}while(0);var Vr;if(Vr>>>0<256){var Br=Vr>>>2&1073741822,Hr=(Br<<2)+vi+40|0,Kr=Me[vi>>2],Yr=1<<(Vr>>>3),Gr=0==(Kr&Yr|0);do{if(!Gr){var Wr=(Br+2<<2)+vi+40|0,Zr=Me[Wr>>2];if(Zr>>>0>=Me[vi+16>>2]>>>0){var Qr=Zr,qr=Wr;break}throw Ka(),"Reached an unreachable!"}Se[vi>>2]=Kr|Yr;var Qr=Hr,qr=(Br+2<<2)+vi+40|0}while(0);var qr,Qr;Se[qr>>2]=S,Se[Qr+12>>2]=S,Se[i+2]=Qr,Se[i+3]=Hr;break r}var $r=S,Jr=Vr>>>8,ra=0==(0|Jr);do if(ra)var aa=0;else{if(Vr>>>0>16777215){var aa=31;break}var ea=(Jr+1048320|0)>>>16&8,va=Jr<<ea,fa=(va+520192|0)>>>16&4,_a=va<<fa,sa=(_a+245760|0)>>>16&2,na=14-(fa|ea|sa)+(_a<<sa>>>15)|0,aa=Vr>>>((na+7|0)>>>0)&1|na<<1}while(0);var aa,oa=(aa<<2)+vi+304|0;Se[i+7]=aa,Se[i+5]=0,Se[i+4]=0;var la=Se[vi+4>>2],ba=1<<aa,ka=0==(la&ba|0);e:do if(ka){var ua=la|ba;Se[vi+4>>2]=ua,Se[oa>>2]=$r,Se[i+6]=oa,Se[i+3]=S,Se[i+2]=S}else{if(31==(0|aa))var ca=0;else var ca=25-(aa>>>1)|0;for(var ca,ha=Vr<<ca,da=Se[oa>>2];;){var da,ha;if((Se[da+4>>2]&-8|0)==(0|Vr)){var wa=da+8|0,pa=Me[wa>>2],Ea=Me[vi+16>>2],Aa=da>>>0<Ea>>>0;do if(!Aa){if(pa>>>0<Ea>>>0)break;Se[pa+12>>2]=$r,Se[wa>>2]=$r,Se[i+2]=pa,Se[i+3]=da,Se[i+6]=0;break e}while(0);throw Ka(),"Reached an unreachable!"}var ga=(ha>>>31<<2)+da+16|0,ya=Me[ga>>2];if(0==(0|ya)){if(ga>>>0>=Me[vi+16>>2]>>>0){Se[ga>>2]=$r,Se[i+6]=da,Se[i+3]=S,Se[i+2]=S;break e}throw Ka(),"Reached an unreachable!"}var ha=ha<<1,da=ya}}while(0);var ma=Se[vi+32>>2]-1|0;if(Se[vi+32>>2]=ma,0!=(0|ma))break r;ta();break r}while(0);throw Ka(),"Reached an unreachable!"}while(0)}function ta(){var r=Se[vi+452>>2],a=0==(0|r);r:do if(!a)for(var e=r;;){var e,i=Se[e+8>>2];if(0==(0|i))break r;var e=i}while(0);Se[vi+32>>2]=-1}function fa(r,a){if(0==(0|r))var e=Jr(a),i=e;else var v=la(r,a),i=v;var i;return i}function _a(r,a){var e,i=r>>>0<9;do if(i)var v=Jr(a),t=v;else{var f=r>>>0<16?16:r,_=0==(f-1&f|0);r:do if(_)var s=f;else{if(f>>>0<=16){var s=16;break}for(var n=16;;){var n,o=n<<1;if(o>>>0>=f>>>0){var s=o;break r}var n=o}}while(0);var s;if((-64-s|0)>>>0>a>>>0){if(a>>>0<11)var l=16;else var l=a+11&-8;var l,b=Jr(l+(s+12)|0);if(0==(0|b)){var t=0;break}var k=b-8|0;if(0==((b>>>0)%(s>>>0)|0))var u=k,c=0;else{var h=b+(s-1)&-s,d=h-8|0,w=k;if((d-w|0)>>>0>15)var p=d;else var p=h+(s-8)|0;var p,E=p-w|0,e=(b-4|0)>>2,A=Se[e],g=(A&-8)-E|0;if(0==(3&A|0)){var y=Se[k>>2]+E|0;Se[p>>2]=y,Se[p+4>>2]=g;var u=p,c=0}else{var m=p+4|0,S=g|1&Se[m>>2]|2;Se[m>>2]=S;var M=g+(p+4)|0,C=1|Se[M>>2];Se[M>>2]=C;var R=E|1&Se[e]|2;Se[e]=R;var T=b+(E-4)|0,O=1|Se[T>>2];Se[T>>2]=O;var u=p,c=b}}var c,u,N=u+4|0,I=Me[N>>2],P=0==(3&I|0);do if(P)var D=0;else{var L=I&-8;if(L>>>0<=(l+16|0)>>>0){var D=0;break}var F=L-l|0;Se[N>>2]=l|1&I|2,Se[u+(4|l)>>2]=3|F;var X=u+(4|L)|0,j=1|Se[X>>2];Se[X>>2]=j;var D=l+(u+8)|0}while(0);var D;0!=(0|c)&&va(c),0!=(0|D)&&va(D);var t=u+8|0}else{var U=Je();Se[U>>2]=12;var t=0}}while(0);var t;return t}function sa(r,a,e,i){var v,t;0==(0|Se[ti>>2])&&ba();var f=0==(0|i),_=0==(0|r);do{if(f){if(_){var s=Jr(0),n=s;t=30;break}var o=r<<2;if(o>>>0<11){var l=0,b=16;t=9;break}var l=0,b=o+11&-8;t=9;break}if(_){var n=i;t=30;break}var l=i,b=0;t=9;break}while(0);do if(9==t){var b,l,k=0==(1&e|0);r:do if(k){if(_){var u=0,c=0;break}for(var h=0,d=0;;){var d,h,w=Me[a+(d<<2)>>2];if(w>>>0<11)var p=16;else var p=w+11&-8;var p,E=p+h|0,A=d+1|0;if((0|A)==(0|r)){var u=0,c=E;break r}var h=E,d=A}}else{var g=Me[a>>2];if(g>>>0<11)var y=16;else var y=g+11&-8;var y,u=y,c=y*r|0}while(0);var c,u,m=Jr(b-4+c|0);if(0==(0|m)){var n=0;break}var S=m-8|0,M=Se[m-4>>2]&-8;if(0!=(2&e|0)){var C=-4-b+M|0;Fa(m,0,C,1)}if(0==(0|l)){var R=m+c|0,T=M-c|3;Se[m+(c-4)>>2]=T;var O=R,v=O>>2,N=c}else var O=l,v=O>>2,N=M;var N,O;Se[v]=m;var I=r-1|0,P=0==(0|I);r:do if(P)var D=S,L=N;else if(0==(0|u))for(var F=S,X=N,j=0;;){var j,X,F,U=Me[a+(j<<2)>>2];if(U>>>0<11)var x=16;else var x=U+11&-8;var x,z=X-x|0;Se[F+4>>2]=3|x;var V=F+x|0,B=j+1|0;if(Se[(B<<2>>2)+v]=x+(F+8)|0,(0|B)==(0|I)){var D=V,L=z;break r}var F=V,X=z,j=B}else for(var H=3|u,K=u+8|0,Y=S,G=N,W=0;;){var W,G,Y,Z=G-u|0;Se[Y+4>>2]=H;var Q=Y+u|0,q=W+1|0;if(Se[(q<<2>>2)+v]=Y+K|0,(0|q)==(0|I)){var D=Q,L=Z;break r}var Y=Q,G=Z,W=q}while(0);var L,D;Se[D+4>>2]=3|L;var n=O}while(0);var n;return n}function na(r){var a=r>>2;0==(0|Se[ti>>2])&&ba();var e=Me[vi+24>>2];if(0==(0|e))var i=0,v=0,t=0,f=0,_=0,s=0,n=0;else{for(var o=Me[vi+12>>2],l=o+40|0,b=vi+444|0,k=l,u=l,c=1;;){var c,u,k,b,h=Me[b>>2],d=h+8|0;if(0==(7&d|0))var w=0;else var w=7&-d;for(var w,p=b+4|0,E=h+w|0,A=c,g=u,y=k;;){var y,g,A,E;if(E>>>0<h>>>0)break;if(E>>>0>=(h+Se[p>>2]|0)>>>0|(0|E)==(0|e))break;var m=Se[E+4>>2];if(7==(0|m))break;var S=m&-8,M=S+y|0;if(1==(3&m|0))var C=A+1|0,R=S+g|0;else var C=A,R=g;var R,C,E=E+S|0,A=C,g=R,y=M}var T=Me[b+8>>2];if(0==(0|T))break;var b=T,k=y,u=g,c=A}var O=Se[vi+432>>2],i=y,v=A,t=o,f=g,_=O-y|0,s=Se[vi+436>>2],n=O-g|0}var n,s,_,f,t,v,i;Se[a]=i,Se[a+1]=v,Se[a+2]=0,Se[a+3]=0,Se[a+4]=_,Se[a+5]=s,Se[a+6]=0,Se[a+7]=n,Se[a+8]=f,Se[a+9]=t}function oa(){0==(0|Se[ti>>2])&&ba();var r=Me[vi+24>>2],a=0==(0|r);r:do if(a)var e=0,i=0,v=0;else for(var t=Se[vi+436>>2],f=Me[vi+432>>2],_=vi+444|0,s=f-40-Se[vi+12>>2]|0;;){var s,_,n=Me[_>>2],o=n+8|0;if(0==(7&o|0))var l=0;else var l=7&-o;for(var l,b=_+4|0,k=n+l|0,u=s;;){var u,k;if(k>>>0<n>>>0)break;if(k>>>0>=(n+Se[b>>2]|0)>>>0|(0|k)==(0|r))break;var c=Se[k+4>>2];if(7==(0|c))break;var h=c&-8,d=1==(3&c|0)?h:0,w=u-d|0,k=k+h|0,u=w}var p=Me[_+8>>2];if(0==(0|p)){var e=t,i=f,v=u;break r}var _=p,s=u}while(0);var v,i,e,E=Se[Se[qe>>2]+12>>2],A=(Qa(E,0|He.__str339,(ne=Oe,Oe+=4,Se[ne>>2]=e,ne)),Se[Se[qe>>2]+12>>2]),g=(Qa(A,0|He.__str1340,(ne=Oe,Oe+=4,Se[ne>>2]=i,ne)),Se[Se[qe>>2]+12>>2]);Qa(g,0|He.__str2341,(ne=Oe,Oe+=4,Se[ne>>2]=v,ne))}function la(r,a){var e,i,v,t=a>>>0>4294967231;r:do{if(!t){var f=r-8|0,_=f,i=(r-4|0)>>2,s=Me[i],n=s&-8,o=n-8|0,l=r+o|0,b=f>>>0<Me[vi+16>>2]>>>0;do if(!b){var k=3&s;if(!(1!=(0|k)&(0|o)>-8))break;var e=(r+(n-4)|0)>>2;if(0==(1&Se[e]|0))break;if(a>>>0<11)var u=16;else var u=a+11&-8;var u,c=0==(0|k);do{if(c){var h=ka(_,u),d=0,w=h;v=17;break}if(n>>>0<u>>>0){if((0|l)!=(0|Se[vi+24>>2])){v=21;break}var p=Se[vi+12>>2]+n|0;if(p>>>0<=u>>>0){v=21;break}var E=p-u|0,A=r+(u-8)|0;Se[i]=u|1&s|2;var g=1|E;Se[r+(u-4)>>2]=g,Se[vi+24>>2]=A,Se[vi+12>>2]=E;var d=0,w=_;v=17;break}var y=n-u|0;if(y>>>0<=15){var d=0,w=_;v=17;break}Se[i]=u|1&s|2,Se[r+(u-4)>>2]=3|y;var m=1|Se[e];Se[e]=m;var d=r+u|0,w=_;v=17;break}while(0);do if(17==v){var w,d;if(0==(0|w))break;0!=(0|d)&&va(d);var S=w+8|0;break r}while(0);var M=Jr(a);if(0==(0|M)){var S=0;break r}var C=0==(3&Se[i]|0)?8:4,R=n-C|0,T=R>>>0<a>>>0?R:a;Pa(M,r,T,1),va(r);var S=M;break r}while(0);throw Ka(),"Reached an unreachable!"}var O=Je();Se[O>>2]=12;var S=0}while(0);var S;return S}function ba(){if(0==(0|Se[ti>>2])){var r=qa(8);if(0!=(r-1&r|0))throw Ka(),"Reached an unreachable!";Se[ti+8>>2]=r,Se[ti+4>>2]=r,Se[ti+12>>2]=-1,Se[ti+16>>2]=2097152,Se[ti+20>>2]=0,Se[vi+440>>2]=0;var a=$a(0);Se[ti>>2]=a&-16^1431655768}}function ka(r,a){var e=Se[r+4>>2]&-8,i=a>>>0<256;do if(i)var v=0;else{if(e>>>0>=(a+4|0)>>>0&&(e-a|0)>>>0<=Se[ti+8>>2]<<1>>>0){var v=r;break}var v=0}while(0);var v;return v}function ua(r){for(var a,e=vi+444|0,a=e>>2;;){var e,i=Me[a];if(i>>>0<=r>>>0&&(i+Se[a+1]|0)>>>0>r>>>0){var v=e;break}var t=Me[a+2];if(0==(0|t)){var v=0;break}var e=t,a=e>>2}var v;return v}function ca(r,a){var e=r,i=r+8|0;if(0==(7&i|0))var v=0;else var v=7&-i;var v,t=a-v|0;Se[vi+24>>2]=e+v|0,Se[vi+12>>2]=t,Se[v+(e+4)>>2]=1|t,Se[a+(e+4)>>2]=40;var f=Se[ti+16>>2];Se[vi+28>>2]=f}function ha(){for(var r=0;;){var r,a=r<<1,e=(a<<2)+vi+40|0;Se[vi+(a+3<<2)+40>>2]=e,Se[vi+(a+2<<2)+40>>2]=e;var i=r+1|0;if(32==(0|i))break;var r=i}}function da(r,a,e){var i,v,t,f,_=a>>2,s=r>>2,n=r+8|0;if(0==(7&n|0))var o=0;else var o=7&-n;var o,l=a+8|0;if(0==(7&l|0))var b=0,t=b>>2;else var b=7&-l,t=b>>2;var b,k=a+b|0,u=k,c=o+e|0,v=c>>2,h=r+c|0,d=h,w=k-(r+o)-e|0;Se[(o+4>>2)+s]=3|e;var p=(0|u)==(0|Se[vi+24>>2]);r:do if(p){var E=Se[vi+12>>2]+w|0;Se[vi+12>>2]=E,Se[vi+24>>2]=d;var A=1|E;Se[v+(s+1)]=A}else if((0|u)==(0|Se[vi+20>>2])){var g=Se[vi+8>>2]+w|0;Se[vi+8>>2]=g,Se[vi+20>>2]=d;var y=1|g;Se[v+(s+1)]=y;var m=r+g+c|0;Se[m>>2]=g}else{var S=Me[t+(_+1)];if(1==(3&S|0)){var M=S&-8,C=S>>>3,R=S>>>0<256;a:do if(R){var T=Me[((8|b)>>2)+_],O=Me[t+(_+3)];if((0|T)!=(0|O)){var N=((S>>>2&1073741822)<<2)+vi+40|0,I=(0|T)==(0|N);do{if(!I){if(T>>>0<Me[vi+16>>2]>>>0){f=18;break}f=15;break}f=15}while(0);do if(15==f){if((0|O)!=(0|N)&&O>>>0<Me[vi+16>>2]>>>0)break;Se[T+12>>2]=O,Se[O+8>>2]=T;break a}while(0);throw Ka(),"Reached an unreachable!"}var P=Se[vi>>2]&(1<<C^-1);Se[vi>>2]=P}else{var D=k,L=Me[((24|b)>>2)+_],F=Me[t+(_+3)],X=(0|F)==(0|D);do if(X){var j=16|b,U=j+(a+4)|0,x=Se[U>>2];if(0==(0|x)){var z=a+j|0,V=Se[z>>2];if(0==(0|V)){var B=0,i=B>>2;break}var H=z,K=V}else{var H=U,K=x;f=25}for(;;){var K,H,Y=K+20|0,G=Se[Y>>2];if(0==(0|G)){var W=K+16|0,Z=Me[W>>2];if(0==(0|Z))break;var H=W,K=Z}else var H=Y,K=G}if(H>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[H>>2]=0;var B=K,i=B>>2}else{var Q=Me[((8|b)>>2)+_];if(Q>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[Q+12>>2]=F,Se[F+8>>2]=Q;var B=F,i=B>>2}while(0);var B;if(0==(0|L))break;var q=b+(a+28)|0,$=(Se[q>>2]<<2)+vi+304|0,J=(0|D)==(0|Se[$>>2]);do{if(J){if(Se[$>>2]=B,0!=(0|B))break;var rr=Se[vi+4>>2]&(1<<Se[q>>2]^-1);Se[vi+4>>2]=rr;break a}if(L>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";var ar=L+16|0;if((0|Se[ar>>2])==(0|D)?Se[ar>>2]=B:Se[L+20>>2]=B,0==(0|B))break a}while(0);if(B>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[i+6]=L;var er=16|b,ir=Me[(er>>2)+_];if(0!=(0|ir)){if(ir>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[i+4]=ir,Se[ir+24>>2]=B}var vr=Me[(er+4>>2)+_];if(0==(0|vr))break;if(vr>>>0<Me[vi+16>>2]>>>0)throw Ka(),"Reached an unreachable!";Se[i+5]=vr,Se[vr+24>>2]=B}while(0);var tr=a+(M|b)|0,fr=M+w|0}else var tr=u,fr=w;var fr,tr,_r=tr+4|0,sr=Se[_r>>2]&-2;if(Se[_r>>2]=sr,Se[v+(s+1)]=1|fr,Se[(fr>>2)+s+v]=fr,fr>>>0<256){var nr=fr>>>2&1073741822,or=(nr<<2)+vi+40|0,lr=Me[vi>>2],br=1<<(fr>>>3),kr=0==(lr&br|0);do{if(!kr){var ur=(nr+2<<2)+vi+40|0,cr=Me[ur>>2];if(cr>>>0>=Me[vi+16>>2]>>>0){var hr=cr,dr=ur;break}throw Ka(),"Reached an unreachable!"}Se[vi>>2]=lr|br;var hr=or,dr=(nr+2<<2)+vi+40|0}while(0);var dr,hr;Se[dr>>2]=d,Se[hr+12>>2]=d,Se[v+(s+2)]=hr,Se[v+(s+3)]=or}else{var wr=h,pr=fr>>>8,Er=0==(0|pr);do if(Er)var Ar=0;else{if(fr>>>0>16777215){var Ar=31;break}var gr=(pr+1048320|0)>>>16&8,yr=pr<<gr,mr=(yr+520192|0)>>>16&4,Sr=yr<<mr,Mr=(Sr+245760|0)>>>16&2,Cr=14-(mr|gr|Mr)+(Sr<<Mr>>>15)|0,Ar=fr>>>((Cr+7|0)>>>0)&1|Cr<<1}while(0);var Ar,Rr=(Ar<<2)+vi+304|0;Se[v+(s+7)]=Ar;var Tr=c+(r+16)|0;Se[v+(s+5)]=0,Se[Tr>>2]=0;var Or=Se[vi+4>>2],Nr=1<<Ar;if(0==(Or&Nr|0)){var Ir=Or|Nr;Se[vi+4>>2]=Ir,Se[Rr>>2]=wr,Se[v+(s+6)]=Rr,Se[v+(s+3)]=wr,Se[v+(s+2)]=wr}else{if(31==(0|Ar))var Pr=0;else var Pr=25-(Ar>>>1)|0;for(var Pr,Dr=fr<<Pr,Lr=Se[Rr>>2];;){var Lr,Dr;if((Se[Lr+4>>2]&-8|0)==(0|fr)){var Fr=Lr+8|0,Xr=Me[Fr>>2],jr=Me[vi+16>>2],Ur=Lr>>>0<jr>>>0;do if(!Ur){if(Xr>>>0<jr>>>0)break;Se[Xr+12>>2]=wr,Se[Fr>>2]=wr,Se[v+(s+2)]=Xr,Se[v+(s+3)]=Lr,Se[v+(s+6)]=0;break r}while(0);throw Ka(),"Reached an unreachable!"}var xr=(Dr>>>31<<2)+Lr+16|0,zr=Me[xr>>2];if(0==(0|zr)){if(xr>>>0>=Me[vi+16>>2]>>>0){Se[xr>>2]=wr,Se[v+(s+6)]=Lr,Se[v+(s+3)]=wr,Se[v+(s+2)]=wr;break r}throw Ka(),"Reached an unreachable!"}var Dr=Dr<<1,Lr=zr}}}}while(0);return r+(8|o)|0}function wa(r){return 0|He.__str3342}function pa(r){return 0|He.__str14343}function Ea(r){Se[r>>2]=si+8|0}function Aa(r){0!=(0|r)&&va(r)}function ga(r){ya(r);var a=r;Aa(a)}function ya(r){var a=0|r;Ye(a)}function ma(r){var a=0|r;Ea(a),Se[r>>2]=ni+8|0}function Sa(r){var a=0|r;ya(a);var e=r;Aa(e)}function Ma(r,a){var e,i,v=Me[vi+24>>2],i=v>>2,t=v,f=ua(t),_=Se[f>>2],s=Se[f+4>>2],n=_+s|0,o=_+(s-39)|0;if(0==(7&o|0))var l=0;else var l=7&-o;var l,b=_+(s-47)+l|0,k=b>>>0<(v+16|0)>>>0?t:b,u=k+8|0,e=u>>2,c=u,h=r,d=a-40|0;ca(h,d);var w=k+4|0;Se[w>>2]=27,Se[e]=Se[vi+444>>2],Se[e+1]=Se[vi+448>>2],Se[e+2]=Se[vi+452>>2],Se[e+3]=Se[vi+456>>2],Se[vi+444>>2]=r,Se[vi+448>>2]=a,Se[vi+456>>2]=0,Se[vi+452>>2]=c;var p=k+28|0;Se[p>>2]=7;var E=(k+32|0)>>>0<n>>>0;r:do if(E)for(var A=p;;){var A,g=A+4|0;if(Se[g>>2]=7,(A+8|0)>>>0>=n>>>0)break r;var A=g}while(0);var y=(0|k)==(0|t);r:do if(!y){var m=k-v|0,S=t+m|0,M=m+(t+4)|0,C=Se[M>>2]&-2;Se[M>>2]=C;var R=1|m;Se[i+1]=R;var T=S;if(Se[T>>2]=m,m>>>0<256){var O=m>>>2&1073741822,N=(O<<2)+vi+40|0,I=Me[vi>>2],P=1<<(m>>>3),D=0==(I&P|0);do{if(!D){var L=(O+2<<2)+vi+40|0,F=Me[L>>2];if(F>>>0>=Me[vi+16>>2]>>>0){var X=F,j=L;break}throw Ka(),"Reached an unreachable!"}var U=I|P;Se[vi>>2]=U;var X=N,j=(O+2<<2)+vi+40|0}while(0);var j,X;Se[j>>2]=v,Se[X+12>>2]=v,Se[i+2]=X,Se[i+3]=N}else{var x=v,z=m>>>8,V=0==(0|z);do if(V)var B=0;else{if(m>>>0>16777215){var B=31;break}var H=(z+1048320|0)>>>16&8,K=z<<H,Y=(K+520192|0)>>>16&4,G=K<<Y,W=(G+245760|0)>>>16&2,Z=14-(Y|H|W)+(G<<W>>>15)|0,B=m>>>((Z+7|0)>>>0)&1|Z<<1}while(0);var B,Q=(B<<2)+vi+304|0;Se[i+7]=B,Se[i+5]=0,Se[i+4]=0;var q=Se[vi+4>>2],$=1<<B;if(0==(q&$|0)){var J=q|$;Se[vi+4>>2]=J,Se[Q>>2]=x,Se[i+6]=Q,Se[i+3]=v,Se[i+2]=v}else{if(31==(0|B))var rr=0;else var rr=25-(B>>>1)|0;for(var rr,ar=m<<rr,er=Se[Q>>2];;){var er,ar;if((Se[er+4>>2]&-8|0)==(0|m)){var ir=er+8|0,vr=Me[ir>>2],tr=Me[vi+16>>2],fr=er>>>0<tr>>>0;do if(!fr){if(vr>>>0<tr>>>0)break;Se[vr+12>>2]=x,Se[ir>>2]=x,Se[i+2]=vr,Se[i+3]=er,Se[i+6]=0;break r}while(0);throw Ka(),"Reached an unreachable!"}var _r=(ar>>>31<<2)+er+16|0,sr=Me[_r>>2];if(0==(0|sr)){if(_r>>>0>=Me[vi+16>>2]>>>0){Se[_r>>2]=x,Se[i+6]=er,Se[i+3]=v,Se[i+2]=v;break r}throw Ka(),"Reached an unreachable!"}var ar=ar<<1,er=sr}}}}while(0)}function Ca(r){return d(r)}function Ra(r,a){var e=0;do Ae[r+e]=Ae[a+e],e++;while(0!=Ae[a+e-1]);return r}function Ta(){var r=Ta;return r.LLVM_SAVEDSTACKS||(r.LLVM_SAVEDSTACKS=[]),r.LLVM_SAVEDSTACKS.push(le.stackSave()),r.LLVM_SAVEDSTACKS.length-1}function Oa(r){var a=Ta,e=a.LLVM_SAVEDSTACKS[r];a.LLVM_SAVEDSTACKS.splice(r,1),le.stackRestore(e)}function Na(r,a,e){for(var i=0;i<e;){var v=Ae[r+i],t=Ae[a+i];if(v==t&&0==v)return 0;if(0==v)return-1;if(0==t)return 1;if(v!=t)return v>t?1:-1;i++}return 0}function Ia(r,a){var e=Ca(r),i=0;do Ae[r+e+i]=Ae[a+i],i++;while(0!=Ae[a+i-1]);return r}function Pa(r,a,e,i){if(e>=20&&a%2==r%2)if(a%4==r%4){for(var v=a+e;a%4;)Ae[r++]=Ae[a++];for(var t=a>>2,f=r>>2,_=v>>2;t<_;)Se[f++]=Se[t++];for(a=t<<2,r=f<<2;a<v;)Ae[r++]=Ae[a++]}else{var v=a+e;a%2&&(Ae[r++]=Ae[a++]);for(var s=a>>1,n=r>>1,o=v>>1;s<o;)ye[n++]=ye[s++];a=s<<1,r=n<<1,a<v&&(Ae[r++]=Ae[a++])}else for(;e--;)Ae[r++]=Ae[a++]}function Da(r,a){return Na(r,a,Le)}function La(r,a,e){for(var i=0;i<e;i++){var v=Ae[r+i],t=Ae[a+i];if(v!=t)return v>t?1:-1}return 0}function Fa(r,a,e,i){if(e>=20){for(var v=r+e;r%4;)Ae[r++]=a;a<0&&(a+=256);for(var t=r>>2,f=v>>2,_=a|a<<8|a<<16|a<<24;t<f;)Se[t++]=_;for(r=t<<2;r<v;)Ae[r++]=a}else for(;e--;)Ae[r++]=a}function Xa(r,a,e,i){throw"Assertion failed: "+s(i)+", at: "+[s(r),a,s(e)]}function ja(r){var a=d(r),e=Jr(a+1);return Pa(e,r,a,1),Ae[e+a]=0,e}function Ua(r,a){function e(r){var e;return"double"===r?(xe[0]=Se[a+_>>2],xe[1]=Se[a+_+4>>2],e=ze[0]):"i64"==r?e=[Se[a+_>>2],Se[a+_+4>>2]]:(r="i32",e=Se[a+_>>2]),_+=le.getNativeFieldSize(r),e}for(var i,v,t,f=r,_=0,s=[];;){var n=f;if(i=Ae[f],0===i)break;if(v=Ae[f+1],i=="%".charCodeAt(0)){var o=!1,l=!1,b=!1,k=!1;r:for(;;){switch(v){case"+".charCodeAt(0):o=!0;break;case"-".charCodeAt(0):l=!0;break;case"#".charCodeAt(0):b=!0;break;case"0".charCodeAt(0):if(k)break r;k=!0;break;default:break r}f++,v=Ae[f+1]}var u=0;if(v=="*".charCodeAt(0))u=e("i32"),f++,v=Ae[f+1];else for(;v>="0".charCodeAt(0)&&v<="9".charCodeAt(0);)u=10*u+(v-"0".charCodeAt(0)),f++,v=Ae[f+1];var c=!1;if(v==".".charCodeAt(0)){var h=0;if(c=!0,f++,v=Ae[f+1],v=="*".charCodeAt(0))h=e("i32"),f++;else for(;;){var d=Ae[f+1];if(d<"0".charCodeAt(0)||d>"9".charCodeAt(0))break;h=10*h+(d-"0".charCodeAt(0)),f++}v=Ae[f+1]}else var h=6;var E;switch(String.fromCharCode(v)){case"h":var A=Ae[f+2];A=="h".charCodeAt(0)?(f++,E=1):E=2;break;case"l":var A=Ae[f+2];A=="l".charCodeAt(0)?(f++,E=8):E=4;break;case"L":case"q":case"j":E=8;break;case"z":case"t":case"I":E=4;break;default:E=null}if(E&&f++,v=Ae[f+1],["d","i","u","o","x","X","p"].indexOf(String.fromCharCode(v))!=-1){var m=v=="d".charCodeAt(0)||v=="i".charCodeAt(0);E=E||4;var t=e("i"+8*E);if(8==E&&(t=le.makeBigInt(t[0],t[1],v=="u".charCodeAt(0))),E<=4){var S=Math.pow(256,E)-1;t=(m?y:g)(t&S,8*E)}var M,C=Math.abs(t),R="";if(v=="d".charCodeAt(0)||v=="i".charCodeAt(0))M=y(t,8*E,1).toString(10);else if(v=="u".charCodeAt(0))M=g(t,8*E,1).toString(10),t=Math.abs(t);else if(v=="o".charCodeAt(0))M=(b?"0":"")+C.toString(8);else if(v=="x".charCodeAt(0)||v=="X".charCodeAt(0)){if(R=b?"0x":"",t<0){t=-t,M=(C-1).toString(16);for(var T=[],O=0;O<M.length;O++)T.push((15-parseInt(M[O],16)).toString(16));for(M=T.join("");M.length<2*E;)M="f"+M}else M=C.toString(16);v=="X".charCodeAt(0)&&(R=R.toUpperCase(),M=M.toUpperCase())}else v=="p".charCodeAt(0)&&(0===C?M="(nil)":(R="0x",M=C.toString(16)));if(c)for(;M.length<h;)M="0"+M;for(o&&(R=t<0?"-"+R:"+"+R);R.length+M.length<u;)l?M+=" ":k?M="0"+M:R=" "+R;M=R+M,M.split("").forEach(function(r){s.push(r.charCodeAt(0))})}else if(["f","F","e","E","g","G"].indexOf(String.fromCharCode(v))!=-1){var M,t=e("double");if(isNaN(t))M="nan",k=!1;else if(isFinite(t)){var N=!1,I=Math.min(h,20);if(v=="g".charCodeAt(0)||v=="G".charCodeAt(0)){N=!0,h=h||1;var P=parseInt(t.toExponential(I).split("e")[1],10);h>P&&P>=-4?(v=(v=="g".charCodeAt(0)?"f":"F").charCodeAt(0),h-=P+1):(v=(v=="g".charCodeAt(0)?"e":"E").charCodeAt(0),h--),I=Math.min(h,20)}v=="e".charCodeAt(0)||v=="E".charCodeAt(0)?(M=t.toExponential(I),/[eE][-+]\\d$/.test(M)&&(M=M.slice(0,-1)+"0"+M.slice(-1))):v!="f".charCodeAt(0)&&v!="F".charCodeAt(0)||(M=t.toFixed(I));var D=M.split("e");if(N&&!b)for(;D[0].length>1&&D[0].indexOf(".")!=-1&&("0"==D[0].slice(-1)||"."==D[0].slice(-1));)D[0]=D[0].slice(0,-1);else for(b&&M.indexOf(".")==-1&&(D[0]+=".");h>I++;)D[0]+="0";M=D[0]+(D.length>1?"e"+D[1]:""),v=="E".charCodeAt(0)&&(M=M.toUpperCase()),o&&t>=0&&(M="+"+M)}else M=(t<0?"-":"")+"inf",k=!1;for(;M.length<u;)l?M+=" ":M=!k||"-"!=M[0]&&"+"!=M[0]?(k?"0":" ")+M:M[0]+"0"+M.slice(1);v<"a".charCodeAt(0)&&(M=M.toUpperCase()),M.split("").forEach(function(r){s.push(r.charCodeAt(0))})}else if(v=="s".charCodeAt(0)){var L,F=e("i8*");if(F?(L=w(F),c&&L.length>h&&(L=L.slice(0,h))):L=p("(null)",!0),!l)for(;L.length<u--;)s.push(" ".charCodeAt(0));if(s=s.concat(L),l)for(;L.length<u--;)s.push(" ".charCodeAt(0))}else if(v=="c".charCodeAt(0)){for(l&&s.push(e("i8"));--u>0;)s.push(" ".charCodeAt(0));l||s.push(e("i8"))}else if(v=="n".charCodeAt(0)){var X=e("i32*");Se[X>>2]=s.length}else if(v=="%".charCodeAt(0))s.push(i);else for(var O=n;O<f+2;O++)s.push(Ae[O]);f+=2}else s.push(i),f+=1}return s}function xa(r,a,e,i){for(var v=Ua(e,i),t=void 0===a?v.length:Math.min(v.length,a-1),f=0;f<t;f++)Ae[r+f]=v[f];return Ae[r+f]=0,v.length}function za(r,a,e){return xa(r,void 0,a,e)}function Va(r){return r in{32:0,9:0,10:0,11:0,12:0,13:0}}function Ba(r){return r>="0".charCodeAt(0)&&r<="9".charCodeAt(0)}function Ha(r){for(var a;(a=Ae[r])&&Va(a);)r++;if(!a||!Ba(a))return 0;for(var e=r;(a=Ae[e])&&Ba(a);)e++;return Math.floor(Number(s(r).substr(0,e-r)))}function Ka(r){throw ke=!0,"ABORT: "+r+", at "+(new Error).stack}function Ya(r){return Ya.ret||(Ya.ret=_([0],"i32",we)),Se[Ya.ret>>2]=r,r}function Ga(r,a,e,i){var v=$e.streams[r];if(!v||v.object.isDevice)return Ya(Ge.EBADF),-1;if(v.isWrite){if(v.object.isFolder)return Ya(Ge.EISDIR),-1;if(e<0||i<0)return Ya(Ge.EINVAL),-1;for(var t=v.object.contents;t.length<i;)t.push(0);for(var f=0;f<e;f++)t[i+f]=ge[a+f];return v.object.timestamp=Date.now(),f}return Ya(Ge.EACCES),-1}function Wa(r,a,e){var i=$e.streams[r];if(i){if(i.isWrite){if(e<0)return Ya(Ge.EINVAL),-1;if(i.object.isDevice){if(i.object.output){for(var v=0;v<e;v++)try{i.object.output(Ae[a+v])}catch(r){return Ya(Ge.EIO),-1}return i.object.timestamp=Date.now(),v}return Ya(Ge.ENXIO),-1}var t=Ga(r,a,e,i.position);return t!=-1&&(i.position+=t),t}return Ya(Ge.EACCES),-1}return Ya(Ge.EBADF),-1}function Za(r,a,e,i){var v=e*a;if(0==v)return 0;var t=Wa(i,r,v);return t==-1?($e.streams[i]&&($e.streams[i].error=!0),-1):Math.floor(t/a)}function Qa(r,a,e){var i=Ua(a,e),v=le.stackSave(),t=Za(_(i,"i8",de),1,i.length,r);return le.stackRestore(v),t}function qa(r){switch(r){case 8:return Pe;case 54:case 56:case 21:case 61:case 63:case 22:case 67:case 23:case 24:case 25:case 26:case 27:case 69:case 28:case 101:case 70:case 71:case 29:case 30:case 199:case 75:case 76:case 32:case 43:case 44:case 80:case 46:case 47:case 45:case 48:case 49:case 42:case 82:case 33:case 7:case 108:case 109:case 107:case 112:case 119:case 121:return 200809;case 13:case 104:case 94:case 95:case 34:case 35:case 77:case 81:case 83:case 84:case 85:case 86:case 87:case 88:case 89:case 90:case 91:case 94:case 95:case 110:case 111:case 113:case 114:case 115:case 116:case 117:case 118:case 120:case 40:case 16:case 79:case 19:return-1;case 92:case 93:case 5:case 72:case 6:case 74:case 92:case 93:case 96:case 97:case 98:case 99:case 102:case 103:case 105:return 1;case 38:case 66:case 50:case 51:case 4:return 1024;case 15:case 64:case 41:return 32;case 55:case 37:case 17:return 2147483647;case 18:case 1:return 47839;case 59:case 57:return 99;case 68:case 58:return 2048;case 0:return 2097152;case 3:return 65536;case 14:return 32768;case 73:return 32767;case 39:return 16384;case 60:return 1e3;case 106:return 700;case 52:return 256;case 62:return 255;case 2:return 100;case 65:return 64;case 36:return 20;case 100:return 16;case 20:return 6;case 53:return 4}return Ya(Ge.EINVAL),-1}function $a(r){var a=Math.floor(Date.now()/1e3);return r&&(Se[r>>2]=a),a}function Ja(){return Ya.ret}function re(r){var a=re;a.called||(Ie=o(Ie),a.called=!0);var e=Ie;return 0!=r&&le.staticAlloc(r),e}function ae(){return Se[ae.buf>>2]}function ee(r){r=r||Module.arguments,k();var a=null;return Module._main&&(a=Module.callMain(r),Module.noExitRuntime||u()),a}var ie=[],ve=false,te="object"==typeof window,fe="function"==typeof importScripts,_e=!te&&!ve&&!fe;if(ve){print=function(r){process.stdout.write(r+"\\n")},printErr=function(r){process.stderr.write(r+"\\n")};var se=require("fs");read=function(r){var a=se.readFileSync(r).toString();return a||"/"==r[0]||(r=__dirname.split("/").slice(0,-1).join("/")+"/src/"+r,a=se.readFileSync(r).toString()),a},load=function(a){r(read(a))},ie=process.argv.slice(2)}else if(_e)this.read||(this.read=function(r){snarf(r)}),"undefined"!=typeof scriptArgs?ie=scriptArgs:"undefined"!=typeof arguments&&(ie=arguments);else if(te)this.print=printErr=function(r){console.log(r)},this.read=function(r){var a=new XMLHttpRequest;return a.open("GET",r,!1),a.send(null),a.responseText},this.arguments&&(ie=arguments);else{if(!fe)throw"Unknown runtime environment. Where are we?";this.load=importScripts}"undefined"==typeof load&&"undefined"!=typeof read&&(this.load=function(a){r(read(a))}),"undefined"==typeof printErr&&(this.printErr=function(){}),"undefined"==typeof print&&(this.print=printErr);try{this.Module=Module}catch(r){this.Module=Module={}}Module.arguments||(Module.arguments=ie),Module.print&&(print=Module.print);var ne,oe,le={stackSave:function(){return Oe},stackRestore:function(r){Oe=r},forceAlign:function(r,a){if(a=a||4,1==a)return r;if(isNumber(r)&&isNumber(a))return Math.ceil(r/a)*a;if(isNumber(a)&&isPowerOfTwo(a)){var e=log2(a);return"(((("+r+")+"+(a-1)+")>>"+e+")<<"+e+")"}return"Math.ceil(("+r+")/"+a+")*"+a},isNumberType:function(r){return r in le.INT_TYPES||r in le.FLOAT_TYPES},isPointerType:function(r){return"*"==r[r.length-1]},isStructType:function(r){return!isPointerType(r)&&(!!/^\\[\\d+\\ x\\ (.*)\\]/.test(r)||(!!/<?{ [^}]* }>?/.test(r)||"%"==r[0]))},INT_TYPES:{i1:0,i8:0,i16:0,i32:0,i64:0},FLOAT_TYPES:{float:0,double:0},bitshift64:function(r,e,i,v){var t=Math.pow(2,v)-1;if(v<32)switch(i){case"shl":return[r<<v,e<<v|(r&t<<32-v)>>>32-v];case"ashr":return[(r>>>v|(e&t)<<32-v)>>0>>>0,e>>v>>>0];case"lshr":return[(r>>>v|(e&t)<<32-v)>>>0,e>>>v]}else if(32==v)switch(i){case"shl":return[0,r];case"ashr":return[e,(0|e)<0?t:0];case"lshr":return[e,0]}else switch(i){case"shl":return[0,r<<v-32];case"ashr":return[e>>v-32>>>0,(0|e)<0?t:0];case"lshr":return[e>>>v-32,0]}a("unknown bitshift64 op: "+[value,i,v])},or64:function(r,a){var e=0|r|(0|a),i=4294967296*(Math.round(r/4294967296)|Math.round(a/4294967296));return e+i},and64:function(r,a){var e=(0|r)&(0|a),i=4294967296*(Math.round(r/4294967296)&Math.round(a/4294967296));return e+i},xor64:function(r,a){var e=(0|r)^(0|a),i=4294967296*(Math.round(r/4294967296)^Math.round(a/4294967296));return e+i},getNativeTypeSize:function(r,a){if(1==le.QUANTUM_SIZE)return 1;var i={"%i1":1,"%i8":1,"%i16":2,"%i32":4,"%i64":8,"%float":4,"%double":8}["%"+r];if(!i)if("*"==r[r.length-1])i=le.QUANTUM_SIZE;else if("i"==r[0]){var v=parseInt(r.substr(1));e(v%8==0),i=v/8}return i},getNativeFieldSize:function(r){return Math.max(le.getNativeTypeSize(r),le.QUANTUM_SIZE)},dedup:function(r,a){var e={};return a?r.filter(function(r){return!e[r[a]]&&(e[r[a]]=!0,!0)}):r.filter(function(r){return!e[r]&&(e[r]=!0,!0)})},set:function(){for(var r="object"==typeof arguments[0]?arguments[0]:arguments,a={},e=0;e<r.length;e++)a[r[e]]=0;return a},calculateStructAlignment:function(r){r.flatSize=0,r.alignSize=0;var a=[],e=-1;return r.flatIndexes=r.fields.map(function(i){var v,t;if(le.isNumberType(i)||le.isPointerType(i))v=le.getNativeTypeSize(i),t=v;else{if(!le.isStructType(i))throw"Unclear type in struct: "+i+", in "+r.name_+" :: "+dump(Types.types[r.name_]);v=Types.types[i].flatSize,t=Types.types[i].alignSize}t=r.packed?1:Math.min(t,le.QUANTUM_SIZE),r.alignSize=Math.max(r.alignSize,t);var f=le.alignMemory(r.flatSize,t);return r.flatSize=f+v,e>=0&&a.push(f-e),e=f,f}),r.flatSize=le.alignMemory(r.flatSize,r.alignSize),0==a.length?r.flatFactor=r.flatSize:1==le.dedup(a).length&&(r.flatFactor=a[0]),r.needsFlattening=1!=r.flatFactor,r.flatIndexes},generateStructInfo:function(r,a,i){var v,t;if(a){if(i=i||0,v=("undefined"==typeof Types?le.typeInfo:Types.types)[a],!v)return null;e(v.fields.length===r.length,"Number of named fields must match the type for "+a),t=v.flatIndexes}else{var v={fields:r.map(function(r){return r[0]})};t=le.calculateStructAlignment(v)}var f={__size__:v.flatSize};return a?r.forEach(function(r,a){if("string"==typeof r)f[r]=t[a]+i;else{var e;for(var _ in r)e=_;f[e]=le.generateStructInfo(r[e],v.fields[a],t[a])}}):r.forEach(function(r,a){f[r[1]]=t[a]}),f},stackAlloc:function(r){var a=Oe;return Oe+=r,Oe=Oe+3>>2<<2,a},staticAlloc:function(r){var a=Ie;return Ie+=r,Ie=Ie+3>>2<<2,Ie>=Le&&l(),a},alignMemory:function(r,a){var e=r=Math.ceil(r/(a?a:4))*(a?a:4);return e},makeBigInt:function(r,a,e){var i=e?(r>>>0)+4294967296*(a>>>0):(r>>>0)+4294967296*(0|a);return i},QUANTUM_SIZE:4,__dummy__:0},be={MAX_ALLOWED:0,corrections:0,sigs:{},note:function(r,e,i){e||(this.corrections++,this.corrections>=this.MAX_ALLOWED&&a("\\n\\nToo many corrections!"))},print:function(){}},ke=!1,ue=0,ce=this;Module.ccall=i,Module.setValue=t,Module.getValue=f;var he=0,de=1,we=2;Module.ALLOC_NORMAL=he,Module.ALLOC_STACK=de,Module.ALLOC_STATIC=we,Module.allocate=_,Module.Pointer_stringify=s,Module.Array_stringify=n;var pe,Ee,Ae,ge,ye,me,Se,Me,Ce,Re,Te,Oe,Ne,Ie,Pe=4096,De=Module.TOTAL_STACK||5242880,Le=Module.TOTAL_MEMORY||10485760;Module.FAST_MEMORY||2097152;e(!!(Int32Array&&Float64Array&&new Int32Array(1).subarray&&new Int32Array(1).set),"Cannot fallback to non-typed array case: Code is too specialized");var Fe=new ArrayBuffer(Le);Ae=new Int8Array(Fe),ye=new Int16Array(Fe),Se=new Int32Array(Fe),ge=new Uint8Array(Fe),me=new Uint16Array(Fe),Me=new Uint32Array(Fe),Ce=new Float32Array(Fe),Re=new Float64Array(Fe),Se[0]=255,e(255===ge[0]&&0===ge[3],"Typed arrays 2 must be run on a little-endian system");var Xe=p("(null)");Ie=Xe.length;for(var je=0;je<Xe.length;je++)Ae[je]=Xe[je];Module.HEAP=Ee,Module.HEAP8=Ae,Module.HEAP16=ye,Module.HEAP32=Se,Module.HEAPU8=ge,Module.HEAPU16=me,Module.HEAPU32=Me,Module.HEAPF32=Ce,Module.HEAPF64=Re,Te=Oe=le.alignMemory(Ie),Ne=Te+De;var Ue=le.alignMemory(Ne,8),xe=(Ae.subarray(Ue),Se.subarray(Ue>>2)),ze=(Ce.subarray(Ue>>2),Re.subarray(Ue>>3));Ne=Ue+8,Ie=o(Ne);var Ve=[],Be=[];Module.Array_copy=c,Module.TypedArray_copy=h,Module.String_len=d,Module.String_copy=w,Module.intArrayFromString=p,Module.intArrayToString=E,Module.writeStringToMemory=A;var He=[],Ke=0;O.X=1,N.X=1,V.X=1,H.X=1,G.X=1,W.X=1,q.X=1,$.X=1,rr.X=1,ar.X=1,er.X=1,vr.X=1,nr.X=1,or.X=1,kr.X=1,hr.X=1,Ar.X=1,Sr.X=1,Tr.X=1,Ir.X=1,Pr.X=1,Dr.X=1,Lr.X=1,Fr.X=1,Xr.X=1,zr.X=1,Vr.X=1,Br.X=1,Gr.X=1,$r.X=1,Module._malloc=Jr,Jr.X=1,ra.X=1,aa.X=1,ea.X=1,ia.X=1,Module._free=va,va.X=1,_a.X=1,sa.X=1,na.X=1,oa.X=1,la.X=1,da.X=1,Ma.X=1;var Ye,Ge={E2BIG:7,EACCES:13,EADDRINUSE:98,EADDRNOTAVAIL:99,EAFNOSUPPORT:97,EAGAIN:11,EALREADY:114,EBADF:9,EBADMSG:74,EBUSY:16,ECANCELED:125,ECHILD:10,ECONNABORTED:103,ECONNREFUSED:111,ECONNRESET:104,EDEADLK:35,EDESTADDRREQ:89,EDOM:33,EDQUOT:122,EEXIST:17,EFAULT:14,EFBIG:27,EHOSTUNREACH:113,EIDRM:43,EILSEQ:84,EINPROGRESS:115,EINTR:4,EINVAL:22,EIO:5,EISCONN:106,EISDIR:21,ELOOP:40,EMFILE:24,EMLINK:31,EMSGSIZE:90,EMULTIHOP:72,ENAMETOOLONG:36,ENETDOWN:100,ENETRESET:102,ENETUNREACH:101,ENFILE:23,ENOBUFS:105,ENODATA:61,ENODEV:19,ENOENT:2,ENOEXEC:8,ENOLCK:37,ENOLINK:67,ENOMEM:12,ENOMSG:42,ENOPROTOOPT:92,ENOSPC:28,ENOSR:63,ENOSTR:60,ENOSYS:38,ENOTCONN:107,ENOTDIR:20,ENOTEMPTY:39,ENOTRECOVERABLE:131,ENOTSOCK:88,ENOTSUP:95,ENOTTY:25,ENXIO:6,EOVERFLOW:75,EOWNERDEAD:130,EPERM:1,EPIPE:32,EPROTO:71,EPROTONOSUPPORT:93,EPROTOTYPE:91,ERANGE:34,EROFS:30,ESPIPE:29,ESRCH:3,ESTALE:116,ETIME:62,ETIMEDOUT:110,ETXTBSY:26,EWOULDBLOCK:11,EXDEV:18},We=0,Ze=0,Qe=0,qe=0,$e={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:!0,absolutePath:function(r,a){if("string"!=typeof r)return null;void 0===a&&(a=$e.currentPath),r&&"/"==r[0]&&(a="");for(var e=a+"/"+r,i=e.split("/").reverse(),v=[""];i.length;){var t=i.pop();""==t||"."==t||(".."==t?v.length>1&&v.pop():v.push(t))}return 1==v.length?"/":v.join("/")},analyzePath:function(r,a,e){var i={isRoot:!1,exists:!1,error:0,name:null,path:null,object:null,parentExists:!1,parentPath:null,parentObject:null};if(r=$e.absolutePath(r),"/"==r)i.isRoot=!0,i.exists=i.parentExists=!0,i.name="/",i.path=i.parentPath="/",i.object=i.parentObject=$e.root;else if(null!==r){e=e||0,r=r.slice(1).split("/");for(var v=$e.root,t=[""];r.length;){1==r.length&&v.isFolder&&(i.parentExists=!0,i.parentPath=1==t.length?"/":t.join("/"),i.parentObject=v,i.name=r[0]);var f=r.shift();if(!v.isFolder){i.error=Ge.ENOTDIR;break}if(!v.read){i.error=Ge.EACCES;break}if(!v.contents.hasOwnProperty(f)){i.error=Ge.ENOENT;break}if(v=v.contents[f],v.link&&(!a||0!=r.length)){if(e>40){i.error=Ge.ELOOP;break}var _=$e.absolutePath(v.link,t.join("/"));return $e.analyzePath([_].concat(r).join("/"),a,e+1)}t.push(f),0==r.length&&(i.exists=!0,i.path=t.join("/"),i.object=v)}return i}return i},findObject:function(r,a){$e.ensureRoot();var e=$e.analyzePath(r,a);return e.exists?e.object:(Ya(e.error),null)},createObject:function(r,a,e,i,v){if(r||(r="/"),"string"==typeof r&&(r=$e.findObject(r)),!r)throw Ya(Ge.EACCES),new Error("Parent path must exist.");if(!r.isFolder)throw Ya(Ge.ENOTDIR),
new Error("Parent must be a folder.");if(!r.write&&!$e.ignorePermissions)throw Ya(Ge.EACCES),new Error("Parent folder must be writeable.");if(!a||"."==a||".."==a)throw Ya(Ge.ENOENT),new Error("Name must not be empty.");if(r.contents.hasOwnProperty(a))throw Ya(Ge.EEXIST),new Error("Can't overwrite object.");r.contents[a]={read:void 0===i||i,write:void 0!==v&&v,timestamp:Date.now(),inodeNumber:$e.nextInode++};for(var t in e)e.hasOwnProperty(t)&&(r.contents[a][t]=e[t]);return r.contents[a]},createFolder:function(r,a,e,i){var v={isFolder:!0,isDevice:!1,contents:{}};return $e.createObject(r,a,v,e,i)},createPath:function(r,a,e,i){var v=$e.findObject(r);if(null===v)throw new Error("Invalid parent.");for(a=a.split("/").reverse();a.length;){var t=a.pop();t&&(v.contents.hasOwnProperty(t)||$e.createFolder(v,t,e,i),v=v.contents[t])}return v},createFile:function(r,a,e,i,v){return e.isFolder=!1,$e.createObject(r,a,e,i,v)},createDataFile:function(r,a,e,i,v){if("string"==typeof e){for(var t=new Array(e.length),f=0,_=e.length;f<_;++f)t[f]=e.charCodeAt(f);e=t}var s={isDevice:!1,contents:e};return $e.createFile(r,a,s,i,v)},createLazyFile:function(r,a,e,i,v){var t={isDevice:!1,url:e};return $e.createFile(r,a,t,i,v)},createLink:function(r,a,e,i,v){var t={isDevice:!1,link:e};return $e.createFile(r,a,t,i,v)},createDevice:function(r,a,e,i){if(!e&&!i)throw new Error("A device must have at least one callback defined.");var v={isDevice:!0,input:e,output:i};return $e.createFile(r,a,v,Boolean(e),Boolean(i))},forceLoadFile:function(r){if(r.isDevice||r.isFolder||r.link||r.contents)return!0;var a=!0;if("undefined"!=typeof XMLHttpRequest)e("Cannot do synchronous binary XHRs in modern browsers. Use --embed-file or --preload-file in emcc");else{if("undefined"==typeof read)throw new Error("Cannot load without read() or XMLHttpRequest.");try{r.contents=p(read(r.url),!0)}catch(r){a=!1}}return a||Ya(Ge.EIO),a},ensureRoot:function(){$e.root||($e.root={read:!0,write:!0,isFolder:!0,isDevice:!1,timestamp:Date.now(),inodeNumber:1,contents:{}})},init:function(r,a,i){function v(r){null===r||r==="\\n".charCodeAt(0)?(a.printer(a.buffer.join("")),a.buffer=[]):a.buffer.push(String.fromCharCode(r))}e(!$e.init.initialized,"FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)"),$e.init.initialized=!0,$e.ensureRoot(),r=r||Module.stdin,a=a||Module.stdout,i=i||Module.stderr;var t=!0,f=!0,s=!0;r||(t=!1,r=function(){if(!r.cache||!r.cache.length){var a;"undefined"!=typeof window&&"function"==typeof window.prompt?a=window.prompt("Input: "):"function"==typeof readline&&(a=readline()),a||(a=""),r.cache=p(a+"\\n",!0)}return r.cache.shift()}),a||(f=!1,a=v),a.printer||(a.printer=print),a.buffer||(a.buffer=[]),i||(s=!1,i=v),i.printer||(i.printer=print),i.buffer||(i.buffer=[]),$e.createFolder("/","tmp",!0,!0);var n=$e.createFolder("/","dev",!0,!0),o=$e.createDevice(n,"stdin",r),l=$e.createDevice(n,"stdout",null,a),b=$e.createDevice(n,"stderr",null,i);$e.createDevice(n,"tty",r,a),$e.streams[1]={path:"/dev/stdin",object:o,position:0,isRead:!0,isWrite:!1,isAppend:!1,isTerminal:!t,error:!1,eof:!1,ungotten:[]},$e.streams[2]={path:"/dev/stdout",object:l,position:0,isRead:!1,isWrite:!0,isAppend:!1,isTerminal:!f,error:!1,eof:!1,ungotten:[]},$e.streams[3]={path:"/dev/stderr",object:b,position:0,isRead:!1,isWrite:!0,isAppend:!1,isTerminal:!s,error:!1,eof:!1,ungotten:[]},We=_([1],"void*",we),Ze=_([2],"void*",we),Qe=_([3],"void*",we),$e.createPath("/","dev/shm/tmp",!0,!0),$e.streams[We]=$e.streams[1],$e.streams[Ze]=$e.streams[2],$e.streams[Qe]=$e.streams[3],qe=_([_([0,0,0,0,We,0,0,0,Ze,0,0,0,Qe,0,0,0],"void*",we)],"void*",we)},quit:function(){$e.init.initialized&&($e.streams[2]&&$e.streams[2].object.output.buffer.length>0&&$e.streams[2].object.output("\\n".charCodeAt(0)),$e.streams[3]&&$e.streams[3].object.output.buffer.length>0&&$e.streams[3].object.output("\\n".charCodeAt(0)))}},Je=Ja;Ve.unshift({func:function(){$e.ignorePermissions=!1,$e.init.initialized||$e.init()}}),Be.push({func:function(){$e.quit()}}),Ya(0),ae.buf=_(12,"void*",we),Module.callMain=function(r){function a(){for(var r=0;r<3;r++)i.push(0)}var e=r.length+1,i=[_(p("/bin/this.program"),"i8",we)];a();for(var v=0;v<e-1;v+=1)i.push(_(p(r[v]),"i8",we)),a();return i.push(0),i=_(i,"i32",we),_main(e,i,0)};var ri,ai,ei,ii,vi,ti,qe,fi,_i,si,ni,oi,li,bi,ki,ui,ci,hi,di,wi;if(He.__str=_([97,78,0],"i8",we),He.__str1=_([38,61,0],"i8",we),He.__str2=_([97,83,0],"i8",we),He.__str3=_([61,0],"i8",we),He.__str4=_([97,97,0],"i8",we),He.__str5=_([38,38,0],"i8",we),He.__str6=_([97,100,0],"i8",we),He.__str7=_([38,0],"i8",we),He.__str8=_([97,110,0],"i8",we),He.__str9=_([99,108,0],"i8",we),He.__str10=_([40,41,0],"i8",we),He.__str11=_([99,109,0],"i8",we),He.__str12=_([44,0],"i8",we),He.__str13=_([99,111,0],"i8",we),He.__str14=_([126,0],"i8",we),He.__str15=_([100,86,0],"i8",we),He.__str16=_([47,61,0],"i8",we),He.__str17=_([100,97,0],"i8",we),He.__str18=_([100,101,108,101,116,101,91,93,0],"i8",we),He.__str19=_([100,101,0],"i8",we),He.__str20=_([42,0],"i8",we),He.__str21=_([100,108,0],"i8",we),He.__str22=_([100,101,108,101,116,101,0],"i8",we),He.__str23=_([100,118,0],"i8",we),He.__str24=_([47,0],"i8",we),He.__str25=_([101,79,0],"i8",we),He.__str26=_([94,61,0],"i8",we),He.__str27=_([101,111,0],"i8",we),He.__str28=_([94,0],"i8",we),He.__str29=_([101,113,0],"i8",we),He.__str30=_([61,61,0],"i8",we),He.__str31=_([103,101,0],"i8",we),He.__str32=_([62,61,0],"i8",we),He.__str33=_([103,116,0],"i8",we),He.__str34=_([62,0],"i8",we),He.__str35=_([105,120,0],"i8",we),He.__str36=_([91,93,0],"i8",we),He.__str37=_([108,83,0],"i8",we),He.__str38=_([60,60,61,0],"i8",we),He.__str39=_([108,101,0],"i8",we),He.__str40=_([60,61,0],"i8",we),He.__str41=_([108,115,0],"i8",we),He.__str42=_([60,60,0],"i8",we),He.__str43=_([108,116,0],"i8",we),He.__str44=_([60,0],"i8",we),He.__str45=_([109,73,0],"i8",we),He.__str46=_([45,61,0],"i8",we),He.__str47=_([109,76,0],"i8",we),He.__str48=_([42,61,0],"i8",we),He.__str49=_([109,105,0],"i8",we),He.__str51=_([109,108,0],"i8",we),He.__str52=_([109,109,0],"i8",we),He.__str53=_([45,45,0],"i8",we),He.__str54=_([110,97,0],"i8",we),He.__str55=_([110,101,119,91,93,0],"i8",we),He.__str56=_([110,101,0],"i8",we),He.__str57=_([33,61,0],"i8",we),He.__str58=_([110,103,0],"i8",we),He.__str59=_([110,116,0],"i8",we),He.__str60=_([33,0],"i8",we),He.__str61=_([110,119,0],"i8",we),He.__str62=_([110,101,119,0],"i8",we),He.__str63=_([111,82,0],"i8",we),He.__str64=_([124,61,0],"i8",we),He.__str65=_([111,111,0],"i8",we),He.__str66=_([124,124,0],"i8",we),He.__str67=_([111,114,0],"i8",we),He.__str68=_([124,0],"i8",we),He.__str69=_([112,76,0],"i8",we),He.__str70=_([43,61,0],"i8",we),He.__str71=_([112,108,0],"i8",we),He.__str72=_([43,0],"i8",we),He.__str73=_([112,109,0],"i8",we),He.__str74=_([45,62,42,0],"i8",we),He.__str75=_([112,112,0],"i8",we),He.__str76=_([43,43,0],"i8",we),He.__str77=_([112,115,0],"i8",we),He.__str78=_([112,116,0],"i8",we),He.__str79=_([45,62,0],"i8",we),He.__str80=_([113,117,0],"i8",we),He.__str81=_([63,0],"i8",we),He.__str82=_([114,77,0],"i8",we),He.__str83=_([37,61,0],"i8",we),He.__str84=_([114,83,0],"i8",we),He.__str85=_([62,62,61,0],"i8",we),He.__str86=_([114,109,0],"i8",we),He.__str87=_([37,0],"i8",we),He.__str88=_([114,115,0],"i8",we),He.__str89=_([62,62,0],"i8",we),He.__str90=_([115,116,0],"i8",we),He.__str91=_([115,105,122,101,111,102,32,0],"i8",we),He.__str92=_([115,122,0],"i8",we),ri=_([0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0],we),He.__str95=_([98,111,111,108,101,97,110,0],"i8",we),He.__str97=_([98,121,116,101,0],"i8",we),He.__str101=_([95,95,102,108,111,97,116,49,50,56,0],"i8",we),He.__str105=_([117,110,115,105,103,110,101,100,0],"i8",we),He.__str114=_([108,111,110,103,32,108,111,110,103,0],"i8",we),He.__str115=_([117,110,115,105,103,110,101,100,32,108,111,110,103,32,108,111,110,103,0],"i8",we),ai=_([0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,7,0,0,0,7,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,6,0,0,0,8,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,0,8,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,8,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,10,0,0,0,8,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,8,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,3,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,13,0,0,0,4,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,4,0,0,0,9,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,4,0,0,0,5,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,18,0,0,0,6,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0],["*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0],we),He.__str117=_([95,71,76,79,66,65,76,95,0],"i8",we),He.__str118=_([103,108,111,98,97,108,32,99,111,110,115,116,114,117,99,116,111,114,115,32,107,101,121,101,100,32,116,111,32,0],"i8",we),He.__str119=_([103,108,111,98,97,108,32,100,101,115,116,114,117,99,116,111,114,115,32,107,101,121,101,100,32,116,111,32,0],"i8",we),He.__str120=_([58,58,0],"i8",we),He.__str121=_([118,116,97,98,108,101,32,102,111,114,32,0],"i8",we),He.__str122=_([86,84,84,32,102,111,114,32,0],"i8",we),He.__str123=_([99,111,110,115,116,114,117,99,116,105,111,110,32,118,116,97,98,108,101,32,102,111,114,32,0],"i8",we),He.__str124=_([45,105,110,45,0],"i8",we),He.__str125=_([116,121,112,101,105,110,102,111,32,102,111,114,32,0],"i8",we),He.__str126=_([116,121,112,101,105,110,102,111,32,110,97,109,101,32,102,111,114,32,0],"i8",we),He.__str127=_([116,121,112,101,105,110,102,111,32,102,110,32,102,111,114,32,0],"i8",we),He.__str128=_([110,111,110,45,118,105,114,116,117,97,108,32,116,104,117,110,107,32,116,111,32,0],"i8",we),He.__str129=_([118,105,114,116,117,97,108,32,116,104,117,110,107,32,116,111,32,0],"i8",we),He.__str130=_([99,111,118,97,114,105,97,110,116,32,114,101,116,117,114,110,32,116,104,117,110,107,32,116,111,32,0],"i8",we),He.__str131=_([106,97,118,97,32,67,108,97,115,115,32,102,111,114,32,0],"i8",we),He.__str132=_([103,117,97,114,100,32,118,97,114,105,97,98,108,101,32,102,111,114,32,0],"i8",we),He.__str133=_([114,101,102,101,114,101,110,99,101,32,116,101,109,112,111,114,97,114,121,32,102,111,114,32,0],"i8",we),He.__str134=_([104,105,100,100,101,110,32,97,108,105,97,115,32,102,111,114,32,0],"i8",we),He.__str135=_([58,58,42,0],"i8",we),He.__str136=_([44,32,0],"i8",we),He.__str137=_([111,112,101,114,97,116,111,114,0],"i8",we),He.__str139=_([41,32,0],"i8",we),He.__str140=_([32,40,0],"i8",we),He.__str141=_([41,32,58,32,40,0],"i8",we),He.__str142=_([117,108,0],"i8",we),He.__str143=_([108,108,0],"i8",we),He.__str144=_([117,108,108,0],"i8",we),He.__str145=_([102,97,108,115,101,0],"i8",we),He.__str146=_([116,114,117,101,0],"i8",we),He.__str147=_([32,114,101,115,116,114,105,99,116,0],"i8",we),He.__str148=_([32,118,111,108,97,116,105,108,101,0],"i8",we),He.__str149=_([32,99,111,110,115,116,0],"i8",we),He.__str150=_([99,111,109,112,108,101,120,32,0],"i8",we),He.__str151=_([105,109,97,103,105,110,97,114,121,32,0],"i8",we),ei=_([116,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,9,0,0,0,98,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,17,0,0,0,0,0,0,0,12,0,0,0,115,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,70,0,0,0,0,0,0,0,12,0,0,0,105,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,13,0,0,0,111,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,49,0,0,0,0,0,0,0,13,0,0,0,100,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,14,0,0,0],["i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"i8",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0],we),He.__str152=_([115,116,100,0],"i8",we),He.__str153=_([115,116,100,58,58,97,108,108,111,99,97,116,111,114,0],"i8",we),He.__str154=_([97,108,108,111,99,97,116,111,114,0],"i8",we),He.__str155=_([115,116,100,58,58,98,97,115,105,99,95,115,116,114,105,110,103,0],"i8",we),He.__str156=_([98,97,115,105,99,95,115,116,114,105,110,103,0],"i8",we),He.__str157=_([115,116,100,58,58,115,116,114,105,110,103,0],"i8",we),He.__str158=_([115,116,100,58,58,98,97,115,105,99,95,115,116,114,105,110,103,60,99,104,97,114,44,32,115,116,100,58,58,99,104,97,114,95,116,114,97,105,116,115,60,99,104,97,114,62,44,32,115,116,100,58,58,97,108,108,111,99,97,116,111,114,60,99,104,97,114,62,32,62,0],"i8",we),He.__str159=_([115,116,100,58,58,105,115,116,114,101,97,109,0],"i8",we),He.__str160=_([115,116,100,58,58,98,97,115,105,99,95,105,115,116,114,101,97,109,60,99,104,97,114,44,32,115,116,100,58,58,99,104,97,114,95,116,114,97,105,116,115,60,99,104,97,114,62,32,62,0],"i8",we),He.__str161=_([98,97,115,105,99,95,105,115,116,114,101,97,109,0],"i8",we),He.__str162=_([115,116,100,58,58,111,115,116,114,101,97,109,0],"i8",we),He.__str163=_([115,116,100,58,58,98,97,115,105,99,95,111,115,116,114,101,97,109,60,99,104,97,114,44,32,115,116,100,58,58,99,104,97,114,95,116,114,97,105,116,115,60,99,104,97,114,62,32,62,0],"i8",we),He.__str164=_([98,97,115,105,99,95,111,115,116,114,101,97,109,0],"i8",we),He.__str165=_([115,116,100,58,58,105,111,115,116,114,101,97,109,0],"i8",we),He.__str166=_([115,116,100,58,58,98,97,115,105,99,95,105,111,115,116,114,101,97,109,60,99,104,97,114,44,32,115,116,100,58,58,99,104,97,114,95,116,114,97,105,116,115,60,99,104,97,114,62,32,62,0],"i8",we),He.__str167=_([98,97,115,105,99,95,105,111,115,116,114,101,97,109,0],"i8",we),He.__str168=_([115,116,114,105,110,103,32,108,105,116,101,114,97,108,0],"i8",we),He.__str169=_([40,97,110,111,110,121,109,111,117,115,32,110,97,109,101,115,112,97,99,101,41,0],"i8",we),He._symbol_demangle_dashed_null=_([45,45,110,117,108,108,45,45,0],"i8",we),He.__str170=_([37,115,37,115,0],"i8",we),He.__str1171=_([111,112,101,114,97,116,111,114,32,110,101,119,0],"i8",we),He.__str2172=_([111,112,101,114,97,116,111,114,32,100,101,108,101,116,101,0],"i8",we),He.__str3173=_([111,112,101,114,97,116,111,114,61,0],"i8",we),He.__str4174=_([111,112,101,114,97,116,111,114,62,62,0],"i8",we),He.__str5175=_([111,112,101,114,97,116,111,114,60,60,0],"i8",we),He.__str6176=_([111,112,101,114,97,116,111,114,33,0],"i8",we),He.__str7177=_([111,112,101,114,97,116,111,114,61,61,0],"i8",we),He.__str8178=_([111,112,101,114,97,116,111,114,33,61,0],"i8",we),He.__str9179=_([111,112,101,114,97,116,111,114,91,93,0],"i8",we),He.__str10180=_([111,112,101,114,97,116,111,114,32,0],"i8",we),He.__str11181=_([111,112,101,114,97,116,111,114,45,62,0],"i8",we),He.__str12182=_([111,112,101,114,97,116,111,114,42,0],"i8",we),He.__str13183=_([111,112,101,114,97,116,111,114,43,43,0],"i8",we),He.__str14184=_([111,112,101,114,97,116,111,114,45,45,0],"i8",we),He.__str15185=_([111,112,101,114,97,116,111,114,45,0],"i8",we),He.__str16186=_([111,112,101,114,97,116,111,114,43,0],"i8",we),He.__str17187=_([111,112,101,114,97,116,111,114,38,0],"i8",we),He.__str18188=_([111,112,101,114,97,116,111,114,45,62,42,0],"i8",we),He.__str19189=_([111,112,101,114,97,116,111,114,47,0],"i8",we),He.__str20190=_([111,112,101,114,97,116,111,114,37,0],"i8",we),He.__str21191=_([111,112,101,114,97,116,111,114,60,0],"i8",we),He.__str22192=_([111,112,101,114,97,116,111,114,60,61,0],"i8",we),He.__str23193=_([111,112,101,114,97,116,111,114,62,0],"i8",we),He.__str24194=_([111,112,101,114,97,116,111,114,62,61,0],"i8",we),He.__str25195=_([111,112,101,114,97,116,111,114,44,0],"i8",we),He.__str26196=_([111,112,101,114,97,116,111,114,40,41,0],"i8",we),He.__str27197=_([111,112,101,114,97,116,111,114,126,0],"i8",we),He.__str28198=_([111,112,101,114,97,116,111,114,94,0],"i8",we),He.__str29199=_([111,112,101,114,97,116,111,114,124,0],"i8",we),He.__str30200=_([111,112,101,114,97,116,111,114,38,38,0],"i8",we),He.__str31201=_([111,112,101,114,97,116,111,114,124,124,0],"i8",we),He.__str32202=_([111,112,101,114,97,116,111,114,42,61,0],"i8",we),He.__str33203=_([111,112,101,114,97,116,111,114,43,61,0],"i8",we),He.__str34204=_([111,112,101,114,97,116,111,114,45,61,0],"i8",we),He.__str35205=_([111,112,101,114,97,116,111,114,47,61,0],"i8",we),He.__str36206=_([111,112,101,114,97,116,111,114,37,61,0],"i8",we),He.__str37207=_([111,112,101,114,97,116,111,114,62,62,61,0],"i8",we),He.__str38208=_([111,112,101,114,97,116,111,114,60,60,61,0],"i8",we),He.__str39209=_([111,112,101,114,97,116,111,114,38,61,0],"i8",we),He.__str40210=_([111,112,101,114,97,116,111,114,124,61,0],"i8",we),He.__str41211=_([111,112,101,114,97,116,111,114,94,61,0],"i8",we),He.__str42212=_([96,118,102,116,97,98,108,101,39,0],"i8",we),He.__str43213=_([96,118,98,116,97,98,108,101,39,0],"i8",we),He.__str44214=_([96,118,99,97,108,108,39,0],"i8",we),He.__str45215=_([96,116,121,112,101,111,102,39,0],"i8",we),He.__str46216=_([96,108,111,99,97,108,32,115,116,97,116,105,99,32,103,117,97,114,100,39,0],"i8",we),He.__str47217=_([96,115,116,114,105,110,103,39,0],"i8",we),He.__str48218=_([96,118,98,97,115,101,32,100,101,115,116,114,117,99,116,111,114,39,0],"i8",we),He.__str49219=_([96,118,101,99,116,111,114,32,100,101,108,101,116,105,110,103,32,100,101,115,116,114,117,99,116,111,114,39,0],"i8",we),He.__str50220=_([96,100,101,102,97,117,108,116,32,99,111,110,115,116,114,117,99,116,111,114,32,99,108,111,115,117,114,101,39,0],"i8",we),He.__str51221=_([96,115,99,97,108,97,114,32,100,101,108,101,116,105,110,103,32,100,101,115,116,114,117,99,116,111,114,39,0],"i8",we),He.__str52222=_([96,118,101,99,116,111,114,32,99,111,110,115,116,114,117,99,116,111,114,32,105,116,101,114,97,116,111,114,39,0],"i8",we),He.__str53223=_([96,118,101,99,116,111,114,32,100,101,115,116,114,117,99,116,111,114,32,105,116,101,114,97,116,111,114,39,0],"i8",we),He.__str54224=_([96,118,101,99,116,111,114,32,118,98,97,115,101,32,99,111,110,115,116,114,117,99,116,111,114,32,105,116,101,114,97,116,111,114,39,0],"i8",we),He.__str55225=_([96,118,105,114,116,117,97,108,32,100,105,115,112,108,97,99,101,109,101,110,116,32,109,97,112,39,0],"i8",we),He.__str56226=_([96,101,104,32,118,101,99,116,111,114,32,99,111,110,115,116,114,117,99,116,111,114,32,105,116,101,114,97,116,111,114,39,0],"i8",we),He.__str57227=_([96,101,104,32,118,101,99,116,111,114,32,100,101,115,116,114,117,99,116,111,114,32,105,116,101,114,97,116,111,114,39,0],"i8",we),He.__str58228=_([96,101,104,32,118,101,99,116,111,114,32,118,98,97,115,101,32,99,111,110,115,116,114,117,99,116,111,114,32,105,116,101,114,97,116,111,114,39,0],"i8",we),He.__str59229=_([96,99,111,112,121,32,99,111,110,115,116,114,117,99,116,111,114,32,99,108,111,115,117,114,101,39,0],"i8",we),He.__str60230=_([37,115,37,115,32,96,82,84,84,73,32,84,121,112,101,32,68,101,115,99,114,105,112,116,111,114,39,0],"i8",we),He.__str61231=_([96,82,84,84,73,32,66,97,115,101,32,67,108,97,115,115,32,68,101,115,99,114,105,112,116,111,114,32,97,116,32,40,37,115,44,37,115,44,37,115,44,37,115,41,39,0],"i8",we),He.__str62232=_([96,82,84,84,73,32,66,97,115,101,32,67,108,97,115,115,32,65,114,114,97,121,39,0],"i8",we),He.__str63233=_([96,82,84,84,73,32,67,108,97,115,115,32,72,105,101,114,97,114,99,104,121,32,68,101,115,99,114,105,112,116,111,114,39,0],"i8",we),He.__str64234=_([96,82,84,84,73,32,67,111,109,112,108,101,116,101,32,79,98,106,101,99,116,32,76,111,99,97,116,111,114,39,0],"i8",we),He.__str65235=_([96,108,111,99,97,108,32,118,102,116,97,98,108,101,39,0],"i8",we),He.__str66236=_([96,108,111,99,97,108,32,118,102,116,97,98,108,101,32,99,111,110,115,116,114,117,99,116,111,114,32,99,108,111,115,117,114,101,39,0],"i8",we),He.__str67237=_([111,112,101,114,97,116,111,114,32,110,101,119,91,93,0],"i8",we),He.__str68238=_([111,112,101,114,97,116,111,114,32,100,101,108,101,116,101,91,93,0],"i8",we),He.__str69239=_([96,112,108,97,99,101,109,101,110,116,32,100,101,108,101,116,101,32,99,108,111,115,117,114,101,39,0],"i8",we),He.__str70240=_([96,112,108,97,99,101,109,101,110,116,32,100,101,108,101,116,101,91,93,32,99,108,111,115,117,114,101,39,0],"i8",we),He.__str71241=_([126,37,115,0],"i8",we),He.__str72242=_([117,110,100,110,97,109,101,46,99,0],"i8",we),He.___func___symbol_demangle=_([115,121,109,98,111,108,95,100,101,109,97,110,103,108,101,0],"i8",we),He.__str73243=_([115,121,109,45,62,114,101,115,117,108,116,0],"i8",we),He.___func___handle_template=_([104,97,110,100,108,101,95,116,101,109,112,108,97,116,101,0],"i8",we),He.__str74244=_([42,115,121,109,45,62,99,117,114,114,101,110,116,32,61,61,32,39,36,39,0],"i8",we),He.___func___str_array_get_ref=_([115,116,114,95,97,114,114,97,121,95,103,101,116,95,114,101,102,0],"i8",we),He.__str75245=_([99,114,101,102,0],"i8",we),He.__str76246=_([112,114,105,118,97,116,101,58,32,0],"i8",we),He.__str77247=_([112,114,111,116,101,99,116,101,100,58,32,0],"i8",we),He.__str78248=_([112,117,98,108,105,99,58,32,0],"i8",we),He.__str79249=_([115,116,97,116,105,99,32,0],"i8",we),He.__str80250=_([118,105,114,116,117,97,108,32,0],"i8",we),He.__str81251=_([91,116,104,117,110,107,93,58,37,115,0],"i8",we),He.__str82252=_([37,115,96,97,100,106,117,115,116,111,114,123,37,115,125,39,32,0],"i8",we),He.__str83253=_([37,115,32,37,115,0],"i8",we),He.__str84254=_([118,111,105,100,0],"i8",we),He.__str85255=_([37,115,37,115,37,115,0],"i8",we),He.__str86256=_([37,115,37,115,37,115,37,115,37,115,37,115,37,115,37,115,37,115,37,115,37,115,0],"i8",we),He.__str87257=_([32,0],"i8",we),He.__str88258=_([100,108,108,95,101,120,112,111,114,116,32,0],"i8",we),He.__str89259=_([99,100,101,99,108,0],"i8",we),He.__str90260=_([112,97,115,99,97,108,0],"i8",we),He.__str91261=_([116,104,105,115,99,97,108,108,0],"i8",we),He.__str92262=_([115,116,100,99,97,108,108,0],"i8",we),He.__str93263=_([102,97,115,116,99,97,108,108,0],"i8",we),He.__str94264=_([99,108,114,99,97,108,108,0],"i8",we),He.__str95265=_([95,95,100,108,108,95,101,120,112,111,114,116,32,0],"i8",we),He.__str96266=_([95,95,99,100,101,99,108,0],"i8",we),He.__str97267=_([95,95,112,97,115,99,97,108,0],"i8",we),He.__str98268=_([95,95,116,104,105,115,99,97,108,108,0],"i8",we),He.__str99269=_([95,95,115,116,100,99,97,108,108,0],"i8",we),He.__str100270=_([95,95,102,97,115,116,99,97,108,108,0],"i8",we),He.__str101271=_([95,95,99,108,114,99,97,108,108,0],"i8",we),He.__str102272=_([95,95,112,116,114,54,52,0],"i8",we),He.__str103273=_([99,111,110,115,116,0],"i8",we),He.__str104274=_([118,111,108,97,116,105,108,101,0],"i8",we),He.__str105275=_([99,111,110,115,116,32,118,111,108,97,116,105,108,101,0],"i8",we),He.___func___get_class_string=_([103,101,116,95,99,108,97,115,115,95,115,116,114,105,110,103,0],"i8",we),He.__str106276=_([97,45,62,101,108,116,115,91,105,93,0],"i8",we),He.__str107277=_([123,102,111,114,32,96,37,115,39,125,0],"i8",we),He.__str108278=_([37,115,37,115,37,115,37,115,37,115,37,115,37,115,37,115,0],"i8",we),He.__str109279=_([96,37,115,39,0],"i8",we),He.__str110280=_([46,46,46,0],"i8",we),He.__str111281=_([37,99,118,111,105,100,37,99,0],"i8",we),He.__str112282=_([37,115,44,37,115,0],"i8",we),He.__str113283=_([37,99,37,115,37,115,32,37,99,0],"i8",we),He.__str114284=_([37,99,37,115,37,115,37,99,0],"i8",we),He.___func___str_array_push=_([115,116,114,95,97,114,114,97,121,95,112,117,115,104,0],"i8",we),He.__str115285=_([112,116,114,0],"i8",we),He.__str116286=_([97,0],"i8",we),He.__str117287=_([97,45,62,101,108,116,115,91,97,45,62,110,117,109,93,0],"i8",we),He.__str118288=_([37,115,37,100,0],"i8",we),He.__str119289=_([45,0],"i8",we),ii=_(1,"i8",we),He.___func___demangle_datatype=_([100,101,109,97,110,103,108,101,95,100,97,116,97,116,121,112,101,0],"i8",we),He.__str121291=_([99,116,0],"i8",we),He.__str122292=_([117,110,105,111,110,32,0],"i8",we),He.__str123293=_([115,116,114,117,99,116,32,0],"i8",we),He.__str124294=_([99,108,97,115,115,32,0],"i8",we),He.__str125295=_([99,111,105,110,116,101,114,102,97,99,101,32,0],"i8",we),He.__str126296=_([96,116,101,109,112,108,97,116,101,45,112,97,114,97,109,101,116,101,114,45,37,115,39,0],"i8",we),He.__str127297=_([37,115,37,115,32,40,37,115,42,0],"i8",we),He.__str128298=_([41,37,115,0],"i8",we),He.__str129299=_([101,110,117,109,32,37,115,0],"i8",we),He.__str130300=_([96,116,101,109,112,108,97,116,101,45,112,97,114,97,109,101,116,101,114,37,115,39,0],"i8",we),He.__str131301=_([123,37,115,44,37,115,125,0],"i8",we),He.__str132302=_([123,37,115,44,37,115,44,37,115,125,0],"i8",we),He.__str133303=_([96,110,111,110,45,116,121,112,101,45,116,101,109,112,108,97,116,101,45,112,97,114,97,109,101,116,101,114,37,115,39,0],"i8",we),He.__str134304=_([32,95,95,112,116,114,54,52,0],"i8",we),He.__str135305=_([32,38,37,115,0],"i8",we),He.__str136306=_([32,38,37,115,32,118,111,108,97,116,105,108,101,0],"i8",we),He.__str137307=_([32,42,37,115,0],"i8",we),He.__str138308=_([32,42,37,115,32,99,111,110,115,116,0],"i8",we),He.__str139309=_([32,42,37,115,32,118,111,108,97,116,105,108,101,0],"i8",we),He.__str140310=_([32,42,37,115,32,99,111,110,115,116,32,118,111,108,97,116,105,108,101,0],"i8",we),He.__str141311=_([32,40,37,115,37,115,41,0],"i8",we),He.__str142312=_([32,40,37,115,41,0],"i8",we),He.__str143313=_([37,115,91,37,115,93,0],"i8",we),He.__str144314=_([37,115,32,37,115,37,115,0],"i8",we),He.__str145315=_([115,105,103,110,101,100,32,99,104,97,114,0],"i8",we),He.__str146316=_([99,104,97,114,0],"i8",we),He.__str147317=_([117,110,115,105,103,110,101,100,32,99,104,97,114,0],"i8",we),He.__str148318=_([115,104,111,114,116,0],"i8",we),He.__str149319=_([117,110,115,105,103,110,101,100,32,115,104,111,114,116,0],"i8",we),He.__str150320=_([105,110,116,0],"i8",we),He.__str151321=_([117,110,115,105,103,110,101,100,32,105,110,116,0],"i8",we),He.__str152322=_([108,111,110,103,0],"i8",we),He.__str153323=_([117,110,115,105,103,110,101,100,32,108,111,110,103,0],"i8",we),He.__str154324=_([102,108,111,97,116,0],"i8",we),He.__str155325=_([100,111,117,98,108,101,0],"i8",we),He.__str156326=_([108,111,110,103,32,100,111,117,98,108,101,0],"i8",we),He.__str157327=_([95,95,105,110,116,56,0],"i8",we),He.__str158328=_([117,110,115,105,103,110,101,100,32,95,95,105,110,116,56,0],"i8",we),He.__str159329=_([95,95,105,110,116,49,54,0],"i8",we),He.__str160330=_([117,110,115,105,103,110,101,100,32,95,95,105,110,116,49,54,0],"i8",we),He.__str161331=_([95,95,105,110,116,51,50,0],"i8",we),He.__str162332=_([117,110,115,105,103,110,101,100,32,95,95,105,110,116,51,50,0],"i8",we),He.__str163333=_([95,95,105,110,116,54,52,0],"i8",we),He.__str164334=_([117,110,115,105,103,110,101,100,32,95,95,105,110,116,54,52,0],"i8",we),
He.__str165335=_([95,95,105,110,116,49,50,56,0],"i8",we),He.__str166336=_([117,110,115,105,103,110,101,100,32,95,95,105,110,116,49,50,56,0],"i8",we),He.__str167337=_([98,111,111,108,0],"i8",we),He.__str168338=_([119,99,104,97,114,95,116,0],"i8",we),vi=_(468,["i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"i32",0,0,0,"i32",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0,"*",0,0,0,"i32",0,0,0],we),ti=_(24,"i32",we),He.__str339=_([109,97,120,32,115,121,115,116,101,109,32,98,121,116,101,115,32,61,32,37,49,48,108,117,10,0],"i8",we),He.__str1340=_([115,121,115,116,101,109,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0],"i8",we),He.__str2341=_([105,110,32,117,115,101,32,98,121,116,101,115,32,32,32,32,32,61,32,37,49,48,108,117,10,0],"i8",we),fi=_([ue],"i8",we),_i=_(1,"void ()*",we),si=_([0,0,0,0,0,0,0,0,6,0,0,0,8,0,0,0,10,0,0,0],["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0],we),_(1,"void*",we),He.__str3342=_([115,116,100,58,58,98,97,100,95,97,108,108,111,99,0],"i8",we),ni=_([0,0,0,0,0,0,0,0,6,0,0,0,12,0,0,0,14,0,0,0],["*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0,"*",0,0,0],we),_(1,"void*",we),He.__str14343=_([98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0],"i8",we),He.__ZTSSt9bad_alloc=_([83,116,57,98,97,100,95,97,108,108,111,99,0],"i8",we),bi=_(12,"*",we),He.__ZTSSt20bad_array_new_length=_([83,116,50,48,98,97,100,95,97,114,114,97,121,95,110,101,119,95,108,101,110,103,116,104,0],"i8",we),ki=_(12,"*",we),Se[ri>>2]=0|He.__str,Se[ri+4>>2]=0|He.__str1,Se[ri+16>>2]=0|He.__str2,Se[ri+20>>2]=0|He.__str3,Se[ri+32>>2]=0|He.__str4,Se[ri+36>>2]=0|He.__str5,Se[ri+48>>2]=0|He.__str6,Se[ri+52>>2]=0|He.__str7,Se[ri+64>>2]=0|He.__str8,Se[ri+68>>2]=0|He.__str7,Se[ri+80>>2]=0|He.__str9,Se[ri+84>>2]=0|He.__str10,Se[ri+96>>2]=0|He.__str11,Se[ri+100>>2]=0|He.__str12,Se[ri+112>>2]=0|He.__str13,Se[ri+116>>2]=0|He.__str14,Se[ri+128>>2]=0|He.__str15,Se[ri+132>>2]=0|He.__str16,Se[ri+144>>2]=0|He.__str17,Se[ri+148>>2]=0|He.__str18,Se[ri+160>>2]=0|He.__str19,Se[ri+164>>2]=0|He.__str20,Se[ri+176>>2]=0|He.__str21,Se[ri+180>>2]=0|He.__str22,Se[ri+192>>2]=0|He.__str23,Se[ri+196>>2]=0|He.__str24,Se[ri+208>>2]=0|He.__str25,Se[ri+212>>2]=0|He.__str26,Se[ri+224>>2]=0|He.__str27,Se[ri+228>>2]=0|He.__str28,Se[ri+240>>2]=0|He.__str29,Se[ri+244>>2]=0|He.__str30,Se[ri+256>>2]=0|He.__str31,Se[ri+260>>2]=0|He.__str32,Se[ri+272>>2]=0|He.__str33,Se[ri+276>>2]=0|He.__str34,Se[ri+288>>2]=0|He.__str35,Se[ri+292>>2]=0|He.__str36,Se[ri+304>>2]=0|He.__str37,Se[ri+308>>2]=0|He.__str38,Se[ri+320>>2]=0|He.__str39,Se[ri+324>>2]=0|He.__str40,Se[ri+336>>2]=0|He.__str41,Se[ri+340>>2]=0|He.__str42,Se[ri+352>>2]=0|He.__str43,Se[ri+356>>2]=0|He.__str44,Se[ri+368>>2]=0|He.__str45,Se[ri+372>>2]=0|He.__str46,Se[ri+384>>2]=0|He.__str47,Se[ri+388>>2]=0|He.__str48,Se[ri+400>>2]=0|He.__str49,Se[ri+404>>2]=0|He.__str119289,Se[ri+416>>2]=0|He.__str51,Se[ri+420>>2]=0|He.__str20,Se[ri+432>>2]=0|He.__str52,Se[ri+436>>2]=0|He.__str53,Se[ri+448>>2]=0|He.__str54,Se[ri+452>>2]=0|He.__str55,Se[ri+464>>2]=0|He.__str56,Se[ri+468>>2]=0|He.__str57,Se[ri+480>>2]=0|He.__str58,Se[ri+484>>2]=0|He.__str119289,Se[ri+496>>2]=0|He.__str59,Se[ri+500>>2]=0|He.__str60,Se[ri+512>>2]=0|He.__str61,Se[ri+516>>2]=0|He.__str62,Se[ri+528>>2]=0|He.__str63,Se[ri+532>>2]=0|He.__str64,Se[ri+544>>2]=0|He.__str65,Se[ri+548>>2]=0|He.__str66,Se[ri+560>>2]=0|He.__str67,Se[ri+564>>2]=0|He.__str68,Se[ri+576>>2]=0|He.__str69,Se[ri+580>>2]=0|He.__str70,Se[ri+592>>2]=0|He.__str71,Se[ri+596>>2]=0|He.__str72,Se[ri+608>>2]=0|He.__str73,Se[ri+612>>2]=0|He.__str74,Se[ri+624>>2]=0|He.__str75,Se[ri+628>>2]=0|He.__str76,Se[ri+640>>2]=0|He.__str77,Se[ri+644>>2]=0|He.__str72,Se[ri+656>>2]=0|He.__str78,Se[ri+660>>2]=0|He.__str79,Se[ri+672>>2]=0|He.__str80,Se[ri+676>>2]=0|He.__str81,Se[ri+688>>2]=0|He.__str82,Se[ri+692>>2]=0|He.__str83,Se[ri+704>>2]=0|He.__str84,Se[ri+708>>2]=0|He.__str85,Se[ri+720>>2]=0|He.__str86,Se[ri+724>>2]=0|He.__str87,Se[ri+736>>2]=0|He.__str88,Se[ri+740>>2]=0|He.__str89,Se[ri+752>>2]=0|He.__str90,Se[ri+756>>2]=0|He.__str91,Se[ri+768>>2]=0|He.__str92,Se[ri+772>>2]=0|He.__str91,Se[ai>>2]=0|He.__str145315,Se[ai+8>>2]=0|He.__str145315,Se[ai+20>>2]=0|He.__str167337,Se[ai+28>>2]=0|He.__str95,Se[ai+40>>2]=0|He.__str146316,Se[ai+48>>2]=0|He.__str97,Se[ai+60>>2]=0|He.__str155325,Se[ai+68>>2]=0|He.__str155325,Se[ai+80>>2]=0|He.__str156326,Se[ai+88>>2]=0|He.__str156326,Se[ai+100>>2]=0|He.__str154324,Se[ai+108>>2]=0|He.__str154324,Se[ai+120>>2]=0|He.__str101,Se[ai+128>>2]=0|He.__str101,Se[ai+140>>2]=0|He.__str147317,Se[ai+148>>2]=0|He.__str147317,Se[ai+160>>2]=0|He.__str150320,Se[ai+168>>2]=0|He.__str150320,Se[ai+180>>2]=0|He.__str151321,Se[ai+188>>2]=0|He.__str105,Se[ai+220>>2]=0|He.__str152322,Se[ai+228>>2]=0|He.__str152322,Se[ai+240>>2]=0|He.__str153323,Se[ai+248>>2]=0|He.__str153323,Se[ai+260>>2]=0|He.__str165335,Se[ai+268>>2]=0|He.__str165335,Se[ai+280>>2]=0|He.__str166336,Se[ai+288>>2]=0|He.__str166336,Se[ai+360>>2]=0|He.__str148318,Se[ai+368>>2]=0|He.__str148318,Se[ai+380>>2]=0|He.__str149319,Se[ai+388>>2]=0|He.__str149319,Se[ai+420>>2]=0|He.__str84254,Se[ai+428>>2]=0|He.__str84254,Se[ai+440>>2]=0|He.__str168338,Se[ai+448>>2]=0|He.__str146316,Se[ai+460>>2]=0|He.__str114,Se[ai+468>>2]=0|He.__str152322,Se[ai+480>>2]=0|He.__str115,Se[ai+488>>2]=0|He.__str115,Se[ai+500>>2]=0|He.__str110280,Se[ai+508>>2]=0|He.__str110280,Se[ei+4>>2]=0|He.__str152,Se[ei+12>>2]=0|He.__str152,Se[ei+32>>2]=0|He.__str153,Se[ei+40>>2]=0|He.__str153,Se[ei+48>>2]=0|He.__str154,Se[ei+60>>2]=0|He.__str155,Se[ei+68>>2]=0|He.__str155,Se[ei+76>>2]=0|He.__str156,Se[ei+88>>2]=0|He.__str157,Se[ei+96>>2]=0|He.__str158,Se[ei+104>>2]=0|He.__str156,Se[ei+116>>2]=0|He.__str159,Se[ei+124>>2]=0|He.__str160,Se[ei+132>>2]=0|He.__str161,Se[ei+144>>2]=0|He.__str162,Se[ei+152>>2]=0|He.__str163,Se[ei+160>>2]=0|He.__str164,Se[ei+172>>2]=0|He.__str165,Se[ei+180>>2]=0|He.__str166,Se[ei+188>>2]=0|He.__str167,Se[si+4>>2]=bi,Se[ni+4>>2]=ki,oi=_([2,0,0,0,0],["i8*",0,0,0,0],we),Se[bi>>2]=oi+8|0,Se[bi+4>>2]=0|He.__ZTSSt9bad_alloc,Se[bi+8>>2]=li,Se[ki>>2]=oi+8|0,Se[ki+4>>2]=0|He.__ZTSSt20bad_array_new_length,Se[ki+8>>2]=bi,ui=16,ci=6,hi=18,di=6,wi=6,pe=[0,0,Jr,0,va,0,ya,0,ga,0,wa,0,Sa,0,pa,0,Ea,0,ma,0],Module.FUNCTION_TABLE=pe,Module.run=ee,Module.preRun&&Module.preRun(),0==Ke){ee()}Module.postRun&&Module.postRun(),Module.___cxa_demangle=G;var pi=v("__cxa_demangle","string",["string","string","number","number"]);return function(r){return pi(r,"",1,0)}}();
`;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chromeTreeToNodes = void 0;

function treeToArray(root) {
  const nodes = [];

  function visit(node) {
    nodes.push({
      id: node.id,
      callFrame: {
        columnNumber: 0,
        functionName: node.functionName,
        lineNumber: node.lineNumber,
        scriptId: node.scriptId,
        url: node.url
      },
      hitCount: node.hitCount,
      children: node.children.map(child => child.id)
    });
    node.children.forEach(visit);
  }

  visit(root);
  return nodes;
}

function timestampsToDeltas(timestamps, startTime) {
  return timestamps.map((timestamp, index) => {
    const lastTimestamp = index === 0 ? startTime * 1000000 : timestamps[index - 1];
    return timestamp - lastTimestamp;
  });
}
/**
 * Convert the old tree-based format to the new flat-array based format
 */


function chromeTreeToNodes(content) {
  // Note that both startTime and endTime are now in microseconds
  return {
    samples: content.samples,
    startTime: content.startTime * 1000000,
    endTime: content.endTime * 1000000,
    nodes: treeToArray(content.head),
    timeDeltas: timestampsToDeltas(content.timestamps, content.startTime)
  };
}

exports.chromeTreeToNodes = chromeTreeToNodes;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Flamechart = void 0;

const utils_1 = __webpack_require__(0);

const math_1 = __webpack_require__(11);

class Flamechart {
  constructor(source) {
    this.source = source; // Bottom to top

    this.layers = [];
    this.totalWeight = 0;
    this.minFrameWidth = 1;
    const stack = [];

    const openFrame = (node, value) => {
      const parent = utils_1.lastOf(stack);
      const frame = {
        node,
        parent,
        children: [],
        start: value,
        end: value
      };

      if (parent) {
        parent.children.push(frame);
      }

      stack.push(frame);
    };

    this.minFrameWidth = Infinity;

    const closeFrame = (node, value) => {
      console.assert(stack.length > 0);
      const stackTop = stack.pop();
      stackTop.end = value;
      if (stackTop.end - stackTop.start === 0) return;
      const layerIndex = stack.length;

      while (this.layers.length <= layerIndex) this.layers.push([]);

      this.layers[layerIndex].push(stackTop);
      this.minFrameWidth = Math.min(this.minFrameWidth, stackTop.end - stackTop.start);
    };

    this.totalWeight = source.getTotalWeight();
    source.forEachCall(openFrame, closeFrame);
    if (!isFinite(this.minFrameWidth)) this.minFrameWidth = 1;
  }

  getTotalWeight() {
    return this.totalWeight;
  }

  getLayers() {
    return this.layers;
  }

  getColorBucketForFrame(frame) {
    return this.source.getColorBucketForFrame(frame);
  }

  getMinFrameWidth() {
    return this.minFrameWidth;
  }

  formatValue(v) {
    return this.source.formatValue(v);
  }

  getClampedViewportWidth(viewportWidth) {
    const maxWidth = this.getTotalWeight(); // In order to avoid floating point error, we cap the maximum zoom. In
    // particular, it's important that at the maximum zoom level, the total
    // trace size + a viewport width is not equal to the trace size due to
    // floating point rounding.
    //
    // For instance, if the profile's total weight is 2^60, and the viewport
    // size is 1, trying to move one viewport width right will result in no
    // change because 2^60 + 1 = 2^60 in floating point arithmetic. JavaScript
    // numbers are 64 bit floats, and therefore have 53 mantissa bits. You can
    // see this for yourself in the console. Try:
    //
    //   > Math.pow(2, 60) + 1 === Math.pow(2, 60)
    //   true
    //   > Math.pow(2, 53) + 1 === Math.pow(2, 53)
    //   true
    //   > Math.pow(2, 52) + 1 === Math.pow(2, 52)
    //   false
    //
    // We use 2^40 as a cap instead, since we want to be able to make small
    // adjustments within a viewport width.
    //
    // For reference, this will still allow you to zoom until 1 nanosecond fills
    // the screen in a profile with a duration of over 18 minutes.
    //
    //   > Math.pow(2, 40) / (60 * Math.pow(10, 9))
    //   18.325193796266667
    //

    const maxZoom = Math.pow(2, 40); // In addition to capping zoom to avoid floating point error, we further cap
    // zoom to avoid letting you zoom in so that the smallest element more than
    // fills the screen, since that probably isn't useful. The final zoom cap is
    // determined by the minimum zoom of either 2^40x zoom or the necessary zoom
    // for the smallest frame to fill the screen three times.

    const minWidth = math_1.clamp(3 * this.getMinFrameWidth(), maxWidth / maxZoom, maxWidth);
    return math_1.clamp(viewportWidth, minWidth, maxWidth);
  } // Given a desired config-space viewport rectangle, clamp the rectangle so
  // that it fits within the given flamechart. This prevents the viewport from
  // extending past the bounds of the flamechart or zooming in too far.


  getClampedConfigSpaceViewportRect({
    configSpaceViewportRect,
    renderInverted
  }) {
    const configSpaceSize = new math_1.Vec2(this.getTotalWeight(), this.getLayers().length);
    const width = this.getClampedViewportWidth(configSpaceViewportRect.size.x);
    const size = configSpaceViewportRect.size.withX(width);
    const origin = math_1.Vec2.clamp(configSpaceViewportRect.origin, new math_1.Vec2(0, renderInverted ? 0 : -1), math_1.Vec2.max(math_1.Vec2.zero, configSpaceSize.minus(size).plus(new math_1.Vec2(0, 1))));
    return new math_1.Rect(origin, configSpaceViewportRect.size.withX(width));
  }

}

exports.Flamechart = Flamechart;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Rect = exports.AffineTransform = exports.Vec2 = exports.clamp = void 0;

function clamp(x, minVal, maxVal) {
  if (x < minVal) return minVal;
  if (x > maxVal) return maxVal;
  return x;
}

exports.clamp = clamp;

let Vec2 =
/** @class */
(() => {
  class Vec2 {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    withX(x) {
      return new Vec2(x, this.y);
    }

    withY(y) {
      return new Vec2(this.x, y);
    }

    plus(other) {
      return new Vec2(this.x + other.x, this.y + other.y);
    }

    minus(other) {
      return new Vec2(this.x - other.x, this.y - other.y);
    }

    times(scalar) {
      return new Vec2(this.x * scalar, this.y * scalar);
    }

    timesPointwise(other) {
      return new Vec2(this.x * other.x, this.y * other.y);
    }

    dividedByPointwise(other) {
      return new Vec2(this.x / other.x, this.y / other.y);
    }

    dot(other) {
      return this.x * other.x + this.y * other.y;
    }

    equals(other) {
      return this.x === other.x && this.y === other.y;
    }

    approxEquals(other, epsilon = 1e-9) {
      return Math.abs(this.x - other.x) < epsilon && Math.abs(this.y - other.y) < epsilon;
    }

    length2() {
      return this.dot(this);
    }

    length() {
      return Math.sqrt(this.length2());
    }

    abs() {
      return new Vec2(Math.abs(this.x), Math.abs(this.y));
    }

    static min(a, b) {
      return new Vec2(Math.min(a.x, b.x), Math.min(a.y, b.y));
    }

    static max(a, b) {
      return new Vec2(Math.max(a.x, b.x), Math.max(a.y, b.y));
    }

    static clamp(v, min, max) {
      return new Vec2(clamp(v.x, min.x, max.x), clamp(v.y, min.y, max.y));
    }

    flatten() {
      return [this.x, this.y];
    }

  }

  Vec2.zero = new Vec2(0, 0);
  Vec2.unit = new Vec2(1, 1);
  return Vec2;
})();

exports.Vec2 = Vec2;

class AffineTransform {
  constructor(m00 = 1, m01 = 0, m02 = 0, m10 = 0, m11 = 1, m12 = 0) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
  }

  withScale(s) {
    let {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    m00 = s.x;
    m11 = s.y;
    return new AffineTransform(m00, m01, m02, m10, m11, m12);
  }

  static withScale(s) {
    return new AffineTransform().withScale(s);
  }

  scaledBy(s) {
    return AffineTransform.withScale(s).times(this);
  }

  getScale() {
    return new Vec2(this.m00, this.m11);
  }

  withTranslation(t) {
    let {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    m02 = t.x;
    m12 = t.y;
    return new AffineTransform(m00, m01, m02, m10, m11, m12);
  }

  static withTranslation(t) {
    return new AffineTransform().withTranslation(t);
  }

  getTranslation() {
    return new Vec2(this.m02, this.m12);
  }

  translatedBy(t) {
    return AffineTransform.withTranslation(t).times(this);
  }

  static betweenRects(from, to) {
    return AffineTransform.withTranslation(from.origin.times(-1)).scaledBy(new Vec2(to.size.x / from.size.x, to.size.y / from.size.y)).translatedBy(to.origin);
  }

  times(other) {
    const m00 = this.m00 * other.m00 + this.m01 * other.m10;
    const m01 = this.m00 * other.m01 + this.m01 * other.m11;
    const m02 = this.m00 * other.m02 + this.m01 * other.m12 + this.m02;
    const m10 = this.m10 * other.m00 + this.m11 * other.m10;
    const m11 = this.m10 * other.m01 + this.m11 * other.m11;
    const m12 = this.m10 * other.m02 + this.m11 * other.m12 + this.m12;
    return new AffineTransform(m00, m01, m02, m10, m11, m12);
  }

  equals(other) {
    return this.m00 == other.m00 && this.m01 == other.m01 && this.m02 == other.m02 && this.m10 == other.m10 && this.m11 == other.m11 && this.m12 == other.m12;
  }

  approxEquals(other, epsilon = 1e-9) {
    return Math.abs(this.m00 - other.m00) < epsilon && Math.abs(this.m01 - other.m01) < epsilon && Math.abs(this.m02 - other.m02) < epsilon && Math.abs(this.m10 - other.m10) < epsilon && Math.abs(this.m11 - other.m11) < epsilon && Math.abs(this.m12 - other.m12) < epsilon;
  }

  timesScalar(s) {
    const {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    return new AffineTransform(s * m00, s * m01, s * m02, s * m10, s * m11, s * m12);
  }

  det() {
    const {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    const m20 = 0;
    const m21 = 0;
    const m22 = 1;
    return m00 * (m11 * m22 - m12 * m21) - m01 * (m10 * m22 - m12 * m20) + m02 * (m10 * m21 - m11 * m20);
  }

  adj() {
    const {
      m00,
      m01,
      m02,
      m10,
      m11,
      m12
    } = this;
    const m20 = 0;
    const m21 = 0;
    const m22 = 1; // Adjugate matrix (a) is the transpose of the
    // cofactor matrix (c).
    //
    // 00 01 02
    // 10 11 12
    // 20 21 22

    const a00 =
    /* c00 = */
    +(m11 * m22 - m12 * m21);
    const a01 =
    /* c10 = */
    -(m01 * m22 - m02 * m21);
    const a02 =
    /* c20 = */
    +(m01 * m12 - m02 * m11);
    const a10 =
    /* c01 = */
    -(m10 * m22 - m12 * m20);
    const a11 =
    /* c11 = */
    +(m00 * m22 - m02 * m20);
    const a12 =
    /* c21 = */
    -(m00 * m12 - m02 * m10);
    return new AffineTransform(a00, a01, a02, a10, a11, a12);
  }

  inverted() {
    const det = this.det();
    if (det === 0) return null;
    const adj = this.adj();
    return adj.timesScalar(1 / det);
  }

  transformVector(v) {
    return new Vec2(v.x * this.m00 + v.y * this.m01, v.x * this.m10 + v.y * this.m11);
  }

  inverseTransformVector(v) {
    const inv = this.inverted();
    if (!inv) return null;
    return inv.transformVector(v);
  }

  transformPosition(v) {
    return new Vec2(v.x * this.m00 + v.y * this.m01 + this.m02, v.x * this.m10 + v.y * this.m11 + this.m12);
  }

  inverseTransformPosition(v) {
    const inv = this.inverted();
    if (!inv) return null;
    return inv.transformPosition(v);
  }

  transformRect(r) {
    const size = this.transformVector(r.size);
    const origin = this.transformPosition(r.origin);

    if (size.x < 0 && size.y < 0) {
      return new Rect(origin.plus(size), size.abs());
    } else if (size.x < 0) {
      return new Rect(origin.withX(origin.x + size.x), size.abs());
    } else if (size.y < 0) {
      return new Rect(origin.withY(origin.y + size.y), size.abs());
    }

    return new Rect(origin, size);
  }

  inverseTransformRect(r) {
    const inv = this.inverted();
    if (!inv) return null;
    return inv.transformRect(r);
  }

  flatten() {
    // Flatten into GLSL format
    // prettier-ignore
    return [this.m00, this.m10, 0, this.m01, this.m11, 0, this.m02, this.m12, 1];
  }

}

exports.AffineTransform = AffineTransform;

let Rect =
/** @class */
(() => {
  class Rect {
    constructor(origin, size) {
      this.origin = origin;
      this.size = size;
    }

    isEmpty() {
      return this.width() == 0 || this.height() == 0;
    }

    width() {
      return this.size.x;
    }

    height() {
      return this.size.y;
    }

    left() {
      return this.origin.x;
    }

    right() {
      return this.left() + this.width();
    }

    top() {
      return this.origin.y;
    }

    bottom() {
      return this.top() + this.height();
    }

    topLeft() {
      return this.origin;
    }

    topRight() {
      return this.origin.plus(new Vec2(this.width(), 0));
    }

    bottomRight() {
      return this.origin.plus(this.size);
    }

    bottomLeft() {
      return this.origin.plus(new Vec2(0, this.height()));
    }

    withOrigin(origin) {
      return new Rect(origin, this.size);
    }

    withSize(size) {
      return new Rect(this.origin, size);
    }

    closestPointTo(p) {
      return new Vec2(clamp(p.x, this.left(), this.right()), clamp(p.y, this.top(), this.bottom()));
    }

    distanceFrom(p) {
      return p.minus(this.closestPointTo(p)).length();
    }

    contains(p) {
      return this.distanceFrom(p) === 0;
    }

    hasIntersectionWith(other) {
      const top = Math.max(this.top(), other.top());
      const bottom = Math.max(top, Math.min(this.bottom(), other.bottom()));
      if (bottom - top === 0) return false;
      const left = Math.max(this.left(), other.left());
      const right = Math.max(left, Math.min(this.right(), other.right()));
      if (right - left === 0) return false;
      return true;
    }

    intersectWith(other) {
      const topLeft = Vec2.max(this.topLeft(), other.topLeft());
      const bottomRight = Vec2.max(topLeft, Vec2.min(this.bottomRight(), other.bottomRight()));
      return new Rect(topLeft, bottomRight.minus(topLeft));
    }

    equals(other) {
      return this.origin.equals(other.origin) && this.size.equals(other.size);
    }

    approxEquals(other) {
      return this.origin.approxEquals(other.origin) && this.size.approxEquals(other.size);
    }

    area() {
      return this.size.x * this.size.y;
    }

  }

  Rect.empty = new Rect(Vec2.zero, Vec2.zero);
  Rect.unit = new Rect(Vec2.zero, Vec2.unit);
  Rect.NDC = new Rect(new Vec2(-1, -1), new Vec2(2, 2));
  return Rect;
})();

exports.Rect = Rect;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
  'use strict'; // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

  /* istanbul ignore next */

  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(this, function () {
  'use strict';

  function _isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function _capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
  }

  function _getter(p) {
    return function () {
      return this[p];
    };
  }

  var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
  var numericProps = ['columnNumber', 'lineNumber'];
  var stringProps = ['fileName', 'functionName', 'source'];
  var arrayProps = ['args'];
  var props = booleanProps.concat(numericProps, stringProps, arrayProps);

  function StackFrame(obj) {
    if (!obj) return;

    for (var i = 0; i < props.length; i++) {
      if (obj[props[i]] !== undefined) {
        this['set' + _capitalize(props[i])](obj[props[i]]);
      }
    }
  }

  StackFrame.prototype = {
    getArgs: function () {
      return this.args;
    },
    setArgs: function (v) {
      if (Object.prototype.toString.call(v) !== '[object Array]') {
        throw new TypeError('Args must be an Array');
      }

      this.args = v;
    },
    getEvalOrigin: function () {
      return this.evalOrigin;
    },
    setEvalOrigin: function (v) {
      if (v instanceof StackFrame) {
        this.evalOrigin = v;
      } else if (v instanceof Object) {
        this.evalOrigin = new StackFrame(v);
      } else {
        throw new TypeError('Eval Origin must be an Object or StackFrame');
      }
    },
    toString: function () {
      var fileName = this.getFileName() || '';
      var lineNumber = this.getLineNumber() || '';
      var columnNumber = this.getColumnNumber() || '';
      var functionName = this.getFunctionName() || '';

      if (this.getIsEval()) {
        if (fileName) {
          return '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
        }

        return '[eval]:' + lineNumber + ':' + columnNumber;
      }

      if (functionName) {
        return functionName + ' (' + fileName + ':' + lineNumber + ':' + columnNumber + ')';
      }

      return fileName + ':' + lineNumber + ':' + columnNumber;
    }
  };

  StackFrame.fromString = function StackFrame$$fromString(str) {
    var argsStartIndex = str.indexOf('(');
    var argsEndIndex = str.lastIndexOf(')');
    var functionName = str.substring(0, argsStartIndex);
    var args = str.substring(argsStartIndex + 1, argsEndIndex).split(',');
    var locationString = str.substring(argsEndIndex + 1);

    if (locationString.indexOf('@') === 0) {
      var parts = /@(.+?)(?::(\d+))?(?::(\d+))?$/.exec(locationString, '');
      var fileName = parts[1];
      var lineNumber = parts[2];
      var columnNumber = parts[3];
    }

    return new StackFrame({
      functionName: functionName,
      args: args || undefined,
      fileName: fileName,
      lineNumber: lineNumber || undefined,
      columnNumber: columnNumber || undefined
    });
  };

  for (var i = 0; i < booleanProps.length; i++) {
    StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);

    StackFrame.prototype['set' + _capitalize(booleanProps[i])] = function (p) {
      return function (v) {
        this[p] = Boolean(v);
      };
    }(booleanProps[i]);
  }

  for (var j = 0; j < numericProps.length; j++) {
    StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);

    StackFrame.prototype['set' + _capitalize(numericProps[j])] = function (p) {
      return function (v) {
        if (!_isNumber(v)) {
          throw new TypeError(p + ' must be a Number');
        }

        this[p] = Number(v);
      };
    }(numericProps[j]);
  }

  for (var k = 0; k < stringProps.length; k++) {
    StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);

    StackFrame.prototype['set' + _capitalize(stringProps[k])] = function (p) {
      return function (v) {
        this[p] = String(v);
      };
    }(stringProps[k]);
  }

  return StackFrame;
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "importFile", function() { return /* binding */ importFile_worker_importFile; });

// EXTERNAL MODULE: ../react-devtools-scheduling-profiler/node_modules/regenerator-runtime/runtime.js
var runtime = __webpack_require__(5);

// EXTERNAL MODULE: /Users/jstejada/code/jstejada-react/node_modules/@elg/speedscope/dist/library/library.js
var library = __webpack_require__(1);

// CONCATENATED MODULE: ../react-devtools-shared/src/constants.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
const CHROME_WEBSTORE_EXTENSION_ID = 'fmkadmapgofadopljbjfkapdkoienihi';
const INTERNAL_EXTENSION_ID = 'dnjnjgbfilfphmojnmhliehogmojhclc';
const LOCAL_EXTENSION_ID = 'ikiahnapldjmdmpkmfhjdjilojjhgcbf'; // Flip this flag to true to enable verbose console debug logging.

const __DEBUG__ = false; // Flip this flag to true to enable performance.mark() and performance.measure() timings.

const __PERFORMANCE_PROFILE__ = false;
const TREE_OPERATION_ADD = 1;
const TREE_OPERATION_REMOVE = 2;
const TREE_OPERATION_REORDER_CHILDREN = 3;
const TREE_OPERATION_UPDATE_TREE_BASE_DURATION = 4;
const TREE_OPERATION_UPDATE_ERRORS_OR_WARNINGS = 5;
const TREE_OPERATION_REMOVE_ROOT = 6;
const LOCAL_STORAGE_DEFAULT_TAB_KEY = 'React::DevTools::defaultTab';
const LOCAL_STORAGE_FILTER_PREFERENCES_KEY = 'React::DevTools::componentFilters';
const SESSION_STORAGE_LAST_SELECTION_KEY = 'React::DevTools::lastSelection';
const LOCAL_STORAGE_PARSE_HOOK_NAMES_KEY = 'React::DevTools::parseHookNames';
const SESSION_STORAGE_RECORD_CHANGE_DESCRIPTIONS_KEY = 'React::DevTools::recordChangeDescriptions';
const SESSION_STORAGE_RELOAD_AND_PROFILE_KEY = 'React::DevTools::reloadAndProfile';
const LOCAL_STORAGE_SHOULD_BREAK_ON_CONSOLE_ERRORS = 'React::DevTools::breakOnConsoleErrors';
const LOCAL_STORAGE_SHOULD_PATCH_CONSOLE_KEY = 'React::DevTools::appendComponentStack';
const LOCAL_STORAGE_SHOW_INLINE_WARNINGS_AND_ERRORS_KEY = 'React::DevTools::showInlineWarningsAndErrors';
const LOCAL_STORAGE_TRACE_UPDATES_ENABLED_KEY = 'React::DevTools::traceUpdatesEnabled';
const LOCAL_STORAGE_HIDE_CONSOLE_LOGS_IN_STRICT_MODE = 'React::DevTools::hideConsoleLogsInStrictMode';
const PROFILER_EXPORT_VERSION = 5;
const CHANGE_LOG_URL = 'https://github.com/facebook/react/blob/main/packages/react-devtools/CHANGELOG.md';
const UNSUPPORTED_VERSION_URL = 'https://reactjs.org/blog/2019/08/15/new-react-devtools.html#how-do-i-get-the-old-version-back';
const REACT_DEVTOOLS_WORKPLACE_URL = 'https://fburl.com/react-devtools-workplace-group';
const THEME_STYLES = {
  light: {
    '--color-attribute-name': '#ef6632',
    '--color-attribute-name-not-editable': '#23272f',
    '--color-attribute-name-inverted': 'rgba(255, 255, 255, 0.7)',
    '--color-attribute-value': '#1a1aa6',
    '--color-attribute-value-inverted': '#ffffff',
    '--color-attribute-editable-value': '#1a1aa6',
    '--color-background': '#ffffff',
    '--color-background-hover': 'rgba(0, 136, 250, 0.1)',
    '--color-background-inactive': '#e5e5e5',
    '--color-background-invalid': '#fff0f0',
    '--color-background-selected': '#0088fa',
    '--color-button-background': '#ffffff',
    '--color-button-background-focus': '#ededed',
    '--color-button': '#5f6673',
    '--color-button-disabled': '#cfd1d5',
    '--color-button-active': '#0088fa',
    '--color-button-focus': '#23272f',
    '--color-button-hover': '#23272f',
    '--color-border': '#eeeeee',
    '--color-commit-did-not-render-fill': '#cfd1d5',
    '--color-commit-did-not-render-fill-text': '#000000',
    '--color-commit-did-not-render-pattern': '#cfd1d5',
    '--color-commit-did-not-render-pattern-text': '#333333',
    '--color-commit-gradient-0': '#37afa9',
    '--color-commit-gradient-1': '#63b19e',
    '--color-commit-gradient-2': '#80b393',
    '--color-commit-gradient-3': '#97b488',
    '--color-commit-gradient-4': '#abb67d',
    '--color-commit-gradient-5': '#beb771',
    '--color-commit-gradient-6': '#cfb965',
    '--color-commit-gradient-7': '#dfba57',
    '--color-commit-gradient-8': '#efbb49',
    '--color-commit-gradient-9': '#febc38',
    '--color-commit-gradient-text': '#000000',
    '--color-component-name': '#6a51b2',
    '--color-component-name-inverted': '#ffffff',
    '--color-component-badge-background': 'rgba(0, 0, 0, 0.1)',
    '--color-component-badge-background-inverted': 'rgba(255, 255, 255, 0.25)',
    '--color-component-badge-count': '#777d88',
    '--color-component-badge-count-inverted': 'rgba(255, 255, 255, 0.7)',
    '--color-console-error-badge-text': '#ffffff',
    '--color-console-error-background': '#fff0f0',
    '--color-console-error-border': '#ffd6d6',
    '--color-console-error-icon': '#eb3941',
    '--color-console-error-text': '#fe2e31',
    '--color-console-warning-badge-text': '#000000',
    '--color-console-warning-background': '#fffbe5',
    '--color-console-warning-border': '#fff5c1',
    '--color-console-warning-icon': '#f4bd00',
    '--color-console-warning-text': '#64460c',
    '--color-context-background': 'rgba(0,0,0,.9)',
    '--color-context-background-hover': 'rgba(255, 255, 255, 0.1)',
    '--color-context-background-selected': '#178fb9',
    '--color-context-border': '#3d424a',
    '--color-context-text': '#ffffff',
    '--color-context-text-selected': '#ffffff',
    '--color-dim': '#777d88',
    '--color-dimmer': '#cfd1d5',
    '--color-dimmest': '#eff0f1',
    '--color-error-background': 'hsl(0, 100%, 97%)',
    '--color-error-border': 'hsl(0, 100%, 92%)',
    '--color-error-text': '#ff0000',
    '--color-expand-collapse-toggle': '#777d88',
    '--color-link': '#0000ff',
    '--color-modal-background': 'rgba(255, 255, 255, 0.75)',
    '--color-bridge-version-npm-background': '#eff0f1',
    '--color-bridge-version-npm-text': '#000000',
    '--color-bridge-version-number': '#0088fa',
    '--color-primitive-hook-badge-background': '#e5e5e5',
    '--color-primitive-hook-badge-text': '#5f6673',
    '--color-record-active': '#fc3a4b',
    '--color-record-hover': '#3578e5',
    '--color-record-inactive': '#0088fa',
    '--color-resize-bar': '#eeeeee',
    '--color-resize-bar-active': '#dcdcdc',
    '--color-resize-bar-border': '#d1d1d1',
    '--color-resize-bar-dot': '#333333',
    '--color-scheduling-profiler-internal-module': '#d1d1d1',
    '--color-scheduling-profiler-internal-module-hover': '#c9c9c9',
    '--color-scheduling-profiler-internal-module-text': '#444',
    '--color-scheduling-profiler-native-event': '#ccc',
    '--color-scheduling-profiler-native-event-hover': '#aaa',
    '--color-scheduling-profiler-network-primary': '#fcf3dc',
    '--color-scheduling-profiler-network-primary-hover': '#f0e7d1',
    '--color-scheduling-profiler-network-secondary': '#efc457',
    '--color-scheduling-profiler-network-secondary-hover': '#e3ba52',
    '--color-scheduling-profiler-priority-background': '#f6f6f6',
    '--color-scheduling-profiler-priority-border': '#eeeeee',
    '--color-scheduling-profiler-user-timing': '#c9cacd',
    '--color-scheduling-profiler-user-timing-hover': '#93959a',
    '--color-scheduling-profiler-react-idle': '#d3e5f6',
    '--color-scheduling-profiler-react-idle-hover': '#c3d9ef',
    '--color-scheduling-profiler-react-render': '#9fc3f3',
    '--color-scheduling-profiler-react-render-hover': '#83afe9',
    '--color-scheduling-profiler-react-render-text': '#11365e',
    '--color-scheduling-profiler-react-commit': '#c88ff0',
    '--color-scheduling-profiler-react-commit-hover': '#b281d6',
    '--color-scheduling-profiler-react-commit-text': '#3e2c4a',
    '--color-scheduling-profiler-react-layout-effects': '#b281d6',
    '--color-scheduling-profiler-react-layout-effects-hover': '#9d71bd',
    '--color-scheduling-profiler-react-layout-effects-text': '#3e2c4a',
    '--color-scheduling-profiler-react-passive-effects': '#b281d6',
    '--color-scheduling-profiler-react-passive-effects-hover': '#9d71bd',
    '--color-scheduling-profiler-react-passive-effects-text': '#3e2c4a',
    '--color-scheduling-profiler-react-schedule': '#9fc3f3',
    '--color-scheduling-profiler-react-schedule-hover': '#2683E2',
    '--color-scheduling-profiler-react-suspense-rejected': '#f1cc14',
    '--color-scheduling-profiler-react-suspense-rejected-hover': '#ffdf37',
    '--color-scheduling-profiler-react-suspense-resolved': '#a6e59f',
    '--color-scheduling-profiler-react-suspense-resolved-hover': '#89d281',
    '--color-scheduling-profiler-react-suspense-unresolved': '#c9cacd',
    '--color-scheduling-profiler-react-suspense-unresolved-hover': '#93959a',
    '--color-scheduling-profiler-thrown-error': '#ee1638',
    '--color-scheduling-profiler-thrown-error-hover': '#da1030',
    '--color-scheduling-profiler-text-color': '#000000',
    '--color-scheduling-profiler-text-dim-color': '#ccc',
    '--color-scheduling-profiler-react-work-border': '#eeeeee',
    '--color-search-match': 'yellow',
    '--color-search-match-current': '#f7923b',
    '--color-selected-tree-highlight-active': 'rgba(0, 136, 250, 0.1)',
    '--color-selected-tree-highlight-inactive': 'rgba(0, 0, 0, 0.05)',
    '--color-scroll-caret': 'rgba(150, 150, 150, 0.5)',
    '--color-tab-selected-border': '#0088fa',
    '--color-text': '#000000',
    '--color-text-invalid': '#ff0000',
    '--color-text-selected': '#ffffff',
    '--color-toggle-background-invalid': '#fc3a4b',
    '--color-toggle-background-on': '#0088fa',
    '--color-toggle-background-off': '#cfd1d5',
    '--color-toggle-text': '#ffffff',
    '--color-warning-background': '#fb3655',
    '--color-warning-background-hover': '#f82042',
    '--color-warning-text-color': '#ffffff',
    '--color-warning-text-color-inverted': '#fd4d69',
    // The styles below should be kept in sync with 'root.css'
    // They are repeated there because they're used by e.g. tooltips or context menus
    // which get rendered outside of the DOM subtree (where normal theme/styles are written).
    '--color-scroll-thumb': '#c2c2c2',
    '--color-scroll-track': '#fafafa',
    '--color-tooltip-background': 'rgba(0, 0, 0, 0.9)',
    '--color-tooltip-text': '#ffffff'
  },
  dark: {
    '--color-attribute-name': '#9d87d2',
    '--color-attribute-name-not-editable': '#ededed',
    '--color-attribute-name-inverted': '#282828',
    '--color-attribute-value': '#cedae0',
    '--color-attribute-value-inverted': '#ffffff',
    '--color-attribute-editable-value': 'yellow',
    '--color-background': '#282c34',
    '--color-background-hover': 'rgba(255, 255, 255, 0.1)',
    '--color-background-inactive': '#3d424a',
    '--color-background-invalid': '#5c0000',
    '--color-background-selected': '#178fb9',
    '--color-button-background': '#282c34',
    '--color-button-background-focus': '#3d424a',
    '--color-button': '#afb3b9',
    '--color-button-active': '#61dafb',
    '--color-button-disabled': '#4f5766',
    '--color-button-focus': '#a2e9fc',
    '--color-button-hover': '#ededed',
    '--color-border': '#3d424a',
    '--color-commit-did-not-render-fill': '#777d88',
    '--color-commit-did-not-render-fill-text': '#000000',
    '--color-commit-did-not-render-pattern': '#666c77',
    '--color-commit-did-not-render-pattern-text': '#ffffff',
    '--color-commit-gradient-0': '#37afa9',
    '--color-commit-gradient-1': '#63b19e',
    '--color-commit-gradient-2': '#80b393',
    '--color-commit-gradient-3': '#97b488',
    '--color-commit-gradient-4': '#abb67d',
    '--color-commit-gradient-5': '#beb771',
    '--color-commit-gradient-6': '#cfb965',
    '--color-commit-gradient-7': '#dfba57',
    '--color-commit-gradient-8': '#efbb49',
    '--color-commit-gradient-9': '#febc38',
    '--color-commit-gradient-text': '#000000',
    '--color-component-name': '#61dafb',
    '--color-component-name-inverted': '#282828',
    '--color-component-badge-background': 'rgba(255, 255, 255, 0.25)',
    '--color-component-badge-background-inverted': 'rgba(0, 0, 0, 0.25)',
    '--color-component-badge-count': '#8f949d',
    '--color-component-badge-count-inverted': 'rgba(255, 255, 255, 0.7)',
    '--color-console-error-badge-text': '#000000',
    '--color-console-error-background': '#290000',
    '--color-console-error-border': '#5c0000',
    '--color-console-error-icon': '#eb3941',
    '--color-console-error-text': '#fc7f7f',
    '--color-console-warning-badge-text': '#000000',
    '--color-console-warning-background': '#332b00',
    '--color-console-warning-border': '#665500',
    '--color-console-warning-icon': '#f4bd00',
    '--color-console-warning-text': '#f5f2ed',
    '--color-context-background': 'rgba(255,255,255,.95)',
    '--color-context-background-hover': 'rgba(0, 136, 250, 0.1)',
    '--color-context-background-selected': '#0088fa',
    '--color-context-border': '#eeeeee',
    '--color-context-text': '#000000',
    '--color-context-text-selected': '#ffffff',
    '--color-dim': '#8f949d',
    '--color-dimmer': '#777d88',
    '--color-dimmest': '#4f5766',
    '--color-error-background': '#200',
    '--color-error-border': '#900',
    '--color-error-text': '#f55',
    '--color-expand-collapse-toggle': '#8f949d',
    '--color-link': '#61dafb',
    '--color-modal-background': 'rgba(0, 0, 0, 0.75)',
    '--color-bridge-version-npm-background': 'rgba(0, 0, 0, 0.25)',
    '--color-bridge-version-npm-text': '#ffffff',
    '--color-bridge-version-number': 'yellow',
    '--color-primitive-hook-badge-background': 'rgba(0, 0, 0, 0.25)',
    '--color-primitive-hook-badge-text': 'rgba(255, 255, 255, 0.7)',
    '--color-record-active': '#fc3a4b',
    '--color-record-hover': '#a2e9fc',
    '--color-record-inactive': '#61dafb',
    '--color-resize-bar': '#282c34',
    '--color-resize-bar-active': '#31363f',
    '--color-resize-bar-border': '#3d424a',
    '--color-resize-bar-dot': '#cfd1d5',
    '--color-scheduling-profiler-internal-module': '#303542',
    '--color-scheduling-profiler-internal-module-hover': '#363b4a',
    '--color-scheduling-profiler-internal-module-text': '#7f8899',
    '--color-scheduling-profiler-native-event': '#b2b2b2',
    '--color-scheduling-profiler-native-event-hover': '#949494',
    '--color-scheduling-profiler-network-primary': '#fcf3dc',
    '--color-scheduling-profiler-network-primary-hover': '#e3dbc5',
    '--color-scheduling-profiler-network-secondary': '#efc457',
    '--color-scheduling-profiler-network-secondary-hover': '#d6af4d',
    '--color-scheduling-profiler-priority-background': '#1d2129',
    '--color-scheduling-profiler-priority-border': '#282c34',
    '--color-scheduling-profiler-user-timing': '#c9cacd',
    '--color-scheduling-profiler-user-timing-hover': '#93959a',
    '--color-scheduling-profiler-react-idle': '#3d485b',
    '--color-scheduling-profiler-react-idle-hover': '#465269',
    '--color-scheduling-profiler-react-render': '#2683E2',
    '--color-scheduling-profiler-react-render-hover': '#1a76d4',
    '--color-scheduling-profiler-react-render-text': '#11365e',
    '--color-scheduling-profiler-react-commit': '#731fad',
    '--color-scheduling-profiler-react-commit-hover': '#611b94',
    '--color-scheduling-profiler-react-commit-text': '#e5c1ff',
    '--color-scheduling-profiler-react-layout-effects': '#611b94',
    '--color-scheduling-profiler-react-layout-effects-hover': '#51167a',
    '--color-scheduling-profiler-react-layout-effects-text': '#e5c1ff',
    '--color-scheduling-profiler-react-passive-effects': '#611b94',
    '--color-scheduling-profiler-react-passive-effects-hover': '#51167a',
    '--color-scheduling-profiler-react-passive-effects-text': '#e5c1ff',
    '--color-scheduling-profiler-react-schedule': '#2683E2',
    '--color-scheduling-profiler-react-schedule-hover': '#1a76d4',
    '--color-scheduling-profiler-react-suspense-rejected': '#f1cc14',
    '--color-scheduling-profiler-react-suspense-rejected-hover': '#e4c00f',
    '--color-scheduling-profiler-react-suspense-resolved': '#a6e59f',
    '--color-scheduling-profiler-react-suspense-resolved-hover': '#89d281',
    '--color-scheduling-profiler-react-suspense-unresolved': '#c9cacd',
    '--color-scheduling-profiler-react-suspense-unresolved-hover': '#93959a',
    '--color-scheduling-profiler-thrown-error': '#fb3655',
    '--color-scheduling-profiler-thrown-error-hover': '#f82042',
    '--color-scheduling-profiler-text-color': '#282c34',
    '--color-scheduling-profiler-text-dim-color': '#555b66',
    '--color-scheduling-profiler-react-work-border': '#3d424a',
    '--color-search-match': 'yellow',
    '--color-search-match-current': '#f7923b',
    '--color-selected-tree-highlight-active': 'rgba(23, 143, 185, 0.15)',
    '--color-selected-tree-highlight-inactive': 'rgba(255, 255, 255, 0.05)',
    '--color-scroll-caret': '#4f5766',
    '--color-shadow': 'rgba(0, 0, 0, 0.5)',
    '--color-tab-selected-border': '#178fb9',
    '--color-text': '#ffffff',
    '--color-text-invalid': '#ff8080',
    '--color-text-selected': '#ffffff',
    '--color-toggle-background-invalid': '#fc3a4b',
    '--color-toggle-background-on': '#178fb9',
    '--color-toggle-background-off': '#777d88',
    '--color-toggle-text': '#ffffff',
    '--color-warning-background': '#ee1638',
    '--color-warning-background-hover': '#da1030',
    '--color-warning-text-color': '#ffffff',
    '--color-warning-text-color-inverted': '#ee1638',
    // The styles below should be kept in sync with 'root.css'
    // They are repeated there because they're used by e.g. tooltips or context menus
    // which get rendered outside of the DOM subtree (where normal theme/styles are written).
    '--color-scroll-thumb': '#afb3b9',
    '--color-scroll-track': '#313640',
    '--color-tooltip-background': 'rgba(255, 255, 255, 0.95)',
    '--color-tooltip-text': '#000000'
  },
  compact: {
    '--font-size-monospace-small': '9px',
    '--font-size-monospace-normal': '11px',
    '--font-size-monospace-large': '15px',
    '--font-size-sans-small': '10px',
    '--font-size-sans-normal': '12px',
    '--font-size-sans-large': '14px',
    '--line-height-data': '18px'
  },
  comfortable: {
    '--font-size-monospace-small': '10px',
    '--font-size-monospace-normal': '13px',
    '--font-size-monospace-large': '17px',
    '--font-size-sans-small': '12px',
    '--font-size-sans-normal': '14px',
    '--font-size-sans-large': '16px',
    '--line-height-data': '22px'
  }
}; // HACK
//
// Sometimes the inline target is rendered before root styles are applied,
// which would result in e.g. NaN itemSize being passed to react-window list.

const COMFORTABLE_LINE_HEIGHT = parseInt(THEME_STYLES.comfortable['--line-height-data'], 10);
const COMPACT_LINE_HEIGHT = parseInt(THEME_STYLES.compact['--line-height-data'], 10);

// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/src/constants.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

const REACT_TOTAL_NUM_LANES = 31; // Increment this number any time a backwards breaking change is made to the profiler metadata.

const SCHEDULING_PROFILER_VERSION = 1;
// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/src/import-worker/InvalidProfileError.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */

/**
 * An error thrown when an invalid profile could not be processed.
 */
class InvalidProfileError extends Error {}
// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/node_modules/memoize-one/dist/memoize-one.esm.js
function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }

  for (var i = 0; i < newInputs.length; i++) {
    if (newInputs[i] !== lastInputs[i]) {
      return false;
    }
  }

  return true;
}

function memoizeOne(resultFn, isEqual) {
  if (isEqual === void 0) {
    isEqual = areInputsEqual;
  }

  var lastThis;
  var lastArgs = [];
  var lastResult;
  var calledOnce = false;

  function memoized() {
    var newArgs = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      newArgs[_i] = arguments[_i];
    }

    if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
      return lastResult;
    }

    lastResult = resultFn.apply(this, newArgs);
    calledOnce = true;
    lastThis = this;
    lastArgs = newArgs;
    return lastResult;
  }

  return memoized;
}

/* harmony default export */ var memoize_one_esm = (memoizeOne);
// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/src/utils/getBatchRange.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */


function unmemoizedGetBatchRange(batchUID, data, minStartTime = 0) {
  const measures = data.batchUIDToMeasuresMap.get(batchUID);

  if (measures == null || measures.length === 0) {
    throw Error(`Could not find measures with batch UID "${batchUID}"`);
  }

  const lastMeasure = measures[measures.length - 1];
  const stopTime = lastMeasure.timestamp + lastMeasure.duration;

  if (stopTime < minStartTime) {
    return [0, 0];
  }

  let startTime = minStartTime;

  for (let index = 0; index < measures.length; index++) {
    const measure = measures[index];

    if (measure.timestamp >= minStartTime) {
      startTime = measure.timestamp;
      break;
    }
  }

  return [startTime, stopTime];
}

const getBatchRange = memoize_one_esm(unmemoizedGetBatchRange);
// EXTERNAL MODULE: /Users/jstejada/code/jstejada-react/node_modules/error-stack-parser/error-stack-parser.js
var error_stack_parser = __webpack_require__(3);
var error_stack_parser_default = /*#__PURE__*/__webpack_require__.n(error_stack_parser);

// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/src/import-worker/preprocessData.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */





const NATIVE_EVENT_DURATION_THRESHOLD = 20;
const NESTED_UPDATE_DURATION_THRESHOLD = 20;
const WARNING_STRINGS = {
  LONG_EVENT_HANDLER: 'An event handler scheduled a big update with React. Consider using the Transition API to defer some of this work.',
  NESTED_UPDATE: 'A big nested update was scheduled during layout. ' + 'Nested updates require React to re-render synchronously before the browser can paint. ' + 'Consider delaying this update by moving it to a passive effect (useEffect).',
  SUSPEND_DURING_UPDATE: 'A component suspended during an update which caused a fallback to be shown. ' + "Consider using the Transition API to avoid hiding components after they've been mounted."
}; // Exported for tests

function getLanesFromTransportDecimalBitmask(laneBitmaskString) {
  const laneBitmask = parseInt(laneBitmaskString, 10); // As negative numbers are stored in two's complement format, our bitmask
  // checks will be thrown off by them.

  if (laneBitmask < 0) {
    return [];
  }

  const lanes = [];
  let powersOfTwo = 0;

  while (powersOfTwo <= REACT_TOTAL_NUM_LANES) {
    if (1 << powersOfTwo & laneBitmask) {
      lanes.push(powersOfTwo);
    }

    powersOfTwo++;
  }

  return lanes;
}

function updateLaneToLabelMap(profilerData, laneLabelTuplesString) {
  // These marks appear multiple times in the data;
  // We only need to extact them once.
  if (profilerData.laneToLabelMap.size === 0) {
    const laneLabelTuples = laneLabelTuplesString.split(',');

    for (let laneIndex = 0; laneIndex < laneLabelTuples.length; laneIndex++) {
      // The numeric lane value (e.g. 64) isn't important.
      // The profiler parses and stores the lane's position within the bitmap,
      // (e.g. lane 1 is index 0, lane 16 is index 4).
      profilerData.laneToLabelMap.set(laneIndex, laneLabelTuples[laneIndex]);
    }
  }
}

let profilerVersion = null;

function getLastType(stack) {
  if (stack.length > 0) {
    const {
      type
    } = stack[stack.length - 1];
    return type;
  }

  return null;
}

function getDepth(stack) {
  if (stack.length > 0) {
    const {
      depth,
      type
    } = stack[stack.length - 1];
    return type === 'render-idle' ? depth : depth + 1;
  }

  return 0;
}

function markWorkStarted(type, startTime, lanes, currentProfilerData, state) {
  const {
    batchUID,
    measureStack
  } = state;
  const depth = getDepth(measureStack);
  const measure = {
    type,
    batchUID,
    depth,
    lanes,
    timestamp: startTime,
    duration: 0
  };
  state.measureStack.push({
    depth,
    measure,
    startTime,
    type
  }); // This array is pre-initialized when the batchUID is generated.

  const measures = currentProfilerData.batchUIDToMeasuresMap.get(batchUID);

  if (measures != null) {
    measures.push(measure);
  } else {
    currentProfilerData.batchUIDToMeasuresMap.set(state.batchUID, [measure]);
  } // This array is pre-initialized before processing starts.


  lanes.forEach(lane => {
    currentProfilerData.laneToReactMeasureMap.get(lane).push(measure);
  });
}

function markWorkCompleted(type, stopTime, currentProfilerData, stack) {
  if (stack.length === 0) {
    console.error('Unexpected type "%s" completed at %sms while stack is empty.', type, stopTime); // Ignore work "completion" user timing mark that doesn't complete anything

    return;
  }

  const last = stack[stack.length - 1];

  if (last.type !== type) {
    console.error('Unexpected type "%s" completed at %sms before "%s" completed.', type, stopTime, last.type);
  }

  const {
    measure,
    startTime
  } = stack.pop();

  if (!measure) {
    console.error('Could not find matching measure for type "%s".', type);
  } // $FlowFixMe This property should not be writable outside of this function.


  measure.duration = stopTime - startTime;
}

function throwIfIncomplete(type, stack) {
  const lastIndex = stack.length - 1;

  if (lastIndex >= 0) {
    const last = stack[lastIndex];

    if (last.stopTime === undefined && last.type === type) {
      throw new InvalidProfileError(`Unexpected type "${type}" started before "${last.type}" completed.`);
    }
  }
}

function processEventDispatch(event, timestamp, profilerData, state) {
  const data = event.args.data;
  const type = data.type;

  if (type.startsWith('react-')) {
    const stackTrace = data.stackTrace;

    if (stackTrace) {
      const topFrame = stackTrace[stackTrace.length - 1];

      if (topFrame.url.includes('/react-dom.')) {
        // Filter out fake React events dispatched by invokeGuardedCallbackDev.
        return;
      }
    }
  } // Reduce noise from events like DOMActivate, load/unload, etc. which are usually not relevant


  if (type === 'blur' || type === 'click' || type === 'input' || type.startsWith('focus') || type.startsWith('key') || type.startsWith('mouse') || type.startsWith('pointer')) {
    const duration = event.dur / 1000;
    let depth = 0;

    while (state.nativeEventStack.length > 0) {
      const prevNativeEvent = state.nativeEventStack[state.nativeEventStack.length - 1];
      const prevStopTime = prevNativeEvent.timestamp + prevNativeEvent.duration;

      if (timestamp < prevStopTime) {
        depth = prevNativeEvent.depth + 1;
        break;
      } else {
        state.nativeEventStack.pop();
      }
    }

    const nativeEvent = {
      depth,
      duration,
      timestamp,
      type,
      warning: null
    };
    profilerData.nativeEvents.push(nativeEvent); // Keep track of curent event in case future ones overlap.
    // We separate them into different vertical lanes in this case.

    state.nativeEventStack.push(nativeEvent);
  }
}

function processResourceFinish(event, timestamp, profilerData, state) {
  const requestId = event.args.data.requestId;
  const networkMeasure = state.requestIdToNetworkMeasureMap.get(requestId);

  if (networkMeasure != null) {
    networkMeasure.finishTimestamp = timestamp;

    if (networkMeasure.firstReceivedDataTimestamp === 0) {
      networkMeasure.firstReceivedDataTimestamp = timestamp;
    }

    if (networkMeasure.lastReceivedDataTimestamp === 0) {
      networkMeasure.lastReceivedDataTimestamp = timestamp;
    } // Clean up now that the resource is done.


    state.requestIdToNetworkMeasureMap.delete(event.args.data.requestId);
  }
}

function processResourceReceivedData(event, timestamp, profilerData, state) {
  const requestId = event.args.data.requestId;
  const networkMeasure = state.requestIdToNetworkMeasureMap.get(requestId);

  if (networkMeasure != null) {
    if (networkMeasure.firstReceivedDataTimestamp === 0) {
      networkMeasure.firstReceivedDataTimestamp = timestamp;
    }

    networkMeasure.lastReceivedDataTimestamp = timestamp;
    networkMeasure.finishTimestamp = timestamp;
  }
}

function processResourceReceiveResponse(event, timestamp, profilerData, state) {
  const requestId = event.args.data.requestId;
  const networkMeasure = state.requestIdToNetworkMeasureMap.get(requestId);

  if (networkMeasure != null) {
    networkMeasure.receiveResponseTimestamp = timestamp;
  }
}

function processScreenshot(event, timestamp, profilerData, state) {
  const encodedSnapshot = event.args.snapshot; // Base 64 encoded

  const snapshot = {
    height: 0,
    image: null,
    imageSource: `data:image/png;base64,${encodedSnapshot}`,
    timestamp,
    width: 0
  }; // Delay processing until we've extracted snapshot dimensions.

  let resolveFn = null;
  state.asyncProcessingPromises.push(new Promise(resolve => {
    resolveFn = resolve;
  })); // Parse the Base64 image data to determine native size.
  // This will be used later to scale for display within the thumbnail strip.

  fetch(snapshot.imageSource).then(response => response.blob()).then(blob => {
    // $FlowFixMe createImageBitmap
    createImageBitmap(blob).then(bitmap => {
      snapshot.height = bitmap.height;
      snapshot.width = bitmap.width;
      resolveFn();
    });
  });
  profilerData.snapshots.push(snapshot);
}

function processResourceSendRequest(event, timestamp, profilerData, state) {
  const data = event.args.data;
  const requestId = data.requestId;
  const availableDepths = new Array(state.requestIdToNetworkMeasureMap.size + 1).fill(true);
  state.requestIdToNetworkMeasureMap.forEach(({
    depth
  }) => {
    availableDepths[depth] = false;
  });
  let depth = 0;

  for (let i = 0; i < availableDepths.length; i++) {
    if (availableDepths[i]) {
      depth = i;
      break;
    }
  }

  const networkMeasure = {
    depth,
    finishTimestamp: 0,
    firstReceivedDataTimestamp: 0,
    lastReceivedDataTimestamp: 0,
    requestId,
    requestMethod: data.requestMethod,
    priority: data.priority,
    sendRequestTimestamp: timestamp,
    receiveResponseTimestamp: 0,
    url: data.url
  };
  state.requestIdToNetworkMeasureMap.set(requestId, networkMeasure);
  profilerData.networkMeasures.push(networkMeasure);
  networkMeasure.sendRequestTimestamp = timestamp;
}

function processTimelineEvent(event,
/** Finalized profiler data up to `event`. May be mutated. */
currentProfilerData,
/** Intermediate processor state. May be mutated. */
state) {
  const {
    cat,
    name,
    ts,
    ph
  } = event;
  const startTime = (ts - currentProfilerData.startTime) / 1000;

  switch (cat) {
    case 'disabled-by-default-devtools.screenshot':
      processScreenshot(event, startTime, currentProfilerData, state);
      break;

    case 'devtools.timeline':
      switch (name) {
        case 'EventDispatch':
          processEventDispatch(event, startTime, currentProfilerData, state);
          break;

        case 'ResourceFinish':
          processResourceFinish(event, startTime, currentProfilerData, state);
          break;

        case 'ResourceReceivedData':
          processResourceReceivedData(event, startTime, currentProfilerData, state);
          break;

        case 'ResourceReceiveResponse':
          processResourceReceiveResponse(event, startTime, currentProfilerData, state);
          break;

        case 'ResourceSendRequest':
          processResourceSendRequest(event, startTime, currentProfilerData, state);
          break;
      }

      break;

    case 'blink.user_timing':
      if (name.startsWith('--react-version-')) {
        const [reactVersion] = name.substr(16).split('-');
        currentProfilerData.reactVersion = reactVersion;
      } else if (name.startsWith('--profiler-version-')) {
        const [versionString] = name.substr(19).split('-');
        profilerVersion = parseInt(versionString, 10);

        if (profilerVersion !== SCHEDULING_PROFILER_VERSION) {
          throw new InvalidProfileError(`This version of profiling data (${versionString}) is not supported by the current profiler.`);
        }
      } else if (name.startsWith('--react-lane-labels-')) {
        const [laneLabelTuplesString] = name.substr(20).split('-');
        updateLaneToLabelMap(currentProfilerData, laneLabelTuplesString);
      } else if (name.startsWith('--component-')) {
        processReactComponentMeasure(name, startTime, currentProfilerData, state);
      } else if (name.startsWith('--schedule-render-')) {
        const [laneBitmaskString] = name.substr(18).split('-');
        currentProfilerData.schedulingEvents.push({
          type: 'schedule-render',
          lanes: getLanesFromTransportDecimalBitmask(laneBitmaskString),
          timestamp: startTime,
          warning: null
        });
      } else if (name.startsWith('--schedule-forced-update-')) {
        const [laneBitmaskString, componentName] = name.substr(25).split('-');
        const forceUpdateEvent = {
          type: 'schedule-force-update',
          lanes: getLanesFromTransportDecimalBitmask(laneBitmaskString),
          componentName,
          timestamp: startTime,
          warning: null
        }; // If this is a nested update, make a note of it.
        // Once we're done processing events, we'll check to see if it was a long update and warn about it.

        if (state.measureStack.find(({
          type
        }) => type === 'commit')) {
          state.potentialLongNestedUpdate = forceUpdateEvent;
        }

        currentProfilerData.schedulingEvents.push(forceUpdateEvent);
      } else if (name.startsWith('--schedule-state-update-')) {
        const [laneBitmaskString, componentName] = name.substr(24).split('-');
        const stateUpdateEvent = {
          type: 'schedule-state-update',
          lanes: getLanesFromTransportDecimalBitmask(laneBitmaskString),
          componentName,
          timestamp: startTime,
          warning: null
        }; // If this is a nested update, make a note of it.
        // Once we're done processing events, we'll check to see if it was a long update and warn about it.

        if (state.measureStack.find(({
          type
        }) => type === 'commit')) {
          state.potentialLongNestedUpdate = stateUpdateEvent;
        }

        currentProfilerData.schedulingEvents.push(stateUpdateEvent);
      } else if (name.startsWith('--error-')) {
        const [componentName, phase, message] = name.substr(8).split('-');
        currentProfilerData.thrownErrors.push({
          componentName,
          message,
          phase: phase,
          timestamp: startTime,
          type: 'thrown-error'
        });
      } // eslint-disable-line brace-style
      // React Events - suspense
      else if (name.startsWith('--suspense-suspend-')) {
          const [id, componentName, phase, laneBitmaskString, promiseName] = name.substr(19).split('-');
          const lanes = getLanesFromTransportDecimalBitmask(laneBitmaskString);
          const availableDepths = new Array(state.unresolvedSuspenseEvents.size + 1).fill(true);
          state.unresolvedSuspenseEvents.forEach(({
            depth
          }) => {
            availableDepths[depth] = false;
          });
          let depth = 0;

          for (let i = 0; i < availableDepths.length; i++) {
            if (availableDepths[i]) {
              depth = i;
              break;
            }
          } // TODO (scheduling profiler) Maybe we should calculate depth in post,
          // so unresolved Suspense requests don't take up space.
          // We can't know if they'll be resolved or not at this point.
          // We'll just give them a default (fake) duration width.


          const suspenseEvent = {
            componentName,
            depth,
            duration: null,
            id,
            phase: phase,
            promiseName: promiseName || null,
            resolution: 'unresolved',
            resuspendTimestamps: null,
            timestamp: startTime,
            type: 'suspense',
            warning: null
          };

          if (phase === 'update') {
            // If a component suspended during an update, we should verify that it was during a transition.
            // We need the lane metadata to verify this though.
            // Since that data is only logged during commit, we may not have it yet.
            // Store these events for post-processing then.
            state.potentialSuspenseEventsOutsideOfTransition.push([suspenseEvent, lanes]);
          }

          currentProfilerData.suspenseEvents.push(suspenseEvent);
          state.unresolvedSuspenseEvents.set(id, suspenseEvent);
        } else if (name.startsWith('--suspense-resuspend-')) {
          const [id] = name.substr(21).split('-');
          const suspenseEvent = state.unresolvedSuspenseEvents.get(id);

          if (suspenseEvent != null) {
            if (suspenseEvent.resuspendTimestamps === null) {
              suspenseEvent.resuspendTimestamps = [startTime];
            } else {
              suspenseEvent.resuspendTimestamps.push(startTime);
            }
          }
        } else if (name.startsWith('--suspense-resolved-')) {
          const [id] = name.substr(20).split('-');
          const suspenseEvent = state.unresolvedSuspenseEvents.get(id);

          if (suspenseEvent != null) {
            state.unresolvedSuspenseEvents.delete(id);
            suspenseEvent.duration = startTime - suspenseEvent.timestamp;
            suspenseEvent.resolution = 'resolved';
          }
        } else if (name.startsWith('--suspense-rejected-')) {
          const [id] = name.substr(20).split('-');
          const suspenseEvent = state.unresolvedSuspenseEvents.get(id);

          if (suspenseEvent != null) {
            state.unresolvedSuspenseEvents.delete(id);
            suspenseEvent.duration = startTime - suspenseEvent.timestamp;
            suspenseEvent.resolution = 'rejected';
          }
        } // eslint-disable-line brace-style
        // React Measures - render
        else if (name.startsWith('--render-start-')) {
            if (state.nextRenderShouldGenerateNewBatchID) {
              state.nextRenderShouldGenerateNewBatchID = false;
              state.batchUID = state.uidCounter++;
            } // If this render is the result of a nested update, make a note of it.
            // Once we're done processing events, we'll check to see if it was a long update and warn about it.


            if (state.potentialLongNestedUpdate !== null) {
              state.potentialLongNestedUpdates.push([state.potentialLongNestedUpdate, state.batchUID]);
              state.potentialLongNestedUpdate = null;
            }

            const [laneBitmaskString] = name.substr(15).split('-');
            throwIfIncomplete('render', state.measureStack);

            if (getLastType(state.measureStack) !== 'render-idle') {
              markWorkStarted('render-idle', startTime, getLanesFromTransportDecimalBitmask(laneBitmaskString), currentProfilerData, state);
            }

            markWorkStarted('render', startTime, getLanesFromTransportDecimalBitmask(laneBitmaskString), currentProfilerData, state);

            for (let i = 0; i < state.nativeEventStack.length; i++) {
              const nativeEvent = state.nativeEventStack[i];
              const stopTime = nativeEvent.timestamp + nativeEvent.duration; // If React work was scheduled during an event handler, and the event had a long duration,
              // it might be because the React render was long and stretched the event.
              // It might also be that the React work was short and that something else stretched the event.
              // Make a note of this event for now and we'll examine the batch of React render work later.
              // (We can't know until we're done processing the React update anyway.)

              if (stopTime > startTime) {
                state.potentialLongEvents.push([nativeEvent, state.batchUID]);
              }
            }
          } else if (name.startsWith('--render-stop') || name.startsWith('--render-yield')) {
            markWorkCompleted('render', startTime, currentProfilerData, state.measureStack);
          } else if (name.startsWith('--render-cancel')) {
            state.nextRenderShouldGenerateNewBatchID = true;
            markWorkCompleted('render', startTime, currentProfilerData, state.measureStack);
            markWorkCompleted('render-idle', startTime, currentProfilerData, state.measureStack);
          } // eslint-disable-line brace-style
          // React Measures - commits
          else if (name.startsWith('--commit-start-')) {
              state.nextRenderShouldGenerateNewBatchID = true;
              const [laneBitmaskString] = name.substr(15).split('-');
              markWorkStarted('commit', startTime, getLanesFromTransportDecimalBitmask(laneBitmaskString), currentProfilerData, state);
            } else if (name.startsWith('--commit-stop')) {
              markWorkCompleted('commit', startTime, currentProfilerData, state.measureStack);
              markWorkCompleted('render-idle', startTime, currentProfilerData, state.measureStack);
            } // eslint-disable-line brace-style
            // React Measures - layout effects
            else if (name.startsWith('--layout-effects-start-')) {
                const [laneBitmaskString] = name.substr(23).split('-');
                markWorkStarted('layout-effects', startTime, getLanesFromTransportDecimalBitmask(laneBitmaskString), currentProfilerData, state);
              } else if (name.startsWith('--layout-effects-stop')) {
                markWorkCompleted('layout-effects', startTime, currentProfilerData, state.measureStack);
              } // eslint-disable-line brace-style
              // React Measures - passive effects
              else if (name.startsWith('--passive-effects-start-')) {
                  const [laneBitmaskString] = name.substr(24).split('-');
                  markWorkStarted('passive-effects', startTime, getLanesFromTransportDecimalBitmask(laneBitmaskString), currentProfilerData, state);
                } else if (name.startsWith('--passive-effects-stop')) {
                  markWorkCompleted('passive-effects', startTime, currentProfilerData, state.measureStack);
                } // eslint-disable-line brace-style
                // Internal module ranges
                else if (name.startsWith('--react-internal-module-start-')) {
                    const stackFrameStart = name.substr(30);

                    if (!state.internalModuleStackStringSet.has(stackFrameStart)) {
                      state.internalModuleStackStringSet.add(stackFrameStart);
                      const parsedStackFrameStart = parseStackFrame(stackFrameStart);
                      state.internalModuleCurrentStackFrame = parsedStackFrameStart;
                    }
                  } else if (name.startsWith('--react-internal-module-stop-')) {
                    const stackFrameStop = name.substr(19);

                    if (!state.internalModuleStackStringSet.has(stackFrameStop)) {
                      state.internalModuleStackStringSet.add(stackFrameStop);
                      const parsedStackFrameStop = parseStackFrame(stackFrameStop);

                      if (parsedStackFrameStop !== null && state.internalModuleCurrentStackFrame !== null) {
                        const parsedStackFrameStart = state.internalModuleCurrentStackFrame;
                        state.internalModuleCurrentStackFrame = null;
                        const range = [parsedStackFrameStart, parsedStackFrameStop];
                        const ranges = currentProfilerData.internalModuleSourceToRanges.get(parsedStackFrameStart.fileName);

                        if (ranges == null) {
                          currentProfilerData.internalModuleSourceToRanges.set(parsedStackFrameStart.fileName, [range]);
                        } else {
                          ranges.push(range);
                        }
                      }
                    }
                  } // eslint-disable-line brace-style
                  // Other user timing marks/measures
                  else if (ph === 'R' || ph === 'n') {
                      // User Timing mark
                      currentProfilerData.otherUserTimingMarks.push({
                        name,
                        timestamp: startTime
                      });
                    } else if (ph === 'b') {// TODO: Begin user timing measure
                    } else if (ph === 'e') {// TODO: End user timing measure
                    } else if (ph === 'i' || ph === 'I') {// Instant events.
                      // Note that the capital "I" is a deprecated value that exists in Chrome Canary traces.
                    } // eslint-disable-line brace-style
                    // Unrecognized event
                    else {
                        throw new InvalidProfileError(`Unrecognized event ${JSON.stringify(event)}! This is likely a bug in this profiler tool.`);
                      }

      break;
  }
}

function assertNoOverlappingComponentMeasure(state) {
  if (state.currentReactComponentMeasure !== null) {
    console.error('Component measure started while another measure in progress:', state.currentReactComponentMeasure);
  }
}

function assertCurrentComponentMeasureType(state, type) {
  if (state.currentReactComponentMeasure === null) {
    console.error(`Component measure type "${type}" stopped while no measure was in progress`);
  } else if (state.currentReactComponentMeasure.type !== type) {
    console.error(`Component measure type "${type}" stopped while type ${state.currentReactComponentMeasure.type} in progress`);
  }
}

function processReactComponentMeasure(name, startTime, currentProfilerData, state) {
  if (name.startsWith('--component-render-start-')) {
    const [componentName] = name.substr(25).split('-');
    assertNoOverlappingComponentMeasure(state);
    state.currentReactComponentMeasure = {
      componentName,
      timestamp: startTime,
      duration: 0,
      type: 'render',
      warning: null
    };
  } else if (name === '--component-render-stop') {
    assertCurrentComponentMeasureType(state, 'render');

    if (state.currentReactComponentMeasure !== null) {
      const componentMeasure = state.currentReactComponentMeasure;
      componentMeasure.duration = startTime - componentMeasure.timestamp;
      state.currentReactComponentMeasure = null;
      currentProfilerData.componentMeasures.push(componentMeasure);
    }
  } else if (name.startsWith('--component-layout-effect-mount-start-')) {
    const [componentName] = name.substr(38).split('-');
    assertNoOverlappingComponentMeasure(state);
    state.currentReactComponentMeasure = {
      componentName,
      timestamp: startTime,
      duration: 0,
      type: 'layout-effect-mount',
      warning: null
    };
  } else if (name === '--component-layout-effect-mount-stop') {
    assertCurrentComponentMeasureType(state, 'layout-effect-mount');

    if (state.currentReactComponentMeasure !== null) {
      const componentMeasure = state.currentReactComponentMeasure;
      componentMeasure.duration = startTime - componentMeasure.timestamp;
      state.currentReactComponentMeasure = null;
      currentProfilerData.componentMeasures.push(componentMeasure);
    }
  } else if (name.startsWith('--component-layout-effect-unmount-start-')) {
    const [componentName] = name.substr(40).split('-');
    assertNoOverlappingComponentMeasure(state);
    state.currentReactComponentMeasure = {
      componentName,
      timestamp: startTime,
      duration: 0,
      type: 'layout-effect-unmount',
      warning: null
    };
  } else if (name === '--component-layout-effect-unmount-stop') {
    assertCurrentComponentMeasureType(state, 'layout-effect-unmount');

    if (state.currentReactComponentMeasure !== null) {
      const componentMeasure = state.currentReactComponentMeasure;
      componentMeasure.duration = startTime - componentMeasure.timestamp;
      state.currentReactComponentMeasure = null;
      currentProfilerData.componentMeasures.push(componentMeasure);
    }
  } else if (name.startsWith('--component-passive-effect-mount-start-')) {
    const [componentName] = name.substr(39).split('-');
    assertNoOverlappingComponentMeasure(state);
    state.currentReactComponentMeasure = {
      componentName,
      timestamp: startTime,
      duration: 0,
      type: 'passive-effect-mount',
      warning: null
    };
  } else if (name === '--component-passive-effect-mount-stop') {
    assertCurrentComponentMeasureType(state, 'passive-effect-mount');

    if (state.currentReactComponentMeasure !== null) {
      const componentMeasure = state.currentReactComponentMeasure;
      componentMeasure.duration = startTime - componentMeasure.timestamp;
      state.currentReactComponentMeasure = null;
      currentProfilerData.componentMeasures.push(componentMeasure);
    }
  } else if (name.startsWith('--component-passive-effect-unmount-start-')) {
    const [componentName] = name.substr(41).split('-');
    assertNoOverlappingComponentMeasure(state);
    state.currentReactComponentMeasure = {
      componentName,
      timestamp: startTime,
      duration: 0,
      type: 'passive-effect-unmount',
      warning: null
    };
  } else if (name === '--component-passive-effect-unmount-stop') {
    assertCurrentComponentMeasureType(state, 'passive-effect-unmount');

    if (state.currentReactComponentMeasure !== null) {
      const componentMeasure = state.currentReactComponentMeasure;
      componentMeasure.duration = startTime - componentMeasure.timestamp;
      state.currentReactComponentMeasure = null;
      currentProfilerData.componentMeasures.push(componentMeasure);
    }
  }
}

function preprocessFlamechart(rawData) {
  let parsedData;

  try {
    parsedData = Object(library["importFromChromeTimeline"])(rawData, 'react-devtools');
  } catch (error) {
    // Assume any Speedscope errors are caused by bad profiles
    const errorToRethrow = new InvalidProfileError(error.message);
    errorToRethrow.stack = error.stack;
    throw errorToRethrow;
  }

  const profile = parsedData.profiles[0]; // TODO: Choose the main CPU thread only

  const speedscopeFlamechart = new library["Flamechart"]({
    getTotalWeight: profile.getTotalWeight.bind(profile),
    forEachCall: profile.forEachCall.bind(profile),
    formatValue: profile.formatValue.bind(profile),
    getColorBucketForFrame: () => 0
  });
  const flamechart = speedscopeFlamechart.getLayers().map(layer => layer.map(({
    start,
    end,
    node: {
      frame: {
        name,
        file,
        line,
        col
      }
    }
  }) => ({
    name,
    timestamp: start / 1000,
    duration: (end - start) / 1000,
    scriptUrl: file,
    locationLine: line,
    locationColumn: col
  })));
  return flamechart;
}

function parseStackFrame(stackFrame) {
  const error = new Error();
  error.stack = stackFrame;
  const frames = error_stack_parser_default.a.parse(error);
  return frames.length === 1 ? frames[0] : null;
}

async function preprocessData(timeline) {
  const flamechart = preprocessFlamechart(timeline);
  const laneToReactMeasureMap = new Map();

  for (let lane = 0; lane < REACT_TOTAL_NUM_LANES; lane++) {
    laneToReactMeasureMap.set(lane, []);
  }

  const profilerData = {
    batchUIDToMeasuresMap: new Map(),
    componentMeasures: [],
    duration: 0,
    flamechart,
    internalModuleSourceToRanges: new Map(),
    laneToLabelMap: new Map(),
    laneToReactMeasureMap,
    nativeEvents: [],
    networkMeasures: [],
    otherUserTimingMarks: [],
    reactVersion: null,
    schedulingEvents: [],
    snapshots: [],
    startTime: 0,
    suspenseEvents: [],
    thrownErrors: []
  }; // Sort `timeline`. JSON Array Format trace events need not be ordered. See:
  // https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/preview#heading=h.f2f0yd51wi15

  timeline = timeline.filter(Boolean).sort((a, b) => a.ts > b.ts ? 1 : -1); // Events displayed in flamechart have timestamps relative to the profile
  // event's startTime. Source: https://github.com/v8/v8/blob/44bd8fd7/src/inspector/js_protocol.json#L1486
  //
  // We'll thus expect there to be a 'Profile' event; if there is not one, we
  // can deduce that there are no flame chart events. As we expect React
  // scheduling profiling user timing marks to be recorded together with browser
  // flame chart events, we can futher deduce that the data is invalid and we
  // don't bother finding React events.

  const indexOfProfileEvent = timeline.findIndex(event => event.name === 'Profile');

  if (indexOfProfileEvent === -1) {
    return profilerData;
  } // Use Profile event's `startTime` as the start time to align with flame chart.
  // TODO: Remove assumption that there'll only be 1 'Profile' event. If this
  // assumption does not hold, the chart may start at the wrong time.


  profilerData.startTime = timeline[indexOfProfileEvent].args.data.startTime;
  profilerData.duration = (timeline[timeline.length - 1].ts - profilerData.startTime) / 1000;
  const state = {
    asyncProcessingPromises: [],
    batchUID: 0,
    currentReactComponentMeasure: null,
    internalModuleCurrentStackFrame: null,
    internalModuleStackStringSet: new Set(),
    measureStack: [],
    nativeEventStack: [],
    nextRenderShouldGenerateNewBatchID: true,
    potentialLongEvents: [],
    potentialLongNestedUpdate: null,
    potentialLongNestedUpdates: [],
    potentialSuspenseEventsOutsideOfTransition: [],
    requestIdToNetworkMeasureMap: new Map(),
    uidCounter: 0,
    unresolvedSuspenseEvents: new Map()
  };
  timeline.forEach(event => processTimelineEvent(event, profilerData, state));

  if (profilerVersion === null) {
    if (profilerData.schedulingEvents.length === 0 && profilerData.batchUIDToMeasuresMap.size === 0) {
      // No profiler version could indicate data was logged using an older build of React,
      // before an explicitly profiler version was included in the logging data.
      // But it could also indicate that the website was either not using React, or using a production build.
      // The easiest way to check for this case is to see if the data contains any scheduled updates or render work.
      throw new InvalidProfileError('No React marks were found in the provided profile.' + ' Please provide profiling data from an React application running in development or profiling mode.');
    }

    throw new InvalidProfileError(`This version of profiling data is not supported by the current profiler.`);
  } // Validate that all events and measures are complete


  const {
    measureStack
  } = state;

  if (measureStack.length > 0) {
    console.error('Incomplete events or measures', measureStack);
  } // Check for warnings.


  state.potentialLongEvents.forEach(([nativeEvent, batchUID]) => {
    // See how long the subsequent batch of React work was.
    // Ignore any work that was already started.
    const [startTime, stopTime] = getBatchRange(batchUID, profilerData, nativeEvent.timestamp);

    if (stopTime - startTime > NATIVE_EVENT_DURATION_THRESHOLD) {
      nativeEvent.warning = WARNING_STRINGS.LONG_EVENT_HANDLER;
    }
  });
  state.potentialLongNestedUpdates.forEach(([schedulingEvent, batchUID]) => {
    // See how long the subsequent batch of React work was.
    const [startTime, stopTime] = getBatchRange(batchUID, profilerData);

    if (stopTime - startTime > NESTED_UPDATE_DURATION_THRESHOLD) {
      // Don't warn about transition updates scheduled during the commit phase.
      // e.g. useTransition, useDeferredValue
      // These are allowed to be long-running.
      if (!schedulingEvent.lanes.some(lane => profilerData.laneToLabelMap.get(lane) === 'Transition')) {
        schedulingEvent.warning = WARNING_STRINGS.NESTED_UPDATE;
      }
    }
  });
  state.potentialSuspenseEventsOutsideOfTransition.forEach(([suspenseEvent, lanes]) => {
    // HACK This is a bit gross but the numeric lane value might change between render versions.
    if (!lanes.some(lane => profilerData.laneToLabelMap.get(lane) === 'Transition')) {
      suspenseEvent.warning = WARNING_STRINGS.SUSPEND_DURING_UPDATE;
    }
  }); // Wait for any async processing to complete before returning.
  // Since processing is done in a worker, async work must complete before data is serialized and returned.

  await Promise.all(state.asyncProcessingPromises);
  return profilerData;
}
// EXTERNAL MODULE: /Users/jstejada/code/jstejada-react/node_modules/nullthrows/nullthrows.js
var nullthrows = __webpack_require__(4);
var nullthrows_default = /*#__PURE__*/__webpack_require__.n(nullthrows);

// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/src/import-worker/readInputData.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */


const readInputData = file => {
  if (!file.name.endsWith('.json')) {
    throw new InvalidProfileError('Invalid file type. Only JSON performance profiles are supported');
  }

  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = () => {
      const result = nullthrows_default()(fileReader.result);

      if (typeof result === 'string') {
        resolve(result);
      }

      reject(new InvalidProfileError('Input file was not read as a string'));
    };

    fileReader.onerror = () => reject(fileReader.error);

    fileReader.readAsText(file);
  });
};
// CONCATENATED MODULE: ../react-devtools-scheduling-profiler/src/import-worker/importFile.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */




async function importFile(file) {
  try {
    const readFile = await readInputData(file);
    const events = JSON.parse(readFile);

    if (events.length === 0) {
      throw new InvalidProfileError('No profiling data found in file.');
    }

    const processedData = await preprocessData(events);
    return {
      status: 'SUCCESS',
      processedData
    };
  } catch (error) {
    if (error instanceof InvalidProfileError) {
      return {
        status: 'INVALID_PROFILE_ERROR',
        error
      };
    } else {
      return {
        status: 'UNEXPECTED_ERROR',
        error
      };
    }
  }
}
// CONCATENATED MODULE: /Users/jstejada/code/jstejada-react/node_modules/workerize-loader/dist/rpc-worker-loader.js!/Users/jstejada/code/jstejada-react/node_modules/babel-loader/lib??ref--2-1!/Users/jstejada/code/jstejada-react/node_modules/babel-loader/lib??ref--3!../react-devtools-scheduling-profiler/src/import-worker/importFile.worker.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const importFile_worker_importFile = importFile;
addEventListener('message', function (e) {var _e$data = e.data,type = _e$data.type,method = _e$data.method,id = _e$data.id,params = _e$data.params,f,p;if (type === 'RPC' && method) {if (f = __webpack_exports__[method]) {p = Promise.resolve().then(function () {return f.apply(__webpack_exports__, params);});} else {p = Promise.reject('No such method');}p.then(function (result) {postMessage({type: 'RPC',id: id,result: result});}).catch(function (e) {var error = {message: e};if (e.stack) {error.message = e.message;error.stack = e.stack;error.name = e.name;}postMessage({type: 'RPC',id: id,error: error});});}});postMessage({type: 'RPC',method: 'ready'});

/***/ })
/******/ ]);