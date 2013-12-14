// define packages
com = typeof(com) == 'undefined' ? {} : com;
com.magadanski = typeof(com.magadanski) == 'undefined' ? {} : com.magadanski;
com.magadanski.mSimpleNav = typeof(com.magadanski.mSimpleNav) == 'undefined' ? {} : com.magadanski.mSimpleNav;

// class instantiation (header)
com.magadanski.mSimpleNav.GPS,
com.magadanski.mSimpleNav.Compass,
com.magadanski.mSimpleNav.MSimpleNav;

//////////////////////////////////////
// GPS Class Implementation //////////
//////////////////////////////////////
(function () {
	// import class
	var that;
	var GPS = function (enableHighAccuracy) {
		that = this;
		
		that.highAccuracy = !!enableHighAccuracy;
		updateLocation();
	}
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
				
				// TODO: add cutom event dispatch capabilities
				// that.dispatchEvent(new CustomEvent('locationChange', {
				// 	detail: {
				// 		message: 'device location has changed',
				// 		lat: lat,
				// 		lng: lng
				// 	},
				// 	bubbles: true,
				// 	cancelable: true
				// }));
				
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

//////////////////////////////////////
// Compass Class Implementation //////
//////////////////////////////////////
(function () {
	// import Class
	var that;
	var Compass = function () {
		that = this;
		
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function (e) {
				if (e.absolute) {
					compassHeading = -e.alpha;
				} else if (typeof(e.webkitCompassHeading) != 'undefined') {
					compassHeading = e.webkitCompassHeading;
				}
				
				tilt = e[tiltProperty] * tiltQuantifier;
				
				// TODO: add cutom event dispatch capabilities
				// that.dispatchEvent(new CustomEvent('compassupdate', {
				// 	detail: {
				// 		message: 'compass data has changed',
				// 		deviceBearing: compassHeading,
				// 		deviceTilt: tilt,
				// 	},
				// 	bubbles: true,
				// 	cancelable: true
				// }));
			});
		}
		
		window.addEventListener('orientationchange', function (e) {
			if (window.orientation == 90 || window.orientation == -90) {
				tiltProperty = 'gamma';
			} else {
				tiltProperty = 'beta';
			}
			
			if (window.orientation > 0) {
				tiltQuantifier = -1;
			} else {
				tiltQuantifier = 1;
			}
		});
	}
	com.magadanski.mSimpleNav.Compass = Compass;
	
	// private properties
	var compassHeading = 0,
		tilt = 0,
		tiltProperty = 'beta',
		tiltQuantifier = 1;
	
	// public properties
	
	// private methods
	
	// public methods
	Compass.prototype.getDeviceBearing = function () {
		return compassHeading;
	}
	
	Compass.prototype.getDeviceTilt = function () {
		return tilt;
	}
})();

//////////////////////////////////////
// MSimpleNav Class Implementation ///
//////////////////////////////////////
(function () {
	// import class
	var that;
	var MSimpleNav = function () {
		that = this;
		
		geocoder = new google.maps.Geocoder();
		gps = new com.magadanski.mSimpleNav.GPS(true);
		compass = new com.magadanski.mSimpleNav.Compass();
		
		render();
	}
	com.magadanski.mSimpleNav.MSimpleNav = MSimpleNav;
	
	// private properties
	var destination,
		geocoder,
		gps,
		compass,
		displayBearing;
	
	// public properties
	
	// private methods
	function render() {
		var newBearing = gps.getBearingTo(destination) - compass.getDeviceBearing();
		
		if ( Math.abs( displayBearing - newBearing ) < Math.abs( 360 + displayBearing - newBearing ) ) {
			displayBearing = newBearing;
		} else {
			displayBearing = newBearing - 360;
		}
		
		document.getElementById('distance').innerText = gps.getDistanceTo(destination) + ' km';
		document.getElementById('compass').style.webkitTransform = 'rotateX(' + compass.getDeviceTilt() + 'deg) rotateZ(' + displayBearing + 'deg)';
		
		requestAnimationFrame(render);
	}
	
	// public methods
	MSimpleNav.prototype.setDestination = function (lat, lng) {
		// normalize lat and lng values
		while (lat > 90) { lat -= 180; }
		while (lat < -90) { lat += 180; }
		while (lng > 180) { lng -= 360; }
		while (lng < -180) { lat += 360; }
		
		destination = new LatLon(lat, lng);
		
		// TODO: add cutom event dispatch capabilities
		// that.dispatchEvent(new CustomEvent('destinationChange', {
		// 	detail: {
		// 		message: 'destination has changed',
		// 		lat: lat,
		// 		lng: lng
		// 	},
		// 	bubbles: true,
		// 	cancelable: true
		// }));
	}
	
	MSimpleNav.prototype.geocode = function (address) {
		// TODO: i18n
		geocoder.geocode({ address: address }, function (result, status) {
			switch (status) {
				case google.maps.GeocoderStatus.OK:
					// Bookmark address capabilities
					var location = result[0].geometry.location;
					
					that.setDestination(location.lat(), location.lng());
					break;
				case google.maps.GeocoderStatus.ERROR:
					alert('Cannot get coordinates for location. Check your internet connection.');
					break;
				case google.maps.GeocoderStatus.INVALID_REQUEST:
					alert('Contact the developer and let them know that an invalid request error occured.');
					break;
				case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
					alert('You have made too many queries for too short time. Try again in 10 minutes.');
					break;
				case google.maps.GeocoderStatus.REQUEST_DENIED:
					alert('Contact the developer and let them know that a request denied error occured.');
					break;
				case google.maps.GeocoderStatus.UNKNOWN_ERROR:
					alert('Ooops, we could not find what you were looking for. Please try again.');
					break;
				case google.maps.GeocoderStatus.ZERO_RESULTS:
					alert('No results were found for that address. Please try modifying that and searching again.');
					break;
			}
		});
	}
})();

document.addEventListener('DOMContentLoaded', function (e) {
	var app = new com.magadanski.mSimpleNav.MSimpleNav();
	var addressForm = document.getElementById('address-form');
	var coordinatesForm = document.getElementById('coordinates-form');
	
	coordinatesForm.addEventListener('submit', function (e) {
		e.preventDefault();
		app.setDestination(document.getElementById('lat').value, document.getElementById('lng').value);
	});
	
	addressForm.addEventListener('submit', function (e) {
		e.preventDefault();
		app.geocode(document.getElementById('address').value);
	});
	
	// stupid iOS7
	if (navigator.userAgent.match(/CPU\sOS\s7_/)) {
		document.body.style.paddingTop = '24px';
	}
});