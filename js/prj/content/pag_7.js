$(window).on("load", function () {
	/**
	 * Set the username and the avatar after the user logs in.
	 */
	function setData() {
		let activeUser = sessionStorage.getItem("activeUser");
		activeUser = JSON.parse(activeUser);

		if (!activeUser) return;

		/* Display the username */
		let fieldAvtarSrc = document.getElementById("avatarsrc");
		let fieldUser = document.getElementById("username");
		let fieldAvatar = document.getElementById("avatar");
		let fieldAlerts= document.getElementById("alerts");
		let fieldPhone = document.getElementById("phone");
		let fieldMail = document.getElementById("mail");

		fieldAvtarSrc.value = activeUser.avatar;
		fieldAlerts.checked = activeUser.alerts;
		fieldUser.value += activeUser.username;
		fieldPhone.value += activeUser.phone;
		fieldAvatar.src = activeUser.avatar;
		fieldMail.value += activeUser.mail;
	}

	setData();
});
