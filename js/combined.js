// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Geodesy representation conversion functions (c) Chris Veness 2002-2012                        */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var lat = Geo.parseDMS('51° 28′ 40.12″ N');                                                 */
/*    var lon = Geo.parseDMS('000° 00′ 05.31″ W');                                                */
/*    var p1 = new LatLon(lat, lon);                                                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


var Geo = {};  // Geo namespace, representing static class


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3º 37' 09"W) 
 * or fixed-width format without separators (eg 0033709W). Seconds and minutes may be omitted. 
 * (Note minimal validation is done).
 *
 * @param   {String|Number} dmsStr: Degrees or deg/min/sec in variety of formats
 * @returns {Number} Degrees as decimal number
 * @throws  {TypeError} dmsStr is an object, perhaps DOM object without .value?
 */
Geo.parseDMS = function(dmsStr) {
	if (typeof deg == 'object') throw new TypeError('Geo.parseDMS - dmsStr is [DOM?] object');
	
	// check for signed decimal degrees without NSEW, if so return it directly
	if (typeof dmsStr === 'number' && isFinite(dmsStr)) return Number(dmsStr);
	
	// strip off any sign or compass dir'n & split out separate d/m/s
	var dms = String(dmsStr).trim().replace(/^-/,'').replace(/[NSEW]$/i,'').split(/[^0-9.,]+/);
	if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol
	
	if (dms == '') return NaN;
	
	// and convert to decimal degrees...
	switch (dms.length) {
		case 3:  // interpret 3-part result as d/m/s
			var deg = dms[0]/1 + dms[1]/60 + dms[2]/3600; 
			break;
		case 2:  // interpret 2-part result as d/m
			var deg = dms[0]/1 + dms[1]/60; 
			break;
		case 1:  // just d (possibly decimal) or non-separated dddmmss
			var deg = dms[0];
			// check for fixed-width unseparated format eg 0033709W
			//if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
			//if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600; 
			break;
		default:
			return NaN;
	}
	if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve
	return Number(deg);
}


/**
 * Convert decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added
 *
 * @private
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} deg formatted as deg/min/secs according to specified format
 * @throws  {TypeError} deg is an object, perhaps DOM object without .value?
 */
Geo.toDMS = function(deg, format, dp) {
	if (typeof deg == 'object') throw new TypeError('Geo.toDMS - deg is [DOM?] object');
	if (isNaN(deg)) return null;  // give up here if we can't make a number from deg
	
		// default values
	if (typeof format == 'undefined') format = 'dms';
	if (typeof dp == 'undefined') {
		switch (format) {
			case 'd': dp = 4; break;
			case 'dm': dp = 2; break;
			case 'dms': dp = 0; break;
			default: format = 'dms'; dp = 0;  // be forgiving on invalid format
		}
	}
	
	deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)
	
	switch (format) {
		case 'd':
			d = deg.toFixed(dp);     // round degrees
			if (d<100) d = '0' + d;  // pad with leading zeros
			if (d<10) d = '0' + d;
			dms = d + '\u00B0';      // add º symbol
			break;
		case 'dm':
			var min = (deg*60).toFixed(dp);  // convert degrees to minutes & round
			var d = Math.floor(min / 60);    // get component deg/min
			var m = (min % 60).toFixed(dp);  // pad with trailing zeros
			if (d<100) d = '0' + d;          // pad with leading zeros
			if (d<10) d = '0' + d;
			if (m<10) m = '0' + m;
			dms = d + '\u00B0' + m + '\u2032';  // add º, ' symbols
			break;
		case 'dms':
			var sec = (deg*3600).toFixed(dp);  // convert degrees to seconds & round
			var d = Math.floor(sec / 3600);    // get component deg/min/sec
			var m = Math.floor(sec/60) % 60;
			var s = (sec % 60).toFixed(dp);    // pad with trailing zeros
			if (d<100) d = '0' + d;            // pad with leading zeros
			if (d<10) d = '0' + d;
			if (m<10) m = '0' + m;
			if (s<10) s = '0' + s;
			dms = d + '\u00B0' + m + '\u2032' + s + '\u2033';  // add º, ', " symbols
			break;
	}
	
	return dms;
}


/**
 * Convert numeric degrees to deg/min/sec latitude (suffixed with N/S)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
Geo.toLat = function(deg, format, dp) {
	var lat = Geo.toDMS(deg, format, dp);
	return lat==null ? '–' : lat.slice(1) + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
}


/**
 * Convert numeric degrees to deg/min/sec longitude (suffixed with E/W)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
Geo.toLon = function(deg, format, dp) {
	var lon = Geo.toDMS(deg, format, dp);
	return lon==null ? '–' : lon + (deg<0 ? 'W' : 'E');
}


/**
 * Convert numeric degrees to deg/min/sec as a bearing (0º..360º)
 *
 * @param   {Number} deg: Degrees
 * @param   {String} [format=dms]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to use - default 0 for dms, 2 for dm, 4 for d
 * @returns {String} Deg/min/seconds
 */
