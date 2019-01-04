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
            ? data :
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