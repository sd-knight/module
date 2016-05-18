/*
*	倒计时
* author: @secilla
*	update 2016-5-18
* @param {Number}: 倒计的时间，单位为毫秒
* @returns {CountDown}: 返回倒计时实例
* CountDown.step(@Number) 设置process函数运行的间隔，默认是1000
* CountDown.process(@function)  设置每隔@step毫秒运行的函数
* CountDown.pause()	暂停
* CountDown.resume() 从暂停中恢复
* CountDown.getTime(@formatString) 获取剩余时间，可传入格式化字符串 Y-m-d H:i:s:M，不传参数直接返回剩余时间 
*/
(function (global, undefined){

	function finish (c) {
		c.state = 'done';
		for (var i = 0; i < c._callback.length; i++) {
			if (typeof c._callback[i] === 'function') {
				c._callback[i]();
			}
		}
	}

	function bootstrap (c) {
		c._timer = setTimeout(function() {
			finish(c);
		}, c.time);
	}

	function process (c, fn) {
		c._timer = setInterval(function(){
			c.time -= c._step;
			if (c.time <= 0) {
				clearInterval(c._timer);
				c.time = 0;
				finish(c);
			} else {
				fn.call(c, c.time);
			}
		}, c._step);
	}

	function CountDown (time) {
		this._step = 1000;
		this.time = time;
		this.state = 'runing';
		this._callback = [];
		var _self = this;
		bootstrap(_self);
	}

	CountDown.format = {
		Y: 1000 * 60 * 60 * 24 * 365,
		m: 1000 * 60 * 60 * 24 * 30,
		d: 1000 * 60 * 60 * 24,
		H: 1000 * 60 * 60,
		i: 1000 * 60,
		s: 1000,
		M: 1
	}

	CountDown.prototype = {
		step: function (s) {
			if (typeof s !== 'number') {
				return this;
			}
			this._step = s;
			return this;
		},
		process: function (fn) {
			if (typeof fn !== 'function') {
				return this;
			}
			clearTimeout(this._timer);
			this._processFn = fn;
			process(this, fn);
			return this;
		},
		pause: function () {
			if (this.state !== 'runing') return;
			this.state = 'pause';
			if (this._processFn) {
				clearInterval(this._timer);
			} else {
				clearTimeout(this._timer);
			}
			return this;
		},
		resume: function (){
			if (this.state !== 'pause') return;
			this.state = 'runing';
			if (typeof this._processFn === 'function') {
				process(this, this._processFn);
			} else {
				bootstrap(this);
			}
			return this;
		},
		done: function (fn) {
			this._callback.push(fn);
			return this;
		},
		getTime: function (str) {
			if (typeof str !== 'string') return this.time;
			var _seft = this, time = this.time;
			for (var k in CountDown.format) {
				var reg = new RegExp(k+k+"?", "g");
				str = str.replace(reg, function(m){
					var rep = Math.floor(time / CountDown.format[k]);
					if (m.length > 1) {
						rep = ('0' + rep).slice(-1 * Math.max(m.length, rep.toString().length));
					}
					time = time % CountDown.format[k];
					return rep;
				});
			}
			return str;
		}
	}

	if (typeof define === 'function' && define.amd){
		define(function(){return CountDown});
	} else if (typeof module != 'undefined' && module.exports) {
		module.exports = CountDown
	} else {
		global.CountDown = CountDown;
	}
})(this);