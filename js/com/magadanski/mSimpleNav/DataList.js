com.magadanski.mSimpleNav.DataList;

//////////////////////////////////////
// DataList Class Implementation /////
//////////////////////////////////////
(function () {
	// import Class
	var DataList = function (options) {
		var that = this;
		var data = [];
		var options = (typeof(options) !== 'undefined') ? options : {};
		var defaults = { containerTag: 'ul', itemTag: 'li' };
		
		// private properties
		
		// priviledged properties
		that.options = options;
		
		// private methods
		
		// priviledged methods
		that.getData = function (i) {
			var result = data;
			
			if (typeof(i) !== 'undefined' && typeof(data[i]) !== 'undefined' && !!data[i]) {
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
					data.splice(i, 1);
				} else {
					throw new com.magadanski.Exception('index ' + i + ' does not exist in data array');
				}
			} else {
				data = [];
			}
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
		
		that.createContainer = function () {
			var container = document.createElement(that.options.containerTag);
			container.classList.add('datalist');
			
			return container;
		}
		
		that.createItem = function (content, i) {
			var item = document.createElement(that.options.itemTag);
			item.innerHTML = content;
			
			return item;
		}
		
		// constructor
		that.init = function () {
			that.options = options;
			
			for (var o in defaults) {
				if (typeof(that.options[o]) === 'undefined') {
					that.options[o] = defaults[o];
				}
			}
		}
		
		that.init();
	}
	DataList.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.DataList = DataList;
	
	// public properties
	
	// public methods
	DataList.prototype.build = function () {
		var that = this;
		var data = that.getData();
		
		var list = that.createContainer();
		
		for (var i in data) {
			var item = that.createItem(data[i], i);
			
			list.appendChild(item);
		}
		
		return list;
	}
	
	DataList.prototype.getOptions = function () {
		return this.options;
	}
})();
