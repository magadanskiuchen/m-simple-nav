com.magadanski.mSimpleNav.Views;

//////////////////////////////////////////
// Views Class Implementation ////////////
//////////////////////////////////////////
(function () {
	// import class
	var that;
	var getFullHeight = com.magadanski.utils.getFullHeight;
	
	var Views = function (containerSelector) {
		that = this;
		
		// private properties
		var container = document.querySelector(containerSelector);
		var views = new com.magadanski.DOMCollection(container.querySelectorAll(':scope > *'));
		
		// private methods
		
		// priviledged properties
		
		// priviledged methods
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
			
			container.style.transform = 'translateX(-' + (100 * i * (1 / views.elements.length)) + '%)';
			container.style.height = getFullHeight(activeView) + 'px';
		}
		
		// constructor
		that.updateViewArea();
	}
	com.magadanski.mSimpleNav.Views = Views;
	
	// private properties
	
	// public properties
	
	// private methods
	
	// public methods
	
})();
