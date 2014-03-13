com.magadanski.mSimpleNav.GPS;

//////////////////////////////////////
// GPS Class Implementation //////////
//////////////////////////////////////
(function () {
	// import class
	var that;
	var GPS = function (enableHighAccuracy) {
		that = this;
		
		if (typeof(enableHighAccuracy) == 'undefined') {
			enableHighAccuracy = true;
		}
		
		that.highAccuracy = !!enableHighAccuracy;
		updateLocation();
	}
	GPS.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.GPS = GPS;
	
	// private properties
	var location,
		timeout = 2000;
	
	// public properties
	GPS.prototype.highAccuracy = true;
	
	// private methods
	function updateLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				location = new LatLon(position.coords.latitude, position.coords.longitude);
				
				that.dispatchEvent('locationChange', {
					message: 'device location has changed',
					lat: lat,
					lng: lng
				});
				
				setTimeout(function () {
					// make new request no sooner than timeout AND next frame render
					requestAnimationFrame(updateLocation);
				}, timeout);
			}, function () {
				setTimeout(function () {
					// make new request no sooner than timeout AND next frame render
					requestAnimationFrame(updateLocation);
				}, timeout);
			}, { enableHighAccuracy: !!that.highAccuracy });
		}
	}
	
	// public methods
	GPS.prototype.getDistanceTo = function (destination) {
		var distance = '';
		
		if (location instanceof LatLon && destination instanceof LatLon) {
			distance = location.distanceTo(destination);
		}
		
		return distance;
	}
	
	GPS.prototype.getBearingTo = function (destination) {
		var bearing = 0;
		
		if (location instanceof LatLon && destination instanceof LatLon) {
			bearing = location.bearingTo(destination);
		}
		
		return bearing;
	}
})();