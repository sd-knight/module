class QueryString {
	static escape(str) {
		return encodeURIComponent(str);
	}

	static parse(str, sep, eq, options = {}) {
		let keys = 0, set = [], result = Object.create(null), key, value;
		let	default_options = {
			maxKeys: 1000, 
			decodeURIComponent: QueryString.unescape
		}
		str = String(str);
		sep = sep || '&';
		eq = eq || "=";
		options = Object.assign(default_options, options);
		set = str.split(sep);
		for (var i = 0; i < set.length; i++) {
			[key, value] = set[i].split(eq);
			value = options.decodeURIComponent(value);
			if (result[key]) {
				result[key] = [value].concat(result[key]);
			} else {
				keys++;
				result[key] = value;
			}
			if (keys == options.maxKeys) break;
		}
		return result;
	}

	static stringify(obj, sep, eq, options = {}) {
		let set = [], result = "", key, value;
		let	default_options = {
			encodeURIComponent: QueryString.escape
		}
		obj = Object(obj);
		sep = sep || '&';
		eq = eq || "=";
		options = Object.assign(default_options, options);
		return Object.keys(obj).map(key=>{
			if (Array.isArray(obj[key])) {
				return obj[key].map(value=>{
					return key + eq + options.encodeURIComponent(value);
				}).join(sep)
			} else {
				return key + eq + options.encodeURIComponent(obj[key]);
			}
		}).join(sep);
	}

	static unescape(str) {
		return decodeURIComponent(str);
	}
}

export default QueryString;