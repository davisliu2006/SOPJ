async function loadFooter() {
    let response = await fetch("html/footer.html");
    let text = await response.text();
    let footer = document.getElementById("footer");
    footer.innerHTML = text;

    function cover() {
        let mainElem = document.querySelector("#main");
        let diff = window.innerHeight - mainElem.clientHeight - 60;
        console.log(diff);
        if (diff > 0) {
            let subFooter = footer.querySelector("#sub-footer");
            // subFooter.style.height = diff+"px"
            footer.style.top = diff+"px"
        }
    }
    window.addEventListener("resize", cover);
    cover();
}
loadFooter();