Geo.toBrng = function(deg, format, dp) {
	deg = (Number(deg)+360) % 360;  // normalise -ve values to 180º..360º
	var brng =  Geo.toDMS(deg, format, dp);
	return brng==null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360º!
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (!window.console) window.console = { log: function() {} };
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Latitude/longitude spherical geodesy formulae & scripts (c) Chris Veness 2002-2012            */
/*   - www.movable-type.co.uk/scripts/latlong.html                                                */
/*                                                                                                */
/*  Sample usage:                                                                                 */
/*    var p1 = new LatLon(51.5136, -0.0983);                                                      */
/*    var p2 = new LatLon(51.4778, -0.0015);                                                      */
/*    var dist = p1.distanceTo(p2);          // in km                                             */
/*    var brng = p1.bearingTo(p2);           // in degrees clockwise from north                   */
/*    ... etc                                                                                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Note that minimal error checking is performed in this example code!                           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * @requires Geo
 */
 
 
/**
 * Creates a point on the earth's surface at the supplied latitude / longitude
 *
 * @constructor
 * @param {Number} lat: latitude in numeric degrees
 * @param {Number} lon: longitude in numeric degrees
 * @param {Number} [rad=6371]: radius of earth if different value is required from standard 6,371km
 */
function LatLon(lat, lon, rad) {
	if (typeof(rad) == 'undefined') rad = 6371;  // earth's mean radius in km
	// only accept numbers or valid numeric strings
	this._lat = typeof(lat)=='number' ? lat : typeof(lat)=='string' && lat.trim()!='' ? +lat : NaN;
	this._lon = typeof(lon)=='number' ? lon : typeof(lon)=='string' && lon.trim()!='' ? +lon : NaN;
	this._radius = typeof(rad)=='number' ? rad : typeof(rad)=='string' && trim(lon)!='' ? +rad : NaN;
}


/**
 * Returns the distance from this point to the supplied point, in km 
 * (using Haversine formula)
 *
 * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
 *       Sky and Telescope, vol 68, no 2, 1984
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @param   {Number} [precision=4]: no of significant digits to use for returned value
 * @returns {Number} Distance in km between this point and destination point
 */
LatLon.prototype.distanceTo = function(point, precision) {
	// default 4 sig figs reflects typical 0.3% accuracy of spherical model
	if (typeof precision == 'undefined') precision = 4;
	
	var R = this._radius;
	var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
	var lat2 = point._lat.toRad(), lon2 = point._lon.toRad();
	var dLat = lat2 - lat1;
	var dLon = lon2 - lon1;

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
					Math.cos(lat1) * Math.cos(lat2) * 
					Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	return d.toPrecisionFixed(precision);
}


/**
 * Returns the (initial) bearing from this point to the supplied point, in degrees
 *   see http://williams.best.vwh.net/avform.htm#Crs
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Initial bearing in degrees from North
 */
LatLon.prototype.bearingTo = function(point) {
	var lat1 = this._lat.toRad(), lat2 = point._lat.toRad();
	var dLon = (point._lon-this._lon).toRad();

	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) -
					Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	var brng = Math.atan2(y, x);
	
	return (brng.toDeg()+360) % 360;
}


/**
 * Returns final bearing arriving at supplied destination point from this point; the final bearing 
 * will differ from the initial bearing by varying degrees according to distance and latitude
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Final bearing in degrees from North
 */
LatLon.prototype.finalBearingTo = function(point) {
	// get initial bearing from supplied point back to this point...
	var lat1 = point._lat.toRad(), lat2 = this._lat.toRad();
	var dLon = (this._lon-point._lon).toRad();

	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = Math.cos(lat1)*Math.sin(lat2) -
					Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
	var brng = Math.atan2(y, x);
					
	// ... & reverse it by adding 180°
	return (brng.toDeg()+180) % 360;
}


/**
 * Returns the midpoint between this point and the supplied point.
 *   see http://mathforum.org/library/drmath/view/51822.html for derivation
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {LatLon} Midpoint between this point and the supplied point
 */
