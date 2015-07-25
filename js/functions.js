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
