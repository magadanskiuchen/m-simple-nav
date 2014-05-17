com.magadanski.mSimpleNav.Storage;

//////////////////////////////////////
// Storage Class Implementation //////
//////////////////////////////////////
(function () {
	// import class
	var Storage = function (tables) {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		that.db = openDatabase('mSimpleNavFavorites', '1.0', 'M Simple Nav Favorites', 2*1024*1024);
		that.db.transaction(function (tx) {
			// database created callback
			if (typeof(tables) != 'undefined') {
				// cycle through all tables in object
				for (var t in tables) {
					var fields = [];
					var prop = '';
					
					// cycle through all fields in table
					for (var p in tables[t]) {
						prop = p;
						
						// check if field type is set
						if (typeof(tables[t][p].type) != 'undefined') {
							prop += ' ' + tables[t][p].type;
						}
						
						// check if field should be primary key
						if (tables[t][p].primaryKey) {
							prop += ' PRIMARY KEY';
						}
						
						// check if field should auto increment
						if (tables[t][p].autoIncrement) {
							prop += ' AUTOINCREMENT';
						}
						
						// check if field should be unique
						if (tables[t][p].unique) {
							prop += ' UNIQUE';
						}
						
						fields.push(prop);
					}
					
					q = fields.join(', ');
					
					// create table with associated fields
					tx.executeSql('CREATE TABLE IF NOT EXISTS ' + t + '(' + q + ')', null, function (tx, results) {
						// success
					}, function (tx, error) {
						alert('There was an error with setting up favorites data storage. Please contact the developer.');
					});
				}
			}
		});
	}
	Storage.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Storage = Storage;
	
	// helper functions
	function getPlaceholder(values) {
		return Array(values.length + 1).join('?').split('').join(', ');
	}
	
	// public properties
	Storage.prototype.db = null;
	
	// public methods
	Storage.prototype.add = function (table, entry, callback) {
		var that = this;
		
		that.db.transaction(function (tx) {
			var fields = [];
			var values = [];
			
			for (var p in entry) {
				fields.push(p);
				values.push(entry[p]);
			}
			
			var vq = getPlaceholder(values);
			
			tx.executeSql('INSERT INTO ' + table + '(' + fields.join(', ') + ') VALUES(' + vq + ')', values, function (tx, results) {
				that.dispatchEvent('insert', { tx: tx, results: results });
				
				if (typeof(callback) == 'function') {
					callback(tx, results);
				}
			}, function (tx, error) {
				alert('There was an error saving your location. Please try again. If this remains happening contact the developer.');
			});
		});
	}
	
	Storage.prototype.get = function (table, options, callback) {
		var that = this;
		
		that.db.transaction(function (tx) {
			var select = 'SELECT ';
			var from = ' FROM ' + table;
			var where = '';
			var parameters = [];
			
			if (typeof(options.fields) != 'undefined') {
				select += options.fields.join(', ');
			} else {
				select += '*';
			}
			
			if (typeof(options.conditions) != 'undefined') {
				where += ' WHERE ';
				var conditions = [];
				
				for (var c in options.conditions) {
					if (typeof(options.conditions.operator) == 'undefined') {
						options.conditions.operator = '=';
					}
					
					conditions.push(options.conditions[c].field + ' ' + options.conditions.operator + ' ?');
					parameters.push(options.conditions[c].value);
				}
			}
			
			tx.executeSql(select + from + where, parameters, function (tx, results) {
				if (typeof(callback) == 'function') {
					callback(results);
				}
			}, function (tx, error) {
				alert('Could not retrieve entries. Please contact developer.');
			});
		});
	}
	
	// TODO: add UPDATE and DELETE capabilities
})();
