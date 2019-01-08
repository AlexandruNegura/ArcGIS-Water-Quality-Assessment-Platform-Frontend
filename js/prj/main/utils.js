let POST = "POST";
let GET = "GET";

/**
 * Makes a GET/POST request.
 *
 * @param type: type of request (GET, POST)
 * @param url: url to make the request
 * @param data: data to be sent
 * @param scc: success callback
 * @param err: error callback
 */
function makeRequest(type, url, data, scc, err) {
	$.ajax({
		url: url,
		type: type,
		contentType: "application/json",
		data: (data !== null)
			? JSON.stringify(data) :
			JSON.stringify({}),
		success: scc,
		error: err
	});
}

/**
 * Gets the start/end time from the timeExtent
 *
 * @param timeExtent to be used
 * @returns {*[]} array with the limitsfgtrtfttr
 */
function getTimelineLimits(timeExtent) {
	let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let startTime =
		monthNames[timeExtent.startTime.getUTCMonth()] + " " +
		timeExtent.startTime.getUTCDate() + " " +
		timeExtent.startTime.getUTCFullYear();
	let endTime =
		monthNames[timeExtent.endTime.getUTCMonth()] + " " +
		timeExtent.endTime.getUTCDate() + " " +
		timeExtent.endTime.getUTCFullYear();

	return [startTime, endTime];
}

function getRandomAvatar() {
	let defaultAvatars = [
		"http://s3-us-west-1.amazonaws.com/witty-avatars/default-avatar-1-l.jpg",
		"http://s3-us-west-1.amazonaws.com/witty-avatars/default-avatar-2-l.jpg",
		"http://s3-us-west-1.amazonaws.com/witty-avatars/default-avatar-3-l.jpg",
		"http://s3-us-west-1.amazonaws.com/witty-avatars/default-avatar-4-l.jpg",
		"http://s3-us-west-1.amazonaws.com/witty-avatars/default-avatar-5-l.jpg",
		"http://www.lovemarks.com/wp-content/uploads/profile-avatars/default-avatar-eskimo-girl.png",
		"http://www.lovemarks.com/wp-content/uploads/profile-avatars/default-avatar-braindead-zombie.png",
		"http://www.lovemarks.com/wp-content/uploads/profile-avatars/default-avatar-ponsy-deer.png",
		"http://www.lovemarks.com/wp-content/uploads/profile-avatars/default-avatar-short-hair-girl.png"];
	return defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
}

// Check if a user clicked on an incident feature.
function selectGraphicsNearSelectedOne(evt, oxLabel, oyLabel, layer) {
	if (!evt.graphic)
		return;

	let valuesToPlot = [];
	let latitude = evt.graphic.attributes.Latitude_D;
	let longitude = evt.graphic.attributes.Longitude_D;

	let graphics = layer.graphics;

	graphics.map(function (graphic) {
		let attributes = graphic.attributes;
		if (attributes.Latitude_D === latitude
			&& attributes.Longitude_D === longitude) {
			valuesToPlot.push([new Date(attributes.Data), attributes.Azot__])
		}
	});

	valuesToPlot.sort(function (a, b) {
		return a[0] - b[0];
	});

	drawBackgroundColor(valuesToPlot, oxLabel, oyLabel, latitude, longitude)
}

function drawBackgroundColor(dataToPLot, oxLabel, oyLabel, latitude, longitude) {
	var data = new google.visualization.DataTable();
	data.addColumn('date', 'X');
	data.addColumn('number', oyLabel);

	if (!dataToPLot) {
		return;
	}
	data.addRows(dataToPLot);
	$('#myModal').modal('show');

	setTimeout(function () {
		var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
		$("#lat").text(latitude);
		$("#lon").text(longitude);

		var options = {
			hAxis: {
				title: oxLabel
			},
			vAxis: {
				title: oyLabel
			},
			chartArea: {
				width: "70%",
				height: "80%",
			}
		};

		chart.draw(data, options);
	}, 500);
}