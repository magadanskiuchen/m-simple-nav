// define packages
com = typeof(com) == 'undefined' ? {} : com;
com.magadanski = typeof(com.magadanski) == 'undefined' ? {} : com.magadanski;
com.magadanski.mSimpleNav = typeof(com.magadanski.mSimpleNav) == 'undefined' ? {} : com.magadanski.mSimpleNav;

// JS class inheritance
Function.prototype.inherits = function (parent) {
	if (parent.constructor == Function) {
		//Normal Inheritance
		this.prototype = new parent;
		this.prototype.constructor = this;
		this.prototype.parent = parent.prototype;
	} else {
		//Pure Virtual Inheritance
		this.prototype = parent;
		this.prototype.constructor = this;
		this.prototype.parent = parent;
	}
	
	return this;
}

// class instantiation (header)
com.magadanski.EventDispatcher,
com.magadanski.mSimpleNav.GPS,
com.magadanski.mSimpleNav.Compass,
com.magadanski.mSimpleNav.Storage,
com.magadanski.mSimpleNav.MSimpleNav;

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
		if (typeof(events[eventType]) == 'undefined') events[eventType] = [];
		
		events[eventType].push(callback);
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
				
				that.dispatchEvent('compassupdate', {
					message: 'compass data has changed',
					deviceBearing: compassHeading,
					deviceTilt: tilt
				});
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
	Compass.inherits(com.magadanski.EventDispatcher);
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
// Storage Class Implementation //////
//////////////////////////////////////
(function () {
	// import class
	var that;
	var Storage = function (tables) {
		that = this;
		
		db = openDatabase('mSimpleNavFavorites', '1.0', 'M Simple Nav Favorites', 2*1024*1024);
		db.transaction(function (tx) {
			// database created callback
			if (typeof(tables) != 'undefined') {
				// cycle through all tables in object
				for (var t in tables) {
					var fields = [];
					var prop = '';
					
					// cycle through all fields in table
					for (var p in tables[t]) {
						prop = p;
						
						// check if field should be unique
						if (tables[t][p].unique) {
							prop += ' unique';
						}
						
						fields.push(prop);
					}
					
					q = fields.join(', ');
					
					// create table with associated fields
					tx.executeSql('CREATE TABLE IF NOT EXISTS ' + t + '(' + q + ')', null, function (tx, results) {
						// success
					}, function (tx, error) {
						alert('There was an error with setting up favorites data storage. Please contact the developer.');
					});
				}
			}
		});
	}
	Storage.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Storage = Storage;
	
	// private properties
	var db;
	
	// public properties
	
	// private methods
	function getPlaceholder(values) {
		return Array(values.length + 1).join('?').split('').join(', ');
	}
	
	// public methods
	Storage.prototype.add = function (table, entry) {
		db.transaction(function (tx) {
			var fields = [];
			var values = [];
			
			for (var p in entry) {
				fields.push(p);
				values.push(entry[p]);
			}
			
			var fq = getPlaceholder(fields);
			var vq = getPlaceholder(values);
			
			tx.executeSql('INSERT INTO ?(' + fq + ') VALUES(' + vq + ')', [table].concat(fields).concat(values), function (tx, results) {
				// success
			}, function (tx, error) {
				console.log(tx, error);
			});
		});
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
		storage = new com.magadanski.mSimpleNav.Storage(tables);
		
		that.addEventListener('geocoded', onGeocoded);
		
		render();
	}
	MSimpleNav.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.MSimpleNav = MSimpleNav;
	
	// private properties
	var destination,
		geocoder,
		gps,
		compass,
		storage,
		displayBearing;
	
	var tables = {
		'locations': { id: { unique: true }, name: {}, lat: {}, lng: {} }
	}
	
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
	
	// public methods
	MSimpleNav.prototype.setDestination = function (lat, lng) {
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
		// TODO: i18n
		geocoder.geocode({ address: address }, function (result, status) {
			that.dispatchEvent('geocoded', { result: result, status: status });
		});
	}
	
	MSimpleNav.prototype.saveLocation = function (name, lat, lng) {
		var location = { name: name, lat: lat, lng: lng };
		
		storage.add('locations', location);
		that.dispatchEvent('locationsUpdated');
	}
})();

document.addEventListener('DOMContentLoaded', function (e) {
	var app = new com.magadanski.mSimpleNav.MSimpleNav();
	var addressForm = document.getElementById('address-form');
	var coordinatesForm = document.getElementById('coordinates-form');
	var favoritesForm = document.getElementById('favorites-form');
	
	coordinatesForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		app.setDestination(document.getElementById('lat').value, document.getElementById('lng').value);
	});
	
	addressForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		app.addEventListener('geocoded', function (e) {
			var location = e.result[0].geometry.location;
			
			document.getElementById('lat').value = location.lat();
			document.getElementById('lng').value = location.lng();
		});
		
		app.geocode(document.getElementById('address').value);
	});
	
	favoritesForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		var name = prompt('Name this location', document.getElementById('address').value);
		var lat = document.getElementById('lat').value;
		var lng = document.getElementById('lng').value;
		
		app.saveLocation(name, lat, lng);
	});
	
	// stupid iOS7
	if (navigator.userAgent.match(/CPU\sOS\s7_/)) {
		document.body.style.paddingTop = '24px';
	}
});