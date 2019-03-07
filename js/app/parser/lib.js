// requires
import espree from "../espree";

export function parse(code, config) {
    var ast = espree.parse(code, config); // throws...

    return JSON.stringify(ast, null, "  ");
}

export function getVersion() {
    return espree.version;
}
