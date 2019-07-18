import React, { Component } from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/selection/active-line";
import events from "../utils/events";

function debounce(func, wait, immediate) {
    let timeout;

    return function(...args) {
        const context = this; // eslint-disable-line no-invalid-this

        function later() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }
        const callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

export default class Editor extends Component {
    constructor(props) {
        super(props);
        this._editor = null;
        this._textMarkers = [];
        this._editorRef = React.createRef();
    }

    _clearTextMarkers() {
        if (this._textMarkers.length) {
            this._textMarkers.forEach(marker => {
                marker.clear();
            });
            this._textMarkers = [];
        }
    }

    _showProblems() {
        this._clearTextMarkers();

        if (this.props.errors) {
            this._textMarkers = this.props.errors.map(error => {
                let from = {
                    line: error.line - 1,
                    ch: error.column - 1
                };
                let to = {
                    line: (error.endLine || error.line) - 1,
                    ch: (error.endColumn || error.column) - 1
                };

                if (error.fatal) {

                    // line and column are undefined when parsing cannot occur (e.g. misconfiguration)
                    if (typeof error.line === "number" && typeof error.column === "number") {
                        to = {
                            line: error.line - 1,
                            ch: error.column
                        };
                    } else {
                        from = {
                            line: 0,
                            ch: 0
                        };
                        to = {
                            line: 0,
                            ch: 0
                        };
                    }
                }

                return this._editor.markText(from, to, { className: "editor-error" });
            });
        }
    }

    componentDidMount() {
        this._editor = CodeMirror.fromTextArea(this._editorRef.current, {
            mode: "javascript",
            lineNumbers: true,
            showCursorWhenSelecting: true,
            styleActiveLine: true,
            matchBrackets: true
        });

        this._editor.on("change", debounce(() => {
            this.props.onChange({ value: this._editor.getValue() });
        }, 500));

        events.on("showError", (line, column) => {

            // line and column are undefined when parsing cannot occur (e.g. misconfiguration)
            const cursorLoc = (typeof line === "number" && typeof column === "number")
                ? { line: line - 1, ch: column - 1 }
                : { line: 0, ch: 0 };

            this._editor.setCursor(cursorLoc);
            this._editor.focus();
        });

        this._showProblems();
    }

    componentDidUpdate() {
        this._showProblems();
    }

    render() {
        return (
            <textarea
                readOnly
                autoComplete="off"
                ref={this._editorRef}
                value={this.props.text}
            >
            </textarea>
        );
    }
}
