'use strict';

angular.module('stockWatcher.Services',['ngWebSocket'])
	.factory('stockService', ['$websocket', 
		function($websocket) {
	    
		var getCurrentData = function() {
			var dataStream = $websocket('ws://stocks.mnet.website');
			dataStream.onMessage(function(message) {
				var data = JSON.parse(message.data);
				return data;
				});
	   };

		// Return the public interface for the service:
		return {
			getCurrentData: getCurrentData
		};
	}]);
