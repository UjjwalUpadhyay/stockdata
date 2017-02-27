'use strict';

/**
 * Stock List Item Controller
 */
angular.module('stockWatcher.Controllers')
	.controller('StockListItemController', ['$scope', 
		function ($scope) {
		$scope.isGain = function(input) {
			if (typeof $scope.quote.change !== 'undefined') {
				var changeIsPositive = $scope.quote.change > 0;
				return changeIsPositive;
			}
			return false;
		};
		
		$scope.isLoss = function(input) {
			if (typeof $scope.quote.change !== 'undefined') {
				var changeIsNegative = $scope.quote.change < 0;
				return changeIsNegative;
			}
			return false;
		};
	}]);
