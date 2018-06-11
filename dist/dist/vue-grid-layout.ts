(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VueGridLayout"] = factory();
	else
		root["VueGridLayout"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./source/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./source/GridItem.vue":
/*!*****************************!*\
  !*** ./source/GridItem.vue ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from ./node_modules/vue-loader/index.js):\\nTypeError: Cannot read property 'vue' of undefined\\n    at Object.module.exports (/Users/jonathanwilbur/Dropbox/vue-grid-layout/node_modules/vue-loader/lib/loader.js:56:78)\");\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIuL3NvdXJjZS9HcmlkSXRlbS52dWUuanMiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./source/GridItem.vue\n");

/***/ }),

/***/ "./source/GridLayout.vue":
/*!*******************************!*\
  !*** ./source/GridLayout.vue ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from ./node_modules/vue-loader/index.js):\\nTypeError: Cannot read property 'vue' of undefined\\n    at Object.module.exports (/Users/jonathanwilbur/Dropbox/vue-grid-layout/node_modules/vue-loader/lib/loader.js:56:78)\");\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIuL3NvdXJjZS9HcmlkTGF5b3V0LnZ1ZS5qcyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./source/GridLayout.vue\n");

/***/ }),

/***/ "./source/ResponsiveGridLayout.vue":
/*!*****************************************!*\
  !*** ./source/ResponsiveGridLayout.vue ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from ./node_modules/vue-loader/index.js):\\nTypeError: Cannot read property 'vue' of undefined\\n    at Object.module.exports (/Users/jonathanwilbur/Dropbox/vue-grid-layout/node_modules/vue-loader/lib/loader.js:56:78)\");\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiIuL3NvdXJjZS9SZXNwb25zaXZlR3JpZExheW91dC52dWUuanMiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./source/ResponsiveGridLayout.vue\n");

/***/ }),

/***/ "./source/index.ts":
/*!*************************!*\
  !*** ./source/index.ts ***!
  \*************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _GridItem_vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GridItem.vue */ \"./source/GridItem.vue\");\n/* harmony import */ var _GridItem_vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_GridItem_vue__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _GridLayout_vue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./GridLayout.vue */ \"./source/GridLayout.vue\");\n/* harmony import */ var _GridLayout_vue__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_GridLayout_vue__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _ResponsiveGridLayout_vue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ResponsiveGridLayout.vue */ \"./source/ResponsiveGridLayout.vue\");\n/* harmony import */ var _ResponsiveGridLayout_vue__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_ResponsiveGridLayout_vue__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nvar VueGridLayout = {\n    ResponsiveGridLayoutComponent: _ResponsiveGridLayout_vue__WEBPACK_IMPORTED_MODULE_2___default.a,\n    GridLayoutComponent: _GridLayout_vue__WEBPACK_IMPORTED_MODULE_1___default.a,\n    GridItemComponent: _GridItem_vue__WEBPACK_IMPORTED_MODULE_0___default.a\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (VueGridLayout);\n\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9WdWVHcmlkTGF5b3V0Ly4vc291cmNlL2luZGV4LnRzPzdjZDMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUErQztBQUNJO0FBQ29CO0FBRXZFLElBQUksYUFBYSxHQUFHO0lBQ2hCLDZCQUE2QjtJQUM3QixtQkFBbUI7SUFDbkIsaUJBQWlCO0NBQ3BCLENBQUM7QUFFRiwrREFBZSxhQUFhLEVBQUMiLCJmaWxlIjoiLi9zb3VyY2UvaW5kZXgudHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR3JpZEl0ZW1Db21wb25lbnQgZnJvbSAnLi9HcmlkSXRlbS52dWUnO1xuaW1wb3J0IEdyaWRMYXlvdXRDb21wb25lbnQgZnJvbSAnLi9HcmlkTGF5b3V0LnZ1ZSc7XG5pbXBvcnQgUmVzcG9uc2l2ZUdyaWRMYXlvdXRDb21wb25lbnQgZnJvbSAnLi9SZXNwb25zaXZlR3JpZExheW91dC52dWUnO1xuXG5sZXQgVnVlR3JpZExheW91dCA9IHtcbiAgICBSZXNwb25zaXZlR3JpZExheW91dENvbXBvbmVudCxcbiAgICBHcmlkTGF5b3V0Q29tcG9uZW50LFxuICAgIEdyaWRJdGVtQ29tcG9uZW50XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWdWVHcmlkTGF5b3V0OyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./source/index.ts\n");

/***/ })

/******/ });
});