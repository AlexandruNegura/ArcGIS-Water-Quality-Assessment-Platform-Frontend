$(document).ready(function () {
    let legendToggle = true;
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
        "esri/urlUtils",
        "esri/arcgis/utils",
        "esri/dijit/Legend",
        "esri/dijit/Scalebar",
        "dojo/domReady!"
    ], function (
        parser,
        ready,
        BorderContainer,
        ContentPane,
        dom,
        Map,
        ArcGISDynamicMapServiceLayer,
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

                let map = response.map;
                let layerIds = map.graphicsLayerIds;
                let visibleLayerName = "Nivelul apei";

                for (let i = 0; i < layerIds.length; i++) {
                    let layer = map.getLayer(layerIds[i]);
                    if (layer.name !== visibleLayerName)
                        layer.hide();
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
            });
        });
    });
});
