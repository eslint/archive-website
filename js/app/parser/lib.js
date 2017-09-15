import espree from "espree";

export default {
    parse(code, config) {
        var ast = espree.parse(code, config);

        return JSON.stringify(ast, null, "  ");
    },

    getVersion() {
        return espree.version;
    }
};
