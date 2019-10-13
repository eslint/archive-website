import React, { PureComponent } from "react";
import { Popover } from "bootstrap.native";
import ParserOptions from "./ParserOptions";
import Environments from "./Environments";
import RulesConfig from "./RulesConfig";

function initPopovers() {
    const popoverElements = document.querySelectorAll("[data-toggle=\"popover\"]");

    for (let i = 0; i < popoverElements.length; ++i) {
        // eslint-disable-next-line no-new
        new Popover(popoverElements[i]);
    }
}

export default class Configuration extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { showingConfig: false };
        this.toggleShowingConfig = this.toggleShowingConfig.bind(this);
        this.handleParserOptionsUpdate = this.handleParserOptionsUpdate.bind(this);
        this.handleEnvironmentsUpdate = this.handleEnvironmentsUpdate.bind(this);
        this.handleRulesConfigUpdate = this.handleRulesConfigUpdate.bind(this);
    }

    toggleShowingConfig() {
        this.setState({ showingConfig: !this.state.showingConfig });
    }

    componentDidUpdate() {
        if (this.state.showingConfig) {
            initPopovers();
        }
    }

    handleParserOptionsUpdate(parserOptions) {
        this.props.onUpdate(Object.assign({}, this.props.options, { parserOptions }));
    }

    handleEnvironmentsUpdate(env) {
        this.props.onUpdate(Object.assign({}, this.props.options, { env }));
    }

    handleRulesConfigUpdate(rules) {
        this.props.onUpdate(Object.assign({}, this.props.options, { rules }));
    }

    render() {
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
                                    onUpdate={this.handleParserOptionsUpdate}
                                />
                                <hr />
                                <Environments
                                    env={this.props.options.env}
                                    envNames={this.props.envNames}
                                    onUpdate={this.handleEnvironmentsUpdate}
                                />
                                <hr />
                                <RulesConfig
                                    config={this.props.options.rules}
                                    ruleNames={this.props.ruleNames}
                                    docs={this.props.docs}
                                    onUpdate={this.handleRulesConfigUpdate}
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
}
