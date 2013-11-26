var simpleNav;

window.applicationCache.addEventListener('updateready', function (e) {
	window.applicationCache.swapCache();
}, false);

function mSimpleNav() {
	var currentLocation, destination,
		destinationBearing, deviceBearing = 0, compassBearing = 0,
		deviceTilt = 0, tiltProperty = 'beta', tiltQuantifier = 1,
		currentLocationTimeout, deviceBearingTimeout,
		intervalDelay = 100;
	
	function setSensorListeners() {
		if (navigator.geolocation) {
			currentLocationTimeout = navigator.geolocation.watchPosition(function (position) {
				setCurrentLocation(position.coords.latitude, position.coords.longitude);
			}, function () {
				// do nothing
			}, { enableHighAccuracy: true });
		}
		
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function (e) {
				if (e.absolute) {
					compassHeading = -e.alpha;
				} else if (typeof(e.webkitCompassHeading) != 'undefined') {
					compassHeading = e.webkitCompassHeading;
				}
				
				if (typeof(compassHeading)) {
					setDeviceBearing(compassHeading);
				}
				
				setDeviceTilt(e[tiltProperty] * tiltQuantifier);
			}, false);
		}
		
		window.addEventListener('orientationchange', function (e) {
			if (window.orientation == 90 || window.orientation == -90) {
				tiltProperty = 'gamma';
				if (window.orientation == 90) {
					tiltQuantifier = -1;
				} else {
					tiltQuantifier = 1;
				}
			} else {
				tiltProperty = 'beta';
				tiltQuantifier = 1;
			}
		});
	}
	
	function removeSensorListeners() {
		navigator.geolocation.clearWatch(currentLocationTimeout);
		navigator.compass.clearWatch(deviceBearingTimeout);
	}
	
	function setCurrentLocation(lat, lng) {
		currentLocation = new LatLon(lat, lng);
		render();
	}
	
	function setDeviceBearing(bearing) {
		deviceBearing = bearing;
		render();
	}
	
	function setDeviceTilt(tilt) {
		deviceTilt = tilt;
		render();
	}
	
	function setDestinationBearing() {
		if (currentLocation instanceof LatLon && destination instanceof LatLon) {
			destinationBearing = currentLocation.bearingTo(destination);
			render();
		}
	}
	
	function getCompassBearing() {
		var newCompassBearing = destinationBearing - deviceBearing;
		
		if ( Math.abs( compassBearing - newCompassBearing ) < Math.abs( 360 + compassBearing - newCompassBearing ) ) {
			compassBearing = newCompassBearing;
		} else {
			compassBearing = newCompassBearing - 360;
		}
		
		return compassBearing;
	}
	
	function render() {
		if (currentLocation instanceof LatLon && destination instanceof LatLon) {
			document.getElementById('distance').innerText = currentLocation.distanceTo(destination) + ' km';
			document.getElementById('compass').style.webkitTransform = 'rotateX(' + deviceTilt + 'deg) rotateZ(' + getCompassBearing() + 'deg)';
		}
	}
	
	mSimpleNav.prototype.setDestination = function (lat, lng) {
		destination = new LatLon(lat, lng);
		setDestinationBearing();
	}
	
	setSensorListeners();
	document.addEventListener('pause', removeSensorListeners, false);
	document.addEventListener('resume', setSensorListeners, false);
}

document.addEventListener('DOMContentLoaded', function (e) {
	// stupid iOS7
	if (navigator.userAgent.match(/CPU\sOS\s7_/)) {
		document.body.style.paddingTop = '24px';
	}
	
	var geocoder;
	
	simpleNav = new mSimpleNav();
	
	document.getElementById('address-form').addEventListener('submit', function (e) {
		e.preventDefault();
		
		if (typeof(google) != 'undefined' && typeof(google.maps) != 'undefined' && typeof(google.maps.Geocoder) != 'undefined') {
			geocoder = new google.maps.Geocoder();
			
			geocoder.geocode({ address: document.getElementById('address').value }, function (result, status) {
				switch (status) {
					case google.maps.GeocoderStatus.OK:
						var location = result[0].geometry.location;
						
						document.getElementById('lat').value = location.lat();
						document.getElementById('lng').value = location.lng();
						
						searchByCoordinates();
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
	
	document.getElementById('coordinates-form').addEventListener('submit', function (e) {
		e.preventDefault();
		searchByCoordinates();
	});
	
	function searchByCoordinates() {
		simpleNav.setDestination(document.getElementById('lat').value, document.getElementById('lng').value);
	}
});