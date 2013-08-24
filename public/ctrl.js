function pageCtrl($scope) {
	$scope.priceTotal = $scope.bookQuantity * 7.99;

	$('#payit').hide();

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
	
	var toChange = function(zeModel) {
		localStorage.zeModel = $scope.zeModel;
	}
}