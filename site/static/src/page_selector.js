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

    let pageBtnHolder = element.querySelector(".page-btn-holder");
    let lbtn = element.querySelector(".page-btn#lbtn");
    let rbtn = element.querySelector(".page-btn#rbtn");

    let scroll = 0;

    function update() {
        pageBtnHolder.innerHTML = "";
        for (let i = scroll*BTN_LIMIT; i < (scroll+1)*BTN_LIMIT; i++) {
            if (i >= pageCount) {break;}
            let pageBtn = document.createElement("a");
            pageBtn.classList.add("page-btn");
            pageBtn.textContent = i+1;
            pageBtn.href = `?${jsonToQueryString({...reqQuery, page: i})}`;
            pageBtnHolder.appendChild(pageBtn);
        }
    }

    lbtn.onclick = function() {
        if (scroll > 0) {
            scroll--; update();
        }
    };
    rbtn.onclick = function() {
        if (scroll < Math.ceil(pageCount/BTN_LIMIT)-1) {
            scroll++; update();
        }
    };
    window.addEventListener("load", function() {
        update();
    });
}