document.addEventListener('DOMContentLoaded', function (e) {
	var app = new com.magadanski.mSimpleNav.MSimpleNav();
	var navigation = new com.magadanski.mSimpleNav.Navigation('.tabs');
	var addressForm = document.getElementById('address-form');
	var coordinatesForm = document.getElementById('coordinates-form');
	var favoritesForm = document.getElementById('favorites-form');
	
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
	
	// stupid iOS7 and iOS8
	if (navigator.userAgent.match(/CPU\sOS\s[7,8]_/)) {
		document.body.style.paddingTop = '24px';
	}
});
