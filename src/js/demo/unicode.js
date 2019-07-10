// Provides conversion functions between a unicode string and a base64 string.
// See also: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Unicode_strings

export default {
    encodeToBase64: function(text) {
        return window.btoa(unescape(encodeURIComponent(text)));
    },

    decodeFromBase64: function(base64) {
        return decodeURIComponent(escape(window.atob(base64)));
    }
};
