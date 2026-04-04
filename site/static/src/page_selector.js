/**
 * @param {string} selector
 */
function initPageSelector(selector) {
    let element = document.querySelector(selector);
    _initPageSelector(
        element, 
        Number(element.getAttribute("page-count")),
        JSON.parse(element.getAttribute("req-query"))
    );
}

/**
 * @param {Element} element
 * @param {number} pageCount
 * @param {Object} reqQuery
 */
function _initPageSelector(element, pageCount, reqQuery) {
    const BTN_LIMIT = 10;
    const SCROLL_MAX = Math.ceil(pageCount/BTN_LIMIT)-1;

    let pageBtnHolder = element.querySelector(".page-btn-holder");
    let lbtn = element.querySelector(".page-btn#lbtn");
    let rbtn = element.querySelector(".page-btn#rbtn");

    let selected = (reqQuery.page? Number(reqQuery.page) : 0);
    let scroll = Math.floor(selected/BTN_LIMIT);

    function update() {
        pageBtnHolder.innerHTML = "";
        for (let i = scroll*BTN_LIMIT; i < (scroll+1)*BTN_LIMIT; i++) {
            if (i >= pageCount) {break;}
            let pageBtn = document.createElement("a");
            pageBtn.classList.add("page-btn");
            pageBtn.textContent = i+1;
            if (selected == i) {
                pageBtn.classList.add("disabled");
            } else {
                pageBtn.href = `?${jsonToQueryString({...reqQuery, page: i})}`;
            }
            pageBtnHolder.appendChild(pageBtn);
        }
        if (scroll == 0) {lbtn.classList.add("disabled");}
        else {lbtn.classList.remove("disabled");}
        if (scroll == SCROLL_MAX) {rbtn.classList.add("disabled");}
        else {rbtn.classList.remove("disabled");}
    }

    lbtn.onclick = function() {
        if (scroll > 0) {
            scroll--; update();
        }
    };
    rbtn.onclick = function() {
        if (scroll < SCROLL_MAX) {
            scroll++; update();
        }
    };
    window.addEventListener("load", function() {
        update();
    });
}