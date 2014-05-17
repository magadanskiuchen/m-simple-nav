com.magadanski.mSimpleNav.DataList;

//////////////////////////////////////
// DataList Class Implementation /////
//////////////////////////////////////
(function () {
	// import Class
	var DataList = function (options) {
		var that = this;
		
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
		
		// priviledged properties
		that.data = [];
		
		// priviledged methods
		that.startList = options.startList;
		that.endList = options.endList;
		that.renderItem = options.renderItem;
	}
	DataList.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.DataList = DataList;
	
	// private properties
	
	// public properties
	
	// private methods
	
	// public methods
	DataList.prototype.render = function () {
		var that = this;
		var markup = '';
		
		markup += that.startList();
		
		for (var i in that.data) {
			markup += that.renderItem(that.data[i]);
		}
		
		markup += that.endList();
		
		return markup;
	}
})();
