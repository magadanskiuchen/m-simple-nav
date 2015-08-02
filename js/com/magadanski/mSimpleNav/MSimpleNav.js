com.magadanski.mSimpleNav.MSimpleNav;

//////////////////////////////////////
// MSimpleNav Class Implementation ///
//////////////////////////////////////
(function () {
	// import functions and classes
	var that;
	var getFullHeight = com.magadanski.utils.getFullHeight;
	var extendOptions = com.magadanski.utils.extendOptions;
	
	var MSimpleNav = function (options) {
		that = this;
		
		// private properties
		var defaultOptions = {
			views: false
		};
		options = extendOptions(defaultOptions, options);
		
		var tables = {
			'locations': {
				id: { type: 'INTEGER', primaryKey: true, autoIncrement: true },
				name: { type: 'TEXT' },
				lat: { type: 'TEXT' },
				lng: { type: 'TEXT' }
			}
		}
		
		var views = new com.magadanski.DOMCollection(options.views);
		var activeView = false;
		var activeViewIndex = 0;
		
		// private methods
		function render() {
			var newBearing = that.gps.getBearingTo(that.destination) - that.compass.getDeviceBearing();
			
			if ( Math.abs( that.displayBearing - newBearing ) < Math.abs( 360 + that.displayBearing - newBearing ) ) {
				that.displayBearing = newBearing;
			} else {
				that.displayBearing = newBearing - 360;
			}
			
			document.getElementById('distance').innerText = that.gps.getDistanceTo(that.destination) + ' km';
			document.getElementById('compass').style.webkitTransform = 'rotateZ(' + that.displayBearing + 'deg)';
			
			setTimeout(render, 100);
		}
		
		function onGeocoded(e) {
			switch (e.status) {
				case google.maps.GeocoderStatus.OK:
					// Bookmark address capabilities
					var location = e.result[0].geometry.location;
					
					that.setDestination(location.lat(), location.lng());
					break;
				case google.maps.GeocoderStatus.ERROR:
					alert(i18n.geocode_error);
					break;
				case google.maps.GeocoderStatus.INVALID_REQUEST:
					alert(i18n.geocode_invalid_request);
					break;
				case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
					alert(i18n.geocode_over_query_limit);
					break;
				case google.maps.GeocoderStatus.REQUEST_DENIED:
					alert(i18n.geocode_request_denied);
					break;
				case google.maps.GeocoderStatus.UNKNOWN_ERROR:
					alert(i18n.geocode_unknown_error);
					break;
				case google.maps.GeocoderStatus.ZERO_RESULTS:
					alert(i18n.geocode_zero_results);
					break;
			}
		}
		
		function onLocationsLoaded(results) {
			var newData = [];
			
			for (var i = 0; i < results.rows.length; i++) {
				newData.push(results.rows.item(i));
			}
			
			that.favoriteLocations.setData(newData);
		}
		
		function onLocationsUpdated(e) {
			that.getLocations(onLocationsLoaded);
		}
		
		// priviledged properties
		that.gps;
		that.compass;
		that.displayBearing;
		that.destination;
		that.geocoder;
		that.storage;
		that.favoriteLocations;
		
		// priviledged methods
		this.addView = function (view) {
			views.elements.push(view);
		}
		
		this.getView = function (i) {
			var view = false;
			
			if (typeof(views.elements[i]) !== 'undefined') {
				view = views.elements[i];
			}
			
			return view;
		}
		
		this.getViews = function () {
			return views;
		}
		
		this.updateViewArea = function (e) {
			activeView = (typeof(e) !== 'undefined') ? views.filter(e.currentTarget.getHash()).elements[0] : views.elements[0];
			
			var i = 0;
			
			views.each(function (j, view) {
				if (view.getAttribute('id') == activeView.getAttribute('id')) {
					i = j;
				}
			});
			
			view.style.transform = 'translateX(-' + (100 * i * (1 / views.elements.length)) + '%)';
			view.style.height = getFullHeight(activeView) + 'px';
		}
		
		// constructor
		that.geocoder = new google.maps.Geocoder();
		that.gps = new com.magadanski.mSimpleNav.GPS(true);
		that.compass = new com.magadanski.mSimpleNav.Compass();
		that.storage = new com.magadanski.mSimpleNav.Storage(tables);
		that.favoriteLocations = new com.magadanski.mSimpleNav.LocationsDataList();
		
		that.addEventListener('geocoded', onGeocoded);
		that.addEventListener('locationsUpdated', onLocationsUpdated);
		
		that.getLocations(onLocationsLoaded);
		
		render();
		that.updateViewArea();
	}
	MSimpleNav.inherits(com.magadanski.App);
	com.magadanski.mSimpleNav.MSimpleNav = MSimpleNav;
	
	// public methods
	MSimpleNav.prototype.setDestination = function (lat, lng) {
		var that = this;
		
		// normalize lat and lng values
		while (lat > 90) { lat -= 180; }
		while (lat < -90) { lat += 180; }
		while (lng > 180) { lng -= 360; }
		while (lng < -180) { lat += 360; }
		
		that.destination = new LatLon(lat, lng);
		
		that.dispatchEvent('destinationChange', {
			message: 'destination has changed',
			lat: lat,
			lng: lng
		});
	}
	
	MSimpleNav.prototype.geocode = function (address) {
		var that = this;
		
		that.geocoder.geocode({ address: address }, function (result, status) {
			that.dispatchEvent('geocoded', { result: result, status: status });
		});
	}
	
	MSimpleNav.prototype.saveLocation = function (name, lat, lng) {
		var that = this;
		
		var location = { name: name, lat: lat, lng: lng };
		
		that.storage.add('locations', location, function (tx, results) {
			that.dispatchEvent('locationsUpdated', { results: results });
		});
	}
	
	MSimpleNav.prototype.getLocations = function (callback) {
		var that = this;
		
		that.storage.get('locations', {}, callback);
	}
})();
