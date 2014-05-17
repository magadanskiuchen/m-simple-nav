com.magadanski.mSimpleNav.Location;

//////////////////////////////////////
// Location Class Implementation /////
//////////////////////////////////////
(function () {
	// import Class
	var Location = function (options) {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		if (typeof(options.lat) == 'number') {
			that.lat = options.lat;
		}
		
		if (typeof(options.lng) == 'number') {
			that.lng = options.lng;
		}
		
		if (typeof(options.name) == 'string') {
			that.name = options.name;
		}
	}
	Location.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Location = Location;
	
	// public properties
	Location.prototype.lat = 0;
	Location.prototype.lng = 0;
	Location.prototype.name = '';
	
	// public methods
})();
