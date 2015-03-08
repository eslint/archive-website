// Code goes here

require.config({
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
                editor.onGotoLine( options.line - 1, options.column, options.column );
            }).bind( null, editor, options );

            result.textContent = options.line + ':' + options.column +
            ' - ' + options.message;
            result.setAttribute('title', options.message);
        } else if (options.hasOwnProperty('message')) {
            result.textContent = 'Lint-free!';
        }

        return result;
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
    }

    function populateConfiguration(rules, environments) {
        for (var env in environments) {
            var checkbox = $('<div class="checkbox-inline"><label><input type="checkbox" />' + env +'</label></div>');
            $('input', checkbox).attr('id', env).prop('checked', environments[env]);
            $('.environments .list').append(checkbox);
        }

        var i = 0, limit = Math.ceil(Object.keys(rules).length / 3), parent;

        for (var rule in rules) {
            if (i === 0) {
                parent = $('<div class="col-md-4"></div>');
                $('.rules').append(parent);
            }
            var checkbox = $('<div class="checkbox"><label><input type="checkbox" />' + rule +'</label></div>');
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
                                $('.popover-content').html(html.find('p:first'));
                                me.data('content', html.find('p:first'));
                            }
                        });
                        return 'Loading...';
                    }
                },
                placement: 'left',
                html: true
            });
            checkbox.on('mouseenter', function() {
                $(this).popover('show');
            });
            checkbox.on('mouseleave', function() {
                $(this).popover('hide');
            });
            $('input', checkbox).attr('id', rule).prop('checked', rules[rule] !== 0);
            parent.append(checkbox);
            i++;
            if (i === limit) {
                i = 0;
            }
            $('#configuration .btn').click(function() {
                var environments = {}, rules = {};
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
                verify();
                $("#configuration").collapse('hide');
            });
        }
    }

    var OPTIONS = JSON.parse(config);
    populateConfiguration(OPTIONS.rules, OPTIONS.env);

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
