/*!
 * /**
 *  * Copyright (c) Meta Platforms, Inc. and affiliates.
 *  *
 *  * This source code is licensed under the MIT license found in the
 *  * LICENSE file in the root directory of this source tree.
 *  * /
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/TestPathPatterns.ts":
/***/ ((__unused_webpack_module, exports) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.TestPathPatternsExecutor = exports.TestPathPatterns = void 0;
function _jestRegexUtil() {
  const data = require("jest-regex-util");
  _jestRegexUtil = function () {
    return data;
  };
  return data;
}
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class TestPathPatterns {
  constructor(patterns) {
    this.patterns = patterns;
  }

  /**
   * Return true if there are any patterns.
   */
  isSet() {
    return this.patterns.length > 0;
  }

  /**
   * Return true if the patterns are valid.
   */
  isValid() {
    return this.toExecutor({
      // isValid() doesn't require rootDir to be accurate, so just
      // specify a dummy rootDir here
      rootDir: '/'
    }).isValid();
  }

  /**
   * Return a human-friendly version of the pattern regex.
   */
  toPretty() {
    return this.patterns.join('|');
  }

  /**
   * Return a TestPathPatternsExecutor that can execute the patterns.
   */
  toExecutor(options) {
    return new TestPathPatternsExecutor(this, options);
  }

  /** For jest serializers */
  toJSON() {
    return {
      patterns: this.patterns,
      type: 'TestPathPatterns'
    };
  }
}
exports.TestPathPatterns = TestPathPatterns;
class TestPathPatternsExecutor {
  _regexString = null;
  constructor(patterns, options) {
    this.patterns = patterns;
    this.options = options;
  }
  get regexString() {
    if (this._regexString !== null) {
      return this._regexString;
    }
    const rootDir = this.options.rootDir.replace(/\/*$/, '/');
    const rootDirRegex = (0, _jestRegexUtil().escapePathForRegex)(rootDir);
    const regexString = this.patterns.patterns.map(p => {
      // absolute paths passed on command line should stay same
      if (p.startsWith('/')) {
        return p;
      }

      // explicit relative paths should resolve against rootDir
      if (p.startsWith('./')) {
        return p.replace(/^\.\//, rootDirRegex);
      }

      // all other patterns should only match the relative part of the test
      return `${rootDirRegex}(.*)?${p}`;
    }).map(_jestRegexUtil().replacePathSepForRegex).join('|');
    this._regexString = regexString;
    return regexString;
  }
  toRegex() {
    return new RegExp(this.regexString, 'i');
  }

  /**
   * Return true if there are any patterns.
   */
  isSet() {
    return this.patterns.isSet();
  }

  /**
   * Return true if the patterns are valid.
   */
  isValid() {
    try {
      this.toRegex();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Return true if the given ABSOLUTE path matches the patterns.
   *
   * Throws an error if the patterns form an invalid regex (see `validate`).
   */
  isMatch(path) {
    return this.toRegex().test(path);
  }

  /**
   * Return a human-friendly version of the pattern regex.
   */
  toPretty() {
    return this.patterns.toPretty();
  }
}
exports.TestPathPatternsExecutor = TestPathPatternsExecutor;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "TestPathPatterns", ({
  enumerable: true,
  get: function () {
    return _TestPathPatterns.TestPathPatterns;
  }
}));
Object.defineProperty(exports, "TestPathPatternsExecutor", ({
  enumerable: true,
  get: function () {
    return _TestPathPatterns.TestPathPatternsExecutor;
  }
}));
var _TestPathPatterns = __webpack_require__("./src/TestPathPatterns.ts");
})();

module.exports = __webpack_exports__;
/******/ })()
;