LatLon.prototype.midpointTo = function(point) {
	lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
	lat2 = point._lat.toRad();
	var dLon = (point._lon-this._lon).toRad();

	var Bx = Math.cos(lat2) * Math.cos(dLon);
	var By = Math.cos(lat2) * Math.sin(dLon);

	lat3 = Math.atan2(Math.sin(lat1)+Math.sin(lat2),
										Math.sqrt( (Math.cos(lat1)+Bx)*(Math.cos(lat1)+Bx) + By*By) );
	lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
	lon3 = (lon3+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º
	
	return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/**
 * Returns the destination point from this point having travelled the given distance (in km) on the 
 * given initial bearing (bearing may vary before destination is reached)
 *
 *   see http://williams.best.vwh.net/avform.htm#LL
 *
 * @param   {Number} brng: Initial bearing in degrees
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
LatLon.prototype.destinationPoint = function(brng, dist) {
	dist = typeof(dist)=='number' ? dist : typeof(dist)=='string' && dist.trim()!='' ? +dist : NaN;
	dist = dist/this._radius;  // convert dist to angular distance in radians
	brng = brng.toRad();  // 
	var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();

	var lat2 = Math.asin( Math.sin(lat1)*Math.cos(dist) + 
												Math.cos(lat1)*Math.sin(dist)*Math.cos(brng) );
	var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(dist)*Math.cos(lat1), 
															 Math.cos(dist)-Math.sin(lat1)*Math.sin(lat2));
	lon2 = (lon2+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º

	return new LatLon(lat2.toDeg(), lon2.toDeg());
}


/**
 * Returns the point of intersection of two paths defined by point and bearing
 *
 *   see http://williams.best.vwh.net/avform.htm#Intersection
 *
 * @param   {LatLon} p1: First point
 * @param   {Number} brng1: Initial bearing from first point
 * @param   {LatLon} p2: Second point
 * @param   {Number} brng2: Initial bearing from second point
 * @returns {LatLon} Destination point (null if no unique intersection defined)
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
	brng1 = typeof brng1 == 'number' ? brng1 : typeof brng1 == 'string' && trim(brng1)!='' ? +brng1 : NaN;
	brng2 = typeof brng2 == 'number' ? brng2 : typeof brng2 == 'string' && trim(brng2)!='' ? +brng2 : NaN;
	lat1 = p1._lat.toRad(), lon1 = p1._lon.toRad();
	lat2 = p2._lat.toRad(), lon2 = p2._lon.toRad();
	brng13 = brng1.toRad(), brng23 = brng2.toRad();
	dLat = lat2-lat1, dLon = lon2-lon1;
	
	dist12 = 2*Math.asin( Math.sqrt( Math.sin(dLat/2)*Math.sin(dLat/2) + 
		Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)*Math.sin(dLon/2) ) );
	if (dist12 == 0) return null;
	
	// initial/final bearings between points
	brngA = Math.acos( ( Math.sin(lat2) - Math.sin(lat1)*Math.cos(dist12) ) / 
		( Math.sin(dist12)*Math.cos(lat1) ) );
	if (isNaN(brngA)) brngA = 0;  // protect against rounding
	brngB = Math.acos( ( Math.sin(lat1) - Math.sin(lat2)*Math.cos(dist12) ) / 
		( Math.sin(dist12)*Math.cos(lat2) ) );
	
	if (Math.sin(lon2-lon1) > 0) {
		brng12 = brngA;
		brng21 = 2*Math.PI - brngB;
	} else {
		brng12 = 2*Math.PI - brngA;
		brng21 = brngB;
	}
	
	alpha1 = (brng13 - brng12 + Math.PI) % (2*Math.PI) - Math.PI;  // angle 2-1-3
	alpha2 = (brng21 - brng23 + Math.PI) % (2*Math.PI) - Math.PI;  // angle 1-2-3
	
	if (Math.sin(alpha1)==0 && Math.sin(alpha2)==0) return null;  // infinite intersections
	if (Math.sin(alpha1)*Math.sin(alpha2) < 0) return null;       // ambiguous intersection
	
	//alpha1 = Math.abs(alpha1);
	//alpha2 = Math.abs(alpha2);
	// ... Ed Williams takes abs of alpha1/alpha2, but seems to break calculation?
	
	alpha3 = Math.acos( -Math.cos(alpha1)*Math.cos(alpha2) + 
											 Math.sin(alpha1)*Math.sin(alpha2)*Math.cos(dist12) );
	dist13 = Math.atan2( Math.sin(dist12)*Math.sin(alpha1)*Math.sin(alpha2), 
											 Math.cos(alpha2)+Math.cos(alpha1)*Math.cos(alpha3) )
	lat3 = Math.asin( Math.sin(lat1)*Math.cos(dist13) + 
										Math.cos(lat1)*Math.sin(dist13)*Math.cos(brng13) );
	dLon13 = Math.atan2( Math.sin(brng13)*Math.sin(dist13)*Math.cos(lat1), 
											 Math.cos(dist13)-Math.sin(lat1)*Math.sin(lat3) );
	lon3 = lon1+dLon13;
	lon3 = (lon3+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º
	
	return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance from this point to the supplied point, in km, travelling along a rhumb line
 *
 *   see http://williams.best.vwh.net/avform.htm#Rhumb
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Distance in km between this point and destination point
 */
LatLon.prototype.rhumbDistanceTo = function(point) {
	var R = this._radius;
	var lat1 = this._lat.toRad(), lat2 = point._lat.toRad();
	var dLat = (point._lat-this._lat).toRad();
	var dLon = Math.abs(point._lon-this._lon).toRad();
	
	var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
	var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
	
	// if dLon over 180° take shorter rhumb across anti-meridian:
	if (Math.abs(dLon) > Math.PI) {
		dLon = dLon>0 ? -(2*Math.PI-dLon) : (2*Math.PI+dLon);
	}
	
	var dist = Math.sqrt(dLat*dLat + q*q*dLon*dLon) * R; 
	
	return dist.toPrecisionFixed(4);  // 4 sig figs reflects typical 0.3% accuracy of spherical model
}

/**
 * Returns the bearing from this point to the supplied point along a rhumb line, in degrees
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {Number} Bearing in degrees from North
 */
LatLon.prototype.rhumbBearingTo = function(point) {
	var lat1 = this._lat.toRad(), lat2 = point._lat.toRad();
	var dLon = (point._lon-this._lon).toRad();
	
	var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
	if (Math.abs(dLon) > Math.PI) dLon = dLon>0 ? -(2*Math.PI-dLon) : (2*Math.PI+dLon);
	var brng = Math.atan2(dLon, dPhi);
	
	return (brng.toDeg()+360) % 360;
}

/**
 * Returns the destination point from this point having travelled the given distance (in km) on the 
 * given bearing along a rhumb line
 *
 * @param   {Number} brng: Bearing in degrees from North
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
LatLon.prototype.rhumbDestinationPoint = function(brng, dist) {
	var R = this._radius;
	var d = parseFloat(dist)/R;  // d = angular distance covered on earth’s surface
	var lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
	brng = brng.toRad();

	var dLat = d*Math.cos(brng);
	// nasty kludge to overcome ill-conditioned results around parallels of latitude:
	if (Math.abs(dLat) < 1e-10) dLat = 0; // dLat < 1 mm
	
	var lat2 = lat1 + dLat;
	var dPhi = Math.log(Math.tan(lat2/2+Math.PI/4)/Math.tan(lat1/2+Math.PI/4));
	var q = (isFinite(dLat/dPhi)) ? dLat/dPhi : Math.cos(lat1);  // E-W line gives dPhi=0
	var dLon = d*Math.sin(brng)/q;
	
	// check for some daft bugger going past the pole, normalise latitude if so
	if (Math.abs(lat2) > Math.PI/2) lat2 = lat2>0 ? Math.PI-lat2 : -Math.PI-lat2;
	
	lon2 = (lon1+dLon+3*Math.PI)%(2*Math.PI) - Math.PI;
 
	return new LatLon(lat2.toDeg(), lon2.toDeg());
}

/**
 * Returns the loxodromic midpoint (along a rhumb line) between this point and the supplied point.
 *   see http://mathforum.org/kb/message.jspa?messageID=148837
 *
 * @param   {LatLon} point: Latitude/longitude of destination point
 * @returns {LatLon} Midpoint between this point and the supplied point
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
	lat1 = this._lat.toRad(), lon1 = this._lon.toRad();
	lat2 = point._lat.toRad(), lon2 = point._lon.toRad();
	
	if (Math.abs(lon2-lon1) > Math.PI) lon1 += 2*Math.PI; // crossing anti-meridian
	
	var lat3 = (lat1+lat2)/2;
	var f1 = Math.tan(Math.PI/4 + lat1/2);
	var f2 = Math.tan(Math.PI/4 + lat2/2);
	var f3 = Math.tan(Math.PI/4 + lat3/2);
	var lon3 = ( (lon2-lon1)*Math.log(f3) + lon1*Math.log(f2) - lon2*Math.log(f1) ) / Math.log(f2/f1);
	
	if (!isFinite(lon3)) lon3 = (lon1+lon2)/2; // parallel of latitude
	
	lon3 = (lon3+3*Math.PI) % (2*Math.PI) - Math.PI;  // normalise to -180..+180º
	
	return new LatLon(lat3.toDeg(), lon3.toDeg());
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Returns the latitude of this point; signed numeric degrees if no format, otherwise format & dp 
 * as per Geo.toLat()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {Number|String} Numeric degrees if no format specified, otherwise deg/min/sec
 */
LatLon.prototype.lat = function(format, dp) {
	if (typeof format == 'undefined') return this._lat;
	
	return Geo.toLat(this._lat, format, dp);
}

/**
 * Returns the longitude of this point; signed numeric degrees if no format, otherwise format & dp 
 * as per Geo.toLon()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {Number|String} Numeric degrees if no format specified, otherwise deg/min/sec
 */
LatLon.prototype.lon = function(format, dp) {
	if (typeof format == 'undefined') return this._lon;
	
	return Geo.toLon(this._lon, format, dp);
}

/**
 * Returns a string representation of this point; format and dp as per lat()/lon()
 *
 * @param   {String} [format]: Return value as 'd', 'dm', 'dms'
 * @param   {Number} [dp=0|2|4]: No of decimal places to display
 * @returns {String} Comma-separated latitude/longitude
 */
LatLon.prototype.toString = function(format, dp) {
	if (typeof format == 'undefined') format = 'dms';
	
	return Geo.toLat(this._lat, format, dp) + ', ' + Geo.toLon(this._lon, format, dp);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

// ---- extend Number object with methods for converting degrees/radians

/** Converts numeric degrees to radians */
if (typeof Number.prototype.toRad == 'undefined') {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}
}

/** Converts radians to numeric (signed) degrees */
if (typeof Number.prototype.toDeg == 'undefined') {
	Number.prototype.toDeg = function() {
		return this * 180 / Math.PI;
	}
}

/** 
 * Formats the significant digits of a number, using only fixed-point notation (no exponential)
 * 
 * @param   {Number} precision: Number of significant digits to appear in the returned string
 * @returns {String} A string representation of number which contains precision significant digits
 */
if (typeof Number.prototype.toPrecisionFixed == 'undefined') {
	Number.prototype.toPrecisionFixed = function(precision) {
		
		// use standard toPrecision method
		var n = this.toPrecision(precision);
		
		// ... but replace +ve exponential format with trailing zeros
		n = n.replace(/(.+)e\+(.+)/, function(n, sig, exp) {
			sig = sig.replace(/\./, '');       // remove decimal from significand
			l = sig.length - 1;
			while (exp-- > l) sig = sig + '0'; // append zeros from exponent
			return sig;
		});
		
		// ... and replace -ve exponential format with leading zeros
		n = n.replace(/(.+)e-(.+)/, function(n, sig, exp) {
			sig = sig.replace(/\./, '');       // remove decimal from significand
			while (exp-- > 1) sig = '0' + sig; // prepend zeros from exponent
			return '0.' + sig;
		});
		
		return n;
	}
}

/** Trims whitespace from string (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
	String.prototype.trim = function() {
		return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (!window.console) window.console = { log: function() {} };
var i18n = {};
var locale = window.navigator.language.split('-')[0];

switch (locale) {
	case 'bg':
		i18n.geocode_error = 'Координат не могат да се достъпят. Проверете интернет връзката си.';
		i18n.geocode_invalid_request = 'Свържете се с програмиста и докладвайте за грешка с невалидна заявка.';
		i18n.geocode_over_query_limit = 'Направили сте прекалено много заявки за твърде кратко време. Опитайте отново след 10 минути.';
		i18n.geocode_request_denied = 'Свържете се с програмиста и докладвайте за грешка с отказана заявка.';
		i18n.geocode_unknown_error = 'Опа, не успяхме да намерим това, което търсите. Моля опитайте отново.';
		i18n.geocode_zero_results = 'Не са намерени резултати за този адрес. Променете адреса и опитайте отново.';
		break;
	case 'en':
	default:
		i18n.geocode_error = 'Cannot get coordinates for location. Check your internet connection.';
		i18n.geocode_invalid_request = 'Contact the developer and let them know that an invalid request error occured.';
		i18n.geocode_over_query_limit = 'You have made too many queries for too short time. Try again in 10 minutes.';
		i18n.geocode_request_denied = 'Contact the developer and let them know that a request denied error occured.';
		i18n.geocode_unknown_error = 'Ooops, we could not find what you were looking for. Please try again.';
		i18n.geocode_zero_results = 'No results were found for that address. Please try modifying that and searching again.';
		break;
}
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
com.magadanski.EventDispatcher;

//////////////////////////////////////////
// EventDispatcher Class Implementation //
//////////////////////////////////////////
(function () {
	// import class
	var that;
	var EventDispatcher = function () {
		that = this;
		
		// private properties
		
		// private methods
		
		// priviledged properties
		that.events = {};
		
		// priviledged methods
		
		// constructor
	}
	com.magadanski.EventDispatcher = EventDispatcher;
	
	// private properties
	
	// public properties
	
	// private methods
	
	// public methods
	EventDispatcher.prototype.addEventListener = function (eventType, callback) {
		var that = this;
		
		if (typeof(eventType.split) != 'undefined') {
			eventType = eventType.split(',');
		}
		
		for (var e in eventType) {
			var eventName = eventType[e].replace(/\s/, '');
			
			if (typeof(that.events[eventName]) == 'undefined') {
				that.events[eventName] = [];
			}
			
			that.events[eventName].push(callback);
		}
	}
	
	EventDispatcher.prototype.removeEventListener = function (eventType, callback) {
		var that = this;
		
		if (typeof(eventType.split) != 'undefined') {
			eventType = eventType.split(',');
		}
		
		for (var e in eventType) {
			var eventName = eventType[e].replace(/\s/, '');
			
			if (typeof(that.events[eventName]) != 'undedined') {
				for (var c in that.events[eventName]) {
					if (c == callback || that.events[eventName][c] == callback) {
						that.events[eventName].splice(c, 1);
					}
				}
			}
		}
	}
	
	EventDispatcher.prototype.dispatchEvent = function (eventType, eventObj) {
		var that = this;
		
		if (typeof(eventObj) == 'undefined') {
			eventObj = {};
		}
		
		if (typeof(that.events[eventType]) == 'object') {
			for (var callback in that.events[eventType]) {
				eventObj.type = eventType;
				eventObj.currentTarget = this;
				
				if (typeof(that.events[eventType][callback]) == 'function') {
					that.events[eventType][callback](eventObj);
				}
			}
		}
	}
})();
com.magadanski.App;

//////////////////////////////////////////
// App Class Implementation //////////////
//////////////////////////////////////////
(function () {
	// import class
	var that;
	var App = function () {
		that = this;
		
		that.title = document.title;
	}
	App.inherits(com.magadanski.EventDispatcher);
	com.magadanski.App = App;
	
	// private properties
	
	// public properties
	App.prototype.title = '';
	
	// private methods
	
	// public methods
	
})();
com.magadanski.Address;

//////////////////////////////////////
// Address Class Implementation //////
//////////////////////////////////////
(function () {
	// import class
	var that;
	var Address = function () {
		that = this;
		
		// private properties
		var hash = '';
		var state = '';
		
		// private methods
		function popStateHandler(e) {
			hash = window.location.hash;
			state = e.state;
		}
		
		// priviledged properties
		
		// priviledged methods
		that.getHash = function () {
			return hash;
		}
		
		that.setHash = function (hash, title, state) {
			var old = { hash: that.getHash(), state: that.getState() };
			
			if (old.hash != hash) {
				history.pushState(title, state, hash);
				
				window.dispatchEvent(new PopStateEvent('popstate', { state: state }));
				that.dispatchEvent('change', { previousHash: old.hash, previousState: old.state });
			}
		}
		
		that.getState = function () {
			return state;
		}
		
		// constructor
		window.addEventListener('popstate', popStateHandler);
	}
	Address.inherits(com.magadanski.EventDispatcher);
	com.magadanski.Address = Address;
	
	// public methods
})();
com.magadanski.mSimpleNav.Exception;

////////////////////////////////////////////
// Exception Class Implementation //////////
////////////////////////////////////////////
(function () {
	// import class
	var Exception = function (message) {
		var that = this;
		
		that.message = message;
	}
	com.magadanski.mSimpleNav.Exception = Exception;
})();com.magadanski.DOMCollection;

//////////////////////////////////////////
// DOMCollection Class Implementation ////
//////////////////////////////////////////
(function () {
	// import class
	var that;
	
	var DOMCollection = function (selector) {
		that = this;
		that.elements = [];
		
		var selection = null;
		
		if (typeof(selector) == 'string') {
			selection = document.querySelectorAll(selector);
		} else { // support to pass a result of querySelectorAll or similar
			selection = selector;
		}
		
		for (var i = 0; i < selection.length; i++) {
			that.elements.push(selection.item(i));
		}
	}
	com.magadanski.DOMCollection = DOMCollection;
	
	// private properties
	
	// private methods
	
	// public methods
	DOMCollection.prototype.addEventListener = function (eventType, callback) {
		for (e in this.elements) {
			this.elements[e].addEventListener(eventType, callback);
		}
	}
	
	DOMCollection.prototype.removeEventListener = function (eventType, eventObj) {
		for (e in this.elements) {
			this.elements[e].removeEventListener(eventType, callback);
		}
	}
	
	DOMCollection.prototype.addClass = function (className) {
		for (e in this.elements) {
			this.elements[e].classList.add(className);
		}
	}
	
	DOMCollection.prototype.removeClass = function (className) {
		for (e in this.elements) {
			this.elements[e].classList.remove(className);
		}
	}
	
	DOMCollection.prototype.each = function (callback) {
		for (e in this.elements) {
			callback(e, this.elements[e]);
		}
	}
})();
com.magadanski.mSimpleNav.Location;

//////////////////////////////////////
// Location Class Implementation /////
//////////////////////////////////////
(function () {
	// import Class
	var Location = function (options) {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		if (typeof(options.lat) == 'number') {
			that.lat = options.lat;
		}
		
		if (typeof(options.lng) == 'number') {
			that.lng = options.lng;
		}
		
		if (typeof(options.name) == 'string') {
			that.name = options.name;
		}
	}
	Location.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Location = Location;
	
	// public properties
	Location.prototype.lat = 0;
	Location.prototype.lng = 0;
	Location.prototype.name = '';
	
	// public methods
})();
com.magadanski.mSimpleNav.GPS;

//////////////////////////////////////
// GPS Class Implementation //////////
//////////////////////////////////////
(function () {
	// import class
	var GPS = function (enableHighAccuracy) {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		if (typeof(enableHighAccuracy) == 'undefined') {
			enableHighAccuracy = true;
		}
		
		that.highAccuracy = !!enableHighAccuracy;
		
		if (navigator.geolocation) {
			currentLocationTimeout = navigator.geolocation.watchPosition(function (position) {
				that.position = new LatLon(position.coords.latitude, position.coords.longitude);
				
				that.dispatchEvent('positionChange', {
					message: 'device position has changed',
					lat: that.position.lat(),
					lng: that.position.lon()
				});
			}, function () {
				that.dispatchEvent('positionFault', {
					message: 'no information on device position'
				});
			}, { enableHighAccuracy: !!that.highAccuracy });
		}
	}
	GPS.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.GPS = GPS;
	
	// public properties
	GPS.prototype.position = null;
	GPS.prototype.highAccuracy = true;
	
	// public methods
	GPS.prototype.getDistanceTo = function (destination) {
		var that = this;
		var distance = '';
		
		if (that.position instanceof LatLon && destination instanceof LatLon) {
			distance = that.position.distanceTo(destination);
		}
		
		return distance;
	}
	
	GPS.prototype.getBearingTo = function (destination) {
		var that = this;
		var bearing = 0;
		
		if (that.position instanceof LatLon && destination instanceof LatLon) {
			bearing = that.position.bearingTo(destination);
		}
		
		return bearing;
	}
})();
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
	
	// public properties
	Compass.prototype.compassHeading = 0;
	Compass.prototype.tilt = 0;
	Compass.prototype.tiltProperty = 'beta';
	Compass.prototype.tiltQuantifier = 1;
	
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
com.magadanski.mSimpleNav.Storage;

//////////////////////////////////////
// Storage Class Implementation //////
//////////////////////////////////////
(function () {
	// import class
	var Storage = function (tables) {
		var that = this;
		
		// private properties
		
		// private methods
		
		// constructor
		that.db = openDatabase('mSimpleNavFavorites', '1.0', 'M Simple Nav Favorites', 2*1024*1024);
		that.db.transaction(function (tx) {
			// database created callback
			if (typeof(tables) != 'undefined') {
				// cycle through all tables in object
				for (var t in tables) {
					var fields = [];
					var prop = '';
					
					// cycle through all fields in table
					for (var p in tables[t]) {
						prop = p;
						
						// check if field type is set
						if (typeof(tables[t][p].type) != 'undefined') {
							prop += ' ' + tables[t][p].type;
						}
						
						// check if field should be primary key
						if (tables[t][p].primaryKey) {
							prop += ' PRIMARY KEY';
						}
						
						// check if field should auto increment
						if (tables[t][p].autoIncrement) {
							prop += ' AUTOINCREMENT';
						}
						
						// check if field should be unique
						if (tables[t][p].unique) {
							prop += ' UNIQUE';
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
	
	// helper functions
	function getPlaceholder(values) {
		return Array(values.length + 1).join('?').split('').join(', ');
	}
	
	// public properties
	Storage.prototype.db = null;
	
	// public methods
	Storage.prototype.add = function (table, entry, callback) {
		var that = this;
		
		that.db.transaction(function (tx) {
			var fields = [];
			var values = [];
			
			for (var p in entry) {
				fields.push(p);
				values.push(entry[p]);
			}
			
			var vq = getPlaceholder(values);
			
			tx.executeSql('INSERT INTO ' + table + '(' + fields.join(', ') + ') VALUES(' + vq + ')', values, function (tx, results) {
				that.dispatchEvent('insert', { tx: tx, results: results });
				
				if (typeof(callback) == 'function') {
					callback(tx, results);
				}
			}, function (tx, error) {
				alert('There was an error saving your location. Please try again. If this remains happening contact the developer.');
			});
		});
	}
	
	Storage.prototype.get = function (table, options, callback) {
		var that = this;
		
		that.db.transaction(function (tx) {
			var select = 'SELECT ';
			var from = ' FROM ' + table;
			var where = '';
			var parameters = [];
			
			if (typeof(options.fields) != 'undefined') {
				select += options.fields.join(', ');
			} else {
				select += '*';
			}
			
			if (typeof(options.conditions) != 'undefined') {
				where += ' WHERE ';
				var conditions = [];
				
				for (var c in options.conditions) {
					if (typeof(options.conditions.operator) == 'undefined') {
						options.conditions.operator = '=';
					}
					
					conditions.push(options.conditions[c].field + ' ' + options.conditions.operator + ' ?');
					parameters.push(options.conditions[c].value);
				}
			}
			
			tx.executeSql(select + from + where, parameters, function (tx, results) {
				if (typeof(callback) == 'function') {
					callback(results);
				}
			}, function (tx, error) {
				alert('Could not retrieve entries. Please contact developer.');
			});
		});
	}
	
	// TODO: add UPDATE and DELETE capabilities
})();
com.magadanski.mSimpleNav.DataList;

//////////////////////////////////////
// DataList Class Implementation /////
//////////////////////////////////////
(function () {
	// import Class
	var DataList = function (options) {
		var that = this;
		var data = [];
		
		// private properties
		
		// private methods
		
		// constructor
		if (typeof(options) != 'object') {
			options = {};
		}
		
		if (typeof(options.startList) != 'function') {
			options.startList = function () {
				return '<ul>';
			}
		}
		
		if (typeof(options.endList) != 'function') {
			options.endList = function () {
				return '</ul>';
			}
		}
		
		if (typeof(options.renderItem) != 'function') {
			options.renderItem = function (item) {
				return '<li>' + item + '</li>';
			}
		}
		
		// priviledged methods
		that.startList = options.startList;
		that.endList = options.endList;
		that.renderItem = options.renderItem;
		
		that.getData = function (i) {
			var result = data;
			
			if (typeof(i) !== 'undefined' && typeof(data[i]) !== 'undefined') {
				result = data[i];
			}
			
			return result;
		}
		
		that.setData = function (newData, i) {
			if (typeof(i) !== 'undefined') {
				data[i] = newData;
			} else {
				data = [].concat(newData);
			}
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
		
		that.addData = function (newData) {
			data = data.concat(newData);
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
		
		that.clearData = function (i) {
			if (typeof(i) !== 'undefined') {
				if (typeof(data[i]) !== 'undefined') {
					data[i] = null;
				} else {
					throw new com.magadanski.Exception('index ' + i + ' does not exist in data array');
				}
			} else {
				data = [];
			}
			
			that.dispatchEvent('dataChanged', { message: 'list data has changed' });
		}
	}
	DataList.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.DataList = DataList;
	
	// public properties
	
	// public methods
	DataList.prototype.render = function () {
		var that = this;
		var markup = '';
		var data = that.getData();
		
		markup += that.startList();
		
		for (var i in data) {
			markup += that.renderItem(data[i]);
		}
		
		markup += that.endList();
		
		return markup;
	}
})();
com.magadanski.mSimpleNav.LocationsDataList;

////////////////////////////////////////////
// LocationsDataList Class Implementation //
////////////////////////////////////////////
(function () {
	// import class
	var LocationsDataList = function () {
		var that = this;
		
		that.renderItem = function (item) {
			return '<li><a href="#" data-location-id="' + item.id + '" data-location-lat="' + item.lat + '" data-location-lng="' + item.lng + '">' + item.name + '</a></li>';
		}
	}
	LocationsDataList.inherits(com.magadanski.mSimpleNav.DataList);
	com.magadanski.mSimpleNav.LocationsDataList = LocationsDataList;
})();com.magadanski.mSimpleNav.Navigation;

//////////////////////////////////////
// Navigation Class Implementation ///
//////////////////////////////////////
(function () {
	// import class
	var that;
	var Navigation = function (containerSelector) {
		that = this;
		
		// private properties
		var ACTIVE_CLASS = 'active';
		
		// private methods
		function menuLinkClickHandler(e) {
			e.stopPropagation();
			e.preventDefault();
			
			that.lis.removeClass(ACTIVE_CLASS);
			e.target.parentNode.classList.add(ACTIVE_CLASS);
			that.dispatchEvent('change', { href: e.target.getAttribute('href') });
		}
		
		// priviledged properties
		that.container = document.querySelector(containerSelector);
		that.container.object = that;
		that.lis = new com.magadanski.DOMCollection(that.container.querySelectorAll('li'));
		that.links = new com.magadanski.DOMCollection(that.container.querySelectorAll('a'));
		
		// priviledged methods
		
		// constructor
		that.links.addEventListener('click', menuLinkClickHandler);
	}
	Navigation.inherits(com.magadanski.EventDispatcher);
	com.magadanski.mSimpleNav.Navigation = Navigation;
	
	// public methods
	Navigation.prototype.goTo = function (address) {
		var link = this.container.querySelector('a[href="' + address + '"]');
		
		if (link.getAttribute('href') == address || link.href == address) {
			link.dispatchEvent(new Event('click'));
		}
	}
})();
com.magadanski.mSimpleNav.MSimpleNav;

//////////////////////////////////////
// MSimpleNav Class Implementation ///
//////////////////////////////////////
(function () {
	// import class
	var that;
	var MSimpleNav = function () {
		that = this;
		
		// private properties
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
			var newBearing = that.gps.getBearingTo(that.destination) - that.compass.getDeviceBearing();
			
			if ( Math.abs( that.displayBearing - newBearing ) < Math.abs( 360 + that.displayBearing - newBearing ) ) {
				that.displayBearing = newBearing;
			} else {
				that.displayBearing = newBearing - 360;
			}
			
			document.getElementById('distance').innerText = that.gps.getDistanceTo(that.destination) + ' km';
			document.getElementById('compass').style.webkitTransform = 'rotateX(' + that.compass.getDeviceTilt() + 'deg) rotateZ(' + that.displayBearing + 'deg)';
			
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
document.addEventListener('DOMContentLoaded', function (e) {
	function getFullHeight(el) {
		var height = 0;
		
		height += (typeof(el.clientHeight) !== 'undefined') ? el.clientHeight : 0;
		
		var computedStyle = document.defaultView.getComputedStyle(el, '');
		if (typeof(computedStyle) !== 'undefined') {
			height += parseInt(computedStyle.getPropertyValue('margin-top'));
			height += parseInt(computedStyle.getPropertyValue('margin-bottom'));
		}
		
		return height;
	}
	
	address = new com.magadanski.Address();
	app = new com.magadanski.mSimpleNav.MSimpleNav();
	navigation = new com.magadanski.mSimpleNav.Navigation('.tabs');
	addressForm = document.getElementById('address-form');
	coordinatesForm = document.getElementById('coordinates-form');
	favoritesForm = document.getElementById('favorites-form');
	
	navigation.addEventListener('change', function (e) {
		address.setHash(e.href, app.title);
	});
	
	address.addEventListener('change', function (e) {
		var views = document.querySelector('.views');
		var activeView = document.querySelector(e.currentTarget.getHash());
		
		var i = 0;
		var tmpView = activeView;
		
		while ( (tmpView = tmpView.previousSibling) != null ) {
			if (typeof(tmpView.tagName) != 'undefined') {
				i++;
			}
		}
		
		views.style.transform = 'translateX(-' + (i * 33.333) + '%)';
		views.style.height = getFullHeight(activeView) + 'px';;
	});
	
	coordinatesForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		app.setDestination(document.getElementById('lat').value, document.getElementById('lng').value);
	});
	
	addressForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		app.addEventListener('destinationChange', function (e) {
			document.getElementById('lat').value = e.lat;
			document.getElementById('lng').value = e.lng;
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
	
	app.favoriteLocations.addEventListener('dataChanged', function (e) {
		var list = favoritesForm.querySelector('ul');
		
		if (!!list) {
			list.remove();
		}
		
		favoritesForm.innerHTML = app.favoriteLocations.render() + favoritesForm.innerHTML;
		
		var views = document.querySelector('.views');
		var addressHash = address.getHash();
		
		if (addressHash.length > 1) {
			var activeView = document.querySelector(address.getHash());
			views.style.height = getFullHeight(activeView) + 'px';
		}
		
		var anchors = favoritesForm.querySelectorAll('ul a');
		
		if (anchors.length) {
			for (var i = 0; i < anchors.length; i++) {
				anchors.item(i).addEventListener('click', function (e) {
						e.preventDefault();
						
						app.setDestination(e.currentTarget.dataset.locationLat, e.currentTarget.dataset.locationLng);
				});
			}
		}
	});
	
	if (window.location.hash) {
		navigation.goTo(window.location.hash);
	}
	
	// stupid iOS
	if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)) {
		document.body.style.borderTop = '24px solid #000';
	}
});
