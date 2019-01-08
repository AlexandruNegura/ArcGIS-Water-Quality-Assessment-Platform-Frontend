$(window).on("load", function () {
	require([
			"esri/Map",
			"esri/views/MapView",
			"esri/layers/FeatureLayer",
			"esri/Graphic",
			"esri/widgets/Expand",
			"esri/widgets/FeatureForm",
			"esri/widgets/FeatureTemplates",
			"esri/widgets/ScaleBar",
		],
		function (
			Map,
			MapView, FeatureLayer, Graphic, Expand,
			FeatureForm, FeatureTemplates,
			Scalebar
		) {

			let editFeature, highlight;

			const featureLayer = new FeatureLayer({
				url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/Incident_Report/FeatureServer/0",
				outFields: ["*"],
				popupEnabled: false,
				id: "incidentsLayer"
			});

			const waterLayer = new FeatureLayer({
				url: "https://services2.arcgis.com/j80Jz20at6Bi0thr/arcgis/rest/services/MuresApe2/FeatureServer/0",
				outFields: ["*"],
				popupEnabled: false,
				id: "waterField"
			});

			const map = new Map({
				basemap: "topo",
				layers: [waterLayer, featureLayer]
			});

			const view = new MapView({
				container: "viewDiv",
				map: map,
				center: [24.506351, 46.516413],
				zoom: 13
			});

			let scalebar = new Scalebar({
				map: map,
				scalebarUnit: "english"
			});

			// New FeatureForm and set its layer to 'Incidents' FeatureLayer.
			// FeatureForm displays attributes of fields specified in fieldConfig.
			const featureForm = new FeatureForm({
				container: "formDiv",
				layer: featureLayer,
				fieldConfig: [{
					name: "IncidentType",
					label: "Choose incident type"
				}, {
					name: "IncidentDescription",
					label: "Describe the problem"
				}, {
					name: "ReportedBy",
					label: "Incident reportedBy",
					editable: false
				}]
			});

			const featureFormViewOnly = new FeatureForm({
				container: "formDivViewOnly",
				layer: featureLayer,
				fieldConfig: [{
					name: "IncidentType",
					label: "Choose incident type",
					editable: false
				}, {
					name: "IncidentDescription",
					label: "Describe the problem",
					editable: false

				}, {
					name: "ReportedBy",
					label: "Incident reportedBy",
					editable: false
				}]
			});

			// Listen to the feature form's submit event.
			// Update feature attributes shown in the form.
			featureForm.on("submit", function () {
				if (editFeature) {
					const updated = featureForm.getValues();
					Object.keys(updated).forEach(function (name) {
						editFeature.attributes[name] = updated[name];
						console.log(name);
					});

					editFeature.attributes["Latitude"]
						= editFeature.attributes["Latitude_D"]
						= featureForm.feature.geometry.latitude;

					editFeature.attributes["Longitude"]
						= editFeature.attributes["Longitude_D"]
						= featureForm.feature.geometry.longitude;

					let activeUser = sessionStorage.getItem("activeUser");
					activeUser = JSON.parse(activeUser);
					editFeature.attributes["ReportedBy"] = activeUser.username || "Unknown";

					// Setup the applyEdits parameter with updates.
					const edits = {
						updateFeatures: [editFeature]
					};

					applyEditsToIncidents(edits);
					document.getElementById("viewDiv").style.cursor = "auto";

					makeRequest(
						POST,
						"https://arcgis-backend.herokuapp.com/api/mails/send", {
							sender: activeUser.username,
							incidentType: editFeature.attributes["IncidentType"],
							location: "[" + editFeature.attributes["Latitude"] + ", " + editFeature.attributes["Longitude"] + "]",
							description: editFeature.attributes["IncidentDescription"],
						}, mailSuccessCallback,
						mailErrorCallback
					);
				}
			});

			function mailSuccessCallback() {
				console.log("[Sent mail successfully]")
			}

			function mailErrorCallback() {
				console.log("[Sent mail unsuccessfully]")
			}

			// Check if the user clicked on the existing feature
			selectExistingFeature();

			// The FeatureTemplates widget uses the 'addTemplatesDiv'
			// element to display feature templates from incidentsLayer
			const templates = new FeatureTemplates({
				container: "addTemplatesDiv",
				layers: [featureLayer]
			});

			// Listen for when a template item is selected
			templates.on("select", function (evtTemplate) {

				// Access the template item's attributes from the event's
				// template prototype.
				attributes = evtTemplate.template.prototype.attributes;
				unselectFeature();
				document.getElementById("viewDiv").style.cursor = "crosshair";

				// With the selected template item, listen for the view's click event and create feature
				const handler = view.on("click", function (event) {
					// remove click event handler once user clicks on the view
					// to create a new feature
					handler.remove();
					event.stopPropagation();
					featureForm.feature = null;

					if (event.mapPoint) {
						point = event.mapPoint.clone();
						point.z = undefined;
						point.hasZ = false;

						// Create a new feature using one of the selected
						// template items.
						editFeature = new Graphic({
							geometry: point,
							attributes: {
								"IncidentType": attributes.IncidentType
							}
						});

						// Setup the applyEdits parameter with adds.
						const edits = {
							addFeatures: [editFeature]
						};
						applyEditsToIncidents(edits);
						document.getElementById("viewDiv").style.cursor = "auto";
					} else {
						console.error("event.mapPoint is not defined");
					}
				});
			});

			// Call FeatureLayer.applyEdits() with specified params.
			function applyEditsToIncidents(params) {
				// unselectFeature();
				featureLayer.applyEdits(params).then(function (editsResult) {
					// Get the objectId of the newly added feature.
					// Call selectFeature function to highlight the new feature.
					if (editsResult.addFeatureResults.length > 0 || editsResult.updateFeatureResults.length > 0) {
						unselectFeature();
						let objectId;
						if (editsResult.addFeatureResults.length > 0) {
							objectId = editsResult.addFeatureResults[0].objectId;
						} else {
							featureForm.feature = null;
							objectId = editsResult.updateFeatureResults[0].objectId;
						}
						selectFeature(objectId);
						if (addFeatureDiv.style.display === "block") {
							toggleEditingDivsAndRemoveView("none", "block");
						}
					}
					// show FeatureTemplates if user deleted a feature
					else if (editsResult.deleteFeatureResults.length > 0) {
						toggleEditingDivs("block", "none");
					}
				}).catch(function (error) {
					console.log("===============================================");
					console.error("[ applyEdits ] FAILURE: ", error.code, error.name,
						error.message);
					console.log("error = ", error);
				});
			}

			// Check if a user clicked on an incident feature.
			function selectExistingFeature() {
				view.on("click", function (event) {
					// clear previous feature selection
					unselectFeature();
					if (document.getElementById("viewDiv").style.cursor !== "crosshair") {
						view.hitTest(event).then(function (response) {
							// If a user clicks on an incident feature, select the feature.
							if (response.results.length === 0) {
								toggleEditingDivs("block", "none");
							} else if (response.results[0].graphic && response.results[0].graphic.layer.id === "incidentsLayer") {
								if (addFeatureDiv.style.display === "block") {
									let user = JSON.parse(sessionStorage.getItem("activeUser"));
									checkIfCreatorOfIncident(
										response.results[0].graphic.attributes[featureLayer.objectIdField],
										function (creator) {
											if (user.username === "asdd" || creator === user.username) {
												toggleEditingDivsAndRemoveView("none", "block");
												selectFeature(response.results[0].graphic.attributes[featureLayer.objectIdField]);
											} else {
												toggleViewDiv("none", "block");
												selectFeatureViewOnly(response.results[0].graphic.attributes[featureLayer.objectIdField]);
											}
										}
									)

								}
							}
						});
					}
				});
			}

			// Highlights the clicked feature and display
			// the feature form with the incident's attributes.
			function selectFeatureViewOnly(objectId) {
				// query feature from the server
				featureLayer.queryFeatures({
					objectIds: [objectId],
					outFields: ["*"],
					returnGeometry: true
				}).then(function (results) {
					if (results.features.length > 0) {
						editFeature = results.features[0];

						featureFormViewOnly.feature = editFeature;

						// highlight the feature on the view
						view.whenLayerView(editFeature.layer).then(function (layerView) {
							highlight = layerView.highlight(editFeature);
						});
					}
				});
			}

			// Highlights the clicked feature and display
			// the feature form with the incident's attributes.
			function selectFeature(objectId) {
				// query feature from the server
				featureLayer.queryFeatures({
					objectIds: [objectId],
					outFields: ["*"],
					returnGeometry: true
				}).then(function (results) {
					if (results.features.length > 0) {
						editFeature = results.features[0];

						// display the attributes of selected feature in the form
						featureForm.feature = editFeature;

						// highlight the feature on the view
						view.whenLayerView(editFeature.layer).then(function (layerView) {
							highlight = layerView.highlight(editFeature);
						});
					}
				});
			}

			function checkIfCreatorOfIncident(objectId, callback) {
				// query feature from the server
				featureLayer.queryFeatures({
					objectIds: [objectId],
					outFields: ["*"],
					returnGeometry: true
				}).then(function (results) {
					if (results.features.length > 0) {
						editFeature = results.features[0];

						let creator = editFeature.attributes["ReportedBy"];

						if (callback) {
							callback(creator);
						}
					}
				});
			}

			// Expand widget for the editArea div.
			const editExpand = new Expand({
				expandIconClass: "esri-icon-edit",
				expandTooltip: "Expand Edit",
				expanded: true,
				view: view,
				content: document.getElementById("editArea")
			});

			view.ui.add(editExpand, "top-right");
			// input boxes for the attribute editing
			const addFeatureDiv = document.getElementById("addFeatureDiv");
			const attributeEditing = document.getElementById("featureUpdateDiv");
			const viewAtribute = document.getElementById("featureUpdateDivViewOnly");


			// Controls visibility of addFeature or attributeEditing divs
			function toggleEditingDivs(addDiv, attributesDiv) {
				addFeatureDiv.style.display = addDiv;
				viewAtribute.style.display = attributesDiv;
				attributeEditing.style.display = attributesDiv;

				document.getElementById("updateInstructionDiv").style.display = addDiv;
			}

			// Controls visibility of addFeature or attributeEditing divs
			function toggleEditingDivsAndRemoveView(addDiv, attributesDiv) {
				addFeatureDiv.style.display = addDiv;
				viewAtribute.style.display = addDiv;
				attributeEditing.style.display = attributesDiv;

				document.getElementById("updateInstructionDiv").style.display = addDiv;
			}

			// Controls visibility of addFeature or attributeEditing divs
			function toggleViewDiv(addDiv, attributesDiv) {
				addFeatureDiv.style.display = addDiv;
				attributeEditing.style.display = addDiv;
				viewAtribute.style.display = attributesDiv;

				document.getElementById("updateInstructionDiv").style.display = addDiv;
			}

			// Remove the feature highlight and remove attributes
			// from the feature form.
			function unselectFeature() {
				if (highlight) {
					highlight.remove();
				}
			}

			// Update attributes of the selected feature.
			document.getElementById("btnUpdate").onclick = function () {
				// Fires feature form's submit event.
				featureForm.submit();
			};

			// Delete the selected feature. ApplyEdits is called
			// with the selected feature to be deleted.
			document.getElementById("btnDelete").onclick = function () {
				// setup the applyEdits parameter with deletes.
				const edits = {
					deleteFeatures: [editFeature]
				};
				applyEditsToIncidents(edits);
				document.getElementById("viewDiv").style.cursor = "auto";
			}
		});
});
