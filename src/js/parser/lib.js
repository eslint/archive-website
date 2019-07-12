import espree from "../espree";

function parse(code, config) {
    const ast = espree.parse(code, config);

    return JSON.stringify(ast, null, "  ");
}

function getVersion() {
    return espree.version;
}

export default { parse, getVersion };
