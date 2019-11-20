"use strict";

const moment = require("moment");

module.exports = function dateFormat(date, format) {

    /*
    * Convert to UTCString to avoid off by one error.
    * https://www.11ty.io/docs/dates/#dates-off-by-one-day
    */
    return moment(date.toUTCString()).format(format);
};
