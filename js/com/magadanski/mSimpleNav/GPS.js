com.magadanski.mSimpleNav.GPS;

//////////////////////////////////////
// GPS Class Implementation //////////
//////////////////////////////////////
(function () {
	// import class
	var GPS = function (enableHighAccuracy) {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		if (typeof(enableHighAccuracy) == 'undefined') {
			enableHighAccuracy = true;
		}
		
		that.highAccuracy = !!enableHighAccuracy;
		
		if (navigator.geolocation) {
			currentLocationTimeout = navigator.geolocation.watchPosition(function (position) {
				that.position = new LatLon(position.coords.latitude, position.coords.longitude);
				
				that.dispatchEvent('positionChange', {
					message: 'device position has changed',
					lat: that.position.lat(),
					lng: that.position.lon()
				});
			}, function () {
				that.dispatchEvent('positionFault', {
					message: 'no information on device position'
				});
			}, { enableHighAccuracy: !!that.highAccuracy });
		}
	}
	GPS.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.GPS = GPS;
	
	// public properties
	GPS.prototype.position = null;
	GPS.prototype.highAccuracy = true;
	
	// public methods
	GPS.prototype.getDistanceTo = function (destination) {
		var that = this;
		var distance = '';
		
		if (that.position instanceof LatLon && destination instanceof LatLon) {
			distance = that.position.distanceTo(destination);
		}
		
		return distance;
	}
	
	GPS.prototype.getBearingTo = function (destination) {
		var that = this;
		var bearing = 0;
		
		if (that.position instanceof LatLon && destination instanceof LatLon) {
			bearing = that.position.bearingTo(destination);
		}
		
		return bearing;
	}
})();
