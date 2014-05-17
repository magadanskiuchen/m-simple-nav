com.magadanski.mSimpleNav.MSimpleNav;

//////////////////////////////////////
// MSimpleNav Class Implementation ///
//////////////////////////////////////
(function () {
	// import class
	var MSimpleNav = function () {
		var that = this;
		
		// private properties
		var gps;
		var compass;
		var displayBearing;
		
		var tables = {
			'locations': {
				id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
				name: { type: 'TEXT' },
				lat: { type: 'TEXT' },
				lng: { type: 'TEXT' }
			}
		}
		
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
		
		function onGeocoded(e) {
			switch (e.status) {
				case google.maps.GeocoderStatus.OK:
					// Bookmark address capabilities
					var location = e.result[0].geometry.location;
					
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
		}
		
		// constructor
		geocoder = new google.maps.Geocoder();
		gps = new com.magadanski.mSimpleNav.GPS(true);
		compass = new com.magadanski.mSimpleNav.Compass();
		storage = new com.magadanski.mSimpleNav.Storage(tables);
		
		that.addEventListener('geocoded', onGeocoded);
		
		render();
	}
	MSimpleNav.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.MSimpleNav = MSimpleNav;
	
	// helper properties
	var destination;
	var geocoder;
	var storage;
	
	// public properties
	
	// public methods
	MSimpleNav.prototype.setDestination = function (lat, lng) {
		var that = this;
		
		// normalize lat and lng values
		while (lat > 90) { lat -= 180; }
		while (lat < -90) { lat += 180; }
		while (lng > 180) { lng -= 360; }
		while (lng < -180) { lat += 360; }
		
		destination = new LatLon(lat, lng);
		
		that.dispatchEvent('destinationChange', {
			message: 'destination has changed',
			lat: lat,
			lng: lng
		});
	}
	
	MSimpleNav.prototype.geocode = function (address) {
		var that = this;
		
		// TODO: i18n
		geocoder.geocode({ address: address }, function (result, status) {
			that.dispatchEvent('geocoded', { result: result, status: status });
		});
	}
	
	MSimpleNav.prototype.saveLocation = function (name, lat, lng) {
		var that = this;
		
		var location = { name: name, lat: lat, lng: lng };
		
		storage.add('locations', location, function (tx, results) {
			that.dispatchEvent('locationsUpdated', { results: results });
		});
	}
	
	MSimpleNav.prototype.getLocations = function (callback) {
		storage.get('locations', {}, callback);
	}
})();
