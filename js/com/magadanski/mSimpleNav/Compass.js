com.magadanski.mSimpleNav.Compass;

//////////////////////////////////////
// Compass Class Implementation //////
//////////////////////////////////////
(function () {
	// import Class
	var Compass = function () {
		var that = this;
		
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function (e) {
				if (e.absolute) {
					that.compassHeading = -e.alpha;
				} else if (typeof(e.webkitCompassHeading) != 'undefined') {
					that.compassHeading = e.webkitCompassHeading;
				}
				
				that.tilt = e[that.tiltProperty] * that.tiltQuantifier;
				
				that.dispatchEvent('compassupdate', {
					message: 'compass data has changed',
					deviceBearing: that.compassHeading,
					deviceTilt: that.tilt
				});
			});
		}
		
		window.addEventListener('orientationchange', function (e) {
			if (window.orientation == 90 || window.orientation == -90) {
				that.tiltProperty = 'gamma';
			} else {
				that.tiltProperty = 'beta';
			}
			
			if (window.orientation > 0) {
				that.tiltQuantifier = -1;
			} else {
				that.tiltQuantifier = 1;
			}
		});
	}
	Compass.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Compass = Compass;
	
	// private properties
	
	// public properties
	Compass.prototype.compassHeading = 0;
	Compass.prototype.tilt = 0;
	Compass.prototype.tiltProperty = 'beta';
	Compass.prototype.tiltQuantifier = 1;
	
	// private methods
	
	// public methods
	Compass.prototype.getDeviceBearing = function () {
		var that = this;
		
		return that.compassHeading;
	}
	
	Compass.prototype.getDeviceTilt = function () {
		var that = this;
		
		return that.tilt;
	}
})();
