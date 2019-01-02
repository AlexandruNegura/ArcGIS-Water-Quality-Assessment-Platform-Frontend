function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    makeRequest(
        POST,
        "http://www.google.com", {
            username: user,
            password: pass
        }, successCallback(user),
        successCallback(user)
    )
}

function successCallback(user) {
    localStorage.setItem("username", user);
    localStorage.setItem("avatar", "http://s3-us-west-1.amazonaws.com/witty-avatars/default-avatar-1-l.jpg");

    window.location.href = "pag/main.html";
}