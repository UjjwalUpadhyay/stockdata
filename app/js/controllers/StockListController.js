'use strict';

/**
 * Stock List Controller.
 */
angular.module('stockWatcher.Controllers')
	.controller('StockListController', ['$scope', '$websocket',
		function ($scope, $websocket) {

		
		$scope.stockQuotes = [];
		


        var collection = [];
		var getCurrentDataWithDetails = function() {
            var dataStream = $websocket('ws://stocks.mnet.website');
			dataStream.onMessage(function(message) {
				var data = JSON.parse(message.data);
				collection.forEach(function(obj){
					obj.changed = false;
				});
				//$scope.stockQuotes = data;
				data.forEach(function([name, price]){
					var new_obj ={};
					var old_obj ={};
					var new_stock = true;
					collection.forEach(function(obj) {
						if(obj.name===name) {
							if (!obj.changed) {
								obj.prev_val = obj.new_val;
							    obj.new_val = price;
							    obj.change = obj.new_val - obj.prev_val;
							    obj.change_precent = (obj.change/obj.prev_val)*100;
							    obj.last_update = new Date();
							    new_stock = false;
							    obj.changed = true;
							} else {
								obj.new_val = price;
								obj.change = obj.new_val - obj.prev_val;
								obj.change_precent = (obj.change/obj.prev_val)*100; 
								obj.last_update = new Date();
								new_stock = false;
							}
						}
					});
					if (new_stock) {
						new_obj["name"] = name;
					    new_obj["new_val"] = price;
						new_obj["prev_val"] = 0;
						new_obj["change"] = new_obj["new_val"] - new_obj["prev_val"];
						new_obj["change_precent"] = (new_obj["change"] / new_obj["new_val"])*100;
						new_obj["last_update"] = new Date();
						new_obj["changed"] = false; 
						collection.push(new_obj);
					}
				});
				$scope.stockQuotes = collection;
      		});
		}
		getCurrentDataWithDetails();

	}]);
