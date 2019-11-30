"use strict";

const { DateTime } = require("luxon");

module.exports = function dateFormat(date, format) {
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(format);
};
