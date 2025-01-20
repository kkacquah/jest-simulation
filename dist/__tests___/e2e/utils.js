"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeIcons = normalizeIcons;
function normalizeIcons(str) {
    if (!str) {
        return str;
    }
    // Make sure to keep in sync with `jest-util/src/specialChars`
    return str
        .replaceAll(new RegExp('\u00D7', 'gu'), '\u2715')
        .replaceAll(new RegExp('\u221A', 'gu'), '\u2713');
}
