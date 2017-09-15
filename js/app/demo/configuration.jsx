"use strict";

define(["react", "jsx!parserOptions", "jsx!environments", "jsx!rulesConfig"], function(React, ParserOptions, Environments, RulesConfig) {
    return function Configuration(props) {
        return (
            <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                <div className="panel panel-default">
                    <div className="panel-heading demo-config-bar" role="tab" id="headingOne">
                        <h4 className="panel-title">
                            <a data-toggle="collapse" data-parent="#accordion" href="#configuration" aria-expanded="true" aria-controls="configuration">
                                Rules Configuration
                            </a>
                        </h4>
                        <div className="eslint-version-info">
                            ESLint v{props.eslintVersion}
                        </div>
                    </div>
                    <div id="configuration" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                        <div className="panel-body">
                            <ParserOptions
                                options={props.options.parserOptions}
                                onUpdate={
                                    function(parserOptions) {
                                        props.onUpdate(Object.assign({}, props.options, { parserOptions: parserOptions }));
                                    }
                                }
                            />
                            <hr />
                            <Environments
                                env={props.options.env}
                                envNames={props.envNames}
                                onUpdate={
                                    function(env) {
                                        props.onUpdate(Object.assign({}, props.options, { env: env }));
                                    }
                                }
                            />
                            <hr />
                            <RulesConfig
                                config={props.options.rules}
                                ruleNames={props.ruleNames}
                                docs={props.docs}
                                onUpdate={
                                    function(rules) {
                                        props.onUpdate(Object.assign({}, props.options, { rules: rules }));
                                    }
                                }
                            />
                            <hr />
                            <a
                                download=".eslintrc.json"
                                href={
                                    "data:application/json;charset=utf-8," +
                                    encodeURIComponent(JSON.stringify(props.options, null, 4))
                                }
                            >
                                Download <code className="highlighter-rouge">.eslintrc.json</code> file with this configuration
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
});
