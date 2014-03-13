document.addEventListener('DOMContentLoaded', function (e) {
	var app = new com.magadanski.mSimpleNav.MSimpleNav();
	var addressForm = document.getElementById('address-form');
	var coordinatesForm = document.getElementById('coordinates-form');
	var favoritesForm = document.getElementById('favorites-form');
	
	function renderLocations() {
		var ul = favoritesForm.querySelector('ul');
		
		app.getLocations(function (results) {
			ul.innerHTML = '';
			
			for (var i = 0; i < results.rows.length; i++) {
				var location = results.rows.item(i);
				
				var liHtml =
					'<li>' +
						'<a href="#"' +
							'data-location-id="' + location.id + '"' +
							'data-location-lat="' + location.lat + '"' +
							'data-location-lng="' + location.lng + '">' +
							location.name +
						'</a>' +
					'</li>';
				
				ul.innerHTML += liHtml;
			}
			
			var anchors = ul.querySelectorAll('a');
			if (anchors.length) {
				for (var i in anchors) {
					anchors.item(i).addEventListener('click', function (e) {
							e.preventDefault();
							
							app.setDestination(e.currentTarget.dataset.locationLat, e.currentTarget.dataset.locationLng);
					});
				}
			}
		});
	}
	
	coordinatesForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		app.setDestination(document.getElementById('lat').value, document.getElementById('lng').value);
	});
	
	addressForm.addEventListener('submit', function (e) {
		e.preventDefault();
		
		app.addEventListener('geocoded', function (e) {
			var location = e.result[0].geometry.location;
			
			document.getElementById('lat').value = location.lat();
			document.getElementById('lng').value = location.lng();
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
	
	app.addEventListener('locationsUpdated', function (e) {
		renderLocations();
	});
	
	// stupid iOS7
	if (navigator.userAgent.match(/CPU\sOS\s7_/)) {
		document.body.style.paddingTop = '24px';
	}
	
	renderLocations();
});