/* global Popover */

import React from "react";
import ParserOptions from "./parserOptions";
import Environments from "./environments";
import RulesConfig from "./rulesConfig";

export default React.createClass({
    displayName: "Configuration",
    getInitialState() {
        return { showingConfig: false };
    },
    initPopovers() {
        const popoverElements = document.querySelectorAll("[data-toggle=\"popover\"]");

        for (let i = 0; i < popoverElements.length; ++i) {
            // eslint-disable-next-line no-new
            new Popover(popoverElements[i]);
        }
    },
    toggleShowingConfig() {
        const obj = this;

        this.setState(
            state => ({ showingConfig: !state.showingConfig }),
            () => {
                if (obj.state.showingConfig) {
                    obj.initPopovers();
                }
            }
        );
    },
    render: function Configuration() {
        return (
            <div className="panel-group" id="accordion">
                <div className="panel panel-default">
                    <button
                        className="panel-heading demo-config-bar"
                        tabIndex={0}
                        onClick={this.toggleShowingConfig}
                    >
                        <h4 className="panel-title">
                            Rules Configuration
                        </h4>
                        <div className="eslint-version-info">
                            ESLint v{this.props.eslintVersion}
                        </div>
                    </button>
                    {
                        this.state.showingConfig && <div>
                            <div className="panel-body">
                                <ParserOptions
                                    options={this.props.options.parserOptions}
                                    onUpdate={
                                        function(parserOptions) {
                                            this.props.onUpdate(Object.assign({}, this.props.options, { parserOptions }));
                                        }.bind(this)
                                    }
                                />
                                <hr />
                                <Environments
                                    env={this.props.options.env}
                                    envNames={this.props.envNames}
                                    onUpdate={
                                        function(env) {
                                            this.props.onUpdate(Object.assign({}, this.props.options, { env }));
                                        }.bind(this)
                                    }
                                />
                                <hr />
                                <RulesConfig
                                    config={this.props.options.rules}
                                    ruleNames={this.props.ruleNames}
                                    docs={this.props.docs}
                                    onUpdate={
                                        function(rules) {
                                            this.props.onUpdate(Object.assign({}, this.props.options, { rules }));
                                        }.bind(this)
                                    }
                                />
                                <hr />
                                <a
                                    download=".eslintrc.json"
                                    href={
                                        `data:application/json;charset=utf-8,${
                                            encodeURIComponent(JSON.stringify(this.props.options, null, 4))}`
                                    }
                                >
                                    Download <code className="highlighter-rouge">.eslintrc.json</code> file with this configuration
                                </a>
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
});
