function pageCtrl($scope) {
	$scope.priceTotal = $scope.bookQuantity * 7.99;

	$('#payit').hide();
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
 	}

 	$scope.snhName = function() {
 		localStorage.sName = $scope.sName;
 		$scope.accepted();
 	}
 	$scope.snhAddress = function() {
 		localStorage.sAddress = $scope.sAddress;
 		$scope.accepted();
 	}
 	$scope.snhCity = function() {
 		localStorage.sCity = $scope.sCity;
 		$scope.accepted();
 	}
 	$scope.snhState = function() {
 		localStorage.sState = $scope.sState;
 		$scope.accepted();
 				
 	}
 	$scope.snhZip = function() {
 		localStorage.sZip = $scope.sZip;
 		$scope.accepted();
 	}


}