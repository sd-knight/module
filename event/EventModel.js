(function (window, undefined){

	Object.assign || (Object.assign = function(target, firstSource) {
			var i, args = arguments, n, key;
			if (target === undefined || target === null)
				throw new TypeError("Cannot convert first argument to object");
			target = Object(target);
			for (i = 1; i < args.length; i++) {
				var n = args[i];
				if (n === undefined || n === null) continue;
				for (key in n) {
					if (n.hasOwnProperty(key) && n[key] != undefined)
						target[key] = n[key];
				}
			}
			return target;
		}
	)
	var EventModel = function(target){
		if (target) {
			EventModel.call(target);
			Object.assign(target.prototype, EventModel.prototype);
		}
		if (this == window) return new EventModel();
		this.events = {};
	}
	EventModel.prototype = {
		on: function (type, fn){
			if (type instanceof Object) {
				for (var i in type) this.on(i, type[i]);
			} else if (typeof type === 'string' && fn instanceof Function) {
				if (type in this.events) this.events[type].push(fn);
				else this.events[type] = [fn];
			}
			return this;
		},
		off: function (type, fn){
			var i, events = this.events;
			if (type instanceof Object) for(i in type) this.off(i,type[i]);
			if (!fn) this.events[type] = null;
			else if (type in events && typeof fn === 'function') {
				for (i=0; i < events[type].length; i++) {
					if (events[type][i] == fn) events[type].splice(i,1);
				}
			}
			return this;
		},
		one: function(type, fn){
			this.on(type, function callee(){
				fn.apply(this, arguments);
				this.off(type, callee);
			})
		},
		emit: function (type, data){
			var i = 0, events = this.events, args = data||[];
			if (type in events)
				for (; i<events[type].length; i++) {
					events[type][i] && events[type][i].apply(this, data);
				};
			return this;
		}
	}

	if (typeof define !== 'undefined' && define.amd) {
		define(function(){return EventModel;})
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = EventModel;
	} else {
		window.EventModel = EventModel;
	}
})(this);