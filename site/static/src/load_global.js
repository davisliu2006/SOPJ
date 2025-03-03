async function loadGlobal() {
    let response = await fetch("html/global.html");
    let text = await response.text();
    let global = document.getElementById("global");
    global.innerHTML = text;

    // nav bar highlight
    let navInfo = document.querySelector("._info #nav-info");
    if (navInfo) {
        let navBtn = document.getElementById(navInfo.innerHTML);
        navBtn.classList.add("active");
    }

    // mobile navbar
    let navBar = document.querySelector("#top-bar-nav");
    let expand = document.querySelector("#top-bar-nav #nav-expand");
    expand.addEventListener("click", function() {
        if (navBar.classList.contains("active")) {
            navBar.classList.remove("active");
        } else {
            navBar.classList.add("active");
        }
    })
}
loadGlobal();