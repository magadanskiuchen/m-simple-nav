com.magadanski.DOMCollection;

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
		} else if (typeof(selector) == 'object') { // support to pass a result of querySelectorAll or similar
			selection = selector;
		} else {
			selection = false;
		}
		
		if (!!selection) {
			for (var i = 0; i < selection.length; i++) {
				that.elements.push(selection.item(i));
			}
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
	
	DOMCollection.prototype.filter = function (selector) {
		var filteredElements = new DOMCollection();
		
		for (e in this.elements) {
			if (this.elements[e].matches(selector)) {
				filteredElements.elements.push(this.elements[e]);
			}
		}
		
		return filteredElements;
	}
})();
