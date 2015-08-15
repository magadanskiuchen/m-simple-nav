com.magadanski.mSimpleNav.LocationsDataList;

////////////////////////////////////////////
// LocationsDataList Class Implementation //
////////////////////////////////////////////
(function () {
	// import class
	var LocationsDataList = function () {
		var that = this;
		
		that.renderItem = function (item) {
			return '<li data-location-id="' + item.id + '" data-location-lat="' + item.lat + '" data-location-lng="' + item.lng + '">' + item.name + '</li>';
		}
	}
	LocationsDataList.inherits(com.magadanski.mSimpleNav.DataList);
	com.magadanski.mSimpleNav.LocationsDataList = LocationsDataList;
})();