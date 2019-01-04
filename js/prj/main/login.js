/* Redirect the user back if already logged in */
(function () {
	if (sessionStorage.getItem("activeSession"))
		window.location.href =
			(window.location.href.indexOf("localhost") >= 0) ?
				"/pag/main.html" :
				"/poliloco/pag/main.html";
})();


/**
 * Toggle between the login and register forms.
 */
function toggleForms() {
	let registerSuccessAlert = document.getElementById("reg-suc-alert");
	let registerErrorAlert = document.getElementById("reg-err-alert");
	let rf = document.getElementById("register-form");
	let lf = document.getElementById("login-form");

	rf.style.display = (rf.style.display === "block") ? "none" : "block";
	lf.style.display = (rf.style.display === "block") ? "none" : "block";
	registerSuccessAlert.style.display = "none";
	registerErrorAlert.style.display = "none";
}

function registerUser() {
	let user = document.getElementById("reg-username").value;
	let pass = document.getElementById("reg-password").value;
	let phone = document.getElementById("reg-phone").value;
	let mail = document.getElementById("reg-mail").value;
	if(pass) {
        pass = md5(pass);
    }

	makeRequest(
		POST,
		"https://arcgis-backend.herokuapp.com/api/users/register", {
			avatar: getRandomAvatar(),
			username: user,
			password: pass,
			phone: phone,
			alerts: true,
			mail: mail
		}, registerSuccessCallback,
		registerErrorCallback
	);
}

/**
 * Callback to be called after the register process ended with
 * a success status.
 *
 * @param data: the response of the request
 */
function registerSuccessCallback(data) {
	console.log("[registerSuccessCallback]");
	toggleForms();

	let registerSuccessAlert = document.getElementById("reg-suc-alert");
	registerSuccessAlert.innerHTML = "Account created successfully! You can log in now.";
	registerSuccessAlert.style.display = "block";
}

/**
 * Callback to be called after the register process ended with
 * an error status.
 *
 * @param data: the response of the request
 */
function registerErrorCallback(data) {
	console.log("[registerErrorCallback]");
	if (data.statusText === "error") {
		let registerAlert = document.getElementById("reg-err-alert");
		registerAlert.innerHTML = "Could not create account!";
		registerAlert.style.display = "block";
	}
}

/**
 * Function to be called when the user clicks the login button.
 */
function login() {
	let user = document.getElementById("username").value;
	let pass = document.getElementById("password").value;
	pass = md5(pass);

	makeRequest(
		POST,
		"https://arcgis-backend.herokuapp.com/api/users/login", {
			username: user,
			password: pass
		}, loginSuccessCallback,
		loginErrorCallback
	)
}

function loginSuccessCallback(response) {
	console.log("[loginSuccessCallback]", response);

	sessionStorage.setItem("activeUser", JSON.stringify({
		avatar: response.avatar,
		mail: response.mail,
		phone: response.phone,
		username: response.username,
		alerts: response.alerts
	}));

	sessionStorage.setItem("activeSession", true);
	window.location.href = "pag/main.html";
}

function loginErrorCallback(response) {
	console.log("[loginErrorCallback]", response);
}