com.magadanski.mSimpleNav.Exception;

////////////////////////////////////////////
// Exception Class Implementation //////////
////////////////////////////////////////////
(function () {
	// import class
	var Exception = function (message) {
		var that = this;
		
		that.message = message;
	}
	com.magadanski.mSimpleNav.Exception = Exception;
})();