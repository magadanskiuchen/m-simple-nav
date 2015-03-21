com.magadanski.mSimpleNav.DataList;

//////////////////////////////////////
// DataList Class Implementation /////
//////////////////////////////////////
(function () {
	// import Class
	var DataList = function (options) {
		var that = this;
		var data = [];
		
		// private properties
		
		// private methods
		
		// constructor
		if (typeof(options) != 'object') {
			options = {};
		}
		
		if (typeof(options.startList) != 'function') {
			options.startList = function () {
				return '<ul>';
			}
		}
		
		if (typeof(options.endList) != 'function') {
			options.endList = function () {
				return '</ul>';
			}
		}
		
		if (typeof(options.renderItem) != 'function') {
			options.renderItem = function (item) {
				return '<li>' + item + '</li>';
			}
		}
		
		// priviledged methods
		that.startList = options.startList;
		that.endList = options.endList;
		that.renderItem = options.renderItem;
		
		that.getData = function (i) {
			var result = data;
			
			if (typeof(i) !== 'undefined' && typeof(data[i]) !== 'undefined') {
				result = data[i];
			}
			
			return result;
		}
		
		that.setData = function (newData, i) {
			if (typeof(i) !== 'undefined') {
				data[i] = newData;
			} else {
				data = [].concat(newData);
			}
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
		
		that.addData = function (newData) {
			data = data.concat(newData);
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
		
		that.clearData = function (i) {
			if (typeof(i) !== 'undefined') {
				if (typeof(data[i]) !== 'undefined') {
					data[i] = null;
				} else {
					throw new com.magadanski.Exception('index ' + i + ' does not exist in data array');
				}
			} else {
				data = [];
			}
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
	}
	DataList.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.DataList = DataList;
	
	// public properties
	
	// public methods
	DataList.prototype.render = function () {
		var that = this;
		var markup = '';
		var data = that.getData();
		
		markup += that.startList();
		
		for (var i in data) {
			markup += that.renderItem(data[i]);
		}
		
		markup += that.endList();
		
		return markup;
	}
})();
