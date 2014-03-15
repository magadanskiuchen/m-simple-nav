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
	var events = {};
	
	// public properties
	
	// private methods
	
	// public methods
	EventDispatcher.prototype.addEventListener = function (eventType, callback) {
		if (typeof(eventType.split) != 'undefined') {
			eventType = eventType.split(',');
		}
		
		for (var e in eventType) {
			var eventName = eventType[e].replace(/\s/, '');
			
			if (typeof(events[eventName]) == 'undefined') {
				events[eventName] = [];
			}
			
			events[eventName].push(callback);
		}
	}
	
	EventDispatcher.prototype.dispatchEvent = function (eventType, eventObj) {
		if (typeof(eventObj) == 'undefined') {
			eventObj = {};
		}
		
		if (typeof(events[eventType]) == 'object') {
			for (var callback in events[eventType]) {
				eventObj.type = eventType;
				eventObj.currentTarget = this;
				
				if (typeof(events[eventType][callback]) == 'function') {
					events[eventType][callback](eventObj);
				}
			}
		}
	}
})();
