com.magadanski.mSimpleNav.GPS;

//////////////////////////////////////
// GPS Class Implementation //////////
//////////////////////////////////////
(function () {
	// import class
	var GPS = function (enableHighAccuracy) {
		var that = this;
		
		if (typeof(enableHighAccuracy) == 'undefined') {
			enableHighAccuracy = true;
		}
		
		that.highAccuracy = !!enableHighAccuracy;
		
		function updateLocation() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function (position) {
					that.location = new LatLon(position.coords.latitude, position.coords.longitude);
					
					that.dispatchEvent('locationChange', {
						message: 'device location has changed',
						lat: that.location.lat(),
						lng: that.location.lon()
					});
				}, function () {
					that.dispatchEvent('locationFault', {
						message: 'no information on device location'
					});
				}, { enableHighAccuracy: !!that.highAccuracy });
			}
		}
		
		that.addEventListener('locationChange, locationFault', function (e) {
			setTimeout(function () {
				// make new request no sooner than timeout AND next frame render
				requestAnimationFrame(updateLocation);
			}, timeout);
		});
		
		updateLocation();
	}
	GPS.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.GPS = GPS;
	
	// private properties
	var timeout = 2000;
	
	// public properties
	GPS.prototype.location = null;
	GPS.prototype.highAccuracy = true;
	
	// private methods
	
	// public methods
	GPS.prototype.getDistanceTo = function (destination) {
		var that = this;
		var distance = '';
		
		if (that.location instanceof LatLon && destination instanceof LatLon) {
			distance = that.location.distanceTo(destination);
		}
		
		return distance;
	}
	
	GPS.prototype.getBearingTo = function (destination) {
		var that = this;
		var bearing = 0;
		
		if (that.location instanceof LatLon && destination instanceof LatLon) {
			bearing = that.location.bearingTo(destination);
		}
		
		return bearing;
	}
})();
