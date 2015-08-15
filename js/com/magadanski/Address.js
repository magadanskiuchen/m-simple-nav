com.magadanski.Address;

//////////////////////////////////////
// Address Class Implementation //////
//////////////////////////////////////
(function () {
	// import class
	var that;
	var Address = function () {
		that = this;
		
		// private properties
		var hash = window.location.hash;
		var state = '';
		
		// private methods
		function popStateHandler(e) {
			hash = window.location.hash;
			state = e.state;
		}
		
		// priviledged properties
		
		// priviledged methods
		that.getHash = function () {
			return hash;
		}
		
		that.setHash = function (hash, title, state) {
			var old = { hash: that.getHash(), state: that.getState() };
			
			if (old.hash != hash) {
				history.pushState(title, state, hash);
				
				window.dispatchEvent(new PopStateEvent('popstate', { state: state }));
				that.dispatchEvent('change', { previousHash: old.hash, previousState: old.state });
			}
		}
		
		that.getState = function () {
			return state;
		}
		
		// constructor
		window.addEventListener('popstate', popStateHandler);
	}
	Address.inherits(com.magadanski.EventDispatcher);
	com.magadanski.Address = Address;
	
	// public methods
})();
