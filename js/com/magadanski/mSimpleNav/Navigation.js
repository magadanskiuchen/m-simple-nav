com.magadanski.mSimpleNav.Navigation;

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
