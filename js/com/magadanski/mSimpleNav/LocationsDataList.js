com.magadanski.mSimpleNav.LocationsDataList;

////////////////////////////////////////////
// LocationsDataList Class Implementation //
////////////////////////////////////////////
(function () {
	// import class
	var LocationsDataList = function () {
		var that = this;
		
		that.renderItem = function (item) {
			return '<li><a href="#">' + item.name + '</a></li>';
		}
	}
	LocationsDataList.inherits(DataList);
	com.magadanski.mSimpleNav.LocationsDataList = LocationsDataList;
})();