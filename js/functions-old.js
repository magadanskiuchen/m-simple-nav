// define packages
var com = typeof(com) == 'undefined' ? {} : com;
var com.magadanski = typeof(com.magadanski) == 'undefined' ? {} : com.magadanski;
var com.magadanski.mSimpleNav = typeof(com.magadanski.mSimpleNav) == 'undefined' ? {} : com.magadanski.mSimpleNav;

// class instantiation (header)
var com.magadanski.mSimpleNav.GPS = function () {},
	com.magadanski.mSimpleNav.Compass = function () {},
	com.magadanski.mSimpleNav.MSimpleNav = function () {};

//////////////////////////////////////
// GPS Class Implementation //////////
//////////////////////////////////////
(function () {
	// import class
	var GPS = com.magadanski.mSimpleNav.GPS;
	var that = this;
	
	// private properties
	var currentLocation,
		currentLocationTimeout,
		destination,
		distance;
	
	// public properties
	this.enableHighAccuracy = true;
	
	// private methods
	function setCurrentLocation(lat, lng) {
		currentLocation = new LatLon(lat, lng);
		
		that.dispatchEvent(new CustomEvent('locationchange', {
			detail: {
				message: 'GPS location has changed',
				time: new Date(),
				locationType: 'current',
				lat: lat,
				lng: lng
			},
			bubbles: true,
			cancelable: true
		}));
	}
	
	function onLocationChange(e) {
		if (currentLocation instanceof LatLon && destination instanceof LatLon) {
			distance = currentLocation.distanceTo(destination);
			
			that.dispatchEvent(new CustomEvent('distancechange', {
				detail: {
					message: 'Distance between current location and destination has changed',
					time: new Date(),
					distance: distance
				},
				bubbles: true,
				cancelable: true
			}));
		}
	}
	
	// public methods
	this.init = function () {
		if (navigator.geolocation) {
			// TODO: don't watchPosition -- use request timeout with delf invocation
			currentLocationTimeout = navigator.geolocation.watchPosition(function (position) {
				setCurrentLocation(position.coords.latitude, position.coords.longitude);
			}, function () {
				// do nothing
			}, { enableHighAccuracy: !!that.enableHighAccuracy }); // "!!" -- make sure value is boolean
		}
		
		that.addEventListener('locationchange', onLocationChange);
	};
	
	this.deinit = function () {
		if (currentLocationTimeout && navigator.geolocation) {
			navigator.geolocation.clearWatch(currentLocationTimeout);
		}
		
		that.removeEventListener('locationchange');
	}
	
	this.setDestination = function (lat, lng) {
		destination = new LatLon(lat, lng);
		
		that.dispatchEvent(new CustomEvent('locationchange', {
			detail: {
				message: 'GPS location has changed',
				time: new Date(),
				locationType: 'destination',
				lat: lat,
				lng: lng
			},
			bubbles: true,
			cancelable: true
		}));
	};
	
	this.getDestinationBearing = function () {
		var bearing = 0;
		
		if (currentLocation instanceof LatLon && destination instanceof LatLon) {
			bearing = currentLocation.bearingTo(destination);
		}
		
		return bearing;
	};
	
	// constructor
	GPS.prototype = function (enableHighAccuracy) {
		if (typeof(enableHighAccuracy) != 'undefined') {
			that.enableHighAccuracy = enableHighAccuracy;
		}
		
		that.init();
	};
})();

