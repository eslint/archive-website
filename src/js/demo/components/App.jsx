import React, { Component } from "react";
import Editor from "./Editor";
import Messages from "./Messages";
import FixedCode from "./FixedCode";
import BugReport from "./BugReport";
import Crash from "./Crash";
import Configuration from "./Configuration";
import Unicode from "../utils/unicode";
import linterModule from "../node_modules/eslint/lib/linter/linter";

function getUrlState() {
    try {
        return JSON.parse(Unicode.decodeFromBase64(window.location.hash.replace(/^#/u, "")));
    } catch {
        return null;
    }
}

const hasLocalStorage = (function() {
    try {
        window.localStorage.setItem("localStorageTest", "foo");
        window.localStorage.removeItem("localStorageTest");
        return true;
    } catch {
        return false;
    }
}());

const linter = new linterModule.Linter();
const rules = linter.getRules();
const ruleNames = Array.from(rules.keys());
const docs = Array.from(rules.entries()).reduce((result, [key, value]) => {
    result[key] = value.meta;
    return result;
}, {});

const ENV_NAMES = [
    "browser",
    "node",
    "commonjs",
    "shared-node-browser",
    "worker",
    "amd",
    "mocha",
    "jasmine",
    "jest",
    "phantomjs",
    "jquery",
    "qunit",
    "prototypejs",
    "shelljs",
    "meteor",
    "mongo",
    "protractor",
    "applescript",
    "nashorn",
    "serviceworker",
    "atomtest",
    "embertest",
    "webextensions",
    "es6",
    "es2017",
    "es2020",
    "es2021",
    "greasemonkey"
];

export default class App extends Component {
    constructor(props) {
        super(props);

        const storedState = JSON.parse(window.localStorage.getItem("linterDemoState") || null);
        const urlState = getUrlState();
        const initialState = Object.assign(
            { fix: false },
            urlState || storedState || {
                options: {
                    parserOptions: {
                        ecmaVersion: "latest",
                        sourceType: "script",
                        ecmaFeatures: {}
                    },
                    rules: [...rules.entries()].reduce((result, [ruleId, rule]) => {
                        if (rule.meta.docs.recommended) {
                            result[ruleId] = 2;
                        }
                        return result;
                    }, {}),
                    env: {}
                },
                text: "var foo = bar;"
            }
        );

        if (
            initialState &&
            initialState.options &&
            initialState.options.parserOptions &&
            initialState.options.parserOptions.ecmaFeatures &&
            initialState.options.parserOptions.ecmaFeatures.experimentalObjectRestSpread
        ) {

            // Delete the `experimentalObjectRestSpread` option from old states created when the demo supported the option.
            delete initialState.options.parserOptions.ecmaFeatures.experimentalObjectRestSpread;
        }

        this.state = initialState;
        this.handleChange = this.handleChange.bind(this);
        this.updateOptions = this.updateOptions.bind(this);
        this.enableFixMode = this.enableFixMode.bind(this);
        this.disableFixMode = this.disableFixMode.bind(this);
    }

    handleChange(event) {
        this.setState({ text: event.value }, this.storeState);
    }

    updateOptions(options) {
        this.setState({ options }, this.storeState);
    }

    lint() {
        try {
            const { messages, output } = linter.verifyAndFix(this.state.text, this.state.options, { fix: this.state.fix });
            let fatalMessage;

            if (messages && messages.length > 0 && messages[0].fatal) {
                fatalMessage = messages[0];
            }
            return {
                messages,
                output,
                fatalMessage
            };
        } catch (error) {
            return {
                messages: [],
                output: this.state.text,
                error
            };
        }
    }

    storeState() {
        const serializedState = JSON.stringify({ text: this.state.text, options: this.state.options });

        if (hasLocalStorage) {
            window.localStorage.setItem("linterDemoState", serializedState);
        }
        window.location.hash = Unicode.encodeToBase64(serializedState);
    }

    enableFixMode(event) {
        event.preventDefault();
        this.setState({ fix: true });
    }

    disableFixMode(event) {
        event.preventDefault();
        this.setState({ fix: false });
    }

    render() {
        const { text, fix, options } = this.state;
        const { messages, output, fatalMessage, error } = this.lint();
        const isInvalidAutofix = fatalMessage && text !== output;
        const sourceCode = linter.getSourceCode();

        return (
            <div className="container editor-row">
                <div className="row">
                    <div className="col-md-7">
                        <Editor
                            onChange={this.handleChange}
                            text={text}
                            errors={messages}
                            getIndexFromLoc={sourceCode && sourceCode.getIndexFromLoc.bind(sourceCode)}
                        />
                    </div>
                    <div className="col-md-5">
                        <ul className="nav nav-tabs" role="tablist">
                            <li
                                role="presentation"
                                className={fix ? "" : "active"}
                            >
                                <a
                                    href="#messages"
                                    aria-controls="messages"
                                    role="tab"
                                    onClick={this.disableFixMode}
                                >
                                    Messages
                                </a>
                            </li>
                            <li
                                role="presentation"
                                className={fix ? "active" : ""}
                            >
                                <a
                                    href="#fixedCode"
                                    aria-controls="fixedCode"
                                    role="tab"
                                    onClick={this.enableFixMode}
                                >
                                    Fixed Code
                                </a>
                            </li>
                        </ul>

                        <div className="tab-content">
                            <div role="tabpanel" className="tab-pane active" >
                                {
                                    isInvalidAutofix && <BugReport message={`Invalid autofix! ${fatalMessage.message}`} />
                                }
                                {
                                    error && <Crash error={error} /> ||
                                    fix && <FixedCode values={output} /> ||
                                    <Messages values={messages} />
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <Configuration
                        ruleNames={ruleNames}
                        envNames={ENV_NAMES}
                        options={options}
                        docs={docs}
                        onUpdate={this.updateOptions}
                        eslintVersion={linter.version}
                    />
                </div>
            </div>
        );
    }
}
