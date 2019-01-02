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