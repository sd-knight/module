/*
*	底层工具集合 By sd_knight
*	update 2015-3-24
*/
(function (global, undefined){

	var slice = [].slice;

	var isType = function (type){
			return function (obj){
				return Object.prototype.toString.call(obj) === '[object '+type+']';
			}
		};

	var isArray = Array.isArray || isType('Array'),

		isWindow = function (obj){
			return obj != null && obj.window === window;
		}

	var mix = function (target, source){

		var args = slice.call(arguments), cover, to, source, l, s;

		cover = typeof args[args.length-1] === 'boolean' ? args.pop() : true;

		to = (l = args.length) === 1 ? this : Object(target);

		source = l === 1 ? args : args.slice(1);

		while (s = source[l--]){

			for (key in s){

				if (s.hasOwnProperty(key) && (cover || !to[key])){

					to[key] = s[key];
				}
			}
		}

		return to;
	}

	var each = function (obj, fn){

		if (obj === undefined || obj === null) throw TypeError('please passing a Iterable object');

		if (typeof fn !== 'function') throw TypeError('please Passing the function parameter');

		var key, val, obj = Object(obj);

		//判断是否是数组或者NodeList之类数组
		if (isArray(obj) || obj.length && !isFunction(obj) && !isWindow(obj)){

			for (var i = 0; i < obj.length; i++) {

				val = fn.call(obj[i], i, obj[i]);

				if (val === false) break;

			};

		} else {

			for (key in obj){

				if (obj.hasOwnProperty(key)){

					val = fn.call(obj, key, obj[key]);

					if (val === false) break;
				}
			}
		}
	}

	var util = {

		isType: isType,

		isWindow: isWindow,

		isFunction: isFunction,

		isArray: isArray,

		mix: mix,

		each: each
	};

	if (typeof define === 'function' && define.amd){
		define(function(){return util});
	} else {
		global.util = util;
	}
})(this);