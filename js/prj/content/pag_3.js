$(window).on("load", function () {
	let legendToggle = false;
	$("#legend-toggle").click(function () {
		legendToggle ?
			document.getElementById("legend-container").style.display = "block" :
			document.getElementById("legend-container").style.display = "none";
		legendToggle = !legendToggle;
	});

	require([
		"dojo/parser",
		"dojo/ready",
		"dijit/layout/BorderContainer",
		"dijit/layout/ContentPane",
		"dojo/dom",
		"esri/map",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/dijit/TimeSlider",
		"esri/urlUtils",
		"esri/arcgis/utils",
		"esri/dijit/Legend",
		"esri/dijit/Scalebar",
		"dojo/domReady!js/prj/content/pag_3"
	], function (
		parser,
		ready,
		BorderContainer,
		ContentPane,
		dom,
		Map,
		ArcGISDynamicMapServiceLayer,
		TimeSlider,
		urlUtils,
		arcgisUtils,
		Legend,
		Scalebar
	) {
		ready(function () {
			loadingState = "Loading";
			parser.parse();

			arcgisUtils.createMap("903ca98573374d419b4defafaf6342e6", "map").then(function (response) {
				dom.byId("title").innerHTML = response.itemInfo.item.title;
				dom.byId("subtitle").innerHTML = response.itemInfo.item.snippet;

                google.charts.load('current', {packages: ['corechart', 'line']});
                google.charts.setOnLoadCallback(drawBackgroundColor);

				let map = response.map;
				let layerIds = map.graphicsLayerIds;
				let visibleLayerName = ["Temperatura", "MuresApe2"];
				let visibleLayerID = {};
				let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

				for (let i = 0; i < layerIds.length; i++) {
					let layer = map.getLayer(layerIds[i]);
					(!visibleLayerName.includes(layer.name)) ?
						layer.hide() :
						visibleLayerID[layer.name] = layerIds[i];
				}

				let scalebar = new Scalebar({
					map: map,
					scalebarUnit: "english"
				});

				let legendLayers = arcgisUtils.getLegendLayers(response);
				let legendDijit = new Legend({
					map: map,
					layerInfos: legendLayers
				}, "legend");
				legendDijit.startup();

				/* Creating the time slider */
				let timeSlider = new TimeSlider({}, dom.byId("timeSliderDiv"));
				map.setTimeSlider(timeSlider);

				timeSlider.setThumbMovingRate(2000);
				timeSlider.setThumbCount(2);
				timeSlider.setLoop(true);

				/* Set the time extent */
				let layerTimeExtent = map.getLayer(visibleLayerID[visibleLayerName[0]]).timeInfo.timeExtent;
				timeSlider.createTimeStopsByTimeInterval(layerTimeExtent, 6, 'esriTimeUnitsMonths');
				timeSlider.startup();

				/* Show the labels under the time slider */
				let labels = dojo.map(timeSlider.timeStops, (timeStop) => timeStop.getUTCFullYear());
				timeSlider.setLabels(labels);
				timeSlider.play();

				/* Detect slider changes */
				dojo.connect(timeSlider, "onTimeExtentChange", function (timeExtent) {
					let [startTime, endTime] = getTimelineLimits(timeExtent);
					dojo.byId("daterange").innerHTML =
						"Water temperature (C) <b>" + startTime + "</b> to <b>" + endTime + "</b>";
				});

                map.on("click", function(evt) {
                    selectGraphicsNearSelectedOne(evt, "Time", "Temperature", map.getLayer(visibleLayerID[visibleLayerName[0]]));
                });
			});
		});
	});
});
