com.magadanski.mSimpleNav.Compass;

//////////////////////////////////////
// Compass Class Implementation //////
//////////////////////////////////////
(function () {
	// import Class
	var Compass = function () {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		if (window.DeviceOrientationEvent) {
			window.addEventListener('deviceorientation', function (e) {
				if (e.absolute) {
					that.compassHeading = -e.alpha;
				} else if (typeof(e.webkitCompassHeading) != 'undefined') {
					that.compassHeading = e.webkitCompassHeading;
				}
				
				that.dispatchEvent('compassupdate', {
					message: 'compass data has changed',
					deviceBearing: that.compassHeading
				});
			});
		}
	}
	Compass.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Compass = Compass;
	
	// public properties
	Compass.prototype.compassHeading = 0;
	
	// public methods
	Compass.prototype.getDeviceBearing = function () {
		var that = this;
		
		return that.compassHeading;
	}
})();
