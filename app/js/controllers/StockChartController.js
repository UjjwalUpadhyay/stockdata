'use strict';

/**
 * Stock Chart Controller
 */
angular.module('stockWatcher.Controllers')
	.controller('StockChartController', ['$scope', '$timeout', '$websocket',
		function ($scope, $timeout,  $websocket) {
		
		// Set the ID of the <div> containing the chart
		var containerID = 'container' + $scope.symbol.replace('.', '');
		$scope.containerID = containerID;


		// "Chart" object to be used by HighStocks library:
		$scope.chart = undefined;

		// Reset the Chart's Range Selector after the next redraw
		var resetRangeSelector = false;


		/**
		 * Creates the "chart" object using the "Highcharts" library.
		 * @param  {Array<Array<Date,int>>} dataRows The initial dataset of values to plot on the chart.
		 * @return {void}
		 */
		var createGraph = function(dataRows) {
			$scope.chart = new Highcharts.StockChart({
				chart: {
					renderTo: containerID
				},
				title: {
					text: $scope.symbol + ' Stock Price'
				},
				credits: {
					enabled: false
				},
				rangeSelector: {
					buttons: [{
						type: 'hour',
						count: 12,
						text: '1d'
					},{
						type: 'day',
						count: 2,
						text: '2d'
					},{
						type: 'month',
						count: 1,
						text: '1m'
					},{
						type: 'month',
						count: 3,
						text: '3m'
					}],
					selected: 0,
					allButtonsEnabled: true
				},
				xAxis: {
					events: {
						setExtremes: function(e) {
							if (typeof e.rangeSelectorButton === 'undefined') {
								return;
							}


							var clickedButtonIndex = undefined;
							var clickedButtonOptions = undefined;
							for (var i = 0, nbButtons = $scope.chart.rangeSelector.buttonOptions.length; i < nbButtons; i++) {
								var button = $scope.chart.rangeSelector.buttonOptions[i];
								if (button.text === e.rangeSelectorButton.text && button.type === e.rangeSelectorButton.type) {
									clickedButtonIndex = i;
									clickedButtonOptions = button;

									break;
								}
							}

							if (clickedButtonIndex !== $scope.chart.rangeSelector.selected
								&& e.trigger === 'rangeSelectorButton') {
								e.preventDefault();


								if (clickedButtonIndex > 2) {
									var newInterval = undefined;
									var newPeriod = undefined;
									switch (clickedButtonOptions.type) {
										case 'month':
											newInterval = 60*30;
											newPeriod = clickedButtonOptions.count + 'M';
											break;

										case 'ytd':
											newInterval = 60*60*24;
											newPeriod = '12M';
											break;
									}

									if (typeof newPeriod !== 'undefined') {
										interval = newInterval;
										period = newPeriod;

										//$scope.chart.rangeSelector.clickButton(clickedButtonIndex, $scope.chart.rangeSelector.buttonOptions[clickedButtonIndex], true);
									}
								} else {
									interval = 60;
									period = '10d';
								}

								// Set the flag to redraw the Chart's RangeSelector after data is received:
								resetRangeSelector = true;

								// Show a "Loading..." message overlayed on top of the chart:
								$scope.chart.showLoading();
							}
						}
					}
				},
				series: [{
					name: $scope.symbol,
					type: 'area',
					data: dataRows,
					//gapSize: 2,
					tooltip: {
						valueDecimals: 2
					},
					fillColor: {
						linearGradient: {
							x1: 0,
							y1: 0,
							x2: 0,
							y2: 1
						},
						stops: [
							[0, Highcharts.getOptions().colors[0]],
							[1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
						]
					},
					threshold: null
				}]
			});

			var chartButtons = $scope.chart.rangeSelector.buttons;
		};

		var bootstrap = function() {
			initGraph();

			// Create the graph a first time, with empty data:
			createGraph([null]);
			// Show a "Loading..." message overlayed on top of the chart:
			$scope.chart.showLoading();
		};
		$timeout(bootstrap, 0);

		var symbol = $scope.symbol;
		var collection = [];
		var initGraph = function() {
			var dataStream = $websocket('ws://stocks.mnet.website');
			dataStream.onMessage(function(message) {
				var data = JSON.parse(message.data);
				data.forEach(function([name, price]){
					if (name===symbol) {
						var date = new Date().getTime();
					    var arr = [];
						arr.push(date);
						arr.push(price);
						collection.push(arr);
					}
				});
			    if (collection && collection.length > 0) {
						// Hide the "Loading..." message overlayed on top of the chart:
			   	 	$scope.chart.hideLoading();

						// Recreate the chart with the new data:
					createGraph(collection);
				}
			});
			
		};			
	}]);
