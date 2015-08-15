com.magadanski.DOMCollection;

//////////////////////////////////////////
// DOMCollection Class Implementation ////
//////////////////////////////////////////
(function () {
	// import class
	var that;
	
	var DOMCollection = function (selector, context) {
		that = this;
		that.elements = [];
		
		var selection = null;
		var callFunction = 'querySelectorAll';
		
		if (context instanceof HTMLElement) {
			// all OK -- no need to do anything
		} else if (context instanceof DOMCollection) {
			callFunction = 'find';
		} else {
			context = document;
		}
		
		if (typeof(selector) == 'string') {
			context[callFunction](selector);
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
		this.elements.map(function (el) {
			el.addEventListener(eventType, callback);
		});
	}
	
	DOMCollection.prototype.removeEventListener = function (eventType, eventObj) {
		this.elements.map(function (el) {
			el.removeEventListener(eventType, callback);
		});
	}
	
	DOMCollection.prototype.addClass = function (className) {
		this.elements.map(function (el) {
			el.classList.add(className);
		});
	}
	
	DOMCollection.prototype.removeClass = function (className) {
		this.elements.map(function (el) {
			el.classList.remove(className);
		});
	}
	
	DOMCollection.prototype.each = function (callback) {
		this.elements.map(function (el, i) {
			callback(i, el);
		});
	}
	
	DOMCollection.prototype.filter = function (selector) {
		var filteredElements = new DOMCollection();
		
		this.elements.map(function (el) {
			if (el.matches(selector)) {
				filteredElements.elements.push(el);
			}
		});
		
		return filteredElements;
	}
	
	DOMCollection.prototype.find = function (selector) {
		var foundElements = new DOMCollection();
		
		this.elements.map(function (el) {
			foundElements.elements.concat(el.querySelectorAll(selector));
		});
		
		return foundElements;
	}
	
	DOMCollection.prototype.remove = function () {
		this.elements.map(function (el) {
			el.remove();
		});
	}
})();
