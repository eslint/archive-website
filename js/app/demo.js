// Code goes here

requirejs.config({
    paths: {
        'text': '//cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text',
        'orion': 'http://eclipse.org/orion/editor/releases/current/built-editor-amd.min'
    }
});

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

require([
    'orion',
    '../js/app/eslint.js',
    'text!../js/app/eslint.json'
], function(edit, eslint, config) {
    function makeResultNode(options) {
        var result = document.createElement('div');
        var classList = result.classList;

        classList.add('alert');

        if (options.fatal) {
            classList.add('alert-danger');
        }

        if (options.hasOwnProperty('severity')) {
            if (options.severity === 1) {
                classList.add('alert-warning');
            } else if (options.severity === 2) {
                classList.add('alert-danger');
            }
        } else {
            classList.add('alert-success');
        }

        if (options.hasOwnProperty('column') &&
            options.hasOwnProperty('line') &&
            options.hasOwnProperty('message')) {

            result.onclick = (function( editor, options ) {
                editor.onGotoLine( options.line - 1, options.column - 1, options.column - 1 );
            }).bind( null, editor, options );

            result.innerHTML = options.line + ':' + options.column +
            ' - ' + options.message + ' (<a href="http://eslint.org/docs/rules/' + options.ruleId + '">' + options.ruleId + '</a>)';
            result.setAttribute('title', options.message);
        } else if (options.hasOwnProperty('message')) {
            result.textContent = 'Lint-free!';
        }

        return result;
    }

    function saveConfig() {
        var environments = {}, rules = {}, ecmaFeatures = {};
        $('.ecmaFeatures input').each(function() {
            var name = $(this).attr('id');
            var value = $(this).is(':checked');
            ecmaFeatures[name] = value;
        });
        $('.environments input').each(function() {
            var name = $(this).attr('id');
            var value = $(this).is(':checked');
            environments[name] = value;
        });
        $('.rules input').each(function() {
            var name = $(this).attr('id');
            var value = $(this).is(':checked') ? 2 : 0;
            rules[name] = value;
        });

        OPTIONS.rules = rules;
        OPTIONS.env = environments;
        OPTIONS.ecmaFeatures = ecmaFeatures;
        localStorage.rules = JSON.stringify(rules);
        localStorage.ecmaFeatures = JSON.stringify(ecmaFeatures);
        localStorage.env = JSON.stringify(environments);
        verify();
    }
    
    function saveConfigAndClose() {
        saveConfig();
        $("#configuration").collapse('hide');
    }

    function displayResults(results) {
        var resultsNode = document.getElementById('results');

        var nodes = [].slice.call(resultsNode.childNodes);
        nodes.forEach(resultsNode.removeChild.bind(resultsNode));

        if (results.length === 0) {
            var resultNode = makeResultNode({
                message: 'Lint-free!'
            });
            resultsNode.appendChild(resultNode);
        } else {
            results.forEach(function(result) {
                var resultNode = makeResultNode(result);
                resultsNode.appendChild(resultNode);
            });
        }
        editor.showProblems(results.map(function(error) {
        	return {
        		line: error.line,
        		start: error.column,
        		end: error.column + 1,
        		description: error.message + ' (' + error.ruleId + ')',
        		severity: error.severity === 2 ? 'error' : 'warning'
        	};
        }));
    }

    function addPopover(checkbox, rule) {
        checkbox.popover({
            title: rule,
            content: function() {
                var me = $(this);
                if (me.data('content')) {
                    return me.data('content');
                } else {
                    $.ajax({
                        url: '/docs/rules/' + me.text() + '.html',
                        method: 'GET',
                        success: function (data) {
                            var html = $(data);
                            var firstParagraph = html.find('p:first');
                            $('.popover-content').html(firstParagraph);
                            me.data('content', firstParagraph);
                        }
                    });
                    return 'Loading...';
                }
            },
            placement: function(popover, checkbox) {
                return $(checkbox).offset().left < 270 ? 'right' : 'left';
            },
            html: true
        });
        checkbox.on('mouseenter', function() {
            $(this).popover('show');
        });
        checkbox.on('mouseleave', function() {
            $(this).popover('hide');
        });
    }

    function populateConfiguration(rules, environments, ecmaFeatures) {

        var checkbox, parent;

        // ecmaFeatures
        for (var feature in ecmaFeatures) {
            checkbox = $('<div class="checkbox-inline"><label><input class="feature" type="checkbox" />' + feature +'</label></div>');
            $('input', checkbox).attr('id', feature).prop('checked', ecmaFeatures[feature]);
            $('.ecmaFeatures .list').append(checkbox);
        }

        // environments
        for (var env in environments) {
            checkbox = $('<div class="checkbox-inline"><label><input type="checkbox" />' + env +'</label></div>');
            $('input', checkbox).attr('id', env).prop('checked', environments[env]);
            $('.environments .list').append(checkbox);
        }

        // rules
        Object.keys(rules).forEach(function(rule, i, keys) {
            var limit = Math.ceil(keys.length / 3);
            if (i % limit === 0) {
                parent = $('<div class="col-md-4"></div>');
                $('.rules').append(parent);
            }
            checkbox = $('<div class="checkbox"><label><input type="checkbox" />' + rule +'</label></div>');
            addPopover(checkbox, rule);
            $('input', checkbox).attr('id', rule).prop('checked', rules[rule] !== 0);
            parent.append(checkbox);
        });

        $('#configuration').on('change', 'input[type=checkbox]', saveConfig);
        $('#configuration .btn').click(saveConfigAndClose);
    }

    var OPTIONS = JSON.parse(config);
    if (localStorage.rules) {
        OPTIONS.rules = JSON.parse(localStorage.rules);
    }
    if (localStorage.env) {
        OPTIONS.env = JSON.parse(localStorage.env);
    }
    if (localStorage.ecmaFeatures) {
        OPTIONS.ecmaFeatures = JSON.parse(localStorage.ecmaFeatures);
    }

    // ensure certain environments are available
    OPTIONS.env = OPTIONS.env || {};
    OPTIONS.env.node = OPTIONS.env.node || false;
    OPTIONS.env.browser = OPTIONS.env.browser || false;
    OPTIONS.env.amd = OPTIONS.env.amd || false;
    OPTIONS.env.mocha = OPTIONS.env.mocha || false;
    OPTIONS.env.jasmine = OPTIONS.env.jasmine || false;
    OPTIONS.env.phantomjs = OPTIONS.env.phantomjs || false;
    OPTIONS.env.qunit = OPTIONS.env.qunit || false;
    OPTIONS.env.jquery = OPTIONS.env.jquery || false;
    OPTIONS.env.prototypejs = OPTIONS.env.prototypejs || false;
    OPTIONS.env.shelljs = OPTIONS.env.shelljs || false;
    OPTIONS.env.meteor = OPTIONS.env.meteor || false;
    OPTIONS.env.mongo = OPTIONS.env.mongo || false;
    OPTIONS.env.applescript = OPTIONS.env.applescript || false;
    OPTIONS.env.serviceworker = OPTIONS.env.serviceworker || false;
    OPTIONS.env.embertest = OPTIONS.env.embertest || false;
    OPTIONS.env.es6 = OPTIONS.env.es6 || false;

    // include certain ecma features
    OPTIONS.ecmaFeatures = OPTIONS.ecmaFeatures || {};
    OPTIONS.ecmaFeatures.modules = OPTIONS.ecmaFeatures.module || false;

    populateConfiguration(OPTIONS.rules, OPTIONS.env, OPTIONS.ecmaFeatures);

    var editor = edit(document.getElementById('editor'));

    var verify = debounce(function() {
        var content = editor.getModel().getText();
        var results = eslint.verify(content, OPTIONS);
        displayResults(results);
    }, 500);

    verify();

    editor.getTextView().onModify = function() {
        verify();
    };
});
