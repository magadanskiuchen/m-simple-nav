com.magadanski.App;

//////////////////////////////////////////
// App Class Implementation //////////////
//////////////////////////////////////////
(function () {
	// import class
	var that;
	var App = function () {
		that = this;
		
		that.title = document.title;
	}
	App.inherits(com.magadanski.EventDispatcher);
	com.magadanski.App = App;
	
	// private properties
	
	// public properties
	App.prototype.title = '';
	
	// private methods
	
	// public methods
	
})();
