var app = angular.module('shop', ['firebase']);

function pageCtrl($scope, angularFire) {
	$scope.priceTotal = $scope.bookQuantity * 7.99;
	$scope.sName = localStorage.sName;
	$scope.sAddress = localStorage.sAddress;
	$scope.sState = localStorage.sState;
	$scope.sCity = localStorage.sCity;
	$scope.sZip = localStorage.sZip;
	$scope.bookQuantity = localStorage.bookQuantity;
	$scope.priceTotal = localStorage.cost;
	$scope.destination = localStorage.destination;
	$scope.ticPrice = localStorage.ticPrice;

	var ref = new Firebase("https://ebiz.firebaseIO.com");

	$scope.shopData = [];

	angularFire(ref, $scope, "shopData");

	$scope.storeData = function() {
		$scope.shopData.push({
			quantity: localStorage.bookQuantity,
			price: localStorage.cost,
			name: localStorage.sName,
			address: localStorage.sAddress,
			state: localStorage.sState,
			city: localStorage.sCity, 
		})
		console.log("Pushed!")
	}

	if (localStorage.been != "true") {
		$('header img').addClass("animated");
		$('header img').addClass("bounceInDown");
		localStorage.been = "true";
	}


	if (localStorage.bookQuantity > 1) {
		$scope.plurr = "copies";
	}

	else {
		$scope.plurr = "copy";
	}

	$('#payit').hide();
	if ($scope.bookQuantity > 0) {
		$('#payit').show();
	}
	$('.next-but').attr("style", "display:none !important");

	$scope.changeQuantity = function() {
		localStorage.bookQuantity = $scope.bookQuantity;
		$scope.priceTotal = $scope.bookQuantity * 7.99;
		localStorage.cost = $scope.priceTotal;
		
		if ($scope.bookQuantity > 0) {
			$('#payit').show();
		}
		else {
			$('#payit').hide();
		}
	};

	$scope.pProvide = "paypal";

	if ($scope.pProvide == "paypal") {
		$('#skeuocard').hide();
		$('#paypal').fadeIn();
	}
	else if ($scope.pProvide == "card") {
		$('#paypal').hide();
		$('#skeuocard').fadeIn();
	}


	$scope.payChange = function() {
			if ($scope.pProvide == "paypal") {
		$('#skeuocard').hide();
		$('#paypal').fadeIn();
	}
	else if ($scope.pProvide == "card") {
		$('#paypal').hide();
		$('#skeuocard').fadeIn();
	}
	};
	
	$scope.accepted = function() {
 		localStorage.acceptIt = $scope.sAccept;
 		console.log("cahnged")
 		if (localStorage.sName.length > 0 && localStorage.sAddress.length > 0 && localStorage.sCity.length > 0 && localStorage.sState.length > 0 && localStorage.sZip.length > 0 && localStorage.acceptIt == 'true') {
 			$('.next-but').show();
 		}
 		else if (localStorage.acceptIt == "false" || localStorage.sName.length <= 0 || localStorage.sAddress.length <= 0 || localStorage.sCity.length <= 0 || localStorage.sState.length <= 0 || localStorage.sZip.length <= 0) {
 			$('.next-but').attr("style", "display: none;");
 		}
 	};


 	$scope.snhName = function() {
 		localStorage.sName = $scope.sName;
 		$scope.accepted();
 	};

 	$scope.snhAddress = function() {
 		localStorage.sAddress = $scope.sAddress;
 		$scope.accepted();
 	}
 	$scope.snhCity = function() {
 		localStorage.sCity = $scope.sCity;
 		$scope.accepted();
 	};

 	$scope.snhState = function() {
 		localStorage.sState = $scope.sState;
 		$scope.accepted();
 				
 	};

 	$scope.snhZip = function() {
 		localStorage.sZip = $scope.sZip;
 		$scope.accepted();
 	};
	
	$scope.places = [
		{ main: 'Washington DC', date: 'January 1st 2014', loc: 'White House' },
		{ main: 'New York', date: 'January 3rd 2014', loc: 'Times Square' },
		{ main: 'Virginia', date: 'January 9th 2014', loc: 'Albus D. Memorial Theater' },
		{ main: 'Texas', date: 'January 12th 2014', loc: 'Gryffindor Convention Center' },
		{ main: 'California', date: 'January 15th 2014', loc: 'Diagon Alley Convention Center' },
		{ main: 'Colorado', date: 'January 20th 2014', loc: 'Hogsmeade Village' },
		{ main: 'Nevada', date: 'January 17th 2014', loc: 'Lily and James Potter Charitable Foundation' },
	];

	$scope.locPersist = function(location) {
		localStorage.destination = location;
		window.location = '/booking';
	};

	$scope.ticChange = function() {
		$scope.ticPrice = $scope.ticQuant * 24.99;
		localStorage.ticPrice = $scope.ticPrice;
	}



}

