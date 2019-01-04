(function () {
	if (!sessionStorage.getItem("activeSession"))
		window.location.href =
			(window.location.href.indexOf("localhost") >= 0) ?
				"/" :
				"/poliloco";
})();

$(document).ready(function () {
	/**
	 * If a user clicks on a button from the menu, change its
	 * color and save it's name. The name is saved so that after
	 * a refresh, the same active page to be displayed.
	 */
    $(".menu-button").click(function () {
        resetAllButtonsColors();
        $(this).addClass("btn-warning");
        let activeMenuID = $(this)[0].id;
        sessionStorage.setItem("activeMenu", activeMenuID);
    });

	/**
	 * Function to log out the current user. The sessionStorage is
	 * cleared and the user is redirected to the login page.
	 */
    $("#logout-btn").click(function () {
        sessionStorage.clear();
        
        let currentLocation = window.location.href;
        window.location.href = 
            (currentLocation.indexOf("localhost") >= 0) ?
                "/" :
                "/poliloco";
    });

    function resetAllButtonsColors() {
        $(".menu-button").each(function () {
            $(this).removeClass("btn-warning");
        });
    }

    /**
     * Set the username and the avatar after the user logs in.
     */
    function setUsername() {
	    let activeUser = sessionStorage.getItem("activeUser");
	    activeUser = JSON.parse(activeUser);

        let username = activeUser.username || "Guest";
        let avatar = activeUser.avatar || "../res/blank_avatar.png";

        /* Display the username */
        let usernameSpan = document.getElementById("username");
        usernameSpan.innerHTML += username;

        /* Display the avatar */
        let userAvatar = document.getElementById("avatar");
        userAvatar.src = avatar;
    }

	/**
	 * This function is called after each refresh. If this is
	 * not the user's first visit, the previously menu state
	 * will be recovered and applied.
	 */
    function setActiveMenu() {
        let activeMenu = sessionStorage.getItem("activeMenu");
        if (activeMenu) {
            let menuButton = $("#" + activeMenu);
            if (menuButton) {
                resetAllButtonsColors();
                menuButton.addClass("btn-warning");

                let activeWindow = menuButton.parent()[0].href;
                if (activeWindow) {
                    let tokens = activeWindow.split('/');
                    $("#main").attr('src', tokens[tokens.length - 1]);
                }
            }
        }
    }

    setUsername();
    setActiveMenu();
});
