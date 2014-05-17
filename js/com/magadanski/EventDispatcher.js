com.magadanski.EventDispatcher;

//////////////////////////////////////////
// EventDispatcher Class Implementation //
//////////////////////////////////////////
(function () {
	// import class
	var that;
	var EventDispatcher = function () {
		that = this;
	}
	com.magadanski.EventDispatcher = EventDispatcher;
	
	// private properties
	
	// public properties
	EventDispatcher.prototype.events = {};
	
	// private methods
	
	// public methods
	EventDispatcher.prototype.addEventListener = function (eventType, callback) {
		var that = this;
		
		if (typeof(eventType.split) != 'undefined') {
			eventType = eventType.split(',');
		}
		
		for (var e in eventType) {
			var eventName = eventType[e].replace(/\s/, '');
			
			if (typeof(that.events[eventName]) == 'undefined') {
				that.events[eventName] = [];
			}
			
			that.events[eventName].push(callback);
		}
	}
	
	EventDispatcher.prototype.dispatchEvent = function (eventType, eventObj) {
		var that = this;
		
		if (typeof(eventObj) == 'undefined') {
			eventObj = {};
		}
		
		if (typeof(that.events[eventType]) == 'object') {
			for (var callback in that.events[eventType]) {
				eventObj.type = eventType;
				eventObj.currentTarget = this;
				
				if (typeof(that.events[eventType][callback]) == 'function') {
					that.events[eventType][callback](eventObj);
				}
			}
		}
	}
})();
