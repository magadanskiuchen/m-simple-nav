com.magadanski.mSimpleNav.Compass;

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
