define(['Promise'], function (Promise){

	var isArray = function (array){
		return Object.prototype.toString.call(array) === '[object Array]';
	}

	function createObject (db, obj) {

		var store = db.createObjectStore(obj.name, {keyPath: obj.keyPath, autoIncrement: obj.autoIncrement});
		var indexNames = store.indexNames;

		if (obj.indexes && isArray(obj.indexes)){

			obj.indexes.forEach(function (v){
				if (indexNames.contains(v.name)){
					store.deleteIndex(v.name);
				}
				createIndex(store, v);
			});

		} else if (typeof obj.indexes === 'object'){
			if (indexNames.contains(obj.indexes.name)){
				store.deleteIndex(obj.indexes.name);
			}
			createIndex(store, obj.indexes);
		}

	}

	function createIndex (store, obj){

		var index = store.createIndex(obj.name, obj.keyPath, {
			unique: obj.unique,
			multiEntry: obj.multi
		});

		return new Index(index);
	}

	function briefDB (database){

		if (!this instanceof briefDB) return new briefDB(database);
		
		this.database = database;
	}

	briefDB.prototype = {

		close: function (){

			this.database.close();
		},

		store: function (name, mode){

			var transaction = this.database.transaction(name, mode);
			
			if (isArray(name)){

				return Promise.all(name.map(function (v){

					return new Store(transaction.objectStore(name));

				}));

			} else {
				
				return new Store(transaction.objectStore(name));
			}
		}
	}

	function Store (store){
		
		this.store = store;
	}

	Store.prototype = {
		
		index: function (name){
			return new Index(this.store.index(name));
		},

		find: function (term, opt){

			if (typeof term !== 'object') throw typeError('must object');

			var store = this.store, range, sort = 'next', limit, res = [];
			
			if (typeof opt === 'object'){

				sort = opt.sort || 'next';

				limit = opt.limit;
			}

			return new Promise(function (resolve, reject){

				for (var key in term){

					var index;

					if (store.keyPath === key) {

						index = store;

					} else if (store.indexNames.contains(key)){

						index = new Index(store.index(key));

					} else {

						return reject('must create '+key+' index');
					}

					var val = term[key];

					if (typeof val === 'object'){

						if (Object.keys(val).length > 1){

							range = IDBKeyRange.bound(val.gt || val.gte, val.lt || val.lte, val.gte ? false : true, val.lte ? false : true);

						} else {

							range = (val.lt || val.lte) ? IDBKeyRange.upperBound(val.lt || val.lte, val.lt ? true : false) : IDBKeyRange.lowerBound(val.gt || val.gte, val.lt ? true : false);
						}

					} else {

						range = IDBKeyRange.only(val);
					}
				}

				var req = index.store.openCursor(range, sort);

				req.onsuccess = function (){

					var cursor = this.result;

					if (cursor){

						res.push(cursor.value);

						if (limit && res.length == limit){

							resolve(res);

						} else {

							cursor.continue();
						}

					} else {

						resolve(res);
					}
				}

				req.onerror = function (){

					reject(this.error);
				}
			});
		},

		findOne: function (term){

			if (typeof term !== 'object') throw typeError('must object');

			var store = this.store;

			return new Promise(function (resolve, reject){

				var key = Object.keys(term)[0];

				if (store.keyPath === key) {

					var req = store.get(term[key]);

				} else if (store.indexNames.contains(key)){

					var req = store.index(key).get(term[key]);

				} else {

					return reject('must create ' + key + 'index');
				}

				req.onsuccess = function (){

					resolve(this.result);
				}

				req.onerror = function (){

					reject(this.error);
				}
			});
		},

		add: function (item, opt){

			var that = this;

			if (isArray(item)){

				return Promise.all(item.map(function (item){

					return that.add(item, opt);

				}));

			} else {

				return new Promise(function (resolve, reject){
					
					var req = that.store.add(item, opt);

					req.onsuccess = function (event){
						resolve(event);
					}

					req.onerror = function (event){
						reject(this.error);
					}
				});
			}
		},

		clear: function (){

			this.store.clear();
		},

		put: function (item, opt){

			var that = this;

			if (isArray(item)){

				return Promise.all(item.map(function (item){

					return that.put(item, opt);

				}));

			} else {

				return new Promise(function (resolve, reject){

					var req = that.store.put(item, opt);

					req.onsuccess = function (event){

						resolve(event);
					}

					req.onerror = function (){

						reject(this.error);
					}
				});
			}
		},

		count: function (value){

			var req = this.store.count(value);

			return new Promise(function (resolve, reject){

				req.onsuccess = function (){

					resolve(this.result);
				}

				req.onerror = function (){

					reject(this.error);
				}
			})
		}
	}

	function Index (index) {
		this.store = index;
	}

	Index.prototype = {

		count: Store.prototype.count,

		findOne: Store.prototype.findOne,

		find: Store.prototype.find
	};

	briefDB.open = function (obj){

		return new Promise(function (resolve, reject){

			var req = indexedDB.open(obj.db, obj.version);

			req.onsuccess = function (){

				resolve(new briefDB(this.result));
			}

			req.onupgradeneeded = function (){

				var db = this.result, stores = db.objectStoreNames;

				if (isArray(obj.stores)){

					obj.stores.forEach(function (v){
						if (stores.contains(obj.stores.name)){
							db.deleteObjectStore(obj.stores.name);
						}
						createObject(db, v);
					});

				} else if (typeof obj.stores === 'object') {

					if (stores.contains(obj.stores.name)){

						db.deleteObjectStore(obj.stores.name);
						
					}

					createObject(db, obj.stores);

				}
			}

			req.onerror = function (){

				reject(this.error);
			}
		});
	}

	briefDB.removeDB = function (name){

		indexedDB.deleteDatabase(name);
	
	}

	return briefDB;
});