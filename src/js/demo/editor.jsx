import React from "react";
import CodeMirror from "codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/selection/active-line";
import events from "./events";

function debounce(func, wait, immediate) {
    var timeout;

    return function() {
        var context = this, // eslint-disable-line no-invalid-this
            args = arguments;

        function later() {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        }
        var callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this._editor = null;
        this._textMarkers = [];
        this._editorRef = null;
        this._setEditorRef = this._setEditorRef.bind(this);
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
                    from = {
                        line: error.line - 1,
                        ch: error.column - 1
                    };
                    to = {
                        line: error.line - 1,
                        ch: error.column
                    };
                }

                return this._editor.markText(from, to, { className: "editor-error" });
            });
        }
    }

    _setEditorRef(element) {
        this._editorRef = element;
    }

    componentDidMount() {
        this._editor = CodeMirror.fromTextArea(this._editorRef, {
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
            this._editor.setCursor({ line: line - 1, ch: column - 1 });
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
                ref={this._setEditorRef}
                value={this.props.text}
            >
            </textarea>
        );
    }
}
