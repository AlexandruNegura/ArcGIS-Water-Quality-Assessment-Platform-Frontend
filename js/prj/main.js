$(document).ready(function () {
    /**
     * Function to log out the current user.
     */
    $("#logout-btn").click(function () {
        localStorage.removeItem("username");
        localStorage.removeItem("avatar");

        console.log("Logging out...");
        window.location.href = "/";
    });

    /**
     * Set the username and the avatar after the user logs in.
     */
    function setUsername() {
        let username = localStorage.getItem("username") || "Guest";
        let avatar = localStorage.getItem("avatar") || "../res/blank_avatar.png";

        /* Display the username */
        let usernameSpan = document.getElementById("username");
        usernameSpan.innerHTML += username;

        /* Display the avatar */
        let userAvatar = document.getElementById("avatar");
        userAvatar.src = avatar;
    }

    setUsername();
});