$(document).ready(function () {
    $(".menu-button").click(function () {
        resetAllButtonsColors();
        $(this).addClass("btn-warning");
        let activeMenuID = $(this)[0].id;
        localStorage.setItem("activeMenu", activeMenuID);
    });

    /**
     * Function to log out the current user.
     */
    $("#logout-btn").click(function () {
        localStorage.removeItem("username");
        localStorage.removeItem("avatar");
        localStorage.removeItem("activeMenu");
        localStorage.clear();

        console.log("Logging out...");
        window.location.href = "/";
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
        let username = localStorage.getItem("username") || "Guest";
        let avatar = localStorage.getItem("avatar") || "../res/blank_avatar.png";

        /* Display the username */
        let usernameSpan = document.getElementById("username");
        usernameSpan.innerHTML += username;

        /* Display the avatar */
        let userAvatar = document.getElementById("avatar");
        userAvatar.src = avatar;
    }

    function setActiveMenu() {
        let activeMenu = localStorage.getItem("activeMenu");
        console.log(activeMenu);

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