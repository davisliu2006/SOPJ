/**
 * @param {string} selector
 */
function initCollapsable(selector) {
    let collapsable = document.querySelector(selector);
    _initCollapsable(collapsable);
}

/**
 * @param {string} selector
 */
function initCollapsables(selector) {
    let collapsables = document.querySelectorAll(selector);
    for (let collapsable of collapsables) {
        _initCollapsable(collapsable);
    }
}

/**
 * @param {Element} collapsable
 */
function _initCollapsable(collapsable) {
    let btn = collapsable.querySelector(".collapsable-btn");
    let btnIcon = btn.querySelector("i");
    let frame = collapsable.querySelector(".collapsable-frame");
    let inner = frame.querySelector(".collapsable-inner");
    
    let active = false;

    function setup() {

    }
    function update() {
        if (active) {
            frame.style.transition = "height 0.5s";
            frame.style.height = frame.scrollHeight+"px";
            btnIcon.classList.remove("fa-chevron-right");
            btnIcon.classList.add("fa-chevron-down");
        } else {
            frame.style.transition = "height 0.5s";
            frame.style.height = "0px";
            btnIcon.classList.remove("fa-chevron-down");
            btnIcon.classList.add("fa-chevron-right");
        }
    }
                            
    btn.onclick = function() {
        active = !active;
        update();
    }
    window.addEventListener("resize", function() {
        if (active) {
            frame.style.height = "fit-content";
        }
    });
    window.addEventListener("load", function(event) {
        setup();
    });
}