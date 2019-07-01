			(function (root, factory) {
				if (typeof define === 'function' && define.amd) {
					define([], factory);
				} else {
					root.orion = root.orion || {};
					root.orion.editor = root.orion.editor || {};
					root.orion.editor.edit = factory();
				}
			}(this, function () {
		/**
 * almond 0.2.4 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

/**
 * @license RequireJS i18n 2.0.6 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/i18n for details
 */
/*jslint regexp: true */
/*global require: false, navigator: false, define: false */

/**
 * This plugin handles i18n! prefixed modules. It does the following:
 *
 * 1) A regular module can have a dependency on an i18n bundle, but the regular
 * module does not want to specify what locale to load. So it just specifies
 * the top-level bundle, like 'i18n!nls/colors'.
 *
 * This plugin will load the i18n bundle at nls/colors, see that it is a root/master
 * bundle since it does not have a locale in its name. It will then try to find
 * the best match locale available in that master bundle, then request all the
 * locale pieces for that best match locale. For instance, if the locale is 'en-us',
 * then the plugin will ask for the 'en-us', 'en' and 'root' bundles to be loaded
 * (but only if they are specified on the master bundle).
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/colors bundle to be that mixed in locale.
 *
 * 2) A regular module specifies a specific locale to load. For instance,
 * i18n!nls/fr-fr/colors. In this case, the plugin needs to load the master bundle
 * first, at nls/colors, then figure out what the best match locale is for fr-fr,
 * since maybe only fr or just root is defined for that locale. Once that best
 * fit is found, all of its locale pieces need to have their bundles loaded.
 *
 * Once all the bundles for the locale pieces load, then it mixes in all those
 * locale pieces into each other, then finally sets the context.defined value
 * for the nls/fr-fr/colors bundle to be that mixed in locale.
 */
(function () {
    'use strict';

    //regexp for reconstructing the master bundle name from parts of the regexp match
    //nlsRegExp.exec('foo/bar/baz/nls/en-ca/foo') gives:
    //['foo/bar/baz/nls/en-ca/foo', 'foo/bar/baz/nls/', '/', '/', 'en-ca', 'foo']
    //nlsRegExp.exec('foo/bar/baz/nls/foo') gives:
    //['foo/bar/baz/nls/foo', 'foo/bar/baz/nls/', '/', '/', 'foo', '']
    //so, if match[5] is blank, it means this is the top bundle definition.
    var nlsRegExp = /(^.*(^|\/)nls(\/|$))([^\/]*)\/?([^\/]*)/;

    //Helper function to avoid repeating code. Lots of arguments in the
    //desire to stay functional and support RequireJS contexts without having
    //to know about the RequireJS contexts.
    function addPart(locale, master, needed, toLoad, prefix, suffix) {
        if (master[locale]) {
            needed.push(locale);
            if (master[locale] === true || master[locale] === 1) {
                toLoad.push(prefix + locale + '/' + suffix);
            }
        }
    }

    function addIfExists(req, locale, toLoad, prefix, suffix) {
        var fullName = prefix + locale + '/' + suffix;
        if (require._fileExists(req.toUrl(fullName + '.js'))) {
            toLoad.push(fullName);
        }
    }

    /**
     * Simple function to mix in properties from source into target,
     * but only if target does not already have a property of the same name.
     * This is not robust in IE for transferring methods that match
     * Object.prototype names, but the uses of mixin here seem unlikely to
     * trigger a problem related to that.
     */
    function mixin(target, source, force) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop) && (!target.hasOwnProperty(prop) || force)) {
                target[prop] = source[prop];
            } else if (typeof source[prop] === 'object') {
                if (!target[prop] && source[prop]) {
                    target[prop] = {};
                }
                mixin(target[prop], source[prop], force);
            }
        }
    }

    define('i18n',['module'], function (module) {
        var masterConfig = module.config ? module.config() : {};
        masterConfig = masterConfig || {};

        return {
            version: '2.0.6',
            /**
             * Called when a dependency needs to be loaded.
             */
            load: function (name, req, onLoad, config) {
                config = config || {};

                if (config.locale) {
                    masterConfig.locale = config.locale;
                }

                var masterName,
                    match = nlsRegExp.exec(name),
                    prefix = match[1],
                    locale = match[4],
                    suffix = match[5],
                    parts = locale.split('-'),
                    toLoad = [],
                    value = {},
                    i, part, current = '';

                //If match[5] is blank, it means this is the top bundle definition,
                //so it does not have to be handled. Locale-specific requests
                //will have a match[4] value but no match[5]
                if (match[5]) {
                    //locale-specific bundle
                    prefix = match[1];
                    masterName = prefix + suffix;
                } else {
                    //Top-level bundle.
                    masterName = name;
                    suffix = match[4];
                    locale = masterConfig.locale;
                    if (!locale) {
                        locale = masterConfig.locale =
                            typeof navigator === 'undefined' ? 'root' :
                            ((navigator.languages && navigator.languages[0]) ||
                             navigator.language ||
                             navigator.userLanguage || 'root').toLowerCase();
                    }
                    parts = locale.split('-');
                }

                if (config.isBuild) {
                    //Check for existence of all locale possible files and
                    //require them if exist.
                    toLoad.push(masterName);
                    addIfExists(req, 'root', toLoad, prefix, suffix);
                    for (i = 0; i < parts.length; i++) {
                        part = parts[i];
                        current += (current ? '-' : '') + part;
                        addIfExists(req, current, toLoad, prefix, suffix);
                    }

                    if(config.locales) {
                    	var j, k; 
                    	for (j = 0; j < config.locales.length; j++) {
                    		locale = config.locales[j];
                    		parts = locale.split("-");
                    		current = "";
	                    	for (k = 0; k < parts.length; k++) {
		                        part = parts[k];
		                        current += (current ? "-" : "") + part;
		                        addIfExists(req, current, toLoad, prefix, suffix);
	                    	}
                    	}
                    }

                    req(toLoad, function () {
                        onLoad();
                    });
                } else {
                    //First, fetch the master bundle, it knows what locales are available.
                    req([masterName], function (master) {
                        //Figure out the best fit
                        var needed = [],
                            part;

                        //Always allow for root, then do the rest of the locale parts.
                        addPart('root', master, needed, toLoad, prefix, suffix);
                        for (i = 0; i < parts.length; i++) {
                            part = parts[i];
                            current += (current ? '-' : '') + part;
                            addPart(current, master, needed, toLoad, prefix, suffix);
                        }

                        //Load all the parts missing.
                        req(toLoad, function () {
                            var i, partBundle, part;
                            for (i = needed.length - 1; i > -1 && needed[i]; i--) {
                                part = needed[i];
                                partBundle = master[part];
                                if (partBundle === true || partBundle === 1) {
                                    partBundle = req(prefix + part + '/' + suffix);
                                }
                                mixin(value, partBundle);
                            }

                            //All done, notify the loader.
                            onLoad(value);
                        });
                    });
                }
            }
        };
    });
}());

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define('orion/editor/nls/messages',["module"],function(module){
    var config = module.config();
    return config && config.root ? config : {root:true};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define('orion/editor/nls/root/messages',{//Default message bundle
	"multipleAnnotations": "Multiple annotations:", //$NON-NLS-1$ //$NON-NLS-0$
	"line": "Line: ${0}", //$NON-NLS-1$ //$NON-NLS-0$
	"breakpoint": "Breakpoint", //$NON-NLS-1$ //$NON-NLS-0$
	"bookmark": "Bookmark", //$NON-NLS-1$ //$NON-NLS-0$
	"task": "Task", //$NON-NLS-1$ //$NON-NLS-0$
	"error": "Error", //$NON-NLS-1$ //$NON-NLS-0$
	"warning": "Warning", //$NON-NLS-1$ //$NON-NLS-0$
	"info": "Info", //$NON-NLS-1$ //$NON-NLS-0$
	"currentSearch": "Current Search", //$NON-NLS-1$ //$NON-NLS-0$
	"currentLine": "Current Line", //$NON-NLS-1$ //$NON-NLS-0$
	"matchingBracket": "Matching Bracket", //$NON-NLS-1$ //$NON-NLS-0$
	"currentBracket": "Current Bracket", //$NON-NLS-1$ //$NON-NLS-0$
	"diffAdded": "Diff Added Lines", //$NON-NLS-1$ //$NON-NLS-0$
	"diffDeleted": "Diff Deleted Lines", //$NON-NLS-1$ //$NON-NLS-0$
	"diffModified": "Diff Modified Lines", //$NON-NLS-1$ //$NON-NLS-0$
	
	"lineUp": "Line Up", //$NON-NLS-1$ //$NON-NLS-0$
	"lineDown": "Line Down", //$NON-NLS-1$ //$NON-NLS-0$
	"lineStart": "Line Start", //$NON-NLS-1$ //$NON-NLS-0$
	"lineEnd": "Line End", //$NON-NLS-1$ //$NON-NLS-0$
	"charPrevious": "Previous Character", //$NON-NLS-1$ //$NON-NLS-0$
	"charNext": "Next Character", //$NON-NLS-1$ //$NON-NLS-0$
	"pageUp": "Page Up", //$NON-NLS-1$ //$NON-NLS-0$
	"pageDown": "Page Down", //$NON-NLS-1$ //$NON-NLS-0$
	"scrollPageUp": "Scroll Page Up", //$NON-NLS-1$ //$NON-NLS-0$
	"scrollPageDown": "Scroll Page Down", //$NON-NLS-1$ //$NON-NLS-0$
	"scrollLineUp": "Scroll Line Up", //$NON-NLS-1$ //$NON-NLS-0$
	"scrollLineDown": "Scroll Line Down", //$NON-NLS-1$ //$NON-NLS-0$
	"wordPrevious": "Previous Word", //$NON-NLS-1$ //$NON-NLS-0$
	"wordNext": "Next Word", //$NON-NLS-1$ //$NON-NLS-0$
	"textStart": "Document Start", //$NON-NLS-1$ //$NON-NLS-0$
	"textEnd": "Document End", //$NON-NLS-1$ //$NON-NLS-0$
	"scrollTextStart": "Scroll Document Start", //$NON-NLS-1$ //$NON-NLS-0$
	"scrollTextEnd": "Scroll Document End", //$NON-NLS-1$ //$NON-NLS-0$
	"centerLine": "Center Line", //$NON-NLS-1$ //$NON-NLS-0$
	
	"selectLineUp": "Select Line Up", //$NON-NLS-1$ //$NON-NLS-0$
	"selectLineDown": "Select Line Down", //$NON-NLS-1$ //$NON-NLS-0$
	"selectWholeLineUp": " Select Whole Line Up", //$NON-NLS-1$ //$NON-NLS-0$
	"selectWholeLineDown": "Select Whole Line Down", //$NON-NLS-1$ //$NON-NLS-0$
	"selectLineStart": "Select Line Start", //$NON-NLS-1$ //$NON-NLS-0$
	"selectLineEnd": "Select Line End", //$NON-NLS-1$ //$NON-NLS-0$
	"selectCharPrevious": "Select Previous Character", //$NON-NLS-1$ //$NON-NLS-0$
	"selectCharNext": "Select Next Character", //$NON-NLS-1$ //$NON-NLS-0$
	"selectPageUp": "Select Page Up", //$NON-NLS-1$ //$NON-NLS-0$
	"selectPageDown": "Select Page Down", //$NON-NLS-1$ //$NON-NLS-0$
	"selectWordPrevious": "Select Previous Word", //$NON-NLS-1$ //$NON-NLS-0$
	"selectWordNext": "Select Next Word", //$NON-NLS-1$ //$NON-NLS-0$
	"selectTextStart": "Select Document Start", //$NON-NLS-1$ //$NON-NLS-0$
	"selectTextEnd": "Select Document End", //$NON-NLS-1$ //$NON-NLS-0$

	"deletePrevious": "Delete Previous Character", //$NON-NLS-1$ //$NON-NLS-0$
	"deleteNext": "Delete Next Character", //$NON-NLS-1$ //$NON-NLS-0$
	"deleteWordPrevious": "Delete Previous Word", //$NON-NLS-1$ //$NON-NLS-0$
	"deleteWordNext": "Delete Next Word", //$NON-NLS-1$ //$NON-NLS-0$
	"deleteLineStart": "Delete Line Start", //$NON-NLS-1$ //$NON-NLS-0$
	"deleteLineEnd": "Delete Line End", //$NON-NLS-1$ //$NON-NLS-0$
	"tab": "Insert Tab", //$NON-NLS-1$ //$NON-NLS-0$
	"enter": "Insert Line Delimiter", //$NON-NLS-1$ //$NON-NLS-0$
	"enterNoCursor": "Insert Line Delimiter", //$NON-NLS-1$ //$NON-NLS-0$
	"escape": "Escape", //$NON-NLS-1$ //$NON-NLS-0$
	"selectAll": "Select All", //$NON-NLS-1$ //$NON-NLS-0$
	"copy": "Copy", //$NON-NLS-1$ //$NON-NLS-0$
	"cut": "Cut", //$NON-NLS-1$ //$NON-NLS-0$
	"paste": "Paste", //$NON-NLS-1$ //$NON-NLS-0$
	
	"uppercase": "To Upper Case", //$NON-NLS-1$ //$NON-NLS-0$
	"lowercase": "To Lower Case", //$NON-NLS-1$ //$NON-NLS-0$
	"capitalize": "Capitalize", //$NON-NLS-1$ //$NON-NLS-0$
	"reversecase" : "Reverse Case", //$NON-NLS-1$ //$NON-NLS-0$
	
	"toggleWrapMode": "Toggle Wrap Mode", //$NON-NLS-1$ //$NON-NLS-0$
	"toggleTabMode": "Toggle Tab Mode", //$NON-NLS-1$ //$NON-NLS-0$
	"toggleOverwriteMode": "Toggle Overwrite Mode", //$NON-NLS-1$ //$NON-NLS-0$
	
	"committerOnTime": "${0} on ${1}", //$NON-NLS-1$ //$NON-NLS-0$
	
	//Emacs
	"emacs": "Emacs", //$NON-NLS-1$ //$NON-NLS-0$
	"exchangeMarkPoint": "Exchange Mark and Point", //$NON-NLS-1$ //$NON-NLS-0$
	"setMarkCommand": "Set Mark", //$NON-NLS-1$ //$NON-NLS-0$
	"clearMark": "Clear Mark", //$NON-NLS-1$ //$NON-NLS-0$
	"digitArgument": "Digit Argument ${0}", //$NON-NLS-1$ //$NON-NLS-0$
	"negativeArgument": "Negative Argument", //$NON-NLS-1$ //$NON-NLS-0$
			
	"Comment": "Comment", //$NON-NLS-1$ //$NON-NLS-0$
	"Flat outline": "Flat outline", //$NON-NLS-1$ //$NON-NLS-0$
	"incrementalFindStr": "Incremental find: ${0}", //$NON-NLS-1$ //$NON-NLS-0$
	"incrementalFindStrNotFound": "Incremental find: ${0} (not found)", //$NON-NLS-1$ //$NON-NLS-0$
	"incrementalFindReverseStr": "Reverse Incremental find: ${0}", //$NON-NLS-1$ //$NON-NLS-0$
	"incrementalFindReverseStrNotFound": "Reverse Incremental find: ${0} (not found)", //$NON-NLS-1$ //$NON-NLS-0$
	"findReplace": "Find/Replace", //$NON-NLS-1$ //$NON-NLS-0$
	"find": "Find...", //$NON-NLS-1$ //$NON-NLS-0$
	"undo": "Undo", //$NON-NLS-1$ //$NON-NLS-0$
	"redo": "Redo", //$NON-NLS-1$ //$NON-NLS-0$
	"cancelMode": "Cancel Current Mode", //$NON-NLS-1$ //$NON-NLS-0$
	"findNext": "Find Next Occurrence", //$NON-NLS-1$ //$NON-NLS-0$
	"findPrevious": "Find Previous Occurrence", //$NON-NLS-1$ //$NON-NLS-0$
	"incrementalFind": "Incremental Find", //$NON-NLS-1$ //$NON-NLS-0$
	"incrementalFindReverse": "Incremental Find Reverse", //$NON-NLS-1$ //$NON-NLS-0$
	"indentLines": "Indent Lines", //$NON-NLS-1$ //$NON-NLS-0$
	"unindentLines": "Unindent Lines", //$NON-NLS-1$ //$NON-NLS-0$
	"moveLinesUp": "Move Lines Up", //$NON-NLS-1$ //$NON-NLS-0$
	"moveLinesDown": "Move Lines Down", //$NON-NLS-1$ //$NON-NLS-0$
	"copyLinesUp": "Copy Lines Up", //$NON-NLS-1$ //$NON-NLS-0$
	"copyLinesDown": "Copy Lines Down", //$NON-NLS-1$ //$NON-NLS-0$
	"deleteLines": "Delete Lines", //$NON-NLS-1$ //$NON-NLS-0$
	"gotoLine": "Goto Line...", //$NON-NLS-1$ //$NON-NLS-0$
	"gotoLinePrompty": "Goto Line:", //$NON-NLS-1$ //$NON-NLS-0$
	"nextAnnotation": "Next Annotation", //$NON-NLS-1$ //$NON-NLS-0$
	"prevAnnotation": "Previous Annotation", //$NON-NLS-1$ //$NON-NLS-0$
	"expand": "Expand", //$NON-NLS-1$ //$NON-NLS-0$
	"collapse": "Collapse", //$NON-NLS-1$ //$NON-NLS-0$
	"expandAll": "Expand All", //$NON-NLS-1$ //$NON-NLS-0$
	"collapseAll": "Collapse All", //$NON-NLS-1$ //$NON-NLS-0$
	"lastEdit": "Last Edit Location", //$NON-NLS-1$ //$NON-NLS-0$
	"trimTrailingWhitespaces": "Trim Trailing Whitespaces", //$NON-NLS-1$ //$NON-NLS-0$
	"toggleLineComment": "Toggle Line Comment", //$NON-NLS-1$ //$NON-NLS-0$
	"addBlockComment": "Add Block Comment", //$NON-NLS-1$ //$NON-NLS-0$
	"removeBlockComment": "Remove Block Comment", //$NON-NLS-1$ //$NON-NLS-0$
	"linkedModeEntered": "Linked Mode: Enter or ESC to exit", //$NON-NLS-1$ //$NON-NLS-0$
	"linkedModeExited": "Linked Mode exited", //$NON-NLS-1$ //$NON-NLS-0$
	"syntaxError": "Syntax Error", //$NON-NLS-1$ //$NON-NLS-0$
	"contentAssist": "Content Assist", //$NON-NLS-1$ //$NON-NLS-0$
	"noProposals": "No proposals found",
	"computingProposals": "Computing content assist proposals...",
	"lineColumn": "Line ${0} : Column ${1}", //$NON-NLS-1$ //$NON-NLS-0$
	"lineColumnOffset": "Line ${0} : Column ${1} : Offset ${2}",
	"multiSelections": "${0} selection regions", //$NON-NLS-1$ //$NON-NLS-0$
	
	//vi
	"vi": "vi", //$NON-NLS-1$ //$NON-NLS-0$
	"vimove": "(Move)", //$NON-NLS-1$ //$NON-NLS-0$
	"viyank": "(Yank)", //$NON-NLS-1$ //$NON-NLS-0$
	"videlete": "(Delete)", //$NON-NLS-1$ //$NON-NLS-0$
	"vichange": "(Change)", //$NON-NLS-1$ //$NON-NLS-0$
	"viLeft": "${0} Left", //$NON-NLS-1$ //$NON-NLS-0$
	"viRight": "${0} Right", //$NON-NLS-1$ //$NON-NLS-0$
	"viUp": "${0} Up", //$NON-NLS-1$ //$NON-NLS-0$
	"viDown": "${0} Down", //$NON-NLS-1$ //$NON-NLS-0$
	"viw": "${0} Next Word", //$NON-NLS-1$ //$NON-NLS-0$
	"vib": "${0} Beginning of Word", //$NON-NLS-1$ //$NON-NLS-0$
	"viW": "${0} Next Word (ws stop)", //$NON-NLS-1$ //$NON-NLS-0$ // ws stop refers to word space (next blank space delimited word)
	"viB": "${0} Beginning of Word (ws stop)", //$NON-NLS-1$ //$NON-NLS-0$ // ws stop refers to word space (next blank space delimited word)
	"vie": "${0} End of Word", //$NON-NLS-1$ //$NON-NLS-0$
	"viE": "${0} End of Word (ws stop)", //$NON-NLS-1$ //$NON-NLS-0$ // ws stop refers to word space (next blank space delimited word)
	"vi$": "${0} End of the line", //$NON-NLS-1$ //$NON-NLS-0$
	"vi^_": "${0} First non-blank Char Current Line", //$NON-NLS-1$ //$NON-NLS-0$
	"vi+": "${0} First Char Next Line", //$NON-NLS-1$ //$NON-NLS-0$
	"vi-": "${0} First Char Previous Line", //$NON-NLS-1$ //$NON-NLS-0$
	"vi|": "${0} nth Column in Line", //$NON-NLS-1$ //$NON-NLS-0$
	"viH": "${0} Top of Page", //$NON-NLS-1$ //$NON-NLS-0$
	"viM": "${0} Middle of Page", //$NON-NLS-1$ //$NON-NLS-0$
	"viL": "${0} Bottom of Page", //$NON-NLS-1$ //$NON-NLS-0$
	"vi/": "${0} Search Forward", //$NON-NLS-1$ //$NON-NLS-0$
	"vi?": "${0} Search Backward", //$NON-NLS-1$ //$NON-NLS-0$
	"vin": "${0} Next Search", //$NON-NLS-1$ //$NON-NLS-0$
	"viN": "${0} Previous Search", //$NON-NLS-1$ //$NON-NLS-0$
	"vif": "${0} Search Char Fwd", //$NON-NLS-1$ //$NON-NLS-0$
	"viF": "${0} Search Char Bckwd", //$NON-NLS-1$ //$NON-NLS-0$
	"vit": "${0} Search Before Char Fwd", //$NON-NLS-1$ //$NON-NLS-0$
	"viT": "${0} Search Before Char Bckwd", //$NON-NLS-1$ //$NON-NLS-0$
	"vi,": "${0} Repeat Reverse Char Search", //$NON-NLS-1$ //$NON-NLS-0$
	"vi;": "${0} Repeat Char Search", //$NON-NLS-1$ //$NON-NLS-0$
	"viG": "${0} Go to Line", //$NON-NLS-1$ //$NON-NLS-0$
	"viycd": "${0} Current Line", //$NON-NLS-1$ //$NON-NLS-0$
	"via": "Append After Cursor", //$NON-NLS-1$ //$NON-NLS-0$
	"viA": "Append to End of Line", //$NON-NLS-1$ //$NON-NLS-0$
	"vii": "Insert Before Cursor", //$NON-NLS-1$ //$NON-NLS-0$
	"viI": "Insert at Beginning of Line", //$NON-NLS-1$ //$NON-NLS-0$
	"viO": "Insert Line Above", //$NON-NLS-1$ //$NON-NLS-0$
	"vio": "Insert Line Below", //$NON-NLS-1$ //$NON-NLS-0$
	"viR": "Begin Overwriting Text", //$NON-NLS-1$ //$NON-NLS-0$
	"vis": "Substitute a Character", //$NON-NLS-1$ //$NON-NLS-0$
	"viS": "Substitute Entire Line", //$NON-NLS-1$ //$NON-NLS-0$
	"viC": "Change Text Until Line End", //$NON-NLS-1$ //$NON-NLS-0$
	"vip": "Paste After Char or Line", //$NON-NLS-1$ //$NON-NLS-0$
	"viP": "Paste Before Char or Line", //$NON-NLS-1$ //$NON-NLS-0$
	"viStar": "Search Word Under Cursor", //$NON-NLS-1$ //$NON-NLS-0$
	
	"next": "Next", //$NON-NLS-1$ //$NON-NLS-0$
	"previous": "Previous", //$NON-NLS-1$ //$NON-NLS-0$
	"replace": "Replace", //$NON-NLS-1$ //$NON-NLS-0$
	"replaceAll": "Replace All", //$NON-NLS-1$ //$NON-NLS-0$
	"findWith": "Find With", //$NON-NLS-1$ //$NON-NLS-0$
	"replaceWith": "Replace With", //$NON-NLS-1$ //$NON-NLS-0$
	"caseInsensitive": "Aa", //$NON-NLS-1$ //$NON-NLS-0$
	"selectedLines": "Sel", //$NON-NLS-1$ //$NON-NLS-0$
	"regex": "/.*/", //$NON-NLS-1$ //$NON-NLS-0$
	"wholeWord": "\\b", //$NON-NLS-1$ //$NON-NLS-0$
	"caseInsensitiveTooltip": "Toggle Case Insensitive", //$NON-NLS-1$ //$NON-NLS-0$
	"selectedLinesTooltip": "Toggle Search Scope On Selected Lines", //$NON-NLS-1$ //$NON-NLS-0$
	"regexTooltip": "Toggle Regular Expression", //$NON-NLS-1$ //$NON-NLS-0$
	"wholeWordTooltip": "Toggle Whole Word", //$NON-NLS-1$ //$NON-NLS-0$
	"closeTooltip": "Close", //$NON-NLS-1$ //$NON-NLS-0$

	"replacingAll": "Replacing all...", //$NON-NLS-1$ //$NON-NLS-0$
	"replacedMatches": "Replaced ${0} matches", //$NON-NLS-1$ //$NON-NLS-0$
	"nothingReplaced": "Nothing replaced", //$NON-NLS-1$ //$NON-NLS-0$
	"notFound": "Not found" //$NON-NLS-1$ //$NON-NLS-0$
});


/*******************************************************************************
 * Copyright (c) 2010, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
 
/*eslint-env browser, amd*/
define("orion/editor/eventTarget", [], function() {
	/** 
	 * Constructs a new EventTarget object.
	 * 
	 * @class 
	 * @name orion.editor.EventTarget
	 */
	function EventTarget() {
	}
	/**
	 * Adds in the event target interface into the specified object.
	 *
	 * @param {Object} object The object to add in the event target interface.
	 */
	EventTarget.addMixin = function(object) {
		var proto = EventTarget.prototype;
		for (var p in proto) {
			if (proto.hasOwnProperty(p)) {
				object[p] = proto[p];
			}
		}
	};
	EventTarget.prototype = /** @lends orion.editor.EventTarget.prototype */ {
		/**
		 * Adds an event listener to this event target.
		 * 
		 * @param {String} type The event type.
		 * @param {Function|EventListener} listener The function or the EventListener that will be executed when the event happens. 
		 * @param {Boolean} [useCapture=false] <code>true</code> if the listener should be trigged in the capture phase.
		 * 
		 * @see orion.editor.EventTarget#removeEventListener
		 */
		addEventListener: function(type, listener, useCapture) {
			if (!this._eventTypes) { this._eventTypes = {}; }
			var state = this._eventTypes[type];
			if (!state) {
				state = this._eventTypes[type] = {level: 0, listeners: []};
			}
			var listeners = state.listeners;
			listeners.push({listener: listener, useCapture: useCapture});
		},
		/**
		 * Dispatches the given event to the listeners added to this event target.
		 * @param {Event} evt The event to dispatch.
		 */
		dispatchEvent: function(evt) {
			var type = evt.type;
			this._dispatchEvent("pre" + type, evt); //$NON-NLS-0$
			this._dispatchEvent(type, evt);
			this._dispatchEvent("post" + type, evt); //$NON-NLS-0$
		},
		/**
		 * Dispatches the given event to the listeners added to this event target.
		 * @private 
		 * @param {String} type The name of the event type to send
		 * @param {Event} evt The event to dispatch.
		 */
		_dispatchEvent: function(type, evt) {
			var state = this._eventTypes ? this._eventTypes[type] : null;
			if (state) {
				var listeners = state.listeners;
				try {
					state.level++;
					if (listeners) {
						for (var i=0, len=listeners.length; i < len; i++) {
							if (listeners[i]) {
								var l = listeners[i].listener;
								if (typeof l === "function") {
									l.call(this, evt);
								} else if (l.handleEvent && typeof l.handleEvent === "function") {
									l.handleEvent(evt);
								}
							}
						}
					}
				} finally {
					state.level--;
					if (state.compact && state.level === 0) {
						for (var j=listeners.length - 1; j >= 0; j--) {
							if (!listeners[j]) {
								listeners.splice(j, 1);
							}
						}
						if (listeners.length === 0) {
							delete this._eventTypes[type];
						}
						state.compact = false;
					}
				}
			}
		},
		/**
		 * Returns whether there is a listener for the specified event type.
		 * 
		 * @param {String} type The event type
		 * 
		 * @see orion.editor.EventTarget#addEventListener
		 * @see orion.editor.EventTarget#removeEventListener
		 */
		isListening: function(type) {
			if (!this._eventTypes) { return false; }
			return this._eventTypes[type] !== undefined;
		},		
		/**
		 * Removes an event listener from the event target.
		 * <p>
		 * All the parameters must be the same ones used to add the listener.
		 * </p>
		 * 
		 * @param {String} type The event type
		 * @param {Function|EventListener} listener The function or the EventListener that will be executed when the event happens. 
		 * @param {Boolean} [useCapture=false] <code>true</code> if the listener should be trigged in the capture phase.
		 * 
		 * @see orion.editor.EventTarget#addEventListener
		 */
		removeEventListener: function(type, listener, useCapture){
			if (!this._eventTypes) { return; }
			var state = this._eventTypes[type];
			if (state) {
				var listeners = state.listeners;
				for (var i=0, len=listeners.length; i < len; i++) {
					var l = listeners[i];
					if (l && l.listener === listener && l.useCapture === useCapture) {
						if (state.level !== 0) {
							listeners[i] = null;
							state.compact = true;
						} else {
							listeners.splice(i, 1);
						}
						break;
					}
				}
				if (listeners.length === 0) {
					delete this._eventTypes[type];
				}
			}
		}
	};
	return {EventTarget: EventTarget};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
/**
 * @name orion.regex
 * @class Utilities for dealing with regular expressions.
 * @description Utilities for dealing with regular expressions.
 */
define("orion/regex", [], function() { //$NON-NLS-0$
	/**
	 * @memberOf orion.regex
	 * @function
	 * @static
	 * @description Escapes regex special characters in the input string.
	 * @param {String} str The string to escape.
	 * @returns {String} A copy of <code>str</code> with regex special characters escaped.
	 */
	function escape(str) {
		return str.replace(/([\\$\^*\/+?\.\(\)|{}\[\]])/g, "\\$&"); //$NON-NLS-0$
		//return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}

	/**
	 * @memberOf orion.regex
	 * @function
	 * @static
	 * @description Parses a pattern and flags out of a regex literal string.
	 * @param {String} str The string to parse. Should look something like <code>"/ab+c/"</code> or <code>"/ab+c/i"</code>.
	 * @returns {Object} If <code>str</code> looks like a regex literal, returns an object with properties
	 * <code><dl>
	 * <dt>pattern</dt><dd>{String}</dd>
	 * <dt>flags</dt><dd>{String}</dd>
	 * </dl></code> otherwise returns <code>null</code>.
	 */
	function parse(str) {
		var regexp = /^\s*\/(.+)\/([gim]{0,3})\s*$/.exec(str);
		if (regexp) {
			return {
				pattern : regexp[1],
				flags : regexp[2]
			};
		}
		return null;
	}

	return {
		escape: escape,
		parse: parse
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors: IBM Corporation - initial API and implementation
 *******************************************************************************/

/*eslint-env browser, amd*/
define('orion/util',[],function() {

	var userAgent = navigator.userAgent;
	var isIE = (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident") !== -1) ? document.documentMode : undefined; //$NON-NLS-1$ //$NON-NLS-0$
	var isFirefox = parseFloat(userAgent.split("Firefox/")[1] || userAgent.split("Minefield/")[1]) || undefined; //$NON-NLS-1$ //$NON-NLS-0$
	var isOpera = userAgent.indexOf("Opera") !== -1 ? parseFloat(userAgent.split("Version/")[1]) : undefined; //$NON-NLS-0$
	var isChrome = parseFloat(userAgent.split("Chrome/")[1]) || undefined; //$NON-NLS-0$
	var isSafari = userAgent.indexOf("Safari") !== -1 && !isChrome; //$NON-NLS-0$
	var isWebkit = parseFloat(userAgent.split("WebKit/")[1]) || undefined; //$NON-NLS-0$
	var isAndroid = userAgent.indexOf("Android") !== -1; //$NON-NLS-0$
	var isIPad = userAgent.indexOf("iPad") !== -1; //$NON-NLS-0$
	var isIPhone = userAgent.indexOf("iPhone") !== -1; //$NON-NLS-0$
	var isIOS = isIPad || isIPhone;
	var isElectron = userAgent.indexOf("Electron") !== -1; //$NON-NLS-0$
	var isMac = navigator.platform.indexOf("Mac") !== -1; //$NON-NLS-0$
	var isWindows = navigator.platform.indexOf("Win") !== -1; //$NON-NLS-0$
	var isLinux = navigator.platform.indexOf("Linux") !== -1; //$NON-NLS-0$
	var isTouch = typeof document !== "undefined" && "ontouchstart" in document.createElement("input"); //$NON-NLS-1$ //$NON-NLS-0$
	
	var platformDelimiter = isWindows ? "\r\n" : "\n"; //$NON-NLS-1$ //$NON-NLS-0$

	function formatMessage(msg) {
		var args = arguments;
		return msg.replace(/\$\{([^\}]+)\}/g, function(str, index) { return args[(index << 0) + 1]; });
	}
	
	var XHTML = "http://www.w3.org/1999/xhtml"; //$NON-NLS-0$
	function createElement(document, tagName) {
		if (document.createElementNS) {
			return document.createElementNS(XHTML, tagName);
		}
		return document.createElement(tagName);
	}
	function confineDialogTab(firstElement, lastElement) {
		lastElement.addEventListener("keydown", function(evt) {
			if(evt.keyCode === 9 && !evt.shiftKey) {
				evt.preventDefault();
				firstElement.focus();
			}
		});
		firstElement.addEventListener("keydown", function(evt) {
			if(evt.keyCode === 9 && evt.shiftKey) {
				evt.preventDefault();
				lastElement.focus();
			}
		});
	}

	return {
		formatMessage: formatMessage,
		
		createElement: createElement,
		confineDialogTab: confineDialogTab,
		
		/** Browsers */
		isIE: isIE,
		isFirefox: isFirefox,
		isOpera: isOpera,
		isChrome: isChrome,
		isSafari: isSafari,
		isWebkit: isWebkit,
		isAndroid: isAndroid,
		isIPad: isIPad,
		isIPhone: isIPhone,
		isIOS: isIOS,
		isElectron: isElectron,
		
		/** OSs */
		isMac: isMac,
		isWindows: isWindows,
		isLinux: isLinux,

		/** Capabilities */
		isTouch: isTouch,

		platformDelimiter: platformDelimiter
	};
});
/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
 
/*eslint-env browser, amd*/
define("orion/editor/textModel", ['orion/editor/eventTarget', 'orion/regex', 'orion/util'], function(mEventTarget, mRegex, util) {

	/**
	 * Constructs a new TextModel with the given text and default line delimiter.
	 *
	 * @param {String} [text=""] the text that the model will store
	 * @param {String} [lineDelimiter=platform delimiter] the line delimiter used when inserting new lines to the model.
	 *
	 * @name orion.editor.TextModel
	 * @class The TextModel is an interface that provides text for the view. Applications may
	 * implement the TextModel interface to provide a custom store for the view content. The
	 * view interacts with its text model in order to access and update the text that is being
	 * displayed and edited in the view. This is the default implementation.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextView#setModel}
	 * </p>
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function TextModel(text, lineDelimiter) {
		this._lastLineIndex = -1;
		this._text = [""];
		this._lineOffsets = [0];
		this.setText(text);
		this.setLineDelimiter(lineDelimiter);
	}

	TextModel.prototype = /** @lends orion.editor.TextModel.prototype */ {
		/**
		 * Destroys this text model.
		 */
		destroy: function() {
		},
		/**
		 * @class This object describes the options to use while finding occurrences of a string in a text model.
		 * @name orion.editor.FindOptions
		 *
		 * @property {String} string the search string to be found.
		 * @property {Boolean} [regex=false] whether or not the search string is a regular expression.
		 * @property {Boolean} [wrap=false] whether or not to wrap search.
		 * @property {Boolean} [wholeWord=false] whether or not to search only whole words.
		 * @property {Boolean} [caseInsensitive=false] whether or not search is case insensitive.
		 * @property {Boolean} [reverse=false] whether or not to search backwards.
		 * @property {Number} [start=0] The start offset to start searching
		 * @property {Number} [rangeStart] The range start offset of the search. Used to search in a given range.
		 * @property {Number} [rangeEnd] The range end offset of the search. Used to search in a given range.
		 */
		/**
		 * @class This object represents a find occurrences iterator.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextModel#find}<br/>
		 * </p>		 
		 * @name orion.editor.FindIterator
		 * 
		 * @property {Function} hasNext Determines whether there are more occurrences in the iterator.
		 * @property {Function} next Returns the next matched range {start,end} in the iterator.
		 */	
		/**
		 * Finds occurrences of a string in the text model.
		 *
		 * @param {orion.editor.FindOptions} options the search options
		 * @return {orion.editor.FindIterator} the find occurrences iterator.
		 */
		find: function(options) {
			if (this._text.length > 1) {
				this._text = [this._text.join("")];
			}
			var string = options.string;
			var regex = options.regex;
			var pattern = string;
			var flags = "";
			var caseInsensitive = options.caseInsensitive;
			if (pattern) {
				if (regex) {
					var parsed = mRegex.parse(pattern);
					if (parsed) {
						pattern = parsed.pattern;
						flags = parsed.flags;
					}
				} else {
					pattern = string.replace(/([\\$\^*\/+?\.\(\)|{}\[\]])/g, "\\$&"); //$NON-NLS-0$
					/*
					* Bug in JS RegEx. In a Turkish locale, dotless i (u0131) capitalizes to I (u0049) and i (u0069) 
					* capitalizes to dot I (u0130). The JS RegEx does not match correctly the Turkish i's in case
					* insensitive mode. The fix is to detect the presence of Turkish i's in the search pattern and 
					* to modify the pattern to search for both upper and lower case.
					*/
					if (caseInsensitive) {
						pattern = pattern.replace(/[iI\u0130\u0131]/g, "[Ii\u0130\u0131]"); //$NON-NLS-0$
					}
				}
			}
			var current = null, skip;
			if (pattern) {
				var reverse = options.reverse;
				var wrap = options.wrap;
				var wholeWord = options.wholeWord;
				var start = options.start || 0;
				var rangeStart = options.rangeStart;
				var rangeEnd = options.rangeEnd;
				var isRange = rangeStart !== null && rangeStart !== undefined && rangeEnd !== null && rangeEnd !== undefined;
				if (flags.indexOf("g") === -1) { flags += "g"; } //$NON-NLS-1$ //$NON-NLS-2$
				if (flags.indexOf("m") === -1) { flags += "m"; } //$NON-NLS-1$ //$NON-NLS-2$
				if (caseInsensitive) {
					if (flags.indexOf("i") === -1) { flags += "i"; } //$NON-NLS-1$ //$NON-NLS-2$
				}
				if (wholeWord) {
					pattern = "\\b" + pattern + "\\b"; //$NON-NLS-1$ //$NON-NLS-2$
				}
				var text = this._text[0], result, lastIndex, offset = 0;
				if (isRange) {
					var s = rangeStart < rangeEnd ? rangeStart : rangeEnd;
					var e = rangeStart < rangeEnd ? rangeEnd : rangeStart;
					text = text.substring(s, e);
					offset = s;
				}
				var re = new RegExp(pattern, flags);
				if (reverse) {
					skip = function() {
						var match = null;
						re.lastIndex = 0;
						while (true) {
							lastIndex = re.lastIndex;
							result = re.exec(text);
							if (lastIndex === re.lastIndex) {
								return null;
							}
							if (result) {
								if (result.index + offset < start) {
									match = {start: result.index + offset, end: re.lastIndex + offset};
								} else {
									if (!wrap || match) {
										break;
									}
									start = text.length + offset;
									match = {start: result.index + offset, end: re.lastIndex + offset};
								}
							} else {
								break;
							}
						}
						if (match) { start = match.start; }
						return match;
					};
				} else {
					re.lastIndex = start - offset;
					skip = function() {
						while (true) {
							lastIndex = re.lastIndex;
							result = re.exec(text);
							if (lastIndex === re.lastIndex) {
								return null;
							}
							if (result) {
								return {start: result.index + offset, end: re.lastIndex + offset};
							}
							if (lastIndex !== 0) {
								if (wrap) {
									continue;
								}
							}
							break;
						}
						return null;
					};
				}
				current = skip();
			}
			return {
				/**
				 * @callback 
				 */
				next: function() {
					var result = current;
					if (result) { current = skip(); }
					return result;					
				},
				/**
				 * @callback 
				 */
				hasNext: function() {
					return current !== null;
				}
			};
		},
		/**
		 * Returns the number of characters in the model.
		 *
		 * @returns {Number} the number of characters in the model.
		 */
		getCharCount: function() {
			var count = 0;
			for (var i = 0; i<this._text.length; i++) {
				count += this._text[i].length;
			}
			return count;
		},
		/**
		 * Returns the text of the line at the given index.
		 * <p>
		 * The valid indices are 0 to line count exclusive.  Returns <code>null</code> 
		 * if the index is out of range. 
		 * </p>
		 *
		 * @param {Number} lineIndex the zero based index of the line.
		 * @param {Boolean} [includeDelimiter=false] whether or not to include the line delimiter. 
		 * @returns {String} the line text or <code>null</code> if out of range.
		 *
		 * @see orion.editor.TextModel#getLineAtOffset
		 */
		getLine: function(lineIndex, includeDelimiter) {
			var lineCount = this.getLineCount();
			if (!(0 <= lineIndex && lineIndex < lineCount)) {
				return null;
			}
			var start = this._lineOffsets[lineIndex];
			if (lineIndex + 1 < lineCount) {
				var text = this.getText(start, this._lineOffsets[lineIndex + 1]);
				if (includeDelimiter) {
					return text;
				}
				var end = text.length, c;
				while (((c = text.charCodeAt(end - 1)) === 10) || (c === 13)) {
					end--;
				}
				return text.substring(0, end);
			} else {
				return this.getText(start); 
			}
		},
		/**
		 * Returns the line index at the given character offset.
		 * <p>
		 * The valid offsets are 0 to char count inclusive. The line index for
		 * char count is <code>line count - 1</code>. Returns <code>-1</code> if
		 * the offset is out of range.
		 * </p>
		 *
		 * @param {Number} offset a character offset.
		 * @returns {Number} the zero based line index or <code>-1</code> if out of range.
		 */
		getLineAtOffset: function(offset) {
			var charCount = this.getCharCount();
			if (!(0 <= offset && offset <= charCount)) {
				return -1;
			}
			var lineCount = this.getLineCount();
			if (offset === charCount) {
				return lineCount - 1; 
			}
			var lineStart, lineEnd;
			var index = this._lastLineIndex;
			if (0 <= index && index < lineCount) {
				lineStart = this._lineOffsets[index];
				lineEnd = index + 1 < lineCount ? this._lineOffsets[index + 1] : charCount;
				if (lineStart <= offset && offset < lineEnd) {
					return index;
				}
			}
			var high = lineCount;
			var low = -1;
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				lineStart = this._lineOffsets[index];
				lineEnd = index + 1 < lineCount ? this._lineOffsets[index + 1] : charCount;
				if (offset <= lineStart) {
					high = index;
				} else if (offset < lineEnd) {
					high = index;
					break;
				} else {
					low = index;
				}
			}
			this._lastLineIndex = high;
			return high;
		},
		/**
		 * Returns the number of lines in the model.
		 * <p>
		 * The model always has at least one line.
		 * </p>
		 *
		 * @returns {Number} the number of lines.
		 */
		getLineCount: function() {
			return this._lineOffsets.length;
		},
		/**
		 * Returns the line delimiter that is used by the view
		 * when inserting new lines. New lines entered using key strokes 
		 * and paste operations use this line delimiter.
		 *
		 * @return {String} the line delimiter that is used by the view when inserting new lines.
		 */
		getLineDelimiter: function() {
			return this._lineDelimiter;
		},
		/**
		 * Returns the end character offset for the given line. 
		 * <p>
		 * The end offset is not inclusive. This means that when the line delimiter is included, the 
		 * offset is either the start offset of the next line or char count. When the line delimiter is
		 * not included, the offset is the offset of the line delimiter.
		 * </p>
		 * <p>
		 * The valid indices are 0 to line count exclusive.  Returns <code>-1</code> 
		 * if the index is out of range. 
		 * </p>
		 *
		 * @param {Number} lineIndex the zero based index of the line.
		 * @param {Boolean} [includeDelimiter=false] whether or not to include the line delimiter. 
		 * @return {Number} the line end offset or <code>-1</code> if out of range.
		 *
		 * @see orion.editor.TextModel#getLineStart
		 */
		getLineEnd: function(lineIndex, includeDelimiter) {
			var lineCount = this.getLineCount();
			if (!(0 <= lineIndex && lineIndex < lineCount)) {
				return -1;
			}
			if (lineIndex + 1 < lineCount) {
				var end = this._lineOffsets[lineIndex + 1];
				if (includeDelimiter) {
					return end;
				}
				var text = this.getText(Math.max(this._lineOffsets[lineIndex], end - 2), end);
				var i = text.length, c;
				while (((c = text.charCodeAt(i - 1)) === 10) || (c === 13)) {
					i--;
				}
				return end - (text.length - i);
			} else {
				return this.getCharCount();
			}
		},
		/**
		 * Returns the start character offset for the given line.
		 * <p>
		 * The valid indices are 0 to line count exclusive.  Returns <code>-1</code> 
		 * if the index is out of range. 
		 * </p>
		 *
		 * @param {Number} lineIndex the zero based index of the line.
		 * @return {Number} the line start offset or <code>-1</code> if out of range.
		 *
		 * @see orion.editor.TextModel#getLineEnd
		 */
		getLineStart: function(lineIndex) {
			if (!(0 <= lineIndex && lineIndex < this.getLineCount())) {
				return -1;
			}
			return this._lineOffsets[lineIndex];
		},
		/**
		 * Returns the text for the given range.
		 * <p>
		 * The end offset is not inclusive. This means that character at the end offset
		 * is not included in the returned text.
		 * </p>
		 *
		 * @param {Number} [start=0] the zero based start offset of text range.
		 * @param {Number} [end=char count] the zero based end offset of text range.
		 *
		 * @see orion.editor.TextModel#setText
		 */
		getText: function(start, end) {
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = this.getCharCount(); }
			if (start === end) { return ""; }
			var offset = 0, chunk = 0, length;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (start <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var firstOffset = offset;
			var firstChunk = chunk;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (end <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var lastOffset = offset;
			var lastChunk = chunk;

			// error check for invalid chunks of text
			if (firstChunk >= this._text.length || lastChunk >= this._text.length || firstChunk > lastChunk) {
				return "";
			}
			
			if (firstChunk === lastChunk) {
				return this._text[firstChunk].substring(start - firstOffset, end - lastOffset);
			}
			var beforeText = this._text[firstChunk].substring(start - firstOffset);
			var afterText = this._text[lastChunk].substring(0, end - lastOffset);
			return beforeText + this._text.slice(firstChunk+1, lastChunk).join("") + afterText; 
		},
		/**
		 * Notifies all listeners that the text is about to change.
		 * <p>
		 * This notification is intended to be used only by the view. Application clients should
		 * use {@link orion.editor.TextView#event:onModelChanging}.
		 * </p>
		 * <p>
		 * NOTE: This method is not meant to called directly by application code. It is called internally by the TextModel
		 * as part of the implementation of {@link #setText}. This method is included in the public API for documentation
		 * purposes and to allow integration with other toolkit frameworks.
		 * </p>
		 *
		 * @param {orion.editor.ModelChangingEvent} modelChangingEvent the changing event
		 */
		onChanging: function(modelChangingEvent) {
			return this.dispatchEvent(modelChangingEvent);
		},
		/**
		 * Notifies all listeners that the text has changed.
		 * <p>
		 * This notification is intended to be used only by the view. Application clients should
		 * use {@link orion.editor.TextView#event:onModelChanged}.
		 * </p>
		 * <p>
		 * NOTE: This method is not meant to called directly by application code. It is called internally by the TextModel
		 * as part of the implementation of {@link #setText}. This method is included in the public API for documentation
		 * purposes and to allow integration with other toolkit frameworks.
		 * </p>
		 *
		 * @param {orion.editor.ModelChangedEvent} modelChangedEvent the changed event
		 */
		onChanged: function(modelChangedEvent) {
			return this.dispatchEvent(modelChangedEvent);
		},
		/**
		 * Sets the line delimiter that is used by the view
		 * when new lines are inserted in the model due to key
		 * strokes and paste operations. The line delimiter of
		 * existing lines are unchanged unless the to <code>all</code>
		 * argument is <code>true</code>.
		 * <p>
		 * If lineDelimiter is "auto", the delimiter is computed to be
		 * the first delimiter found in the current text. If lineDelimiter
		 * is undefined or if there are no delimiters in the current text, the
		 * platform delimiter is used.
		 * </p>
		 *
		 * @param {String} lineDelimiter the line delimiter that is used by the view when inserting new lines.
		 * @param {Boolean} [all=false] whether or not the delimiter of existing lines are changed.
		 */
		setLineDelimiter: function(lineDelimiter, all) {
			if (lineDelimiter === "auto") {
				lineDelimiter = undefined;
				if (this.getLineCount() > 1) {
					lineDelimiter = this.getText(this.getLineEnd(0), this.getLineEnd(0, true));
				}
			}
			this._lineDelimiter = lineDelimiter ? lineDelimiter : util.platformDelimiter;
			if (all) {
				var lineCount = this.getLineCount();
				if (lineCount > 1) {
					var lines = new Array(lineCount);
					for (var i=0; i<lineCount; i++) {
						lines[i] = this.getLine(i);
					}
					this.setText(lines.join(this._lineDelimiter));
				}
			}
		},
		/**
		 * Replaces the text in the given range with the given text.
		 * <p>
		 * The end offset is not inclusive. This means that the character at the 
		 * end offset is not replaced.
		 * </p>
		 * <p>
		 * The text model must notify the listeners before and after the
		 * the text is changed by calling {@link #onChanging} and {@link #onChanged}
		 * respectively. 
		 * </p>
		 *
		 * @param {String} [text=""] the new text.
		 * @param {Number} [start=0] the zero based start offset of text range.
		 * @param {Number} [end=char count] the zero based end offset of text range.
		 *
		 * @see orion.editor.TextModel#getText
		 */
		setText: function(text, start, end) {
			if (text === undefined) { text = ""; }
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = this.getCharCount(); }
			if (start === end && text === "") { return; }
			var startLine = this.getLineAtOffset(start);
			var endLine = this.getLineAtOffset(end);
			var eventStart = start;
			var removedCharCount = end - start;
			var removedLineCount = endLine - startLine;
			var addedCharCount = text.length;
			var addedLineCount = 0;
			var lineCount = this.getLineCount();
			
			var cr = 0, lf = 0, index = 0;
			var newLineOffsets = [];
			while (true) {
				if (cr !== -1 && cr <= index) { cr = text.indexOf("\r", index); } //$NON-NLS-0$
				if (lf !== -1 && lf <= index) { lf = text.indexOf("\n", index); } //$NON-NLS-0$
				if (lf === -1 && cr === -1) { break; }
				if (cr !== -1 && lf !== -1) {
					if (cr + 1 === lf) {
						index = lf + 1;
					} else {
						index = (cr < lf ? cr : lf) + 1;
					}
				} else if (cr !== -1) {
					index = cr + 1;
				} else {
					index = lf + 1;
				}
				newLineOffsets.push(start + index);
				addedLineCount++;
			}
		
			var modelChangingEvent = {
				type: "Changing", //$NON-NLS-0$
				text: text,
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanging(modelChangingEvent);
			
			//TODO this should be done the loops below to avoid getText()
			if (newLineOffsets.length === 0) {
				var startLineOffset = this.getLineStart(startLine), endLineOffset;
				if (endLine + 1 < lineCount) {
					endLineOffset = this.getLineStart(endLine + 1);
				} else {
					endLineOffset = this.getCharCount();
				}
				if (start !== startLineOffset) {
					text = this.getText(startLineOffset, start) + text;
					start = startLineOffset;
				}
				if (end !== endLineOffset) {
					text = text + this.getText(end, endLineOffset);
					end = endLineOffset;
				}
			}
			
			var changeCount = addedCharCount - removedCharCount;
			for (var j = startLine + removedLineCount + 1; j < lineCount; j++) {
				this._lineOffsets[j] += changeCount;
			}
			
			/*
			* Feature in Chrome.  Chrome exceeds the maximum call stack when calling splice
			* around 62k arguments. The limit seems to be higher on IE (250K) and Firefox (450k).
			* The fix is to break the splice in junks of 50k.
			*/
			var SPLICE_LIMIT = 50000;
			var limit = SPLICE_LIMIT, args;
			if (newLineOffsets.length < limit) {
				args = [startLine + 1, removedLineCount].concat(newLineOffsets);
				Array.prototype.splice.apply(this._lineOffsets, args);
			} else {
				index = startLine + 1;
				this._lineOffsets.splice(index, removedLineCount);
				for (var k = 0; k < newLineOffsets.length; k += limit) {
					args = [index, 0].concat(newLineOffsets.slice(k, Math.min(newLineOffsets.length, k + limit)));
					Array.prototype.splice.apply(this._lineOffsets, args);
					index += limit;
				}
			}
			
			var offset = 0, chunk = 0, length;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (start <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var firstOffset = offset;
			var firstChunk = chunk;
			while (chunk<this._text.length) {
				length = this._text[chunk].length; 
				if (end <= offset + length) { break; }
				offset += length;
				chunk++;
			}
			var lastOffset = offset;
			var lastChunk = chunk;
			var firstText = this._text[firstChunk];
			var lastText = this._text[lastChunk];
			var beforeText = firstText.substring(0, start - firstOffset);
			var afterText = lastText.substring(end - lastOffset);
			var params = [firstChunk, lastChunk - firstChunk + 1];
			if (beforeText) { params.push(beforeText); }
			if (text) { params.push(text); }
			if (afterText) { params.push(afterText); }
			Array.prototype.splice.apply(this._text, params);
			if (this._text.length === 0) { this._text = [""]; }
			
			var modelChangedEvent = {
				type: "Changed", //$NON-NLS-0$
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanged(modelChangedEvent);
		}
	};
	mEventTarget.EventTarget.addMixin(TextModel.prototype);
	
	return {TextModel: TextModel};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/keyBinding", ['orion/util'], function(util) { //$NON-NLS-1$ //$NON-NLS-0$

    /**
	 * @class A KeyBinding is an interface used to define keyboard shortcuts.
	 * @name orion.KeyBinding
	 * 
	 * @property {Function} match The function to match events.
	 * @property {Function} equals The funtion to compare to key bindings.
	 *
	 * @see orion.KeyStroke
	 * @see orion.KeySequence
	 */

	/**
	 * Constructs a new key stroke with the given key code, modifiers and event type.
	 * 
	 * @param {String|Number} keyCode the key code.
	 * @param {Boolean} mod1 the primary modifier (usually Command on Mac and Control on other platforms).
	 * @param {Boolean} mod2 the secondary modifier (usually Shift).
	 * @param {Boolean} mod3 the third modifier (usually Alt).
	 * @param {Boolean} mod4 the fourth modifier (usually Control on the Mac).
	 * @param {String} type the type of event that the keybinding matches; either "keydown" or "keypress".
	 * 
	 * @class A KeyStroke represents of a key code and modifier state that can be triggered by the user using the keyboard.
	 * @name orion.KeyStroke
	 * 
	 * @property {String|Number} keyCode The key code.
	 * @property {Boolean} mod1 The primary modifier (usually Command on Mac and Control on other platforms).
	 * @property {Boolean} mod2 The secondary modifier (usually Shift).
	 * @property {Boolean} mod3 The third modifier (usually Alt).
	 * @property {Boolean} mod4 The fourth modifier (usually Control on the Mac).
	 * @property {String} [type=keydown] The type of event that the keybinding matches; either "keydown" or "keypress"
	 *
	 * @see orion.editor.TextView#setKeyBinding
	 */
	function KeyStroke (keyCode, mod1, mod2, mod3, mod4, type) {
		this.type = type || "keydown"; //$NON-NLS-0$
		if (typeof(keyCode) === "string" && this.type === "keydown") { //$NON-NLS-1$ //$NON-NLS-0$
			this.keyCode = keyCode.toUpperCase().charCodeAt(0);
		} else {
			this.keyCode = keyCode;
		}
		this.mod1 = mod1 !== undefined && mod1 !== null ? mod1 : false;
		this.mod2 = mod2 !== undefined && mod2 !== null ? mod2 : false;
		this.mod3 = mod3 !== undefined && mod3 !== null ? mod3 : false;
		this.mod4 = mod4 !== undefined && mod4 !== null ? mod4 : false;
	}
	KeyStroke.prototype = /** @lends orion.KeyStroke.prototype */ {
		getKeys: function() {
			return [this];
		},
		/**
		 * Determines either this key stroke matches the specifed event.  It can match either a
		 * a whole sequence of key events or a single key event at a specified index.
		 * <p>
		 * <code>KeyStroke</code> only matches single key events. <code>KeySequence</code> handles
		 * matching a sequence of events.
		 * </p>
		 * TODO explain this better
		 * 
		 * @param {DOMEvent|DOMEvent[]} e the key event or list of events to match.
		 * @param index the key event to match.
		 * @returns {Boolean} <code>true</code> whether the key binding matches the key event.
		 *
		 * @see orion.KeySequence#match
		 */
		match: function (e, index) {
			if (index !== undefined) {
				if (index !== 0) {
					return false;
				}
			} else {
				if (e instanceof Array) {
					if (e.length > 1) {
						return false;
					}
					e = e[0];
				}
			}
			if (e.type !== this.type) {
				return false;
			}
			if (this.keyCode === e.keyCode || this.keyCode === String.fromCharCode(util.isOpera ? e.which : (e.charCode !== undefined ? e.charCode : e.keyCode))) {
				var mod1 = util.isMac ? e.metaKey : e.ctrlKey;
				if (this.mod1 !== mod1) { return false; }
				if (this.type === "keydown") { //$NON-NLS-0$
					if (this.mod2 !== e.shiftKey) { return false; }
				}
				if (this.mod3 !== e.altKey) { return false; }
				if (util.isMac && this.mod4 !== e.ctrlKey) { return false; }
				return true;
			}
			return false;
		},
		/**
		 * Returns whether this key stroke is the same as the given parameter.
		 * 
		 * @param {orion.KeyBinding} kb the key binding to compare with.
		 * @returns {Boolean} whether or not the parameter and the receiver describe the same key binding.
		 */
		equals: function(kb) {
			if (!kb) { return false; }
			if (this.keyCode !== kb.keyCode) { return false; }
			if (this.mod1 !== kb.mod1) { return false; }
			if (this.mod2 !== kb.mod2) { return false; }
			if (this.mod3 !== kb.mod3) { return false; }
			if (this.mod4 !== kb.mod4) { return false; }
			if (this.type !== kb.type) { return false; }
			return true;
		} 
	};
	
	/**
	 * Constructs a new key sequence with the given key strokes.
	 * 
	 * @param {orion.KeyStroke[]} keys the key strokes for this sequence.
	 * 
	 * @class A KeySequence represents of a list of key codes and a modifiers state that can be triggered by the user using the keyboard.
	 * @name orion.KeySequence
	 * 
	 * @property {orion.KeyStroke[]} keys the list of key strokes.
	 *
	 * @see orion.editor.TextView#setKeyBinding
	 */
	function KeySequence (keys) {
		this.keys = keys;
	}
	KeySequence.prototype = /** @lends orion.KeySequence.prototype */ {
		getKeys: function() {
			return this.keys.slice(0);
		},
		match: function (e, index) {
			var keys = this.keys;
			if (index !== undefined) {
				if (index > keys.length) {
					return false;
				}
				if (keys[index].match(e)) {
					if (index === keys.length - 1) {
						return true;
					}
					return index + 1;
				}
				return false;
			} else {
				if (!(e instanceof Array)) {
					e = [e];
				}
				if (e.length > keys.length) {
					return false;
				}
				var i;
				for (i = 0; i < e.length; i++) {
					if (!keys[i].match(e[i])) {
						return false;
					}
				}
				if (i === keys.length) {
					return true;
				}
				return i;
			}
		},
		/**
		 * Returns whether this key sequence is the same as the given parameter.
		 * 
		 * @param {orion.KeyBinding|orion.KeySequence} kb the key binding to compare with.
		 * @returns {Boolean} whether or not the parameter and the receiver describe the same key binding.
		 */
		equals: function(kb) {
			if (!kb.keys) { return false; }
			if (kb.keys.length !== this.keys.length) { return false; }
			for (var i=0; i<kb.keys.length; i++) {
				if (!kb.keys[i].equals(this.keys[i])) { return false; }
			}
			return true;
		}	
	};
	
	return {
		KeyBinding: KeyStroke, // for backwards compatibility
		KeyStroke: KeyStroke,
		KeySequence: KeySequence
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 
/*eslint-env browser, amd*/
define("orion/editor/keyModes", [ //$NON-NLS-0$
		"orion/keyBinding", //$NON-NLS-0$
		"orion/util" //$NON-NLS-0$
], function(mKeyBinding, util) {

	function KeyMode(view) {
		if (!view) {
			return;
		}
		this._view = view;
		this._keyBindings = this.createKeyBindings();
		this._keyBindingIndex = 0;
	}
	KeyMode.prototype = /** @lends orion.editor.KeyMode.prototype */ {
		createKeyBindings: function () {
			return [];
		},
		/**
		 * Returns all the key bindings associated to the given action ID.
		 *
		 * @param {String} actionID the action ID.
		 * @returns {orion.KeyBinding[]} the array of key bindings associated to the given action ID.
		 *
		 * @see orion.editor.KeyModesetKeyBinding
		 * @see orion.editor.KeyModesetAction
		 */
		getKeyBindings: function (actionID) {
			var result = [];
			var keyBindings = this._keyBindings;
			for (var i = 0; i < keyBindings.length; i++) {
				if (keyBindings[i].actionID === actionID) {
					result.push(keyBindings[i].keyBinding);
				}
			}
			return result;
		},
		getView: function() {
			return this._view;
		},
		isActive: function () {
			return this._view.getKeyModes().indexOf(this) !== -1;
		},
		match: function(e) {
			if (e.type === "keydown") { //$NON-NLS-0$
				switch (e.keyCode) {
					case 16: /* Shift */
					case 17: /* Control */
					case 18: /* Alt */
					case 91: /* Command */
						return undefined;
				}
			}
			var keyBindingIndex = this._keyBindingIndex;
			var keyBindings = this._matchingKeyBindings || this._keyBindings;
			var matchingKeyBindings = [];
			for (var i = 0; i < keyBindings.length; i++) {
				var kb = keyBindings[i];
				var keyBinding = kb.keyBinding;
				var match = keyBinding.match(e, keyBindingIndex);
				if (match === true) {
					this._keyBindingIndex = 0;
					this._matchingKeyBindings = null;
					return kb.actionID;
				} else if (typeof match === "number") { //$NON-NLS-0$
					matchingKeyBindings.push(kb);
				}
			}
			if (matchingKeyBindings.length === 0) {
				this._keyBindingIndex = 0;
				this._matchingKeyBindings = null;
			} else {
				this._keyBindingIndex++;
				this._matchingKeyBindings = matchingKeyBindings;
				return "noop"; //$NON-NLS-0$
			}
			return undefined;
		},
		/**
		 * Associates a key binding with the given action ID. Any previous
		 * association with the specified key binding is overwriten. If the
		 * action ID is <code>null</code>, the association is removed.
		 * 
		 * @param {orion.KeyBinding} keyBinding the key binding
		 * @param {String} actionID the action ID
		 */
		setKeyBinding: function(keyBinding, actionID) {
			var keyBindings = this._keyBindings;
			for (var i = 0; i < keyBindings.length; i++) {
				var kb = keyBindings[i]; 
				if (kb.keyBinding.equals(keyBinding)) {
					if (actionID) {
						kb.actionID = actionID;
					} else {
						if (kb.predefined) {
							kb.actionID = "noop"; //$NON-NLS-0$
						} else {
							keyBindings.splice(i, 1);
						}
					}
					return;
				}
			}
			if (actionID) {
				keyBindings.push({keyBinding: keyBinding, actionID: actionID});
			}
		},
		setView: function(view) {
			this._view = view;
		}
	};
	
	function DefaultKeyMode(view) {
		KeyMode.call(this, view);
	}
	DefaultKeyMode.prototype = new KeyMode();
	DefaultKeyMode.prototype.createKeyBindings = function () {
		var KeyBinding = mKeyBinding.KeyBinding;
		//no duplicate keybindings
		var bindings = [];

		// Cursor Navigation
		bindings.push({actionID: "lineUp",		keyBinding: new KeyBinding(38), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "lineDown",	keyBinding: new KeyBinding(40), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "charPrevious",	keyBinding: new KeyBinding(37), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "charNext",	keyBinding: new KeyBinding(39), predefined: true}); //$NON-NLS-0$
		if (util.isMac) {
			bindings.push({actionID: "scrollPageUp",		keyBinding: new KeyBinding(33), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "scrollPageDown",	keyBinding: new KeyBinding(34), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "pageUp",		keyBinding: new KeyBinding(33, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "pageDown",	keyBinding: new KeyBinding(34, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(37, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(39, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "wordPrevious",	keyBinding: new KeyBinding(37, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "wordNext",	keyBinding: new KeyBinding(39, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "scrollTextStart",	keyBinding: new KeyBinding(36), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "scrollTextEnd",		keyBinding: new KeyBinding(35), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "textStart",	keyBinding: new KeyBinding(38, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "textEnd",		keyBinding: new KeyBinding(40, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "scrollPageUp",	keyBinding: new KeyBinding(38, null, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "scrollPageDown",		keyBinding: new KeyBinding(40, null, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(37, null, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(39, null, null, null, true), predefined: true}); //$NON-NLS-0$
			//TODO These two actions should be changed to paragraph start and paragraph end  when word wrap is implemented
			bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(38, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(40, null, null, true), predefined: true}); //$NON-NLS-0$
		} else {
			bindings.push({actionID: "pageUp",		keyBinding: new KeyBinding(33), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "pageDown",	keyBinding: new KeyBinding(34), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineStart",	keyBinding: new KeyBinding(36), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineEnd",		keyBinding: new KeyBinding(35), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "wordPrevious",	keyBinding: new KeyBinding(37, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "wordNext",	keyBinding: new KeyBinding(39, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "textStart",	keyBinding: new KeyBinding(36, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "textEnd",		keyBinding: new KeyBinding(35, true), predefined: true}); //$NON-NLS-0$
		}
		if (util.isFirefox && util.isLinux) {
			bindings.push({actionID: "lineUp",		keyBinding: new KeyBinding(38, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "lineDown",	keyBinding: new KeyBinding(40, true), predefined: true}); //$NON-NLS-0$
		}
		if (util.isWindows) {
			bindings.push({actionID: "scrollLineUp",	keyBinding: new KeyBinding(38, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "scrollLineDown",	keyBinding: new KeyBinding(40, true), predefined: true}); //$NON-NLS-0$
		}

		// Select Cursor Navigation
		bindings.push({actionID: "selectLineUp",		keyBinding: new KeyBinding(38, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "selectLineDown",		keyBinding: new KeyBinding(40, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "selectCharPrevious",	keyBinding: new KeyBinding(37, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "selectCharNext",		keyBinding: new KeyBinding(39, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "selectPageUp",		keyBinding: new KeyBinding(33, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "selectPageDown",		keyBinding: new KeyBinding(34, null, true), predefined: true}); //$NON-NLS-0$
		if (util.isMac) {
			bindings.push({actionID: "selectLineStart",	keyBinding: new KeyBinding(37, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(39, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectWordPrevious",	keyBinding: new KeyBinding(37, null, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectWordNext",	keyBinding: new KeyBinding(39, null, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectTextStart",	keyBinding: new KeyBinding(36, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectTextEnd",		keyBinding: new KeyBinding(35, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectTextStart",	keyBinding: new KeyBinding(38, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectTextEnd",		keyBinding: new KeyBinding(40, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectLineStart",	keyBinding: new KeyBinding(37, null, true, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(39, null, true, null, true), predefined: true}); //$NON-NLS-0$
			//TODO These two actions should be changed to select paragraph start and select paragraph end  when word wrap is implemented
			bindings.push({actionID: "selectLineStart",	keyBinding: new KeyBinding(38, null, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(40, null, true, true), predefined: true}); //$NON-NLS-0$
		} else {
			if (util.isLinux) {
				bindings.push({actionID: "selectWholeLineUp",		keyBinding: new KeyBinding(38, true, true), predefined: true}); //$NON-NLS-0$
				bindings.push({actionID: "selectWholeLineDown",		keyBinding: new KeyBinding(40, true, true), predefined: true}); //$NON-NLS-0$
			}
			bindings.push({actionID: "selectLineStart",		keyBinding: new KeyBinding(36, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectLineEnd",		keyBinding: new KeyBinding(35, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectWordPrevious",	keyBinding: new KeyBinding(37, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectWordNext",		keyBinding: new KeyBinding(39, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectTextStart",		keyBinding: new KeyBinding(36, true, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "selectTextEnd",		keyBinding: new KeyBinding(35, true, true), predefined: true}); //$NON-NLS-0$
		}
		
		//Undo stack
		bindings.push({actionID: "undo", keyBinding: new mKeyBinding.KeyBinding('z', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
		if (util.isMac) {
			bindings.push({actionID: "redo", keyBinding: new mKeyBinding.KeyBinding('z', true, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
		} else {
			bindings.push({actionID: "redo", keyBinding: new mKeyBinding.KeyBinding('y', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
		}

		//Misc
		bindings.push({actionID: "deletePrevious",		keyBinding: new KeyBinding(8), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "deletePrevious",		keyBinding: new KeyBinding(8, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "deleteNext",		keyBinding: new KeyBinding(46), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "deleteWordPrevious",	keyBinding: new KeyBinding(8, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "deleteWordPrevious",	keyBinding: new KeyBinding(8, true, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "deleteWordNext",		keyBinding: new KeyBinding(46, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "tab",			keyBinding: new KeyBinding(9), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "shiftTab",			keyBinding: new KeyBinding(9, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "enter",			keyBinding: new KeyBinding(13), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "enter",			keyBinding: new KeyBinding(13, null, true), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "escape",			keyBinding: new KeyBinding(27), predefined: true}); //$NON-NLS-0$
		bindings.push({actionID: "selectAll",		keyBinding: new KeyBinding('a', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
		bindings.push({actionID: "toggleTabMode",	keyBinding: new KeyBinding('m', true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
		if (util.isMac) {
			bindings.push({actionID: "deleteNext",		keyBinding: new KeyBinding(46, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deleteWordPrevious",	keyBinding: new KeyBinding(8, null, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "deleteWordNext",		keyBinding: new KeyBinding(46, null, null, true), predefined: true}); //$NON-NLS-0$
		}
		
		bindings.push({actionID: "toggleWrapMode",		keyBinding: new mKeyBinding.KeyBinding('w', true, false, true)}); //$NON-NLS-1$ //$NON-NLS-0$
		bindings.push({actionID: "toggleOverwriteMode",		keyBinding: new mKeyBinding.KeyBinding(45)}); //$NON-NLS-0$
		
		/*
		* Feature in IE/Chrome: prevent ctrl+'u', ctrl+'i', and ctrl+'b' from applying styles to the text.
		*
		* Note that Chrome applies the styles on the Mac with Ctrl instead of Cmd.
		*/
		if (!util.isFirefox) {
			var isMacChrome = util.isMac && util.isChrome;
			bindings.push({actionID: "noop", keyBinding: new KeyBinding('u', !isMacChrome, false, false, isMacChrome), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "noop", keyBinding: new KeyBinding('i', !isMacChrome, false, false, isMacChrome), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "noop", keyBinding: new KeyBinding('b', !isMacChrome, false, false, isMacChrome), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
		}

		if (util.isFirefox) {
			bindings.push({actionID: "copy", keyBinding: new KeyBinding(45, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "paste", keyBinding: new KeyBinding(45, null, true), predefined: true}); //$NON-NLS-0$
			bindings.push({actionID: "cut", keyBinding: new KeyBinding(46, null, true), predefined: true}); //$NON-NLS-0$
		}

		// Add the emacs Control+ ... key bindings.
		if (util.isMac) {
			bindings.push({actionID: "lineStart", keyBinding: new KeyBinding("a", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "lineEnd", keyBinding: new KeyBinding("e", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "lineUp", keyBinding: new KeyBinding("p", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "lineDown", keyBinding: new KeyBinding("n", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "charPrevious", keyBinding: new KeyBinding("b", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "charNext", keyBinding: new KeyBinding("f", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "deletePrevious", keyBinding: new KeyBinding("h", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "deleteNext", keyBinding: new KeyBinding("d", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "deleteLineEnd", keyBinding: new KeyBinding("k", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			if (util.isFirefox) {
				bindings.push({actionID: "scrollPageDown", keyBinding: new KeyBinding("v", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "deleteLineStart", keyBinding: new KeyBinding("u", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "deleteWordPrevious", keyBinding: new KeyBinding("w", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
			} else {
				bindings.push({actionID: "pageDown", keyBinding: new KeyBinding("v", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "centerLine", keyBinding: new KeyBinding("l", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				bindings.push({actionID: "enterNoCursor", keyBinding: new KeyBinding("o", false, false, false, true), predefined: true}); //$NON-NLS-1$ //$NON-NLS-0$
				//TODO implement: y (yank), t (transpose)
			}
		}
		return bindings;
	};
	
	return {
		KeyMode: KeyMode,
		DefaultKeyMode: DefaultKeyMode
	};
});
/*******************************************************************************
 * @license
 * Copyright (c) 2013,2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 
/*eslint-env browser, amd*/
define("orion/editor/textTheme", //$NON-NLS-0$
[
	'require', //$NON-NLS-0$
	'orion/editor/eventTarget', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(require, mEventTarget, util) {
	var THEME_PREFIX = "orion-theme-"; //$NON-NLS-0$
	
	var Themes = {};

	/**
	 * Constructs a new text theme. 
	 * 
	 * @class A TextTheme is a class used to specify an editor theme.
	 * @name orion.editor.TextTheme
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function TextTheme(options) {
		options = options || {};
		this._document = options.document || document;
	}

	/**
	 * Gets an instance of <code>orion.editor.TextTheme</code> by name. If the name
	 * paramenter is not speficed the default text theme instance is returned.
	 * Subsequent calls of <code>getTheme</code> with the same name will return
	 * the same instance.
	 */
	TextTheme.getTheme = function(name) {
		name = name || "default"; //$NON-NLS-0$
		var theme = Themes[name];
		if (!theme) {
			theme = Themes[name] = new TextTheme();
		}
		return theme;
	};

	TextTheme.prototype = /** @lends orion.editor.TextTheme.prototype */ {
		/**
		 * Returns the theme className.
		 *
		 * @see orion.editor.TextTheme#setThemeClass
		 */
		getThemeClass: function() {
			return this._themeClass;
		},
		/**
		 * @class This object represents a style sheet for a theme manager.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextTheme#setThemeClass}
		 * </p>
		 * @name orion.editor.ThemeStyleSheet
		 * 
		 * @property {String} href The href of the stylesheet
		 */
		/**
		 * Sets the theme className and style sheet.
		 * <p>
		 * If the <code>stylesheet</code> parameter is a string, it represents an inline
		 * CSS and it will be added to the document as a <i>STYLE</i> tag element.  If the
		 * <code>stylesheet</code> parameter is a <code>orion.editor.ThemeStyleSheet</code>,
		 * its href property is loaded as either a <i>STYLE</i> tag element or as a <i>LINK</i>
		 * tag element.
		 * </p>
		 * <p>
		 * Listeners of the ThemeChanged event are notify once the styled sheet is loaded
		 * into the document.
		 * </p>
		 *
		 * @param {String} className the new theme className.
		 * @param {String|orion.editor.ThemeStyleSheet} styleSheet the CSS stylesheet for the new theme className.
		 *
		 * @see orion.editor.TextTheme#getThemeClass
		 * @see orion.editor.TextTheme#onThemeChanged
		 */
		 setThemeClass: function(className, styleSheet) {
			var self = this;
			var oldThemeClass = self._themeClass;	
			self._themeClass = className;
			this._load(className, styleSheet, function() {
				self.onThemeChanged({
					type: "ThemeChanged", //$NON-NLS-0$
					oldValue: oldThemeClass,
					newValue: self.getThemeClass()
				});
			});
		},
		/**
		 * @class This is the event sent when the theme className or style sheet has changed.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextTheme}<br/>
		 * {@link orion.editor.TextTheme#event:onThemeChanged}
		 * </p>
		 * @name orion.editor.ThemeChangedEvent
		 * 
		 * @property {String} oldValue The old theme clasName.
		 * @property {String} newValue The new theme className.
		 */
		/**
		 * This event is sent when the theme clasName has changed and its style sheet has been loaded in the document.
		 *
		 * @event
		 * @param {orion.editor.ThemeChangedEvent} themeChangedEvent the event
		 */
		onThemeChanged: function(themeChangedEvent) {
			return this.dispatchEvent(themeChangedEvent);
		},
		buildStyleSheet: function(themeClass, settings) {
			var convertCSSname = function(name) {
				return name.replace(this._capitalRegEx, function(match) {
					return "-" + match; //$NON-NLS-0$
				}.bind(this)).toLowerCase();
			}.bind(this);

			var parseStyles = function(object, ancestors, className, isTopLevel, result) {
				var localResult = [];
				var keys = Object.keys(object);
				keys.forEach(function(key) {
					if(key !== "isTopLevel"){
						var value = object[key];
						if (typeof(value) === "string") { //$NON-NLS-0$
							localResult.push("\t" + convertCSSname(key) + ": " + value + ";"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
						} else {
							if(value.isTopLevel){
								parseStyles(
									value,
									className === key ? ancestors : ancestors + (isTopLevel ? " ." : ".") + key, //$NON-NLS-1$ //$NON-NLS-0$
									className,
									true,
									result);
							}else{
								parseStyles(
									value,
									className === key ? ancestors : ancestors + (isTopLevel ? " ." : ".") + key, //$NON-NLS-1$ //$NON-NLS-0$
									className,
									false,
									result);
							}
						}
					}
				});
				if (localResult.length) {
					result.push(ancestors + (isTopLevel ? ".textview" : "") + " {"); //$NON-NLS-0$
					result.push.apply(result, localResult);
					result.push("}"); //$NON-NLS-0$
				}
			};

			var result = [""];
			parseStyles(settings.styles, "." + themeClass, settings.className, true, result); //$NON-NLS-0$
			return result.join("\n"); //$NON-NLS-0$
		},

		/**
		 * @private
		 */
		_createStyle: function(className, styleSheet, callback, link) {
			var document = this._document;
			var id = THEME_PREFIX + className;
			var node = document.getElementById(id);
			if (node) {
				if (link || node.firstChild.data === styleSheet) {
					return;
				}
				node.removeChild(node.firstChild);
				node.appendChild(document.createTextNode(styleSheet));
			} else {
				if (link) {
					node = util.createElement(document, "link"); //$NON-NLS-0$
					node.rel = "stylesheet"; //$NON-NLS-0$
					node.type = "text/css"; //$NON-NLS-0$
					node.href = styleSheet;
					node.addEventListener("load", function() { //$NON-NLS-0$
						callback();
					});
				} else {
					node = util.createElement(document, "style"); //$NON-NLS-0$
					node.appendChild(document.createTextNode(styleSheet));
				}
				node.id = id;
				var head = document.getElementsByTagName("head")[0] || document.documentElement; //$NON-NLS-0$
				head.appendChild(node);
			}
			if (!link) {
				callback();
			}
		},
		/**
		 * @private
		 */
		_load: function (className, styleSheet, callback) {
			if (!className) {
				callback();
				return;
			}
			if (typeof styleSheet === "string") { //$NON-NLS-0$
				this._createStyle(className, styleSheet, callback);
				return;
			}
			var href = styleSheet.href;
			var extension = ".css"; //$NON-NLS-0$
			if (href.substring(href.length - extension.length) !== extension) {
				href += extension;
			}
			if (/^\//.test(href) || /[a-zA-Z0-9]+:\/\//i.test(href) || !require.toUrl /* almond cannot load dynamically */) {
				this._createStyle(className, href, callback, true);
			} else {
				var self = this;
				require(["text!" + href], function(cssText) { //$NON-NLS-0$
					self._createStyle(className, cssText, callback, false);
				});
			}
		},
		_capitalRegEx: /[A-Z]/g
	};
	mEventTarget.EventTarget.addMixin(TextTheme.prototype);
	
	return {
		TextTheme: TextTheme
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
 
/*eslint-env browser, amd*/
define("orion/editor/util", [], function() { //$NON-NLS-0$
	
	/** @private */
	function addEventListener(node, type, handler, capture) {
		if (typeof node.addEventListener === "function") { //$NON-NLS-0$
			node.addEventListener(type, handler, capture === true);
		} else {
			node.attachEvent("on" + type, handler); //$NON-NLS-0$
		}
	}
	/** @private */
	function removeEventListener(node, type, handler, capture) {
		if (typeof node.removeEventListener === "function") { //$NON-NLS-0$
			node.removeEventListener(type, handler, capture === true);
		} else {
			node.detachEvent("on" + type, handler); //$NON-NLS-0$
		}
	}
	/** @private */
	function compare(s1, s2) {
		if (s1 === s2) { return true; }
		if (s1 && !s2 || !s1 && s2) { return false; }
		if ((s1 && s1.constructor === String) || (s2 && s2.constructor === String)) { return false; }
		if (s1 instanceof Array || s2 instanceof Array) {
			if (!(s1 instanceof Array && s2 instanceof Array)) { return false; }
			if (s1.length !== s2.length) { return false; }
			for (var i = 0; i < s1.length; i++) {
				if (!compare(s1[i], s2[i])) {
					return false;
				}
			}
			return true;
		}
		if (!(s1 instanceof Object) || !(s2 instanceof Object)) { return false; }
		var p;
		for (p in s1) {
			if (s1.hasOwnProperty(p)) {
				if (!s2.hasOwnProperty(p)) { return false; }
				if (!compare(s1[p], s2[p])) {return false; }
			}
		}
		for (p in s2) {
			if (!s1.hasOwnProperty(p)) { return false; }
		}
		return true;
	}
	/** @private */
	function contains(topNode, node) {
		if (!node) { return false; }
		if (!topNode.compareDocumentPosition) {
			var temp = node;
			while (temp) {
				if (topNode === temp) {
					return true;
				}
				temp = temp.parentNode;
			}
			return false;
		}
		return topNode === node || (topNode.compareDocumentPosition(node) & 16) !== 0;
	}
	/** @private */
	function getNodeStyle(node, prop, defaultValue) {
		var value;
		if (node) {
			value = node.style[prop];
			if (!value) {
				if (node.currentStyle) {
					var index = 0, p = prop;
					while ((index = p.indexOf("-", index)) !== -1) { //$NON-NLS-0$
						p = p.substring(0, index) + p.substring(index + 1, index + 2).toUpperCase() + p.substring(index + 2);
					}
					value = node.currentStyle[p];
				} else {
					var css = node.ownerDocument.defaultView.getComputedStyle(node, null);
					value = css ? css.getPropertyValue(prop) : null;
				}
			}
		}
		return value || defaultValue;
	}

	/**
	 * @class
	 * @private
	 * @name orion.editor.Animation
	 * @description Creates an animation.
	 * @param {Object} options Options controlling the animation.
	 * @param {Array} options.curve Array of 2 values giving the start and end points for the animation.
	 * @param {Number} [options.duration=350] Duration of the animation, in milliseconds.
	 * @param {Function} [options.easing]
	 * @param {Function} [options.onAnimate]
	 * @param {Function} [options.onEnd]
	 * @param {Number} [options.rate=20] The time between frames, in milliseconds.
	 */
	var Animation = /** @ignore */ (function() {
		function Animation(options) {
			this.options = options;
		}
		/**
		 * Plays this animation.
		 * @function
		 * @memberOf orion.editor.Animation.prototype
		 * @name play
		 */
		Animation.prototype.play = function() {
			var duration = (typeof this.options.duration === "number") ? this.options.duration : 350, //$NON-NLS-0$
			    rate = (typeof this.options.rate === "number") ? this.options.rate : 20, //$NON-NLS-0$
			    easing = this.options.easing || this.defaultEasing,
			    onAnimate = this.options.onAnimate || function() {},
			    start = this.options.curve[0],
			    end = this.options.curve[1],
			    range = (end - start),
			    startedAt = -1,
				propertyValue,
				self = this;

			function onFrame() {
				startedAt = (startedAt === -1) ? Date.now() : startedAt;
				var now = Date.now(),
				    percentDone = (now - startedAt) / duration;
				if (percentDone < 1) {
					var eased = easing(percentDone);
					propertyValue = start + (eased * range);
					onAnimate(propertyValue);
				} else {
					onAnimate(end);
					self.stop();
				}
			}
			this.interval = this.options.window.setInterval(onFrame, rate);
		};
		/**
		 * Stops this animation.
		 * @function
		 * @memberOf orion.editor.Animation.prototype
		 */
		Animation.prototype.stop = function() {
			this.options.window.clearInterval(this.interval);
		    var onEnd = this.options.onEnd || function () {};
			onEnd();
		};
		Animation.prototype.defaultEasing = function(x) {
			return Math.sin(x * (Math.PI / 2));
		};
		return Animation;
	}());

	return {
		compare: compare,
		contains: contains,
		getNodeStyle: getNodeStyle,
		addEventListener: addEventListener,
		removeEventListener: removeEventListener,
		Animation: Animation
	};
});
/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 *******************************************************************************/
define ('orion/bidiUtils',[
	"orion/util"
],
function(util) { /* BDL */
	
	var bidiEnabledStorage = "/orion/preferences/bidi/bidiEnabled"; //$NON-NLS-0$
	var bidiLayoutStorage = "/orion/preferences/bidi/bidiLayout"; //$NON-NLS-0$	
	var LRE = "\u202A";	//$NON-NLS-0$
	var PDF = "\u202C"; //$NON-NLS-0$
	var RLE = "\u202B"; //$NON-NLS-0$
		
	function setBrowserLangDirection() {
		
		var lang;
		if (window.dojoConfig) {
			lang = window.dojoConfig.locale;
		}
		if (!lang) {
			lang = navigator.languages ? navigator.languages[0] : navigator.language || navigator.userLanguage;
		}
		var isBidi = lang && "ar iw he".indexOf(lang.substring(0, 2)) !== - 1;

		if (isBidi && isBidiEnabled()) {
			var htmlElement = document.getElementsByTagName("html")[0];
			if (htmlElement){ //should be always true
				htmlElement.setAttribute ("dir", "rtl");
			}
		}
	}
	
	setBrowserLangDirection();
	
	var bidiLayout = getBidiLayout();

	/**
	 * checks if directionality should be applied in Orion.
	 * @returns {Boolean} true if globalization settings exist and bidi is enabled.
	 */		
	function isBidiEnabled() {
		var bidiEnabled = localStorage.getItem(bidiEnabledStorage);
		if (bidiEnabled && bidiEnabled === "true") {		//$NON-NLS-0$
			return true;
		}
		return false;
	}
	
	/**
	 * returns bidiLayout value set in globalization settings.
	 * @returns {String} text direction.
	 */	
	function getBidiLayout() {
		var _bidiLayout = localStorage.getItem(bidiLayoutStorage);
		if (_bidiLayout && (_bidiLayout === "rtl" || _bidiLayout === "ltr" || _bidiLayout === "auto")) {	//$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
			return _bidiLayout;
		}
		return "ltr";	//$NON-NLS-0$
	}
	
	/**
	 * returns text direction.
	 * this method is used for handling direction by adding a dir attribute in an HTML element.
	 * if bidiLayout is set to ltr > return ltr
	 * if bidiLayout is set to rtl > return rtl
	 * if bidiLayout is set to auto > check for first strong character in text and return ltr or rtl accordingly.
	 * @param {String} the text on which to set directionality
	 * @returns {String} text direction. rtl or ltr.
	 */	
	function getTextDirection(text) {
		bidiLayout = getBidiLayout();
		if (!isBidiEnabled()) {
			return "";
		}
		if (bidiLayout === "auto" && util.isIE) {	//$NON-NLS-0$
			return checkContextual(text);
		}
		return bidiLayout;
	}
	
	/**
	 * Wraps text by UCC (Unicode control characters) according to text direction
	 * In some cases defining the dir attribute in a different direction than the GUI orientation, 
	 * changes the alignment of the text and/or adjacent elements such as icons.
	 * This doesn't follow the bidi standards (static text should be aligned following GUI direction).
	 * Therefore the only solution is to use UCC (Unicode control characters) to display the text in a correct orientation.
	 * (the text is changed for display purposes only. The original text in the repository remains unchanged)
	 * @param {String} the text to be wrapped
	 * @returns {String} text after adding ucc characters.
	 */		
	function enforceTextDirWithUcc ( text ) {
		if (isBidiEnabled() && text.trim()) {
			bidiLayout = getBidiLayout();
			var dir = bidiLayout === "auto" ? checkContextual( text ) : bidiLayout;	//$NON-NLS-0$
			return ( dir === "ltr" ? LRE : RLE ) + text + PDF;	//$NON-NLS-0$
		}
		return text;	
	}
	
	/**
	 * Finds the first strong (directional) character.
	 * If it is Latin, return ltr. If it is bidi, return rtl. Otherwise, return ltr as default. 
	 * @param {String} the text to be examined
	 * @returns {String} text direction. rtl or ltr.
	 */			
	function checkContextual ( text ) {
		// look for strong (directional) characters
		var fdc = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec( text );
		// if found, return the direction that defined by the character, else return ltr as defult.
		return fdc ? fdc[0] <= "z" ? "ltr" : "rtl"  : "ltr";	//$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
	}
	
	function addBidiEventListeners ( input ) {
		if (!input._hasBidiEventListeners) {
			input._hasBidiEventListeners = true;

			var eventTypes = ["keyup", "cut", "paste"];
			for (var i = 0; i < eventTypes.length; ++i) {
				input.addEventListener(eventTypes[i], handleInputEvent.bind(this),
					false);
			}
		}
	}
	
	function handleInputEvent ( event ) {
		var input = event.target;
		if (input) {
			input.dir = getTextDirection(input.value || input.textContent); // resolve dir attribute of the element
		}
	}
	
	function initInputField ( input ) {
		if (isBidiEnabled() && input) {
			input.dir = getTextDirection(input.value || input.textContent); // resolve dir attribute of the element

			if (util.isIE) {
				addBidiEventListeners(input);
			}
		}
	}
	
	function enforceTextDir(range) {
		var comments = [{name:"comment block"}, 
		                {name:"comment line double-slash"},
		                {name:"comment block documentation"},
		                {name:"comment line double-slash jade"},
		                {name:"comment line"},
		                {name:"comment line number-sign php"},
		                {name:"comment block xml"}
		];
		var text = range.text;
		var style = range.style;
		if (isBidiEnabled() && style && style.styleClass && style.styleClass.startsWith("comment") && text.length > 0) {
			for (var i = 0; i < comments.length; i++) {
				if (style.styleClass === comments[i].name) {
					var newStyle = style;
					if (typeof newStyle.attributes === "undefined") {
						newStyle.attributes = {};
					}
					newStyle.attributes.dir = getTextDirection(text);
					range.style = newStyle;		
					return range;
				}
			}
		}
		return range;
	}

		
	return {
		isBidiEnabled: isBidiEnabled,
		getTextDirection: getTextDirection,		
		enforceTextDirWithUcc: enforceTextDirWithUcc,
		initInputField: initInputField,
		enforceTextDir: enforceTextDir
	};
});
/*******************************************************************************
 * @license
 * Copyright (c) 2014, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define('orion/metrics',[
], function() {

	var _services = [];
	var timingVars = Object.create(null);

	/**
	 * @name Metrics
	 * @description Creates a new instance of the metrics service
	 * @param {Object} serviceRegistry The backing service registry to register the new service with
	 * @param {Object} args An object of additional arguments
	 * @param {Array} serviceArray An array of logging services (optional; for use when no service registry is present) 
	 * @returns {Metrics} A new Metrics instance
	 * @since 12.0
	 */
	function Metrics(serviceRegistry, args, serviceArray) {
		var services = serviceArray || [];
		if (serviceRegistry) {
			var refs = serviceRegistry.getServiceReferences("orion.metrics"); //$NON-NLS-0$
			refs.forEach(function(current) {
				services.push(serviceRegistry.getService(current));
			});
		}
		
		/* the following definitions are from https://developers.google.com/analytics/devguides/collection/analyticsjs/pages */
		var href = window.location.protocol + '//' + window.location.hostname + window.location.pathname + window.location.search; //$NON-NLS-0$
		var page = window.location.pathname + window.location.search;
		var title = document.title;

		_services = services;
		_services.forEach(function(current) {
			current.pageLoad(href, page, title, args);
		});

		if (serviceRegistry) {
			serviceRegistry.registerService("orion.core.metrics.client", this); //$NON-NLS-1$
		}
	}
	
	/** @callback */
	function _logTiming(timingCategory, timingVar, timingValue, timingLabel) {
		_services.forEach(function(current) {
			current.logTiming(timingCategory, timingVar, timingValue, timingLabel);
		});
	}
	/** @callback */
	function _logEvent(category, action, label, value, details) {
		_services.forEach(function(current) {
			current.logEvent(category, action, label || "", value, details);
		});
	}
	/** @callback */
	function _logPageLoadTiming(timingVar, timingLabel) {
		/* 
		 * The level of window.performance implementation varies across the browsers,
		 * so check for the existence of all utilized functions up-front.
		 */
		if (window.performance) {
			 /* ensure that no more timings of this type are logged for this page */
			if (window.performance.getEntriesByName && window.performance.mark) {
				if (window.performance.getEntriesByName(timingVar).length) {
					return;
				}
				window.performance.mark(timingVar);
			} else {
				if (timingVars[timingVar]) {
					return;
				}
				timingVars[timingVar] = Date.now();				
			}
			_logTiming("page", timingVar, window.performance.now(), timingLabel); //$NON-NLS-0$
		}
	}
	
	Metrics.prototype = {
		/**
		 * @description Log a timing
		 * @function
		 * @param {String} timingCategory The name of the category to log to
		 * @param {String} timingVar The name of the variable to log to
		 * @param {Number} timingValue The timing to log
		 * @param {String} timingLabel A label for the new timing
		 */
		logTiming: function(timingCategory, timingVar, timingValue, timingLabel) {
			_logTiming(timingCategory, timingVar, timingValue, timingLabel);
		},
		/**
		 * @description Log an event
		 * @function
		 * @param {String} category The name of the category to log to
		 * @param {String} action The name of the action logged
		 * @param {String} label A label for the event
		 * @param {String} value The event value to log
		 * @param {String} details Additional details about the event being logged
		 */
		logEvent: function(category, action, label, value, details) {
			_logEvent(category, action, label, value, details);
		},
		/**
		 * @description Log how long it took to load a page
		 * @function
		 * @param {Number} timingVar The timing to log
		 * @param {String} timingLabel A label for the new timing
		 */
		logPageLoadTiming: function(timingVar, timingLabel) {
			_logPageLoadTiming(timingVar, timingLabel);
		}
	};
	
	return {
		Metrics: Metrics,
		logTiming: _logTiming,
		logEvent: _logEvent,
		logPageLoadTiming: _logPageLoadTiming
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 *		Mihai Sucan (Mozilla Foundation) - fix for Bug#334583 Bug#348471 Bug#349485 Bug#350595 Bug#360726 Bug#361180 Bug#362835 Bug#362428 Bug#362286 Bug#354270 Bug#361474 Bug#363945 Bug#366312 Bug#370584
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/textView", [  //$NON-NLS-1$
	'i18n!orion/editor/nls/messages', //$NON-NLS-1$
	'orion/editor/textModel', //$NON-NLS-1$
	'orion/editor/keyModes', //$NON-NLS-1$
	'orion/editor/eventTarget', //$NON-NLS-1$
	'orion/editor/textTheme', //$NON-NLS-1$
	'orion/editor/util', //$NON-NLS-1$
	'orion/util', //$NON-NLS-1$
	'orion/bidiUtils', //$NON-NLS-1$
	'orion/metrics' //$NON-NLS-1$
], function(messages, mTextModel, mKeyModes, mEventTarget, mTextTheme, textUtil, util, bidiUtils, mMetrics) {

	/** @private */
	function getWindow(doc) {
		return doc.defaultView || doc.parentWindow;
	}
	function newArray(len) {
		return new Array(len);
	}
	var addHandler = textUtil.addEventListener;
	var removeHandler = textUtil.removeEventListener;
	/** @private */
	function applyStyle(style, node, reset) {
		if (reset) {
			node.className = "";
			var attrs = node.attributes;
			for (var i= attrs.length; i-->0;) {
				if (!util.isIE || util.isIE >= 9 || (util.isIE < 9 && attrs[i].specified)) {
					node.removeAttribute(attrs[i].name); 
				}
			}
		}
		if (!style) {
			return;
		}
		if (style.styleClass) {
			node.className = style.styleClass;
		}
		var properties = style.style;
		if (properties) {
			for (var s in properties) {
				if (properties.hasOwnProperty(s)) {
					node.style[s] = properties[s];
				}
			}
		}
		var attributes = style.attributes;
		if (attributes) {
			for (var a in attributes) {
				if (attributes.hasOwnProperty(a)) {
					node.setAttribute(a, attributes[a]);
				}
			}
		}
	}
	/** @private */
	function clone(obj) {
		/*Note that this code only works because of the limited types used in TextViewOptions */
		if (obj instanceof Array) {
			return obj.slice(0);
		}
		return obj;
	}
	/**	@private */
	function merge(obj1, obj2) {
		if (!obj1) {
			return obj2;
		}
		if (!obj2) {
			return obj1;
		}
		for (var p in obj2) {
			if (obj2.hasOwnProperty(p)) {
				if (!obj1.hasOwnProperty(p)) {
					obj1[p] = obj2[p];
				}
			}
		}
		return obj1;
	}
	/** @private */
	var compare = textUtil.compare;
	/** @private */
	function convertDelimiter(text, addTextFunc, addDelimiterFunc) {
		var cr = 0, lf = 0, index = 0, len = text.length;
		while (index < len) {
			if (cr !== -1 && cr <= index) { cr = text.indexOf("\r", index); } //$NON-NLS-1$
			if (lf !== -1 && lf <= index) { lf = text.indexOf("\n", index); } //$NON-NLS-1$
			var start = index, end;
			if (lf === -1 && cr === -1) {
				addTextFunc(text.substring(index));
				break;
			}
			if (cr !== -1 && lf !== -1) {
				if (cr + 1 === lf) {
					end = cr;
					index = lf + 1;
				} else {
					end = cr < lf ? cr : lf;
					index = (cr < lf ? cr : lf) + 1;
				}
			} else if (cr !== -1) {
				end = cr;
				index = cr + 1;
			} else {
				end = lf;
				index = lf + 1;
			}
			addTextFunc(text.substring(start, end));
			if (addDelimiterFunc) {
				addDelimiterFunc();
			} else {
				if (index === len) addTextFunc("");
			}
		}
	}
	/** @private */
	function getBorder(node) {
		var left,_top,right,bottom;
		var win = getWindow(node.ownerDocument);
		if (win.getComputedStyle) {
			var style = win.getComputedStyle(node, null);
			left = style.getPropertyValue("border-left-width"); //$NON-NLS-1$
			_top = style.getPropertyValue("border-top-width"); //$NON-NLS-1$
			right = style.getPropertyValue("border-right-width"); //$NON-NLS-1$
			bottom = style.getPropertyValue("border-bottom-width"); //$NON-NLS-1$
		} else if (node.currentStyle) {
			left = node.currentStyle.borderLeftWidth;
			_top = node.currentStyle.borderTopWidth;
			right = node.currentStyle.borderRightWidth;
			bottom = node.currentStyle.borderBottomWidth;
		}
		return {
			left: parseInt(left, 10) || 0,
			top: parseInt(_top, 10) || 0,
			right: parseInt(right, 10) || 0,
			bottom: parseInt(bottom, 10) || 0
		};
	}
	/** @private */
	function getPadding(node) {
		var left,_top,right,bottom;
		var win = getWindow(node.ownerDocument);
		if (win.getComputedStyle) {
			var style = win.getComputedStyle(node, null);
			left = style.getPropertyValue("padding-left"); //$NON-NLS-1$
			_top = style.getPropertyValue("padding-top"); //$NON-NLS-1$
			right = style.getPropertyValue("padding-right"); //$NON-NLS-1$
			bottom = style.getPropertyValue("padding-bottom"); //$NON-NLS-1$
		} else if (node.currentStyle) {
			left = node.currentStyle.paddingLeft;
			_top = node.currentStyle.paddingTop;
			right = node.currentStyle.paddingRight;
			bottom = node.currentStyle.paddingBottom;
		}
		return {
			left: parseInt(left, 10) || 0, 
			top: parseInt(_top, 10) || 0,
			right: parseInt(right, 10) || 0,
			bottom: parseInt(bottom, 10) || 0
		};
	}
	/** @private */
	function getLineTrim(line) {
		var trim = line._trim;
		if (!trim) {
			trim = getPadding(line);
			var border = getBorder(line);
			trim.left += border.left;
			trim.top += border.top;
			trim.right += border.right;
			trim.bottom += border.bottom;
			line._trim = trim;
		}
		return trim;
	}
	/** @private */
	function DOMReady(doc, _parent, className, callback) {
		className = "_" + className + "DOMReady"; //$NON-NLS-1$ //$NON-NLS-1$
		_parent.className = _parent.className ? _parent.className + " " + className : className; //$NON-NLS-1$
		_parent.__DOMReady = callback;
		var id = className + "Style"; //$NON-NLS-1$
		if (doc.getElementById(id)) { return; }
		var animationName = className + "Animation"; //$NON-NLS-1$
		function insertListener(evt) {
			if (evt.animationName === animationName) {
				var target = evt.target;
				if (typeof target.__DOMReady === "function") { //$NON-NLS-1$
					getWindow(doc).setTimeout(function() {
						target.__DOMReady();
					}, 0);
				}
			}
		}
		function template(className, animationName) {
			var props = ["", "-webkit-", "-moz-", "-ms-", "-o-"]; //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-4$
			var _frames = "", classRule = "body ." + className + " {\n"; //$NON-NLS-1$ //$NON-NLS-2$
			for (var i=0; i<props.length; i++) {
				_frames +=
				"@" + props[i] + "keyframes " + animationName + " {\n" + //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-1$
				"from { opacity: 0.99; }\n" + //$NON-NLS-1$
				"to { opacity: 1; }\n" + //$NON-NLS-1$
				"}\n"; //$NON-NLS-1$
				classRule +=
				props[i] + "animation-duration: 0.001s;\n" + //$NON-NLS-1$
				props[i] + "animation-name: " + animationName + ";\n"; //$NON-NLS-1$ //$NON-NLS-2$
			}
			classRule += "}"; //$NON-NLS-1$
			return _frames + classRule;
		}
		addHandler(doc, "animationstart", insertListener, false); //$NON-NLS-1$
		addHandler(doc, "MSAnimationStart", insertListener, false);  //$NON-NLS-1$
		addHandler(doc, "webkitAnimationStart", insertListener, false); //$NON-NLS-1$
		var style = doc.createElement("style"); //$NON-NLS-1$
		style.id = id;
		var head = doc.getElementsByTagName("head")[0] || doc.documentElement; //$NON-NLS-1$
		style.appendChild(doc.createTextNode(template(className, animationName)));
		head.insertBefore(style, head.firstChild);
	}
	
	var Animation = textUtil.Animation;
	
	/** 
	 * Constructs a new Selection object.
	 * 
	 * @class A Selection represents a range of selected text in the view.
	 * @name orion.editor.Selection
	 */
	function Selection (start, end, caret) {
		/**
		 * The selection start offset.
		 *
		 * @name orion.editor.Selection#start
		 */
		this.start = start;
		/**
		 * The selection end offset.
		 *
		 * @name orion.editor.Selection#end
		 */
		this.end = end;
		/** @private */
		this.caret = caret; //true if the start, false if the caret is at end
		/** @private */
		this._columnX = -1;
	}
	/** @private */
	Selection.compare = function(s1, s2) {
		if (s1.length !== s2.length) return false;
		for (var i = 0; i < s1.length; i++) {
			if (!s1[i].equals(s2[i])) return false;
		}
		return true;
	};
	Selection.editing = function(selections, back) {
		var i;
		if (back) {
			for (i = selections.length - 1; i >= 0; i--) {
				if (selections[i]._editing) return selections[i];
			}
			return selections[selections.length - 1];
		}
		for (i = 0; i < selections.length; i++) {
			if (selections[i]._editing) return selections[i];
		}
		return selections[0];
	};
	/** @private */
	Selection.convert = function(selections) {
		if (selections.length === 1) return selections[0];
		return selections;
	};
	/** @private */
	Selection.contains = function(selections, offset) {
		return selections.some(function(selection) {
			return selection.contains(offset);
		});
	};
	/** @private */
	Selection.merge = function(selections) {
		if (selections.length <= 1) return selections;
		selections.sort(function(a, b) {
			return a.start - b.start;
		});
		var result = [];
		var current = selections[0];
		for (var i = 1; i < selections.length; i++) {
			if (selections[i].start >= current.end || current._editing || selections[i]._editing) {
				result.push(current);
				current = selections[i];
			} else {
				current.end = Math.max(current.end, selections[i].end);
			}
		}
		result.push(current);
		return result;
	};
	Selection.prototype = /** @lends orion.editor.Selection.prototype */ {
		/** @private */
		clone: function() {
			var result = new Selection(this.start, this.end, this.caret);
			result._columnX = this._columnX;
			result._editing = this._editing;
			result._docX = this._docX;
			return result;
		},
		/** @private */
		contains: function(offset) {
			if (this.start <= offset && offset < this.end) {
				return true;
			}
			return false;
		},
		/** @private */
		collapse: function() {
			if (this.caret) {
				this.end = this.start;
			} else {
				this.start = this.end;
			}
		},
		/** @private */
		extend: function (offset) {
			if (this.caret) {
				this.start = offset;
			} else {
				this.end = offset;
			}
			if (this.start > this.end) {
				var tmp = this.start;
				this.start = this.end;
				this.end = tmp;
				this.caret = !this.caret;
			}
		},
		/** @private */
		setCaret: function(offset) {
			this.start = offset;
			this.end = offset;
			this.caret = false;
		},
		/** @private */
		getCaret: function() {
			return this.caret ? this.start : this.end;
		},
		/** @private */
		getAnchor: function() {
			return this.caret ? this.end : this.start;
		},
		/** @private */
		getOrientedSelection: function() {
			return {start: this.getAnchor(), end: this.getCaret()};
		},
		/** @private */
		toString: function() {
			return "start=" + this.start + " end=" + this.end + (this.caret ? " caret is at start" : " caret is at end"); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-4$
		},
		/** @private */
		isEmpty: function() {
			return this.start === this.end;
		},
		/** @private */
		equals: function(object) {
			return this.caret === object.caret && this.start === object.start && this.end === object.end && this._editing === object._editing;
		}
	};
	/** @private */
	function DOMSelection (view) {
		this._view = view;
		this._divs = [];
		var _parent = view._clipDiv || view._rootDiv;
		for (var i=0; i<3; i++) {
			var div = view._createSelectionDiv();
			_parent.appendChild(div);
			this._divs.push(div);
		}
	}
	DOMSelection.prototype = /** @lends orion.editor.DOMSelection.prototype */ {
		/** @private */
		destroy: function() {
			if (!this._divs) return;
			this._divs.forEach(function(div) {
				div.parentNode.removeChild(div);
			});
			this._divs = null;
		},
		/** @private */
		setPrimary: function(enabled) {
			this.primary = enabled;
		},
		/** @private */
		update: function() {
			var view = this._view;
			var primary = this.primary;
			var focused = view._hasFocus;
			var visible = view._cursorVisible;
			var cursor = !this.primary && this._selection && this._selection.isEmpty();
			var className;
			if (cursor) {
				className = "textviewSelectionCaret"; //$NON-NLS-1$
			} else {
				className = focused ? "textviewSelection" : "textviewSelectionUnfocused"; //$NON-NLS-1$ //$NON-NLS-2$
			}
			this._divs[0].style.visibility = (cursor && visible && focused) || !cursor ? "visible" : "hidden"; //$NON-NLS-1$ //$NON-NLS-2$
			this._divs[0].style.zIndex = visible && cursor ? "2" : "0"; //$NON-NLS-1$ //$NON-NLS-2$
			this._divs.forEach(function(div) {
				div.className = className;
				if (util.isWebkit < 537.36 && primary) {
					div.style.background = focused ? "transparent" : ""; //$NON-NLS-1$
				}
			});
		},
		/** @private */
		setSelection: function (selection) {
			this._selection = selection;
			this.update();
			var view = this._view;
			var model = view._model;
			var startLine = model.getLineAtOffset(selection.start);
			var endLine = model.getLineAtOffset(selection.end);
			var firstNode = view._getLineNext();
			/*
			* Bug in Firefox. For some reason, after a update page sometimes the 
			* firstChild returns null incorrectly. The fix is to ignore show selection.
			*/
			if (!firstNode) { return; }
			var lastNode = view._getLinePrevious();
			
			var topNode, bottomNode, topOffset, bottomOffset;
			if (startLine < firstNode.lineIndex) {
				topNode = firstNode;
				topOffset = model.getLineStart(firstNode.lineIndex);
			} else if (startLine > lastNode.lineIndex) {
				topNode = lastNode;
				topOffset = model.getLineStart(lastNode.lineIndex);
			} else {
				topNode = view._getLineNode(startLine);
				topOffset = selection.start;
			}

			if (endLine < firstNode.lineIndex) {
				bottomNode = firstNode;
				bottomOffset = model.getLineStart(firstNode.lineIndex);
			} else if (endLine > lastNode.lineIndex) {
				bottomNode = lastNode;
				bottomOffset = model.getLineStart(lastNode.lineIndex);
			} else {
				bottomNode = view._getLineNode(endLine);
				bottomOffset = selection.end;
			}
			this._setDOMSelection(topNode, topOffset, bottomNode, bottomOffset, selection.caret);
		},
		/** @private */
		_setDOMSelection: function (startNode, startOffset, endNode, endOffset, startCaret) {
			this._setDOMFullSelection(startNode, startOffset, endNode, endOffset);
			if (!this.primary) { return; }
			var view = this._view;
			var start = startNode._line.getNodeOffset(startOffset);
			var end = endNode._line.getNodeOffset(endOffset);
			if (!start.node || !end.node) return;
			var range;
			var win = view._getWindow();
			var doc = view._parent.ownerDocument;
			if (win.getSelection) {
				//W3C
				var sel = win.getSelection();
				range = doc.createRange();
				range.setStart(start.node, start.offset);
				range.setEnd(end.node, end.offset);
				if (view._hasFocus && (
					sel.anchorNode !== start.node || sel.anchorOffset !== start.offset ||
					sel.focusNode !== end.node || sel.focusOffset !== end.offset ||
					sel.anchorNode !== end.node || sel.anchorOffset !== end.offset ||
					sel.focusNode !== start.node || sel.focusOffset !== start.offset))
				{
					view._anchorNode = start.node;
					view._anchorOffset = start.offset;
					view._focusNode = end.node;
					view._focusOffset = end.offset;
					view._ignoreSelect = false;
					if (sel.rangeCount > 0) { sel.removeAllRanges(); }
					sel.addRange(range);
					view._ignoreSelect = true;
				}
				if (view._cursorDiv) {
					range = doc.createRange();
					if (startCaret) {
						range.setStart(start.node, start.offset);
						range.setEnd(start.node, start.offset);
					} else {
						range.setStart(end.node, end.offset);
						range.setEnd(end.node, end.offset);
					}
					var rect = range.getClientRects()[0];
					var cursorParent = view._cursorDiv.parentNode;
					var clientRect = cursorParent.getBoundingClientRect();
					if (rect && clientRect) {
						view._cursorDiv.style.top = (rect.top - clientRect.top + cursorParent.scrollTop) + "px"; //$NON-NLS-1$
						view._cursorDiv.style.left = (rect.left - clientRect.left + cursorParent.scrollLeft) + "px"; //$NON-NLS-1$
					}
				}
			} else if (doc.selection) {
				if (!view._hasFocus) { return; }
				//IE < 9
				var body = doc.body;

				/*
				* Bug in IE. For some reason when text is deselected the overflow
				* selection at the end of some lines does not get redrawn.  The
				* fix is to create a DOM element in the body to force a redraw.
				*/
				var child = util.createElement(doc, "div"); //$NON-NLS-1$
				body.appendChild(child);
				body.removeChild(child);
				
				range = body.createTextRange();
				range.moveToElementText(start.node.parentNode);
				range.moveStart("character", start.offset); //$NON-NLS-1$
				var endRange = body.createTextRange();
				endRange.moveToElementText(end.node.parentNode);
				endRange.moveStart("character", end.offset); //$NON-NLS-1$
				range.setEndPoint("EndToStart", endRange); //$NON-NLS-1$
				view._ignoreSelect = false;
				range.select();
				view._ignoreSelect = true;
			}
		},
		/** @private */
		_setDOMFullSelection: function(startNode, startOffset, endNode, endOffset) {
			this._divs.forEach(function(div) {
				div.style.width = div.style.height = "0px"; //$NON-NLS-1$
			});
			var view = this._view;
			if (!view._fullSelection) { return; }
			if (util.isIOS) { return; }
			if (startNode === endNode && startOffset === endOffset && this.primary) { return; }
			var viewPad = view._getViewPadding();
			var clientRect = view._clientDiv.getBoundingClientRect();
			var viewRect = view._viewDiv.getBoundingClientRect();
			var left = viewRect.left + viewPad.left;
			var right = clientRect.right;
			var _top = viewRect.top + viewPad.top;
			var bottom = clientRect.bottom;
			var hd = 0, vd = 0;
			if (view._clipDiv) {
				var clipRect = view._clipDiv.getBoundingClientRect();
				hd = clipRect.left - view._clipDiv.scrollLeft;
				vd = clipRect.top;
			} else {
				var rootpRect = view._rootDiv.getBoundingClientRect();
				hd = rootpRect.left;
				vd = rootpRect.top;
			}
			view._ignoreDOMSelection = true;
			var startLine = new TextLine(view, startNode.lineIndex, startNode);
			var startRect = startLine.getBoundingClientRect(startOffset, false);
			var l = startRect.left, endLine, endRect;
			if (startNode === endNode && startOffset === endOffset) {
				endLine = startLine;
				endRect = startRect;
			} else {
				endLine = new TextLine(view, endNode.lineIndex, endNode);
				endRect = endLine.getBoundingClientRect(endOffset, false);
			}
			var r = endRect.left;
			view._ignoreDOMSelection = false;
			var sel1Div = this._divs[0];
			var sel1Left = Math.min(right, Math.max(left, l));
			var sel1Top = Math.min(bottom, Math.max(_top, startRect.top));
			var sel1Right = right;
			var sel1Bottom = Math.min(bottom, Math.max(_top, startRect.bottom));
			sel1Div.style.left = (sel1Left - hd) + "px"; //$NON-NLS-1$
			sel1Div.style.top = (sel1Top - vd) + "px"; //$NON-NLS-1$
			sel1Div.style.width = Math.max(0, sel1Right - sel1Left) + "px"; //$NON-NLS-1$
			sel1Div.style.height = Math.max(0, sel1Bottom - sel1Top) + "px"; //$NON-NLS-1$
			if (startNode.lineIndex === endNode.lineIndex) {
				sel1Right = Math.min(r, right);
				sel1Div.style.width = Math.max(this.primary ? 0 : 1, sel1Right - sel1Left) + "px"; //$NON-NLS-1$
			} else {
				var sel3Left = left;
				var sel3Top = Math.min(bottom, Math.max(_top, endRect.top));
				var sel3Right = Math.min(right, Math.max(left, r));
				var sel3Bottom = Math.min(bottom, Math.max(_top, endRect.bottom));
				var sel3Div = this._divs[2];
				sel3Div.style.left = (sel3Left - hd) + "px"; //$NON-NLS-1$
				sel3Div.style.top = (sel3Top - vd) + "px"; //$NON-NLS-1$
				sel3Div.style.width = Math.max(0, sel3Right - sel3Left) + "px"; //$NON-NLS-1$
				sel3Div.style.height = Math.max(0, sel3Bottom - sel3Top) + "px"; //$NON-NLS-1$
				if (Math.abs(startNode.lineIndex - endNode.lineIndex) > 1) {
					var sel2Div = this._divs[1];
					sel2Div.style.left = (left - hd)  + "px"; //$NON-NLS-1$
					sel2Div.style.top = (sel1Bottom - vd) + "px"; //$NON-NLS-1$
					sel2Div.style.width = Math.max(0, right - left) + "px"; //$NON-NLS-1$
					sel2Div.style.height = Math.max(0, sel3Top - sel1Bottom) + "px"; //$NON-NLS-1$
				}
			}
		}
	};
	/** @private */
	function TextRect (rect) {
		this.left = rect.left;
		this.top = rect.top;
		this.right = rect.right;
		this.bottom = rect.bottom;
	}
	TextRect.prototype = /** @lends orion.editor.TextRect.prototype */ {
		/** @private */
		toString: function() {
			return "{l=" + this.left + ", t=" + this.top + ", r=" + this.right + ", b=" + this.bottom + "}"; //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-1$
		}
	};
	/** 
	 * Constructs a new TextLine object.
	 * 
	 * @class A TextLine represents a line of text in the view.
	 * @name orion.editor.TextLine
	 * @private
	 */
	function TextLine (view, lineIndex, lineDiv) {
		/**
		 * The view.
		 *
		 * @name orion.editor.TextLine#view
		 * @private
		 */
		this.view = view;
		/**
		 * The line index.
		 *
		 * @name orion.editor.TextLine#lineIndex
		 * @private
		 */
		this.lineIndex = lineIndex;
		
		this._lineDiv = lineDiv;
	}
	TextLine.prototype = /** @lends orion.editor.TextLine.prototype */ {
		/** @private */
		create: function(_parent, div, drawing) {
			if (this._lineDiv) { return; }
			this.drawing = drawing;
			var child = this._lineDiv = this._createLine(_parent, div, this.lineIndex);
			child._line = this;
			return child;
		},
		_createLine: function(_parent, div, lineIndex) {
			var view = this.view;
			var model = view._model;
			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var e = {type:"LineStyle", textView: view, lineIndex: lineIndex, lineText: lineText, lineStart: lineStart}; //$NON-NLS-1$
			view.onLineStyle(e);
			var doc = _parent.ownerDocument;
			var lineDiv = div || util.createElement(doc, "div"); //$NON-NLS-1$
			if (!div || !compare(div.viewStyle, e.style)) {
				applyStyle(e.style, lineDiv, div);
				if (div) { div._trim = null; }
				lineDiv.viewStyle = e.style;
			}
			lineDiv.lineIndex = lineIndex;
			
			if (div && lineDiv.viewLineText === lineText && compare(e.ranges, lineDiv.viewRanges)) {
				return lineDiv;
			}
			lineDiv.viewRanges = e.ranges;
			lineDiv.viewLineText = lineText;
			
			var ranges = [];
			var data = {tabOffset: 0, ranges: ranges};
			this._createRanges(e.ranges, lineText, 0, lineText.length, lineStart, data);
			
			/*
			* A trailing span with a whitespace is added for three different reasons:
			* 1. Make sure the height of each line is the largest of the default font
			* in normal, italic, bold, and italic-bold.
			* 2. When full selection is off, Firefox, Opera and IE9 do not extend the 
			* selection at the end of the line when the line is fully selected. 
			* 3. The height of a div with only an empty span is zero.
			*/
			var c = " "; //$NON-NLS-1$
			if (!view._fullSelection && util.isIE < 9) {
				/* 
				* IE8 already selects extra space at end of a line fully selected,
				* adding another space at the end of the line causes the selection 
				* to look too big. The fix is to use a zero-width space (\uFEFF) instead. 
				*/
				c = "\uFEFF"; //$NON-NLS-1$
			}
			var range = {text: c, style: view._metrics.largestFontStyle, ignoreChars: 1};
			if (ranges.length === 0 || !ranges[ranges.length - 1].style || ranges[ranges.length - 1].style.tagName !== "div") { //$NON-NLS-1$
				ranges.push(range);
			} else {
				ranges.splice(ranges.length - 1, 0, range);
			}
		
			var span, style, oldSpan, oldStyle, text, oldText, end = 0, oldEnd = 0, next, i;
			if (util.isFirefox && lineText.length > 2000) {
				if (div) {
					lineDiv.innerHTML = "";
					div.lineWidth = undefined;
				}
				var frag = doc.createDocumentFragment();
				for (i = 0; i < ranges.length; i++) {
					range = ranges[i];
					text = range.text;
					style = range.style;
					span = this._createSpan(lineDiv, text, style, range.ignoreChars);
					frag.appendChild(span);
				}
				lineDiv.appendChild(frag);
			} else {
				var changeCount, changeStart;
				if (div) {
					var modelChangedEvent = div.modelChangedEvent;
					if (modelChangedEvent) {
						if (modelChangedEvent.removedLineCount === 0 && modelChangedEvent.addedLineCount === 0) {
							changeStart = modelChangedEvent.start - lineStart;
							changeCount = modelChangedEvent.addedCharCount - modelChangedEvent.removedCharCount;
						} else {
							changeStart = -1;
						}
						div.modelChangedEvent = undefined;
					}
					oldSpan = div.firstChild;
				}
				for (i = 0; i < ranges.length; i++) {
					range = ranges[i];
					text = range.text;
					end += text.length;
					style = range.style;
					if (oldSpan) {
						oldText = oldSpan.firstChild.data;
						oldStyle = oldSpan.viewStyle;
						if (oldText === text && compare(style, oldStyle)) {
							oldEnd += oldText.length;
							oldSpan._rectsCache = undefined;
							span = oldSpan = oldSpan.nextSibling;
							continue;
						} else {
							while (oldSpan) {
								if (changeStart !== -1) {
									var spanEnd = end;
									if (spanEnd >= changeStart) {
										spanEnd -= changeCount;
									}
									var t = oldSpan.firstChild.data;
									var len = t ? t.length : 0;
									if (oldEnd + len > spanEnd) { break; }
									oldEnd += len;
								}
								next = oldSpan.nextSibling;
								lineDiv.removeChild(oldSpan);
								oldSpan = next;
							}
						}
					}
					span = this._createSpan(lineDiv, text, style, range.ignoreChars);
					if (oldSpan) {
						lineDiv.insertBefore(span, oldSpan);
					} else {
						lineDiv.appendChild(span);
					}
					if (div) {
						div.lineWidth = undefined;
					}
				}
				if (div) {
					var tmp = span ? span.nextSibling : null;
					while (tmp) {
						next = tmp.nextSibling;
						div.removeChild(tmp);
						tmp = next;
					}
				}
			}
			if (!lineDiv.parentNode) {
				_parent.appendChild(lineDiv);
			}
			return lineDiv;
		},
		_createRanges: function(ranges, text, start, end, lineStart, data) {
			if (start > end) { return; }
			if (ranges) {
				for (var i = 0; i < ranges.length; i++) {
					var range = ranges[i];
					if (range.end < lineStart + start) { continue; }
					var styleStart = Math.max(lineStart + start, range.start) - lineStart;
					if (styleStart > end) { break; }
					var styleEnd = Math.min(lineStart + end, range.end) - lineStart;
					if (styleStart <= styleEnd) {
						styleStart = Math.max(start, styleStart);
						styleEnd = Math.min(end, styleEnd);
						if (start < styleStart) {
							this._createRange(text, start, styleStart, null, data);
						}
						if (!range.style || !range.style.unmergeable) {
							while (i + 1 < ranges.length && ranges[i + 1].start - lineStart === styleEnd && compare(range.style, ranges[i + 1].style)) {
								range = ranges[i + 1];
								styleEnd = Math.min(lineStart + end, range.end) - lineStart;
								i++;
							}
						}
						this._createRange(text, styleStart, styleEnd, range.style, data);
						start = styleEnd;
					}
				}
			}
			if (start < end) {
				this._createRange(text, start, end, null, data);
			}
		},
		_createRange: function(text, start, end, style, data) {
			if (start > end) { return; }
			var tabSize = this.view._customTabSize, range;
			var bidiStyle = {tagName:"span", bidi:true, style:{unicodeBidi:"embed", direction:"ltr"}};
			var bidiRange = {text: "\u200E", style: bidiStyle}; // We ensure segments flow from left to right by adding a LRM marker \u200E
			if (tabSize && tabSize !== 8) {
				var tabIndex = text.indexOf("\t", start); //$NON-NLS-1$
				while (tabIndex !== -1 && tabIndex < end) {
					if (start < tabIndex) {
						range = {text: text.substring(start, tabIndex), style: style};
						range = bidiUtils.enforceTextDir(range);
						data.ranges.push(range);
						if (bidiUtils.isBidiEnabled()) {
							data.ranges.push(bidiRange);
						}
						data.tabOffset += range.text.length;
					}
					var spacesCount = tabSize - (data.tabOffset % tabSize);
					if (spacesCount > 0) {
						//TODO hack to preserve tabs in getDOMText()
						var spaces = "\u00A0"; //$NON-NLS-1$
						for (var i = 1; i < spacesCount; i++) {
							spaces += " "; //$NON-NLS-1$
						}
						range = {text: spaces, style: style, ignoreChars: spacesCount - 1};
						data.ranges.push(range);
						if (bidiUtils.isBidiEnabled()) {
							data.ranges.push(bidiRange);
						}
						data.tabOffset += range.text.length;
					}
					start = tabIndex + 1;
					if (start === end) {
						return;
					}
					tabIndex = text.indexOf("\t", start); //$NON-NLS-1$
				}
			}
			if (start <= end) {
				range = {text: text.substring(start, end), style: style};
				range = bidiUtils.enforceTextDir(range);
				data.ranges.push(range);
				if (bidiUtils.isBidiEnabled()) {
					data.ranges.push(bidiRange);
				}
				data.tabOffset += range.text.length;
			}
		},
		_createSpan: function(_parent, text, style, ignoreChars) {
			var view = this.view;
			var tagName = "span"; //$NON-NLS-1$
			if (style && style.tagName) {
				tagName = style.tagName.toLowerCase();
			}
			var isLink = tagName === "a"; //$NON-NLS-1$
			if (isLink) { this.hasLink = true; }
			if (isLink && !view._linksVisible) {
				tagName = "span"; //$NON-NLS-1$
			}
			var doc = _parent.ownerDocument;
			var child = util.createElement(_parent.ownerDocument, tagName);
			child.appendChild(doc.createTextNode(style && style.text ? style.text : text));
			if (style && style.html) {
				child.innerHTML = style.html;
				child.ignore = true;
			} else if (style && style.node) {
				if (this.drawing) {
					child.appendChild(style.node);
				} else {
					child.appendChild(style.node.cloneNode(true));
				}
				child.ignore = true;
			} else if (style && style.bidi) {				
				child.ignore = true;
			}
			applyStyle(style, child);
			if (tagName === "a") { //$NON-NLS-1$
				var win = view._getWindow();
				addHandler(child, "click", function(e) { return view._handleLinkClick(e ? e : win.event); }, false); //$NON-NLS-1$
			}
			child.viewStyle = style;
			if (ignoreChars) {
				child.ignoreChars = ignoreChars;
			}
			return child;
		},
		_ensureCreated: function() {
			if (this._lineDiv) { return this._lineDiv; }
			return (this._createdDiv = this.create(this.view._clientDiv, null));
		},
		/** @private */
		getBoundingClientRect: function(offset, absolute) {
			var child = this._ensureCreated();
			var view = this.view;
			if (offset === undefined) {
				return this._getLineBoundingClientRect(child, true);
			}
			var model = view._model;
			var doc = child.ownerDocument;
			var lineIndex = this.lineIndex;
			var result = null;
			if (offset < model.getLineEnd(lineIndex)) {
				var lineOffset = model.getLineStart(lineIndex);
				this.forEach(function(lineChild) {
					var textNode = lineChild.firstChild;
					var nodeLength = this._nodeLength(lineChild); 
					if (lineOffset + nodeLength > offset) {
						var index = offset - lineOffset;
						var range;
						if (textNode.length === 1) {
							result = new TextRect(lineChild.getBoundingClientRect());
						} else if (view._isRangeRects) {
							range = doc.createRange();
							range.setStart(textNode, index);
							range.setEnd(textNode, index + 1);
							result = new TextRect(range.getBoundingClientRect());
						} else if (util.isIE) {
							range = doc.body.createTextRange();
							range.moveToElementText(lineChild);
							range.collapse();
							/*
							* Bug in IE8. TextRange.getClientRects() and TextRange.getBoundingClientRect() fails
							* if the line child is not the first element in the line and if the start offset is 0. 
							* The fix is to use Node.getClientRects() left edge instead.
							*/
							var fixIE8 = index === 0 && util.isIE === 8;
							if (fixIE8) { index = 1; }
							range.moveEnd("character", index + 1); //$NON-NLS-1$
							range.moveStart("character", index); //$NON-NLS-1$
							result = new TextRect(range.getBoundingClientRect());
							if (fixIE8) {
								result.left = lineChild.getClientRects()[0].left;
							}
						} else {
							var text = textNode.data;
							lineChild.removeChild(textNode);
							lineChild.appendChild(doc.createTextNode(text.substring(0, index)));
							var span = util.createElement(doc, "span"); //$NON-NLS-1$
							span.appendChild(doc.createTextNode(text.substring(index, index + 1)));
							lineChild.appendChild(span);
							lineChild.appendChild(doc.createTextNode(text.substring(index + 1)));
							result = new TextRect(span.getBoundingClientRect());
							lineChild.innerHTML = "";
							lineChild.appendChild(textNode);
							if (!this._createdDiv) {
								/*
								 * Removing the element node that holds the selection start or end
								 * causes the selection to be lost. The fix is to detect this case
								 * and restore the selection. 
								 */
								var s = view._getSelections()[0];
								if ((lineOffset <= s.start && s.start < lineOffset + nodeLength) ||  (lineOffset <= s.end && s.end < lineOffset + nodeLength)) {
									view._updateDOMSelection();
								}
							}
						}
						if (util.isIE < 11) {
							var win = getWindow(child.ownerDocument);
							var xFactor = win.screen.logicalXDPI / win.screen.deviceXDPI;
							var yFactor = win.screen.logicalYDPI / win.screen.deviceYDPI;
							result.left = result.left * xFactor;
							result.right = result.right * xFactor;
							result.top = result.top * yFactor;
							result.bottom = result.bottom * yFactor;
						}
						return false;
					}
					lineOffset += nodeLength;
					return true;
				});
			}
			var rect = this.getBoundingClientRect();
			if (!result) {
				if (view._wrapMode) {
					var rects = this.getClientRects();
					result = rects[rects.length - 1];
					result.left = result.right;
					result.left += rect.left;
					result.top += rect.top;
					result.right += rect.left;
					result.bottom += rect.top;
				} else {
					result = new TextRect(rect);
					result.left = result.right;
				}
			}
			if (absolute || absolute === undefined) {
				result.left -= rect.left;
				result.top -= rect.top;
				result.right -= rect.left;
				result.bottom -= rect.top;
			}
			return result;
		},
		forEach: function(callback) {
			var child = this._ensureCreated();
			var lineChild = child.firstChild;
			while (lineChild) {
				var next = lineChild.nextSibling;
				if (!lineChild.ignore) {
					if (!callback.call(this, lineChild)) {
						break;
					}
				}
				lineChild = next;
			}
		},
		/** @private */
		_getClientRects: function(element, parentRect) {
			var rects, newRects, rect, i;
			if (!element._rectsCache) {
				rects = element.getClientRects();
				newRects = newArray(rects.length);
				for (i = 0; i<rects.length; i++) {
					rect = newRects[i] = new TextRect(rects[i]);
					rect.left -= parentRect.left;
					rect.top -= parentRect.top;
					rect.right -= parentRect.left;
					rect.bottom -= parentRect.top;
				}
				element._rectsCache = newRects;
			}
			rects = element._rectsCache;
			newRects = [rects.length];
			for (i = 0; i<rects.length; i++) {
				newRects[i] = new TextRect(rects[i]);
			}
			return newRects;
		},
		getClientRects: function(lineIndex) {
			if (!this.view._wrapMode) { return [this.getBoundingClientRect()]; }
			var child = this._ensureCreated();
			//TODO [perf] cache rects
			var result = [];
			var parentRect = child.getBoundingClientRect();
			this.forEach(function(lineChild) {
				var rects = this._getClientRects(lineChild, parentRect);
				for (var i = 0; i < rects.length; i++) {
					var rect = rects[i], j, r;
					if (rect.top === rect.bottom) { continue; }
					var center = rect.top + (rect.bottom - rect.top) / 2;
					for (j = 0; j < result.length; j++) {
						r = result[j];
						if ((r.top <= center && center < r.bottom)) {
							break;
						}
					}
					if (j === result.length) {
						result.push(rect);
					} else {
						if (rect.left < r.left) { r.left = rect.left; }
						if (rect.top < r.top) { r.top = rect.top; }
						if (rect.right > r.right) { r.right = rect.right; }
						if (rect.bottom > r.bottom) { r.bottom = rect.bottom; }
					}
				}
				return true;
			});
			if (lineIndex !== undefined) {
				return result[lineIndex];
			}
			return result;
		},
		/** @private */
		_getLineBoundingClientRect: function (child, noTrim) {
			var rect = new TextRect(child.getBoundingClientRect());
			if (this.view._wrapMode) {
			} else {
				rect.right = rect.left;
				var lastChild = child.lastChild;
				//Remove any artificial trailing whitespace in the line
				while (lastChild && lastChild.ignoreChars === lastChild.firstChild.length) {
					lastChild = lastChild.previousSibling;
				}
				if (lastChild) {
					var lastRect = lastChild.getBoundingClientRect();
					rect.right = lastRect.right + getLineTrim(child).right;
				}
			}
			if (noTrim) {
				var padding = getLineTrim(child);
				rect.left = rect.left + padding.left;
				rect.right = rect.right - padding.right;
			}
			return rect;
		},
		/** @private */
		getLineCount: function () {
			if (!this.view._wrapMode) { return 1; }
			return this.getClientRects().length;
		},
		/** @private */
		getLineIndex: function(offset) {
			if (!this.view._wrapMode) { return 0; }
			var rects = this.getClientRects();
			var rect = this.getBoundingClientRect(offset);
			var center = rect.top + ((rect.bottom - rect.top) / 2);
			for (var i = 0; i < rects.length; i++) {
				if (rects[i].top <= center && center < rects[i].bottom) {
					return i;
				}
			}
			return rects.length - 1;
		},
		/** @private */
		getLineStart: function (lineIndex) {
			if (!this.view._wrapMode || lineIndex === 0) {
				return this.view._model.getLineStart(this.lineIndex);
			}
			var rects = this.getClientRects();
			return this.getOffset(rects[lineIndex].left + 1, rects[lineIndex].top + 1);
		},
		_nodeLength: function(lineChild) {
			if (!lineChild || lineChild.ignore) return 0;
			var len = lineChild.firstChild.length; 
			if (lineChild.ignoreChars) {
				len -= lineChild.ignoreChars;
			}
			return len;
		},
		getModelOffset: function(node, offset) {
			if (!node) { return 0; }
			var lineOffset = 0;
			this.forEach(function(lineChild) {
				var textNode = lineChild.firstChild;
				if (textNode === node) {
					if (lineChild.ignoreChars) { lineOffset -= lineChild.ignoreChars; }
					lineOffset += offset;
					return false;
				}
				if (lineChild.ignoreChars) { lineOffset -= lineChild.ignoreChars; }
				lineOffset += textNode.data.length;
				return true;
			});
			return Math.max(0, lineOffset) + this.view._model.getLineStart(this.lineIndex);
		},
		getNodeOffset: function(modelOffset) {
			var offset = 0;
			var lineNode, lineNodeOffset;
			var model = this.view._model;
			var lineStart = model.getLineStart(this.lineIndex);
			var lineOffset = modelOffset - lineStart;
			var end = model.getLineEnd(this.lineIndex) - lineStart;
			this.forEach(function(lineChild) {
				var node = lineChild.firstChild;
				var nodeLength = this._nodeLength(lineChild);
				if (nodeLength + offset > lineOffset || offset + nodeLength >= end) {
					lineNode = node;
					lineNodeOffset = lineOffset - offset;
					if (lineChild.ignoreChars && nodeLength > 0 && lineNodeOffset === nodeLength) {
						lineNodeOffset += lineChild.ignoreChars; 
					}
					return false;
				}
				offset += nodeLength;
				return true;
			});
			return {node: lineNode, offset: lineNodeOffset};
		},
		getText: function(offsetNode) {
			var text = "", offset = 0;
			this.forEach(function(lineChild) {
				var textNode;
				if (lineChild.ignoreChars) {
					textNode = lineChild.lastChild;
					var ignored = 0, childText = [], childOffset = -1;
					while (textNode) {
						var data = textNode.data;
						if (data) {
							for (var i = data.length - 1; i >= 0; i--) {
								var ch = data.substring(i, i + 1);
								if (ignored < lineChild.ignoreChars && (ch === " " || ch === "\uFEFF")) { //$NON-NLS-1$ //$NON-NLS-1$
									ignored++;
								} else {
									childText.push(ch === "\u00A0" ? "\t" : ch); //$NON-NLS-1$ //$NON-NLS-1$
								}
							}
						}
						if (offsetNode === textNode) {
							childOffset = childText.length;
						}
						textNode = textNode.previousSibling;
					}
					childText = childText.reverse().join("");
					if (childOffset !== -1) {
						offset = text.length + childText.length - childOffset;
					}
					text += childText;
				} else {
					textNode = lineChild.firstChild;
					while (textNode) {
						if (offsetNode === textNode) {
							offset = text.length;
						}
						text += textNode.data;
						textNode = textNode.nextSibling;
					}
				}
				return true;
			});
			return {text: text, offset: offset};
		},
		/** @private */
		getOffset: function(x, y) {
			var view = this.view;
			var model = view._model;
			var lineIndex = this.lineIndex;
			var lineStart = model.getLineStart(lineIndex);
			var lineEnd = model.getLineEnd(lineIndex);
			if (lineStart === lineEnd) {
				return lineStart;
			}
			var child = this._ensureCreated();
			var lineRect = this.getBoundingClientRect();
			
			var that = this;
			function hitChild(lineChild, offset, rect) {
				var textNode = lineChild.firstChild;
				var nodeLength = that._nodeLength(lineChild);
				var doc = child.ownerDocument;
				var win = getWindow(doc);
				var xFactor = util.isIE < 11 ? win.screen.logicalXDPI / win.screen.deviceXDPI : 1;
				var yFactor = util.isIE < 11 ? win.screen.logicalYDPI / win.screen.deviceYDPI : 1;
				var rangeLeft, rangeTop, rangeRight, rangeBottom;
				var range, start, end;
				var rl = rect.left + lineRect.left, fixIE8, rects1;
				if (util.isIE || view._isRangeRects) {
					range = view._isRangeRects ? doc.createRange() : doc.body.createTextRange();
					var high = nodeLength;
					var low = -1;
					while ((high - low) > 1) {
						var mid = Math.floor((high + low) / 2);
						start = low + 1;
						end = mid === nodeLength - 1 && lineChild.ignoreChars ? textNode.length : mid + 1;
						/*
						* Bug in IE8. TextRange.getClientRects() and TextRange.getBoundingClientRect() fails
						* if the line child is not the first element in the line and if the start offset is 0. 
						* The fix is to use Node.getClientRects() left edge instead.
						*/
						fixIE8 = start === 0 && util.isIE === 8;
						if (view._isRangeRects) {
							range.setStart(textNode, start);
							range.setEnd(textNode, end);
						} else {
							if (fixIE8) { start = 1; } 
							range.moveToElementText(lineChild);
							range.move("character", start); //$NON-NLS-1$
							range.moveEnd("character", end - start); //$NON-NLS-1$
						}
						rects1 = range.getClientRects();
						var found = false;
						for (var k = 0; k < rects1.length; k++) {
							rect = rects1[k];
							rangeLeft = (fixIE8 ? rl : rect.left) * xFactor - lineRect.left;
							rangeRight = rect.right * xFactor - lineRect.left;
							rangeTop = rect.top * yFactor - lineRect.top;
							rangeBottom = rect.bottom * yFactor - lineRect.top;
							if (rangeLeft <= x && x < rangeRight && (!view._wrapMode || (rangeTop <= y && y <= rangeBottom))) {
								found = true;
								break;
							}
						}
						if (found) {
							high = mid;
						} else {
							low = mid;
						}
					}
					offset += high;
					start = high;
					end = high === nodeLength - 1 && lineChild.ignoreChars ? textNode.length : Math.min(high + 1, textNode.length);
					if (view._isRangeRects) {
						range.setStart(textNode, start);
						range.setEnd(textNode, end);
					} else {
						range.moveToElementText(lineChild);
						range.move("character", start); //$NON-NLS-1$
						range.moveEnd("character", end - start); //$NON-NLS-1$
					}
					rects1 = range.getClientRects();
					var trailing = false;
					if (rects1.length > 0) {
						rect = rects1[0];
						rangeLeft = (fixIE8 ? rl : rect.left) * xFactor - lineRect.left;
						rangeRight = rect.right * xFactor - lineRect.left;
						//TODO test for character trailing (wrong for bidi)
						trailing = x > (rangeLeft + (rangeRight - rangeLeft) / 2);
					}
					// Handle Unicode surrogates
					var offsetInLine = offset - lineStart;
					var lineText = model.getLine(lineIndex);
					var c = lineText.charCodeAt(offsetInLine);
					if (0xD800 <= c && c <= 0xDBFF && trailing) {
						if (offsetInLine < lineText.length) {
							c = lineText.charCodeAt(offsetInLine + 1);
							if (0xDC00 <= c && c <= 0xDFFF) {
								offset += 1;
							}
						}
					} else if (0xDC00 <= c && c <= 0xDFFF && !trailing) {
						if (offsetInLine > 0) {
							c = lineText.charCodeAt(offsetInLine - 1);
							if (0xD800 <= c && c <= 0xDBFF) {
								offset -= 1;
							}
						}
					}
					if (trailing) {
						offset++;
					}
				} else {
					var newText = [];
					for (var q = 0; q < nodeLength; q++) {
						newText.push("<span>"); //$NON-NLS-1$
						if (q === nodeLength - 1) {
							newText.push(textNode.data.substring(q));
						} else {
							newText.push(textNode.data.substring(q, q + 1));
						}
						newText.push("</span>"); //$NON-NLS-1$
					}
					lineChild.innerHTML = newText.join("");
					var rangeChild = lineChild.firstChild;
					while (rangeChild) {
						rect = rangeChild.getBoundingClientRect();
						rangeLeft = rect.left - lineRect.left;
						rangeRight = rect.right - lineRect.left;
						if (rangeLeft <= x && x < rangeRight) {
							//TODO test for character trailing (wrong for bidi)
							if (x > rangeLeft + (rangeRight - rangeLeft) / 2) {
								offset++;
							}
							break;
						}
						offset++;
						rangeChild = rangeChild.nextSibling;
					}
					if (!that._createdDiv) {
						lineChild.innerHTML = "";
						lineChild.appendChild(textNode);
						/*
						 * Removing the element node that holds the selection start or end
						 * causes the selection to be lost. The fix is to detect this case
						 * and restore the selection. 
						 */
						var s = view._getSelections()[0];
						if ((offset <= s.start && s.start < offset + nodeLength) || (offset <= s.end && s.end < offset + nodeLength)) {
							view._updateDOMSelection();
						}
					}
				}
				return offset;
			}
			
			var rects, rect;
			if (view._wrapMode) {
				rects = this.getClientRects();
				if (y < rects[0].top) {
					y = rects[0].top;
				}
				for (var i = 0; i < rects.length; i++) {
					rect = rects[i];
					if (rect.top <= y && y < rect.bottom) {
						break;
					}
				}
				if (x < rect.left) { x = rect.left; }
				if (x > rect.right) { x = rect.right - 1; }
			} else {
				if (x < 0) { x = 0; }
				if (x > (lineRect.right - lineRect.left)) { x = lineRect.right - lineRect.left; }
			}
			
			function hitRects(child) {
				if (child.ignore) return null;
				var rects1 = that._getClientRects(child, lineRect);
				for (var j = 0; j < rects1.length; j++) {
					var rect1 = rects1[j];
					if (rect1.left <= x && x < rect1.right && (!view._wrapMode || (rect1.top <= y && y <= rect1.bottom))) {
						return rect1;
					}
				}
				return null;
			}
			
			var offset, lineChild;
			if (this._lastHitChild && this._lastHitChild.parentNode) {
				// Search last hit child first, then search around the last hit child
				offset = this._lastHitOffset;
				lineChild = this._lastHitChild;
				rect = hitRects(lineChild);
				if (!rect ) {
					var previousOffset = offset, nextOffset = offset + this._nodeLength(lineChild);
					var previousChild = lineChild.previousSibling, nextChild = lineChild.nextSibling;
					while (previousChild || nextChild) {
						if (previousChild) {
							previousOffset -= this._nodeLength(previousChild);
							if ((rect = hitRects(previousChild))) {
								lineChild = previousChild;
								offset = previousOffset;
								break;
							}
							previousChild = previousChild.previousSibling;
						}
						if (nextChild) {
							if ((rect = hitRects(nextChild))) {
								lineChild = nextChild;
								offset = nextOffset;
								break;
							}
							nextOffset += this._nodeLength(nextChild);
							nextChild = nextChild.nextSibling;
						}
					}
				}
			} else {
				// Start searching from the beginning of the line
				offset = lineStart;
				this.forEach(function(c) {
					lineChild = c;
					if ((rect = hitRects(lineChild))) {
						return false;
					}
					offset += this._nodeLength(lineChild);
					return true;
				});
			}
			
			if (lineChild && rect) {
				// Cache the last hit child
				this._lastHitChild = lineChild;
				this._lastHitOffset = offset;

				offset = hitChild(lineChild, offset, rect);
			}

			return Math.min(lineEnd, Math.max(lineStart, offset));
		},
		/** @private */
		getNextOffset: function (offset, data) {
			if (data.unit === "line") { //$NON-NLS-1$
				var view = this.view;
				var model = view._model;
				var lineIndex = model.getLineAtOffset(offset);
				if (data.count > 0) {
					data.count--;
					return model.getLineEnd(lineIndex);
				}
				data.count++;
				return model.getLineStart(lineIndex);
			}
			if (data.unit === "wordend" || data.unit === "wordWS" || data.unit === "wordendWS") { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-1$
				return this._getNextOffset_W3C(offset, data);
			}
			return util.isIE ? this._getNextOffset_IE(offset, data) : this._getNextOffset_W3C(offset, data);
		},
		/** @private */
		_getNextOffset_W3C: function (offset, data) {
			function _isPunctuation(c) {
				return (33 <= c && c <= 47) || (58 <= c && c <= 64) || (91 <= c && c <= 94) || c === 96 || (123 <= c && c <= 126);
			}
			function _isWhitespace(c) {
				return c === 32 || c === 9;
			}
			var view = this.view;
			var model = view._model;
			var lineIndex = model.getLineAtOffset(offset);
			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var lineEnd = model.getLineEnd(lineIndex);
			var lineLength = lineText.length;
			var offsetInLine = offset - lineStart;
			var c;
			var step = data.count < 0 ? -1 : 1;
			if (data.unit === "word" || data.unit === "wordend" || data.unit === "wordWS" || data.unit === "wordendWS") { //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-1$
				var previousPunctuation, previousLetterOrDigit, punctuation, letterOrDigit;
				while (data.count !== 0) {
					if (data.count > 0) {
						if (offsetInLine === lineLength) { return lineEnd; }
						c = lineText.charCodeAt(offsetInLine);
						previousPunctuation = _isPunctuation(c); 
						previousLetterOrDigit = !previousPunctuation && !_isWhitespace(c);
						offsetInLine++;
						while (offsetInLine < lineLength) {
							c = lineText.charCodeAt(offsetInLine);
							if (data.unit !== "wordWS" && data.unit !== "wordendWS") { //$NON-NLS-1$ //$NON-NLS-1$
								punctuation = _isPunctuation(c);
								if (data.unit === "wordend") { //$NON-NLS-1$
									if (!punctuation && previousPunctuation) { break; }
								} else {
									if (punctuation && !previousPunctuation) { break; }
								}
								letterOrDigit  = !punctuation && !_isWhitespace(c);
							} else {
								letterOrDigit  = !_isWhitespace(c);
							}
							if (data.unit === "wordend" || data.unit === "wordendWS") { //$NON-NLS-1$ //$NON-NLS-1$
								if (!letterOrDigit && previousLetterOrDigit) { break; }
							} else {
								if (letterOrDigit && !previousLetterOrDigit) { break; }
							}
							previousLetterOrDigit = letterOrDigit;
							previousPunctuation = punctuation;
							offsetInLine++;
						}
					} else {
						if (offsetInLine === 0) { return lineStart; }
						offsetInLine--;
						c = lineText.charCodeAt(offsetInLine);
						previousPunctuation = _isPunctuation(c); 
						previousLetterOrDigit = !previousPunctuation && !_isWhitespace(c);
						while (0 < offsetInLine) {
							c = lineText.charCodeAt(offsetInLine - 1);
							if (data.unit !== "wordWS" && data.unit !== "wordendWS") { //$NON-NLS-1$ //$NON-NLS-1$ 
								punctuation = _isPunctuation(c);
								if (data.unit === "wordend") { //$NON-NLS-1$
									if (punctuation && !previousPunctuation) { break; }
								} else {
									if (!punctuation && previousPunctuation) { break; }
								}
								letterOrDigit  = !punctuation && !_isWhitespace(c);
							} else {
								letterOrDigit  = !_isWhitespace(c);
							}
							if (data.unit === "wordend" || data.unit === "wordendWS") { //$NON-NLS-1$ //$NON-NLS-1$
								if (letterOrDigit && !previousLetterOrDigit) { break; }
							} else {
								if (!letterOrDigit && previousLetterOrDigit) { break; }
							}
							previousLetterOrDigit = letterOrDigit;
							previousPunctuation = punctuation;
							offsetInLine--;
						}
						if (offsetInLine === 0) {
							//get previous line
						}
					}
					data.count -= step;
				}
			} else {
				while (data.count !== 0 && (0 <= offsetInLine + step && offsetInLine + step <= lineLength)) {
					offsetInLine += step;
					c = lineText.charCodeAt(offsetInLine);
					// Handle Unicode surrogates
					if (offsetInLine > 0) {
						if (0xDFFB <= c && c <= 0xDFFF) {
							c = lineText.charCodeAt(offsetInLine - 1);
							if (0xD83C === c) {
								offsetInLine += step;
								continue; // Skip skin tone modifiers
							}
						}
						else if (0xFE00 <= c && c <= 0xFE0F) { // Skip variation selectors
								continue;
						}
						else if (0xDC00 <= c && c <= 0xDFFF) {
							c = lineText.charCodeAt(offsetInLine - 1);
							if (0xD800 <= c && c <= 0xDBFF) {
								offsetInLine += step;
							}
						}
					}
					data.count -= step;
				}
			}
			return lineStart + offsetInLine;
		},
		/** @private */
		_getNextOffset_IE: function (offset, data) {
			var child = this._ensureCreated();
			var view = this.view;
			var model = view._model;
			var lineIndex = this.lineIndex;
			var result = 0, range, len;
			var lineOffset = model.getLineStart(lineIndex);
			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var doc = child.ownerDocument;
			var lineChild;
			var step = data.count < 0 ? -1 : 1;
			if (offset === model.getLineEnd(lineIndex)) {
				lineChild = child.lastChild;
				while (lineChild && lineChild.ignoreChars === lineChild.firstChild.length) {
					lineChild = lineChild.previousSibling;
				}
				if (!lineChild) {
					return lineOffset;
				}
				range = doc.body.createTextRange();
				range.moveToElementText(lineChild);
				len = range.text.length;
				range.moveEnd(data.unit, step);
				result = offset + range.text.length - len;
			} else if (offset === lineOffset && data.count < 0) {
				result = lineOffset;
			} else {
				lineChild = child.firstChild;
				while (lineChild) {
					var nodeLength = this._nodeLength(lineChild);
					if (lineOffset + nodeLength > offset) {
						range = doc.body.createTextRange();
						if (offset === lineOffset && data.count < 0) {
							var temp = lineChild.previousSibling;
							// skip empty nodes
							while (temp) {
								if (temp.firstChild && temp.firstChild.length) {
									break;
								}
								temp = temp.previousSibling;
							}
							range.moveToElementText(temp ? temp : lineChild.previousSibling);
						} else {
							range.moveToElementText(lineChild);
							range.collapse();
							range.moveEnd("character", offset - lineOffset); //$NON-NLS-1$
						}
						len = range.text.length;
						range.moveEnd(data.unit, step);
						result = offset + range.text.length - len;
						break;
					}
					lineOffset = nodeLength + lineOffset;
					lineChild = lineChild.nextSibling;
				}
			}
			var offsetInLine = result - lineStart;
			var c = lineText.charCodeAt(offsetInLine);
			// Handle Unicode surrogates
			if (0xDC00 <= c && c <= 0xDFFF) {
				if (offsetInLine > 0) {
					c = lineText.charCodeAt(offsetInLine - 1);
					if (0xD800 <= c && c <= 0xDBFF) {
						offsetInLine += step;
					}
				}
			}
			result = offsetInLine + lineStart;
			data.count -= step;
			return result;
		},
		updateLinks: function() {
			var child = this._ensureCreated();
			if (!this.hasLink) { return; }
			var that = this;
			this.forEach(function(span) {
				var style = span.viewStyle;
				if (style && style.tagName && style.tagName.toLowerCase() === "a") { //$NON-NLS-1$
					child.replaceChild(that._createSpan(child, span.firstChild.data, style), span);
				}
				return true;
			});
		},
		/** @private */
		destroy: function() {
			var div = this._createdDiv;
			if (div) {
				div.parentNode.removeChild(div);
				this._createdDiv = null;
			}
		}
	};
	
	/**
	 * @class This object describes the options for the text view.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextView#setOptions}
	 * {@link orion.editor.TextView#getOptions}	 
	 * </p>		 
	 * @name orion.editor.TextViewOptions
	 *
	 * @property {String|DOMElement} parent the parent element for the view, it can be either a DOM element or an ID for a DOM element.
	 * @property {orion.editor.TextModel} [model] the text model for the view. If it is not set the view creates an empty {@link orion.editor.TextModel}.
	 * @property {Boolean} [readonly=false] whether or not the view is read-only.
	 * @property {Boolean} [fullSelection=true] whether or not the view is in full selection mode.
	 * @property {Boolean} [tabMode=true] whether or not the tab keypress is consumed by the view or is used for focus traversal.
	 * @property {Boolean} [expandTab=false] whether or not the tab key inserts white spaces.
	 * @property {orion.editor.TextTheme} [theme=orion.editor.TextTheme.getTheme()] the TextTheme manager. TODO more info on this
	 * @property {orion.editor.UndoStack} [undoStack] the Undo Stack.
	 * @property {String} [themeClass] the CSS class for the view theming.
	 * @property {Number} [tabSize=8] The number of spaces in a tab.
	 * @property {Boolean} [overwriteMode=false] whether or not the view is in insert/overwrite mode.
	 * @property {Boolean} [singleMode=false] whether or not the editor is in single line mode.
	 * @property {Number} [marginOffset=0] the offset in a line where the print margin should be displayed. <code>0</code> means no print margin.
	 * @property {Number} [wrapOffset=0] the offset in a line where text should wrap. <code>0</code> means wrap at the client area right edge.
	 * @property {Boolean} [wrapMode=false] whether or not the view wraps lines.
	 * @property {Boolean} [wrapable=false] whether or not the view is wrappable.
	 * @property {Number} [scrollAnimation=0] the time duration in miliseconds for scrolling animation. <code>0</code> means no animation.
	 * @property {Boolean} [blockCursorVisible=false] whether or not to show the block cursor.
	 */
	/**
	 * Constructs a new text view.
	 * 
	 * @param {orion.editor.TextViewOptions} options the view options.
	 * 
	 * @class A TextView is a user interface for editing text.
	 * @name orion.editor.TextView
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function TextView (options) {
		this._init(options || {});
	}
	
	TextView.prototype = /** @lends orion.editor.TextView.prototype */ {
		/**
		 * Adds a keyMode to the text view at the specified position.
		 *
		 * @param {orion.editor.KeyMode} mode the editor keyMode.
		 * @param {Number} [index=length] the index.
		 */
		addKeyMode: function(mode, index) {
			var keyModes = this._keyModes;
			if (index !== undefined) {
				keyModes.splice(index, 0, mode);
			} else {
				keyModes.push(mode);
			}
			//TODO: API needed for this
			if (mode._modeAdded) {
				mode._modeAdded();
			}
		},
		/**
		 * Adds a ruler to the text view at the specified position.
		 * <p>
		 * The position is relative to the ruler location.
		 * </p>
		 *
		 * @param {orion.editor.Ruler} ruler the ruler.
		 * @param {Number} [index=length] the ruler index.
		 */
		addRuler: function (ruler, index) {
			var rulers = this._rulers;
			if (index !== undefined) {
				var i, sideIndex;
				for (i = 0, sideIndex=0; i < rulers.length && sideIndex < index; i++) {
					if (ruler.getLocation() === rulers[i].getLocation()) {
						sideIndex++;
					}
				}
				rulers.splice(sideIndex, 0, ruler);
				index = sideIndex;
			} else {
				rulers.push(ruler);
			}
			this._createRuler(ruler, index);
			ruler.setView(this);
			this._update();
		},
		computeSize: function() {
			var w = 0, h = 0;
			var model = this._model, clientDiv = this._clientDiv;
			if (!clientDiv) { return {width: w, height: h}; }
			var clientWidth = clientDiv.style.width;
			/*
			* Feature in WekKit. Webkit limits the width of the lines
			* computed below to the width of the client div.  This causes
			* the lines to be wrapped even though "pre" is set.  The fix
			* is to set the width of the client div to a "0x7fffffffpx"
			* before computing the lines width.  Note that this value is
			* reset to the appropriate value further down.
			*/
			if (util.isWebkit) {
				clientDiv.style.width = "0x7fffffffpx"; //$NON-NLS-1$
			}
			var lineCount = model.getLineCount();
			for (var lineIndex=0; lineIndex<lineCount; lineIndex++) {
				var line = this._getLine(lineIndex);
				var rect = line.getBoundingClientRect();
				w = Math.max(w, rect.right - rect.left);
				h += rect.bottom - rect.top;
				line.destroy();
			}
			if (util.isWebkit) {
				clientDiv.style.width = clientWidth;
			}
			var viewPadding = this._getViewPadding();
			w += viewPadding.right + viewPadding.left + this._metrics.scrollWidth;
			h += viewPadding.bottom + viewPadding.top + this._metrics.scrollWidth;
			return {width: w, height: h};
		},
		/**
		 * Converts the given rectangle from one coordinate spaces to another.
		 * <p>The supported coordinate spaces are:
		 * <ul>
		 *   <li>"document" - relative to document, the origin is the top-left corner of first line</li>
		 *   <li>"page" - relative to html page that contains the text view</li>
		 * </ul>
		 * </p>
		 * <p>All methods in the view that take or return a position are in the document coordinate space.</p>
		 *
		 * @param rect the rectangle to convert.
		 * @param rect.x the x of the rectangle.
		 * @param rect.y the y of the rectangle.
		 * @param rect.width the width of the rectangle.
		 * @param rect.height the height of the rectangle.
		 * @param {String} from the source coordinate space.
		 * @param {String} to the destination coordinate space.
		 *
		 * @see orion.editor.TextView#getLocationAtOffset
		 * @see orion.editor.TextView#getOffsetAtLocation
		 * @see orion.editor.TextView#getTopPixel
		 * @see orion.editor.TextView#setTopPixel
		 */
		convert: function(rect, from, to) {
			if (!this._clientDiv) { return rect; }
			var _scroll = this._getScroll();
			var viewPad = this._getViewPadding();
			var viewRect = this._viewDiv.getBoundingClientRect();
			if (from === "document") { //$NON-NLS-1$
				if (rect.x !== undefined) {
					rect.x += - _scroll.x + viewRect.left + viewPad.left;
				}
				if (rect.y !== undefined) {
					rect.y += - _scroll.y + viewRect.top + viewPad.top;
				}
			}
			//At this point rect is in the widget coordinate space
			if (to === "document") { //$NON-NLS-1$
				if (rect.x !== undefined) {
					rect.x += _scroll.x - viewRect.left - viewPad.left;
				}
				if (rect.y !== undefined) {
					rect.y += _scroll.y - viewRect.top - viewPad.top;
				}
			}
			return rect;
		},
		/**
		 * Copies the selected text to the clipboard in plain text format.
		 * @returns {Boolean} <code>true</code> if the operation succeded.
		 * @since 10.0
		 */
		copy: function() {
			if (!this._clientDiv) { return false; }
			return this._doCopy();
		},
		/**
		 * Moves the selected text to the clipboard in plain text format.
		 * @returns {Boolean} <code>true</code> if the operation succeded.
		 * @since 10.0
		 */
		cut: function() {
			if (!this._clientDiv) { return false; }
			return this._doCut();
		},
		/**
		 * Destroys the text view. 
		 * <p>
		 * Removes the view from the page and frees all resources created by the view.
		 * Calling this function causes the "Destroy" event to be fire so that all components
		 * attached to view can release their references.
		 * </p>
		 *
		 * @see orion.editor.TextView#onDestroy
		 */
		destroy: function() {
			/* Destroy rulers*/
			for (var i=0; i< this._rulers.length; i++) {
				this._rulers[i].setView(null);
			}
			this.rulers = null;
			
			this._destroyView();

			var e = {type: "Destroy"}; //$NON-NLS-1$
			this.onDestroy(e);

			this._parent = null;
			if (this._model && this._model.destroy) {
				this._model.destroy();
			}
			this._model = null;
			this._theme = null;
			this._selection = null;
			this._doubleClickSelection = null;
			this._keyModes = null;
			this._actions = null;
		},
		/**
		 * Gives focus to the text view.
		 */
		focus: function() {
			if (!this._clientDiv) { return; }
			/*
			* Feature in Chrome. When focus is called in the clientDiv without
			* setting selection the browser will set the selection to the first dom 
			* element, which can be above the client area. When this happen the 
			* browser also scrolls the window to show that element.
			* The fix is to call _updateDOMSelection() before calling focus().
			*/
			this._updateDOMSelection();
			this._clientDiv.focus();
			/*
			* Feature in Safari. When focus is called the browser selects the clientDiv
			* itself. The fix is to call _updateDOMSelection() after calling focus().
			*/
			this._updateDOMSelection();
		},
		/**
		 * Check if the text view has focus.
		 *
		 * @returns {Boolean} <code>true</code> if the text view has focus, otherwise <code>false</code>.
		 */
		hasFocus: function() {
			return this._hasFocus;
		},
		/**
		 * Returns the action description for a given action ID.
		 *
		 * @returns {orion.editor.ActionDescrition} the action description
		 */
		getActionDescription: function(actionID) {
			var action = this._actions[actionID];
			if (action) {
				return action.actionDescription;
			}
			return undefined;
		},
		/**
		 * Returns all action IDs defined in the text view.
		 * <p>
		 * There are two types of actions, the predefined actions of the view 
		 * and the actions added by application code.
		 * </p>
		 * <p>
		 * The predefined actions are:
		 * <ul>
		 *   <li>Navigation actions. These actions move the caret collapsing the selection.</li>
		 *     <ul>
		 *       <li>"lineUp" - moves the caret up by one line</li>
		 *       <li>"lineDown" - moves the caret down by one line</li>
		 *       <li>"lineStart" - moves the caret to beginning of the current line</li>
		 *       <li>"lineEnd" - moves the caret to end of the current line </li>
		 *       <li>"charPrevious" - moves the caret to the previous character</li>
		 *       <li>"charNext" - moves the caret to the next character</li>
		 *       <li>"pageUp" - moves the caret up by one page</li>
		 *       <li>"pageDown" - moves the caret down by one page</li>
		 *       <li>"wordPrevious" - moves the caret to the previous word</li>
		 *       <li>"wordNext" - moves the caret to the next word</li>
		 *       <li>"textStart" - moves the caret to the beginning of the document</li>
		 *       <li>"textEnd" - moves the caret to the end of the document</li>
		 *     </ul>
		 *   <li>Selection actions. These actions move the caret extending the selection.</li>
		 *     <ul>
		 *       <li>"selectLineUp" - moves the caret up by one line</li>
		 *       <li>"selectLineDown" - moves the caret down by one line</li>
		 *       <li>"selectLineStart" - moves the caret to beginning of the current line</li>
		 *       <li>"selectLineEnd" - moves the caret to end of the current line </li>
		 *       <li>"selectCharPrevious" - moves the caret to the previous character</li>
		 *       <li>"selectCharNext" - moves the caret to the next character</li>
		 *       <li>"selectPageUp" - moves the caret up by one page</li>
		 *       <li>"selectPageDown" - moves the caret down by one page</li>
		 *       <li>"selectWordPrevious" - moves the caret to the previous word</li>
		 *       <li>"selectWordNext" - moves the caret to the next word</li>
		 *       <li>"selectTextStart" - moves the caret to the beginning of the document</li>
		 *       <li>"selectTextEnd" - moves the caret to the end of the document</li>
		 *       <li>"selectAll" - selects the entire document</li>
		 *     </ul>
		 *   <li>Edit actions. These actions modify the text view text</li>
		 *     <ul>
		 *       <li>"deletePrevious" - deletes the character preceding the caret</li>
		 *       <li>"deleteNext" - deletes the charecter following the caret</li>
		 *       <li>"deleteWordPrevious" - deletes the word preceding the caret</li>
		 *       <li>"deleteWordNext" - deletes the word following the caret</li>
		 *       <li>"deleteLineStart" - deletes characteres to the beginning of the line</li>
		 *       <li>"deleteLineEnd" - deletes characteres to the end of the line</li>
		 *       <li>"tab" - inserts a tab character at the caret</li>
		 *       <li>"shiftTab" - noop</li>
		 *       <li>"enter" - inserts a line delimiter at the caret</li>
		 *       <li>"uppercase" - upper case the text at the caret</li>
		 *       <li>"lowercase" - lower case the text at the caret</li>
		 *       <li>"capitalize" - capitilize case the text at the caret</li>
		 *       <li>"reversecase" - reverse the case the text at the caret</li>
		 *     </ul>
		 *   <li>Clipboard actions. These actions modify the view text as well</li>
		 *     <ul>
		 *       <li>"copy" - copies the selected text to the clipboard</li>
		 *       <li>"cut" - copies the selected text to the clipboard and deletes the selection</li>
		 *       <li>"paste" - replaces the selected text with the clipboard contents</li>
		 *     </ul>
		 *   <li>Scrolling actions.</li>
		 *     <ul>
		 *       <li>"scrollLineUp" - scrolls the view up by one line</li>
		 *       <li>"scrollLineDown" - scrolls the view down by one line</li>
		 *       <li>"scrollPageUp" - scrolls the view up by one page</li>
		 *       <li>"scrollPageDown" - scrolls the view down by one page</li>
		 *       <li>"scrollTextStart" - scrolls the view to the beginning of the document</li>
		 *       <li>"scrollTextEnd" - scrolls the view to the end of the document</li>
		 *     </ul>
		 *   <li>Mode actions.</li>
		 *     <ul>
		 *       <li>"toggleTabMode" - toggles tab mode.</li>
		 *       <li>"toggleWrapMode" - toggles wrap mode.</li>
		 *       <li>"toggleOverwriteMode" - toggles overwrite mode.</li>
		 *     </ul>
		 * </ul>
		 * </p>
		 * 
		 * @param {Boolean} [defaultAction=false] whether or not the predefined actions are included.
		 * @returns {String[]} an array of action IDs defined in the text view.
		 *
		 * @see orion.editor.TextView#invokeAction
		 * @see orion.editor.TextView#setAction
		 * @see orion.editor.TextView#setKeyBinding
		 * @see orion.editor.TextView#getKeyBindings
		 */
		getActions: function (defaultAction) {
			var result = [];
			var actions = this._actions;
			for (var i in actions) {
				if (actions.hasOwnProperty(i)) {
					if (!defaultAction && actions[i].defaultHandler) { continue; }
					result.push(i);
				}
			}
			return result;
		},
		/**
		 * Returns the bottom index.
		 * <p>
		 * The bottom index is the line that is currently at the bottom of the view.  This
		 * line may be partially visible depending on the vertical scroll of the view. The parameter
		 * <code>fullyVisible</code> determines whether to return only fully visible lines. 
		 * </p>
		 *
		 * @param {Boolean} [fullyVisible=false] if <code>true</code>, returns the index of the last fully visible line. This
		 *    parameter is ignored if the view is not big enough to show one line.
		 * @returns {Number} the index of the bottom line.
		 *
		 * @see orion.editor.TextView#getTopIndex
		 * @see orion.editor.TextView#setTopIndex
		 */
		getBottomIndex: function(fullyVisible) {
			if (!this._clientDiv) { return 0; }
			return this._getBottomIndex(fullyVisible);
		},
		/**
		 * Returns the bottom pixel.
		 * <p>
		 * The bottom pixel is the pixel position that is currently at
		 * the bottom edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @returns {Number} the bottom pixel.
		 *
		 * @see orion.editor.TextView#getTopPixel
		 * @see orion.editor.TextView#setTopPixel
		 * @see orion.editor.TextView#convert
		 */
		getBottomPixel: function() {
			if (!this._clientDiv) { return 0; }
			return this._getScroll().y + this._getClientHeight();
		},
		/**
		 * Returns the caret offset relative to the start of the document.
		 *
		 * @returns {Number} the caret offset relative to the start of the document.
		 *
		 * @see orion.editor.TextView#setCaretOffset
		 * @see orion.editor.TextView#setSelection
		 * @see orion.editor.TextView#getSelection
		 */
		getCaretOffset: function () {
			var s = this._getSelection();
			return s.getCaret();
		},
		/**
		 * Returns the client area.
		 * <p>
		 * The client area is the portion in pixels of the document that is visible. The
		 * client area position is relative to the beginning of the document.
		 * </p>
		 *
		 * @returns {Object} the client area rectangle {x, y, width, height}.
		 *
		 * @see orion.editor.TextView#getTopPixel
		 * @see orion.editor.TextView#getBottomPixel
		 * @see orion.editor.TextView#getHorizontalPixel
		 * @see orion.editor.TextView#convert
		 */
		getClientArea: function() {
			if (!this._clientDiv) { return {x: 0, y: 0, width: 0, height: 0}; }
			var _scroll = this._getScroll();
			return {x: _scroll.x, y: _scroll.y, width: this._getClientWidth(), height: this._getClientHeight()};
		},
		/**
		 * Returns the horizontal pixel.
		 * <p>
		 * The horizontal pixel is the pixel position that is currently at
		 * the left edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @returns {Number} the horizontal pixel.
		 *
		 * @see orion.editor.TextView#setHorizontalPixel
		 * @see orion.editor.TextView#convert
		 */
		getHorizontalPixel: function() {
			if (!this._clientDiv) { return 0; }
			return this._getScroll().x;
		},
		/**
		 * Returns all the key bindings associated to the given action ID.
		 *
		 * @param {String} actionID the action ID.
		 * @returns {orion.KeyBinding[]} the array of key bindings associated to the given action ID.
		 *
		 * @see orion.editor.TextView#setKeyBinding
		 * @see orion.editor.TextView#setAction
		 */
		getKeyBindings: function (actionID) {
			var result = [];
			var keyModes = this._keyModes;
			for (var i = 0; i < keyModes.length; i++) {
				result = result.concat(keyModes[i].getKeyBindings(actionID));
			}
			return result;
		},
		/**
		 * Returns all the key modes added to text view.
		 *
		 * @returns {orion.editor.KeyMode[]} the array of key modes.
		 *
		 * @see orion.editor.TextView#addKeyMode
		 * @see orion.editor.TextView#removeKeyMode
		 */
		getKeyModes: function() {
			return this._keyModes.slice(0);
		},
		/**
		 * Returns the line height for a given line index.  Returns the default line
		 * height if the line index is not specified.
		 *
		 * @param {Number} [lineIndex] the line index.
		 * @returns {Number} the height of the line in pixels.
		 *
		 * @see orion.editor.TextView#getLinePixel
		 */
		getLineHeight: function(lineIndex) {
			if (!this._clientDiv) { return 0; }
			return this._getLineHeight(lineIndex);
		},
		/**
		 * Returns the line index for a given line pixel position relative to the document.
		 *
		 * @param {Number} [y] the line pixel.
		 * @returns {Number} the line index for the specified pixel position.
		 *
		 * @see orion.editor.TextView#getLinePixel
		 */
		getLineIndex: function(y) {
			if (!this._clientDiv) { return 0; }
			return this._getLineIndex(y);
		},
		/**
		 * @name isValidTextPosition
		 * @description Return whether the given x/y pixel position, relative to the document, is inside of document text. 
		 * 				This tests both whether the y position is below the text lines of the document as we as whether the
		 * 				x position is within the text of the line.
		 * @function
		 * @param x {Number} [x] the x pixel position
		 * @param y {Number} [y] the line pixel position
		 * @returns returns {Boolean} true if the pixel position is over text content
		 */
		isValidTextPosition: function(x, y){
			if (!this._clientDiv) { return false; }
			// Check if we are within a valid line
			var lineIndex = this._getLineIndex(y, true);
			if (lineIndex < 0){
				return false;
			}
			// Get the closest offset to the position
			var line = this._getLine(lineIndex);
			var offset = this.getOffsetAtLocation(x, y);
			// If the closest offset is to the left of the character's bounds then position is outside the text on the line
			var bounds = line.getBoundingClientRect(offset);
			line.destroy();
			if (x > bounds.right){
				return false;
			}
			return true;
		},
		/**
		 * Returns the top pixel position of a given line index relative to the beginning
		 * of the document.
		 * <p>
		 * Clamps out of range indices.
		 * </p>
		 *
		 * @param {Number} lineIndex the line index.
		 * @returns {Number} the pixel position of the line.
		 *
		 * @see orion.editor.TextView#setTopPixel
		 * @see orion.editor.TextView#getLineIndex
		 * @see orion.editor.TextView#convert
		 */
		getLinePixel: function(lineIndex) {
			if (!this._clientDiv) { return 0; }
			return this._getLinePixel(lineIndex);
		},
		/**
		 * Returns the {x, y} pixel location of the top-left corner of the character
		 * bounding box at the specified offset in the document.  The pixel location
		 * is relative to the document.
		 * <p>
		 * Clamps out of range offsets.
		 * </p>
		 *
		 * @param {Number} offset the character offset
		 * @returns {Object} the {x, y} pixel location of the given offset.
		 *
		 * @see orion.editor.TextView#getOffsetAtLocation
		 * @see orion.editor.TextView#convert
		 */
		getLocationAtOffset: function(offset) {
			if (!this._clientDiv) { return {x: 0, y: 0}; }
			var model = this._model;
			offset = Math.min(Math.max(0, offset), model.getCharCount());
			var lineIndex = model.getLineAtOffset(offset);
			var line = this._getLine(lineIndex);
			var rect = line.getBoundingClientRect(offset);
			line.destroy();
			var x = rect.left;
			var y = this._getLinePixel(lineIndex) + rect.top;
			return {x: x, y: y};
		},
		/**
		 * Returns the next character offset after the given offset and options
		 *
		 * @param {Number} offset the offset to start from
		 * @param {Object} options
		 *   { unit: the type of unit to advance to (eg "character", "word", "wordend", "wordWS", "wordendWS"),
		 *    count: the number of units to advance (negative to advance backwards) }
		 * @returns {Number} the next character offset
		 */
		getNextOffset: function(offset, options) {
			var selection = new Selection(offset, offset, false);
			this._doMove(options, selection);
			return selection.getCaret();
		},
		/**
		 * Returns the specified view options.
		 * <p>
		 * The returned value is either a <code>orion.editor.TextViewOptions</code> or an option value. An option value is returned when only one string parameter
		 * is specified. A <code>orion.editor.TextViewOptions</code> is returned when there are no paremeters, or the parameters are a list of options names or a
		 * <code>orion.editor.TextViewOptions</code>. All view options are returned when there no paremeters.
		 * </p>
		 *
		 * @param {String|orion.editor.TextViewOptions} [options] The options to return.
		 * @return {Object|orion.editor.TextViewOptions} The requested options or an option value.
		 *
		 * @see orion.editor.TextView#setOptions
		 */
		getOptions: function() {
			var options;
			if (arguments.length === 0) {
				options = this._defaultOptions();
			} else if (arguments.length === 1) {
				var arg = arguments[0];
				if (typeof arg === "string") { //$NON-NLS-1$
					return clone(this["_" + arg]); //$NON-NLS-1$
				}
				options = arg;
			} else {
				options = {};
				for (var index in arguments) {
					if (arguments.hasOwnProperty(index)) {
						options[arguments[index]] = undefined;
					}
				}
			}
			for (var option in options) {
				if (options.hasOwnProperty(option)) {
					options[option] = clone(this["_" + option]); //$NON-NLS-1$
				}
			}
			return options;
		},
		/**
		 * Returns the text model of the text view.
		 *
		 * @returns {orion.editor.TextModel} the text model of the view.
		 */
		getModel: function() {
			return this._model;
		},
		/**
		 * Returns the character offset nearest to the given pixel location.  The
		 * pixel location is relative to the document.
		 *
		 * @param x the x of the location
		 * @param y the y of the location
		 * @returns {Number} the character offset at the given location.
		 *
		 * @see orion.editor.TextView#getLocationAtOffset
		 */
		getOffsetAtLocation: function(x, y) {
			if (!this._clientDiv) { return 0; }
			var lineIndex = this._getLineIndex(y);
			var line = this._getLine(lineIndex);
			var offset = line.getOffset(x, y - this._getLinePixel(lineIndex));
			line.destroy();
			return offset;
		},
		/**
		 * @name getLineAtOffset
		 * @description Compute the editor line number for the given offset
		 * @function
		 * @public
		 * @memberof orion.editor.TextView
		 * @param {Number} offset The offset into the editor
		 * @returns {Number} Returns the line number in the editor corresponding to the given offset or <code>-1</code> if the offset is 
		 * out of range
		 * @since 5.0
		 */
		getLineAtOffset: function(offset) {
			return this.getModel().getLineAtOffset(offset);
		},
		/**
		 * @name getLineStart
		 * @description Compute the editor start offset of the given line number
		 * @function
		 * @public
		 * @memberof orion.editor.TextView
		 * @param {Number} line The line number in the editor
		 * @returns {Number} Returns the start offset of the given line number in the editor.
		 * @since 5.0
		 */
		getLineStart: function(line) {
			return this.getModel().getLineStart(line);
		},
		/**
		 * Get the view rulers.
		 *
		 * @returns {orion.editor.Ruler[]} the view rulers
		 *
		 * @see orion.editor.TextView#addRuler
		 */
		getRulers: function() {
			return this._rulers.slice(0);
		},
		/**
		 * Returns the text view selection.
		 * <p>
		 * The selection is defined by a start and end character offset relative to the
		 * document. The character at end offset is not included in the selection.
		 * </p>
		 * 
		 * @returns {orion.editor.Selection} the view selection
		 *
		 * @see orion.editor.TextView#setSelection
		 */
		getSelection: function () {
			return this._getSelection();
		},
		getSelections: function () {
			return this._getSelections();
		},
		/**
		 * Returns the text view selection text.
		 * <p>
		 * If there are multiple selection ranges, the result is concatenated with the specified delimiter.
		 * </p>
		 * 
		 * @param {String} delimiter The offset into the editor
		 * @returns {String} the view selection text
		 * @since 10.0
		 * @see orion.editor.TextView#setSelection
		 */
		getSelectionText: function(delimiter) {
			var text = [];
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (!selection.isEmpty()) {
					text.push(that._getBaseText(selection.start, selection.end));
				}
			});
			return text.join(delimiter !== undefined ? delimiter : this._model.getLineDelimiter());
		},
		/**
		 * Returns the text for the given range.
		 * <p>
		 * The text does not include the character at the end offset.
		 * </p>
		 *
		 * @param {Number} [start=0] the start offset of text range.
		 * @param {Number} [end=char count] the end offset of text range.
		 *
		 * @see orion.editor.TextView#setText 	
		 */
		getText: function(start, end) {
			var model = this._model;
			return model.getText(start, end);
		},
		/**
		 * Returns the top index.
		 * <p>
		 * The top index is the line that is currently at the top of the view.  This
		 * line may be partially visible depending on the vertical scroll of the view. The parameter
		 * <code>fullyVisible</code> determines whether to return only fully visible lines. 
		 * </p>
		 *
		 * @param {Boolean} [fullyVisible=false] if <code>true</code>, returns the index of the first fully visible line. This
		 *    parameter is ignored if the view is not big enough to show one line.
		 * @returns {Number} the index of the top line.
		 *
		 * @see orion.editor.TextView#getBottomIndex
		 * @see orion.editor.TextView#setTopIndex
		 */
		getTopIndex: function(fullyVisible) {
			if (!this._clientDiv) { return 0; }
			return this._getTopIndex(fullyVisible);
		},
		/**
		 * Returns the top pixel.
		 * <p>
		 * The top pixel is the pixel position that is currently at
		 * the top edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @returns {Number} the top pixel.
		 *
		 * @see orion.editor.TextView#getBottomPixel
		 * @see orion.editor.TextView#setTopPixel
		 * @see orion.editor.TextView#convert
		 */
		getTopPixel: function() {
			if (!this._clientDiv) { return 0; }
			return this._getScroll().y;
		},
		/**
		 * Executes the action handler associated with the given action ID.
		 * <p>
		 * The application defined action takes precedence over predefined actions unless
		 * the <code>defaultAction</code> paramater is <code>true</code>.
		 * </p>
		 * <p>
		 * If the application defined action returns <code>false</code>, the text view predefined
		 * action is executed if present.
		 * </p>
		 *
		 * @param {String} actionID the action ID.
		 * @param {Boolean} [defaultAction] whether to always execute the predefined action only.
		 * @param {Object} [actionOptions] action specific options to be passed to the action handlers.
		 * @returns {Boolean} <code>true</code> if the action was executed.
		 *
		 * @see orion.editor.TextView#setAction
		 * @see orion.editor.TextView#getActions
		 */
		invokeAction: function (actionID, defaultAction, actionOptions) {
			if (!this._clientDiv) { return; }
			var action = this._actions[actionID];
			if (action) {
				if (action.actionDescription && action.actionDescription.id) {
					mMetrics.logEvent("editor", "action", action.actionDescription.id); //$NON-NLS-1$ //$NON-NLS-2$
				}
				if (!defaultAction && action.handler) {
					if (action.handler(actionOptions)) {
						return true;
					}
				}
				if (action.defaultHandler) {
					return typeof action.defaultHandler(actionOptions) === "boolean"; //$NON-NLS-1$
				}
			}
			return false;
		},
		/**
		* Returns if the view is destroyed.
		* @returns {Boolean} <code>true</code> if the view is destroyed.
		*/
		isDestroyed: function () {
			return !this._clientDiv;
		},
		/** 
		 * @class This is the event sent when the user right clicks or otherwise invokes the context menu of the view. 
		 * <p> 
		 * <b>See:</b><br/> 
		 * {@link orion.editor.TextView}<br/> 
		 * {@link orion.editor.TextView#event:onContextMenu} 
		 * </p> 
		 * 
		 * @name orion.editor.ContextMenuEvent 
		 * 
		 * @property {Number} x The pointer location on the x axis, relative to the document the user is editing. 
		 * @property {Number} y The pointer location on the y axis, relative to the document the user is editing. 
		 * @property {Number} screenX The pointer location on the x axis, relative to the screen. This is copied from the DOM contextmenu event.screenX property. 
		 * @property {Number} screenY The pointer location on the y axis, relative to the screen. This is copied from the DOM contextmenu event.screenY property. 
		 * @property {Boolean} defaultPrevented Determines whether the user agent context menu should be shown. It is shown by default.
		 * @property {Function} preventDefault If called prevents the user agent context menu from showing.
		 */ 
		/** 
		 * This event is sent when the user invokes the view context menu. 
		 * 
		 * @event 
		 * @param {orion.editor.ContextMenuEvent} contextMenuEvent the event 
		 */ 
		onContextMenu: function(contextMenuEvent) {
			return this.dispatchEvent(contextMenuEvent); 
		}, 
		onDragStart: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDrag: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragEnd: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragEnter: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragOver: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDragLeave: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		onDrop: function(dragEvent) {
			return this.dispatchEvent(dragEvent);
		},
		/**
		 * @class This is the event sent when the text view is destroyed.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onDestroy}
		 * </p>
		 * @name orion.editor.DestroyEvent
		 */
		/**
		 * This event is sent when the text view has been destroyed.
		 *
		 * @event
		 * @param {orion.editor.DestroyEvent} destroyEvent the event
		 *
		 * @see orion.editor.TextView#destroy
		 */
		onDestroy: function(destroyEvent) {
			return this.dispatchEvent(destroyEvent);
		},
		/**
		 * @description This event is sent when the file is being saved
		 * @function
		 * @param {Object} savingEvent the event
		 * @since 8.0
		 */
		onSaving: function onSaving(savingEvent) {
		    return this.dispatchEvent(savingEvent);
		},
		/**
		 * @description This event is sent when the file has been saved
		 * @function
		 * @param {Object} inputChangedEvent the event
		 * @since 8.0
		 */
		onInputChanged: function onInputChanged(inputChangedEvent) {
		    return this.dispatchEvent(inputChangedEvent);
		},
		/**
		 * @class This object is used to define style information for the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onLineStyle}
		 * </p>		 
		 * @name orion.editor.Style
		 * 
		 * @property {String} styleClass A CSS class name.
		 * @property {Object} style An object with CSS properties.
		 * @property {String} tagName A DOM tag name.
		 * @property {Object} attributes An object with DOM attributes.
		 */
		/**
		 * @class This object is used to style range.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onLineStyle}
		 * </p>		 
		 * @name orion.editor.StyleRange
		 * 
		 * @property {Number} start The start character offset, relative to the document, where the style should be applied.
		 * @property {Number} end The end character offset (exclusive), relative to the document, where the style should be applied.
		 * @property {orion.editor.Style} style The style for the range.
		 */
		/**
		 * @class This is the event sent when the text view needs the style information for a line.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onLineStyle}
		 * </p>		 
		 * @name orion.editor.LineStyleEvent
		 * 
		 * @property {orion.editor.TextView} textView The text view.		 
		 * @property {Number} lineIndex The line index.
		 * @property {String} lineText The line text.
		 * @property {Number} lineStart The character offset, relative to document, of the first character in the line.
		 * @property {orion.editor.Style} style The style for the entire line (output argument).
		 * @property {orion.editor.StyleRange[]} ranges An array of style ranges for the line (output argument).		 
		 */
		/**
		 * This event is sent when the text view needs the style information for a line.
		 *
		 * @event
		 * @param {orion.editor.LineStyleEvent} lineStyleEvent the event
		 */
		onLineStyle: function(lineStyleEvent) {
			return this.dispatchEvent(lineStyleEvent);
		},
		/**
		 * @class This is the event sent for all keyboard events.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onKeyDown}<br/>
		 * {@link orion.editor.TextView#event:onKeyPress}<br/>
		 * {@link orion.editor.TextView#event:onKeyUp}<br/>
		 * </p>
		 * @name orion.editor.KeyEvent
		 * 
		 * @property {String} type The type of event.
		 * @property {DOMEvent} event The key DOM event.
		 * @property {Boolean} defaultPrevented Determines whether the user agent context menu should be shown. It is shown by default.
		 * @property {Function} preventDefault If called prevents the user agent context menu from showing.
		 */
		/**
		 * This event is sent for key down events.
		 *
		 * @event
		 * @param {orion.editor.KeyEvent} keyEvent the event
		 */
		onKeyDown: function(keyEvent) {
			return this.dispatchEvent(keyEvent);
		},
		/**
		 * This event is sent for key press events. Key press events are only sent
		 * for printable characters.
		 *
		 * @event
		 * @param {orion.editor.KeyEvent} keyEvent the event
		 */
		onKeyPress: function(keyEvent) {
			return this.dispatchEvent(keyEvent);
		},
		/**
		 * This event is sent for key up events.
		 *
		 * @event
		 * @param {orion.editor.KeyEvent} keyEvent the event
		 */
		onKeyUp: function(keyEvent) {
			return this.dispatchEvent(keyEvent);
		},
		/**
		 * @class This is the event sent when the text in the model has changed.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onModelChanged}<br/>
		 * {@link orion.editor.TextModel#onChanged}
		 * </p>
		 * @name orion.editor.ModelChangedEvent
		 * 
		 * @property {Number} start The character offset in the model where the change has occurred.
		 * @property {Number} removedCharCount The number of characters removed from the model.
		 * @property {Number} addedCharCount The number of characters added to the model.
		 * @property {Number} removedLineCount The number of lines removed from the model.
		 * @property {Number} addedLineCount The number of lines added to the model.
		 */
		/**
		 * This event is sent when the text in the model has changed.
		 *
		 * @event
		 * @param {orion.editor.ModelChangedEvent} modelChangedEvent the event
		 */
		onModelChanged: function(modelChangedEvent) {
			return this.dispatchEvent(modelChangedEvent);
		},
		/**
		 * @class This is the event sent when the text in the model is about to change.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onModelChanging}<br/>
		 * {@link orion.editor.TextModel#onChanging}
		 * </p>
		 * @name orion.editor.ModelChangingEvent
		 * 
		 * @property {String} text The text that is about to be inserted in the model.
		 * @property {Number} start The character offset in the model where the change will occur.
		 * @property {Number} removedCharCount The number of characters being removed from the model.
		 * @property {Number} addedCharCount The number of characters being added to the model.
		 * @property {Number} removedLineCount The number of lines being removed from the model.
		 * @property {Number} addedLineCount The number of lines being added to the model.
		 */
		/**
		 * This event is sent when the text in the model is about to change.
		 *
		 * @event
		 * @param {orion.editor.ModelChangingEvent} modelChangingEvent the event
		 */
		onModelChanging: function(modelChangingEvent) {
			return this.dispatchEvent(modelChangingEvent);
		},
		/**
		 * @class This is the event sent when the text is modified by the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onModify}
		 * </p>
		 * @name orion.editor.ModifyEvent
		 */
		/**
		 * This event is sent when the text view has changed text in the model.
		 * <p>
		 * If the text is changed directly through the model API, this event
		 * is not sent.
		 * </p>
		 *
		 * @event
		 * @param {orion.editor.ModifyEvent} modifyEvent the event
		 */
		onModify: function(modifyEvent) {
			return this.dispatchEvent(modifyEvent);
		},
		onMouseDown: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseUp: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseMove: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseOver: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onMouseOut: function(mouseEvent) {
			return this.dispatchEvent(mouseEvent);
		},
		onTouchStart: function(touchEvent) {
			return this.dispatchEvent(touchEvent);
		},
		onTouchMove: function(touchEvent) {
			return this.dispatchEvent(touchEvent);
		},
		onTouchEnd: function(touchEvent) {
			return this.dispatchEvent(touchEvent);
		},
		onOptions: function(optionsEvent) {
			return this.dispatchEvent(optionsEvent);
		},
		/**
		 * @class This is the event sent when the selection changes in the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onSelection}
		 * </p>		 
		 * @name orion.editor.SelectionEvent
		 * 
		 * @property {orion.editor.Selection} oldValue The old selection.
		 * @property {orion.editor.Selection} newValue The new selection.
		 */
		/**
		 * This event is sent when the text view selection has changed.
		 *
		 * @event
		 * @param {orion.editor.SelectionEvent} selectionEvent the event
		 */
		onSelection: function(selectionEvent) {
			return this.dispatchEvent(selectionEvent);
		},
		/**
		 * @class This is the event sent when the text view scrolls.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onScroll}
		 * </p>		 
		 * @name orion.editor.ScrollEvent
		 * 
		 * @property {Object} oldValue The old scroll {x,y}.
		 * @property {Object} newValue The new scroll {x,y}.
		 */
		/**
		 * This event is sent when the text view scrolls vertically or horizontally.
		 *
		 * @event
		 * @param {orion.editor.ScrollEvent} scrollEvent the event
		 */
		onScroll: function(scrollEvent) {
			return this.dispatchEvent(scrollEvent);
		},
		/**
		 * @class This is the event sent when the text is about to be modified by the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onVerify}
		 * </p>
		 * @name orion.editor.VerifyEvent
		 * 
		 * @property {String} text The text being inserted.
		 * @property {Number} start The start offset of the text range to be replaced.
		 * @property {Number} end The end offset (exclusive) of the text range to be replaced.
		 */
		/**
		 * This event is sent when the text view is about to change text in the model.
		 * <p>
		 * If the text is changed directly through the model API, this event
		 * is not sent.
		 * </p>
		 * <p>
		 * Listeners are allowed to change these parameters. Setting text to null
		 * or undefined stops the change.
		 * </p>
		 *
		 * @event
		 * @param {orion.editor.VerifyEvent} verifyEvent the event
		 */
		onVerify: function(verifyEvent) {
			return this.dispatchEvent(verifyEvent);
		},
		/**
		 * @class This is the event sent when the text view is focused.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onFocus}<br/>
		 * </p>
		 * @name orion.editor.FocusEvent
		 */
		/**
		 * This event is sent when the text view is focused.
		 *
		 * @event
		 * @param {orion.editor.FocusEvent} focusEvent the event
		 */
		onFocus: function(focusEvent) {
			return this.dispatchEvent(focusEvent);
		},
		/**
		 * @class This is the event sent when the text view goes out of focus.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#event:onBlur}<br/>
		 * </p>
		 * @name orion.editor.BlurEvent
		 */
		/**
		 * This event is sent when the text view goes out of focus.
		 *
		 * @event
		 * @param {orion.editor.BlurEvent} blurEvent the event
		 */
		onBlur: function(blurEvent) {
			return this.dispatchEvent(blurEvent);
		},
		/**
		 * Replaces the selection with the text on the clipboard or, if there is no selection, inserts the text at the current caret offset.
		 * <p>
		 * If the single mode is on and the clipboard text contains more than one line, all lines will be concatenated.
		 * </p>
		 * @returns {Boolean} <code>true</code> if the operation succeded.
		 * @since 10.0
		 */
		paste: function() {
			if (!this._clientDiv) { return false; }
			return this._doPaste();
		},
		/**
		 * Redraws the entire view, including rulers.
		 *
		 * @see orion.editor.TextView#redrawLines
		 * @see orion.editor.TextView#redrawRange
		 * @see orion.editor.TextView#setRedraw
		 */
		redraw: function() {
			if (this._redrawCount > 0) { return; }
			var lineCount = this._model.getLineCount();
			this.redrawRulers(0, lineCount);
			this.redrawLines(0, lineCount); 
		},
		redrawRulers: function(startLine, endLine) {
			if (this._redrawCount > 0) { return; }
			var rulers = this.getRulers();
			for (var i = 0; i < rulers.length; i++) {
				this.redrawLines(startLine, endLine, rulers[i]);
			}
		},
		/**
		 * Redraws the text in the given line range.
		 * <p>
		 * The line at the end index is not redrawn.
		 * </p>
		 *
		 * @param {Number} [startLine=0] the start line
		 * @param {Number} [endLine=line count] the end line
		 *
		 * @see orion.editor.TextView#redraw
		 * @see orion.editor.TextView#redrawRange
		 * @see orion.editor.TextView#setRedraw
		 */
		redrawLines: function(startLine, endLine, ruler) {
			if (this._redrawCount > 0) { return; }
			if (startLine === undefined) { startLine = 0; }
			if (endLine === undefined) { endLine = this._model.getLineCount(); }
			if (startLine === endLine) { return; }
			var div = this._clientDiv;
			if (!div) { return; }
			if (ruler) {
				var divRuler = this._getRulerParent(ruler);
				div = divRuler.firstChild;
				while (div) {
					if (div._ruler === ruler) {
						break;
					}
					div = div.nextSibling;
				}
			}
			if (ruler) {
				div.rulerChanged = true;
			} else {
				if (this._lineHeight) {
					this._resetLineHeight(startLine, endLine);
				}
			}
			var imeLineIndex = -1;
			if (!ruler && this._imeOffset !== -1) {
				imeLineIndex = this._model.getLineAtOffset(this._imeOffset);
			}
			if (!ruler || ruler.getOverview() === "page") { //$NON-NLS-1$
				var child = div.firstChild;
				while (child) {
					var lineIndex = child.lineIndex;
					if (startLine <= lineIndex && lineIndex < endLine && lineIndex !== imeLineIndex) {
						child.lineChanged = true;
					}
					child = child.nextSibling;
				}
			}
			if (!ruler) {
				if (!this._wrapMode) {
					if (startLine <= this._maxLineIndex && this._maxLineIndex < endLine) {
						this._checkMaxLineIndex = this._maxLineIndex;
						this._maxLineIndex = -1;
						this._maxLineWidth = 0;
					}
				}
			}
			this.dispatchEvent({type: "Redraw", startLine: startLine, endLine: endLine, ruler: ruler}); //$NON-NLS-1$
			this._queueUpdate();
		},
		/**
		 * Redraws the text in the given range.
		 * <p>
		 * The character at the end offset is not redrawn.
		 * </p>
		 *
		 * @param {Number} [start=0] the start offset of text range
		 * @param {Number} [end=char count] the end offset of text range
		 *
		 * @see orion.editor.TextView#redraw
		 * @see orion.editor.TextView#redrawLines
		 * @see orion.editor.TextView#setRedraw
		 */
		redrawRange: function(start, end) {
			if (this._redrawCount > 0) { return; }
			var model = this._model;
			if (start === undefined) { start = 0; }
			if (end === undefined) { end = model.getCharCount(); }
			var startLine = model.getLineAtOffset(start);
			var endLine = model.getLineAtOffset(Math.max(start, end - 1)) + 1;
			this.redrawLines(startLine, endLine);
		},	
		/**
		 * Removes a key mode from the text view.
		 *
		 * @param {orion.editor.KeyMode} mode the key mode.
		 */
		removeKeyMode: function (mode) {
			var keyModes = this._keyModes;
			for (var i=0; i<keyModes.length; i++) {
				if (keyModes[i] === mode) {
					keyModes.splice(i, 1);
					break;
				}
			}
			//TODO: API needed for this
			if (mode._modeRemoved) {
				mode._modeRemoved();
			}
		},
		/**
		 * Removes a ruler from the text view.
		 *
		 * @param {orion.editor.Ruler} ruler the ruler.
		 */
		removeRuler: function (ruler) {
			var rulers = this._rulers;
			for (var i=0; i<rulers.length; i++) {
				if (rulers[i] === ruler) {
					rulers.splice(i, 1);
					ruler.setView(null);
					this._destroyRuler(ruler);
					this._update();
					break;
				}
			}
		},
		resize: function() {
			if (!this._clientDiv) { return; }
			this._handleResize(null);
		},
		/**
		 * @class This object describes an action for the text view.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView}<br/>
		 * {@link orion.editor.TextView#setAction}
		 * </p>		 
		 * @name orion.editor.ActionDescription
		 *
		 * @property {String} [name] the name to be used when showing the action as text.
		 */
		/**
		 * Associates an application defined handler to an action ID.
		 * <p>
		 * If the action ID is a predefined action, the given handler executes before
		 * the default action handler.  If the given handler returns <code>true</code>, the
		 * default action handler is not called.
		 * </p>
		 *
		 * @param {String} actionID the action ID.
		 * @param {Function} handler the action handler.
		 * @param {orion.editor.ActionDescription} [actionDescription=undefined] the action description.
		 *
		 * @see orion.editor.TextView#getActions
		 * @see orion.editor.TextView#invokeAction
		 */
		setAction: function(actionID, handler, actionDescription) {
			if (!actionID) { return; }
			var actions = this._actions;
			var action = actions[actionID];
			if (!action) { 
				action = actions[actionID] = {};
			}
			action.handler = handler;
			if (actionDescription !== undefined) {
				action.actionDescription = actionDescription;
			}
		},
		/**
		 * Associates a key binding with the given action ID. Any previous
		 * association with the specified key binding is overwriten. If the
		 * action ID is <code>null</code>, the association is removed.
		 * 
		 * @param {orion.KeyBinding} keyBinding the key binding
		 * @param {String} actionID the action ID
		 */
		setKeyBinding: function(keyBinding, actionID) {
			this._keyModes[0].setKeyBinding(keyBinding, actionID);
		},
		/**
		 * Sets the caret offset relative to the start of the document.
		 *
		 * @param {Number} caret the caret offset relative to the start of the document.
		 * @param {Boolean|Number|orion.editor.TextViewShowOptions} [show=true]
		 * 					if <code>true</code>, the view will scroll the minimum amount necessary to show the caret location. If
		 *					<code>show</code> is a <code>Number</code>, the view will scroll the minimum amount necessary to show the caret location plus a
		 *					percentage of the client area height. The parameter is clamped to the [0,1] range.  In either case, the view will only scroll
		 *					if the new caret location is not visible already.  The <code>show</code> parameter can also be a <code>orion.editor.TextViewShowOptions</code> object. See
		 * 					{@link orion.editor.TextViewShowOptions} for further information in how the options can be used to control the scrolling behavior.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away.
		 *
		 * @see orion.editor.TextView#getCaretOffset
		 * @see orion.editor.TextView#setSelection
		 * @see orion.editor.TextView#getSelection
		 */
		setCaretOffset: function(offset, show, callback) {
			var charCount = this._model.getCharCount();
			offset = Math.max(0, Math.min (offset, charCount));
			var selection = new Selection(offset, offset, false);
			this._setSelection (selection, show === undefined || show, true, callback);
		},
		/**
		 * Sets the horizontal pixel.
		 * <p>
		 * The horizontal pixel is the pixel position that is currently at
		 * the left edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @param {Number} pixel the horizontal pixel.
		 *
		 * @see orion.editor.TextView#getHorizontalPixel
		 * @see orion.editor.TextView#convert
		 */
		setHorizontalPixel: function(pixel) {
			if (!this._clientDiv) { return; }
			pixel = Math.max(0, pixel);
			this._scrollView(pixel - this._getScroll().x, 0);
		},
		/**
		 * Sets whether the view should update the DOM.
		 * <p>
		 * This can be used to improve the performance.
		 * </p><p>
		 * When the flag is set to <code>true</code>,
		 * the entire view is marked as needing to be redrawn. 
		 * Nested calls to this method are stacked.
		 * </p>
		 *
		 * @param {Boolean} redraw the new redraw state
		 * 
		 * @see orion.editor.TextView#redraw
		 */
		setRedraw: function(redraw) {
			if (redraw) {
				if (--this._redrawCount === 0) {
					this.redraw();
				}
			} else {
				this._redrawCount++;
			}
		},
		/**
		 * Sets the text model of the text view.
		 *
		 * @param {orion.editor.TextModel} model the text model of the view.
		 */
		setModel: function(model) {
			if (model === this._model) { return; }
			model = model || new mTextModel.TextModel();
			this._model.removeEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-1$
			this._model.removeEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-1$
			var oldLineCount = this._model.getLineCount();
			var oldCharCount = this._model.getCharCount();
			var newLineCount = model.getLineCount();
			var newCharCount = model.getCharCount();
			var newText = model.getText();
			var e = {
				type: "ModelChanging", //$NON-NLS-1$
				text: newText,
				start: 0,
				removedCharCount: oldCharCount,
				addedCharCount: newCharCount,
				removedLineCount: oldLineCount,
				addedLineCount: newLineCount
			};
			this.onModelChanging(e);
			this._model = model;
			e = {
				type: "ModelChanged", //$NON-NLS-1$
				start: 0,
				removedCharCount: oldCharCount,
				addedCharCount: newCharCount,
				removedLineCount: oldLineCount,
				addedLineCount: newLineCount
			};
			this.onModelChanged(e); 
			this._model.addEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-1$
			this._model.addEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-1$
			this._reset();
			this._update();
		},
		/**
		 * Sets the view options for the view.
		 *
		 * @param {orion.editor.TextViewOptions} options the view options.
		 * 
		 * @see orion.editor.TextView#getOptions
		 */
		setOptions: function (options) {
			var defaultOptions = this._defaultOptions();
			for (var option in options) {
				if (options.hasOwnProperty(option)) {
					var newValue = options[option], oldValue = this["_" + option]; //$NON-NLS-1$
					if (compare(oldValue, newValue)) { continue; }
					var update = defaultOptions[option] ? defaultOptions[option].update : null;
					if (update) {
						update.call(this, newValue);
						continue;
					}
					this["_" + option] = clone(newValue); //$NON-NLS-1$
				}
			}
			this.onOptions({type: "Options", options: options}); //$NON-NLS-1$
		},
		/**
		 * @class This object describes the selection show options.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.TextView#setSelection}
		 * {@link orion.editor.TextView#setCaretOffset}	 
		 * {@link orion.editor.TextView#showSelection}	 
		 * </p>		 
		 * @name orion.editor.TextViewShowOptions
		 *
		 * @property {String} viewAnchor the view anchor.  The view anchor can be one of these values:
		 * <p>
		 * <ul>
		 *   <li>"top" - align the selection to the top of the view client area.</li>
		 *   <li>"bottom" - align the selection to the bottom of the view client area.</li>
		 *   <li>"center" - align the selection to the center of the view client area.</li>
		 *   <li> by default - align the selection to the top or bottom of the client area depending on whether the caret is above or below the client area respectively. </li>
		 * </ul>
		 * </p>
		 * @property {Number} [viewAnchorOffset=0] an offset from the view anchor. The offset is a percentage of the client area height and it is clamped to [0-1] range.
		 * @property {String} [selectionAnchor=caret] the selection anchor. The seleciton anchor can be one of these values:
		 * <p>
		 * <ul>
		 *   <li>"top" - align the top of the selection to the view anchor.</li>
		 *   <li>"bottom" - align the bottom of the selection to the view anchor.</li>
		 *   <li>"center" - align the center of the selection to the view anchor.</li>
		 *   <li> by default - align the top or bottom of the selection to the view anchor depending on whether the caret is at the start or end of the selection. </li>
		 * </ul>
		 * </p>
		 * @property {String} [scrollPolicy] the scroll policy. The scroll policy can be one of these values:
		 * <p>
		 * <ul>
		 *   <li>"always" - always scroll vertically to the desired pixel offset even if the caret is already visible.</li>
		 *   <li> by default - only scroll if the caret is not visible. </li>
		 * </ul>
		 * </p>
		 */
		/**
		 * Sets the text view selection.
		 * <p>
		 * The selection is defined by a start and end character offset relative to the
		 * document. The character at end offset is not included in the selection.
		 * </p>
		 * <p>
		 * The caret is always placed at the end offset. The start offset can be
		 * greater than the end offset to place the caret at the beginning of the
		 * selection.
		 * </p>
		 * <p>
		 * Clamps out of range offsets.
		 * </p>
		 * 
		 * @param {Number} start the start offset of the selection
		 * @param {Number} end the end offset of the selection
		 * @param {Boolean|Number|orion.editor.TextViewShowOptions} [show=true]
		 * 					if <code>true</code>, the view will scroll the minimum amount necessary to show the caret location. If
		 *					<code>show</code> is a <code>Number</code>, the view will scroll the minimum amount necessary to show the caret location plus a
		 *					percentage of the client area height. The parameter is clamped to the [0,1] range.  In either case, the view will only scroll
		 *					if the new caret location is not visible already.  The <code>show</code> parameter can also be a <code>orion.editor.TextViewShowOptions</code> object. See
		 * 					{@link orion.editor.TextViewShowOptions} for further information in how the options can be used to control the scrolling behavior.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away.
		 *
		 * @see orion.editor.TextView#getSelection
		 */
		setSelection: function (start, end, show, callback) {
			var caret = start > end;
			if (caret) {
				var tmp = start;
				start = end;
				end = tmp;
			}
			var charCount = this._model.getCharCount();
			start = Math.max(0, Math.min (start, charCount));
			end = Math.max(0, Math.min (end, charCount));
			var selection = new Selection(start, end, caret);
			this._setSelection(selection, show === undefined || show, true, callback);
		},
		setSelections: function (ranges, show, callback) {
			var selections = this._rangesToSelections(ranges);
			this._setSelection(selections, show === undefined || show, true, callback);
		},
		/**
		 * Replaces the text in the given range with the given text.
		 * <p>
		 * The character at the end offset is not replaced.
		 * </p>
		 * <p>
		 * When both <code>start</code> and <code>end</code> parameters
		 * are not specified, the text view places the caret at the beginning
		 * of the document and scrolls to make it visible.
		 * </p>
		 *
		 * @param {String} text the new text.
		 * @param {Number} [start=0] the start offset of text range.
		 * @param {Number} [end=char count] the end offset of text range.
		 * @param {Boolean|Number|orion.editor.TextViewShowOptions} [show=true]
		 * 					if <code>true</code>, the view will scroll the minimum amount necessary to show the caret location. If
		 *					<code>show</code> is a <code>Number</code>, the view will scroll the minimum amount necessary to show the caret location plus a
		 *					percentage of the client area height. The parameter is clamped to the [0,1] range.  In either case, the view will only scroll
		 *					if the new caret location is not visible already.  The <code>show</code> parameter can also be a <code>orion.editor.TextViewShowOptions</code> object. See
		 * 					{@link orion.editor.TextViewShowOptions} for further information in how the options can be used to control the scrolling behavior.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away.
		 *
		 * @see orion.editor.TextView#getText
		 */
		setText: function (text, start, end, show, callback) {
			var isSingle = typeof text === "string"; //$NON-NLS-1$
			var reset = start === undefined && end === undefined && isSingle;
			var edit;
			if (isSingle) {
				if (start === undefined) { start = 0; }
				if (end === undefined) { end = this._model.getCharCount(); }
				edit = {text: text, selection: [new Selection(start, end, false)]};
			} else {
				edit = text;
				edit.selection = this._rangesToSelections(edit.selection);
			}
			edit._code = true;
			if (reset) {
				this._variableLineHeight = false;
			}
			this._modifyContent(edit, !reset, show === undefined || show, callback);
			if (reset) {
				/*
				* Bug in Firefox.  For some reason, the caret does not show after the
				* view is refreshed.  The fix is to toggle the contentEditable state and
				* force the clientDiv to loose and receive focus if it is focused.
				*/
				if (util.isFirefox < 13) {
					this._fixCaret();
				}
			}
		},
		/**
		 * Sets the top index.
		 * <p>
		 * The top index is the line that is currently at the top of the text view.  This
		 * line may be partially visible depending on the vertical scroll of the view.
		 * </p>
		 *
		 * @param {Number} topIndex the index of the top line.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away.
		 *
		 * @see orion.editor.TextView#getBottomIndex
		 * @see orion.editor.TextView#getTopIndex
		 */
		setTopIndex: function(topIndex, callback) {
			if (!this._clientDiv) { return; }
			this._scrollViewAnimated(0, this._getLinePixel(Math.max(0, topIndex)) - this._getScroll().y, callback);
		},
		/**
		 * Sets the top pixel.
		 * <p>
		 * The top pixel is the pixel position that is currently at
		 * the top edge of the view.  This position is relative to the
		 * beginning of the document.
		 * </p>
		 *
		 * @param {Number} pixel the top pixel.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away.
		 *
		 * @see orion.editor.TextView#getBottomPixel
		 * @see orion.editor.TextView#getTopPixel
		 * @see orion.editor.TextView#convert
		 */
		setTopPixel: function(pixel, callback) {
			if (!this._clientDiv) { return; }
			this._scrollViewAnimated(0, Math.max(0, pixel) - this._getScroll().y, callback);
		},
		/**
		 * Scrolls the selection into view if needed.
		 *
 		 * @param {Number|orion.editor.TextViewShowOptions} [show=0]
		 * 					If <code>show</code> is a <code>Number</code>, the view will scroll the minimum amount necessary to show the caret location plus a
		 *					percentage of the client area height. The parameter is clamped to the [0,1] range.  The view will only scroll
		 *					if the new caret location is not visible already.  The <code>show</code> parameter can also be a <code>orion.editor.TextViewShowOptions</code> object. See
		 * 					{@link orion.editor.TextViewShowOptions} for further information in how the options can be used to control the scrolling behavior.
		 * @param {Function} [callback] if callback is specified and <code>scrollAnimation</code> is not zero, view scrolling is animated and
		 *					the callback is called when the animation is done. Otherwise, callback is callback right away.
		 *
		 * @returns {Boolean} true if the view was scrolled.
		 *
		 * @see orion.editor.TextView#getSelection
		 * @see orion.editor.TextView#setSelection
		 * @see orion.editor.TextView#setCaretOffset
		 */
		showSelection: function(show, callback) {
			return this._showCaret(show ? false : true, callback, show);
		},
		update: function(styleChanged, sync) {
			if (!this._clientDiv) { return; }
			if (styleChanged || this._metrics.invalid) {
				this._updateStyle();
			}
			if (sync === undefined || sync) {
				this._update();
			} else {
				this._queueUpdate();
			}
		},
		
		/**************************************** Event handlers *********************************/
		_handleRootMouseDown: function (e) {
			this._cancelCheckSelection();
			if (this._ignoreEvent(e)) { return; }
			if (util.isFirefox < 13 && e.which === 1) {
				this._clientDiv.contentEditable = false;
				(this._overlayDiv || this._clientDiv).draggable = true;
				this._ignoreBlur = true;
			}
			
			/* Prevent clicks outside of the client div from taking focus away. */
			var topNode = this._overlayDiv || this._clientDiv;
			/* Use view div on IE 8 otherwise it is not possible to scroll. */
			if (util.isIE < 9) { topNode = this._viewDiv; }
			var temp = e.target ? e.target : e.srcElement;
			while (temp) {
				if (topNode === temp) {
					return;
				}
				if (temp.className && temp.className.indexOf("textViewFind") !== -1) { //$NON-NLS-1$
					return;
				}
				temp = temp.parentNode;
			}
			if (e.preventDefault) { e.preventDefault(); }
			if (e.stopPropagation){ e.stopPropagation(); }
			if (!this._isW3CEvents) {
				/*
				* In IE 8 is not possible to prevent the default handler from running
				* during mouse down event using usual API. The workaround is to give
				* focus back to the client div.
				*/ 
				var that = this;
				var win = this._getWindow();
				win.setTimeout(function() {
					that._clientDiv.focus();
				}, 0);
			}
		},
		_handleRootMouseUp: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (util.isFirefox < 13 && e.which === 1) {
				this._clientDiv.contentEditable = true;
				(this._overlayDiv || this._clientDiv).draggable = false;
			}
			if (util.isFirefox && e.which === 1) {
				
				/*
				* Bug in Firefox.  For some reason, Firefox stops showing the caret
				* in some cases. For example when the user cancels a drag operation 
				* by pressing ESC.  The fix is to detect that the drag operation was
				* cancelled,  toggle the contentEditable state and force the clientDiv
				* to loose and receive focus if it is focused.
				*/
				this._fixCaret();
				this._ignoreBlur = false;
			}
		},
		_handleBlur: function () {
			this._cancelCheckSelection();
			if (this._ignoreBlur) { return; }
			this._commitIME();
			this._hasFocus = false;
			/*
			* Bug in IE 8 and earlier. For some reason when text is deselected
			* the overflow selection at the end of some lines does not get redrawn.
			* The fix is to create a DOM element in the body to force a redraw.
			*/
			if (util.isIE < 9) {
				if (!this._getSelections()[0].isEmpty()) {
					var rootDiv = this._rootDiv;
					var child = util.createElement(rootDiv.ownerDocument, "div"); //$NON-NLS-1$
					rootDiv.appendChild(child);
					rootDiv.removeChild(child);
				}
			}
			if (this._cursorDiv) {
				this._cursorDiv.style.display = "none"; //$NON-NLS-1$
			}
			if (this._domSelection) {
				this._domSelection.forEach(function(domSelection) { domSelection.update(); });
				/* Clear browser selection if selection is within clientDiv */
				var temp;
				var win = this._getWindow();
				var doc = this._parent.ownerDocument;
				if (win.getSelection) {
					var sel = win.getSelection();
					temp = sel.anchorNode;
					while (temp) {
						if (temp === this._clientDiv) {
							if (sel.rangeCount > 0) { sel.removeAllRanges(); }
							break;
						}
						temp = temp.parentNode;
					}
				} else if (doc.selection) {
					this._ignoreSelect = false;
					temp = doc.selection.createRange().parentElement();
					while (temp) {
						if (temp === this._clientDiv) {
							doc.selection.empty();
							break;
						}
						temp = temp.parentNode;
					}
					this._ignoreSelect = true;
				}
			}
			if (!this._ignoreFocus) {
				this.onBlur({type: "Blur"}); //$NON-NLS-1$
			}
		},
		_handleCompositionStart: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this._imeTimeout) {
				var win = this._getWindow();
				win.clearTimeout(this._imeTimeout);
				this._imeTimeout = null;
			}
			if (this._imeText) {
				this._commitIME(this._imeText);
				this._imeText = null;
			}
			this._startIME();
			if (this._mutationObserver) {
				this._mutationObserver.disconnect();
				this._mutationObserver = null;
			}
		},
		_handleCompositionUpdate: function(e) {
			if (this._ignoreEvent(e)) { return; }
			this._imeText = e.data;
		},
		_handleCompositionEnd: function (e) {
			if (this._ignoreEvent(e)) { return; }
			this._imeText = e.data;
			var win = this._getWindow();
			this._imeTimeout = win.setTimeout(function() {
				this._commitIME(this._imeText);
				this._imeText = this._imeTimeout = null;
			}.bind(this), 0);
		},
		_handleContextMenu: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (util.isIE && this._lastMouseButton === 3) {
				// We need to update the DOM selection, because on
				// right-click the caret moves to the mouse location.
				// See bug 366312 and 376508.
				this._updateDOMSelection();
			}
			var preventDefault = false;
			if (this.isListening("ContextMenu")) { //$NON-NLS-1$
				var evt = this._createMouseEvent("ContextMenu", e); //$NON-NLS-1$
				evt.screenX = e.screenX;
				evt.screenY = e.screenY;
				this.onContextMenu(evt);
				preventDefault = evt.defaultPrevented;
			} else if (util.isMac && util.isFirefox && e.button === 0) {
				// hack to prevent CTRL+Space from showing the browser context menu
				preventDefault = true;
			}
			if (preventDefault) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			} else {
				this._contextMenuOpen = true;
				if (util.isFirefox) {
					this._checkSelectionChange = true;
					this._pollSelectionChange(true);
				}
			}
		},
		_handleCopy: function (e) {
			this._cancelCheckSelection();
			if (this._ignoreEvent(e)) { return; }
			if (this._ignoreCopy) { return; }
			if (this._doCopy(e)) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleCut: function (e) {
			this._cancelCheckSelection();
			if (this._ignoreEvent(e)) { return; }
			if (this._doCut(e)) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDataModified: function(e) {
			if (this._ignoreEvent(e)) { return; }
			this._startIME();
		},
		_handleDblclick: function (e) {
			if (this._ignoreEvent(e)) { return; }
			var time = e.timeStamp ? e.timeStamp : Date.now();
			this._lastMouseTime = time;
			if (this._clickCount !== 2) {
				this._clickCount = 2;
				this._handleMouse(e);
			}
		},
		_handleDragStart: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (util.isFirefox < 13) {
				var that = this;
				var win = this._getWindow();
				win.setTimeout(function() {
					that._clientDiv.contentEditable = true;
					that._clientDiv.draggable = false;
					that._ignoreBlur = false;
				}, 0);
			}
			if (this.isListening("DragStart") && this._dragOffset !== -1) { //$NON-NLS-1$
				this._isMouseDown = false;
				this.onDragStart(this._createMouseEvent("DragStart", e)); //$NON-NLS-1$
				this._dragOffset = -1;
			} else {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDrag: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this.isListening("Drag")) { //$NON-NLS-1$
				this.onDrag(this._createMouseEvent("Drag", e)); //$NON-NLS-1$
			}
		},
		_handleDragEnd: function (e) {
			if (this._ignoreEvent(e)) { return; }
			this._dropTarget = false;
			this._dragOffset = -1;
			if (this.isListening("DragEnd")) { //$NON-NLS-1$
				this.onDragEnd(this._createMouseEvent("DragEnd", e)); //$NON-NLS-1$
			}
			if (util.isFirefox < 13) {
				this._fixCaret();
				/*
				* Bug in Firefox.  For some reason, Firefox stops showing the caret when the 
				* selection is dropped onto itself. The fix is to detected the case and 
				* call fixCaret() a second time.
				*/
				if (e.dataTransfer.dropEffect === "none" && !e.dataTransfer.mozUserCancelled) { //$NON-NLS-1$
					this._fixCaret();
				}
			}
		},
		_handleDragEnter: function (e) {
			if (this._ignoreEvent(e)) { return; }
			var prevent = true;
			this._dropTarget = true;
			if (this.isListening("DragEnter")) { //$NON-NLS-1$
				prevent = false;
				this.onDragEnter(this._createMouseEvent("DragEnter", e)); //$NON-NLS-1$
			}
			/*
			* Webkit will not send drop events if this event is not prevented, as spec in HTML5.
			* Firefox and IE do not follow this spec for contentEditable. Note that preventing this 
			* event will result is loss of functionality (insertion mark, etc).
			*/
			if (util.isWebkit || prevent) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDragOver: function (e) {
			if (this._ignoreEvent(e)) { return; }
			var prevent = true;
			if (this.isListening("DragOver")) { //$NON-NLS-1$
				prevent = false;
				this.onDragOver(this._createMouseEvent("DragOver", e)); //$NON-NLS-1$
			}
			/*
			* Webkit will not send drop events if this event is not prevented, as spec in HTML5.
			* Firefox and IE do not follow this spec for contentEditable. Note that preventing this 
			* event will result is loss of functionality (insertion mark, etc).
			*/
			if (util.isWebkit || prevent) {
				if (prevent) { e.dataTransfer.dropEffect = "none"; } //$NON-NLS-1$
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleDragLeave: function (e) {
			if (this._ignoreEvent(e)) { return; }
			this._dropTarget = false;
			if (this.isListening("DragLeave")) { //$NON-NLS-1$
				this.onDragLeave(this._createMouseEvent("DragLeave", e)); //$NON-NLS-1$
			}
		},
		_handleDrop: function (e) {
			if (this._ignoreEvent(e)) { return; }
			this._dropTarget = false;
			if (this.isListening("Drop")) { //$NON-NLS-1$
				this.onDrop(this._createMouseEvent("Drop", e)); //$NON-NLS-1$
			}
			/*
			* This event must be prevented otherwise the user agent will modify
			* the DOM. Note that preventing the event on some user agents (i.e. IE)
			* indicates that the operation is cancelled. This causes the dropEffect to 
			* be set to none  in the dragend event causing the implementor to not execute
			* the code responsible by the move effect.
			*/
			if (e.preventDefault) { e.preventDefault(); }
			return false;
		},
		_handleFocus: function () {
			this._hasFocus = true;
			if (util.isIOS && this._lastTouchOffset !== undefined) {
				this.setCaretOffset(this._lastTouchOffset, true);
				this._lastTouchOffset = undefined;
			} else {
				this._updateDOMSelection();
			}
			if (this._cursorDiv) {
				this._cursorDiv.style.display = "block"; //$NON-NLS-1$
			}
			if (this._domSelection) {
				this._domSelection.forEach(function(domSelection) { domSelection.update(); });
			}
			if (!this._ignoreFocus) {
				this.onFocus({type: "Focus"}); //$NON-NLS-1$
			}
		},
		_handleKeyDown: function (e) {
			this._cancelCheckSelection();
			if (this._ignoreEvent(e)) {	return;	}
			if (this.isListening("KeyDown")) { //$NON-NLS-1$
				var keyEvent = this._createKeyEvent("KeyDown", e); //$NON-NLS-1$
				this.onKeyDown(keyEvent); //$NON-NLS-1$
				if (keyEvent.defaultPrevented) {
					/*
					* Feature in Firefox. Keypress events still happen even if the keydown event
					* was prevented. The fix is to remember that keydown was prevented and prevent
					* the keypress ourselves.
					*/
					if (util.isFirefox) {
						this._keyDownPrevented = true;
					}
					e.preventDefault();
					return;
				}
			}
			var modifier = false;
			switch (e.keyCode) {
				case 16: /* Shift */
				case 17: /* Control */
				case 18: /* Alt */
				case 91: /* Command */
					modifier = true;
					break;
				default:
					this._setLinksVisible(false);
			}
			if (e.keyCode === 229) {
				if (this._readonly) {
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
				var startIME = true;
				
				/*
				* Bug in Safari. Some Control+key combinations send key events
				* with keyCode equals to 229. This is unexpected and causes the
				* view to start an IME composition. The fix is to ignore these
				* events.
				*/
				if (util.isSafari && util.isMac) {
					if (e.ctrlKey) {
						startIME = false;
						e.keyCode = 0x81;
					}
				}
				if (startIME) {
					this._startIME();
				}
			} else {
				if (!modifier) {
					this._commitIME();
				}
			}
			/*
			* Feature in Firefox. When a key is held down the browser sends 
			* right number of keypress events but only one keydown. This is
			* unexpected and causes the view to only execute an action
			* just one time. The fix is to ignore the keydown event and 
			* execute the actions from the keypress handler.
			* Note: This only happens on the Mac and Linux (Firefox 3.6).
			*
			* Feature in Opera < 12.16.  Opera sends keypress events even for non-printable
			* keys.  The fix is to handle actions in keypress instead of keydown.
			*/
			if (((util.isMac || util.isLinux) && util.isFirefox < 4) || util.isOpera < 12.16) {
				this._keyDownEvent = e;
				return true;
			}
			
			if (this._doAction(e)) {
				if (e.preventDefault) {
					e.preventDefault(); 
					e.stopPropagation(); 
				} else {
					e.cancelBubble = true;
					e.returnValue = false;
					e.keyCode = 0;
				}
				return false;
			}
		},
		_handleKeyPress: function (e) {
			if (this._ignoreEvent(e)) { return; }
			/*
			* Feature in Firefox. Keypress events still happen even if the keydown event
			* was prevented. The fix is to remember that keydown was prevented and prevent
			* the keypress ourselves.
			*/
			if (this._keyDownPrevented) { 
				if (e.preventDefault) {
					e.preventDefault(); 
					e.stopPropagation(); 
				} 
				this._keyDownPrevented = undefined;
				return;
			}
			/*
			* Feature in Embedded WebKit.  Embedded WekKit on Mac runs in compatibility mode and
			* generates key press events for these Unicode values (Function keys).  This does not
			* happen in Safari or Chrome.  The fix is to ignore these key events.
			*/
			if (util.isMac && util.isWebkit) {
				if ((0xF700 <= e.keyCode && e.keyCode <= 0xF7FF) || e.keyCode === 13 || e.keyCode === 8) {
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
			}
			if (((util.isMac || util.isLinux) && util.isFirefox < 4) || util.isOpera < 12.16) {
				if (this._doAction(this._keyDownEvent)) {
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
			}
			var ctrlKey = util.isMac ? e.metaKey : e.ctrlKey;
			if (e.charCode !== undefined) {
				if (ctrlKey) {
					switch (e.charCode) {
						/*
						* In Firefox and Safari if ctrl+v, ctrl+c ctrl+x is canceled
						* the clipboard events are not sent. The fix to allow
						* the browser to handles these key events.
						*/
						case 99://c
						case 118://v
						case 120://x
							return true;
					}
				}
			}
			if (this.isListening("KeyPress")) { //$NON-NLS-1$
				var keyEvent = this._createKeyEvent("KeyPress", e); //$NON-NLS-1$
				this.onKeyPress(keyEvent); //$NON-NLS-1$
				if (keyEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
			}
			if (this._doAction(e)) {
				if (e.preventDefault) {
					e.preventDefault(); 
					e.stopPropagation(); 
				} else {
					e.cancelBubble = true;
					e.returnValue = false;
					e.keyCode = 0;
				}
				return false;
			}
			var ignore = false;
			if (util.isMac) {
				if (e.ctrlKey || e.metaKey) { ignore = true; }
			} else {
				if (util.isFirefox) {
					//Firefox clears the state mask when ALT GR generates input
					if (e.ctrlKey || e.altKey) { ignore = true; }
				} else {
					//IE and Chrome only send ALT GR when input is generated
					if (e.ctrlKey ^ e.altKey) { ignore = true; }
				}
			}
			if (!ignore) {
				var key = util.isOpera ? e.which : (e.charCode !== undefined ? e.charCode : e.keyCode);
				if (key > 31) {
					this._doContent(String.fromCharCode (key));
					if (e.preventDefault) { e.preventDefault(); }
					return false;
				}
			}
		},
		_handleDocKeyUp: function (e) {
			var ctrlKey = util.isMac ? e.metaKey : e.ctrlKey;
			if (!ctrlKey) {
				this._setLinksVisible(false);
			}
		},
		_handleKeyUp: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this.isListening("KeyUp")) { //$NON-NLS-1$
				var keyEvent = this._createKeyEvent("KeyUp", e); //$NON-NLS-1$
				this.onKeyUp(keyEvent); //$NON-NLS-1$
				if (keyEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
			}
			this._handleDocKeyUp(e);
			// don't commit for space (it happens during JP composition)  
			if (e.keyCode === 13) {
				this._commitIME();
			}
		},
		_handleLinkClick: function (e) {
			var ctrlKey = util.isMac ? e.metaKey : e.ctrlKey;
			if (!ctrlKey) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleMouse: function (e) {
			var win = this._getWindow();
			var result = true;
			var target = win;
			if (util.isIE || (util.isFirefox && !this._overlayDiv)) { target = this._clientDiv; }
			if (this._overlayDiv) {
				if (this._hasFocus) {
					this._ignoreFocus = true;
				}
				var that = this;
				win.setTimeout(function () {
					that.focus();
					that._ignoreFocus = false;
				}, 0);
			}
			var extend = e.shiftKey;
			var block = e.altKey;
			var add = util.isMac ? e.metaKey : e.ctrlKey;
			this._blockSelection = this._doubleClickSelection = null;
			if (this._clickCount === 1) {
				var drag = (!util.isOpera || util.isOpera >= 12.16) && this._hasFocus && this.isListening("DragStart"); //$NON-NLS-1$
				result = this._setSelectionTo(e.clientX, e.clientY, true, extend, add, drag);
				if (result) { this._setGrab(target); }
			} else {
				/*
				* Feature in IE8 and older, the sequence of events in the IE8 event model
				* for a doule-click is:
				*
				*	down
				*	up
				*	up
				*	dblclick
				*
				* Given that the mouse down/up events are not balanced, it is not possible to
				* grab on mouse down and ungrab on mouse up.  The fix is to grab on the first
				* mouse down and ungrab on mouse move when the button 1 is not set.
				*/
				if (this._isW3CEvents) { this._setGrab(target); }
				
				this._setSelectionTo(e.clientX, e.clientY, true, extend, add, false);
				this._doubleClickSelection = Selection.editing(this._getSelections());
			}
			if (block) {
				this._blockSelection = Selection.editing(this._getSelections());
			}
			return result;
		},
		_handleMouseDown: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this._linksVisible) {
				var target = e.target || e.srcElement;
				if (target.tagName !== "A") { //$NON-NLS-1$
					this._setLinksVisible(false);
				} else {
					return;
				}
			}
			this._commitIME();

			var button = e.which; // 1 - left, 2 - middle, 3 - right
			if (!button) { 
				// if IE 8 or older
				if (e.button === 4) { button = 2; }
				if (e.button === 2) { button = 3; }
				if (e.button === 1) { button = 1; }
			}

			// For middle click we always need getTime(). See _getClipboardText().
			var time = button !== 2 && e.timeStamp ? e.timeStamp : Date.now();
			var timeDiff = time - this._lastMouseTime;
			var deltaX = Math.abs(this._lastMouseX - e.clientX);
			var deltaY = Math.abs(this._lastMouseY - e.clientY);
			var sameButton = this._lastMouseButton === button;
			this._lastMouseX = e.clientX;
			this._lastMouseY = e.clientY;
			this._lastMouseTime = time;
			this._lastMouseButton = button;

			if (button === 1) {
				this._isMouseDown = true;
				if (sameButton && timeDiff <= this._clickTime && deltaX <= this._clickDist && deltaY <= this._clickDist) {
					this._clickCount++;
				} else {
					this._clickCount = 1;
				}
			}
			if (this.isListening("MouseDown")) { //$NON-NLS-1$
				var mouseEvent = this._createMouseEvent("MouseDown", e); //$NON-NLS-1$
				this.onMouseDown(mouseEvent);
				if (mouseEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
			}
			if (button === 1) {
				if (this._handleMouse(e) && (util.isIE >= 9 || util.isOpera || util.isChrome || util.isSafari || (util.isFirefox && !this._overlayDiv))) {
					if (!this._hasFocus) {
						this.focus();
					}
					e.preventDefault();
				}
			}
			if (util.isFirefox && this._lastMouseButton === 3) {
				// We need to update the DOM selection, because on
				// right-click the caret moves to the mouse location.
				// See bug 366312 and 376508.
				this._updateDOMSelection();
			}
		},
		_handleMouseOver: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this._animation) { return; }
			if (this.isListening("MouseOver")) { //$NON-NLS-1$
				this.onMouseOver(this._createMouseEvent("MouseOver", e)); //$NON-NLS-1$
			}
		},
		_handleMouseOut: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this._animation) { return; }
			if (this.isListening("MouseOut")) { //$NON-NLS-1$
				this.onMouseOut(this._createMouseEvent("MouseOut", e)); //$NON-NLS-1$
			}
		},
		_handleMouseMove: function (e) {
			if (this._animation) { return; }
			var inClient = this._isClientDiv(e);
			if (this.isListening("MouseMove")) { //$NON-NLS-1$
				if (inClient || this._isMouseDown){
					var mouseEvent = this._createMouseEvent("MouseMove", e); //$NON-NLS-1$
					this.onMouseMove(mouseEvent);
					if (mouseEvent.defaultPrevented) {
						e.preventDefault();
						return;
					}
				}
			}
			if (this._dropTarget) {
				return;
			}
			/*
			* Bug in IE9. IE sends one mouse event when the user changes the text by
			* pasting or undo.  These operations usually happen with the Ctrl key
			* down which causes the view to enter link mode.  Link mode does not end
			* because there are no further events.  The fix is to only enter link
			* mode when the coordinates of the mouse move event have changed.
			*/
			var changed = this._linksVisible || this._lastMouseMoveX !== e.clientX || this._lastMouseMoveY !== e.clientY;
			this._lastMouseMoveX = e.clientX;
			this._lastMouseMoveY = e.clientY;
			this._setLinksVisible(changed && !this._isMouseDown && e.altKey && (util.isMac ? e.metaKey : e.ctrlKey));

			this._checkOverlayScroll();

			/*
			* Feature in IE8 and older, the sequence of events in the IE8 event model
			* for a doule-click is:
			*
			*	down
			*	up
			*	up
			*	dblclick
			*
			* Given that the mouse down/up events are not balanced, it is not possible to
			* grab on mouse down and ungrab on mouse up.  The fix is to grab on the first
			* mouse down and ungrab on mouse move when the button 1 is not set.
			*
			* In order to detect double-click and drag gestures, it is necessary to send
			* a mouse down event from mouse move when the button is still down and isMouseDown
			* flag is not set.
			*/
			if (!this._isW3CEvents) {
				if (e.button === 0) {
					this._setGrab(null);
					return true;
				}
				if (!this._isMouseDown && e.button === 1 && (this._clickCount & 1) !== 0 && inClient) {
					this._clickCount = 2;
					return this._handleMouse(e, this._clickCount);
				}
			}
			if (!this._isMouseDown || this._dragOffset !== -1) {
				return;
			}
			
			var x = e.clientX;
			var y = e.clientY;
			var viewPad = this._getViewPadding();
			var viewRect = this._viewDiv.getBoundingClientRect();
			var width = this._getClientWidth (), height = this._getClientHeight();
			var leftEdge = viewRect.left + viewPad.left;
			var topEdge = viewRect.top + viewPad.top;
			var rightEdge = viewRect.left + viewPad.left + width;
			var bottomEdge = viewRect.top + viewPad.top + height;
			if (y < topEdge) {
				this._doAutoScroll("up", x, y - topEdge); //$NON-NLS-1$
			} else if (y > bottomEdge) {
				this._doAutoScroll("down", x, y - bottomEdge); //$NON-NLS-1$
			} else if (x < leftEdge && !this._wrapMode) {
				this._doAutoScroll("left", x - leftEdge, y); //$NON-NLS-1$
			} else if (x > rightEdge && !this._wrapMode) {
				this._doAutoScroll("right", x - rightEdge, y); //$NON-NLS-1$
			} else {
				this._endAutoScroll();
				this._setSelectionTo(x, y, false, true);
			}
		},
		_isClientDiv: function(e) {
			var topNode = this._overlayDiv || this._clientDiv;
			var temp = e.target ? e.target : e.srcElement;
			while (temp) {
				if (topNode === temp) {
					return true;
				}
				temp = temp.parentNode;
			}
			return false;
		},
		_createKeyEvent: function(type, e) {
			return {
				type: type,
				event: e,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			};
		},
		_createMouseEvent: function(type, e) {
			var pt = this.convert({x: e.clientX, y: e.clientY}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-2$
			return {
				type: type,
				event: e,
				clickCount: this._clickCount,
				x: pt.x,
				y: pt.y,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			};
		},
		_createTouchEvent: function(type, e) {
			var pt = e.touches.length ? this.convert({x: e.touches[0].clientX, y: e.touches[0].clientY}, "page", "document") : {}; //$NON-NLS-1$ //$NON-NLS-2$
			return {
				type: type,
				event: e,
				touchCount: e.touches.length,
				x: pt.x,
				y: pt.y,
				preventDefault: function() {
					this.defaultPrevented = true;
				}
			};
		},
		_handleMouseUp: function (e) {
			var left = e.which ? e.button === 0 : e.button === 1;
			if (this.isListening("MouseUp")) { //$NON-NLS-1$
				if (this._isClientDiv(e) || (left && this._isMouseDown)) {
					var mouseEvent = this._createMouseEvent("MouseUp", e); //$NON-NLS-1$
					this.onMouseUp(mouseEvent);
					if (mouseEvent.defaultPrevented) {
						e.preventDefault();
						this._isMouseDown = false;
						return;
					}
				}
			}
			if (this._linksVisible) {
				return;
			}
			if (left && this._isMouseDown) {
				var selections = this._getSelections();
				var selection = Selection.editing(selections);
				selections.forEach(function(sel) {
					sel._editing = false;
				});
				if (this._dragOffset !== -1) {
					selection.extend(this._dragOffset);
					selection.collapse();
					selections = selection;
					this._dragOffset = -1;
				}
				this._setSelection(selections, false);
				this._isMouseDown = false;
				this._endAutoScroll();
				
				/*
				* Feature in IE8 and older, the sequence of events in the IE8 event model
				* for a doule-click is:
				*
				*	down
				*	up
				*	up
				*	dblclick
				*
				* Given that the mouse down/up events are not balanced, it is not possible to
				* grab on mouse down and ungrab on mouse up.  The fix is to grab on the first
				* mouse down and ungrab on mouse move when the button 1 is not set.
				*/
				if (this._isW3CEvents) { this._setGrab(null); }
			}
			/*
			* Note that there cases when Firefox sets the DOM selection in mouse up.
			* This happens for example after a cancelled drag operation.
			*
			* Note that on Chrome and IE, the caret stops blicking if mouse up is
			* prevented.
			*/
			if (left && this._isMouseDown && util.isFirefox) {
				this._updateDOMSelection();
				e.preventDefault();
			}
		},
		_handleMouseWheel: function (e) {
			if (this._noScroll) return;
			var lineHeight = this._getLineHeight();
			var pixelX = 0, pixelY = 0;
			// Note: On the Mac the correct behaviour is to scroll by pixel.
			if (util.isIE || util.isOpera) {
				pixelY = (-e.wheelDelta / 40) * lineHeight;
			} else if (util.isFirefox) {
				var limit = 256;
				if (e.type === "wheel") { //$NON-NLS-1$
					if (e.deltaMode) { // page or line
						pixelX = Math.max(-limit, Math.min(limit, e.deltaX)) * lineHeight;
						pixelY = Math.max(-limit, Math.min(limit, e.deltaY)) * lineHeight;
					} else {
						pixelX = e.deltaX;
						pixelY = e.deltaY;
					}
				} else {
					var pixel;
					if (util.isMac) {
						pixel = e.detail * 3;
					} else {
						pixel = Math.max(-limit, Math.min(limit, e.detail)) * lineHeight;
					}
					if (e.axis === e.HORIZONTAL_AXIS) {
						pixelX = pixel;
					} else {
						pixelY = pixel;
					}
				}
			} else {
				//Webkit
				if (util.isMac) {
					/*
					* In Safari, the wheel delta is a multiple of 120. In order to
					* convert delta to pixel values, it is necessary to divide delta
					* by 40.
					*
					* In Chrome and Safari 5, the wheel delta depends on the type of the
					* mouse. In general, it is the pixel value for Mac mice and track pads,
					* but it is a multiple of 120 for other mice. There is no presise
					* way to determine if it is pixel value or a multiple of 120.
					* 
					* Note that the current approach does not calculate the correct
					* pixel value for Mac mice when the delta is a multiple of 120.
					*
					* For values that are multiples of 120, the denominator varies on
					* the time between events.
					*/
					var denominatorX, denominatorY;
					var deltaTime = e.timeStamp - this._wheelTimeStamp;
					this._wheelTimeStamp = e.timeStamp;
					if (e.wheelDeltaX % 120 !== 0) { 
						denominatorX = 1; 
					} else {
						denominatorX = deltaTime < 40 ? 40/(40-deltaTime) : 40;
					}
					if (e.wheelDeltaY % 120 !== 0) { 
						denominatorY = 1; 
					} else {
						denominatorY = deltaTime < 40 ? 40/(40-deltaTime) : 40; 
					}
					pixelX = Math.ceil(-e.wheelDeltaX / denominatorX);
					if (-1 < pixelX && pixelX < 0) { pixelX = -1; }
					if (0 < pixelX && pixelX < 1) { pixelX = 1; }
					pixelY = Math.ceil(-e.wheelDeltaY / denominatorY);
					if (-1 < pixelY && pixelY < 0) { pixelY = -1; }
					if (0 < pixelY && pixelY < 1) { pixelY = 1; }
				} else {
					pixelX = -e.wheelDeltaX;
					var linesToScroll = 8;
					pixelY = (-e.wheelDeltaY / 120 * linesToScroll) * lineHeight;
				}
			}
			/* 
			* Feature in Safari. If the event target is removed from the DOM 
			* safari stops smooth scrolling. The fix is keep the element target
			* in the DOM and remove it on a later time. 
			*
			* Note: Using a timer is not a solution, because the timeout needs to
			* be at least as long as the gesture (which is too long).
			*/
			if (util.isSafari || (util.isChrome && util.isMac)) {
				var lineDiv = e.target;
				while (lineDiv && lineDiv.lineIndex === undefined) {
					lineDiv = lineDiv.parentNode;
				}
				this._mouseWheelLine = lineDiv;
			}
			var oldScroll = this._getScroll();
			this._scrollView(pixelX, pixelY);
			var newScroll = this._getScroll();
			if (oldScroll.x !== newScroll.x || oldScroll.y !== newScroll.y) {
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handlePaste: function (e) {
			this._cancelCheckSelection();
			if (this._ignoreEvent(e)) { return; }
			if (this._ignorePaste) { return; }
			if (this._doPaste(e)) {
				if (util.isIE) {
					/*
					 * Bug in IE,  
					 */
					var that = this;
					this._ignoreFocus = true;
					var win = this._getWindow();
					win.setTimeout(function() {
						that._updateDOMSelection();
						that._ignoreFocus = false;
					}, 0);
				}
				if (e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_handleResize: function () {
			var newWidth = this._rootDiv.clientWidth;
			var newHeight = this._rootDiv.clientHeight;
			if (this._rootWidth !== newWidth || this._rootHeight !== newHeight) {
				if (this._rootWidth !== newWidth && this._wrapMode) {
					this._resetLineHeight();
				}
				this._rootWidth = newWidth;
				this._rootHeight = newHeight;
				/*
				* Feature in IE7. For some reason, sometimes Internet Explorer 7 
				* returns incorrect values for element.getBoundingClientRect() when 
				* inside a resize handler. The fix is to queue the work.
				*/			
				var queue = util.isIE < 9;

				/*
				* The calculated metrics may be out of date when the zoom level changes.
				*/
				var metrics = this._calculateMetrics();
				if (!compare(metrics, this._metrics)) {
					if (this._metrics.invalid && !metrics.invalid) {
						this._updateStyle(false, metrics);
					} else {
						if (this._variableLineHeight) {
							this._variableLineHeight = false;
							this._resetLineHeight();
						}
						this._metrics = metrics;
					}
					queue = true;
				}

				if (queue) {
					this._queueUpdate();
				} else {
					this._update();
				}
				this.dispatchEvent({type: "Resize"}); //$NON-NLS-1$
			}
		},
		_handleRulerEvent: function (e) {
			var target = e.target ? e.target : e.srcElement;
			var lineIndex = target.lineIndex;
			var element = target;
			while (element && !element._ruler) {
				if (lineIndex === undefined && element.lineIndex !== undefined) {
					lineIndex = element.lineIndex;
				}
				element = element.parentNode;
			}
			var ruler = element ? element._ruler : null;
			if (lineIndex === undefined && ruler && ruler.getOverview() === "document") { //$NON-NLS-1$
				var clientHeight = this._getClientHeight ();
				var lineCount = this._model.getLineCount ();
				var viewPad = this._getViewPadding();
				var viewRect = this._viewDiv.getBoundingClientRect();
				var lineHeight = this._getLineHeight();
				var contentHeight = lineHeight * lineCount;
				var trackHeight = clientHeight + viewPad.top + viewPad.bottom - 2 * this._metrics.scrollWidth;
				var divHeight, arrowWidth;
				if (contentHeight < trackHeight) {
					divHeight = lineHeight;
					arrowWidth = viewPad.top;
				} else {
					divHeight = trackHeight / lineCount;
					arrowWidth = this._metrics.scrollWidth;
				}
				lineIndex = Math.floor(((e.clientY - viewRect.top) - arrowWidth) / divHeight);
				if (!(0 <= lineIndex && lineIndex < lineCount)) {
					lineIndex = undefined;
				}
			}
			if (ruler) {
				switch (e.type) {
					case "click": //$NON-NLS-1$
						if (ruler.onClick) { ruler.onClick(lineIndex, e); }
						break;
					case "dblclick": //$NON-NLS-1$
						if (ruler.onDblClick) { ruler.onDblClick(lineIndex, e); }
						break;
					case "mousemove": //$NON-NLS-1$
						if (ruler.onMouseMove) { ruler.onMouseMove(lineIndex, e); }
						break;
					case "mouseover": //$NON-NLS-1$
						if (ruler.onMouseOver) { ruler.onMouseOver(lineIndex, e); }
						break;
					case "mouseout": //$NON-NLS-1$
						if (ruler.onMouseOut) { 
							var tmp = e.relatedTarget;
							while (tmp && tmp !== this._rootDiv) {
								if (tmp === element) {
									return;
								}
								tmp = tmp.parentNode;
							}
							ruler.onMouseOut(lineIndex, e); 
						}
						break;
				}
			}
		},
		_handleScroll: function () {
			this._lastScrollTime = Date.now();
			var _scroll = this._getScroll(false);
			var oldX = this._hScroll;
			var oldY = this._vScroll;
			if (oldX !== _scroll.x || oldY !== _scroll.y) {
				this._hScroll = _scroll.x;
				this._vScroll = _scroll.y;
				this._commitIME();
				this._update(oldY === _scroll.y);
				var e = {
					type: "Scroll", //$NON-NLS-1$
					oldValue: {x: oldX, y: oldY},
					newValue: _scroll
				};
				this.onScroll(e);
			}
		},
		_handleSelectStart: function (e) {
			var menuOpen = this._contextMenuOpen;
			this._contextMenuOpen = false;
			if (menuOpen) {
				this._checkSelectionChange = true;
				return;
			}
			if (this._ignoreSelect) {
				if (e && e.preventDefault) { e.preventDefault(); }
				return false;
			}
		},
		_getModelOffset: function(node, offset) {
			if (!node) { return; }
			var lineNode;
			if (node.tagName === "DIV") { //$NON-NLS-1$
				lineNode = node;
			} else {
				lineNode = node.parentNode.parentNode;
			}
			if (!lineNode._line) {
				return 0;
			}
			return lineNode._line.getModelOffset (node, offset);
		},
		_updateSelectionFromDOM: function() {
			if (!(util.isIOS || util.isAndroid || this._checkSelectionChange)) {
				return false;
			}
			var win = this._getWindow();
			var selection = win.getSelection();
			var start = this._getModelOffset(selection.anchorNode, selection.anchorOffset);
			var end = this._getModelOffset(selection.focusNode, selection.focusOffset);
			var sel = this._getSelections()[0];
			if (start === undefined || end === undefined || (sel.start === start && sel.end === end)) {
				return false;
			}
			
			if (this._checkSelectionChange) {
				var firstLine = this._getLineNext();
				var lastLine = this._getLinePrevious();
				
				// Selection is unchanged and bigger than the visible buffer region
				if (selection.anchorNode === firstLine.firstChild.firstChild && selection.anchorOffset === 0 &&
					selection.focusNode === lastLine.firstChild.firstChild && selection.focusOffset === 0)
				{
					return false;
				}
				
				// Detect select all
				if (
				(selection.anchorNode === firstLine.firstChild.firstChild && selection.anchorOffset === 0 && selection.focusNode === lastLine.lastChild.firstChild)
				|| (selection.anchorNode === this._clientDiv && selection.focusNode === this._clientDiv)
				) {
					start = 0;
					end = this.getModel().getCharCount();
				}
			}
			
			this._setSelection(new Selection(start, end), false, false);
			this._checkSelectionChange = false;
			return true;
		},
		_cancelCheckSelection: function() {
			if (this._checkSelectionChange) {
				this._checkSelectionChange = false;
				this._cancelPollSelectionChange();
			}
		},
		_cancelPollSelectionChange: function() {
			if (this._selPollTimer) {
				var win = this._getWindow();
				win.clearTimeout(this._selPollTimer);
				this._selPollTimer = null; 
			}
		},
		_pollSelectionChange: function(retryPoll) {
			var that = this;
			var win = this._getWindow();
			this._cancelPollSelectionChange();
			this._selPollTimer = win.setTimeout(function() {
				that._selPollTimer = null; 
				if (!that._clientDiv) { return; }
				var changed = that._updateSelectionFromDOM();
				if (!changed && retryPoll) {
					that._pollSelectionChange(retryPoll);
				}
			}, 100);
		},
		_handleSelectionChange: function () {
			if (this._imeOffset !== -1) {
				return;
			}
			/*
			 * Feature in Android. The selection handles are hidden when the DOM changes. Sending
			 * selection events to the application while the user is moving the selection handles
			 * may hide the handles unexpectedly.  The fix is to delay updating the selection and
			 * sending the event to the application.
			 */
			if (util.isAndroid) {
				this._pollSelectionChange();
			} else {
				this._updateSelectionFromDOM();
			}
		},
		_handleTextInput: function (e) {
			if (this._ignoreEvent(e)) { return; }
			if (this._imeOffset !== -1) {
				return;
			}
			var selection = this._getWindow().getSelection();
			if (
				selection.anchorNode !== this._anchorNode || selection.focusNode !== this._focusNode ||
				selection.anchorOffset !== this._anchorOffset || selection.focusOffset !== this._focusOffset
			) {
				var temp = selection.anchorNode;
				while (temp) {
					if (temp.lineIndex !== undefined) {
						break;
					}
					temp = temp.parentNode;
				}
				if (temp) {
					var model = this._model;
					var lineIndex = temp.lineIndex;
					var oldText = model.getLine(lineIndex), text = oldText;
					var offset = 0;
					var lineStart = model.getLineStart(lineIndex);
					if (selection.rangeCount > 0) {
						selection.getRangeAt(0).deleteContents();
						var node = temp.ownerDocument.createTextNode(e.data);
						selection.getRangeAt(0).insertNode(node);
						var nodeText = this._getDOMText(temp, node);
						text = nodeText.text;
						offset = nodeText.offset;
						node.parentNode.removeChild(node);
					}
					temp.lineRemoved = true;
					
					var start = 0;
					while (oldText.charCodeAt(start) === text.charCodeAt(start) && start < offset) {
						start++;
					}
		
					var end = oldText.length - 1, delta = text.length - oldText.length;
					while (oldText.charCodeAt(end) === text.charCodeAt(end + delta) && end + delta >= offset + e.data.length) {
						end--;
					}
					end++;
					
					var deltaText = text.substring(start, end + delta);
					start += lineStart;
					end += lineStart;
					
					var selections = this._getSelections();
					var deltaStart = selections[0].start - start;
					var deltaEnd = selections[0].end - end;
					selections[0].start = start;
					selections[0].end = end;
					for (var i=1; i<selections.length; i++) {
						selections[i].start -= deltaStart;
						selections[i].end -= deltaEnd;
					}
					this._modifyContent({text: deltaText, selection: selections, _ignoreDOMSelection: true}, true);
				}
			} else {
				this._doContent(e.data);
			}
			e.preventDefault();
		},
		_handleTouchStart: function (e) {
			if (this.isListening("TouchStart")) { //$NON-NLS-1$
				var touchEvent = this._createTouchEvent("TouchStart", e); //$NON-NLS-1$
				this.onTouchStart(touchEvent);
				if (touchEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
				if (this._noScroll) {
					return;
				}
			}
			this._commitIME();
			var win = this._getWindow();
			if (this._touchScrollTimer) {
				this._vScrollDiv.style.display = "none"; //$NON-NLS-1$
				this._hScrollDiv.style.display = "none"; //$NON-NLS-1$
				win.clearInterval(this._touchScrollTimer);
				this._touchScrollTimer = null;
			}
			var touches = e.touches;
			if (touches.length === 1) {
				var touch = touches[0];
				var x = touch.clientX, y = touch.clientY;
				this._touchStartX = x;
				this._touchStartY = y;
				if (util.isAndroid) {
					/*
					* Bug in Android 4.  The clientX/Y coordinates of the touch events
					* include the page scrolling offsets.
					*/
				    if (y < (touch.pageY - win.pageYOffset) || x < (touch.pageX - win.pageXOffset) ) {
						x = touch.pageX - win.pageXOffset;
						y = touch.pageY - win.pageYOffset;
				    }
				}
				var pt = this.convert({x: x, y: y}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-2$
				this._lastTouchOffset = this.getOffsetAtLocation(pt.x, pt.y);
				this._touchStartTime = e.timeStamp;
				this._touching = true;
			}
		},
		_handleTouchMove: function (e) {
			if (this.isListening("TouchMove")) { //$NON-NLS-1$
				var touchEvent = this._createTouchEvent("TouchMove", e); //$NON-NLS-1$
				this.onTouchMove(touchEvent);
				if (touchEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
				if (this._noScroll) {
					return;
				}
			}
			var touches = e.touches;
			if (touches.length === 1) {
				var touch = touches[0];
				this._touchCurrentX = touch.clientX;
				this._touchCurrentY = touch.clientY;
				var interval = 10;
				if (!this._touchScrollTimer && (e.timeStamp - this._touchStartTime) < (interval*20)) {
					this._vScrollDiv.style.display = "block"; //$NON-NLS-1$
					if (!this._wrapMode) {
						this._hScrollDiv.style.display = "block"; //$NON-NLS-1$
					}
					var that = this;
					var win = this._getWindow();
					this._touchScrollTimer = win.setInterval(function() {
						var deltaX = 0, deltaY = 0;
						if (that._touching) {
							deltaX = that._touchStartX - that._touchCurrentX;
							deltaY = that._touchStartY - that._touchCurrentY;
							that._touchSpeedX = deltaX / interval;
							that._touchSpeedY = deltaY / interval;
							that._touchStartX = that._touchCurrentX;
							that._touchStartY = that._touchCurrentY;
						} else {
							if (Math.abs(that._touchSpeedX) < 0.1 && Math.abs(that._touchSpeedY) < 0.1) {
								that._vScrollDiv.style.display = "none"; //$NON-NLS-1$
								that._hScrollDiv.style.display = "none"; //$NON-NLS-1$
								win.clearInterval(that._touchScrollTimer);
								that._touchScrollTimer = null;
								return;
							} else {
								deltaX = that._touchSpeedX * interval;
								deltaY = that._touchSpeedY * interval;
								that._touchSpeedX *= 0.95;
								that._touchSpeedY *= 0.95;
							}
						}
						that._scrollView(deltaX, deltaY);
					}, interval);
				}
				if (this._touchScrollTimer) {
					e.preventDefault();
				}
			}
		},
		_handleTouchEnd: function (e) {
			if (this.isListening("TouchEnd")) { //$NON-NLS-1$
				var touchEvent = this._createTouchEvent("TouchEnd", e); //$NON-NLS-1$
				this.onTouchEnd(touchEvent);
				if (touchEvent.defaultPrevented) {
					e.preventDefault();
					return;
				}
				if (this._noScroll) {
					return;
				}
			}
			var touches = e.touches;
			if (touches.length === 0) {
				this._touching = false;
			}
		},

		/************************************ Actions ******************************************/
		_doAction: function (e) {
			var mode, i;
			var keyModes = this._keyModes;
			for (i = keyModes.length - 1 ; i >= 0; i--) {
				mode = keyModes[i];
				if (typeof mode.match === "function") { //$NON-NLS-1$
					var actionID = mode.match(e);
					if (actionID !== undefined) {
						return this.invokeAction(actionID);
					}
				}
			}
			return false;
		},
		_doMove: function(args, selection) {
			var model = this._model;
			var caret = selection.getCaret();
			var lineIndex = model.getLineAtOffset(caret);
			if (!args.count) {
				args.count = 1;
			}
			while (args.count !== 0) {
				var lineStart = model.getLineStart(lineIndex);
				if (args.count < 0 && caret === lineStart) {
					if (lineIndex > 0) {
						if (args.unit === "character") { //$NON-NLS-1$
							args.count++;
						}
						lineIndex--;
						selection.extend(model.getLineEnd(lineIndex));
					} else {
						break;
					}
				} else if (args.count > 0 && caret === model.getLineEnd(lineIndex)) {
					if (lineIndex + 1 < model.getLineCount()) {
						if (args.unit === "character") { //$NON-NLS-1$
							args.count--;
						}
						lineIndex++;
						selection.extend(model.getLineStart(lineIndex));
					} else {
						break;
					}
				} else {
					var removeTab = false;
					if (args.expandTab && args.unit === "character" && (caret - lineStart) % this._tabSize === 0) { //$NON-NLS-1$
						var lineText = model.getText(lineStart, caret);
						removeTab = !/[^ ]/.test(lineText); // Only spaces between line start and caret.
					}
					if (removeTab) {
						selection.extend(caret - this._tabSize);
						args.count += args.count < 0 ? 1 : -1;
					} else {
						var line = this._getLine(lineIndex);
						selection.extend(line.getNextOffset(caret, args));
						line.destroy();
					}
				}
				caret = selection.getCaret();
			}
			return selection;
		},
		_doBackspace: function (args) {
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (selection.isEmpty()) {
					if (!args.count) {
						args.count = 1;
					}
					args.count *= -1;
					args.expandTab = that._expandTab;
					that._doMove(args, selection);
				}
			});
			this._modifyContent({text: "", selection: selections}, true);
			return true;
		},
		_doCase: function (args) {
			var that = this;
			var selections = this._getSelections();
			var changes = [];
			selections.forEach(function(selection) {
				that._doMove(args, selection);
				var text = that.getText(selection.start, selection.end);
				switch (args.type) {
					case "lower": text = text.toLowerCase(); break; //$NON-NLS-1$
					case "capitalize": text = text.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }); break; //$NON-NLS-1$
					case "reverse":  //$NON-NLS-1$
						var newText = "";
						for (var i=0; i<text.length; i++) {
							var s = text[i];
							var l = s.toLowerCase();
							if (l !== s) {
								s = l;
							} else {
								s = s.toUpperCase();
							}
							newText += s;
						} 
						text = newText;
						break;
					default: text = text.toUpperCase(); break;
				}
				changes.push(text);
			});
			return this._modifyContent({text: changes, selection: selections, _ignoreDOMSelection: true}, true);
		},
		_doContent: function (text) {
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (that._overwriteMode && selection.isEmpty()) {
					var model = that._model;
					var lineIndex = model.getLineAtOffset(selection.end);
					if (selection.end < model.getLineEnd(lineIndex)) {
						var line = that._getLine(lineIndex);
						selection.extend(line.getNextOffset(selection.getCaret(), {unit:"character", count:1})); //$NON-NLS-1$
						line.destroy();
					}
				}
			});
			return this._modifyContent({text: text, selection: selections, _ignoreDOMSelection: true}, true);
		},
		_doCopy: function (e) {
			var text = this.getSelectionText();
			if (text) {
				return this._setClipboardText(text, e);
			}
			return true;
		},
		_doCursorNext: function (args) {
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (!selection.isEmpty() && !args.select) {
					selection.start = selection.end;
				} else {
					that._doMove(args, selection);
				}
				if (!args.select) { selection.collapse(); }
			});
			this._setSelection(selections, true);
			return true;
		},
		_doCursorPrevious: function (args) {
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (!selection.isEmpty() && !args.select) {
					selection.end = selection.start;
				} else {
					if (!args.count) {
						args.count = 1;
					}
					args.count *= -1;
					that._doMove(args, selection);
				}
				if (!args.select) { selection.collapse(); }
			});
			this._setSelection(selections, true);
			return true;
		},
		_doCut: function (e) {
			var text = this.getSelectionText();
			if (text) {
				if (!this._setClipboardText(text, e)) {
					return false;
				}
				this._doContent("");
			}
			return true;
		},
		_doDelete: function (args) {
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (selection.isEmpty()) {
					that._doMove(args, selection);
				}
			});
			this._modifyContent({text: "", selection: selections}, true);
			return true;
		},
		_doEnd: function (args) {
			var model = this._model;
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (args.ctrl) {
					selection.extend(model.getCharCount());
				} else {
					var offset = selection.getCaret();
					var lineIndex = model.getLineAtOffset(offset);
					if (that._wrapMode) {
						var line = that._getLine(lineIndex);
						var visualIndex = line.getLineIndex(offset);
						if (visualIndex === line.getLineCount() - 1) {
							offset = model.getLineEnd(lineIndex);
						} else {
							offset = line.getLineStart(visualIndex + 1) - 1;
						}
						line.destroy();
					} else {
						if (args.count && args.count > 0) {
							lineIndex = Math.min (lineIndex  + args.count - 1, model.getLineCount() - 1);
						}
						offset = model.getLineEnd(lineIndex);
					}
					selection.extend(offset);
				}
				if (!args.select) { selection.collapse(); }
			});
			this._setSelection(selections, true, true, args.ctrl ? function() {} : null);
			return true;
		},
		_doEnter: function (args) {
			if (this._singleMode) return true;
			var model = this._model;
			var selections = this._getSelections();
			this._doContent(model.getLineDelimiter()); 
			if (args && args.noCursor) {
				selections.forEach(function(selection) {
					selection.end = selection.start;
				});
				this._setSelection(selections, true);
			}
			return true;
		},
		_doEscape: function () {
			var selections = this._getSelections();
			if (selections.length > 1) {
				this._setSelection(selections[0], true);
			}
			return true;
		},
		_doHome: function (args) {
			var model = this._model;
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (args.ctrl) {
					selection.extend(0);
				} else {
					var offset = selection.getCaret();
					var lineIndex = model.getLineAtOffset(offset);
					if (that._wrapMode) {
						var line = that._getLine(lineIndex);
						var visualIndex = line.getLineIndex(offset);
						offset = line.getLineStart(visualIndex);
						line.destroy();
					} else {
						offset = model.getLineStart(lineIndex);
					}
					selection.extend(offset); 
				}
				if (!args.select) { selection.collapse(); }
			});
			this._setSelection(selections, true, true, args.ctrl ? function() {} : null);
			return true;
		},
		_doLineDown: function (args) {
			var model = this._model;
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				var caret = selection.getCaret();
				var lineIndex = model.getLineAtOffset(caret), visualIndex;
				var line = that._getLine(lineIndex);
				var x = selection._columnX, y = 1, lastLine = false;
				if (x === -1 || args.wholeLine || (args.select && util.isIE)) {
					var offset = args.wholeLine ? model.getLineEnd(lineIndex + 1) : caret;
					x = selection._columnX = line.getBoundingClientRect(offset).left;
				}
				if ((visualIndex = line.getLineIndex(caret)) < line.getLineCount() - 1) {
					y = line.getClientRects(visualIndex + 1).top + 1;
				} else {
					var lastLineCount = model.getLineCount() - 1;
					lastLine = lineIndex === lastLineCount;
					if (args.count && args.count > 0) {
						lineIndex = Math.min (lineIndex + args.count, lastLineCount);
					} else {
						lineIndex++;
					}
				}
				var select = false;
				if (lastLine) {
					if (args.select || (util.isMac || util.isLinux)) {
						selection.extend(model.getCharCount());
						select = true;
					}
				} else {
					if (line.lineIndex !== lineIndex) {
						line.destroy();
						line = that._getLine(lineIndex);
					}
					selection.extend(line.getOffset(x, y));
					select = true;
				}
				if (select) {
					if (!args.select) { selection.collapse(); }
				}
				line.destroy();
			});
			that._setSelection(selections, true, true, null, 0, false, true);
			return true;
		},
		_doLineUp: function (args) {
			var model = this._model;
			var that = this;
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				var caret = selection.getCaret();
				var lineIndex = model.getLineAtOffset(caret), visualIndex;
				var line = that._getLine(lineIndex);
				var x = selection._columnX, firstLine = false, y;
				if (x === -1 || args.wholeLine || (args.select && util.isIE)) {
					var offset = args.wholeLine ? model.getLineStart(lineIndex - 1) : caret;
					x = selection._columnX = line.getBoundingClientRect(offset).left;
				}
				if ((visualIndex = line.getLineIndex(caret)) > 0) {
					y = line.getClientRects(visualIndex - 1).top + 1;
				} else {
					firstLine = lineIndex === 0;
					if (!firstLine) {
						if (args.count && args.count > 0) {
							lineIndex = Math.max (lineIndex - args.count, 0);
						} else {
							lineIndex--;
						}
						y = that._getLineHeight(lineIndex) - 1;
					}
				}
				var select = false;
				if (firstLine) {
					if (args.select || (util.isMac || util.isLinux)) {
						selection.extend(0);
						select = true;
					}
				} else {
					if (line.lineIndex !== lineIndex) {
						line.destroy();
						line = that._getLine(lineIndex);
					}
					selection.extend(line.getOffset(x, y));
					select = true;
				}
				if (select) {
					if (!args.select) { selection.collapse(); }
				}
				line.destroy();
			});
			that._setSelection(selections, true, true, null, 0, false, true);
			return true;
		},
		_doNoop: function () {
			return true;
		},
		_doPageDown: function (args) {
			var that = this;
			var model = this._model;
			var selections = this._getSelections();
			var lineCount = model.getLineCount();
			var _scroll = this._getScroll();
			var clientHeight = this._getClientHeight();
			var lineHeight = this._getLineHeight();
			var lines = Math.floor(clientHeight / lineHeight);
			var x, line, pageScroll;
			selections.forEach(function(selection) {
				var caret = selection.getCaret();
				var caretLine = model.getLineAtOffset(caret);
				if (that._lineHeight) {
					x = selection._columnX;
					var caretRect = that._getBoundsAtOffset(caret);
					if (x === -1 || (args.select && util.isIE)) {
						x = selection._columnX = caretRect.left;
					}
					var lineIndex = that._getLineIndex(caretRect.top + clientHeight);
					line = that._getLine(lineIndex);
					var linePixel = that._getLinePixel(lineIndex);
					var y = caretRect.top + clientHeight - linePixel;
					caret = line.getOffset(x, y);
					var rect = line.getBoundingClientRect(caret);
					line.destroy();
					selection.extend(caret);
					if (!args.select) { selection.collapse(); }
					pageScroll = pageScroll !== undefined ? Math.min(pageScroll, rect.top + linePixel - caretRect.top) : rect.top + linePixel - caretRect.top;
				} else {
					if (caretLine < lineCount - 1) {
						var scrollLines = Math.min(lineCount - caretLine - 1, lines);
						scrollLines = Math.max(1, scrollLines);
						x = selection._columnX;
						if (x === -1 || (args.select && util.isIE)) {
							line = that._getLine(caretLine);
							x = selection._columnX = line.getBoundingClientRect(caret).left;
							line.destroy();
						}
						line = that._getLine(caretLine + scrollLines);
						selection.extend(line.getOffset(x, 0));
						line.destroy();
						if (!args.select) { selection.collapse(); }
						var verticalMaximum = lineCount * lineHeight;
						var scrollOffset = _scroll.y + scrollLines * lineHeight;
						if (scrollOffset + clientHeight > verticalMaximum) {
							scrollOffset = verticalMaximum - clientHeight;
						}
						pageScroll = pageScroll !== undefined ? Math.min(pageScroll, scrollOffset - _scroll.y) : scrollOffset - _scroll.y;
					}
				}
			});
			this._setSelection(selections, true, true, function() {}, pageScroll, false, true);
			return true;
		},
		_doPageUp: function (args) {
			var that = this;
			var model = this._model;
			var selections = this._getSelections();
			var _scroll = this._getScroll();
			var clientHeight = this._getClientHeight();
			var lineHeight = this._getLineHeight();
			var lines = Math.floor(clientHeight / lineHeight);
			var x, line, pageScroll;
			selections.forEach(function(selection) {
				var caret = selection.getCaret();
				var caretLine = model.getLineAtOffset(caret);
				if (that._lineHeight) {
					x = selection._columnX;
					var caretRect = that._getBoundsAtOffset(caret);
					if (x === -1 || (args.select && util.isIE)) {
						x = selection._columnX = caretRect.left;
					}
					var lineIndex = that._getLineIndex(caretRect.bottom - clientHeight);
					line = that._getLine(lineIndex);
					var linePixel = that._getLinePixel(lineIndex);
					var y = (caretRect.bottom - clientHeight) - linePixel;
					caret = line.getOffset(x, y);
					var rect = line.getBoundingClientRect(caret);
					line.destroy();
					selection.extend(caret);
					if (!args.select) { selection.collapse(); }
					pageScroll = pageScroll !== undefined ? Math.max(pageScroll, rect.top + linePixel - caretRect.top) : rect.top + linePixel - caretRect.top;
				} else {
					if (caretLine > 0) {
						var scrollLines = Math.max(1, Math.min(caretLine, lines));
						x = selection._columnX;
						if (x === -1 || (args.select && util.isIE)) {
							line = that._getLine(caretLine);
							x = selection._columnX = line.getBoundingClientRect(caret).left;
							line.destroy();
						}
						line = that._getLine(caretLine - scrollLines);
						selection.extend(line.getOffset(x, that._getLineHeight(caretLine - scrollLines) - 1));
						line.destroy();
						if (!args.select) { selection.collapse(); }
						var scrollOffset = Math.max(0, _scroll.y - scrollLines * lineHeight);
						pageScroll = pageScroll !== undefined  ? Math.max(pageScroll, scrollOffset - _scroll.y) : scrollOffset - _scroll.y;
					}
				}
			});
			this._setSelection(selections, true, true, function() {}, pageScroll, false, true);
			return true;
		},
		_doPaste: function(e) {
			var that = this;
			var result = this._getClipboardText(e, function(text) {
				if (text.length) {
					if (util.isLinux && that._lastMouseButton === 2) {
						var timeDiff = Date.now() - that._lastMouseTime;
						if (timeDiff <= that._clickTime) {
							that._setSelectionTo(that._lastMouseX, that._lastMouseY, true);
						}
					}
					var selections = that._getSelections();
					var delimiter = that._singleMode ? "" : that._model.getLineDelimiter();
					that._doContent(selections.length > 1 && selections.length === text.length ? text : text.join(delimiter));
				}
			});
			return result !== null;
		},
		_doScroll: function (args) {
			var type = args.type;
			var model = this._model;
			var lineCount = model.getLineCount();
			var clientHeight = this._getClientHeight();
			var lineHeight = this._getLineHeight();
			var verticalMaximum = this._lineHeight ? this._scrollHeight : lineCount * lineHeight;
			var verticalScrollOffset = this._getScroll().y;
			var pixel;
			switch (type) {
				case "textStart": pixel = 0; break; //$NON-NLS-1$
				case "textEnd": pixel = verticalMaximum - clientHeight; break; //$NON-NLS-1$
				case "pageDown": pixel = verticalScrollOffset + clientHeight; break; //$NON-NLS-1$
				case "pageUp": pixel = verticalScrollOffset - clientHeight; break; //$NON-NLS-1$
				case "lineDown": pixel = verticalScrollOffset + lineHeight; break; //$NON-NLS-1$
				case "lineUp": pixel = verticalScrollOffset - lineHeight; break; //$NON-NLS-1$
				case "centerLine": //$NON-NLS-1$
					var selection = this._getSelections()[0];
					var lineStart = model.getLineAtOffset(selection.start);
					var lineEnd = model.getLineAtOffset(selection.end);
					var selectionHeight = (lineEnd - lineStart + 1) * lineHeight;
					pixel = (lineStart * lineHeight) - (clientHeight / 2) + (selectionHeight / 2);
					break;
			}
			if (pixel !== undefined) {
				pixel = Math.min(Math.max(0, pixel), verticalMaximum - clientHeight);
				this._scrollViewAnimated(0, pixel - verticalScrollOffset, function() {});
			}
			return true;
		},
		_doSelectAll: function () {
			var model = this._model;
			this._setSelection(new Selection(0, model.getCharCount()), false);
			return true;
		},
		_doTab: function () {
			if (!this._tabMode || this._readonly) { return; }
			var text = "\t"; //$NON-NLS-1$
			var selections = this._getSelections();
			if (this._expandTab) {
				text = [];
				var model = this._model;
				var tabSize = this._tabSize;
				selections.forEach(function(selection) {
					var caret = selection.getCaret();
					var lineIndex = model.getLineAtOffset(caret);
					var lineStart = model.getLineStart(lineIndex);
					var spaces = tabSize - ((caret - lineStart) % tabSize);
					text.push((newArray(spaces + 1)).join(" ")); //$NON-NLS-1$
				});
			}
			return this._modifyContent({text: text, selection: selections, _ignoreDOMSelection: true}, true);
		},
		_doShiftTab: function () {
			if (!this._tabMode || this._readonly) { return; }
			return true;
		},
		_doOverwriteMode: function () {
			if (this._readonly) { return; }
			this.setOptions({overwriteMode: !this.getOptions("overwriteMode")}); //$NON-NLS-1$
			return true;
		},
		_doTabMode: function () {
			this.setOptions({tabMode: !this.getOptions("tabMode")}); //$NON-NLS-1$
			return true;
		},
		_doWrapMode: function () {
			this.setOptions({wrapMode: !this.getOptions("wrapMode")}); //$NON-NLS-1$
			return true;
		},
		
		/************************************ Internals ******************************************/
		_autoScroll: function () {
			var model = this._model;
			var selections = this._getSelections();
			var selection = Selection.editing(selections, this._autoScrollDir === "down"); //$NON-NLS-1$
			var pt = this.convert({x: this._autoScrollX, y: this._autoScrollY}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-2$
			var caret = selection.getCaret();
			var lineCount = model.getLineCount();
			var caretLine = model.getLineAtOffset(caret), lineIndex, line;
			if (this._autoScrollDir === "up" || this._autoScrollDir === "down") { //$NON-NLS-1$ //$NON-NLS-1$
				var _scroll = this._autoScrollY / this._getLineHeight();
				_scroll = _scroll < 0 ? Math.floor(_scroll) : Math.ceil(_scroll);
				lineIndex = caretLine;
				lineIndex = Math.max(0, Math.min(lineCount - 1, lineIndex + _scroll));
			} else if (this._autoScrollDir === "left" || this._autoScrollDir === "right") { //$NON-NLS-1$ //$NON-NLS-1$
				lineIndex = this._getLineIndex(pt.y);
				line = this._getLine(caretLine); 
				pt.x += line.getBoundingClientRect(caret, false).left;
				line.destroy();
			}
			if (this._blockSelection) {
				selections = this._getBlockSelections(selections, lineIndex, pt);
			} else if (lineIndex === 0 && (util.isMac || util.isLinux)) {
				selection.extend(0);
			} else if (lineIndex === lineCount - 1 && (util.isMac || util.isLinux)) {
				selection.extend(model.getCharCount());
			} else {
				line = this._getLine(lineIndex);
				selection.extend(line.getOffset(pt.x, pt.y - this._getLinePixel(lineIndex)));
				line.destroy();
			}
			this._setSelection(selections, true);
		},
		_autoScrollTimer: function () {
			this._autoScroll();
			var that = this;
			var win = this._getWindow();
			this._autoScrollTimerID = win.setTimeout(function () {that._autoScrollTimer();}, this._AUTO_SCROLL_RATE);
		},
		_calculateLineHeightTimer: function(calculate) {
			if (!this._lineHeight) { return; }
			if (this._calculateLHTimer) { return; }
			var lineCount = this._model.getLineCount(), i = 0;
			if (calculate) {
				var c = 0;
				var MAX_TIME = 100;
				var start = Date.now(), firstLine = 0;
				while (i < lineCount) {
					if (!this._lineHeight[i]) {
						c++;
						if (!firstLine) { firstLine = i; }
						this._lineHeight[i] = this._calculateLineHeight(i);
					}
					i++;
					if ((Date.now() - start) > MAX_TIME) {
						break;
					}
				}
				this.redrawRulers(0, lineCount);
				this._queueUpdate();
			}
			var win = this._getWindow();
			if (i !== lineCount) {
				var that = this;
				this._calculateLHTimer = win.setTimeout(function() {
					that._calculateLHTimer = null;
					that._calculateLineHeightTimer(true);
				}, 0);
				return;
			}
			if (this._calculateLHTimer) {
				win.clearTimeout(this._calculateLHTimer);
				this._calculateLHTimer = undefined;
			}
		},
		_calculateLineHeight: function(lineIndex) {
			var line = this._getLine(lineIndex);
			var rect = line.getBoundingClientRect();
			line.destroy();
			return Math.max(1, rect.bottom - rect.top);
		},
		_calculateMetrics: function() {
			var _parent = this._clientDiv;
			var doc = _parent.ownerDocument;
			var c = " "; //$NON-NLS-1$
			var line = util.createElement(doc, "div"); //$NON-NLS-1$
			line.style.lineHeight = "normal"; //$NON-NLS-1$
			var model = this._model;
			var lineText = model.getLine(0);
			var e = {type:"LineStyle", textView: this, 0: 0, lineText: lineText, lineStart: 0}; //$NON-NLS-1$
			this.onLineStyle(e);
			applyStyle(e.style, line);
			line.style.position = "fixed"; //$NON-NLS-1$
			line.style.left = "-1000px"; //$NON-NLS-1$
			var span1 = util.createElement(doc, "span"); //$NON-NLS-1$
			span1.appendChild(doc.createTextNode(c));
			line.appendChild(span1);
			var span2 = util.createElement(doc, "span"); //$NON-NLS-1$
			span2.style.fontStyle = "italic"; //$NON-NLS-1$
			span2.appendChild(doc.createTextNode(c));
			line.appendChild(span2);
			var span3 = util.createElement(doc, "span"); //$NON-NLS-1$
			span3.style.fontWeight = "bold"; //$NON-NLS-1$
			span3.appendChild(doc.createTextNode(c));
			line.appendChild(span3);
			var span4 = util.createElement(doc, "span"); //$NON-NLS-1$
			span4.style.fontWeight = "bold"; //$NON-NLS-1$
			span4.style.fontStyle = "italic"; //$NON-NLS-1$
			span4.appendChild(doc.createTextNode(c));
			line.appendChild(span4);
			_parent.appendChild(line);
			var lineRect = line.getBoundingClientRect();
			var spanRect1 = span1.getBoundingClientRect();
			var spanRect2 = span2.getBoundingClientRect();
			var spanRect3 = span3.getBoundingClientRect();
			var spanRect4 = span4.getBoundingClientRect();
			var h1 = spanRect1.bottom - spanRect1.top;
			var h2 = spanRect2.bottom - spanRect2.top;
			var h3 = spanRect3.bottom - spanRect3.top;
			var h4 = spanRect4.bottom - spanRect4.top;
			var fontStyle = 0;
			var invalid = (lineRect.bottom - lineRect.top) <= 0;
			var lineHeight = Math.max(1, lineRect.bottom - lineRect.top);
			if (h2 > h1) {
				fontStyle = 1;
			}
			if (h3 > h2) {
				fontStyle = 2;
			}
			if (h4 > h3) {
				fontStyle = 3;
			}
			var style;
			if (fontStyle !== 0) {
				style = {style: {}};
				if ((fontStyle & 1) !== 0) {
					style.style.fontStyle = "italic"; //$NON-NLS-1$
				}
				if ((fontStyle & 2) !== 0) {
					style.style.fontWeight = "bold"; //$NON-NLS-1$
				}
			}
			var trim = getLineTrim(line);
			_parent.removeChild(line);
			
			// calculate pad and scroll width
			var pad = getPadding(this._viewDiv);
			var div1 = util.createElement(doc, "div"); //$NON-NLS-1$
			div1.style.position = "fixed"; //$NON-NLS-1$
			div1.style.left = "-1000px"; //$NON-NLS-1$
			div1.style.paddingLeft = pad.left + "px"; //$NON-NLS-1$
			div1.style.paddingTop = pad.top + "px"; //$NON-NLS-1$
			div1.style.paddingRight = pad.right + "px"; //$NON-NLS-1$
			div1.style.paddingBottom = pad.bottom + "px"; //$NON-NLS-1$
			div1.style.width = "100px"; //$NON-NLS-1$
			div1.style.height = "100px"; //$NON-NLS-1$
			var div2 = util.createElement(doc, "div"); //$NON-NLS-1$
			div2.style.width = "100%"; //$NON-NLS-1$
			div2.style.height = "100%"; //$NON-NLS-1$
			div1.appendChild(div2);
			_parent.appendChild(div1);
			var rect1 = div1.getBoundingClientRect();
			var rect2 = div2.getBoundingClientRect();
			var scrollWidth = 0;
			if (!this._singleMode && !this._noScroll) {
				div1.style.overflow = 'hidden'; //$NON-NLS-1$
				div2.style.height = "200px"; //$NON-NLS-1$
				var w1 = div1.clientWidth;
				div1.style.overflow = 'scroll'; //$NON-NLS-1$
				var w2 = div1.clientWidth;
				scrollWidth = w1 - w2;
			}
			_parent.removeChild(div1);
			pad = {
				left: rect2.left - rect1.left,
				top: rect2.top - rect1.top,
				right: rect1.right - rect2.right,
				bottom: rect1.bottom - rect2.bottom
			};
			var wrapWidth = 0, marginWidth = 0, charWidth = 0;
			if (!invalid) {
				div1 = util.createElement(doc, "div"); //$NON-NLS-1$
				div1.style.position = "fixed"; //$NON-NLS-1$
				div1.style.left = "-1000px"; //$NON-NLS-1$
				_parent.appendChild(div1);
				div1.innerHTML = newArray(2).join("a"); //$NON-NLS-1$
				rect1 = div1.getBoundingClientRect();
				charWidth = Math.ceil(rect1.right - rect1.left);
				if (this._wrapOffset || this._marginOffset) {
					div1.innerHTML = newArray(this._wrapOffset + 1 + (util.isWebkit ? 0 : 1)).join(" "); //$NON-NLS-1$
					rect1 = div1.getBoundingClientRect();
					wrapWidth = Math.ceil(rect1.right - rect1.left);
					div1.innerHTML = newArray(this._marginOffset + 1).join(" "); //$NON-NLS-1$
					rect2 = div1.getBoundingClientRect();
					marginWidth = Math.ceil(rect2.right - rect2.left);
				}
				_parent.removeChild(div1);
			}
			return {
				lineHeight: lineHeight,
				largestFontStyle: style,
				lineTrim: trim,
				viewPadding: pad,
				scrollWidth: scrollWidth,
				wrapWidth: wrapWidth,
				marginWidth: marginWidth,
				charWidth: charWidth,
				invalid: invalid
			};
		},
		_cancelAnimation: function() {
			if (this._animation) {
				this._animation.stop();
				this._animation = null;
			}
		},
		_clearSelection: function (direction) {
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (direction === "next") { //$NON-NLS-1$
					selection.start = selection.end;
				} else {
					selection.end = selection.start;
				}
			});
			this._setSelection(selections, true);
			return true;
		},
		_commitIME: function (insertText) {
			if (this._imeOffset === -1) { return; }
			var model = this._model;
			var lineIndex = model.getLineAtOffset(this._imeOffset);
			var lineStart = model.getLineStart(lineIndex);
			var line = this._getLineNode(lineIndex);
			if (!insertText) {
				// make the state of the IME match the state the view expects it be in
				// when the view commits the text and IME also need to be committed
				// this can be accomplished by changing the focus around
				this._scrollDiv.focus();
				this._clientDiv.focus();
				
				var newText = this._getDOMText(line).text;
				var oldText = model.getLine(lineIndex);
				var start = this._imeOffset - lineStart;
				var end = start + newText.length - oldText.length;
				if (start !== end) {
					insertText = newText.substring(start, end);
				}
			}
			this._imeOffset = -1;
			if (insertText) {
				if (!this._doContent(insertText) && !util.isWebkit) {
					line.lineRemoved = true;
					this._queueUpdate();
				}
			}
		},
		_createActions: function () {
			this.addKeyMode(new mKeyModes.DefaultKeyMode(this));
			//1 to 1, no duplicates
			var that = this;
			this._actions = {
				"noop": {defaultHandler: function() {return that._doNoop();}}, //$NON-NLS-1$

				"lineUp": {defaultHandler: function(data) {return that._doLineUp(merge(data,{select: false}));}, actionDescription: {name: messages.lineUp}}, //$NON-NLS-1$
				"lineDown": {defaultHandler: function(data) {return that._doLineDown(merge(data,{select: false}));}, actionDescription: {name: messages.lineDown}}, //$NON-NLS-1$
				"lineStart": {defaultHandler: function(data) {return that._doHome(merge(data,{select: false, ctrl:false}));}, actionDescription: {name: messages.lineStart}}, //$NON-NLS-1$
				"lineEnd": {defaultHandler: function(data) {return that._doEnd(merge(data,{select: false, ctrl:false}));}, actionDescription: {name: messages.lineEnd}}, //$NON-NLS-1$
				"charPrevious": {defaultHandler: function(data) {return that._doCursorPrevious(merge(data,{select: false, unit:"character"}));}, actionDescription: {name: messages.charPrevious}}, //$NON-NLS-1$ //$NON-NLS-1$
				"charNext": {defaultHandler: function(data) {return that._doCursorNext(merge(data,{select: false, unit:"character"}));}, actionDescription: {name: messages.charNext}}, //$NON-NLS-1$ //$NON-NLS-1$
				"pageUp": {defaultHandler: function(data) {return that._doPageUp(merge(data,{select: false}));}, actionDescription: {name: messages.pageUp}}, //$NON-NLS-1$
				"pageDown": {defaultHandler: function(data) {return that._doPageDown(merge(data,{select: false}));}, actionDescription: {name: messages.pageDown}}, //$NON-NLS-1$
				"scrollPageUp": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "pageUp"}));}, actionDescription: {name: messages.scrollPageUp}}, //$NON-NLS-1$ //$NON-NLS-1$
				"scrollPageDown": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "pageDown"}));}, actionDescription: {name: messages.scrollPageDown}}, //$NON-NLS-1$ //$NON-NLS-1$
				"scrollLineUp": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "lineUp"}));}, actionDescription: {name: messages.scrollLineUp}}, //$NON-NLS-1$ //$NON-NLS-1$
				"scrollLineDown": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "lineDown"}));}, actionDescription: {name: messages.scrollLineDown}}, //$NON-NLS-1$ //$NON-NLS-1$
				"wordPrevious": {defaultHandler: function(data) {return that._doCursorPrevious(merge(data,{select: false, unit:"word"}));}, actionDescription: {name: messages.wordPrevious}}, //$NON-NLS-1$ //$NON-NLS-1$
				"wordNext": {defaultHandler: function(data) {return that._doCursorNext(merge(data,{select: false, unit:"word"}));}, actionDescription: {name: messages.wordNext}}, //$NON-NLS-1$ //$NON-NLS-1$
				"textStart": {defaultHandler: function(data) {return that._doHome(merge(data,{select: false, ctrl:true}));}, actionDescription: {name: messages.textStart}}, //$NON-NLS-1$
				"textEnd": {defaultHandler: function(data) {return that._doEnd(merge(data,{select: false, ctrl:true}));}, actionDescription: {name: messages.textEnd}}, //$NON-NLS-1$
				"scrollTextStart": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "textStart"}));}, actionDescription: {name: messages.scrollTextStart}}, //$NON-NLS-1$ //$NON-NLS-1$
				"scrollTextEnd": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "textEnd"}));}, actionDescription: {name: messages.scrollTextEnd}}, //$NON-NLS-1$ //$NON-NLS-1$
				"centerLine": {defaultHandler: function(data) {return that._doScroll(merge(data,{type: "centerLine"}));}, actionDescription: {name: messages.centerLine}}, //$NON-NLS-1$ //$NON-NLS-1$
				
				"selectLineUp": {defaultHandler: function(data) {return that._doLineUp(merge(data,{select: true}));}, actionDescription: {name: messages.selectLineUp}}, //$NON-NLS-1$
				"selectLineDown": {defaultHandler: function(data) {return that._doLineDown(merge(data,{select: true}));}, actionDescription: {name: messages.selectLineDown}}, //$NON-NLS-1$
				"selectWholeLineUp": {defaultHandler: function(data) {return that._doLineUp(merge(data,{select: true, wholeLine: true}));}, actionDescription: {name: messages.selectWholeLineUp}}, //$NON-NLS-1$
				"selectWholeLineDown": {defaultHandler: function(data) {return that._doLineDown(merge(data,{select: true, wholeLine: true}));}, actionDescription: {name: messages.selectWholeLineDown}}, //$NON-NLS-1$
				"selectLineStart": {defaultHandler: function(data) {return that._doHome(merge(data,{select: true, ctrl:false}));}, actionDescription: {name: messages.selectLineStart}}, //$NON-NLS-1$
				"selectLineEnd": {defaultHandler: function(data) {return that._doEnd(merge(data,{select: true, ctrl:false}));}, actionDescription: {name: messages.selectLineEnd}}, //$NON-NLS-1$
				"selectCharPrevious": {defaultHandler: function(data) {return that._doCursorPrevious(merge(data,{select: true, unit:"character"}));}, actionDescription: {name: messages.selectCharPrevious}}, //$NON-NLS-1$ //$NON-NLS-1$
				"selectCharNext": {defaultHandler: function(data) {return that._doCursorNext(merge(data,{select: true, unit:"character"}));}, actionDescription: {name: messages.selectCharNext}}, //$NON-NLS-1$ //$NON-NLS-1$
				"selectPageUp": {defaultHandler: function(data) {return that._doPageUp(merge(data,{select: true}));}, actionDescription: {name: messages.selectPageUp}}, //$NON-NLS-1$
				"selectPageDown": {defaultHandler: function(data) {return that._doPageDown(merge(data,{select: true}));}, actionDescription: {name: messages.selectPageDown}}, //$NON-NLS-1$
				"selectWordPrevious": {defaultHandler: function(data) {return that._doCursorPrevious(merge(data,{select: true, unit:"word"}));}, actionDescription: {name: messages.selectWordPrevious}}, //$NON-NLS-1$ //$NON-NLS-1$
				"selectWordNext": {defaultHandler: function(data) {return that._doCursorNext(merge(data,{select: true, unit:"word"}));}, actionDescription: {name: messages.selectWordNext}}, //$NON-NLS-1$ //$NON-NLS-1$
				"selectTextStart": {defaultHandler: function(data) {return that._doHome(merge(data,{select: true, ctrl:true}));}, actionDescription: {name: messages.selectTextStart}}, //$NON-NLS-1$
				"selectTextEnd": {defaultHandler: function(data) {return that._doEnd(merge(data,{select: true, ctrl:true}));}, actionDescription: {name: messages.selectTextEnd}}, //$NON-NLS-1$

				"deletePrevious": {defaultHandler: function(data) {return that._doBackspace(merge(data,{unit:"character"}));}, actionDescription: {name: messages.deletePrevious}}, //$NON-NLS-1$ //$NON-NLS-1$
				"deleteNext": {defaultHandler: function(data) {return that._doDelete(merge(data,{unit:"character"}));}, actionDescription: {name: messages.deleteNext}}, //$NON-NLS-1$ //$NON-NLS-1$
				"deleteWordPrevious": {defaultHandler: function(data) {return that._doBackspace(merge(data,{unit:"word"}));}, actionDescription: {name: messages.deleteWordPrevious}}, //$NON-NLS-1$ //$NON-NLS-1$
				"deleteWordNext": {defaultHandler: function(data) {return that._doDelete(merge(data,{unit:"word"}));}, actionDescription: {name: messages.deleteWordNext}}, //$NON-NLS-1$ //$NON-NLS-1$
				"deleteLineStart": {defaultHandler: function(data) {return that._doBackspace(merge(data,{unit: "line"}));}, actionDescription: {name: messages.deleteLineStart}}, //$NON-NLS-1$ //$NON-NLS-1$
				"deleteLineEnd": {defaultHandler: function(data) {return that._doDelete(merge(data,{unit: "line"}));}, actionDescription: {name: messages.deleteLineEnd}}, //$NON-NLS-1$ //$NON-NLS-1$
				"tab": {defaultHandler: function(data) {return that._doTab(merge(data,{}));}, actionDescription: {name: messages.tab}}, //$NON-NLS-1$
				"shiftTab": {defaultHandler: function(data) {return that._doShiftTab(merge(data,{}));}, actionDescription: {name: messages.shiftTab}}, //$NON-NLS-1$
				"enter": {defaultHandler: function(data) {return that._doEnter(merge(data,{}));}, actionDescription: {name: messages.enter}}, //$NON-NLS-1$
				"enterNoCursor": {defaultHandler: function(data) {return that._doEnter(merge(data,{noCursor:true}));}, actionDescription: {name: messages.enterNoCursor}}, //$NON-NLS-1$
				"escape": {defaultHandler: function(data) {return that._doEscape(merge(data,{}));}, actionDescription: {name: messages.escape}}, //$NON-NLS-1$
				"selectAll": {defaultHandler: function(data) {return that._doSelectAll(merge(data,{}));}, actionDescription: {name: messages.selectAll}}, //$NON-NLS-1$
				"copy": {defaultHandler: function(data) {return that._doCopy(merge(data,{}));}, actionDescription: {name: messages.copy}}, //$NON-NLS-1$
				"cut": {defaultHandler: function(data) {return that._doCut(merge(data,{}));}, actionDescription: {name: messages.cut}}, //$NON-NLS-1$
				"paste": {defaultHandler: function(data) {return that._doPaste(merge(data,{}));}, actionDescription: {name: messages.paste}}, //$NON-NLS-1$
				
				"uppercase": {defaultHandler: function(data) {return that._doCase(merge(data,{type: "upper"}));}, actionDescription: {name: messages.uppercase}}, //$NON-NLS-1$ //$NON-NLS-1$
				"lowercase": {defaultHandler: function(data) {return that._doCase(merge(data,{type: "lower"}));}, actionDescription: {name: messages.lowercase}}, //$NON-NLS-1$ //$NON-NLS-1$
				"capitalize": {defaultHandler: function(data) {return that._doCase(merge(data,{unit: "word", type: "capitalize"}));}, actionDescription: {name: messages.capitalize}}, //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-1$
				"reversecase": {defaultHandler: function(data) {return that._doCase(merge(data,{type: "reverse"}));}, actionDescription: {name: messages.reversecase}}, //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-1$
				
				"toggleOverwriteMode": {defaultHandler: function(data) {return that._doOverwriteMode(merge(data,{}));}, actionDescription: {name: messages.toggleOverwriteMode}}, //$NON-NLS-1$
				"toggleTabMode": {defaultHandler: function(data) {return that._doTabMode(merge(data,{}));}, actionDescription: {name: messages.toggleTabMode}}, //$NON-NLS-1$
				"toggleWrapMode": {defaultHandler: function(data) {return that._doWrapMode(merge(data,{}));}, actionDescription: {name: messages.toggleWrapMode}} //$NON-NLS-1$
			};
		},
		_createRulerParent: function(doc, className) {
			var div = util.createElement(doc, "div"); //$NON-NLS-1$
			div.className = className;
			div.tabIndex = -1;
			div.style.overflow = "hidden"; //$NON-NLS-1$
			div.style.MozUserSelect = "none"; //$NON-NLS-1$
			div.style.WebkitUserSelect = "none"; //$NON-NLS-1$
			div.style.position = "absolute"; //$NON-NLS-1$
			div.style.top = "0px"; //$NON-NLS-1$
			div.style.bottom = "0px"; //$NON-NLS-1$
			div.style.cursor = "default"; //$NON-NLS-1$
			div.style.display = "none"; //$NON-NLS-1$
			div.setAttribute("aria-hidden", "true"); //$NON-NLS-1$ //$NON-NLS-2$
			this._rootDiv.appendChild(div);
			return div;
		},
		_createRuler: function(ruler, index) {
			if (!this._clientDiv) { return; }
			var rulerParent = this._getRulerParent(ruler);
			if (!rulerParent) { return; }
			if (rulerParent !== this._marginDiv || this._marginOffset) {
				rulerParent.style.display = "block"; //$NON-NLS-1$
			}
			rulerParent.rulerWidth = undefined;
			var div = util.createElement(rulerParent.ownerDocument, "div"); //$NON-NLS-1$
			div._ruler = ruler;
			ruler.node = div;
			div.rulerChanged = true;
			div.style.position = "relative"; //$NON-NLS-1$
			div.style.cssFloat = "left"; //$NON-NLS-1$
			div.style.styleFloat = "left"; //$NON-NLS-1$
			div.style.outline = "none"; //$NON-NLS-1$
			if (index === undefined || index < 0 || index >= rulerParent.children.length) {
				rulerParent.appendChild(div);
			} else {
				var sibling = rulerParent.firstChild;
				while (sibling && index-- > 0) {
					sibling = sibling.nextSibling;
				}
				rulerParent.insertBefore(div, sibling);
			}
		},
		_createSelectionDiv: function() {
			var div = util.createElement(this._parent.ownerDocument, "div"); //$NON-NLS-1$
			div.className = "textviewSelection"; //$NON-NLS-1$
			div.style.position = "absolute"; //$NON-NLS-1$
			div.style.borderWidth = "0px"; //$NON-NLS-1$
			div.style.margin = "0px"; //$NON-NLS-1$
			div.style.padding = "0px"; //$NON-NLS-1$
			div.style.outline = "none"; //$NON-NLS-1$
			div.style.width = "0px"; //$NON-NLS-1$
			div.style.height = "0px"; //$NON-NLS-1$
			div.style.zIndex = "0"; //$NON-NLS-1$
			return div;
		},
		_createView: function() {
			if (this._clientDiv) { return; }
			var _parent = this._parent;
			while (_parent.hasChildNodes()) { _parent.removeChild(_parent.lastChild); }

			var doc = _parent.ownerDocument;
			var rootDiv = util.createElement(doc, "div"); //$NON-NLS-1$
			this._rootDiv = rootDiv;
			rootDiv.tabIndex = -1;
			rootDiv.style.position = "relative"; //$NON-NLS-1$
			rootDiv.style.overflow = "hidden"; //$NON-NLS-1$
			rootDiv.style.width = "100%"; //$NON-NLS-1$
			rootDiv.style.height = "100%"; //$NON-NLS-1$
			rootDiv.style.overflow = "hidden"; //$NON-NLS-1$
			rootDiv.style.WebkitTextSizeAdjust = "100%"; //$NON-NLS-1$
			rootDiv.setAttribute("role", "application"); //$NON-NLS-1$ //$NON-NLS-2$
			rootDiv.setAttribute("aria-label", "Text View"); //$NON-NLS-1$
			_parent.appendChild(rootDiv);
			
			var leftDiv = this._createRulerParent(doc, "textviewLeftRuler"); //$NON-NLS-1$
			this._leftDiv = leftDiv;

			var viewDiv = util.createElement(doc, "div"); //$NON-NLS-1$
			viewDiv.className = "textviewScroll"; //$NON-NLS-1$
			this._viewDiv = viewDiv;
			viewDiv.tabIndex = -1;
			viewDiv.style.position = "absolute"; //$NON-NLS-1$
			viewDiv.style.top = "0px"; //$NON-NLS-1$
			viewDiv.style.bottom = "0px"; //$NON-NLS-1$
			viewDiv.style.borderWidth = "0px"; //$NON-NLS-1$
			viewDiv.style.margin = "0px"; //$NON-NLS-1$
			viewDiv.style.outline = "none"; //$NON-NLS-1$
			viewDiv.style.background = "transparent"; //$NON-NLS-1$
			rootDiv.appendChild(viewDiv);
			
			var rightDiv = this._createRulerParent(doc, "textviewRightRuler"); //$NON-NLS-1$
			this._rightDiv = rightDiv;
			if (document.dir == "rtl") { /* ACGC */
				rightDiv.style.left = "0px"; //$NON-NLS-1$
			}else{
				rightDiv.style.right = "0px"; //$NON-NLS-1$	  
			}

			var innerRightDiv = this._createRulerParent(doc, "textviewInnerRightRuler"); //$NON-NLS-1$
			this._innerRightDiv = innerRightDiv;
			innerRightDiv.style.zIndex = "1"; //$NON-NLS-1$

			var scrollDiv = util.createElement(doc, "div"); //$NON-NLS-1$
			this._scrollDiv = scrollDiv;
			scrollDiv.style.margin = "0px"; //$NON-NLS-1$
			scrollDiv.style.borderWidth = "0px"; //$NON-NLS-1$
			scrollDiv.style.padding = "0px"; //$NON-NLS-1$
			viewDiv.appendChild(scrollDiv);
			
			var marginDiv = this._marginDiv = this._createRulerParent(doc, "textviewMarginRuler"); //$NON-NLS-1$
			marginDiv.style.zIndex = "4"; //$NON-NLS-1$
			
			if (!util.isIE && !util.isIOS) {
				var clipDiv = util.createElement(doc, "div"); //$NON-NLS-1$
				this._clipDiv = clipDiv;
				clipDiv.style.position = "absolute"; //$NON-NLS-1$
				clipDiv.style.overflow = "hidden"; //$NON-NLS-1$
				clipDiv.style.margin = "0px"; //$NON-NLS-1$
				clipDiv.style.borderWidth = "0px"; //$NON-NLS-1$
				clipDiv.style.padding = "0px"; //$NON-NLS-1$
				clipDiv.style.background = "transparent"; //$NON-NLS-1$
				rootDiv.appendChild(clipDiv);
				
				var clipScrollDiv = util.createElement(doc, "div"); //$NON-NLS-1$
				this._clipScrollDiv = clipScrollDiv;
				clipScrollDiv.style.position = "absolute"; //$NON-NLS-1$
				clipScrollDiv.style.height = "1px"; //$NON-NLS-1$
				clipScrollDiv.style.top = "-1000px"; //$NON-NLS-1$
				clipScrollDiv.style.background = "transparent"; //$NON-NLS-1$
				clipDiv.appendChild(clipScrollDiv);
			}

			var clientDiv = util.createElement(doc, "div"); //$NON-NLS-1$
			clientDiv.className = "textviewContent"; //$NON-NLS-1$
			this._clientDiv = clientDiv;
			clientDiv.tabIndex = 0;
			clientDiv.style.position = "absolute"; //$NON-NLS-1$
			clientDiv.style.borderWidth = "0px"; //$NON-NLS-1$
			clientDiv.style.margin = "0px"; //$NON-NLS-1$
			clientDiv.style.padding = "0px"; //$NON-NLS-1$
			clientDiv.style.outline = "none"; //$NON-NLS-1$
			clientDiv.style.zIndex = "1"; //$NON-NLS-1$
			clientDiv.style.WebkitUserSelect = "text"; //$NON-NLS-1$
			clientDiv.setAttribute("spellcheck", "false"); //$NON-NLS-1$ //$NON-NLS-2$
			if (util.isIOS || util.isAndroid) {
				clientDiv.style.WebkitTapHighlightColor = "transparent"; //$NON-NLS-1$
			}
			(this._clipDiv || rootDiv).appendChild(clientDiv);
			
			this._setFullSelection(this._fullSelection, true);
			
			if (util.isIOS || util.isAndroid) {
				var vScrollDiv = util.createElement(doc, "div"); //$NON-NLS-1$
				this._vScrollDiv = vScrollDiv;
				vScrollDiv.style.position = "absolute"; //$NON-NLS-1$
				vScrollDiv.style.borderWidth = "1px"; //$NON-NLS-1$
				vScrollDiv.style.borderColor = "white"; //$NON-NLS-1$
				vScrollDiv.style.borderStyle = "solid"; //$NON-NLS-1$
				vScrollDiv.style.borderRadius = "4px"; //$NON-NLS-1$
				vScrollDiv.style.backgroundColor = "black"; //$NON-NLS-1$
				vScrollDiv.style.opacity = "0.5"; //$NON-NLS-1$
				vScrollDiv.style.margin = "0px"; //$NON-NLS-1$
				vScrollDiv.style.padding = "0px"; //$NON-NLS-1$
				vScrollDiv.style.outline = "none"; //$NON-NLS-1$
				vScrollDiv.style.zIndex = "3"; //$NON-NLS-1$
				vScrollDiv.style.width = "8px"; //$NON-NLS-1$
				vScrollDiv.style.display = "none"; //$NON-NLS-1$
				rootDiv.appendChild(vScrollDiv);
				var hScrollDiv = util.createElement(doc, "div"); //$NON-NLS-1$
				this._hScrollDiv = hScrollDiv;
				hScrollDiv.style.position = "absolute"; //$NON-NLS-1$
				hScrollDiv.style.borderWidth = "1px"; //$NON-NLS-1$
				hScrollDiv.style.borderColor = "white"; //$NON-NLS-1$
				hScrollDiv.style.borderStyle = "solid"; //$NON-NLS-1$
				hScrollDiv.style.borderRadius = "4px"; //$NON-NLS-1$
				hScrollDiv.style.backgroundColor = "black"; //$NON-NLS-1$
				hScrollDiv.style.opacity = "0.5"; //$NON-NLS-1$
				hScrollDiv.style.margin = "0px"; //$NON-NLS-1$
				hScrollDiv.style.padding = "0px"; //$NON-NLS-1$
				hScrollDiv.style.outline = "none"; //$NON-NLS-1$
				hScrollDiv.style.zIndex = "3"; //$NON-NLS-1$
				hScrollDiv.style.height = "8px"; //$NON-NLS-1$
				hScrollDiv.style.display = "none"; //$NON-NLS-1$
				rootDiv.appendChild(hScrollDiv);
			}

			if (util.isFirefox && !clientDiv.setCapture) {
				var overlayDiv = util.createElement(doc, "div"); //$NON-NLS-1$
				this._overlayDiv = overlayDiv;
				overlayDiv.style.position = clientDiv.style.position;
				overlayDiv.style.borderWidth = clientDiv.style.borderWidth;
				overlayDiv.style.margin = clientDiv.style.margin;
				overlayDiv.style.padding = clientDiv.style.padding;
				overlayDiv.style.cursor = "text"; //$NON-NLS-1$
				overlayDiv.style.zIndex = "2"; //$NON-NLS-1$
				(this._clipDiv || rootDiv).appendChild(overlayDiv);
			}
			clientDiv.contentEditable = "true"; //$NON-NLS-1$
			this._setWrapMode(this._wrapMode, true);
			this._setReadOnly(this._readonly);
			this._setThemeClass(this._themeClass, true);
			this._setTabSize(this._tabSize, true);
			this._setMarginOffset(this._marginOffset, true);
			this._hookEvents();
			bidiUtils.initInputField(clientDiv);
			var rulers = this._rulers;
			for (var i=0; i<rulers.length; i++) {
				this._createRuler(rulers[i]);
			}
			this._update();
			// Detect when the parent is attached to the DOM or display
			var that = this;
			function checkDOMReady() {
				if (!that._rootDiv) { return; }
				that.update(true);
				if (that._metrics.invalid) {
					that._getWindow().setTimeout(function() {
						checkDOMReady();
					}, 100);
				}
			}
			DOMReady(doc, rootDiv, "textview", checkDOMReady); //$NON-NLS-1$
		},
		_defaultOptions: function() {
			return {
				parent: {value: undefined, update: null},
				model: {value: undefined, update: this.setModel},
				scrollAnimation: {value: 0, update: null},
				readonly: {value: false, update: this._setReadOnly},
				fullSelection: {value: true, update: this._setFullSelection},
				tabMode: { value: true, update: null },
				tabSize: {value: 8, update: this._setTabSize},
				expandTab: {value: false, update: null},
				singleMode: {value: false, update: this._setSingleMode},
				noScroll: {value: false, update: this._setNoScroll},
				overwriteMode: { value: false, update: this._setOverwriteMode },
				blockCursorVisible: { value: false, update: this._setBlockCursor},
				marginOffset: {value: 0, update: this._setMarginOffset},
				wrapOffset: {value: 0, update: this._setWrapOffset},
				wrapMode: {value: false, update: this._setWrapMode},
				wrappable: {value: false, update: null},
				undoStack: {value: null, update: this._setUndoStack},
				theme: {value: mTextTheme.TextTheme.getTheme(), update: this._setTheme},
				themeClass: {value: undefined, update: this._setThemeClass}
			};
		},
		_destroyRuler: function(ruler) {
			var rulerParent = this._getRulerParent(ruler);
			if (rulerParent) {
				var div = rulerParent.firstChild;
				while (div) {
					if (div._ruler === ruler) {
						div._ruler = undefined;
						rulerParent.removeChild(div);
						if (rulerParent.children.length === 0 && (rulerParent !== this._marginDiv || !this._marginOffset)) {
							rulerParent.style.display = "none"; //$NON-NLS-1$
						}
						rulerParent.rulerWidth = undefined;
						break;
					}
					div = div.nextSibling;
				}
			}
		},
		_destroyView: function() {
			var clientDiv = this._clientDiv;
			if (!clientDiv) { return; }
			this._setGrab(null);
			this._unhookEvents();

			/* Destroy timers */
			var win = this._getWindow();
			if (this._autoScrollTimerID) {
				win.clearTimeout(this._autoScrollTimerID);
				this._autoScrollTimerID = null;
			}
			if (this._updateTimer) {
				win.clearTimeout(this._updateTimer);
				this._updateTimer = null;
			}
			if (this._calculateLHTimer) {
				win.clearTimeout(this._calculateLHTimer);
				this._calculateLHTimer = null;
			}
			if (this._cursorTimer) {
				win.clearInterval(this._cursorTimer);
				this._cursorTimer = null;
			}
			if (this._imeTimeout) {
				win.clearInterval(this._imeTimeout);
				this._imeTimeout = null;
			}
			
			var rootDiv = this._rootDiv;
			rootDiv.parentNode.removeChild(rootDiv);

			/* Destroy DOM */
			this._domSelection = null;
			this._clipboardDiv = null;
			this._rootDiv = null;
			this._scrollDiv = null;
			this._viewDiv = null;
			this._clipDiv = null;
			this._clipScrollDiv = null;
			this._clientDiv = null;
			this._overlayDiv = null;
			this._leftDiv = null;
			this._rightDiv = null;
			this._innerRightDiv = null;
			this._marginDiv = null;
			this._cursorDiv = null;
			this._vScrollDiv = null;
			this._hScrollDiv = null;
		},
		_doAutoScroll: function (direction, x, y) {
			this._autoScrollDir = direction;
			this._autoScrollX = x;
			this._autoScrollY = y;
			if (!this._autoScrollTimerID) {
				this._autoScrollTimer();
			}
		},
		_endAutoScroll: function () {
			if (this._autoScrollTimerID) {
				var win = this._getWindow();
				win.clearTimeout(this._autoScrollTimerID);
			}
			this._autoScrollDir = undefined;
			this._autoScrollTimerID = undefined;
		},
		_fixCaret: function() {
			var clientDiv = this._clientDiv;
			if (clientDiv) {
				var hasFocus = this._hasFocus;
				this._ignoreFocus = true;
				if (hasFocus) { clientDiv.blur(); }
				clientDiv.contentEditable = false;
				clientDiv.contentEditable = true;
				if (hasFocus) { clientDiv.focus(); }
				this._ignoreFocus = false;
			}
		},
		_getBaseText: function(start, end) {
			var model = this._model;
			/* This is the only case the view access the base model, alternatively the view could use a event to application to customize the text */
			if (model.getBaseModel) {
				start = model.mapOffset(start);
				end = model.mapOffset(end);
				model = model.getBaseModel();
			}
			return model.getText(start, end);
		},
		_getBottomIndex: function (fullyVisible) {
			var child = this._bottomChild;
			if (fullyVisible && this._getClientHeight() > this._getLineHeight()) {
				var rect = child.getBoundingClientRect();
				var clientRect = this._clientDiv.getBoundingClientRect();
				if (rect.bottom > clientRect.bottom) {
					child = this._getLinePrevious(child) || child;
				}
			}
			return child.lineIndex;
		},
		_getBlockSelections: function(selections, lineIndex, pt) {
			var model = this._model;
			selections = selections.filter(function(sel) { return !sel._editing; });
			var firstLine = model.getLineAtOffset(this._blockSelection.getAnchor()), lastLine;
			if (lineIndex > firstLine) {
				lastLine = lineIndex;
			} else {
				lastLine = firstLine;
				firstLine = lineIndex;
			}
			for (var l = firstLine; l <= lastLine; l++) {
				var line = this._getLine(l);
				var o1 = line.getOffset(pt.x, 1);
				var o2 = line.getOffset(this._blockSelection._docX, 1);
				line.destroy();
				if (o1 === o2 && o1 === model.getLineEnd(l)) continue;
				var caret = o1 < o2;
				var sel = new Selection(caret ? o1 : o2, caret ? o2 : o1, caret);
				sel._editing = true;
				selections.push(sel);
			}
			return selections;
		},
		_getBoundsAtOffset: function(offset) {
			var model = this._model;
			var line = this._getLine(model.getLineAtOffset(offset));
			var result = line.getBoundingClientRect(offset);
			var linePixel = this._getLinePixel(line.lineIndex);
			result.top += linePixel;
			result.bottom += linePixel;
			line.destroy();
			return result;
		},
		_getClientHeight: function() {
			var viewPad = this._getViewPadding();
			return Math.max(0, this._viewDiv.clientHeight - viewPad.top - viewPad.bottom);
		},
		_getInnerRightWidth: function() {
			var innerRightWidth = this._innerRightDiv.rulerWidth;
			if (innerRightWidth === undefined) {
				var innerRightRect = this._innerRightDiv.getBoundingClientRect();
				this._innerRightDiv.rulerWidth = innerRightWidth = innerRightRect.right - innerRightRect.left;
			}
			return innerRightWidth;
		},
		_getClientWidth: function() {
			var viewPad = this._getViewPadding();
			var innerRightWidth = this._getInnerRightWidth();
			return Math.max(0, this._viewDiv.clientWidth - viewPad.left - viewPad.right - innerRightWidth);
		},
		_getClipboardText: function (evt, handler) {
			// IE
			var win = this._getWindow();
			var clipboardData = win.clipboardData;
			// WebKit and Firefox > 21
			if (!clipboardData && evt) {
				clipboardData = evt.clipboardData;
			}
			function convert(wholeText) {
				var clipboardText = [];
				convertDelimiter(wholeText, function(t) {clipboardText.push(t);}, null);
				if (handler) { handler(clipboardText); }
				return clipboardText;
			}
			if (clipboardData) {
				return convert(clipboardData.getData(util.isIE ? "Text" : "text/plain")); //$NON-NLS-1$"//$NON-NLS-2$
			}
			if (util.isElectron && !evt) {
				return convert(window.__electron.clipboard.readText());
			}
			if (util.isFirefox) {
				this._ignoreFocus = true;
				var clipboardDiv = this._clipboardDiv;
				var doc = this._rootDiv.ownerDocument;
				if (!clipboardDiv) {
					clipboardDiv = util.createElement(doc, "div"); //$NON-NLS-1$
					this._clipboardDiv = clipboardDiv;
					clipboardDiv.style.position = "fixed"; //$NON-NLS-1$
					clipboardDiv.style.whiteSpace = "pre"; //$NON-NLS-1$
					clipboardDiv.style.left = "-1000px"; //$NON-NLS-1$
					this._rootDiv.appendChild(clipboardDiv);
				}
				clipboardDiv.innerHTML = "<pre contenteditable=''></pre>"; //$NON-NLS-1$
				clipboardDiv.firstChild.focus();
				var that = this;
				var _getText = function() {
					var noteText = that._getTextFromElement(clipboardDiv);
					clipboardDiv.innerHTML = "";
					return convert(noteText);
				};
				
				/* Try execCommand first. Works on firefox with clipboard permission. */
				var result = false;
				this._ignorePaste = true;

				/* Do not try execCommand if middle-click is used, because if we do, we get the clipboard text, not the primary selection text. */
				if (!util.isLinux || this._lastMouseButton !== 2) {
					try {
						result = doc.execCommand("paste", false, null); //$NON-NLS-1$
					} catch (ex) {
						/* Firefox can throw even when execCommand() works, see bug 362835. */
						result = clipboardDiv.childNodes.length > 1 || clipboardDiv.firstChild && clipboardDiv.firstChild.childNodes.length > 0;
					}
				}
				this._ignorePaste = false;
				if (!result) {
					/* Try native paste in DOM, works for firefox during the paste event. */
					if (evt) {
						win.setTimeout(function() {
							that.focus();
							_getText();
							that._ignoreFocus = false;
						}, 0);
						return null;
					} else {
						/* no event and no clipboard permission, paste can't be performed */
						this.focus();
						this._ignoreFocus = false;
						return "";
					}
				}
				this.focus();
				this._ignoreFocus = false;
				return _getText();
			}
			return "";
		},
		_getDOMText: function(child, offsetNode) {
			return child._line.getText(offsetNode);
		},
		_getTextFromElement: function(element) {
			var doc = element.ownerDocument;
			var win = doc.defaultView;
			if (!win.getSelection) {
				return element.innerText || element.textContent;
			}

			var newRange = doc.createRange();
			newRange.selectNode(element);

			var selection = win.getSelection();
			var oldRanges = [], i;
			for (i = 0; i < selection.rangeCount; i++) {
				oldRanges.push(selection.getRangeAt(i));
			}

			this._ignoreSelect = true;
			selection.removeAllRanges();
			selection.addRange(newRange);

			var text = selection.toString();

			selection.removeAllRanges();
			for (i = 0; i < oldRanges.length; i++) {
				selection.addRange(oldRanges[i]);
			}

			this._ignoreSelect = false;
			return text;
		},
		_getViewPadding: function() {
			return this._metrics.viewPadding;
		},
		_getLine: function(lineIndex) {
			var child = this._getLineNode(lineIndex);
			if (child && !child.lineChanged && !child.lineRemoved) {
				return child._line;
			}
			return new TextLine(this, lineIndex);
		},
		_getLineHeight: function(lineIndex, calculate) {
			if (lineIndex !== undefined && this._lineHeight) {
				var lineHeight = this._lineHeight[lineIndex];
				if (lineHeight) { return lineHeight; }
				if (calculate || calculate === undefined) {
					var height = this._lineHeight[lineIndex] = this._calculateLineHeight(lineIndex);
					return height;
				}
			}
			return this._metrics.lineHeight;
		},
		_getLineNode: function (lineIndex) {
			var clientDiv = this._clientDiv;
			var child = clientDiv.firstChild;
			while (child) {
				if (lineIndex === child.lineIndex) {
					return child;
				}
				child = child.nextSibling;
			}
			return undefined;
		},
		_getLineNext: function (lineNode) {
			var node = lineNode ? lineNode.nextSibling : this._clientDiv.firstChild;
			while (node && (node.lineIndex === -1 || !node._line)) {
				node = node.nextSibling;
			}
			return node;
		},
		_getLinePrevious: function (lineNode) {
			var node = lineNode ? lineNode.previousSibling : this._clientDiv.lastChild;
			while (node && (node.lineIndex === -1 || !node._line)) {
				node = node.previousSibling;
			}
			return node;
		},
		_getLinePixel: function(lineIndex) {
			lineIndex = Math.min(Math.max(0, lineIndex), this._model.getLineCount());
			if (this._lineHeight) {
				var topIndex = this._getTopIndex();
				var pixel = -this._topIndexY + this._getScroll().y, i;
				if (lineIndex > topIndex) {
					for (i = topIndex; i < lineIndex; i++) {
						pixel += this._getLineHeight(i);
					}
				} else {
					for (i = topIndex - 1; i >= lineIndex; i--) {
						pixel -= this._getLineHeight(i);
					}
				}
				return pixel;
			}
			var lineHeight = this._getLineHeight();
			return lineHeight * lineIndex;
		},
		/**
		 * @name _getLineIndex
		 * @description Returns the line index closest to the given text view relative location.  Will return -1
		 * 				if restrictToValidLines is true and y location is outside of text lines.
		 * @function
		 * @private
		 * @param y location to search
		 * @param restrictToValidLines whether to return -1 if the location is outside a valid line, otherwise return the closest valid line index
		 * @returns returns The line index closest to the location or -1 if restrictToValidLines is true and location is outside text area
		 */
		_getLineIndex: function(y, restrictToValidLines) {
			var lineHeight, lineIndex = 0;
			var lineCount = this._model.getLineCount();
			if (this._lineHeight) {
				lineIndex = this._getTopIndex();
				var pixel = -this._topIndexY + this._getScroll().y;
				if (y !== pixel) {
					if (y < pixel) {
						while (y < pixel && lineIndex > 0) {
							y += this._getLineHeight(--lineIndex);
						}
					} else {
						lineHeight = this._getLineHeight(lineIndex);
						while (y - lineHeight >= pixel && lineIndex < lineCount - 1) {
							y -= lineHeight;
							lineHeight = this._getLineHeight(++lineIndex);
						}
					}
				}
			} else {
				lineHeight = this._getLineHeight();
				lineIndex = Math.floor(y / lineHeight);
			}
			if (restrictToValidLines){
				if (lineCount === 0 || lineIndex < 0 || lineIndex > (lineCount-1)){
					return -1;
				}
			}
			return Math.max(0, Math.min(lineCount - 1, lineIndex));
		},
		_getRulerParent: function(ruler) {
			switch (ruler.getLocation()) {
				case "left": return this._leftDiv; //$NON-NLS-1$
				case "right": return this._rightDiv; //$NON-NLS-1$
				case "innerRight": return this._innerRightDiv; //$NON-NLS-1$
				case "margin": return this._marginDiv; //$NON-NLS-1$
			}
			return null;
		},
		_getScroll: function(cancelAnimation) {
			if (cancelAnimation === undefined || cancelAnimation) {
				this._cancelAnimation();
			}
			var viewDiv = this._viewDiv;
			return {x: viewDiv.scrollLeft, y: viewDiv.scrollTop};
		},
		_getSelection: function () {
			return (Array.isArray(this._selection) ? this._selection[0] : this._selection).clone();
		},
		_getSelections: function () {
			return (Array.isArray(this._selection) ? this._selection : [this._selection]).map(function(s) {
				return s.clone();
			});
		},
		_getTopIndex: function (fullyVisible) {
			var child = this._topChild;
			if (fullyVisible && this._getClientHeight() > this._getLineHeight()) {
				var rect = child.getBoundingClientRect();
				var viewPad = this._getViewPadding();
				var viewRect = this._viewDiv.getBoundingClientRect();
				if (rect.top < viewRect.top + viewPad.top) {
					child = this._getLineNext(child) || child;
				}
			}
			return child.lineIndex;
		},
		_hookEvents: function() {
			var that = this;
			this._modelListener = {
				/** @private */
				onChanging: function(modelChangingEvent) {
					that._onModelChanging(modelChangingEvent);
				},
				/** @private */
				onChanged: function(modelChangedEvent) {
					that._onModelChanged(modelChangedEvent);
				}
			};
			this._model.addEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-1$
			this._model.addEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-1$
			
			this._themeListener = {
				onChanged: function() {
					that._setThemeClass(that._themeClass);
				}
			};
			this._theme.addEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-1$
			
			var handlers = this._handlers = [];
			var clientDiv = this._clientDiv, viewDiv = this._viewDiv, rootDiv = this._rootDiv;
			var topNode = this._overlayDiv || clientDiv;
			var doc = clientDiv.ownerDocument;
			var win = this._getWindow();
			var grabNode = util.isIE ? doc : win;
			handlers.push({target: win, type: "resize", handler: function(e) { return that._handleResize(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "blur", handler: function(e) { return that._handleBlur(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "focus", handler: function(e) { return that._handleFocus(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: viewDiv, type: "focus", handler: function() { clientDiv.focus(); }}); //$NON-NLS-1$
			var textModel = that.getModel();
			if(textModel && typeof textModel.deferScroll === "function") {//If textModel is extended to defer the scroll handler for segmental contents
				var deferredHandler = textModel.deferScroll(that, that._handleScroll.bind(that));
				handlers.push({target: viewDiv, type: "scroll", handler: function(e) { return deferredHandler(e ? e : win.event);}}); //$NON-NLS-0$
			} else {
				handlers.push({target: viewDiv, type: "scroll", handler: function(e) { return that._handleScroll(e ? e : win.event);}}); //$NON-NLS-1$
			}
			handlers.push({target: clientDiv, type: "textInput", handler: function(e) { return that._handleTextInput(e ? e : win.event); }}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "keydown", handler: function(e) { return that._handleKeyDown(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "keypress", handler: function(e) { return that._handleKeyPress(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "keyup", handler: function(e) { return that._handleKeyUp(e ? e : win.event);}}); //$NON-NLS-1$
			if (util.isIE) {
				handlers.push({target: doc, type: "keyup", handler: function(e) { return that._handleDocKeyUp(e ? e : win.event);}}); //$NON-NLS-1$
			}
			handlers.push({target: clientDiv, type: "contextmenu", handler: function(e) { return that._handleContextMenu(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "copy", handler: function(e) { return that._handleCopy(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "cut", handler: function(e) { return that._handleCut(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: clientDiv, type: "paste", handler: function(e) { return that._handlePaste(e ? e : win.event);}}); //$NON-NLS-1$
			handlers.push({target: doc, type: "selectionchange", handler: function(e) { return that._handleSelectionChange(e ? e : win.event); }}); //$NON-NLS-1$
			if (util.isIOS || util.isAndroid) {
				handlers.push({target: clientDiv, type: "touchstart", handler: function(e) { return that._handleTouchStart(e ? e : win.event); }}); //$NON-NLS-1$
				handlers.push({target: clientDiv, type: "touchmove", handler: function(e) { return that._handleTouchMove(e ? e : win.event); }}); //$NON-NLS-1$
				handlers.push({target: clientDiv, type: "touchend", handler: function(e) { return that._handleTouchEnd(e ? e : win.event); }}); //$NON-NLS-1$
			} else {
				handlers.push({target: clientDiv, type: "selectstart", handler: function(e) { return that._handleSelectStart(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: clientDiv, type: "mousedown", handler: function(e) { return that._handleMouseDown(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: clientDiv, type: "mouseover", handler: function(e) { return that._handleMouseOver(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: clientDiv, type: "mouseout", handler: function(e) { return that._handleMouseOut(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: grabNode, type: "mouseup", handler: function(e) { return that._handleMouseUp(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: grabNode, type: "mousemove", handler: function(e) { return that._handleMouseMove(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: rootDiv, type: "mousedown", handler: function(e) { return that._handleRootMouseDown(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: rootDiv, type: "mouseup", handler: function(e) { return that._handleRootMouseUp(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "dragstart", handler: function(e) { return that._handleDragStart(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "drag", handler: function(e) { return that._handleDrag(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "dragend", handler: function(e) { return that._handleDragEnd(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "dragenter", handler: function(e) { return that._handleDragEnter(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "dragover", handler: function(e) { return that._handleDragOver(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "dragleave", handler: function(e) { return that._handleDragLeave(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: topNode, type: "drop", handler: function(e) { return that._handleDrop(e ? e : win.event);}}); //$NON-NLS-1$
				handlers.push({target: this._clientDiv, type: util.isFirefox > 26 ? "wheel" : util.isFirefox ? "DOMMouseScroll" : "mousewheel", handler: function(e) { return that._handleMouseWheel(e ? e : win.event); }}); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-3$
				if (this._clipDiv) {
					handlers.push({target: this._clipDiv, type: util.isFirefox > 26 ? "wheel" : util.isFirefox ? "DOMMouseScroll" : "mousewheel", handler: function(e) { return that._handleMouseWheel(e ? e : win.event); }}); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-3$
				}
				if (util.isFirefox && (!util.isWindows || util.isFirefox >= 15)) {
					var MO = win.MutationObserver || win.MozMutationObserver;
					if (MO) {
						this._mutationObserver = new MO(function(mutations) { that._handleDataModified(mutations); });
						this._mutationObserver.observe(clientDiv, {subtree: true, characterData: true});
					} else {
						handlers.push({target: this._clientDiv, type: "DOMCharacterDataModified", handler: function (e) { return that._handleDataModified(e ? e : win.event); }}); //$NON-NLS-1$
					}
				}
				if ((util.isFirefox && (!util.isWindows || util.isFirefox >= 15)) || util.isIE || util.isWebkit) {
					handlers.push({target: this._clientDiv, type: "compositionstart", handler: function (e) { return that._handleCompositionStart(e ? e : win.event); }}); //$NON-NLS-1$
					handlers.push({target: this._clientDiv, type: "compositionend", handler: function (e) { return that._handleCompositionEnd(e ? e : win.event); }}); //$NON-NLS-1$
					handlers.push({target: this._clientDiv, type: "compositionupdate", handler: function (e) { return that._handleCompositionUpdate(e ? e : win.event); }}); //$NON-NLS-1$
				}
				if (this._overlayDiv) {
					handlers.push({target: this._overlayDiv, type: "mousedown", handler: function(e) { return that._handleMouseDown(e ? e : win.event);}}); //$NON-NLS-1$
					handlers.push({target: this._overlayDiv, type: "mouseover", handler: function(e) { return that._handleMouseOver(e ? e : win.event);}}); //$NON-NLS-1$
					handlers.push({target: this._overlayDiv, type: "mouseout", handler: function(e) { return that._handleMouseOut(e ? e : win.event);}}); //$NON-NLS-1$
					handlers.push({target: this._overlayDiv, type: "contextmenu", handler: function(e) { return that._handleContextMenu(e ? e : win.event); }}); //$NON-NLS-1$
				}
				if (!this._isW3CEvents) {
					handlers.push({target: this._clientDiv, type: "dblclick", handler: function(e) { return that._handleDblclick(e ? e : win.event); }}); //$NON-NLS-1$
				}
			}

			this._hookRulerEvents(this._leftDiv, handlers);
			this._hookRulerEvents(this._rightDiv, handlers);
			this._hookRulerEvents(this._innerRightDiv, handlers);
			this._hookRulerEvents(this._marginDiv, handlers);
			
			for (var i=0; i<handlers.length; i++) {
				var h = handlers[i];
				addHandler(h.target, h.type, h.handler, h.capture);
			}
		},
		_hookRulerEvents: function(div, handlers) {
			if (!div) { return; }
			var that = this;
			var win = this._getWindow();
			if (util.isIE) {
				handlers.push({target: div, type: "selectstart", handler: function() {return false;}}); //$NON-NLS-1$
			}
			handlers.push({target: div, type: util.isFirefox > 26 ? "wheel" : util.isFirefox ? "DOMMouseScroll" : "mousewheel", handler: function(e) { return that._handleMouseWheel(e ? e : win.event); }}); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-3$
			handlers.push({target: div, type: "click", handler: function(e) { that._handleRulerEvent(e ? e : win.event); }}); //$NON-NLS-1$
			handlers.push({target: div, type: "dblclick", handler: function(e) { that._handleRulerEvent(e ? e : win.event); }}); //$NON-NLS-1$
			handlers.push({target: div, type: "mousemove", handler: function(e) { that._handleRulerEvent(e ? e : win.event); }}); //$NON-NLS-1$
			handlers.push({target: div, type: "mouseover", handler: function(e) { that._handleRulerEvent(e ? e : win.event); }}); //$NON-NLS-1$
			handlers.push({target: div, type: "mouseout", handler: function(e) { that._handleRulerEvent(e ? e : win.event); }}); //$NON-NLS-1$
		},
		_getWindow: function() {
			return getWindow(this._parent.ownerDocument);
		},
		_ignoreEvent: function(e) {
			var node = e.target;
			while (node && node !== this._clientDiv) {
				if (node.ignore) { return true; }
				node = node.parentNode;
			}
			return false;
		},
		_init: function(options) {
			var _parent = options.parent;
			if (typeof(_parent) === "string") { //$NON-NLS-1$
				_parent = (options.document || document).getElementById(_parent);
			}
			if (!_parent) { throw new Error("no parent"); } //$NON-NLS-1$
			options.parent = _parent;
			options.model = options.model || new mTextModel.TextModel();
			var defaultOptions = this._defaultOptions();
			for (var option in defaultOptions) {
				if (defaultOptions.hasOwnProperty(option)) {
					var value;
					if (options[option] !== undefined) {
						value = options[option];
					} else {
						value = defaultOptions[option].value;
					}
					this["_" + option] = value; //$NON-NLS-1$
				}
			}
			this._keyModes = [];
			this._rulers = [];
			this._selection = [new Selection(0, 0, false)];
			this._linksVisible = false;
			this._redrawCount = 0;
			this._maxLineWidth = 0;
			this._maxLineIndex = -1;
			this._ignoreSelect = true;
			this._ignoreFocus = false;
			this._hasFocus = false;
			this._dragOffset = -1;
			this._isRangeRects = (!util.isIE || util.isIE >= 9) && typeof _parent.ownerDocument.createRange().getBoundingClientRect === "function"; //$NON-NLS-1$
			this._isW3CEvents = _parent.addEventListener;

			/* Auto scroll */
			this._autoScrollX = null;
			this._autoScrollY = null;
			this._autoScrollTimerID = null;
			this._AUTO_SCROLL_RATE = 50;
			this._grabControl = null;
			this._moseMoveClosure  = null;
			this._mouseUpClosure = null;
			
			/* Double click */
			this._lastMouseX = 0;
			this._lastMouseY = 0;
			this._lastMouseTime = 0;
			this._clickCount = 0;
			this._clickTime = 250;
			this._clickDist = 5;
			this._isMouseDown = false;
			this._doubleClickSelection = null;
			
			/* Scroll */
			this._hScroll = 0;
			this._vScroll = 0;

			/* IME */
			this._imeOffset = -1;
			
			/* Create elements */
			this._createActions();
			this._createView();
		},
		_checkOverlayScroll: function() {
			if (util.isMac && util.isWebkit) {
				if (!this._metrics.invalid && this._metrics.scrollWidth === 0) {
					var viewDiv = this._viewDiv;
					var overlay = this._isOverOverlayScroll();
					if (overlay.vertical || overlay.horizontal) {
						viewDiv.style.pointerEvents = ""; //$NON-NLS-1$
					} else {
						viewDiv.style.pointerEvents = "none"; //$NON-NLS-1$
					}
				}
			}	
		},
		_isOverOverlayScroll: function() {
			var scrollShowing = Date.now() - this._lastScrollTime < 1000;
			if (!scrollShowing) {
				return {};
			}
			var rect = this._viewDiv.getBoundingClientRect();
			var x = this._lastMouseMoveX;
			var y = this._lastMouseMoveY;
			var overlayScrollWidth = 15;
			return {
				vertical: rect.top <= y && y < rect.bottom && rect.right - overlayScrollWidth <= x && x < rect.right,
				horizontal: rect.bottom - overlayScrollWidth <= y && y < rect.bottom && rect.left <= x && x < rect.right
			};
		},
		_startUndo: function() {
			if (this._undoStack) {
				var that = this;
				this._compoundChange = this._undoStack.startCompoundChange({
					end: function() {
						that._compoundChange = null;
					}
				});
			}
		},
		_endUndo: function() {
			if (this._undoStack) {
				this._undoStack.endCompoundChange();
			}
		},
		_modifyContent: function(e, caretAtEnd, show, callback) {
			if (this._readonly && !e._code) {
				return false;
			}
			e.type = "Verify"; //$NON-NLS-1$
			var oldStart = e.start = e.selection[0].start;
			var oldEnd = e.end = e.selection[0].end;
			this.onVerify(e);
			if (oldStart !== e.start) e.selection[0].start = e.start;
			if (oldEnd !== e.end) e.selection[0].end = e.end;

			if (e.text === null || e.text === undefined) { return false; }
			
			if (e.selection.length > 1) this.setRedraw(false);
			
			var undo = this._compoundChange;
			if (undo) {
				if (!Selection.compare(this._getSelections(), undo.owner.selection)) {
					this._endUndo();
					if (e.selection.length > 1) this._startUndo();
				}
			} else {
				if (e.selection.length > 1) this._startUndo();
			}
			
			var model = this._model;
			try {
				if (e._ignoreDOMSelection) { this._ignoreDOMSelection = true; }
				var offset = 0, i = 0;
				e.selection.forEach(function(selection) {
					selection.start += offset;
					selection.end += offset;
					var text = Array.isArray(e.text) ? e.text[i] : e.text;
					model.setText(text, selection.start, selection.end);
					offset += (selection.start - selection.end) + text.length;
					selection.setCaret(caretAtEnd ? selection.start + text.length : selection.start);
					i++;
				});
			} finally {
				if (e._ignoreDOMSelection) { this._ignoreDOMSelection = false; }
			}
			this._setSelection(e.selection, show, true, callback);
			
			undo = this._compoundChange;
			if (undo) undo.owner.selection = e.selection;
			
			if (e.selection.length > 1) this.setRedraw(true);

			this.onModify({type: "Modify"}); //$NON-NLS-1$
			return true;
		},
		_onModelChanged: function(modelChangedEvent) {
			modelChangedEvent.type = "ModelChanged"; //$NON-NLS-1$
			this.onModelChanged(modelChangedEvent);
			modelChangedEvent.type = "Changed"; //$NON-NLS-1$
			var start = modelChangedEvent.start;
			var addedCharCount = modelChangedEvent.addedCharCount;
			var removedCharCount = modelChangedEvent.removedCharCount;
			var addedLineCount = modelChangedEvent.addedLineCount;
			var removedLineCount = modelChangedEvent.removedLineCount;
			
			var selections = this._getSelections();
			selections.forEach(function(selection) {
				if (selection.end > start) {
					if (selection.end > start && selection.start < start + removedCharCount) {
						// selection intersects replaced text. set caret behind text change
						selection.setCaret(start + addedCharCount);
					} else {
						// move selection to keep same text selected
						selection.start +=  addedCharCount - removedCharCount;
						selection.end +=  addedCharCount - removedCharCount;
					}
				}
			});
			this._setSelection(selections, false, false);
			
			var model = this._model;
			var startLine = model.getLineAtOffset(start);
			var child = this._getLineNext();
			while (child) {
				var lineIndex = child.lineIndex;
				if (startLine <= lineIndex && lineIndex <= startLine + removedLineCount) {
					if (startLine === lineIndex && !child.modelChangedEvent && !child.lineRemoved) {
						child.modelChangedEvent = modelChangedEvent;
						child.lineChanged = true;
					} else {
						child.lineRemoved = true;
						child.lineChanged = false;
						child.modelChangedEvent = null;
					}
				}
				if (lineIndex > startLine + removedLineCount) {
					child.lineIndex = lineIndex + addedLineCount - removedLineCount;
					child._line.lineIndex = child.lineIndex;
				}
				child = this._getLineNext(child);
			}
			if (this._lineHeight) {
				var args = [startLine, removedLineCount].concat(newArray(addedLineCount));
				Array.prototype.splice.apply(this._lineHeight, args);
			}
			if (!this._wrapMode) {
				if (startLine <= this._maxLineIndex && this._maxLineIndex <= startLine + removedLineCount) {
					this._checkMaxLineIndex = this._maxLineIndex;
					this._maxLineIndex = -1;
					this._maxLineWidth = 0;
				}
			}
			this._update();
		},
		_onModelChanging: function(modelChangingEvent) {
			modelChangingEvent.type = "ModelChanging"; //$NON-NLS-1$
			this.onModelChanging(modelChangingEvent);
			modelChangingEvent.type = "Changing"; //$NON-NLS-1$
		},
		_queueUpdate: function() {
			if (this._updateTimer || this._ignoreQueueUpdate) { return; }
			var that = this;
			var win = this._getWindow();
			this._updateTimer = win.setTimeout(function() { 
				that._updateTimer = null;
				that._update();
			}, 0);
		},
		_rangesToSelections: function(ranges) {
			var selections = [];
			var charCount = this._model.getCharCount();
			ranges.forEach(function(range) {
				var selection;
				if (range instanceof Selection) {
					selection = range.clone();
				} else {
					var start = range.start;
					var end = range.end;
					var caret = start > end;
					if (caret) {
						var tmp = start;
						start = end;
						end = tmp;
					}
					start = Math.max(0, Math.min (start, charCount));
					end = Math.max(0, Math.min (end, charCount));
					selection = new Selection(start, end, caret);
				}
				selections.push(selection);
			});
			return selections;
		},
		_resetLineHeight: function(startLine, endLine) {
			if (this._wrapMode || this._variableLineHeight) {
				if (startLine !== undefined && endLine !== undefined) {
					for (var i = startLine; i < endLine; i++) {
						this._lineHeight[i] = undefined;
					}
				} else {
					this._lineHeight = newArray(this._model.getLineCount());
				}
				this._calculateLineHeightTimer();
			} else {
				this._lineHeight = null;
			}
		},
		_resetLineWidth: function() {
			var clientDiv = this._clientDiv;
			if (clientDiv) {
				var child = clientDiv.firstChild;
				while (child) {
					child.lineWidth = undefined;
					child = child.nextSibling;
				}
			}
		},
		_reset: function() {
			this._maxLineIndex = -1;
			this._maxLineWidth = 0;
			this._topChild = null;
			this._bottomChild = null;
			this._topIndexY = 0;
			this._variableLineHeight = false;
			this._resetLineHeight();
			this._setSelection(new Selection(0, 0, false), false, false);
			if (this._viewDiv) {
				this._viewDiv.scrollLeft = 0;
				this._viewDiv.scrollTop = 0;
			}
			var clientDiv = this._clientDiv;
			if (clientDiv) {
				var child = clientDiv.firstChild;
				while (child) {
					child.lineRemoved = true;
					child = child.nextSibling;
				}
				/*
				* Bug in Firefox.  For some reason, the caret does not show after the
				* view is refreshed.  The fix is to toggle the contentEditable state and
				* force the clientDiv to loose and receive focus if it is focused.
				*/
				if (util.isFirefox < 13) {
					this._fixCaret ();
				}
			}
		},
		_scrollViewAnimated: function (pixelX, pixelY, callback) {
			var win = this._getWindow();
			if (callback && this._scrollAnimation) {
				var that = this;
				this._animation = new Animation({
					window: win,
					duration: this._scrollAnimation,
					curve: [pixelY, 0],
					onAnimate: function(x) {
						var deltaY = pixelY - Math.floor(x);
						that._scrollView (0, deltaY);
						pixelY -= deltaY;
					},
					onEnd: function() {
						that._animation = null;
						that._scrollView (pixelX, pixelY);
						if (callback) {
							win.setTimeout(callback, 0);
						}
					}
				});
				this._animation.play();
			} else {
				this._scrollView (pixelX, pixelY);
				if (callback) {
					win.setTimeout(callback, 0);
				}
			}
		}, 
		_scrollView: function (pixelX, pixelY) {
			/*
			* Always set _ensureCaretVisible to false so that the view does not scroll
			* to show the caret when scrollView is not called from showCaret().
			*/
			this._ensureCaretVisible = false;
			
			/*
			* Scrolling is done only by setting the scrollLeft and scrollTop fields in the
			* view div. This causes an update from the scroll event. In some browsers 
			* this event is asynchronous and forcing update page to run synchronously
			* leads to redraw problems. 
			* On Chrome 11, the view redrawing at times when holding PageDown/PageUp key.
			* On Firefox 4 for Linux, the view redraws the first page when holding 
			* PageDown/PageUp key, but it will not redraw again until the key is released.
			*/
			var viewDiv = this._viewDiv;
			if (pixelX) { viewDiv.scrollLeft += pixelX; }
			if (pixelY) { viewDiv.scrollTop += pixelY; }
		},
		_setClipboardText: function (text, evt) {
			if (util.isElectron && !evt) {
				window.__electron.clipboard.writeText(text);
				return true;
			}
			var clipboardText;
			// IE
			var win = this._getWindow();
			var clipboardData = win.clipboardData;
			// WebKit and Firefox > 21
			if (!clipboardData && evt) {
				clipboardData = evt.clipboardData;
			}
			if (clipboardData) {
				clipboardText = [];
				convertDelimiter(text, function(t) {clipboardText.push(t);}, function() {clipboardText.push(util.platformDelimiter);});
				/*
				* Note that setData() succeeds on Firefox > 21 and WebKit, but the return value is not a boolean like IE.
				*/
				var success = clipboardData.setData(util.isIE ? "Text" : "text/plain", clipboardText.join("")); //$NON-NLS-1$ //$NON-NLS-2$
				if (success || (evt && (util.isFirefox > 21 || util.isWebkit))) {
					return true;
				}
				if (!evt) return false;
			}
			var doc = this._parent.ownerDocument;
			var child = util.createElement(doc, "pre"); //$NON-NLS-1$
			child.style.position = "fixed"; //$NON-NLS-1$
			child.style.left = "-1000px"; //$NON-NLS-1$
			convertDelimiter(text, 
				function(t) {
					child.appendChild(doc.createTextNode(t));
				}, 
				function() {
					child.appendChild(util.createElement(doc, "br")); //$NON-NLS-1$
				}
			);
			child.appendChild(doc.createTextNode(" ")); //$NON-NLS-1$
			this._clientDiv.appendChild(child);
			var range = doc.createRange();
			range.setStart(child.firstChild, 0);
			range.setEndBefore(child.lastChild);
			var sel = win.getSelection();
			if (sel.rangeCount > 0) { sel.removeAllRanges(); }
			sel.addRange(range);
			var that = this;
			/** @ignore */
			var cleanup = function() {
				if (child && child.parentNode === that._clientDiv) {
					that._clientDiv.removeChild(child);
				}
				that._updateDOMSelection();
			};
			var result = false;
			/* 
			* Try execCommand first, it works on firefox with clipboard permission,
			* chrome 5, safari 4.
			*/
			this._ignoreCopy = true;
			try {
				result = doc.execCommand("copy", false, null); //$NON-NLS-1$
			} catch (e) {}
			this._ignoreCopy = false;
			if (!result) {
				if (evt) {
					win.setTimeout(cleanup, 0);
					return false;
				}
			}
			/* no event and no permission, copy cannot be done */
			cleanup();
			return true;
		},
		_setGrab: function (target) {
			if (target === this._grabControl) { return; }
			if (target) {
				if (target.setCapture) { target.setCapture(); }
				this._grabControl = target;
			} else {
				if (this._grabControl.releaseCapture) { this._grabControl.releaseCapture(); }
				this._grabControl = null;
			}
		},
		_setLinksVisible: function(visible) {
			if (this._linksVisible === visible) { return; }
			this._linksVisible = visible;
			/*
			* Feature in IE.  The client div looses focus and does not regain it back
			* when the content editable flag is reset. The fix is to remember that it
			* had focus when the flag is cleared and give focus back to the div when
			* the flag is set.
			*/
			if (util.isIE && visible) {
				this._hadFocus = this._hasFocus;
			}
			var clientDiv = this._clientDiv;
			clientDiv.contentEditable = !visible;
			if (this._hadFocus && !visible) {
				clientDiv.focus();
			}
			if (this._overlayDiv) {
				this._overlayDiv.style.zIndex = visible ? "-1" : "1"; //$NON-NLS-1$ //$NON-NLS-2$
			}
			var line = this._getLineNext();
			while (line) {
				line._line.updateLinks();
				line = this._getLineNext(line);
			}
			this._updateDOMSelection();
		},
		_setSelection: function (selection, _scroll, update, callback, pageScroll, add, preserveCursorX) {
			if (selection) {
				if (update === undefined) { update = true; }
				var oldSelection = this._getSelections(), newSelection;
				if (Array.isArray(selection)) {
					newSelection = selection;
				} else if (add) {
					newSelection = oldSelection.concat([selection]);
				} else {
					newSelection = [selection];
				}
				this._selection = Selection.merge(newSelection);
				
				if (!preserveCursorX) {
					newSelection.forEach(function(sel) {
						sel._columnX = -1;
					});
				}

				/* 
				* Always showCaret(), even when the selection is not changing, to ensure the
				* caret is visible. Note that some views do not scroll to show the caret during
				* keyboard navigation when the selection does not chanage. For example, line down
				* when the caret is already at the last line.
				*/
				if (_scroll !== false) { /*update = !*/this._showCaret(false, callback, _scroll, pageScroll); }
				
				/* 
				* Sometimes the browser changes the selection 
				* as result of method calls or "leaked" events. 
				* The fix is to set the visual selection even
				* when the logical selection is not changed.
				*/
				if (update) { this._updateDOMSelection(); }
				
				if (!Selection.compare(oldSelection, newSelection)) {
					var e = {
						type: "Selection", //$NON-NLS-1$
						oldValue: Selection.convert(oldSelection),
						newValue: Selection.convert(newSelection)
					};
					this.onSelection(e);
				}
			}
		},
		_setSelectionTo: function (x, y, down, extent, add, drag) {
			var model = this._model;
			var selections = this._getSelections();
			var pt = this.convert({x: x, y: y}, "page", "document"); //$NON-NLS-1$ //$NON-NLS-2$
			var lineIndex = this._getLineIndex(pt.y);
			var line = this._getLine(lineIndex);
			var offset = line.getOffset(pt.x, pt.y - this._getLinePixel(lineIndex));
			if (drag && !extent) {
				if (Selection.contains(selections, offset)) {
					this._dragOffset = offset;
					line.destroy();
					return false;
				}
			}
			if (this._blockSelection) {
				selections = this._getBlockSelections(selections, lineIndex, pt);
			} else {
				var selection;
				if (!down) {
					selection = Selection.editing(selections);
				} else if (extent) {
					selection = selections[selections.length - 1];
					selection._editing = true;
				} else {
					selection = new Selection(0, 0);
					selection._editing = true;
					if (add) {
						selections.push(selection);
					} else {
						selections = [selection];
					}
					selection._docX = pt.x;
				}
				if (this._clickCount === 1) {
					selection.extend(offset);
					if (!extent) { selection.collapse(); }
				} else {
					var word = (this._clickCount & 1) === 0;
					var start, end;
					if (word) {
						if (this._doubleClickSelection) {
							if (offset >= this._doubleClickSelection.start) {
								start = this._doubleClickSelection.start;
								end = line.getNextOffset(offset, {unit:"wordend", count:1}); //$NON-NLS-1$
							} else {
								start = line.getNextOffset(offset, {unit:"word", count:-1}); //$NON-NLS-1$
								end = this._doubleClickSelection.end;
							}
						} else {
							start = line.getNextOffset(offset, {unit:"word", count:-1}); //$NON-NLS-1$
							end = line.getNextOffset(start, {unit:"wordend", count:1}); //$NON-NLS-1$
						}
					} else {
						if (this._doubleClickSelection) {
							var doubleClickLine = model.getLineAtOffset(this._doubleClickSelection.start);
							if (lineIndex >= doubleClickLine) {
								start = model.getLineStart(doubleClickLine);
								end = model.getLineEnd(lineIndex);
							} else {
								start = model.getLineStart(lineIndex);
								end = model.getLineEnd(doubleClickLine);
							}
						} else {
							start = model.getLineStart(lineIndex);
							end = model.getLineEnd(lineIndex);
						}
					}
					selection.setCaret(start);
					selection.extend(end);
				}
			}
			this._setSelection(selections, true, true, null, false);
			line.destroy();
			return true;
		},
		_setFullSelection: function(fullSelection, init) {
			this._fullSelection = fullSelection;
			if (util.isWebkit < 537.36) {
				this._fullSelection = fullSelection = true;
			}
			if (!this._domSelection) {
				this._domSelection = [];
				this._cursorVisible = true;
			}
			if (!init) {
				this._updateDOMSelection();
			}
		},
		_setBlockCursor: function (visible) {
			this._blockCursorVisible = visible;
			this._updateBlockCursorVisible();
		},
		_setOverwriteMode: function (overwrite) {
			this._overwriteMode = overwrite;
			this._updateBlockCursorVisible();
		},
		_updateBlockCursorVisible: function () {
			if (this._blockCursorVisible || this._overwriteMode) {
				if (!this._cursorDiv) {
					var viewDiv = this._viewDiv;
					var cursorDiv = util.createElement(viewDiv.ownerDocument, "div"); //$NON-NLS-1$
					cursorDiv.className = "textviewBlockCursor"; //$NON-NLS-1$
					this._cursorDiv = cursorDiv;
					cursorDiv.tabIndex = -1;
					cursorDiv.style.zIndex = "2"; //$NON-NLS-1$
					cursorDiv.style.color = "transparent"; //$NON-NLS-1$
					cursorDiv.style.position = "absolute"; //$NON-NLS-1$
					cursorDiv.style.pointerEvents = "none"; //$NON-NLS-1$
					cursorDiv.innerHTML = "&nbsp;"; //$NON-NLS-1$
					viewDiv.appendChild(cursorDiv);
					this._updateDOMSelection();
				}
			} else {
				if (this._cursorDiv) {
					this._cursorDiv.parentNode.removeChild(this._cursorDiv);
					this._cursorDiv = null;
				}
			}
		},
		_setMarginOffset: function(marginOffset, init) {
			this._marginOffset = marginOffset;
			this._marginDiv.style.display = marginOffset ? "block" : "none"; //$NON-NLS-1$ //$NON-NLS-2$
			if (!init) {
				this._metrics = this._calculateMetrics();
				this._queueUpdate();
			}
		},
		_setWrapOffset: function(wrapOffset, init) {
			this._wrapOffset = wrapOffset;
			if (!init) {
				this._metrics = this._calculateMetrics();
				this._queueUpdate();
			}
		},
		_setReadOnly: function (readOnly) {
			this._readonly = readOnly;
		},
		_setSingleMode: function (singleMode, init) {
			this._singleMode = singleMode;
			this._updateOverflow();
			this._updateStyle(init);
		},
		_setNoScroll: function (noScroll, init) {
			this._noScroll = noScroll;
			this._updateOverflow();
			this._updateStyle(init);
		},
		_setTabSize: function (tabSize, init) {
			this._tabSize = tabSize;
			this._customTabSize = undefined;
			var clientDiv = this._clientDiv;
			if (util.isOpera) {
				if (clientDiv) { clientDiv.style.OTabSize = this._tabSize+""; }
			} else if (util.isWebkit >= 537.1) {
				if (clientDiv) { clientDiv.style.tabSize = this._tabSize+""; }
			} else if (util.isFirefox >= 4) {
				if (clientDiv) {  clientDiv.style.MozTabSize = this._tabSize+""; }
			} else if (this._tabSize !== 8) {
				this._customTabSize = this._tabSize;
			}
			if (!init) {
				this.redrawLines();
				this._resetLineWidth();
			}
		},
		_setTheme: function(theme) {
			if (this._theme) {
				this._theme.removeEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-1$
			}
			this._theme = theme;
			if (this._theme) {
				this._theme.addEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-1$
			}
			this._setThemeClass(this._themeClass);
		},
		_setThemeClass: function (themeClass, init) {
			this._themeClass = themeClass;
			var viewContainerClass = "textview"; //$NON-NLS-1$
			var globalThemeClass = this._theme.getThemeClass();
			if (globalThemeClass) { viewContainerClass += " " + globalThemeClass; } //$NON-NLS-1$
			if (this._themeClass && globalThemeClass !== this._themeClass) { viewContainerClass += " " + this._themeClass; } //$NON-NLS-1$
			this._rootDiv.className = viewContainerClass;
			this._updateStyle(init);
		},
		_setUndoStack: function (undoStack) {
			this._undoStack = undoStack;
		},
		_setWrapMode: function (wrapMode, init) {
			this._wrapMode = wrapMode && this._wrappable;
			var clientDiv = this._clientDiv;
			if (this._wrapMode) {
				clientDiv.style.whiteSpace = "pre-wrap"; //$NON-NLS-1$
				clientDiv.style.wordWrap = "break-word"; //$NON-NLS-1$
			} else {
				clientDiv.style.whiteSpace = "pre"; //$NON-NLS-1$
				clientDiv.style.wordWrap = "normal"; //$NON-NLS-1$
			}
			this._updateOverflow();
			if (!init) {
				this.redraw();
				this._resetLineWidth();
			}
			this._resetLineHeight();
		},
		_showCaret: function (allSelection, callback, showOptions, pageScroll) {
			if (!this._clientDiv) { return; }
			if (this._redrawCount > 0) { return; }
			if (this._ignoreDOMSelection) { return; }
			if (this._imeOffset !== -1) return;
			var model = this._model;
			var selections = this._getSelections();
			var selection = Selection.editing(selections, this._autoScrollDir === "down"); //$NON-NLS-1$
			var _scroll = this._getScroll();
			var caret = selection.getCaret();
			var start = selection.start;
			var end = selection.end;
			var startLine = model.getLineAtOffset(start);
			var endLine = model.getLineAtOffset(end);
			var endInclusive = Math.max(Math.max(start, model.getLineStart(endLine)), end - 1);
			var clientWidth = this._getClientWidth();
			var clientHeight = this._getClientHeight();
			var minScroll = clientWidth / 4;
			var bounds = this._getBoundsAtOffset(caret === start ? start : endInclusive);
			var left = bounds.left;
			var right = bounds.right;
			var _top = bounds.top;
			var bottom = bounds.bottom;
			var selectionHeight = 0;
			var hasShowOptions = typeof showOptions === "object"; //$NON-NLS-1$
			if ((allSelection || hasShowOptions) && !selection.isEmpty()) {
				bounds = this._getBoundsAtOffset(caret === end ? start : endInclusive);
				selectionHeight = (bounds.bottom > bottom ? bounds.bottom : bottom) - (bounds.top < _top ? bounds.top : _top);
				if (allSelection) {
					if (bounds.top === _top) {
						if (caret === start) {
							right = left + Math.min(bounds.right - left, clientWidth);
						} else {
							left = right - Math.min(right - bounds.left, clientWidth);
						}
					} else {
						if (caret === start) {
							bottom = _top + Math.min(bounds.bottom - _top, clientHeight);
						} else {
							_top = bottom - Math.min(bottom - bounds.top, clientHeight);
						}
					}
				}
			}
			var pixelX = 0;
			if (left < _scroll.x) {
				pixelX = Math.min(left - _scroll.x, -minScroll);
			}
			if (right > _scroll.x + clientWidth) {
				pixelX = Math.max(right - _scroll.x - clientWidth, minScroll);
			}
			var pixelY = 0;
			if (_top < _scroll.y) {
				pixelY = _top - _scroll.y;
			} else if (bottom > _scroll.y + clientHeight) {
				pixelY = bottom - _scroll.y - clientHeight;
			}
			if (pageScroll) {
				if (pageScroll > 0) {
					if (pixelY > 0) {
						pixelY = Math.max(pixelY, pageScroll);
					}
				} else {
					if (pixelY < 0) {
						pixelY = Math.min(pixelY, pageScroll);
					}
				}
			}
			var alwaysScroll = hasShowOptions && showOptions.scrollPolicy === "always"; //$NON-NLS-1$
			if (pixelX !== 0 || pixelY !== 0 || alwaysScroll) {
				if (hasShowOptions) {
					var flag = pixelY > 0;
					if (pixelY === 0) {
						pixelY = _top - _scroll.y;
					}
					var viewAnchor = showOptions.viewAnchor;
					var selectionAnchor = showOptions.selectionAnchor;
					var viewAnchorOffset = Math.min(Math.max(0, showOptions.viewAnchorOffset || 0));
//					var selectionAnchorOffset = Math.min(Math.max(0, showOptions.selectionAnchorOffset || 0));
					if (viewAnchor === "top") { //$NON-NLS-1$
						pixelY += Math.floor(flag ? (1 - viewAnchorOffset) * clientHeight : -viewAnchorOffset * clientHeight);
					} else if (viewAnchor === "bottom") { //$NON-NLS-1$
						pixelY += Math.floor(flag ? viewAnchorOffset * clientHeight : -(1 - viewAnchorOffset) * clientHeight);
					} else if (viewAnchor === "center") { //$NON-NLS-1$
						pixelY += Math.floor(flag ? clientHeight / 2 + viewAnchorOffset * clientHeight : clientHeight / 2  - (1 - viewAnchorOffset) * clientHeight);
					} else { // caret is the default
						pixelY += Math.floor(flag ? viewAnchorOffset * clientHeight : -viewAnchorOffset * clientHeight);
					}
					if (startLine !== endLine) {
						if (selectionAnchor === "top" && caret !== start) { //$NON-NLS-1$
							pixelY += Math.floor(-selectionHeight);
						} else if (selectionAnchor === "bottom" && caret !== end) { //$NON-NLS-1$
							pixelY += Math.floor(selectionHeight);
						} else if (selectionAnchor === "center") { //$NON-NLS-1$
							pixelY += Math.floor(selectionHeight / 2);
						} else {
							// caret is the default
						}
					}
				} else if (pixelY !== 0 && typeof showOptions === "number") { //$NON-NLS-1$
					if (showOptions < 0) { showOptions = 0; }
					if (showOptions > 1) { showOptions = 1; }
					pixelY += Math.floor(pixelY > 0 ? showOptions * clientHeight : -showOptions * clientHeight);
				}
				this._scrollViewAnimated(pixelX, pixelY, callback);
				/*
				* When the view scrolls it is possible that one of the scrollbars can show over the caret.
				* Depending on the browser scrolling can be synchronous (Safari), in which case the change 
				* can be detected before showCaret() returns. When scrolling is asynchronous (most browsers), 
				* the detection is done during the next update page.
				*/
				if (clientHeight !== this._getClientHeight() || clientWidth !== this._getClientWidth()) {
					this._showCaret();
				} else {
					this._ensureCaretVisible = true;
				}
				return true;
			} else {
				if (callback) {
					callback();
				}
			}
			return false;
		},
		_startIME: function () {
			if (this._imeOffset !== -1) { return; }
			var selected = false;
			var selections = this._getSelections();
			for (var i=0; i<selections.length && !selected; i++) {
				selected = !selections[i].isEmpty();
			}
			if (selected) {
				this._modifyContent({text: "", selection: selections}, true);
			}
			this._imeOffset = selections[0].start;
		},
		_unhookEvents: function() {
			this._model.removeEventListener("preChanging", this._modelListener.onChanging); //$NON-NLS-1$
			this._model.removeEventListener("postChanged", this._modelListener.onChanged); //$NON-NLS-1$
			this._theme.removeEventListener("ThemeChanged", this._themeListener.onChanged); //$NON-NLS-1$
			this._modelListener = null;
			for (var i=0; i<this._handlers.length; i++) {
				var h = this._handlers[i];
				removeHandler(h.target, h.type, h.handler);
			}
			this._handlers = null;
			if (this._mutationObserver) {
				this._mutationObserver.disconnect();
			}
		},
		_updateDOMSelection: function () {
			if (this._redrawCount > 0) { return; }
			if (this._ignoreDOMSelection) { return; }
			if (this._imeOffset !== -1) return;
			if (!this._clientDiv) { return; }
			var selection = this._getSelections();
			var domSelection = this._domSelection, i;
			if (domSelection.length < selection.length) {
				for (i=domSelection.length; i<selection.length; i++) {
					domSelection.push(new DOMSelection(this));
				}
			} else if (domSelection.length > selection.length) {
				domSelection.splice(selection.length).forEach(function(s) {
					s.destroy();
				});
			}
			for (i=0; i<domSelection.length; i++) {
				domSelection[i].setPrimary(i === 0);
				domSelection[i].setSelection(selection[i]);
			}
			var win = this._getWindow();
			var that = this;
			if (domSelection.length > 1) {
				if (!this._cursorTimer) {
					this._cursorTimer = win.setInterval(function() {
						that._cursorVisible = !that._cursorVisible;
						that._domSelection.forEach(function(domSelection) { domSelection.update(); });
					}, 500);
				}
			} else {
				if (this._cursorTimer) {
					win.clearInterval(this._cursorTimer);
					this._cursorTimer = null;
				}
			}
		},
		_update: function(hScrollOnly) {
			if (this._redrawCount > 0) { return; }
			if (this._updateTimer) {
				var win = this._getWindow();
				win.clearTimeout(this._updateTimer);
				this._updateTimer = null;
				hScrollOnly = false;
			}
			var clientDiv = this._clientDiv;
			var viewDiv = this._viewDiv;
			if (!clientDiv) { return; }
			if (this._metrics.invalid) {
				this._ignoreQueueUpdate = true;
				this._updateStyle();
				this._ignoreQueueUpdate = false;
			}
			var model = this._model;
			var _scroll = this._getScroll(false);
			var viewPad = this._getViewPadding();
			var lineCount = model.getLineCount();
			var lineHeight = this._getLineHeight();
			var needUpdate = false;
			var hScroll = false, vScroll = false;
			var scrollbarWidth = this._metrics.scrollWidth;
			
			if (this._wrapMode) {
				clientDiv.style.width = (this._metrics.wrapWidth || this._getClientWidth()) + "px"; //$NON-NLS-1$
			}
			
			/*
			* topIndex - top line index of the view (maybe be particialy visible)
			* lineStart - top line minus one line (if any)
			* topIndexY - portion of the top line that is NOT visible.
			* top - topIndexY plus height of the line before top line (if any)
			*/
			var topIndex, lineStart, _top, topIndexY,
				leftWidth, leftRect,
				clientWidth, clientHeight, scrollWidth, scrollHeight,
				totalHeight = 0, totalLineIndex = 0, tempLineHeight;
			if (this._lineHeight) {
				while (totalLineIndex < lineCount) {
					tempLineHeight = this._getLineHeight(totalLineIndex);
					if (totalHeight + tempLineHeight > _scroll.y) {
						break;
					}
					totalHeight += tempLineHeight;
					totalLineIndex++;
				}
				topIndex = totalLineIndex;
				lineStart = Math.max(0, topIndex - 1);
				topIndexY = _top = _scroll.y - totalHeight;
				if (topIndex > 0) {
					_top += this._getLineHeight(topIndex - 1);
				}
			} else {
				var firstLine = Math.max(0, _scroll.y) / lineHeight;
				topIndex = Math.floor(firstLine);
				lineStart = Math.max(0, topIndex - 1);
				_top = Math.round((firstLine - lineStart) * lineHeight);
				topIndexY = Math.round((firstLine - topIndex) * lineHeight);
				scrollHeight = lineCount * lineHeight;
			}
			this._topIndexY = topIndexY;
			var rootDiv = this._rootDiv;
			var rootWidth = rootDiv.clientWidth;
			var rootHeight = rootDiv.clientHeight;
			if (hScrollOnly) {
				leftWidth = 0;
				if (this._leftDiv) {
					leftRect = this._leftDiv.getBoundingClientRect();
					leftWidth = leftRect.right - leftRect.left;
				}
				clientWidth = this._getClientWidth();
				clientHeight = this._getClientHeight();
				scrollWidth = clientWidth;
				if (this._wrapMode) {
					if (this._metrics.wrapWidth) {
						scrollWidth = this._metrics.wrapWidth;
					}
				} else {
					scrollWidth = Math.max(this._maxLineWidth, scrollWidth);
				}
				while (totalLineIndex < lineCount) {
					tempLineHeight = this._getLineHeight(totalLineIndex, false);
					totalHeight += tempLineHeight;
					totalLineIndex++;
				}
				scrollHeight = totalHeight;
			} else {
				clientHeight = this._getClientHeight();

				var linesPerPage = Math.floor((clientHeight + topIndexY) / lineHeight);
				var bottomIndex = Math.min(topIndex + linesPerPage, lineCount - 1);
				var lineEnd = Math.min(bottomIndex + 1, lineCount - 1);
				
				var lineIndex, lineWidth;
				var child = clientDiv.firstChild;
				while (child) {
					lineIndex = child.lineIndex;
					var nextChild = child.nextSibling;
					if (!(lineStart <= lineIndex && lineIndex <= lineEnd) || child.lineRemoved || child.lineIndex === -1) {
						if (this._mouseWheelLine === child) {
							child.style.display = "none"; //$NON-NLS-1$
							child.lineIndex = -1;
						} else {
							clientDiv.removeChild(child);
						}
					}
					child = nextChild;
				}
	
				child = this._getLineNext();
				var doc = viewDiv.ownerDocument;
				var frag = doc.createDocumentFragment();
				for (lineIndex=lineStart; lineIndex<=lineEnd; lineIndex++) {
					if (!child || child.lineIndex > lineIndex) {
						new TextLine(this, lineIndex).create(frag, null, true);
					} else {
						if (frag.firstChild) {
							clientDiv.insertBefore(frag, child);
							frag = doc.createDocumentFragment();
						}
						if (child && child.lineChanged) {
							child = new TextLine(this, lineIndex).create(frag, child, true);
							child.lineChanged = false;
						}
						child = this._getLineNext(child);
					}
				}
				if (frag.firstChild) { clientDiv.insertBefore(frag, child); }
	
				/*
				* Feature in WekKit. Webkit limits the width of the lines
				* computed below to the width of the client div.  This causes
				* the lines to be wrapped even though "pre" is set.  The fix
				* is to set the width of the client div to "0x7fffffffpx"
				* before computing the lines width.  Note that this value is
				* reset to the appropriate value further down.
				*/ 
				if (util.isWebkit && !this._wrapMode) {
					clientDiv.style.width = "0x7fffffffpx"; //$NON-NLS-1$
				}
	
				var rect;
				child = this._getLineNext();
				var bottomHeight = clientHeight + _top;
				var foundBottomIndex = false;
				while (child) {
					lineWidth = child.lineWidth;
					if (lineWidth === undefined) {
						rect = child._line.getBoundingClientRect();
						lineWidth = child.lineWidth = Math.ceil(rect.right - rect.left);
						var lh = rect.bottom - rect.top;
						if (this._lineHeight) {
							this._lineHeight[child.lineIndex] = lh;
						} else if (lineHeight !== 0 && lh !== 0 && Math.ceil(lineHeight) !== Math.ceil(lh)) {
							this._variableLineHeight = true;
							this._lineHeight = [];
							this._lineHeight[child.lineIndex] = lh;
						}
					}
					if (this._lineHeight && !foundBottomIndex) {
						bottomHeight -= this._lineHeight[child.lineIndex];
						if (bottomHeight < 0) {
							bottomIndex = child.lineIndex;
							foundBottomIndex = true;
						}
					}
					if (!this._wrapMode) {
						if (lineWidth >= this._maxLineWidth) {
							this._maxLineWidth = lineWidth;
							this._maxLineIndex = child.lineIndex;
						}
						if (this._checkMaxLineIndex === child.lineIndex) { this._checkMaxLineIndex = -1; }
					}
					if (child.lineIndex === topIndex) { this._topChild = child; }
					if (child.lineIndex === bottomIndex) { this._bottomChild = child; }
					child = this._getLineNext(child);
				}
				if (this._checkMaxLineIndex !== -1) {
					lineIndex = this._checkMaxLineIndex;
					this._checkMaxLineIndex = -1;
					if (0 <= lineIndex && lineIndex < lineCount) {
						var line = new TextLine(this, lineIndex);
						rect = line.getBoundingClientRect();
						lineWidth = rect.right - rect.left;
						if (lineWidth >= this._maxLineWidth) {
							this._maxLineWidth = lineWidth;
							this._maxLineIndex = lineIndex;
						}
						line.destroy();
					}
				}
				
				while (totalLineIndex < lineCount) {
					tempLineHeight = this._getLineHeight(totalLineIndex, totalLineIndex <= bottomIndex);
					totalHeight += tempLineHeight;
					totalLineIndex++;
				}
				scrollHeight = totalHeight;
	
				// Update rulers
				this._updateRuler(this._leftDiv, topIndex, lineEnd, rootHeight);
				this._updateRuler(this._rightDiv, topIndex, lineEnd, rootHeight);
				this._updateRuler(this._innerRightDiv, topIndex, lineEnd, rootHeight);
				this._updateRuler(this._marginDiv, topIndex, lineEnd, rootHeight);
				
				leftWidth = 0;
				if (this._leftDiv) {
					leftRect = this._leftDiv.getBoundingClientRect();
					leftWidth = leftRect.right - leftRect.left;
				}
				var rightWidth = 0;
				if (this._rightDiv) {
					var rightRect = this._rightDiv.getBoundingClientRect();
					rightWidth = rightRect.right - rightRect.left;
				}
				viewDiv.style.left = leftWidth + "px"; //$NON-NLS-1$
				viewDiv.style.right = rightWidth + "px"; //$NON-NLS-1$

				/* Need to set the height first in order for the width to consider the vertical scrollbar */
				var scrollDiv = this._scrollDiv;
				scrollDiv.style.height = (scrollHeight + (util.isWebkit ? 0 : viewPad.bottom)) + "px"; //$NON-NLS-1$
				
				clientWidth = this._getClientWidth();
				if (!this._singleMode && !this._wrapMode && !this._noScroll) {
					var clientHeightNoScroll = clientHeight, clientHeightScroll = clientHeight;
					var oldHScroll = viewDiv.style.overflowX === "scroll"; //$NON-NLS-1$
					if (oldHScroll) {
						clientHeightNoScroll += scrollbarWidth;
					} else {
						clientHeightScroll -= scrollbarWidth;
					}
					var clientWidthNoScroll = clientWidth, clientWidthScroll = clientWidth;
					var oldVScroll = viewDiv.style.overflowY === "scroll"; //$NON-NLS-1$
					if (oldVScroll) {
						clientWidthNoScroll += scrollbarWidth;
					} else {
						clientWidthScroll -= scrollbarWidth;
					}
					clientHeight = clientHeightNoScroll;
					clientWidth = clientWidthNoScroll;
					if (scrollHeight > clientHeight) {
						vScroll = true;
						clientWidth = clientWidthScroll;
					}
					if (this._maxLineWidth > clientWidth) {
						hScroll = true;
						clientHeight = clientHeightScroll;
						if (scrollHeight > clientHeight) {
							vScroll = true;
							clientWidth = clientWidthScroll;
						}
					}
					if (oldHScroll !== hScroll) {
						viewDiv.style.overflowX = hScroll ? "scroll" : "hidden"; //$NON-NLS-1$ //$NON-NLS-2$
					}
					if (oldVScroll !== vScroll) {
						viewDiv.style.overflowY = vScroll ? "scroll" : "hidden"; //$NON-NLS-1$ //$NON-NLS-2$
					}
					needUpdate = oldHScroll !== hScroll || oldVScroll !== vScroll;
				}
				
				var width = clientWidth;
				if (this._wrapMode) {
					if (this._metrics.wrapWidth) {
						width = this._metrics.wrapWidth;
					}
				} else {
					width = Math.max(this._maxLineWidth + this._getInnerRightWidth(), width);
				}
				/*
				* Except by IE 8 and earlier, all other browsers are not allocating enough space for the right padding 
				* in the scrollbar. It is possible this a bug since all other paddings are considered.
				*/
				scrollWidth = width;
				if ((!util.isIE || util.isIE >= 9) && this._maxLineWidth > clientWidth) { width += viewPad.right + viewPad.left; }
				scrollDiv.style.width = width + "px"; //$NON-NLS-1$
				if (this._clipScrollDiv) {
					this._clipScrollDiv.style.width = width + "px"; //$NON-NLS-1$
				}
				/* Get the left scroll after setting the width of the scrollDiv as this can change the horizontal scroll offset. */
				_scroll = this._getScroll(false);

				var innerRightDiv = this._innerRightDiv;
				if (innerRightDiv) {
					innerRightDiv.style.right = rightWidth + (viewDiv.style.overflowY === "scroll" ? this._metrics.scrollWidth : 0) + "px"; //$NON-NLS-1$ //$NON-NLS-1$
					innerRightDiv.style.bottom = (viewDiv.style.overflowX === "scroll" ? scrollbarWidth : 0) + "px"; //$NON-NLS-1$ //$NON-NLS-1$
				}
			}
			this._scrollHeight = scrollHeight;
			if (this._vScrollDiv) {
				var trackHeight = clientHeight - 8;
				var thumbHeight = Math.max(15, Math.ceil(Math.min(1, trackHeight / (scrollHeight + viewPad.top + viewPad.bottom)) * trackHeight));
				this._vScrollDiv.style.left = (leftWidth + clientWidth - 8) + "px"; //$NON-NLS-1$
				this._vScrollDiv.style.top = Math.floor(Math.max(0, (_scroll.y * trackHeight / scrollHeight))) + "px"; //$NON-NLS-1$
				this._vScrollDiv.style.height = thumbHeight + "px"; //$NON-NLS-1$
			}
			if (!this._wrapMode && this._hScrollDiv) {
				var trackWidth = clientWidth - 8;
				var thumbWidth = Math.max(15, Math.ceil(Math.min(1, trackWidth / (this._maxLineWidth + viewPad.left + viewPad.right)) * trackWidth));
				this._hScrollDiv.style.left = leftWidth + Math.floor(Math.max(0, Math.floor(_scroll.x * trackWidth / this._maxLineWidth))) + "px"; //$NON-NLS-1$
				this._hScrollDiv.style.top = (clientHeight - 9) + "px"; //$NON-NLS-1$
				this._hScrollDiv.style.width = thumbWidth + "px"; //$NON-NLS-1$
			}
			var left = _scroll.x;	
			var clipDiv = this._clipDiv;
			var overlayDiv = this._overlayDiv;
			var marginDiv = this._marginDiv;
			var clipLeft, clipTop;
			if (marginDiv) {
				marginDiv.style.left = (-left + leftWidth + this._metrics.marginWidth + viewPad.left) + "px"; //$NON-NLS-1$
				marginDiv.style.bottom = (viewDiv.style.overflowX === "scroll" ? scrollbarWidth : 0) + "px"; //$NON-NLS-1$ //$NON-NLS-1$
			}
			if (clipDiv) {
				clipDiv.scrollLeft = left;
				clipDiv.scrollTop = 0;
				clipLeft = leftWidth + viewPad.left;
				clipTop = viewPad.top;
				var clipWidth = clientWidth;
				var clipHeight = clientHeight;
				var clientLeft = 0, clientTop = -_top;
				if (_scroll.x === 0) {
					clipLeft -= viewPad.left;
					clipWidth += viewPad.left;
					clientLeft = viewPad.left;
				} 
				if (_scroll.x + clientWidth === scrollWidth) {
					clipWidth += viewPad.right;
				}
				if (_scroll.y === 0) {
					clipTop -= viewPad.top;
					clipHeight += viewPad.top;
					clientTop += viewPad.top;
				}
				if (_scroll.y + clientHeight === scrollHeight) { 
					clipHeight += viewPad.bottom; 
				}
				clipDiv.style.left = clipLeft + "px"; //$NON-NLS-1$
				clipDiv.style.top = clipTop + "px"; //$NON-NLS-1$
				clipDiv.style.right = (rootWidth - clipWidth - clipLeft) + "px"; //$NON-NLS-1$
				clipDiv.style.bottom = (rootHeight - clipHeight - clipTop) + "px"; //$NON-NLS-1$
				clientDiv.style.left = clientLeft + "px"; //$NON-NLS-1$
				clientDiv.style.top = clientTop + "px"; //$NON-NLS-1$
				clientDiv.style.width = scrollWidth + "px"; //$NON-NLS-1$
				clientDiv.style.height = (clientHeight + _top) + "px"; //$NON-NLS-1$
				if (overlayDiv) {
					overlayDiv.style.left = clientDiv.style.left;
					overlayDiv.style.top = clientDiv.style.top;
					overlayDiv.style.width = clientDiv.style.width;
					overlayDiv.style.height = clientDiv.style.height;
				}
			} else {
				clipLeft = left;
				clipTop = _top;
				var clipRight = left + clientWidth;
				var clipBottom = _top + clientHeight;
				if (clipLeft === 0) { clipLeft -= viewPad.left; }
				if (clipTop === 0) { clipTop -= viewPad.top; }
				if (clipRight === scrollWidth) { clipRight += viewPad.right; }
				if (_scroll.y + clientHeight === scrollHeight) { clipBottom += viewPad.bottom; }
				clientDiv.style.clip = "rect(" + clipTop + "px," + clipRight + "px," + clipBottom + "px," + clipLeft + "px)"; //$NON-NLS-4$ //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-5$
				if (document.dir == "rtl") { /* ACGC */
					clientDiv.style.right = (-left + leftWidth + viewPad.left) + "px"; //$NON-NLS-1$
				}else{
					clientDiv.style.left = (-left + leftWidth + viewPad.left) + "px"; //$NON-NLS-1$	  
				}
				clientDiv.style.width = (this._wrapMode || util.isWebkit ? scrollWidth : clientWidth + left) + "px"; //$NON-NLS-1$
				if (!hScrollOnly) {
					clientDiv.style.top = (-_top + viewPad.top) + "px"; //$NON-NLS-1$
					clientDiv.style.height = (clientHeight + _top) + "px"; //$NON-NLS-1$
				}
				if (overlayDiv) {
					overlayDiv.style.clip = clientDiv.style.clip;
					overlayDiv.style.left = clientDiv.style.left;
					overlayDiv.style.width = clientDiv.style.width;
					if (!hScrollOnly) {
						overlayDiv.style.top = clientDiv.style.top;
						overlayDiv.style.height = clientDiv.style.height;
					}
				}
			}
			this._updateDOMSelection();

			if (needUpdate) {
				var ensureCaretVisible = this._ensureCaretVisible;
				this._ensureCaretVisible = false;
				if (ensureCaretVisible) {
					this._showCaret();
				}
				this._queueUpdate();
			}
		},
		_updateOverflow: function() {
			var viewDiv = this._viewDiv;
			if (this._noScroll) {
				viewDiv.style.overflow = "hidden"; //$NON-NLS-1$
			} else if (this._wrapMode) {
				viewDiv.style.overflowX = "hidden"; //$NON-NLS-1$
				viewDiv.style.overflowY = "scroll"; //$NON-NLS-1$
			} else {
				viewDiv.style.overflow = "hidden"; //$NON-NLS-1$
			}
		},
		_updateRuler: function (divRuler, topIndex, bottomIndex, rootHeight) {
			if (!divRuler) { return; }
			var doc = this._parent.ownerDocument;
			var lineHeight = this._getLineHeight();
			var viewPad = this._getViewPadding();
			var div = divRuler.firstChild;
			while (div) {
				var ruler = div._ruler;
				var overview = ruler.getOverview();
				if (div.rulerChanged) {
					applyStyle(ruler.getRulerStyle(), div);
					divRuler.rulerWidth = undefined;
				}
				if (overview === "fixed") { //$NON-NLS-1$
					div.rulerChanged = false;
					div = div.nextSibling;
					continue;
				}
				var offset = lineHeight;
				if (overview === "page") { offset += this._topIndexY; } //$NON-NLS-1$
				div.style.top = -offset + "px"; //$NON-NLS-1$
				div.style.height = (rootHeight + offset) + "px"; //$NON-NLS-1$
				
				
				var widthDiv;
				var child = div.firstChild;
				if (child) {
					widthDiv = child;
					child = child.nextSibling;
				} else {
					widthDiv = util.createElement(doc, "div"); //$NON-NLS-1$
					widthDiv.style.visibility = "hidden"; //$NON-NLS-1$
					div.appendChild(widthDiv);
				}
				var lineIndex, annotation;
				if (div.rulerChanged) {
					if (widthDiv) {
						lineIndex = -1;
						annotation = ruler.getWidestAnnotation();
						if (annotation) {
							applyStyle(annotation.style, widthDiv);
							if (annotation.html) {
								widthDiv.innerHTML = annotation.html;
							}
						}
						widthDiv.lineIndex = lineIndex;
						widthDiv.style.height = (lineHeight + viewPad.top) + "px"; //$NON-NLS-1$
					}
				}

				var lineDiv, frag, annotations;
				if (overview === "page") { //$NON-NLS-1$
					annotations = ruler.getAnnotations(topIndex, bottomIndex + 1);
					while (child) {
						lineIndex = child.lineIndex;
						var nextChild = child.nextSibling;
						if (!(topIndex <= lineIndex && lineIndex <= bottomIndex) || child.lineChanged) {
							div.removeChild(child);
						}
						child = nextChild;
					}
					child = div.firstChild.nextSibling;
					frag = doc.createDocumentFragment();
					for (lineIndex=topIndex; lineIndex<=bottomIndex; lineIndex++) {
						if (!child || child.lineIndex > lineIndex) {
							lineDiv = util.createElement(doc, "div"); //$NON-NLS-1$
							annotation = annotations[lineIndex];
							if (annotation) {
								applyStyle(annotation.style, lineDiv);
								if (annotation.html) {
									lineDiv.innerHTML = annotation.html;
								}
								lineDiv.annotation = annotation;
							}
							lineDiv.lineIndex = lineIndex;
							lineDiv.style.height = this._getLineHeight(lineIndex) + "px"; //$NON-NLS-1$
							frag.appendChild(lineDiv);
						} else {
							if (frag.firstChild) {
								div.insertBefore(frag, child);
								frag = doc.createDocumentFragment();
							}
							if (child) {
								child = child.nextSibling;
							}
						}
					}
					if (frag.firstChild) { div.insertBefore(frag, child); }
				} else {
					var clientHeight = this._getClientHeight ();
					var lineCount = this._model.getLineCount ();
					var contentHeight = lineHeight * lineCount;
					var trackHeight = clientHeight + viewPad.top + viewPad.bottom - 2 * this._metrics.scrollWidth;
					var divHeight, arrowWidth;
					if (contentHeight < trackHeight) {
						divHeight = lineHeight;
						arrowWidth = viewPad.top;
					} else {
						divHeight = trackHeight / lineCount;
						arrowWidth = this._metrics.scrollWidth;
					}
					if (div.rulerChanged) {
						var count = div.childNodes.length;
						while (count > 1) {
							div.removeChild(div.lastChild);
							count--;
						}
						annotations = ruler.getAnnotations(0, lineCount);
						frag = doc.createDocumentFragment();
						for (var prop in annotations) {
							lineIndex = prop >>> 0;
							if (lineIndex < 0) { continue; }
							lineDiv = util.createElement(doc, "div"); //$NON-NLS-1$
							annotation = annotations[prop];
							applyStyle(annotation.style, lineDiv);
							lineDiv.style.position = "absolute"; //$NON-NLS-1$
							lineDiv.style.top = arrowWidth + lineHeight + Math.floor(lineIndex * divHeight) + "px"; //$NON-NLS-1$
							if (annotation.html) {
								lineDiv.innerHTML = annotation.html;
							}
							lineDiv.annotation = annotation;
							lineDiv.lineIndex = lineIndex;
							frag.appendChild(lineDiv);
						}
						div.appendChild(frag);
					} else if (div._oldTrackHeight !== trackHeight) {
						lineDiv = div.firstChild ? div.firstChild.nextSibling : null;
						while (lineDiv) {
							lineDiv.style.top = this._metrics.scrollWidth + lineHeight + Math.floor(lineDiv.lineIndex * divHeight) + "px"; //$NON-NLS-1$
							lineDiv = lineDiv.nextSibling;
						}
					}
					div._oldTrackHeight = trackHeight;
				}
				div.rulerChanged = false;
				div = div.nextSibling;
			}
		},
		_updateStyleSheet: function() {
			var styleText = "";
			if (util.isWebkit && this._metrics.scrollWidth > 0) {
				styleText += "\n.textview ::-webkit-scrollbar-corner {background: #eeeeee;}"; //$NON-NLS-1$
			}
			if (styleText) {
				var doc = this._clientDiv.ownerDocument;
				var node = doc.getElementById("_textviewStyle"); //$NON-NLS-1$
				if (!node) {
					node = util.createElement(doc, "style"); //$NON-NLS-1$
					node.id = "_textviewStyle"; //$NON-NLS-1$
					var head = doc.getElementsByTagName("head")[0] || doc.documentElement; //$NON-NLS-1$
					node.appendChild(doc.createTextNode(styleText));
					head.insertBefore(node, head.firstChild);
				} else {
					node.removeChild(node.firstChild);
					node.appendChild(doc.createTextNode(styleText));
				}
			}
		},
		_updateStyle: function (init, metrics) {
			if (!init && util.isIE) {
				this._rootDiv.style.lineHeight = "normal"; //$NON-NLS-1$
			}
			metrics = this._metrics = metrics || this._calculateMetrics();
			if (this._variableLineHeight) {
				this._variableLineHeight = false;
				this._resetLineHeight();
			}
			if (util.isIE) {
				this._rootDiv.style.lineHeight = (metrics.lineHeight - (metrics.lineTrim.top + metrics.lineTrim.bottom)) + "px"; //$NON-NLS-1$
			} else {
				this._rootDiv.style.lineHeight = "normal"; //$NON-NLS-1$
			}
			this._updateStyleSheet();
			if (util.isMac && util.isWebkit) {
				var viewDiv = this._viewDiv;
				if (!metrics.invalid && metrics.scrollWidth === 0) {
					viewDiv.style.pointerEvents = "none"; //$NON-NLS-1$
					viewDiv.style.zIndex = "2"; //$NON-NLS-1$
				} else {
					viewDiv.style.pointerEvents = ""; //$NON-NLS-1$
					viewDiv.style.zIndex = ""; //$NON-NLS-1$
				}
			}
			if (!init) {
				this.redraw();
				this._resetLineWidth();
			}
		}
	};//end prototype
	mEventTarget.EventTarget.addMixin(TextView.prototype);
	
	return {TextView: TextView};
});


/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/projectionTextModel", ['orion/editor/textModel', 'orion/editor/eventTarget'], function(mTextModel, mEventTarget) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$

	/**
	 * @class This object represents a projection range. A projection specifies a
	 * range of text and the replacement text. The range of text is relative to the
	 * base text model associated to a projection model.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.ProjectionTextModel}<br/>
	 * {@link orion.editor.ProjectionTextModel#addProjection}<br/>
	 * </p>		 
	 * @name orion.editor.Projection
	 * 
	 * @property {Number} start The start offset of the projection range. 
	 * @property {Number} end The end offset of the projection range. This offset is exclusive.
	 * @property {String|orion.editor.TextModel} [text=""] The projection text to be inserted
	 */
	/**
	 * Constructs a new <code>ProjectionTextModel</code> based on the specified <code>TextModel</code>.
	 *
	 * @param {orion.editor.TextModel} baseModel The base text model.
	 *
	 * @name orion.editor.ProjectionTextModel
	 * @class The <code>ProjectionTextModel</code> represents a projection of its base text
	 * model. Projection ranges can be added to the projection text model to hide and/or insert
	 * ranges to the base text model.
	 * <p>
	 * The contents of the projection text model is modified when changes occur in the base model,
	 * projection model or by calls to {@link #addProjection} and {@link #removeProjection}.
	 * </p>
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextModel}
	 * {@link orion.editor.TextView#setModel}
	 * </p>
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function ProjectionTextModel(baseModel) {
		this._model = baseModel;
		this._projections = [];
		var self = this;
		this._listener = {
			onChanged: function(e) {
				self._onChanged(e);
			},
			onChanging: function(e) {
				self._onChanging(e);
			}
		};
		baseModel.addEventListener("postChanged", this._listener.onChanged); //$NON-NLS-0$
		baseModel.addEventListener("preChanging", this._listener.onChanging); //$NON-NLS-0$
	}

	ProjectionTextModel.prototype = /** @lends orion.editor.ProjectionTextModel.prototype */ {
		/**
		 * Destroys this projection text model.
		 */
		destroy: function() {
			if (this._model) {
				this._model.removeEventListener("postChanged", this._listener.onChanged); //$NON-NLS-0$
				this._model.removeEventListener("preChanging", this._listener.onChanging); //$NON-NLS-0$
				this._model = null;
			}
		},
		/**
		 * Adds a projection range to the model.
		 * <p>
		 * The model must notify the listeners before and after the the text is
		 * changed by calling {@link #onChanging} and {@link #onChanged} respectively. 
		 * </p>
		 * @param {orion.editor.Projection} projection The projection range to be added.
		 * 
		 * @see orion.editor.ProjectionTextModel#removeProjection
		 */
		addProjection: function(projection) {
			if (!projection) {return;}
			//start and end can't overlap any exist projection
			var model = this._model, projections = this._projections;
			projection._lineIndex = model.getLineAtOffset(projection.start);
			projection._lineCount = model.getLineAtOffset(projection.end) - projection._lineIndex;
			var text = projection.text;
			if (!text) { text = ""; }
			if (typeof text === "string") { //$NON-NLS-0$
				projection._model = new mTextModel.TextModel(text, model.getLineDelimiter());
			} else {
				projection._model = text;
			}
			var eventStart = this.mapOffset(projection.start, true);
			var removedCharCount = projection.end - projection.start;
			var removedLineCount = projection._lineCount;
			var addedCharCount = projection._model.getCharCount();
			var addedLineCount = projection._model.getLineCount() - 1;
			var modelChangingEvent = {
				type: "Changing", //$NON-NLS-0$
				text: projection._model.getText(),
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanging(modelChangingEvent);
			var index = this._binarySearch(projections, projection.start);
			projections.splice(index, 0, projection);
			var modelChangedEvent = {
				type: "Changed", //$NON-NLS-0$
				start: eventStart,
				removedCharCount: removedCharCount,
				addedCharCount: addedCharCount,
				removedLineCount: removedLineCount,
				addedLineCount: addedLineCount
			};
			this.onChanged(modelChangedEvent);
		},
		/**
		 * Returns all projection ranges of this model.
		 * 
		 * @return {orion.editor.Projection[]} The projection ranges.
		 * 
		 * @see orion.editor.ProjectionTextModel#addProjection
		 */
		getProjections: function() {
			return this._projections.slice(0);
		},
		/**
		 * Gets the base text model.
		 *
		 * @return {orion.editor.TextModel} The base text model.
		 */
		getBaseModel: function() {
			return this._model;
		},
		/**
		 * Maps offsets between the projection model and its base model.
		 *
		 * @param {Number} offset The offset to be mapped.
		 * @param {Boolean} [baseOffset=false] <code>true</code> if <code>offset</code> is in base model and
		 *	should be mapped to the projection model.
		 * @return {Number} The mapped offset
		 */
		mapOffset: function(offset, baseOffset) {
			var projections = this._projections, delta = 0, i, projection;
			if (baseOffset) {
				for (i = 0; i < projections.length; i++) {
					projection = projections[i];
					if (projection.start > offset) { break; }
					if (projection.end > offset) { return -1; }
					delta += projection._model.getCharCount() - (projection.end - projection.start);
				}
				return offset + delta;
			}
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > offset - delta) { break; }
				var charCount = projection._model.getCharCount();
				if (projection.start + charCount > offset - delta) {
					return -1;
				}
				delta += charCount - (projection.end - projection.start);
			}
			return offset - delta;
		},
		/**
		 * Removes a projection range from the model.
		 * <p>
		 * The model must notify the listeners before and after the the text is
		 * changed by calling {@link #onChanging} and {@link #onChanged} respectively. 
		 * </p>
		 * 
		 * @param {orion.editor.Projection} projection The projection range to be removed.
		 * 
		 * @see orion.editor.ProjectionTextModel#addProjection
		 */
		removeProjection: function(projection) {
			this._removeProjection(projection);
		},
		_removeProjection: function(projection, noEvents) {
			var i, delta = 0;
			for (i = 0; i < this._projections.length; i++) {
				var p = this._projections[i];
				if (p === projection) {
					projection = p;
					break;
				}
				delta += p._model.getCharCount() - (p.end - p.start);
			}
			if (i < this._projections.length) {
				var model = this._model;
				var eventStart = projection.start + delta;
				var addedCharCount = projection.end - projection.start;
				var addedLineCount = projection._lineCount;
				var removedCharCount = projection._model.getCharCount();
				var removedLineCount = projection._model.getLineCount() - 1;
				if (!noEvents) {
					var modelChangingEvent = {
						type: "Changing", //$NON-NLS-0$
						text: model.getText(projection.start, projection.end),
						start: eventStart,
						removedCharCount: removedCharCount,
						addedCharCount: addedCharCount,
						removedLineCount: removedLineCount,
						addedLineCount: addedLineCount
					};
					this.onChanging(modelChangingEvent);
				}
				this._projections.splice(i, 1);
				if (!noEvents) {
					var modelChangedEvent = {
						type: "Changed", //$NON-NLS-0$
						start: eventStart,
						removedCharCount: removedCharCount,
						addedCharCount: addedCharCount,
						removedLineCount: removedLineCount,
						addedLineCount: addedLineCount
					};
					this.onChanged(modelChangedEvent);
				}
			}
		},
		/** @ignore */
		_binarySearch: function (array, offset) {
			var high = array.length, low = -1, index;
			while (high - low > 1) {
				index = Math.floor((high + low) / 2);
				if (offset <= array[index].start) {
					high = index;
				} else {
					low = index;
				}
			}
			return high;
		},
		/**
		 * @see orion.editor.TextModel#getCharCount
		 */
		getCharCount: function() {
			var count = this._model.getCharCount(), projections = this._projections;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				count += projection._model.getCharCount() - (projection.end - projection.start);
			}
			return count;
		},
		/**
		 * @see orion.editor.TextModel#getLine
		 */
		getLine: function(lineIndex, includeDelimiter) {
			if (lineIndex < 0) { return null; }
			var model = this._model, projections = this._projections;
			var delta = 0, result = [], offset = 0, i, lineCount, projection;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection._lineIndex >= lineIndex - delta) { break; }
				lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount >= lineIndex - delta) {
					var projectionLineIndex = lineIndex - (projection._lineIndex + delta);
					if (projectionLineIndex < lineCount) {
						return projection._model.getLine(projectionLineIndex, includeDelimiter);
					} else {
						result.push(projection._model.getLine(lineCount));
					}
				}
				offset = projection.end;
				delta += lineCount - projection._lineCount;
			}
			offset = Math.max(offset, model.getLineStart(lineIndex - delta));
			for (; i < projections.length; i++) {
				projection = projections[i];
				if (projection._lineIndex > lineIndex - delta) { break; }
				result.push(model.getText(offset, projection.start));
				lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount > lineIndex - delta) {
					result.push(projection._model.getLine(0, includeDelimiter));
					return result.join("");
				}
				result.push(projection._model.getText());
				offset = projection.end;
				delta += lineCount - projection._lineCount;
			}
			var end = model.getLineEnd(lineIndex - delta, includeDelimiter);
			if (offset < end) {
				result.push(model.getText(offset, end));
			}
			return result.join("");
		},
		/**
		 * @see orion.editor.TextModel#getLineAtOffset
		 */
		getLineAtOffset: function(offset) {
			var model = this._model, projections = this._projections;
			var delta = 0, lineDelta = 0;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				if (projection.start > offset - delta) { break; }
				var charCount = projection._model.getCharCount();
				if (projection.start + charCount > offset - delta) {
					var projectionOffset = offset - (projection.start + delta);
					lineDelta += projection._model.getLineAtOffset(projectionOffset);
					delta += projectionOffset;
					break;
				}
				lineDelta += projection._model.getLineCount() - 1 - projection._lineCount;
				delta += charCount - (projection.end - projection.start);
			}
			return model.getLineAtOffset(offset - delta) + lineDelta;
		},
		/**
		 * @see orion.editor.TextModel#getLineCount
		 */
		getLineCount: function() {
			var model = this._model, projections = this._projections;
			var count = model.getLineCount();
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				count += projection._model.getLineCount() - 1 - projection._lineCount;
			}
			return count;
		},
		/**
		 * @see orion.editor.TextModel#getLineDelimiter
		 */
		getLineDelimiter: function() {
			return this._model.getLineDelimiter();
		},
		/**
		 * @see orion.editor.TextModel#getLineEnd
		 */
		getLineEnd: function(lineIndex, includeDelimiter) {
			if (lineIndex < 0) { return -1; }
			var model = this._model, projections = this._projections;
			var delta = 0, offsetDelta = 0;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				if (projection._lineIndex > lineIndex - delta) { break; }
				var lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount > lineIndex - delta) {
					var projectionLineIndex = lineIndex - (projection._lineIndex + delta);
					return projection._model.getLineEnd (projectionLineIndex, includeDelimiter) + projection.start + offsetDelta;
				}
				offsetDelta += projection._model.getCharCount() - (projection.end - projection.start);
				delta += lineCount - projection._lineCount;
			}
			return model.getLineEnd(lineIndex - delta, includeDelimiter) + offsetDelta;
		},
		/**
		 * @see orion.editor.TextModel#getLineStart
		 */
		getLineStart: function(lineIndex) {
			if (lineIndex < 0) { return -1; }
			var model = this._model, projections = this._projections;
			var delta = 0, offsetDelta = 0;
			for (var i = 0; i < projections.length; i++) {
				var projection = projections[i];
				if (projection._lineIndex >= lineIndex - delta) { break; }
				var lineCount = projection._model.getLineCount() - 1;
				if (projection._lineIndex + lineCount >= lineIndex - delta) {
					var projectionLineIndex = lineIndex - (projection._lineIndex + delta);
					return projection._model.getLineStart (projectionLineIndex) + projection.start + offsetDelta;
				}
				offsetDelta += projection._model.getCharCount() - (projection.end - projection.start);
				delta += lineCount - projection._lineCount;
			}
			return model.getLineStart(lineIndex - delta) + offsetDelta;
		},
		/**
		 * @see orion.editor.TextModel#getText
		 */
		getText: function(start, end) {
			if (start === undefined) { start = 0; }
			var model = this._model, projections = this._projections;
			var delta = 0, result = [], i, projection, charCount;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start > start - delta) { break; }
				charCount = projection._model.getCharCount();
				if (projection.start + charCount > start - delta) {
					if (end !== undefined && projection.start + charCount > end - delta) {
						return projection._model.getText(start - (projection.start + delta), end - (projection.start + delta));
					} else {
						result.push(projection._model.getText(start - (projection.start + delta)));
						start = projection.end + delta + charCount - (projection.end - projection.start);
					}
				}
				delta += charCount - (projection.end - projection.start);
			}
			var offset = start - delta;
			if (end !== undefined) {
				for (; i < projections.length; i++) {
					projection = projections[i];
					if (projection.start > end - delta) { break; }
					result.push(model.getText(offset, projection.start));
					charCount = projection._model.getCharCount();
					if (projection.start + charCount > end - delta) {
						result.push(projection._model.getText(0, end - (projection.start + delta)));
						return result.join("");
					}
					result.push(projection._model.getText());
					offset = projection.end;
					delta += charCount - (projection.end - projection.start);
				}
				result.push(model.getText(offset, end - delta));
			} else {
				for (; i < projections.length; i++) {
					projection = projections[i];
					result.push(model.getText(offset, projection.start));
					result.push(projection._model.getText());
					offset = projection.end;
				}
				result.push(model.getText(offset));
			}
			return result.join("");
		},
		/** @ignore */
		_onChanged: function(modelChangedEvent) {
			var change = this._change;
			var start = change.baseStart, end = change.baseEnd, i;
			var projection, projections = this._projections;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.end > start) { break; }
			}
			var rangeStart = i;
			for (i = 0; i < projections.length; i++) {
				projection = projections[i];
				if (projection.start >= end) { break; }
			}
			var rangeEnd = i;
			var model = this._model;
			var changeCount = change.baseText.length - (end - start);
			for (i = rangeEnd; i < projections.length; i++) {
				projection = projections[i];
				projection.start += changeCount;
				projection.end += changeCount;
				projection._lineIndex = model.getLineAtOffset(projection.start);
			}
			var removed = projections.splice(rangeStart, rangeEnd - rangeStart);
			for (i = 0; i < removed.length; i++) {
				if (removed[i].annotation) {
					removed[i].annotation._expand();
				}
			}
			var modelChangedEvent1 = {
				type: "Changed", //$NON-NLS-0$
				start: change.start,
				removedCharCount: change.removedCharCount,
				addedCharCount: change.addedCharCount,
				removedLineCount: change.removedLineCount,
				addedLineCount: change.addedLineCount
			};
			this.onChanged(modelChangedEvent1);
			this._change = undefined;
		},
		_onChanging: function(modelChangingEvent) {
			var hasChange = !!this._change;
			var change = this._change || {};
			var start = modelChangingEvent.start, end = start + modelChangingEvent.removedCharCount;
			change.baseStart = start;
			change.baseEnd = end;
			change.baseText = modelChangingEvent.text;
			change.addedLineCount = modelChangingEvent.addedLineCount;
			if (!hasChange) {
				this._change = change;
				change.text = modelChangingEvent.text;
				var projections = this._projections, delta, i, projection;
				function mapOffset(offset) {
					for (i = 0, delta = 0; i < projections.length; i++) {
						projection = projections[i];
						if (projection.start > offset) { break; }
						if (projection.end > offset) { return -1; }
						delta += projection._model.getCharCount() - (projection.end - projection.start);
					}
					return offset + delta;
				}
				change.start = mapOffset(start);
				if (change.start === -1) {
					change.text = this._model.getText(projection.start, start) + change.text;
					change.addedLineCount += this._model.getLineAtOffset(start) - this._model.getLineAtOffset(projection.start);
					change.start = projection.start + delta;
				}
				change.end = mapOffset(end);
				if (change.end === -1) {
					change.text += this._model.getText(end, projection.end);
					change.addedLineCount += this._model.getLineAtOffset(projection.end) - this._model.getLineAtOffset(end);
					change.end = projection.start + delta;
				}
			}
			change.addedCharCount = change.text.length;
			change.removedCharCount = change.end - change.start;
			change.removedLineCount = this.getLineAtOffset(change.end) - this.getLineAtOffset(change.start);
			var modelChangingEvent1 = {
				type: "Changing", //$NON-NLS-0$
				text: change.text,
				start: change.start,
				removedCharCount: change.removedCharCount,
				addedCharCount: change.addedCharCount,
				removedLineCount: change.removedLineCount,
				addedLineCount: change.addedLineCount
			};
			this.onChanging(modelChangingEvent1);
		},
		/**
		 * @see orion.editor.TextModel#onChanging
		 */
		onChanging: function(modelChangingEvent) {
			return this.dispatchEvent(modelChangingEvent);
		},
		/**
		 * @see orion.editor.TextModel#onChanged
		 */
		onChanged: function(modelChangedEvent) {
			return this.dispatchEvent(modelChangedEvent);
		},
		/**
		 * @see orion.editor.TextModel#setLineDelimiter
		 */
		setLineDelimiter: function(lineDelimiter) {
			this._model.setLineDelimiter(lineDelimiter);
		},
		/**
		 * @see orion.editor.TextModel#setText
		 */
		setText: function(text, start, end) {
			this._change = {
				text: text || "",
				start: start || 0,
				end: end === undefined ? this.getCharCount() : end
			};
			var projections = this._projections, delta, i, projection;
			function mapOffset(offset) {
				for (i = 0, delta = 0; i < projections.length; i++) {
					projection = projections[i];
					if (projection.start > offset - delta) { break; }
					var charCount = projection._model.getCharCount();
					if (projection.start + charCount > offset - delta) {
						return -1;
					}
					delta += charCount - (projection.end - projection.start);
				}
				return offset - delta;
			}
			var startProjection, endProjection;
			var mapStart = mapOffset(this._change.start);
			if (mapStart === -1) {
				startProjection = {
					projection: projection,
					start: this._change.start - (projection.start + delta)
				};
				mapStart = projection.end;
			}
			var mapEnd = mapOffset(this._change.end);
			if (mapEnd === -1) {
				endProjection = {
					projection: projection,
					end: this._change.end - (projection.start + delta)
				};
				mapEnd = projection.start;
			}
			if (startProjection && endProjection && startProjection.projection === endProjection.projection) {
				//TODO events - special case - change is completely inside of a projection
				projection._model.setText(this._change.text, startProjection.start, endProjection.end);
			} else {
				this._model.setText(this._change.text, mapStart, mapEnd);
				if (startProjection) {
					projection = startProjection.projection;
					projection._model.setText("", startProjection.start);
				}		
				if (endProjection) {
					projection = endProjection.projection;
					projection._model.setText("", 0, endProjection.end);
					projection.start = projection.end;
					projection._lineCount = 0;
				}
			}
			this._change = undefined;
		}
	};
	mEventTarget.EventTarget.addMixin(ProjectionTextModel.prototype);

	return {ProjectionTextModel: ProjectionTextModel};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd, node*/
(function(root, factory) { // UMD
    if (typeof define === "function" && define.amd) { //$NON-NLS-0$
        define('orion/Deferred',factory);
    } else if (typeof exports === "object") { //$NON-NLS-0$
        module.exports = factory();
    } else {
        root.orion = root.orion || {};
        root.orion.Deferred = factory();
    }
}(this, function() {
    var queue = [],
        running = false;

    function run() {
        var fn;
        while ((fn = queue.shift())) {
            fn();
        }
        running = false;
    }

	var runAsync = (function() {
		if (typeof process !== "undefined" && typeof process.nextTick === "function") {
			var nextTick = process.nextTick;
    		return function() {
    			nextTick(run);
    		};
		} else if (typeof MutationObserver === "function") {
			var div = document.createElement("div");
			var observer = new MutationObserver(run);
			observer.observe(div, {
            	attributes: true
        	});
        	return function() {
        		div.setAttribute("class", "_tick");
        	};
		}
		return function() {
			setTimeout(run, 0);
		};
	})();

    function enqueue(fn) {
        queue.push(fn);
        if (!running) {
            running = true;
            runAsync();
        }
    }

    function noReturn(fn) {
        return function(result) {
            fn(result);
        };
    }
    
    function settleDeferred(fn, result, deferred) {
    	try {
    		var listenerResult = fn(result);
    		var listenerThen = listenerResult && (typeof listenerResult === "object" || typeof listenerResult === "function") && listenerResult.then;
    		if (typeof listenerThen === "function") {
    			if (listenerResult === deferred.promise) {
    				deferred.reject(new TypeError());
    			} else {
    				var listenerResultCancel = listenerResult.cancel;
    				if (typeof listenerResultCancel === "function") {
    					deferred._parentCancel = listenerResultCancel.bind(listenerResult);
    				} else {
    					delete deferred._parentCancel;
    				}
    				listenerThen.call(listenerResult, noReturn(deferred.resolve), noReturn(deferred.reject), noReturn(deferred.progress));
    			}
    		} else {
    			deferred.resolve(listenerResult);
    		}
    	} catch (e) {
    		deferred.reject(e);
    	}
    }


    /**
     * @name orion.Promise
     * @class Interface representing an eventual value.
     * @description Promise is an interface that represents an eventual value returned from the single completion of an operation.
     *
     * <p>For a concrete class that implements Promise and provides additional API, see {@link orion.Deferred}.</p>
     * @see orion.Deferred
     * @see orion.Deferred#promise
     */
    /**
     * @name then
     * @function
     * @memberOf orion.Promise.prototype
     * @description Adds handlers to be called on fulfillment or progress of this promise.
     * @param {Function} [onResolve] Called when this promise is resolved.
     * @param {Function} [onReject] Called when this promise is rejected.
     * @param {Function} [onProgress] May be called to report progress events on this promise.
     * @returns {orion.Promise} A new promise that is fulfilled when the given <code>onResolve</code> or <code>onReject</code>
     * callback is finished. The callback's return value gives the fulfillment value of the returned promise.
     */
    /**
     * Cancels this promise.
     * @name cancel
     * @function
     * @memberOf orion.Promise.prototype
     * @param {Object} reason The reason for canceling this promise.
     * @param {Boolean} [strict]
     */

    /**
     * @name orion.Deferred
     * @borrows orion.Promise#then as #then
     * @borrows orion.Promise#cancel as #cancel
     * @class Provides abstraction over asynchronous operations.
     * @description Deferred provides abstraction over asynchronous operations.
     *
     * <p>Because Deferred implements the {@link orion.Promise} interface, a Deferred may be used anywhere a Promise is called for.
     * However, in most such cases it is recommended to use the Deferred's {@link #promise} field instead, which exposes a 
     * simplified, minimally <a href="https://github.com/promises-aplus/promises-spec">Promises/A+</a>-compliant interface to callers.</p>
     */
    function Deferred() {
        var result, state, listeners = [],
            _this = this;

        function notify() {
            var listener;
            while ((listener = listeners.shift())) {
                var deferred = listener.deferred;
                var methodName = state === "fulfilled" ? "resolve" : "reject"; //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
                var fn = listener[methodName];
                if (typeof fn === "function") { //$NON-NLS-0$
                	settleDeferred(fn, result, deferred);
                } else {
                    deferred[methodName](result);
                }
            }
        }

        function _reject(error) {
            delete _this._parentCancel;
            state = "rejected";
            result = error;
            if (listeners.length) {
                enqueue(notify);
            }
        }

        function _resolve(value) {
            function once(fn) {
                return function(result) {
                    if (!state || state === "assumed") {
                          fn(result);
                    }
                };
            }
            delete _this._parentCancel;
            try {
                var valueThen = value && (typeof value === "object" || typeof value === "function") && value.then;
                if (typeof valueThen === "function") {
                    if (value === _this) {
                        _reject(new TypeError());
                    } else {
                        state = "assumed";
                        var valueCancel = value && value.cancel;
                        if (typeof valueCancel !== "function") {
                            var deferred = new Deferred();
                            value = deferred.promise;
                            try {
                                valueThen(deferred.resolve, deferred.reject, deferred.progress);
                            } catch (thenError) {
                                deferred.reject(thenError);
                            }
                            valueCancel = value.cancel;
                            valueThen = value.then;
                        }
                        result = value;
                        valueThen.call(value, once(_resolve), once(_reject));
                        _this._parentCancel = valueCancel.bind(value);
                    }
                } else {
                    state = "fulfilled";
                    result = value;
                    if (listeners.length) {
                        enqueue(notify);
                    }
                }
            } catch (error) {
                once(_reject)(error);
            }
        }

        function cancel() {
            var parentCancel = _this._parentCancel;
            if (parentCancel) {
                delete _this._parentCancel;
                parentCancel();
            } else if (!state) {
                var cancelError = new Error("Cancel");
                cancelError.name = "Cancel";
                _reject(cancelError);
            }
        }


        /**
         * Resolves this Deferred.
         * @name resolve
         * @function
         * @memberOf orion.Deferred.prototype
         * @param {Object} value
         * @returns {orion.Promise}
         */
        this.resolve = function(value) {
            if (!state) {
                _resolve(value);
            }
            return _this;
        };

        /**
         * Rejects this Deferred.
         * @name reject
         * @function
         * @memberOf orion.Deferred.prototype
         * @param {Object} error
         * @param {Boolean} [strict]
         * @returns {orion.Promise}
         */
        this.reject = function(error) {
            if (!state) {
                _reject(error);
            }
            return _this;
        };

        /**
         * Notifies listeners of progress on this Deferred.
         * @name progress
         * @function
         * @memberOf orion.Deferred.prototype
         * @param {Object} update The progress update.
         * @returns {orion.Promise}
         */
        this.progress = function(update) {
            if (!state) {
                listeners.forEach(function(listener) {
                    if (listener.progress) {
                        try {
                            listener.progress(update);
                        } catch (ignore) {
                            // ignore
                        }
                    }
                });
            }
            return _this.promise;
        };

        this.cancel = function() {
            if (_this._parentCancel) {
                setTimeout(cancel, 0);
            } else {
                cancel();
            }
            return _this;
        };

        // Note: "then" ALWAYS returns before having onResolve or onReject called as per http://promises-aplus.github.com/promises-spec/
        this.then = function(onFulfill, onReject, onProgress) {
        	var deferred = new Deferred();
            deferred._parentCancel = _this.promise.cancel;
            listeners.push({
                resolve: onFulfill,
                reject: onReject,
                progress: onProgress,
                deferred: deferred
            });
            if (state === "fulfilled" || state === "rejected") {
                enqueue(notify);
            }
            return deferred.promise;
        };

        /**
         * The promise exposed by this Deferred.
         * @name promise
         * @field
         * @memberOf orion.Deferred.prototype
         * @type orion.Promise
         */
        this.promise = {
            then: _this.then,
            cancel: _this.cancel
        };
    }

    /**
     * Returns a promise that represents the outcome of all the input promises.
     * <p>When <code>all</code> is called with a single parameter, the returned promise has <dfn>eager</dfn> semantics,
     * meaning that if any input promise rejects, the returned promise immediately rejects, without waiting for the rest of the
     * input promises to fulfill.</p>
     *
     * To obtain <dfn>lazy</dfn> semantics (meaning the returned promise waits for every input promise to fulfill), pass the
     * optional parameter <code>optOnError</code>.
     * @name all
     * @function
     * @memberOf orion.Deferred
     * @static
     * @param {orion.Promise[]} promises The input promises.
     * @param {Function} [optOnError] Handles a rejected input promise. <code>optOnError</code> is invoked for every rejected
     * input promise, and is passed the reason the input promise was rejected. <p><code>optOnError</code> can return a value, which
     * allows it to act as a transformer: the return value serves as the final fulfillment value of the rejected promise in the 
     * results array generated by <code>all</code>.
     * @returns {orion.Promise} A new promise. The returned promise is generally fulfilled to an <code>Array</code> whose elements
     * give the fulfillment values of the input promises. <p>However, if an input promise rejects and eager semantics is used, the 
     * returned promise will instead be fulfilled to a single error value.</p>
     */
    Deferred.all = function(promises, optOnError) {
        var count = promises.length,
            result = [],
            rejected = false,
            deferred = new Deferred();

        deferred.then(undefined, function() {
            rejected = true;
            promises.forEach(function(promise) {
                if (promise.cancel) {
                    promise.cancel();
                }
            });
        });

        function onResolve(i, value) {
            if (!rejected) {
                result[i] = value;
                if (--count === 0) {
                    deferred.resolve(result);
                }
            }
        }

        function onReject(i, error) {
            if (!rejected) {
                if (optOnError) {
                    try {
                        onResolve(i, optOnError(error));
                        return;
                    } catch (e) {
                        error = e;
                    }
                }
                deferred.reject(error);
            }
        }

        if (count === 0) {
            deferred.resolve(result);
        } else {
            promises.forEach(function(promise, i) {
                promise.then(onResolve.bind(undefined, i), onReject.bind(undefined, i));
            });
        }
        return deferred.promise;
    };

    /**
     * Applies callbacks to a promise or to a regular object.
     * @name when
     * @function
     * @memberOf orion.Deferred
     * @static
     * @param {Object|orion.Promise} value Either a {@link orion.Promise}, or a normal value.
     * @param {Function} onResolve Called when the <code>value</code> promise is resolved. If <code>value</code> is not a promise,
     * this function is called immediately.
     * @param {Function} onReject Called when the <code>value</code> promise is rejected. If <code>value</code> is not a promise, 
     * this function is never called.
     * @param {Function} onProgress Called when the <code>value</code> promise provides a progress update. If <code>value</code> is
     * not a promise, this function is never called.
     * @returns {orion.Promise} A new promise.
     */
    Deferred.when = function(value, onResolve, onReject, onProgress) {
        var promise, deferred;
        if (value && typeof value.then === "function") { //$NON-NLS-0$
            promise = value;
        } else {
            deferred = new Deferred();
            deferred.resolve(value);
            promise = deferred.promise;
        }
        return promise.then(onResolve, onReject, onProgress);
    };

    return Deferred;
}));
/*******************************************************************************
 * @license
 * Copyright (c) 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define('orion/webui/littlelib',["orion/util"], function(util) {
	/**
	 * @name orion.webui.littlelib
	 * @class A small library of DOM and UI helpers.
	 */

	/**
	 * Holds useful <code>keyCode</code> values.
	 * @name orion.webui.littlelib.KEY
	 * @static
	 */
	var KEY = {
		BKSPC: 8,
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		CONTROL: 17,
		ALT: 18,
		ESCAPE: 27,
		SPACE: 32,
		PAGEUP: 33,
		PAGEDOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		INSERT: 45,
		DEL: 46,
		COMMAND: 91
	};

	/**
	 * Alias for <code>node.querySelector()</code>.
	 * @name orion.webui.littlelib.$
	 * @function
	 * @static
	 * @param {String} selectors Selectors to match on.
	 * @param {Node} [node=document] Node to query under.
	 * @returns {Element}
	 */
	function $(selector, node) {
		if (!node) {
			node = document;
		}
		return node.querySelector(selector);
	}

	/**
	 * Alias for <code>node.querySelectorAll()</code>.
	 * @name orion.webui.littlelib.$$
	 * @function
	 * @static
	 * @param {String} selectors Selectors to match on.
	 * @param {Node} [node=document] Node to query under.
	 * @returns {NodeList}
	 */
	function $$(selector, node) {
		if (!node) {
			node = document;
		}
		return node.querySelectorAll(selector);
	}

	/**
	 * Identical to {@link orion.webui.littlelib.$$}, but returns an Array instead of a NodeList.
	 * @name orion.webui.littlelib.$$array
	 * @function
	 * @static
	 * @param {String} selectors Selectors to match on.
	 * @param {Node} [node=document] Node to query under.
	 * @returns {Element[]}
	 */
	function $$array(selector, node) {
		return Array.prototype.slice.call($$(selector,node));
	}

	/**
	 * Alias for <code>document.getElementById</code>, but returns the input unmodified when passed a Node (or other non-string).
	 * @function
	 * @param {String|Element} elementOrId
	 * @returns {Element}
	 */
	function node(either) {
		var theNode = either;
		if (typeof(either) === "string") { //$NON-NLS-0$
			theNode = document.getElementById(either);
		}	
		return theNode;
	}

	/**
	 * Returns whether <code>child</code> is a descendant of <code>parent</code> in the DOM order.
	 * @function
	 * @param {Node} parent
	 * @param {Node} child
	 * @returns {Boolean}
	 */
	function contains(parent, child) {
		if (!parent || !child) { return false; }
		if (parent === child) { return true; }
		var compare = parent.compareDocumentPosition(child);  // useful to break out for debugging
		return Boolean(compare & 16);
	}

	/**
	 * Returns the bounds of a node. The returned coordinates are absolute (not relative to the viewport).
	 * @function
	 * @param {Node} node
	 * @returns {Object}
	 */
	function bounds(node) {
		var clientRect = node.getBoundingClientRect();
		var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
		var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
		return { 
			left: clientRect.left + scrollLeft,
			top: clientRect.top + scrollTop,
			width: clientRect.width,
			height: clientRect.height
		};
	}

	/**
	 * Removes all children of the given node.
	 * @name orion.webui.littlelib.empty
	 * @function
	 * @static
	 * @param {Node} node
	 */
	function empty(node) {
		while (node.hasChildNodes()) {
			var child = node.firstChild;
			node.removeChild(child);
		}
	}

	function _getTabIndex(node) {
		var result = node.tabIndex;
		if (result === 0 && util.isIE) {
			/*
			 * The default value of tabIndex is 0 on IE, even for elements that are not focusable
			 * by default (http://msdn.microsoft.com/en-us/library/ie/ms534654(v=vs.85).aspx).
			 * Handle this browser difference by treating this value as -1 if the node is a type
			 * that is not focusable by default according to the MS doc and has not had this
			 * attribute value explicitly set on it.
			 */
			var focusableElements = {
				a: true,
				body: true,
				button: true,
				frame: true,
				iframe: true,
				img: true,
				input: true,
				isindex: true,
				object: true,
				select: true,
				textarea: true
			};
			if (!focusableElements[node.nodeName.toLowerCase()] && !node.attributes.tabIndex) {
				result = -1;
			}
		}
		return result;
	}
	
	/* 
	 * Inspired by http://brianwhitmer.blogspot.com/2009/05/jquery-ui-tabbable-what.html
	 */
	function firstTabbable(node) {
		if (_getTabIndex(node) >= 0 && !node.disabled && node.offsetParent) {
			return node;
		}
		if (node.hasChildNodes()) {
			for (var i=0; i<node.childNodes.length; i++) {
				var result = firstTabbable(node.childNodes[i]);
				if (result) {
					return result;
				}
			}
		}
		return null;
	}

	function lastTabbable(node) {
		if (node.hasChildNodes()) {
			for (var i = node.childNodes.length-1; i >= 0; i--) {
				var result = lastTabbable(node.childNodes[i]);
				if (result) {
					return result;
				}
			}
		}
		if (_getTabIndex(node) >= 0 && !node.disabled && node.offsetParent) {
			return node;
		}
		return null;
	}

	/*
	 * Special hook to show the context menu on Shift + F10 (macs only)
	 */
	function installShowContextMenu() {
		if (util.isMac) {
			document.addEventListener("keydown", function (evt) {
				if (evt.keyCode === 121 && evt.shiftKey) {
					var rect, xPos, yPos;
					var focusElement = document.activeElement;
	
					if (focusElement.contentEditable === "true") {
						var selection = window.getSelection();
						var range = selection.getRangeAt(0); //get the text range
						rect = range.getBoundingClientRect();
						xPos = rect.left;
						yPos = rect.top + rect.height;
						
					} else {
						rect = bounds(focusElement);
						xPos = rect.left + (rect.width/2);
						yPos = rect.top + (rect.height/2);
					}
	
					var e = focusElement.ownerDocument.createEvent("MouseEvents");
					e.initMouseEvent("contextmenu", true, true,
					    focusElement.ownerDocument.defaultView, 1, 0, 0, xPos, yPos, false,
					    false, false, false,2, null);
					return !focusElement.dispatchEvent(e);				
				}
			}, true);
		}
	}
	installShowContextMenu();
	
	/* Trap the tabs within the given parent */
	function trapTabs(parentElement) {
		if (parentElement.tabTrapInstalled)
			return;
		
		parentElement.addEventListener("keydown", function (e) { //$NON-NLS-0$
			if(e.keyCode === KEY.TAB) {
				var first = firstTabbable(parentElement);
				var last = lastTabbable(parentElement);
				
				if (first && last) {
					if (e.target === last && !e.shiftKey) {
						// wrap to first tabbable
						first.focus();
						stop(e);
					}
					else if (e.target === first && e.shiftKey) {
						// wrap to last tabbable
						last.focus();
						stop(e);
					}
				}
			} 
		}, true);
		parentElement.tabTrapInstalled = true;
	}
	
	var variableRegEx = /\$\{([^\}]+)\}/;
	// Internal helper
	function processNodes(node, replace) {
		if (node.nodeType === 3) { // TEXT_NODE
			var matches = variableRegEx.exec(node.nodeValue);
			if (matches && matches.length > 1) {
				replace(node, matches);
			}
		}
		if (node.hasChildNodes()) {
			for (var i=0; i<node.childNodes.length; i++) {
				processNodes(node.childNodes[i], replace);
			}
		}
	}

	/**
	 * @name pixelValueOf
	 * @description Returns the pixel value of the given CSS attribute
	 * @param node The element whose style is to be checked
	 * @param attrName The name of the attribute to check. Use the literal CSS name
	 * (i.e. 'padding-left' rather than 'paddingLeft').
	 * @returns returns The value (in pixels) of the attribute. If the value cannot be parsed to an int the zero is returned
	 */
	function pixelValueOf(node, attrName) {
		if (!node || !attrName) {
			return 0;
		}
		
		var doc = node.ownerDocument;
		var win =  doc.defaultView || doc.parentWindow;
		if (win.getComputedStyle) {
			var style = win.getComputedStyle(node, null);
			var value = style.getPropertyValue(attrName);
			// Ensure that value ends in "px"
			if (value.length > 2 && value.indexOf("px", value.length - 2) !== -1) {
				value = value.slice(0,-2);
				var intVal = parseInt(value,10);
				if (intVal !== intVal) {
					return 0;  // value was NaN
				} else {
					return intVal;
				}
			}
		}
		return 0;
	}
	
	/**
	 * Performs substitution of strings into textContent within the given node and its descendants. An occurrence of <code>${n}</code>
	 * in text content will be replaced with the string <code>messages[n]</code>.
	 * <p>This function is recommended for binding placeholder text in template-created DOM elements to actual display strings.</p>
	 * @name orion.webui.littlelib.processTextNodes
	 * @function
	 * @param {Node} node The node to perform replacement under.
	 * @param {String[]} messages The replacement strings.
	 */
	function processTextNodes(node, messages) {
		processNodes(node, function(targetNode, matches) {
			var replaceText = messages[matches[1]] || matches[1];
			targetNode.parentNode.replaceChild(document.createTextNode(replaceText), targetNode);
		});
	}

	/**
	 * Performs substitution of DOM nodes into textContent within the given node and its descendants. An occurrence of <code>${n}</code>
	 * in text content will be replaced by the DOM node <code>replaceNodes[n]</code>.
	 * <p>This function is recommended for performing rich-text replacement within a localized string. The use of actual DOM nodes
	 * avoids the need for embedded HTML in strings.</p>
	 * @name orion.webui.littlelib.processDOMNodes
	 * @function
	 * @param {Node} node The node to perform replacement under.
	 * @param {Node[]} replaceNodes The replacement nodes.
	 */
	function processDOMNodes(node, replaceNodes) {
		processNodes(node, function(targetNode, matches) {
			var replaceNode = replaceNodes[matches[1]];
			if (replaceNode) {
				var range = document.createRange();
				var start = matches.index;
				range.setStart(targetNode, start);
				range.setEnd(targetNode, start + matches[0].length);
				range.deleteContents();
				range.insertNode(replaceNode);
			}
		});
	}

	/**
	 * Adds auto-dismiss functionality to the document. When a click event occurs whose <code>target</code> is not a descendant of
	 * one of the <code>excludeNodes</code>, the <code>dismissFunction</code> is invoked.
	 * @name orion.webui.littlelib.addAutoDismiss
	 * @function
	 * @static
	 * @param {Node[]} excludeNodes Clicks targeting any descendant of these nodes will not trigger the dismissFunction.
	 * @param {Function} dismissFunction The dismiss handler.
	 */
	
	var autoDismissNodes = null;

	function addAutoDismiss(excludeNodes, dismissFunction) {
		// auto dismissal.  Click anywhere else means close.
		function onclick(event) {
			autoDismissNodes.forEach(function(autoDismissNode) {
				var excludeNodeInDocument = false;
				var excluded = autoDismissNode.excludeNodes.some(function(excludeNode) {
					if(document.body.contains(excludeNode)) {
						excludeNodeInDocument = true;
						return excludeNode.contains(event.target);
					}
					return false;
				});
				if (excludeNodeInDocument && !excluded) {
					try {
						autoDismissNode.dismiss(event);
					} catch (e) {
						if (typeof console !== "undefined" && console) { //$NON-NLS-0$
							console.error(e && e.message);
						}
					}
				}
			});
			autoDismissNodes = autoDismissNodes.filter(function(autoDismissNode) {
				// true if at least one excludeNode is in document.body
				return autoDismissNode.excludeNodes.some(function(excludeNode) {
					return document.body.contains(excludeNode);
				});
			});
		}

		// Hook listener only once
		if (autoDismissNodes === null) {
			autoDismissNodes = [];
			document.addEventListener("click", onclick, true); //$NON-NLS-0$
			if (util.isIOS) {
				document.addEventListener("touchend", function(event){
					function unhook(){
						event.target.removeEventListener("click", unhook);
					}
					if (event.touches.length === 0) {
						// we need a click eventlistener on the target to have ios really trigger a click
						event.target.addEventListener("click", unhook);
					}	
				}, false);
			}
		}
		
		autoDismissNodes.push({excludeNodes: excludeNodes, dismiss: dismissFunction});
	}
	
	/**
	 * Removes all auto-dismiss nodes which trigger the specified dismiss function.
	 * 
	 * @name orion.webui.littlelib.removeAutoDismiss
	 * @function
	 * @static
	 * @param {Function} dismissFunction The dismiss function to look for.
	 */
	function removeAutoDismiss(dismissFunction) {
		autoDismissNodes = autoDismissNodes.filter(function(autoDismissNode) {
			return dismissFunction !== autoDismissNode.dismiss;
		});
	}
	
	/**
	 * Returns the parent of the node that has the vertical scroll bar.
	 * 
	 * @name orion.webui.littlelib.getOffsetParent
	 * @function
	 * @static
	 * @param {Element} node The node to lookup the offset parent
	 */
	function getOffsetParent(node) {
		var offsetParent = node.parentNode, documentElement = document.documentElement;
		while (offsetParent && offsetParent !== documentElement) {
			var style = window.getComputedStyle(offsetParent, null);
			if (!style) { break; }
			var overflow = style.getPropertyValue("overflow-y"); //$NON-NLS-0$
			if (overflow === "auto" || overflow === "scroll") { break; } //$NON-NLS-1$ //$NON-NLS-0$
			offsetParent = offsetParent.parentNode;
		}
		return offsetParent;
	}
	
	/**
	 * Cancels the default behavior of an event and stops its propagation.
	 * @name orion.webui.littlelib.stop
	 * @function
	 * @static
	 * @param {Event} event
	 */
	function stop(event) {
		if (window.document.all) { 
			event.keyCode = 0;
		}
		if (event.preventDefault) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
	
	function setFramesEnabled(enable) {
		var frames = document.getElementsByTagName("iframe"); //$NON-NLS-0$
		for (var i = 0; i<frames.length; i++) {
			frames[i].parentNode.style.pointerEvents = enable ? "" : "none"; //$NON-NLS-0$
		}
	}
	/**
	 * Maps a <code>keyCode</code> to <tt>KEY</tt> name. This is the inverse of {@link orion.webui.littlelib.KEY}.
	 * @private
	 */
	var KEY_CODE = Object.create(null);
	Object.keys(KEY).forEach(function(name) {
		KEY_CODE[KEY[name]] = name;
	});

	/**
	 * @param {Number} keyCode
	 * @returns The name of the <code>lib.KEY</code> entry for keyCode, or null.
	 */
	function keyName(keyCode) {
		return KEY_CODE[keyCode] || null;
	}

	/**
	 * Creates DOM nodes from the specified template string.
	 * 
	 * @param {String} templateString 	A string containing the HTML template to use
	 * @param {Node} parentNode 		Optional. The parent node to insert the new nodes into. 
	 * 									The parent's contents will be completely replaced.
	 * @returns If the template string contains a single node or a wrapper node which
	 * 			wraps all the other nodes that single DOM node will be returned. 
	 * 			Otherwise if the template string contains multiple top-level nodes an
	 * 			{HTMLCollection} object containing all the top-level nodes will be returned.
	 */
	function createNodes(templateString, parentNode) {
		var parent = parentNode;
		var newNodes = null;
		
		if (undefined === parent) {
			parent = document.createElement("div"); //$NON-NLS-0$
		}

		parent.innerHTML = templateString;	
		if (parent.children.length > 1) {
			newNodes = parent.children;
		} else {
			newNodes = parent.firstChild;
		}
		
		return newNodes;
	}

	//return module exports
	return {
		$: $,
		$$: $$,
		$$array: $$array,
		node: node,
		contains: contains,
		bounds: bounds,
		empty: empty,
		firstTabbable: firstTabbable,
		lastTabbable: lastTabbable,
		trapTabs: trapTabs,
		pixelValueOf: pixelValueOf,
		stop: stop,
		processTextNodes: processTextNodes,
		processDOMNodes: processDOMNodes,
		addAutoDismiss: addAutoDismiss,
		setFramesEnabled: setFramesEnabled,
		getOffsetParent: getOffsetParent,
		removeAutoDismiss: removeAutoDismiss,
		keyName: keyName,
		KEY: KEY,
		createNodes: createNodes
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd, node*/
define("orion/editor/tooltip", [
	'i18n!orion/editor/nls/messages',
	'orion/editor/textView',
	'orion/editor/projectionTextModel',
	'orion/Deferred',
	'orion/editor/util',
	'orion/webui/littlelib',
	'orion/util'
], function(messages, mTextView, mProjectionTextModel, Deferred, textUtil, lib, util) {

/**
 * @name Tooltip
 * @description Tooltip support for text views
 * 
 * show() - Opens the tooltip
 * update() - Updates the content of the open tooltip
 * onHover() - Checks if the x,y coordinates are outside the current tooltip area and updates the tooltip if necessary
 * hide() - Closes the tooltip
 * isVisible() - Returns whether the tooltip is currently showing
 * 
 * The methods above ask for a tooltipInfo object, which must contain a callback function getTooltipInfo()
 * This function must return an info object with the following contents:
 * 
 * Info {
 * 	Contents {string, html element, annotation array, etc.} Contents to display, if undefined, the hover service will be asked for content
 * 	Context {source, offset, offsetStart, offsetEnd}} Information used to modify the tooltip position or contents
 * 	Position {String} One of left, right, top, bottom used to position the tooltip relative to the anchor area
 * 	AnchorArea {top, left, width, height} rectangle defining the source of the tooltip and where to position relative to
 * 	TooltipArea {top, left, width, height} rectangle to define the tooltip's exact placement rather than a relative position to the anchor
 * 	TooltipOffsetX {Number} Hint to move the tooltip position horizontally
 * 	TooltipOffsetY {Number} Hint to move the tooltip position vertically
 * 
 * @param view
 */
function Tooltip (view, editor) {
		this._view = view;
		this._editor = editor;
		var parent = view.getOptions("parent"); //$NON-NLS-0$
		this._create(parent ? parent.ownerDocument : document);
	}
	/**
	 * Creates a new tooltip for the given text view.
	 * @param view {TextView} the text view the tooltip belongs to
	 * @param editor {Editor} the editor the tooltip belongs to, optional, allows quick fixes in tooltip to run on all annotations in the editor
	 */
	Tooltip.getTooltip = function(view, editor) {
		if (!view._tooltip) {
			 view._tooltip = new Tooltip(view, editor);
		}
		return view._tooltip;
	};
	Tooltip.prototype = /** @lends orion.editor.Tooltip.prototype */ {
		_create: function(document) {
			if (this._tooltipDiv) { return; }
			var tooltipDiv = this._tooltipDiv = util.createElement(document, "div"); //$NON-NLS-0$
			tooltipDiv.tabIndex = 0;
			tooltipDiv.className = "textviewTooltip"; //$NON-NLS-0$
			tooltipDiv.setAttribute("aria-live", "assertive"); //$NON-NLS-1$ //$NON-NLS-2$
			tooltipDiv.setAttribute("aria-atomic", "true"); //$NON-NLS-1$ //$NON-NLS-2$
			this._tooltipDiv.style.visibility = "hidden"; //$NON-NLS-0$
			this._tipShowing = false;
			document.body.appendChild(tooltipDiv);
			
			lib.trapTabs(this._tooltipDiv);
			
			var self = this;
			textUtil.addEventListener(document, "mousedown", this._mouseDownHandler = function(event) {
				if (!self.isVisible()) { return; }
				if (textUtil.contains(tooltipDiv, event.target || event.srcElement)) { return; }
				if (!self._locked){
					self.hide();
				}
			}, true);
			textUtil.addEventListener(document, "scroll", this._scrollHandler = function(event) {
				if (!self.isVisible()){
					return;	
				} 

				// Make sure the scroll isn't *inside* the tooltip...
				if (textUtil.contains(tooltipDiv, event.target || event.srcElement)) { return; }

				if (self._topPixel !== self._view.getTopPixel() || self._leftPixel !== self._view.getHorizontalPixel()) {
					self.hide();
				}
			}, true);
			textUtil.addEventListener(document, "mousemove", this._mouseMoveHandler = function(event) {
				// Ignore spurious mousemove events
				if (self._prevX && self._prevX === event.clientX && self._prevY && self._prevY === event.clientY) {
					return;
				}
				self._prevX = event.clientX;
				self._prevY = event.clientY;
				
				if (!self.isVisible() || self._locked || self._hasFocus()) { return; }
				if (self._isInRect(self._outerArea, event.clientX, event.clientY)){ return; }
				self.hide();
			}, true);
			textUtil.addEventListener(tooltipDiv, "focus", /* @callback */ function(event) {
				if (!self._locked){
					self._tooltipDiv.classList.add('textViewTooltipOnFocus'); //$NON-NLS-0$
				}
			}, false);
			textUtil.addEventListener(tooltipDiv, "blur", /* @callback */ function(event) {
				self._tooltipDiv.classList.remove('textViewTooltipOnFocus'); //$NON-NLS-0$
			}, false);
			textUtil.addEventListener(tooltipDiv, "mouseenter", /* @callback */ function(event) {
				if (!self._locked){
					self._tooltipDiv.classList.add('textViewTooltipOnHover'); //$NON-NLS-0$
				}
			}, false);
			textUtil.addEventListener(tooltipDiv, "mouseleave", /* @callback */ function(event) {
				if (!self._hasFocus()){
					self._tooltipDiv.classList.remove('textViewTooltipOnHover'); //$NON-NLS-0$
				}
			}, false);
			textUtil.addEventListener(tooltipDiv, "keydown", function(event) {
				if (event.keyCode === 27) {
					if (!self._locked){
						self.hide();
					}
				}
			}, false);
			this._view.addEventListener("Destroy", function() {
				self.destroy();
			});
		},
		destroy: function() {
			if (!this._tooltipDiv) { return; }
			this.hide();
			var parent = this._tooltipDiv.parentNode;
			if (parent) { parent.removeChild(this._tooltipDiv); }
			var doc = this._tooltipDiv.ownerDocument;
			textUtil.removeEventListener(doc, "mousedown", this._mouseDownHandler, true);
			textUtil.removeEventListener(doc, "scroll", this._scrollHandler, true);
			textUtil.removeEventListener(doc, "mousemove", this._mouseMoveHandler, true);
			this._tooltipDiv = null;
		},
		
		/**
		 * @name show
		 * @description Show the tooltip using the given target information
		 * @function
		 * @param tooltipInfo a function that will return the tooltip contents (see _processInfo())
		 * @param target The target through which the info is obtained
		 * @param locked If true locks the tooltip (never hides unless 'hide' is called)
		 * @param giveFocus If true forces the focus onto the tooltip (used for F2 processing)
		 */
		show: function(tooltipInfo, locked, giveFocus) {
			this._locked = locked;
			this._giveFocus = giveFocus;
			this._topPixel = this._view.getTopPixel();
			this._leftPixel = this._view.getHorizontalPixel();
			this._processInfo(tooltipInfo.getTooltipInfo());
		},
		
		/**
		 * @name update
		 * @description Updates the information in an already visible tooltip
		 * @function
		 * @param tooltipInfo a function that will return the parameters need to update the information (see _processInfo())
		 * @param noContent If true makes no attempt to gather new info and just updates the tooltip's position
		 */
		update: function(tooltipInfo, noContent) {
			if (!tooltipInfo){
				return;
			}
			if (noContent) {
				this._showContents(null, tooltipInfo.getTooltipInfo(), true);
			} else {
				this._processInfo(tooltipInfo.getTooltipInfo(), true);
			}
		},
		
		/**
		 * @name onHover
		 * @description Checks the x,y location and updates the tooltip contents or hides the tooltip as appropriate
		 * @function
		 * @param tooltipInfo a function that will return the parameters need to update the information (see _processInfo())
		 * @param x coordinates of the mouse event
		 * @param y coordinates of the mouse event
		 */
		onHover: function(tooltipInfo, x, y) {
			if (!tooltipInfo) {
				return;
			}
			
			// Don't process if we're in the anchor or tooltip
			if (this._isInRect(this._anchorArea, x, y)
					|| this._isInRect(this._tooltipArea, x, y)
					|| this._locked
					|| this._hasFocus()) {
				return;
			}
			
			this._processInfo(tooltipInfo.getTooltipInfo());
		},		
	
		/**
		 * @name hide
		 * @description Hides the current tooltip (if it's showing)
		 * @function
		 * @public
		*/
		hide: function(clearLock) {
			if (clearLock) {
				this._locked = undefined;
			}
			
			if (this._locked || !this.isVisible()){
				return;
			}
				
			if (this.hover) {
				this.hover.clearQuickFixes();
			}

			if (this._hasFocus()) {
				this._view.focus();
			}
			if (this._tooltipContents) {
				this._tooltipDiv.removeChild(this._tooltipContents);
				this._tooltipContents = null;
			}
			
			// Code projections are displayed using the editor theme colors
			this._tooltipDiv.classList.remove("textviewTooltipCodeProjection"); //$NON-NLS-0$
			this._tooltipDiv.classList.remove("textviewTooltipOnHover"); //$NON-NLS-0$
			this._tooltipDiv.classList.remove("textviewTooltipOnFocus"); //$NON-NLS-0$
			
			this._tooltipDiv.style.visibility = "hidden"; //$NON-NLS-0$
			this._tipShowing = false;
			this._tooltipDiv.style.left = "";
			this._tooltipDiv.style.right = "";
			this._tooltipDiv.style.top = "";
			this._tooltipDiv.style.bottom = "";
			this._tooltipDiv.style.width = "auto";		 //$NON-NLS-0$
			this._tooltipDiv.style.maxWidth = "";
			this._tooltipDiv.style.height = "auto";		 //$NON-NLS-0$	
			this._tooltipDiv.style.maxHeight = "";
			this._tooltipDiv.style.overflowX = "";
			this._tooltipDiv.style.overflowY = "";
			
			this._anchorArea = undefined;  // Area of text/ruler/etc. we are showing a tooltip for
			this._tooltipArea = undefined;  // The area the tooltip covers
			this._outerArea = undefined; // The rectangle encapsulating both anchor and tooltip areas where we want to keep the tooltip open
			
			// cancel any outstanding defers
			if (this._hoverPromises) {
				this._hoverPromises.forEach(function(info) {
					if (!info.resolved) {
						info.cancel();
					}
				});
			}
			this._hoverPromises = undefined;
			
			// values that are calculated
			this._tipRect = undefined;
		},
		
		/**
		 * @name isVisible
		 * @description Returns a boolean indicating whether the tooltip is currently visible
		 * @function
		 * @public
		 * @returns {boolean} 'true' iff the tooltip is currently visible
		*/
		isVisible: function() {
			return this._tipShowing;
		},
		
		/**
		 * @name _processInfo
		 * @description Renders the content, positions the tooltip then makes the tooltip visible
		 * @function
		 * @private
		 * @param info {Object} The info object passed by the caller
		 * 
		 * Info:
		 * 1) Contents
		 * 2) Context
		 * 3) Position string left, right, top, bottom
		 * 4) AnchorArea x, y, width, height
		 * 5) TooltipArea x, y, width, height
		 * 6) TooltipOffsetX
		 * 7) TooltipOffsetY
		 * 8) AllowFullWidth
		 * 
		 * @param update Whether to update the existing tooltip contents or open a new tooltip
		 */
		_processInfo: function(info, update) {
			if (!this._tooltipDiv){
				return;
			}
			
			var newTooltipContents;
			if (update && this._tooltipContents) {
				this._tooltipContents.innerHTML = "";
				newTooltipContents = this._tooltipContents;
			} else {
 				newTooltipContents = util.createElement(this._tooltipDiv.ownerDocument, "div"); //$NON-NLS-0$
 			}
 			
			if (info) {
				// Render provided content
				if (info.contents) {
					if (this._renderImmediateInfo(newTooltipContents, info.contents, info.context)) {
						this._showContents(newTooltipContents, info, update);
						return true;
					}
				}
				
				// If no immediate content, check if hover service plug-ins have content
				if (this.hover && info.context){
					this._hoverPromises = this.hover.computeHoverInfo(info.context);
					if (this._hoverPromises) {
						var self = this;
						var promises = this._hoverPromises.slice(0);
						promises.forEach(function(hoverPromise) {
							Deferred.when(hoverPromise, function (data) {
								// Remove this promise from the list so we don't try cancelling it while processing (see hide())
								if (self._hoverPromises){
									var index = self._hoverPromises.indexOf(hoverPromise);
									if (index >= 0){
										self._hoverPromises.splice(index, 1);
									}
								}
								if (data) {
									if (self._renderPluginContent(newTooltipContents, data)) {
										if (data.offsetStart){
											info.context.offsetStart = data.offsetStart;
										}
										if (data.offsetEnd){
											info.context.offsetEnd = data.offsetEnd;
										}
										if (data.allowFullWidth){
											info.allowFullWidth = data.allowFullWidth;
										}
										self._showContents(newTooltipContents, info, update);
									}
								}
							}, function(error) {
								if (console && error && error.name !== 'Cancel') {
									console.log("Error computing hover tooltip"); //$NON-NLS-0$
									console.log(error && error.stack);
								}
							});
						});
						return true;
					}
				}
			}
		},
		/**
		 * @name _showContents
		 * @description Takes the rendered contents, positions the tooltip, opens the tooltip
		 * @function
		 * @private
		 * @param newContentsDiv
		 * @param info
		 * @param update
		 */
		_showContents: function _showContents(newContentsDiv, info, update) {
			if (!update){
				this.hide();
			} else {
				// If update is called but the set tooltip area is different, recreate the tooltip with the new sizing (ex: content assist resizing)
				// We could also check if the set anchor area is different, but no one would be using it
				if (this._tooltipArea && info.tooltipArea){
					if (this._tooltipArea.left !== info.tooltipArea.left || this._tooltipArea.top !== info.tooltipArea.top || this._tooltipArea.width !== info.tooltipArea.width || this._tooltipArea.height !== info.tooltipArea.height){
						this._anchorArea = null;
						this._tooltipArea = null;
						this._outerArea = null;
					}
				}
			}
			
			if (newContentsDiv) {
				if (this._tooltipContents) {
					this._tooltipDiv.removeChild(this._tooltipContents);
				}
				this._tooltipContents = newContentsDiv;
				this._tooltipDiv.appendChild(newContentsDiv);				
			}
			
			if (!this._anchorArea){
				this._anchorArea = this._computeAnchorArea(info);
			}
			if (!this._tooltipArea){
				// This function performs two tasks, computing the rectangle and setting all the style properties
				this._tooltipArea = this._computeTooltipArea(info, this._anchorArea, this._tooltipDiv);
			}
			if (!this._outerArea){
				this._outerArea = this._computeOuterArea(this._anchorArea, this._tooltipArea);
			}
			
			this._tooltipDiv.style.visibility = "visible"; //$NON-NLS-0$
			this._tipShowing = true;
			
			if (this._giveFocus) {
				this._setInitialFocus(this._tooltipDiv);
				this._giveFocus = undefined;
			}
		},
		
		/**
		 * @name _computeAnchorArea
		 * @description Computes and returns the rectangle that the tooltip is anchored to.  For example the anchor for an annotation 
		 * 				may be its text range.
		 * @function
		 * @private
		 * @param info {Object} the info object passed by the caller.
		 * @returns returns the computed rectangle anchor area
		 */
		_computeAnchorArea: function _computeAnchorArea(info){
			if (info.anchorArea){
				if (info.anchorArea.top && info.anchorArea.left && info.anchorArea.height && info.anchorArea.width){
					return info.anchorArea;
				}
			}
			
			if (info.context){
				if (info.context.offsetStart && info.context.offsetEnd){
					// The full text content of the editor is given to the plug-in hover service, so we must adjust the offsets
					// for the projection model as folded comments will change the offsets/coordinates in the displayed editor
					var mappedStart = this.mapOffset(info.context.offsetStart, false);
					var mappedEnd = this.mapOffset(info.context.offsetEnd, false);
					return this._computeRectangleFromOffset(mappedStart, mappedEnd);
				}
				
				if (info.context.offset >= 0){
					// The provided offset is based on the full text content, not the projection model
					// Adjust the offset before finding the closest enclosing word
					var mappedOffset = this.mapOffset(info.context.offset, false);
					var end = this._view.getNextOffset(mappedOffset, { unit: "wordend", count: 0}); //$NON-NLS-0$
					var start = this._view.getNextOffset(end, { unit: "word", count: -1}); //$NON-NLS-0$
					return this._computeRectangleFromOffset(start, end);
				}
			}
			
			return {top: 0, left: 0, height: 0, width: 0};
		},
		
		/**
		 * @name _computeTooltipPosition
		 * @description Defines the tooltip area and placement.  Returns the rectangle defining the tooltip area and sets the tooltipDiv
		 * 				style to match the rectangles values.
		 * @param info the tooltip info object passed by the caller
		 * @param anchorArea the computed tooltip anchor area to which the tooltip will be positioned
		 * @param tooltipDiv the div for the tooltip, this function will modify its style to match the computed position/size
		 * @returns returns the computed tooltip area rectangle
		 * @function
		 * @private
		 */
		_computeTooltipArea: function _computeTooltipArea(info, anchorArea, tooltipDiv){
			var documentElement = tooltipDiv.ownerDocument.documentElement;
			
			// TODO This padding must match what is in tooltip.css
			var padding = 16;
			
			// Callers can specify the exact placement of the tooltip
			if (info.tooltipArea && info.tooltipArea.top && info.tooltipArea.left && info.tooltipArea.height && info.tooltipArea.width){										 
				tooltipDiv.style.overflowY = "auto"; //$NON-NLS-0$ // If caller specifies a height, allow scrolling
				tooltipDiv.style.resize = "none"; //$NON-NLS-0$
				tooltipDiv.style.top = (info.tooltipArea.top) + "px"; //$NON-NLS-0$
				tooltipDiv.style.left = (info.tooltipArea.left) + "px"; //$NON-NLS-0$
				tooltipDiv.style.height = (info.tooltipArea.height - padding) + "px"; //$NON-NLS-0$
				tooltipDiv.style.width = (info.tooltipArea.width - padding) + "px"; //$NON-NLS-0$
				return info.tooltipArea;
			}
			
			var divBounds = tooltipDiv.getBoundingClientRect();
			var tipRect = {
				width: divBounds.width,
				height: divBounds.height
			};
			
			// If there is an unloaded image its width will not be included in the calculated size, add some buffer space so tooltip doesn't wrap (See bug 478357)
			var image = tooltipDiv.getElementsByTagName('img')[0]; //$NON-NLS-1$
			if (image && !image.complete && image.width === 0){
				tipRect.width += 30;
			}
			
			var position = info.position ? info.position : "below"; //$NON-NLS-0$
			
			var viewBounds = (this._view._rootDiv ? this._view._rootDiv : documentElement).getBoundingClientRect();
			var viewportLeft = viewBounds.left;
			var viewportTop = viewBounds.top;
			var viewportWidth = viewBounds.width;
			var viewportHeight = viewBounds.height;
			
			// Set a default size for the tooltip
			var defWidth = viewportWidth;
			var defHeight = viewportHeight;
			if (!info.allowFullWidth){
				defWidth = Math.min(viewportWidth/2, 600);
				defHeight = Math.min(viewportHeight/2, 400);
				tipRect.width = Math.min(tipRect.width, defWidth);
				tipRect.height = Math.min(tipRect.height, defHeight);
			} else if (tipRect.width > viewportWidth){
				tipRect.width = viewportWidth;
			}
			
			// Now that we have our width recalculate the desired height...
			tooltipDiv.style.width = (tipRect.width - padding) + "px"; //$NON-NLS-1$
			tipRect.height = Math.min(tooltipDiv.clientHeight, defHeight);
			
			// If there will be Y overflow, increase width to fit the scrollbar
			if (tooltipDiv.clientHeight > defHeight){
				var contentWidth = this._tooltipContents.offsetWidth;
				tooltipDiv.style.overflowY = "scroll";
				var scrollWidth = contentWidth - this._tooltipContents.offsetWidth;
				if (scrollWidth > 0){
					tipRect.width += scrollWidth;
					if (tipRect.width > viewportWidth){
						tipRect.width = viewportWidth;
					}
				}
				tooltipDiv.style.overflowY = null;
			}
			
			// Hack for single line tooltips that wrap, set a minimum height to make them show 2 lines without scrolling
			// The largest line height was MacOS Chrome with 20px+padding.  So 25 is the minimum height we are sure we are one two lines
			// Similarly, the minimum height for the tooltip is two lines (20px x 2 + padding) (this will actually show three lines on Win7 Chrome)
			if ((25+padding) > tipRect.height && tipRect.width > (defWidth-padding)){
				tipRect.height = 40+padding;
			}

			var spaceBelow = viewportHeight - (anchorArea.top + anchorArea.height - viewportTop);
			var spaceAbove = anchorArea.top - viewportTop;
			var spaceRight = viewportWidth - (anchorArea.left + anchorArea.width - viewportLeft);
			
			// If there is not enough space above or below, swap the position.  Can't do the same for right/left because rulers are at client bounds
			if (position === "above" && tipRect.height > spaceAbove && tipRect.height <= spaceBelow){
				position = "below"; //$NON-NLS-0$
			} else if (position === "below" && tipRect.height > spaceBelow && tipRect.height <= spaceAbove){
				position = "above"; //$NON-NLS-0$
			}
			
			var offsetX = info.tooltipOffsetX ? info.tooltipOffsetX : 0;
			var offsetY = info.tooltipOffsetY ? info.tooltipOffsetY : 0;
			
			// Attempt to line up tooltip with the anchor area
			// If not enough space, shift the tooltip horiz (above/below) or vert (left/right) until it fits
			// Force the tooltip to start within the viewport area
			// Set maximum sizes for remaining area in the viewport area
			switch (position){
				case "left":
					if ((tipRect.height + offsetY) > (spaceBelow + anchorArea.height)){
						// Shift the top of the tooltip upwards to fit, ignore the offset value
						tipRect.top = viewportHeight + viewportTop - tipRect.height;
					} else {
						tipRect.top = anchorArea.top + offsetY;
					}
					tipRect.top = Math.max(tipRect.top, viewportTop);
					tipRect.left = Math.max(anchorArea.left - tipRect.width + offsetX, viewportLeft);
				break;
				case "right":
					if ((tipRect.height + offsetY) > (spaceBelow + anchorArea.height)){
						// Shift the top of the tooltip upwards to fit, ignore the offset value
						tipRect.top = viewportHeight + viewportTop - tipRect.height;
					} else {
						tipRect.top = anchorArea.top + offsetY;
					}
					tipRect.top = Math.max(tipRect.top, viewportTop);
					tipRect.left = Math.max(anchorArea.left + anchorArea.width + offsetX, viewportLeft);
				break;
				case "above":
					if ((tipRect.width + offsetX) > (spaceRight + anchorArea.width)){
						// Shift the left side of the tooltip to the left, ignore the offset value
						tipRect.left = viewportWidth + viewportLeft - tipRect.width;
					} else {
						tipRect.left = anchorArea.left + offsetX;
					}
					tipRect.left = Math.max(tipRect.left, viewportLeft);
					tipRect.top = Math.max(anchorArea.top - tipRect.height + offsetY, viewportTop);
				break;
				case "below":
					if ((tipRect.width + offsetX) > (spaceRight + anchorArea.width)){
						// Shift the left side of the tooltip to the left, ignore the offset value
						tipRect.left = viewportWidth + viewportLeft - tipRect.width;
					} else {
						tipRect.left = anchorArea.left + offsetX;
					}
					tipRect.left = Math.max(tipRect.left, viewportLeft);
					tipRect.top = Math.max(anchorArea.top + anchorArea.height + offsetY, viewportTop);
				break;
			}
			
			tipRect.maxWidth = Math.min(viewportWidth + viewportLeft - tipRect.left, viewportWidth);
			tipRect.maxHeight = Math.min(viewportHeight + viewportTop - tipRect.top, viewportHeight);
			
			// Adjust sizes for div padding, but not the actual tooltip box.
			tooltipDiv.style.maxWidth = (tipRect.maxWidth - padding) + "px"; //$NON-NLS-0$
			tooltipDiv.style.maxHeight = (tipRect.maxHeight - padding) + "px"; //$NON-NLS-0$
			tooltipDiv.style.width = (tipRect.width - padding) + "px"; //$NON-NLS-1$
			tooltipDiv.style.height = (tipRect.height - padding) + "px"; //$NON-NLS-1$
			tooltipDiv.style.left = tipRect.left + "px"; //$NON-NLS-0$
			tooltipDiv.style.top = tipRect.top + "px"; //$NON-NLS-0$
			return tipRect;
		},
		
		_computeOuterArea: function _computeOuterArea(anchorArea, tooltipArea){
			var left = Math.min(anchorArea.left, tooltipArea.left);
			var top = Math.min(anchorArea.top, tooltipArea.top);
			var positionRight = anchorArea.left + anchorArea.width;
			var tipRight = tooltipArea.left + tooltipArea.width;
			var right = Math.max(positionRight, tipRight);
			var positionBottom = anchorArea.top + anchorArea.height;
			var tipBottom = tooltipArea.top + tooltipArea.height;
			var bottom = Math.max(positionBottom, tipBottom);
				
			return {
					left: left,
					top : top,
					width: right - left,
					height: bottom - top
				};
		},
		
		/*
		 ******************************************************************************************************************* 
		 * Utility: This section contains various utility methods
		 ******************************************************************************************************************* 
		 */
		_hasFocus: function() {
			var tooltipDiv = this._tooltipDiv;
			if (!tooltipDiv) { return false; }
			return textUtil.contains(tooltipDiv, tooltipDiv.ownerDocument.activeElement);
		},
		_isNode: function (obj) {
			return typeof Node === "object" ? obj instanceof Node :
				obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string";
		},
		_setInitialFocus: function(tooltipDiv) {
			// Any buttons ?
			var button = lib.$("button", tooltipDiv); //$NON-NLS-0$
			if (button) {
				button.focus();
				return;
			}
			// Any links ?
			var link = lib.$("a", tooltipDiv); //$NON-NLS-0$
			if (link) {
				link.focus();
				var self = this;
				link.addEventListener("click", function() {
					self.hide();
				});
				return;
			}
			// Give up and focus on the first tabbable
			var toFocus = lib.firstTabbable(tooltipDiv);
			if (toFocus) {
				toFocus.focus();
			}
		},
		_isInRect: function(rect, x, y) {
			if (!rect){
				return false;
			}
			var xOK = x >= rect.left && x <= (rect.left + rect.width);
			var yOK = y >= rect.top && y <= (rect.top + rect.height);
			return xOK && yOK;
		},
		mapOffset: function(offset) {
			var textView = this._view;
			var model = textView.getModel();
			if (model.getBaseModel) {
				offset = model.mapOffset(offset, true);
			}
			return offset;
		},
		/**
		 * Note that the offsets passed here must already be mapped to the base model being displayed (i.e. reduced by collapsed comments)
		 */
		_computeRectangleFromOffset: function(start, end) {
			var tv = this._view;
			var curLine = tv.getLineAtOffset(start);
			var endLine = tv.getLineAtOffset(end);
			
			var height, viewRect;
			
			if (curLine !== endLine) {
				var y = tv.getLocationAtOffset(start).y;
				height = 0;
				var maxX = 0;
				while (curLine <= endLine){
					height += tv.getLineHeight(curLine);
					var lineEnd = tv.getModel().getLineEnd(curLine);
					var possibleEnd = tv.getLocationAtOffset(lineEnd).x;
					if (possibleEnd > end){
						maxX = possibleEnd;
					}
					curLine++;
				}
				var lineStart = tv.getModel().getLineStart(endLine);
				var x = tv.getLocationAtOffset(lineStart).x;
				
				viewRect = { x: x, y: y, width: maxX - x, height: height};
				
			} else {
				var startPos = tv.getLocationAtOffset(start);
				var endPos = tv.getLocationAtOffset(end);
				height = tv.getLineHeight(curLine);
				viewRect = { x: startPos.x, y: startPos.y, 
							width: endPos.x - startPos.x, height: height};
			}
								
			viewRect = this._view.convert(viewRect, "document", "page"); //$NON-NLS-1$ //$NON-NLS-2$
			return {left: viewRect.x, top: viewRect.y, width: viewRect.width, height: viewRect.height};
		},
		/*
		 ******************************************************************************************************************* 
		 * Rendering: This section deals with rendering supplied data into HTML for inclusion into the Info Popup.
		 ******************************************************************************************************************* 
		 */
		_renderPluginContent: function(contentsDiv, data) {
			var document = this._tooltipDiv.ownerDocument;
			// data object should be an object containing the type and content.  If no type or unknown type, default to string.
			if (typeof data !== 'string' && typeof data.content === 'undefined') {
			    return false;
			}
			
			var sectionDiv = util.createElement(document, "div"); //$NON-NLS-0$;
			// render the title, if any
			if (data.title) {
				var titleDiv = util.createElement(document, "div"); //$NON-NLS-0$;
				if (this.hover.renderMarkDown) {
					titleDiv.innerHTML = this.hover.renderMarkDown(data.title);
				} else {
					titleDiv.textContent = data.title;
				}
				titleDiv.classList.add("hoverTooltipTitle"); //$NON-NLS-0$
				sectionDiv.appendChild(titleDiv);
			}
			var contentDiv = util.createElement(document, "div"); //$NON-NLS-0$
			
			if (typeof data === 'string'){
				contentDiv.appendChild(document.createTextNode(data));
			} else {
				switch(data.type) {
					case 'delegatedUI': {
						// The delegated UI is not included in the 8.0 release, see Bug 449240.
					}
					case 'html': {
						if (data.content){
							var iframe = document.createElement("iframe");
							iframe.id = 'HtmlHover'; //$NON-NLS-0$
							iframe.name = 'HTML Hover'; //$NON-NLS-0$
							iframe.type = "text/html"; //$NON-NLS-0$
							iframe.sandbox = "allow-scripts allow-same-origin allow-forms"; //$NON-NLS-0$
							iframe.style.border = "none"; //$NON-NLS-0$
							iframe.style.width = "100%"; //$NON-NLS-0$
							iframe.style.height = "100%"; //$NON-NLS-0$
							iframe.style.overflow = "auto";  //$NON-NLS-1$
							// TODO The iframe computed height is always 3px smaller than the tooltip, giving the impression of inconsistent padding
							this._tooltipDiv.style.paddingBottom = "5px";  //$NON-NLS-0$
							iframe.srcdoc = data.content;
							if (data.width) {
								iframe.style.width = data.width;
							}
							if (data.height) {
								iframe.style.height = data.height;
							}
							sectionDiv.style.height = '100%';  //$NON-NLS-0$ // Height should grow on resize
							contentsDiv.style.height = '100%';  //$NON-NLS-0$
							sectionDiv.appendChild(iframe);
						}
						break;
					}
					case 'markdown': {
						if (this.hover.renderMarkDown) {
							contentDiv.innerHTML = this.hover.renderMarkDown(data.content);
						}
						break;
					}
					default: {
						contentDiv.appendChild(document.createTextNode(data.content));
					}
				}
			}
			sectionDiv.appendChild(contentDiv);
			contentsDiv.appendChild(sectionDiv);
			return true;
		},
		/*
		 * Empty or empty array = call hover service for dynamic content
		 * Array = annotations
		 * String = HTML text
		 * Node = HTML node
		 * ProjectionTextModel = code projection
		 */
		_renderImmediateInfo: function _renderImmediateInfo(contentsDiv, contents, context) {						
			// If it's an annotation then process the annotation(s) to get the actual data
			if (contents instanceof Array) {
				contents = this._getAnnotationContents(contents, context);			
				if (!contents) {
					return false;
				}
			}
			
			if (typeof contents === "string") {
				contentsDiv.textContent = contents;
				return true;
			} else if (this._isNode(contents)) {
				contentsDiv.appendChild(contents);
				return true;
			} else if (contents instanceof mProjectionTextModel.ProjectionTextModel) {
				var view = this._view;
				var options = view.getOptions();
				options.wrapMode = false;
				options.parent = contentsDiv;
				var tooltipTheme = "tooltipTheme"; //$NON-NLS-0$
				var theme = options.themeClass;
				if (theme) {
					theme = theme.replace(tooltipTheme, "");
					if (theme) { theme = " " + theme; } //$NON-NLS-0$
					theme = tooltipTheme + theme;
				} else {
					theme = tooltipTheme;
				}
				options.themeClass = theme;
				var contentsView = this._contentsView = new mTextView.TextView(options);
				//TODO need to find a better way of sharing the styler for multiple views
				var listener = {
					onLineStyle: function(e) {
						view.onLineStyle(e);
					}
				};
				contentsView.addEventListener("LineStyle", listener.onLineStyle);
				contentsView.setModel(contents);
				
				// TODO This is a hack to compute the projection size we will have in the tooltip, we remove the child after computing
				this._tooltipDiv.appendChild(contentsDiv);
				// Use the editor colors with a simple border
				this._tooltipDiv.classList.add("textviewTooltipCodeProjection"); //$NON-NLS-0$
				var size = contentsView.computeSize();
				// Adjust the size for the padding
				contentsDiv.style.width = (size.width+16) + "px"; //$NON-NLS-0$
				contentsDiv.style.height = (size.height+16) + "px"; //$NON-NLS-0$
				contentsView.resize();
				this._tooltipDiv.removeChild(contentsDiv);
				return true;
			}
			return false;
		},
		
		/**
		 * @name _getAnnotationContents
		 * @description Takes a list of annotation and renders them in the tooltip
		 * @function
		 * @private
		 * @param annotations the list of annotations to render
		 * @param context optional object containing where the annotations are displayed (ruler, editor, etc.)
		 * @returns returns document node containing rendered tooltip content
		 */
		_getAnnotationContents: function(annotations, context) {
			var self = this;
			var inEditor = self.hover ? true : false;
			if (inEditor && context && context.source && context.source.indexOf('ruler') >= 0 && annotations.length > 1){ //$NON-NLS-0$
				inEditor = false;
			}
			
			var annotation;
			var newAnnotations = [];
			for (var j = 0; j < annotations.length; j++) {
				annotation = annotations[j];
				if (annotation.title !== "" && !annotation.groupAnnotation) {
					// Don't display untitled annotations in the editor such as occurrences as the code is already visible
					if (!inEditor || annotation.title || annotation.type === "orion.annotation.folding"){
						newAnnotations.push(annotation); 
					}
				}
			}
			annotations = newAnnotations;
			if (annotations.length === 0) {
				return null;
			}
			
			
			var html;
			var document = this._tooltipDiv.ownerDocument;
			var view = this._view;
			var model = view.getModel();
			var baseModel = model.getBaseModel ? model.getBaseModel() : model;
			
			// If this is a code folding annotation, display code projection
			if (annotations.length === 1 && annotations[0].type === "orion.annotation.folding") {
				var newModel = new mProjectionTextModel.ProjectionTextModel(baseModel);
				var lineStart = baseModel.getLineStart(baseModel.getLineAtOffset(annotations[0].start));
				var charCount = baseModel.getCharCount();
				if (annotations[0].end !== charCount) {
					newModel.addProjection({start: annotations[0].end, end: charCount});
				}
				if (lineStart > 0) {
					newModel.addProjection({start: 0, end: lineStart});
				}
				return newModel;
			}
			
			var allAnnotations;
			if (annotations.length > 0 && this._editor){
				allAnnotations = this._editor.getAnnotationModel().getAnnotations();
			}
			if (annotations.length === 1) {
				html = getAnnotationHTML(annotations[0], allAnnotations, inEditor);
				if (html && html.firstChild) {
					var className = html.firstChild.className;
					if (className) { className += " "; } //$NON-NLS-0$
					className += "single"; //$NON-NLS-0$
					html.firstChild.className = className;
				}
				return html;
			} else {
				var tooltipHTML = util.createElement(document, "div"); //$NON-NLS-0$
				var em = util.createElement(document, "multi_anno"); //$NON-NLS-0$
				em.appendChild(document.createTextNode(messages.multipleAnnotations));
				tooltipHTML.appendChild(em);
				for (var i = 0; i < annotations.length; i++) {
					html = getAnnotationHTML(annotations[i], allAnnotations, inEditor);
					if (html) {
						tooltipHTML.appendChild(html);
					}
				}
				return tooltipHTML;
			}
			
			function getAnnotationHTML(annotation, allAnnotations, inEditor) {
				var title = annotation.title;
				var result = util.createElement(document, "div"); //$NON-NLS-0$
				result.className = "tooltipRow"; //$NON-NLS-0$
				if (annotation.html) {
					var htmlHolder = util.createElement(document, "div"); //$NON-NLS-0$
					htmlHolder.className = "tooltipImage"; //$NON-NLS-0$
					htmlHolder.innerHTML = annotation.html;
					if (htmlHolder.lastChild) {
						textUtil.addEventListener(htmlHolder.lastChild, "click", function() {
							var start = annotation.start, end = annotation.end;
							if (model.getBaseModel) {
								start = model.mapOffset(start, true);
								end = model.mapOffset(end, true);
							}
							view.setSelection(start, end, 1 / 3, function() { self.hide(); });
						}, false);
					}
					result.appendChild(htmlHolder);
				}
				if (!title) {
					var textStart = baseModel.getLineStart(baseModel.getLineAtOffset(annotation.start));
					var textEnd = baseModel.getLineEnd(baseModel.getLineAtOffset(annotation.end), true);
					title = baseModel.getText(textStart, textEnd);
				}
				if (typeof title === "function") {
					title = annotation.title();
				}
				if (typeof title === "string") {
					var span = util.createElement(document, "span"); //$NON-NLS-0$
					span.className = "tooltipTitle"; //$NON-NLS-0$
					span.appendChild(document.createTextNode(title));
					title = span;
				}
				result.appendChild(title);
				
				// Handle quick fixes
				if (inEditor) {
					self.hover.renderQuickFixes(annotation, allAnnotations, result, function(){ self.hide(true)});
				}
				if (context){	
					// Set the hover area to the annotation if it's not already set
					context.offsetStart = annotation.start;
					context.offsetEnd = annotation.end;
				}
				return result;
			}
		}
		
	};
	return {Tooltip: Tooltip};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/annotations", ['i18n!orion/editor/nls/messages', 'orion/editor/eventTarget'], function(messages, mEventTarget) { //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	
	/**
	 * @class This object represents a regitry of annotation types.
	 * @name orion.editor.AnnotationType
	 */
	function AnnotationType() {
	}
	
	/**
	 * @class This object represents a decoration attached to a range of text. Annotations are added to a
	 * <code>AnnotationModel</code> which is attached to a <code>TextModel</code>.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.AnnotationModel}<br/>
	 * {@link orion.editor.Ruler}<br/>
	 * </p>
	 * @name orion.editor.Annotation
	 *
	 * @property {String} type The annotation type (for example, orion.annotation.error).
	 * @property {Number} start The start offset of the annotation in the text model.
	 * @property {Number} end The end offset of the annotation in the text model.
	 * @property {String} html The HTML displayed for the annotation.
	 * @property {String} title The text description for the annotation.
	 * @property {orion.editor.Style} style The style information for the annotation used in the annotations ruler and tooltips.
	 * @property {orion.editor.Style} overviewStyle The style information for the annotation used in the overview ruler.
	 * @property {orion.editor.Style} rangeStyle The style information for the annotation used in the text view to decorate a range of text.
	 * @property {orion.editor.Style} lineStyle The style information for the annotation used in the text view to decorate a line of text.
	 */
	/**
	 * Constructs a new folding annotation.
	 *
	 * @param {Number} start The start offset of the annotation in the text model.
	 * @param {Number} end The end offset of the annotation in the text model.
	 * @param {orion.editor.ProjectionTextModel} projectionModel The projection text model.
	 *
	 * @class This object represents a folding annotation.
	 * @name orion.editor.FoldingAnnotation
	 */
	function FoldingAnnotation (start, end, projectionModel) {
		this.start = start;
		this.end = end;
		this._projectionModel = projectionModel;
		this.html = this._expandedHTML;
		this.style = this._expandedStyle;
		this.expanded = true;
	}

	FoldingAnnotation.prototype = /** @lends orion.editor.FoldingAnnotation.prototype */ {
		_expandedHTML: "<div class='annotationHTML expanded'></div>", //$NON-NLS-0$
		_expandedStyle: {styleClass: "annotation expanded"}, //$NON-NLS-0$
		_collapsedHTML: "<div class='annotationHTML collapsed'></div>", //$NON-NLS-0$
		_collapsedStyle: {styleClass: "annotation collapsed"}, //$NON-NLS-0$
		_collapse: function() {
			if (!this.expanded) { return false; }
			this.expanded = false;
			this.html = this._collapsedHTML;
			this.style = this._collapsedStyle;
			if (this._annotationModel) {
				this._annotationModel.modifyAnnotation(this);
			}
			return true;
		},
		_expand: function() {
			if (this.expanded) { return false; }
			this.expanded = true;
			this.html = this._expandedHTML;
			this.style = this._expandedStyle;
			if (this._annotationModel) {
				this._annotationModel.modifyAnnotation(this);
			}
			return true;
		},
		_collapseImpl: function (checkOverlaping) {
			if (this._collapse()) {
				if (checkOverlaping) {
					this._forEachOverlaping(function(annotation) {
						if (!annotation.expanded) {
							annotation._expandImpl(false);
							annotation._recollapse = true;
						}
					});
				}
				var projectionModel = this._projectionModel;
				var baseModel = projectionModel.getBaseModel();
				this._projection = {
					annotation: this,
					start: baseModel.getLineStart(baseModel.getLineAtOffset(this.start) + 1),
					end: baseModel.getLineEnd(baseModel.getLineAtOffset(this.end), true)
				};
				projectionModel.addProjection(this._projection);
			}
		},
		_expandImpl: function(checkOverlaping) {
			if (this._expand()) {
				this._projectionModel._removeProjection(this._projection, !this._annotationModel);
				if (checkOverlaping) {
					this._forEachOverlaping(function(annotation) {
						if (annotation._recollapse) {
							annotation._collapseImpl(false);
							annotation._recollapse = false;
						}
					});
				}
			}
		},
		_forEachOverlaping: function(callback) {
			if (!this._annotationModel) { return; }
			var annotations = this._annotationModel.getAnnotations(this.start, this.end);
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (annotation !== this && annotation.type === AnnotationType.ANNOTATION_FOLDING) {
					callback.call(this, annotation);
				}
			}
		},
		/**
		 * Collapses the annotation.
		 */
		collapse: function () {
			this._recollapse = false;
			this._collapseImpl(true);
		},
		/**
		 * Expands the annotation.
		 */
		expand: function () {
			this._recollapse = false;
			this._expandImpl(true);
		}
	};
	 
	/**
	 * Error annotation type.
	 */
	AnnotationType.ANNOTATION_ERROR = "orion.annotation.error"; //$NON-NLS-0$
	/**
	 * Warning annotation type.
	 */
	AnnotationType.ANNOTATION_WARNING = "orion.annotation.warning"; //$NON-NLS-0$
	/**
	 * Info annotation type.
	 * @since 14.0
	 */
	AnnotationType.ANNOTATION_INFO = "orion.annotation.info"; //$NON-NLS-0$
	/**
	 * Task annotation type.
	 */
	AnnotationType.ANNOTATION_TASK = "orion.annotation.task"; //$NON-NLS-0$
	/**
	 * Breakpoint annotation type.
	 */
	AnnotationType.ANNOTATION_BREAKPOINT = "orion.annotation.breakpoint"; //$NON-NLS-0$
	/**
	 * Bookmark annotation type.
	 */
	AnnotationType.ANNOTATION_BOOKMARK = "orion.annotation.bookmark"; //$NON-NLS-0$
	/**
	 * Folding annotation type.
	 */
	AnnotationType.ANNOTATION_FOLDING = "orion.annotation.folding"; //$NON-NLS-0$
	/**
	 * Curent bracket annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_BRACKET = "orion.annotation.currentBracket"; //$NON-NLS-0$
	/**
	 * Matching bracket annotation type.
	 */
	AnnotationType.ANNOTATION_MATCHING_BRACKET = "orion.annotation.matchingBracket"; //$NON-NLS-0$
	/**
	 * Current line annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_LINE = "orion.annotation.currentLine"; //$NON-NLS-0$
	/**
	 * Current search annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_SEARCH = "orion.annotation.currentSearch"; //$NON-NLS-0$
	/**
	 * Matching search annotation type.
	 */
	AnnotationType.ANNOTATION_MATCHING_SEARCH = "orion.annotation.matchingSearch"; //$NON-NLS-0$
	/**
	 * Search range annotation type.
	 */
	AnnotationType.ANNOTATION_SEARCH_RANGE = "orion.annotation.searchRange"; //$NON-NLS-0$
	/**
	 * Read Occurrence annotation type.
	 */
	AnnotationType.ANNOTATION_READ_OCCURRENCE = "orion.annotation.readOccurrence"; //$NON-NLS-0$
	/**
	 * Write Occurrence annotation type.
	 */
	AnnotationType.ANNOTATION_WRITE_OCCURRENCE = "orion.annotation.writeOccurrence"; //$NON-NLS-0$
	/**
	 * Selected linked group annotation type.
	 */
	AnnotationType.ANNOTATION_SELECTED_LINKED_GROUP = "orion.annotation.selectedLinkedGroup"; //$NON-NLS-0$
	/**
	 * Current linked group annotation type.
	 */
	AnnotationType.ANNOTATION_CURRENT_LINKED_GROUP = "orion.annotation.currentLinkedGroup"; //$NON-NLS-0$
	/**
	 * Linked group annotation type.
	 */
	AnnotationType.ANNOTATION_LINKED_GROUP = "orion.annotation.linkedGroup"; //$NON-NLS-0$
	/**
	* Blame annotation type.
	*/
	AnnotationType.ANNOTATION_BLAME = "orion.annotation.blame"; //$NON-NLS-0$
	/**
	* Current Blame annotation type.
	*/
	AnnotationType.ANNOTATION_CURRENT_BLAME = "orion.annotation.currentBlame"; //$NON-NLS-0$
	/**
	 * Diff Added annotation type.
	 */
	AnnotationType.ANNOTATION_DIFF_ADDED = "orion.annotation.diffAdded"; //$NON-NLS-0$
	/**
	 * Diff Deleted annotation type.
	 */
	AnnotationType.ANNOTATION_DIFF_DELETED = "orion.annotation.diffDeleted"; //$NON-NLS-0$
	/**
	 * Diff Modification annotation type.
	 */
	AnnotationType.ANNOTATION_DIFF_MODIFIED = "orion.annotation.diffModified"; //$NON-NLS-0$

	/** @private */
	var annotationTypes = {};

	/**
	 * Register an annotation type.
	 *
	 * @param {String} type The annotation type (for example, orion.annotation.error).
	 * @param {Object|Function} properties The common annotation properties of the registered
	 *		annotation type. All annotations create with this annotation type will expose these
	 *		properties.
	 */
	AnnotationType.registerType = function(type, properties) {
		var constructor = properties;
		if (typeof constructor !== "function") { //$NON-NLS-0$
			constructor = function(start, end, title) {
				this.start = start;
				this.end = end;
				if (title !== undefined) { this.title = title; }
			};
			constructor.prototype = properties;
		}
		constructor.prototype.type = type;
		annotationTypes[type] = constructor;
		return type;
	};

	/**
	 * Creates an annotation of a given type with the specified start end end offsets.
	 *
	 * @param {String} type The annotation type (for example, orion.annotation.error).
	 * @param {Number} start The start offset of the annotation in the text model.
	 * @param {Number} end The end offset of the annotation in the text model.
	 * @param {String} [title] The text description for the annotation if different then the type description.
	 * @return {orion.editor.Annotation} the new annotation
	 */
	AnnotationType.createAnnotation = function(type, start, end, title) {
		return new (this.getType(type))(start, end, title);
	};

	/**
	 * Gets the registered annotation type with specified type. The returned
	 * value is a constructor that can be used to create annotations of the
	 * speficied type.  The constructor takes the start and end offsets of
	 * the annotation.
	 *
	 * @param {String} type The annotation type (for example, orion.annotation.error).
	 * @return {Function} The annotation type constructor ( i.e function(start, end, title) ).
	 */
	AnnotationType.getType = function(type) {
		return annotationTypes[type];
	};

	/** @private */
	function registerType(type, lineStyling) {
		var index = type.lastIndexOf('.'); //$NON-NLS-0$
		var suffix = type.substring(index + 1);
		var properties = {
			title: messages[suffix],
			style: {styleClass: "annotation " + suffix}, //$NON-NLS-0$
			html: "<div class='annotationHTML " + suffix + "'></div>", //$NON-NLS-1$ //$NON-NLS-0$
			overviewStyle: {styleClass: "annotationOverview " + suffix} //$NON-NLS-0$
		};
		if (lineStyling) {
			properties.lineStyle = {styleClass: "annotationLine " + suffix}; //$NON-NLS-0$
		} else {
			properties.rangeStyle = {styleClass: "annotationRange " + suffix}; //$NON-NLS-0$
		}
		AnnotationType.registerType(type, properties);
	}
	registerType(AnnotationType.ANNOTATION_ERROR);
	registerType(AnnotationType.ANNOTATION_WARNING);
	registerType(AnnotationType.ANNOTATION_INFO);
	registerType(AnnotationType.ANNOTATION_TASK);
	registerType(AnnotationType.ANNOTATION_BREAKPOINT);
	registerType(AnnotationType.ANNOTATION_BOOKMARK);
	registerType(AnnotationType.ANNOTATION_CURRENT_BRACKET);
	registerType(AnnotationType.ANNOTATION_MATCHING_BRACKET);
	registerType(AnnotationType.ANNOTATION_CURRENT_SEARCH);
	registerType(AnnotationType.ANNOTATION_MATCHING_SEARCH);
	registerType(AnnotationType.ANNOTATION_SEARCH_RANGE, true);
	registerType(AnnotationType.ANNOTATION_READ_OCCURRENCE);
	registerType(AnnotationType.ANNOTATION_WRITE_OCCURRENCE);
	registerType(AnnotationType.ANNOTATION_SELECTED_LINKED_GROUP);
	registerType(AnnotationType.ANNOTATION_CURRENT_LINKED_GROUP);
	registerType(AnnotationType.ANNOTATION_LINKED_GROUP);
	registerType(AnnotationType.ANNOTATION_CURRENT_LINE, true);
	registerType(AnnotationType.ANNOTATION_BLAME, true);
	registerType(AnnotationType.ANNOTATION_CURRENT_BLAME, true);
	registerType(AnnotationType.ANNOTATION_DIFF_ADDED);
	registerType(AnnotationType.ANNOTATION_DIFF_DELETED);
	registerType(AnnotationType.ANNOTATION_DIFF_MODIFIED);

	AnnotationType.registerType(AnnotationType.ANNOTATION_FOLDING, FoldingAnnotation);

	/**
	 * Constructs a new AnnotationTypeList object.
	 *
	 * @class This represents an interface of prioritized annotation types.
	 * @name orion.editor.AnnotationTypeList
	 */
	function AnnotationTypeList () {
	}
	/**
	 * Adds in the annotation type interface into the specified object.
	 *
	 * @param {Object} object The object to add in the annotation type interface.
	 */
	AnnotationTypeList.addMixin = function(object) {
		var proto = AnnotationTypeList.prototype;
		for (var p in proto) {
			if (proto.hasOwnProperty(p)) {
				object[p] = proto[p];
			}
		}
	};
	AnnotationTypeList.prototype = /** @lends orion.editor.AnnotationTypeList.prototype */ {
		/**
		 * Adds an annotation type to the receiver.
		 * <p>
		 * Only annotations of the specified types will be shown by
		 * the receiver.
		 * </p>
		 * <p>
		 * If the priority is not specified, the annotation type will be added
		 * to the end of the receiver's list (lowest pririoty).
		 * </p>
		 *
		 * @param {Object} type the annotation type to be shown
		 * @param {Number} priority the priority for the annotation type
		 * 
		 * @see orion.editor.AnnotationTypeList#removeAnnotationType
		 * @see orion.editor.AnnotationTypeList#isAnnotationTypeVisible
		 * @see orion.editor.AnnotationTypeList#getAnnotationTypePriority
		 */
		addAnnotationType: function(type, priority) {
			if (!this._annotationTypes) { this._annotationTypes = []; }
			var index = priority - 1;
			if (priority == undefined || !(0 <= index && index < this._annotationTypes.length)) {
				this._annotationTypes.push(type);
			} else {
				this._annotationTypes.splice(index, 0, type);
			}
		},
		/**
		 * Gets the annotation type priority.  The priority is determined by the
		 * order the annotation type is added to the receiver.  Annotation types
		 * added first have higher priority.
		 * <p>
		 * Returns <code>0</code> if the annotation type is not added.
		 * </p>
		 *
		 * @param {Object} type the annotation type
		 *
		 * @see orion.editor.AnnotationTypeList#addAnnotationType
		 * @see orion.editor.AnnotationTypeList#removeAnnotationType
		 * @see orion.editor.AnnotationTypeList#isAnnotationTypeVisible
		 */
		getAnnotationTypePriority: function(type) {
			if (this._annotationTypes) {
				for (var i = 0; i < this._annotationTypes.length; i++) {
					if (this._annotationTypes[i] === type) {
						return i + 1;
					}
				}
			}
			return 0;
		},
		/**
		 * Returns an array of annotations in the specified annotation model for the given range of text sorted by type.
		 *
		 * @param {orion.editor.AnnotationModel} annotationModel the annotation model.
		 * @param {Number} start the start offset of the range.
		 * @param {Number} end the end offset of the range.
		 * @return {orion.editor.Annotation[]} an annotation array.
		 */
		getAnnotationsByType: function(annotationModel, start, end) {
			var iter = annotationModel.getAnnotations(start, end);
			var annotation, annotations = [];
			while (iter.hasNext()) {
				annotation = iter.next();
				if (!this.isAnnotationTypeVisible(annotation.type)) { continue; }
				annotations.push(annotation);
			}
			var self = this;
			annotations.sort(function(a, b) {
				return self.getAnnotationTypePriority(a.type) - self.getAnnotationTypePriority(b.type);
			});
			return annotations;
		},
		/**
		 * Returns whether the receiver shows annotations of the specified type.
		 *
		 * @param {Object} type the annotation type
		 * @returns {Boolean} whether the specified annotation type is shown
		 *
		 * @see orion.editor.AnnotationTypeList#addAnnotationType
		 * @see orion.editor.AnnotationTypeList#removeAnnotationType
		 */
		isAnnotationTypeVisible: function(type) {
			if (this.getAnnotationTypePriority(type) === 0) return false;
			return !this._visibleAnnotationTypes || this._visibleAnnotationTypes[type] === undefined || this._visibleAnnotationTypes[type] === true;
		},
		/**
		 * Sets whether annotations of the given annotation type are visble. By default
		 * all annotations added to the receiver are visible.
		 * 
		 * @param {Object} type
		 * @param {Boolean} visible
		 * @since 14.0
		 */
		setAnnotationTypeVisible: function(type, visible) {
			if (typeof type === "object") {
				this._visibleAnnotationTypes = type;
			} else {
				if (!this._visibleAnnotationTypes) this._visibleAnnotationTypes = {};
				this._visibleAnnotationTypes[type] = visible;
			}
		},
		/**
		 * Removes an annotation type from the receiver.
		 *
		 * @param {Object} type the annotation type to be removed
		 *
		 * @see orion.editor.AnnotationTypeList#addAnnotationType
		 * @see orion.editor.AnnotationTypeList#isAnnotationTypeVisible
		 */
		removeAnnotationType: function(type) {
			if (!this._annotationTypes) { return; }
			for (var i = 0; i < this._annotationTypes.length; i++) {
				if (this._annotationTypes[i] === type) {
					this._annotationTypes.splice(i, 1);
					break;
				}
			}
		}
	};
	
	/** @private */
	function binarySearch(array, offset, inclusive, low, high) {
		var index;
		if (low === undefined) { low = -1; }
		if (high === undefined) { high = array.length; }
		while (high - low > 1) {
			index = Math.floor((high + low) / 2);
			if (offset <= array[index].start) {
				high = index;
			} else if (inclusive && offset < array[index].end) {
				high = index;
				break;
			} else {
				low = index;
			}
		}
		return high;
	}
	
	/**
	 * Constructs an annotation model.
	 * 
	 * @param {orion.editor.TextModel} textModel The text model.
	 * 
	 * @class This object manages annotations for a <code>TextModel</code>.
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.Annotation}<br/>
	 * {@link orion.editor.TextModel}<br/> 
	 * </p>	
	 * @name orion.editor.AnnotationModel
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function AnnotationModel(textModel) {
		this._annotations = [];
		var self = this;
		this._listener = {
			onChanged: function(modelChangedEvent) {
				self._onChanged(modelChangedEvent);
			}
		};
		this.setTextModel(textModel);
	}

	AnnotationModel.prototype = /** @lends orion.editor.AnnotationModel.prototype */ {
		/**
		 * Adds an annotation to the annotation model.
		 * <p>The annotation model listeners are notified of this change.</p>
		 *
		 * @param {orion.editor.Annotation} annotation the annotation to be added.
		 *
		 * @see orion.editor.AnnotationModel#removeAnnotation
		 */
		addAnnotation: function(annotation) {
			if (!annotation) { return; }
			var annotations = this._annotations;
			var index = binarySearch(annotations, annotation.start);
			annotations.splice(index, 0, annotation);
			annotation._annotationModel = this;
			var e = {
				type: "Changed", //$NON-NLS-0$
				added: [annotation],
				removed: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Returns the text model.
		 *
		 * @return {orion.editor.TextModel} The text model.
		 *
		 * @see orion.editor.AnnotationModel#setTextModel
		 */
		getTextModel: function() {
			return this._model;
		},
		/**
		 * @class This object represents an annotation iterator.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.AnnotationModel#getAnnotations}<br/>
		 * </p>
		 * @name orion.editor.AnnotationIterator
		 *
		 * @property {Function} hasNext Determines whether there are more annotations in the iterator.
		 * @property {Function} next Returns the next annotation in the iterator.
		 */
		/**
		 * Returns an iterator of annotations for the given range of text. If called with no parameters,
		 * returns all annotations in the model.
		 *
		 * @param {Number} start the start offset of the range.
		 * @param {Number} end the end offset of the range.
		 * @return {orion.editor.AnnotationIterator} an annotation iterartor.
		 */
		getAnnotations: function(start, end) {
			var annotations = this._annotations, current;
			var i = 0, skip;
			if (start === undefined && end === undefined) {
				skip = function() {
					return (i < annotations.length) ? annotations[i++] : null;
				};
			} else {
				//TODO binary search does not work for range intersection when there are overlaping ranges, need interval search tree for this
				skip = function() {
					while (i < annotations.length) {
						var a =  annotations[i++];
						if ((start === a.start) || (a.start === a.end && a.end === end) || (start > a.start ? start < a.end : a.start < end)) {
							return a;
						}
						if (a.start >= end) {
							break;
						}
					}
					return null;
				};
			}
			current = skip();
			return {
				next: function() {
					var result = current;
					if (result) { current = skip(); }
					return result;
				},
				hasNext: function() {
					return current !== null;
				}
			};
		},
		/**
		 * Notifies the annotation model that the given annotation has been modified.
		 * <p>The annotation model listeners are notified of this change.</p>
		 *
		 * @param {orion.editor.Annotation} annotation the modified annotation.
		 *
		 * @see orion.editor.AnnotationModel#addAnnotation
		 */
		modifyAnnotation: function(annotation) {
			if (!annotation) { return; }
			var index = this._getAnnotationIndex(annotation);
			if (index < 0) { return; }
			var e = {
				type: "Changed", //$NON-NLS-0$
				added: [],
				removed: [],
				changed: [annotation]
			};
			this.onChanged(e);
		},
		/**
		 * Notifies all listeners that the annotation model has changed.
		 *
		 * @param {orion.editor.Annotation[]} added The list of annotation being added to the model.
		 * @param {orion.editor.Annotation[]} changed The list of annotation modified in the model.
		 * @param {orion.editor.Annotation[]} removed The list of annotation being removed from the model.
		 * @param {ModelChangedEvent} textModelChangedEvent the text model changed event that trigger this change, can be null if the change was trigger by a method call (for example, {@link #addAnnotation}).
		 */
		onChanged: function(e) {
			return this.dispatchEvent(e);
		},
		/**
		 * Removes all annotations of the given <code>type</code>. All annotations
		 * are removed if the type is not specified.
		 * <p>The annotation model listeners are notified of this change.  Only one changed event is generated.</p>
		 *
		 * @param {Object} type the type of annotations to be removed.
		 *
		 * @see orion.editor.AnnotationModel#removeAnnotation
		 */
		removeAnnotations: function(type) {
			var annotations = this._annotations;
			var removed, i;
			if (type) {
				removed = [];
				for (i = annotations.length - 1; i >= 0; i--) {
					var annotation = annotations[i];
					if (annotation.type === type) {
						annotations.splice(i, 1);
						removed.splice(0, 0, annotation);
						annotation._annotationModel = null;
					}
				}
			} else {
				removed = annotations;
				annotations = [];
			}
			var e = {
				type: "Changed", //$NON-NLS-0$
				removed: removed,
				added: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Removes an annotation from the annotation model.
		 * <p>The annotation model listeners are notified of this change.</p>
		 *
		 * @param {orion.editor.Annotation} annotation the annotation to be removed.
		 *
		 * @see orion.editor.AnnotationModel#addAnnotation
		 */
		removeAnnotation: function(annotation) {
			if (!annotation) { return; }
			var index = this._getAnnotationIndex(annotation);
			if (index < 0) { return; }
			annotation._annotationModel = null;
			var e = {
				type: "Changed", //$NON-NLS-0$
				removed: this._annotations.splice(index, 1),
				added: [],
				changed: []
			};
			this.onChanged(e);
		},
		/**
		 * Removes and adds the specifed annotations to the annotation model.
		 * <p>The annotation model listeners are notified of this change.  Only one changed event is generated.</p>
		 *
		 * @param {orion.editor.Annotation} remove the annotations to be removed.
		 * @param {orion.editor.Annotation} add the annotations to be added.
		 *
		 * @see orion.editor.AnnotationModel#addAnnotation
		 * @see orion.editor.AnnotationModel#removeAnnotation
		 */
		replaceAnnotations: function(remove, add) {
			var annotations = this._annotations, i, index, annotation, removed = [];
			if (remove) {
				for (i = remove.length - 1; i >= 0; i--) {
					annotation = remove[i];
					index = this._getAnnotationIndex(annotation);
					if (index < 0) { continue; }
					annotation._annotationModel = null;
					annotations.splice(index, 1);
					removed.splice(0, 0, annotation);
				}
			}
			if (!add) { add = []; }
			for (i = 0; i < add.length; i++) {
				annotation = add[i];
				index = binarySearch(annotations, annotation.start);
				annotation._annotationModel = this;
				annotations.splice(index, 0, annotation);
			}
			var e = {
				type: "Changed", //$NON-NLS-0$
				removed: removed,
				added: add,
				changed: []
			};
			
			this.onChanged(e);
		},
		/**
		 * Sets the text model of the annotation model.  The annotation
		 * model listens for changes in the text model to update and remove
		 * annotations that are affected by the change.
		 *
		 * @param {orion.editor.TextModel} textModel the text model.
		 *
		 * @see orion.editor.AnnotationModel#getTextModel
		 */
		setTextModel: function(textModel) {
			if (this._model) {
				this._model.removeEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
			}
			this._model = textModel;
			if (this._model) {
				this._model.addEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
			}
		},
		/** @ignore */
		_getAnnotationIndex: function(annotation) {
			var annotations = this._annotations;
			var index = binarySearch(annotations, annotation.start);
			while (index < annotations.length && annotations[index].start === annotation.start) {
				if (annotations[index] === annotation) {
					return index;
				}
				index++;
			}
			return -1;
		},
		/** @ignore */
		_onChanged: function(modelChangedEvent) {
			var start = modelChangedEvent.start;
			var addedCharCount = modelChangedEvent.addedCharCount;
			var removedCharCount = modelChangedEvent.removedCharCount;
			var annotations = this._annotations, end = start + removedCharCount;
			//TODO binary search does not work for range intersection when there are overlaping ranges, need interval search tree for this
			var startIndex = 0;
			if (!(0 <= startIndex && startIndex < annotations.length)) { return; }
			var e = {
				type: "Changed", //$NON-NLS-0$
				added: [],
				removed: [],
				changed: [],
				textModelChangedEvent: modelChangedEvent
			};
			var changeCount = addedCharCount - removedCharCount, i;
			for (i = startIndex; i < annotations.length; i++) {
				var annotation = annotations[i];
				if (annotation.start >= end) {
					annotation._oldStart = annotation.start;
					annotation._oldEnd = annotation.end;
					annotation.start += changeCount;
					annotation.end += changeCount;
					e.changed.push(annotation);
				} else if (annotation.end <= start) {
					//nothing
				} else if (annotation.start <= start && end < annotation.end) {//Annotation renderer does not render the last character
					annotation._oldStart = annotation.start;
					annotation._oldEnd = annotation.end;
					annotation.end += changeCount;
					e.changed.push(annotation);
				} else {
					annotations.splice(i, 1);
					e.removed.push(annotation);
					annotation._annotationModel = null;
					if (annotation.expand) {
						annotation.expand();
					}
					i--;
				}
			}
			if (e.added.length > 0 || e.removed.length > 0 || e.changed.length > 0) {
				this.onChanged(e);
			}
		}
	};
	mEventTarget.EventTarget.addMixin(AnnotationModel.prototype);

	/**
	 * Constructs a new styler for annotations.
	 *
	 * @param {orion.editor.TextView} view The styler view.
	 * @param {orion.editor.AnnotationModel} view The styler annotation model.
	 *
	 * @class This object represents a styler for annotation attached to a text view.
	 * @name orion.editor.AnnotationStyler
	 * @borrows orion.editor.AnnotationTypeList#addAnnotationType as #addAnnotationType
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationTypePriority as #getAnnotationTypePriority
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationsByType as #getAnnotationsByType
	 * @borrows orion.editor.AnnotationTypeList#isAnnotationTypeVisible as #isAnnotationTypeVisible
	 * @borrows orion.editor.AnnotationTypeList#removeAnnotationType as #removeAnnotationType
	 */
	function AnnotationStyler (view, annotationModel) {
		this._view = view;
		this._annotationModel = annotationModel;
		var self = this;
		this._listener = {
			onDestroy: function(e) {
				self._onDestroy(e);
			},
			onLineStyle: function(e) {
				self._onLineStyle(e);
			},
			onChanged: function(e) {
				self._onAnnotationModelChanged(e);
			}
		};
		view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
		view.addEventListener("postLineStyle", this._listener.onLineStyle); //$NON-NLS-0$
		annotationModel.addEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
	}
	AnnotationStyler.prototype = /** @lends orion.editor.AnnotationStyler.prototype */ {
		/**
		 * Destroys the styler.
		 * <p>
		 * Removes all listeners added by this styler.
		 * </p>
		 */
		destroy: function() {
			var view = this._view;
			if (view) {
				view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
				view.removeEventListener("LineStyle", this._listener.onLineStyle); //$NON-NLS-0$
				this.view = null;
			}
			var annotationModel = this._annotationModel;
			if (annotationModel) {
				annotationModel.removeEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
				annotationModel = null;
			}
		},
		_mergeStyle: function(result, style) {
			if (style) {
				if (!result) { result = {}; }
				if (result.styleClass && style.styleClass && result.styleClass !== style.styleClass) {
					result.styleClass += " " + style.styleClass; //$NON-NLS-0$
				} else {
					result.styleClass = style.styleClass;
				}
				var prop;
				if (style.tagName) {
					if (!result.tagName) {
						result.tagName = style.tagName;
					}
				}
				if (style.style) {
					if (!result.style) { result.style  = {}; }
					for (prop in style.style) {
						if (!result.style[prop]) {
							result.style[prop] = style.style[prop];
						}
					}
				}
				if (style.attributes) {
					if (!result.attributes) { result.attributes  = {}; }
					for (prop in style.attributes) {
						if (!result.attributes[prop]) {
							result.attributes[prop] = style.attributes[prop];
						}
					}
				}
				if (style.html) {
					result.html = style.html;
				}
				if (style.node) {
					result.node = style.node;
				}			}
			return result;
		},
		_mergeStyleRanges: function(ranges, styleRange) {
			if (!ranges) {
				ranges = [];
			}
			var mergedStyle, i = binarySearch(ranges, styleRange.start, true);
			for (; i<ranges.length && styleRange; i++) {
				var range = ranges[i];
				if (styleRange.end <= range.start) { break; }
				if (styleRange.start >= range.end) { continue; }
				mergedStyle = this._mergeStyle({}, range.style);
				mergedStyle = this._mergeStyle(mergedStyle, styleRange.style);
				var args = [];
				args.push(i, 1);
				if (styleRange.start < range.start) {
					args.push({start: styleRange.start, end: range.start, style: styleRange.style});
				}
				if (styleRange.start > range.start) {
					args.push({start: range.start, end: styleRange.start, style: range.style});
				}
				args.push({start: Math.max(range.start, styleRange.start), end: Math.min(range.end, styleRange.end), style: mergedStyle});
				if (styleRange.end < range.end) {
					args.push({start: styleRange.end, end: range.end, style: range.style});
				}
				if (styleRange.end > range.end) {
					styleRange = {start: range.end, end: styleRange.end, style: styleRange.style};
				} else {
					styleRange = null;
				}
				Array.prototype.splice.apply(ranges, args);
			}
			if (styleRange) {
				mergedStyle = this._mergeStyle({}, styleRange.style);
				ranges.splice(i, 0, {start: styleRange.start, end: styleRange.end, style: mergedStyle});
			}
			return ranges;
		},
		_onAnnotationModelChanged: function(e) {
			var view = this._view;
			if (!view) { return; }
			var self = this;
			var model = view.getModel();
			function redrawRange(start, end) {
				if (model.getBaseModel) {
					start = model.mapOffset(start, true);
					end = model.mapOffset(end, true);
				}
				if (start !== -1 && end !== -1) {
					view.redrawRange(start, end);
				}
			}
			function redraw(changes, changed) {
				for (var i = 0; i < changes.length; i++) {
					if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
					var change = changes[i];
					redrawRange(change.start, change.end);
					if (changed && change._oldStart !== undefined && change._oldEnd) {
						redrawRange(change._oldStart, change._oldEnd);
					}
				}
			}
			redraw(e.added);
			redraw(e.removed);
			redraw(e.changed, true);
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onLineStyle: function (e) {
			var annotationModel = this._annotationModel;
			var viewModel = e.textView.getModel();
			var baseModel = annotationModel.getTextModel();
			var start = e.lineStart;
			var end = e.lineStart + e.lineText.length;
			if (baseModel !== viewModel) {
				start = viewModel.mapOffset(start);
				end = viewModel.mapOffset(end);
			}
			var annotations = annotationModel.getAnnotations(start, end);
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (!this.isAnnotationTypeVisible(annotation.type)) { continue; }
				if (annotation.rangeStyle) {
					var annotationStart = annotation.start;
					var annotationEnd = annotation.end;
					if (baseModel !== viewModel) {
						annotationStart = viewModel.mapOffset(annotationStart, true);
						annotationEnd = viewModel.mapOffset(annotationEnd, true);
					}
					e.ranges = this._mergeStyleRanges(e.ranges, {start: annotationStart, end: annotationEnd, style: annotation.rangeStyle});
				}
				if (annotation.lineStyle) {
					e.style = this._mergeStyle({}, e.style);
					e.style = this._mergeStyle(e.style, annotation.lineStyle);
				}
			}
		}
	};
	AnnotationTypeList.addMixin(AnnotationStyler.prototype);

	return {
		FoldingAnnotation: FoldingAnnotation,
		AnnotationType: AnnotationType,
		AnnotationTypeList: AnnotationTypeList,
		AnnotationModel: AnnotationModel,
		AnnotationStyler: AnnotationStyler
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define('orion/objects',[], function() {
	function mixin(target/*, source..*/) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for (var j = 1, len = arguments.length; j < len; j++) {
			var source = arguments[j];
			for (var key in source) {
				if (hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}
		return target;
	}

	/**
	 * @name orion.objects
	 * @class Object-oriented helpers.
	 */
	return {
		/**
		 * Creates a shallow clone of the given <code>object</code>.
		 * @name orion.objects.clone
		 * @function
		 * @static
		 * @param {Object|Array} object The object to clone. Must be a "normal" Object or Array. Other built-ins,
		 * host objects, primitives, etc, will not work.
		 * @returns {Object|Array} A clone of <code>object</code>.
		 */
		clone: function(object) {
			if (Array.isArray(object)) {
				return Array.prototype.slice.call(object);
			}
			var clone = Object.create(Object.getPrototypeOf(object));
			mixin(clone, object);
			return clone;
		},
		/**
		 * Mixes all <code>source</code>'s own enumerable properties into <code>target</code>. Multiple source objects
		 * can be passed as varargs.
		 * @name orion.objects.mixin
		 * @function
		 * @static
		 * @param {Object} target
		 * @param {Object} source
		 */
		mixin: mixin,
		/**
		 * Wraps an object into an Array if necessary.
		 * @name orion.objects.toArray
		 * @function
		 * @static
		 * @param {Object} obj An object.
		 * @returns {Array} Returns <code>obj</code> unchanged, if <code>obj</code> is an Array. Otherwise returns a 1-element Array
		 * whose sole element is <code>obj</code>.
		 */
		toArray: function(o) {
			return Array.isArray(o) ? o : [o];
		}
	};
});
/*******************************************************************************
 * @license
 * Copyright (c) 2009, 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/editor", [ //$NON-NLS-0$
	'i18n!orion/editor/nls/messages', //$NON-NLS-0$
	'orion/editor/eventTarget', //$NON-NLS-0$
	'orion/editor/tooltip', //$NON-NLS-0$
	'orion/editor/annotations', //$NON-NLS-0$
	'orion/objects', //$NON-NLS-0$
	'orion/editor/util', //$NON-NLS-1$
	'orion/util' //$NON-NLS-0$
], function(messages, mEventTarget, mTooltip, mAnnotations, objects, textUtil, util) {
	
	var AT = mAnnotations.AnnotationType;

	var HIGHLIGHT_ERROR_ANNOTATION = "orion.annotation.highlightError"; //$NON-NLS-0$

	/**
	 * @name orion.editor.BaseEditor
	 * @class This is the base interface for text and visual editors based on a text buffer.
	 *
	 * @description Creates a new Base Editor with the given options.
	 * @param {Object} options Creation options for this editor.
	 * @param {Object} options.domNode
	 * @param {Object} options.statusReporter
	 *
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	function BaseEditor(options) {
		options = options || {};
		this._domNode = options.domNode;
		this._model = options.model;
		this._undoStack = options.undoStack;
		this._statusReporter = options.statusReporter;
		this._title = null;
		var that = this;
		this._listener = {
			onChanged: function(e) {
				that.onChanged(e);
			}
		};
		if (this._model) {
			this._model.addEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
		}
		this.checkDirty();
	}
	BaseEditor.prototype = /** @lends orion.editor.BaseEditor.prototype */ {
		/**
		 * Destroys the editor. Uninstall the editor view.
		 */
		destroy: function() {
			this.uninstall();
			this._statusReporter = this._domNode = null;
			if (this._model) {
				this._model.removeEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
			}
		},

		/** @private */
		checkDirty : function() {
			this.setDirty(this._undoStack && !this._undoStack.isClean());
		},
		/**
		 * Focus the the editor view. The default implementation does nothing.
		 */
		focus: function() {
		},
		/**
		 * Returns the text model of the editor.
		 *
		 * @returns {orion.editor.TextModel} the text model of the view.
		 */
		getModel: function() {
			return this._model;
		},
		/**
		 * Returns the text for the given range.
		 * <p>
		 * The text does not include the character at the end offset.
		 * </p>
		 *
		 * @param {Number} [start=0] the start offset of text range.
		 * @param {Number} [end=char count] the end offset of text range.
		 *
		 * @see orion.editor.TextView#setText
		 */
		getText: function(start, end) {
			return this.getModel().getText(start, end);
		},
		/**
		 * Returns the editor title.
		 *
		 * @returns {String} the editor title.
		 */
		getTitle: function() {
			return this._title;
		},
		/**
		 * Returns the editor undo stack.
		 *
		 * @returns {orion.editor.UndoStack} the editor undo stack.
		 */
		getUndoStack: function() {
			return this._undoStack;
		},
		/**
		 * Creates the DOM hierarchy of the editor and add it to the document.
		 */
		install: function() {
			this.installed = true;
		},
		/**
		 * Returns <code>true</code> if the editor is dirty; <code>false</code> otherwise.
		 * @returns {Boolean} whether the editor is dirty
		 */
		isDirty: function() {
			if (this._undoStack) return !this._undoStack.isClean();
			return this._dirty;
		},
		/**
		 * Marks the current state of the editor as clean. Meaning there are no unsaved modifications.
		 */
		markClean: function() {
			this.getUndoStack().markClean();
			this.setDirty(false);
		},
		/**
		 * Called when the dirty state of the editor changes.
		 * @param {Event} dirtyChangedEvent
		 */
		onDirtyChanged: function(dirtyChangedEvent) {
			return this.dispatchEvent(dirtyChangedEvent);
		},
		/**
		 * Called when the editor's contents have been changed or saved.
		 * @param {Event} inputChangedEvent
		 */
		onInputChanged: function (inputChangedEvent) {
			return this.dispatchEvent(inputChangedEvent);
		},
		/**
		 * Called when the editor's text model has been changed.
		 * @param {Event} inputChangedEvent
		 * @callback
		 */
		onChanged: function (modelChangedEvent) {
			this.checkDirty();
		},
		/**
		 * Report the message to the user.
		 *
		 * @param {String} message the message to show
		 * @param {String} [type] the message type. Either normal or "progress" or "error";
		 * @param {Boolean} [isAccessible] If <code>true</code>, a screen reader will read this message.
		 * Otherwise defaults to the domNode default.
		 */
		reportStatus: function(message, type, isAccessible) {
			if (this._statusReporter) {
				this._statusReporter(message, type, isAccessible);
			}
		},
		/**
		 * Resizes the editor view. The default implementation does nothing.
		 */
		resize: function() {
		},
		/**
		 * Sets whether the editor is dirty.
		 *
		 * @param {Boolean} dirty
		 */
		setDirty: function(dirty) {
			this._setSyntaxCheckRequired(dirty);
			if (this._dirty === dirty) { return; }
			this._dirty = dirty;
			this.onDirtyChanged({type: "DirtyChanged"}); //$NON-NLS-0$
		},
		/**
		 * Sets a flag indicating whether the editor contents have been modified since
		 * the last syntax check (validation) operation.
		 * 
		 * @function
		 * @param required {Boolean} what to set the flag to, true indicates the editor is dirty and needs syntax checking
		 */
		_setSyntaxCheckRequired: function _setSyntaxCheckRequired(required){
			this._syntaxCheckRequired = required;
		},
		/**
		 * Returns the state of the syntax check required flag, indicating whether the editor contents have
		 * been modified since the last syntax check (validation) operation.
		 * 
		 * @function
		 * @returns returns {Boolean} whether the flag has been set indicating a syntax check (validation) operation is required
		 */
		_isSyntaxCheckRequired: function _isSyntaxCheckRequired() {
			return this._syntaxCheckRequired;
		},
		/**
		 * @private
		 */
		_setModelText: function(contents) {
			if (this._model) {
				this._model.setText(contents);
			}
		},
		/**
		 * Sets the editor's contents.
		 *
		 * @param {String} title the editor title
		 * @param {String} message an error message
		 * @param {String} contents the editor contents
		 * @param {Boolean} contentsSaved whether the editor contents was saved.
		 */
		setInput: function(title, message, contents, contentsSaved) {
			this._title = title;
			if (!contentsSaved) {
				if (message) {
					this.reportStatus(message, "error"); //$NON-NLS-0$
				} else {
					if (contents !== null && contents !== undefined) {
						if (typeof contents === "string") { //$NON-NLS-0$
							this._setModelText(contents);
						}
						if (this._undoStack) {
							this._undoStack.reset();
						}
					}
				}
			}
			this.checkDirty();
			this.onInputChanged({
				type: "InputChanged", //$NON-NLS-0$
				title: title,
				message: message,
				contents: contents,
				contentsSaved: contentsSaved
			});
		},
		/**
		 * Replaces the text in the given range with the given text.
		 * <p>
		 * The character at the end offset is not replaced.
		 * </p>
		 *
		 * @param {String} text the new text.
		 * @param {Number} [start=0] the start offset of text range.
		 * @param {Number} [end=char count] the end offset of text range.
		 */
		setText: function(text, start, end) {
			this.getModel().setText(text, start, end);
		},
		/**
		 * Removes the DOM hierarchy of the editor from the document.
		 */
		uninstall: function() {
			this.installed = false;
		}
	};
	mEventTarget.EventTarget.addMixin(BaseEditor.prototype);

	/**
	 * @name orion.editor.Editor
	 * @augments orion.editor.BaseEditor
	 * @class An <code>Editor</code> is a user interface for editing text that provides additional features over the basic {@link orion.editor.TextView}.
	 * Some of <code>Editor</code>'s features include:
	 * <ul>
	 * <li>Additional actions and key bindings for editing text</li>
	 * <li>Content assist</li>
	 * <li>Find and Incremental Find</li>
	 * <li>Rulers for displaying line numbers and annotations</li>
	 * <li>Status reporting</li>
	 * </ul>
	 *
	 * @description Creates a new Editor with the given options.
	 * @param {Object} options Options controlling the features of this Editor.
	 * @param {Object} options.annotationFactory
	 * @param {Object} options.contentAssistFactory
	 * @param {Object} options.domNode
	 * @param {Object} options.keyBindingFactory
	 * @param {Object} options.lineNumberRulerFactory
	 * @param {Object} options.zoomRulerFactory
	 * @param {Object} options.foldingRulerFactory
	 * @param {Object} options.statusReporter
	 * @param {Object} options.textViewFactory
	 * @param {Object} options.undoStackFactory
	 * @param {Object} options.textDNDFactory
	 * @param {Object} options.hoverFactory
	 */
	function Editor(options) {
		options = options || {};
		BaseEditor.call(this, options);
		this._textViewFactory = options.textViewFactory;
		this._undoStackFactory = options.undoStackFactory;
		this._textDNDFactory = options.textDNDFactory;
		this._annotationFactory = options.annotationFactory;
		this._zoomRulerFactory = options.zoomRulerFactory;
		this._foldingRulerFactory = options.foldingRulerFactory;
		this._lineNumberRulerFactory = options.lineNumberRulerFactory;
		this._contentAssistFactory = options.contentAssistFactory;
		this._keyBindingFactory = options.keyBindingFactory;
		this._hoverFactory = options.hoverFactory;
		this._syntaxHighlighter = options.syntaxHighlighter;
		this._annotationStyler = null;
		this._annotationModel = null;
		this._annotationRuler = null;
		this._lineNumberRuler = null;
		this._overviewRuler = null;
		this._zoomRuler = null;
		this._foldingRuler = null;
		this._contentAssist = null;
	}
	Editor.prototype = new BaseEditor();
	objects.mixin(Editor.prototype, /** @lends orion.editor.Editor.prototype */ {
		/**
		 * Destroys the editor.
		 */
		destroy: function() {
			BaseEditor.prototype.destroy.call(this);
			this._textViewFactory = this._undoStackFactory = this._textDNDFactory = 
			this._annotationFactory = this._foldingRulerFactory = this._lineNumberRulerFactory = 
			this._contentAssistFactory = this._keyBindingFactory = this._hoverFactory = this._zoomRulerFactory = null;
		},
		/**
		 * Returns the annotation model of the editor.
		 *
		 * @returns {orion.editor.AnnotationModel}
		 */
		getAnnotationModel: function() {
			return this._annotationModel;
		},
		/**
		 * Returns the annotation ruler of the editor.
		 *
		 * @returns {orion.editor.AnnotationRuler}
		 */
		getAnnotationRuler: function() {
			return this._annotationRuler;
		},
		/**
		 * Returns the whether annotation ruler of the editor is showning.
		 *
		 * @returns {Boolean}
		 * @since 12
		 */
		getAnnotationRulerVisible: function() {
			return this._annotationRulerVisible;
		},
		/**
		 * Returns the annotation styler of the editor.
		 *
		 * @returns {orion.editor.AnnotationStyler}
		 */
		getAnnotationStyler: function() {
			return this._annotationStyler;
		},
		/**
		 * Returns the content assist of the editor.
		 *
		 * @returns {orion.editor.LineNumberRuler}
		 */
		getContentAssist: function() {
			return this._contentAssist;
		},
		/**
		 * Returns the folding ruler of the editor.
		 *
		 * @returns {orion.editor.FoldingRuler}
		 */
		getFoldingRuler: function() {
			return this._foldingRuler;
		},
		/**
		 * Returns the whether folding ruler of the editor is showning.
		 *
		 * @returns {Boolean}
		 * @since 12
		 */
		getFoldingRulerVisible: function() {
			return this._foldingRulerVisible;
		},
		/**
		 * Creates and add a FoldingAnnotation to the editor.
		 *
		 * @param {Number} start The start offset of the annotation in the text model.
		 * @param {Number} end The end offset of the annotation in the text model.
		 * @returns {orion.editor.FoldingAnnotation} The FoldingAnnotation added to the editor.
		 */
		addFoldingAnnotation: function(start, end) {
			var annotationModel = this.getAnnotationModel();
			if(annotationModel) {
				var foldingAnnotation = new mAnnotations.FoldingAnnotation(start, end, this.getTextView().getModel());
				annotationModel.addAnnotation(foldingAnnotation);
				return foldingAnnotation;
			}
			return null;
		},
		/**
		 * Returns the line number ruler of the editor.
		 *
		 * @returns {orion.editor.LineNumberRuler}
		 */
		getLineNumberRuler: function() {
			return this._lineNumberRuler;
		},
		/**
		 * Returns the whether lines ruler of the editor is showning.
		 *
		 * @returns {Boolean}
		 * @since 12
		 */
		getLineNumberRulerVisible: function() {
			return this._lineNumberRulerVisible;
		},
		/**
		 * Returns the Tooltip instance for this editor
		 *
		 * @returns {orion.editor.Tooltip}
		*/
		getTooltip: function() {
			return mTooltip.Tooltip.getTooltip(this._textView, this);
		},
		/**
		 * Returns the zoom ruler of the editor.
		 *
		 * @returns {orion.editor.LineNumberRuler}
		 */
		getZoomRuler: function() {
			return this._zoomRuler;
		},
		/**
		 * Returns the whether zoom ruler of the editor is showning.
		 *
		 * @returns {Boolean}
		 * @since 12
		 */
		getZoomRulerVisible: function() {
			return this._zoomRulerVisible;
		},
		/**
		 * Returns the base text model of this editor.
		 *
		 * @returns {orion.editor.TextModel}
		 */
		getModel: function() {
			if (!this._textView) {
				return null;
			}
			var model = this._textView.getModel();
			if (model.getBaseModel) {
				model = model.getBaseModel();
			}
			return model;
		},
		/**
		 * Returns the overview ruler of the editor.
		 *
		 * @returns {orion.editor.OverviewRuler}
		 */
		getOverviewRuler: function() {
			return this._overviewRuler;
		},
		/**
		 * Returns the underlying <code>TextView</code> used by this editor.
		 * @returns {orion.editor.TextView} the editor text view.
		 */
		getTextView: function() {
			return this._textView;
		},
		/**
		 * Returns the editor's key modes.
		 *
		 * @returns {Array} the editor key modes.
		 */
		getKeyModes: function() {
			return this._textView.getKeyModes();
		},
		/**
		 * Returns the editor source code actions.
		 *
		 * @returns {orion.editor.sourceCodeActions}
		 */
		getSourceCodeActions: function() {
			return this._sourceCodeActions;
		},
		/**
		 * Returns the editor linked mode.
		 *
		 * @returns {orion.editor.LinkedMode}
		 */
		getLinkedMode: function() {
			return this._linkedMode;
		},
		/**
		 * Returns the editor text actions.
		 *
		 * @returns {orion.editor.textActions}
		 */
		getTextActions: function() {
			return this._textActions;
		},
		/**
		 * Gives focus to the text view.
		 */
		focus: function() {
			if (this._textView) {
				this._textView.focus();
			}
		},
		/**
		 * Resizes the text view.
		 */
		resize: function() {
			if (this._textView) {
				this._textView.resize();
			}
		},
		/**
		 * Sets whether the annotation ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setAnnotationRulerVisible: function(visible, force) {
			if (this._annotationRulerVisible === visible && !force) { return; }
			this._annotationRulerVisible = visible;
			if (!this._annotationRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._annotationRuler, 0);
			} else {
				textView.removeRuler(this._annotationRuler);
			}
		},
		/**
		 * Sets whether the folding ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setFoldingRulerVisible: function(visible, force) {
			if (this._foldingRulerVisible === visible && !force) { return; }
			if (!visible) {
				var textActions = this.getTextActions();
				if (textActions) {
					textActions.expandAnnotations(true);
				}
			}
			this._foldingRulerVisible = visible;
			if (!this._foldingRuler) { return; }
			var textView = this._textView;
			if (!textView.getModel().getBaseModel) { return; }
			if (visible) {
				textView.addRuler(this._foldingRuler);
			} else {
				textView.removeRuler(this._foldingRuler);
			}
		},
		/**
		 * Sets whether the line numbering ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setLineNumberRulerVisible: function(visible, force) {
			if (this._lineNumberRulerVisible === visible && !force) { return; }
			this._lineNumberRulerVisible = visible;
			if (!this._lineNumberRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._lineNumberRuler, !this._annotationRulerVisible ? 0 : 1);
			} else {
				textView.removeRuler(this._lineNumberRuler);
			}
		},
		/**
		 * Sets whether the overview ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setOverviewRulerVisible: function(visible, force) {
			if (this._overviewRulerVisible === visible && !force) { return; }
			this._overviewRulerVisible = visible;
			if (!this._overviewRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._overviewRuler);
			} else {
				textView.removeRuler(this._overviewRuler);
			}
		},
		/**
		 * Sets whether the zoom ruler is visible.
		 *
		 * @param {Boolean} visible <code>true</code> to show ruler, <code>false</code> otherwise
		 */
		setZoomRulerVisible: function(visible, force) {
			if (this._zoomRulerVisible === visible && !force) { return; }
			this._zoomRulerVisible = visible;
			if (!this._zoomRuler) { return; }
			var textView = this._textView;
			if (visible) {
				textView.addRuler(this._zoomRuler);
			} else {
				textView.removeRuler(this._zoomRuler);
			}
		},
		
		/**
		 * Sets which annotations types are shown in the annotation ruler.  Annotations are visible by default.
		 * 
		 * @param {Object} types a hash table mapping annotation type to visibility (i.e. AnnotationType.ANNOTATION_INFO -> true).
		 * @since 14.0
		 */
		setAnnotationTypesVisible: function(types) {
			if (textUtil.compare(this._annotationTypesVisible, types)) return;
			this._annotationTypesVisible = types;
			if (!this._annotationRuler || !this._textView || !this._annotationRulerVisible) { return; }
			this._annotationRuler.setAnnotationTypeVisible(types);
			this._textView.redrawLines(0, undefined, this._annotationRuler);
		},
		
		/**
		 * Sets which annotations types are shown in the overview ruler.  Annotations are visible by default.
		 * 
		 * @param {Object} types a hash table mapping annotation type to visibility (i.e. AnnotationType.ANNOTATION_INFO -> true).
		 * @since 14.0
		 */
		setOverviewAnnotationTypesVisible: function(types) {
			if (textUtil.compare(this._overviewAnnotationTypesVisible, types)) return;
			this._overviewAnnotationTypesVisible = types;
			if (!this._overviewRuler || !this._textView || !this._overviewRulerVisible) { return; }
			this._overviewRuler.setAnnotationTypeVisible(types);
			this._textView.redrawLines(0, undefined, this._overviewRuler);
		},
		
		/**
		 * Sets which annotations types are shown in the text.  Annotations are visible by default.
		 * 
		 * @param {Object} types a hash table mapping annotation type to visibility (i.e. AnnotationType.ANNOTATION_INFO -> true).
		 * @since 14.0
		 */
		setTextAnnotationTypesVisible: function(types) {
			if (textUtil.compare(this._textAnnotationTypesVisible, types)) return;
			this._textAnnotationTypesVisible = types;
			if (!this._annotationStyler || !this._textView) { return; }
			this._annotationStyler.setAnnotationTypeVisible(types);
			this._textView.redrawLines(0, undefined);
		},

		mapOffset: function(offset, _parent) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				offset = model.mapOffset(offset, _parent);
			}
			return offset;
		},
		/**
		 * @name getLineAtOffset
		 * @description Returns the line number corresponding to the given offset in the source
		 * @function
		 * @public
		 * @memberof orion.editor.Editor
		 * @param {Number} offset The offset into the source
		 * @returns {Number} The line number corresponding to the given offset or <code>-1</code> if out of range
		 * @since 5.0
		 */
		getLineAtOffset: function(offset) {
			return this.getModel().getLineAtOffset(this.mapOffset(offset));
		},
		/**
		 * @name getLineStart
		 * @description Compute the editor start offset of the given line number
		 * @function
		 * @public
		 * @memberof orion.editor.TextView
		 * @param {Number} line The line number in the editor
		 * @returns {Number} Returns the start offset of the given line number in the editor.
		 * @since 5.0
		 */
		getLineStart: function(line) {
			return this.getModel().getLineStart(line);
		},
		getCaretOffset: function() {
			return this.mapOffset(this._textView.getCaretOffset());
		},
		
		/**
		 * Returns the text view selection text.
		 * <p>
		 * If there are multiple selection ranges, the result is concatenated with the specified delimiter.
		 * </p>
		 * 
		 * @param {String} delimiter The offset into the editor
		 * @returns {String} the view selection text
		 * @since 10.0
		 * @see orion.editor.TextView#setSelection
		 */
		getSelectionText: function(delimiter) {
			var textView = this._textView;
			return textView.getSelectionText(delimiter);
		},
		
		getSelection: function() {
			var textView = this._textView;
			var selection = textView.getSelection();
			var model = textView.getModel();
			if (model.getBaseModel) {
				selection.start = model.mapOffset(selection.start);
				selection.end = model.mapOffset(selection.end);
			}
			return selection;
		},

		getSelections: function() {
			var textView = this._textView;
			var model = textView.getModel();
			var selections = textView.getSelections();
			selections.forEach(function(selection) {
				if (model.getBaseModel) {
					selection.start = model.mapOffset(selection.start);
					selection.end = model.mapOffset(selection.end);
				}
			});
			return selections;
		},

		getStyleAccessor: function() {
			var styleAccessor = null;
			if (this._syntaxHighlighter) {
				var styler = this._syntaxHighlighter.getStyler();
				if (styler && styler.getStyleAccessor) {
					styleAccessor = styler.getStyleAccessor();
				}
			}
			return styleAccessor;
		},

		_expandOffset: function(offset) {
			var model = this._textView.getModel();
			var annotationModel = this._annotationModel;
			if (!annotationModel || !model.getBaseModel) { return; }
			var annotations = annotationModel.getAnnotations(offset, offset + 1);
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (annotation.type === AT.ANNOTATION_FOLDING) {
					if (annotation.expand) {
						annotation.expand();
					}
				}
			}
		},

		setCaretOffset: function(caretOffset, show, callback) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				this._expandOffset(caretOffset);
				caretOffset = model.mapOffset(caretOffset, true);
			}
			textView.setCaretOffset(caretOffset, show, callback);
		},

		setText: function(text, start, end, show, callback) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				if (start !== undefined) {
					this._expandOffset(start);
					start = model.mapOffset(start, true);
				}
				if (end !== undefined) {
					this._expandOffset(end);
					end = model.mapOffset(end, true);
				}
			}
			textView.setText(text, start, end, show, callback);
		},

		setSelection: function(start, end, show, callback) {
			var textView = this._textView;
			var model = textView.getModel();
			if (model.getBaseModel) {
				this._expandOffset(start);
				this._expandOffset(end);
				start = model.mapOffset(start, true);
				end = model.mapOffset(end, true);
			}
			textView.setSelection(start, end, show, callback);
		},
		setSelections: function(ranges, show, callback) {
			var that = this;
			var textView = this._textView;
			var model = textView.getModel();
			ranges.forEach(function(range) {
				var start = range.start;
				var end = range.end;
				if (model.getBaseModel) {
					that._expandOffset(start);
					that._expandOffset(end);
					start = model.mapOffset(start, true);
					end = model.mapOffset(end, true);
				}
				range.start = start;
				range.end = end;
			});
			textView.setSelections(ranges, show, callback);
		},

		/**
		 * @param {Number} start
		 * @param {Number} [end]
		 * @param {function} [callback] if callback is specified, scrolling to show the selection is animated and callback is called when the animation is done.
		 * @param {Boolean} [focused=true] whether the text view should be focused when the selection is done.
		 * @private
		 * @deprecated use #setSelection instead
		 */
		moveSelection: function(start, end, callback, focused) {
			end = end || start;
			var textView = this._textView;
			this.setSelection(start, end, 1 / 3, function() {
				if (focused === undefined || focused) {
					textView.focus();
				}
				if (callback) {
					callback();
				}
			});
		},

		/** @private */
		_getTooltipInfo: function(x, y) {
			var textView = this._textView;
			var annotationModel = this.getAnnotationModel();
			if (!annotationModel) { return null; }
			var annotationStyler = this._annotationStyler;
			if (!annotationStyler) { return null; }
			if (!textView.isValidTextPosition(x, y)) { return null; }
			var offset = textView.getOffsetAtLocation(x, y);
			if (offset === -1) { return null; }
			offset = this.mapOffset(offset);
			var annotations = annotationStyler.getAnnotationsByType(annotationModel, offset, offset + 1);
			var rangeAnnotations = [];
			for (var i = 0; i < annotations.length; i++) {
				if (annotations[i].rangeStyle) {
					rangeAnnotations.push(annotations[i]);
				}
			}
			var info = {
				contents: rangeAnnotations,
				position: "below", //$NON-NLS-0$
				context: {source: "editor", offset: offset} //$NON-NLS-0$
			};
			return info;
		},

		/** @private */
		_highlightCurrentLine: function(newSelections, oldSelections) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) { return; }
			var textView = this._textView;
			if (textView.getOptions("singleMode")) { return; } //$NON-NLS-0$
			oldSelections = Array.isArray(oldSelections) ? oldSelections : [oldSelections];
			newSelections = Array.isArray(newSelections) ? newSelections : [newSelections];
			var model = textView.getModel();
			function getHighlightLines(selections) {
				var lines = {};
				if (selections && selections.some(function(selection) {
					if (selection && selection.isEmpty()) {
						lines[model.getLineAtOffset(selection.start).toString()] = true;
					} else {
						return true;
					}
					return false;
				})) return {};
				return lines;
			}
			var oldLines = getHighlightLines(oldSelections);
			var newLines = getHighlightLines(newSelections);
			function compare(o, n) {
				for (var p1 in o) {
					if (!n[p1]) {
						return true;
					}
				}
				return false;
			}
			if (!(compare(oldLines, newLines) || compare(newLines, oldLines))) return;
			var remove = this._currentLineAnnotations;
			var add = [];
			for (var p in newLines) {
				var lineIndex = p >> 0;
				var start = model.getLineStart(lineIndex);
				var end = model.getLineEnd(lineIndex);
				if (model.getBaseModel) {
					start = model.mapOffset(start);
					end = model.mapOffset(end);
				}
				var type = AT.ANNOTATION_CURRENT_LINE;
				var annotation = AT.createAnnotation(type, start, end);
				add.push(annotation);
			}
			this._currentLineAnnotations = add;
			annotationModel.replaceAnnotations(remove, add);
		},

		/**
		 * Creates the underlying TextView and installs the editor's features.
		 */
		installTextView: function() {
			this.install();
		},

		install : function() {
			if (this._textView) { return; }

			// Create textView and install optional features
			this._textView = this._textViewFactory();
			if (this._undoStackFactory) {
				this._undoStack = this._undoStackFactory.createUndoStack(this);
				this._textView.setOptions({undoStack: this._undoStack});
				this.checkDirty();
			}
			if (this._textDNDFactory) {
				this._textDND = this._textDNDFactory.createTextDND(this, this._undoStack);
			}
			if (this._contentAssistFactory) {
				var contentAssistMode = this._contentAssistFactory.createContentAssistMode(this);
				this._contentAssist = contentAssistMode.getContentAssist();
			}

			var tooltip = mTooltip.Tooltip.getTooltip(this._textView, this);
			if (this._hoverFactory) {
				this._hover = this._hoverFactory.createHover(this);
				tooltip.hover = this._hover;
			}
			
			var editor = this, textView = this._textView;

			var that = this;
			this._listener = {
				onModelChanged: /* @callback */ function(e) {
					that.checkDirty();
				},
				onMouseOver: function(e) {
					that._listener.onMouseMove(e);
				},
				onMouseDown: /* @callback */ function(e) {
					that._listener.mouseDown = true;
				},
				onMouseUp: /* @callback */ function(e) {
					that._listener.mouseDown = false;
				},
				onMouseMove: function(e) {
					if (!tooltip || that._listener.mouseDown) { return; }

					// Prevent spurious mouse event (e.g. on a scroll)					
					if (e.event.clientX === that._listener.lastMouseX
						&& e.event.clientY === that._listener.lastMouseY) {
						return;
					}
					
					that._listener.lastMouseX = e.event.clientX;
					that._listener.lastMouseY = e.event.clientY;

					if (that._hoverTimeout) {
						window.clearTimeout(that._hoverTimeout);
						that._hoverTimeout = null;
					}
					that._hoverTimeout = window.setTimeout(function() {
						that._hoverTimeout = null;
						
						// Re-check incase editor closed...
						if (!that._listener){
							return;
						}
						
						tooltip.onHover({
							y: e.y,
							x: e.x,							
							getTooltipInfo: function() {
								return that._getTooltipInfo(this.x, this.y);
							}
						}, e.x, e.y);
					}, 175);
				},
				onMouseOut: /* @callback */ function(e) {
					// When mouse leaves the editor, ignore any pending onMouseMove events
					if (that._hoverTimeout) {
						window.clearTimeout(that._hoverTimeout);
						that._hoverTimeout = null;
					}
				},
				onSelection: function(e) {
					if (tooltip) { tooltip.hide(); }
					that._updateCursorStatus();
					that._highlightCurrentLine(e.newValue, e.oldValue);
				}
			};
			textView.addEventListener("ModelChanged", this._listener.onModelChanged); //$NON-NLS-0$
			textView.addEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
			textView.addEventListener("MouseOver", this._listener.onMouseOver); //$NON-NLS-0$
			textView.addEventListener("MouseOut", this._listener.onMouseOut); //$NON-NLS-0$
			textView.addEventListener("MouseDown", this._listener.onMouseDown); //$NON-NLS-0$
			textView.addEventListener("MouseUp", this._listener.onMouseUp); //$NON-NLS-0$
			textView.addEventListener("MouseMove", this._listener.onMouseMove); //$NON-NLS-0$

			// Set up keybindings
			if (this._keyBindingFactory) {
				var keyBindings;
				if (typeof this._keyBindingFactory === "function") { //$NON-NLS-0$
					keyBindings = this._keyBindingFactory(this, this.getKeyModes(), this._undoStack, this._contentAssist);
				} else {
					keyBindings = this._keyBindingFactory.createKeyBindings(editor, this._undoStack, this._contentAssist);
				}
				if (keyBindings) {
					this._textActions = keyBindings.textActions;
					this._linkedMode = keyBindings.linkedMode;
					this._sourceCodeActions = keyBindings.sourceCodeActions;
				}
			}

			var addRemoveBookmark = /* @callback */ function(lineIndex, e) {
				if (lineIndex === undefined) { return; }
				if (lineIndex === -1) { return; }
				var view = this.getView();
				var viewModel = view.getModel();
				var annotationModel = this.getAnnotationModel();
				var lineStart = editor.mapOffset(viewModel.getLineStart(lineIndex));
				var lineEnd = editor.mapOffset(viewModel.getLineEnd(lineIndex));
				var annotations = annotationModel.getAnnotations(lineStart, lineEnd);
				var bookmark = null;
				while (annotations.hasNext()) {
					var annotation = annotations.next();
					if (annotation.type === AT.ANNOTATION_BOOKMARK) {
						bookmark = annotation;
						break;
					}
				}
				if (bookmark) {
					annotationModel.removeAnnotation(bookmark);
				} else {
					bookmark = AT.createAnnotation(AT.ANNOTATION_BOOKMARK, lineStart, lineEnd, editor.getText(lineStart, lineEnd));
					annotationModel.addAnnotation(bookmark);
				}
			};

			// Create rulers, annotation model and styler
			if (this._annotationFactory) {
				var textModel = textView.getModel();
				if (textModel.getBaseModel) { textModel = textModel.getBaseModel(); }
				this._annotationModel = this._annotationFactory.createAnnotationModel(textModel);
				if (this._annotationModel) {
					var styler = this._annotationStyler = this._annotationFactory.createAnnotationStyler(textView, this._annotationModel);
					if (styler) {
						styler.addAnnotationType(AT.ANNOTATION_CURRENT_SEARCH);
						styler.addAnnotationType(AT.ANNOTATION_MATCHING_SEARCH);
						styler.addAnnotationType(AT.ANNOTATION_SEARCH_RANGE);
						styler.addAnnotationType(AT.ANNOTATION_ERROR);
						styler.addAnnotationType(AT.ANNOTATION_WARNING);
						styler.addAnnotationType(AT.ANNOTATION_INFO);
						styler.addAnnotationType(AT.ANNOTATION_MATCHING_BRACKET);
						styler.addAnnotationType(AT.ANNOTATION_CURRENT_BRACKET);
						styler.addAnnotationType(AT.ANNOTATION_CURRENT_LINE);
						styler.addAnnotationType(AT.ANNOTATION_READ_OCCURRENCE);
						styler.addAnnotationType(AT.ANNOTATION_WRITE_OCCURRENCE);
						styler.addAnnotationType(AT.ANNOTATION_SELECTED_LINKED_GROUP);
						styler.addAnnotationType(AT.ANNOTATION_CURRENT_LINKED_GROUP);
						styler.addAnnotationType(AT.ANNOTATION_LINKED_GROUP);
						styler.addAnnotationType(HIGHLIGHT_ERROR_ANNOTATION);

						styler.setAnnotationTypeVisible(this._textAnnotationTypesVisible);
					}
				}

				var rulers = this._annotationFactory.createAnnotationRulers(this._annotationModel);
				var ruler = this._annotationRuler = rulers.annotationRuler;
				if (ruler) {
					ruler.onDblClick = addRemoveBookmark;
					ruler.setMultiAnnotationOverlay({html: "<div class='annotationHTML overlay'></div>"}); //$NON-NLS-0$
					ruler.addAnnotationType(AT.ANNOTATION_ERROR);
					ruler.addAnnotationType(AT.ANNOTATION_WARNING);
					ruler.addAnnotationType(AT.ANNOTATION_INFO);
					ruler.addAnnotationType(AT.ANNOTATION_TASK);
					ruler.addAnnotationType(AT.ANNOTATION_BOOKMARK);
					ruler.addAnnotationType(AT.ANNOTATION_DIFF_ADDED);
					ruler.addAnnotationType(AT.ANNOTATION_DIFF_DELETED);
					ruler.addAnnotationType(AT.ANNOTATION_DIFF_MODIFIED);
					
					ruler.setAnnotationTypeVisible(this._annotationTypesVisible);
				}
				this.setAnnotationRulerVisible(this._annotationRulerVisible || this._annotationRulerVisible === undefined, true);

				// Overview Ruler Annotation Type
				ruler = this._overviewRuler = rulers.overviewRuler;
				if (ruler) {
					ruler.addAnnotationType(AT.ANNOTATION_CURRENT_SEARCH);
					ruler.addAnnotationType(AT.ANNOTATION_MATCHING_SEARCH);
					ruler.addAnnotationType(AT.ANNOTATION_READ_OCCURRENCE);
					ruler.addAnnotationType(AT.ANNOTATION_WRITE_OCCURRENCE);
					ruler.addAnnotationType(AT.ANNOTATION_CURRENT_BLAME);
					ruler.addAnnotationType(AT.ANNOTATION_ERROR);
					ruler.addAnnotationType(AT.ANNOTATION_WARNING);
					ruler.addAnnotationType(AT.ANNOTATION_INFO);
					ruler.addAnnotationType(AT.ANNOTATION_TASK);
					ruler.addAnnotationType(AT.ANNOTATION_BOOKMARK);
					ruler.addAnnotationType(AT.ANNOTATION_MATCHING_BRACKET);
					ruler.addAnnotationType(AT.ANNOTATION_CURRENT_BRACKET);
					ruler.addAnnotationType(AT.ANNOTATION_CURRENT_LINE);
					ruler.addAnnotationType(AT.ANNOTATION_DIFF_ADDED);
					ruler.addAnnotationType(AT.ANNOTATION_DIFF_DELETED);
					ruler.addAnnotationType(AT.ANNOTATION_DIFF_MODIFIED);
					
					ruler.setAnnotationTypeVisible(this._overviewAnnotationTypesVisible);
				}
				this.setOverviewRulerVisible(this._overviewRulerVisible || this._overviewRulerVisible === undefined, true);
			}

			if (this._zoomRulerFactory) {
				this._zoomRuler = this._zoomRulerFactory.createZoomRuler(this._annotationModel);
				this.setZoomRulerVisible(this._zoomRulerVisible, true);
			}

			if (this._lineNumberRulerFactory) {
				this._lineNumberRuler = this._lineNumberRulerFactory.createLineNumberRuler(this._annotationModel);
				this._lineNumberRuler.addAnnotationType(AT.ANNOTATION_CURRENT_BLAME);
				this._lineNumberRuler.addAnnotationType(AT.ANNOTATION_BLAME);
		        this._lineNumberRuler.addAnnotationType(AT.ANNOTATION_DIFF_ADDED);
		        this._lineNumberRuler.addAnnotationType(AT.ANNOTATION_DIFF_MODIFIED);
		        this._lineNumberRuler.addAnnotationType(AT.ANNOTATION_DIFF_DELETED);
				this._lineNumberRuler.onDblClick = addRemoveBookmark;
				this.setLineNumberRulerVisible(this._lineNumberRulerVisible || this._lineNumberRulerVisible === undefined, true);
			}

			if (this._foldingRulerFactory) {
				this._foldingRuler = this._foldingRulerFactory.createFoldingRuler(this._annotationModel);
				this._foldingRuler.addAnnotationType(AT.ANNOTATION_FOLDING);
				this.setFoldingRulerVisible(this._foldingRulerVisible || this._foldingRulerVisible === undefined, true);
			}

			var textViewInstalledEvent = {
				type: "TextViewInstalled", //$NON-NLS-0$
				textView: textView
			};
			this.dispatchEvent(textViewInstalledEvent);
			BaseEditor.prototype.install.call(this);
		},

		/**
		 * Destroys the underlying TextView.
		 */
		uninstallTextView: function() {
			this.uninstall();
		},

		uninstall: function() {
			var textView = this._textView;
			if (!textView) { return; }

			textView.destroy();

			if (this._annotationModel) {
				this._annotationModel.setTextModel(null);
			}
			this._textView = this._undoStack = this._textDND = this._contentAssist =
				this._listener = this._annotationModel = this._annotationStyler =
				this._annotationRuler = this._overviewRuler = this._zoomRuler = this._lineNumberRuler =
				this._foldingRuler = this._currentLineAnnotations = this._title = null;
			this._dirty = false;
			this._foldingRulerVisible = this._overviewRulerVisible = this._zoomRulerVisible =
				this._lineNumberRulerVisible = this._annotationRulerVisible = undefined;

			var textViewUninstalledEvent = {
				type: "TextViewUninstalled", //$NON-NLS-0$
				textView: textView
			};
			this.dispatchEvent(textViewUninstalledEvent);
			BaseEditor.prototype.uninstall.call(this);
		},

		_updateCursorStatus: function() {
			// If we are in a mode and it owns status reporting, we bail out from reporting the cursor position.
			var keyModes = this.getKeyModes();
			for (var i=0; i<keyModes.length; i++) {
				var mode = keyModes[i];
				if (mode.isActive() && mode.isStatusActive && mode.isStatusActive()) {
					return;
				}
			}
			var _status;
			var model = this.getModel();
			var selections = this.getSelections();
			if (selections.length > 1) {
				_status = util.formatMessage(messages.multiSelections, selections.length);
			} else {
				var caretOffset = selections[0].getCaret();
				var lineIndex = model.getLineAtOffset(caretOffset);
				var lineStart = model.getLineStart(lineIndex);
				var offsetInLine = caretOffset - lineStart;
				if (localStorage.languageTools){
					_status = util.formatMessage(messages.lineColumnOffset, lineIndex + 1, offsetInLine + 1, caretOffset);
				} else {
					_status = util.formatMessage(messages.lineColumn, lineIndex + 1, offsetInLine + 1);
				}
			}
			this.reportStatus(_status);
		},

		showAnnotations: function(annotations, types, createAnnotation, getType) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) {
				return;
			}
			var remove = [], add = [];
			var model = annotationModel.getTextModel();
			var iter = annotationModel.getAnnotations(), annotation;
			while (iter.hasNext()) {
				annotation = iter.next();
				if (types.indexOf(annotation.type) !== -1) {
					if (annotation.creatorID === this) {
						remove.push(annotation);
					}
				}
			}
			if (annotations) {
				for (var i = 0; i < annotations.length; i++) {
					annotation = annotations[i];
					if (!annotation) { continue; }
					if (createAnnotation) {
						annotation = createAnnotation(annotation);
					} else {
						var start, end;
						if (annotation.lineStart && annotation.lineEnd){
							start = model.getLineStart(annotation.lineStart);
							// If the closing line number of the modified range is on the last line,
							// get the line ending offset of the previous line
							end = model.getLineCount() === annotation.lineEnd
										? model.getLineEnd(annotation.lineEnd - 1)
										: model.getLineStart(annotation.lineEnd);
						}
						else if (typeof annotation.line === "number") { //$NON-NLS-0$
							// line/column
							var lineIndex = annotation.line - 1;
							var lineStart = model.getLineStart(lineIndex);
							start = lineStart + annotation.start - 1;
							end = lineStart + annotation.end - 1;
						} else {
							// document offsets
							start = annotation.start;
							end = annotation.end;
						}
						var type = getType(annotation);
						if (!type) { continue; }
						annotation = AT.createAnnotation(type, start, end, annotation.description);
					}
					annotation.id = annotations[i].id; //allow consumers to tag the annotation with their own identifier
					if(annotations[i].data) {
						annotation.data = annotations[i].data;
					}
					annotation.creatorID = this;
					add.push(annotation);

				}
			}
			annotationModel.replaceAnnotations(remove, add);
		},

		showProblems: function(problems) {
			this.showAnnotations(problems, [
				AT.ANNOTATION_ERROR,
				AT.ANNOTATION_WARNING,
				AT.ANNOTATION_TASK,
				AT.ANNOTATION_INFO
			], null, function(annotation) {
				switch (annotation.severity) {
					case "error": return AT.ANNOTATION_ERROR; //$NON-NLS-0$
					case "warning": return AT.ANNOTATION_WARNING; //$NON-NLS-0$
					case "task": return AT.ANNOTATION_TASK; //$NON-NLS-0$
					case "info": return AT.ANNOTATION_INFO;
				}
				return null;
			});
		},

		showOccurrences: function(occurrences) {
			this.showAnnotations(occurrences, [
				AT.ANNOTATION_READ_OCCURRENCE,
				AT.ANNOTATION_WRITE_OCCURRENCE
			], null, function(annotation) {
				return annotation.readAccess ? AT.ANNOTATION_READ_OCCURRENCE : AT.ANNOTATION_WRITE_OCCURRENCE;
			});
		},

		showBlame : function(blameMarkers) {
			var blameRGB = this._blameRGB;
			var doc = this.getTextView().getOptions("parent").ownerDocument; //$NON-NLS-0$
			if (!blameRGB) {
				var div = util.createElement(doc, "div"); //$NON-NLS-0$
				div.className = "annotation blame"; //$NON-NLS-0$
				doc.body.appendChild(div);
				var win = doc.defaultView || doc.parentWindow;
				var blameStyle = win.getComputedStyle(div);
				var color = blameStyle.getPropertyValue("background-color"); //$NON-NLS-0$
				div.parentNode.removeChild(div);
				var i1 = color.indexOf("("); //$NON-NLS-0$
				var i2 = color.indexOf(")"); //$NON-NLS-0$
				color = color.substring(i1 + 1, i2);
				this._blameRGB = blameRGB = color.split(",").slice(0,3); //$NON-NLS-0$
			}
			var createGroup = function() {
				var annotation = mAnnotations.AnnotationType.createAnnotation(this.groupType, this.start, this.end, this.title);
				annotation.style = objects.mixin({}, annotation.style);
				annotation.style.style = objects.mixin({}, annotation.style.style);
				annotation.style.style.backgroundColor = "";
				this.groupAnnotation = annotation;
				annotation.blame = this.blame;
				annotation.html = this.html;
				annotation.creatorID = this.creatorID;
				return annotation;
			};
			var title = function() {
				var titleDiv = util.createElement(doc, "div"); //$NON-NLS-0$
				titleDiv.className = "tooltipTitle"; //$NON-NLS-0$
				var index = this.blame.Message.indexOf("\n"); //$NON-NLS-0$
				if (index === -1) { index = this.blame.Message.length; }
				var commitLink = util.createElement(doc, "a"); //$NON-NLS-0$
				commitLink.href = this.blame.CommitLink;
				if(util.isElectron){
					commitLink.target = "_blank";
				}
				commitLink.appendChild(doc.createTextNode(this.blame.Message.substring(0, index)));
				titleDiv.appendChild(commitLink);
				titleDiv.appendChild(util.createElement(doc, "br")); //$NON-NLS-0$
				titleDiv.appendChild(doc.createTextNode(util.formatMessage(messages.committerOnTime, this.blame.AuthorName, this.blame.Time)));
				return titleDiv;
			};
			var model = this.getModel();
			this.showAnnotations(blameMarkers, [
				AT.ANNOTATION_BLAME,
				AT.ANNOTATION_CURRENT_BLAME
			], function (blameMarker) {
				var start = model.getLineStart(blameMarker.Start - 1);
				var end = model.getLineEnd(blameMarker.End - 1, true);
				var annotation = mAnnotations.AnnotationType.createAnnotation(AT.ANNOTATION_BLAME, start, end, title);
				var blameColor = blameRGB.slice(0);
				blameColor.push(blameMarker.Shade);
				annotation.style = objects.mixin({}, annotation.style);
				annotation.style.style = objects.mixin({}, annotation.style.style);
				annotation.style.style.backgroundColor = "rgba(" + blameColor.join() + ")"; //$NON-NLS-0$ //$NON-NLS-1$
				annotation.groupId = blameMarker.Name;
				annotation.groupType = AT.ANNOTATION_CURRENT_BLAME;
				annotation.createGroupAnnotation = createGroup;
				annotation.html = '<img class="annotationHTML blame" src="' + blameMarker.AuthorImage + '"/>'; //$NON-NLS-0$ //$NON-NLS-1$
				annotation.blame = blameMarker;
				return annotation;
			});
		},

		/**
		 * Display git diff annotation on the editor's annotation ruler and overview ruler.
		 *
		 * @param diffs [] with types "added", "modified", "deleted"
		 * 		Each property in diffs contains an array of objects { lineStart, lineEnd } that
		 * 		provides the starting and ending line index for the specified property.
		 */
		showDiffAnnotations: function(diffs) {
			this.showAnnotations(diffs, [
				AT.ANNOTATION_DIFF_ADDED,
				AT.ANNOTATION_DIFF_MODIFIED,
				AT.ANNOTATION_DIFF_DELETED
			], null, function(annotation) {
				if(annotation.type === "added")//$NON-NLS-0$
					return AT.ANNOTATION_DIFF_ADDED;
				else if (annotation.type === "modified")//$NON-NLS-0$
					return AT.ANNOTATION_DIFF_MODIFIED;
				return AT.ANNOTATION_DIFF_DELETED; // assume deleted if not added or modified
			});
		},

		/**
		 * Reveals and selects a portion of text.
		 * @param {Number} start
		 * @param {Number} end
		 * @param {Number} line
		 * @param {Number} offset
		 * @param {Number} length
		 */
		showSelection: function(start, end, line, offset, len) {
			// We use typeof because we need to distinguish the number 0 from an undefined or null parameter
			if (typeof(start) === "number") { //$NON-NLS-0$
				if (typeof(end) !== "number") { //$NON-NLS-0$
					end = start;
				}
				this.moveSelection(start, end);
				return true;
			} else if (typeof(line) === "number") { //$NON-NLS-0$
				var model = this.getModel();
				var pos = model.getLineStart(line-1);
				if (typeof(offset) === "number") { //$NON-NLS-0$
					pos = pos + offset;
				}
				if (typeof(len) !== "number") { //$NON-NLS-0$
					len = 0;
				}
				this.moveSelection(pos, pos+len);
				return true;
			}
			return false;
		},

		/**
		 * @private
		 */
		_setModelText: function(contents) {
			if (this._textView) {
				this._textView.setText(contents);
				this._textView.getModel().setLineDelimiter("auto"); //$NON-NLS-0$
				this._highlightCurrentLine(this._textView.getSelections());
			}
		},
		
		/**
		 * Sets the editor's noFocus flag.
		 *
		 * @param {Boolean} if true, does not set focus on the editor.
		 * @param {Boolean} noFocus
		 */
		setNoFocus: function(noFocus) {
			this._noFocus = noFocus;
		},
		/**
		 * Sets the editor's contents.
		 *
		 * @param {String} title
		 * @param {String} message
		 * @param {String} contents
		 * @param {Boolean} contentsSaved
		 * @param {Boolean} noFocus
		 */
		setInput: function(title, message, contents, contentsSaved, noFocus) {
			BaseEditor.prototype.setInput.call(this, title, message, contents, contentsSaved);
			if (this._textView && !contentsSaved && !noFocus && !this._noFocus) {
				this._textView.focus();
			}
		},
		/**
		 * Reveals a line in the editor, and optionally selects a portion of the line.
		 * @param {Number} line - document base line index
		 * @param {Number|String} column
		 * @param {Number} [end]
		 */
		onGotoLine: function(line, column, end, callback) {
			if (this._textView) {
				var model = this.getModel();
				line = Math.max(0, Math.min(line, model.getLineCount() - 1));
				var lineStart = model.getLineStart(line);
				var start = 0;
				if (end === undefined) {
					end = 0;
				}
				if (typeof column === "string") { //$NON-NLS-0$
					var index = model.getLine(line).indexOf(column);
					if (index !== -1) {
						start = index;
						end = start + column.length;
					}
				} else {
					start = column;
					var lineLength = model.getLineEnd(line) - lineStart;
					start = Math.min(start, lineLength);
					end = Math.min(end, lineLength);
				}
				this.moveSelection(lineStart + start, lineStart + end, callback);
			}
		}
	});

	return {
		BaseEditor: BaseEditor,
		Editor: Editor
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define("orion/editor/find", [ //$NON-NLS-0$
	'i18n!orion/editor/nls/messages', //$NON-NLS-0$
	'orion/keyBinding', //$NON-NLS-0$
	'orion/editor/keyModes', //$NON-NLS-0$
	'orion/editor/annotations', //$NON-NLS-0$
	'orion/regex', //$NON-NLS-0$
	'orion/objects', //$NON-NLS-0$
	'orion/Deferred', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(messages, mKeyBinding, mKeyModes, mAnnotations, mRegex, objects, Deferred, util) {

	var exports = {};
	
	function IncrementalFind(editor) {
		var textView = editor.getTextView();
		mKeyModes.KeyMode.call(this, textView);
		this.editor = editor;
		this._active = false;
		this._success = true;
		this._ignoreSelection = false;
		this._prefix = "";
		
		textView.setAction("incrementalFindCancel", function() { //$NON-NLS-0$
			this.setActive(false);
			return true;
		}.bind(this));
		textView.setAction("incrementalFindBackspace", function() { //$NON-NLS-0$
			return this._backspace();
		}.bind(this));
		
		var self = this;
		this._listener = {
			onVerify: function(e){
				var editor = self.editor;
				var model = editor.getModel();
				var start = editor.mapOffset(e.start), end = editor.mapOffset(e.end);
				var txt = model.getText(start, end);
				var prefix = self._prefix;
				// TODO: mRegex is pulled in just for this one call so we can get case-insensitive search
				// is it really necessary
				var match = prefix.match(new RegExp("^" + mRegex.escape(txt), "i")); //$NON-NLS-1$ //$NON-NLS-0$
				if (match && match.length > 0) {
					prefix = self._prefix += e.text;
					self._success = true;
					self._status();
					self.find(self._forward, true);
					e.text = null;
				}
			},
			onSelection: function() {
				if (!self._ignoreSelection) {
					self.setActive(false);
				}
			}
		};
	}
	IncrementalFind.prototype = new mKeyModes.KeyMode();
	objects.mixin(IncrementalFind.prototype, {
		createKeyBindings: function() {
			var KeyBinding = mKeyBinding.KeyBinding;
			var bindings = [];
			bindings.push({actionID: "incrementalFindBackspace", keyBinding: new KeyBinding(8)}); //$NON-NLS-0$
			bindings.push({actionID: "incrementalFindCancel", keyBinding: new KeyBinding(13)}); //$NON-NLS-0$
			bindings.push({actionID: "incrementalFindCancel", keyBinding: new KeyBinding(27)}); //$NON-NLS-0$
			bindings.push({actionID: "incrementalFindReverse", keyBinding: new KeyBinding(38)}); //$NON-NLS-0$
			bindings.push({actionID: "incrementalFind", keyBinding: new KeyBinding(40)}); //$NON-NLS-0$
			bindings.push({actionID: "incrementalFindReverse", keyBinding: new KeyBinding('k', true, true)}); //$NON-NLS-1$ //$NON-NLS-0$
			bindings.push({actionID: "incrementalFind", keyBinding: new KeyBinding('k', true)}); //$NON-NLS-1$ //$NON-NLS-0$
			return bindings;
		},
		find: function(forward, incremental) {
			this._forward = forward;
			if (!this.isActive()) {
				this.setActive(true);
				return false;
			}
			var prefix = this._prefix;
			if (prefix.length === 0) {
				return false;
			}
			var editor = this.editor;
			var model = editor.getModel();
			var start;
			if (forward) {
				if (this._success) {
					start = incremental ? this._start : editor.getCaretOffset() + 1;
				} else {
					start = 0;
				}
			} else {
				if (this._success) {
					start = incremental ? this._start : editor.getCaretOffset();
				} else {
					start = model.getCharCount() - 1;
				}
			}
			Deferred.when(editor.getModel().find({
				string: prefix,
				start: start,
				reverse: !forward,
				caseInsensitive: prefix.toLowerCase() === prefix}), 
				function(iterator) {
					var findResult = iterator.next();
					if (findResult) {
						if (!incremental) {
							this._start = start;
						}
						this._success = true;
						this._ignoreSelection = true;
						editor.moveSelection(forward ? findResult.start : findResult.end, forward ? findResult.end : findResult.start);
						this._ignoreSelection = false;
					} else {
						this._success = false;
					}
					this._status();
			}.bind(this));
			return true;
		},
		isActive: function() {
			return this._active;
		},
		isStatusActive: function() {
			return this.isActive();
		},
		setActive: function(active) {
			if (this._active === active) {
				return;
			}
			this._active = active;
			this._prefix = "";
			this._success = true;
			var editor = this.editor;
			var textView = editor.getTextView();
			this._start = this.editor.getCaretOffset();
			this.editor.setCaretOffset(this._start);
			if (this._active) {
				textView.addEventListener("Verify", this._listener.onVerify); //$NON-NLS-0$
				textView.addEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
				textView.addKeyMode(this);
			} else {
				textView.removeEventListener("Verify", this._listener.onVerify); //$NON-NLS-0$
				textView.removeEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
				textView.removeKeyMode(this);
			}
			this._status();
		},
		_backspace: function() {
			var prefix = this._prefix;
			prefix = this._prefix = prefix.substring(0, prefix.length-1);
			if (prefix.length === 0) {
				this._success = true;
				this._ignoreSelection = true;
				this.editor.setCaretOffset(this.editor.getSelection().start);
				this._ignoreSelection = false;
				this._status();
				return true;
			}
			return this.find(this._forward, true);
		},
		_status: function() {
			if (!this.isActive()) {
				this.editor.reportStatus("");
				return;
			}
			var msg;
			if (this._forward) {
				msg = this._success ? messages.incrementalFindStr : messages.incrementalFindStrNotFound;
			} else {
				msg = this._success ? messages.incrementalFindReverseStr : messages.incrementalFindReverseStrNotFound;
			}
			msg = util.formatMessage(msg, this._prefix);
			this.editor.reportStatus(msg, this._success ? "" : "error"); //$NON-NLS-0$
		}
	});
	exports.IncrementalFind = IncrementalFind;
	
	
	function Find(editor, undoStack, options) {
		if (!editor) { return; }	
		this._editor = editor;
		this._undoStack = undoStack;
		this._showAll = true;
		this._selectedLines = false;
		this._visible = false;
		this._caseInsensitive = true;
		this._wrap = true;
		this._wholeWord = false;
		this._incremental = true;
		this._regex = false;
		this._findAfterReplace = true;
		this._hideAfterFind = false;
		this._reverse = false;
		this._start = undefined;
		this._end = undefined;
		this._timer = undefined;
		this._lastString = "";
		var that = this;
		this._listeners = {
			onEditorFocus: function(e) {
				that._removeCurrentAnnotation(e);
				that.setOptions({selectedLines: false});
			}
		};
		this.setOptions(options);
	}
	Find.prototype = {
		find: function (forward, tempOptions, incremental) {
			this.setOptions({
				reverse : !forward
			});
			var string = this.getFindString();
			var count;
			if (tempOptions) {
				string = tempOptions.findString || string;
				count =  tempOptions.count;
			}
			var savedOptions = this.getOptions();
			this.setOptions(tempOptions);
			var startOffset = incremental ? this._startOffset : this.getStartOffset();
			return this._doFind(string, startOffset, count).then(function(result) {
				if (result) {
					if (!incremental) {
						this._startOffset = result.start;
					}
				}
				this.setOptions(savedOptions);
				if (this._hideAfterFind) {
					this.hide();
				}
				return result;
			}.bind(this));
		},
		getStartOffset: function() {
			if(this.isRangeSearch()) {
				var where = this._editor.getCaretOffset();
				if (this._reverse) {
					where = this._editor.getSelection().start -1;
				}
				if(where >= this._searchRangeModel.start && where <= this._searchRangeModel.end) {
					return where;
				} 
				return this._searchRangeModel.start;
			}
			if (this._reverse) {
				return this._editor.getSelection().start - 1;
			}
			return this._editor.getCaretOffset();
		},
		getFindString: function() {
			var selection = this._editor.getSelection();
			var searchString = this._editor.getText(selection.start, selection.end);
			if (this._regex) {
				searchString = mRegex.escape(searchString);
			}
			return searchString || this._lastString;
		},
		getOptions: function() {
			return {
				showAll: this._showAll, 
				caseInsensitive: this._caseInsensitive, 
				wrap: this._wrap, 
				wholeWord: this._wholeWord, 
				incremental: this._incremental,
				regex: this._regex,
				findAfterReplace: this._findAfterReplace,
				hideAfterFind: this._hideAfterFind,
				reverse: this._reverse,
				findCallback: this._findCallback,
				start: this._start,
				end: this._end
			};
		},
		getReplaceString: function() {
			return "";
		},
		hide: function() {
			this._visible = false;
			if (this._savedOptions) {
				this.setOptions(this._savedOptions.pop());
				if (this._savedOptions.length === 0) {
					this._savedOptions = null;
				}
			}
			this._removeAllAnnotations();
			if(this._selectedLines) {
				this.setOptions({selectedLines: false});
			}
			var textView = this._editor.getTextView();
			if (textView) {
				textView.removeEventListener("Focus", this._listeners.onEditorFocus); //$NON-NLS-0$
				textView.focus();
			}
		},
		_processReplaceString: function(str) {
			var newStr = str;
			if (this._regex) {
				newStr = "";
				var escape = false;
				var delimiter = this._editor.getModel().getLineDelimiter();
				for (var i=0; i<str.length; i++) {
					var c = str.substring(i, i + 1);
					if (escape) {
						switch (c) {
							case "R": newStr += delimiter; break;
							case "r": newStr += "\r"; break;
							case "n": newStr += "\n"; break;
							case "t": newStr += "\t"; break;
							case "\\": newStr += "\\"; break;
							default: newStr += "\\" + c;
						}
						escape = false;
					} else if (c === "\\") {
						escape = true;
					} else {
						newStr += c;
					}
				}
				if (escape) {
					newStr += "\\";
				}
			}
			return newStr;
		},
		isVisible: function() {
			return this._visible;
		},
		replace: function() {
			var string = this.getFindString();
			if (string) {
				var editor = this._editor;
				var replaceString = this._processReplaceString(this.getReplaceString());
				var selection = editor.getSelection();
				var start = selection.start;
				Deferred.when(this._editor.getModel().find({
					string: string,
					start: start,
					rangeStart: this._searchRangeModel ? this._searchRangeModel.start : undefined,
					rangeEnd: this._searchRangeModel ? this._searchRangeModel.end : undefined,
					reverse: false,
					wrap: this._wrap,
					regex: this._regex,
					wholeWord: this._wholeWord,
					caseInsensitive: this._caseInsensitive
				})).then( function(iterator) {
					if(!iterator) {
						return;
					}
					var result = iterator.next();
					if (result) {
						this.startUndo();
						this._doReplace(result.start, result.end, string, replaceString);
						this.endUndo();
					}
					if (this._findAfterReplace){
						this._doFind(string, this.getStartOffset());
					}
				}.bind(this));
			}
		},
		replaceAll : function() {
			var string = this.getFindString();
			if (string) {
				this._replacingAll = true;
				var editor = this._editor;
				var textView = editor.getTextView();
				editor.reportStatus(messages.replacingAll);
				var replaceString = this._processReplaceString(this.getReplaceString());
				var self = this;
				window.setTimeout(function() {
					var startPos = 0;
					var count = 0;
					while (true) {
						//For replace all, we need to ignore the wrap search from the user option
						//Otherwise the loop will be dead, see https://bugs.eclipse.org/bugs/show_bug.cgi?id=411813
						var result = self._doFindForReplaceAll(string, startPos, null, true);
						if (!result) {
							break;
						}
						count++;
						if (count === 1) {
							textView.setRedraw(false);
							self.startUndo();
						}
						self._doReplace(result.start, result.end, string, replaceString);
						startPos = self.getStartOffset();
					}
					if (count > 0) {
						self.endUndo();
						textView.setRedraw(true);
					}
					if (startPos > 0) {
						editor.reportStatus(util.formatMessage(messages.replacedMatches, count));
					} else {
						editor.reportStatus(messages.nothingReplaced, "error"); //$NON-NLS-0$ 
					}
					self._replacingAll = false;
				}, 100);				
			}
		},
		/**
		 * @property {String} string the search string to be found.
		 * @property {Boolean} [regex=false] whether or not the search string is a regular expression.
		 * @property {Boolean} [wrap=false] whether or not to wrap search.
		 * @property {Boolean} [wholeWord=false] whether or not to search only whole words.
		 * @property {Boolean} [caseInsensitive=false] whether or not search is case insensitive.
		 * @property {Boolean} [reverse=false] whether or not to search backwards.
		 * @property {Number} [start=0] The start offset to start searching
		 * @property {Number} [end=charCount] The end offset of the search. Used to search in a given range.	
		 */
		setOptions : function(options) {
			if (options) {
				if ((options.showAll === true || options.showAll === false) && this._showAll !== options.showAll) {
					this._showAll = options.showAll;
					if (this.isVisible()) {
						if (this._showAll) {
							this._markAllOccurrences();
						} else {
							var annotationModel = this._editor.getAnnotationModel();
							if (annotationModel) {
								annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_MATCHING_SEARCH);
							}
						}
					}
				}
				if ((options.selectedLines === true || options.selectedLines === false) && this._selectedLinesl !== options.selectedLines) {
					this._selectedLines = options.selectedLines;
					if (this._selectedLines) {
						this.annotateSearchRange(options.multipleLine);
					} else {
						this.annotateSearchRange(options.multipleLine, true);
					}
					this.postSelectedLines();
				}
				if (options.caseInsensitive === true || options.caseInsensitive === false) {
					this._caseInsensitive = options.caseInsensitive;
				}
				if (options.wrap === true || options.wrap === false) {
					this._wrap = options.wrap;
				}
				if (options.wholeWord === true || options.wholeWord === false) {
					this._wholeWord = options.wholeWord;
				}
				//Allow extended TextModelFactory to disable incremental find
				if (options.incremental === true || options.incremental === false || options.incremental === "disabled") {
					if(options.incremental === "disabled") {
						this._incremental = false;
						this._incrementalDisabled = true;
					} else {
						this._incremental = options.incremental;
					}
				}
				if (options.regex === true || options.regex === false) {
					this._regex = options.regex;
				}
				if (options.findAfterReplace === true || options.findAfterReplace === false) {
					this._findAfterReplace = options.findAfterReplace;
				}
				if (options.hideAfterFind === true || options.hideAfterFind === false) {
					this._hideAfterFind = options.hideAfterFind;
				}
				if (options.reverse === true || options.reverse === false) {
					this._reverse = options.reverse;
				}
				if (options.hasOwnProperty("findCallback")) { //$NON-NLS-0$
					this._findCallback = options.findCallback;
				}
				if (options.hasOwnProperty("start")) { //$NON-NLS-0$	
					this._start = options.start;
				}
				if (options.hasOwnProperty("end")) { //$NON-NLS-0$
					this._end = options.end;
				}
			}
		},
		show: function(tempOptions) {
			this._visible = true;
			if (tempOptions) {
				if (!this._savedOptions) {
					this._savedOptions = [];
				}	
				this._savedOptions.push(this.getOptions());
				this.setOptions(tempOptions);
				if(tempOptions.findString && this._regex) {
					tempOptions.findString = mRegex.escape(tempOptions.findString);
					tempOptions.findString = tempOptions.findString.split("\n").join("\\n");
					tempOptions.findString = tempOptions.findString.split("\r").join("\\r");
					tempOptions.findString = tempOptions.findString.split("\t").join("\\t");
				}
			}
			this._startOffset = this._editor.getSelection().start;
			this._editor.getTextView().addEventListener("Focus", this._listeners.onEditorFocus); //$NON-NLS-0$
			var self = this;
			window.setTimeout(function() {
				if (self._incremental) {
					self.find(true, null, true);
				}
			}, 0);
		},
		startUndo: function() {
			if (this._undoStack) {
				this._undoStack.startCompoundChange();
			}
		}, 
		endUndo: function() {
			if (this._undoStack) {
				this._undoStack.endCompoundChange();
			}
		},
		isRangeSearch: function() {
			return this._searchRangeModel !== null && this._searchRangeModel !== undefined;
		},
		annotateSearchRange: function(multipleLine, remove) {
			var type = mAnnotations.AnnotationType.ANNOTATION_SEARCH_RANGE;
			var annotationModel = this._editor.getAnnotationModel();
			if (annotationModel) {
				annotationModel.removeAnnotations(type);
				this.setOptions({start: undefined, end: undefined});
				this._selectedLines = false;
				this._searchRangeModel = null;
				if(remove) {
					return;
				}
				var selection = this._editor.getSelection();
				var textModel = this._editor.getModel();
				var startL = 0;
				var endL = 0;
				if(textModel) {
					endL = startL = textModel.getLineAtOffset(selection.start);
					if(selection.start !== selection.end) {
						endL = textModel.getLineAtOffset(selection.end - 1);
					}
				}
				if(endL > startL || !multipleLine) {
					this._selectedLines = true;
	 		 		var rangeStart = textModel.getLineStart(startL);
	 		 		var rangeEnd = textModel.getLineEnd(endL, true);
					this._editor.setSelection(rangeStart, rangeStart, true);
					annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_CURRENT_LINE);
					this.setOptions({start: rangeStart, end: rangeEnd});
					this._searchRangeModel = mAnnotations.AnnotationType.createAnnotation(type, rangeStart, rangeEnd);
	 		 		annotationModel.addAnnotation(this._searchRangeModel);
				}
			}
		},
		postSelectedLines: function(/*selectedLines*/) {
		},
		_findFromModel: function(string, startOffset, noWrap) {
			return this._editor.getModel().find({
				string: string,
				start: startOffset,
				rangeStart: this._searchRangeModel ? this._searchRangeModel.start : undefined,
				rangeEnd: this._searchRangeModel ? this._searchRangeModel.end : undefined,
				reverse: this._reverse,
				wrap: noWrap ? false: this._wrap,
				regex: this._regex,
				wholeWord: this._wholeWord,
				caseInsensitive: this._caseInsensitive
			});
		},
		
		_find: function(editor, string, startOffset, noWrap) {
			var iterator;
			if (this._regex) {
				try {
					iterator = this._findFromModel(string, startOffset, noWrap);
				} catch (ex) {
					editor.reportStatus(ex.message, "error"); //$NON-NLS-0$
					return null;
				}
			} else {
				iterator = this._findFromModel(string, startOffset, noWrap);
			}
			return iterator;
		},
		
		_doFindForReplaceAll: function(string, startOffset, count, noWrap) {
			count = count || 1;
			var editor = this._editor;
			if (!string) {
				this._removeAllAnnotations();
				return null;
			}
			this._lastString = string;
			var result, iterator;
			iterator = this._find(editor, string, startOffset, noWrap);
			if(!iterator) {
				return null;
			}
			if(!iterator.hasNext || !iterator.next) {
				return null;
			}
			for (var i=0; i<count && iterator.hasNext(); i++) {
				result = iterator.next();
			}
			return result;
		},
		
		_doFind: function(string, startOffset, count, noWrap) {
			count = count || 1;
			var editor = this._editor;
			if (!string) {
				this._removeAllAnnotations();
				return new Deferred().resolve();
			}
			this._lastString = string;
			var result;
			return Deferred.when(this._find(editor, string, startOffset, noWrap)).then( function(iterator) {
				if(!iterator) {
					return;
				}
				for (var i=0; i<count && iterator.hasNext(); i++) {
					result = iterator.next();
				}
				if (!this._replacingAll) {
					if (result) {
						this._editor.reportStatus("");
					} else {
						this._editor.reportStatus(messages.notFound, "error"); //$NON-NLS-0$
					}
					if (this.isVisible()) {
						var type = mAnnotations.AnnotationType.ANNOTATION_CURRENT_SEARCH;
						var annotationModel = editor.getAnnotationModel();
						if (annotationModel) {
							annotationModel.removeAnnotations(type);
							if (result) {
								annotationModel.addAnnotation(mAnnotations.AnnotationType.createAnnotation(type, result.start, result.end));
							}
						}
						if (this._showAll) {
							if (this._timer) {
								window.clearTimeout(this._timer);
							}
							var that = this;
							this._timer = window.setTimeout(function(){
								that._markAllOccurrences();
								that._timer = null;
							}, 500);
						}
					}
					if (this._findCallback) {
						this._findCallback(result);
					}
					else if (result) {
						editor.moveSelection(result.start, result.end, null, false);
					}
				}
				return result;
			}.bind(this));
		},
		_doReplace: function(start, end, searchStr, newStr) {
			var editor = this._editor;
			if (this._regex) {
				newStr = editor.getText(start, end).replace(new RegExp(searchStr, this._caseInsensitive ? "i" : ""), newStr); //$NON-NLS-0$
			}
			editor.setText(newStr, start, end);
			editor.setSelection(start, start + newStr.length, true);
		},
		_markAllOccurrences: function() {
			var annotationModel = this._editor.getAnnotationModel();
			if (!annotationModel) {
				return;
			}
			var type = mAnnotations.AnnotationType.ANNOTATION_MATCHING_SEARCH;
			var iter = annotationModel.getAnnotations();
			var remove = [], add;
			while (iter.hasNext()) {
				var annotation = iter.next();
				if (annotation.type === type) {
					remove.push(annotation);
				}
			}
			if (this.isVisible()) {
				var string = this.getFindString();
				Deferred.when(this._editor.getModel().find({
					string: string,
					start: this._start,
					rangeStart: this._searchRangeModel ? this._searchRangeModel.start : undefined,
					rangeEnd: this._searchRangeModel ? this._searchRangeModel.end : undefined,
					regex: this._regex,
					wholeWord: this._wholeWord,
					caseInsensitive: this._caseInsensitive
				})).then( function(iterator) {
					if(!iterator) {
						return;
					}
					add = [];
					while (iterator.hasNext()) {
						var range = iterator.next();
						add.push(mAnnotations.AnnotationType.createAnnotation(type, range.start, range.end));
					}
					annotationModel.replaceAnnotations(remove, add);
				}.bind(this));
			} else {
				annotationModel.replaceAnnotations(remove, add);
			}
		},
		_removeAllAnnotations: function() {
			var annotationModel = this._editor.getAnnotationModel();
			if (annotationModel) {
				annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_CURRENT_SEARCH);
				annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_MATCHING_SEARCH);
			}
		},
		_removeCurrentAnnotation: function(evt){
			var annotationModel = this._editor.getAnnotationModel();
			if (annotationModel) {
				annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_CURRENT_SEARCH);
			}
		}
	};
	exports.Find = Find;
	
	return exports;
});

/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others. All rights reserved.
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 * 
 * Contributors: 
 *	IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define('orion/editor/findUI',[
	'i18n!orion/editor/nls/messages',
	'orion/editor/find',
	'orion/objects',
	'orion/editor/util',
	'orion/util', 
], function(messages, mFind, objects, textUtil, util) {
	
	function FindUI(editor, undoStack, options) {
		mFind.Find.call(this, editor, undoStack, options);
	}
	
	FindUI.prototype = new mFind.Find();
	
	objects.mixin(FindUI.prototype, {
		getFindString: function() {
			var input = this._findInput;
			if (!input) {
				return mFind.Find.prototype.getFindString.call(this);
			}
			return input.value;
		},
		getReplaceString: function() {
			var input = this._replaceInput;
			if (!input) {
				return mFind.Find.prototype.getReplaceString(this);
			}
			return input.value;
		},
		hide: function() {
			var visible = this.isVisible();
			mFind.Find.prototype.hide.call(this);
			if (visible) {
				this._rootDiv.className = "textViewFind"; //$NON-NLS-0$
			}
		},
		show: function(options) {
			mFind.Find.prototype.show.call(this, options);
			var findString = options.findString;
			var replaceString = options.replaceString;
			var input = this._findInput;
			if (!input) {
				this._create();
				input = this._findInput;
			}
			if (findString) {
				input.value = findString;
			}
			if (replaceString) {
				var replaceInput = this._replaceInput;
				replaceInput.value = replaceString;
			}
			var that = this;
			this.setOptions({selectedLines: true, multipleLine: true});
			window.setTimeout(function() {
				that._rootDiv.className = "textViewFind show"; //$NON-NLS-0$
				input.select();
				input.focus();
			}, 0);
		},
		postSelectedLines: function(/*selectedLines*/) {
			if(this._selectedLinesUI) {
				this._checked(this._selectedLines, this._selectedLinesUI);
			}
		},
		_create: function() {
			var that = this;
			var view = this._editor.getTextView();
			var parent = view.getOptions("parent"); //$NON-NLS-0$
			var document = parent.ownerDocument; //$NON-NLS-0$
			var root = util.createElement(document, 'div'); //$NON-NLS-0$
			root.className = "textViewFind"; //$NON-NLS-0$
			textUtil.addEventListener(root, "keydown", function(e) { that._handleKeyDown(e); }); //$NON-NLS-0$
			this._rootDiv = root;
			root.setAttribute("role", "dialog");
			root.setAttribute("aria-label", messages.findReplace);
			this._createContents(document, root);
			view._rootDiv.insertBefore(root, view._rootDiv.firstChild);
		},
		_createContents: function(document, parent) {
			var that = this;
			var findInput = util.createElement(document, 'input'); //$NON-NLS-0$
			findInput.className = "textViewFindInput"; //$NON-NLS-0$
			this._findInput = findInput;
			findInput.type = "text"; //$NON-NLS-0$
			findInput.placeholder = messages.findWith;
			textUtil.addEventListener(findInput, "input", function(evt) { //$NON-NLS-0$
				return that._handleInput(evt);
			});
			parent.appendChild(findInput);

			var group = util.createElement(document, 'span'); //$NON-NLS-0$
			that._createButton(document, group, messages.next, function() { that.find(true); });
			that._createButton(document, group, messages.previous, function() { that.find(false); });
			parent.appendChild(group);
			
			var readonly = that._editor.getTextView().getOptions("readonly"); //$NON-NLS-0$
			if (!readonly) {
				// create replace text
				var replaceInput = util.createElement(document, 'input'); //$NON-NLS-0$
				replaceInput.className = "textViewReplaceInput"; //$NON-NLS-0$
				this._replaceInput = replaceInput;
				replaceInput.type = "text"; //$NON-NLS-0$
				replaceInput.placeholder = messages.replaceWith;
				parent.appendChild(replaceInput);
				group = util.createElement(document, 'span'); //$NON-NLS-0$
				that._createButton(document, group, messages.replace, function() { that.replace(); });
				that._createButton(document, group, messages.replaceAll, function() { that.replaceAll(); });
				parent.appendChild(group);
			}

			group = util.createElement(document, 'span'); //$NON-NLS-0$
			that._selectedLinesUI = that._createButton(document, group, messages.selectedLines, function(evt) { that._toggle("selectedLines", evt.target); }, this._selectedLines, messages.selectedLinesTooltip, messages.selectedLinesTooltip); //$NON-NLS-0$
			that._createButton(document, group, messages.regex, function(evt) { that._toggle("regex", evt.target); }, this._regex, messages.regexTooltip, messages.regexTooltip); //$NON-NLS-0$
			that._createButton(document, group, messages.caseInsensitive, function(evt) { that._toggle("caseInsensitive", evt.target); }, this._caseInsensitive, messages.caseInsensitiveTooltip, messages.caseInsensitiveTooltip); //$NON-NLS-0$
			that._createButton(document, group, messages.wholeWord, function(evt) { that._toggle("wholeWord", evt.target); }, this._wholeWord, messages.wholeWordTooltip, messages.wholeWordTooltip); //$NON-NLS-0$
			parent.appendChild(group);

			var close = that._createButton(document, parent, "", function() { that.hide(); }); //$NON-NLS-0$
			close.className = "textViewFindCloseButton"; //$NON-NLS-0$
			close.title = messages.closeTooltip;
			util.confineDialogTab(findInput, close);
		},
		_createButton: function(document, parentDom, text, callback, checked, tooltip, ariaLabel) {
			var button  = document.createElement("button"); //$NON-NLS-0$
			button.type = "button"; //$NON-NLS-0$
			this._checked(checked, button);
			if (tooltip) button.title = tooltip;
			textUtil.addEventListener(button, "click", function(evt) { callback.call(this, evt); }, false); //$NON-NLS-0$
			if (text) {
				button.appendChild(document.createTextNode(text)); //$NON-NLS-0$
			}
			if (ariaLabel) {
				button.setAttribute("aria-label", ariaLabel);
			}
			parentDom.appendChild(button);
			return button;
		},
		_toggle: function(prop, button) {
			var options = {};
			options[prop] = !this["_" + prop]; //$NON-NLS-0$
			this._checked(options[prop], button);
			this.setOptions(options);
		},
		_checked: function(checked, button) {
			button.className = "textViewFindButton"; //$NON-NLS-0$
			if (checked) {
				button.className += " checked"; //$NON-NLS-0$
			}
		},
		_handleInput: function() {
			if (this._incremental) {
				this.find(true, null, true);
			}
			return true;
		},
		_handleKeyDown: function(evt) {
			var handled;
			var ctrlKeyOnly = (util.isMac ? evt.metaKey : evt.ctrlKey) && !evt.altKey && !evt.shiftKey;
			if (ctrlKeyOnly && evt.keyCode === 70/*"f"*/ ) {
				handled = true;
			}
			//We can't use ctrlKeyOnly on "k" because ctrl+shift+k means find previous match when the find bar gets focus
			if (((util.isMac ? evt.metaKey : evt.ctrlKey) && !evt.altKey && evt.keyCode === 75/*"k"*/) || evt.keyCode === 13/*enter*/){
				if (evt.keyCode === 13) {
					this.find(this._reverse ? evt.shiftKey : !evt.shiftKey);
				} else {
					this.find(!evt.shiftKey);
				}
				handled = true;
			}
			if (ctrlKeyOnly &&  evt.keyCode === 82 /*"r"*/){
				this.replace();
				handled = true;
			}
			if (evt.keyCode === 27/*ESC*/){
				this.hide();
				handled = true;
			}
			if (handled) {
				if (evt.stopPropagation) { 
					evt.stopPropagation(); 
				}
				if (evt.preventDefault) { 
					evt.preventDefault(); 
				}
				evt.cancelBubble = true;
				return false;
			}
			return true;
		}
	});

	return {FindUI: FindUI};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013, 2017 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define("orion/editor/actions", [ //$NON-NLS-0$
	'i18n!orion/editor/nls/messages', //$NON-NLS-0$
	'orion/keyBinding', //$NON-NLS-0$
	'orion/editor/annotations', //$NON-NLS-0$
	'orion/editor/tooltip', //$NON-NLS-0$
	'orion/editor/find', //$NON-NLS-0$
	'orion/editor/findUI', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(messages, mKeyBinding, mAnnotations, mTooltip, mFind, mFindUI, util) {

	var AT = mAnnotations.AnnotationType;

	var exports = {};
	
	function forEachSelection(actions, compound, callback, noUndo) {
		var offset = 0;
		var editor = actions.editor;
		var selections = editor.getSelections();
		if (!noUndo && (compound || selections.length > 1)){ actions.startUndo(); }
		function setText(text, start, end) {
			editor.setText(text, start, end);
			offset += (start - end) + text.length;
		}
		selections.forEach(function(selection) {
			selection.start += offset;
			selection.end += offset;
			callback(selection, setText);
		});
		editor.setSelections(selections);
		if (!noUndo && (compound || selections.length > 1)){ actions.endUndo(); }
	}

	/**
	 * TextActions connects common text editing keybindings onto an editor.
	 */
	function TextActions(editor, undoStack, find) {
		this.editor = editor;
		this.undoStack = undoStack;
		this._incrementalFind = new mFind.IncrementalFind(editor);
		this._find = find ? find : new mFindUI.FindUI(editor, undoStack);
		this._lastEditLocation = null;
		this.init();
	}

	TextActions.prototype = {
		init: function() {
			var textView = this.editor.getTextView();

			this._lastEditListener = {
				onModelChanged: function(e) {
					if (this.editor.isDirty()) {
						this._lastEditLocation = e.start + e.addedCharCount;
					}
				}.bind(this)
			};
			textView.addEventListener("ModelChanged", this._lastEditListener.onModelChanged); //$NON-NLS-0$

			textView.setAction("undo", function(data) { //$NON-NLS-0$
				if (this.undoStack) {
					var count = 1;
					if (data && data.count) {
						count = data.count;
					}
					while (count > 0) {
						this.undoStack.undo();
						--count;
					}
					return true;
				}
				return false;
			}.bind(this), {name: messages.undo});

			textView.setAction("redo", function(data) { //$NON-NLS-0$
				if (this.undoStack) {
					var count = 1;
					if (data && data.count) {
						count = data.count;
					}
					while (count > 0) {
						this.undoStack.redo();
						--count;
					}
					return true;
				}
				return false;
			}.bind(this), {name: messages.redo});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("f", true), "find"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("find", function() { //$NON-NLS-0$
				if (this._find) {
					var selection = this.editor.getSelection();
					this._find.show({findString:this.editor.getText(selection.start, selection.end)});
					return true;
				}
				return false;
			}.bind(this), {name: messages.find});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("k", true), "findNext"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("findNext", function(options) { //$NON-NLS-0$
				if (this._find){
					this._find.find(true, options);
					return true;
				}
				return false;
			}.bind(this), {name: messages.findNext});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("k", true, true), "findPrevious"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("findPrevious", function(options) { //$NON-NLS-0$
				if (this._find){
					this._find.find(false, options);
					return true;
				}
				return false;
			}.bind(this), {name: messages.findPrevious});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("j", true), "incrementalFind"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("incrementalFind", function() { //$NON-NLS-0$
				if (this._incrementalFind) {
					this._incrementalFind.find(true);
				}
				return true;
			}.bind(this), {name: messages.incrementalFind});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("j", true, true), "incrementalFindReverse"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("incrementalFindReverse", function() { //$NON-NLS-0$
				if (this._incrementalFind) {
					this._incrementalFind.find(false);
				}
				return true;
			}.bind(this), {name: messages.incrementalFindReverse});

			textView.setAction("tab", function() { //$NON-NLS-0$
				return this.indentLines();
			}.bind(this));

			textView.setAction("shiftTab", function() { //$NON-NLS-0$
				return this.unindentLines();
			}.bind(this), {name: messages.unindentLines});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(38, false, false, true), "moveLinesUp"); //$NON-NLS-0$
			textView.setAction("moveLinesUp", function() { //$NON-NLS-0$
				return this.moveLinesUp();
			}.bind(this), {name: messages.moveLinesUp});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(40, false, false, true), "moveLinesDown"); //$NON-NLS-0$
			textView.setAction("moveLinesDown", function() { //$NON-NLS-0$
				return this.moveLinesDown();
			}.bind(this), {name: messages.moveLinesDown});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(38, true, false, true), "copyLinesUp"); //$NON-NLS-0$
			textView.setAction("copyLinesUp", function() { //$NON-NLS-0$
				return this.copyLinesUp();
			}.bind(this), {name: messages.copyLinesUp});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(40, true, false, true), "copyLinesDown"); //$NON-NLS-0$
			textView.setAction("copyLinesDown", function() { //$NON-NLS-0$
				return this.copyLinesDown();
			}.bind(this), {name: messages.copyLinesDown});

			textView.setKeyBinding(new mKeyBinding.KeyBinding('d', true, false, false), "deleteLines"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("deleteLines", function(data) { //$NON-NLS-0$
				return this.deleteLines(data);
			}.bind(this), {name: messages.deleteLines});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("l", !util.isMac, false, false, util.isMac), "gotoLine"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("gotoLine", function() { //$NON-NLS-0$
				return this.gotoLine();
			}.bind(this), {name: messages.gotoLine});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(190, true), "nextAnnotation"); //$NON-NLS-0$
			textView.setAction("nextAnnotation", function() { //$NON-NLS-0$
				return this.nextAnnotation(true);
			}.bind(this), {name: messages.nextAnnotation});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(188, true), "previousAnnotation"); //$NON-NLS-0$
			textView.setAction("previousAnnotation", function() { //$NON-NLS-0$
				return this.nextAnnotation(false);
			}.bind(this), {name: messages.prevAnnotation});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("e", true, false, true, false), "expand"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("expand", function() { //$NON-NLS-0$
				return this.expandAnnotation(true);
			}.bind(this), {name: messages.expand});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("c", true, false, true, false), "collapse"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("collapse", function() { //$NON-NLS-0$
				return this.expandAnnotation(false);
			}.bind(this), {name: messages.collapse});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("e", true, true, true, false), "expandAll"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("expandAll", function() { //$NON-NLS-0$
				return this.expandAnnotations(true);
			}.bind(this), {name: messages.expandAll});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("c", true, true, true, false), "collapseAll"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("collapseAll", function() { //$NON-NLS-0$
				return this.expandAnnotations(false);
			}.bind(this), {name: messages.collapseAll});

			textView.setKeyBinding(new mKeyBinding.KeyBinding("q", !util.isMac, false, false, util.isMac), "lastEdit"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("lastEdit", function() { //$NON-NLS-0$
				return this.gotoLastEdit();
			}.bind(this), {name: messages.lastEdit});
		},
		copyLinesDown: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var lineCount = model.getLineCount();
				var delimiter = "";
				var text = model.getText(lineStart, lineEnd);
				if (lastLine === lineCount-1) {
					text = (delimiter = model.getLineDelimiter()) + text;
				}
				var insertOffset = lineEnd;
				setText(text, insertOffset, insertOffset);
				selection.start = insertOffset + delimiter.length;
				selection.end = insertOffset + text.length;
			});
			return true;
		},
		copyLinesUp: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var lineCount = model.getLineCount();
				var delimiter = "";
				var text = model.getText(lineStart, lineEnd);
				if (lastLine === lineCount-1) {
					text += (delimiter = model.getLineDelimiter());
				}
				var insertOffset = lineStart;
				setText(text, insertOffset, insertOffset);
				selection.start = insertOffset;
				selection.end = insertOffset + text.length - delimiter.length;
			});
			return true;
		},
		deleteLines: function(data) {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var count = 1;
			if (data && data.count) {
				count = data.count;
			}
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				var lineStart = model.getLineStart(firstLine);
				var lastLine;
				if (selection.start !== selection.end || count === 1) {
					lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				} else {
					lastLine = Math.min(firstLine + count - 1, model.getLineCount() - 1);
				}	
				var lineEnd = model.getLineEnd(lastLine, true);
				setText("", lineStart, lineEnd);
				selection.start = selection.end = lineStart;
			});
			return true;
		},
		expandAnnotation: function(expand) {
			var editor = this.editor;
			if (!editor.getFoldingRulerVisible()) return true;
			var annotationModel = editor.getAnnotationModel();
			if(!annotationModel) { return true; }
			var model = editor.getModel();
			var currentOffset = editor.getCaretOffset();
			var lineIndex = model.getLineAtOffset(currentOffset);
			var start = model.getLineStart(lineIndex);
			var end = model.getLineEnd(lineIndex, true);
			if (model.getBaseModel) {
				start = model.mapOffset(start);
				end = model.mapOffset(end);
				model = model.getBaseModel();
			}
			var annotation, iter = annotationModel.getAnnotations(start, end);
			while (!annotation && iter.hasNext()) {
				var a = iter.next();
				if (a.type !== mAnnotations.AnnotationType.ANNOTATION_FOLDING) { continue; }
				annotation = a;
			}
			if (annotation) {
				if (expand !== annotation.expanded) {
					if (expand) {
						annotation.expand();
					} else {
						editor.setCaretOffset(annotation.start);
						annotation.collapse();
					}
				}
			}
			return true;
		},
		expandAnnotations: function(expand) {
			var editor = this.editor;
			if (!editor.getFoldingRulerVisible()) return true;
			var textView = editor.getTextView();
			var annotationModel = editor.getAnnotationModel();
			if(!annotationModel) { return true; }
			var annotation, iter = annotationModel.getAnnotations();
			textView.setRedraw(false);
			while (iter.hasNext()) {
				annotation = iter.next();
				if (annotation.type !== mAnnotations.AnnotationType.ANNOTATION_FOLDING) { continue; }
				if (expand !== annotation.expanded) {
					if (expand) {
						annotation.expand();
					} else {
						annotation.collapse();
					}
				}
			}
			textView.setRedraw(true);
			return true;
		},
		indentLines: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			if(!textView.getOptions("tabMode")) { return; } //$NON-NLS-0$
			var model = editor.getModel();
			var offset = 0;
			var selections = editor.getSelections();
			if (selections.length > 1) { this.startUndo(); }
			if (selections.some(
				function(selection) {
					selection.start += offset;
					selection.end += offset;
					var firstLine = model.getLineAtOffset(selection.start);
					var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
					if (firstLine !== lastLine || selections.length > 1) {
						var lines = [];
						lines.push("");
						for (var i = firstLine; i <= lastLine; i++) {
							lines.push(model.getLine(i, true));
						}
						var lineStart = model.getLineStart(firstLine);
						var lineEnd = model.getLineEnd(lastLine, true);
						var options = textView.getOptions("tabSize", "expandTab"); //$NON-NLS-1$ //$NON-NLS-2$
						var tab = options.expandTab ? new Array(options.tabSize + 1).join(" ") : "\t"; //$NON-NLS-1$ //$NON-NLS-2$
						var text = lines.join(tab);
						editor.setText(text, lineStart, lineEnd);
						var start = lineStart === selection.start ? selection.start : selection.start + tab.length;
						var end = selection.end + ((lastLine - firstLine + 1) * tab.length);
						offset += (lineStart - lineEnd) + text.length;
						selection.start = start;
						selection.end = end;
					} else {
						return true;
					}
					return false;
				}
			)){
				return false;
			}
			editor.setSelections(selections);
			if (selections.length > 1) { this.endUndo(); }
			return true;
		},
		gotoLastEdit: function() {
			if (typeof this._lastEditLocation === "number")  { //$NON-NLS-0$
				this.editor.showSelection(this._lastEditLocation);
			}
			return true;
		},
		gotoLine: function() {
			var editor = this.editor;
			var model = editor.getModel();
			var line = model.getLineAtOffset(editor.getCaretOffset());
			line = prompt(messages.gotoLinePrompty, line + 1);
			if (line) {
				line = parseInt(line, 10);
				editor.onGotoLine(line - 1, 0);
			}
			return true;
		},
		moveLinesDown: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			forEachSelection(this, true, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var lineCount = model.getLineCount();
				if (lastLine !== lineCount-1) {
					var lineStart = model.getLineStart(firstLine);
					var lineEnd = model.getLineEnd(lastLine, true);
					var insertOffset = model.getLineEnd(lastLine+1, true) - (lineEnd - lineStart);
					var text, delimiterLength = 0;
					if (lastLine !== lineCount-2) {
						text = model.getText(lineStart, lineEnd);
					} else {
						// Move delimiter following selection to front of the text
						var lineEndNoDelimiter = model.getLineEnd(lastLine);
						text = model.getText(lineEndNoDelimiter, lineEnd) + model.getText(lineStart, lineEndNoDelimiter);
						delimiterLength += lineEnd - lineEndNoDelimiter;
					}
					setText("", lineStart, lineEnd);
					setText(text, insertOffset, insertOffset);
					selection.start = insertOffset + delimiterLength;
					selection.end = insertOffset + delimiterLength + text.length;
				}
			});
			return true;
		},
		moveLinesUp: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			forEachSelection(this, true, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				if (firstLine !== 0) {
					var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
					var lineCount = model.getLineCount();
					var insertOffset = model.getLineStart(firstLine - 1);
					var lineStart = model.getLineStart(firstLine);
					var lineEnd = model.getLineEnd(lastLine, true);
					var text = model.getText(lineStart, lineEnd);
					var delimiterLength = 0;
					if (lastLine === lineCount-1) {
						// Move delimiter preceding selection to end of text
						var delimiterStart = model.getLineEnd(firstLine - 1);
						var delimiterEnd = model.getLineEnd(firstLine - 1, true);
						text += model.getText(delimiterStart, delimiterEnd);
						lineStart = delimiterStart;
						delimiterLength = delimiterEnd - delimiterStart;
					}
					setText("", lineStart, lineEnd);
					setText(text, insertOffset, insertOffset);
					selection.start = insertOffset;
					selection.end = insertOffset + text.length - delimiterLength;
				}
			});
			return true;
		},
		nextAnnotation: function (forward) {
			var editor = this.editor;
			var annotationModel = editor.getAnnotationModel();
			if (!annotationModel) { return true; }
			var list = editor.getOverviewRuler() || editor.getAnnotationStyler();
			if (!list) { return true; }

			function ignore(annotation, iterationMode) {
				switch (iterationMode) {
					case AT.ANNOTATION_ERROR:
						return annotation.type !== AT.ANNOTATION_ERROR && annotation.type !== AT.ANNOTATION_WARNING && annotation.type !== AT.ANNOTATION_INFO;
					case AT.ANNOTATION_READ_OCCURRENCE:
						return annotation.type !== AT.ANNOTATION_READ_OCCURRENCE && annotation.type !== AT.ANNOTATION_WRITE_OCCURRENCE;
					case AT.ANNOTATION_CURRENT_SEARCH:
						return annotation.type !== AT.ANNOTATION_CURRENT_SEARCH && annotation.type !== AT.ANNOTATION_MATCHING_SEARCH;
					case AT.ANNOTATION_TASK:
						return annotation.type !== AT.ANNOTATION_TASK && annotation.type !== AT.ANNOTATION_BOOKMARK;
				}
				return true;
			}
			
			var model = editor.getModel();
			var currentOffset = editor.getCaretOffset();

			// reset the iteration mode if the cursor moves between invocations			
			if (!this._lastPosition || this._lastPosition !== currentOffset) {
				var curAnnotations = annotationModel.getAnnotations(currentOffset, currentOffset);
				var theMode = null;
				while (curAnnotations.hasNext()) {
					var annotation = curAnnotations.next();
					if (annotation.type === AT.ANNOTATION_ERROR || annotation.type === AT.ANNOTATION_WARNING || annotation.type === AT.ANNOTATION_INFO) {
						theMode = AT.ANNOTATION_ERROR;
						break;
					} else if (annotation.type === AT.ANNOTATION_READ_OCCURRENCE || annotation.type === AT.ANNOTATION_WRITE_OCCURRENCE) {
						theMode = AT.ANNOTATION_READ_OCCURRENCE;
					} else if (annotation.type === AT.ANNOTATION_TASK || annotation.type === AT.ANNOTATION_BOOKMARK && theMode !== AT.ANNOTATION_READ_OCCURRENCE) {
						theMode = AT.ANNOTATION_TASK;
					} else if (annotation.type === AT.ANNOTATION_CURRENT_SEARCH || annotation.type === AT.ANNOTATION_MATCHING_SEARCH && !theMode) {
						theMode = AT.ANNOTATION_CURRENT_SEARCH;
					}
				}
				this._iterationMode = theMode ?  theMode : AT.ANNOTATION_ERROR; // Iterate Errors / Warnings by default;
			}

			var annotations = annotationModel.getAnnotations(forward ? currentOffset : 0, forward ? model.getCharCount() : currentOffset);
			var foundAnnotation = null;
			while (annotations.hasNext()) {
				var annotation = annotations.next();
				if (forward) {
					if (annotation.start <= currentOffset) { continue; }
				} else {
					if (annotation.start >= currentOffset) { continue; }
				}
				if (ignore(annotation, this._iterationMode)) {
					continue;
				}
				foundAnnotation = annotation;
				if (forward) {
					break;
				}
			}
			if (foundAnnotation) {
				var foundAnnotations = [foundAnnotation];
				annotations = annotationModel.getAnnotations(foundAnnotation.start, foundAnnotation.start);
				while (annotations.hasNext()) {
					annotation = annotations.next();
					if (annotation !== foundAnnotation && !ignore(annotation, this._iterationMode)) {
						foundAnnotations.push(annotation);
					}
				}
				var view = editor.getTextView();
				var tooltip = mTooltip.Tooltip.getTooltip(view, editor);
				this._lastPosition = foundAnnotation.start;
				if (!tooltip) {
					editor.moveSelection(foundAnnotation.start);
					return true;
				}
				editor.moveSelection(foundAnnotation.start, foundAnnotation.start, function() {
					setTimeout(function() {
						var tv = editor.getTextView();
						var offset = foundAnnotation.start;
						var pos = tv.getLocationAtOffset(offset);
						tooltip.show({
							x: pos.x,
							y: pos.y,
							getTooltipInfo: function() {
								return editor._getTooltipInfo(this.x, this.y);
							}
						}, false, false);						
					}, 0);
				});
			}
			return true;
		},
		unindentLines: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			if(!textView.getOptions("tabMode")) { return; } //$NON-NLS-0$
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);
				var tabSize = textView.getOptions("tabSize"); //$NON-NLS-0$
				var spaceTab = new Array(tabSize + 1).join(" "); //$NON-NLS-0$
				var lines = [], removeCount = 0, firstRemoveCount = 0;
				for (var i = firstLine; i <= lastLine; i++) {
					var line = model.getLine(i, true);
					if (model.getLineStart(i) !== model.getLineEnd(i)) {
						if (line.indexOf("\t") === 0) { //$NON-NLS-0$
							line = line.substring(1);
							removeCount++;
						} else if (line.indexOf(spaceTab) === 0) {
							line = line.substring(tabSize);
							removeCount += tabSize;
						} else {
							return true;
						}
					}
					if (i === firstLine) {
						firstRemoveCount = removeCount;
					}
					lines.push(line);
				}
				var lineStart = model.getLineStart(firstLine);
				var lineEnd = model.getLineEnd(lastLine, true);
				var lastLineStart = model.getLineStart(lastLine);
				var text = lines.join("");
				setText(text, lineStart, lineEnd);
				var start = lineStart === selection.start ? selection.start : selection.start - firstRemoveCount;
				var end = Math.max(start, selection.end - removeCount + (selection.end === lastLineStart+1 && selection.start !== selection.end ? 1 : 0));
				selection.start = start;
				selection.end = end;
			});
			return true;
		},
		startUndo: function() {
			if (this.undoStack) {
				this.undoStack.startCompoundChange();
			}
		},
		endUndo: function() {
			if (this.undoStack) {
				this.undoStack.endCompoundChange();
			}
		}
	};
	exports.TextActions = TextActions;

	/**
	 * @param {orion.editor.Editor} editor
	 * @param {orion.editor.UndoStack} undoStack
	 * @param {orion.editor.ContentAssist} [contentAssist]
	 * @param {orion.editor.LinkedMode} [linkedMode]
	 */
	function SourceCodeActions(editor, undoStack, contentAssist, linkedMode) {
		this.editor = editor;
		this.undoStack = undoStack;
		this.contentAssist = contentAssist;
		this.linkedMode = linkedMode;
		if (this.contentAssist) {
			this.contentAssist.addEventListener("ProposalApplied", this.contentAssistProposalApplied.bind(this)); //$NON-NLS-0$
		}
		this.init();
	}
	SourceCodeActions.prototype = {
		init: function() {
			var textView = this.editor.getTextView();

			textView.setAction("lineStart", function() { //$NON-NLS-0$
				return this.lineStart();
			}.bind(this));

			textView.setAction("enter", function() { //$NON-NLS-0$
				return this.autoIndent();
			}.bind(this));

			textView.setKeyBinding(new mKeyBinding.KeyBinding("t", true, false, true), "trimTrailingWhitespaces"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("trimTrailingWhitespaces", function() { //$NON-NLS-0$
				return this.trimTrailingWhitespaces();
			}.bind(this), {name: messages.trimTrailingWhitespaces});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(191, true), "toggleLineComment"); //$NON-NLS-0$
			textView.setAction("toggleLineComment", function() { //$NON-NLS-0$
				return this.toggleLineComment();
			}.bind(this), {name: messages.toggleLineComment});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(191, true, !util.isMac, false, util.isMac), "addBlockComment"); //$NON-NLS-0$
			textView.setAction("addBlockComment", function() { //$NON-NLS-0$
				return this.addBlockComment();
			}.bind(this), {name: messages.addBlockComment});

			textView.setKeyBinding(new mKeyBinding.KeyBinding(220, true, !util.isMac, false, util.isMac), "removeBlockComment"); //$NON-NLS-0$
			textView.setAction("removeBlockComment", function() { //$NON-NLS-0$
				return this.removeBlockComment();
			}.bind(this), {name: messages.removeBlockComment});

			// Autocomplete square brackets []
			textView.setKeyBinding(new mKeyBinding.KeyBinding("[", false, false, false, false, "keypress"), "autoPairSquareBracket"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("autoPairSquareBracket", function() { //$NON-NLS-0$
				return this.autoPairBrackets("[", "]"); //$NON-NLS-1$ //$NON-NLS-2$
			}.bind(this));

			textView.setKeyBinding(new mKeyBinding.KeyBinding(']', false, false, false, false, "keypress"), "skipClosingSquareBracket"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("skipClosingSquareBracket", function() { //$NON-NLS-0$
				return this.handleClosingBracket(']'); //$NON-NLS-0$
			}.bind(this));

			// Autocomplete angle brackets <>
			textView.setKeyBinding(new mKeyBinding.KeyBinding("<", false, false, false, false, "keypress"), "autoPairAngleBracket"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("autoPairAngleBracket", function() { //$NON-NLS-0$
				return this.autoPairBrackets("<", ">"); //$NON-NLS-1$ //$NON-NLS-2$
			}.bind(this));

			textView.setKeyBinding(new mKeyBinding.KeyBinding('>', false, false, false, false, "keypress"), "skipClosingAngleBracket"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("skipClosingAngleBracket", function() { //$NON-NLS-0$
				return this.handleClosingBracket('>'); //$NON-NLS-0$
			}.bind(this));

			// Autocomplete parentheses ()
			textView.setKeyBinding(new mKeyBinding.KeyBinding("(", false, false, false, false, "keypress"), "autoPairParentheses"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("autoPairParentheses", function() { //$NON-NLS-0$
				return this.autoPairBrackets("(", ")"); //$NON-NLS-1$ //$NON-NLS-2$
			}.bind(this));

			textView.setKeyBinding(new mKeyBinding.KeyBinding(')', false, false, false, false, "keypress"), "skipClosingParenthesis"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("skipClosingParenthesis", function() { //$NON-NLS-0$
				return this.handleClosingBracket(")"); //$NON-NLS-0$
			}.bind(this));

			// Autocomplete braces {}
			textView.setKeyBinding(new mKeyBinding.KeyBinding("{", false, false, false, false, "keypress"), "autoPairBraces"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("autoPairBraces", function() { //$NON-NLS-0$
				return this.autoPairBrackets("{", "}"); //$NON-NLS-1$ //$NON-NLS-2$
			}.bind(this));

			textView.setKeyBinding(new mKeyBinding.KeyBinding('}', false, false, false, false, "keypress"), "skipClosingBrace"); //$NON-NLS-1$ //$NON-NLS-2$
			textView.setAction("skipClosingBrace", function() { //$NON-NLS-0$
				return this.handleClosingBracket("}"); //$NON-NLS-0$
			}.bind(this));

			// Autocomplete single quotations
			textView.setKeyBinding(new mKeyBinding.KeyBinding("'", false, false, false, false, "keypress"), "autoPairSingleQuotation"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
			textView.setAction("autoPairSingleQuotation", function() { //$NON-NLS-0$
				return this.autoPairQuotations("'"); //$NON-NLS-1$ //$NON-NLS-2$
			}.bind(this));

			// Autocomplete double quotations
			textView.setKeyBinding(new mKeyBinding.KeyBinding('"', false, false, false, false, "keypress"), "autoPairDblQuotation"); //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$
			textView.setAction("autoPairDblQuotation", function() { //$NON-NLS-0$
				return this.autoPairQuotations('"'); //$NON-NLS-1$ //$NON-NLS-2$
			}.bind(this));

			textView.setAction("deletePrevious", function() { //$NON-NLS-0$
				return this.deletePrevious();
			}.bind(this));
		},
		autoIndent: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			if (textView.getOptions("singleMode")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			var options = textView.getOptions("tabSize", "expandTab"); //$NON-NLS-1$ //$NON-NLS-2$
			var tab = options.expandTab ? new Array(options.tabSize + 1).join(" ") : "\t"; //$NON-NLS-1$ //$NON-NLS-2$
			var lineDelimiter = model.getLineDelimiter();
			var matchCommentStart = /^[\s]*\/\*[\*]*[\s]*$/;
			var matchCommentDelimiter = /^[\s]*\*/;
			var matchCommentEnd = /\*\/[\s]*$/;
			var self = this;
			function indent(selection, setText) {
				if (selection.start === selection.end) {
					var lineIndex = model.getLineAtOffset(selection.start);
					var lineText = model.getLine(lineIndex, false);
					var lineStart = model.getLineStart(lineIndex);
					var index = 0;
					var lineOffset = selection.start - lineStart;
					var c;
					while (index < lineOffset && ((c = lineText.charCodeAt(index)) === 32 || c === 9)) { index++; }
					var prefix = lineText.substring(0, index);
					var lineTextBeforeCaret = lineText.substring(0, lineOffset);
					var lineTextAfterCaret = lineText.substring(lineOffset);
					var text;
					// If the character before the caret is an opening brace, smart indent the next line.
					var prevCharIdx;
					if (self.smartIndentation && lineText.charCodeAt(prevCharIdx = lineTextBeforeCaret.trimRight().length - 1) === 123) {
						// Remove any extra whitespace
						var whitespaceBeforeCaret = lineOffset - prevCharIdx - 1;
						var whitespaceAfterCaret = lineTextAfterCaret.length - lineTextAfterCaret.trimLeft().length;
	
						text = lineText.charCodeAt(lineOffset + whitespaceAfterCaret) === 125 ?
							   lineDelimiter + prefix + tab + lineDelimiter + prefix :
							   lineDelimiter + prefix + tab;
	
						setText(text, selection.start - whitespaceBeforeCaret, selection.end + whitespaceAfterCaret);
						selection.start = selection.end = selection.start + lineDelimiter.length + prefix.length + tab.length - whitespaceBeforeCaret;
						return true;
					// Proceed with autocompleting multi-line comment if the text before the caret matches
					// the start or comment delimiter (*) of a multi-line comment
					} else if (self.autoCompleteComments && !matchCommentEnd.test(lineTextBeforeCaret) &&
								(matchCommentStart.test(lineTextBeforeCaret) || matchCommentDelimiter.test(lineTextBeforeCaret))) {
						var caretOffset;
	
						/**
						 * Matches the start of a multi-line comment. Autocomplete the multi-line block comment,
						 * moving any text after the caret into the block comment and setting the caret to be
						 * after the comment delimiter.
						 */
						var match = matchCommentStart.exec(lineTextBeforeCaret);
						if (match) {
							text = lineDelimiter + prefix + " * "; //$NON-NLS-0$
							// Text added into the comment block are trimmed of all preceding and trailing whitespaces.
							// If the text after the caret contains the ending of a block comment, exclude the ending.
							if (matchCommentEnd.test(lineTextAfterCaret)) {
								text += lineTextAfterCaret.substring(0, lineTextAfterCaret.length - 2).trim();
							} else {
								text += lineTextAfterCaret.trim();
							}
							// Add the closing to the multi-line block comment if the next line is not a
							// comment delimiter.
							if ((model.getLineCount() === lineIndex + 1) ||
								!matchCommentDelimiter.test(model.getLine(lineIndex + 1))) {
								text += lineDelimiter + prefix + " */"; //$NON-NLS-0$
							}
							setText(text, selection.start, selection.end + lineTextAfterCaret.length);
							selection.start = selection.end = selection.start + lineDelimiter.length + prefix.length + 3;
							return true;
						}
	
						/**
						 * Matches a comment delimiter (*) as the start of the line, and traverses up the lines to confirm if
						 * it is a multi-line comment by matching the start of a block comment. If so, continue the
						 * multi-line comment in the next line. Any text that follows after the caret is moved to the newly
						 * added comment delimiter.
						 */
						match = matchCommentDelimiter.exec(lineTextBeforeCaret);
						if (match) {
							for (var i = lineIndex - 1; i >= 0; i--) {
								var prevLine = model.getLine(i, false);
								if (matchCommentStart.test(prevLine)) {
									/**
									 * If the text after the caret matches the end of a comment block or the character in front of the
									 * caret is a forward slash, continue the block comment with the caret and text after the caret on
									 * the next line directly in front of the star (*).
									 */
									if (matchCommentEnd.test(lineTextAfterCaret) || lineText.charCodeAt(lineOffset) === 47) {
										text = lineDelimiter + prefix + "*" + lineTextAfterCaret; //$NON-NLS-0$
										caretOffset = selection.start + lineDelimiter.length + prefix.length + 1;
									} else {
										text = lineDelimiter + prefix + "* " + lineTextAfterCaret; //$NON-NLS-0$
										caretOffset = selection.start + lineDelimiter.length + prefix.length + 2;
									}
									setText(text, selection.start, selection.end + lineTextAfterCaret.length);
									selection.start = selection.end = caretOffset;
									return true;
								} else if (!matchCommentDelimiter.test(prevLine)) {
									return false;
								}
							}
						}
						return false;
					} else if (matchCommentEnd.test(lineTextBeforeCaret) && prefix.charCodeAt(prefix.length - 1) === 32) {
						// Matches the end of a block comment. Fix the indentation for the following line.
						text = lineDelimiter + prefix.substring(0, prefix.length - 1);
						setText(text, selection.start, selection.end);
						selection.start = selection.end = selection.start + text.length;
						return true;
					} else if (index > 0) {
						//TODO still wrong when typing inside folding
						index = lineOffset;
						while (index < lineText.length && ((c = lineText.charCodeAt(index++)) === 32 || c === 9)) { selection.end++; }
						text = model.getLineDelimiter() + prefix;
						setText(text, selection.start, selection.end);
						selection.start = selection.end = selection.start + text.length;
						return true;
					}
				}
				return false;
			}
			forEachSelection(this, true, function(selection, setText) {
				if (!indent(selection, setText)) {
					setText(lineDelimiter, selection.start, selection.end);
					selection.start = selection.end = selection.start + lineDelimiter.length;
				}
			});
			return true;
		},
		addBlockComment: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			var styleAccessor = editor.getStyleAccessor();
			forEachSelection(this, false, function(selection, setText) {
				var open, close;
				if (styleAccessor) {
					var delimiters = styleAccessor.getBlockCommentDelimiters(selection.start);
					open = delimiters[0];
					close = delimiters[1];
				} else {
					/* fallback values */
					open = "/*"; //$NON-NLS-0$
					close = "*/"; //$NON-NLS-0$
				}

				var result = this._findEnclosingComment(model, selection.start, selection.end, open, close);
				if (result.commentStart !== undefined && result.commentEnd !== undefined) {
					return; // Already in a comment
				}

				var text = model.getText(selection.start, selection.end);
				if (text.length === 0) { return; }
	
				var oldLength = text.length;
				text = text.replace(open, "");
				text = text.replace(close, "");
				var newLength = text.length;
				text = open + text + close;
	
				setText(text, selection.start, selection.end);
				selection.start += open.length;
				selection.end +=  open.length + (newLength - oldLength);
			}.bind(this));
			return true;
		},
		/**
		 * Called on an opening bracket keypress.
		 * Automatically inserts the specified opening and closing brackets around the caret or selected text.
		 */
		autoPairBrackets: function(openBracket, closeBracket) {
			if (openBracket === "[" && !this.autoPairSquareBrackets) { //$NON-NLS-0$
				return false;
			} else if (openBracket === "{" && !this.autoPairBraces) { //$NON-NLS-0$
				return false;
			} else if (openBracket === "(" && !this.autoPairParentheses) { //$NON-NLS-0$
				return false;
			} else if (openBracket === "<" && !this.autoPairAngleBrackets) { //$NON-NLS-0$
				return false;
			}

			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var isClosingBracket = new RegExp("^$|[)}\\]>]"); //$NON-NLS-0$ // matches any empty string and closing bracket
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				var nextChar = (selection.start === model.getCharCount()) ? "" : model.getText(selection.start, selection.start + 1).trim(); //$NON-NLS-0$
				var text;
				if (selection.start === selection.end && isClosingBracket.test(nextChar)) {
					// No selection and subsequent character is not a closing bracket - wrap the caret with the opening and closing brackets,
					// and maintain the caret position inbetween the brackets
					text = openBracket + closeBracket;
					setText(text, selection.start, selection.start);
					selection.start = selection.end = selection.start + 1;
				} else if (selection.start !== selection.end) {
					// Wrap the selected text with the specified opening and closing brackets and keep selection on text
					text = openBracket + model.getText(selection.start, selection.end) + closeBracket;
					setText(text, selection.start, selection.end);
					selection.start += 1;
					selection.end += 1;
				} else {
					setText(openBracket, selection.start, selection.end);
					selection.start = selection.end = selection.start + openBracket.length;
				}
			});
			return true;
		},
		/**
		 * Called on a quotation mark keypress.
		 * Automatically inserts a pair of the specified quotation around the caret the caret or selected text.
		 */
		autoPairQuotations: function(quotation) {
			if (!this.autoPairQuotation) { return false; }
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var isQuotation = new RegExp("^\"$|^'$"); //$NON-NLS-0$
			var isAlpha = new RegExp("\\w"); //$NON-NLS-0$
			var isClosingBracket = new RegExp("^$|[)}\\]>]"); //$NON-NLS-0$ // matches any empty string and closing bracket
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				var prevChar = (selection.start === 0) ? "" : model.getText(selection.start - 1, selection.start).trim(); //$NON-NLS-0$
				var nextChar = (selection.start === model.getCharCount()) ? "" : model.getText(selection.start, selection.start + 1).trim(); //$NON-NLS-0$
				function insertQuotation() {
					setText(quotation, selection.start, selection.end);
					selection.start = selection.end = selection.start + quotation.length;
				}
				// Wrap the selected text with the specified opening and closing quotation marks and keep selection on text
				if (selection.start !== selection.end) {
					var text = model.getText(selection.start, selection.end);
					if (isQuotation.test(text)) {
						insertQuotation();
					} else {
						setText(quotation + text + quotation, selection.start, selection.end);
						selection.start += 1;
						selection.end += 1;
					}
				} else if (nextChar === quotation) {
					// Skip over the next character if it matches the specified quotation mark
					selection.start = selection.end = selection.start + 1;
				} else if (prevChar === quotation || isQuotation.test(nextChar) || isAlpha.test(prevChar) || !isClosingBracket.test(nextChar)) {
					insertQuotation();
				} else {
					// No selection - wrap the caret with the opening and closing quotation marks, and maintain the caret position inbetween the quotations
					setText(quotation + quotation, selection.start, selection.end);
					selection.start = selection.end = selection.start + quotation.length;
				}
			});
			return true;
		},
		/**
		 * Called when a content assist proposal has been applied. Inserts the proposal into the
		 * document. Activates Linked Mode if applicable for the selected proposal.
		 * @param {orion.editor.ContentAssist#ProposalAppliedEvent} event
		 */
		contentAssistProposalApplied: function(event) {
			/*
			 * The event.proposal is an object with this shape:
			 * {   proposal: "[proposal string]", // Actual text of the proposal
			 *     description: "diplay string", // Optional
			 *     positions: [{
			 *         offset: 10, // Offset of start position of parameter i
			 *         length: 3  // Length of parameter string for parameter i
			 *     }], // One object for each parameter; can be null
			 *     escapePosition: 19, // Optional; offset that caret will be placed at after exiting Linked Mode.
			 *     style: 'emphasis', // Optional: either emphasis, noemphasis, hr to provide custom styling for the proposal
			 *     unselectable: false // Optional: if set to true, then this proposal cannnot be selected through the keyboard
			 * }
			 * Offsets are relative to the text buffer.
			 */
			var proposal = event.data.proposal;

			// If escapePosition is not provided, positioned the cursor at the end of the inserted text 
			function escapePosition() {
				if (typeof proposal.escapePosition === "number") { //$NON-NLS-0$
					return proposal.escapePosition;
				}
				return event.data.start + proposal.proposal.length;
			}

			//if the proposal specifies linked positions, build the model and enter linked mode
			if (Array.isArray(proposal.positions) && this.linkedMode) {
				var positionGroups = [];
				proposal.positions.forEach(function(pos) {
					//ignore bad proposal values
					//@see https://bugs.eclipse.org/bugs/show_bug.cgi?id=513146
					if(typeof pos.offset === "number" && typeof pos.length === "number") {
						positionGroups.push({positions: [{offset: pos.offset, length: pos.length}]});
					}
				});
				if(positionGroups.length > 0) {
					this.linkedMode.enterLinkedMode({
						groups: positionGroups,
						escapePosition: escapePosition()
					});
				} else {
					this.editor.getTextView().setCaretOffset(escapePosition());
				}
			} else if (proposal.groups && proposal.groups.length > 0 && this.linkedMode) {
				this.linkedMode.enterLinkedMode({
					groups: proposal.groups,
					escapePosition: escapePosition()
				});
			} else if (typeof proposal.escapePosition === "number") { //$NON-NLS-0$
				//we don't want linked mode, but there is an escape position, so just set cursor position
				this.editor.getTextView().setCaretOffset(proposal.escapePosition);
			}
			return true;
		},
		// On backspace keypress, checks if there are a pair of brackets or quotation marks to be deleted
		deletePrevious: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			forEachSelection(this, false, function(selection, setText) {
				if (selection.start !== selection.end) { return; }
			
				var prevChar = (selection.start === 0) ? "" : model.getText(selection.start - 1, selection.start); //$NON-NLS-0$
				var nextChar = (selection.start === model.getCharCount()) ? "" : model.getText(selection.start, selection.start + 1); //$NON-NLS-0$
	
				if (prevChar === "(" && nextChar === ")" || //$NON-NLS-1$ //$NON-NLS-2$
					prevChar === "[" && nextChar === "]" || //$NON-NLS-1$ //$NON-NLS-2$
					prevChar === "{" && nextChar === "}" || //$NON-NLS-1$ //$NON-NLS-2$
					prevChar === "<" && nextChar === ">" || //$NON-NLS-1$ //$NON-NLS-2$
					prevChar === '"' && nextChar === '"' || //$NON-NLS-1$ //$NON-NLS-2$
					prevChar === "'" && nextChar === "'") { //$NON-NLS-1$ //$NON-NLS-2$
					setText("", selection.start, selection.start + 1); //$NON-NLS-0$
				}
			}, true);
			return false;
		},
		_findEnclosingComment: function(model, start, end, open, close) {
			var firstLine = model.getLineAtOffset(start);
			var lastLine = model.getLineAtOffset(end);
			var i, line, extent, openPos, closePos;
			var commentStart, commentEnd;
			for (i = firstLine; i >= 0; i--) {
				line = model.getLine(i);
				extent = (i === firstLine) ? start - model.getLineStart(firstLine) : line.length;
				openPos = line.lastIndexOf(open, extent);
				closePos = line.lastIndexOf(close, extent);
				if (closePos > openPos) {
					break; // not inside a comment
				}
				if (openPos !== -1) {
					commentStart = model.getLineStart(i) + openPos;
					break;
				}
			}
			for (i = lastLine; i < model.getLineCount(); i++) {
				line = model.getLine(i);
				extent = (i === lastLine) ? end - model.getLineStart(lastLine) : 0;
				openPos = line.indexOf(open, extent);
				closePos = line.indexOf(close, extent);
				if (openPos !== -1 && openPos < closePos) {
					break;
				}
				if (closePos !== -1) {
					commentEnd = model.getLineStart(i) + closePos;
					break;
				}
			}
			return {commentStart: commentStart, commentEnd: commentEnd};
		},
		lineStart: function() {
			var editor = this.editor;
			var model = editor.getModel();
			forEachSelection(this, false, function(selection/*, setText*/) {
				var caretOffset = selection.getCaret();
				var lineIndex = model.getLineAtOffset(caretOffset);
				var lineOffset = model.getLineStart(lineIndex);
				var lineText = model.getLine(lineIndex);
				var offset;
				for (offset=0; offset<lineText.length; offset++) {
					var c = lineText.charCodeAt(offset);
					if (!(c === 32 || c === 9)) {
						break;
					}
				}
				offset += lineOffset;
				if (caretOffset !== offset) {
					selection.setCaret(offset);
				} else {
					selection.setCaret(lineOffset);
				}
			});
			return true;
		},
		removeBlockComment: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			var styleAccessor = editor.getStyleAccessor();
			forEachSelection(this, false, function(selection, setText) {
				var open, close;
				if (styleAccessor) {
					var delimiters = styleAccessor.getBlockCommentDelimiters(selection.start);
					open = delimiters[0];
					close = delimiters[1];
				} else {
					/* fallback values, should not be needed */
					open = "/*"; //$NON-NLS-0$
					close = "*/"; //$NON-NLS-0$
				}

				// Try to shrink selection to a comment block
				var selectedText = model.getText(selection.start, selection.end);
				var newStart, newEnd;
				var i;
				for (i = 0; i < selectedText.length; i++) {
					if (selectedText.substring(i, i + open.length) === open) {
						newStart = selection.start + i;
						break;
					}
				}
				for (; i < selectedText.length; i++) {
					if (selectedText.substring(i, i + close.length) === close) {
						newEnd = selection.start + i;
						break;
					}
				}
	
				var text;
				if (newStart !== undefined && newEnd !== undefined) {
					text = model.getText(newStart + open.length, newEnd);
					setText(text, newStart, newEnd + close.length);
					selection.start = newStart;
					selection.end = newEnd;
				} else {
					// Otherwise find enclosing comment block
					var result = this._findEnclosingComment(model, selection.start, selection.end, open, close);
					if (!(result.commentStart === undefined || result.commentEnd === undefined)) {
						text = model.getText(result.commentStart + open.length, result.commentEnd);
						setText(text, result.commentStart, result.commentEnd + close.length);
						selection.start = selection.start - open.length;
						selection.end = selection.end - close.length;
					}
				}
			}.bind(this));
			return true;
		},
		toggleLineComment: function() {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			var styleAccessor = editor.getStyleAccessor();
			textView.setRedraw(false);
			forEachSelection(this, true, function(selection, setText) {
				var firstLine = model.getLineAtOffset(selection.start);
				var lastLine = model.getLineAtOffset(selection.end > selection.start ? selection.end - 1 : selection.end);

				var comment;
				if (styleAccessor) {
					comment = styleAccessor.getLineCommentDelimiter(model.getLineStart(firstLine));
				} else {
					comment = "//"; /* fallback value */ //$NON-NLS-0$
				}

				var uncomment = true, lineIndices = [], index;
				for (var i = firstLine; i <= lastLine; i++) {
					var lineText = model.getLine(i, true);
					index = lineText.indexOf(comment);
					lineIndices.push(index);
					if (!uncomment || index === -1) {
						uncomment = false;
					} else {
						if (index !== 0) {
							var j;
							for (j = 0; j < index; j++) {
								var c = lineText.charCodeAt(j);
								if (!(c === 32 || c === 9)) {
									break;
								}
							}
							uncomment = j === index;
						}
					}
				}
				var selStart, selEnd, l = comment.length, k;
				var lineStart = model.getLineStart(firstLine);
				if (uncomment) {
					for (k = lineIndices.length - 1; k >= 0; k--) {
						index = lineIndices[k] + model.getLineStart(firstLine + k);
						setText("", index, index + l);
					}
					var lastLineStart = model.getLineStart(lastLine);
					selStart = lineStart === selection.start ? selection.start : selection.start - l;
					selEnd = selection.end - (l * (lastLine - firstLine + 1)) + (selection.end === lastLineStart + 1 ? l : 0);
				} else {
					for (k = lineIndices.length - 1; k >= 0; k--) {
						index = model.getLineStart(firstLine + k);
						setText(comment, index, index);
					}
					selStart = lineStart === selection.start ? selection.start : selection.start + l;
					selEnd = selection.end + (l * (lastLine - firstLine + 1));
				}
				selection.start = selStart;
				selection.end = selEnd;
			});
			textView.setRedraw(true);
			return true;
		},
		trimTrailingWhitespaces: function() {
			var editor = this.editor;
			var model = editor.getModel();
			var selections = editor.getSelections();
			editor.getTextView().setRedraw(false);
			this.startUndo();
			var matchTrailingWhiteSpace = /(\s+$)/;
			var lineCount = model.getLineCount();
			for (var i = 0; i < lineCount; i++) {
				var lineText = model.getLine(i);
				var match = matchTrailingWhiteSpace.exec(lineText);
				if (match) {
					var lineStartOffset = model.getLineStart(i);
					var matchLength = match[0].length;
					var start = lineStartOffset + match.index;
					model.setText("", start, start + matchLength);
					/**
					 * Move the caret to its original position prior to the save. If the caret
					 * was in the trailing whitespaces, move the caret to the end of the line.
					 */
					selections.forEach(function(selection) {
						if (selection.start > start) {
							selection.start = Math.max(start, selection.start - matchLength);
						}
						if (selection.start !== selection.end && selection.end > start) {
							selection.end = Math.max(start, selection.end - matchLength);
						}
					});
				}
			}
			this.endUndo();
			editor.setSelections(selections, false);
			editor.getTextView().setRedraw(true);
		},
		startUndo: function() {
			if (this.undoStack) {
				this.undoStack.startCompoundChange();
			}
		},
		/**
		 * @name handleClosingBracket
		 * @description When the user types a closing bracket we should skip auto-paired brackets and reduce indenting if
		 * 				we are on a new line.
		 * @function
		 * @param closingChar {String} the closing bracket character
		 * @returns returns <code>true</code> to skip printing the closing bracket, false to print it
		 */
		handleClosingBracket: function(closingChar) {
			var editor = this.editor;
			var textView = editor.getTextView();
			if (textView.getOptions("readonly")) { return false; } //$NON-NLS-0$
			var model = editor.getModel();
			var selections = editor.getSelections();
			if (selections.length === 1 && selections[0].start === selections[0].end) {
				// If the next character is the same bracket close, skip it
				var nextChar = selections[0].start === model.getCharCount() ? "" : model.getText(selections[0].start, selections[0].start + 1); //$NON-NLS-0$
				if (nextChar === closingChar) {
					selections[0].start = selections[0].end = selections[0].start + 1;
					editor.setSelections(selections);
					return true;
				}
				// If the close bracket is on a new line, reduce the indentation
				var lineNum = model.getLineAtOffset(selections[0].start);
				var line = model.getLine(lineNum, true);
				if (line.match(/^\s*$/)){
					if(textView.getOptions("tabMode")){ //$NON-NLS-1$
						var tabSize = textView.getOptions("tabSize"); //$NON-NLS-1$
						var spaceTab = new Array(tabSize + 1).join(" "); //$NON-NLS-1$
						var lineStart = model.getLineStart(lineNum);
						var lineEnd = model.getLineEnd(lineNum);
						if (lineStart !== lineEnd) {
							if (line.indexOf("\t") === 0) { //$NON-NLS-1$
								line = line.substring(1);
								model.setText(line, lineStart, lineEnd);
								editor.setSelection(selections[0].start-1, selections[0].end-1);
								return false;
							} else if (line.indexOf(spaceTab) === 0) {
								line = line.substring(tabSize);
								model.setText(line, lineStart, lineEnd);
								editor.setSelection(selections[0].start-tabSize, selections[0].end-tabSize);
								return false;
							}
						}
					}
				}
			}
			return false;
		},
		endUndo: function() {
			if (this.undoStack) {
				this.undoStack.endCompoundChange();
			}
		},
		setAutoPairParentheses: function(enabled) {
			this.autoPairParentheses = enabled;
		},
		setAutoPairBraces: function(enabled) {
			this.autoPairBraces = enabled;
		},
		setAutoPairSquareBrackets: function(enabled) {
			this.autoPairSquareBrackets = enabled;
		},
		setAutoPairAngleBrackets: function(enabled) {
			this.autoPairAngleBrackets = enabled;
		},
		setAutoPairQuotations: function(enabled) {
			this.autoPairQuotation = enabled;
		},
		setAutoCompleteComments: function(enabled) {
			this.autoCompleteComments = enabled;
		},
		setSmartIndentation: function(enabled) {
			this.smartIndentation = enabled;
		}
	};
	exports.SourceCodeActions = SourceCodeActions;

	if (!String.prototype.trimLeft) {
		String.prototype.trimLeft = function(){
			return this.replace(/^\s+/g, '');
		};
	}
	if (!String.prototype.trimRight) {
		String.prototype.trimRight = function(){
			return this.replace(/\s+$/g, '');
		};
	}

	return exports;
});
/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/undoStack", [], function() { //$NON-NLS-0$

	/** 
	 * Constructs a new Change object.
	 * 
	 * @class 
	 * @name orion.editor.Change
	 * @private
	 */
	function Change(model, offset, text, previousText, type) {
		this.model = model;
		this.offset = offset;
		this.text = text;
		this.previousText = previousText;
		this.type = type;
	}
	Change.prototype = {
		/** @ignore */
		getRedoChanges: function() {
			return [{start: this.offset, end: this.offset + this.previousText.length, text: this.text}];
		},
		/** @ignore */
		getUndoChanges: function() {
			return [{start: this.offset, end: this.offset + this.text.length, text: this.previousText}];
		},
		/** @ignore */
		undo: function (view, select) {
			this._doUndoRedo(this.offset, this.previousText, this.text, view, select);
			return true;
		},
		/** @ignore */
		redo: function (view, select) {
			this._doUndoRedo(this.offset, this.text, this.previousText, view, select);
			return true;
		},
		merge: function(start, text, previousText, type, end) {
			if (type === this.type) {
				if (type === 1 && start === this.offset + this.text.length) {
					this.text += text;
					return true;
				} else if (type === -1 && end === this.offset) {
					this.offset = start;
					this.previousText = previousText + this.previousText;
					return true;
				} else if (type === -1 && start === this.offset) {
					this.previousText = this.previousText + previousText;
					return true;
				}
			}
			return false;
		},
		_doUndoRedo: function(offset, text, previousText, view, select) {
			this.model.setText(text, offset, offset + previousText.length);
			if (select && view) {
				var model = view.getModel();
				if (model !== this.model) {
					offset = model.mapOffset(offset, true);
				}
				view.setSelection(offset, offset + text.length);
			}
		}
	};

	/** 
	 * Constructs a new CompoundChange object.
	 * 
	 * @param owner the owner of the compound change
	 *
	 * @class 
	 * @name orion.editor.CompoundChange
	 * @private
	 */
	function CompoundChange (owner) {
		this.owner = owner;
		this.changes = [];
	}
	CompoundChange.prototype = {
		/** @ignore */
		getRedoChanges: function() {
			var changes = [];
			for (var i=0; i<this.changes.length; i++) {
				changes = changes.concat(this.changes[i].getRedoChanges());
			}
			return changes;
		},
		/** @ignore */
		getUndoChanges: function() {
			var changes = [];
			for (var i=this.changes.length - 1; i >= 0; i--) {
				changes = changes.concat(this.changes[i].getUndoChanges());
			}
			return changes;
		},
		/** @ignore */
		add: function (change) {
			this.changes.push(change);
		},
		/** @ignore */
		end: function (view) {
			if (view) {
				this.endSelection = view.getSelections();
			}
			var owner = this.owner;
			if (owner && owner.end) {
				owner.end();
			}
		},
		/** @ignore */
		undo: function (view, select) {
			if (this.changes.length > 1 && view) {
				view.setRedraw(false);
			}
			for (var i=this.changes.length - 1; i >= 0; i--) {
				this.changes[i].undo(view, false);
			}
			if (select && view) {
				view.setSelections(this.startSelection);
			}
			if (this.changes.length > 1 && view) {
				view.setRedraw(true);
			}
			var owner = this.owner;
			if (owner && owner.undo) {
				owner.undo();
			}
			return this.changes.length > 0;
		},
		/** @ignore */
		redo: function (view, select) {
			if (this.changes.length > 1 && view) {
				view.setRedraw(false);
			}
			for (var i = 0; i < this.changes.length; i++) {
				this.changes[i].redo(view, false);
			}
			if (select && view) {
				view.setSelections(this.endSelection);
			}
			if (this.changes.length > 1, view) {
				view.setRedraw(true);
			}
			var owner = this.owner;
			if (owner && owner.redo) {
				owner.redo();
			}
			return this.changes.length > 0;
		},
		merge: function(start, text, previousText, type, end, compoundChange) {
			var length = this.changes.length;
			if (length > 0 && this === compoundChange) {
				return this.changes[length - 1].merge(start, text, previousText, type, end);
			}
			return false;
		},
		/** @ignore */
		start: function (view) {
			if (view) {
				this.startSelection = view.getSelections();
			}
			var owner = this.owner;
			if (owner && owner.start) {
				owner.start();
			}
		}
	};

	/**
	 * Constructs a new UndoStack on a text view.
	 *
	 * @param {orion.editor.TextView} view the text view for the undo stack.
	 * @param {Number} [size=100] the size for the undo stack.
	 *
	 * @name orion.editor.UndoStack
	 * @class The UndoStack is used to record the history of a text model associated to an view. Every
	 * change to the model is added to stack, allowing the application to undo and redo these changes.
	 *
	 * <p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.TextView}<br/>
	 * </p>
	 */
	function UndoStack (view, size) {
		this.size = size !== undefined ? size : 100;
		this.reset();
		var self = this;
		this._listener = {
			onChanging: function(e) {
				self._onChanging(e);
			},
			onDestroy: function(e) {
				self._onDestroy(e);
			}
		};
		if (view.getModel) {
			var model = view.getModel();
			if (model.getBaseModel) {
				model = model.getBaseModel();
			}
			this.model = model;
			this.setView(view);
		} else {
			this.shared = true;
			this.model = view;
		}
		this.model.addEventListener("Changing", this._listener.onChanging); //$NON-NLS-0$
	}
	UndoStack.prototype = /** @lends orion.editor.UndoStack.prototype */ {
		/**
		 * Destroy the undo stack.
		 */
		destroy: function() {
			this._onDestroy();
		},
		/**
		 * Adds a change to the stack.
		 * 
		 * @param change the change to add.
		 */
		add: function (change) {
			if (this.compoundChange) {
				this.compoundChange.add(change);
			} else {
				var length = this.stack.length;
				this.stack.splice(this.index, length-this.index, change);
				this.index++;
				if (this.stack.length > this.size) {
					this.stack.shift();
					this.index--;
				}
			}
		},
		/** 
		 * Marks the current state of the stack as clean.
		 *
		 * <p>
		 * This function is typically called when the content of view associated with the stack is saved.
		 * </p>
		 *
		 * @see orion.editor.UndoStack#isClean
		 */
		markClean: function() {
			this._commitUndo();
			this.cleanChange = this.stack[this.index - 1];
			if (this.cleanChange) {
				this.cleanChange.type = 2;
			}
		},
		/**
		 * Returns true if current state of stack is the same
		 * as the state when markClean() was called.
		 *
		 * <p>
		 * For example, the application calls markClean(), then calls undo() four times and redo() four times.
		 * At this point isClean() returns true.  
		 * </p>
		 * <p>
		 * This function is typically called to determine if the content of the view associated with the stack
		 * has changed since the last time it was saved.
		 * </p>
		 *
		 * @return {Boolean} returns if the state is the same as the state when markClean() was called.
		 *
		 * @see orion.editor.UndoStack#markClean
		 */
		isClean: function() {
			return this.cleanChange === this.stack[this.index - 1];
		},
		/**
		 * Returns true if there is at least one change to undo.
		 *
		 * @return {Boolean} returns true if there is at least one change to undo.
		 *
		 * @see orion.editor.UndoStack#canRedo
		 * @see orion.editor.UndoStack#undo
		 */
		canUndo: function() {
			return this.index > 0;
		},
		/**
		 * Returns true if there is at least one change to redo.
		 *
		 * @return {Boolean} returns true if there is at least one change to redo.
		 *
		 * @see orion.editor.UndoStack#canUndo
		 * @see orion.editor.UndoStack#redo
		 */
		canRedo: function() {
			return (this.stack.length - this.index) > 0;
		},
		/**
		 * Finishes a compound change.
		 *
		 * @see orion.editor.UndoStack#startCompoundChange
		 */
		endCompoundChange: function() {
			if (this.compoundChange) {
				this.compoundChange.end(this.view);
			}
			this.compoundChange = undefined;
		},
		/**
		 * Returns the sizes of the stack.
		 *
		 * @return {object} a object where object.undo is the number of changes that can be un-done, 
		 *  and object.redo is the number of changes that can be re-done.
		 *
		 * @see orion.editor.UndoStack#canUndo
		 * @see orion.editor.UndoStack#canRedo
		 */
		getSize: function() {
			return {
				undo: this.index,
				redo: this.stack.length - this.index
			};
		},
		/**
		 * @class This object represents a text change.
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.UndoStack}<br/>
		 * {@link orion.editor.UndoStack#getUndoChanges}<br/>
		 * {@link orion.editor.UndoStack#getRedoChanges}<br/>
		 * </p>
		 * @name orion.editor.TextChange
		 * 
		 * @property {Number} start The start offset in the model of the range to be replaced.
		 * @property {Number} end The end offset in the model of the range to be replaced
		 * @property {String} text the text to be inserted
		 */
		/**
		 * Returns the redo changes.
		 *
		 * @return {orion.editor.TextChange[]} an array of TextChanges that are returned in the order
		 * that they occurred (most recent change last).
		 *
		 * @see orion.editor.UndoStack#getUndoChanges
		 */
		getRedoChanges: function() {
			this._commitUndo();
			var changes = [];
			for (var i=this.index; i<this.stack.length; i++) {
				changes = changes.concat(this.stack[i].getRedoChanges());
			}
			return changes;
		},
		/**
		 * Returns the undo changes.
		 *
		 * @return {orion.editor.TextChange[]} an array of TextChanges that are returned in the reverse order
		 * that they occurred (most recent change first).
		 *
		 * @see orion.editor.UndoStack#getRedoChanges
		 */
		getUndoChanges: function() {
			this._commitUndo();
			var changes = [];
			for (var i=this.index; i >= 0; i--) {
				changes = changes.concat(this.stack[i].getUndoChanges());
			}
			return changes;
		},
		/**
		 * Undo the last change in the stack.
		 *
		 * @return {Boolean} returns true if a change was un-done.
		 *
		 * @see orion.editor.UndoStack#redo
		 * @see orion.editor.UndoStack#canUndo
		 */
		undo: function() {
			this._commitUndo();
			var change, result = false;
			this._ignoreUndo = true;
			do {
				if (this.index <= 0) {
					break;
				}
				change = this.stack[--this.index];
			} while (!(result = change.undo(this.view, true)));
			this._ignoreUndo = false;
			return result;
		},
		/**
		 * Redo the last change in the stack.
		 *
		 * @return {Boolean} returns true if a change was re-done.
		 *
		 * @see orion.editor.UndoStack#undo
		 * @see orion.editor.UndoStack#canRedo
		 */
		redo: function() {
			this._commitUndo();
			var change, result = false;
			this._ignoreUndo = true;
			do {
				if (this.index >= this.stack.length) {
					break;
				}
				change = this.stack[this.index++];
			} while (!(result = change.redo(this.view, true)));
			this._ignoreUndo = false;
			return result;
		},
		/**
		 * Reset the stack to its original state. All changes in the stack are thrown away.
		 */
		reset: function() {
			this.index = 0;
			this.cleanChange = undefined;
			this.stack = [];
			this._ignoreUndo = false;
			this._compoundChange = undefined;
		},
		setView: function(view) {
			if (this.view === view) { return; }
			if (this.view) {
				view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
			}
			this.view = view;
			if (this.view) {
				view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
			}
		},
		/**
		 * Starts a compound change. 
		 * <p>
		 * All changes added to stack from the time startCompoundChange() is called
		 * to the time that endCompoundChange() is called are compound on one change that can be un-done or re-done
		 * with one single call to undo() or redo().
		 * </p>
		 *
		 * @param owner the owner of the compound change which is called for start, end, undo and redo.
		 *		 
		 * @return the compound change
		 *
		 * @see orion.editor.UndoStack#endCompoundChange
		 */
		startCompoundChange: function(owner) {
			this._commitUndo();
			var change = new CompoundChange(owner);
			this.add(change);
			this.compoundChange = change;
			this.compoundChange.start(this.view);
			return this.compoundChange;
		},
		_commitUndo: function () {
			this.endCompoundChange();
		},
		_onDestroy: function(evt) {
			if (!evt /* undo stack destroyed */ || !this.shared) {
				this.model.removeEventListener("Changing", this._listener.onChanging); //$NON-NLS-0$
			}
			if (this.view) {
				this.view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
				this.view = null;
			}
		},
		_trackUnsavedChanges: function(e) {
			if (!this._unsavedChanges) return;
			var length = this._unsavedChanges.length;
			var addedCharCount = e.addedCharCount;
			var removedCharCount = e.removedCharCount;
			var start = e.start;
			var end = e.start + removedCharCount;
			var type = 0;
			if (addedCharCount === 0) {
				type = -1;
			} else if (removedCharCount === 0) {
				type = 1;
			}
			if (length > 0) {
				if (type === this._previousChangeType) {
					var previousChange = this._unsavedChanges[length-1];
					if (removedCharCount === 0 && start === previousChange.end + previousChange.text.length) {
						previousChange.text += e.text;
						return;
					}
					if (e.addedCharCount === 0 && end === previousChange.start) {
						previousChange.start = start;
						return;
					}
				}
			}
			this._previousChangeType = type;
			this._unsavedChanges.push({start:start, end:end, text:e.text});
		},
		_onChanging: function(e) {
			this._trackUnsavedChanges(e);
			if (this._ignoreUndo) {
				return;
			}
			var text = e.text;
			var start = e.start;
			var addedCharCount = e.addedCharCount;
			var removedCharCount = e.removedCharCount;
			var end = start + removedCharCount;
			var type = 0;
			if (addedCharCount === 0 && removedCharCount === 1) {
				type = -1;
			} else if (addedCharCount === 1 && removedCharCount === 0) {
				type = 1;
			}
			var length = this.stack.length;
			var previousText = this.model.getText(start, end);
			if (length > 0 && this.index === length) {
				var change = this.stack[length - 1];
				if (change.merge(start, text, previousText, type, end, this.compoundChange)) {
					return;
				}
			}
			this.add(new Change(this.model, start, text, previousText, type));
		}
	};
	
	return {
		UndoStack: UndoStack
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/

/**
 * @class Provides the various rulers that show up on the left and right sides of the editor.  The rulers
 * 			contain annotations with varying styles, hovers and on click behaviours.
 */
/*eslint-env browser, amd*/
define("orion/editor/rulers", [
	'i18n!orion/editor/nls/messages',
	'orion/editor/textView',
	'orion/editor/annotations',
	'orion/editor/tooltip', 
	'orion/objects',
	'orion/editor/util',
	'orion/util'
], function(messages, mTextView, mAnnotations, mTooltip, objects, textUtil, util) {

	function BaseRuler (rulerLocation, rulerOverview, rulerStyle) {
		this._location = rulerLocation || "left"; //$NON-NLS-0$
		this._overview = rulerOverview || "page"; //$NON-NLS-0$
		this._rulerStyle = rulerStyle;
		this._view = null;
	}
	BaseRuler.prototype = /** @lends orion.editor.BaseRuler.prototype */ {
		/**
		 * Returns the ruler location.
		 *
		 * @returns {String} the ruler location, which is either "left" or "right" or "margin".
		 *
		 * @see orion.editor.Ruler#getOverview
		 */
		getLocation: function() {
			return this._location;
		},
		/**
		 * Returns the ruler overview type.
		 *
		 * @returns {String} the overview type, which is either "page" or "document" or "fixed".
		 *
		 * @see orion.editor.Ruler#getLocation
		 */
		getOverview: function() {
			return this._overview;
		},
		/**
		 * Returns the style information for the ruler.
		 *
		 * @returns {orion.editor.Style} the style information.
		 */
		getRulerStyle: function() {
			return this._rulerStyle;
		},
		/**
		 * Returns the text view.
		 *
		 * @returns {orion.editor.TextView} the text view.
		 *
		 * @see orion.editor.Ruler#setView
		 */
		getView: function() {
			return this._view;
		},
		/**
		 * Sets the view for the ruler.
		 * <p>
		 * This method is called by the text view when the ruler
		 * is added to the view.
		 * </p>
		 *
		 * @param {orion.editor.TextView} view the text view.
		 */
		setView: function (view) {
			if (this._onTextModelChanged && this._view) {
				this._view.removeEventListener("ModelChanged", this._listener.onTextModelChanged); //$NON-NLS-0$
			}
			this._view = view;
			if (this._onTextModelChanged && this._view) {
				this._view.addEventListener("ModelChanged", this._listener.onTextModelChanged); //$NON-NLS-0$
			}
		},
	};

	/**
	 * Constructs a new ruler. 
	 * <p>
	 * The default implementation does not implement all the methods in the interface
	 * and is useful only for objects implementing rulers.
	 * <p/>
	 * 
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {String} [rulerOverview="page"] the overview for the ruler.
	 * @param {orion.editor.Style} [rulerStyle] the style for the ruler. 
	 * 
	 * @class This interface represents a ruler for the text view.
	 * <p>
	 * A Ruler is a graphical element that is placed either on the left or on the right side of 
	 * the view. It can be used to provide the view with per line decoration such as line numbering,
	 * bookmarks, breakpoints, folding disclosures, etc. 
	 * </p><p>
	 * There are two types of rulers: page and document. A page ruler only shows the content for the lines that are
	 * visible, while a document ruler always shows the whole content.
	 * </p>
	 * <b>See:</b><br/>
	 * {@link orion.editor.LineNumberRuler}<br/>
	 * {@link orion.editor.AnnotationRuler}<br/>
	 * {@link orion.editor.OverviewRuler}<br/> 
	 * {@link orion.editor.TextView}<br/>
	 * {@link orion.editor.TextView#addRuler}
	 * </p>		 
	 * @name orion.editor.Ruler
	 * @borrows orion.editor.AnnotationTypeList#addAnnotationType as #addAnnotationType
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationTypePriority as #getAnnotationTypePriority
	 * @borrows orion.editor.AnnotationTypeList#getAnnotationsByType as #getAnnotationsByType
	 * @borrows orion.editor.AnnotationTypeList#isAnnotationTypeVisible as #isAnnotationTypeVisible
	 * @borrows orion.editor.AnnotationTypeList#removeAnnotationType as #removeAnnotationType
	 */
	function Ruler (annotationModel, rulerLocation, rulerOverview, rulerStyle) {
		BaseRuler.call(this, rulerLocation, rulerOverview, rulerStyle);
		var self = this;
		this._listener = {
			onTextModelChanged: function(e) {
				self._onTextModelChanged(e);
			},
			onAnnotationModelChanged: function(e) {
				self._onAnnotationModelChanged(e);
			}
		};
		this.setAnnotationModel(annotationModel);
	}
	Ruler.prototype = objects.mixin(new BaseRuler(), /** @lends orion.editor.Ruler.prototype */ {
		/**
		 * Returns the annotations for a given line range merging multiple
		 * annotations when necessary.
		 * <p>
		 * This method is called by the text view when the ruler is redrawn.
		 * </p>
		 *
		 * @param {Number} startLine the start line index
		 * @param {Number} endLine the end line index
		 * @return {orion.editor.Annotation[]} the annotations for the line range. The array might be sparse.
		 */
		getAnnotations: function(startLine, endLine) {
			var annotationModel = this._annotationModel;
			if (!annotationModel) { return []; }
			var model = this._view.getModel();
			var start = model.getLineStart(startLine);
			var end = model.getLineEnd(endLine - 1);
			var baseModel = model;
			if (model.getBaseModel) {
				baseModel = model.getBaseModel();
				start = model.mapOffset(start);
				end = model.mapOffset(end);
			}
			var result = [];
			var annotations = this.getAnnotationsByType(annotationModel, start, end);
			for (var i = 0; i < annotations.length; i++) {
				var annotation = annotations[i];
				var annotationLineStart = baseModel.getLineAtOffset(annotation.start);
				var annotationLineEnd = baseModel.getLineAtOffset(Math.max(annotation.start, annotation.end - 1));
				for (var lineIndex = annotationLineStart; lineIndex<=annotationLineEnd; lineIndex++) {
					var visualLineIndex = lineIndex;
					if (model !== baseModel) {
						var ls = baseModel.getLineStart(lineIndex);
						ls = model.mapOffset(ls, true);
						if (ls === -1) { continue; }
						visualLineIndex = model.getLineAtOffset(ls);
					}
					if (!(startLine <= visualLineIndex && visualLineIndex < endLine)) { continue; }
					var rulerAnnotation = this._mergeAnnotation(result[visualLineIndex], annotation, lineIndex - annotationLineStart, annotationLineEnd - annotationLineStart + 1);
					if (rulerAnnotation) {
						result[visualLineIndex] = rulerAnnotation;
					}
				}
			}
			if (!this._multiAnnotation && this._multiAnnotationOverlay) {
				for (var k in result) {
					if (result[k]._multiple) {
						result[k].html = result[k].html + this._multiAnnotationOverlay.html;
					}
				}
			}
			return result;
		},
		/**
		 * Returns the annotation model.
		 *
		 * @returns {orion.editor.AnnotationModel} the ruler annotation model.
		 *
		 * @see orion.editor.Ruler#setAnnotationModel
		 */
		getAnnotationModel: function() {
			return this._annotationModel;
		},
		/**
		 * Returns the widest annotation which determines the width of the ruler.
		 * <p>
		 * If the ruler does not have a fixed width it should provide the widest
		 * annotation to avoid the ruler from changing size as the view scrolls.
		 * </p>
		 * <p>
		 * This method is called by the text view when the ruler is redrawn.
		 * </p>
		 *
		 * @returns {orion.editor.Annotation} the widest annotation.
		 *
		 * @see orion.editor.Ruler#getAnnotations
		 */
		getWidestAnnotation: function() {
			return null;
		},
		/**
		 * Sets the annotation model for the ruler.
		 *
		 * @param {orion.editor.AnnotationModel} annotationModel the annotation model.
		 *
		 * @see orion.editor.Ruler#getAnnotationModel
		 */
		setAnnotationModel: function (annotationModel) {
			if (this._annotationModel) {
				this._annotationModel.removeEventListener("Changed", this._listener.onAnnotationModelChanged); //$NON-NLS-0$
			}
			this._annotationModel = annotationModel;
			if (this._annotationModel) {
				this._annotationModel.addEventListener("Changed", this._listener.onAnnotationModelChanged); //$NON-NLS-0$
			}
		},
		/**
		 * Sets the annotation that is displayed when a given line contains multiple
		 * annotations.  This annotation is used when there are different types of
		 * annotations in a given line.
		 *
		 * @param {orion.editor.Annotation} annotation the annotation for lines with multiple annotations.
		 * 
		 * @see orion.editor.Ruler#setMultiAnnotationOverlay
		 */
		setMultiAnnotation: function(annotation) {
			this._multiAnnotation = annotation;
		},
		/**
		 * Sets the annotation that overlays a line with multiple annotations.  This annotation is displayed on
		 * top of the computed annotation for a given line when there are multiple annotations of the same type
		 * in the line. It is also used when the multiple annotation is not set.
		 *
		 * @param {orion.editor.Annotation} annotation the annotation overlay for lines with multiple annotations.
		 * 
		 * @see orion.editor.Ruler#setMultiAnnotation
		 */
		setMultiAnnotationOverlay: function(annotation) {
			this._multiAnnotationOverlay = annotation;
		},
		/**
		 * This event is sent when the user clicks a line annotation. We select an annotation on the line using
		 * the following logic:
		 * 1) If no selection or selection is on another line, select the first annotation
		 * 2) If an annotation is selected, select the next annotation in the model
		 * 3) If there is a selection that does not match an annotation, select the first annotation after the selection start
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the click event.
		 */
		onClick: function(lineIndex, e) {
			if (lineIndex === undefined) { return; }
			var view = this._view;
			
			var model = view.getModel();
			var lineStart = model.getLineStart(lineIndex);
			var lineEnd = model.getLineEnd(lineIndex, true);
			var selectionStart = view.getSelection().start;
			var selectionEnd = view.getSelection().end;
			
			var annotationModel = this._annotationModel;
			var annotation, start, end;
			if (annotationModel){

				if (model.getBaseModel) {
					lineStart = model.mapOffset(lineStart);
					lineEnd = model.mapOffset(lineEnd);
					selectionStart = model.mapOffset(selectionStart);
					selectionEnd = model.mapOffset(selectionEnd);
				}
				
				var self = this;
				annotation = this._findNextAnnotation(annotationModel, lineStart, lineEnd, selectionStart, selectionEnd, 
					function(annotationType){
						return self.isAnnotationTypeVisible(annotationType);
					}
				);
				// Select the annotation or the start of the line
				start = annotation ? annotation.start : lineStart;
				end = annotation ? annotation.end : lineStart;
				
				if (model.getBaseModel) {
					start = model.mapOffset(start, true);
					end = model.mapOffset(end, true);
				}
				
				// TODO What does this code do
				if (annotation && annotation.groupId !== undefined) {
					if (this._currentClickGroup === annotation.groupId) {
						this._currentClickGroup = null;
					} else {
						this._currentClickGroup = annotation.groupId;
					}
					this._setCurrentGroup(lineIndex);
				}
			}
			
			// Set the selection before opening the tooltip otherwise the tooltip will be closed immediately
			this._view.setSelection(end, start, 1/3, function(){});
			
			// Open the tooltip for the selected annotation in the same location as the multi-annotation ruler tooltip.
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (tooltip) {
				if (annotation && this.getLocation() === "left"){ //$NON-NLS-0$
					tooltip.show({getTooltipInfo: function() {
							return self._getTooltipInfo([annotation]);
						}
					}, false, false);
				} else {
					tooltip.hide();
				}
			}
		},
		/**
		 * This event is sent when the user double clicks a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the double click event.
		 * @callback
		 */
		onDblClick: function(lineIndex, e) {
		},
		/**
		 * This event is sent when the user moves the mouse over a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the mouse move event.
		 */
		onMouseMove: function(lineIndex, e) {
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (!tooltip) { return; }
			if (tooltip.isVisible() && this._tooltipLineIndex === lineIndex) { return; }
			this._tooltipLineIndex = lineIndex;
			
			// Prevent spurious mouse event (e.g. on a scroll)					
			if (e.clientX === this._lastMouseX
				&& e.clientY === this._lastMouseY) {
				return;
			}
			
			this._lastMouseX = e.clientX;
			this._lastMouseY = e.clientY;

			if (this._hoverTimeout) {
				window.clearTimeout(this._hoverTimeout);
				this._hoverTimeout = null;
			}
			
			var target = e.target ? e.target : e.srcElement;
			var bounds = target.getBoundingClientRect();
			this._curElementBounds = Object.create(null);
			this._curElementBounds.top = bounds.top;
			this._curElementBounds.left = bounds.left;
			this._curElementBounds.height = bounds.height;
			this._curElementBounds.width = bounds.width;
			
			// If we have the entire ruler selected, just use a 1 pixel high area in the ruler (Bug 463486)
			if (target === this.node){
				this._curElementBounds.top = e.clientY;
				this._curElementBounds.height = 1;
			}
			
			var self = this;
			self._hoverTimeout = window.setTimeout(function() {
				self._hoverTimeout = null;
				tooltip.onHover({
					getTooltipInfo: function() {
						var annotations = self._getAnnotationsAtLineIndex(self._tooltipLineIndex);
						var content = self._getTooltipContents(self._tooltipLineIndex, annotations);
						return self._getTooltipInfo(content, e.clientY, {source: "ruler", rulerLocation: self.getLocation()}); //$NON-NLS-0$
					}
				}, e.clientX, e.clientY);
			}, 175);
		},
		/**
		 * This event is sent when the mouse pointer enters a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the mouse over event.
		 */
		onMouseOver: function(lineIndex, e) {
			this.onMouseMove(lineIndex, e);
			if (!this._currentClickGroup) {
				this._setCurrentGroup(lineIndex);
			}
		},
		/**
		 * This event is sent when the mouse pointer exits a line annotation.
		 *
		 * @event
		 * @param {Number} lineIndex the line index of the annotation under the pointer.
		 * @param {DOMEvent} e the mouse out event.
		 * @callback
		 */
		onMouseOut: function(lineIndex, e) {
			if (!this._currentClickGroup) {
				this._setCurrentGroup(-1);
			}

			if (this._hoverTimeout) {
				window.clearTimeout(this._hoverTimeout);
				this._hoverTimeout = null;
			}
		},
		/**
		 * @name _findNextAnnotation
		 * @description Looks at all annotations in the given range and attempt to find the next valid
		 * 				annotation after the current selection.
		 * @function
		 * @private
		 * @param annotationModel The annotation model to lookup annotations in
		 * @param rangeStart The start range to search for annotations (required)
		 * @param rangeEnd The end range to search for annotations (required)
		 * @param selectionStart The start of the current selection (optional)
		 * @param selectionEnd The end of the current selection (optional)
		 * @param isAnnotationTypeVisible A function callback to check if a given annotation type is valid or visible (optional)
		 * @returns The next annotation in the list or <code>null</code>
		 */
		_findNextAnnotation: function(annotationModel, rangeStart, rangeEnd, selectionStart, selectionEnd, isAnnotationTypeVisible){
			var annotation = null;
			var selectedAnnotation;
			var searchStart = rangeStart;
			
			if (selectionStart >= 0 && selectionEnd >= 0){
				if (selectionStart >= rangeStart && selectionStart < rangeEnd){
					searchStart = selectionStart;
					var selectedAnnotations = annotationModel.getAnnotations(selectionStart, selectionEnd);
					while (!selectedAnnotation && selectedAnnotations.hasNext()){
						var current = selectedAnnotations.next();
						if (isAnnotationTypeVisible && !isAnnotationTypeVisible(current.type)) { continue; }
						if (current.start === selectionStart && current.end === selectionEnd){
							selectedAnnotation = current;
						}
					}
				}
			}
			
			var iter = annotationModel.getAnnotations(searchStart, rangeEnd);
			var useNextValid;
			while (iter.hasNext()){
				current = iter.next();
				if (isAnnotationTypeVisible && !isAnnotationTypeVisible(current.type)) { continue; }
				// Default to first visible annotation
				if (!annotation){
					annotation = current;
				}
				// If no selected annotation, use the first in the list
				if (!selectedAnnotation){
					annotation = current;
					break;
				}
				// If the selected annotation was found, use the next annotation
				// NOTE: If two annotations have the same range, we skip to the next annotation so don't flip between them
				if (useNextValid && (selectedAnnotation.start !== current.start || selectedAnnotation.end !== current.end)){
					useNextValid = false;
					annotation = current;
					break;
				}
				// Found the selected annotation, use the next in the list
				if (selectedAnnotation && selectedAnnotation === current){
					useNextValid = true;
				}
			}
			if (useNextValid){
				annotation = null; // Last annotation on the line was selected, go to line start
			}
			
			return annotation;
		},
		
		_getAnnotationsAtLineIndex: function _getAnnotationsAtLineIndex(lineIndex){
			if (lineIndex === undefined) { return; }
			var view = this._view;
			var annotationModel = this._annotationModel;
			var annotations = [];
			var model;
			
			//check if the current view exists, if not return empty array
			if (view) {
				model = view.getModel();
			} else {
				return [];
			}
			
			// check if both model exists
			if (annotationModel && model) {
				var start = model.getLineStart(lineIndex);
				var end = model.getLineEnd(lineIndex);
				if (model.getBaseModel) {
					start = model.mapOffset(start);
					end = model.mapOffset(end);
				}
				annotations = this.getAnnotationsByType(annotationModel, start, end);
			}
			return annotations;
		},
		/** @ignore */
		_getTooltipInfo: function(contents, y, context) {
			if (!contents) { return null; } // TODO: shouldn't this check the length, it'll never be null
		
			var hoverArea = Object.create(null);
			hoverArea.top = this._curElementBounds.top;
			hoverArea.left = this._curElementBounds.left;
			hoverArea.height = this._curElementBounds.height;
			hoverArea.width = this._curElementBounds.width;
			
			if (typeof contents === 'string' && y) {
				// Hack for line numbers
				hoverArea.top = y;
				hoverArea.height = 1;
			}
			
			var rulerLocation = this.getLocation();
			var rulerStyle = this.getRulerStyle();
			// The tooltip is positioned opposite to where the ruler is
			var position = rulerLocation === "left" ? "right" : "left"; //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
			
			var offsetX = 0;
			var offsetY = 0;
			if (this._view){
				var viewRect = this._view._clientDiv.getBoundingClientRect();
				offsetX = viewRect.left - (hoverArea.left + hoverArea.width);
			} else {
				offsetX = hoverArea.width;
			}
			offsetY = hoverArea.height;
			if (position === "left") {
				offsetX = -25;
				// Hack for when the hoverArea is a sliver of the ruler, ruler is 2px wider than annotations
				if (hoverArea.height === 1){
					offsetX += 2;
				}
			}
			// Adjust the tooltip for folding comments to exactly cover the unfolded text location
			if (rulerStyle.styleClass.indexOf("folding") >= 0){ //$NON-NLS-0$
				offsetY -= 14;
			}
			
			var info = {
				contents: contents,
				position: position,
				tooltipOffsetX: offsetX,
				tooltipOffsetY: offsetY,
				anchorArea: hoverArea,
				context: context
			};
			return info;
		},
		/**
		 * @name _getTooltipContents
		 * @description Overridden by different rulers to provide customer tooltip content
		 * @function
		 * @private
		 * @param lineIndex
		 * @param annotations
		 * @returns returns
		 * @callback
		 */
		_getTooltipContents: function _getTooltipContents(lineIndex, annotations){
			return annotations;
		},
		
		_getOnClickTooltipInfo: function(annotation) {
			var view = this._view;
			var hoverArea = Object.create(null);
			hoverArea.top = this._curElementBounds.top;
			hoverArea.left = this._curElementBounds.left;
			hoverArea.height = this._curElementBounds.height;
			hoverArea.width = this._curElementBounds.width;
			var rulerLocation = this.getLocation();
			var position = rulerLocation === "left" ? "right" : "left"; //$NON-NLS-0$ //$NON-NLS-1$ //$NON-NLS-2$
			var info = {
				contents: [annotation],
				position: position,
				anchorArea: hoverArea
			};
			
			if (view){
				var viewRect = view._clientDiv.getBoundingClientRect();
				info.offsetX = viewRect.left - (hoverArea.left + hoverArea.width);
			} else {
				info.offsetX = hoverArea.width;
			}

			info.offsetY = hoverArea.height;
			if (info.position === "left") {
				info.offsetX = 20;
			}
			return info;
		},
		/** @ignore */
		_onAnnotationModelChanged: function(e) {
			var view = this._view;
			if (!view) { return; }
			var model = view.getModel(), self = this;
			var lineCount = model.getLineCount();
			if (e.textModelChangedEvent) {
				var start = e.textModelChangedEvent.start;
				if (model.getBaseModel) { start = model.mapOffset(start, true); }
				var startLine = model.getLineAtOffset(start);
				view.redrawLines(startLine, lineCount, self);
				return;
			}
			function redraw(changes) {
				for (var i = 0; i < changes.length; i++) {
					if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
					start = changes[i].start;
					var end = changes[i].end;
					if (model.getBaseModel) {
						start = model.mapOffset(start, true);
						end = model.mapOffset(end, true);
					}
					if (start !== -1 && end !== -1) {
						view.redrawLines(model.getLineAtOffset(start), model.getLineAtOffset(Math.max(start, end - 1)) + 1, self);
					}
				}
			}
			redraw(e.added);
			redraw(e.removed);
			redraw(e.changed);
		},
		/** @ignore */
		_mergeAnnotation: function(result, annotation, annotationLineIndex, annotationLineCount) {
			if (!result) { result = {}; }
			if (annotationLineIndex === 0) {
				if (result.html && annotation.html) {
					if (annotation.html !== result.html) {
						if (!result._multiple && this._multiAnnotation) {
							result.html = this._multiAnnotation.html;
						}
					} 
					result._multiple = true;
				} else {
					result.html = annotation.html;
				}
			}
			result.style = this._mergeStyle(result.style, annotation.style);
			return result;
		},
		/** @ignore */
		_mergeStyle: function(result, style) {
			if (style) {
				if (!result) { result = {}; }
				if (result.styleClass && style.styleClass && result.styleClass !== style.styleClass) {
					result.styleClass += " " + style.styleClass; //$NON-NLS-0$
				} else {
					result.styleClass = style.styleClass;
				}
				var prop;
				if (style.style) {
					if (!result.style) { result.style  = {}; }
					for (prop in style.style) {
						if (result.style[prop] === undefined) {
							result.style[prop] = style.style[prop];
						}
					}
				}
				if (style.attributes) {
					if (!result.attributes) { result.attributes  = {}; }
					for (prop in style.attributes) {
						if (result.attributes[prop] === undefined) {
							result.attributes[prop] = style.attributes[prop];
						}
					}
				}
			}
			return result;
		},
		_setCurrentGroup: function(lineIndex) {
			var annotationModel = this._annotationModel;
			var groupAnnotation = null;
			var model = annotationModel.getTextModel();
			var annotation;
			var annotations;
			var currentGroupAnnotation = this._currentGroupAnnotation;
			if (lineIndex !== -1) {
				var start = model.getLineStart(lineIndex);
				var end = model.getLineEnd(lineIndex);
				if (model.getBaseModel) {
					start = model.mapOffset(start);
					end = model.mapOffset(end);
				}
				annotations = annotationModel.getAnnotations(start, end);
				while(annotations.hasNext()){
					annotation = annotations.next();
					if (!this.isAnnotationTypeVisible(annotation.type)) { continue; }
					if (annotation.start <= start && annotation.end >= end){
						if (annotation.groupId !== undefined) {
							groupAnnotation = annotation;
							break;
						}
					}
				}
				if (currentGroupAnnotation && groupAnnotation) {
					if (currentGroupAnnotation.groupId === groupAnnotation.groupId) {
						return;
					}
				}
			}
			this._currentGroupAnnotation = null;
			if (currentGroupAnnotation) {
				annotationModel.removeAnnotations(currentGroupAnnotation.groupType);
			}
			if (!groupAnnotation) { return; }
			
			if (lineIndex === -1) { return; }
			this._currentGroupAnnotation = groupAnnotation;
			annotations = annotationModel.getAnnotations();
			var add = [];
			while (annotations.hasNext()) {
				annotation = annotations.next();
				delete annotation.groupAnnotation;
				if (annotation.groupId === groupAnnotation.groupId) {
					annotation = annotation.createGroupAnnotation();
					add.push(annotation);
				}
			}
			annotationModel.replaceAnnotations(null, add);
		}
	});
	mAnnotations.AnnotationTypeList.addMixin(Ruler.prototype);

	/**
	 * Constructs a new line numbering ruler. 
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 * @param {orion.editor.Style} [oddStyle={style: {backgroundColor: "white"}] the style for lines with odd line index.
	 * @param {orion.editor.Style} [evenStyle={backgroundColor: "white"}] the style for lines with even line index.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements a line numbering ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.Ruler}
	 * </p>
	 * @name orion.editor.LineNumberRuler
	 */
	function LineNumberRuler (annotationModel, rulerLocation, rulerStyle, oddStyle, evenStyle) {
		Ruler.call(this, annotationModel, rulerLocation, "page", rulerStyle); //$NON-NLS-0$
		this._oddStyle = oddStyle || {style: {backgroundColor: "white"}}; //$NON-NLS-0$
		this._evenStyle = evenStyle || {style: {backgroundColor: "white"}}; //$NON-NLS-0$
		this._numOfDigits = 0;
		this._firstLine = 1;
	}
	LineNumberRuler.prototype = new Ruler(); 
	/** @ignore */
	LineNumberRuler.prototype.getAnnotations = function(startLine, endLine) {
		var result = Ruler.prototype.getAnnotations.call(this, startLine, endLine);
		var model = this._view.getModel();
		for (var lineIndex = startLine; lineIndex < endLine; lineIndex++) {
			var style = (lineIndex - this._firstLine) & 1 ? this._oddStyle : this._evenStyle;
			var mapLine = lineIndex;
			if (model.getBaseModel) {
				var lineStart = model.getLineStart(mapLine);
				mapLine = model.getBaseModel().getLineAtOffset(model.mapOffset(lineStart));
			}
			if (!result[lineIndex]) { result[lineIndex] = {}; }
			result[lineIndex].html = (this._firstLine + mapLine) + "";
			if (!result[lineIndex].style) { result[lineIndex].style = style; }
		}
		return result;
	};
	/** @ignore */
	LineNumberRuler.prototype.getWidestAnnotation = function() {
		var lineCount = this._view.getModel().getLineCount();
		return this.getAnnotations(lineCount - 1, lineCount)[lineCount - 1];
	};
	/**
	 * Sets the line index displayed for the first line. The default value is
	 * <code>1</code>.
	 *
	 * @param {Number} [lineIndex=1] the first line index displayed
	 */
	LineNumberRuler.prototype.setFirstLine = function(lineIndex) {
		this._firstLine = lineIndex !== undefined ? lineIndex : 1;
	};
	/** @ignore */
	LineNumberRuler.prototype._onTextModelChanged = function(e) {
		var start = e.start;
		var model = this._view.getModel();
		var lineCount = model.getBaseModel ? model.getBaseModel().getLineCount() : model.getLineCount();
		var numOfDigits = ((this._firstLine + lineCount - 1)+"").length;
		if (this._numOfDigits !== numOfDigits) {
			this._numOfDigits = numOfDigits;
			var startLine = model.getLineAtOffset(start);
			this._view.redrawLines(startLine,  model.getLineCount(), this);
		}
	};
	
	/** 
	 * @class This is class represents an annotation for the AnnotationRuler. 
	 * <p> 
	 * <b>See:</b><br/> 
	 * {@link orion.editor.AnnotationRuler}
	 * </p> 
	 * 
	 * @name orion.editor.Annotation 
	 * 
	 * @property {String} [html=""] The html content for the annotation, typically contains an image.
	 * @property {orion.editor.Style} [style] the style for the annotation.
	 * @property {orion.editor.Style} [overviewStyle] the style for the annotation in the overview ruler.
	 */ 
	/**
	 * Constructs a new annotation ruler. 
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 * @param {orion.editor.Annotation} [defaultAnnotation] the default annotation.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an annotation ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.Ruler}<br/>
	 * {@link orion.editor.Annotation}
	 * </p>
	 * @name orion.editor.AnnotationRuler
	 */
	function AnnotationRuler (annotationModel, rulerLocation, rulerStyle) {
		Ruler.call(this, annotationModel, rulerLocation, "page", rulerStyle); //$NON-NLS-0$
	}
	AnnotationRuler.prototype = new Ruler();
	
	/**
	 * Constructs a new overview ruler. 
	 * <p>
	 * The overview ruler is used in conjunction with a AnnotationRuler, for each annotation in the 
	 * AnnotationRuler this ruler displays a mark in the overview. Clicking on the mark causes the 
	 * view to scroll to the annotated line.
	 * </p>
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an overview ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.AnnotationRuler} <br/>
	 * {@link orion.editor.Ruler} 
	 * </p>
	 * @name orion.editor.OverviewRuler
	 */
	function OverviewRuler (annotationModel, rulerLocation, rulerStyle) {
		Ruler.call(this, annotationModel, rulerLocation, "document", rulerStyle); //$NON-NLS-0$
	}
	OverviewRuler.prototype = new Ruler();
	
	/** @ignore */
	OverviewRuler.prototype.getRulerStyle = function() {
		var result = {style: {lineHeight: "1px", fontSize: "1px"}}; //$NON-NLS-1$ //$NON-NLS-0$
		result = this._mergeStyle(result, this._rulerStyle);
		return result;
	};
	/** @ignore */
	OverviewRuler.prototype._getTooltipContents = function(lineIndex, annotations) {
		if (annotations && annotations.length === 0) {
			var model = this._view.getModel();
			var mapLine = lineIndex;
			if (model.getBaseModel) {
				var lineStart = model.getLineStart(mapLine);
				mapLine = model.getBaseModel().getLineAtOffset(model.mapOffset(lineStart));
			}
			return util.formatMessage(messages.line, mapLine + 1);
		}
		return Ruler.prototype._getTooltipContents.call(this, lineIndex, annotations);
	};
	/** @ignore */
	OverviewRuler.prototype._mergeAnnotation = function(previousAnnotation, annotation, annotationLineIndex, annotationLineCount) {
		if (annotationLineIndex !== 0) { return undefined; }
		var result = previousAnnotation;
		if (!result) {
			//TODO annotationLineCount does not work when there are folded lines
			var height = 3 * annotationLineCount;
			result = {html: "&nbsp;", style: { style: {height: height + "px"}}}; //$NON-NLS-1$ //$NON-NLS-0$
			result.style = this._mergeStyle(result.style, annotation.overviewStyle);
		}
		return result;
	};

	/**
	 * Constructs a new folding ruler. 
	 *
	 * @param {orion.editor.AnnotationModel} annotationModel the annotation model for the ruler.
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an overview ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.AnnotationRuler} <br/>
	 * {@link orion.editor.Ruler} 
	 * </p>
	 * @name orion.editor.OverviewRuler
	 */
	function FoldingRuler (annotationModel, rulerLocation, rulerStyle) {
		AnnotationRuler.call(this, annotationModel, rulerLocation, rulerStyle);
	}
	FoldingRuler.prototype = new AnnotationRuler();
	
	/** @ignore */
	FoldingRuler.prototype.onClick =  /* @callback */ function(lineIndex, e) {
		if (lineIndex === undefined) { return; }
		var annotationModel = this._annotationModel;
		if (!annotationModel) { return; }
		var view = this._view;
		var model = view.getModel();
		var start = model.getLineStart(lineIndex);
		var end = model.getLineEnd(lineIndex, true);
		if (model.getBaseModel) {
			start = model.mapOffset(start);
			end = model.mapOffset(end);
			model = model.getBaseModel();
		}
		var annotation, iter = annotationModel.getAnnotations(start, end);
		while (!annotation && iter.hasNext()) {
			var a = iter.next();
			if (!this.isAnnotationTypeVisible(a.type)) { continue; }
			if (model.getLineAtOffset(a.start) !== model.getLineAtOffset(start)) { continue; }
			annotation = a;
		}
		if (annotation) {
			var tooltip = mTooltip.Tooltip.getTooltip(this._view);
			if (tooltip) {
				tooltip.hide();
			}
			if (annotation.expanded) {
				annotation.collapse();
			} else {
				annotation.expand();
			}
		}
	};
	/** @ignore */
	FoldingRuler.prototype._getTooltipContents = function(lineIndex, annotations) {
		if (annotations && annotations.length > 0) {
			var view = this._view;
			var model = view.getModel();
			var start = model.getLineStart(lineIndex);
			if (model.getBaseModel) {
				start = model.mapOffset(start);
				model = model.getBaseModel();
			}
			var mapLineIndex = model.getLineAtOffset(start);
			for (var i = 0; i < annotations.length; i++) {
				var a = annotations[i];
				if (!this.isAnnotationTypeVisible(a.type)) { continue; }
				if (model.getLineAtOffset(a.start) !== mapLineIndex) { continue; }
				if (annotations[i].expanded) {
					break;
				}
				return AnnotationRuler.prototype._getTooltipContents.call(this, lineIndex, [a]);
			}
		}
		return null;
	};
	/** @ignore */
	FoldingRuler.prototype._onAnnotationModelChanged = function(e) {
		if (e.textModelChangedEvent) {
			AnnotationRuler.prototype._onAnnotationModelChanged.call(this, e);
			return;
		}
		var view = this._view;
		if (!view) { return; }
		var model = view.getModel(), self = this, i;
		var lineCount = model.getLineCount(), lineIndex = lineCount;
		function redraw(changes) {
			for (i = 0; i < changes.length; i++) {
				if (!self.isAnnotationTypeVisible(changes[i].type)) { continue; }
				var start = changes[i].start;
				if (model.getBaseModel) {
					start = model.mapOffset(start, true);
				}
				if (start !== -1) {
					lineIndex = Math.min(lineIndex, model.getLineAtOffset(start));
				}
			}
		}
		redraw(e.added);
		redraw(e.removed);
		redraw(e.changed);
		var rulers = view.getRulers();
		for (i = 0; i < rulers.length; i++) {
			view.redrawLines(lineIndex, lineCount, rulers[i]);
		}
	};
	

	/**
	 * Constructs a new zoom ruler. 
	 *
	 * @param {String} [rulerLocation="left"] the location for the ruler.
	 * @param {orion.editor.Style} [rulerStyle=undefined] the style for the ruler.
	 *
	 * @augments orion.editor.Ruler
	 * @class This objects implements an overview ruler.
	 *
	 * <p><b>See:</b><br/>
	 * {@link orion.editor.AnnotationRuler} <br/>
	 * {@link orion.editor.Ruler} 
	 * </p>
	 * @name orion.editor.OverviewRuler
	 */
	var ZoomRuler = function(rulerLocation, rulerStyle) {
		BaseRuler.call(this, rulerLocation, "fixed", rulerStyle); //$NON-NLS-0$
	};
	
	ZoomRuler.prototype = objects.mixin(new BaseRuler(), {
		setView: function (view) {
			this._destroy();
			BaseRuler.prototype.setView.call(this, view);
			this._create();
		},
		_create: function() {
			var textView = this.getView();
			if (!textView) return;
			function getOptions(options) {
				var rulerTheme = "textviewZoom"; //$NON-NLS-0$
				var theme = options.themeClass;
				if (theme) {
					theme = theme.replace(rulerTheme, "");
					if (theme) { theme = " " + theme; } //$NON-NLS-0$
					theme = rulerTheme + theme;
				} else {
					theme = rulerTheme;
				}
				options.themeClass = theme;
				options.noScroll = true;
				options.readonly = true;
				return options;
			}
			var options = getOptions(textView.getOptions());
			options.parent = this.node;
			var zoomView = this._zoomView = new mTextView.TextView(options);
			zoomView._clientDiv.contentEditable = false;
			zoomView.setModel(textView.getModel());
			var document = textView.getOptions("parent").ownerDocument; //$NON-NLS-0$
			var windowDiv = this._windowDiv = util.createElement(document, "div"); //$NON-NLS-0$
			windowDiv.className ="rulerZoomWindow"; //$NON-NLS-0$
			this.node.appendChild(windowDiv);
			var border = parseInt(textUtil.getNodeStyle(windowDiv, "border-top-width", 0)) + //$NON-NLS-0$
					parseInt(textUtil.getNodeStyle(windowDiv, "border-bottom-width", 0)); //$NON-NLS-0$
			var that = this;
			function updateWindow(scroll, p) {
				var top = scroll.y * p.zoomFactor;
				var height = p.clientHeight * p.zoomFactor;
				that.top = top;
				that.bottom = top + height;
				top = zoomView.convert({y: top}, "document", "page").y; //$NON-NLS-1$ //$NON-NLS-0$
				top = top - that.node.getBoundingClientRect().top;
				windowDiv.style.top = top + "px"; //$NON-NLS-0$
				windowDiv.style.height = (height - border) + "px"; //$NON-NLS-0$
			}
			function getProps() {
				var padding = textView._metrics.viewPadding;
				var zoomPadding = textView._metrics.viewPadding;
				var lineHeight = textView.getLineHeight();
				var zoomLineHeight = zoomView.getLineHeight();
				var lineCount = textView.getModel().getLineCount();
				var documentHeight = textView._lineHeight ? textView._scrollHeight : lineCount * lineHeight;
				var zoomDocumentHeight = zoomView._lineHeight ? zoomView._scrollHeight : lineCount * zoomLineHeight;
				var zoomFactor = zoomDocumentHeight / documentHeight;
				var clientHeight = textView.getClientArea().height + padding.top + padding.bottom;
				var zoomClientHeight = zoomView.getClientArea().height + zoomPadding.top + zoomPadding.bottom;
				var windowHeight = clientHeight * zoomFactor;
				var scrollWidth = textView._metrics.scrollWidth;
				return {
					zoomFactor: zoomFactor,
					documentHeight: documentHeight,
					zoomDocumentHeight: zoomDocumentHeight,
					clientHeight: clientHeight,
					zoomClientHeight: zoomClientHeight,
					scrollWidth: scrollWidth,
					windowHeight: windowHeight,
					padding: padding
				};
			}
			function toZoom(scroll, p) {
				return scroll.y * (p.zoomFactor + (p.windowHeight - p.clientHeight - p.scrollWidth) / p.documentHeight);
			}
			function updateScroll(scroll) {
				scroll = scroll || {y: textView.getTopPixel()};
				var p = getProps();
				var y = toZoom(scroll, p);
				zoomView.setTopPixel(y);
				updateWindow(scroll, p);
			}
			function updateWidth(options) {
				var width;
				if (options.wrapMode && !options.wrapOffset && textView._metrics.charWidth) {
					var div1 = util.createElement(document, "div"); //$NON-NLS-0$
					div1.style.position = "fixed"; //$NON-NLS-0$
					div1.style.left = "-1000px"; //$NON-NLS-0$
					zoomView._clientDiv.appendChild(div1);
					div1.textContent = new Array(Math.ceil(textView.getClientArea().width / textView._metrics.charWidth) + 1).join("a"); //$NON-NLS-0$
					var rect1 = div1.getBoundingClientRect();
					width = Math.min(150, Math.ceil(rect1.right - rect1.left)) + "px"; //$NON-NLS-0$
				} else {
					width = "";
				}
				var oldWidth = that.node.style.width;
				that.node.style.width = width;
				return oldWidth !== width;
			}
			textView.addEventListener("Scroll", this._scrollListener = function(event) { //$NON-NLS-0$
				updateScroll(event.newValue);
			});
			textView.addEventListener("Resize", this._resizeListener = function() { //$NON-NLS-0$
				updateWidth(zoomView.getOptions());
				updateScroll();
			});
			textView.addEventListener("Redraw", this._redrawListener = function(event) { //$NON-NLS-0$
				if (!event.ruler) {
					zoomView.redrawLines(event.startLine, event.endLine);
				}
			});
			textView.addEventListener("Options", this._optionsListener = function(event) { //$NON-NLS-0$
				var options = getOptions(event.options);
				zoomView.setOptions(options);
				updateWidth(zoomView.getOptions());
			});
			zoomView.addEventListener("LineStyle", this._lineListener = function(e) { //$NON-NLS-0$
				textView.onLineStyle(e);
			});
			function down(event, clientY, touch) {
				if (touch || (that.top <= event.y && event.y <= that.bottom)) {
					that.mouseDown = true;
					that.delta = clientY - windowDiv.getBoundingClientRect().top + that.node.getBoundingClientRect().top;
				} else {
					var offset = zoomView.getOffsetAtLocation(event.x, event.y);
					textView.setSelection(offset, offset, 0.5, function() {});
				}
			}
			function up() {
				that.mouseDown = false;
			}
			function move(clientY) {
				if (that.mouseDown) {
					var p = getProps();
					var thumbPos = Math.min(p.zoomClientHeight - p.windowHeight, Math.max(0, clientY - that.delta));
					textView.setTopPixel(thumbPos * (p.documentHeight - p.clientHeight) / Math.min(p.zoomDocumentHeight, p.zoomClientHeight - p.windowHeight));
				}
			}
			function stop(event) {
				event.preventDefault();
			}
			if (util.isIOS || util.isAndroid) {
				windowDiv.addEventListener("touchstart", function(event) { //$NON-NLS-0$
					var touches = event.touches;
					if (touches.length === 1) {
						down(event, event.touches[0].clientY, true);
						event.preventDefault();
					}
				});
				windowDiv.addEventListener("touchend", function(event) { //$NON-NLS-0$
					var touches = event.touches;
					if (touches.length === 0) {
						up();
					}
				});
				windowDiv.addEventListener("touchmove", function(event) { //$NON-NLS-0$
					var touches = event.touches;
					if (touches.length === 1) {
						move(event.touches[0].clientY);
					}
				});
				zoomView.addEventListener("TouchStart", function(event) { //$NON-NLS-0$
					if (event.touchCount === 1) {
						down(event, event.event.touches[0].clientY);
						stop(event);
					}
				});
//				windowDiv.style.pointerEvents = "none"; //$NON-NLS-0$
//				zoomView.addEventListener("TouchEnd", function(event) { //$NON-NLS-0$
//					if (event.touchCount === 0) {
//						up(event);
//					}
//				});
//				zoomView.addEventListener("TouchMove", function(event) { //$NON-NLS-0$
//					if (event.touchCount === 1) {
//						move(event.event.touches[0].clientY);
//					}
//				});
			} else {
				windowDiv.style.pointerEvents = "none"; //$NON-NLS-0$
				zoomView.addEventListener("MouseDown", function(event) { //$NON-NLS-0$
					var e = event.event;
					if (e.which ? e.button === 0 : e.button === 1) {
						down(event, e.clientY);
					}
					stop(event);
				});
				zoomView.addEventListener("MouseUp", function(event) { //$NON-NLS-0$
					up();
					stop(event);
				});
				zoomView.addEventListener("MouseMove", function(event) { //$NON-NLS-0$
					move(event.event.clientY);
					stop(event);
				});
			}
			(document.defaultView || document.parentWindow).setTimeout(function() {
				updateScroll();
			}, 0);
		},
		_destroy: function() {
			var textView = this.getView();
			if (textView) {
				textView.removeEventListener("Scroll", this._scrollListener); //$NON-NLS-0$
				this._scrollListener = null;
				textView.removeEventListener("Resize", this._resizeListener); //$NON-NLS-0$
				this._resizeListener = null;
				textView.removeEventListener("Redraw", this._redrawListener); //$NON-NLS-0$
				this._redrawListener = null;
				textView.removeEventListener("Options", this._optionsListener); //$NON-NLS-0$
				this._optionsListener = null;
			}
			var zoomView = this._zoomView;
			if (zoomView) {
				zoomView.removeEventListener("LineStyle", this._lineListener); //$NON-NLS-0$
				zoomView.setModel(null);
				zoomView.destroy();
				this._zoomView = null;
			}
		}
	});
	
	return {
		BaseRuler: BaseRuler,
		Ruler: Ruler,
		AnnotationRuler: AnnotationRuler,
		LineNumberRuler: LineNumberRuler,
		OverviewRuler: OverviewRuler,
		FoldingRuler: FoldingRuler,
		ZoomRuler: ZoomRuler,
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2012 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 * 
 * Contributors: 
 *		Felipe Heidrich (IBM Corporation) - initial API and implementation
 *		Silenio Quarti (IBM Corporation) - initial API and implementation
 ******************************************************************************/
 
/*eslint-env browser, amd*/
define("orion/editor/textDND", ['orion/util'], function(util) { //$NON-NLS-1$ //$NON-NLS-0$

	function TextDND(view, undoStack) {
		this._view = view;
		this._undoStack = undoStack;
		this._dragSelection = null;
		this._dropOffset = -1;
		this._dropText = null;
		var self = this;
		this._listener = {
			onDragStart: function (evt) {
				self._onDragStart(evt);
			},
			onDragEnd: function (evt) {
				self._onDragEnd(evt);
			},
			onDragEnter: function (evt) {
				self._onDragEnter(evt);
			},
			onDragOver: function (evt) {
				self._onDragOver(evt);
			},
			onDrop: function (evt) {
				self._onDrop(evt);
			},
			onDestroy: function (evt) {
				self._onDestroy(evt);
			}
		};
		view.addEventListener("DragStart", this._listener.onDragStart); //$NON-NLS-0$
		view.addEventListener("DragEnd", this._listener.onDragEnd); //$NON-NLS-0$
		view.addEventListener("DragEnter", this._listener.onDragEnter); //$NON-NLS-0$
		view.addEventListener("DragOver", this._listener.onDragOver); //$NON-NLS-0$
		view.addEventListener("Drop", this._listener.onDrop); //$NON-NLS-0$
		view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
	}
	TextDND.prototype = {
		destroy: function() {
			var view = this._view;
			if (!view) { return; }
			view.removeEventListener("DragStart", this._listener.onDragStart); //$NON-NLS-0$
			view.removeEventListener("DragEnd", this._listener.onDragEnd); //$NON-NLS-0$
			view.removeEventListener("DragEnter", this._listener.onDragEnter); //$NON-NLS-0$
			view.removeEventListener("DragOver", this._listener.onDragOver); //$NON-NLS-0$
			view.removeEventListener("Drop", this._listener.onDrop); //$NON-NLS-0$
			view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
			this._view = null;
		},
		_onDestroy: function(e) {
			this.destroy();
		},
		_onDragStart: function(e) {
			var view = this._view;
			var text = view.getSelectionText();
			if (text) {
				this._dragSelection = view.getSelections();
				e.event.dataTransfer.effectAllowed = "copyMove"; //$NON-NLS-0$
				e.event.dataTransfer.setData("Text", text); //$NON-NLS-0$
			}
		},
		_onDragEnd: function(e) {
			if (this._dragSelection) {
				var view = this._view;
				var dropEffect = e.event.dataTransfer.dropEffect;
				if (!util.isFirefox) {
					if (dropEffect !== "none" || this._dropText) { //$NON-NLS-0$
						dropEffect = e.event.dataTransfer.dropEffect = this._dropEffect;
					}
				}
				if (this._undoStack) { this._undoStack.startCompoundChange(); }
				var move = dropEffect === "move"; //$NON-NLS-0$
				if (move) {
					view.setText({text: "", selection: this._dragSelection});
				}
				if (this._dropText) {
					var text = this._dropText;
					var offset = this._dropOffset;
					if (move) {
						this._dragSelection.forEach(function(selection) {
							if (offset >= selection.end) {
								offset -= selection.end - selection.start;
							} else if (offset >= selection.start) {
								offset = selection.start;
							}
						});
					}
					view.setText(text, offset, offset);
					view.setSelection(offset, offset + text.length);
					this._dropText = null;
					this._dropOffset = -1;
				}
				if (this._undoStack) { this._undoStack.endCompoundChange(); }
				this._dragSelection = null;
			}
		},
		_onDragEnter: function(e) {
			this._onDragOver(e);
		},
		_onDragOver: function(e) {
			var types = e.event.dataTransfer.types;
			var allowed = !this._view.getOptions("readonly"); //$NON-NLS-0$
			if (allowed) {
				if (types) {
					allowed = types.contains ? 
						types.contains("text/plain") || types.contains("Text") : //$NON-NLS-1$ //$NON-NLS-0$
						types.indexOf("text/plain") !== -1 || types.indexOf("Text") !== -1; //$NON-NLS-1$ //$NON-NLS-0$
					}
			}
			if (!allowed) {
				e.event.dataTransfer.dropEffect = "none"; //$NON-NLS-0$
			} else {
				if (!util.isFirefox) {
					var copy = util.isMac ? e.event.altKey : e.event.ctrlKey;
					this._dropEffect = e.event.dataTransfer.dropEffect = copy ? "copy" : "move"; //$NON-NLS-1$ //$NON-NLS-0$
				}
			}
		},
		_onDrop: function(e) {
			var view = this._view;
			var text = e.event.dataTransfer.getData("Text"); //$NON-NLS-0$
			if (text) {
				if (!util.isFirefox) {
					e.event.dataTransfer.dropEffect = this._dropEffect; //$NON-NLS-1$ //$NON-NLS-0$
				}
				var offset = view.getOffsetAtLocation(e.x, e.y);
				if (this._dragSelection) {
					this._dropOffset = offset;
					this._dropText = text;
				} else {
					view.setText(text, offset, offset);
					view.setSelection(offset, offset + text.length);
				}
			}
		}
	};

	return {TextDND: TextDND};
});
/*******************************************************************************
 * @license
 * Copyright (c) 2013, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define("orion/editor/linkedMode", [
	'i18n!orion/editor/nls/messages',
	'orion/keyBinding',
	'orion/editor/keyModes',
	'orion/editor/annotations',
	'orion/objects',
	'orion/util'
], function(messages, mKeyBinding, mKeyModes, mAnnotations, objects) {

	var exports = {};

	/**
	 * @name LinkedContentAssist
	 * @description Creates a new LinkedContentAssist object which is used for linked data in templates
	 * @constructor 
	 * @param {Object} linkedData The linked data
	 * @returns A new LinkedContentAssist object
	 * @since 9.0
	 */
	function LinkedContentAssist(linkedData) {
		this._data = linkedData;
	}
	
	LinkedContentAssist.prototype = {
		/**
		 * @description Removes the prefix from the given string
		 * @function
		 * @param {String} prefix
		 * @param {String} string
		 * @returns {String} The substring after removing the prefix
		 */
		chop: function(prefix, string) {
			return string.substring(prefix.length);
		},
		
		/**
		 * @callback
		 */
		computeProposals: function(buffer, offset, context) {
			var prefix = context.prefix;
			var proposals = [];
			var linkedstyle = this._data.style ? this._data.style : null;
			linkedstyle = linkedstyle ? linkedstyle : 'emphasis'; //$NON-NLS-1$
			var values = this._data.values;
			for (var i = 0; i < values.length; i++) {
				var val = values[i];
				if(typeof val === 'string' && val.indexOf(prefix) === 0) {
					proposals.push({proposal: this.chop(prefix, val), 
						description: val,
						hover: val,
						style: linkedstyle
					});
				} else if(typeof val === 'object' && val.proposal) {
					proposals.push({proposal: this.chop(prefix, val.proposal), 
						description: val.description ? val.description : val.proposal,
						hover: val.hover ? val.hover : val.proposal,
						style: linkedstyle
					});
				}
			}
			var linkedtitle = this._data.title ? this._data.title : null;
			if (0 < proposals.length) {
				proposals.splice(0, 0,{
					proposal: '',
					description: linkedtitle ? linkedtitle : 'Options', //$NON-NLS-0$
					style: 'noemphasis_title', //$NON-NLS-0$
					unselectable: true
				});	
			}
			return proposals;
		}
	};

	/**
	 * @name LinkedMode
	 * @description Create a new LinkedMode
	 * @param {Editor} editor The backing editor
	 * @param {UndoStack} undoStack The undo stack
	 * @param contentAssist
	 * @returns returns
	 */
	function LinkedMode(editor, undoStack, contentAssist) {
		var textView = editor.getTextView();
		mKeyModes.KeyMode.call(this, textView);
		this.editor = editor;
		this.undoStack = undoStack;
		this.contentAssist = contentAssist;
		
		this.linkedModeModel = null;
		
		textView.setAction("linkedModeEnter", function() { //$NON-NLS-0$
			this.exitLinkedMode(true);
			return true;
		}.bind(this));
		textView.setAction("linkedModeCancel", function() { //$NON-NLS-0$
			this.exitLinkedMode(true);
			return true;
		}.bind(this));
		textView.setAction("linkedModeNextGroup", function() { //$NON-NLS-0$
			var model = this.linkedModeModel;
			this.selectLinkedGroup((model.selectedGroupIndex + 1) % model.groups.length);
			return true;
		}.bind(this));
		textView.setAction("linkedModePreviousGroup", function() { //$NON-NLS-0$
			var model = this.linkedModeModel;
			this.selectLinkedGroup(model.selectedGroupIndex > 0 ? model.selectedGroupIndex-1 : model.groups.length-1);
			return true;
		}.bind(this));
		
		/**
		 * Listener called when Linked Mode is active. Updates position's offsets and length
		 * on user change. Also escapes the Linked Mode if the text buffer was modified outside of the Linked Mode positions.
		 */
		this.linkedModeListener = {
		
			onActivating: /* @callback */ function(evnt) {
				if (this._groupContentAssistProvider) {
					this.contentAssist.setProviders([this._groupContentAssistProvider]);
					this.contentAssist.setProgress(null);
				}
			}.bind(this),
			
			onModelChanged: function(evnt) {
				if (this.ignoreVerify) { return; }

				// Get the position being modified
				var start = this.editor.mapOffset(evnt.start);
				var model = this.linkedModeModel, positionChanged, changed;
				while (model) {
					positionChanged = this._getPositionChanged(model, start, start + evnt.removedCharCount);
					changed = positionChanged.position;
					if (changed === undefined || changed.model !== model) {
						// The change has been done outside of the positions, exit the Linked Mode
						this.exitLinkedMode(false);
						model = this.linkedModeModel;
					} else {
						break;
					}
				}
				if (!model) { return; }

				// Update position offsets for this change. Group changes are done in #onVerify
				var deltaCount = 0;
				var changeCount = evnt.addedCharCount - evnt.removedCharCount;
				var sortedPositions = positionChanged.positions, position, pos;
				for (var i = 0; i < sortedPositions.length; ++i) {
					pos = sortedPositions[i];
					position = pos.position;
					var inside = position.offset <= start && start <= position.offset + position.length;
					if (inside && !pos.ansestor) {
						position.offset += deltaCount;
						position.length += changeCount;
						deltaCount += changeCount;
					} else {
						position.offset += deltaCount;
						if (pos.ansestor && inside) {
							position.length += changeCount;
						}
					}
					if (pos.escape) {
						pos.model.escapePosition = position.offset;
					}
				}
				this._updateAnnotations(sortedPositions);
			}.bind(this),

			onVerify: function(evnt) {
				if (this.ignoreVerify) { return; }

				// Get the position being modified
				var start = this.editor.mapOffset(evnt.start);
				var end = this.editor.mapOffset(evnt.end);
				var model = this.linkedModeModel, positionChanged, changed;
				while (model) {
					positionChanged = this._getPositionChanged(model, start, end);
					changed = positionChanged.position;
					if (changed === undefined || changed.model !== model) {
						// The change has been done outside of the positions, exit the Linked Mode
						this.exitLinkedMode(false);
						model = this.linkedModeModel;
					} else {
						break;
					}
				}
				if (!model) { return; }
				
				// Make sure changes in a same group are compound
				var undo = this._compoundChange;
				if (undo) {
					if (!(undo.owner.model === model && undo.owner.group === changed.group)) {
						this.endUndo();
						this.startUndo();
					}
				} else {
					this.startUndo();
				}

				model.selectedGroupIndex = changed.group;
				
				// Update position offsets taking into account all positions in the same changing group
				var deltaCount = 0;
				var changeCount = evnt.text.length - (end - start);
				var sortedPositions = positionChanged.positions, position, pos;
				var deltaStart = start - changed.position.offset, deltaEnd = end - changed.position.offset;
				for (var i = 0; i < sortedPositions.length; ++i) {
					pos = sortedPositions[i];
					position = pos.position;
					pos.oldOffset = position.offset;
					if (pos.model === model && pos.group === changed.group) {
						position.offset += deltaCount;
						position.length += changeCount;
						deltaCount += changeCount;
					} else {
						position.offset += deltaCount;
						if (pos.ansestor) {
							position.length += changed.count * changeCount;
						}
					}
					if (pos.escape) {
						pos.model.escapePosition = position.offset;
					}
				}
				
				// Cancel this modification and apply same modification to all positions in changing group
				this.ignoreVerify = true;
				for (i = sortedPositions.length - 1; i >= 0; i--) {
					pos = sortedPositions[i];
					if (pos.model === model && pos.group === changed.group) {
						this.editor.setText(evnt.text, pos.oldOffset + deltaStart , pos.oldOffset + deltaEnd, false);
					}
				}
				this.ignoreVerify = false;
				evnt.text = null;
				this._updateAnnotations(sortedPositions);
			}.bind(this)
		};
	}
	LinkedMode.prototype = new mKeyModes.KeyMode();
	objects.mixin(LinkedMode.prototype, {
		/**
		 * @description Create the keybindings
		 * @function
		 * @returns {Array.<Object>} The keybindings
		 */
		createKeyBindings: function() {
			var KeyBinding = mKeyBinding.KeyBinding;
			var bindings = [];
			bindings.push({actionID: "linkedModeEnter", keyBinding: new KeyBinding(13)}); //$NON-NLS-0$
			bindings.push({actionID: "linkedModeCancel", keyBinding: new KeyBinding(27)}); //$NON-NLS-0$
			bindings.push({actionID: "linkedModeNextGroup", keyBinding: new KeyBinding(9)}); //$NON-NLS-0$
			bindings.push({actionID: "linkedModePreviousGroup", keyBinding: new KeyBinding(9, false, true)}); //$NON-NLS-0$
			return bindings;
		},
		/**
		 * Starts Linked Mode, selects the first position and registers the listeners.
		 * @param {Object} linkedModeModel An object describing the model to be used by linked mode.
		 * Contains one or more position groups. If a position in a group is edited, the other positions in
		 * the same group are edited the same way. The model structure is as follows:
		 * <pre>{
		 *		groups: [{
		 *			data: {},
		 *			positions: [{
		 *				offset: 10, // Relative to the text buffer
		 *				length: 3
		 *			}]
		 *		}],
		 *		escapePosition: 19, // Relative to the text buffer
		 * }</pre>
		 *
		 * Each group in the model has an optional <code>data</code> property which can be
		 * used to provide additional content assist for the group.  The <code>type</code> in
		 * data determines what kind of content assist is provided. These are the support
		 * structures for the <code>data</code> property.
		 * <pre>{
		 *		type: "link"
		 *		values: ["proposal0", "proposal1", ...]
		 * }</pre>
		 *
		 * The "link" data struture provides static content assist proposals stored in the
		 * <code>values</code> property.
		 *
		 * <p>
		 * <b>See:</b><br/>
		 * {@link orion.editor.Template}<br/>
		 * {@link orion.editor.TemplateContentAssist}<br/>
		 * </p>
		 */
		enterLinkedMode: function(linkedModeModel) {
			if (!this.linkedModeModel) {
				var textView = this.editor.getTextView();
				textView.addKeyMode(this);
				textView.addEventListener("Verify", this.linkedModeListener.onVerify);
				textView.addEventListener("ModelChanged", this.linkedModeListener.onModelChanged);
				var contentAssist = this.contentAssist;
				contentAssist.addEventListener("Activating", this.linkedModeListener.onActivating);
				this.editor.reportStatus(messages.linkedModeEntered, null, true);
			}
			this._sortedPositions = null;
			if (this.linkedModeModel) {
				linkedModeModel.previousModel = this.linkedModeModel;
				linkedModeModel.parentGroup = this.linkedModeModel.selectedGroupIndex;
				this.linkedModeModel.nextModel = linkedModeModel;
			}
			this.linkedModeModel = linkedModeModel;
			this.selectLinkedGroup(0);
		},
		/** 
		 * Exits Linked Mode. Optionally places the caret at linkedMode escapePosition. 
		 * @param {Boolean} [escapePosition=false] if true, place the caret at the  escape position.
		 */
		exitLinkedMode: function(escapePosition) {
			if (!this.isActive()) {
				return;
			}
			if (this._compoundChange) {
				this.endUndo();
				this._compoundChange = null;
			}
			this._sortedPositions = null;
			var model = this.linkedModeModel;
			this.linkedModeModel = model.previousModel;
			model.parentGroup = model.previousModel = undefined;
			if (this.linkedModeModel) {
				this.linkedModeModel.nextModel = undefined;
			}
			if (!this.linkedModeModel) {
				var editor = this.editor;
				var textView = editor.getTextView();
				textView.removeKeyMode(this);
				textView.removeEventListener("Verify", this.linkedModeListener.onVerify);
				textView.removeEventListener("ModelChanged", this.linkedModeListener.onModelChanged);
				var contentAssist = this.contentAssist;
				contentAssist.removeEventListener("Activating", this.linkedModeListener.onActivating);
				contentAssist.offset = undefined;
				this.editor.reportStatus(messages.linkedModeExited, null, true);
			}
			if (escapePosition && typeof model.escapePosition === "number") {
				editor.setCaretOffset(model.escapePosition, false);
			}
			this.selectLinkedGroup(0);
		},
		/**
		 * @description Start undoing
		 */
		startUndo: function() {
			if (this.undoStack) {
				var slf = this;
				var model = this.linkedModeModel;
				this._compoundChange = this.undoStack.startCompoundChange({
					model: model,
					group: model.selectedGroupIndex,
					/**
					 * @callback 
					 */
					end: function() {
						slf._compoundChange = null;
					}
				});
			}
		}, 
		/**
		 * @description Ends the undo
		 */
		endUndo: function() {
			if (this.undoStack) {
				this.undoStack.endCompoundChange();
			}
		},
		/**
		 * @description Returns if linked mode is active in the current editor
		 * @function
		 * @returns {Boolean} If linked mode is active
		 */
		isActive: function() {
			return !!this.linkedModeModel;
		},
		/**
		 * @description Returns if linked mode status is active in the current editor
		 * @function
		 * @returns {Boolean} If linked mode status is active
		 */
		isStatusActive: function() {
			return !!this.linkedModeModel;
		},
		/**
		 * @description Selects the group of the given index from the currently active model
		 * @param {Number} index The group index to select
		 */
		selectLinkedGroup: function(index) {
			var model = this.linkedModeModel;
			if (model) {
				model.selectedGroupIndex = index;
				var group = model.groups[index];
				var position = group.positions[0];
				var editor = this.editor;
				editor.setSelection(position.offset, position.offset + position.length);
				var contentAssist = this.contentAssist;
				if (contentAssist) {
					contentAssist.offset = undefined;
					if (group.data && group.data.type === "link" && group.data.values) {
						var provider = this._groupContentAssistProvider = new LinkedContentAssist(group.data);
						/**
						 * @callback 
						 */
						provider.getPrefix = function() {
							var selection = editor.getSelection();
							if (selection.start === selection.end) {
								var caretOffset = editor.getCaretOffset();
								if (position.offset <= caretOffset && caretOffset <= position.offset + position.length) {
									return editor.getText(position.offset, caretOffset);
								}
							}
							return "";
						};
						contentAssist.offset = position.offset;
						contentAssist.deactivate();
						contentAssist.activate();
					} else if (this._groupContentAssistProvider) {
						this._groupContentAssistProvider = null;
						contentAssist.deactivate();
					}
				}
			}
			this._updateAnnotations();
		},
		/**
		 * @description Collect all model positions into the <code>all</code> array
		 * @function
		 * @private
		 * @param {Array.<Object>} all The collector for the position objects
		 * @param {Object} model The linked model to collect all positions from
		 * @param {Object} delta The change in position
		 */
		_getModelPositions: function(all, model, delta) {
			var groups = model.groups;
			for (var i = 0; i < groups.length; i++) {
				var positions = groups[i].positions;
				for (var j = 0; j < positions.length; j++) {
					var position = positions[j];
					if (delta) {
						position = {offset: position.offset + delta, length: position.length};
					}
					var pos = {
						index: j,
						group: i,
						count: positions.length,
						model: model,
						position: position
					};
					all.push(pos);
					if (model.nextModel && model.nextModel.parentGroup === i) {
						pos.ansestor = true;
						this._getModelPositions(all, model.nextModel, (delta || 0) + positions[j].offset - positions[0].offset);
					}
				}
			}
		},
		/**
		 * @description Returns an array of all of the positions sorted 
		 * @function
		 * @private
		 * @param {Object} model The linked model to get and sort positions from
		 * @returns {Array.<Object>} The sorted array of positions from the given model
		 */
		_getSortedPositions: function(model) {
			var all = this._sortedPositions;
			if (!all) {
				all = [];
				// Get the root linked model
				while (model.previousModel) {
					model = model.previousModel;
				}
				// Get all positions under model expanding group positions of stacked linked modes
				this._getModelPositions(all, model);
				// Add escape position for all models
				while (model) {
					if (typeof model.escapePosition === "number") {
						all.push({
							escape: true,
							model: model,
							position: {offset: model.escapePosition, length: 0}
						});
					}
					model = model.nextModel;
				}
				all.sort(function(a, b) {
					return a.position.offset - b.position.offset;
				});
				this._sortedPositions = all;
			}
			return all;
		},
		/**
		 * @description Returns if the given start - end position has changed in the given model
		 * @function
		 * @private
		 * @param {Object} model The model to check
		 * @param {Number} start The start
		 * @param {Number} end The end
		 * @returns {Object} The changed position
		 */
		_getPositionChanged: function(model, start, end) {
			var changed;
			var sortedPositions = this._getSortedPositions(model);
			for (var i = sortedPositions.length - 1; i >= 0; i--) {
				if (sortedPositions[i].escape) {
					continue;
				}
				var position = sortedPositions[i].position;
				if (position.offset <= start && end <= position.offset + position.length) {
					changed = sortedPositions[i];
					break;
				}
			}
			return {position: changed, positions: sortedPositions};
		},
		/**
		 * @description Updates the editor annotations based on the given positions
		 * @function
		 * @private
		 * @param {Array.<Object>} positions The positions
		 */
		_updateAnnotations: function(positions) {
			var annotationModel = this.editor.getAnnotationModel();
			if (!annotationModel) { return; }
			var remove = [], add = [];
			var annotations = annotationModel.getAnnotations(), annotation;
			while (annotations.hasNext()) {
				annotation = annotations.next();
				switch (annotation.type) {
					case mAnnotations.AnnotationType.ANNOTATION_LINKED_GROUP:
					case mAnnotations.AnnotationType.ANNOTATION_CURRENT_LINKED_GROUP:
					case mAnnotations.AnnotationType.ANNOTATION_SELECTED_LINKED_GROUP:
						remove.push(annotation);
				}
			}
			var model = this.linkedModeModel;
			if (model) {
				positions = positions || this._getSortedPositions(model);
				for (var i = 0; i < positions.length; i++) {
					var position = positions[i];
					if (position.model !== model) { continue; }
					if (position.escape) { continue; }
					var type = mAnnotations.AnnotationType.ANNOTATION_LINKED_GROUP;
					if (position.group === model.selectedGroupIndex) {
						if (position.index === 0 && position.count > 1) {
							type = mAnnotations.AnnotationType.ANNOTATION_SELECTED_LINKED_GROUP;
						} else {
							type = mAnnotations.AnnotationType.ANNOTATION_CURRENT_LINKED_GROUP;
						}
					}
					position = position.position;
					annotation = mAnnotations.AnnotationType.createAnnotation(type, position.offset, position.offset + position.length, "");
					add.push(annotation);
				}
			}
			annotationModel.replaceAnnotations(remove, add);
		}
	});
	exports.LinkedMode = LinkedMode;

	return exports;
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define("orion/editor/factories", [ //$NON-NLS-0$
	'orion/editor/actions', //$NON-NLS-0$
	'orion/editor/undoStack', //$NON-NLS-0$
	'orion/editor/rulers', //$NON-NLS-0$
	'orion/editor/annotations', //$NON-NLS-0$
	'orion/editor/textDND', //$NON-NLS-0$
	'orion/editor/linkedMode', //$NON-NLS-0$
	'orion/util' //$NON-NLS-0$
], function(mActions, mUndoStack, mRulers, mAnnotations, mTextDND, mLinkedMode, util) {

	var exports = {};
	
	function KeyBindingsFactory() {
	}
	KeyBindingsFactory.prototype = {
		createKeyBindings: function(editor, undoStack, contentAssist, searcher) {
			// Create keybindings for generic editing, no dependency on the service model
			var textActions = new mActions.TextActions(editor, undoStack , searcher);
			// Linked Mode
			var linkedMode = new mLinkedMode.LinkedMode(editor, undoStack, contentAssist);
			// create keybindings for source editing
			// TODO this should probably be something that happens more dynamically, when the editor changes input
			var sourceCodeActions = new mActions.SourceCodeActions(editor, undoStack, contentAssist, linkedMode);
			return {
				textActions: textActions,
				linkedMode: linkedMode,
				sourceCodeActions: sourceCodeActions
			};
		}
	};
	exports.KeyBindingsFactory = KeyBindingsFactory;
	
	function UndoFactory() {
	}
	UndoFactory.prototype = {
		createUndoStack: function(editor) {
			var textView = editor.getTextView();
			return new mUndoStack.UndoStack(textView, 200);
		}
	};
	exports.UndoFactory = UndoFactory;

	function LineNumberRulerFactory() {
	}
	LineNumberRulerFactory.prototype = {
		createLineNumberRuler: function(annotationModel) {
			return new mRulers.LineNumberRuler(annotationModel, "left", {styleClass: "ruler lines"}, {styleClass: "rulerLines odd"}, {styleClass: "rulerLines even"}); //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	exports.LineNumberRulerFactory = LineNumberRulerFactory;
	
	function FoldingRulerFactory() {
	}
	FoldingRulerFactory.prototype = {
		createFoldingRuler: function(annotationModel) {
			return new mRulers.FoldingRuler(annotationModel, "left", {styleClass: "ruler folding"}); //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	exports.FoldingRulerFactory = FoldingRulerFactory;
	
	function ZoomRulerFactory() {
	}
	ZoomRulerFactory.prototype = {
		createZoomRuler: function(annotationModel) {
			return new mRulers.ZoomRuler(util.isIOS || util.isAndroid ? "right" : "innerRight", {styleClass: "ruler zoom"}); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		}
	};
	exports.ZoomRulerFactory = ZoomRulerFactory;
	
	function AnnotationFactory() {
	}
	AnnotationFactory.prototype = {
		createAnnotationModel: function(model) {
			return new mAnnotations.AnnotationModel(model);
		},
		createAnnotationStyler: function(annotationModel, view) {
			return new mAnnotations.AnnotationStyler(annotationModel, view);
		},
		createAnnotationRulers: function(annotationModel) {
			var annotationRuler = new mRulers.AnnotationRuler(annotationModel, "left", {styleClass: "ruler annotations"}); //$NON-NLS-1$ //$NON-NLS-0$
			var overviewRuler = new mRulers.OverviewRuler(annotationModel, "right", {styleClass: "ruler overview"}); //$NON-NLS-1$ //$NON-NLS-0$
			return {annotationRuler: annotationRuler, overviewRuler: overviewRuler};
		}
	};
	exports.AnnotationFactory = AnnotationFactory;
	
	function TextDNDFactory() {
	}
	TextDNDFactory.prototype = {
		createTextDND: function(editor, undoStack) {
			return new mTextDND.TextDND(editor.getTextView(), undoStack);
		}
	};
	exports.TextDNDFactory = TextDNDFactory;
	
	return exports;
});
/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2013 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/
define("orion/editor/editorFeatures", [ //$NON-NLS-0$
	'orion/editor/factories', //$NON-NLS-0$
	'orion/editor/actions', //$NON-NLS-0$
	'orion/editor/linkedMode', //$NON-NLS-0$
	'orion/objects' //$NON-NLS-0$
], function(mFactories, mActions, mLinkedMode, objects) {
	return objects.mixin({}, mFactories, mActions, mLinkedMode);
});

/*******************************************************************************
 * @license
 * Copyright (c) 2011, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
/*eslint-disable no-else-return, no-extra-parens*/
define("orion/editor/contentAssist", [
	'i18n!orion/editor/nls/messages',
	'orion/keyBinding',
	'orion/editor/keyModes',
	'orion/editor/eventTarget',
	'orion/Deferred',
	'orion/objects',
	'orion/editor/tooltip',
	'orion/editor/util',
	'orion/util',
	'orion/webui/littlelib',
	'orion/metrics'
], function(messages, mKeyBinding, mKeyModes, mEventTarget, Deferred, objects, mTooltip, textUtil, util, lib, mMetrics) {
	/**
	 * @name orion.editor.ContentAssistProvider
	 * @class Interface defining a provider of content assist proposals.
	 */
	/**
	 * @memberOf orion.editor.ContentAssistProvider.prototype
	 * @function
	 * @name computeProposals
	 * @param {String} buffer The buffer being edited.
	 * @param {Number} offset The position in the buffer at which content assist is being requested.
	 * @param {orion.editor.ContentAssistProvider.Context} context
	 * @returns {Object[]} This provider's proposals for the given buffer and offset.
	 */
	/**
	 * @name orion.editor.ContentAssistProvider.Context
	 * @class
	 * @property {String} line The text of the line on which content assist is being requested.
	 * @property {String} prefix Any non-whitespace, non-symbol characters preceding the offset.
	 * @property {orion.editor.Selection} selection The current selection.
	 */

	/**
	 * @name orion.editor.ContentAssist
	 * @class Provides content assist for a TextView.
	 * @description Creates a <code>ContentAssist</code> for a TextView. A ContentAssist consults a set of 
	 * {@link orion.editor.ContentAssistProvider}s to obtain proposals for text that may be inserted into a
	 * TextView at a given offset.<p>
	 * A ContentAssist is generally activated by its TextView action, at which point it computes the set of 
	 * proposals available. It will re-compute the proposals in response to subsequent changes on the TextView 
	 * (for example, user typing) for as long as the ContentAssist is active. A proposal may be applied by calling 
	 * {@link #apply}, after which the ContentAssist becomes deactivated. An active ContentAssist may be deactivated
	 * by calling {@link #deactivate}.<p>
	 * A ContentAssist dispatches events when it becomes activated or deactivated, and when proposals have been computed.
	 * @param {orion.editor.TextView} textView The TextView to provide content assist for.
	 * @borrows orion.editor.EventTarget#addEventListener as #addEventListener
	 * @borrows orion.editor.EventTarget#removeEventListener as #removeEventListener
	 * @borrows orion.editor.EventTarget#dispatchEvent as #dispatchEvent
	 */
	/**
	 * Dispatched when a ContentAssist is about to be activated.
	 * @name orion.editor.ContentAssist#ActivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist is about to be deactivated.
	 * @name orion.editor.ContentAssist#DeactivatingEvent
	 * @event
	 */
	/**
	 * Dispatched when a ContentAssist has applied a proposal. <p>This event's <code>data</code> field gives information
	 * about the proposal that was applied.
	 * @name orion.editor.ContentAssist#ProposalAppliedEvent
	 * @event
	 */
	/**
	 * Dispatched whenever a ContentAssist has obtained proposals from its providers. <p>This event's
	 * <code>data</code> field gives information about the proposals.
	 * @name orion.editor.ContentAssist#ProposalsComputedEvent
	 * @event
	 */
		
	// INACTIVE --Ctrl+Space--> ACTIVE --ModelChanging--> FILTERING
	var State = {
		INACTIVE: 1,
		ACTIVE: 2,
		FILTERING: 3
	};
	
	var STYLES = {
		selected : "selected", //$NON-NLS-0$
		hr : "proposal-hr", //$NON-NLS-0$
		emphasis : "proposal-emphasis", //$NON-NLS-0$
		strikethrough: "proposal-strikethrough",
		noemphasis : "proposal-noemphasis", //$NON-NLS-0$
		noemphasis_title : "proposal-noemphasis-title", //$NON-NLS-0$
		noemphasis_title_keywords : "proposal-noemphasis-title-keywords", //$NON-NLS-0$
		dfault : "proposal-default" //$NON-NLS-0$
	};
	
	/**
	 * @name ContentAssist
	 * @description Creates a new content assist manager for the given text view
	 * @param textView The text view to provide content assist for
	 * @param serviceRegistry Optional, used to look up page message service for status
	 */
	function ContentAssist(textView, serviceRegistry) {
		this.textView = textView;
		if (serviceRegistry){
			this.pageMessage = serviceRegistry.getService("orion.page.message"); //$NON-NLS-1$
		}
		this.state = State.INACTIVE;
		this.clearProviders();
		var self = this;
		this._textViewListeners = {
			onModelChanging: (function(event) {
				this._latestModelChangingEvent = event;
				if (event) {
					this._updateFilterText(event);	
				}
			}).bind(this),
			onSelection: (function(event) {
				if (this.isDeactivatingChange(this._latestModelChangingEvent, event)) {
					this.setState(State.INACTIVE);
				} else {
					if (this.isActive()) {
						if (this.state === State.ACTIVE) {
							this.setState(State.FILTERING);
						}
						this.filterProposals();
					}
				}
				this._latestModelChangingEvent = null;
			}).bind(this),
			onScroll: (function(event) {
				this.setState(State.INACTIVE);
			}).bind(this)
		};
		
		textView.setKeyBinding(util.isMac ? new mKeyBinding.KeyBinding(' ', false, false, false, true) : new mKeyBinding.KeyBinding(' ', true), "contentAssist"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		textView.setKeyBinding(util.isMac ? new mKeyBinding.KeyBinding(' ', false, false, true, true) : new mKeyBinding.KeyBinding(' ', true, false, true), "contentAssist"); //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
		textView.setAction("contentAssist", function() { //$NON-NLS-0$
			if (!textView.getOptions("readonly")) { //$NON-NLS-0$
				self.activate();
			}
			return true;
		}, {name: messages.contentAssist});
	}
	ContentAssist.prototype = /** @lends orion.editor.ContentAssist.prototype */ {
		/**
		 * Applies the given proposal to the TextView.
		 * @param {Object} [proposal]
		 * @returns {Boolean} <code>true</code> if the proposal was applied; <code>false</code> if no proposal was provided.
		 */
		apply: function(proposal) {
			if (!proposal) {
				return false;
			}
	
			// now handle prefixes
			// if there is a non-empty selection, then replace it,
			// if overwrite is truthy, then also replace the prefix
			var view = this.textView;
			var sel = view.getSelection();
			var start = this._initialCaretOffset;
			var mapStart = start;
			var end = Math.max(sel.start, sel.end), mapEnd = end;
			var model = view.getModel();
			if (model.getBaseModel) {
				mapStart = model.mapOffset(mapStart);
				mapEnd = model.mapOffset(mapEnd);
				model = model.getBaseModel();
			}
			
			if (proposal.overwrite) {
			    if(typeof proposal.prefix === 'string') {
			        start = mapStart-proposal.prefix.length;
			    } else {
				    start = this.getPrefixStart(model, mapStart);
				}
			}

			var data = {
				proposal: proposal,
				start: mapStart,
				end: mapEnd
			};
			this.setState(State.INACTIVE);
			var proposalText = typeof proposal === "string" ? proposal : proposal.proposal;
			view.setText(proposalText, start, end);
			if (proposal.additionalEdits) {
				var edit;
				for (var i = 0; i < proposal.additionalEdits.length; i++) {
					edit = proposal.additionalEdits[i];
					view.setText(edit.text, edit.offset, edit.offset + edit.length);
				}
			}
			this.dispatchEvent({type: "ProposalApplied", data: data}); //$NON-NLS-0$
			mMetrics.logEvent("contentAssist", "apply"); //$NON-NLS-1$ //$NON-NLS-0$
			return true;
		},
		activate: function(providers, autoTriggered) {
			if (this.state === State.INACTIVE) {
				mMetrics.logEvent("contentAssist", "activate", undefined, autoTriggered ? 0 : 1); //$NON-NLS-1$ //$NON-NLS-0$
				this._autoTriggered = autoTriggered ? true : false;
				this.setState(State.ACTIVE, providers);
			}
		},
		deactivate: function() {
			this.setState(State.INACTIVE);
		},
		/** @returns {orion.editor.TextView} */
		getTextView: function() {
			return this.textView;
		},
		/** @returns {Boolean} */
		isActive: function() {
			return this.state === State.ACTIVE || this.state === State.FILTERING;
		},
		/** @returns {Boolean} <code>true</code> if the event describes a change that should deactivate content assist. */
		isDeactivatingChange: function(/**orion.editor.ModelChangingEvent*/ event, selectionEvent) {
			var isDeactivating = false;
			
			var selections = Array.isArray(selectionEvent.newValue) ? selectionEvent.newValue : [selectionEvent.newValue];
			var isPriorToInitialCaretOffset = selections[0].start < this._initialCaretOffset;
			
			if (isPriorToInitialCaretOffset || !event) {
				isDeactivating = true;
			} else if (event) {
				isDeactivating = (event.removedLineCount > 0) || (event.addedLineCount > 0);
			}
			
			return isDeactivating;
		},
		/** @private */
		setState: function(state, /* Optional. Array of providers to pass to dispatched event.*/ providers) {
			var eventType;
			if (state === State.ACTIVE) {
				eventType = "Activating"; //$NON-NLS-0$
				if (this._mode) { this._mode.setActive(true); }
			} else if (state === State.INACTIVE) {
				eventType = "Deactivating"; //$NON-NLS-0$
				if (this._mode) { this._mode.setActive(false); }
			}
			if (eventType) {
				this.dispatchEvent({type: eventType, providers: providers});
			}
			this.state = state;
			this.onStateChange(state);
		},
		setMode: function(mode) {
			this._mode = mode;
		},
		/** @private */
		onStateChange: function(state) {
			if (state === State.INACTIVE) {
				this._removeTextViewListeners();
				this._filterText = "";
				this._initialCaretOffset = -1;
				this._computedProposals = null;
			} else if (state === State.ACTIVE) {
				this._filterText = "";
				this._addTextViewListeners();
				this.computeProposals();
			}
		},
		/**
		 * Computes the proposals at the TextView's current caret offset.
		 */
		computeProposals: function() {
			// figure out initial offset, it should be the minimum between 
			// the beginning of the selection and the current caret offset
			var offset = this.textView.getCaretOffset();
			var sel = this.textView.getSelection();
			var selectionStart = Math.min(sel.start, sel.end);			
			this._initialCaretOffset = Math.min(offset, selectionStart);
			this._computedProposals = null;
			delete this._autoApply;
			this._computeProposals(this._initialCaretOffset).then(function(proposals) {
				if (this.isActive()) {
					var flatProposalArray = this._flatten(proposals);
					//check if flattened proposals form a valid array with at least one entry
					if (flatProposalArray && Array.isArray(flatProposalArray) && (0 < flatProposalArray.length)) {
						this._computedProposals = proposals;
					}
					var autoApply = typeof this._autoApply === 'boolean' ? this._autoApply : !this._autoTriggerEnabled;
					this.dispatchEvent({type: "ProposalsComputed", data: {proposals: flatProposalArray}, autoApply: autoApply}); //$NON-NLS-0$
					if (this._computedProposals && this._filterText) {
						// force filtering here because user entered text after
						// computeProposals() was called but before the plugins
						// returned the computed proposals
						this.filterProposals(true);
					}
				}
			}.bind(this));
		},
		/** @private */
		getPrefixStart: function(model, end) {
			var index = end;
			while (index > 0 && /[A-Za-z0-9_]/.test(model.getText(index - 1, index))) {
				index--;
			}
			return index;
		},
		handleError: function(error) {
			if (typeof console !== "undefined") {
				console.log("Error retrieving content assist proposals"); //$NON-NLS-0$
				console.log(error && error.stack);
			}
		},
		/**
		 * Initializes the providers. A provider must define an <tt>initialize()</tt> method to be initialized.
		 * @since 6.0
		 */
		initialize: function() {
			this._providers.forEach(function(info) {
				var provider = info.provider;
				if (typeof provider.initialize === "function") {
					provider.initialize();
				}
			});
		},
		/**
		 * Retrieves the proposals at the given offset.
		 * @private
		 * @param {Number} offset The caret offset.
		 * @returns {Deferred} A promise that will provide the proposals.
		 */
		_computeProposals: function(offset) {
			var providerInfoArray = this._providers;
			var textView = this.textView;
			var sel = textView.getSelection();
			var model = textView.getModel(), mapOffset = offset;
			if (model.getBaseModel) {
				mapOffset = model.mapOffset(mapOffset);
				sel.start = model.mapOffset(sel.start);
				sel.end = model.mapOffset(sel.end);
				model = model.getBaseModel();
			}
			var line = model.getLine(model.getLineAtOffset(mapOffset));
			var index = 0;
			while (index < line.length && /\s/.test(line.charAt(index))) {
				index++;
			}
			var indentation = line.substring(0, index);
			var options = textView.getOptions("tabSize", "expandTab"); //$NON-NLS-1$ //$NON-NLS-0$
			var tab = options.expandTab ? new Array(options.tabSize + 1).join(" ") : "\t"; //$NON-NLS-1$ //$NON-NLS-0$
			var lineDelimiter = model.getLineDelimiter();
			var _self = this;
			var promises = providerInfoArray.map(function(providerInfo) {
				var provider = providerInfo.provider;
				var computePrefixFunc = provider.computePrefix;
				var ecProvider;
				var editorContext;
				var proposals;
				var func;
				var promise;
				var params;
				if(typeof providerInfo.autoApply === 'boolean') {
					_self._autoApply = providerInfo.autoApply;
				}
				if (computePrefixFunc) {
					ecProvider = _self.editorContextProvider;
					editorContext = ecProvider.getEditorContext();
					var result = computePrefixFunc.apply(provider, [editorContext, mapOffset]);
					return result.then(function(prefix) {
						params = {
							line: line,
							offset: mapOffset,
							prefix: prefix,
							selection: sel,
							delimiter: lineDelimiter,
							tab: tab,
							indentation: indentation
						};
						try {
							if ((func = provider.computeContentAssist)) {
								params = objects.mixin(params, ecProvider.getOptions());
								promise = func.apply(provider, [editorContext, params]);
							} else if ((func = provider.getProposals || provider.computeProposals)) {
								// old API
								promise = func.apply(provider, [model.getText(), mapOffset, params]);
							}
							proposals = _self.progress ? _self.progress.progress(promise, "Generating content assist proposal") : promise; //$NON-NLS-0$
						} catch (e) {
							return new Deferred().reject(e);
						}
						return Deferred.when(proposals);
					},
					function(err) {
						return new Deferred().reject(err);
					});
				}
				// no computePrefix function is defined for the provider. Use the default prefix
				params = {
					line: line,
					offset: mapOffset,
					prefix: model.getText(_self.getPrefixStart(model, mapOffset), mapOffset),
					selection: sel,
					delimiter: lineDelimiter,
					tab: tab,
					indentation: indentation
				};
				try {
					if ((func = provider.computeContentAssist)) {
						ecProvider = _self.editorContextProvider;
						editorContext = ecProvider.getEditorContext();
						params = objects.mixin(params, ecProvider.getOptions());
						promise = func.apply(provider, [editorContext, params]);
					} else if ((func = provider.getProposals || provider.computeProposals)) {
						// old API
						promise = func.apply(provider, [model.getText(), mapOffset, params]);
					}
					proposals = _self.progress ? _self.progress.progress(promise, "Generating content assist proposal") : promise; //$NON-NLS-0$
				} catch (e) {
					return new Deferred().reject(e);
				}
				return Deferred.when(proposals);
			});
			
			// TODO should we allow error to propagate instead of handling here?
			var allPromises = Deferred.all(promises, this.handleError);
			
			if (this.pageMessage){
				allPromises = Deferred.when(allPromises, function(proposals){
					_self.pageMessage.close();
					var foundProposal = false;
					if (proposals && proposals.length > 0){
						for (var i=0; i<proposals.length; i++) {
							if (Array.isArray(proposals[i]) && proposals[i].length > 0){
								foundProposal = true;
								break;
							}
						}
					}
					if (!foundProposal){
						_self.pageMessage.setErrorMessage(messages["noProposals"]);
					}
					return proposals;
				});
				this.pageMessage.showWhile(allPromises, messages["computingProposals"]);
			}
			return allPromises;
		},

		filterProposals: function(force) {
			if (this._computedProposals && (this._latestModelChangingEvent || force)) {
				var model = this.textView.getModel();
				if (model.getBaseModel) {
					model = model.getBaseModel();
				}
				var prefixStart = this.getPrefixStart(model, this._initialCaretOffset);
				var defaultPrefix = this.textView.getText(prefixStart, this._initialCaretOffset);
				var prefixText = defaultPrefix;
				// filter proposals based on prefixes and _filterText
				var proposals = []; //array of arrays of proposals
				this._computedProposals.forEach(function(proposalArray) {
					if (proposalArray && Array.isArray(proposalArray)) {
						var includedProposals = proposalArray.filter(function(proposal) {
							function getRegexp(prefix, filter) {
								var modifiedFilter = filter.replace(/([.+^=!:${}()|\[\]\/\\])/g, "\\$1"); //add start of line character and escape all special characters except * and ? //$NON-NLS-1$ //$NON-NLS-0$
								modifiedFilter = modifiedFilter.replace(/([*?])/g, ".$1"); //convert user input * and ? to .* and .? //$NON-NLS-0$
								return new RegExp("^" + prefix + modifiedFilter, "i");
							}
							var pattern;
							if (!proposal) {
								return false;
							}
							if(typeof proposal.prefix === 'string') {
								prefixText = proposal.prefix;
							} else {
								prefixText = defaultPrefix;
							}
							if (STYLES[proposal.style] === STYLES.hr
								|| STYLES[proposal.style] === STYLES.noemphasis_title) {
								return true;
							}
							
							var proposalString = "";
							if (proposal.overwrite) {
								if (proposal.name) {
									proposalString = proposal.name;
								} else if (proposal.proposal) {
									proposalString = proposal.proposal;
								} else {
									return false; // unknown format
								}
								pattern = getRegexp(prefixText, this._filterText);
								return pattern.test(proposalString);
							} else if (proposal.name || proposal.proposal) {
								var activated = false;
								// try matching name
								if (proposal.name) {
									pattern = getRegexp(prefixText, this._filterText);
									activated = pattern.test(proposal.name);
								}
								
								// try matching proposal text
								if (!activated && proposal.proposal) {
									pattern = getRegexp("", this._filterText);
									activated = pattern.test(proposal.proposal);
								}
								
								return activated;
							} else if (typeof proposal === "string") {
								pattern = getRegexp("", this._filterText);
								return pattern.test(proposal);
							}
							return false;
						}, this);
						
						if (includedProposals.length > 0) {
							proposals.push(includedProposals);
						}
					}
				}, this);
				
				var flatProposalArray = [];
				if (proposals) {
					// filter out extra separators and titles
					proposals = this._removeExtraUnselectableElements(proposals);
					flatProposalArray = this._flatten(proposals);
				}
				
				this.dispatchEvent({type: "ProposalsComputed", data: {proposals: flatProposalArray}, autoApply: false}); //$NON-NLS-0$
			}
		},
		
		/**
		 * Helper method which removes extra separators and titles from
		 * an array containing arrays of proposals from the various providers.
		 * @param{Array[]} proposals An array with each element containing an array of proposals
		 * @returns {Array} An array without the extra unselectable elements
		 */
		_removeExtraUnselectableElements: function(proposals) {
			// get rid of extra separators and titles
			var mappedProposals = proposals.map(function(proposalArray) {
				var element = proposalArray.filter(function(proposal, index) {
					var keepElement = true;
					if (STYLES[proposal.style] === STYLES.hr) {
						if ((0 === index) || ((proposalArray.length - 1) === index)) {
							keepElement = false; // remove separators at first or last element
						} else if (STYLES.hr === STYLES[proposalArray[index - 1].style]) {
							keepElement = false; // remove separator preceeded by another separator
						}
					} else if (STYLES[proposal.style] === STYLES.noemphasis_title) {
						var nextProposal = proposalArray[index + 1];
						if (nextProposal) {
							// remove titles that preceed other titles, all of their subelements have already been filtered out
							if (STYLES[nextProposal.style] === STYLES.noemphasis_title) {
								keepElement = false;
							}
						} else {
							keepElement = false; //remove titles that are at the end of the array
						}
					}
					return keepElement;
				});
				return element;
			});
			
			return mappedProposals;
		},
		
		/**
		 * Sets the provider that will be invoked to generate the Editor Context service and options to any
		 * content assist providers that implement the v4.0 content assist API.
		 * @param {Object} editorContextProvider
		 */
		setEditorContextProvider: function(editorContextProvider) {
			this.editorContextProvider = editorContextProvider;
		},
		
		/**
		 * Helper method used to generate a unique ID for a provider.
		 * Note that the uniqueness of the ID is only guaranteed for the life of this
		 * object and if all of the other IDs are also generated using this method.
		 */
		_generateProviderId: function() {
			if (this._idcount) {
				this._idcount++;
			} else {
				this._idcount = 0;
			}
			return "ContentAssistGeneratedID_" +  this._idcount; //$NON-NLS-0$
		},

		/**
		 * Sets whether or not automatic content assist triggering is enabled.
		 * @param {Boolean} enableAutoTrigger
		 */
		setAutoTriggerEnabled: function(enableAutoTrigger) {
			this._autoTriggerEnabled = enableAutoTrigger;
			this._updateAutoTriggerListenerState();
		},

		/**
		 * @name orion.editor.ContentAssistProviderInfo
		 * @class Encapsulates a content assist provider and its automatic triggers.
		 *
		 * @property {String} id Unique ID of this provider.
		 * @property {RegExp} charTriggers A regular expression matching the characters that, when typed,
		 * will cause this provider to be activated automatically by the content assist engine.
		 * @property {RegExp} excludedStyles A regular expression matching the style names that are
		 * exclusions to this provider's <tt>charTriggers</tt> matching.
		 * @property {orion.editor.ContentAssistProvider} provider The actual content assist provider.
		 */

		/**
		 * Sets the content assist providers that this ContentAssist will consult to obtain proposals.
		 *
		 * @param {orion.editor.ContentAssistProvider[]|orion.edit.ContentAssistProviderInfo[]} providers The
		 * providers. Each element may be either a plain {@link orion.editor.ContentAssistProvider}, or a
		 * {@link orion.edit.ContentAssistProviderInfo}.
		 */
		setProviders: function(providers) {
			var _self = this;
			this.setProviderInfoArray(providers.map(function(p) {
				// Wrap any plain Provider into a ProviderInfo
				return p.id ? p : {
					provider: p,
					id: _self._generateProviderId()
				};
			}));
		},

		/**
		 * @private
		 */
		setProviderInfoArray: function(providerInfoArray) {
			this.clearProviders();
			
			this._providers = providerInfoArray;
			this._charTriggersInstalled = providerInfoArray.some(function(info){
				return info.charTriggers;
			});
			this._updateAutoTriggerListenerState();
		},

		/**
		 * @returns orion.edit.ContentAssistProviderInfo[]
		 */
		getProviders: function() {
			return this._providers.slice();
		},

		clearProviders: function() {
			this._providers = [];
			this._charTriggersInstalled = false;
			this._updateAutoTriggerListenerState();
		},

		/**
		 * Sets the progress handler that will display progress information, if any are generated by content assist providers.
		 */
		setProgress: function(progress){
			this.progress = progress;
		},
		
		setStyleAccessor: function(styleAccessor) {
			this._styleAccessor = styleAccessor;
		},
		
		/**
		 * Flattens an array of arrays into a one-dimensional array.
		 * @param {Array[]} array
		 * @returns {Array}
		 */
		_flatten: function(arrayOrObjectArray) {
			
			return arrayOrObjectArray.reduce(function(prev, curr) {
				var returnValue = prev;
				var filteredArray = null;
				
				if (curr && Array.isArray(curr)) {
					filteredArray = curr.filter(function(element){
						return element; //filter out falsy elements
					});	
				}
				
				// add current proposal array to flattened array
				// skip current elements that are not arrays
				if (filteredArray && Array.isArray(filteredArray) && (filteredArray.length > 0)) {
					var first = filteredArray;
					var last = prev;
					var filteredArrayStyle = filteredArray[0].style;
					
					if (filteredArrayStyle && STYLES[filteredArrayStyle] && (0 === STYLES[filteredArrayStyle].indexOf(STYLES.noemphasis))) {
						// the style of the first element starts with noemphasis
						// add these proposals to the end of the array
						first = prev;
						last = filteredArray;
					}
					
					if (first.length > 0) {
						var firstArrayStyle = first[first.length - 1].style;
						if (firstArrayStyle && (STYLES.hr !== STYLES[firstArrayStyle])) {
							// add separator between proposals from different providers 
							// if the previous array didn't already end with a separator
							first = first.concat({
								proposal: '',
								name: '',
								description: '---------------------------------', //$NON-NLS-0$
								style: 'hr', //$NON-NLS-0$
								unselectable: true
							});
						}
					}
					
					returnValue = first.concat(last);
				}
				
				return returnValue;
			}, []);
		},
		
		_triggerListener: function(/*event*/) {
			var caretOffset = this.textView.getCaretOffset();
			var stylesAtOffset = null;
			var providerInfosToActivate = [];

			if (this._charTriggersInstalled) {
				var currentChar = this.textView.getText(caretOffset - 1, caretOffset);

				this._providers.forEach(function(info) {
					// check if the charTriggers RegExp matches the currentChar
					// we're assuming that this will fail much more often than
					// the excludedStyles test so do this first for better performance
					var charTriggers = info.charTriggers;
					if (charTriggers && charTriggers.test(currentChar)) {
						var isExcluded = false;
						var excludedStyles = info.excludedStyles;
						if (this._styleAccessor && excludedStyles) {
							if (!stylesAtOffset) {
								// lazily initialize this variable to avoid getting the styles
								// for every model modification, only ones that may trigger
								stylesAtOffset = this._styleAccessor.getStyles(caretOffset - 1);
							}
							// check if any of the styles match the excludedStyles RegExp
							isExcluded = stylesAtOffset.some(function (element) {
								return excludedStyles.test(element.style);
							});
						}
						if (!isExcluded) {
							providerInfosToActivate.push(info);
						}
					}
				}, this);

				if (providerInfosToActivate.length > 0) {
					this.activate(providerInfosToActivate, true);
				}
			}
		},
		
		/**
		 * Private helper to install/uninstall the automatic trigger
		 * listener based on the state of the relevant booleans
		 */
		_updateAutoTriggerListenerState: function() {
			if (!this._boundTriggerListener) {
				this._boundTriggerListener = this._triggerListener.bind(this);
			}
			
			if (this._triggerListenerInstalled) {
				// uninstall the listener if necessary
				if (!this._autoTriggerEnabled || !this._charTriggersInstalled) {
					this.textView.removeEventListener("Modify", this._boundTriggerListener);
					this._triggerListenerInstalled = false;
				}
			} else if (this._autoTriggerEnabled && this._charTriggersInstalled){
				// install the listener if necessary
				this.textView.addEventListener("Modify", this._boundTriggerListener);
				this._triggerListenerInstalled = true;
			}
		},
		
		_addTextViewListeners: function() {
			if (!this._textViewListenersAdded) {
				this.textView.addEventListener("ModelChanging", this._textViewListeners.onModelChanging);
				this.textView.addEventListener("Scroll", this._textViewListeners.onScroll);
				this.textView.addEventListener("Selection", this._textViewListeners.onSelection);
				this._textViewListenersAdded = true;
			}
		},
		
		_removeTextViewListeners: function() {
			if (this._textViewListenersAdded) {
				this._latestModelChangingEvent = null;
				this.textView.removeEventListener("ModelChanging", this._textViewListeners.onModelChanging);
				this.textView.removeEventListener("Scroll", this._textViewListeners.onScroll);
				this.textView.removeEventListener("Selection", this._textViewListeners.onSelection);
				this._textViewListenersAdded = false;
			}
		},
		
		_updateFilterText: function(modelChangingEvent) {
			// update this._filterText based on the modification info
			// contained in the event
			var removedCharCount = modelChangingEvent.removedCharCount;
			if (removedCharCount) {
				var lastIndex = this._filterText.length - removedCharCount;
				this._filterText = this._filterText.substring(0, lastIndex);
			}
			var text = modelChangingEvent.text;
			if (text) {
				this._filterText = this._filterText.concat(text);
			}
		}
	};
	mEventTarget.EventTarget.addMixin(ContentAssist.prototype);

	/**
	 * @name orion.editor.ContentAssistMode
	 * @class Editor mode for interacting with content assist proposals.
	 * @description Creates a ContentAssistMode. A ContentAssistMode is a key mode for {@link orion.editor.Editor}
	 * that provides interaction with content assist proposals retrieved from an {@link orion.editor.ContentAssist}. 
	 * Interaction is performed via the {@link #lineUp}, {@link #lineDown}, and {@link #enter} actions. An 
	 * {@link orion.editor.ContentAssistWidget} may optionally be provided to display which proposal is currently selected.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {orion.editor.ContentAssistWidget} [ContentAssistWidget]
	 */
	function ContentAssistMode(contentAssist, ContentAssistWidget) {
		var textView = contentAssist.textView;
		mKeyModes.KeyMode.call(this, textView);
		this.contentAssist = contentAssist;
		this.widget = ContentAssistWidget;
		this.proposals = [];
		var self = this;
		this.contentAssist.addEventListener("ProposalsComputed", function(event) {
			self.proposals = event.data.proposals;
			if (self.proposals.length === 0) {
				self.selectedIndex = -1;
				self.cancel();
			} else {
				self.selectedIndex = 0;
				while(self.proposals[self.selectedIndex] && self.proposals[self.selectedIndex].unselectable) {
					self.selectedIndex++;
				}
				if (self.proposals[self.selectedIndex]) {
					if (self.widget) {
						var showWidget = true;
						
						if (event.autoApply) {
							var nextIndex = self.selectedIndex + 1;
							while (self.proposals[nextIndex] && self.proposals[nextIndex].unselectable) {
								nextIndex++;
							}
							if (!self.proposals[nextIndex]) {
								// if there is only one selectable proposal apply it automatically
								showWidget = false;
								self.contentAssist.apply(self.proposals[self.selectedIndex]);
							}
						}
						
						if (showWidget) {
							self.widget.show();
							self.widget.selectNode(self.selectedIndex);
						}
					}
				} else {
					self.selectedIndex = -1; // didn't find any selectable items
					self.cancel();
				}
			}
		});
		textView.setAction("contentAssistApply", function() { //$NON-NLS-0$
			return this.enter();
		}.bind(this));
		textView.setAction("contentAssistCancel", function() { //$NON-NLS-0$
			return this.cancel();
		}.bind(this));
		textView.setAction("contentAssistNextProposal", function() { //$NON-NLS-0$
			return this.lineDown();
		}.bind(this));
		textView.setAction("contentAssistPreviousProposal", function() { //$NON-NLS-0$
			return this.lineUp();
		}.bind(this));
		textView.setAction("contentAssistNextPage", function() { //$NON-NLS-0$
			return this.pageDown();
		}.bind(this));
		textView.setAction("contentAssistPreviousPage", function() { //$NON-NLS-0$
			return this.pageUp();
		}.bind(this));
		textView.setAction("contentAssistHome", function() { //$NON-NLS-0$
			if (this.widget) {
				this.widget.scrollIndex(0, true);
			}
			return this.lineDown(0); // select first selectable element starting at the top and moving downwards
		}.bind(this));
		textView.setAction("contentAssistEnd", function() { //$NON-NLS-0$
			return this.lineUp(this.proposals.length - 1); // select first selectable element starting at the bottom and moving up
		}.bind(this));
		textView.setAction("contentAssistTab", function() { //$NON-NLS-0$
			return this.tab();
		}.bind(this));
		
		if (this.widget) {
			this.widget.setContentAssistMode(this);
			this.widget.createAccessible();
		}
	}
	ContentAssistMode.prototype = new mKeyModes.KeyMode();
	objects.mixin(ContentAssistMode.prototype, {
		createKeyBindings: function() {
			var KeyBinding = mKeyBinding.KeyBinding;
			var bindings = [];
			bindings.push({actionID: "contentAssistApply", keyBinding: new KeyBinding(13)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistCancel", keyBinding: new KeyBinding(27)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistNextProposal", keyBinding: new KeyBinding(40)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistPreviousProposal", keyBinding: new KeyBinding(38)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistNextPage", keyBinding: new KeyBinding(34)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistPreviousPage", keyBinding: new KeyBinding(33)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistHome", keyBinding: new KeyBinding(lib.KEY.HOME)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistEnd", keyBinding: new KeyBinding(lib.KEY.END)}); //$NON-NLS-0$
			bindings.push({actionID: "contentAssistTab", keyBinding: new KeyBinding(9)}); //$NON-NLS-0$
			return bindings;
		},
		cancel: function() {
			this.getContentAssist().deactivate();
		},
		/** @private */
		getContentAssist: function() {
			return this.contentAssist;
		},
		getProposals: function() {
			return this.proposals;	
		},
		isActive: function() {
			return this.getContentAssist().isActive();
		},
		setActive: function(active) {
			if (active) {
				this.contentAssist.textView.addKeyMode(this);
			} else {
				this.contentAssist.textView.removeKeyMode(this);
			}
		},
		/**
		 * Selects a selectable item in the content assist widget
		 * iterating backwards for .
		 * 
		 * @param index {number} Optional. The index of the item to try and select. 
		 */
		lineUp: function(index, noWrap) {
			return this.selectNew(index, noWrap, false);
		},
		/**
		 * Selects the item at the specified index or the next
		 * selectable item
		 */
		lineDown: function(index, noWrap) {
			return this.selectNew(index, noWrap, true);
		},
		selectNew: function(index, noWrap, forward) {
			var newIndex = index;
			
			if (forward) {
				if (undefined === newIndex) {
					newIndex = this.selectedIndex + 1;
				}
				// handle wrap around
				if (newIndex >= this.proposals.length) {
					if (noWrap) {
						return true; // do nothing
					} else {
						newIndex = 0;	
					}
				}
			} else {
				if (undefined === newIndex) {
					newIndex = this.selectedIndex - 1;
				}
				// handle wrap around
				if (0 > newIndex) {
					if (noWrap) {
						return true; // do nothing
					} else {
						newIndex = this.proposals.length - 1;	
					}
				}
			}
			
			var startIndex = newIndex;
			while (this.proposals[newIndex] && this.proposals[newIndex].unselectable) {
				if (forward) {
					newIndex++;
					// handle wrap around
					if (newIndex >= this.proposals.length) {
						if (noWrap) {
							return true; // do nothing
						} else {
							newIndex = 0;	
						}
					}
				} else {
					newIndex--;
					// handle wrap around
					if (0 > newIndex) {
						if (noWrap) {
							return true; // do nothing
						} else {
							newIndex = this.proposals.length - 1;	
						}
					}
				}
				
				if (newIndex === startIndex) {
					// looped through all nodes and didn't find any that were selectable
					newIndex = -1;
					break;
				}
			}
			
			this.selectedIndex = newIndex;
			
			if (this.widget) {
				this.widget.selectNode(newIndex);
			}
			
			this._showTooltip(true);
			
			return true;
		},
		
		/**
		 * Opens the tooltip for the selected proposal beside the content assist window
		 * @param update if false, the tooltip will be hidden then reopened with the new contents
		 * @param noContent if true the current tooltip contents will not be replaced, just size and position updated
		 */
		_showTooltip: function(update, noContent) {
			var tooltip = mTooltip.Tooltip.getTooltip(this.contentAssist.textView);
			var self = this;
			var target = {
				getTooltipInfo: function() {
					var bounds = self.widget.parentNode.getBoundingClientRect();
					var tipArea = {width: 350, height: bounds.height, top: bounds.top};
					if ((bounds.left + bounds.width) >= document.documentElement.clientWidth){
						tipArea.left = bounds.left - tipArea.width;
						tipArea.left -= 10;
					} else {
						tipArea.left = bounds.left + bounds.width;
						tipArea.left += 10;
					}
					var info = {
						context: {proposal: self.proposals[self.selectedIndex]},
						anchorArea: bounds,
						tooltipArea: tipArea
					};
					return info;
				}
			};
			
			if (update) {
				tooltip.update(target, noContent);
			} else {
				tooltip.show(target, true, false);
			}
		},
		
		_hideTooltip: function() {
			var tooltip = mTooltip.Tooltip.getTooltip(this.contentAssist.textView);
			tooltip.hide(true); // Clear the lock
		},

		pageUp: function() {
			//TODO find out why this doesn't always go to the very top
			if (this.widget) {
				var newSelected = this.widget.getTopIndex();
				if (newSelected === this.selectedIndex) {
					this.widget.scrollIndex(newSelected, false);
					newSelected = this.widget.getTopIndex();
				}
				if (0 === newSelected) {
					// if we're attempting to select the first item in the list
					// move down to the next one if it is not selectable
					return this.lineDown(newSelected, true);	
				}
				return this.lineUp(newSelected, true);
			} else {
				return this.lineUp();
			}
		},
		pageDown: function() {
			if (this.widget) {
				var newSelected = this.widget.getBottomIndex();
				if (newSelected === this.selectedIndex) {
					this.widget.scrollIndex(newSelected, true);
					newSelected = this.widget.getBottomIndex();
				}
				return this.lineDown(newSelected, true);
			} else {
				return this.lineDown();
			}
		},
		enter: function() {
			var proposal = this.proposals[this.selectedIndex] || null;
			return this.contentAssist.apply(proposal);
		},
		tab: function() {
			if (this.widget) {
				this.widget.parentNode.focus();
				return true;
			} else {
				return false;
			}
		}
	});

	/**
	 * @name orion.editor.ContentAssistWidget
	 * @class Displays proposals from a {@link orion.editor.ContentAssist}.
	 * @description Creates a ContentAssistWidget that will display proposals from the given {@link orion.editor.ContentAssist}
	 * in the given <code>parentNode</code>. Clicking a proposal will cause the ContentAssist to apply that proposal.
	 * @param {orion.editor.ContentAssist} contentAssist
	 * @param {String|DomNode} [parentNode] The ID or DOM node to use as the parent for displaying proposals. If not provided,
	 * a new DIV will be created inside &lt;body&gt; and assigned the CSS class <code>contentassist</code>.
	 */
	function ContentAssistWidget(contentAssist, parentNode) {
		this.contentAssist = contentAssist;
		this.textView = this.contentAssist.getTextView();
		this.textViewListenerAdded = false;
		this.isShowing = false;
		this._useResizeTimer = false;
		var document = this.textView.getOptions("parent").ownerDocument; //$NON-NLS-0$
		this.parentNode = typeof parentNode === "string" ? document.getElementById(parentNode) : parentNode;
		if (!this.parentNode) {
			this.parentNode = util.createElement(document, "div"); //$NON-NLS-0$
			this.parentNode.className = "contentassist"; //$NON-NLS-0$
			var body = document.getElementsByTagName("body")[0]; //$NON-NLS-0$
			if (body) {
				body.appendChild(this.parentNode);
			} else {
				throw new Error("parentNode is required"); //$NON-NLS-0$
			}
		}
		var MO = window.MutationObserver || window.MozMutationObserver;
		if (MO && util.isFirefox) {//MutationObserver does not work in chrome for resize https://code.google.com/p/chromium/issues/detail?id=293948
			this._mutationObserver = new MO(function(mutations) {
				this._contentAssistMode._showTooltip(true, true);
			}.bind(this));
		} else {
			this._useResizeTimer = true;
		}
		
		textUtil.addEventListener(this.parentNode, "scroll", this.onScroll.bind(this));
		
		var self = this;
		this.textViewListener = {
			onMouseDown: function(event) {
				var target = event.event.target || event.event.srcElement;
				if (target.parentElement !== self.parentNode) {
					self.contentAssist.deactivate();
				}
				// ignore the event if this is a click inside of the parentNode
				// the click is handled by the onClick() function
			}
		};
		this.contentAssist.addEventListener("Deactivating", function(event) {
			self.hide();
		});
		this.scrollListener = function(e) {
			if (self.isShowing) {
				self.position();
				//TODO: code edit widget : redo the tooltip positioning by the same new api
			}
		};
		//TODO: code edit widget : clean up the code to remove the listener here
		textUtil.addEventListener(document, "scroll", this.scrollListener);
	}
	ContentAssistWidget.prototype = /** @lends orion.editor.ContentAssistWidget.prototype */ {
		/** @private */
		onClick: function(e) {
			if (!e) { e = window.event; }
			this.contentAssist.apply(this.getProposal(e.target || e.srcElement));
			this.textView.focus();
		},
		/** @private */
		onScroll: function(e) {
			if (this.previousCloneNode && !this.preserveCloneThroughScroll) {
				this._removeCloneNode();
				this.previousSelectedNode.classList.add(STYLES.selected);
			}
			this.preserveCloneThroughScroll = false;
		},
		/** @private */
		createDiv: function(proposal, parent, itemIndex) {
			var document = parent.ownerDocument;
			var div = util.createElement(document, "div"); //$NON-NLS-0$
			div.id = "contentoption" + itemIndex; //$NON-NLS-0$
			div.setAttribute("role", "option"); //$NON-NLS-1$ //$NON-NLS-2$
			div.className = STYLES[proposal.style] ? STYLES[proposal.style] : STYLES.dfault;
			var node;
			if (proposal.style === "hr") {
				node = util.createElement(document, "hr"); //$NON-NLS-0$
			} else {
				node = this._createDisplayNode(proposal, itemIndex);
				div.contentAssistProposalIndex = itemIndex; // make div clickable
			}
			div.appendChild(node);
			parent.appendChild(div);
		},
		/** @private */
		createAccessible: function() {
			var mode = this._contentAssistMode;
			var self = this;
			textUtil.addEventListener(this.parentNode, "keydown", function(evt) {
				if (!evt) { evt = window.event; }
				if (evt.preventDefault) {
					evt.preventDefault();
				}
				if(evt.keyCode === lib.KEY.ESCAPE) {
					return mode.cancel(); 
				} else if(evt.keyCode === lib.KEY.UP) {
					return mode.lineUp();
				} else if(evt.keyCode === lib.KEY.DOWN) {
					return mode.lineDown();
				} else if(evt.keyCode === lib.KEY.ENTER) {
					return mode.enter(); 
				} else if(evt.keyCode === lib.KEY.PAGEDOWN) {
					return mode.pageDown();
				} else if(evt.keyCode === lib.KEY.PAGEUP) {
					return mode.pageUp();
				} else if(evt.keyCode === lib.KEY.HOME) {
					self.scrollIndex(0, true);
					return mode.lineDown(0); // select first selectable element starting at the top and moving downwards
				} else if(evt.keyCode === lib.KEY.END) {
					return mode.lineUp(mode.getProposals().length - 1); // select first selectable element starting at the bottom and moving up
				}
				return false;
			});
		},
		/** @private */
		_createDisplayNode: function(proposal, index) {
			var node = document.createElement("span");
			
			if (!proposal){
				return node;
			}
			
			if (typeof proposal === "string"){
				var simpleName = this._createNameNode(proposal);
				simpleName.contentAssistProposalIndex = index;
				return simpleName;
			}
			
			var nameNode;
			var usingDescription; // Proposals are allowed to use the description as the name
			if (proposal.name && typeof proposal.name === "string") {
				nameNode = this._createNameNode(proposal.name);
			} else if (proposal.description && typeof proposal.description === "string"){
				nameNode = this._createNameNode(proposal.description);
				usingDescription = true;
			} else if (proposal.proposal && typeof proposal.proposal === "string"){
				nameNode = this._createNameNode(proposal.proposal);
			} else {
				// Must have a name
				return node;
			}
			
			var tagsNode = this._createTagsNode(proposal.tags);
			
			var descriptionNode;
			if (!usingDescription && proposal.description && typeof proposal.description === "string") {
				descriptionNode = document.createTextNode(proposal.description);
			}

			if (tagsNode) { node.appendChild(tagsNode); }
			node.appendChild(nameNode);
			if (descriptionNode) { node.appendChild(descriptionNode); }

			nameNode.contentAssistProposalIndex = index;
			node.contentAssistProposalIndex = index;
			
			return node;		
		},
		/** @private */
		_stopResizeTimer: function() {
			if (this._resizeTimer) {
				window.clearInterval(this._resizeTimer);
				this._resizeTimer = null; 
			}
		},
		_startResizeTimer: function() {
			this._stopResizeTimer();
			this._cachedResizeBound = this.parentNode.getBoundingClientRect();
			this._resizeTimer = window.setInterval(function() {
				if(this._contentAssistMode) {
					var bound = this.parentNode.getBoundingClientRect();
					if(bound.left === this._cachedResizeBound.left && 
					   bound.top === this._cachedResizeBound.top &&
					   bound.width === this._cachedResizeBound.width &&
					   bound.height === this._cachedResizeBound.height) {
						return;   	
					}
					this._cachedResizeBound = bound;
					this._contentAssistMode._showTooltip(true, true);
				}
			}.bind(this), 100);
		},
		/** @private */
		_createNameNode: function(name) {
			var node = document.createElement("span");
			node.classList.add("proposal-name"); //$NON-NLS-0$
			node.appendChild(document.createTextNode(name));
			return node;
		},
		/**
		 * @private
		 * @param tags {Array} The array of tags to display
		 * @returns {Object} the dom node for the tags or <code>null</code>
		 */
		_createTagsNode: function(tags) {
			var tagsNode = null;
			if (tags && tags.constructor === Array && tags.length > 0){
				tagsNode = document.createElement("span");
				for (var i=0; i<tags.length; i++) {
					var tag = tags[i];
					if (tag.content || tag.cssClass || tag.color){
						var tagNode = document.createElement("span");
						if (tag.cssClass){
							tagNode.classList.add(tag.cssClass);
						} else if (typeof tag.color === 'string' && tag.color.match(/^[\w-]*$/)){
							tagNode.classList.add('colorTag'); //$NON-NLS-1$
							tagNode.style.backgroundColor = tag.color;
						} else {
							tagNode.classList.add('proposalTag'); //$NON-NLS-1$
						}
						if (tag.content){
							tagNode.textContent = tag.content;
						}
						tagsNode.appendChild(tagNode);
					}
				}
			}
			return tagsNode;
		},
		/**
		 * @private
		 * @returns {Object} The proposal represented by the given node.
		 */
		getProposal: function(/**DOMNode*/ node) {
			var proposal = null;
			
			var nodeIndex = node.contentAssistProposalIndex;
			
			if (undefined !== nodeIndex){
				proposal = this._contentAssistMode.getProposals()[nodeIndex] || null;
			}
			
			return proposal;
		},
		/** @private */
		getTopIndex: function() {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				if (child.offsetTop >= this.parentNode.scrollTop) {
					return i;
				}
			}
			return 0;
		},
		/** @private */
		getBottomIndex: function() {
			var nodes = this.parentNode.childNodes;
			for (var i=0; i < nodes.length; i++) {
				var child = nodes[i];
				if ((child.offsetTop + child.offsetHeight) > (this.parentNode.scrollTop + this.parentNode.clientHeight)) {
					return Math.max(0, i - 1);
				}
			}
			return nodes.length - 1;
		},
		/** @private */
		scrollIndex: function(index, top) {
			var nodeAtIndex = this.parentNode.childNodes[index];
			if (nodeAtIndex){
				nodeAtIndex.scrollIntoView(top);
				this.preserveCloneThroughScroll = true;
			}
		},
		/**
		 * Visually selects the node at the specified nodeIndex
		 * by updating its CSS class and scrolling it into view
		 * if necessary.
		 * @param{Number} nodeIndex The index of the node to select
		 */
		selectNode: function(nodeIndex) {
			var node = null;
			
			if (this._hideTimeout) {
				window.clearTimeout(this._hideTimeout);
				this._hideTimeout = null;
			}
			if (this._fadeTimer) {
				window.clearTimeout(this._fadeTimer);
				this._fadeTimer = null;
			}
			if (this.previousSelectedNode) {
				this.previousSelectedNode.classList.remove(STYLES.selected);
				this.previousSelectedNode = null;
				if (this.previousCloneNode) {
					this._removeCloneNode();
				}
			}
			
			if (-1 !== nodeIndex) {
				node = this.parentNode.childNodes[nodeIndex];
				if (node){
					node.classList.add(STYLES.selected);
					this.parentNode.setAttribute("aria-activedescendant", node.id); //$NON-NLS-0$
					node.focus();
					if (node.offsetTop < this.parentNode.scrollTop) {
						node.scrollIntoView(true);
						this.preserveCloneThroughScroll = true;
					} else if ((node.offsetTop + node.offsetHeight) > (this.parentNode.scrollTop + this.parentNode.clientHeight)) {
						node.scrollIntoView(false);
						this.preserveCloneThroughScroll = true;
					}
					
					var textNode = node.firstChild || node;  
					var textBounds = textNode.getBoundingClientRect();
					var parentWidth = this.parentNode.clientWidth ? this.parentNode.clientWidth : this.parentNode.getBoundingClientRect(); // Scrollbar can cover text
					var parentStyle = window.getComputedStyle(this.parentNode);
					var nodeStyle = window.getComputedStyle(node);
					var allPadding = parseInt(parentStyle.paddingLeft) + parseInt(parentStyle.paddingRight) + parseInt(nodeStyle.paddingLeft) + parseInt(nodeStyle.paddingRight);
					if (textBounds.width >= (parentWidth - allPadding)) {
						var parentTop = parseInt(parentStyle.top);
						
						// create clone node
						var clone = node.cloneNode(true); // deep clone
						clone.classList.add("cloneProposal"); //$NON-NLS-0$
						clone.style.top = parentTop + node.offsetTop - this.parentNode.scrollTop + "px"; //$NON-NLS-0$
						clone.style.left = parentStyle.left;
						clone.setAttribute("id", clone.id + "_clone"); //$NON-NLS-1$ //$NON-NLS-0$
						
						// try to fit clone node on page horizontally
						var viewportWidth = document.documentElement.clientWidth;
						var horizontalOffset = (textBounds.left + textBounds.width) - parseInt(viewportWidth);
						if (horizontalOffset > 0) {
							var cloneLeft = parseInt(parentStyle.left) - horizontalOffset;
							if (0 > cloneLeft) {
								cloneLeft = 0;
							}
							clone.style.left = cloneLeft + "px";
						}
	
						// create wrapper parent node (to replicate css class hierarchy)
						var parentClone = document.createElement("div");
						parentClone.id = "clone_contentassist";  //$NON-NLS-0$
						parentClone.classList.add("contentassist"); //$NON-NLS-0$
						parentClone.classList.add("cloneWrapper"); //$NON-NLS-0$
						parentClone.appendChild(clone);
						parentClone.onclick = this.parentNode.onclick;
						this.parentNode.parentNode.insertBefore(parentClone, this.parentNode);
						
						// make all the cloned nodes clickable by setting their contentAssistProposalIndex
						var recursiveSetIndex = function(cloneNode){
							cloneNode.contentAssistProposalIndex = node.contentAssistProposalIndex;
							if (cloneNode.hasChildNodes()) {
								for (var i = 0 ; i < cloneNode.childNodes.length ; i++){
									recursiveSetIndex(cloneNode.childNodes[i]);
								}
							}
						};
						recursiveSetIndex(parentClone);
						
						var self = this;
						this._hideTimeout = window.setTimeout(function() {
							self._hideTimeout = null;
							node.classList.add(STYLES.selected);
							var opacity = 1;
							self._fadeTimer = window.setInterval(function() {
								if (!self.previousCloneNode || opacity <= 0.01){
									self._removeCloneNode();
									window.clearInterval(self._fadeTimer);
									self._fadeTimer = null;
								} else {
									parentClone.style.opacity = opacity;
									parentClone.style.filter = 'alpha(opacity=' + opacity * 100 + ")";
	        						opacity -= opacity * 0.1;
	        					}
							}, 50);
						}, 1500);
						
						node.classList.remove(STYLES.selected);
						
						this.previousCloneNode = parentClone;				
					}
				}
			}
			
			this.previousSelectedNode = node;
		},
		setContentAssistMode: function(mode) {
			this._contentAssistMode = mode;
		},
		show: function() {
			var proposals = this._contentAssistMode.getProposals();
			if (proposals.length === 0) {
				this.hide();
			} else {
				this.parentNode.innerHTML = "";
				for (var i = 0; i < proposals.length; i++) {
					this.createDiv(proposals[i], this.parentNode, i);
				}
				this.position();
				this.parentNode.onclick = this.onClick.bind(this);
				this.isShowing = true;
				
				this._contentAssistMode._showTooltip(false);
				
				if(this._useResizeTimer) {
					this._startResizeTimer();
				} else if(this._mutationObserver){
					this._mutationObserver.observe(this.parentNode, {attributes: true});
				}
				if (!this.textViewListenerAdded) {
					this.textView.addEventListener("MouseDown", this.textViewListener.onMouseDown);
					this.textViewListenerAdded = true;
				}
			}
		},
		hide: function() {
			if(this.parentNode.ownerDocument.activeElement === this.parentNode) {
				this.textView.focus();
			}
			this.parentNode.style.display = "none"; //$NON-NLS-0$
			this.parentNode.onclick = null;
			this.isShowing = false;
			
			if(this._useResizeTimer) {
				this._stopResizeTimer();
			} else if(this._mutationObserver){
				this._mutationObserver.disconnect();
			}
			
			this._contentAssistMode._hideTooltip();
			
			if (this.textViewListenerAdded) {
				this.textView.removeEventListener("MouseDown", this.textViewListener.onMouseDown);
				this.textViewListenerAdded = false;
			}
			
			if (this.previousSelectedNode) {
				this.previousSelectedNode = null;
				if (this.previousCloneNode) {
					this._removeCloneNode();
				}
			}
		},
		position: function() {
			var contentAssist = this.contentAssist;
			var offset;
			var view = this.textView;
			if (contentAssist.offset !== undefined) {
				offset = contentAssist.offset;
				var model = view.getModel();
				if (model.getBaseModel) {
					offset = model.mapOffset(offset, true);
				}
			} else {
				offset = this.textView.getCaretOffset();
			}
			var caretLocation = view.getLocationAtOffset(offset);
			caretLocation.y += view.getLineHeight();
			this.textView.convert(caretLocation, "document", "page"); //$NON-NLS-1$ //$NON-NLS-0$
			this.parentNode.style.position = "fixed"; //$NON-NLS-0$
			this.parentNode.style.left = caretLocation.x + "px"; //$NON-NLS-0$
			this.parentNode.style.top = caretLocation.y + "px"; //$NON-NLS-0$
			this.parentNode.style.display = "block"; //$NON-NLS-0$
			this.parentNode.scrollTop = 0;

			// Make sure that the panel is never outside the viewport
			var document = this.parentNode.ownerDocument;
			var viewportWidth = document.documentElement.clientWidth,
			    viewportHeight =  document.documentElement.clientHeight;
			    
			var spaceBelow = viewportHeight - caretLocation.y;			    
			if (this.parentNode.offsetHeight > spaceBelow) {
				// Check if div is too large to fit above
				var spaceAbove = caretLocation.y - this.textView.getLineHeight();
				if (this.parentNode.offsetHeight > spaceAbove){
					// Squeeze the div into the larger area
					if (spaceBelow > spaceAbove) {
						this.parentNode.style.maxHeight = spaceBelow + "px"; //$NON-NLS-0$
					} else {
						this.parentNode.style.maxHeight = spaceAbove + "px"; //$NON-NLS-0$
						this.parentNode.style.top = "0"; //$NON-NLS-0$
					}
				} else {
					// Put the div above the line
					this.parentNode.style.top = (caretLocation.y - this.parentNode.offsetHeight - this.textView.getLineHeight()) + "px"; //$NON-NLS-0$
					this.parentNode.style.maxHeight = spaceAbove + "px"; //$NON-NLS-0$
				}
			} else {
				this.parentNode.style.maxHeight = spaceBelow + "px"; //$NON-NLS-0$
			}
			
			if (caretLocation.x + this.parentNode.offsetWidth > viewportWidth) {
				var leftSide = viewportWidth - this.parentNode.offsetWidth;
				if (leftSide < 0) {
					leftSide = 0;
				}
				this.parentNode.style.left = leftSide + "px"; //$NON-NLS-0$
				this.parentNode.style.maxWidth = viewportWidth - leftSide;
			} else {
				this.parentNode.style.maxWidth = viewportWidth + caretLocation.x + "px"; //$NON-NLS-0$
			}
		},
		_removeCloneNode: function(){
			if (this.parentNode.parentNode.contains(this.previousCloneNode)) {
				this.parentNode.parentNode.removeChild(this.previousCloneNode);	
			}
			this.previousCloneNode = null;
		}
	};
	return {
		ContentAssist: ContentAssist,
		ContentAssistMode: ContentAssistMode,
		ContentAssistWidget: ContentAssistWidget
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2010, 2016 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License v1.0
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html).
 *
 * Contributors: IBM Corporation - initial API and implementation
 *               Alex Lakatos - fix for bug#369781
 ******************************************************************************/

/*eslint-env browser, amd*/
define("orion/editor/textStyler", ['orion/editor/annotations', 'orion/editor/eventTarget', 'orion/metrics'], //$NON-NLS-3$ //$NON-NLS-2$ //$NON-NLS-1$ //$NON-NLS-0$
	function(mAnnotations, mEventTarget, mMetrics) {

	/*
	 * Throughout textStyler "block" refers to a potentially multi-line token.
	 * Typical examples are multi-line comments and multi-line strings.
	 */

	var binarySearch = function(array, offset, inclusive, low, high) {
		var index;
		if (low === undefined) { low = -1; }
		if (high === undefined) { high = array.length; }
		while (high - low > 1) {
			index = Math.floor((high + low) / 2);
			if (offset <= array[index].start) {
				high = index;
			} else if (inclusive && offset < array[index].end) {
				high = index;
				break;
			} else {
				low = index;
			}
		}
		return high;
	};
	
	function copy(object) {
		return JSON.parse(JSON.stringify(object));
	}

	var createPatternBasedAdapter = function(grammars, rootIds, contentType) {
		return new PatternBasedAdapter(grammars, rootIds, contentType);
	};

	function PatternBasedAdapter(grammars, rootIds, contentType) {
		this._patternManager = new PatternManager(grammars, rootIds);
		this._contentType = contentType;
	}
	PatternBasedAdapter.prototype = {
		blockSpansBeyondEnd: function(block) {
			return block.pattern.regexEnd === this._eolRegex;
		},
		computeBlocks: function(model, text, block, offset, startIndex, endIndex, maxBlockCount) {
			if (!text) {
				return [];
			}

			var results = [];
			var matches = [];
			var result;
			startIndex = startIndex || 0;
			endIndex = endIndex || Infinity;
			maxBlockCount = maxBlockCount || Infinity;
			block.blockPatterns.forEach(function(current) {
				result = this._findMatch(current.regexBegin || current.regex, text, startIndex);
				if (result) {
					matches.push({result: result, pattern: current});
				}
			}.bind(this));
			if (!matches.length) {
				return results;
			}
			matches.sort(function(a,b) {
				if (a.result.index < b.result.index) {
					return -1;
				}
				if (a.result.index > b.result.index) {
					return 1;
				}
				return a.pattern.pattern.index < b.pattern.pattern.index ? -1 : 1;
			});

			var index = 0;
			while (matches.length > 0) {
				var current = matches[0];
				matches.splice(0,1);

				if (endIndex < current.result.index) {
					break;
				}

				if (current.result.index < index) {
					/* processing of another match has moved index beyond this match */
					this._updateMatch(current, text, matches, index, endIndex);
					continue;
				}

				var start = offset + current.result.index;
				var contentStart = current.result.index;
				var resultEnd = null;

				var endRegex = current.pattern.regexEnd;
				if (!endRegex) {
					resultEnd = this.createBlock(
						{
							start: start,
							end: start + current.result[0].length,
							contentStart: start,
							contentEnd: start + current.result[0].length
						},
						block.styler,
						model,
						block,
						current.pattern);
				} else {
					contentStart += current.result[0].length;
					var testPattern = current.pattern;
					/*
					 * If the end regex contains a capture reference (eg.- "\1") then substitute
					 * the resolved capture values from the begin match.
					 */
					var resolvedEndRegex = this._substituteCaptureValues(endRegex, current.result);
					if (resolvedEndRegex !== endRegex) {
						/*
						 * A substitution was made, so make a copy of the test pattern and set its
						 * end regex to the resolved one.  This will cause end-match detection to be
						 * performed with this concrete end regex value, but the original pattern
						 * definition containing the capture reference will not be affected.
						 */
						testPattern = {
							pattern: testPattern.pattern,
							regexBegin: testPattern.regexBegin,
							regexEnd: resolvedEndRegex
						};
						endRegex = resolvedEndRegex;
					}

					var lastIndex = contentStart;
					while (!resultEnd) {
						result = this._findMatch(endRegex, text, lastIndex);
						if (!result) {
							this._eolRegex.lastIndex = 0;
							result = this._eolRegex.exec(text);
							testPattern = {
								pattern: testPattern.pattern,
								regexBegin: testPattern.regexBegin,
								regexEnd: this._eolRegex
							};
						}
						var testBlock = this.createBlock(
							{
								start: start,
								end: offset + result.index + result[0].length,
								contentStart: offset + contentStart,
								contentEnd: offset + result.index
							},
							block.styler,
							model,
							block,
							testPattern);
						var subBlocks = testBlock.getBlocks();
						if (!subBlocks.length || subBlocks[subBlocks.length - 1].end <= (result.index + offset)) {
							resultEnd = testBlock;
						}
						lastIndex = result.index + result[0].length;
					}
				}
				results.push(resultEnd);
				if (results.length === maxBlockCount || endIndex <= resultEnd.end) {
					break;
				}
				index = resultEnd.end - offset;
				this._updateMatch(current, text, matches, index, endIndex);
			}
			return results;
		},
		computeStyle: function(block, model, offset) {
			if (!block.pattern) {
				return null;
			}

			var fullBlock = {
				start: block.start,
				end: block.end,
				style: block.pattern.pattern.name
			};
			if (block.contentStart <= offset && offset < block.contentEnd) {
				if (block.pattern.pattern.contentName) {
					return {
						start: block.contentStart,
						end: block.contentEnd,
						style: block.pattern.pattern.contentName
					};
				}
				return fullBlock;
			}

			var regex, captures, testString, index;
			if (offset < block.contentStart) {
				captures = block.pattern.pattern.beginCaptures || block.pattern.pattern.captures;
				if (!captures) {
					return fullBlock;
				}
				regex = block.pattern.regexBegin;
				testString = model.getText(block.start, block.contentStart);
				index = block.start;
			} else {
				captures = block.pattern.pattern.endCaptures || block.pattern.pattern.captures;
				if (!captures) {
					return fullBlock;
				}
				regex = block.pattern.regexEnd;
				testString = model.getText(block.contentEnd, block.end);
				index = block.contentEnd;
			}

			regex.lastIndex = 0;
			var result = regex.exec(testString);
			if (result) {
				var styles = [];
				this._getCaptureStyles(result, captures, index, styles);
				var style = styles[binarySearch(styles, offset, true)];
				if (style && style.start <= offset && offset < style.end) {
					return style;
				}
			}
			return fullBlock;
		},
		createBlock: function(bounds, styler, model, parent, data) {
			/* for pattern-based matching data is a pattern */
			return new Block(
				bounds,
				data ? data.pattern.name : null,
				data ? data.pattern.id : null,
				styler,
				model,
				parent,
				function(newBlock) {
					newBlock.pattern = data;
					newBlock.linePatterns = [];
					newBlock.blockPatterns = [];
					newBlock.enclosurePatterns = {};
					this._initPatterns(this._patternManager, newBlock);
				}.bind(this));
		},
		destroy: function() {
			this._textModel.removeEventListener("Changed", this._listener); //$NON-NLS-0$
		},
		getBlockCommentDelimiters: function(index) {
			var languageBlock = this._getLanguageBlock(index);
			var blockPatterns = languageBlock.blockPatterns;
			if (blockPatterns) {
				var COMMENT_BLOCK = "comment.block"; //$NON-NLS-0$
				for (var i = 0; i < blockPatterns.length; i++) {
					var current = blockPatterns[i].pattern;
					var name = current.name || current.contentName;
					if (name && name.indexOf(COMMENT_BLOCK) !== -1) {
						if (current.begin && current.end && current.begin.literal && current.end.literal) {
							return [current.begin.literal, current.end.literal];
						}
					}
				}
			}
			return ["", ""];
		},
		getBlockContentStyleName: function(block) {
			return block.pattern.pattern.contentName || block.pattern.pattern.name;
		},
		getBlockEndStyle: function(block, text, endIndex, _styles) {
			/* pattern-defined blocks specify an end style by either a capture or name */
			var result;
			if (block.pattern.regexEnd) {
				result = this._findMatch(block.pattern.regexEnd, text, 0);
				if (result) {
					/* the end match is still valid */
					var captures = block.pattern.pattern.endCaptures || block.pattern.pattern.captures;
					if (captures) {
						this._getCaptureStyles(result, captures, endIndex - result[0].length, _styles);
					} else if (block.pattern.pattern.name) {
						_styles.push({start: endIndex - result[0].length, end: endIndex, style: block.pattern.pattern.name});
					}
				}
			}
			return result ? result[0] : null;
		},
		getBlockFoldBounds: function(block, model) {
			return {start: block.start, end: block.end};
		},
		getBlockOverrideStyles: function(block, text, index, _styles) {
			/* if the block's pattern is a single-line regex with capture(s) then compute the styles for the capture(s) */
			if (block.pattern.regex && block.pattern.pattern.captures && this._containsCaptureRegex.test(block.pattern.regex)) {
				var match = this._findMatch(block.pattern.regex, text, 0);
				if (match) {
					this._getCaptureStyles(match, block.pattern.pattern.captures, index, _styles);
				}
			}
		},
		getBlockStartStyle: function(block, text, index, _styles) {
			/* pattern-defined blocks specify a start style by either a capture or name */
			var result;
			if (block.pattern.regexBegin) {
				result = this._findMatch(block.pattern.regexBegin, text, 0);
				if (result) {
					/* the begin match is still valid */
					var captures = block.pattern.pattern.beginCaptures || block.pattern.pattern.captures;
					if (captures) {
						this._getCaptureStyles(result, captures, index, _styles);
					} else {
						_styles.push({start: index, end: index + result[0].length, style: block.pattern.pattern.name});
					}
				}
			}
			return result ? result[0] : null;
		},
		getBracketMatch: function(block, text) {
			var match;
			var keys = Object.keys(block.enclosurePatterns);
			for (var i = 0; i < keys.length; i++) {
				var current = block.enclosurePatterns[keys[i]];
				var result = this._findMatch(current.regex, text, 0);
				if (result && result.index === 0) {
					match = current;
					break;
				}
			}
			if (!match) { return null; }

			var closingName;
			var atStart = false;
			if (match.pattern.name.indexOf(this._PUNCTUATION_SECTION_BEGIN) !== -1) {
				atStart = true;
				closingName = match.pattern.name.replace(this._PUNCTUATION_SECTION_BEGIN, this._PUNCTUATION_SECTION_END);
			} else {
				closingName = match.pattern.name.replace(this._PUNCTUATION_SECTION_END, this._PUNCTUATION_SECTION_BEGIN);
			}
			var closingBracket = block.enclosurePatterns[closingName];
			if (!closingBracket) { return null; }

			return {
				beginName: match.pattern.name,
				endName: closingName,
				atStart: atStart
			};
		},
		getContentType: function() {
			return this._contentType;
		},
		getLineCommentDelimiter: function(index) {
			var COMMENT_LINE = "comment.line"; //$NON-NLS-0$
			var languageBlock = this._getLanguageBlock(index);
			var linePatterns = languageBlock.linePatterns;
			if (linePatterns) {
				for (var i = 0; i < linePatterns.length; i++) {
					var current = linePatterns[i].pattern;
					var name = current.name;
					if (name && name.indexOf(COMMENT_LINE) !== -1) {
						if (current.match && current.match.literal) {
							return current.match.literal;
						}
					}
				}
			}
			var blockPatterns = languageBlock.blockPatterns;
			if (blockPatterns) {
				for (i = 0; i < blockPatterns.length; i++) {
					current = blockPatterns[i].pattern;
					name = current.name || current.contentName;
					if (name && name.indexOf(COMMENT_LINE) !== -1) {
						if (current.begin && current.begin.literal) {
							return current.begin.literal;
						}
					}
				}
			}
			return "";
		},
		parse: function(text, offset, startIndex, block, _styles, ignoreCaptures) {
			if (!text) {
				return;
			}
			var patterns = block.linePatterns;
			if (!patterns) {
				return;
			}

			var matches = [];
			var result;
			patterns.forEach(function(current) {
				var regex = current.regex || current.regexBegin;
				regex.oldLastIndex = regex.lastIndex;
				result = this._findMatch(regex, text, startIndex);
				if (result) {
					matches.push({result: result, pattern: current});
				}
			}.bind(this));
			matches.sort(function(a,b) {
				if (a.result.index < b.result.index) {
					return -1;
				}
				if (a.result.index > b.result.index) {
					return 1;
				}
				return a.pattern.pattern.index < b.pattern.pattern.index ? -1 : 1;
			});

			var index = startIndex;
			while (matches.length > 0) {
				var current = matches[0];
				matches.splice(0,1);

				if (current.result.index < index) {
					/* processing of another match has moved index beyond this match */
					this._updateMatch(current, text, matches, index);
					continue;
				}

				/* apply the style */
				var start = current.result.index;
				var end;
				if (current.pattern.regex) {	/* line pattern defined by a "match" */
					var substyles = [];
					result = current.result;
					end = start + result[0].length;
					var tokenStyle = {start: offset + start, end: offset + end, style: current.pattern.pattern.name};
					if (!ignoreCaptures) {
						if (current.pattern.pattern.captures) {
							this._getCaptureStyles(result, current.pattern.pattern.captures, offset + start, substyles);
						}
						substyles.sort(function(a,b) {
							if (a.start < b.start) {
								return -1;
							}
							if (a.start > b.start) {
								return 1;
							}
							return 0;
						});
						for (var j = 0; j < substyles.length - 1; j++) {
							if (substyles[j + 1].start < substyles[j].end) {
								var newStyle = {start: substyles[j + 1].end, end: substyles[j].end, style: substyles[j].style};
								substyles[j].end = substyles[j + 1].start;
								substyles.splice(j + 2, 0, newStyle);
							}
						}
					}
					this._mergeStyles(tokenStyle, substyles, _styles);
				} else {	/* pattern defined by a "begin/end" pair */
					/*
					 * If the end match contains a capture reference (eg.- "\1") then update
					 * its regex with the resolved capture values from the begin match.
					 */
					var endRegex = current.pattern.regexEnd;
					endRegex = this._substituteCaptureValues(endRegex, current.result);

					result = this._findMatch(endRegex, text, current.result.index + current.result[0].length);
					if (!result) {
						this._eolRegex.lastIndex = 0;
						result = this._eolRegex.exec(text);
					}
					end = result.index + result[0].length;
					_styles.push({start: offset + start, end: offset + end, style: current.pattern.pattern.name});
				}
				index = result.index + result[0].length;
				this._updateMatch(current, text, matches, index);
			}
			patterns.forEach(function(current) {
				var regex = current.regex || current.regexBegin;
				regex.lastIndex = regex.oldLastIndex;
			});
		},
		setStyler: function(styler) {
			if (this._styler) {
				this._textModel.removeEventListener("Changed", this._listener); //$NON-NLS-0$
			}
			this._styler = styler;
			this._listener = this._onModelChanged.bind(this);
			this._textModel = this._styler.getTextModel();
			this._textModel.addEventListener("Changed", this._listener); //$NON-NLS-0$
			this._patternManager.firstLineChanged(this._textModel.getLine(0));
		},
		verifyBlock: function(baseModel, text, ancestorBlock, changeCount) {
			var result = null;
			var matches = [];
			var match;
			var parentBlock = ancestorBlock.parent;
			parentBlock.blockPatterns.forEach(function(current) {
				match = this._findMatch(current.regexBegin || current.regex, text, 0);
				if (match) {
					matches.push({result: match, pattern: current});
				}
			}.bind(this));
			matches.sort(function(a,b) {
				/* ensure that matches at index 0 make it to the front, other matches do not matter */
				if (!a.result.index && b.result.index) {
					return -1;
				}
				if (a.result.index && !b.result.index) {
					return 1;
				}
				if (!a.result.index && !b.result.index) {
					return a.pattern.pattern.index < b.pattern.pattern.index ? -1 : 1;
				}
				return 0;
			});
			if (!matches.length || matches[0].result.index !== 0 || matches[0].pattern.pattern.id !== ancestorBlock.pattern.pattern.id) {
				result = false;
			} else {
				/* the block start appears to be unchanged, now verify that the block end is unchanged */
				match = matches[0];
				var endRegex = match.pattern.regexEnd;
				if (!endRegex) {
					/* single-match block, just verify its length */
					result = ancestorBlock.start + match.result[0].length === ancestorBlock.end + changeCount;
				} else {
					/* begin/end-match block */

					 /*
					  * Determine whether an earlier match of the block's end pattern has been introduced.
					  * Verifying that this has NOT happened (the most typical case) can be quickly done by
					  * verifying that the first occurrence of its end pattern is still at its former location.
					  * However if a match is found prior to this then the blocks preceding it must be computed
					  * to verify that it is a valid end match (ie.- it is not contained within another block).
				 	  */

					/*
					 * If the end regex contains a capture reference (eg.- "\1") then substitute
					 * the resolved capture values from the begin match.
					 */
					endRegex = this._substituteCaptureValues(endRegex, match.result);

					var searchStartIndex = match.result[0].length;
					var currentMatch = this._findMatch(endRegex, text, searchStartIndex);
					while (result === null && currentMatch && ancestorBlock.start + currentMatch.index !== ancestorBlock.contentEnd + changeCount) {
						/*
						 * A match was found preceeding the former end match, so now compute
						 * blocks to determine whether it is in fact a valid new end match.
						 */
						var blocks = this.computeBlocks(baseModel, text, ancestorBlock, ancestorBlock.start, searchStartIndex, currentMatch.index + 1, null);
						if (!blocks.length || blocks[blocks.length - 1].end <= ancestorBlock.start + currentMatch.index) {
							/* the match is valid, so the attempt to use ancestorBlock as-is fails */
							result = false;
						} else {
							/* the match is not valid, so search for the next potential end match */
							if (!blocks.length) {
								currentMatch = null;
							} else {
								searchStartIndex = blocks[blocks.length - 1].end - ancestorBlock.start;
								currentMatch = this._findMatch(endRegex, text, searchStartIndex);
							}
						}
					}
					if (!currentMatch) {
						this._eolRegex.lastIndex = 0;
						currentMatch = this._eolRegex.exec(text);
						result = ancestorBlock.start + currentMatch.index === ancestorBlock.end + changeCount;
					}
				}
			}
			return result !== null ? result : true;
		},

		/** @private */

		_findMatch: function(regex, text, startIndex, testBeforeMatch) {
			/*
			 * testBeforeMatch provides a potential optimization for callers that do not strongly expect to find
			 * a match.  If this argument is defined then test() is initially called on the regex, which executes
			 * significantly faster than exec().  If a match is found then the regex's lastIndex is reverted to
			 * its pre-test() value, and exec() is then invoked on it in order to get the match details.
			 */

			var index = startIndex;
			var initialLastIndex = regex.lastIndex;
			this._linebreakRegex.lastIndex = startIndex;

			var currentLine = this._linebreakRegex.exec(text);
			/*
			 * Processing of the first line is treated specially, as it may not start at the beginning of a logical line, but
			 * regex's may be dependent on matching '^'.  To resolve this, compute the full line corresponding to the start
			 * of the text, even if it begins prior to startIndex, and adjust the regex's lastIndex accordingly to begin searching
			 * for matches at the correct location.
			 */
			var lineString, indexAdjustment;
			regex.lastIndex = 0;
			if (currentLine) {
				var lineStart = currentLine.index;
				while (0 <= --lineStart) {
					var char = text.charAt(lineStart);
					if (char === this._NEWLINE || char === this._CR) {
						break;
					}
				}
				lineString = text.substring(lineStart + 1, currentLine.index + currentLine[1].length);
				regex.lastIndex = indexAdjustment = currentLine.index - lineStart - 1;
			}
			while (currentLine && currentLine.index < text.length) {
				var result;
				if (testBeforeMatch) {
					var revertIndex = regex.lastIndex;
					if (regex.test(lineString)) {
						regex.lastIndex = revertIndex;
						result = regex.exec(lineString);
					}
				} else {
					result = regex.exec(lineString);
				}
				if (result) {
					result.index += index;
					result.index -= indexAdjustment;
					regex.lastIndex = initialLastIndex;
					return result;
				}
				indexAdjustment = 0;
				index += currentLine[0].length;
				currentLine = this._linebreakRegex.exec(text);
				if (currentLine) {
					lineString = currentLine[1];
					regex.lastIndex = 0;
				}
			}
			regex.lastIndex = initialLastIndex;
			return null;
		},
		_getCaptureStyles: function(result, captures, offset, _styles) {
			if (captures[0]) {
				/* capture index 0 is the full result */
				_styles.push({start: offset, end: offset + result[0].length, style: captures[0].name});
				return;
			}

			var stringIndex = 0;
			for (var i = 1; i < result.length; i++) {
				if (result[i]) {
					var capture = captures[i];
					if (capture) {
						var styleStart = offset + stringIndex;
						_styles.push({start: styleStart, end: styleStart + result[i].length, style: capture.name});
					}
					stringIndex += result[i].length;
				}
			}
		},
		_getLanguageBlock: function(index) {
			/* Returns the parent block that dictates the language in effect at index */
			var block = this._styler.getBlockAtIndex(index);
			var embeddedNameRegex = /^source\..+\.embedded/;
			while (block) {
				if (block.pattern) {
					var pattern = block.pattern.pattern;
					if (embeddedNameRegex.test(pattern.name || pattern.contentName)) {
						return block;
					}
				}
				block = block.parent;
			}
			return this._styler.getRootBlock();
		},
		_initPatterns: function(patternManager, block) {
			if (block.pattern && block.pattern.pattern.linePatterns) {
				block.linePatterns = block.pattern.pattern.linePatterns;
				block.blockPatterns = block.pattern.pattern.blockPatterns;
				block.enclosurePatterns = block.pattern.pattern.enclosurePatterns;
				return;
			}
			var patterns = patternManager.getPatterns(block.pattern ? block.pattern.pattern : null);
			var initRegex = function(match) {
				var matchString = typeof(match) === "string" ? match : match.match;
				var result = this._ignoreCaseRegex.exec(matchString);
				var flags = this._FLAGS;
				if (result) {
					matchString = matchString.substring(result[0].length);
					flags += "i";
				}
				return new RegExp(matchString, flags);
			}.bind(this);
			var lastBlock = -1;
			var index = 0;
			patterns.forEach(function(current) {
				var pattern;
				if (current.match && !current.begin && !current.end) {
					pattern = {regex: initRegex(current.match), pattern: current};
					block.linePatterns.push(pattern);
					if (current.name && current.name.indexOf("punctuation.section") === 0 && (current.name.indexOf(this._PUNCTUATION_SECTION_BEGIN) !== -1 || current.name.indexOf(this._PUNCTUATION_SECTION_END) !== -1)) { //$NON-NLS-0$
						block.enclosurePatterns[current.name] = pattern;
					}
				} else if (!current.match && current.begin && current.end) {
					lastBlock = index;
					pattern = {regexBegin: initRegex(current.begin), regexEnd: initRegex(current.end), pattern: current};
					block.linePatterns.push(pattern);
				}
				index++;
			}.bind(this));
			block.blockPatterns = block.linePatterns.slice(0, lastBlock + 1);
			if (block.pattern) {
				block.pattern.pattern.enclosurePatterns = block.enclosurePatterns;
				block.pattern.pattern.linePatterns = block.linePatterns;
				block.pattern.pattern.blockPatterns = block.blockPatterns;
			}
		},
		_mergeStyles: function(fullStyle, substyles, resultStyles) {
			var i = fullStyle.start;
			substyles.forEach(function(current) {
				if (i <= current.start) {
					resultStyles.push({start: i, end: current.start, style: fullStyle.style});
				}
				resultStyles.push(current);
				i = current.end;
			});
			if (i < fullStyle.end) {
				resultStyles.push({start: i, end: fullStyle.end, style: fullStyle.style});
			}
		},
		_onModelChanged: function(e) {
			var startLine = this._textModel.getLineAtOffset(e.start);
			if (startLine === 0) {
				/* a change in the first line can change the grammar to be applied throughout */
				if (this._patternManager.firstLineChanged(this._textModel.getLine(0))) {
					/* the grammar has changed */
					this._styler.computeRootBlock(this._textModel);
				}
			}
		},
		_substituteCaptureValues: function(regex, resolvedResult) {
			var regexString = regex.toString();
			this._captureReferenceRegex.lastIndex = 0;
			if (!this._captureReferenceRegex.test(regexString)) {
				/* nothing to do */
				return regex;
			}

			this._captureReferenceRegex.lastIndex = 0;
			var result = this._captureReferenceRegex.exec(regexString);
			while (result) {
				regexString = regexString.replace(result[0], resolvedResult[result[1]] || "");
				this._captureReferenceRegex.lastIndex = 0;
				result = this._captureReferenceRegex.exec(regexString);
			}
			/* return an updated regex, remove the leading '/' and trailing /FLAGS */
			return new RegExp(regexString.substring(1, regexString.length - 1 - this._FLAGS.length), this._FLAGS);
		},
		_updateMatch: function(match, text, matches, minimumIndex, endIndex) {
			var regEx = match.pattern.regex ? match.pattern.regex : match.pattern.regexBegin;
			endIndex = endIndex || Infinity;
			var result = this._findMatch(regEx, text, minimumIndex, true);
			if (result && result.index < endIndex) {
				match.result = result;
				for (var i = 0; i < matches.length; i++) {
					if (result.index < matches[i].result.index || (result.index === matches[i].result.index && match.pattern.pattern.index < matches[i].pattern.pattern.index)) {
						matches.splice(i, 0, match);
						return;
					}
				}
				matches.push(match);
			}
		},
		_captureReferenceRegex: /\\(\d)/g,
		_containsCaptureRegex: /\((?!\?:)/, //$NON-NLS-0$
		_eolRegex: /$/,
		_ignoreCaseRegex: /^\(\?i\)\s*/,
		_linebreakRegex: /([\s\S]*?)(?:[\r\n]|$)/g,
		_CR: "\r", //$NON-NLS-0$
		_FLAGS: "g", //$NON-NLS-0$
		_NEWLINE: "\n", //$NON-NLS-0$
		_PUNCTUATION_SECTION_BEGIN: ".begin", //$NON-NLS-0$
		_PUNCTUATION_SECTION_END: ".end" //$NON-NLS-0$
	};

	function PatternManager(grammars, rootIds) {
		this._unnamedCounter = 0;
		this._patterns = [];
		this._firstLineMatches = {};
		if (!Array.isArray(rootIds)) {
			rootIds = [rootIds];
		}
		this._rootIds = rootIds;
		grammars.forEach(function(grammar) {
			this._addRepositoryPatterns(grammar.repository || {}, grammar.id);
			this._addPatterns(grammar.patterns || [], grammar.id);
			if (grammar.firstLineMatch) {
				this._firstLineMatches[grammar.id] = new RegExp(grammar.firstLineMatch);
			}
		}.bind(this));
	}
	PatternManager.prototype = {
		firstLineChanged: function(text) {
			var newId = this._computeRootId(text);
			var changed = this._rootId !== newId;
			this._rootId = newId;
			return changed;
		},
		getPatterns: function(pattern) {
			var parentId;
			if (!pattern) {
				if (!this._rootId) { /* currently no root id */
					return [];
				}
				parentId = this._rootId + "#" + this._NO_ID;
			} else {
				if (typeof(pattern) === "string") { //$NON-NLS-0$
					parentId = pattern;
				} else {
					parentId = pattern.qualifiedId;
				}
				parentId += "#";
			}
			/* indexes on patterns are used to break ties when multiple patterns match the same start text */
			var indexCounter = [0];
			var resultObject = {};
			var regEx = new RegExp("^" + parentId + "[^#]+$"); //$NON-NLS-0$
			this._patterns.forEach(function(current) {
				if (regEx.test(current.qualifiedId)) {
					if (current.include) {
						this._processInclude(current, indexCounter, resultObject);
					} else {
						var newPattern = copy(current);
						newPattern.index = indexCounter[0]++;
						resultObject[current.qualifiedId] = newPattern;
					}
				}
			}.bind(this));

			var result = [];
			var keys = Object.keys(resultObject);
			keys.forEach(function(current) {
				result.push(resultObject[current]);
			});
			return result;
		},

		/** @private */

		_addPattern: function(pattern, patternId, parentId) {
			pattern.parentId = parentId;
			pattern.id = patternId;
			pattern.qualifiedId = pattern.parentId + "#" + pattern.id;
			this._patterns.push(pattern);
			if (pattern.patterns && !pattern.include) {
				this._addPatterns(pattern.patterns, pattern.qualifiedId);
			}
		},
		_addPatterns: function(patterns, parentId) {
			patterns.forEach(function(pattern) {
				this._addPattern(pattern, this._NO_ID + this._unnamedCounter++, parentId);
			}.bind(this));
		},
		_addRepositoryPatterns: function(repository, parentId) {
			var keys = Object.keys(repository);
			keys.forEach(function(key) {
				this._addPattern(repository[key], key, parentId);
			}.bind(this));
		},
		_computeRootId: function(firstLineText) {
			var defaultId = null; /* an acceptable fallback if no firstLineMatches are made */
			var matchId = null;
			for (var i = 0; i < this._rootIds.length; i++) {
				var firstLineMatch = this._firstLineMatches[this._rootIds[i]]; 
				if (!firstLineMatch) {
					defaultId = this._rootIds[i];
				} else if (firstLineMatch.test(firstLineText)) {
					matchId = this._rootIds[i];
				}
			}
			return matchId || defaultId; 
		},
		_processInclude: function(pattern, indexCounter, resultObject) {
			var searchExp;
			var index = pattern.include.indexOf("#");
			if (index === 0) {
				/* inclusion of pattern from same grammar */
				searchExp = new RegExp("^" + pattern.qualifiedId.substring(0, pattern.qualifiedId.indexOf("#")) + pattern.include + "$");
			} else if (index === -1) {
				/* inclusion of whole grammar */
				searchExp = new RegExp("^" + pattern.include + "#" + this._NO_ID + "[^#]+$");
			} else {
				/* inclusion of specific pattern from another grammar */
				searchExp = new RegExp("^" + pattern.include + "$");
			}
			this._patterns.forEach(function(current) {
				if (searchExp.test(current.qualifiedId)) {
					if (current.include) {
						this._processInclude(current, indexCounter, resultObject);
					} else if (!resultObject[current.qualifiedId]) {
						var newPattern = copy(current);
						newPattern.index = indexCounter[0]++;
						resultObject[current.qualifiedId] = newPattern;
					}
				}
			}.bind(this));
		},
		_NO_ID: "NoID"	//$NON-NLS-0$
	};

	function Block(bounds, name, typeId, styler, model, parent, initFn) {
		this.start = bounds.start;
		this.end = bounds.end;
		this.contentStart = bounds.contentStart;
		this.contentEnd = bounds.contentEnd;
		this.name = name;
		this.typeId = typeId;
		this.styler = styler;
		this.parent = parent;
		if (initFn) {
			initFn(this);
		}
		this._subBlocks = styler.computeBlocks(model, model.getText(this.contentStart, this.end), this, this.contentStart, null, null, null);
	}
	Block.prototype = {
		adjustBounds: function(index, value) {
			if (index < this.start) {
				this.start += value;
			}
			if (index < this.contentStart) {
				this.contentStart += value;
			}
			if (index <= this.end) {
				this.end += value;
			}
			if (index <= this.contentEnd) {
				this.contentEnd += value;
			}
			this._subBlocks.forEach(function(current) {
				if (index <= current.end) {
					current.adjustBounds(index, value);
				}
			});
		},
		getBlocks: function() {
			return this._subBlocks;
		},
		getBlockAtIndex: function(index) {
			return binarySearch(this.getBlocks(), index, true);
		},
		isRenderingWhitespace: function() {
			return this.styler._isRenderingWhitespace();
		}
	};

	function TextStylerAccessor(styler) {
		this._styler = styler;
	}
	TextStylerAccessor.prototype = {
		getBlockCommentDelimiters: function(offset) {
			return this._styler.getBlockCommentDelimiters(offset);
		},
		getLineCommentDelimiter: function(offset) {
			return this._styler.getLineCommentDelimiter(offset);
		},
		getStyles: function(offset) {
			return this._styler.getStyles(offset);
		}
	};

	function TextStyler(view, annotationModel, stylerAdapter) {		
		this._whitespacesVisible = false;
		this._highlightCaretLine = false;
		this._foldingEnabled = true;
		this._detectTasks = true;
		this._annotationProviders = [];
		this._view = view;
		this._annotationModel = annotationModel;
		this._stylerAdapter = stylerAdapter;
		this._stylerAdapter.setStyler(this);
		this._accessor = new TextStylerAccessor(this);
		this._bracketAnnotations;

		var self = this;
		this._listener = {
			onChanged: function(e) {
				self._onModelChanged(e);
			},
			onDestroy: function(e) {
				self._onDestroy(e);
			},
			onLineStyle: function(e) {
				self._onLineStyle(e);
			},
			onMouseDown: function(e) {
				self._onMouseDown(e);
			},
			onSelection: function(e) {
				self._onSelection(e);
			}
		};
		var model = view.getModel();
		if (model.getBaseModel) {
			model = model.getBaseModel();
		}
		model.addEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
		view.addEventListener("MouseDown", this._listener.onMouseDown); //$NON-NLS-0$
		view.addEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
		view.addEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
		view.addEventListener("LineStyle", this._listener.onLineStyle); //$NON-NLS-0$
		this.computeRootBlock(model);
	}
	TextStyler.prototype = {
		addAnnotationProvider: function(value) {
			if (typeof value === "function") { //$NON-NLS-0$
				this._annotationProviders.push(value);
			}
		},
		computeBlocks: function(model, text, block, offset, startIndex, endIndex, maxBlockCount) {
			return this._stylerAdapter.computeBlocks(model, text, block, offset, startIndex, endIndex, maxBlockCount);
		},
		computeRootBlock: function(model) {
			var charCount = model.getCharCount();
			var rootBounds = {start: 0, contentStart: 0, end: charCount, contentEnd: charCount};
			if (charCount >= 50000) {
				var startTime = Date.now();
			}
			this._rootBlock = this._stylerAdapter.createBlock(rootBounds, this, model, null);
			if (startTime) {
				var interval = Date.now() - startTime;
				if (interval > 10) {
					mMetrics.logTiming(
						"editor", //$NON-NLS-0$
						"styler compute blocks (ms/50000 chars)", //$NON-NLS-0$
						interval * 50000 / charCount,
						this._stylerAdapter.getContentType());
				}
			}
			if (this._annotationModel) {
				var add = [];
				this._annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_FOLDING);
				this._computeFolding(this._rootBlock.getBlocks(), this._view.getModel(), add);
				if (this._detectTasks) {
					this._annotationModel.removeAnnotations(mAnnotations.AnnotationType.ANNOTATION_TASK);
					this._computeTasks(this._rootBlock, model, add);
				}
				this._replaceAnnotations([], add);
			}
			this._view.redrawLines();
		},
		destroy: function() {
			this._stylerAdapter.destroy();
			if (this._view) {
				var model = this._view.getModel();
				if (model.getBaseModel) {
					model = model.getBaseModel();
				}
				model.removeEventListener("Changed", this._listener.onChanged); //$NON-NLS-0$
				this._view.removeEventListener("MouseDown", this._listener.onMouseDown); //$NON-NLS-0$
				this._view.removeEventListener("Selection", this._listener.onSelection); //$NON-NLS-0$
				this._view.removeEventListener("Destroy", this._listener.onDestroy); //$NON-NLS-0$
				this._view.removeEventListener("LineStyle", this._listener.onLineStyle); //$NON-NLS-0$
				this._view = null;
			}
		},
		getAnnotationModel: function() {
			return this._annotationModel;
		},
		getBlockAtIndex: function(index) {
			return this._findBlock(this._rootBlock, index);
		},
		getBlockCommentDelimiters: function(index) {
			return this._stylerAdapter.getBlockCommentDelimiters(index);
		},
		getLineCommentDelimiter: function(index) {
			return this._stylerAdapter.getLineCommentDelimiter(index);
		},
		getRootBlock: function() {
			return this._rootBlock;
		},
		getStyleAccessor: function() {
			return this._accessor;
		},
		getStyles: function(offset) {
			var result = [];
			if (this._view) {
				var model = this._view.getModel();
				if (model.getBaseModel) {
					model = model.getBaseModel();
				}
				var block = this._findBlock(this._rootBlock, offset);
				var lineIndex = model.getLineAtOffset(offset);
				var lineText = model.getLine(lineIndex);
				var styles = [];
				this._stylerAdapter.parse(lineText, model.getLineStart(lineIndex), 0, block, styles);
				var style = styles[binarySearch(styles, offset, true)];
				if (style && style.start <= offset && offset < style.end) {
					result.push(style);
				}
				while (block) {
					style = this._stylerAdapter.computeStyle(block, model, offset);
					if (style) {
						result.splice(0, 0, style);
					}
					block = block.parent;
				}
			}
			return result;
		},
		getTextModel: function() {
			var model = this._view.getModel();
			if (model.getBaseModel) {
				model = model.getBaseModel();
			}
			return model;
		},
		removeAnnotationProvider: function(value) {
			if (typeof value !== "function") { //$NON-NLS-0$
				return;
			}
			var index = this._annotationProviders.indexOf(value);
			if (index !== -1) {
				this._annotationProviders.splice(index, 1);
			}
		},
		setDetectHyperlinks: function() {
		},
		setDetectTasks: function(enabled) {
			this._detectTasks = enabled;
		},
		setFoldingEnabled: function(enabled) {
			this._foldingEnabled = enabled;
		},
		setHighlightCaretLine: function(highlight) {
			this._highlightCaretLine = highlight;
		},
		setWhitespacesVisible: function(visible, redraw) {
			if (this._whitespacesVisible === visible) { return; }
			this._whitespacesVisible = visible;
			if (redraw) {
				this._view.redraw();
			}
		},

		/** @private */

		_computeFolding: function(blocks, viewModel, _add) {
			if (!viewModel.getBaseModel) { return; }
			var baseModel = viewModel.getBaseModel();
			blocks.forEach(function(block) {
				var foldBounds = this._stylerAdapter.getBlockFoldBounds(block, baseModel);
				var annotation = this._createFoldingAnnotation(viewModel, baseModel, foldBounds.start, foldBounds.end);
				if (annotation) {
					_add.push(annotation);
				}
				this._computeFolding(block.getBlocks(), viewModel, _add);
			}.bind(this));
		},
		_computeTasks: function(block, baseModel, annotations, start, end) {
			start = start || block.start;
			end = end || block.end;
			if (block.start <= end && start <= block.end) {
				if (!this._annotationModel) { return; }

				if (block.name && block.name.indexOf("comment") === 0) {
					var substyles = [];
					var lineIndex = baseModel.getLineAtOffset(block.contentStart);
					var lineStart = baseModel.getLineStart(lineIndex);
					this._stylerAdapter.parse(baseModel.getText(lineStart, block.end), lineStart, block.contentStart - lineStart, block, substyles, true);
					for (var i = 0; i < substyles.length; i++) {
						if (substyles[i].style === "meta.annotation.task.todo" && start <= substyles[i].start && substyles[i].end <= end) {
							annotations.push(this._createAnnotation(
								mAnnotations.AnnotationType.ANNOTATION_TASK,
								substyles[i].start,
								substyles[i].end,
								baseModel.getText(substyles[i].start, substyles[i].end)));
						}
					}
				}

				block.getBlocks().forEach(function(current) {
					this._computeTasks(current, baseModel, annotations, start, end);
				}.bind(this));
			}
		},
		_createAnnotation: function(type, start, end, title) {
			var result = mAnnotations.AnnotationType.createAnnotation(type, start, end, title);
			result.source = this._TEXTSTYLER;
			return result;
		},
		_createFoldingAnnotation: function(viewModel, baseModel, start, end) {
			var startLine = baseModel.getLineAtOffset(start);
			var endLine = baseModel.getLineAtOffset(end);
			if (startLine === endLine) {
				return null;
			}
			if (startLine + 1 === endLine && baseModel.getLineStart(endLine) === baseModel.getLineEnd(endLine)) {
				return null;
			}
			return this._createAnnotation(mAnnotations.AnnotationType.ANNOTATION_FOLDING, start, end, viewModel);
		},
		_findBlock: function(parentBlock, offset) {
			var blocks = parentBlock.getBlocks();
			if (!blocks.length) {
				return parentBlock;
			}

			var index = binarySearch(blocks, offset, true);
			if (index < blocks.length && blocks[index].start <= offset && offset < blocks[index].end) {
				return this._findBlock(blocks[index], offset);
			}
			return parentBlock;
		},
		_findBrackets: function(model, bracketMatch, block, text, offset, end) {
			var result = [], styles = [];
			var start = offset, blocks = block.getBlocks();
			var startIndex = binarySearch(blocks, offset, true);
			for (var i = startIndex; i < blocks.length; i++) {
				if (blocks[i].start >= end) { break; }
				var blockStart = blocks[i].start;
				var blockEnd = blocks[i].end;
				if (start < blockStart) {
					var lineIndex = model.getLineAtOffset(start);
					var lineStart = model.getLineStart(lineIndex);
					this._stylerAdapter.parse(text.substring(lineStart - offset, blockStart - offset), lineStart, start - lineStart, block, styles);
					styles.forEach(function(current) {
						if (current.style) {
							if (current.style.indexOf(bracketMatch.beginName) === 0) {
								result.push(current.start + 1);
							} else if (current.style.indexOf(bracketMatch.endName) === 0) {
								result.push(-(current.start + 1));
							}
						}
					});
					styles = [];
				}
				start = blockEnd;
			}
			if (start < end) {
				lineIndex = model.getLineAtOffset(start);
				lineStart = model.getLineStart(lineIndex);
				this._stylerAdapter.parse(text.substring(lineStart - offset, end - offset), lineStart, start - lineStart, block, styles);
				styles.forEach(function(current) {
					if (current.style) {
						if (current.style.indexOf(bracketMatch.beginName) === 0) {
							result.push(current.start + 1);
						} else if (current.style.indexOf(bracketMatch.endName) === 0) {
							result.push(-(current.start + 1));
						}
					}
				});
			}
			return result;
		},
		_findMatchingBracket: function(model, block, offset) {
			var lineIndex = model.getLineAtOffset(offset);
			var lineEnd = model.getLineEnd(lineIndex);
			var text = model.getText(offset, lineEnd);

			var bracketMatch = this._stylerAdapter.getBracketMatch(block, text);
			if (!bracketMatch) { return -1; }

			var lineText = model.getLine(lineIndex);
			var lineStart = model.getLineStart(lineIndex);
			var brackets = this._findBrackets(model, bracketMatch, block, lineText, lineStart, lineEnd);
			for (var i = 0; i < brackets.length; i++) {
				var sign = brackets[i] >= 0 ? 1 : -1;
				if (brackets[i] * sign - 1 === offset) {
					var level = 1;
					if (!bracketMatch.atStart) {
						i--;
						for (; i>=0; i--) {
							sign = brackets[i] >= 0 ? 1 : -1;
							level += sign;
							if (level === 0) {
								return brackets[i] * sign - 1;
							}
						}
						lineIndex -= 1;
						while (lineIndex >= 0) {
							lineText = model.getLine(lineIndex);
							lineStart = model.getLineStart(lineIndex);
							lineEnd = model.getLineEnd(lineIndex);
							brackets = this._findBrackets(model, bracketMatch, block, lineText, lineStart, lineEnd);
							for (var j = brackets.length - 1; j >= 0; j--) {
								sign = brackets[j] >= 0 ? 1 : -1;
								level += sign;
								if (level === 0) {
									return brackets[j] * sign - 1;
								}
							}
							lineIndex--;
						}
					} else {
						i++;
						for (; i<brackets.length; i++) {
							sign = brackets[i] >= 0 ? 1 : -1;
							level += sign;
							if (level === 0) {
								return brackets[i] * sign - 1;
							}
						}
						lineIndex += 1;
						var lineCount = model.getLineCount();
						while (lineIndex < lineCount) {
							lineText = model.getLine(lineIndex);
							lineStart = model.getLineStart(lineIndex);
							lineEnd = model.getLineEnd(lineIndex);
							brackets = this._findBrackets(model, bracketMatch, block, lineText, lineStart, lineEnd);
							for (var k=0; k<brackets.length; k++) {
								sign = brackets[k] >= 0 ? 1 : -1;
								level += sign;
								if (level === 0) {
									return brackets[k] * sign - 1;
								}
							}
							lineIndex++;
						}
					}
					break;
				}
			}
			return -1;
		},
		_getLineStyle: function(lineIndex) {
			if (this._highlightCaretLine) {
				var view = this._view;
				var model = view.getModel();
				var selections = view.getSelections();
				var hasCaret = false;
				if (!selections.some(function(selection) {
					if (selection.start === selection.end) {
						hasCaret = hasCaret || model.getLineAtOffset(selection.start) === lineIndex;
						return false;
					}
					return true;
				}) && hasCaret) return this._caretLineStyle;
			}
			return null;
		},
		_getStyles: function(block, model, text, offset, startIndex) {
			var end = offset + text.length;

			var styles = [];
			var start = offset + startIndex, blocks = block.getBlocks();
			var startBlockIndex = binarySearch(blocks, start, true);
			for (var i = startBlockIndex; i < blocks.length; i++) {
				if (blocks[i].start >= end) { break; }
				var blockStart = blocks[i].start;
				var blockEnd = blocks[i].end;
				if (start < blockStart) {
					/* content on that line that preceeds the start of the block */
					var lineIndex = model.getLineAtOffset(start);
					var lineStart = model.getLineStart(lineIndex);
					this._stylerAdapter.parse(text.substring(lineStart - offset, blockStart - offset), lineStart, start - lineStart, block, styles);
				}
				var s = Math.max(start, blockStart);
				if (s === blockStart) {
					/* currently in the block's "start" segment */
					var startString = this._stylerAdapter.getBlockStartStyle(blocks[i], text.substring(s - offset), s, styles);
					if (startString) {
						s += startString.length;
					}
				}

				/*
				 * Compute the block end now in order to determine the end-bound of the contained content, but do not add
				 * its styles to the styles array until content styles have been computed, so that ordering is preserved.
				 */
				var e = Math.min(end, blockEnd);
				var endStyles = [];
				if (e === blockEnd) {
					/* currently in the block's "end" segment */
					var testString = text.substring(e - start - (blocks[i].end - blocks[i].contentEnd));
					var endString = this._stylerAdapter.getBlockEndStyle(blocks[i], testString, e, endStyles);
					if (endString) {
						e -= endString.length;
					}
				}

				lineIndex = model.getLineAtOffset(s);
				lineStart = model.getLineStart(lineIndex);
				var blockSubstyles = this._getStyles(blocks[i], model, text.substring(lineStart - offset, e - offset), lineStart, s - lineStart);
				var overrideStyles = [];
				this._stylerAdapter.getBlockOverrideStyles(blocks[i], text.substring(s - offset, e - offset), s, overrideStyles);
				if (overrideStyles.length) {
					Array.prototype.push.apply(blockSubstyles, overrideStyles); /* append overrideStyles into blockSubstyles */
					if (blockSubstyles.length !== overrideStyles.length) {
						/* substyles came from both sources, so they need to be sorted together */
						blockSubstyles.sort(function(a,b) {
							if (a.start < b.start) {
								return -1;
							}
							if (a.start > b.start) {
								return 1;
							}
							return 0;
						});
					}
				}

				var blockStyleName = this._stylerAdapter.getBlockContentStyleName(blocks[i]);
				if (blockStyleName) {
					/*
					 * If a name was specified for the current block then apply its style throughout its
					 * content wherever a style is not provided by a sub-element.
					 */
					var index = s;
					blockSubstyles.forEach(function(current) {
						if (current.start - index) {
							styles.push({start: index, end: current.start, style: blockStyleName});
						}
						if (current.mergeable) {
							current.style += "," + blockStyleName;
						}
						styles.push(current);
						index = current.end;
					});
					if (e - index) {
						styles.push({start: index, end: e, style: blockStyleName});
					}
				} else {
					styles = styles.concat(blockSubstyles);
				}
				styles = styles.concat(endStyles);
				start = blockEnd;
			}
			if (start < end) {
				/* content on that line that follows the end of the block */
				lineIndex = model.getLineAtOffset(start);
				lineStart = model.getLineStart(lineIndex);
				this._stylerAdapter.parse(text.substring(lineStart - offset, end - offset), lineStart, start - lineStart, block, styles);
			}

			return styles;
		},
		_isRenderingWhitespace: function() {
			return this._whitespacesVisible;
		},
		_onDestroy: function() {
			this.destroy();
		},
		_onLineStyle: function(e) {
			if (this._rootBlock) {
				if (e.textView === this._view) {
					e.style = this._getLineStyle(e.lineIndex);
				}
				var offset = e.lineStart;
				var model = e.textView.getModel();
				if (model.getBaseModel) {
					offset = model.mapOffset(offset);
					var baseModel = model.getBaseModel();
				}
				e.ranges = this._getStyles(this._rootBlock, baseModel || model, e.lineText, offset, 0);

				for (var i = e.ranges.length - 1; i >= 0; i--) {
					var current = e.ranges[i];
					if (current.style) {
						current.style = {styleClass: current.style.replace(/\./g, " ")};
						if (baseModel) {
							var length = current.end - current.start;
							current.start = model.mapOffset(current.start, true);
							current.end = current.start + length;
						}
					} else {
						e.ranges.splice(i, 1);
					}
				}
			} else {
				e.ranges = [];
			}

			if (this._isRenderingWhitespace()) {
				this._spliceStyles(this._spacePattern, e.ranges, e.lineText, e.lineStart);
				this._spliceStyles(this._tabPattern, e.ranges, e.lineText, e.lineStart);
			}
		},
		_onModelChanged: function(e) {
			var start = e.start;
			var removedCharCount = e.removedCharCount;
			var addedCharCount = e.addedCharCount;
			var changeCount = addedCharCount - removedCharCount;
			var viewModel = this._view.getModel();
			var baseModel = viewModel.getBaseModel ? viewModel.getBaseModel() : viewModel;
			var end = start + removedCharCount;
			var charCount = baseModel.getCharCount();

			/* compute the nearest ancestor block to the start and end indices */
			var lineStart = baseModel.getLineStart(baseModel.getLineAtOffset(start));
			var ancestorBlock = this._findBlock(this._rootBlock, start);

			var blockExtended, blocks, parentBlock, redraw, text, te, ts;
			do {
				parentBlock = ancestorBlock.parent;

				/*
				 * Determine whether ancestorBlock contains the full range of
				 * text whose styling may be affected by this model change.
				 */
				if (!blockExtended && parentBlock) {
					/* verify that ancestorBlock's start and end bounds are not affected by this change */
					if (changeCount < 0 && ancestorBlock.end - start <= -changeCount) {
						/* the end bound has definitely been affected, no verifyBlock() required, move up to the parent */
						ancestorBlock = parentBlock;
						continue;
					}
					text = baseModel.getText(ancestorBlock.start, Math.min(charCount, ancestorBlock.end + changeCount + 1));
					if (!this._stylerAdapter.verifyBlock(baseModel, text, ancestorBlock, changeCount)) {
						ancestorBlock = parentBlock;
						continue;
					}
				}

				/*
				 * The change has not directly changed ancestorBlock's start/end strings, now verify that its end
				 * bound is still valid (ie.- ensure that a new block is not extending beyond the end bound).
				 */

				blocks = ancestorBlock.getBlocks();
				var blockCount = blocks.length;
				var blockStart = binarySearch(blocks, lineStart, true);
				var blockEnd = binarySearch(blocks, end, false, blockStart - 1, blockCount);

				/*
				 * If the change immediately follows the preceding block then test whether
				 * the block should be extended.
				 */
				blockExtended = false;
				if (blockStart && blocks.length && blocks[blockStart - 1].end === start) {
					text = baseModel.getText(blocks[blockStart - 1].start, Math.min(charCount, start + 1));
					var tempBlocks = this.computeBlocks(baseModel, text, ancestorBlock, blocks[blockStart - 1].start, null, null, null);
					if (tempBlocks.length && tempBlocks[0].end !== blocks[blockStart - 1].end) {
						/* the change has affected the preceding block's end, so include this block */
						blockStart--;
						blockExtended = true;
					}
				}

				if (blockStart < blockCount && blocks[blockStart].start <= lineStart && (lineStart < blocks[blockStart].end || blockExtended)) {
					ts = blocks[blockStart].start;
					if (ts > start) { ts += changeCount; }
				} else if (blockStart === blockCount && blockCount > 0 && ancestorBlock.end - changeCount === blocks[blockCount - 1].end) {
					ts = blocks[--blockStart].start;
					if (ts > start) { ts += changeCount; }
				} else {
					ts = Math.max(lineStart, ancestorBlock.contentStart);
				}

				if (blockEnd < blockCount) {
					te = blocks[blockEnd].end;
				} else {
					te = ancestorBlock.contentEnd;
				}
				if (start <= te) { te += changeCount; }
				te = Math.min(te, charCount - 1);
				text = baseModel.getText(ts, te + 1);
				var newBlocks = this.computeBlocks(baseModel, text, ancestorBlock, ts, null, null, null);

				if (blockEnd < blockCount) {
					/* ensure that blockEnd's end is preserved */
					if (newBlocks.length && newBlocks[newBlocks.length - 1].end === te && newBlocks[newBlocks.length - 1].typeId === blocks[blockEnd].typeId) {
						break;
					}

					/*
					 * ancestorBlock's end match is no longer valid because it is being spanned by a block from
					 * within.  Attempt to find a subsequent sibling block with the same type, as its end match
					 * will serve as the end match for this spanning block as well.
					 */
					if (newBlocks.length && this._stylerAdapter.blockSpansBeyondEnd(newBlocks[newBlocks.length - 1])) {
						blockEnd++;
						var subBlocks = newBlocks[newBlocks.length - 1].getBlocks();
						var spanningTypeId = (subBlocks.length ? subBlocks[subBlocks.length - 1] : newBlocks[newBlocks.length - 1]).typeId;
						while (blockEnd < blockCount) {
							if (blocks[blockEnd].typeId === spanningTypeId) {
								/* found a potential end block, must verify it */
								var tempTe = blocks[blockEnd].end + changeCount;
								tempTe = Math.min(tempTe, charCount - 1);
								text = baseModel.getText(ts, tempTe + 1);
								var tempNewBlocks = this.computeBlocks(baseModel, text, ancestorBlock, ts, null, null, null);
								if (tempNewBlocks.length && tempNewBlocks[tempNewBlocks.length - 1].end === tempTe) {
									/* verified, can now stop looking */
									te = tempTe;
									newBlocks = tempNewBlocks;
									break;
								}
							}
							blockEnd++;
						}
						if (blockEnd < blockCount) {
							break;
						}
					}
				} else {
					/* ensure that ancestorBlock's end is preserved */
					if (!newBlocks.length || newBlocks[newBlocks.length - 1].end <= ancestorBlock.contentEnd + changeCount) {
						break;
					}
				}

				/*
				 * The end block's end bound is spanned by a block from within, so move up to the ancestor
				 * block, or extend end to the end of the content if already at the root-level block.
				 */

				if (!parentBlock) {
					te = charCount;
					blockEnd = blockCount;
					text = baseModel.getText(ts, te);
					newBlocks = this.computeBlocks(baseModel, text, ancestorBlock, ts, null, null, null);
					break;
				}

				ancestorBlock = parentBlock;
				redraw = true; /* blocks may not appear to be changed in the context of the parent block */
			} while (true);

			this._rootBlock.adjustBounds(start, changeCount);
			blockEnd = Math.min(blockEnd + 1, blockCount);

			var block;
			if (!redraw) {
				redraw = (blockEnd - blockStart) !== newBlocks.length;
			}
			if (!redraw) {
				for (var i = 0; i < newBlocks.length; i++) {
					block = blocks[blockStart + i];
					var newBlock = newBlocks[i];
					if (block.start !== newBlock.start || block.end !== newBlock.end || block.typeId !== newBlock.typeId) {
						redraw = true;
						break;
					}
				}
			}

			if (!blocks.length && !newBlocks.length) {
				var eventOldBlocks = [ancestorBlock];
				var eventNewBlocks = [ancestorBlock];
				this.dispatchEvent({
					type: "BlocksChanged", //$NON-NLS-0$
					oldBlocks: eventOldBlocks,
					newBlocks: eventNewBlocks
				});
				ancestorBlock = eventNewBlocks[0]; /* enables the markdown styler to return a modified ancestorBlock */
			} else {
				this.dispatchEvent({
					type: "BlocksChanged", //$NON-NLS-0$
					oldBlocks: blocks.slice(blockStart, blockEnd),
					newBlocks: newBlocks
				});
			}

			var args = [blockStart, blockEnd - blockStart].concat(newBlocks);
			Array.prototype.splice.apply(blocks, args);
			if (redraw) {
				var redrawStart = ts;
				var redrawEnd = te;
				if (viewModel !== baseModel) {
					redrawStart = viewModel.mapOffset(redrawStart, true);
					redrawEnd = viewModel.mapOffset(redrawEnd, true);
				}
				this._view.redrawRange(redrawStart, redrawEnd);
			}

			if (this._annotationModel) {
				var remove = [], add = [];
				var allFolding = [];
				var iter = this._annotationModel.getAnnotations(ts, te);
				var doFolding = this._foldingEnabled && baseModel !== viewModel;
				var parent = ancestorBlock.parent || ancestorBlock;
				while (iter.hasNext()) {
					var annotation = iter.next();
					if (doFolding && annotation.type === mAnnotations.AnnotationType.ANNOTATION_FOLDING) {
						allFolding.push(annotation);
						block = this._findBlock(parent, annotation.start);
						while (block) {
							var foldBounds = this._stylerAdapter.getBlockFoldBounds(block, baseModel);
							if (annotation.start === foldBounds.start && annotation.end === foldBounds.end) {
								break;
							}
							block = block.parent;
						}
						if (block && annotation.start === foldBounds.start && annotation.end === foldBounds.end) {
							var annotationStart = annotation.start;
							var annotationEnd = annotation.end;
							if (annotationStart > start) {
								annotationStart -= changeCount;
							}
							if (annotationEnd > start) {
								annotationEnd -= changeCount;
							}
							if (annotationStart <= start && start < annotationEnd && annotationStart <= end && end < annotationEnd) {
								var startLine = baseModel.getLineAtOffset(annotation.start);
								var endLine = baseModel.getLineAtOffset(annotation.end);
								if (startLine !== endLine) {
									if (!annotation.expanded) {
										annotation.expand();
									}
								} else {
									remove.push(annotation);
								}
							}
						} else {
							remove.push(annotation);
							annotation.expand();
						}
					} else if (annotation.type === mAnnotations.AnnotationType.ANNOTATION_TASK) {
						if (ancestorBlock.start <= annotation.start && annotation.end <= ancestorBlock.end) {
							remove.push(annotation);
						}
					}
				}
				if (doFolding) {
					parent.getBlocks().forEach(function(block) {
						this._updateFolding(block, baseModel, viewModel, allFolding, add, ts, te);
					}.bind(this));
				}
				if (this._detectTasks) {
					this._computeTasks(ancestorBlock, baseModel, add, ts, te);
				}
				this._annotationProviders.forEach(function(current) {
					var providerRemove = [];
					var providerAdd = [];
					current(this._annotationModel, baseModel, ancestorBlock, ts, te, providerRemove, providerAdd);
					remove = remove.concat(providerRemove);
					add = add.concat(providerAdd);
				}.bind(this));
				this._replaceAnnotations(remove, add);
			}
		},
		_onMouseDown: function(e) {
			if (e.clickCount !== 2) { return; }
			var model = this._view.getModel();
			var offset = this._view.getOffsetAtLocation(e.x, e.y);
			if (offset > 0) {
				var mapOffset = offset - 1;
				var baseModel = model;
				if (model.getBaseModel) {
					mapOffset = model.mapOffset(mapOffset);
					baseModel = model.getBaseModel();
				}
				var block = this._findBlock(this._rootBlock, mapOffset);
				var bracket = this._findMatchingBracket(baseModel, block, mapOffset);
				if (bracket !== -1) {
					e.preventDefault();
					var mapBracket = bracket;
					if (model.getBaseModel) {
						mapBracket = model.mapOffset(mapBracket, true);
					}
					if (offset > mapBracket) {
						offset--;
						mapBracket++;
					}
					this._view.setSelection(mapBracket, offset);
				}
			}
		},
		_onSelection: function(e) {
			var oldSelections = Array.isArray(e.oldValue) ? e.oldValue : [e.oldValue];
			var newSelections = Array.isArray(e.newValue) ? e.newValue : [e.newValue];
			var view = this._view;
			var model = view.getModel();
			var lineIndex;
			if (this._highlightCaretLine) {
				function getHighlightLines(selections) {
					var lines = {};
					if (selections.some(function(selection) {
						if (selection.isEmpty()) {
							lines[model.getLineAtOffset(selection.start).toString()] = true;
						} else {
							return true;
						}
						return false;
					})) return {};
					return lines;
				}
				var oldLines = getHighlightLines(oldSelections);
				var newLines = getHighlightLines(newSelections);
				function redraw(o, n) {
					for (var p in o) {
						if (!n[p]) {
							lineIndex = p >> 0;
							view.redrawLines(lineIndex, lineIndex + 1);
						}
					}
				}
				redraw(oldLines, newLines);
				redraw(newLines, oldLines);
			}
			if (!this._annotationModel) { return; }

			var remove = this._bracketAnnotations, add, caret;
			if (newSelections.length === 1 && newSelections[0].isEmpty() && (caret = newSelections[0].getCaret()) > 0) {
				var mapCaret = caret - 1;
				if (model.getBaseModel) {
					mapCaret = model.mapOffset(mapCaret);
					model = model.getBaseModel();
				}
				var block = this._findBlock(this._rootBlock, mapCaret);
				var bracket = this._findMatchingBracket(model, block, mapCaret);
				if (bracket !== -1) {
					add = [
						this._createAnnotation(mAnnotations.AnnotationType.ANNOTATION_MATCHING_BRACKET, bracket, bracket + 1),
						this._createAnnotation(mAnnotations.AnnotationType.ANNOTATION_CURRENT_BRACKET, mapCaret, mapCaret + 1)
					];
				}
			}
			this._bracketAnnotations = add;
			this._replaceAnnotations(remove, add);
		},
		_replaceAnnotations: function(remove, add) {
			var filteredRemove;
			if (remove) {
				filteredRemove = [];
				remove.forEach(function(current) {
					if (current.type !== mAnnotations.AnnotationType.ANNOTATION_FOLDING || current.source === this._TEXTSTYLER) {
						filteredRemove.push(current);
					}
				}.bind(this));
			}
			this._annotationModel.replaceAnnotations(filteredRemove, add);
		},
		_spliceStyles: function(whitespacePattern, ranges, text, offset) {
			var regex = whitespacePattern.regex;
			regex.lastIndex = 0;
			var rangeIndex = 0;
			var result = regex.exec(text);
			while (result) {
				var charIndex = offset + result.index;
				while (rangeIndex < ranges.length) {
					if (charIndex < ranges[rangeIndex].end) {
						break;
					}
					rangeIndex++;
				}
				var newStyle = {
					start: charIndex,
					end: charIndex + 1,
					style: copy(whitespacePattern.style)
				};
				if (rangeIndex < ranges.length && ranges[rangeIndex].start <= charIndex) {
					var endStyle = {start: charIndex + 1, end: ranges[rangeIndex].end, style: ranges[rangeIndex].style};
					ranges[rangeIndex].end = charIndex;
					ranges.splice(rangeIndex + 1, 0, endStyle);
					ranges.splice(rangeIndex + 1, 0, newStyle);
					rangeIndex += 2;
					newStyle.style.styleClass += " " + ranges[rangeIndex].style.styleClass; //$NON-NLS-0$
				} else {
					ranges.splice(rangeIndex, 0, newStyle);
					rangeIndex++;
				}
				result = regex.exec(text);
			}
		},
		_updateFolding: function(block, baseModel, viewModel, allFolding, _add, start, end) {
			start = start || block.start;
			end = end || block.end;
			var foldBounds = this._stylerAdapter.getBlockFoldBounds(block, baseModel);
			if (!block.doNotFold && foldBounds.start <= end && start <= foldBounds.end) {
				var index = binarySearch(allFolding, foldBounds.start, true);
				if (!(index < allFolding.length && allFolding[index].start === foldBounds.start && allFolding[index].end === foldBounds.end)) {
					var annotation = this._createFoldingAnnotation(viewModel, baseModel, foldBounds.start, foldBounds.end);
					if (annotation) {
						_add.push(annotation);
					}
				}
				block.getBlocks().forEach(function(current) {
					this._updateFolding(current, baseModel, viewModel, allFolding, _add, start, end);
				}.bind(this));
			}
		},
		_caretLineStyle: {styleClass: "meta annotation currentLine"}, //$NON-NLS-0$
		_spacePattern: {regex: /[ ]/g, style: {styleClass: "punctuation separator space", unmergeable: true}}, //$NON-NLS-0$
		_tabPattern: {regex: /\t/g, style: {styleClass: "punctuation separator tab", unmergeable: true}}, //$NON-NLS-0$
		_TEXTSTYLER: "textStyler"
	};

	mEventTarget.EventTarget.addMixin(TextStyler.prototype);

	return {
		TextStyler: TextStyler,
		Block: Block,
		createPatternBasedAdapter: createPatternBasedAdapter
	};
});

/*******************************************************************************
 * @license
 * Copyright (c) 2013, 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
 
/*eslint-env browser, amd*/
define('orion/editor/edit', [ //$NON-NLS-0$
	"require", //$NON-NLS-0$

	"orion/editor/textView", //$NON-NLS-0$
	"orion/editor/textModel", //$NON-NLS-0$
	"orion/editor/textTheme", //$NON-NLS-0$
	"orion/editor/projectionTextModel", //$NON-NLS-0$
	"orion/editor/editor", //$NON-NLS-0$
	"orion/editor/editorFeatures", //$NON-NLS-0$
	
	"orion/editor/contentAssist", //$NON-NLS-0$
	"orion/editor/textStyler" //$NON-NLS-0$

], function(require, mTextView, mTextModel, mTextTheme, mProjModel, mEditor, mEditorFeatures, mContentAssist, mTextStyler) {

	/**	@private */
	function getDisplay(window, document, element) {
		var display;
		var temp = element;
		while (temp && temp !== document && display !== "none") { //$NON-NLS-0$
			if (window.getComputedStyle) {
				var style = window.getComputedStyle(temp, null);
				display = style.getPropertyValue("display"); //$NON-NLS-0$
			} else {
				display = temp.currentStyle.display;
			}
			temp = temp.parentNode;
		}
		if (!temp || !display) {
			return "none"; //$NON-NLS-0$
		}
		return display;
	}

	/**	@private */
	function getTextFromElement(element) {
		var firstChild = element.firstChild;
		if (firstChild && firstChild.tagName === "TEXTAREA") { //$NON-NLS-0$
			return firstChild.value;
		}
		var document = element.ownerDocument;
		var window = document.defaultView || document.parentWindow;
		if (!window.getSelection ||
			(element.childNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE) ||
			getDisplay(window, document, element) === "none") //$NON-NLS-0$
		{
			return element.innerText || element.textContent;
		}
		var newRange = document.createRange();
		newRange.selectNode(element);
		var selection = window.getSelection();
		var oldRanges = [], i;
		for (i = 0; i < selection.rangeCount; i++) {
			oldRanges.push(selection.getRangeAt(i));
		}
		selection.removeAllRanges();
		selection.addRange(newRange);
		var text = selection.toString();
		selection.removeAllRanges();
		for (i = 0; i < oldRanges.length; i++) {
			selection.addRange(oldRanges[i]);
		}
		return text;
	}

	/**	@private */	
	function optionName(name) {
		var prefix = "data-editor-"; //$NON-NLS-0$
		if (name.substring(0, prefix.length) === prefix) {
			var key = name.substring(prefix.length);
			key = key.replace(/-([a-z])/ig, /* @callback */ function(all, character) {
				return character.toUpperCase();
			});
			return key;
		}
		return undefined;
	}
	
	/**	@private */
	function merge(obj1, obj2) {
		for (var p in obj2) {
			if (obj2.hasOwnProperty(p)) {
				obj1[p] = obj2[p];
			}
		}
	}
	
	/**	@private */
	function mergeOptions(parent, defaultOptions) {
		var options = {};
		merge(options, defaultOptions);
		for (var attr, j = 0, attrs = parent.attributes, l = attrs.length; j < l; j++) {
			attr = attrs.item(j);
			var key = optionName(attr.nodeName);
			if (key) {
				var value = attr.nodeValue;
				if (value === "true" || value === "false") { //$NON-NLS-1$ //$NON-NLS-0$
					value = value === "true"; //$NON-NLS-0$
				}
				options[key] = value;
			}
		}
		return options;
	}
	
	/**	@private */
	function getParents(document, className) {
		if (document.getElementsByClassName) {
			return document.getElementsByClassName(className);
		}
		className = className.replace(/ *$/, '');
		if (document.querySelectorAll) {
			return document.querySelectorAll((' ' + className).replace(/ +/g, '.')); //$NON-NLS-1$ //$NON-NLS-0$
		}
		return null;
	}
	
	/**	@private */
	function getHeight(node) {
		return node.clientHeight;
	}
	
	/**
	 * @class This object describes the options for <code>edit</code>.
	 * @name orion.editor.EditOptions
	 *
	 * @property {String|DOMElement} parent the parent element for the view, it can be either a DOM element or an ID for a DOM element.
	 * @property {Boolean} [readonly=false] whether or not the view is read-only.
	 * @property {Boolean} [fullSelection=true] whether or not the view is in full selection mode.
	 * @property {Boolean} [tabMode=true] whether or not the tab keypress is consumed by the view or is used for focus traversal.
	 * @property {Boolean} [expandTab=false] whether or not the tab key inserts white spaces.
	 * @property {String} [themeClass] the CSS class for the view theming.
	 * @property {Number} [tabSize=4] The number of spaces in a tab.
	 * @property {Boolean} [singleMode=false] whether or not the editor is in single line mode.
	 * @property {Boolean} [wrapMode=false] whether or not the view wraps lines.
	 * @property {Boolean} [wrapable=false] whether or not the view is wrappable.
	 * @property {Function} [statusReporter] a status reporter.
	 * @property {Function} [hoverFactory] a factory for hovers.
	 * @property {String} [title=""] the editor title.
	 * @property {String} [contents=""] the editor contents.
	 * @property {String} [lang] @deprecated use contentType instead
	 * @property {String} [contentType] the type of the content (eg.- application/javascript, text/html, etc.)
	 * @property {Function} [grammarProvider] a callback for providing grammars for a content type
	 * @property {Boolean} [showLinesRuler=true] whether or not the lines ruler is shown.
	 * @property {Boolean} [showAnnotationRuler=true] whether or not the annotation ruler is shown.
	 * @property {Boolean} [showOverviewRuler=true] whether or not the overview ruler is shown.
	 * @property {Boolean} [showFoldingRuler=true] whether or not the folding ruler is shown.
	 * @property {Boolean} [showZoomRuler=false] whether or not the zoom ruler is shown.
	 * @property {Boolean} [noFocus=false] whether or not to focus the editor on creation.
	 * @property {Number} [firstLineIndex=1] the line index displayed for the first line of text.
	 */
	/**
	 * Creates an editor instance configured with the given options.
	 * 
	 * @param {orion.editor.EditOptions} options the editor options.
	 */
	function edit(options) {
		var doc = options.document || document;
		var parent = options.parent;
		if (!parent) { parent = "editor"; } //$NON-NLS-0$
		if (typeof(parent) === "string") { //$NON-NLS-0$
			parent = doc.getElementById(parent);
		}
		if (!parent) {
			if (options.className) {
				var parents = getParents(doc, options.className);
				if (parents) {
					options.className = undefined;
					// Do not focus editors by default when creating multiple editors
					if (parents.length > 1 && options.noFocus === undefined) { options.noFocus = true; }
					var editors = [];
					for (var i = parents.length - 1; i >= 0; i--) {
						options.parent = parents[i];
						editors.push(edit(options));
					}
					return editors;
				}
			}
		}
		if (!parent) { throw new Error("no parent"); } //$NON-NLS-0$
		options = mergeOptions(parent, options);
	
		if (typeof options.theme === "string") { //$NON-NLS-0$
			var theme = mTextTheme.TextTheme.getTheme(options.theme);
			var index = options.theme.lastIndexOf("/"); //$NON-NLS-0$
			var themeClass = options.theme; 
			if (index !== -1) {
				themeClass = themeClass.substring(index + 1);
			}
			var extension = ".css"; //$NON-NLS-0$
			if (themeClass.substring(themeClass.length - extension.length) === extension) {
				themeClass = themeClass.substring(0, themeClass.length - extension.length);
			}
			theme.setThemeClass(themeClass, {href: options.theme});
			options.theme = theme;
		}
		var textViewFactory = function() {
			return new mTextView.TextView({
				parent: parent,
				model: new mProjModel.ProjectionTextModel(options.model ? options.model : new mTextModel.TextModel("")),
				tabSize: options.tabSize ? options.tabSize : 4,
				readonly: options.readonly,
				fullSelection: options.fullSelection,
				tabMode: options.tabMode,
				expandTab: options.expandTab,
				singleMode: options.singleMode,
				themeClass: options.themeClass,
				theme: options.theme,
				wrapMode: options.wrapMode,
				wrappable: options.wrappable
			});
		};

		var contentAssist, contentAssistFactory;
		if (!options.readonly) {
			contentAssistFactory = {
				createContentAssistMode: function(editor) {
					contentAssist = new mContentAssist.ContentAssist(editor.getTextView());
					var contentAssistWidget = new mContentAssist.ContentAssistWidget(contentAssist);
					var result = new mContentAssist.ContentAssistMode(contentAssist, contentAssistWidget);
					contentAssist.setMode(result);
					return result;
				}
			};
		}
	
		var syntaxHighlighter = {
			styler: null, 
			
			highlight: function(contentType, grammarProvider, editor) {
				if (this.styler && this.styler.destroy) {
					this.styler.destroy();
				}
				this.styler = null;

				/* to maintain backwards-compatibility convert previously-supported lang values to types */
				if (contentType === "js") { //$NON-NLS-0$
					contentType = "application/javascript"; //$NON-NLS-0$
				} else if (contentType === "css") { //$NON-NLS-0$
					contentType = "text/css"; //$NON-NLS-0$
				} else if (contentType === "html") { //$NON-NLS-0$
					contentType = "text/html"; //$NON-NLS-0$
				} else if (contentType === "java") { //$NON-NLS-0$
					contentType = "text/x-java-source"; //$NON-NLS-0$
				}

				var textView = editor.getTextView();
				var annotationModel = editor.getAnnotationModel();
				var loadGrammar = function(contentType) {
					/* attempt to locate an included file containing the grammar for contentType */
					var folderName = contentType.replace(/[*|:/".<>?+]/g, '_');
					require(["./stylers/" + folderName + "/syntax"], //$NON-NLS-1$ //$NON-NLS-0$
						function(grammar) {
							var stylerAdapter = new mTextStyler.createPatternBasedAdapter(grammar.grammars, grammar.id, contentType);
							this.styler = new mTextStyler.TextStyler(textView, annotationModel, stylerAdapter);
						},
						/* @callback */ function(error) {
							/*
							 * A grammar file was not found for the specified contentType, so syntax styling will
							 * not be shown (the editor will still work fine otherwise).  requireJS has already
							 * written an error message to the console regarding the missing grammar file.
							 */
						}
					);
				};

				if (contentType) {
					if (grammarProvider && (typeof grammarProvider === "function")) { //$NON-NLS-0$
						grammarProvider(contentType).then(
							function(result) {
								if (result && result.grammars && result.id) {
									var stylerAdapter = new mTextStyler.createPatternBasedAdapter(result.grammars, result.id, contentType);
									this.styler = new mTextStyler.TextStyler(textView, annotationModel, stylerAdapter);
								}
							}.bind(this),
							/* @callback */ function(error) {
								loadGrammar(contentType); /* fall back to default grammar file lookup */
							}
						);
					} else {
						loadGrammar(contentType);
					}
				}
				if (contentType === "text/css") { //$NON-NLS-0$
					editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
				}
			}
		};

		var editor = new mEditor.Editor({
			textViewFactory: textViewFactory,
			undoStackFactory: new mEditorFeatures.UndoFactory(),
			annotationFactory: new mEditorFeatures.AnnotationFactory(),
			lineNumberRulerFactory: new mEditorFeatures.LineNumberRulerFactory(),
			foldingRulerFactory: new mEditorFeatures.FoldingRulerFactory(),
			textDNDFactory: new mEditorFeatures.TextDNDFactory(),
			contentAssistFactory: contentAssistFactory,
			keyBindingFactory: new mEditorFeatures.KeyBindingsFactory(), 
			statusReporter: options.statusReporter,
			hoverFactory: options.hoverFactory,
			domNode: parent
		});
		editor.addEventListener("TextViewInstalled", function() { //$NON-NLS-0$
			var ruler = editor.getLineNumberRuler();
			if (ruler && options.firstLineIndex !== undefined) {
				ruler.setFirstLine(options.firstLineIndex);
			}
			var sourceCodeActions = editor.getSourceCodeActions();
			if (sourceCodeActions) {
				sourceCodeActions.setAutoPairParentheses(options.autoPairParentheses);
				sourceCodeActions.setAutoPairBraces(options.autoPairBraces);
				sourceCodeActions.setAutoPairSquareBrackets(options.autoPairSquareBrackets);
				sourceCodeActions.setAutoPairAngleBrackets(options.autoPairAngleBrackets);
				sourceCodeActions.setAutoPairQuotations(options.autoPairQuotations);
				sourceCodeActions.setAutoCompleteComments(options.autoCompleteComments);
				sourceCodeActions.setSmartIndentation(options.smartIndentation);
			}
		});
		
		var contents = options.contents;
		if (contents === undefined) {
			contents = getTextFromElement(parent); 
		}
		if (!contents) { contents=""; }
		
		editor.installTextView();
		editor.setLineNumberRulerVisible(options.showLinesRuler === undefined || options.showLinesRuler);
		editor.setAnnotationRulerVisible(options.showAnnotationRuler === undefined || options.showFoldingRuler);
		editor.setOverviewRulerVisible(options.showOverviewRuler === undefined || options.showOverviewRuler);
		editor.setZoomRulerVisible(options.showZoomRuler === undefined || options.showZoomRuler);
		editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
		editor.setInput(options.title, null, contents, false, options.noFocus);
		
		syntaxHighlighter.highlight(options.contentType || options.lang, options.grammarProvider, editor);
		/*
		 * The minimum height of the editor is 50px. Do not compute size if the editor is not
		 * attached to the DOM or it is display=none.
		 */
		var window = doc.defaultView || doc.parentWindow;
		if (!options.noComputeSize && getDisplay(window, doc, parent) !== "none" && getHeight(parent) <= 50) { //$NON-NLS-0$
			var height = editor.getTextView().computeSize().height;
			parent.style.height = height + "px"; //$NON-NLS-0$
		}
		return editor;
	}

	var editorNS = window.orion ? window.orion.editor : undefined;
	if (editorNS) {
		for (var i = 0; i < arguments.length; i++) {
			merge(editorNS, arguments[i]);
		}
		editorNS.edit = edit;
	}

	return edit;
});



				return require('orion/editor/edit');
			}));
//# sourceMappingURL=built-editor.js.map