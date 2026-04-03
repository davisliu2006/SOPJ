/**
 * @param {Object} json
 * @returns {string}
 */
function jsonToQueryString(json) {
    return Object.entries(json)
        .map(([k, v]) => encodeURIComponent(k) + "=" + encodeURIComponent(v))
        .join("&");
}