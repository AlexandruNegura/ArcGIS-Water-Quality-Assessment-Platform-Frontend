$(document).ready(function () {
    let legendToggle = true;
    $("#legend-toggle").click(function () {
        legendToggle ?
            document.getElementById("legend-container").style.display = "block" :
            document.getElementById("legend-container").style.display = "none";
        legendToggle = !legendToggle;
    });

    let originalTable = $("#stats").clone();
    setInterval(function () {
        $("#stats").replaceWith(originalTable.clone());
        let tableRows = $("#stats tr");

        tableRows.each(function (i, row) {
            $(this).find('td').each(function (i) {
                if (i === 0) return;
                let cellValue = $(this)[0].innerHTML;
                cellValue = Number.parseFloat(cellValue);

                let coef = Math.floor(Math.random() * 21) - 10;
                coef *= 0.01;

                cellValue = cellValue + cellValue * coef;
                $(this)[0].innerHTML = cellValue.toFixed(5);
            });
        });
    }, 2000);

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
                let visibleLayerName = "MuresApe2";

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
