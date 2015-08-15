com.magadanski.mSimpleNav.LocationsDataList;

////////////////////////////////////////////
// LocationsDataList Class Implementation //
////////////////////////////////////////////
(function () {
	// import class
	var LocationsDataList = function () {
		var that = this;
		
		// private methods
		
		// public methods
		that.createItem = function (data, i) {
			var item = document.createElement(that.getOptions().itemTag);
			
			item.dataset.locationId = data.id;
			item.dataset.locationLat = data.lat;
			item.dataset.locationLng = data.lng;
			item.dataset.dataIndex = i;
			item.innerHTML = data.name;
			
			var deleteLink = document.createElement('a');
			deleteLink.classList.add('icon');
			deleteLink.classList.add('msn-delete');
			deleteLink.classList.add('delete');
			
			var editLink = document.createElement('a');
			editLink.classList.add('icon');
			editLink.classList.add('msn-edit');
			editLink.classList.add('edit');
			
			deleteLink.addEventListener('click', function (e) {
				if (confirm(i18n.are_you_sure)) {
					that.clearData(this.parentElement.dataset.dataIndex);
					this.parentElement.remove();
					
					that.dispatchEvent('dataChanged', {
						message: 'list data has changed',
						deleted: this.parentElement.dataset.locationId
					});
				}
			});
			
			item.appendChild(deleteLink);
			item.appendChild(editLink);
			
			return item;
		}
		
		// constructor
		that.init();
	}
	LocationsDataList.inherits(com.magadanski.mSimpleNav.DataList);
	com.magadanski.mSimpleNav.LocationsDataList = LocationsDataList;
})();