//////////////////////////////////////
// Compass Class Implementation //////
//////////////////////////////////////
(function () {
	// import class
	var Compass = com.magadanski.mSimpleNav.Compass;
	var that = this;
	
	// private properties
	var compassHeading = 0,
		deviceBearing = 0,
		deviceTilt = 0,
		tiltProperty = 'beta';
	
	// public properties
	this.gps = new com.magadanski.mSimpleNav.GPS;
	
	// private methods
	
	// public methods
	this.init = function () {
		that.gps.init();
		
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function (e) {
				if (e.absolute) {
					deviceBearing = -e.alpha;
				} else if (typeof(e.webkitCompassHeading) != 'undefined') {
					deviceBearing = e.webkitCompassHeading;
				}
				
				deviceTilt = e[tiltProperty] * tiltQuantifier;
				
				that.dispatchEvent(new CustomEvent('compassupdate', {
					detail: {
						message: 'compass data has changed',
						time: new Date(),
						deviceBearing: deviceBearing,
						deviceTilt: deviceTilt,
					},
					bubbles: true,
					cancelable: true
				}));
			}, false);
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
	};
	
	this.getBearing = function () {
		var destinationBearing = that.gps.getDestinationBearing();
		var newCompassBearing = destinationBearing - deviceBearing;
		
		if ( Math.abs( compassHeading - newCompassBearing ) < Math.abs( 360 + compassHeading - newCompassBearing ) ) {
			compassHeading = newCompassBearing;
		} else {
			compassHeading = newCompassBearing - 360;
		}
		
		return compassHeading;
	};
	
	this.deinit = function () {
		that.gps.deinit();
		window.removeEventListener('deviceorientation');
		window.removeEventListener('orientationchange');
	};
	
	// constructor
	Compass.prototype = function () {
		that.init();
	};
})();

//////////////////////////////////////
// MSimpleNav Class implementation ///
//////////////////////////////////////
(function () {
	// import class
	var MSimpleNav = com.magadanski.mSimpleNav.MSimpleNav;
	var that = this;
	
	// private properties
	var compass,
		addressForm,
		coordinatesForm,
		distanceLabel;
	
	// public properties
	
	// private methods
	
	// public methods
	this.setAddressForm = function (id) {
		addressForm = document.getElementById(id);
		
		addressForm.addEventListener('submit', function (e) {
			e.preventDefault();
			
			if (typeof(google) != 'undefined' && typeof(google.maps) != 'undefined' && typeof(google.maps.Geocoder) != 'undefined') {
				geocoder = new google.maps.Geocoder();
				
				geocoder.geocode({ address: form.querySelector('input[type="text"]').value }, function (result, status) {
					switch (status) {
						case google.maps.GeocoderStatus.OK:
							var location = result[0].geometry.location;
							
							if (typeof(coordinatesForm) != 'undefined') {
								coordinatesForm.querySelector('.lat').value = location.lat();
								coordinatesForm.querySelector('.lng').value = location.lng();
							}
							
							that.searchByCoordinates(location.lat(), location.lng());
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
			} else {
				alert('You cannot currently search by address. Try a direct GPS coordinates search');
			}
		});
	};
	
	this.setCoordinatesForm = function (id) {
		coordinatesForm = document.getElementById(id);
		
		coordinatesForm.addEventListener('submit', function (e) {
			e.preventDefault();
			that.searchByCoordinates(coordinatesForm.querySelector('.lat').value, coordinatesForm.querySelector('.lng').value);
		});
	};
	
	this.setDistanceLabel = function (id) {
		distanceLabel = document.getElementById(id);
	}
	
	this.searchByCoordinates = function (lat, lng) {
		compass.gps.setDestination(lat, lng);
	};
	
	// constructor
	MSimpleNav.prototype = function () {
		compass = new com.magadanski.mSimpleNav.Compass();
		
		compass.gps.addEventListener('distancechange', function (e) {
			distanceLabel.innerText = e.distance + ' km';
		});
		
		document.addEventListener('DOMContentLoaded', function (e) {
			// stupid iOS7
			if (navigator.userAgent.match(/CPU\sOS\s7_/)) {
				document.body.style.paddingTop = '24px';
			}
		});
		
		document.addEventListener('pause', function (e) {
			compass.deinit();
		}, false);
		
		document.addEventListener('resume', function (e) {
			compass.init();
		}, false);
	};
})();

var app = new com.magadanski.mSimpleNav.MSimpleNav();
app.setAddressForm('address-form');
app.setCoordinatesForm('coordinates-form');
add.setDistanceLabel('distance');

window.applicationCache.addEventListener('updateready', function (e) {
	window.applicationCache.swapCache();
}, false);










var simpleNav;

function mSimpleNav() {
	function render() {
		if (currentLocation instanceof LatLon && destination instanceof LatLon) {
			document.getElementById('compass').style.webkitTransform = 'rotateX(' + deviceTilt + 'deg) rotateZ(' + getCompassBearing() + 'deg)';
		}
	}
}