com.magadanski.utils = typeof(com.magadanski.utils) == 'undefined' ? {} : com.magadanski.utils;

com.magadanski.utils.getFullHeight = function (el) {
	var height = 0;
	
	height += (typeof(el.clientHeight) !== 'undefined') ? el.clientHeight : 0;
	
	var computedStyle = document.defaultView.getComputedStyle(el, '');
	if (typeof(computedStyle) !== 'undefined') {
		height += parseInt(computedStyle.getPropertyValue('margin-top'));
		height += parseInt(computedStyle.getPropertyValue('margin-bottom'));
	}
	
	return height;
}

com.magadanski.utils.extendOptions = function (defaults, options) {
	for (o in options) {
		defaults[o] = options[o];
	}
	
	return defaults;
}