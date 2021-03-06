/*
	Rollup.js v0.56.5
	Wed, 07 Mar 2018 06:48:14 GMT - commit 451ac5f30ddf07b053d65489b7fa9ab00d6d859e


	https://github.com/rollup/rollup

	Released under the MIT License.
*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.rollup = {})));
}(this, (function (exports) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var DEBUG = false;
var map = new Map();
var timeStartHelper;
var timeEndHelper;
if (typeof process === 'undefined' || typeof process.hrtime === 'undefined') {
    timeStartHelper = function timeStartHelper() {
        return window.performance.now();
    };
    timeEndHelper = function timeEndHelper(previous) {
        return window.performance.now() - previous;
    };
}
else {
    timeStartHelper = function timeStartHelper() {
        return process.hrtime();
    };
    timeEndHelper = function timeEndHelper(previous) {
        var hrtime = process.hrtime(previous);
        return hrtime[0] * 1e3 + Math.floor(hrtime[1] / 1e6);
    };
}
function timeStart(label) {
    if (!map.has(label)) {
        map.set(label, {
            start: undefined,
            time: 0
        });
    }
    map.get(label).start = timeStartHelper();
}
function timeEnd(label) {
    if (map.has(label)) {
        var item = map.get(label);
        item.time += timeEndHelper(item.start);
    }
}
function flushTime(log) {
    if (log === void 0) { log = defaultLog; }
    map.forEach(function (value, key) {
        log(key, value.time);
    });
    map.clear();
}
/** @interal */
function defaultLog(label, time) {
    if (DEBUG) {
        console.info('%dms: %s', time, label);
    }
}

var absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
var relativePath = /^\.?\.\//;
function isAbsolute(path) {
    return absolutePath.test(path);
}
function isRelative(path) {
    return relativePath.test(path);
}
function normalize(path) {
    return path.replace(/\\/g, '/');
}
function basename(path) {
    return path.split(/(\/|\\)/).pop();
}
function dirname(path) {
    var match = /(\/|\\)[^/\\]*$/.exec(path);
    if (!match)
        return '.';
    var dir = path.slice(0, -match[0].length);
    // If `dir` is the empty string, we're at root.
    return dir ? dir : '/';
}
function extname(path) {
    var match = /\.[^.]+$/.exec(basename(path));
    if (!match)
        return '';
    return match[0];
}
function relative(from, to) {
    var fromParts = from.split(/[/\\]/).filter(Boolean);
    var toParts = to.split(/[/\\]/).filter(Boolean);
    while (fromParts[0] && toParts[0] && fromParts[0] === toParts[0]) {
        fromParts.shift();
        toParts.shift();
    }
    while (toParts[0] === '.' || toParts[0] === '..') {
        var toPart = toParts.shift();
        if (toPart === '..') {
            fromParts.pop();
        }
    }
    while (fromParts.pop()) {
        toParts.unshift('..');
    }
    return toParts.join('/');
}
function resolve() {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    var resolvedParts = paths.shift().split(/[/\\]/);
    paths.forEach(function (path) {
        if (isAbsolute(path)) {
            resolvedParts = path.split(/[/\\]/);
        }
        else {
            var parts = path.split(/[/\\]/);
            while (parts[0] === '.' || parts[0] === '..') {
                var part = parts.shift();
                if (part === '..') {
                    resolvedParts.pop();
                }
            }
            resolvedParts.push.apply(resolvedParts, parts);
        }
    });
    return resolvedParts.join('/'); // TODO windows...
}

var nope = function (method) { return "Cannot use fs." + method + " inside browser"; };
var lstatSync = nope('lstatSync');
var readdirSync = nope('readdirSync');
var readFileSync = nope('readFileSync');
var realpathSync = nope('realpathSync');
var writeFile = nope('writeFile');

var keys = Object.keys;
function blank() {
    return Object.create(null);
}
var BLANK = blank();
function forOwn(object, func) {
    Object.keys(object).forEach(function (key) { return func(object[key], key); });
}
function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    sources.forEach(function (source) {
        for (var key in source) {
            if (Object.hasOwnProperty.call(source, key))
                target[key] = source[key];
        }
    });
    return target;
}

function mapSequence(array, fn) {
    var results = [];
    var promise = Promise.resolve();
    function next(member, i) {
        return Promise.resolve(fn(member)).then(function (value) { return (results[i] = value); });
    }
    var _loop_1 = function (i) {
        promise = promise.then(function () { return next(array[i], i); });
    };
    for (var i = 0; i < array.length; i += 1) {
        _loop_1(i);
    }
    return promise.then(function () { return results; });
}
function runSequence(array) {
    return mapSequence(array, function (i) { return i; });
}

function error(props) {
    // use the same constructor as props (if it's an error object)
    // so that err.name is preserved etc
    // (Object.keys below does not update these values because they
    // are properties on the prototype chain)
    // basically if props is a SyntaxError it will not be overriden as a generic Error
    var constructor = props instanceof Error ? props.constructor : Error;
    var err = new constructor(props.message);
    Object.keys(props).forEach(function (key) {
        err[key] = props[key];
    });
    throw err;
}

// this looks ridiculous, but it prevents sourcemap tooling from mistaking
// this for an actual sourceMappingURL
var SOURCEMAPPING_URL = 'sourceMa';
SOURCEMAPPING_URL += 'ppingURL';
var SOURCEMAPPING_URL_RE = new RegExp("^#\\s+" + SOURCEMAPPING_URL + "=.+\\n?");

function ensureArray(thing) {
    if (Array.isArray(thing))
        return thing;
    if (thing == undefined)
        return [];
    return [thing];
}

function deprecateOptions(options, deprecateConfig) {
    var deprecations = [];
    if (deprecateConfig.input)
        deprecateInputOptions();
    if (deprecateConfig.output)
        deprecateOutputOptions();
    return deprecations;
    function deprecateInputOptions() {
        if (!options.input && options.entry)
            deprecate('entry', 'input', false);
        if (options.moduleName)
            deprecate('moduleName', 'output.name', true);
        if (options.name)
            deprecate('name', 'output.name', true);
        if (options.extend)
            deprecate('extend', 'output.extend', true);
        if (options.globals)
            deprecate('globals', 'output.globals', true);
        if (options.indent)
            deprecate('indent', 'output.indent', true);
        if (options.noConflict)
            deprecate('noConflict', 'output.noConflict', true);
        if (options.paths)
            deprecate('paths', 'output.paths', true);
        if (options.sourcemap)
            deprecate('sourcemap', 'output.sourcemap', true);
        if (options.sourceMap)
            deprecate('sourceMap', 'output.sourcemap', true);
        if (options.sourceMapFile)
            deprecate('sourceMapFile', 'output.sourcemapFile', true);
        if (options.useStrict)
            deprecate('useStrict', 'output.strict', true);
        if (options.strict)
            deprecate('strict', 'output.strict', true);
        if (options.format)
            deprecate('format', 'output.format', true);
        if (options.banner)
            deprecate('banner', 'output.banner', false);
        if (options.footer)
            deprecate('footer', 'output.footer', false);
        if (options.intro)
            deprecate('intro', 'output.intro', false);
        if (options.outro)
            deprecate('outro', 'output.outro', false);
        if (options.interop)
            deprecate('interop', 'output.interop', true);
        if (options.freeze)
            deprecate('freeze', 'output.freeze', true);
        if (options.exports)
            deprecate('exports', 'output.exports', true);
        if (options.targets) {
            deprecations.push({ old: 'targets', new: 'output' });
            // as targets is an array and we need to merge other output options
            // like sourcemap etc.
            options.output = options.targets.map(function (target) {
                return Object.assign({}, target, options.output);
            });
            delete options.targets;
            var deprecatedDest_1 = false;
            options.output.forEach(function (outputEntry) {
                if (outputEntry.dest) {
                    if (!deprecatedDest_1) {
                        deprecations.push({ old: 'targets.dest', new: 'output.file' });
                        deprecatedDest_1 = true;
                    }
                    outputEntry.file = outputEntry.dest;
                    delete outputEntry.dest;
                }
            });
        }
        else if (options.dest) {
            deprecations.push({ old: 'dest', new: 'output.file' });
            options.output = {
                file: options.dest,
                format: options.format
            };
            delete options.dest;
        }
        if (options.pureExternalModules) {
            deprecations.push({
                old: 'pureExternalModules',
                new: 'treeshake.pureExternalModules'
            });
            if (options.treeshake === undefined) {
                options.treeshake = {};
            }
            if (options.treeshake) {
                options.treeshake.pureExternalModules = options.pureExternalModules;
            }
            delete options.pureExternalModules;
        }
    }
    function deprecateOutputOptions() {
        if (options.output && options.output.moduleId) {
            options.output.amd = { id: options.moduleId };
            deprecations.push({ old: 'moduleId', new: 'amd' });
            delete options.output.moduleId;
        }
    }
    // a utility function to add deprecations for straightforward options
    function deprecate(oldOption, newOption, shouldDelete) {
        deprecations.push({ new: newOption, old: oldOption });
        if (newOption.indexOf('output') > -1) {
            options.output = options.output || {};
            options.output[newOption.replace(/output\./, '')] = options[oldOption];
        }
        else {
            options[newOption] = options[oldOption];
        }
        if (shouldDelete)
            delete options[oldOption];
    }
}

function normalizeObjectOptionValue(optionValue) {
    if (!optionValue) {
        return optionValue;
    }
    if (typeof optionValue !== 'object') {
        return {};
    }
    return optionValue;
}
var defaultOnWarn = function (warning) {
    if (typeof warning === 'string') {
        console.warn(warning); // eslint-disable-line no-console
    }
    else {
        console.warn(warning.message); // eslint-disable-line no-console
    }
};
function mergeOptions(_a) {
    var config = _a.config, _b = _a.command, command = _b === void 0 ? {} : _b, deprecateConfig = _a.deprecateConfig, _c = _a.defaultOnWarnHandler, defaultOnWarnHandler = _c === void 0 ? defaultOnWarn : _c;
    var deprecations = deprecate(config, command, deprecateConfig);
    var getOption = function (config) { return function (name) {
        return command[name] !== undefined ? command[name] : config[name];
    }; };
    var getInputOption = getOption(config);
    var getOutputOption = getOption(config.output || {});
    function getObjectOption(name) {
        var commandOption = normalizeObjectOptionValue(command[name]);
        var configOption = normalizeObjectOptionValue(config[name]);
        if (commandOption !== undefined) {
            return commandOption && configOption
                ? Object.assign({}, configOption, commandOption)
                : commandOption;
        }
        return configOption;
    }
    var onwarn = config.onwarn;
    var warn;
    if (onwarn) {
        warn = function (warning) { return onwarn(warning, defaultOnWarnHandler); };
    }
    else {
        warn = defaultOnWarnHandler;
    }
    var inputOptions = {
        input: getInputOption('input'),
        legacy: getInputOption('legacy'),
        treeshake: getObjectOption('treeshake'),
        acorn: config.acorn,
        acornInjectPlugins: config.acornInjectPlugins,
        context: config.context,
        moduleContext: config.moduleContext,
        plugins: config.plugins,
        onwarn: warn,
        watch: config.watch,
        cache: getInputOption('cache'),
        preferConst: getInputOption('preferConst'),
        experimentalDynamicImport: getInputOption('experimentalDynamicImport'),
        experimentalCodeSplitting: getInputOption('experimentalCodeSplitting'),
        preserveSymlinks: getInputOption('preserveSymlinks')
    };
    // legacy, to ensure e.g. commonjs plugin still works
    inputOptions.entry = inputOptions.input;
    var commandExternal = (command.external || '').split(',');
    var configExternal = config.external;
    if (command.globals) {
        var globals_1 = Object.create(null);
        command.globals.split(',').forEach(function (str) {
            var names = str.split(':');
            globals_1[names[0]] = names[1];
            // Add missing Module IDs to external.
            if (commandExternal.indexOf(names[0]) === -1) {
                commandExternal.push(names[0]);
            }
        });
        command.globals = globals_1;
    }
    if (typeof configExternal === 'function') {
        inputOptions.external = function (id) {
            var rest = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                rest[_i - 1] = arguments[_i];
            }
            return configExternal.apply(void 0, [id].concat(rest)) || commandExternal.indexOf(id) !== -1;
        };
    }
    else {
        inputOptions.external = (configExternal || []).concat(commandExternal);
    }
    if (command.silent) {
        inputOptions.onwarn = function () { };
    }
    var baseOutputOptions = {
        extend: getOutputOption('extend'),
        amd: Object.assign({}, config.amd, command.amd),
        banner: getOutputOption('banner'),
        footer: getOutputOption('footer'),
        intro: getOutputOption('intro'),
        format: getOutputOption('format'),
        outro: getOutputOption('outro'),
        sourcemap: getOutputOption('sourcemap'),
        sourcemapFile: getOutputOption('sourcemapFile'),
        name: getOutputOption('name'),
        globals: getOutputOption('globals'),
        interop: getOutputOption('interop'),
        legacy: getOutputOption('legacy'),
        freeze: getOutputOption('freeze'),
        indent: getOutputOption('indent'),
        strict: getOutputOption('strict'),
        noConflict: getOutputOption('noConflict'),
        paths: getOutputOption('paths'),
        exports: getOutputOption('exports'),
        file: getOutputOption('file'),
        dir: getOutputOption('dir')
    };
    var mergedOutputOptions;
    if (Array.isArray(config.output)) {
        mergedOutputOptions = config.output.map(function (output) {
            return Object.assign({}, output, command.output);
        });
    }
    else if (config.output && command.output) {
        mergedOutputOptions = [Object.assign({}, config.output, command.output)];
    }
    else {
        mergedOutputOptions =
            command.output || config.output
                ? ensureArray(command.output || config.output)
                : [
                    {
                        file: command.output ? command.output.file : null,
                        format: command.output ? command.output.format : null
                    }
                ];
    }
    var outputOptions = mergedOutputOptions.map(function (output) {
        return Object.assign({}, baseOutputOptions, output);
    });
    // check for errors
    var validKeys = Object.keys(inputOptions).concat(Object.keys(baseOutputOptions), [
        'pureExternalModules' // (backward compatibility) till everyone moves to treeshake.pureExternalModules
    ]);
    var outputOptionKeys = Array.isArray(config.output)
        ? config.output.reduce(function (keys, o) { return keys.concat(Object.keys(o)); }, [])
        : Object.keys(config.output || {});
    var errors = Object.keys(config || {}).concat(outputOptionKeys).filter(function (k) { return k !== 'output' && validKeys.indexOf(k) === -1; });
    return {
        inputOptions: inputOptions,
        outputOptions: outputOptions,
        deprecations: deprecations,
        optionError: errors.length
            ? "Unknown option found: " + errors.join(', ') + ". Allowed keys: " + validKeys.join(', ')
            : null
    };
}
function deprecate(config, command, deprecateConfig) {
    if (command === void 0) { command = {}; }
    if (deprecateConfig === void 0) { deprecateConfig = { input: true, output: true }; }
    var deprecations = [];
    // CLI
    if (command.id) {
        deprecations.push({
            old: '-u/--id',
            new: '--amd.id'
        });
        (command.amd || (command.amd = {})).id = command.id;
    }
    if (typeof command.output === 'string') {
        deprecations.push({
            old: '--output',
            new: '--output.file'
        });
        command.output = { file: command.output };
    }
    if (command.format) {
        deprecations.push({
            old: '--format',
            new: '--output.format'
        });
        (command.output || (command.output = {})).format = command.format;
    }
    // config file
    deprecations.push.apply(deprecations, deprecateOptions(config, deprecateConfig));
    return deprecations;
}

// Reserved word lists for various dialects of the language

var reservedWords = {
  3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
  5: "class enum extends super const export import",
  6: "enum",
  strict: "implements interface let package private protected public static yield",
  strictBind: "eval arguments"
};

// And the keywords

var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

var keywords = {
  5: ecma5AndLessKeywords,
  6: ecma5AndLessKeywords + " const class extends export import super"
};

var keywordRelationalOperator = /^in(stanceof)?$/;

// ## Character categories

// Big ugly regular expressions that match characters in the
// whitespace, identifier, and identifier-start categories. These
// are only applied when a character is found to actually have a
// code point above 128.
// Generated by `bin/generate-identifier-regex.js`.

var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u08a0-\u08b4\u08b6-\u08bd\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c88\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312e\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fea\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7ae\ua7b0-\ua7b7\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab65\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08d4-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1cf7-\u1cf9\u1dc0-\u1df9\u1dfb-\u1dff\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";

var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

nonASCIIidentifierStartChars = nonASCIIidentifierChars = null;

// These are a run-length and offset encoded representation of the
// >0xffff code points that are a valid part of identifiers. The
// offset starts at 0x10000, and each pair of numbers represents an
// offset to the next range, and then a size of the range. They were
// generated by bin/generate-identifier-regex.js

// eslint-disable-next-line comma-spacing
var astralIdentifierStartCodes = [0,11,2,25,2,18,2,1,2,14,3,13,35,122,70,52,268,28,4,48,48,31,14,29,6,37,11,29,3,35,5,7,2,4,43,157,19,35,5,35,5,39,9,51,157,310,10,21,11,7,153,5,3,0,2,43,2,1,4,0,3,22,11,22,10,30,66,18,2,1,11,21,11,25,71,55,7,1,65,0,16,3,2,2,2,26,45,28,4,28,36,7,2,27,28,53,11,21,11,18,14,17,111,72,56,50,14,50,785,52,76,44,33,24,27,35,42,34,4,0,13,47,15,3,22,0,2,0,36,17,2,24,85,6,2,0,2,3,2,14,2,9,8,46,39,7,3,1,3,21,2,6,2,1,2,4,4,0,19,0,13,4,159,52,19,3,54,47,21,1,2,0,185,46,42,3,37,47,21,0,60,42,86,25,391,63,32,0,257,0,11,39,8,0,22,0,12,39,3,3,55,56,264,8,2,36,18,0,50,29,113,6,2,1,2,37,22,0,698,921,103,110,18,195,2749,1070,4050,582,8634,568,8,30,114,29,19,47,17,3,32,20,6,18,881,68,12,0,67,12,65,1,31,6124,20,754,9486,286,82,395,2309,106,6,12,4,8,8,9,5991,84,2,70,2,1,3,0,3,1,3,3,2,11,2,0,2,6,2,64,2,3,3,7,2,6,2,27,2,3,2,4,2,0,4,6,2,339,3,24,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,30,2,24,2,7,4149,196,60,67,1213,3,2,26,2,1,2,0,3,0,2,9,2,3,2,0,2,0,7,0,5,0,2,0,2,0,2,2,2,1,2,0,3,0,2,0,2,0,2,0,2,0,2,1,2,0,3,3,2,6,2,3,2,3,2,0,2,9,2,16,6,2,2,4,2,16,4421,42710,42,4148,12,221,3,5761,15,7472,3104,541];

// eslint-disable-next-line comma-spacing
var astralIdentifierCodes = [509,0,227,0,150,4,294,9,1368,2,2,1,6,3,41,2,5,0,166,1,1306,2,54,14,32,9,16,3,46,10,54,9,7,2,37,13,2,9,52,0,13,2,49,13,10,2,4,9,83,11,7,0,161,11,6,9,7,3,57,0,2,6,3,1,3,2,10,0,11,1,3,6,4,4,193,17,10,9,87,19,13,9,214,6,3,8,28,1,83,16,16,9,82,12,9,9,84,14,5,9,423,9,280,9,41,6,2,3,9,0,10,10,47,15,406,7,2,7,17,9,57,21,2,13,123,5,4,0,2,1,2,6,2,0,9,9,19719,9,135,4,60,6,26,9,1016,45,17,3,19723,1,5319,4,4,5,9,7,3,6,31,3,149,2,1418,49,513,54,5,49,9,0,15,0,23,4,2,14,1361,6,2,16,3,6,2,1,2,4,2214,6,110,6,6,9,792487,239];

// This has a complexity linear to the value of the code. The
// assumption is that looking up astral identifier characters is
// rare.
function isInAstralSet(code, set) {
  var pos = 0x10000;
  for (var i = 0; i < set.length; i += 2) {
    pos += set[i];
    if (pos > code) { return false }
    pos += set[i + 1];
    if (pos >= code) { return true }
  }
}

// Test whether a given character code starts an identifier.

function isIdentifierStart(code, astral) {
  if (code < 65) { return code === 36 }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes)
}

// Test whether a given character is part of an identifier.

function isIdentifierChar(code, astral) {
  if (code < 48) { return code === 36 }
  if (code < 58) { return true }
  if (code < 65) { return false }
  if (code < 91) { return true }
  if (code < 97) { return code === 95 }
  if (code < 123) { return true }
  if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
  if (astral === false) { return false }
  return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
}

// ## Token types

// The assignment of fine-grained, information-carrying type objects
// allows the tokenizer to store the information it has about a
// token in a way that is very cheap for the parser to look up.

// All token type variables start with an underscore, to make them
// easy to recognize.

// The `beforeExpr` property is used to disambiguate between regular
// expressions and divisions. It is set on all token types that can
// be followed by an expression (thus, a slash after them would be a
// regular expression).
//
// The `startsExpr` property is used to check if the token ends a
// `yield` expression. It is set on all token types that either can
// directly start an expression (like a quotation mark) or can
// continue an expression (like the body of a string).
//
// `isLoop` marks a keyword as starting a loop, which is important
// to know when parsing a label, in order to allow or disallow
// continue jumps to that label.

var TokenType = function TokenType(label, conf) {
  if ( conf === void 0 ) conf = {};

  this.label = label;
  this.keyword = conf.keyword;
  this.beforeExpr = !!conf.beforeExpr;
  this.startsExpr = !!conf.startsExpr;
  this.isLoop = !!conf.isLoop;
  this.isAssign = !!conf.isAssign;
  this.prefix = !!conf.prefix;
  this.postfix = !!conf.postfix;
  this.binop = conf.binop || null;
  this.updateContext = null;
};

function binop(name, prec) {
  return new TokenType(name, {beforeExpr: true, binop: prec})
}
var beforeExpr = {beforeExpr: true};
var startsExpr = {startsExpr: true};

// Map keyword names to token types.

var keywords$1 = {};

// Succinct definitions of keyword token types
function kw(name, options) {
  if ( options === void 0 ) options = {};

  options.keyword = name;
  return keywords$1[name] = new TokenType(name, options)
}

var types = {
  num: new TokenType("num", startsExpr),
  regexp: new TokenType("regexp", startsExpr),
  string: new TokenType("string", startsExpr),
  name: new TokenType("name", startsExpr),
  eof: new TokenType("eof"),

  // Punctuation token types.
  bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
  bracketR: new TokenType("]"),
  braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
  braceR: new TokenType("}"),
  parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
  parenR: new TokenType(")"),
  comma: new TokenType(",", beforeExpr),
  semi: new TokenType(";", beforeExpr),
  colon: new TokenType(":", beforeExpr),
  dot: new TokenType("."),
  question: new TokenType("?", beforeExpr),
  arrow: new TokenType("=>", beforeExpr),
  template: new TokenType("template"),
  invalidTemplate: new TokenType("invalidTemplate"),
  ellipsis: new TokenType("...", beforeExpr),
  backQuote: new TokenType("`", startsExpr),
  dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator.
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
  assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
  incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
  prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
  logicalOR: binop("||", 1),
  logicalAND: binop("&&", 2),
  bitwiseOR: binop("|", 3),
  bitwiseXOR: binop("^", 4),
  bitwiseAND: binop("&", 5),
  equality: binop("==/!=/===/!==", 6),
  relational: binop("</>/<=/>=", 7),
  bitShift: binop("<</>>/>>>", 8),
  plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
  modulo: binop("%", 10),
  star: binop("*", 10),
  slash: binop("/", 10),
  starstar: new TokenType("**", {beforeExpr: true}),

  // Keyword token types.
  _break: kw("break"),
  _case: kw("case", beforeExpr),
  _catch: kw("catch"),
  _continue: kw("continue"),
  _debugger: kw("debugger"),
  _default: kw("default", beforeExpr),
  _do: kw("do", {isLoop: true, beforeExpr: true}),
  _else: kw("else", beforeExpr),
  _finally: kw("finally"),
  _for: kw("for", {isLoop: true}),
  _function: kw("function", startsExpr),
  _if: kw("if"),
  _return: kw("return", beforeExpr),
  _switch: kw("switch"),
  _throw: kw("throw", beforeExpr),
  _try: kw("try"),
  _var: kw("var"),
  _const: kw("const"),
  _while: kw("while", {isLoop: true}),
  _with: kw("with"),
  _new: kw("new", {beforeExpr: true, startsExpr: true}),
  _this: kw("this", startsExpr),
  _super: kw("super", startsExpr),
  _class: kw("class", startsExpr),
  _extends: kw("extends", beforeExpr),
  _export: kw("export"),
  _import: kw("import"),
  _null: kw("null", startsExpr),
  _true: kw("true", startsExpr),
  _false: kw("false", startsExpr),
  _in: kw("in", {beforeExpr: true, binop: 7}),
  _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
  _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
  _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
  _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
};

// Matches a whole line break (where CRLF is considered a single
// line break). Used to count lines.

var lineBreak = /\r\n?|\n|\u2028|\u2029/;
var lineBreakG = new RegExp(lineBreak.source, "g");

function isNewLine(code) {
  return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
}

var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

var ref = Object.prototype;
var hasOwnProperty = ref.hasOwnProperty;
var toString = ref.toString;

// Checks if an object has a property.

function has(obj, propName) {
  return hasOwnProperty.call(obj, propName)
}

var isArray = Array.isArray || (function (obj) { return (
  toString.call(obj) === "[object Array]"
); });

// These are used when `options.locations` is on, for the
// `startLoc` and `endLoc` properties.

var Position = function Position(line, col) {
  this.line = line;
  this.column = col;
};

Position.prototype.offset = function offset (n) {
  return new Position(this.line, this.column + n)
};

var SourceLocation = function SourceLocation(p, start, end) {
  this.start = start;
  this.end = end;
  if (p.sourceFile !== null) { this.source = p.sourceFile; }
};

// The `getLineInfo` function is mostly useful when the
// `locations` option is off (for performance reasons) and you
// want to find the line/column position for a given character
// offset. `input` should be the code string that the offset refers
// into.

function getLineInfo(input, offset) {
  for (var line = 1, cur = 0;;) {
    lineBreakG.lastIndex = cur;
    var match = lineBreakG.exec(input);
    if (match && match.index < offset) {
      ++line;
      cur = match.index + match[0].length;
    } else {
      return new Position(line, offset - cur)
    }
  }
}

// A second optional argument can be given to further configure
// the parser process. These options are recognized:

var defaultOptions = {
  // `ecmaVersion` indicates the ECMAScript version to parse. Must
  // be either 3, 5, 6 (2015), 7 (2016), or 8 (2017). This influences support
  // for strict mode, the set of reserved words, and support for
  // new syntax features. The default is 7.
  ecmaVersion: 7,
  // `sourceType` indicates the mode the code should be parsed in.
  // Can be either `"script"` or `"module"`. This influences global
  // strict mode and parsing of `import` and `export` declarations.
  sourceType: "script",
  // `onInsertedSemicolon` can be a callback that will be called
  // when a semicolon is automatically inserted. It will be passed
  // th position of the comma as an offset, and if `locations` is
  // enabled, it is given the location as a `{line, column}` object
  // as second argument.
  onInsertedSemicolon: null,
  // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
  // trailing commas.
  onTrailingComma: null,
  // By default, reserved words are only enforced if ecmaVersion >= 5.
  // Set `allowReserved` to a boolean value to explicitly turn this on
  // an off. When this option has the value "never", reserved words
  // and keywords can also not be used as property names.
  allowReserved: null,
  // When enabled, a return at the top level is not considered an
  // error.
  allowReturnOutsideFunction: false,
  // When enabled, import/export statements are not constrained to
  // appearing at the top of the program.
  allowImportExportEverywhere: false,
  // When enabled, hashbang directive in the beginning of file
  // is allowed and treated as a line comment.
  allowHashBang: false,
  // When `locations` is on, `loc` properties holding objects with
  // `start` and `end` properties in `{line, column}` form (with
  // line being 1-based and column 0-based) will be attached to the
  // nodes.
  locations: false,
  // A function can be passed as `onToken` option, which will
  // cause Acorn to call that function with object in the same
  // format as tokens returned from `tokenizer().getToken()`. Note
  // that you are not allowed to call the parser from the
  // callback—that will corrupt its internal state.
  onToken: null,
  // A function can be passed as `onComment` option, which will
  // cause Acorn to call that function with `(block, text, start,
  // end)` parameters whenever a comment is skipped. `block` is a
  // boolean indicating whether this is a block (`/* */`) comment,
  // `text` is the content of the comment, and `start` and `end` are
  // character offsets that denote the start and end of the comment.
  // When the `locations` option is on, two more parameters are
  // passed, the full `{line, column}` locations of the start and
  // end of the comments. Note that you are not allowed to call the
  // parser from the callback—that will corrupt its internal state.
  onComment: null,
  // Nodes have their start and end characters offsets recorded in
  // `start` and `end` properties (directly on the node, rather than
  // the `loc` object, which holds line/column data. To also add a
  // [semi-standardized][range] `range` property holding a `[start,
  // end]` array with the same numbers, set the `ranges` option to
  // `true`.
  //
  // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
  ranges: false,
  // It is possible to parse multiple files into a single AST by
  // passing the tree produced by parsing the first file as
  // `program` option in subsequent parses. This will add the
  // toplevel forms of the parsed file to the `Program` (top) node
  // of an existing parse tree.
  program: null,
  // When `locations` is on, you can pass this to record the source
  // file in every node's `loc` object.
  sourceFile: null,
  // This value, if given, is stored in every node, whether
  // `locations` is on or off.
  directSourceFile: null,
  // When enabled, parenthesized expressions are represented by
  // (non-standard) ParenthesizedExpression nodes
  preserveParens: false,
  plugins: {}
};

// Interpret and default an options object

function getOptions(opts) {
  var options = {};

  for (var opt in defaultOptions)
    { options[opt] = opts && has(opts, opt) ? opts[opt] : defaultOptions[opt]; }

  if (options.ecmaVersion >= 2015)
    { options.ecmaVersion -= 2009; }

  if (options.allowReserved == null)
    { options.allowReserved = options.ecmaVersion < 5; }

  if (isArray(options.onToken)) {
    var tokens = options.onToken;
    options.onToken = function (token) { return tokens.push(token); };
  }
  if (isArray(options.onComment))
    { options.onComment = pushComment(options, options.onComment); }

  return options
}

function pushComment(options, array) {
  return function(block, text, start, end, startLoc, endLoc) {
    var comment = {
      type: block ? "Block" : "Line",
      value: text,
      start: start,
      end: end
    };
    if (options.locations)
      { comment.loc = new SourceLocation(this, startLoc, endLoc); }
    if (options.ranges)
      { comment.range = [start, end]; }
    array.push(comment);
  }
}

// Registered plugins
var plugins = {};

function keywordRegexp(words) {
  return new RegExp("^(?:" + words.replace(/ /g, "|") + ")$")
}

var Parser = function Parser(options, input, startPos) {
  this.options = options = getOptions(options);
  this.sourceFile = options.sourceFile;
  this.keywords = keywordRegexp(keywords[options.ecmaVersion >= 6 ? 6 : 5]);
  var reserved = "";
  if (!options.allowReserved) {
    for (var v = options.ecmaVersion;; v--)
      { if (reserved = reservedWords[v]) { break } }
    if (options.sourceType == "module") { reserved += " await"; }
  }
  this.reservedWords = keywordRegexp(reserved);
  var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
  this.reservedWordsStrict = keywordRegexp(reservedStrict);
  this.reservedWordsStrictBind = keywordRegexp(reservedStrict + " " + reservedWords.strictBind);
  this.input = String(input);

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.
  this.containsEsc = false;

  // Load plugins
  this.loadPlugins(options.plugins);

  // Set up token state

  // The current position of the tokenizer in the input.
  if (startPos) {
    this.pos = startPos;
    this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
    this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
  } else {
    this.pos = this.lineStart = 0;
    this.curLine = 1;
  }

  // Properties of the current token:
  // Its type
  this.type = types.eof;
  // For tokens that include more information than their type, the value
  this.value = null;
  // Its start and end offset
  this.start = this.end = this.pos;
  // And, if locations are used, the {line, column} object
  // corresponding to those offsets
  this.startLoc = this.endLoc = this.curPosition();

  // Position information for the previous token
  this.lastTokEndLoc = this.lastTokStartLoc = null;
  this.lastTokStart = this.lastTokEnd = this.pos;

  // The context stack is used to superficially track syntactic
  // context to predict whether a regular expression is allowed in a
  // given position.
  this.context = this.initialContext();
  this.exprAllowed = true;

  // Figure out if it's a module code.
  this.inModule = options.sourceType === "module";
  this.strict = this.inModule || this.strictDirective(this.pos);

  // Used to signify the start of a potential arrow function
  this.potentialArrowAt = -1;

  // Flags to track whether we are in a function, a generator, an async function.
  this.inFunction = this.inGenerator = this.inAsync = false;
  // Positions to delayed-check that yield/await does not exist in default parameters.
  this.yieldPos = this.awaitPos = 0;
  // Labels in scope.
  this.labels = [];

  // If enabled, skip leading hashbang line.
  if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
    { this.skipLineComment(2); }

  // Scope tracking for duplicate variable names (see scope.js)
  this.scopeStack = [];
  this.enterFunctionScope();

  // For RegExp validation
  this.regexpState = null;
};

// DEPRECATED Kept for backwards compatibility until 3.0 in case a plugin uses them
Parser.prototype.isKeyword = function isKeyword (word) { return this.keywords.test(word) };
Parser.prototype.isReservedWord = function isReservedWord (word) { return this.reservedWords.test(word) };

Parser.prototype.extend = function extend (name, f) {
  this[name] = f(this[name]);
};

Parser.prototype.loadPlugins = function loadPlugins (pluginConfigs) {
    var this$1 = this;

  for (var name in pluginConfigs) {
    var plugin = plugins[name];
    if (!plugin) { throw new Error("Plugin '" + name + "' not found") }
    plugin(this$1, pluginConfigs[name]);
  }
};

Parser.prototype.parse = function parse () {
  var node = this.options.program || this.startNode();
  this.nextToken();
  return this.parseTopLevel(node)
};

var pp = Parser.prototype;

// ## Parser utilities

var literal = /^(?:'((?:\\.|[^'])*?)'|"((?:\\.|[^"])*?)"|;)/;
pp.strictDirective = function(start) {
  var this$1 = this;

  for (;;) {
    skipWhiteSpace.lastIndex = start;
    start += skipWhiteSpace.exec(this$1.input)[0].length;
    var match = literal.exec(this$1.input.slice(start));
    if (!match) { return false }
    if ((match[1] || match[2]) == "use strict") { return true }
    start += match[0].length;
  }
};

// Predicate that tests whether the next token is of the given
// type, and if yes, consumes it as a side effect.

pp.eat = function(type) {
  if (this.type === type) {
    this.next();
    return true
  } else {
    return false
  }
};

// Tests whether parsed token is a contextual keyword.

pp.isContextual = function(name) {
  return this.type === types.name && this.value === name && !this.containsEsc
};

// Consumes contextual keyword if possible.

pp.eatContextual = function(name) {
  if (!this.isContextual(name)) { return false }
  this.next();
  return true
};

// Asserts that following token is given contextual keyword.

pp.expectContextual = function(name) {
  if (!this.eatContextual(name)) { this.unexpected(); }
};

// Test whether a semicolon can be inserted at the current position.

pp.canInsertSemicolon = function() {
  return this.type === types.eof ||
    this.type === types.braceR ||
    lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

pp.insertSemicolon = function() {
  if (this.canInsertSemicolon()) {
    if (this.options.onInsertedSemicolon)
      { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
    return true
  }
};

// Consume a semicolon, or, failing that, see if we are allowed to
// pretend that there is a semicolon at this position.

pp.semicolon = function() {
  if (!this.eat(types.semi) && !this.insertSemicolon()) { this.unexpected(); }
};

pp.afterTrailingComma = function(tokType, notNext) {
  if (this.type == tokType) {
    if (this.options.onTrailingComma)
      { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
    if (!notNext)
      { this.next(); }
    return true
  }
};

// Expect a token of a given type. If found, consume it, otherwise,
// raise an unexpected token error.

pp.expect = function(type) {
  this.eat(type) || this.unexpected();
};

// Raise an unexpected token error.

pp.unexpected = function(pos) {
  this.raise(pos != null ? pos : this.start, "Unexpected token");
};

function DestructuringErrors() {
  this.shorthandAssign =
  this.trailingComma =
  this.parenthesizedAssign =
  this.parenthesizedBind =
  this.doubleProto =
    -1;
}

pp.checkPatternErrors = function(refDestructuringErrors, isAssign) {
  if (!refDestructuringErrors) { return }
  if (refDestructuringErrors.trailingComma > -1)
    { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
  var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
  if (parens > -1) { this.raiseRecoverable(parens, "Parenthesized pattern"); }
};

pp.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
  if (!refDestructuringErrors) { return false }
  var shorthandAssign = refDestructuringErrors.shorthandAssign;
  var doubleProto = refDestructuringErrors.doubleProto;
  if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
  if (shorthandAssign >= 0)
    { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
  if (doubleProto >= 0)
    { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
};

pp.checkYieldAwaitInDefaultParams = function() {
  if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
    { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
  if (this.awaitPos)
    { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
};

pp.isSimpleAssignTarget = function(expr) {
  if (expr.type === "ParenthesizedExpression")
    { return this.isSimpleAssignTarget(expr.expression) }
  return expr.type === "Identifier" || expr.type === "MemberExpression"
};

var pp$1 = Parser.prototype;

// ### Statement parsing

// Parse a program. Initializes the parser, reads any number of
// statements, and wraps them in a Program node.  Optionally takes a
// `program` argument.  If present, the statements will be appended
// to its body instead of creating a new node.

pp$1.parseTopLevel = function(node) {
  var this$1 = this;

  var exports = {};
  if (!node.body) { node.body = []; }
  while (this.type !== types.eof) {
    var stmt = this$1.parseStatement(true, true, exports);
    node.body.push(stmt);
  }
  this.adaptDirectivePrologue(node.body);
  this.next();
  if (this.options.ecmaVersion >= 6) {
    node.sourceType = this.options.sourceType;
  }
  return this.finishNode(node, "Program")
};

var loopLabel = {kind: "loop"};
var switchLabel = {kind: "switch"};

pp$1.isLet = function() {
  if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
  if (nextCh === 91 || nextCh == 123) { return true } // '{' and '['
  if (isIdentifierStart(nextCh, true)) {
    var pos = next + 1;
    while (isIdentifierChar(this.input.charCodeAt(pos), true)) { ++pos; }
    var ident = this.input.slice(next, pos);
    if (!keywordRelationalOperator.test(ident)) { return true }
  }
  return false
};

// check 'async [no LineTerminator here] function'
// - 'async /*foo*/ function' is OK.
// - 'async /*\n*/ function' is invalid.
pp$1.isAsyncFunction = function() {
  if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
    { return false }

  skipWhiteSpace.lastIndex = this.pos;
  var skip = skipWhiteSpace.exec(this.input);
  var next = this.pos + skip[0].length;
  return !lineBreak.test(this.input.slice(this.pos, next)) &&
    this.input.slice(next, next + 8) === "function" &&
    (next + 8 == this.input.length || !isIdentifierChar(this.input.charAt(next + 8)))
};

// Parse a single statement.
//
// If expecting a statement and finding a slash operator, parse a
// regular expression literal. This is to handle cases like
// `if (foo) /blah/.exec(foo)`, where looking at the previous token
// does not help.

pp$1.parseStatement = function(declaration, topLevel, exports) {
  var starttype = this.type, node = this.startNode(), kind;

  if (this.isLet()) {
    starttype = types._var;
    kind = "let";
  }

  // Most types of statements are recognized by the keyword they
  // start with. Many are trivial to parse, some require a bit of
  // complexity.

  switch (starttype) {
  case types._break: case types._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
  case types._debugger: return this.parseDebuggerStatement(node)
  case types._do: return this.parseDoStatement(node)
  case types._for: return this.parseForStatement(node)
  case types._function:
    if (!declaration && this.options.ecmaVersion >= 6) { this.unexpected(); }
    return this.parseFunctionStatement(node, false)
  case types._class:
    if (!declaration) { this.unexpected(); }
    return this.parseClass(node, true)
  case types._if: return this.parseIfStatement(node)
  case types._return: return this.parseReturnStatement(node)
  case types._switch: return this.parseSwitchStatement(node)
  case types._throw: return this.parseThrowStatement(node)
  case types._try: return this.parseTryStatement(node)
  case types._const: case types._var:
    kind = kind || this.value;
    if (!declaration && kind != "var") { this.unexpected(); }
    return this.parseVarStatement(node, kind)
  case types._while: return this.parseWhileStatement(node)
  case types._with: return this.parseWithStatement(node)
  case types.braceL: return this.parseBlock()
  case types.semi: return this.parseEmptyStatement(node)
  case types._export:
  case types._import:
    if (!this.options.allowImportExportEverywhere) {
      if (!topLevel)
        { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
      if (!this.inModule)
        { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
    }
    return starttype === types._import ? this.parseImport(node) : this.parseExport(node, exports)

    // If the statement does not start with a statement keyword or a
    // brace, it's an ExpressionStatement or LabeledStatement. We
    // simply start parsing an expression, and afterwards, if the
    // next token is a colon and the expression was a simple
    // Identifier node, we switch to interpreting it as a label.
  default:
    if (this.isAsyncFunction()) {
      if (!declaration) { this.unexpected(); }
      this.next();
      return this.parseFunctionStatement(node, true)
    }

    var maybeName = this.value, expr = this.parseExpression();
    if (starttype === types.name && expr.type === "Identifier" && this.eat(types.colon))
      { return this.parseLabeledStatement(node, maybeName, expr) }
    else { return this.parseExpressionStatement(node, expr) }
  }
};

pp$1.parseBreakContinueStatement = function(node, keyword) {
  var this$1 = this;

  var isBreak = keyword == "break";
  this.next();
  if (this.eat(types.semi) || this.insertSemicolon()) { node.label = null; }
  else if (this.type !== types.name) { this.unexpected(); }
  else {
    node.label = this.parseIdent();
    this.semicolon();
  }

  // Verify that there is an actual destination to break or
  // continue to.
  var i = 0;
  for (; i < this.labels.length; ++i) {
    var lab = this$1.labels[i];
    if (node.label == null || lab.name === node.label.name) {
      if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
      if (node.label && isBreak) { break }
    }
  }
  if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
  return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
};

pp$1.parseDebuggerStatement = function(node) {
  this.next();
  this.semicolon();
  return this.finishNode(node, "DebuggerStatement")
};

pp$1.parseDoStatement = function(node) {
  this.next();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  this.expect(types._while);
  node.test = this.parseParenExpression();
  if (this.options.ecmaVersion >= 6)
    { this.eat(types.semi); }
  else
    { this.semicolon(); }
  return this.finishNode(node, "DoWhileStatement")
};

// Disambiguating between a `for` and a `for`/`in` or `for`/`of`
// loop is non-trivial. Basically, we have to parse the init `var`
// statement or expression, disallowing the `in` operator (see
// the second parameter to `parseExpression`), and then check
// whether the next token is `in` or `of`. When there is no init
// part (semicolon immediately after the opening parenthesis), it
// is a regular `for` loop.

pp$1.parseForStatement = function(node) {
  this.next();
  var awaitAt = (this.options.ecmaVersion >= 9 && this.inAsync && this.eatContextual("await")) ? this.lastTokStart : -1;
  this.labels.push(loopLabel);
  this.enterLexicalScope();
  this.expect(types.parenL);
  if (this.type === types.semi) {
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, null)
  }
  var isLet = this.isLet();
  if (this.type === types._var || this.type === types._const || isLet) {
    var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
    this.next();
    this.parseVar(init$1, true, kind);
    this.finishNode(init$1, "VariableDeclaration");
    if ((this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init$1.declarations.length === 1 &&
        !(kind !== "var" && init$1.declarations[0].init)) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types._in) {
          if (awaitAt > -1) { this.unexpected(awaitAt); }
        } else { node.await = awaitAt > -1; }
      }
      return this.parseForIn(node, init$1)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init$1)
  }
  var refDestructuringErrors = new DestructuringErrors;
  var init = this.parseExpression(true, refDestructuringErrors);
  if (this.type === types._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
    if (this.options.ecmaVersion >= 9) {
      if (this.type === types._in) {
        if (awaitAt > -1) { this.unexpected(awaitAt); }
      } else { node.await = awaitAt > -1; }
    }
    this.toAssignable(init, false, refDestructuringErrors);
    this.checkLVal(init);
    return this.parseForIn(node, init)
  } else {
    this.checkExpressionErrors(refDestructuringErrors, true);
  }
  if (awaitAt > -1) { this.unexpected(awaitAt); }
  return this.parseFor(node, init)
};

pp$1.parseFunctionStatement = function(node, isAsync) {
  this.next();
  return this.parseFunction(node, true, false, isAsync)
};

pp$1.parseIfStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  // allow function declarations in branches, but only in non-strict mode
  node.consequent = this.parseStatement(!this.strict && this.type == types._function);
  node.alternate = this.eat(types._else) ? this.parseStatement(!this.strict && this.type == types._function) : null;
  return this.finishNode(node, "IfStatement")
};

pp$1.parseReturnStatement = function(node) {
  if (!this.inFunction && !this.options.allowReturnOutsideFunction)
    { this.raise(this.start, "'return' outside of function"); }
  this.next();

  // In `return` (and `break`/`continue`), the keywords with
  // optional arguments, we eagerly look for a semicolon or the
  // possibility to insert one.

  if (this.eat(types.semi) || this.insertSemicolon()) { node.argument = null; }
  else { node.argument = this.parseExpression(); this.semicolon(); }
  return this.finishNode(node, "ReturnStatement")
};

pp$1.parseSwitchStatement = function(node) {
  var this$1 = this;

  this.next();
  node.discriminant = this.parseParenExpression();
  node.cases = [];
  this.expect(types.braceL);
  this.labels.push(switchLabel);
  this.enterLexicalScope();

  // Statements under must be grouped (by label) in SwitchCase
  // nodes. `cur` is used to keep the node that we are currently
  // adding statements to.

  var cur;
  for (var sawDefault = false; this.type != types.braceR;) {
    if (this$1.type === types._case || this$1.type === types._default) {
      var isCase = this$1.type === types._case;
      if (cur) { this$1.finishNode(cur, "SwitchCase"); }
      node.cases.push(cur = this$1.startNode());
      cur.consequent = [];
      this$1.next();
      if (isCase) {
        cur.test = this$1.parseExpression();
      } else {
        if (sawDefault) { this$1.raiseRecoverable(this$1.lastTokStart, "Multiple default clauses"); }
        sawDefault = true;
        cur.test = null;
      }
      this$1.expect(types.colon);
    } else {
      if (!cur) { this$1.unexpected(); }
      cur.consequent.push(this$1.parseStatement(true));
    }
  }
  this.exitLexicalScope();
  if (cur) { this.finishNode(cur, "SwitchCase"); }
  this.next(); // Closing brace
  this.labels.pop();
  return this.finishNode(node, "SwitchStatement")
};

pp$1.parseThrowStatement = function(node) {
  this.next();
  if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
    { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
  node.argument = this.parseExpression();
  this.semicolon();
  return this.finishNode(node, "ThrowStatement")
};

// Reused empty array added for node fields that are always empty.

var empty = [];

pp$1.parseTryStatement = function(node) {
  this.next();
  node.block = this.parseBlock();
  node.handler = null;
  if (this.type === types._catch) {
    var clause = this.startNode();
    this.next();
    this.expect(types.parenL);
    clause.param = this.parseBindingAtom();
    this.enterLexicalScope();
    this.checkLVal(clause.param, "let");
    this.expect(types.parenR);
    clause.body = this.parseBlock(false);
    this.exitLexicalScope();
    node.handler = this.finishNode(clause, "CatchClause");
  }
  node.finalizer = this.eat(types._finally) ? this.parseBlock() : null;
  if (!node.handler && !node.finalizer)
    { this.raise(node.start, "Missing catch or finally clause"); }
  return this.finishNode(node, "TryStatement")
};

pp$1.parseVarStatement = function(node, kind) {
  this.next();
  this.parseVar(node, false, kind);
  this.semicolon();
  return this.finishNode(node, "VariableDeclaration")
};

pp$1.parseWhileStatement = function(node) {
  this.next();
  node.test = this.parseParenExpression();
  this.labels.push(loopLabel);
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "WhileStatement")
};

pp$1.parseWithStatement = function(node) {
  if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
  this.next();
  node.object = this.parseParenExpression();
  node.body = this.parseStatement(false);
  return this.finishNode(node, "WithStatement")
};

pp$1.parseEmptyStatement = function(node) {
  this.next();
  return this.finishNode(node, "EmptyStatement")
};

pp$1.parseLabeledStatement = function(node, maybeName, expr) {
  var this$1 = this;

  for (var i$1 = 0, list = this$1.labels; i$1 < list.length; i$1 += 1)
    {
    var label = list[i$1];

    if (label.name === maybeName)
      { this$1.raise(expr.start, "Label '" + maybeName + "' is already declared");
  } }
  var kind = this.type.isLoop ? "loop" : this.type === types._switch ? "switch" : null;
  for (var i = this.labels.length - 1; i >= 0; i--) {
    var label$1 = this$1.labels[i];
    if (label$1.statementStart == node.start) {
      // Update information about previous labels on this node
      label$1.statementStart = this$1.start;
      label$1.kind = kind;
    } else { break }
  }
  this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
  node.body = this.parseStatement(true);
  if (node.body.type == "ClassDeclaration" ||
      node.body.type == "VariableDeclaration" && node.body.kind != "var" ||
      node.body.type == "FunctionDeclaration" && (this.strict || node.body.generator))
    { this.raiseRecoverable(node.body.start, "Invalid labeled declaration"); }
  this.labels.pop();
  node.label = expr;
  return this.finishNode(node, "LabeledStatement")
};

pp$1.parseExpressionStatement = function(node, expr) {
  node.expression = expr;
  this.semicolon();
  return this.finishNode(node, "ExpressionStatement")
};

// Parse a semicolon-enclosed block of statements, handling `"use
// strict"` declarations when `allowStrict` is true (used for
// function bodies).

pp$1.parseBlock = function(createNewLexicalScope) {
  var this$1 = this;
  if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;

  var node = this.startNode();
  node.body = [];
  this.expect(types.braceL);
  if (createNewLexicalScope) {
    this.enterLexicalScope();
  }
  while (!this.eat(types.braceR)) {
    var stmt = this$1.parseStatement(true);
    node.body.push(stmt);
  }
  if (createNewLexicalScope) {
    this.exitLexicalScope();
  }
  return this.finishNode(node, "BlockStatement")
};

// Parse a regular `for` loop. The disambiguation code in
// `parseStatement` will already have parsed the init statement or
// expression.

pp$1.parseFor = function(node, init) {
  node.init = init;
  this.expect(types.semi);
  node.test = this.type === types.semi ? null : this.parseExpression();
  this.expect(types.semi);
  node.update = this.type === types.parenR ? null : this.parseExpression();
  this.expect(types.parenR);
  this.exitLexicalScope();
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, "ForStatement")
};

// Parse a `for`/`in` and `for`/`of` loop, which are almost
// same from parser's perspective.

pp$1.parseForIn = function(node, init) {
  var type = this.type === types._in ? "ForInStatement" : "ForOfStatement";
  this.next();
  if (type == "ForInStatement") {
    if (init.type === "AssignmentPattern" ||
      (init.type === "VariableDeclaration" && init.declarations[0].init != null &&
       (this.strict || init.declarations[0].id.type !== "Identifier")))
      { this.raise(init.start, "Invalid assignment in for-in loop head"); }
  }
  node.left = init;
  node.right = type == "ForInStatement" ? this.parseExpression() : this.parseMaybeAssign();
  this.expect(types.parenR);
  this.exitLexicalScope();
  node.body = this.parseStatement(false);
  this.labels.pop();
  return this.finishNode(node, type)
};

// Parse a list of variable declarations.

pp$1.parseVar = function(node, isFor, kind) {
  var this$1 = this;

  node.declarations = [];
  node.kind = kind;
  for (;;) {
    var decl = this$1.startNode();
    this$1.parseVarId(decl, kind);
    if (this$1.eat(types.eq)) {
      decl.init = this$1.parseMaybeAssign(isFor);
    } else if (kind === "const" && !(this$1.type === types._in || (this$1.options.ecmaVersion >= 6 && this$1.isContextual("of")))) {
      this$1.unexpected();
    } else if (decl.id.type != "Identifier" && !(isFor && (this$1.type === types._in || this$1.isContextual("of")))) {
      this$1.raise(this$1.lastTokEnd, "Complex binding patterns require an initialization value");
    } else {
      decl.init = null;
    }
    node.declarations.push(this$1.finishNode(decl, "VariableDeclarator"));
    if (!this$1.eat(types.comma)) { break }
  }
  return node
};

pp$1.parseVarId = function(decl, kind) {
  decl.id = this.parseBindingAtom(kind);
  this.checkLVal(decl.id, kind, false);
};

// Parse a function declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseFunction = function(node, isStatement, allowExpressionBody, isAsync) {
  this.initFunction(node);
  if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync)
    { node.generator = this.eat(types.star); }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  if (isStatement) {
    node.id = isStatement === "nullableID" && this.type != types.name ? null : this.parseIdent();
    if (node.id) {
      this.checkLVal(node.id, "var");
    }
  }

  var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;
  this.inGenerator = node.generator;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;
  this.enterFunctionScope();

  if (!isStatement)
    { node.id = this.type == types.name ? this.parseIdent() : null; }

  this.parseFunctionParams(node);
  this.parseFunctionBody(node, allowExpressionBody);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression")
};

pp$1.parseFunctionParams = function(node) {
  this.expect(types.parenL);
  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
};

// Parse a class declaration or literal (depending on the
// `isStatement` parameter).

pp$1.parseClass = function(node, isStatement) {
  var this$1 = this;

  this.next();

  this.parseClassId(node, isStatement);
  this.parseClassSuper(node);
  var classBody = this.startNode();
  var hadConstructor = false;
  classBody.body = [];
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    var member = this$1.parseClassMember(classBody);
    if (member && member.type === "MethodDefinition" && member.kind === "constructor") {
      if (hadConstructor) { this$1.raise(member.start, "Duplicate constructor in the same class"); }
      hadConstructor = true;
    }
  }
  node.body = this.finishNode(classBody, "ClassBody");
  return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
};

pp$1.parseClassMember = function(classBody) {
  var this$1 = this;

  if (this.eat(types.semi)) { return null }

  var method = this.startNode();
  var tryContextual = function (k, noLineBreak) {
    if ( noLineBreak === void 0 ) noLineBreak = false;

    var start = this$1.start, startLoc = this$1.startLoc;
    if (!this$1.eatContextual(k)) { return false }
    if (this$1.type !== types.parenL && (!noLineBreak || !this$1.canInsertSemicolon())) { return true }
    if (method.key) { this$1.unexpected(); }
    method.computed = false;
    method.key = this$1.startNodeAt(start, startLoc);
    method.key.name = k;
    this$1.finishNode(method.key, "Identifier");
    return false
  };

  method.kind = "method";
  method.static = tryContextual("static");
  var isGenerator = this.eat(types.star);
  var isAsync = false;
  if (!isGenerator) {
    if (this.options.ecmaVersion >= 8 && tryContextual("async", true)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
    } else if (tryContextual("get")) {
      method.kind = "get";
    } else if (tryContextual("set")) {
      method.kind = "set";
    }
  }
  if (!method.key) { this.parsePropertyName(method); }
  var key = method.key;
  if (!method.computed && !method.static && (key.type === "Identifier" && key.name === "constructor" ||
      key.type === "Literal" && key.value === "constructor")) {
    if (method.kind !== "method") { this.raise(key.start, "Constructor can't have get/set modifier"); }
    if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
    if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    method.kind = "constructor";
  } else if (method.static && key.type === "Identifier" && key.name === "prototype") {
    this.raise(key.start, "Classes may not have a static property named prototype");
  }
  this.parseClassMethod(classBody, method, isGenerator, isAsync);
  if (method.kind === "get" && method.value.params.length !== 0)
    { this.raiseRecoverable(method.value.start, "getter should have no params"); }
  if (method.kind === "set" && method.value.params.length !== 1)
    { this.raiseRecoverable(method.value.start, "setter should have exactly one param"); }
  if (method.kind === "set" && method.value.params[0].type === "RestElement")
    { this.raiseRecoverable(method.value.params[0].start, "Setter cannot use rest params"); }
  return method
};

pp$1.parseClassMethod = function(classBody, method, isGenerator, isAsync) {
  method.value = this.parseMethod(isGenerator, isAsync);
  classBody.body.push(this.finishNode(method, "MethodDefinition"));
};

pp$1.parseClassId = function(node, isStatement) {
  node.id = this.type === types.name ? this.parseIdent() : isStatement === true ? this.unexpected() : null;
};

pp$1.parseClassSuper = function(node) {
  node.superClass = this.eat(types._extends) ? this.parseExprSubscripts() : null;
};

// Parses module export declaration.

pp$1.parseExport = function(node, exports) {
  var this$1 = this;

  this.next();
  // export * from '...'
  if (this.eat(types.star)) {
    this.expectContextual("from");
    if (this.type !== types.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  }
  if (this.eat(types._default)) { // export default ...
    this.checkExport(exports, "default", this.lastTokStart);
    var isAsync;
    if (this.type === types._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      node.declaration = this.parseFunction(fNode, "nullableID", false, isAsync);
    } else if (this.type === types._class) {
      var cNode = this.startNode();
      node.declaration = this.parseClass(cNode, "nullableID");
    } else {
      node.declaration = this.parseMaybeAssign();
      this.semicolon();
    }
    return this.finishNode(node, "ExportDefaultDeclaration")
  }
  // export var|const|let|function|class ...
  if (this.shouldParseExportStatement()) {
    node.declaration = this.parseStatement(true);
    if (node.declaration.type === "VariableDeclaration")
      { this.checkVariableExport(exports, node.declaration.declarations); }
    else
      { this.checkExport(exports, node.declaration.id.name, node.declaration.id.start); }
    node.specifiers = [];
    node.source = null;
  } else { // export { x, y as z } [from '...']
    node.declaration = null;
    node.specifiers = this.parseExportSpecifiers(exports);
    if (this.eatContextual("from")) {
      if (this.type !== types.string) { this.unexpected(); }
      node.source = this.parseExprAtom();
    } else {
      // check for keywords used as local names
      for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
        var spec = list[i];

        this$1.checkUnreserved(spec.local);
      }

      node.source = null;
    }
    this.semicolon();
  }
  return this.finishNode(node, "ExportNamedDeclaration")
};

pp$1.checkExport = function(exports, name, pos) {
  if (!exports) { return }
  if (has(exports, name))
    { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
  exports[name] = true;
};

pp$1.checkPatternExport = function(exports, pat) {
  var this$1 = this;

  var type = pat.type;
  if (type == "Identifier")
    { this.checkExport(exports, pat.name, pat.start); }
  else if (type == "ObjectPattern")
    { for (var i = 0, list = pat.properties; i < list.length; i += 1)
      {
        var prop = list[i];

        this$1.checkPatternExport(exports, prop);
      } }
  else if (type == "ArrayPattern")
    { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
      var elt = list$1[i$1];

        if (elt) { this$1.checkPatternExport(exports, elt); }
    } }
  else if (type == "Property")
    { this.checkPatternExport(exports, pat.value); }
  else if (type == "AssignmentPattern")
    { this.checkPatternExport(exports, pat.left); }
  else if (type == "RestElement")
    { this.checkPatternExport(exports, pat.argument); }
  else if (type == "ParenthesizedExpression")
    { this.checkPatternExport(exports, pat.expression); }
};

pp$1.checkVariableExport = function(exports, decls) {
  var this$1 = this;

  if (!exports) { return }
  for (var i = 0, list = decls; i < list.length; i += 1)
    {
    var decl = list[i];

    this$1.checkPatternExport(exports, decl.id);
  }
};

pp$1.shouldParseExportStatement = function() {
  return this.type.keyword === "var" ||
    this.type.keyword === "const" ||
    this.type.keyword === "class" ||
    this.type.keyword === "function" ||
    this.isLet() ||
    this.isAsyncFunction()
};

// Parses a comma-separated list of module exports.

pp$1.parseExportSpecifiers = function(exports) {
  var this$1 = this;

  var nodes = [], first = true;
  // export { x, y as z } [from '...']
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var node = this$1.startNode();
    node.local = this$1.parseIdent(true);
    node.exported = this$1.eatContextual("as") ? this$1.parseIdent(true) : node.local;
    this$1.checkExport(exports, node.exported.name, node.exported.start);
    nodes.push(this$1.finishNode(node, "ExportSpecifier"));
  }
  return nodes
};

// Parses import declaration.

pp$1.parseImport = function(node) {
  this.next();
  // import '...'
  if (this.type === types.string) {
    node.specifiers = empty;
    node.source = this.parseExprAtom();
  } else {
    node.specifiers = this.parseImportSpecifiers();
    this.expectContextual("from");
    node.source = this.type === types.string ? this.parseExprAtom() : this.unexpected();
  }
  this.semicolon();
  return this.finishNode(node, "ImportDeclaration")
};

// Parses a comma-separated list of module imports.

pp$1.parseImportSpecifiers = function() {
  var this$1 = this;

  var nodes = [], first = true;
  if (this.type === types.name) {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLVal(node.local, "let");
    nodes.push(this.finishNode(node, "ImportDefaultSpecifier"));
    if (!this.eat(types.comma)) { return nodes }
  }
  if (this.type === types.star) {
    var node$1 = this.startNode();
    this.next();
    this.expectContextual("as");
    node$1.local = this.parseIdent();
    this.checkLVal(node$1.local, "let");
    nodes.push(this.finishNode(node$1, "ImportNamespaceSpecifier"));
    return nodes
  }
  this.expect(types.braceL);
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var node$2 = this$1.startNode();
    node$2.imported = this$1.parseIdent(true);
    if (this$1.eatContextual("as")) {
      node$2.local = this$1.parseIdent();
    } else {
      this$1.checkUnreserved(node$2.imported);
      node$2.local = node$2.imported;
    }
    this$1.checkLVal(node$2.local, "let");
    nodes.push(this$1.finishNode(node$2, "ImportSpecifier"));
  }
  return nodes
};

// Set `ExpressionStatement#directive` property for directive prologues.
pp$1.adaptDirectivePrologue = function(statements) {
  for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
    statements[i].directive = statements[i].expression.raw.slice(1, -1);
  }
};
pp$1.isDirectiveCandidate = function(statement) {
  return (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    typeof statement.expression.value === "string" &&
    // Reject parenthesized strings.
    (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
  )
};

var pp$2 = Parser.prototype;

// Convert existing expression atom to assignable pattern
// if possible.

pp$2.toAssignable = function(node, isBinding, refDestructuringErrors) {
  var this$1 = this;

  if (this.options.ecmaVersion >= 6 && node) {
    switch (node.type) {
    case "Identifier":
      if (this.inAsync && node.name === "await")
        { this.raise(node.start, "Can not use 'await' as identifier inside an async function"); }
      break

    case "ObjectPattern":
    case "ArrayPattern":
    case "RestElement":
      break

    case "ObjectExpression":
      node.type = "ObjectPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      for (var i = 0, list = node.properties; i < list.length; i += 1) {
        var prop = list[i];

      this$1.toAssignable(prop, isBinding);
        // Early error:
        //   AssignmentRestProperty[Yield, Await] :
        //     `...` DestructuringAssignmentTarget[Yield, Await]
        //
        //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
        if (
          prop.type === "RestElement" &&
          (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
        ) {
          this$1.raise(prop.argument.start, "Unexpected token");
        }
      }
      break

    case "Property":
      // AssignmentProperty has type == "Property"
      if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
      this.toAssignable(node.value, isBinding);
      break

    case "ArrayExpression":
      node.type = "ArrayPattern";
      if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
      this.toAssignableList(node.elements, isBinding);
      break

    case "SpreadElement":
      node.type = "RestElement";
      this.toAssignable(node.argument, isBinding);
      if (node.argument.type === "AssignmentPattern")
        { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
      break

    case "AssignmentExpression":
      if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
      node.type = "AssignmentPattern";
      delete node.operator;
      this.toAssignable(node.left, isBinding);
      // falls through to AssignmentPattern

    case "AssignmentPattern":
      break

    case "ParenthesizedExpression":
      this.toAssignable(node.expression, isBinding);
      break

    case "MemberExpression":
      if (!isBinding) { break }

    default:
      this.raise(node.start, "Assigning to rvalue");
    }
  } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
  return node
};

// Convert list of expression atoms to binding list.

pp$2.toAssignableList = function(exprList, isBinding) {
  var this$1 = this;

  var end = exprList.length;
  for (var i = 0; i < end; i++) {
    var elt = exprList[i];
    if (elt) { this$1.toAssignable(elt, isBinding); }
  }
  if (end) {
    var last = exprList[end - 1];
    if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
      { this.unexpected(last.argument.start); }
  }
  return exprList
};

// Parses spread element.

pp$2.parseSpread = function(refDestructuringErrors) {
  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
  return this.finishNode(node, "SpreadElement")
};

pp$2.parseRestBinding = function() {
  var node = this.startNode();
  this.next();

  // RestElement inside of a function parameter must be an identifier
  if (this.options.ecmaVersion === 6 && this.type !== types.name)
    { this.unexpected(); }

  node.argument = this.parseBindingAtom();

  return this.finishNode(node, "RestElement")
};

// Parses lvalue (assignable) atom.

pp$2.parseBindingAtom = function() {
  if (this.options.ecmaVersion >= 6) {
    switch (this.type) {
    case types.bracketL:
      var node = this.startNode();
      this.next();
      node.elements = this.parseBindingList(types.bracketR, true, true);
      return this.finishNode(node, "ArrayPattern")

    case types.braceL:
      return this.parseObj(true)
    }
  }
  return this.parseIdent()
};

pp$2.parseBindingList = function(close, allowEmpty, allowTrailingComma) {
  var this$1 = this;

  var elts = [], first = true;
  while (!this.eat(close)) {
    if (first) { first = false; }
    else { this$1.expect(types.comma); }
    if (allowEmpty && this$1.type === types.comma) {
      elts.push(null);
    } else if (allowTrailingComma && this$1.afterTrailingComma(close)) {
      break
    } else if (this$1.type === types.ellipsis) {
      var rest = this$1.parseRestBinding();
      this$1.parseBindingListItem(rest);
      elts.push(rest);
      if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
      this$1.expect(close);
      break
    } else {
      var elem = this$1.parseMaybeDefault(this$1.start, this$1.startLoc);
      this$1.parseBindingListItem(elem);
      elts.push(elem);
    }
  }
  return elts
};

pp$2.parseBindingListItem = function(param) {
  return param
};

// Parses assignment pattern around given atom if possible.

pp$2.parseMaybeDefault = function(startPos, startLoc, left) {
  left = left || this.parseBindingAtom();
  if (this.options.ecmaVersion < 6 || !this.eat(types.eq)) { return left }
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.right = this.parseMaybeAssign();
  return this.finishNode(node, "AssignmentPattern")
};

// Verify that a node is an lval — something that can be assigned
// to.
// bindingType can be either:
// 'var' indicating that the lval creates a 'var' binding
// 'let' indicating that the lval creates a lexical ('let' or 'const') binding
// 'none' indicating that the binding should be checked for illegal identifiers, but not for duplicate references

pp$2.checkLVal = function(expr, bindingType, checkClashes) {
  var this$1 = this;

  switch (expr.type) {
  case "Identifier":
    if (this.strict && this.reservedWordsStrictBind.test(expr.name))
      { this.raiseRecoverable(expr.start, (bindingType ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
    if (checkClashes) {
      if (has(checkClashes, expr.name))
        { this.raiseRecoverable(expr.start, "Argument name clash"); }
      checkClashes[expr.name] = true;
    }
    if (bindingType && bindingType !== "none") {
      if (
        bindingType === "var" && !this.canDeclareVarName(expr.name) ||
        bindingType !== "var" && !this.canDeclareLexicalName(expr.name)
      ) {
        this.raiseRecoverable(expr.start, ("Identifier '" + (expr.name) + "' has already been declared"));
      }
      if (bindingType === "var") {
        this.declareVarName(expr.name);
      } else {
        this.declareLexicalName(expr.name);
      }
    }
    break

  case "MemberExpression":
    if (bindingType) { this.raiseRecoverable(expr.start, "Binding member expression"); }
    break

  case "ObjectPattern":
    for (var i = 0, list = expr.properties; i < list.length; i += 1)
      {
    var prop = list[i];

    this$1.checkLVal(prop, bindingType, checkClashes);
  }
    break

  case "Property":
    // AssignmentProperty has type == "Property"
    this.checkLVal(expr.value, bindingType, checkClashes);
    break

  case "ArrayPattern":
    for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
      var elem = list$1[i$1];

    if (elem) { this$1.checkLVal(elem, bindingType, checkClashes); }
    }
    break

  case "AssignmentPattern":
    this.checkLVal(expr.left, bindingType, checkClashes);
    break

  case "RestElement":
    this.checkLVal(expr.argument, bindingType, checkClashes);
    break

  case "ParenthesizedExpression":
    this.checkLVal(expr.expression, bindingType, checkClashes);
    break

  default:
    this.raise(expr.start, (bindingType ? "Binding" : "Assigning to") + " rvalue");
  }
};

// A recursive descent parser operates by defining functions for all
// syntactic elements, and recursively calling those, each function
// advancing the input stream and returning an AST node. Precedence
// of constructs (for example, the fact that `!x[1]` means `!(x[1])`
// instead of `(!x)[1]` is handled by the fact that the parser
// function that parses unary prefix operators is called first, and
// in turn calls the function that parses `[]` subscripts — that
// way, it'll receive the node for `x[1]` already parsed, and wraps
// *that* in the unary operator node.
//
// Acorn uses an [operator precedence parser][opp] to handle binary
// operator precedence, because it is much more compact than using
// the technique outlined above, which uses different, nesting
// functions to specify precedence, for all of the ten binary
// precedence levels that JavaScript defines.
//
// [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

var pp$3 = Parser.prototype;

// Check if property name clashes with already added.
// Object/class getters and setters are not allowed to clash —
// either with each other or with an init property — and in
// strict mode, init properties are also not allowed to be repeated.

pp$3.checkPropClash = function(prop, propHash, refDestructuringErrors) {
  if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
    { return }
  if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
    { return }
  var key = prop.key;
  var name;
  switch (key.type) {
  case "Identifier": name = key.name; break
  case "Literal": name = String(key.value); break
  default: return
  }
  var kind = prop.kind;
  if (this.options.ecmaVersion >= 6) {
    if (name === "__proto__" && kind === "init") {
      if (propHash.proto) {
        if (refDestructuringErrors && refDestructuringErrors.doubleProto < 0) { refDestructuringErrors.doubleProto = key.start; }
        // Backwards-compat kludge. Can be removed in version 6.0
        else { this.raiseRecoverable(key.start, "Redefinition of __proto__ property"); }
      }
      propHash.proto = true;
    }
    return
  }
  name = "$" + name;
  var other = propHash[name];
  if (other) {
    var redefinition;
    if (kind === "init") {
      redefinition = this.strict && other.init || other.get || other.set;
    } else {
      redefinition = other.init || other[kind];
    }
    if (redefinition)
      { this.raiseRecoverable(key.start, "Redefinition of property"); }
  } else {
    other = propHash[name] = {
      init: false,
      get: false,
      set: false
    };
  }
  other[kind] = true;
};

// ### Expression parsing

// These nest, from the most general expression type at the top to
// 'atomic', nondivisible expression types at the bottom. Most of
// the functions will simply let the function(s) below them parse,
// and, *if* the syntactic construct they handle is present, wrap
// the AST node that the inner parser gave them in another node.

// Parse a full expression. The optional arguments are used to
// forbid the `in` operator (in for loops initalization expressions)
// and provide reference for storing '=' operator inside shorthand
// property assignment in contexts where both object expression
// and object pattern might appear (so it's possible to raise
// delayed syntax error at correct position).

pp$3.parseExpression = function(noIn, refDestructuringErrors) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeAssign(noIn, refDestructuringErrors);
  if (this.type === types.comma) {
    var node = this.startNodeAt(startPos, startLoc);
    node.expressions = [expr];
    while (this.eat(types.comma)) { node.expressions.push(this$1.parseMaybeAssign(noIn, refDestructuringErrors)); }
    return this.finishNode(node, "SequenceExpression")
  }
  return expr
};

// Parse an assignment expression. This includes applications of
// operators like `+=`.

pp$3.parseMaybeAssign = function(noIn, refDestructuringErrors, afterLeftParse) {
  if (this.inGenerator && this.isContextual("yield")) { return this.parseYield() }

  var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1;
  if (refDestructuringErrors) {
    oldParenAssign = refDestructuringErrors.parenthesizedAssign;
    oldTrailingComma = refDestructuringErrors.trailingComma;
    refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
  } else {
    refDestructuringErrors = new DestructuringErrors;
    ownDestructuringErrors = true;
  }

  var startPos = this.start, startLoc = this.startLoc;
  if (this.type == types.parenL || this.type == types.name)
    { this.potentialArrowAt = this.start; }
  var left = this.parseMaybeConditional(noIn, refDestructuringErrors);
  if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
  if (this.type.isAssign) {
    var node = this.startNodeAt(startPos, startLoc);
    node.operator = this.value;
    node.left = this.type === types.eq ? this.toAssignable(left, false, refDestructuringErrors) : left;
    if (!ownDestructuringErrors) { DestructuringErrors.call(refDestructuringErrors); }
    refDestructuringErrors.shorthandAssign = -1; // reset because shorthand default was used correctly
    this.checkLVal(left);
    this.next();
    node.right = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "AssignmentExpression")
  } else {
    if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
  }
  if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
  if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
  return left
};

// Parse a ternary conditional (`?:`) operator.

pp$3.parseMaybeConditional = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprOps(noIn, refDestructuringErrors);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  if (this.eat(types.question)) {
    var node = this.startNodeAt(startPos, startLoc);
    node.test = expr;
    node.consequent = this.parseMaybeAssign();
    this.expect(types.colon);
    node.alternate = this.parseMaybeAssign(noIn);
    return this.finishNode(node, "ConditionalExpression")
  }
  return expr
};

// Start the precedence parser.

pp$3.parseExprOps = function(noIn, refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseMaybeUnary(refDestructuringErrors, false);
  if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
  return expr.start == startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, noIn)
};

// Parse binary operators with the operator precedence parsing
// algorithm. `left` is the left-hand side of the operator.
// `minPrec` provides context that allows the function to stop and
// defer further parser to one of its callers when it encounters an
// operator that has a lower precedence than the set it is parsing.

pp$3.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, noIn) {
  var prec = this.type.binop;
  if (prec != null && (!noIn || this.type !== types._in)) {
    if (prec > minPrec) {
      var logical = this.type === types.logicalOR || this.type === types.logicalAND;
      var op = this.value;
      this.next();
      var startPos = this.start, startLoc = this.startLoc;
      var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
      var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical);
      return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, noIn)
    }
  }
  return left
};

pp$3.buildBinary = function(startPos, startLoc, left, right, op, logical) {
  var node = this.startNodeAt(startPos, startLoc);
  node.left = left;
  node.operator = op;
  node.right = right;
  return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
};

// Parse unary operators, both prefix and postfix.

pp$3.parseMaybeUnary = function(refDestructuringErrors, sawUnary) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, expr;
  if (this.inAsync && this.isContextual("await")) {
    expr = this.parseAwait();
    sawUnary = true;
  } else if (this.type.prefix) {
    var node = this.startNode(), update = this.type === types.incDec;
    node.operator = this.value;
    node.prefix = true;
    this.next();
    node.argument = this.parseMaybeUnary(null, true);
    this.checkExpressionErrors(refDestructuringErrors, true);
    if (update) { this.checkLVal(node.argument); }
    else if (this.strict && node.operator === "delete" &&
             node.argument.type === "Identifier")
      { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
    else { sawUnary = true; }
    expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
  } else {
    expr = this.parseExprSubscripts(refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    while (this.type.postfix && !this.canInsertSemicolon()) {
      var node$1 = this$1.startNodeAt(startPos, startLoc);
      node$1.operator = this$1.value;
      node$1.prefix = false;
      node$1.argument = expr;
      this$1.checkLVal(expr);
      this$1.next();
      expr = this$1.finishNode(node$1, "UpdateExpression");
    }
  }

  if (!sawUnary && this.eat(types.starstar))
    { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false), "**", false) }
  else
    { return expr }
};

// Parse call, dot, and `[]`-subscript expressions.

pp$3.parseExprSubscripts = function(refDestructuringErrors) {
  var startPos = this.start, startLoc = this.startLoc;
  var expr = this.parseExprAtom(refDestructuringErrors);
  var skipArrowSubscripts = expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")";
  if (this.checkExpressionErrors(refDestructuringErrors) || skipArrowSubscripts) { return expr }
  var result = this.parseSubscripts(expr, startPos, startLoc);
  if (refDestructuringErrors && result.type === "MemberExpression") {
    if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
    if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
  }
  return result
};

pp$3.parseSubscripts = function(base, startPos, startLoc, noCalls) {
  var this$1 = this;

  var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
      this.lastTokEnd == base.end && !this.canInsertSemicolon() && this.input.slice(base.start, base.end) === "async";
  for (var computed = (void 0);;) {
    if ((computed = this$1.eat(types.bracketL)) || this$1.eat(types.dot)) {
      var node = this$1.startNodeAt(startPos, startLoc);
      node.object = base;
      node.property = computed ? this$1.parseExpression() : this$1.parseIdent(true);
      node.computed = !!computed;
      if (computed) { this$1.expect(types.bracketR); }
      base = this$1.finishNode(node, "MemberExpression");
    } else if (!noCalls && this$1.eat(types.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this$1.yieldPos, oldAwaitPos = this$1.awaitPos;
      this$1.yieldPos = 0;
      this$1.awaitPos = 0;
      var exprList = this$1.parseExprList(types.parenR, this$1.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !this$1.canInsertSemicolon() && this$1.eat(types.arrow)) {
        this$1.checkPatternErrors(refDestructuringErrors, false);
        this$1.checkYieldAwaitInDefaultParams();
        this$1.yieldPos = oldYieldPos;
        this$1.awaitPos = oldAwaitPos;
        return this$1.parseArrowExpression(this$1.startNodeAt(startPos, startLoc), exprList, true)
      }
      this$1.checkExpressionErrors(refDestructuringErrors, true);
      this$1.yieldPos = oldYieldPos || this$1.yieldPos;
      this$1.awaitPos = oldAwaitPos || this$1.awaitPos;
      var node$1 = this$1.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      base = this$1.finishNode(node$1, "CallExpression");
    } else if (this$1.type === types.backQuote) {
      var node$2 = this$1.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this$1.parseTemplate({isTagged: true});
      base = this$1.finishNode(node$2, "TaggedTemplateExpression");
    } else {
      return base
    }
  }
};

// Parse an atomic expression — either a single token that is an
// expression, an expression started by a keyword like `function` or
// `new`, or an expression wrapped in punctuation like `()`, `[]`,
// or `{}`.

pp$3.parseExprAtom = function(refDestructuringErrors) {
  var node, canBeArrow = this.potentialArrowAt == this.start;
  switch (this.type) {
  case types._super:
    if (!this.inFunction)
      { this.raise(this.start, "'super' outside of function or class"); }
    node = this.startNode();
    this.next();
    // The `super` keyword can appear at below:
    // SuperProperty:
    //     super [ Expression ]
    //     super . IdentifierName
    // SuperCall:
    //     super Arguments
    if (this.type !== types.dot && this.type !== types.bracketL && this.type !== types.parenL)
      { this.unexpected(); }
    return this.finishNode(node, "Super")

  case types._this:
    node = this.startNode();
    this.next();
    return this.finishNode(node, "ThisExpression")

  case types.name:
    var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
    var id = this.parseIdent(this.type !== types.name);
    if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types._function))
      { return this.parseFunction(this.startNodeAt(startPos, startLoc), false, false, true) }
    if (canBeArrow && !this.canInsertSemicolon()) {
      if (this.eat(types.arrow))
        { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false) }
      if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types.name && !containsEsc) {
        id = this.parseIdent();
        if (this.canInsertSemicolon() || !this.eat(types.arrow))
          { this.unexpected(); }
        return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true)
      }
    }
    return id

  case types.regexp:
    var value = this.value;
    node = this.parseLiteral(value.value);
    node.regex = {pattern: value.pattern, flags: value.flags};
    return node

  case types.num: case types.string:
    return this.parseLiteral(this.value)

  case types._null: case types._true: case types._false:
    node = this.startNode();
    node.value = this.type === types._null ? null : this.type === types._true;
    node.raw = this.type.keyword;
    this.next();
    return this.finishNode(node, "Literal")

  case types.parenL:
    var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow);
    if (refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
        { refDestructuringErrors.parenthesizedAssign = start; }
      if (refDestructuringErrors.parenthesizedBind < 0)
        { refDestructuringErrors.parenthesizedBind = start; }
    }
    return expr

  case types.bracketL:
    node = this.startNode();
    this.next();
    node.elements = this.parseExprList(types.bracketR, true, true, refDestructuringErrors);
    return this.finishNode(node, "ArrayExpression")

  case types.braceL:
    return this.parseObj(false, refDestructuringErrors)

  case types._function:
    node = this.startNode();
    this.next();
    return this.parseFunction(node, false)

  case types._class:
    return this.parseClass(this.startNode(), false)

  case types._new:
    return this.parseNew()

  case types.backQuote:
    return this.parseTemplate()

  default:
    this.unexpected();
  }
};

pp$3.parseLiteral = function(value) {
  var node = this.startNode();
  node.value = value;
  node.raw = this.input.slice(this.start, this.end);
  this.next();
  return this.finishNode(node, "Literal")
};

pp$3.parseParenExpression = function() {
  this.expect(types.parenL);
  var val = this.parseExpression();
  this.expect(types.parenR);
  return val
};

pp$3.parseParenAndDistinguishExpression = function(canBeArrow) {
  var this$1 = this;

  var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
  if (this.options.ecmaVersion >= 6) {
    this.next();

    var innerStartPos = this.start, innerStartLoc = this.startLoc;
    var exprList = [], first = true, lastIsComma = false;
    var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
    this.yieldPos = 0;
    this.awaitPos = 0;
    while (this.type !== types.parenR) {
      first ? first = false : this$1.expect(types.comma);
      if (allowTrailingComma && this$1.afterTrailingComma(types.parenR, true)) {
        lastIsComma = true;
        break
      } else if (this$1.type === types.ellipsis) {
        spreadStart = this$1.start;
        exprList.push(this$1.parseParenItem(this$1.parseRestBinding()));
        if (this$1.type === types.comma) { this$1.raise(this$1.start, "Comma is not permitted after the rest element"); }
        break
      } else {
        exprList.push(this$1.parseMaybeAssign(false, refDestructuringErrors, this$1.parseParenItem));
      }
    }
    var innerEndPos = this.start, innerEndLoc = this.startLoc;
    this.expect(types.parenR);

    if (canBeArrow && !this.canInsertSemicolon() && this.eat(types.arrow)) {
      this.checkPatternErrors(refDestructuringErrors, false);
      this.checkYieldAwaitInDefaultParams();
      this.yieldPos = oldYieldPos;
      this.awaitPos = oldAwaitPos;
      return this.parseParenArrowList(startPos, startLoc, exprList)
    }

    if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
    if (spreadStart) { this.unexpected(spreadStart); }
    this.checkExpressionErrors(refDestructuringErrors, true);
    this.yieldPos = oldYieldPos || this.yieldPos;
    this.awaitPos = oldAwaitPos || this.awaitPos;

    if (exprList.length > 1) {
      val = this.startNodeAt(innerStartPos, innerStartLoc);
      val.expressions = exprList;
      this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
    } else {
      val = exprList[0];
    }
  } else {
    val = this.parseParenExpression();
  }

  if (this.options.preserveParens) {
    var par = this.startNodeAt(startPos, startLoc);
    par.expression = val;
    return this.finishNode(par, "ParenthesizedExpression")
  } else {
    return val
  }
};

pp$3.parseParenItem = function(item) {
  return item
};

pp$3.parseParenArrowList = function(startPos, startLoc, exprList) {
  return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList)
};

// New's precedence is slightly tricky. It must allow its argument to
// be a `[]` or dot subscript expression, but not a call — at least,
// not without wrapping it in parentheses. Thus, it uses the noCalls
// argument to parseSubscripts to prevent it from consuming the
// argument list.

var empty$1 = [];

pp$3.parseNew = function() {
  var node = this.startNode();
  var meta = this.parseIdent(true);
  if (this.options.ecmaVersion >= 6 && this.eat(types.dot)) {
    node.meta = meta;
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "target" || containsEsc)
      { this.raiseRecoverable(node.property.start, "The only valid meta property for new is new.target"); }
    if (!this.inFunction)
      { this.raiseRecoverable(node.start, "new.target can only be used in functions"); }
    return this.finishNode(node, "MetaProperty")
  }
  var startPos = this.start, startLoc = this.startLoc;
  node.callee = this.parseSubscripts(this.parseExprAtom(), startPos, startLoc, true);
  if (this.eat(types.parenL)) { node.arguments = this.parseExprList(types.parenR, this.options.ecmaVersion >= 8, false); }
  else { node.arguments = empty$1; }
  return this.finishNode(node, "NewExpression")
};

// Parse template expression.

pp$3.parseTemplateElement = function(ref) {
  var isTagged = ref.isTagged;

  var elem = this.startNode();
  if (this.type === types.invalidTemplate) {
    if (!isTagged) {
      this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
    }
    elem.value = {
      raw: this.value,
      cooked: null
    };
  } else {
    elem.value = {
      raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
      cooked: this.value
    };
  }
  this.next();
  elem.tail = this.type === types.backQuote;
  return this.finishNode(elem, "TemplateElement")
};

pp$3.parseTemplate = function(ref) {
  var this$1 = this;
  if ( ref === void 0 ) ref = {};
  var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

  var node = this.startNode();
  this.next();
  node.expressions = [];
  var curElt = this.parseTemplateElement({isTagged: isTagged});
  node.quasis = [curElt];
  while (!curElt.tail) {
    this$1.expect(types.dollarBraceL);
    node.expressions.push(this$1.parseExpression());
    this$1.expect(types.braceR);
    node.quasis.push(curElt = this$1.parseTemplateElement({isTagged: isTagged}));
  }
  this.next();
  return this.finishNode(node, "TemplateLiteral")
};

pp$3.isAsyncProp = function(prop) {
  return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
    (this.type === types.name || this.type === types.num || this.type === types.string || this.type === types.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types.star)) &&
    !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
};

// Parse an object literal or binding pattern.

pp$3.parseObj = function(isPattern, refDestructuringErrors) {
  var this$1 = this;

  var node = this.startNode(), first = true, propHash = {};
  node.properties = [];
  this.next();
  while (!this.eat(types.braceR)) {
    if (!first) {
      this$1.expect(types.comma);
      if (this$1.afterTrailingComma(types.braceR)) { break }
    } else { first = false; }

    var prop = this$1.parseProperty(isPattern, refDestructuringErrors);
    if (!isPattern) { this$1.checkPropClash(prop, propHash, refDestructuringErrors); }
    node.properties.push(prop);
  }
  return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
};

pp$3.parseProperty = function(isPattern, refDestructuringErrors) {
  var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
  if (this.options.ecmaVersion >= 9 && this.eat(types.ellipsis)) {
    if (isPattern) {
      prop.argument = this.parseIdent(false);
      if (this.type === types.comma) {
        this.raise(this.start, "Comma is not permitted after the rest element");
      }
      return this.finishNode(prop, "RestElement")
    }
    // To disallow parenthesized identifier via `this.toAssignable()`.
    if (this.type === types.parenL && refDestructuringErrors) {
      if (refDestructuringErrors.parenthesizedAssign < 0) {
        refDestructuringErrors.parenthesizedAssign = this.start;
      }
      if (refDestructuringErrors.parenthesizedBind < 0) {
        refDestructuringErrors.parenthesizedBind = this.start;
      }
    }
    // Parse argument.
    prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    // To disallow trailing comma via `this.toAssignable()`.
    if (this.type === types.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
      refDestructuringErrors.trailingComma = this.start;
    }
    // Finish
    return this.finishNode(prop, "SpreadElement")
  }
  if (this.options.ecmaVersion >= 6) {
    prop.method = false;
    prop.shorthand = false;
    if (isPattern || refDestructuringErrors) {
      startPos = this.start;
      startLoc = this.startLoc;
    }
    if (!isPattern)
      { isGenerator = this.eat(types.star); }
  }
  var containsEsc = this.containsEsc;
  this.parsePropertyName(prop);
  if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
    isAsync = true;
    isGenerator = this.options.ecmaVersion >= 9 && this.eat(types.star);
    this.parsePropertyName(prop, refDestructuringErrors);
  } else {
    isAsync = false;
  }
  this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
  return this.finishNode(prop, "Property")
};

pp$3.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
  if ((isGenerator || isAsync) && this.type === types.colon)
    { this.unexpected(); }

  if (this.eat(types.colon)) {
    prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
    prop.kind = "init";
  } else if (this.options.ecmaVersion >= 6 && this.type === types.parenL) {
    if (isPattern) { this.unexpected(); }
    prop.kind = "init";
    prop.method = true;
    prop.value = this.parseMethod(isGenerator, isAsync);
  } else if (!isPattern && !containsEsc &&
             this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
             (prop.key.name === "get" || prop.key.name === "set") &&
             (this.type != types.comma && this.type != types.braceR)) {
    if (isGenerator || isAsync) { this.unexpected(); }
    prop.kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
    this.checkUnreserved(prop.key);
    prop.kind = "init";
    if (isPattern) {
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else if (this.type === types.eq && refDestructuringErrors) {
      if (refDestructuringErrors.shorthandAssign < 0)
        { refDestructuringErrors.shorthandAssign = this.start; }
      prop.value = this.parseMaybeDefault(startPos, startLoc, prop.key);
    } else {
      prop.value = prop.key;
    }
    prop.shorthand = true;
  } else { this.unexpected(); }
};

pp$3.parsePropertyName = function(prop) {
  if (this.options.ecmaVersion >= 6) {
    if (this.eat(types.bracketL)) {
      prop.computed = true;
      prop.key = this.parseMaybeAssign();
      this.expect(types.bracketR);
      return prop.key
    } else {
      prop.computed = false;
    }
  }
  return prop.key = this.type === types.num || this.type === types.string ? this.parseExprAtom() : this.parseIdent(true)
};

// Initialize empty function node.

pp$3.initFunction = function(node) {
  node.id = null;
  if (this.options.ecmaVersion >= 6) {
    node.generator = false;
    node.expression = false;
  }
  if (this.options.ecmaVersion >= 8)
    { node.async = false; }
};

// Parse object or class method.

pp$3.parseMethod = function(isGenerator, isAsync) {
  var node = this.startNode(), oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

  this.initFunction(node);
  if (this.options.ecmaVersion >= 6)
    { node.generator = isGenerator; }
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.inGenerator = node.generator;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;
  this.enterFunctionScope();

  this.expect(types.parenL);
  node.params = this.parseBindingList(types.parenR, false, this.options.ecmaVersion >= 8);
  this.checkYieldAwaitInDefaultParams();
  this.parseFunctionBody(node, false);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, "FunctionExpression")
};

// Parse arrow function expression with given parameters.

pp$3.parseArrowExpression = function(node, params, isAsync) {
  var oldInGen = this.inGenerator, oldInAsync = this.inAsync,
      oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldInFunc = this.inFunction;

  this.enterFunctionScope();
  this.initFunction(node);
  if (this.options.ecmaVersion >= 8)
    { node.async = !!isAsync; }

  this.inGenerator = false;
  this.inAsync = node.async;
  this.yieldPos = 0;
  this.awaitPos = 0;
  this.inFunction = true;

  node.params = this.toAssignableList(params, true);
  this.parseFunctionBody(node, true);

  this.inGenerator = oldInGen;
  this.inAsync = oldInAsync;
  this.yieldPos = oldYieldPos;
  this.awaitPos = oldAwaitPos;
  this.inFunction = oldInFunc;
  return this.finishNode(node, "ArrowFunctionExpression")
};

// Parse function body and check parameters.

pp$3.parseFunctionBody = function(node, isArrowFunction) {
  var isExpression = isArrowFunction && this.type !== types.braceL;
  var oldStrict = this.strict, useStrict = false;

  if (isExpression) {
    node.body = this.parseMaybeAssign();
    node.expression = true;
    this.checkParams(node, false);
  } else {
    var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
    if (!oldStrict || nonSimple) {
      useStrict = this.strictDirective(this.end);
      // If this is a strict mode function, verify that argument names
      // are not repeated, and it does not try to bind the words `eval`
      // or `arguments`.
      if (useStrict && nonSimple)
        { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
    }
    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldLabels = this.labels;
    this.labels = [];
    if (useStrict) { this.strict = true; }

    // Add the params to varDeclaredNames to ensure that an error is thrown
    // if a let/const declaration in the function clashes with one of the params.
    this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && this.isSimpleParamList(node.params));
    node.body = this.parseBlock(false);
    node.expression = false;
    this.adaptDirectivePrologue(node.body.body);
    this.labels = oldLabels;
  }
  this.exitFunctionScope();

  if (this.strict && node.id) {
    // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
    this.checkLVal(node.id, "none");
  }
  this.strict = oldStrict;
};

pp$3.isSimpleParamList = function(params) {
  for (var i = 0, list = params; i < list.length; i += 1)
    {
    var param = list[i];

    if (param.type !== "Identifier") { return false
  } }
  return true
};

// Checks function params for various disallowed patterns such as using "eval"
// or "arguments" and duplicate parameters.

pp$3.checkParams = function(node, allowDuplicates) {
  var this$1 = this;

  var nameHash = {};
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    this$1.checkLVal(param, "var", allowDuplicates ? null : nameHash);
  }
};

// Parses a comma-separated list of expressions, and returns them as
// an array. `close` is the token type that ends the list, and
// `allowEmpty` can be turned on to allow subsequent commas with
// nothing in between them to be parsed as `null` (which is needed
// for array literals).

pp$3.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
  var this$1 = this;

  var elts = [], first = true;
  while (!this.eat(close)) {
    if (!first) {
      this$1.expect(types.comma);
      if (allowTrailingComma && this$1.afterTrailingComma(close)) { break }
    } else { first = false; }

    var elt = (void 0);
    if (allowEmpty && this$1.type === types.comma)
      { elt = null; }
    else if (this$1.type === types.ellipsis) {
      elt = this$1.parseSpread(refDestructuringErrors);
      if (refDestructuringErrors && this$1.type === types.comma && refDestructuringErrors.trailingComma < 0)
        { refDestructuringErrors.trailingComma = this$1.start; }
    } else {
      elt = this$1.parseMaybeAssign(false, refDestructuringErrors);
    }
    elts.push(elt);
  }
  return elts
};

pp$3.checkUnreserved = function(ref) {
  var start = ref.start;
  var end = ref.end;
  var name = ref.name;

  if (this.inGenerator && name === "yield")
    { this.raiseRecoverable(start, "Can not use 'yield' as identifier inside a generator"); }
  if (this.inAsync && name === "await")
    { this.raiseRecoverable(start, "Can not use 'await' as identifier inside an async function"); }
  if (this.isKeyword(name))
    { this.raise(start, ("Unexpected keyword '" + name + "'")); }
  if (this.options.ecmaVersion < 6 &&
    this.input.slice(start, end).indexOf("\\") != -1) { return }
  var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
  if (re.test(name)) {
    if (!this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Can not use keyword 'await' outside an async function"); }
    this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
  }
};

// Parse the next token as an identifier. If `liberal` is true (used
// when parsing properties), it will also convert keywords into
// identifiers.

pp$3.parseIdent = function(liberal, isBinding) {
  var node = this.startNode();
  if (liberal && this.options.allowReserved == "never") { liberal = false; }
  if (this.type === types.name) {
    node.name = this.value;
  } else if (this.type.keyword) {
    node.name = this.type.keyword;

    // To fix https://github.com/acornjs/acorn/issues/575
    // `class` and `function` keywords push new context into this.context.
    // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
    // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
    if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
      this.context.pop();
    }
  } else {
    this.unexpected();
  }
  this.next();
  this.finishNode(node, "Identifier");
  if (!liberal) { this.checkUnreserved(node); }
  return node
};

// Parses yield expression inside generator.

pp$3.parseYield = function() {
  if (!this.yieldPos) { this.yieldPos = this.start; }

  var node = this.startNode();
  this.next();
  if (this.type == types.semi || this.canInsertSemicolon() || (this.type != types.star && !this.type.startsExpr)) {
    node.delegate = false;
    node.argument = null;
  } else {
    node.delegate = this.eat(types.star);
    node.argument = this.parseMaybeAssign();
  }
  return this.finishNode(node, "YieldExpression")
};

pp$3.parseAwait = function() {
  if (!this.awaitPos) { this.awaitPos = this.start; }

  var node = this.startNode();
  this.next();
  node.argument = this.parseMaybeUnary(null, true);
  return this.finishNode(node, "AwaitExpression")
};

var pp$4 = Parser.prototype;

// This function is used to raise exceptions on parse errors. It
// takes an offset integer (into the current `input`) to indicate
// the location of the error, attaches the position to the end
// of the error message, and then raises a `SyntaxError` with that
// message.

pp$4.raise = function(pos, message) {
  var loc = getLineInfo(this.input, pos);
  message += " (" + loc.line + ":" + loc.column + ")";
  var err = new SyntaxError(message);
  err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
  throw err
};

pp$4.raiseRecoverable = pp$4.raise;

pp$4.curPosition = function() {
  if (this.options.locations) {
    return new Position(this.curLine, this.pos - this.lineStart)
  }
};

var pp$5 = Parser.prototype;

// Object.assign polyfill
var assign$1 = Object.assign || function(target) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  for (var i = 0, list = sources; i < list.length; i += 1) {
    var source = list[i];

    for (var key in source) {
      if (has(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target
};

// The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

pp$5.enterFunctionScope = function() {
  // var: a hash of var-declared names in the current lexical scope
  // lexical: a hash of lexically-declared names in the current lexical scope
  // childVar: a hash of var-declared names in all child lexical scopes of the current lexical scope (within the current function scope)
  // parentLexical: a hash of lexically-declared names in all parent lexical scopes of the current lexical scope (within the current function scope)
  this.scopeStack.push({var: {}, lexical: {}, childVar: {}, parentLexical: {}});
};

pp$5.exitFunctionScope = function() {
  this.scopeStack.pop();
};

pp$5.enterLexicalScope = function() {
  var parentScope = this.scopeStack[this.scopeStack.length - 1];
  var childScope = {var: {}, lexical: {}, childVar: {}, parentLexical: {}};

  this.scopeStack.push(childScope);
  assign$1(childScope.parentLexical, parentScope.lexical, parentScope.parentLexical);
};

pp$5.exitLexicalScope = function() {
  var childScope = this.scopeStack.pop();
  var parentScope = this.scopeStack[this.scopeStack.length - 1];

  assign$1(parentScope.childVar, childScope.var, childScope.childVar);
};

/**
 * A name can be declared with `var` if there are no variables with the same name declared with `let`/`const`
 * in the current lexical scope or any of the parent lexical scopes in this function.
 */
pp$5.canDeclareVarName = function(name) {
  var currentScope = this.scopeStack[this.scopeStack.length - 1];

  return !has(currentScope.lexical, name) && !has(currentScope.parentLexical, name)
};

/**
 * A name can be declared with `let`/`const` if there are no variables with the same name declared with `let`/`const`
 * in the current scope, and there are no variables with the same name declared with `var` in the current scope or in
 * any child lexical scopes in this function.
 */
pp$5.canDeclareLexicalName = function(name) {
  var currentScope = this.scopeStack[this.scopeStack.length - 1];

  return !has(currentScope.lexical, name) && !has(currentScope.var, name) && !has(currentScope.childVar, name)
};

pp$5.declareVarName = function(name) {
  this.scopeStack[this.scopeStack.length - 1].var[name] = true;
};

pp$5.declareLexicalName = function(name) {
  this.scopeStack[this.scopeStack.length - 1].lexical[name] = true;
};

var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations)
    { this.loc = new SourceLocation(parser, loc); }
  if (parser.options.directSourceFile)
    { this.sourceFile = parser.options.directSourceFile; }
  if (parser.options.ranges)
    { this.range = [pos, 0]; }
};

// Start an AST node, attaching a start offset.

var pp$6 = Parser.prototype;

pp$6.startNode = function() {
  return new Node(this, this.start, this.startLoc)
};

pp$6.startNodeAt = function(pos, loc) {
  return new Node(this, pos, loc)
};

// Finish an AST node, adding `type` and `end` properties.

function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations)
    { node.loc.end = loc; }
  if (this.options.ranges)
    { node.range[1] = pos; }
  return node
}

pp$6.finishNode = function(node, type) {
  return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
};

// Finish node at given position

pp$6.finishNodeAt = function(node, type, pos, loc) {
  return finishNodeAt.call(this, node, type, pos, loc)
};

// The algorithm used to determine whether a regexp can appear at a
// given point in the program is loosely based on sweet.js' approach.
// See https://github.com/mozilla/sweet.js/wiki/design

var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
  this.token = token;
  this.isExpr = !!isExpr;
  this.preserveSpace = !!preserveSpace;
  this.override = override;
  this.generator = !!generator;
};

var types$1 = {
  b_stat: new TokContext("{", false),
  b_expr: new TokContext("{", true),
  b_tmpl: new TokContext("${", false),
  p_stat: new TokContext("(", false),
  p_expr: new TokContext("(", true),
  q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
  f_stat: new TokContext("function", false),
  f_expr: new TokContext("function", true),
  f_expr_gen: new TokContext("function", true, false, null, true),
  f_gen: new TokContext("function", false, false, null, true)
};

var pp$7 = Parser.prototype;

pp$7.initialContext = function() {
  return [types$1.b_stat]
};

pp$7.braceIsBlock = function(prevType) {
  var parent = this.curContext();
  if (parent === types$1.f_expr || parent === types$1.f_stat)
    { return true }
  if (prevType === types.colon && (parent === types$1.b_stat || parent === types$1.b_expr))
    { return !parent.isExpr }

  // The check for `tt.name && exprAllowed` detects whether we are
  // after a `yield` or `of` construct. See the `updateContext` for
  // `tt.name`.
  if (prevType === types._return || prevType == types.name && this.exprAllowed)
    { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
  if (prevType === types._else || prevType === types.semi || prevType === types.eof || prevType === types.parenR || prevType == types.arrow)
    { return true }
  if (prevType == types.braceL)
    { return parent === types$1.b_stat }
  if (prevType == types._var || prevType == types.name)
    { return false }
  return !this.exprAllowed
};

pp$7.inGeneratorContext = function() {
  var this$1 = this;

  for (var i = this.context.length - 1; i >= 1; i--) {
    var context = this$1.context[i];
    if (context.token === "function")
      { return context.generator }
  }
  return false
};

pp$7.updateContext = function(prevType) {
  var update, type = this.type;
  if (type.keyword && prevType == types.dot)
    { this.exprAllowed = false; }
  else if (update = type.updateContext)
    { update.call(this, prevType); }
  else
    { this.exprAllowed = type.beforeExpr; }
};

// Token-specific context update code

types.parenR.updateContext = types.braceR.updateContext = function() {
  if (this.context.length == 1) {
    this.exprAllowed = true;
    return
  }
  var out = this.context.pop();
  if (out === types$1.b_stat && this.curContext().token === "function") {
    out = this.context.pop();
  }
  this.exprAllowed = !out.isExpr;
};

types.braceL.updateContext = function(prevType) {
  this.context.push(this.braceIsBlock(prevType) ? types$1.b_stat : types$1.b_expr);
  this.exprAllowed = true;
};

types.dollarBraceL.updateContext = function() {
  this.context.push(types$1.b_tmpl);
  this.exprAllowed = true;
};

types.parenL.updateContext = function(prevType) {
  var statementParens = prevType === types._if || prevType === types._for || prevType === types._with || prevType === types._while;
  this.context.push(statementParens ? types$1.p_stat : types$1.p_expr);
  this.exprAllowed = true;
};

types.incDec.updateContext = function() {
  // tokExprAllowed stays unchanged
};

types._function.updateContext = types._class.updateContext = function(prevType) {
  if (prevType.beforeExpr && prevType !== types.semi && prevType !== types._else &&
      !((prevType === types.colon || prevType === types.braceL) && this.curContext() === types$1.b_stat))
    { this.context.push(types$1.f_expr); }
  else
    { this.context.push(types$1.f_stat); }
  this.exprAllowed = false;
};

types.backQuote.updateContext = function() {
  if (this.curContext() === types$1.q_tmpl)
    { this.context.pop(); }
  else
    { this.context.push(types$1.q_tmpl); }
  this.exprAllowed = false;
};

types.star.updateContext = function(prevType) {
  if (prevType == types._function) {
    var index = this.context.length - 1;
    if (this.context[index] === types$1.f_expr)
      { this.context[index] = types$1.f_expr_gen; }
    else
      { this.context[index] = types$1.f_gen; }
  }
  this.exprAllowed = true;
};

types.name.updateContext = function(prevType) {
  var allowed = false;
  if (this.options.ecmaVersion >= 6) {
    if (this.value == "of" && !this.exprAllowed ||
        this.value == "yield" && this.inGeneratorContext())
      { allowed = true; }
  }
  this.exprAllowed = allowed;
};

var data = {
  "$LONE": [
    "ASCII",
    "ASCII_Hex_Digit",
    "AHex",
    "Alphabetic",
    "Alpha",
    "Any",
    "Assigned",
    "Bidi_Control",
    "Bidi_C",
    "Bidi_Mirrored",
    "Bidi_M",
    "Case_Ignorable",
    "CI",
    "Cased",
    "Changes_When_Casefolded",
    "CWCF",
    "Changes_When_Casemapped",
    "CWCM",
    "Changes_When_Lowercased",
    "CWL",
    "Changes_When_NFKC_Casefolded",
    "CWKCF",
    "Changes_When_Titlecased",
    "CWT",
    "Changes_When_Uppercased",
    "CWU",
    "Dash",
    "Default_Ignorable_Code_Point",
    "DI",
    "Deprecated",
    "Dep",
    "Diacritic",
    "Dia",
    "Emoji",
    "Emoji_Component",
    "Emoji_Modifier",
    "Emoji_Modifier_Base",
    "Emoji_Presentation",
    "Extender",
    "Ext",
    "Grapheme_Base",
    "Gr_Base",
    "Grapheme_Extend",
    "Gr_Ext",
    "Hex_Digit",
    "Hex",
    "IDS_Binary_Operator",
    "IDSB",
    "IDS_Trinary_Operator",
    "IDST",
    "ID_Continue",
    "IDC",
    "ID_Start",
    "IDS",
    "Ideographic",
    "Ideo",
    "Join_Control",
    "Join_C",
    "Logical_Order_Exception",
    "LOE",
    "Lowercase",
    "Lower",
    "Math",
    "Noncharacter_Code_Point",
    "NChar",
    "Pattern_Syntax",
    "Pat_Syn",
    "Pattern_White_Space",
    "Pat_WS",
    "Quotation_Mark",
    "QMark",
    "Radical",
    "Regional_Indicator",
    "RI",
    "Sentence_Terminal",
    "STerm",
    "Soft_Dotted",
    "SD",
    "Terminal_Punctuation",
    "Term",
    "Unified_Ideograph",
    "UIdeo",
    "Uppercase",
    "Upper",
    "Variation_Selector",
    "VS",
    "White_Space",
    "space",
    "XID_Continue",
    "XIDC",
    "XID_Start",
    "XIDS"
  ],
  "General_Category": [
    "Cased_Letter",
    "LC",
    "Close_Punctuation",
    "Pe",
    "Connector_Punctuation",
    "Pc",
    "Control",
    "Cc",
    "cntrl",
    "Currency_Symbol",
    "Sc",
    "Dash_Punctuation",
    "Pd",
    "Decimal_Number",
    "Nd",
    "digit",
    "Enclosing_Mark",
    "Me",
    "Final_Punctuation",
    "Pf",
    "Format",
    "Cf",
    "Initial_Punctuation",
    "Pi",
    "Letter",
    "L",
    "Letter_Number",
    "Nl",
    "Line_Separator",
    "Zl",
    "Lowercase_Letter",
    "Ll",
    "Mark",
    "M",
    "Combining_Mark",
    "Math_Symbol",
    "Sm",
    "Modifier_Letter",
    "Lm",
    "Modifier_Symbol",
    "Sk",
    "Nonspacing_Mark",
    "Mn",
    "Number",
    "N",
    "Open_Punctuation",
    "Ps",
    "Other",
    "C",
    "Other_Letter",
    "Lo",
    "Other_Number",
    "No",
    "Other_Punctuation",
    "Po",
    "Other_Symbol",
    "So",
    "Paragraph_Separator",
    "Zp",
    "Private_Use",
    "Co",
    "Punctuation",
    "P",
    "punct",
    "Separator",
    "Z",
    "Space_Separator",
    "Zs",
    "Spacing_Mark",
    "Mc",
    "Surrogate",
    "Cs",
    "Symbol",
    "S",
    "Titlecase_Letter",
    "Lt",
    "Unassigned",
    "Cn",
    "Uppercase_Letter",
    "Lu"
  ],
  "Script": [
    "Adlam",
    "Adlm",
    "Ahom",
    "Anatolian_Hieroglyphs",
    "Hluw",
    "Arabic",
    "Arab",
    "Armenian",
    "Armn",
    "Avestan",
    "Avst",
    "Balinese",
    "Bali",
    "Bamum",
    "Bamu",
    "Bassa_Vah",
    "Bass",
    "Batak",
    "Batk",
    "Bengali",
    "Beng",
    "Bhaiksuki",
    "Bhks",
    "Bopomofo",
    "Bopo",
    "Brahmi",
    "Brah",
    "Braille",
    "Brai",
    "Buginese",
    "Bugi",
    "Buhid",
    "Buhd",
    "Canadian_Aboriginal",
    "Cans",
    "Carian",
    "Cari",
    "Caucasian_Albanian",
    "Aghb",
    "Chakma",
    "Cakm",
    "Cham",
    "Cherokee",
    "Cher",
    "Common",
    "Zyyy",
    "Coptic",
    "Copt",
    "Qaac",
    "Cuneiform",
    "Xsux",
    "Cypriot",
    "Cprt",
    "Cyrillic",
    "Cyrl",
    "Deseret",
    "Dsrt",
    "Devanagari",
    "Deva",
    "Duployan",
    "Dupl",
    "Egyptian_Hieroglyphs",
    "Egyp",
    "Elbasan",
    "Elba",
    "Ethiopic",
    "Ethi",
    "Georgian",
    "Geor",
    "Glagolitic",
    "Glag",
    "Gothic",
    "Goth",
    "Grantha",
    "Gran",
    "Greek",
    "Grek",
    "Gujarati",
    "Gujr",
    "Gurmukhi",
    "Guru",
    "Han",
    "Hani",
    "Hangul",
    "Hang",
    "Hanunoo",
    "Hano",
    "Hatran",
    "Hatr",
    "Hebrew",
    "Hebr",
    "Hiragana",
    "Hira",
    "Imperial_Aramaic",
    "Armi",
    "Inherited",
    "Zinh",
    "Qaai",
    "Inscriptional_Pahlavi",
    "Phli",
    "Inscriptional_Parthian",
    "Prti",
    "Javanese",
    "Java",
    "Kaithi",
    "Kthi",
    "Kannada",
    "Knda",
    "Katakana",
    "Kana",
    "Kayah_Li",
    "Kali",
    "Kharoshthi",
    "Khar",
    "Khmer",
    "Khmr",
    "Khojki",
    "Khoj",
    "Khudawadi",
    "Sind",
    "Lao",
    "Laoo",
    "Latin",
    "Latn",
    "Lepcha",
    "Lepc",
    "Limbu",
    "Limb",
    "Linear_A",
    "Lina",
    "Linear_B",
    "Linb",
    "Lisu",
    "Lycian",
    "Lyci",
    "Lydian",
    "Lydi",
    "Mahajani",
    "Mahj",
    "Malayalam",
    "Mlym",
    "Mandaic",
    "Mand",
    "Manichaean",
    "Mani",
    "Marchen",
    "Marc",
    "Masaram_Gondi",
    "Gonm",
    "Meetei_Mayek",
    "Mtei",
    "Mende_Kikakui",
    "Mend",
    "Meroitic_Cursive",
    "Merc",
    "Meroitic_Hieroglyphs",
    "Mero",
    "Miao",
    "Plrd",
    "Modi",
    "Mongolian",
    "Mong",
    "Mro",
    "Mroo",
    "Multani",
    "Mult",
    "Myanmar",
    "Mymr",
    "Nabataean",
    "Nbat",
    "New_Tai_Lue",
    "Talu",
    "Newa",
    "Nko",
    "Nkoo",
    "Nushu",
    "Nshu",
    "Ogham",
    "Ogam",
    "Ol_Chiki",
    "Olck",
    "Old_Hungarian",
    "Hung",
    "Old_Italic",
    "Ital",
    "Old_North_Arabian",
    "Narb",
    "Old_Permic",
    "Perm",
    "Old_Persian",
    "Xpeo",
    "Old_South_Arabian",
    "Sarb",
    "Old_Turkic",
    "Orkh",
    "Oriya",
    "Orya",
    "Osage",
    "Osge",
    "Osmanya",
    "Osma",
    "Pahawh_Hmong",
    "Hmng",
    "Palmyrene",
    "Palm",
    "Pau_Cin_Hau",
    "Pauc",
    "Phags_Pa",
    "Phag",
    "Phoenician",
    "Phnx",
    "Psalter_Pahlavi",
    "Phlp",
    "Rejang",
    "Rjng",
    "Runic",
    "Runr",
    "Samaritan",
    "Samr",
    "Saurashtra",
    "Saur",
    "Sharada",
    "Shrd",
    "Shavian",
    "Shaw",
    "Siddham",
    "Sidd",
    "SignWriting",
    "Sgnw",
    "Sinhala",
    "Sinh",
    "Sora_Sompeng",
    "Sora",
    "Soyombo",
    "Soyo",
    "Sundanese",
    "Sund",
    "Syloti_Nagri",
    "Sylo",
    "Syriac",
    "Syrc",
    "Tagalog",
    "Tglg",
    "Tagbanwa",
    "Tagb",
    "Tai_Le",
    "Tale",
    "Tai_Tham",
    "Lana",
    "Tai_Viet",
    "Tavt",
    "Takri",
    "Takr",
    "Tamil",
    "Taml",
    "Tangut",
    "Tang",
    "Telugu",
    "Telu",
    "Thaana",
    "Thaa",
    "Thai",
    "Tibetan",
    "Tibt",
    "Tifinagh",
    "Tfng",
    "Tirhuta",
    "Tirh",
    "Ugaritic",
    "Ugar",
    "Vai",
    "Vaii",
    "Warang_Citi",
    "Wara",
    "Yi",
    "Yiii",
    "Zanabazar_Square",
    "Zanb"
  ]
};
Array.prototype.push.apply(data.$LONE, data.General_Category);
data.gc = data.General_Category;
data.sc = data.Script_Extensions = data.scx = data.Script;

var pp$9 = Parser.prototype;

var RegExpValidationState = function RegExpValidationState(parser) {
  this.parser = parser;
  this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "");
  this.source = "";
  this.flags = "";
  this.start = 0;
  this.switchU = false;
  this.switchN = false;
  this.pos = 0;
  this.lastIntValue = 0;
  this.lastStringValue = "";
  this.lastAssertionIsQuantifiable = false;
  this.numCapturingParens = 0;
  this.maxBackReference = 0;
  this.groupNames = [];
  this.backReferenceNames = [];
};

RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
  var unicode = flags.indexOf("u") !== -1;
  this.start = start | 0;
  this.source = pattern + "";
  this.flags = flags;
  this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
  this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
};

RegExpValidationState.prototype.raise = function raise (message) {
  this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
};

// If u flag is given, this returns the code point at the index (it combines a surrogate pair).
// Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
RegExpValidationState.prototype.at = function at (i) {
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return -1
  }
  var c = s.charCodeAt(i);
  if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
    return c
  }
  return (c << 10) + s.charCodeAt(i + 1) - 0x35FDC00
};

RegExpValidationState.prototype.nextIndex = function nextIndex (i) {
  var s = this.source;
  var l = s.length;
  if (i >= l) {
    return l
  }
  var c = s.charCodeAt(i);
  if (!this.switchU || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
    return i + 1
  }
  return i + 2
};

RegExpValidationState.prototype.current = function current () {
  return this.at(this.pos)
};

RegExpValidationState.prototype.lookahead = function lookahead () {
  return this.at(this.nextIndex(this.pos))
};

RegExpValidationState.prototype.advance = function advance () {
  this.pos = this.nextIndex(this.pos);
};

RegExpValidationState.prototype.eat = function eat (ch) {
  if (this.current() === ch) {
    this.advance();
    return true
  }
  return false
};

function codePointToString$1(ch) {
  if (ch <= 0xFFFF) { return String.fromCharCode(ch) }
  ch -= 0x10000;
  return String.fromCharCode((ch >> 10) + 0xD800, (ch & 0x03FF) + 0xDC00)
}

/**
 * Validate the flags part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$9.validateRegExpFlags = function(state) {
  var this$1 = this;

  var validFlags = state.validFlags;
  var flags = state.flags;

  for (var i = 0; i < flags.length; i++) {
    var flag = flags.charAt(i);
    if (validFlags.indexOf(flag) == -1) {
      this$1.raise(state.start, "Invalid regular expression flag");
    }
    if (flags.indexOf(flag, i + 1) > -1) {
      this$1.raise(state.start, "Duplicate regular expression flag");
    }
  }
};

/**
 * Validate the pattern part of a given RegExpLiteral.
 *
 * @param {RegExpValidationState} state The state to validate RegExp.
 * @returns {void}
 */
pp$9.validateRegExpPattern = function(state) {
  this.regexp_pattern(state);

  // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
  // parsing contains a |GroupName|, reparse with the goal symbol
  // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
  // exception if _P_ did not conform to the grammar, if any elements of _P_
  // were not matched by the parse, or if any Early Error conditions exist.
  if (!state.switchN && this.options.ecmaVersion >= 9 && state.groupNames.length > 0) {
    state.switchN = true;
    this.regexp_pattern(state);
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
pp$9.regexp_pattern = function(state) {
  state.pos = 0;
  state.lastIntValue = 0;
  state.lastStringValue = "";
  state.lastAssertionIsQuantifiable = false;
  state.numCapturingParens = 0;
  state.maxBackReference = 0;
  state.groupNames.length = 0;
  state.backReferenceNames.length = 0;

  this.regexp_disjunction(state);

  if (state.pos !== state.source.length) {
    // Make the same messages as V8.
    if (state.eat(0x29 /* ) */)) {
      state.raise("Unmatched ')'");
    }
    if (state.eat(0x5D /* [ */) || state.eat(0x7D /* } */)) {
      state.raise("Lone quantifier brackets");
    }
  }
  if (state.maxBackReference > state.numCapturingParens) {
    state.raise("Invalid escape");
  }
  for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
    var name = list[i];

    if (state.groupNames.indexOf(name) === -1) {
      state.raise("Invalid named capture referenced");
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
pp$9.regexp_disjunction = function(state) {
  var this$1 = this;

  this.regexp_alternative(state);
  while (state.eat(0x7C /* | */)) {
    this$1.regexp_alternative(state);
  }

  // Make the same message as V8.
  if (this.regexp_eatQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  if (state.eat(0x7B /* { */)) {
    state.raise("Lone quantifier brackets");
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
pp$9.regexp_alternative = function(state) {
  while (state.pos < state.source.length && this.regexp_eatTerm(state))
    {  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
pp$9.regexp_eatTerm = function(state) {
  if (this.regexp_eatAssertion(state)) {
    // Handle `QuantifiableAssertion Quantifier` alternative.
    // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
    // is a QuantifiableAssertion.
    if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
      // Make the same message as V8.
      if (state.switchU) {
        state.raise("Invalid quantifier");
      }
    }
    return true
  }

  if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
    this.regexp_eatQuantifier(state);
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
pp$9.regexp_eatAssertion = function(state) {
  var start = state.pos;
  state.lastAssertionIsQuantifiable = false;

  // ^, $
  if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
    return true
  }

  // \b \B
  if (state.eat(0x5C /* \ */)) {
    if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
      return true
    }
    state.pos = start;
  }

  // Lookahead / Lookbehind
  if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
    var lookbehind = false;
    if (this.options.ecmaVersion >= 9) {
      lookbehind = state.eat(0x3C /* < */);
    }
    if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
      this.regexp_disjunction(state);
      if (!state.eat(0x29 /* ) */)) {
        state.raise("Unterminated group");
      }
      state.lastAssertionIsQuantifiable = !lookbehind;
      return true
    }
  }

  state.pos = start;
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
pp$9.regexp_eatQuantifier = function(state, noError) {
  if ( noError === void 0 ) noError = false;

  if (this.regexp_eatQuantifierPrefix(state, noError)) {
    state.eat(0x3F /* ? */);
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
pp$9.regexp_eatQuantifierPrefix = function(state, noError) {
  return (
    state.eat(0x2A /* * */) ||
    state.eat(0x2B /* + */) ||
    state.eat(0x3F /* ? */) ||
    this.regexp_eatBracedQuantifier(state, noError)
  )
};
pp$9.regexp_eatBracedQuantifier = function(state, noError) {
  var start = state.pos;
  if (state.eat(0x7B /* { */)) {
    var min = 0, max = -1;
    if (this.regexp_eatDecimalDigits(state)) {
      min = state.lastIntValue;
      if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
        max = state.lastIntValue;
      }
      if (state.eat(0x7D /* } */)) {
        // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
        if (max !== -1 && max < min && !noError) {
          state.raise("numbers out of order in {} quantifier");
        }
        return true
      }
    }
    if (state.switchU && !noError) {
      state.raise("Incomplete quantifier");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
pp$9.regexp_eatAtom = function(state) {
  return (
    this.regexp_eatPatternCharacters(state) ||
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state)
  )
};
pp$9.regexp_eatReverseSolidusAtomEscape = function(state) {
  var start = state.pos;
  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatAtomEscape(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatUncapturingGroup = function(state) {
  var start = state.pos;
  if (state.eat(0x28 /* ( */)) {
    if (state.eat(0x3F /* ? */) && state.eat(0x3A /* : */)) {
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        return true
      }
      state.raise("Unterminated group");
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatCapturingGroup = function(state) {
  if (state.eat(0x28 /* ( */)) {
    if (this.options.ecmaVersion >= 9) {
      this.regexp_groupSpecifier(state);
    } else if (state.current() === 0x3F /* ? */) {
      state.raise("Invalid group");
    }
    this.regexp_disjunction(state);
    if (state.eat(0x29 /* ) */)) {
      state.numCapturingParens += 1;
      return true
    }
    state.raise("Unterminated group");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
pp$9.regexp_eatExtendedAtom = function(state) {
  return (
    state.eat(0x2E /* . */) ||
    this.regexp_eatReverseSolidusAtomEscape(state) ||
    this.regexp_eatCharacterClass(state) ||
    this.regexp_eatUncapturingGroup(state) ||
    this.regexp_eatCapturingGroup(state) ||
    this.regexp_eatInvalidBracedQuantifier(state) ||
    this.regexp_eatExtendedPatternCharacter(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
pp$9.regexp_eatInvalidBracedQuantifier = function(state) {
  if (this.regexp_eatBracedQuantifier(state, true)) {
    state.raise("Nothing to repeat");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
pp$9.regexp_eatSyntaxCharacter = function(state) {
  var ch = state.current();
  if (isSyntaxCharacter(ch)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }
  return false
};
function isSyntaxCharacter(ch) {
  return (
    ch === 0x24 /* $ */ ||
    ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
    ch === 0x2E /* . */ ||
    ch === 0x3F /* ? */ ||
    ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
    ch >= 0x7B /* { */ && ch <= 0x7D /* } */
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
// But eat eager.
pp$9.regexp_eatPatternCharacters = function(state) {
  var start = state.pos;
  var ch = 0;
  while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
    state.advance();
  }
  return state.pos !== start
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
pp$9.regexp_eatExtendedPatternCharacter = function(state) {
  var ch = state.current();
  if (
    ch !== -1 &&
    ch !== 0x24 /* $ */ &&
    !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
    ch !== 0x2E /* . */ &&
    ch !== 0x3F /* ? */ &&
    ch !== 0x5B /* [ */ &&
    ch !== 0x5E /* ^ */ &&
    ch !== 0x7C /* | */
  ) {
    state.advance();
    return true
  }
  return false
};

// GroupSpecifier[U] ::
//   [empty]
//   `?` GroupName[?U]
pp$9.regexp_groupSpecifier = function(state) {
  if (state.eat(0x3F /* ? */)) {
    if (this.regexp_eatGroupName(state)) {
      if (state.groupNames.indexOf(state.lastStringValue) !== -1) {
        state.raise("Duplicate capture group name");
      }
      state.groupNames.push(state.lastStringValue);
      return
    }
    state.raise("Invalid group");
  }
};

// GroupName[U] ::
//   `<` RegExpIdentifierName[?U] `>`
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$9.regexp_eatGroupName = function(state) {
  state.lastStringValue = "";
  if (state.eat(0x3C /* < */)) {
    if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
      return true
    }
    state.raise("Invalid capture group name");
  }
  return false
};

// RegExpIdentifierName[U] ::
//   RegExpIdentifierStart[?U]
//   RegExpIdentifierName[?U] RegExpIdentifierPart[?U]
// Note: this updates `state.lastStringValue` property with the eaten name.
pp$9.regexp_eatRegExpIdentifierName = function(state) {
  state.lastStringValue = "";
  if (this.regexp_eatRegExpIdentifierStart(state)) {
    state.lastStringValue += codePointToString$1(state.lastIntValue);
    while (this.regexp_eatRegExpIdentifierPart(state)) {
      state.lastStringValue += codePointToString$1(state.lastIntValue);
    }
    return true
  }
  return false
};

// RegExpIdentifierStart[U] ::
//   UnicodeIDStart
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[?U]
pp$9.regexp_eatRegExpIdentifierStart = function(state) {
  var start = state.pos;
  var ch = state.current();
  state.advance();

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierStart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierStart(ch) {
  return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
}

// RegExpIdentifierPart[U] ::
//   UnicodeIDContinue
//   `$`
//   `_`
//   `\` RegExpUnicodeEscapeSequence[?U]
//   <ZWNJ>
//   <ZWJ>
pp$9.regexp_eatRegExpIdentifierPart = function(state) {
  var start = state.pos;
  var ch = state.current();
  state.advance();

  if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state)) {
    ch = state.lastIntValue;
  }
  if (isRegExpIdentifierPart(ch)) {
    state.lastIntValue = ch;
    return true
  }

  state.pos = start;
  return false
};
function isRegExpIdentifierPart(ch) {
  return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
pp$9.regexp_eatAtomEscape = function(state) {
  if (
    this.regexp_eatBackReference(state) ||
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state) ||
    (state.switchN && this.regexp_eatKGroupName(state))
  ) {
    return true
  }
  if (state.switchU) {
    // Make the same message as V8.
    if (state.current() === 0x63 /* c */) {
      state.raise("Invalid unicode escape");
    }
    state.raise("Invalid escape");
  }
  return false
};
pp$9.regexp_eatBackReference = function(state) {
  var start = state.pos;
  if (this.regexp_eatDecimalEscape(state)) {
    var n = state.lastIntValue;
    if (state.switchU) {
      // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
      if (n > state.maxBackReference) {
        state.maxBackReference = n;
      }
      return true
    }
    if (n <= state.numCapturingParens) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatKGroupName = function(state) {
  if (state.eat(0x6B /* k */)) {
    if (this.regexp_eatGroupName(state)) {
      state.backReferenceNames.push(state.lastStringValue);
      return true
    }
    state.raise("Invalid named reference");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
pp$9.regexp_eatCharacterEscape = function(state) {
  return (
    this.regexp_eatControlEscape(state) ||
    this.regexp_eatCControlLetter(state) ||
    this.regexp_eatZero(state) ||
    this.regexp_eatHexEscapeSequence(state) ||
    this.regexp_eatRegExpUnicodeEscapeSequence(state) ||
    (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
    this.regexp_eatIdentityEscape(state)
  )
};
pp$9.regexp_eatCControlLetter = function(state) {
  var start = state.pos;
  if (state.eat(0x63 /* c */)) {
    if (this.regexp_eatControlLetter(state)) {
      return true
    }
    state.pos = start;
  }
  return false
};
pp$9.regexp_eatZero = function(state) {
  if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
    state.lastIntValue = 0;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
pp$9.regexp_eatControlEscape = function(state) {
  var ch = state.current();
  if (ch === 0x74 /* t */) {
    state.lastIntValue = 0x09; /* \t */
    state.advance();
    return true
  }
  if (ch === 0x6E /* n */) {
    state.lastIntValue = 0x0A; /* \n */
    state.advance();
    return true
  }
  if (ch === 0x76 /* v */) {
    state.lastIntValue = 0x0B; /* \v */
    state.advance();
    return true
  }
  if (ch === 0x66 /* f */) {
    state.lastIntValue = 0x0C; /* \f */
    state.advance();
    return true
  }
  if (ch === 0x72 /* r */) {
    state.lastIntValue = 0x0D; /* \r */
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
pp$9.regexp_eatControlLetter = function(state) {
  var ch = state.current();
  if (isControlLetter(ch)) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};
function isControlLetter(ch) {
  return (
    (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
    (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
  )
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
pp$9.regexp_eatRegExpUnicodeEscapeSequence = function(state) {
  var start = state.pos;

  if (state.eat(0x75 /* u */)) {
    if (this.regexp_eatFixedHexDigits(state, 4)) {
      var lead = state.lastIntValue;
      if (state.switchU && lead >= 0xD800 && lead <= 0xDBFF) {
        var leadSurrogateEnd = state.pos;
        if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
          var trail = state.lastIntValue;
          if (trail >= 0xDC00 && trail <= 0xDFFF) {
            state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
            return true
          }
        }
        state.pos = leadSurrogateEnd;
        state.lastIntValue = lead;
      }
      return true
    }
    if (
      state.switchU &&
      state.eat(0x7B /* { */) &&
      this.regexp_eatHexDigits(state) &&
      state.eat(0x7D /* } */) &&
      isValidUnicode(state.lastIntValue)
    ) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid unicode escape");
    }
    state.pos = start;
  }

  return false
};
function isValidUnicode(ch) {
  return ch >= 0 && ch <= 0x10FFFF
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
pp$9.regexp_eatIdentityEscape = function(state) {
  if (state.switchU) {
    if (this.regexp_eatSyntaxCharacter(state)) {
      return true
    }
    if (state.eat(0x2F /* / */)) {
      state.lastIntValue = 0x2F; /* / */
      return true
    }
    return false
  }

  var ch = state.current();
  if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
pp$9.regexp_eatDecimalEscape = function(state) {
  state.lastIntValue = 0;
  var ch = state.current();
  if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
    do {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
pp$9.regexp_eatCharacterClassEscape = function(state) {
  var ch = state.current();

  if (isCharacterClassEscape(ch)) {
    state.lastIntValue = -1;
    state.advance();
    return true
  }

  if (
    state.switchU &&
    this.options.ecmaVersion >= 9 &&
    (ch === 0x50 /* P */ || ch === 0x70 /* p */)
  ) {
    state.lastIntValue = -1;
    state.advance();
    if (
      state.eat(0x7B /* { */) &&
      this.regexp_eatUnicodePropertyValueExpression(state) &&
      state.eat(0x7D /* } */)
    ) {
      return true
    }
    state.raise("Invalid property name");
  }

  return false
};
function isCharacterClassEscape(ch) {
  return (
    ch === 0x64 /* d */ ||
    ch === 0x44 /* D */ ||
    ch === 0x73 /* s */ ||
    ch === 0x53 /* S */ ||
    ch === 0x77 /* w */ ||
    ch === 0x57 /* W */
  )
}

// UnicodePropertyValueExpression ::
//   UnicodePropertyName `=` UnicodePropertyValue
//   LoneUnicodePropertyNameOrValue
pp$9.regexp_eatUnicodePropertyValueExpression = function(state) {
  var start = state.pos;

  // UnicodePropertyName `=` UnicodePropertyValue
  if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
    var name = state.lastStringValue;
    if (this.regexp_eatUnicodePropertyValue(state)) {
      var value = state.lastStringValue;
      this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
      return true
    }
  }
  state.pos = start;

  // LoneUnicodePropertyNameOrValue
  if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
    var nameOrValue = state.lastStringValue;
    this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
    return true
  }
  return false
};
pp$9.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
  if (!data.hasOwnProperty(name) || data[name].indexOf(value) === -1) {
    state.raise("Invalid property name");
  }
};
pp$9.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
  if (data.$LONE.indexOf(nameOrValue) === -1) {
    state.raise("Invalid property name");
  }
};

// UnicodePropertyName ::
//   UnicodePropertyNameCharacters
pp$9.regexp_eatUnicodePropertyName = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyNameCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString$1(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyNameCharacter(ch) {
  return isControlLetter(ch) || ch === 0x5F /* _ */
}

// UnicodePropertyValue ::
//   UnicodePropertyValueCharacters
pp$9.regexp_eatUnicodePropertyValue = function(state) {
  var ch = 0;
  state.lastStringValue = "";
  while (isUnicodePropertyValueCharacter(ch = state.current())) {
    state.lastStringValue += codePointToString$1(ch);
    state.advance();
  }
  return state.lastStringValue !== ""
};
function isUnicodePropertyValueCharacter(ch) {
  return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
}

// LoneUnicodePropertyNameOrValue ::
//   UnicodePropertyValueCharacters
pp$9.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
  return this.regexp_eatUnicodePropertyValue(state)
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
pp$9.regexp_eatCharacterClass = function(state) {
  if (state.eat(0x5B /* [ */)) {
    state.eat(0x5E /* ^ */);
    this.regexp_classRanges(state);
    if (state.eat(0x5D /* [ */)) {
      return true
    }
    // Unreachable since it threw "unterminated regular expression" error before.
    state.raise("Unterminated character class");
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
// https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
pp$9.regexp_classRanges = function(state) {
  var this$1 = this;

  while (this.regexp_eatClassAtom(state)) {
    var left = state.lastIntValue;
    if (state.eat(0x2D /* - */) && this$1.regexp_eatClassAtom(state)) {
      var right = state.lastIntValue;
      if (state.switchU && (left === -1 || right === -1)) {
        state.raise("Invalid character class");
      }
      if (left !== -1 && right !== -1 && left > right) {
        state.raise("Range out of order in character class");
      }
    }
  }
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
// https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
pp$9.regexp_eatClassAtom = function(state) {
  var start = state.pos;

  if (state.eat(0x5C /* \ */)) {
    if (this.regexp_eatClassEscape(state)) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      var ch$1 = state.current();
      if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
        state.raise("Invalid class escape");
      }
      state.raise("Invalid escape");
    }
    state.pos = start;
  }

  var ch = state.current();
  if (ch !== 0x5D /* [ */) {
    state.lastIntValue = ch;
    state.advance();
    return true
  }

  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
pp$9.regexp_eatClassEscape = function(state) {
  var start = state.pos;

  if (state.eat(0x62 /* b */)) {
    state.lastIntValue = 0x08; /* <BS> */
    return true
  }

  if (state.switchU && state.eat(0x2D /* - */)) {
    state.lastIntValue = 0x2D; /* - */
    return true
  }

  if (!state.switchU && state.eat(0x63 /* c */)) {
    if (this.regexp_eatClassControlLetter(state)) {
      return true
    }
    state.pos = start;
  }

  return (
    this.regexp_eatCharacterClassEscape(state) ||
    this.regexp_eatCharacterEscape(state)
  )
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
pp$9.regexp_eatClassControlLetter = function(state) {
  var ch = state.current();
  if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
    state.lastIntValue = ch % 0x20;
    state.advance();
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$9.regexp_eatHexEscapeSequence = function(state) {
  var start = state.pos;
  if (state.eat(0x78 /* x */)) {
    if (this.regexp_eatFixedHexDigits(state, 2)) {
      return true
    }
    if (state.switchU) {
      state.raise("Invalid escape");
    }
    state.pos = start;
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
pp$9.regexp_eatDecimalDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isDecimalDigit(ch = state.current())) {
    state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
    state.advance();
  }
  return state.pos !== start
};
function isDecimalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
pp$9.regexp_eatHexDigits = function(state) {
  var start = state.pos;
  var ch = 0;
  state.lastIntValue = 0;
  while (isHexDigit(ch = state.current())) {
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return state.pos !== start
};
function isHexDigit(ch) {
  return (
    (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
    (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
    (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
  )
}
function hexToInt(ch) {
  if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
    return 10 + (ch - 0x41 /* A */)
  }
  if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
    return 10 + (ch - 0x61 /* a */)
  }
  return ch - 0x30 /* 0 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
// Allows only 0-377(octal) i.e. 0-255(decimal).
pp$9.regexp_eatLegacyOctalEscapeSequence = function(state) {
  if (this.regexp_eatOctalDigit(state)) {
    var n1 = state.lastIntValue;
    if (this.regexp_eatOctalDigit(state)) {
      var n2 = state.lastIntValue;
      if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
        state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
      } else {
        state.lastIntValue = n1 * 8 + n2;
      }
    } else {
      state.lastIntValue = n1;
    }
    return true
  }
  return false
};

// https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
pp$9.regexp_eatOctalDigit = function(state) {
  var ch = state.current();
  if (isOctalDigit(ch)) {
    state.lastIntValue = ch - 0x30; /* 0 */
    state.advance();
    return true
  }
  state.lastIntValue = 0;
  return false
};
function isOctalDigit(ch) {
  return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
}

// https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
// https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
// And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
pp$9.regexp_eatFixedHexDigits = function(state, length) {
  var start = state.pos;
  state.lastIntValue = 0;
  for (var i = 0; i < length; ++i) {
    var ch = state.current();
    if (!isHexDigit(ch)) {
      state.pos = start;
      return false
    }
    state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
    state.advance();
  }
  return true
};

// Object type used to represent tokens. Note that normally, tokens
// simply exist as properties on the parser object. This is only
// used for the onToken callback and the external tokenizer.

var Token = function Token(p) {
  this.type = p.type;
  this.value = p.value;
  this.start = p.start;
  this.end = p.end;
  if (p.options.locations)
    { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
  if (p.options.ranges)
    { this.range = [p.start, p.end]; }
};

// ## Tokenizer

var pp$8 = Parser.prototype;

// Move to the next token

pp$8.next = function() {
  if (this.options.onToken)
    { this.options.onToken(new Token(this)); }

  this.lastTokEnd = this.end;
  this.lastTokStart = this.start;
  this.lastTokEndLoc = this.endLoc;
  this.lastTokStartLoc = this.startLoc;
  this.nextToken();
};

pp$8.getToken = function() {
  this.next();
  return new Token(this)
};

// If we're in an ES6 environment, make parsers iterable
if (typeof Symbol !== "undefined")
  { pp$8[Symbol.iterator] = function() {
    var this$1 = this;

    return {
      next: function () {
        var token = this$1.getToken();
        return {
          done: token.type === types.eof,
          value: token
        }
      }
    }
  }; }

// Toggle strict mode. Re-reads the next number or string to please
// pedantic tests (`"use strict"; 010;` should fail).

pp$8.curContext = function() {
  return this.context[this.context.length - 1]
};

// Read a single token, updating the parser object's token-related
// properties.

pp$8.nextToken = function() {
  var curContext = this.curContext();
  if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

  this.start = this.pos;
  if (this.options.locations) { this.startLoc = this.curPosition(); }
  if (this.pos >= this.input.length) { return this.finishToken(types.eof) }

  if (curContext.override) { return curContext.override(this) }
  else { this.readToken(this.fullCharCodeAtPos()); }
};

pp$8.readToken = function(code) {
  // Identifier or keyword. '\uXXXX' sequences are allowed in
  // identifiers, so '\' also dispatches to that.
  if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
    { return this.readWord() }

  return this.getTokenFromCode(code)
};

pp$8.fullCharCodeAtPos = function() {
  var code = this.input.charCodeAt(this.pos);
  if (code <= 0xd7ff || code >= 0xe000) { return code }
  var next = this.input.charCodeAt(this.pos + 1);
  return (code << 10) + next - 0x35fdc00
};

pp$8.skipBlockComment = function() {
  var this$1 = this;

  var startLoc = this.options.onComment && this.curPosition();
  var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
  if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
  this.pos = end + 2;
  if (this.options.locations) {
    lineBreakG.lastIndex = start;
    var match;
    while ((match = lineBreakG.exec(this.input)) && match.index < this.pos) {
      ++this$1.curLine;
      this$1.lineStart = match.index + match[0].length;
    }
  }
  if (this.options.onComment)
    { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                           startLoc, this.curPosition()); }
};

pp$8.skipLineComment = function(startSkip) {
  var this$1 = this;

  var start = this.pos;
  var startLoc = this.options.onComment && this.curPosition();
  var ch = this.input.charCodeAt(this.pos += startSkip);
  while (this.pos < this.input.length && !isNewLine(ch)) {
    ch = this$1.input.charCodeAt(++this$1.pos);
  }
  if (this.options.onComment)
    { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                           startLoc, this.curPosition()); }
};

// Called at the start of the parse and after every token. Skips
// whitespace and comments, and.

pp$8.skipSpace = function() {
  var this$1 = this;

  loop: while (this.pos < this.input.length) {
    var ch = this$1.input.charCodeAt(this$1.pos);
    switch (ch) {
    case 32: case 160: // ' '
      ++this$1.pos;
      break
    case 13:
      if (this$1.input.charCodeAt(this$1.pos + 1) === 10) {
        ++this$1.pos;
      }
    case 10: case 8232: case 8233:
      ++this$1.pos;
      if (this$1.options.locations) {
        ++this$1.curLine;
        this$1.lineStart = this$1.pos;
      }
      break
    case 47: // '/'
      switch (this$1.input.charCodeAt(this$1.pos + 1)) {
      case 42: // '*'
        this$1.skipBlockComment();
        break
      case 47:
        this$1.skipLineComment(2);
        break
      default:
        break loop
      }
      break
    default:
      if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++this$1.pos;
      } else {
        break loop
      }
    }
  }
};

// Called at the end of every token. Sets `end`, `val`, and
// maintains `context` and `exprAllowed`, and skips the space after
// the token, so that the next one's `start` will point at the
// right position.

pp$8.finishToken = function(type, val) {
  this.end = this.pos;
  if (this.options.locations) { this.endLoc = this.curPosition(); }
  var prevType = this.type;
  this.type = type;
  this.value = val;

  this.updateContext(prevType);
};

// ### Token reading

// This is the function that is called to fetch the next token. It
// is somewhat obscure, because it works in character codes rather
// than characters, and because operator parsing has been inlined
// into it.
//
// All in the name of speed.
//
pp$8.readToken_dot = function() {
  var next = this.input.charCodeAt(this.pos + 1);
  if (next >= 48 && next <= 57) { return this.readNumber(true) }
  var next2 = this.input.charCodeAt(this.pos + 2);
  if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
    this.pos += 3;
    return this.finishToken(types.ellipsis)
  } else {
    ++this.pos;
    return this.finishToken(types.dot)
  }
};

pp$8.readToken_slash = function() { // '/'
  var next = this.input.charCodeAt(this.pos + 1);
  if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.slash, 1)
};

pp$8.readToken_mult_modulo_exp = function(code) { // '%*'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  var tokentype = code === 42 ? types.star : types.modulo;

  // exponentiation operator ** and **=
  if (this.options.ecmaVersion >= 7 && code == 42 && next === 42) {
    ++size;
    tokentype = types.starstar;
    next = this.input.charCodeAt(this.pos + 2);
  }

  if (next === 61) { return this.finishOp(types.assign, size + 1) }
  return this.finishOp(tokentype, size)
};

pp$8.readToken_pipe_amp = function(code) { // '|&'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) { return this.finishOp(code === 124 ? types.logicalOR : types.logicalAND, 2) }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(code === 124 ? types.bitwiseOR : types.bitwiseAND, 1)
};

pp$8.readToken_caret = function() { // '^'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.bitwiseXOR, 1)
};

pp$8.readToken_plus_min = function(code) { // '+-'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === code) {
    if (next == 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) == 62 &&
        (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
      // A `-->` line comment
      this.skipLineComment(3);
      this.skipSpace();
      return this.nextToken()
    }
    return this.finishOp(types.incDec, 2)
  }
  if (next === 61) { return this.finishOp(types.assign, 2) }
  return this.finishOp(types.plusMin, 1)
};

pp$8.readToken_lt_gt = function(code) { // '<>'
  var next = this.input.charCodeAt(this.pos + 1);
  var size = 1;
  if (next === code) {
    size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
    if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types.assign, size + 1) }
    return this.finishOp(types.bitShift, size)
  }
  if (next == 33 && code == 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) == 45 &&
      this.input.charCodeAt(this.pos + 3) == 45) {
    // `<!--`, an XML-style comment that should be interpreted as a line comment
    this.skipLineComment(4);
    this.skipSpace();
    return this.nextToken()
  }
  if (next === 61) { size = 2; }
  return this.finishOp(types.relational, size)
};

pp$8.readToken_eq_excl = function(code) { // '=!'
  var next = this.input.charCodeAt(this.pos + 1);
  if (next === 61) { return this.finishOp(types.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
  if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
    this.pos += 2;
    return this.finishToken(types.arrow)
  }
  return this.finishOp(code === 61 ? types.eq : types.prefix, 1)
};

pp$8.getTokenFromCode = function(code) {
  switch (code) {
  // The interpretation of a dot depends on whether it is followed
  // by a digit or another two dots.
  case 46: // '.'
    return this.readToken_dot()

  // Punctuation tokens.
  case 40: ++this.pos; return this.finishToken(types.parenL)
  case 41: ++this.pos; return this.finishToken(types.parenR)
  case 59: ++this.pos; return this.finishToken(types.semi)
  case 44: ++this.pos; return this.finishToken(types.comma)
  case 91: ++this.pos; return this.finishToken(types.bracketL)
  case 93: ++this.pos; return this.finishToken(types.bracketR)
  case 123: ++this.pos; return this.finishToken(types.braceL)
  case 125: ++this.pos; return this.finishToken(types.braceR)
  case 58: ++this.pos; return this.finishToken(types.colon)
  case 63: ++this.pos; return this.finishToken(types.question)

  case 96: // '`'
    if (this.options.ecmaVersion < 6) { break }
    ++this.pos;
    return this.finishToken(types.backQuote)

  case 48: // '0'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
    if (this.options.ecmaVersion >= 6) {
      if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
      if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
    }

  // Anything else beginning with a digit is an integer, octal
  // number, or float.
  case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
    return this.readNumber(false)

  // Quotes produce strings.
  case 34: case 39: // '"', "'"
    return this.readString(code)

  // Operators are parsed inline in tiny state machines. '=' (61) is
  // often referred to. `finishOp` simply skips the amount of
  // characters it is given as second argument, and returns a token
  // of the type given by its first argument.

  case 47: // '/'
    return this.readToken_slash()

  case 37: case 42: // '%*'
    return this.readToken_mult_modulo_exp(code)

  case 124: case 38: // '|&'
    return this.readToken_pipe_amp(code)

  case 94: // '^'
    return this.readToken_caret()

  case 43: case 45: // '+-'
    return this.readToken_plus_min(code)

  case 60: case 62: // '<>'
    return this.readToken_lt_gt(code)

  case 61: case 33: // '=!'
    return this.readToken_eq_excl(code)

  case 126: // '~'
    return this.finishOp(types.prefix, 1)
  }

  this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
};

pp$8.finishOp = function(type, size) {
  var str = this.input.slice(this.pos, this.pos + size);
  this.pos += size;
  return this.finishToken(type, str)
};

pp$8.readRegexp = function() {
  var this$1 = this;

  var escaped, inClass, start = this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(start, "Unterminated regular expression"); }
    var ch = this$1.input.charAt(this$1.pos);
    if (lineBreak.test(ch)) { this$1.raise(start, "Unterminated regular expression"); }
    if (!escaped) {
      if (ch === "[") { inClass = true; }
      else if (ch === "]" && inClass) { inClass = false; }
      else if (ch === "/" && !inClass) { break }
      escaped = ch === "\\";
    } else { escaped = false; }
    ++this$1.pos;
  }
  var pattern = this.input.slice(start, this.pos);
  ++this.pos;
  var flagsStart = this.pos;
  var flags = this.readWord1();
  if (this.containsEsc) { this.unexpected(flagsStart); }

  // Validate pattern
  var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
  state.reset(start, pattern, flags);
  this.validateRegExpFlags(state);
  this.validateRegExpPattern(state);

  // Create Literal#value property value.
  var value = null;
  try {
    value = new RegExp(pattern, flags);
  } catch (e) {
    // ESTree requires null if it failed to instantiate RegExp object.
    // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
  }

  return this.finishToken(types.regexp, {pattern: pattern, flags: flags, value: value})
};

// Read an integer in the given radix. Return null if zero digits
// were read, the integer value otherwise. When `len` is given, this
// will return `null` unless the integer has exactly `len` digits.

pp$8.readInt = function(radix, len) {
  var this$1 = this;

  var start = this.pos, total = 0;
  for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    var code = this$1.input.charCodeAt(this$1.pos), val = (void 0);
    if (code >= 97) { val = code - 97 + 10; } // a
    else if (code >= 65) { val = code - 65 + 10; } // A
    else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
    else { val = Infinity; }
    if (val >= radix) { break }
    ++this$1.pos;
    total = total * radix + val;
  }
  if (this.pos === start || len != null && this.pos - start !== len) { return null }

  return total
};

pp$8.readRadixNumber = function(radix) {
  this.pos += 2; // 0x
  var val = this.readInt(radix);
  if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
  return this.finishToken(types.num, val)
};

// Read an integer, octal integer, or floating-point number.

pp$8.readNumber = function(startsWithDot) {
  var start = this.pos;
  if (!startsWithDot && this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
  if (octal && this.strict) { this.raise(start, "Invalid number"); }
  if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
  var next = this.input.charCodeAt(this.pos);
  if (next === 46 && !octal) { // '.'
    ++this.pos;
    this.readInt(10);
    next = this.input.charCodeAt(this.pos);
  }
  if ((next === 69 || next === 101) && !octal) { // 'eE'
    next = this.input.charCodeAt(++this.pos);
    if (next === 43 || next === 45) { ++this.pos; } // '+-'
    if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
  }
  if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

  var str = this.input.slice(start, this.pos);
  var val = octal ? parseInt(str, 8) : parseFloat(str);
  return this.finishToken(types.num, val)
};

// Read a string value, interpreting backslash-escapes.

pp$8.readCodePoint = function() {
  var ch = this.input.charCodeAt(this.pos), code;

  if (ch === 123) { // '{'
    if (this.options.ecmaVersion < 6) { this.unexpected(); }
    var codePos = ++this.pos;
    code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
    ++this.pos;
    if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
  } else {
    code = this.readHexChar(4);
  }
  return code
};

function codePointToString(code) {
  // UTF-16 Decoding
  if (code <= 0xFFFF) { return String.fromCharCode(code) }
  code -= 0x10000;
  return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
}

pp$8.readString = function(quote) {
  var this$1 = this;

  var out = "", chunkStart = ++this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated string constant"); }
    var ch = this$1.input.charCodeAt(this$1.pos);
    if (ch === quote) { break }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos);
      out += this$1.readEscapedChar(false);
      chunkStart = this$1.pos;
    } else {
      if (isNewLine(ch)) { this$1.raise(this$1.start, "Unterminated string constant"); }
      ++this$1.pos;
    }
  }
  out += this.input.slice(chunkStart, this.pos++);
  return this.finishToken(types.string, out)
};

// Reads template string tokens.

var INVALID_TEMPLATE_ESCAPE_ERROR = {};

pp$8.tryReadTemplateToken = function() {
  this.inTemplateElement = true;
  try {
    this.readTmplToken();
  } catch (err) {
    if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
      this.readInvalidTemplateToken();
    } else {
      throw err
    }
  }

  this.inTemplateElement = false;
};

pp$8.invalidStringToken = function(position, message) {
  if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
    throw INVALID_TEMPLATE_ESCAPE_ERROR
  } else {
    this.raise(position, message);
  }
};

pp$8.readTmplToken = function() {
  var this$1 = this;

  var out = "", chunkStart = this.pos;
  for (;;) {
    if (this$1.pos >= this$1.input.length) { this$1.raise(this$1.start, "Unterminated template"); }
    var ch = this$1.input.charCodeAt(this$1.pos);
    if (ch === 96 || ch === 36 && this$1.input.charCodeAt(this$1.pos + 1) === 123) { // '`', '${'
      if (this$1.pos === this$1.start && (this$1.type === types.template || this$1.type === types.invalidTemplate)) {
        if (ch === 36) {
          this$1.pos += 2;
          return this$1.finishToken(types.dollarBraceL)
        } else {
          ++this$1.pos;
          return this$1.finishToken(types.backQuote)
        }
      }
      out += this$1.input.slice(chunkStart, this$1.pos);
      return this$1.finishToken(types.template, out)
    }
    if (ch === 92) { // '\'
      out += this$1.input.slice(chunkStart, this$1.pos);
      out += this$1.readEscapedChar(true);
      chunkStart = this$1.pos;
    } else if (isNewLine(ch)) {
      out += this$1.input.slice(chunkStart, this$1.pos);
      ++this$1.pos;
      switch (ch) {
      case 13:
        if (this$1.input.charCodeAt(this$1.pos) === 10) { ++this$1.pos; }
      case 10:
        out += "\n";
        break
      default:
        out += String.fromCharCode(ch);
        break
      }
      if (this$1.options.locations) {
        ++this$1.curLine;
        this$1.lineStart = this$1.pos;
      }
      chunkStart = this$1.pos;
    } else {
      ++this$1.pos;
    }
  }
};

// Reads a template token to search for the end, without validating any escape sequences
pp$8.readInvalidTemplateToken = function() {
  var this$1 = this;

  for (; this.pos < this.input.length; this.pos++) {
    switch (this$1.input[this$1.pos]) {
    case "\\":
      ++this$1.pos;
      break

    case "$":
      if (this$1.input[this$1.pos + 1] !== "{") {
        break
      }
    // falls through

    case "`":
      return this$1.finishToken(types.invalidTemplate, this$1.input.slice(this$1.start, this$1.pos))

    // no default
    }
  }
  this.raise(this.start, "Unterminated template");
};

// Used to read escaped characters

pp$8.readEscapedChar = function(inTemplate) {
  var ch = this.input.charCodeAt(++this.pos);
  ++this.pos;
  switch (ch) {
  case 110: return "\n" // 'n' -> '\n'
  case 114: return "\r" // 'r' -> '\r'
  case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
  case 117: return codePointToString(this.readCodePoint()) // 'u'
  case 116: return "\t" // 't' -> '\t'
  case 98: return "\b" // 'b' -> '\b'
  case 118: return "\u000b" // 'v' -> '\u000b'
  case 102: return "\f" // 'f' -> '\f'
  case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
  case 10: // ' \n'
    if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
    return ""
  default:
    if (ch >= 48 && ch <= 55) {
      var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
      var octal = parseInt(octalStr, 8);
      if (octal > 255) {
        octalStr = octalStr.slice(0, -1);
        octal = parseInt(octalStr, 8);
      }
      this.pos += octalStr.length - 1;
      ch = this.input.charCodeAt(this.pos);
      if ((octalStr !== "0" || ch == 56 || ch == 57) && (this.strict || inTemplate)) {
        this.invalidStringToken(this.pos - 1 - octalStr.length, "Octal literal in strict mode");
      }
      return String.fromCharCode(octal)
    }
    return String.fromCharCode(ch)
  }
};

// Used to read character escape sequences ('\x', '\u', '\U').

pp$8.readHexChar = function(len) {
  var codePos = this.pos;
  var n = this.readInt(16, len);
  if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
  return n
};

// Read an identifier, and return it as a string. Sets `this.containsEsc`
// to whether the word contained a '\u' escape.
//
// Incrementally adds only escaped chars, adding other chunks as-is
// as a micro-optimization.

pp$8.readWord1 = function() {
  var this$1 = this;

  this.containsEsc = false;
  var word = "", first = true, chunkStart = this.pos;
  var astral = this.options.ecmaVersion >= 6;
  while (this.pos < this.input.length) {
    var ch = this$1.fullCharCodeAtPos();
    if (isIdentifierChar(ch, astral)) {
      this$1.pos += ch <= 0xffff ? 1 : 2;
    } else if (ch === 92) { // "\"
      this$1.containsEsc = true;
      word += this$1.input.slice(chunkStart, this$1.pos);
      var escStart = this$1.pos;
      if (this$1.input.charCodeAt(++this$1.pos) != 117) // "u"
        { this$1.invalidStringToken(this$1.pos, "Expecting Unicode escape sequence \\uXXXX"); }
      ++this$1.pos;
      var esc = this$1.readCodePoint();
      if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
        { this$1.invalidStringToken(escStart, "Invalid Unicode escape"); }
      word += codePointToString(esc);
      chunkStart = this$1.pos;
    } else {
      break
    }
    first = false;
  }
  return word + this.input.slice(chunkStart, this.pos)
};

// Read an identifier or keyword token. Will check for reserved
// words when necessary.

pp$8.readWord = function() {
  var word = this.readWord1();
  var type = types.name;
  if (this.keywords.test(word)) {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword " + word); }
    type = keywords$1[word];
  }
  return this.finishToken(type, word)
};

// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
// various contributors and released under an MIT license.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/acornjs/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/acornjs/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

var version = "5.5.0";

// The main exported interface (under `self.acorn` when in the
// browser) is a `parse` function that takes a code string and
// returns an abstract syntax tree as specified by [Mozilla parser
// API][api].
//
// [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

function parse(input, options) {
  return new Parser(options, input).parse()
}

// This function tries to parse a single expression at a given
// offset in a string. Useful for parsing mixed-language formats
// that embed JavaScript expressions.

function parseExpressionAt(input, pos, options) {
  var p = new Parser(options, input, pos);
  p.nextToken();
  return p.parseExpression()
}

// Acorn is organized as a tokenizer and a recursive-descent parser.
// The `tokenizer` export provides an interface to the tokenizer.

function tokenizer(input, options) {
  return new Parser(options, input)
}

// This is a terrible kludge to support the existing, pre-ES6
// interface where the loose parser module retroactively adds exports
// to this module.
var parse_dammit;
var LooseParser;
var pluginsLoose; // eslint-disable-line camelcase
function addLooseExports(parse, Parser$$1, plugins$$1) {
  parse_dammit = parse; // eslint-disable-line camelcase
  LooseParser = Parser$$1;
  pluginsLoose = plugins$$1;
}


var acorn = Object.freeze({
	version: version,
	parse: parse,
	parseExpressionAt: parseExpressionAt,
	tokenizer: tokenizer,
	get parse_dammit () { return parse_dammit; },
	get LooseParser () { return LooseParser; },
	get pluginsLoose () { return pluginsLoose; },
	addLooseExports: addLooseExports,
	Parser: Parser,
	plugins: plugins,
	defaultOptions: defaultOptions,
	Position: Position,
	SourceLocation: SourceLocation,
	getLineInfo: getLineInfo,
	Node: Node,
	TokenType: TokenType,
	tokTypes: types,
	keywordTypes: keywords$1,
	TokContext: TokContext,
	tokContexts: types$1,
	isIdentifierChar: isIdentifierChar,
	isIdentifierStart: isIdentifierStart,
	Token: Token,
	isNewLine: isNewLine,
	lineBreak: lineBreak,
	lineBreakG: lineBreakG,
	nonASCIIwhitespace: nonASCIIwhitespace
});

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var inject = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports['default'] = injectDynamicImport;
/* eslint-disable no-underscore-dangle */

var DynamicImportKey = exports.DynamicImportKey = 'Import';

function injectDynamicImport(acorn) {
  var tt = acorn.tokTypes;

  // NOTE: This allows `yield import()` to parse correctly.
  tt._import.startsExpr = true;

  function parseDynamicImport() {
    var node = this.startNode();
    this.next();
    if (this.type !== tt.parenL) {
      this.unexpected();
    }
    return this.finishNode(node, DynamicImportKey);
  }

  function peekNext() {
    return this.input[this.pos];
  }

  // eslint-disable-next-line no-param-reassign
  acorn.plugins.dynamicImport = function () {
    function dynamicImportPlugin(instance) {
      instance.extend('parseStatement', function (nextMethod) {
        return function () {
          function parseStatement() {
            var node = this.startNode();
            if (this.type === tt._import) {
              var nextToken = peekNext.call(this);
              if (nextToken === tt.parenL.label) {
                var expr = this.parseExpression();
                return this.parseExpressionStatement(node, expr);
              }
            }

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            return nextMethod.apply(this, args);
          }

          return parseStatement;
        }();
      });

      instance.extend('parseExprAtom', function (nextMethod) {
        return function () {
          function parseExprAtom(refDestructuringErrors) {
            if (this.type === tt._import) {
              return parseDynamicImport.call(this);
            }
            return nextMethod.call(this, refDestructuringErrors);
          }

          return parseExprAtom;
        }();
      });
    }

    return dynamicImportPlugin;
  }();

  return acorn;
}
});

var injectDynamicImportPlugin = unwrapExports(inject);
var inject_1 = inject.DynamicImportKey;

// Return the first non-null or -undefined result from an array of
// maybe-sync, maybe-promise-returning functions
function first(candidates) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return candidates.reduce(function (promise, candidate) {
            return promise.then(function (result) { return (result != null ? result : Promise.resolve(candidate.apply(void 0, args))); });
        }, Promise.resolve());
    };
}

var integerToChar = {};

'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split( '' ).forEach( function ( char, i ) {
	integerToChar[ i ] = char;
});

function encode ( value ) {
	var result;

	if ( typeof value === 'number' ) {
		result = encodeInteger( value );
	} else {
		result = '';
		for ( var i = 0; i < value.length; i += 1 ) {
			result += encodeInteger( value[i] );
		}
	}

	return result;
}

function encodeInteger ( num ) {
	var result = '';

	if ( num < 0 ) {
		num = ( -num << 1 ) | 1;
	} else {
		num <<= 1;
	}

	do {
		var clamped = num & 31;
		num >>= 5;

		if ( num > 0 ) {
			clamped |= 32;
		}

		result += integerToChar[ clamped ];
	} while ( num > 0 );

	return result;
}

function Chunk ( start, end, content ) {
	this.start = start;
	this.end = end;
	this.original = content;

	this.intro = '';
	this.outro = '';

	this.content = content;
	this.storeName = false;
	this.edited = false;

	// we make these non-enumerable, for sanity while debugging
	Object.defineProperties( this, {
		previous: { writable: true, value: null },
		next: { writable: true, value: null }
	});
}

Chunk.prototype = {
	appendLeft: function appendLeft ( content ) {
		this.outro += content;
	},

	appendRight: function appendRight ( content ) {
		this.intro = this.intro + content;
	},

	clone: function clone () {
		var chunk = new Chunk( this.start, this.end, this.original );

		chunk.intro = this.intro;
		chunk.outro = this.outro;
		chunk.content = this.content;
		chunk.storeName = this.storeName;
		chunk.edited = this.edited;

		return chunk;
	},

	contains: function contains ( index ) {
		return this.start < index && index < this.end;
	},

	eachNext: function eachNext ( fn ) {
		var chunk = this;
		while ( chunk ) {
			fn( chunk );
			chunk = chunk.next;
		}
	},

	eachPrevious: function eachPrevious ( fn ) {
		var chunk = this;
		while ( chunk ) {
			fn( chunk );
			chunk = chunk.previous;
		}
	},

	edit: function edit ( content, storeName, contentOnly ) {
		this.content = content;
		if ( !contentOnly ) {
			this.intro = '';
			this.outro = '';
		}
		this.storeName = storeName;

		this.edited = true;

		return this;
	},

	prependLeft: function prependLeft ( content ) {
		this.outro = content + this.outro;
	},

	prependRight: function prependRight ( content ) {
		this.intro = content + this.intro;
	},

	split: function split ( index ) {
		var sliceIndex = index - this.start;

		var originalBefore = this.original.slice( 0, sliceIndex );
		var originalAfter = this.original.slice( sliceIndex );

		this.original = originalBefore;

		var newChunk = new Chunk( index, this.end, originalAfter );
		newChunk.outro = this.outro;
		this.outro = '';

		this.end = index;

		if ( this.edited ) {
			// TODO is this block necessary?...
			newChunk.edit( '', false );
			this.content = '';
		} else {
			this.content = originalBefore;
		}

		newChunk.next = this.next;
		if ( newChunk.next ) { newChunk.next.previous = newChunk; }
		newChunk.previous = this;
		this.next = newChunk;

		return newChunk;
	},

	toString: function toString () {
		return this.intro + this.content + this.outro;
	},

	trimEnd: function trimEnd ( rx ) {
		this.outro = this.outro.replace( rx, '' );
		if ( this.outro.length ) { return true; }

		var trimmed = this.content.replace( rx, '' );

		if ( trimmed.length ) {
			if ( trimmed !== this.content ) {
				this.split( this.start + trimmed.length ).edit( '', false );
			}

			return true;
		} else {
			this.edit( '', false );

			this.intro = this.intro.replace( rx, '' );
			if ( this.intro.length ) { return true; }
		}
	},

	trimStart: function trimStart ( rx ) {
		this.intro = this.intro.replace( rx, '' );
		if ( this.intro.length ) { return true; }

		var trimmed = this.content.replace( rx, '' );

		if ( trimmed.length ) {
			if ( trimmed !== this.content ) {
				this.split( this.end - trimmed.length );
				this.edit( '', false );
			}

			return true;
		} else {
			this.edit( '', false );

			this.outro = this.outro.replace( rx, '' );
			if ( this.outro.length ) { return true; }
		}
	}
};

var _btoa;

if ( typeof window !== 'undefined' && typeof window.btoa === 'function' ) {
	_btoa = window.btoa;
} else if ( typeof Buffer === 'function' ) {
	_btoa = function (str) { return new Buffer( str ).toString( 'base64' ); };
} else {
	_btoa = function () {
		throw new Error( 'Unsupported environment: `window.btoa` or `Buffer` should be supported.' );
	};
}

var btoa = _btoa;

function SourceMap ( properties ) {
	this.version = 3;

	this.file           = properties.file;
	this.sources        = properties.sources;
	this.sourcesContent = properties.sourcesContent;
	this.names          = properties.names;
	this.mappings       = properties.mappings;
}

SourceMap.prototype = {
	toString: function toString () {
		return JSON.stringify( this );
	},

	toUrl: function toUrl () {
		return 'data:application/json;charset=utf-8;base64,' + btoa( this.toString() );
	}
};

function guessIndent ( code ) {
	var lines = code.split( '\n' );

	var tabbed = lines.filter( function (line) { return /^\t+/.test( line ); } );
	var spaced = lines.filter( function (line) { return /^ {2,}/.test( line ); } );

	if ( tabbed.length === 0 && spaced.length === 0 ) {
		return null;
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if ( tabbed.length >= spaced.length ) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	var min = spaced.reduce( function ( previous, current ) {
		var numSpaces = /^ +/.exec( current )[0].length;
		return Math.min( numSpaces, previous );
	}, Infinity );

	return new Array( min + 1 ).join( ' ' );
}

function getRelativePath ( from, to ) {
	var fromParts = from.split( /[\/\\]/ );
	var toParts = to.split( /[\/\\]/ );

	fromParts.pop(); // get dirname

	while ( fromParts[0] === toParts[0] ) {
		fromParts.shift();
		toParts.shift();
	}

	if ( fromParts.length ) {
		var i = fromParts.length;
		while ( i-- ) { fromParts[i] = '..'; }
	}

	return fromParts.concat( toParts ).join( '/' );
}

var toString$1 = Object.prototype.toString;

function isObject ( thing ) {
	return toString$1.call( thing ) === '[object Object]';
}

function getLocator ( source ) {
	var originalLines = source.split( '\n' );

	var start = 0;
	var lineRanges = originalLines.map( function ( line, i ) {
		var end = start + line.length + 1;
		var range = { start: start, end: end, line: i };

		start = end;
		return range;
	});

	var i = 0;

	function rangeContains ( range, index ) {
		return range.start <= index && index < range.end;
	}

	function getLocation ( range, index ) {
		return { line: range.line, column: index - range.start };
	}

	return function locate ( index ) {
		var range = lineRanges[i];

		var d = index >= range.end ? 1 : -1;

		while ( range ) {
			if ( rangeContains( range, index ) ) { return getLocation( range, index ); }

			i += d;
			range = lineRanges[i];
		}
	};
}

function Mappings ( hires ) {
	var this$1 = this;

	var offsets = {
		generatedCodeColumn: 0,
		sourceIndex: 0,
		sourceCodeLine: 0,
		sourceCodeColumn: 0,
		sourceCodeName: 0
	};

	var generatedCodeLine = 0;
	var generatedCodeColumn = 0;

	this.raw = [];
	var rawSegments = this.raw[ generatedCodeLine ] = [];

	var pending = null;

	this.addEdit = function ( sourceIndex, content, original, loc, nameIndex ) {
		if ( content.length ) {
			rawSegments.push([
				generatedCodeColumn,
				sourceIndex,
				loc.line,
				loc.column,
				nameIndex ]);
		} else if ( pending ) {
			rawSegments.push( pending );
		}

		this$1.advance( content );
		pending = null;
	};

	this.addUneditedChunk = function ( sourceIndex, chunk, original, loc, sourcemapLocations ) {
		var originalCharIndex = chunk.start;
		var first = true;

		while ( originalCharIndex < chunk.end ) {
			if ( hires || first || sourcemapLocations[ originalCharIndex ] ) {
				rawSegments.push([
					generatedCodeColumn,
					sourceIndex,
					loc.line,
					loc.column,
					-1
				]);
			}

			if ( original[ originalCharIndex ] === '\n' ) {
				loc.line += 1;
				loc.column = 0;
				generatedCodeLine += 1;
				this$1.raw[ generatedCodeLine ] = rawSegments = [];
				generatedCodeColumn = 0;
			} else {
				loc.column += 1;
				generatedCodeColumn += 1;
			}

			originalCharIndex += 1;
			first = false;
		}

		pending = [
			generatedCodeColumn,
			sourceIndex,
			loc.line,
			loc.column,
			-1 ];
	};

	this.advance = function (str) {
		if ( !str ) { return; }

		var lines = str.split( '\n' );
		var lastLine = lines.pop();

		if ( lines.length ) {
			generatedCodeLine += lines.length;
			this$1.raw[ generatedCodeLine ] = rawSegments = [];
			generatedCodeColumn = lastLine.length;
		} else {
			generatedCodeColumn += lastLine.length;
		}
	};

	this.encode = function () {
		return this$1.raw.map( function (segments) {
			var generatedCodeColumn = 0;

			return segments.map( function (segment) {
				var arr = [
					segment[0] - generatedCodeColumn,
					segment[1] - offsets.sourceIndex,
					segment[2] - offsets.sourceCodeLine,
					segment[3] - offsets.sourceCodeColumn
				];

				generatedCodeColumn = segment[0];
				offsets.sourceIndex = segment[1];
				offsets.sourceCodeLine = segment[2];
				offsets.sourceCodeColumn = segment[3];

				if ( ~segment[4] ) {
					arr.push( segment[4] - offsets.sourceCodeName );
					offsets.sourceCodeName = segment[4];
				}

				return encode( arr );
			}).join( ',' );
		}).join( ';' );
	};
}

var warned = {
	insertLeft: false,
	insertRight: false,
	storeName: false
};

function MagicString$1 ( string, options ) {
	if ( options === void 0 ) options = {};

	var chunk = new Chunk( 0, string.length, string );

	Object.defineProperties( this, {
		original:              { writable: true, value: string },
		outro:                 { writable: true, value: '' },
		intro:                 { writable: true, value: '' },
		firstChunk:            { writable: true, value: chunk },
		lastChunk:             { writable: true, value: chunk },
		lastSearchedChunk:     { writable: true, value: chunk },
		byStart:               { writable: true, value: {} },
		byEnd:                 { writable: true, value: {} },
		filename:              { writable: true, value: options.filename },
		indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
		sourcemapLocations:    { writable: true, value: {} },
		storedNames:           { writable: true, value: {} },
		indentStr:             { writable: true, value: guessIndent( string ) }
	});

	this.byStart[ 0 ] = chunk;
	this.byEnd[ string.length ] = chunk;
}

MagicString$1.prototype = {
	addSourcemapLocation: function addSourcemapLocation ( char ) {
		this.sourcemapLocations[ char ] = true;
	},

	append: function append ( content ) {
		if ( typeof content !== 'string' ) { throw new TypeError( 'outro content must be a string' ); }

		this.outro += content;
		return this;
	},

	appendLeft: function appendLeft ( index, content ) {
		if ( typeof content !== 'string' ) { throw new TypeError( 'inserted content must be a string' ); }

		this._split( index );

		var chunk = this.byEnd[ index ];

		if ( chunk ) {
			chunk.appendLeft( content );
		} else {
			this.intro += content;
		}

		return this;
	},

	appendRight: function appendRight ( index, content ) {
		if ( typeof content !== 'string' ) { throw new TypeError( 'inserted content must be a string' ); }

		this._split( index );

		var chunk = this.byStart[ index ];

		if ( chunk ) {
			chunk.appendRight( content );
		} else {
			this.outro += content;
		}

		return this;
	},

	clone: function clone () {
		var cloned = new MagicString$1( this.original, { filename: this.filename });

		var originalChunk = this.firstChunk;
		var clonedChunk = cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone();

		while ( originalChunk ) {
			cloned.byStart[ clonedChunk.start ] = clonedChunk;
			cloned.byEnd[ clonedChunk.end ] = clonedChunk;

			var nextOriginalChunk = originalChunk.next;
			var nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

			if ( nextClonedChunk ) {
				clonedChunk.next = nextClonedChunk;
				nextClonedChunk.previous = clonedChunk;

				clonedChunk = nextClonedChunk;
			}

			originalChunk = nextOriginalChunk;
		}

		cloned.lastChunk = clonedChunk;

		if ( this.indentExclusionRanges ) {
			cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
		}

		Object.keys( this.sourcemapLocations ).forEach( function (loc) {
			cloned.sourcemapLocations[ loc ] = true;
		});

		return cloned;
	},

	generateMap: function generateMap ( options ) {
		var this$1 = this;

		options = options || {};

		var sourceIndex = 0;
		var names = Object.keys( this.storedNames );
		var mappings = new Mappings( options.hires );

		var locate = getLocator( this.original );

		if ( this.intro ) {
			mappings.advance( this.intro );
		}

		this.firstChunk.eachNext( function (chunk) {
			var loc = locate( chunk.start );

			if ( chunk.intro.length ) { mappings.advance( chunk.intro ); }

			if ( chunk.edited ) {
				mappings.addEdit( sourceIndex, chunk.content, chunk.original, loc, chunk.storeName ? names.indexOf( chunk.original ) : -1 );
			} else {
				mappings.addUneditedChunk( sourceIndex, chunk, this$1.original, loc, this$1.sourcemapLocations );
			}

			if ( chunk.outro.length ) { mappings.advance( chunk.outro ); }
		});

		var map = new SourceMap({
			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
			sources: [ options.source ? getRelativePath( options.file || '', options.source ) : null ],
			sourcesContent: options.includeContent ? [ this.original ] : [ null ],
			names: names,
			mappings: mappings.encode()
		});
		return map;
	},

	getIndentString: function getIndentString () {
		return this.indentStr === null ? '\t' : this.indentStr;
	},

	indent: function indent ( indentStr, options ) {
		var this$1 = this;

		var pattern = /^[^\r\n]/gm;

		if ( isObject( indentStr ) ) {
			options = indentStr;
			indentStr = undefined;
		}

		indentStr = indentStr !== undefined ? indentStr : ( this.indentStr || '\t' );

		if ( indentStr === '' ) { return this; } // noop

		options = options || {};

		// Process exclusion ranges
		var isExcluded = {};

		if ( options.exclude ) {
			var exclusions = typeof options.exclude[0] === 'number' ? [ options.exclude ] : options.exclude;
			exclusions.forEach( function (exclusion) {
				for ( var i = exclusion[0]; i < exclusion[1]; i += 1 ) {
					isExcluded[i] = true;
				}
			});
		}

		var shouldIndentNextCharacter = options.indentStart !== false;
		var replacer = function (match) {
			if ( shouldIndentNextCharacter ) { return ("" + indentStr + match); }
			shouldIndentNextCharacter = true;
			return match;
		};

		this.intro = this.intro.replace( pattern, replacer );

		var charIndex = 0;

		var chunk = this.firstChunk;

		while ( chunk ) {
			var end = chunk.end;

			if ( chunk.edited ) {
				if ( !isExcluded[ charIndex ] ) {
					chunk.content = chunk.content.replace( pattern, replacer );

					if ( chunk.content.length ) {
						shouldIndentNextCharacter = chunk.content[ chunk.content.length - 1 ] === '\n';
					}
				}
			} else {
				charIndex = chunk.start;

				while ( charIndex < end ) {
					if ( !isExcluded[ charIndex ] ) {
						var char = this$1.original[ charIndex ];

						if ( char === '\n' ) {
							shouldIndentNextCharacter = true;
						} else if ( char !== '\r' && shouldIndentNextCharacter ) {
							shouldIndentNextCharacter = false;

							if ( charIndex === chunk.start ) {
								chunk.prependRight( indentStr );
							} else {
								this$1._splitChunk( chunk, charIndex );
								chunk = chunk.next;
								chunk.prependRight( indentStr );
							}
						}
					}

					charIndex += 1;
				}
			}

			charIndex = chunk.end;
			chunk = chunk.next;
		}

		this.outro = this.outro.replace( pattern, replacer );

		return this;
	},

	insert: function insert () {
		throw new Error( 'magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)' );
	},

	insertLeft: function insertLeft ( index, content ) {
		if ( !warned.insertLeft ) {
			console.warn( 'magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead' ); // eslint-disable-line no-console
			warned.insertLeft = true;
		}

		return this.appendLeft( index, content );
	},

	insertRight: function insertRight ( index, content ) {
		if ( !warned.insertRight ) {
			console.warn( 'magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead' ); // eslint-disable-line no-console
			warned.insertRight = true;
		}

		return this.prependRight( index, content );
	},

	move: function move ( start, end, index ) {
		if ( index >= start && index <= end ) { throw new Error( 'Cannot move a selection inside itself' ); }

		this._split( start );
		this._split( end );
		this._split( index );

		var first = this.byStart[ start ];
		var last = this.byEnd[ end ];

		var oldLeft = first.previous;
		var oldRight = last.next;

		var newRight = this.byStart[ index ];
		if ( !newRight && last === this.lastChunk ) { return this; }
		var newLeft = newRight ? newRight.previous : this.lastChunk;

		if ( oldLeft ) { oldLeft.next = oldRight; }
		if ( oldRight ) { oldRight.previous = oldLeft; }

		if ( newLeft ) { newLeft.next = first; }
		if ( newRight ) { newRight.previous = last; }

		if ( !first.previous ) { this.firstChunk = last.next; }
		if ( !last.next ) {
			this.lastChunk = first.previous;
			this.lastChunk.next = null;
		}

		first.previous = newLeft;
		last.next = newRight || null;

		if ( !newLeft ) { this.firstChunk = first; }
		if ( !newRight ) { this.lastChunk = last; }

		return this;
	},

	overwrite: function overwrite ( start, end, content, options ) {
		var this$1 = this;

		if ( typeof content !== 'string' ) { throw new TypeError( 'replacement content must be a string' ); }

		while ( start < 0 ) { start += this$1.original.length; }
		while ( end < 0 ) { end += this$1.original.length; }

		if ( end > this.original.length ) { throw new Error( 'end is out of bounds' ); }
		if ( start === end ) { throw new Error( 'Cannot overwrite a zero-length range – use appendLeft or prependRight instead' ); }

		this._split( start );
		this._split( end );

		if ( options === true ) {
			if ( !warned.storeName ) {
				console.warn( 'The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string' ); // eslint-disable-line no-console
				warned.storeName = true;
			}

			options = { storeName: true };
		}
		var storeName = options !== undefined ? options.storeName : false;
		var contentOnly = options !== undefined ? options.contentOnly : false;

		if ( storeName ) {
			var original = this.original.slice( start, end );
			this.storedNames[ original ] = true;
		}

		var first = this.byStart[ start ];
		var last = this.byEnd[ end ];

		if ( first ) {
			if ( end > first.end && first.next !== this.byStart[ first.end ] ) {
				throw new Error( 'Cannot overwrite across a split point' );
			}

			first.edit( content, storeName, contentOnly );

			if ( first !== last ) {
				var chunk = first.next;
				while ( chunk !== last ) {
					chunk.edit( '', false );
					chunk = chunk.next;
				}

				chunk.edit( '', false );
			}
		}

		else {
			// must be inserting at the end
			var newChunk = new Chunk( start, end, '' ).edit( content, storeName );

			// TODO last chunk in the array may not be the last chunk, if it's moved...
			last.next = newChunk;
			newChunk.previous = last;
		}

		return this;
	},

	prepend: function prepend ( content ) {
		if ( typeof content !== 'string' ) { throw new TypeError( 'outro content must be a string' ); }

		this.intro = content + this.intro;
		return this;
	},

	prependLeft: function prependLeft ( index, content ) {
		if ( typeof content !== 'string' ) { throw new TypeError( 'inserted content must be a string' ); }

		this._split( index );

		var chunk = this.byEnd[ index ];

		if ( chunk ) {
			chunk.prependLeft( content );
		} else {
			this.intro = content + this.intro;
		}

		return this;
	},

	prependRight: function prependRight ( index, content ) {
		if ( typeof content !== 'string' ) { throw new TypeError( 'inserted content must be a string' ); }

		this._split( index );

		var chunk = this.byStart[ index ];

		if ( chunk ) {
			chunk.prependRight( content );
		} else {
			this.outro = content + this.outro;
		}

		return this;
	},

	remove: function remove ( start, end ) {
		var this$1 = this;

		while ( start < 0 ) { start += this$1.original.length; }
		while ( end < 0 ) { end += this$1.original.length; }

		if ( start === end ) { return this; }

		if ( start < 0 || end > this.original.length ) { throw new Error( 'Character is out of bounds' ); }
		if ( start > end ) { throw new Error( 'end must be greater than start' ); }

		this._split( start );
		this._split( end );

		var chunk = this.byStart[ start ];

		while ( chunk ) {
			chunk.intro = '';
			chunk.outro = '';
			chunk.edit( '' );

			chunk = end > chunk.end ? this$1.byStart[ chunk.end ] : null;
		}

		return this;
	},

	slice: function slice ( start, end ) {
		var this$1 = this;
		if ( start === void 0 ) start = 0;
		if ( end === void 0 ) end = this.original.length;

		while ( start < 0 ) { start += this$1.original.length; }
		while ( end < 0 ) { end += this$1.original.length; }

		var result = '';

		// find start chunk
		var chunk = this.firstChunk;
		while ( chunk && ( chunk.start > start || chunk.end <= start ) ) {

			// found end chunk before start
			if ( chunk.start < end && chunk.end >= end ) {
				return result;
			}

			chunk = chunk.next;
		}

		if ( chunk && chunk.edited && chunk.start !== start ) { throw new Error(("Cannot use replaced character " + start + " as slice start anchor.")); }

		var startChunk = chunk;
		while ( chunk ) {
			if ( chunk.intro && ( startChunk !== chunk || chunk.start === start ) ) {
				result += chunk.intro;
			}

			var containsEnd = chunk.start < end && chunk.end >= end;
			if ( containsEnd && chunk.edited && chunk.end !== end ) { throw new Error(("Cannot use replaced character " + end + " as slice end anchor.")); }

			var sliceStart = startChunk === chunk ? start - chunk.start : 0;
			var sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

			result += chunk.content.slice( sliceStart, sliceEnd );

			if ( chunk.outro && ( !containsEnd || chunk.end === end ) ) {
				result += chunk.outro;
			}

			if ( containsEnd ) {
				break;
			}

			chunk = chunk.next;
		}

		return result;
	},

	// TODO deprecate this? not really very useful
	snip: function snip ( start, end ) {
		var clone = this.clone();
		clone.remove( 0, start );
		clone.remove( end, clone.original.length );

		return clone;
	},

	_split: function _split ( index ) {
		var this$1 = this;

		if ( this.byStart[ index ] || this.byEnd[ index ] ) { return; }

		var chunk = this.lastSearchedChunk;
		var searchForward = index > chunk.end;

		while ( true ) {
			if ( chunk.contains( index ) ) { return this$1._splitChunk( chunk, index ); }

			chunk = searchForward ?
				this$1.byStart[ chunk.end ] :
				this$1.byEnd[ chunk.start ];
		}
	},

	_splitChunk: function _splitChunk ( chunk, index ) {
		if ( chunk.edited && chunk.content.length ) { // zero-length edited chunks are a special case (overlapping replacements)
			var loc = getLocator( this.original )( index );
			throw new Error( ("Cannot split a chunk that has already been edited (" + (loc.line) + ":" + (loc.column) + " – \"" + (chunk.original) + "\")") );
		}

		var newChunk = chunk.split( index );

		this.byEnd[ index ] = chunk;
		this.byStart[ index ] = newChunk;
		this.byEnd[ newChunk.end ] = newChunk;

		if ( chunk === this.lastChunk ) { this.lastChunk = newChunk; }

		this.lastSearchedChunk = chunk;
		return true;
	},

	toString: function toString () {
		var str = this.intro;

		var chunk = this.firstChunk;
		while ( chunk ) {
			str += chunk.toString();
			chunk = chunk.next;
		}

		return str + this.outro;
	},

	trimLines: function trimLines () {
		return this.trim('[\\r\\n]');
	},

	trim: function trim ( charType ) {
		return this.trimStart( charType ).trimEnd( charType );
	},

	trimEnd: function trimEnd ( charType ) {
		var this$1 = this;

		var rx = new RegExp( ( charType || '\\s' ) + '+$' );

		this.outro = this.outro.replace( rx, '' );
		if ( this.outro.length ) { return this; }

		var chunk = this.lastChunk;

		do {
			var end = chunk.end;
			var aborted = chunk.trimEnd( rx );

			// if chunk was trimmed, we have a new lastChunk
			if ( chunk.end !== end ) {
				if ( this$1.lastChunk === chunk ) {
					this$1.lastChunk = chunk.next;
				}

				this$1.byEnd[ chunk.end ] = chunk;
				this$1.byStart[ chunk.next.start ] = chunk.next;
				this$1.byEnd[ chunk.next.end ] = chunk.next;
			}

			if ( aborted ) { return this$1; }
			chunk = chunk.previous;
		} while ( chunk );

		return this;
	},

	trimStart: function trimStart ( charType ) {
		var this$1 = this;

		var rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );

		this.intro = this.intro.replace( rx, '' );
		if ( this.intro.length ) { return this; }

		var chunk = this.firstChunk;

		do {
			var end = chunk.end;
			var aborted = chunk.trimStart( rx );

			if ( chunk.end !== end ) {
				// special case...
				if ( chunk === this$1.lastChunk ) { this$1.lastChunk = chunk.next; }

				this$1.byEnd[ chunk.end ] = chunk;
				this$1.byStart[ chunk.next.start ] = chunk.next;
				this$1.byEnd[ chunk.next.end ] = chunk.next;
			}

			if ( aborted ) { return this$1; }
			chunk = chunk.next;
		} while ( chunk );

		return this;
	}
};

var hasOwnProp = Object.prototype.hasOwnProperty;

function Bundle ( options ) {
	if ( options === void 0 ) options = {};

	this.intro = options.intro || '';
	this.separator = options.separator !== undefined ? options.separator : '\n';

	this.sources = [];

	this.uniqueSources = [];
	this.uniqueSourceIndexByFilename = {};
}

Bundle.prototype = {
	addSource: function addSource ( source ) {
		if ( source instanceof MagicString$1 ) {
			return this.addSource({
				content: source,
				filename: source.filename,
				separator: this.separator
			});
		}

		if ( !isObject( source ) || !source.content ) {
			throw new Error( 'bundle.addSource() takes an object with a `content` property, which should be an instance of MagicString, and an optional `filename`' );
		}

		[ 'filename', 'indentExclusionRanges', 'separator' ].forEach( function (option) {
			if ( !hasOwnProp.call( source, option ) ) { source[ option ] = source.content[ option ]; }
		});

		if ( source.separator === undefined ) { // TODO there's a bunch of this sort of thing, needs cleaning up
			source.separator = this.separator;
		}

		if ( source.filename ) {
			if ( !hasOwnProp.call( this.uniqueSourceIndexByFilename, source.filename ) ) {
				this.uniqueSourceIndexByFilename[ source.filename ] = this.uniqueSources.length;
				this.uniqueSources.push({ filename: source.filename, content: source.content.original });
			} else {
				var uniqueSource = this.uniqueSources[ this.uniqueSourceIndexByFilename[ source.filename ] ];
				if ( source.content.original !== uniqueSource.content ) {
					throw new Error( ("Illegal source: same filename (" + (source.filename) + "), different contents") );
				}
			}
		}

		this.sources.push( source );
		return this;
	},

	append: function append ( str, options ) {
		this.addSource({
			content: new MagicString$1( str ),
			separator: ( options && options.separator ) || ''
		});

		return this;
	},

	clone: function clone () {
		var bundle = new Bundle({
			intro: this.intro,
			separator: this.separator
		});

		this.sources.forEach( function (source) {
			bundle.addSource({
				filename: source.filename,
				content: source.content.clone(),
				separator: source.separator
			});
		});

		return bundle;
	},

	generateMap: function generateMap ( options ) {
		var this$1 = this;
		if ( options === void 0 ) options = {};

		var names = [];
		this.sources.forEach( function (source) {
			Object.keys( source.content.storedNames ).forEach( function (name) {
				if ( !~names.indexOf( name ) ) { names.push( name ); }
			});
		});

		var mappings = new Mappings( options.hires );

		if ( this.intro ) {
			mappings.advance( this.intro );
		}

		this.sources.forEach( function ( source, i ) {
			if ( i > 0 ) {
				mappings.advance( this$1.separator );
			}

			var sourceIndex = source.filename ? this$1.uniqueSourceIndexByFilename[ source.filename ] : -1;
			var magicString = source.content;
			var locate = getLocator( magicString.original );

			if ( magicString.intro ) {
				mappings.advance( magicString.intro );
			}

			magicString.firstChunk.eachNext( function (chunk) {
				var loc = locate( chunk.start );

				if ( chunk.intro.length ) { mappings.advance( chunk.intro ); }

				if ( source.filename ) {
					if ( chunk.edited ) {
						mappings.addEdit( sourceIndex, chunk.content, chunk.original, loc, chunk.storeName ? names.indexOf( chunk.original ) : -1 );
					} else {
						mappings.addUneditedChunk( sourceIndex, chunk, magicString.original, loc, magicString.sourcemapLocations );
					}
				}

				else {
					mappings.advance( chunk.content );
				}

				if ( chunk.outro.length ) { mappings.advance( chunk.outro ); }
			});

			if ( magicString.outro ) {
				mappings.advance( magicString.outro );
			}
		});

		return new SourceMap({
			file: ( options.file ? options.file.split( /[\/\\]/ ).pop() : null ),
			sources: this.uniqueSources.map( function (source) {
				return options.file ? getRelativePath( options.file, source.filename ) : source.filename;
			}),
			sourcesContent: this.uniqueSources.map( function (source) {
				return options.includeContent ? source.content : null;
			}),
			names: names,
			mappings: mappings.encode()
		});
	},

	getIndentString: function getIndentString () {
		var indentStringCounts = {};

		this.sources.forEach( function (source) {
			var indentStr = source.content.indentStr;

			if ( indentStr === null ) { return; }

			if ( !indentStringCounts[ indentStr ] ) { indentStringCounts[ indentStr ] = 0; }
			indentStringCounts[ indentStr ] += 1;
		});

		return ( Object.keys( indentStringCounts ).sort( function ( a, b ) {
			return indentStringCounts[a] - indentStringCounts[b];
		})[0] ) || '\t';
	},

	indent: function indent ( indentStr ) {
		var this$1 = this;

		if ( !arguments.length ) {
			indentStr = this.getIndentString();
		}

		if ( indentStr === '' ) { return this; } // noop

		var trailingNewline = !this.intro || this.intro.slice( -1 ) === '\n';

		this.sources.forEach( function ( source, i ) {
			var separator = source.separator !== undefined ? source.separator : this$1.separator;
			var indentStart = trailingNewline || ( i > 0 && /\r?\n$/.test( separator ) );

			source.content.indent( indentStr, {
				exclude: source.indentExclusionRanges,
				indentStart: indentStart//: trailingNewline || /\r?\n$/.test( separator )  //true///\r?\n/.test( separator )
			});

			// TODO this is a very slow way to determine this
			trailingNewline = source.content.toString().slice( 0, -1 ) === '\n';
		});

		if ( this.intro ) {
			this.intro = indentStr + this.intro.replace( /^[^\n]/gm, function ( match, index ) {
				return index > 0 ? indentStr + match : match;
			});
		}

		return this;
	},

	prepend: function prepend ( str ) {
		this.intro = str + this.intro;
		return this;
	},

	toString: function toString () {
		var this$1 = this;

		var body = this.sources.map( function ( source, i ) {
			var separator = source.separator !== undefined ? source.separator : this$1.separator;
			var str = ( i > 0 ? separator : '' ) + source.content.toString();

			return str;
		}).join( '' );

		return this.intro + body;
	},

	trimLines: function trimLines () {
		return this.trim('[\\r\\n]');
	},

	trim: function trim ( charType ) {
		return this.trimStart( charType ).trimEnd( charType );
	},

	trimStart: function trimStart ( charType ) {
		var this$1 = this;

		var rx = new RegExp( '^' + ( charType || '\\s' ) + '+' );
		this.intro = this.intro.replace( rx, '' );

		if ( !this.intro ) {
			var source;
			var i = 0;

			do {
				source = this$1.sources[i];

				if ( !source ) {
					break;
				}

				source.content.trimStart( charType );
				i += 1;
			} while ( source.content.toString() === '' ); // TODO faster way to determine non-empty source?
		}

		return this;
	},

	trimEnd: function trimEnd ( charType ) {
		var this$1 = this;

		var rx = new RegExp( ( charType || '\\s' ) + '+$' );

		var source;
		var i = this.sources.length - 1;

		do {
			source = this$1.sources[i];

			if ( !source ) {
				this$1.intro = this$1.intro.replace( rx, '' );
				break;
			}

			source.content.trimEnd( charType );
			i -= 1;
		} while ( source.content.toString() === '' ); // TODO faster way to determine non-empty source?

		return this;
	}
};

function getLocator$1(source, options) {
    if (options === void 0) { options = {}; }
    var offsetLine = options.offsetLine || 0;
    var offsetColumn = options.offsetColumn || 0;
    var originalLines = source.split('\n');
    var start = 0;
    var lineRanges = originalLines.map(function (line, i) {
        var end = start + line.length + 1;
        var range = { start: start, end: end, line: i };
        start = end;
        return range;
    });
    var i = 0;
    function rangeContains(range, index) {
        return range.start <= index && index < range.end;
    }
    function getLocation(range, index) {
        return { line: offsetLine + range.line, column: offsetColumn + index - range.start, character: index };
    }
    function locate(search, startIndex) {
        if (typeof search === 'string') {
            search = source.indexOf(search, startIndex || 0);
        }
        var range = lineRanges[i];
        var d = search >= range.end ? 1 : -1;
        while (range) {
            if (rangeContains(range, search))
                return getLocation(range, search);
            i += d;
            range = lineRanges[i];
        }
    }
    return locate;
}
function locate(source, search, options) {
    if (typeof options === 'number') {
        throw new Error('locate takes a { startIndex, offsetLine, offsetColumn } object as the third argument');
    }
    return getLocator$1(source, options)(search, options && options.startIndex);
}

var reservedWords$1 = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split(' ');
var builtins = 'Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split(' ');
var blacklisted = blank();
reservedWords$1.concat(builtins).forEach(function (word) { return (blacklisted[word] = true); });
var illegalCharacters = /[^$_a-zA-Z0-9]/g;
var startsWithDigit = function (str) { return /\d/.test(str[0]); };
function isLegal(str) {
    if (startsWithDigit(str) || blacklisted[str]) {
        return false;
    }
    return !illegalCharacters.test(str);
}
function makeLegal(str) {
    str = str.replace(/-(\w)/g, function (_, letter) { return letter.toUpperCase(); }).replace(illegalCharacters, '_');
    if (startsWithDigit(str) || blacklisted[str])
        str = "_" + str;
    return str;
}

function spaces(i) {
    var result = '';
    while (i--)
        result += ' ';
    return result;
}
function tabsToSpaces(str) {
    return str.replace(/^\t+/, function (match) { return match.split('\t').join('  '); });
}
function getCodeFrame(source, line, column) {
    var lines = source.split('\n');
    var frameStart = Math.max(0, line - 3);
    var frameEnd = Math.min(line + 2, lines.length);
    lines = lines.slice(frameStart, frameEnd);
    while (!/\S/.test(lines[lines.length - 1])) {
        lines.pop();
        frameEnd -= 1;
    }
    var digits = String(frameEnd).length;
    return lines
        .map(function (str, i) {
        var isErrorLine = frameStart + i + 1 === line;
        var lineNum = String(i + frameStart + 1);
        while (lineNum.length < digits)
            lineNum = " " + lineNum;
        if (isErrorLine) {
            var indicator = spaces(digits + 2 + tabsToSpaces(str.slice(0, column)).length) + '^';
            return lineNum + ": " + tabsToSpaces(str) + "\n" + indicator;
        }
        return lineNum + ": " + tabsToSpaces(str);
    })
        .join('\n');
}

var CallOptions = /** @class */ (function () {
    function CallOptions(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.withNew, withNew = _c === void 0 ? false : _c, _d = _b.args, args = _d === void 0 ? [] : _d, _e = _b.callIdentifier, callIdentifier = _e === void 0 ? undefined : _e;
        this.withNew = withNew;
        this.args = args;
        this.callIdentifier = callIdentifier;
    }
    CallOptions.create = function (callOptions) {
        return new this(callOptions);
    };
    CallOptions.prototype.equals = function (callOptions) {
        return callOptions && this.callIdentifier === callOptions.callIdentifier;
    };
    return CallOptions;
}());

function isUnknownKey(key) {
    return key === UNKNOWN_KEY;
}
var UNKNOWN_KEY = { type: 'UNKNOWN_KEY' };
function assembleMemberDescriptions(memberDescriptions, inheritedDescriptions) {
    if (inheritedDescriptions === void 0) { inheritedDescriptions = null; }
    return Object.create(inheritedDescriptions, memberDescriptions);
}
var UNKNOWN_VALUE = { toString: function () { return '[[UNKNOWN]]'; } };
var UNKNOWN_EXPRESSION = {
    reassignPath: function () { },
    forEachReturnExpressionWhenCalledAtPath: function () { },
    getValue: function () { return UNKNOWN_VALUE; },
    hasEffectsWhenAccessedAtPath: function (path) { return path.length > 0; },
    hasEffectsWhenAssignedAtPath: function (path) { return path.length > 0; },
    hasEffectsWhenCalledAtPath: function () { return true; },
    someReturnExpressionWhenCalledAtPath: function () { return true; },
    toString: function () { return '[[UNKNOWN]]'; }
};
var returnsUnknown = {
    value: { returns: UNKNOWN_EXPRESSION, callsArgs: null }
};
var callsArgReturnsUnknown = {
    value: { returns: UNKNOWN_EXPRESSION, callsArgs: [0] }
};
var UNKNOWN_ARRAY_EXPRESSION = {
    reassignPath: function () { },
    forEachReturnExpressionWhenCalledAtPath: function () { },
    getValue: function () { return UNKNOWN_VALUE; },
    hasEffectsWhenAccessedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenAssignedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenCalledAtPath: function (path, callOptions, options) {
        if (path.length === 1) {
            return hasMemberEffectWhenCalled(arrayMembers, path[0], callOptions, options);
        }
        return true;
    },
    someReturnExpressionWhenCalledAtPath: function (path, callOptions, predicateFunction, options) {
        if (path.length === 1) {
            return someMemberReturnExpressionWhenCalled(arrayMembers, path[0], callOptions, predicateFunction, options);
        }
        return true;
    },
    toString: function () { return '[[UNKNOWN ARRAY]]'; }
};
var returnsArray = {
    value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: null }
};
var callsArgReturnsArray = {
    value: { returns: UNKNOWN_ARRAY_EXPRESSION, callsArgs: [0] }
};
var UNKNOWN_LITERAL_BOOLEAN = {
    reassignPath: function () { },
    forEachReturnExpressionWhenCalledAtPath: function () { },
    getValue: function () { return UNKNOWN_VALUE; },
    hasEffectsWhenAccessedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenAssignedAtPath: function (path) { return path.length > 0; },
    hasEffectsWhenCalledAtPath: function (path) {
        if (path.length === 1) {
            var subPath = path[0];
            return isUnknownKey(subPath) || !literalBooleanMembers[subPath];
        }
        return true;
    },
    someReturnExpressionWhenCalledAtPath: function (path, _callOptions, predicateFunction, options) {
        if (path.length === 1) {
            var subPath = path[0];
            return (isUnknownKey(subPath) ||
                !literalBooleanMembers[subPath] ||
                predicateFunction(options)(literalBooleanMembers[subPath].returns));
        }
        return true;
    },
    toString: function () { return '[[UNKNOWN BOOLEAN]]'; }
};
var returnsBoolean = {
    value: { returns: UNKNOWN_LITERAL_BOOLEAN, callsArgs: null }
};
var callsArgReturnsBoolean = {
    value: { returns: UNKNOWN_LITERAL_BOOLEAN, callsArgs: [0] }
};
var UNKNOWN_LITERAL_NUMBER = {
    reassignPath: function () { },
    forEachReturnExpressionWhenCalledAtPath: function () { },
    getValue: function () { return UNKNOWN_VALUE; },
    hasEffectsWhenAccessedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenAssignedAtPath: function (path) { return path.length > 0; },
    hasEffectsWhenCalledAtPath: function (path) {
        if (path.length === 1) {
            var subPath = path[0];
            return isUnknownKey(subPath) || !literalNumberMembers[subPath];
        }
        return true;
    },
    someReturnExpressionWhenCalledAtPath: function (path, _callOptions, predicateFunction, options) {
        if (path.length === 1) {
            var subPath = path[0];
            return (isUnknownKey(subPath) ||
                !literalNumberMembers[subPath] ||
                predicateFunction(options)(literalNumberMembers[subPath].returns));
        }
        return true;
    },
    toString: function () { return '[[UNKNOWN NUMBER]]'; }
};
var returnsNumber = {
    value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: null }
};
var callsArgReturnsNumber = {
    value: { returns: UNKNOWN_LITERAL_NUMBER, callsArgs: [0] }
};
var UNKNOWN_LITERAL_STRING = {
    reassignPath: function () { },
    forEachReturnExpressionWhenCalledAtPath: function () { },
    getValue: function () { return UNKNOWN_VALUE; },
    hasEffectsWhenAccessedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenAssignedAtPath: function (path) { return path.length > 0; },
    hasEffectsWhenCalledAtPath: function (path) {
        if (path.length === 1) {
            var subPath = path[0];
            return isUnknownKey(subPath) || !literalStringMembers[subPath];
        }
        return true;
    },
    someReturnExpressionWhenCalledAtPath: function (path, _callOptions, predicateFunction, options) {
        if (path.length === 1) {
            var subPath = path[0];
            return (isUnknownKey(subPath) ||
                !literalStringMembers[subPath] ||
                predicateFunction(options)(literalStringMembers[subPath].returns));
        }
        return true;
    },
    toString: function () { return '[[UNKNOWN STRING]]'; }
};
var returnsString = {
    value: { returns: UNKNOWN_LITERAL_STRING, callsArgs: null }
};
var callsSecondArgReturnsString = {
    value: { returns: UNKNOWN_LITERAL_STRING, callsArgs: [1] }
};
var UNKNOWN_OBJECT_EXPRESSION = {
    reassignPath: function () { },
    forEachReturnExpressionWhenCalledAtPath: function () { },
    getValue: function () { return UNKNOWN_VALUE; },
    hasEffectsWhenAccessedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenAssignedAtPath: function (path) { return path.length > 1; },
    hasEffectsWhenCalledAtPath: function (path) {
        if (path.length === 1) {
            var subPath = path[0];
            return isUnknownKey(subPath) || !objectMembers[subPath];
        }
        return true;
    },
    someReturnExpressionWhenCalledAtPath: function (path, _callOptions, predicateFunction, options) {
        if (path.length === 1) {
            var subPath = path[0];
            return (isUnknownKey(subPath) ||
                !objectMembers[subPath] ||
                predicateFunction(options)(objectMembers[subPath].returns));
        }
        return true;
    },
    toString: function () { return '[[UNKNOWN OBJECT]]'; }
};
var objectMembers = assembleMemberDescriptions({
    hasOwnProperty: returnsBoolean,
    isPrototypeOf: returnsBoolean,
    propertyIsEnumerable: returnsBoolean,
    toLocaleString: returnsString,
    toString: returnsString,
    valueOf: returnsUnknown
});
var arrayMembers = assembleMemberDescriptions({
    concat: returnsArray,
    copyWithin: returnsArray,
    every: callsArgReturnsBoolean,
    fill: returnsArray,
    filter: callsArgReturnsArray,
    find: callsArgReturnsUnknown,
    findIndex: callsArgReturnsNumber,
    forEach: callsArgReturnsUnknown,
    includes: returnsBoolean,
    indexOf: returnsNumber,
    join: returnsString,
    lastIndexOf: returnsNumber,
    map: callsArgReturnsArray,
    pop: returnsUnknown,
    push: returnsNumber,
    reduce: callsArgReturnsUnknown,
    reduceRight: callsArgReturnsUnknown,
    reverse: returnsArray,
    shift: returnsUnknown,
    slice: returnsArray,
    some: callsArgReturnsBoolean,
    sort: callsArgReturnsArray,
    splice: returnsArray,
    unshift: returnsNumber
}, objectMembers);
var literalBooleanMembers = assembleMemberDescriptions({
    valueOf: returnsBoolean
}, objectMembers);
var literalNumberMembers = assembleMemberDescriptions({
    toExponential: returnsString,
    toFixed: returnsString,
    toLocaleString: returnsString,
    toPrecision: returnsString,
    valueOf: returnsNumber
}, objectMembers);
var literalStringMembers = assembleMemberDescriptions({
    charAt: returnsString,
    charCodeAt: returnsNumber,
    codePointAt: returnsNumber,
    concat: returnsString,
    includes: returnsBoolean,
    endsWith: returnsBoolean,
    indexOf: returnsNumber,
    lastIndexOf: returnsNumber,
    localeCompare: returnsNumber,
    match: returnsBoolean,
    normalize: returnsString,
    padEnd: returnsString,
    padStart: returnsString,
    repeat: returnsString,
    replace: callsSecondArgReturnsString,
    search: returnsNumber,
    slice: returnsString,
    split: returnsArray,
    startsWith: returnsBoolean,
    substr: returnsString,
    substring: returnsString,
    toLocaleLowerCase: returnsString,
    toLocaleUpperCase: returnsString,
    toLowerCase: returnsString,
    toUpperCase: returnsString,
    trim: returnsString,
    valueOf: returnsString
}, objectMembers);
function getLiteralMembersForValue(value) {
    switch (typeof value) {
        case 'boolean':
            return literalBooleanMembers;
        case 'number':
            return literalNumberMembers;
        case 'string':
            return literalStringMembers;
        default:
            return blank();
    }
}
function hasMemberEffectWhenCalled(members, memberName, callOptions, options) {
    return (isUnknownKey(memberName) ||
        !members[memberName] ||
        (members[memberName].callsArgs &&
            members[memberName].callsArgs.some(function (argIndex) {
                return callOptions.args[argIndex] &&
                    callOptions.args[argIndex].hasEffectsWhenCalledAtPath([], CallOptions.create({
                        withNew: false,
                        args: [],
                        callIdentifier: {} // make sure the caller is unique to avoid this check being ignored
                    }), options.getHasEffectsWhenCalledOptions());
            })));
}
function someMemberReturnExpressionWhenCalled(members, memberName, callOptions, predicateFunction, options) {
    return (hasMemberEffectWhenCalled(members, memberName, callOptions, options) ||
        // if calling has no effect, memberName is a string and members[memberName] exists
        predicateFunction(options)(members[memberName].returns));
}

var Variable = /** @class */ (function () {
    function Variable(name) {
        this.name = name;
        this.safeName = null;
    }
    /**
     * Binds identifiers that reference this variable to this variable.
     * Necessary to be able to change variable names.
     */
    Variable.prototype.addReference = function (_identifier) { };
    Variable.prototype.reassignPath = function (_path, _options) { };
    Variable.prototype.forEachReturnExpressionWhenCalledAtPath = function (_path, _callOptions, _callback, _options) { };
    Variable.prototype.getName = function (reset) {
        if (reset &&
            this.safeName &&
            this.safeName !== this.name &&
            this.safeName[this.name.length] === '$' &&
            this.safeName[this.name.length + 1] === '$') {
            this.safeName = undefined;
            return this.name;
        }
        return this.safeName || this.name;
    };
    Variable.prototype.getValue = function () {
        return UNKNOWN_VALUE;
    };
    Variable.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 0;
    };
    Variable.prototype.hasEffectsWhenAssignedAtPath = function (_path, _options) {
        return true;
    };
    Variable.prototype.hasEffectsWhenCalledAtPath = function (_path, _callOptions, _options) {
        return true;
    };
    /**
     * Marks this variable as being part of the bundle, which is usually the case when one of
     * its identifiers becomes part of the bundle. Returns true if it has not been included
     * previously.
     * Once a variable is included, it should take care all its declarations are included.
     */
    Variable.prototype.includeVariable = function () {
        if (this.included) {
            return false;
        }
        this.included = true;
        return true;
    };
    Variable.prototype.someReturnExpressionWhenCalledAtPath = function (_path, _callOptions, predicateFunction, options) {
        return predicateFunction(options)(UNKNOWN_EXPRESSION);
    };
    Variable.prototype.toString = function () {
        return this.name;
    };
    Variable.prototype.setSafeName = function (name) {
        this.safeName = name;
    };
    return Variable;
}());

function isNamespaceVariable(variable) {
    return variable.isNamespace;
}
var NamespaceVariable = /** @class */ (function (_super) {
    __extends(NamespaceVariable, _super);
    function NamespaceVariable(module) {
        var _this = _super.call(this, module.basename()) || this;
        _this.isNamespace = true;
        _this.module = module;
        _this.needsNamespaceBlock = false;
        _this.originals = blank();
        module
            .getExports()
            .concat(module.getReexports())
            .forEach(function (name) {
            _this.originals[name] = module.traceExport(name);
        });
        return _this;
    }
    NamespaceVariable.prototype.addReference = function (identifier) {
        this.name = identifier.name;
    };
    NamespaceVariable.prototype.includeVariable = function () {
        if (!_super.prototype.includeVariable.call(this)) {
            return false;
        }
        this.needsNamespaceBlock = true;
        forOwn(this.originals, function (original) { return original.includeVariable(); });
        return true;
    };
    NamespaceVariable.prototype.renderBlock = function (legacy, freeze, indentString) {
        var _this = this;
        var members = keys(this.originals).map(function (name) {
            var original = _this.originals[name];
            if (original.isReassigned && !legacy) {
                return indentString + "get " + name + " () { return " + original.getName() + "; }";
            }
            if (legacy && reservedWords$1.indexOf(name) !== -1)
                name = "'" + name + "'";
            return "" + indentString + name + ": " + original.getName();
        });
        var callee = freeze ? (legacy ? "(Object.freeze || Object)" : "Object.freeze") : '';
        return this.module.graph.varOrConst + " " + this.getName() + " = " + callee + "({\n" + members.join(',\n') + "\n});\n\n";
    };
    return NamespaceVariable;
}(Variable));

function extractNames(param) {
    var names = [];
    extractors[param.type](names, param);
    return names;
}
var extractors = {
    Identifier: function (names, param) {
        names.push(param.name);
    },
    ObjectPattern: function (names, param) {
        param.properties.forEach(function (prop) {
            extractors[prop.value.type](names, prop.value);
        });
    },
    ArrayPattern: function (names, param) {
        param.elements.forEach(function (element) {
            if (element)
                extractors[element.type](names, element);
        });
    },
    RestElement: function (names, param) {
        extractors[param.argument.type](names, param.argument);
    },
    AssignmentPattern: function (names, param) {
        extractors[param.left.type](names, param.left);
    }
};

var immutable = createCommonjsModule(function (module, exports) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (global, factory) {
  module.exports = factory();
}(commonjsGlobal, function () {var SLICE$0 = Array.prototype.slice;

  function createClass(ctor, superClass) {
    if (superClass) {
      ctor.prototype = Object.create(superClass.prototype);
    }
    ctor.prototype.constructor = ctor;
  }

  function Iterable(value) {
      return isIterable(value) ? value : Seq(value);
    }


  createClass(KeyedIterable, Iterable);
    function KeyedIterable(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }


  createClass(IndexedIterable, Iterable);
    function IndexedIterable(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }


  createClass(SetIterable, Iterable);
    function SetIterable(value) {
      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
    }



  function isIterable(maybeIterable) {
    return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
  }

  function isKeyed(maybeKeyed) {
    return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
  }

  function isIndexed(maybeIndexed) {
    return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  function isOrdered(maybeOrdered) {
    return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
  }

  Iterable.isIterable = isIterable;
  Iterable.isKeyed = isKeyed;
  Iterable.isIndexed = isIndexed;
  Iterable.isAssociative = isAssociative;
  Iterable.isOrdered = isOrdered;

  Iterable.Keyed = KeyedIterable;
  Iterable.Indexed = IndexedIterable;
  Iterable.Set = SetIterable;


  var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  // Used for setting prototype methods that IE8 chokes on.
  var DELETE = 'delete';

  // Constants describing the size of trie nodes.
  var SHIFT = 5; // Resulted in best performance after ______?
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  // A consistent shared value representing "not set" which equals nothing other
  // than itself, and nothing that could be provided externally.
  var NOT_SET = {};

  // Boolean references, Rough equivalent of `bool &`.
  var CHANGE_LENGTH = { value: false };
  var DID_ALTER = { value: false };

  function MakeRef(ref) {
    ref.value = false;
    return ref;
  }

  function SetRef(ref) {
    ref && (ref.value = true);
  }

  // A function which returns a value representing an "owner" for transient writes
  // to tries. The return value will only ever equal itself, and will not equal
  // the return of any subsequent call of this function.
  function OwnerID() {}

  // http://jsperf.com/copy-array-inline
  function arrCopy(arr, offset) {
    offset = offset || 0;
    var len = Math.max(0, arr.length - offset);
    var newArr = new Array(len);
    for (var ii = 0; ii < len; ii++) {
      newArr[ii] = arr[ii + offset];
    }
    return newArr;
  }

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    // This implements "is array index" which the ECMAString spec defines as:
    //
    //     A String property name P is an array index if and only if
    //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
    //     to 2^32−1.
    //
    // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
    if (typeof index !== 'number') {
      var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
      if ('' + uint32Index !== index || uint32Index === 4294967295) {
        return NaN;
      }
      index = uint32Index;
    }
    return index < 0 ? ensureSize(iter) + index : index;
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return (begin === 0 || (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined ?
      defaultIndex :
      index < 0 ?
        Math.max(0, size + index) :
        size === undefined ?
          index :
          Math.min(size, index);
  }

  /* global Symbol */

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


  function Iterator(next) {
      this.next = next;
    }

    Iterator.prototype.toString = function() {
      return '[Iterator]';
    };


  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect =
  Iterator.prototype.toSource = function () { return this.toString(); };
  Iterator.prototype[ITERATOR_SYMBOL] = function () {
    return this;
  };


  function iteratorValue(type, k, v, iteratorResult) {
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
      value: value, done: false
    });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn = iterable && (
      (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]
    );
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  function isArrayLike(value) {
    return value && typeof value.length === 'number';
  }

  createClass(Seq, Iterable);
    function Seq(value) {
      return value === null || value === undefined ? emptySequence() :
        isIterable(value) ? value.toSeq() : seqFromValue(value);
    }

    Seq.of = function(/*...values*/) {
      return Seq(arguments);
    };

    Seq.prototype.toSeq = function() {
      return this;
    };

    Seq.prototype.toString = function() {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, true);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, true);
    };



  createClass(KeyedSeq, Seq);
    function KeyedSeq(value) {
      return value === null || value === undefined ?
        emptySequence().toKeyedSeq() :
        isIterable(value) ?
          (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
          keyedSeqFromValue(value);
    }

    KeyedSeq.prototype.toKeyedSeq = function() {
      return this;
    };



  createClass(IndexedSeq, Seq);
    function IndexedSeq(value) {
      return value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
    }

    IndexedSeq.of = function(/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function() {
      return this;
    };

    IndexedSeq.prototype.toString = function() {
      return this.__toString('Seq [', ']');
    };

    IndexedSeq.prototype.__iterate = function(fn, reverse) {
      return seqIterate(this, fn, reverse, false);
    };

    IndexedSeq.prototype.__iterator = function(type, reverse) {
      return seqIterator(this, type, reverse, false);
    };



  createClass(SetSeq, Seq);
    function SetSeq(value) {
      return (
        value === null || value === undefined ? emptySequence() :
        !isIterable(value) ? indexedSeqFromValue(value) :
        isKeyed(value) ? value.entrySeq() : value
      ).toSetSeq();
    }

    SetSeq.of = function(/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function() {
      return this;
    };



  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

  Seq.prototype[IS_SEQ_SENTINEL] = true;



  createClass(ArraySeq, IndexedSeq);
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }

    ArraySeq.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function(fn, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ArraySeq.prototype.__iterator = function(type, reverse) {
      var array = this._array;
      var maxIndex = array.length - 1;
      var ii = 0;
      return new Iterator(function() 
        {return ii > maxIndex ?
          iteratorDone() :
          iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])}
      );
    };



  createClass(ObjectSeq, KeyedSeq);
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }

    ObjectSeq.prototype.get = function(key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function(key) {
      return this._object.hasOwnProperty(key);
    };

    ObjectSeq.prototype.__iterate = function(fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var key = keys[reverse ? maxIndex - ii : ii];
        if (fn(object[key], key, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    ObjectSeq.prototype.__iterator = function(type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var maxIndex = keys.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var key = keys[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, key, object[key]);
      });
    };

  ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(IterableSeq, IndexedSeq);
    function IterableSeq(iterable) {
      this._iterable = iterable;
      this.size = iterable.length || iterable.size;
    }

    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterable = this._iterable;
      var iterator = getIterator(iterable);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };



  createClass(IteratorSeq, IndexedSeq);
    function IteratorSeq(iterator) {
      this._iterator = iterator;
      this._iteratorCache = [];
    }

    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      while (iterations < cache.length) {
        if (fn(cache[iterations], iterations++, this) === false) {
          return iterations;
        }
      }
      var step;
      while (!(step = iterator.next()).done) {
        var val = step.value;
        cache[iterations] = val;
        if (fn(val, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };

    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = this._iterator;
      var cache = this._iteratorCache;
      var iterations = 0;
      return new Iterator(function()  {
        if (iterations >= cache.length) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          cache[iterations] = step.value;
        }
        return iteratorValue(type, iterations, cache[iterations++]);
      });
    };




  // # pragma Helper functions

  function isSeq(maybeSeq) {
    return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
  }

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq =
      Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
      isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
      hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
      typeof value === 'object' ? new ObjectSeq(value) :
      undefined;
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of [k, v] entries, '+
        'or keyed object: ' + value
      );
    }
    return seq;
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values: ' + value
      );
    }
    return seq;
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value) ||
      (typeof value === 'object' && new ObjectSeq(value));
    if (!seq) {
      throw new TypeError(
        'Expected Array or iterable object of values, or keyed object: ' + value
      );
    }
    return seq;
  }

  function maybeIndexedSeqFromValue(value) {
    return (
      isArrayLike(value) ? new ArraySeq(value) :
      isIterator(value) ? new IteratorSeq(value) :
      hasIterator(value) ? new IterableSeq(value) :
      undefined
    );
  }

  function seqIterate(seq, fn, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      for (var ii = 0; ii <= maxIndex; ii++) {
        var entry = cache[reverse ? maxIndex - ii : ii];
        if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
          return ii + 1;
        }
      }
      return ii;
    }
    return seq.__iterateUncached(fn, reverse);
  }

  function seqIterator(seq, type, reverse, useKeys) {
    var cache = seq._cache;
    if (cache) {
      var maxIndex = cache.length - 1;
      var ii = 0;
      return new Iterator(function()  {
        var entry = cache[reverse ? maxIndex - ii : ii];
        return ii++ > maxIndex ?
          iteratorDone() :
          iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
      });
    }
    return seq.__iteratorUncached(type, reverse);
  }

  function fromJS(json, converter) {
    return converter ?
      fromJSWith(converter, json, '', {'': json}) :
      fromJSDefault(json);
  }

  function fromJSWith(converter, json, key, parentJSON) {
    if (Array.isArray(json)) {
      return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    if (isPlainObj(json)) {
      return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
    }
    return json;
  }

  function fromJSDefault(json) {
    if (Array.isArray(json)) {
      return IndexedSeq(json).map(fromJSDefault).toList();
    }
    if (isPlainObj(json)) {
      return KeyedSeq(json).map(fromJSDefault).toMap();
    }
    return json;
  }

  function isPlainObj(value) {
    return value && (value.constructor === Object || value.constructor === undefined);
  }

  /**
   * An extension of the "same-value" algorithm as [described for use by ES6 Map
   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
   *
   * NaN is considered the same as NaN, however -0 and 0 are considered the same
   * value, which is different from the algorithm described by
   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
   *
   * This is extended further to allow Objects to describe the values they
   * represent, by way of `valueOf` or `equals` (and `hashCode`).
   *
   * Note: because of this extension, the key equality of Immutable.Map and the
   * value equality of Immutable.Set will differ from ES6 Map and Set.
   *
   * ### Defining custom values
   *
   * The easiest way to describe the value an object represents is by implementing
   * `valueOf`. For example, `Date` represents a value by returning a unix
   * timestamp for `valueOf`:
   *
   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
   *     var date2 = new Date(1234567890000);
   *     date1.valueOf(); // 1234567890000
   *     assert( date1 !== date2 );
   *     assert( Immutable.is( date1, date2 ) );
   *
   * Note: overriding `valueOf` may have other implications if you use this object
   * where JavaScript expects a primitive, such as implicit string coercion.
   *
   * For more complex types, especially collections, implementing `valueOf` may
   * not be performant. An alternative is to implement `equals` and `hashCode`.
   *
   * `equals` takes another object, presumably of similar type, and returns true
   * if the it is equal. Equality is symmetrical, so the same result should be
   * returned if this and the argument are flipped.
   *
   *     assert( a.equals(b) === b.equals(a) );
   *
   * `hashCode` returns a 32bit integer number representing the object which will
   * be used to determine how to store the value object in a Map or Set. You must
   * provide both or neither methods, one must not exist without the other.
   *
   * Also, an important relationship between these methods must be upheld: if two
   * values are equal, they *must* return the same hashCode. If the values are not
   * equal, they might have the same hashCode; this is called a hash collision,
   * and while undesirable for performance reasons, it is acceptable.
   *
   *     if (a.equals(b)) {
   *       assert( a.hashCode() === b.hashCode() );
   *     }
   *
   * All Immutable collections implement `equals` and `hashCode`.
   *
   */
  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
    if (typeof valueA.valueOf === 'function' &&
        typeof valueB.valueOf === 'function') {
      valueA = valueA.valueOf();
      valueB = valueB.valueOf();
      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
        return true;
      }
      if (!valueA || !valueB) {
        return false;
      }
    }
    if (typeof valueA.equals === 'function' &&
        typeof valueB.equals === 'function' &&
        valueA.equals(valueB)) {
      return true;
    }
    return false;
  }

  function deepEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (
      !isIterable(b) ||
      a.size !== undefined && b.size !== undefined && a.size !== b.size ||
      a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
      isKeyed(a) !== isKeyed(b) ||
      isIndexed(a) !== isIndexed(b) ||
      isOrdered(a) !== isOrdered(b)
    ) {
      return false;
    }

    if (a.size === 0 && b.size === 0) {
      return true;
    }

    var notAssociative = !isAssociative(a);

    if (isOrdered(a)) {
      var entries = a.entries();
      return b.every(function(v, k)  {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done;
    }

    var flipped = false;

    if (a.size === undefined) {
      if (b.size === undefined) {
        if (typeof a.cacheResult === 'function') {
          a.cacheResult();
        }
      } else {
        flipped = true;
        var _ = a;
        a = b;
        b = _;
      }
    }

    var allEqual = true;
    var bSize = b.__iterate(function(v, k)  {
      if (notAssociative ? !a.has(v) :
          flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
        allEqual = false;
        return false;
      }
    });

    return allEqual && a.size === bSize;
  }

  createClass(Repeat, IndexedSeq);

    function Repeat(value, times) {
      if (!(this instanceof Repeat)) {
        return new Repeat(value, times);
      }
      this._value = value;
      this.size = times === undefined ? Infinity : Math.max(0, times);
      if (this.size === 0) {
        if (EMPTY_REPEAT) {
          return EMPTY_REPEAT;
        }
        EMPTY_REPEAT = this;
      }
    }

    Repeat.prototype.toString = function() {
      if (this.size === 0) {
        return 'Repeat []';
      }
      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
    };

    Repeat.prototype.get = function(index, notSetValue) {
      return this.has(index) ? this._value : notSetValue;
    };

    Repeat.prototype.includes = function(searchValue) {
      return is(this._value, searchValue);
    };

    Repeat.prototype.slice = function(begin, end) {
      var size = this.size;
      return wholeSlice(begin, end, size) ? this :
        new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
    };

    Repeat.prototype.reverse = function() {
      return this;
    };

    Repeat.prototype.indexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return 0;
      }
      return -1;
    };

    Repeat.prototype.lastIndexOf = function(searchValue) {
      if (is(this._value, searchValue)) {
        return this.size;
      }
      return -1;
    };

    Repeat.prototype.__iterate = function(fn, reverse) {
      for (var ii = 0; ii < this.size; ii++) {
        if (fn(this._value, ii, this) === false) {
          return ii + 1;
        }
      }
      return ii;
    };

    Repeat.prototype.__iterator = function(type, reverse) {var this$0 = this;
      var ii = 0;
      return new Iterator(function() 
        {return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone()}
      );
    };

    Repeat.prototype.equals = function(other) {
      return other instanceof Repeat ?
        is(this._value, other._value) :
        deepEqual(other);
    };


  var EMPTY_REPEAT;

  function invariant(condition, error) {
    if (!condition) throw new Error(error);
  }

  createClass(Range, IndexedSeq);

    function Range(start, end, step) {
      if (!(this instanceof Range)) {
        return new Range(start, end, step);
      }
      invariant(step !== 0, 'Cannot step a Range by 0');
      start = start || 0;
      if (end === undefined) {
        end = Infinity;
      }
      step = step === undefined ? 1 : Math.abs(step);
      if (end < start) {
        step = -step;
      }
      this._start = start;
      this._end = end;
      this._step = step;
      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
      if (this.size === 0) {
        if (EMPTY_RANGE) {
          return EMPTY_RANGE;
        }
        EMPTY_RANGE = this;
      }
    }

    Range.prototype.toString = function() {
      if (this.size === 0) {
        return 'Range []';
      }
      return 'Range [ ' +
        this._start + '...' + this._end +
        (this._step !== 1 ? ' by ' + this._step : '') +
      ' ]';
    };

    Range.prototype.get = function(index, notSetValue) {
      return this.has(index) ?
        this._start + wrapIndex(this, index) * this._step :
        notSetValue;
    };

    Range.prototype.includes = function(searchValue) {
      var possibleIndex = (searchValue - this._start) / this._step;
      return possibleIndex >= 0 &&
        possibleIndex < this.size &&
        possibleIndex === Math.floor(possibleIndex);
    };

    Range.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      begin = resolveBegin(begin, this.size);
      end = resolveEnd(end, this.size);
      if (end <= begin) {
        return new Range(0, 0);
      }
      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
    };

    Range.prototype.indexOf = function(searchValue) {
      var offsetValue = searchValue - this._start;
      if (offsetValue % this._step === 0) {
        var index = offsetValue / this._step;
        if (index >= 0 && index < this.size) {
          return index
        }
      }
      return -1;
    };

    Range.prototype.lastIndexOf = function(searchValue) {
      return this.indexOf(searchValue);
    };

    Range.prototype.__iterate = function(fn, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      for (var ii = 0; ii <= maxIndex; ii++) {
        if (fn(value, ii, this) === false) {
          return ii + 1;
        }
        value += reverse ? -step : step;
      }
      return ii;
    };

    Range.prototype.__iterator = function(type, reverse) {
      var maxIndex = this.size - 1;
      var step = this._step;
      var value = reverse ? this._start + maxIndex * step : this._start;
      var ii = 0;
      return new Iterator(function()  {
        var v = value;
        value += reverse ? -step : step;
        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
      });
    };

    Range.prototype.equals = function(other) {
      return other instanceof Range ?
        this._start === other._start &&
        this._end === other._end &&
        this._step === other._step :
        deepEqual(this, other);
    };


  var EMPTY_RANGE;

  createClass(Collection, Iterable);
    function Collection() {
      throw TypeError('Abstract');
    }


  createClass(KeyedCollection, Collection);function KeyedCollection() {}

  createClass(IndexedCollection, Collection);function IndexedCollection() {}

  createClass(SetCollection, Collection);function SetCollection() {}


  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  var imul =
    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
    Math.imul :
    function imul(a, b) {
      a = a | 0; // int
      b = b | 0; // int
      var c = a & 0xffff;
      var d = b & 0xffff;
      // Shift by 0 fixes the sign on the high part.
      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
    };

  // v8 has an optimization for storing 31-bit signed numbers.
  // Values which have either 00 or 11 as the high order bits qualify.
  // This function drops the highest order bit in a signed number, maintaining
  // the sign bit.
  function smi(i32) {
    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
  }

  function hash(o) {
    if (o === false || o === null || o === undefined) {
      return 0;
    }
    if (typeof o.valueOf === 'function') {
      o = o.valueOf();
      if (o === false || o === null || o === undefined) {
        return 0;
      }
    }
    if (o === true) {
      return 1;
    }
    var type = typeof o;
    if (type === 'number') {
      if (o !== o || o === Infinity) {
        return 0;
      }
      var h = o | 0;
      if (h !== o) {
        h ^= o * 0xFFFFFFFF;
      }
      while (o > 0xFFFFFFFF) {
        o /= 0xFFFFFFFF;
        h ^= o;
      }
      return smi(h);
    }
    if (type === 'string') {
      return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
    }
    if (typeof o.hashCode === 'function') {
      return o.hashCode();
    }
    if (type === 'object') {
      return hashJSObj(o);
    }
    if (typeof o.toString === 'function') {
      return hashString(o.toString());
    }
    throw new Error('Value type ' + type + ' cannot be hashed.');
  }

  function cachedHashString(string) {
    var hash = stringHashCache[string];
    if (hash === undefined) {
      hash = hashString(string);
      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
        STRING_HASH_CACHE_SIZE = 0;
        stringHashCache = {};
      }
      STRING_HASH_CACHE_SIZE++;
      stringHashCache[string] = hash;
    }
    return hash;
  }

  // http://jsperf.com/hashing-strings
  function hashString(string) {
    // This is the hash from JVM
    // The hash code for a string is computed as
    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
    // where s[i] is the ith character of the string and n is the length of
    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
    // (exclusive) by dropping high bits.
    var hash = 0;
    for (var ii = 0; ii < string.length; ii++) {
      hash = 31 * hash + string.charCodeAt(ii) | 0;
    }
    return smi(hash);
  }

  function hashJSObj(obj) {
    var hash;
    if (usingWeakMap) {
      hash = weakMap.get(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = obj[UID_HASH_KEY];
    if (hash !== undefined) {
      return hash;
    }

    if (!canDefineProperty) {
      hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
      if (hash !== undefined) {
        return hash;
      }

      hash = getIENodeHash(obj);
      if (hash !== undefined) {
        return hash;
      }
    }

    hash = ++objHashUID;
    if (objHashUID & 0x40000000) {
      objHashUID = 0;
    }

    if (usingWeakMap) {
      weakMap.set(obj, hash);
    } else if (isExtensible !== undefined && isExtensible(obj) === false) {
      throw new Error('Non-extensible objects are not allowed as keys.');
    } else if (canDefineProperty) {
      Object.defineProperty(obj, UID_HASH_KEY, {
        'enumerable': false,
        'configurable': false,
        'writable': false,
        'value': hash
      });
    } else if (obj.propertyIsEnumerable !== undefined &&
               obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
      // Since we can't define a non-enumerable property on the object
      // we'll hijack one of the less-used non-enumerable properties to
      // save our hash on it. Since this is a function it will not show up in
      // `JSON.stringify` which is what we want.
      obj.propertyIsEnumerable = function() {
        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
      };
      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
    } else if (obj.nodeType !== undefined) {
      // At this point we couldn't get the IE `uniqueID` to use as a hash
      // and we couldn't use a non-enumerable property to exploit the
      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
      // itself.
      obj[UID_HASH_KEY] = hash;
    } else {
      throw new Error('Unable to set a non-enumerable property on object.');
    }

    return hash;
  }

  // Get references to ES5 object methods.
  var isExtensible = Object.isExtensible;

  // True if Object.defineProperty works as expected. IE8 fails this test.
  var canDefineProperty = (function() {
    try {
      Object.defineProperty({}, '@', {});
      return true;
    } catch (e) {
      return false;
    }
  }());

  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
  // and avoid memory leaks from the IE cloneNode bug.
  function getIENodeHash(node) {
    if (node && node.nodeType > 0) {
      switch (node.nodeType) {
        case 1: // Element
          return node.uniqueID;
        case 9: // Document
          return node.documentElement && node.documentElement.uniqueID;
      }
    }
  }

  // If possible, use a WeakMap.
  var usingWeakMap = typeof WeakMap === 'function';
  var weakMap;
  if (usingWeakMap) {
    weakMap = new WeakMap();
  }

  var objHashUID = 0;

  var UID_HASH_KEY = '__immutablehash__';
  if (typeof Symbol === 'function') {
    UID_HASH_KEY = Symbol(UID_HASH_KEY);
  }

  var STRING_HASH_CACHE_MIN_STRLEN = 16;
  var STRING_HASH_CACHE_MAX_SIZE = 255;
  var STRING_HASH_CACHE_SIZE = 0;
  var stringHashCache = {};

  function assertNotInfinite(size) {
    invariant(
      size !== Infinity,
      'Cannot perform this action with an infinite size.'
    );
  }

  createClass(Map, KeyedCollection);

    // @pragma Construction

    function Map(value) {
      return value === null || value === undefined ? emptyMap() :
        isMap(value) && !isOrdered(value) ? value :
        emptyMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    Map.of = function() {var keyValues = SLICE$0.call(arguments, 0);
      return emptyMap().withMutations(function(map ) {
        for (var i = 0; i < keyValues.length; i += 2) {
          if (i + 1 >= keyValues.length) {
            throw new Error('Missing value for key: ' + keyValues[i]);
          }
          map.set(keyValues[i], keyValues[i + 1]);
        }
      });
    };

    Map.prototype.toString = function() {
      return this.__toString('Map {', '}');
    };

    // @pragma Access

    Map.prototype.get = function(k, notSetValue) {
      return this._root ?
        this._root.get(0, undefined, k, notSetValue) :
        notSetValue;
    };

    // @pragma Modification

    Map.prototype.set = function(k, v) {
      return updateMap(this, k, v);
    };

    Map.prototype.setIn = function(keyPath, v) {
      return this.updateIn(keyPath, NOT_SET, function()  {return v});
    };

    Map.prototype.remove = function(k) {
      return updateMap(this, k, NOT_SET);
    };

    Map.prototype.deleteIn = function(keyPath) {
      return this.updateIn(keyPath, function()  {return NOT_SET});
    };

    Map.prototype.update = function(k, notSetValue, updater) {
      return arguments.length === 1 ?
        k(this) :
        this.updateIn([k], notSetValue, updater);
    };

    Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
      if (!updater) {
        updater = notSetValue;
        notSetValue = undefined;
      }
      var updatedValue = updateInDeepMap(
        this,
        forceIterator(keyPath),
        notSetValue,
        updater
      );
      return updatedValue === NOT_SET ? undefined : updatedValue;
    };

    Map.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._root = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyMap();
    };

    // @pragma Composition

    Map.prototype.merge = function(/*...iters*/) {
      return mergeIntoMapWith(this, undefined, arguments);
    };

    Map.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, merger, iters);
    };

    Map.prototype.mergeIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.merge === 'function' ?
          m.merge.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoMapWith(this, deepMerger, arguments);
    };

    Map.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoMapWith(this, deepMergerWith(merger), iters);
    };

    Map.prototype.mergeDeepIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
      return this.updateIn(
        keyPath,
        emptyMap(),
        function(m ) {return typeof m.mergeDeep === 'function' ?
          m.mergeDeep.apply(m, iters) :
          iters[iters.length - 1]}
      );
    };

    Map.prototype.sort = function(comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator));
    };

    Map.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedMap(sortFactory(this, comparator, mapper));
    };

    // @pragma Mutability

    Map.prototype.withMutations = function(fn) {
      var mutable = this.asMutable();
      fn(mutable);
      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
    };

    Map.prototype.asMutable = function() {
      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
    };

    Map.prototype.asImmutable = function() {
      return this.__ensureOwner();
    };

    Map.prototype.wasAltered = function() {
      return this.__altered;
    };

    Map.prototype.__iterator = function(type, reverse) {
      return new MapIterator(this, type, reverse);
    };

    Map.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      this._root && this._root.iterate(function(entry ) {
        iterations++;
        return fn(entry[1], entry[0], this$0);
      }, reverse);
      return iterations;
    };

    Map.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeMap(this.size, this._root, ownerID, this.__hash);
    };


  function isMap(maybeMap) {
    return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
  }

  Map.isMap = isMap;

  var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

  var MapPrototype = Map.prototype;
  MapPrototype[IS_MAP_SENTINEL] = true;
  MapPrototype[DELETE] = MapPrototype.remove;
  MapPrototype.removeIn = MapPrototype.deleteIn;


  // #pragma Trie Nodes



    function ArrayMapNode(ownerID, entries) {
      this.ownerID = ownerID;
      this.entries = entries;
    }

    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && entries.length === 1) {
        return; // undefined
      }

      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
        return createNodes(ownerID, entries, key, value);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new ArrayMapNode(ownerID, newEntries);
    };




    function BitmapIndexedNode(ownerID, bitmap, nodes) {
      this.ownerID = ownerID;
      this.bitmap = bitmap;
      this.nodes = nodes;
    }

    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
      var bitmap = this.bitmap;
      return (bitmap & bit) === 0 ? notSetValue :
        this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
    };

    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var bit = 1 << keyHashFrag;
      var bitmap = this.bitmap;
      var exists = (bitmap & bit) !== 0;

      if (!exists && value === NOT_SET) {
        return this;
      }

      var idx = popCount(bitmap & (bit - 1));
      var nodes = this.nodes;
      var node = exists ? nodes[idx] : undefined;
      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

      if (newNode === node) {
        return this;
      }

      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
      }

      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
        return nodes[idx ^ 1];
      }

      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
        return newNode;
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
      var newNodes = exists ? newNode ?
        setIn(nodes, idx, newNode, isEditable) :
        spliceOut(nodes, idx, isEditable) :
        spliceIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.bitmap = newBitmap;
        this.nodes = newNodes;
        return this;
      }

      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
    };




    function HashArrayMapNode(ownerID, count, nodes) {
      this.ownerID = ownerID;
      this.count = count;
      this.nodes = nodes;
    }

    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var node = this.nodes[idx];
      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
    };

    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }
      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
      var removed = value === NOT_SET;
      var nodes = this.nodes;
      var node = nodes[idx];

      if (removed && !node) {
        return this;
      }

      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
      if (newNode === node) {
        return this;
      }

      var newCount = this.count;
      if (!node) {
        newCount++;
      } else if (!newNode) {
        newCount--;
        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
          return packNodes(ownerID, nodes, newCount, idx);
        }
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newNodes = setIn(nodes, idx, newNode, isEditable);

      if (isEditable) {
        this.count = newCount;
        this.nodes = newNodes;
        return this;
      }

      return new HashArrayMapNode(ownerID, newCount, newNodes);
    };




    function HashCollisionNode(ownerID, keyHash, entries) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entries = entries;
    }

    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      var entries = this.entries;
      for (var ii = 0, len = entries.length; ii < len; ii++) {
        if (is(key, entries[ii][0])) {
          return entries[ii][1];
        }
      }
      return notSetValue;
    };

    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      if (keyHash === undefined) {
        keyHash = hash(key);
      }

      var removed = value === NOT_SET;

      if (keyHash !== this.keyHash) {
        if (removed) {
          return this;
        }
        SetRef(didAlter);
        SetRef(didChangeSize);
        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
      }

      var entries = this.entries;
      var idx = 0;
      for (var len = entries.length; idx < len; idx++) {
        if (is(key, entries[idx][0])) {
          break;
        }
      }
      var exists = idx < len;

      if (exists ? entries[idx][1] === value : removed) {
        return this;
      }

      SetRef(didAlter);
      (removed || !exists) && SetRef(didChangeSize);

      if (removed && len === 2) {
        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
      }

      var isEditable = ownerID && ownerID === this.ownerID;
      var newEntries = isEditable ? entries : arrCopy(entries);

      if (exists) {
        if (removed) {
          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
        } else {
          newEntries[idx] = [key, value];
        }
      } else {
        newEntries.push([key, value]);
      }

      if (isEditable) {
        this.entries = newEntries;
        return this;
      }

      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
    };




    function ValueNode(ownerID, keyHash, entry) {
      this.ownerID = ownerID;
      this.keyHash = keyHash;
      this.entry = entry;
    }

    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
    };

    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
      var removed = value === NOT_SET;
      var keyMatch = is(key, this.entry[0]);
      if (keyMatch ? value === this.entry[1] : removed) {
        return this;
      }

      SetRef(didAlter);

      if (removed) {
        SetRef(didChangeSize);
        return; // undefined
      }

      if (keyMatch) {
        if (ownerID && ownerID === this.ownerID) {
          this.entry[1] = value;
          return this;
        }
        return new ValueNode(ownerID, this.keyHash, [key, value]);
      }

      SetRef(didChangeSize);
      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
    };



  // #pragma Iterators

  ArrayMapNode.prototype.iterate =
  HashCollisionNode.prototype.iterate = function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  };

  BitmapIndexedNode.prototype.iterate =
  HashArrayMapNode.prototype.iterate = function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  };

  ValueNode.prototype.iterate = function (fn, reverse) {
    return fn(this.entry);
  };

  createClass(MapIterator, Iterator);

    function MapIterator(map, type, reverse) {
      this._type = type;
      this._reverse = reverse;
      this._stack = map._root && mapIteratorFrame(map._root);
    }

    MapIterator.prototype.next = function() {
      var type = this._type;
      var stack = this._stack;
      while (stack) {
        var node = stack.node;
        var index = stack.index++;
        var maxIndex;
        if (node.entry) {
          if (index === 0) {
            return mapIteratorValue(type, node.entry);
          }
        } else if (node.entries) {
          maxIndex = node.entries.length - 1;
          if (index <= maxIndex) {
            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
          }
        } else {
          maxIndex = node.nodes.length - 1;
          if (index <= maxIndex) {
            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
            if (subNode) {
              if (subNode.entry) {
                return mapIteratorValue(type, subNode.entry);
              }
              stack = this._stack = mapIteratorFrame(subNode, stack);
            }
            continue;
          }
        }
        stack = this._stack = this._stack.__prev;
      }
      return iteratorDone();
    };


  function mapIteratorValue(type, entry) {
    return iteratorValue(type, entry[0], entry[1]);
  }

  function mapIteratorFrame(node, prev) {
    return {
      node: node,
      index: 0,
      __prev: prev
    };
  }

  function makeMap(size, root, ownerID, hash) {
    var map = Object.create(MapPrototype);
    map.size = size;
    map._root = root;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_MAP;
  function emptyMap() {
    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
  }

  function updateMap(map, k, v) {
    var newRoot;
    var newSize;
    if (!map._root) {
      if (v === NOT_SET) {
        return map;
      }
      newSize = 1;
      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
    } else {
      var didChangeSize = MakeRef(CHANGE_LENGTH);
      var didAlter = MakeRef(DID_ALTER);
      newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
      if (!didAlter.value) {
        return map;
      }
      newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
    }
    if (map.__ownerID) {
      map.size = newSize;
      map._root = newRoot;
      map.__hash = undefined;
      map.__altered = true;
      return map;
    }
    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
  }

  function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
    if (!node) {
      if (value === NOT_SET) {
        return node;
      }
      SetRef(didAlter);
      SetRef(didChangeSize);
      return new ValueNode(ownerID, keyHash, [key, value]);
    }
    return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
  }

  function isLeafNode(node) {
    return node.constructor === ValueNode || node.constructor === HashCollisionNode;
  }

  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
    if (node.keyHash === keyHash) {
      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
    }

    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

    var newNode;
    var nodes = idx1 === idx2 ?
      [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
      (newNode = new ValueNode(ownerID, keyHash, entry), idx1 < idx2 ? [node, newNode] : [newNode, node]);

    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
  }

  function createNodes(ownerID, entries, key, value) {
    if (!ownerID) {
      ownerID = new OwnerID();
    }
    var node = new ValueNode(ownerID, hash(key), [key, value]);
    for (var ii = 0; ii < entries.length; ii++) {
      var entry = entries[ii];
      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
    }
    return node;
  }

  function packNodes(ownerID, nodes, count, excluding) {
    var bitmap = 0;
    var packedII = 0;
    var packedNodes = new Array(count);
    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
      var node = nodes[ii];
      if (node !== undefined && ii !== excluding) {
        bitmap |= bit;
        packedNodes[packedII++] = node;
      }
    }
    return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
  }

  function expandNodes(ownerID, nodes, bitmap, including, node) {
    var count = 0;
    var expandedNodes = new Array(SIZE);
    for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
    }
    expandedNodes[including] = node;
    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
  }

  function mergeIntoMapWith(map, merger, iterables) {
    var iters = [];
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = KeyedIterable(value);
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    return mergeIntoCollectionWith(map, merger, iters);
  }

  function deepMerger(existing, value, key) {
    return existing && existing.mergeDeep && isIterable(value) ?
      existing.mergeDeep(value) :
      is(existing, value) ? existing : value;
  }

  function deepMergerWith(merger) {
    return function(existing, value, key)  {
      if (existing && existing.mergeDeepWith && isIterable(value)) {
        return existing.mergeDeepWith(merger, value);
      }
      var nextValue = merger(existing, value, key);
      return is(existing, nextValue) ? existing : nextValue;
    };
  }

  function mergeIntoCollectionWith(collection, merger, iters) {
    iters = iters.filter(function(x ) {return x.size !== 0});
    if (iters.length === 0) {
      return collection;
    }
    if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
      return collection.constructor(iters[0]);
    }
    return collection.withMutations(function(collection ) {
      var mergeIntoMap = merger ?
        function(value, key)  {
          collection.update(key, NOT_SET, function(existing )
            {return existing === NOT_SET ? value : merger(existing, value, key)}
          );
        } :
        function(value, key)  {
          collection.set(key, value);
        };
      for (var ii = 0; ii < iters.length; ii++) {
        iters[ii].forEach(mergeIntoMap);
      }
    });
  }

  function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
    var isNotSet = existing === NOT_SET;
    var step = keyPathIter.next();
    if (step.done) {
      var existingValue = isNotSet ? notSetValue : existing;
      var newValue = updater(existingValue);
      return newValue === existingValue ? existing : newValue;
    }
    invariant(
      isNotSet || (existing && existing.set),
      'invalid keyPath'
    );
    var key = step.value;
    var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
    var nextUpdated = updateInDeepMap(
      nextExisting,
      keyPathIter,
      notSetValue,
      updater
    );
    return nextUpdated === nextExisting ? existing :
      nextUpdated === NOT_SET ? existing.remove(key) :
      (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
  }

  function popCount(x) {
    x = x - ((x >> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
    x = (x + (x >> 4)) & 0x0f0f0f0f;
    x = x + (x >> 8);
    x = x + (x >> 16);
    return x & 0x7f;
  }

  function setIn(array, idx, val, canEdit) {
    var newArray = canEdit ? array : arrCopy(array);
    newArray[idx] = val;
    return newArray;
  }

  function spliceIn(array, idx, val, canEdit) {
    var newLen = array.length + 1;
    if (canEdit && idx + 1 === newLen) {
      array[idx] = val;
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        newArray[ii] = val;
        after = -1;
      } else {
        newArray[ii] = array[ii + after];
      }
    }
    return newArray;
  }

  function spliceOut(array, idx, canEdit) {
    var newLen = array.length - 1;
    if (canEdit && idx === newLen) {
      array.pop();
      return array;
    }
    var newArray = new Array(newLen);
    var after = 0;
    for (var ii = 0; ii < newLen; ii++) {
      if (ii === idx) {
        after = 1;
      }
      newArray[ii] = array[ii + after];
    }
    return newArray;
  }

  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

  createClass(List, IndexedCollection);

    // @pragma Construction

    function List(value) {
      var empty = emptyList();
      if (value === null || value === undefined) {
        return empty;
      }
      if (isList(value)) {
        return value;
      }
      var iter = IndexedIterable(value);
      var size = iter.size;
      if (size === 0) {
        return empty;
      }
      assertNotInfinite(size);
      if (size > 0 && size < SIZE) {
        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
      }
      return empty.withMutations(function(list ) {
        list.setSize(size);
        iter.forEach(function(v, i)  {return list.set(i, v)});
      });
    }

    List.of = function(/*...values*/) {
      return this(arguments);
    };

    List.prototype.toString = function() {
      return this.__toString('List [', ']');
    };

    // @pragma Access

    List.prototype.get = function(index, notSetValue) {
      index = wrapIndex(this, index);
      if (index >= 0 && index < this.size) {
        index += this._origin;
        var node = listNodeFor(this, index);
        return node && node.array[index & MASK];
      }
      return notSetValue;
    };

    // @pragma Modification

    List.prototype.set = function(index, value) {
      return updateList(this, index, value);
    };

    List.prototype.remove = function(index) {
      return !this.has(index) ? this :
        index === 0 ? this.shift() :
        index === this.size - 1 ? this.pop() :
        this.splice(index, 1);
    };

    List.prototype.insert = function(index, value) {
      return this.splice(index, 0, value);
    };

    List.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = this._origin = this._capacity = 0;
        this._level = SHIFT;
        this._root = this._tail = null;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyList();
    };

    List.prototype.push = function(/*...values*/) {
      var values = arguments;
      var oldSize = this.size;
      return this.withMutations(function(list ) {
        setListBounds(list, 0, oldSize + values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(oldSize + ii, values[ii]);
        }
      });
    };

    List.prototype.pop = function() {
      return setListBounds(this, 0, -1);
    };

    List.prototype.unshift = function(/*...values*/) {
      var values = arguments;
      return this.withMutations(function(list ) {
        setListBounds(list, -values.length);
        for (var ii = 0; ii < values.length; ii++) {
          list.set(ii, values[ii]);
        }
      });
    };

    List.prototype.shift = function() {
      return setListBounds(this, 1);
    };

    // @pragma Composition

    List.prototype.merge = function(/*...iters*/) {
      return mergeIntoListWith(this, undefined, arguments);
    };

    List.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, merger, iters);
    };

    List.prototype.mergeDeep = function(/*...iters*/) {
      return mergeIntoListWith(this, deepMerger, arguments);
    };

    List.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return mergeIntoListWith(this, deepMergerWith(merger), iters);
    };

    List.prototype.setSize = function(size) {
      return setListBounds(this, 0, size);
    };

    // @pragma Iteration

    List.prototype.slice = function(begin, end) {
      var size = this.size;
      if (wholeSlice(begin, end, size)) {
        return this;
      }
      return setListBounds(
        this,
        resolveBegin(begin, size),
        resolveEnd(end, size)
      );
    };

    List.prototype.__iterator = function(type, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      return new Iterator(function()  {
        var value = values();
        return value === DONE ?
          iteratorDone() :
          iteratorValue(type, index++, value);
      });
    };

    List.prototype.__iterate = function(fn, reverse) {
      var index = 0;
      var values = iterateList(this, reverse);
      var value;
      while ((value = values()) !== DONE) {
        if (fn(value, index++, this) === false) {
          break;
        }
      }
      return index;
    };

    List.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        return this;
      }
      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
    };


  function isList(maybeList) {
    return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
  }

  List.isList = isList;

  var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

  var ListPrototype = List.prototype;
  ListPrototype[IS_LIST_SENTINEL] = true;
  ListPrototype[DELETE] = ListPrototype.remove;
  ListPrototype.setIn = MapPrototype.setIn;
  ListPrototype.deleteIn =
  ListPrototype.removeIn = MapPrototype.removeIn;
  ListPrototype.update = MapPrototype.update;
  ListPrototype.updateIn = MapPrototype.updateIn;
  ListPrototype.mergeIn = MapPrototype.mergeIn;
  ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  ListPrototype.withMutations = MapPrototype.withMutations;
  ListPrototype.asMutable = MapPrototype.asMutable;
  ListPrototype.asImmutable = MapPrototype.asImmutable;
  ListPrototype.wasAltered = MapPrototype.wasAltered;



    function VNode(array, ownerID) {
      this.array = array;
      this.ownerID = ownerID;
    }

    // TODO: seems like these methods are very similar

    VNode.prototype.removeBefore = function(ownerID, level, index) {
      if (index === level ? 1 << level : 0 || this.array.length === 0) {
        return this;
      }
      var originIndex = (index >>> level) & MASK;
      if (originIndex >= this.array.length) {
        return new VNode([], ownerID);
      }
      var removingFirst = originIndex === 0;
      var newChild;
      if (level > 0) {
        var oldChild = this.array[originIndex];
        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
        if (newChild === oldChild && removingFirst) {
          return this;
        }
      }
      if (removingFirst && !newChild) {
        return this;
      }
      var editable = editableVNode(this, ownerID);
      if (!removingFirst) {
        for (var ii = 0; ii < originIndex; ii++) {
          editable.array[ii] = undefined;
        }
      }
      if (newChild) {
        editable.array[originIndex] = newChild;
      }
      return editable;
    };

    VNode.prototype.removeAfter = function(ownerID, level, index) {
      if (index === (level ? 1 << level : 0) || this.array.length === 0) {
        return this;
      }
      var sizeIndex = ((index - 1) >>> level) & MASK;
      if (sizeIndex >= this.array.length) {
        return this;
      }

      var newChild;
      if (level > 0) {
        var oldChild = this.array[sizeIndex];
        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
          return this;
        }
      }

      var editable = editableVNode(this, ownerID);
      editable.array.splice(sizeIndex + 1);
      if (newChild) {
        editable.array[sizeIndex] = newChild;
      }
      return editable;
    };



  var DONE = {};

  function iterateList(list, reverse) {
    var left = list._origin;
    var right = list._capacity;
    var tailPos = getTailOffset(right);
    var tail = list._tail;

    return iterateNodeOrLeaf(list._root, list._level, 0);

    function iterateNodeOrLeaf(node, level, offset) {
      return level === 0 ?
        iterateLeaf(node, offset) :
        iterateNode(node, level, offset);
    }

    function iterateLeaf(node, offset) {
      var array = offset === tailPos ? tail && tail.array : node && node.array;
      var from = offset > left ? 0 : left - offset;
      var to = right - offset;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        return array && array[idx];
      };
    }

    function iterateNode(node, level, offset) {
      var values;
      var array = node && node.array;
      var from = offset > left ? 0 : (left - offset) >> level;
      var to = ((right - offset) >> level) + 1;
      if (to > SIZE) {
        to = SIZE;
      }
      return function()  {
        do {
          if (values) {
            var value = values();
            if (value !== DONE) {
              return value;
            }
            values = null;
          }
          if (from === to) {
            return DONE;
          }
          var idx = reverse ? --to : from++;
          values = iterateNodeOrLeaf(
            array && array[idx], level - SHIFT, offset + (idx << level)
          );
        } while (true);
      };
    }
  }

  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
    var list = Object.create(ListPrototype);
    list.size = capacity - origin;
    list._origin = origin;
    list._capacity = capacity;
    list._level = level;
    list._root = root;
    list._tail = tail;
    list.__ownerID = ownerID;
    list.__hash = hash;
    list.__altered = false;
    return list;
  }

  var EMPTY_LIST;
  function emptyList() {
    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
  }

  function updateList(list, index, value) {
    index = wrapIndex(list, index);

    if (index !== index) {
      return list;
    }

    if (index >= list.size || index < 0) {
      return list.withMutations(function(list ) {
        index < 0 ?
          setListBounds(list, index).set(0, value) :
          setListBounds(list, 0, index + 1).set(index, value);
      });
    }

    index += list._origin;

    var newTail = list._tail;
    var newRoot = list._root;
    var didAlter = MakeRef(DID_ALTER);
    if (index >= getTailOffset(list._capacity)) {
      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
    } else {
      newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
    }

    if (!didAlter.value) {
      return list;
    }

    if (list.__ownerID) {
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
  }

  function updateVNode(node, ownerID, level, index, value, didAlter) {
    var idx = (index >>> level) & MASK;
    var nodeHas = node && idx < node.array.length;
    if (!nodeHas && value === undefined) {
      return node;
    }

    var newNode;

    if (level > 0) {
      var lowerNode = node && node.array[idx];
      var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
      if (newLowerNode === lowerNode) {
        return node;
      }
      newNode = editableVNode(node, ownerID);
      newNode.array[idx] = newLowerNode;
      return newNode;
    }

    if (nodeHas && node.array[idx] === value) {
      return node;
    }

    SetRef(didAlter);

    newNode = editableVNode(node, ownerID);
    if (value === undefined && idx === newNode.array.length - 1) {
      newNode.array.pop();
    } else {
      newNode.array[idx] = value;
    }
    return newNode;
  }

  function editableVNode(node, ownerID) {
    if (ownerID && node && ownerID === node.ownerID) {
      return node;
    }
    return new VNode(node ? node.array.slice() : [], ownerID);
  }

  function listNodeFor(list, rawIndex) {
    if (rawIndex >= getTailOffset(list._capacity)) {
      return list._tail;
    }
    if (rawIndex < 1 << (list._level + SHIFT)) {
      var node = list._root;
      var level = list._level;
      while (node && level > 0) {
        node = node.array[(rawIndex >>> level) & MASK];
        level -= SHIFT;
      }
      return node;
    }
  }

  function setListBounds(list, begin, end) {
    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      end = end | 0;
    }
    var owner = list.__ownerID || new OwnerID();
    var oldOrigin = list._origin;
    var oldCapacity = list._capacity;
    var newOrigin = oldOrigin + begin;
    var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
      return list;
    }

    // If it's going to end after it starts, it's empty.
    if (newOrigin >= newCapacity) {
      return list.clear();
    }

    var newLevel = list._level;
    var newRoot = list._root;

    // New origin might need creating a higher root.
    var offsetShift = 0;
    while (newOrigin + offsetShift < 0) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
      newLevel += SHIFT;
      offsetShift += 1 << newLevel;
    }
    if (offsetShift) {
      newOrigin += offsetShift;
      oldOrigin += offsetShift;
      newCapacity += offsetShift;
      oldCapacity += offsetShift;
    }

    var oldTailOffset = getTailOffset(oldCapacity);
    var newTailOffset = getTailOffset(newCapacity);

    // New size might need creating a higher root.
    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
      newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
      newLevel += SHIFT;
    }

    // Locate or create the new tail.
    var oldTail = list._tail;
    var newTail = newTailOffset < oldTailOffset ?
      listNodeFor(list, newCapacity - 1) :
      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

    // Merge Tail into tree.
    if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
      newRoot = editableVNode(newRoot, owner);
      var node = newRoot;
      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
        var idx = (oldTailOffset >>> level) & MASK;
        node = node.array[idx] = editableVNode(node.array[idx], owner);
      }
      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
    }

    // If the size has been reduced, there's a chance the tail needs to be trimmed.
    if (newCapacity < oldCapacity) {
      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
    }

    // If the new origin is within the tail, then we do not need a root.
    if (newOrigin >= newTailOffset) {
      newOrigin -= newTailOffset;
      newCapacity -= newTailOffset;
      newLevel = SHIFT;
      newRoot = null;
      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
      offsetShift = 0;

      // Identify the new top root node of the subtree of the old root.
      while (newRoot) {
        var beginIndex = (newOrigin >>> newLevel) & MASK;
        if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
          break;
        }
        if (beginIndex) {
          offsetShift += (1 << newLevel) * beginIndex;
        }
        newLevel -= SHIFT;
        newRoot = newRoot.array[beginIndex];
      }

      // Trim the new sides of the new root.
      if (newRoot && newOrigin > oldOrigin) {
        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
      }
      if (newRoot && newTailOffset < oldTailOffset) {
        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
      }
      if (offsetShift) {
        newOrigin -= offsetShift;
        newCapacity -= offsetShift;
      }
    }

    if (list.__ownerID) {
      list.size = newCapacity - newOrigin;
      list._origin = newOrigin;
      list._capacity = newCapacity;
      list._level = newLevel;
      list._root = newRoot;
      list._tail = newTail;
      list.__hash = undefined;
      list.__altered = true;
      return list;
    }
    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
  }

  function mergeIntoListWith(list, merger, iterables) {
    var iters = [];
    var maxSize = 0;
    for (var ii = 0; ii < iterables.length; ii++) {
      var value = iterables[ii];
      var iter = IndexedIterable(value);
      if (iter.size > maxSize) {
        maxSize = iter.size;
      }
      if (!isIterable(value)) {
        iter = iter.map(function(v ) {return fromJS(v)});
      }
      iters.push(iter);
    }
    if (maxSize > list.size) {
      list = list.setSize(maxSize);
    }
    return mergeIntoCollectionWith(list, merger, iters);
  }

  function getTailOffset(size) {
    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
  }

  createClass(OrderedMap, Map);

    // @pragma Construction

    function OrderedMap(value) {
      return value === null || value === undefined ? emptyOrderedMap() :
        isOrderedMap(value) ? value :
        emptyOrderedMap().withMutations(function(map ) {
          var iter = KeyedIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v, k)  {return map.set(k, v)});
        });
    }

    OrderedMap.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedMap.prototype.toString = function() {
      return this.__toString('OrderedMap {', '}');
    };

    // @pragma Access

    OrderedMap.prototype.get = function(k, notSetValue) {
      var index = this._map.get(k);
      return index !== undefined ? this._list.get(index)[1] : notSetValue;
    };

    // @pragma Modification

    OrderedMap.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._map.clear();
        this._list.clear();
        return this;
      }
      return emptyOrderedMap();
    };

    OrderedMap.prototype.set = function(k, v) {
      return updateOrderedMap(this, k, v);
    };

    OrderedMap.prototype.remove = function(k) {
      return updateOrderedMap(this, k, NOT_SET);
    };

    OrderedMap.prototype.wasAltered = function() {
      return this._map.wasAltered() || this._list.wasAltered();
    };

    OrderedMap.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._list.__iterate(
        function(entry ) {return entry && fn(entry[1], entry[0], this$0)},
        reverse
      );
    };

    OrderedMap.prototype.__iterator = function(type, reverse) {
      return this._list.fromEntrySeq().__iterator(type, reverse);
    };

    OrderedMap.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      var newList = this._list.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        this._list = newList;
        return this;
      }
      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
    };


  function isOrderedMap(maybeOrderedMap) {
    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
  }

  OrderedMap.isOrderedMap = isOrderedMap;

  OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



  function makeOrderedMap(map, list, ownerID, hash) {
    var omap = Object.create(OrderedMap.prototype);
    omap.size = map ? map.size : 0;
    omap._map = map;
    omap._list = list;
    omap.__ownerID = ownerID;
    omap.__hash = hash;
    return omap;
  }

  var EMPTY_ORDERED_MAP;
  function emptyOrderedMap() {
    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
  }

  function updateOrderedMap(omap, k, v) {
    var map = omap._map;
    var list = omap._list;
    var i = map.get(k);
    var has = i !== undefined;
    var newMap;
    var newList;
    if (v === NOT_SET) { // removed
      if (!has) {
        return omap;
      }
      if (list.size >= SIZE && list.size >= map.size * 2) {
        newList = list.filter(function(entry, idx)  {return entry !== undefined && i !== idx});
        newMap = newList.toKeyedSeq().map(function(entry ) {return entry[0]}).flip().toMap();
        if (omap.__ownerID) {
          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
        }
      } else {
        newMap = map.remove(k);
        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
      }
    } else {
      if (has) {
        if (v === list.get(i)[1]) {
          return omap;
        }
        newMap = map;
        newList = list.set(i, [k, v]);
      } else {
        newMap = map.set(k, list.size);
        newList = list.set(list.size, [k, v]);
      }
    }
    if (omap.__ownerID) {
      omap.size = newMap.size;
      omap._map = newMap;
      omap._list = newList;
      omap.__hash = undefined;
      return omap;
    }
    return makeOrderedMap(newMap, newList);
  }

  createClass(ToKeyedSequence, KeyedSeq);
    function ToKeyedSequence(indexed, useKeys) {
      this._iter = indexed;
      this._useKeys = useKeys;
      this.size = indexed.size;
    }

    ToKeyedSequence.prototype.get = function(key, notSetValue) {
      return this._iter.get(key, notSetValue);
    };

    ToKeyedSequence.prototype.has = function(key) {
      return this._iter.has(key);
    };

    ToKeyedSequence.prototype.valueSeq = function() {
      return this._iter.valueSeq();
    };

    ToKeyedSequence.prototype.reverse = function() {var this$0 = this;
      var reversedSequence = reverseFactory(this, true);
      if (!this._useKeys) {
        reversedSequence.valueSeq = function()  {return this$0._iter.toSeq().reverse()};
      }
      return reversedSequence;
    };

    ToKeyedSequence.prototype.map = function(mapper, context) {var this$0 = this;
      var mappedSequence = mapFactory(this, mapper, context);
      if (!this._useKeys) {
        mappedSequence.valueSeq = function()  {return this$0._iter.toSeq().map(mapper, context)};
      }
      return mappedSequence;
    };

    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var ii;
      return this._iter.__iterate(
        this._useKeys ?
          function(v, k)  {return fn(v, k, this$0)} :
          (ii = reverse ? resolveSize(this) : 0, function(v ) {return fn(v, reverse ? --ii : ii++, this$0)}),
        reverse
      );
    };

    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
      if (this._useKeys) {
        return this._iter.__iterator(type, reverse);
      }
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var ii = reverse ? resolveSize(this) : 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, reverse ? --ii : ii++, step.value, step);
      });
    };

  ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


  createClass(ToIndexedSequence, IndexedSeq);
    function ToIndexedSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToIndexedSequence.prototype.includes = function(value) {
      return this._iter.includes(value);
    };

    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      return this._iter.__iterate(function(v ) {return fn(v, iterations++, this$0)}, reverse);
    };

    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, iterations++, step.value, step)
      });
    };



  createClass(ToSetSequence, SetSeq);
    function ToSetSequence(iter) {
      this._iter = iter;
      this.size = iter.size;
    }

    ToSetSequence.prototype.has = function(key) {
      return this._iter.includes(key);
    };

    ToSetSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(v ) {return fn(v, v, this$0)}, reverse);
    };

    ToSetSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        return step.done ? step :
          iteratorValue(type, step.value, step.value, step);
      });
    };



  createClass(FromEntriesSequence, KeyedSeq);
    function FromEntriesSequence(entries) {
      this._iter = entries;
      this.size = entries.size;
    }

    FromEntriesSequence.prototype.entrySeq = function() {
      return this._iter.toSeq();
    };

    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._iter.__iterate(function(entry ) {
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedIterable = isIterable(entry);
          return fn(
            indexedIterable ? entry.get(1) : entry[1],
            indexedIterable ? entry.get(0) : entry[0],
            this$0
          );
        }
      }, reverse);
    };

    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          // Check if entry exists first so array access doesn't throw for holes
          // in the parent iteration.
          if (entry) {
            validateEntry(entry);
            var indexedIterable = isIterable(entry);
            return iteratorValue(
              type,
              indexedIterable ? entry.get(0) : entry[0],
              indexedIterable ? entry.get(1) : entry[1],
              step
            );
          }
        }
      });
    };


  ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;


  function flipFactory(iterable) {
    var flipSequence = makeSequence(iterable);
    flipSequence._iter = iterable;
    flipSequence.size = iterable.size;
    flipSequence.flip = function()  {return iterable};
    flipSequence.reverse = function () {
      var reversedSequence = iterable.reverse.apply(this); // super.reverse()
      reversedSequence.flip = function()  {return iterable.reverse()};
      return reversedSequence;
    };
    flipSequence.has = function(key ) {return iterable.includes(key)};
    flipSequence.includes = function(key ) {return iterable.has(key)};
    flipSequence.cacheResult = cacheResultThrough;
    flipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(k, v, this$0) !== false}, reverse);
    };
    flipSequence.__iteratorUncached = function(type, reverse) {
      if (type === ITERATE_ENTRIES) {
        var iterator = iterable.__iterator(type, reverse);
        return new Iterator(function()  {
          var step = iterator.next();
          if (!step.done) {
            var k = step.value[0];
            step.value[0] = step.value[1];
            step.value[1] = k;
          }
          return step;
        });
      }
      return iterable.__iterator(
        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
        reverse
      );
    };
    return flipSequence;
  }


  function mapFactory(iterable, mapper, context) {
    var mappedSequence = makeSequence(iterable);
    mappedSequence.size = iterable.size;
    mappedSequence.has = function(key ) {return iterable.has(key)};
    mappedSequence.get = function(key, notSetValue)  {
      var v = iterable.get(key, NOT_SET);
      return v === NOT_SET ?
        notSetValue :
        mapper.call(context, v, key, iterable);
    };
    mappedSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(
        function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, this$0) !== false},
        reverse
      );
    };
    mappedSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      return new Iterator(function()  {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        return iteratorValue(
          type,
          key,
          mapper.call(context, entry[1], key, iterable),
          step
        );
      });
    };
    return mappedSequence;
  }


  function reverseFactory(iterable, useKeys) {
    var reversedSequence = makeSequence(iterable);
    reversedSequence._iter = iterable;
    reversedSequence.size = iterable.size;
    reversedSequence.reverse = function()  {return iterable};
    if (iterable.flip) {
      reversedSequence.flip = function () {
        var flipSequence = flipFactory(iterable);
        flipSequence.reverse = function()  {return iterable.flip()};
        return flipSequence;
      };
    }
    reversedSequence.get = function(key, notSetValue) 
      {return iterable.get(useKeys ? key : -1 - key, notSetValue)};
    reversedSequence.has = function(key )
      {return iterable.has(useKeys ? key : -1 - key)};
    reversedSequence.includes = function(value ) {return iterable.includes(value)};
    reversedSequence.cacheResult = cacheResultThrough;
    reversedSequence.__iterate = function (fn, reverse) {var this$0 = this;
      return iterable.__iterate(function(v, k)  {return fn(v, k, this$0)}, !reverse);
    };
    reversedSequence.__iterator =
      function(type, reverse)  {return iterable.__iterator(type, !reverse)};
    return reversedSequence;
  }


  function filterFactory(iterable, predicate, context, useKeys) {
    var filterSequence = makeSequence(iterable);
    if (useKeys) {
      filterSequence.has = function(key ) {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
      };
      filterSequence.get = function(key, notSetValue)  {
        var v = iterable.get(key, NOT_SET);
        return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
          v : notSetValue;
      };
    }
    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      }, reverse);
      return iterations;
    };
    filterSequence.__iteratorUncached = function (type, reverse) {
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterations = 0;
      return new Iterator(function()  {
        while (true) {
          var step = iterator.next();
          if (step.done) {
            return step;
          }
          var entry = step.value;
          var key = entry[0];
          var value = entry[1];
          if (predicate.call(context, value, key, iterable)) {
            return iteratorValue(type, useKeys ? key : iterations++, value, step);
          }
        }
      });
    };
    return filterSequence;
  }


  function countByFactory(iterable, grouper, context) {
    var groups = Map().asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        0,
        function(a ) {return a + 1}
      );
    });
    return groups.asImmutable();
  }


  function groupByFactory(iterable, grouper, context) {
    var isKeyedIter = isKeyed(iterable);
    var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
    iterable.__iterate(function(v, k)  {
      groups.update(
        grouper.call(context, v, k, iterable),
        function(a ) {return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a)}
      );
    });
    var coerce = iterableClass(iterable);
    return groups.map(function(arr ) {return reify(iterable, coerce(arr))});
  }


  function sliceFactory(iterable, begin, end, useKeys) {
    var originalSize = iterable.size;

    // Sanitize begin & end using this shorthand for ToInt32(argument)
    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
    if (begin !== undefined) {
      begin = begin | 0;
    }
    if (end !== undefined) {
      if (end === Infinity) {
        end = originalSize;
      } else {
        end = end | 0;
      }
    }

    if (wholeSlice(begin, end, originalSize)) {
      return iterable;
    }

    var resolvedBegin = resolveBegin(begin, originalSize);
    var resolvedEnd = resolveEnd(end, originalSize);

    // begin or end will be NaN if they were provided as negative numbers and
    // this iterable's size is unknown. In that case, cache first so there is
    // a known size and these do not resolve to NaN.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
    }

    // Note: resolvedEnd is undefined when the original sequence's length is
    // unknown and this slice did not supply an end and should contain all
    // elements after resolvedBegin.
    // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
    var resolvedSize = resolvedEnd - resolvedBegin;
    var sliceSize;
    if (resolvedSize === resolvedSize) {
      sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
    }

    var sliceSeq = makeSequence(iterable);

    // If iterable.size is undefined, the size of the realized sliceSeq is
    // unknown at this point unless the number of items to slice is 0
    sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

    if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
      sliceSeq.get = function (index, notSetValue) {
        index = wrapIndex(this, index);
        return index >= 0 && index < sliceSize ?
          iterable.get(index + resolvedBegin, notSetValue) :
          notSetValue;
      };
    }

    sliceSeq.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (sliceSize === 0) {
        return 0;
      }
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var skipped = 0;
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k)  {
        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
                 iterations !== sliceSize;
        }
      });
      return iterations;
    };

    sliceSeq.__iteratorUncached = function(type, reverse) {
      if (sliceSize !== 0 && reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      // Don't bother instantiating parent iterator if taking 0.
      var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
      var skipped = 0;
      var iterations = 0;
      return new Iterator(function()  {
        while (skipped++ < resolvedBegin) {
          iterator.next();
        }
        if (++iterations > sliceSize) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (useKeys || type === ITERATE_VALUES) {
          return step;
        } else if (type === ITERATE_KEYS) {
          return iteratorValue(type, iterations - 1, undefined, step);
        } else {
          return iteratorValue(type, iterations - 1, step.value[1], step);
        }
      });
    };

    return sliceSeq;
  }


  function takeWhileFactory(iterable, predicate, context) {
    var takeSequence = makeSequence(iterable);
    takeSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var iterations = 0;
      iterable.__iterate(function(v, k, c) 
        {return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0)}
      );
      return iterations;
    };
    takeSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var iterating = true;
      return new Iterator(function()  {
        if (!iterating) {
          return iteratorDone();
        }
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var k = entry[0];
        var v = entry[1];
        if (!predicate.call(context, v, k, this$0)) {
          iterating = false;
          return iteratorDone();
        }
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return takeSequence;
  }


  function skipWhileFactory(iterable, predicate, context, useKeys) {
    var skipSequence = makeSequence(iterable);
    skipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var isSkipping = true;
      var iterations = 0;
      iterable.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          iterations++;
          return fn(v, useKeys ? k : iterations - 1, this$0);
        }
      });
      return iterations;
    };
    skipSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
      var skipping = true;
      var iterations = 0;
      return new Iterator(function()  {
        var step, k, v;
        do {
          step = iterator.next();
          if (step.done) {
            if (useKeys || type === ITERATE_VALUES) {
              return step;
            } else if (type === ITERATE_KEYS) {
              return iteratorValue(type, iterations++, undefined, step);
            } else {
              return iteratorValue(type, iterations++, step.value[1], step);
            }
          }
          var entry = step.value;
          k = entry[0];
          v = entry[1];
          skipping && (skipping = predicate.call(context, v, k, this$0));
        } while (skipping);
        return type === ITERATE_ENTRIES ? step :
          iteratorValue(type, k, v, step);
      });
    };
    return skipSequence;
  }


  function concatFactory(iterable, values) {
    var isKeyedIterable = isKeyed(iterable);
    var iters = [iterable].concat(values).map(function(v ) {
      if (!isIterable(v)) {
        v = isKeyedIterable ?
          keyedSeqFromValue(v) :
          indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedIterable) {
        v = KeyedIterable(v);
      }
      return v;
    }).filter(function(v ) {return v.size !== 0});

    if (iters.length === 0) {
      return iterable;
    }

    if (iters.length === 1) {
      var singleton = iters[0];
      if (singleton === iterable ||
          isKeyedIterable && isKeyed(singleton) ||
          isIndexed(iterable) && isIndexed(singleton)) {
        return singleton;
      }
    }

    var concatSeq = new ArraySeq(iters);
    if (isKeyedIterable) {
      concatSeq = concatSeq.toKeyedSeq();
    } else if (!isIndexed(iterable)) {
      concatSeq = concatSeq.toSetSeq();
    }
    concatSeq = concatSeq.flatten(true);
    concatSeq.size = iters.reduce(
      function(sum, seq)  {
        if (sum !== undefined) {
          var size = seq.size;
          if (size !== undefined) {
            return sum + size;
          }
        }
      },
      0
    );
    return concatSeq;
  }


  function flattenFactory(iterable, depth, useKeys) {
    var flatSequence = makeSequence(iterable);
    flatSequence.__iterateUncached = function(fn, reverse) {
      var iterations = 0;
      var stopped = false;
      function flatDeep(iter, currentDepth) {var this$0 = this;
        iter.__iterate(function(v, k)  {
          if ((!depth || currentDepth < depth) && isIterable(v)) {
            flatDeep(v, currentDepth + 1);
          } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
            stopped = true;
          }
          return !stopped;
        }, reverse);
      }
      flatDeep(iterable, 0);
      return iterations;
    };
    flatSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(type, reverse);
      var stack = [];
      var iterations = 0;
      return new Iterator(function()  {
        while (iterator) {
          var step = iterator.next();
          if (step.done !== false) {
            iterator = stack.pop();
            continue;
          }
          var v = step.value;
          if (type === ITERATE_ENTRIES) {
            v = v[1];
          }
          if ((!depth || stack.length < depth) && isIterable(v)) {
            stack.push(iterator);
            iterator = v.__iterator(type, reverse);
          } else {
            return useKeys ? step : iteratorValue(type, iterations++, v, step);
          }
        }
        return iteratorDone();
      });
    };
    return flatSequence;
  }


  function flatMapFactory(iterable, mapper, context) {
    var coerce = iterableClass(iterable);
    return iterable.toSeq().map(
      function(v, k)  {return coerce(mapper.call(context, v, k, iterable))}
    ).flatten(true);
  }


  function interposeFactory(iterable, separator) {
    var interposedSequence = makeSequence(iterable);
    interposedSequence.size = iterable.size && iterable.size * 2 -1;
    interposedSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
      var iterations = 0;
      iterable.__iterate(function(v, k) 
        {return (!iterations || fn(separator, iterations++, this$0) !== false) &&
        fn(v, iterations++, this$0) !== false},
        reverse
      );
      return iterations;
    };
    interposedSequence.__iteratorUncached = function(type, reverse) {
      var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
      var iterations = 0;
      var step;
      return new Iterator(function()  {
        if (!step || iterations % 2) {
          step = iterator.next();
          if (step.done) {
            return step;
          }
        }
        return iterations % 2 ?
          iteratorValue(type, iterations++, separator) :
          iteratorValue(type, iterations++, step.value, step);
      });
    };
    return interposedSequence;
  }


  function sortFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    var isKeyedIterable = isKeyed(iterable);
    var index = 0;
    var entries = iterable.toSeq().map(
      function(v, k)  {return [k, v, index++, mapper ? mapper(v, k, iterable) : v]}
    ).toArray();
    entries.sort(function(a, b)  {return comparator(a[3], b[3]) || a[2] - b[2]}).forEach(
      isKeyedIterable ?
      function(v, i)  { entries[i].length = 2; } :
      function(v, i)  { entries[i] = v[1]; }
    );
    return isKeyedIterable ? KeyedSeq(entries) :
      isIndexed(iterable) ? IndexedSeq(entries) :
      SetSeq(entries);
  }


  function maxFactory(iterable, comparator, mapper) {
    if (!comparator) {
      comparator = defaultComparator;
    }
    if (mapper) {
      var entry = iterable.toSeq()
        .map(function(v, k)  {return [v, mapper(v, k, iterable)]})
        .reduce(function(a, b)  {return maxCompare(comparator, a[1], b[1]) ? b : a});
      return entry && entry[0];
    } else {
      return iterable.reduce(function(a, b)  {return maxCompare(comparator, a, b) ? b : a});
    }
  }

  function maxCompare(comparator, a, b) {
    var comp = comparator(b, a);
    // b is considered the new max if the comparator declares them equal, but
    // they are not equal and b is in fact a nullish value.
    return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
  }


  function zipWithFactory(keyIter, zipper, iters) {
    var zipSequence = makeSequence(keyIter);
    zipSequence.size = new ArraySeq(iters).map(function(i ) {return i.size}).min();
    // Note: this a generic base implementation of __iterate in terms of
    // __iterator which may be more generically useful in the future.
    zipSequence.__iterate = function(fn, reverse) {
      /* generic:
      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        iterations++;
        if (fn(step.value[1], step.value[0], this) === false) {
          break;
        }
      }
      return iterations;
      */
      // indexed:
      var iterator = this.__iterator(ITERATE_VALUES, reverse);
      var step;
      var iterations = 0;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
      return iterations;
    };
    zipSequence.__iteratorUncached = function(type, reverse) {
      var iterators = iters.map(function(i )
        {return (i = Iterable(i), getIterator(reverse ? i.reverse() : i))}
      );
      var iterations = 0;
      var isDone = false;
      return new Iterator(function()  {
        var steps;
        if (!isDone) {
          steps = iterators.map(function(i ) {return i.next()});
          isDone = steps.some(function(s ) {return s.done});
        }
        if (isDone) {
          return iteratorDone();
        }
        return iteratorValue(
          type,
          iterations++,
          zipper.apply(null, steps.map(function(s ) {return s.value}))
        );
      });
    };
    return zipSequence
  }


  // #pragma Helper Functions

  function reify(iter, seq) {
    return isSeq(iter) ? seq : iter.constructor(seq);
  }

  function validateEntry(entry) {
    if (entry !== Object(entry)) {
      throw new TypeError('Expected [K, V] tuple: ' + entry);
    }
  }

  function resolveSize(iter) {
    assertNotInfinite(iter.size);
    return ensureSize(iter);
  }

  function iterableClass(iterable) {
    return isKeyed(iterable) ? KeyedIterable :
      isIndexed(iterable) ? IndexedIterable :
      SetIterable;
  }

  function makeSequence(iterable) {
    return Object.create(
      (
        isKeyed(iterable) ? KeyedSeq :
        isIndexed(iterable) ? IndexedSeq :
        SetSeq
      ).prototype
    );
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    } else {
      return Seq.prototype.cacheResult.call(this);
    }
  }

  function defaultComparator(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  function forceIterator(keyPath) {
    var iter = getIterator(keyPath);
    if (!iter) {
      // Array might not be iterable in this environment, so we need a fallback
      // to our wrapped type.
      if (!isArrayLike(keyPath)) {
        throw new TypeError('Expected iterable or array-like: ' + keyPath);
      }
      iter = getIterator(Iterable(keyPath));
    }
    return iter;
  }

  createClass(Record, KeyedCollection);

    function Record(defaultValues, name) {
      var hasInitialized;

      var RecordType = function Record(values) {
        if (values instanceof RecordType) {
          return values;
        }
        if (!(this instanceof RecordType)) {
          return new RecordType(values);
        }
        if (!hasInitialized) {
          hasInitialized = true;
          var keys = Object.keys(defaultValues);
          setProps(RecordTypePrototype, keys);
          RecordTypePrototype.size = keys.length;
          RecordTypePrototype._name = name;
          RecordTypePrototype._keys = keys;
          RecordTypePrototype._defaultValues = defaultValues;
        }
        this._map = Map(values);
      };

      var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
      RecordTypePrototype.constructor = RecordType;

      return RecordType;
    }

    Record.prototype.toString = function() {
      return this.__toString(recordName(this) + ' {', '}');
    };

    // @pragma Access

    Record.prototype.has = function(k) {
      return this._defaultValues.hasOwnProperty(k);
    };

    Record.prototype.get = function(k, notSetValue) {
      if (!this.has(k)) {
        return notSetValue;
      }
      var defaultVal = this._defaultValues[k];
      return this._map ? this._map.get(k, defaultVal) : defaultVal;
    };

    // @pragma Modification

    Record.prototype.clear = function() {
      if (this.__ownerID) {
        this._map && this._map.clear();
        return this;
      }
      var RecordType = this.constructor;
      return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
    };

    Record.prototype.set = function(k, v) {
      if (!this.has(k)) {
        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
      }
      if (this._map && !this._map.has(k)) {
        var defaultVal = this._defaultValues[k];
        if (v === defaultVal) {
          return this;
        }
      }
      var newMap = this._map && this._map.set(k, v);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.remove = function(k) {
      if (!this.has(k)) {
        return this;
      }
      var newMap = this._map && this._map.remove(k);
      if (this.__ownerID || newMap === this._map) {
        return this;
      }
      return makeRecord(this, newMap);
    };

    Record.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Record.prototype.__iterator = function(type, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterator(type, reverse);
    };

    Record.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterate(fn, reverse);
    };

    Record.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map && this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return makeRecord(this, newMap, ownerID);
    };


  var RecordPrototype = Record.prototype;
  RecordPrototype[DELETE] = RecordPrototype.remove;
  RecordPrototype.deleteIn =
  RecordPrototype.removeIn = MapPrototype.removeIn;
  RecordPrototype.merge = MapPrototype.merge;
  RecordPrototype.mergeWith = MapPrototype.mergeWith;
  RecordPrototype.mergeIn = MapPrototype.mergeIn;
  RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
  RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
  RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
  RecordPrototype.setIn = MapPrototype.setIn;
  RecordPrototype.update = MapPrototype.update;
  RecordPrototype.updateIn = MapPrototype.updateIn;
  RecordPrototype.withMutations = MapPrototype.withMutations;
  RecordPrototype.asMutable = MapPrototype.asMutable;
  RecordPrototype.asImmutable = MapPrototype.asImmutable;


  function makeRecord(likeRecord, map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(likeRecord));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }

  function recordName(record) {
    return record._name || record.constructor.name || 'Record';
  }

  function setProps(prototype, names) {
    try {
      names.forEach(setProp.bind(undefined, prototype));
    } catch (error) {
      // Object.defineProperty failed. Probably IE8.
    }
  }

  function setProp(prototype, name) {
    Object.defineProperty(prototype, name, {
      get: function() {
        return this.get(name);
      },
      set: function(value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      }
    });
  }

  createClass(Set, SetCollection);

    // @pragma Construction

    function Set(value) {
      return value === null || value === undefined ? emptySet() :
        isSet(value) && !isOrdered(value) ? value :
        emptySet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    Set.of = function(/*...values*/) {
      return this(arguments);
    };

    Set.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    Set.prototype.toString = function() {
      return this.__toString('Set {', '}');
    };

    // @pragma Access

    Set.prototype.has = function(value) {
      return this._map.has(value);
    };

    // @pragma Modification

    Set.prototype.add = function(value) {
      return updateSet(this, this._map.set(value, true));
    };

    Set.prototype.remove = function(value) {
      return updateSet(this, this._map.remove(value));
    };

    Set.prototype.clear = function() {
      return updateSet(this, this._map.clear());
    };

    // @pragma Composition

    Set.prototype.union = function() {var iters = SLICE$0.call(arguments, 0);
      iters = iters.filter(function(x ) {return x.size !== 0});
      if (iters.length === 0) {
        return this;
      }
      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
        return this.constructor(iters[0]);
      }
      return this.withMutations(function(set ) {
        for (var ii = 0; ii < iters.length; ii++) {
          SetIterable(iters[ii]).forEach(function(value ) {return set.add(value)});
        }
      });
    };

    Set.prototype.intersect = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (!iters.every(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.subtract = function() {var iters = SLICE$0.call(arguments, 0);
      if (iters.length === 0) {
        return this;
      }
      iters = iters.map(function(iter ) {return SetIterable(iter)});
      var originalSet = this;
      return this.withMutations(function(set ) {
        originalSet.forEach(function(value ) {
          if (iters.some(function(iter ) {return iter.includes(value)})) {
            set.remove(value);
          }
        });
      });
    };

    Set.prototype.merge = function() {
      return this.union.apply(this, arguments);
    };

    Set.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
      return this.union.apply(this, iters);
    };

    Set.prototype.sort = function(comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator));
    };

    Set.prototype.sortBy = function(mapper, comparator) {
      // Late binding
      return OrderedSet(sortFactory(this, comparator, mapper));
    };

    Set.prototype.wasAltered = function() {
      return this._map.wasAltered();
    };

    Set.prototype.__iterate = function(fn, reverse) {var this$0 = this;
      return this._map.__iterate(function(_, k)  {return fn(k, k, this$0)}, reverse);
    };

    Set.prototype.__iterator = function(type, reverse) {
      return this._map.map(function(_, k)  {return k}).__iterator(type, reverse);
    };

    Set.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      var newMap = this._map.__ensureOwner(ownerID);
      if (!ownerID) {
        this.__ownerID = ownerID;
        this._map = newMap;
        return this;
      }
      return this.__make(newMap, ownerID);
    };


  function isSet(maybeSet) {
    return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
  }

  Set.isSet = isSet;

  var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

  var SetPrototype = Set.prototype;
  SetPrototype[IS_SET_SENTINEL] = true;
  SetPrototype[DELETE] = SetPrototype.remove;
  SetPrototype.mergeDeep = SetPrototype.merge;
  SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
  SetPrototype.withMutations = MapPrototype.withMutations;
  SetPrototype.asMutable = MapPrototype.asMutable;
  SetPrototype.asImmutable = MapPrototype.asImmutable;

  SetPrototype.__empty = emptySet;
  SetPrototype.__make = makeSet;

  function updateSet(set, newMap) {
    if (set.__ownerID) {
      set.size = newMap.size;
      set._map = newMap;
      return set;
    }
    return newMap === set._map ? set :
      newMap.size === 0 ? set.__empty() :
      set.__make(newMap);
  }

  function makeSet(map, ownerID) {
    var set = Object.create(SetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_SET;
  function emptySet() {
    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
  }

  createClass(OrderedSet, Set);

    // @pragma Construction

    function OrderedSet(value) {
      return value === null || value === undefined ? emptyOrderedSet() :
        isOrderedSet(value) ? value :
        emptyOrderedSet().withMutations(function(set ) {
          var iter = SetIterable(value);
          assertNotInfinite(iter.size);
          iter.forEach(function(v ) {return set.add(v)});
        });
    }

    OrderedSet.of = function(/*...values*/) {
      return this(arguments);
    };

    OrderedSet.fromKeys = function(value) {
      return this(KeyedIterable(value).keySeq());
    };

    OrderedSet.prototype.toString = function() {
      return this.__toString('OrderedSet {', '}');
    };


  function isOrderedSet(maybeOrderedSet) {
    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
  }

  OrderedSet.isOrderedSet = isOrderedSet;

  var OrderedSetPrototype = OrderedSet.prototype;
  OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

  OrderedSetPrototype.__empty = emptyOrderedSet;
  OrderedSetPrototype.__make = makeOrderedSet;

  function makeOrderedSet(map, ownerID) {
    var set = Object.create(OrderedSetPrototype);
    set.size = map ? map.size : 0;
    set._map = map;
    set.__ownerID = ownerID;
    return set;
  }

  var EMPTY_ORDERED_SET;
  function emptyOrderedSet() {
    return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
  }

  createClass(Stack, IndexedCollection);

    // @pragma Construction

    function Stack(value) {
      return value === null || value === undefined ? emptyStack() :
        isStack(value) ? value :
        emptyStack().unshiftAll(value);
    }

    Stack.of = function(/*...values*/) {
      return this(arguments);
    };

    Stack.prototype.toString = function() {
      return this.__toString('Stack [', ']');
    };

    // @pragma Access

    Stack.prototype.get = function(index, notSetValue) {
      var head = this._head;
      index = wrapIndex(this, index);
      while (head && index--) {
        head = head.next;
      }
      return head ? head.value : notSetValue;
    };

    Stack.prototype.peek = function() {
      return this._head && this._head.value;
    };

    // @pragma Modification

    Stack.prototype.push = function(/*...values*/) {
      if (arguments.length === 0) {
        return this;
      }
      var newSize = this.size + arguments.length;
      var head = this._head;
      for (var ii = arguments.length - 1; ii >= 0; ii--) {
        head = {
          value: arguments[ii],
          next: head
        };
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pushAll = function(iter) {
      iter = IndexedIterable(iter);
      if (iter.size === 0) {
        return this;
      }
      assertNotInfinite(iter.size);
      var newSize = this.size;
      var head = this._head;
      iter.reverse().forEach(function(value ) {
        newSize++;
        head = {
          value: value,
          next: head
        };
      });
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    Stack.prototype.pop = function() {
      return this.slice(1);
    };

    Stack.prototype.unshift = function(/*...values*/) {
      return this.push.apply(this, arguments);
    };

    Stack.prototype.unshiftAll = function(iter) {
      return this.pushAll(iter);
    };

    Stack.prototype.shift = function() {
      return this.pop.apply(this, arguments);
    };

    Stack.prototype.clear = function() {
      if (this.size === 0) {
        return this;
      }
      if (this.__ownerID) {
        this.size = 0;
        this._head = undefined;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return emptyStack();
    };

    Stack.prototype.slice = function(begin, end) {
      if (wholeSlice(begin, end, this.size)) {
        return this;
      }
      var resolvedBegin = resolveBegin(begin, this.size);
      var resolvedEnd = resolveEnd(end, this.size);
      if (resolvedEnd !== this.size) {
        // super.slice(begin, end);
        return IndexedCollection.prototype.slice.call(this, begin, end);
      }
      var newSize = this.size - resolvedBegin;
      var head = this._head;
      while (resolvedBegin--) {
        head = head.next;
      }
      if (this.__ownerID) {
        this.size = newSize;
        this._head = head;
        this.__hash = undefined;
        this.__altered = true;
        return this;
      }
      return makeStack(newSize, head);
    };

    // @pragma Mutability

    Stack.prototype.__ensureOwner = function(ownerID) {
      if (ownerID === this.__ownerID) {
        return this;
      }
      if (!ownerID) {
        this.__ownerID = ownerID;
        this.__altered = false;
        return this;
      }
      return makeStack(this.size, this._head, ownerID, this.__hash);
    };

    // @pragma Iteration

    Stack.prototype.__iterate = function(fn, reverse) {
      if (reverse) {
        return this.reverse().__iterate(fn);
      }
      var iterations = 0;
      var node = this._head;
      while (node) {
        if (fn(node.value, iterations++, this) === false) {
          break;
        }
        node = node.next;
      }
      return iterations;
    };

    Stack.prototype.__iterator = function(type, reverse) {
      if (reverse) {
        return this.reverse().__iterator(type);
      }
      var iterations = 0;
      var node = this._head;
      return new Iterator(function()  {
        if (node) {
          var value = node.value;
          node = node.next;
          return iteratorValue(type, iterations++, value);
        }
        return iteratorDone();
      });
    };


  function isStack(maybeStack) {
    return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
  }

  Stack.isStack = isStack;

  var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

  var StackPrototype = Stack.prototype;
  StackPrototype[IS_STACK_SENTINEL] = true;
  StackPrototype.withMutations = MapPrototype.withMutations;
  StackPrototype.asMutable = MapPrototype.asMutable;
  StackPrototype.asImmutable = MapPrototype.asImmutable;
  StackPrototype.wasAltered = MapPrototype.wasAltered;


  function makeStack(size, head, ownerID, hash) {
    var map = Object.create(StackPrototype);
    map.size = size;
    map._head = head;
    map.__ownerID = ownerID;
    map.__hash = hash;
    map.__altered = false;
    return map;
  }

  var EMPTY_STACK;
  function emptyStack() {
    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
  }

  /**
   * Contributes additional methods to a constructor
   */
  function mixin(ctor, methods) {
    var keyCopier = function(key ) { ctor.prototype[key] = methods[key]; };
    Object.keys(methods).forEach(keyCopier);
    Object.getOwnPropertySymbols &&
      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
    return ctor;
  }

  Iterable.Iterator = Iterator;

  mixin(Iterable, {

    // ### Conversion to other types

    toArray: function() {
      assertNotInfinite(this.size);
      var array = new Array(this.size || 0);
      this.valueSeq().__iterate(function(v, i)  { array[i] = v; });
      return array;
    },

    toIndexedSeq: function() {
      return new ToIndexedSequence(this);
    },

    toJS: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJS === 'function' ? value.toJS() : value}
      ).__toJS();
    },

    toJSON: function() {
      return this.toSeq().map(
        function(value ) {return value && typeof value.toJSON === 'function' ? value.toJSON() : value}
      ).__toJS();
    },

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, true);
    },

    toMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return Map(this.toKeyedSeq());
    },

    toObject: function() {
      assertNotInfinite(this.size);
      var object = {};
      this.__iterate(function(v, k)  { object[k] = v; });
      return object;
    },

    toOrderedMap: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedMap(this.toKeyedSeq());
    },

    toOrderedSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
    },

    toSet: function() {
      // Use Late Binding here to solve the circular dependency.
      return Set(isKeyed(this) ? this.valueSeq() : this);
    },

    toSetSeq: function() {
      return new ToSetSequence(this);
    },

    toSeq: function() {
      return isIndexed(this) ? this.toIndexedSeq() :
        isKeyed(this) ? this.toKeyedSeq() :
        this.toSetSeq();
    },

    toStack: function() {
      // Use Late Binding here to solve the circular dependency.
      return Stack(isKeyed(this) ? this.valueSeq() : this);
    },

    toList: function() {
      // Use Late Binding here to solve the circular dependency.
      return List(isKeyed(this) ? this.valueSeq() : this);
    },


    // ### Common JavaScript methods and properties

    toString: function() {
      return '[Iterable]';
    },

    __toString: function(head, tail) {
      if (this.size === 0) {
        return head + tail;
      }
      return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    concat: function() {var values = SLICE$0.call(arguments, 0);
      return reify(this, concatFactory(this, values));
    },

    includes: function(searchValue) {
      return this.some(function(value ) {return is(value, searchValue)});
    },

    entries: function() {
      return this.__iterator(ITERATE_ENTRIES);
    },

    every: function(predicate, context) {
      assertNotInfinite(this.size);
      var returnValue = true;
      this.__iterate(function(v, k, c)  {
        if (!predicate.call(context, v, k, c)) {
          returnValue = false;
          return false;
        }
      });
      return returnValue;
    },

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, true));
    },

    find: function(predicate, context, notSetValue) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[1] : notSetValue;
    },

    forEach: function(sideEffect, context) {
      assertNotInfinite(this.size);
      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
    },

    join: function(separator) {
      assertNotInfinite(this.size);
      separator = separator !== undefined ? '' + separator : ',';
      var joined = '';
      var isFirst = true;
      this.__iterate(function(v ) {
        isFirst ? (isFirst = false) : (joined += separator);
        joined += v !== null && v !== undefined ? v.toString() : '';
      });
      return joined;
    },

    keys: function() {
      return this.__iterator(ITERATE_KEYS);
    },

    map: function(mapper, context) {
      return reify(this, mapFactory(this, mapper, context));
    },

    reduce: function(reducer, initialReduction, context) {
      assertNotInfinite(this.size);
      var reduction;
      var useFirst;
      if (arguments.length < 2) {
        useFirst = true;
      } else {
        reduction = initialReduction;
      }
      this.__iterate(function(v, k, c)  {
        if (useFirst) {
          useFirst = false;
          reduction = v;
        } else {
          reduction = reducer.call(context, reduction, v, k, c);
        }
      });
      return reduction;
    },

    reduceRight: function(reducer, initialReduction, context) {
      var reversed = this.toKeyedSeq().reverse();
      return reversed.reduce.apply(reversed, arguments);
    },

    reverse: function() {
      return reify(this, reverseFactory(this, true));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, true));
    },

    some: function(predicate, context) {
      return !this.every(not(predicate), context);
    },

    sort: function(comparator) {
      return reify(this, sortFactory(this, comparator));
    },

    values: function() {
      return this.__iterator(ITERATE_VALUES);
    },


    // ### More sequential methods

    butLast: function() {
      return this.slice(0, -1);
    },

    isEmpty: function() {
      return this.size !== undefined ? this.size === 0 : !this.some(function()  {return true});
    },

    count: function(predicate, context) {
      return ensureSize(
        predicate ? this.toSeq().filter(predicate, context) : this
      );
    },

    countBy: function(grouper, context) {
      return countByFactory(this, grouper, context);
    },

    equals: function(other) {
      return deepEqual(this, other);
    },

    entrySeq: function() {
      var iterable = this;
      if (iterable._cache) {
        // We cache as an entries array, so we can just return the cache!
        return new ArraySeq(iterable._cache);
      }
      var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
      entriesSequence.fromEntrySeq = function()  {return iterable.toSeq()};
      return entriesSequence;
    },

    filterNot: function(predicate, context) {
      return this.filter(not(predicate), context);
    },

    findEntry: function(predicate, context, notSetValue) {
      var found = notSetValue;
      this.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          found = [k, v];
          return false;
        }
      });
      return found;
    },

    findKey: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry && entry[0];
    },

    findLast: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
    },

    findLastEntry: function(predicate, context, notSetValue) {
      return this.toKeyedSeq().reverse().findEntry(predicate, context, notSetValue);
    },

    findLastKey: function(predicate, context) {
      return this.toKeyedSeq().reverse().findKey(predicate, context);
    },

    first: function() {
      return this.find(returnTrue);
    },

    flatMap: function(mapper, context) {
      return reify(this, flatMapFactory(this, mapper, context));
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, true));
    },

    fromEntrySeq: function() {
      return new FromEntriesSequence(this);
    },

    get: function(searchKey, notSetValue) {
      return this.find(function(_, key)  {return is(key, searchKey)}, undefined, notSetValue);
    },

    getIn: function(searchKeyPath, notSetValue) {
      var nested = this;
      // Note: in an ES6 environment, we would prefer:
      // for (var key of searchKeyPath) {
      var iter = forceIterator(searchKeyPath);
      var step;
      while (!(step = iter.next()).done) {
        var key = step.value;
        nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
        if (nested === NOT_SET) {
          return notSetValue;
        }
      }
      return nested;
    },

    groupBy: function(grouper, context) {
      return groupByFactory(this, grouper, context);
    },

    has: function(searchKey) {
      return this.get(searchKey, NOT_SET) !== NOT_SET;
    },

    hasIn: function(searchKeyPath) {
      return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
    },

    isSubset: function(iter) {
      iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
      return this.every(function(value ) {return iter.includes(value)});
    },

    isSuperset: function(iter) {
      iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
      return iter.isSubset(this);
    },

    keyOf: function(searchValue) {
      return this.findKey(function(value ) {return is(value, searchValue)});
    },

    keySeq: function() {
      return this.toSeq().map(keyMapper).toIndexedSeq();
    },

    last: function() {
      return this.toSeq().reverse().first();
    },

    lastKeyOf: function(searchValue) {
      return this.toKeyedSeq().reverse().keyOf(searchValue);
    },

    max: function(comparator) {
      return maxFactory(this, comparator);
    },

    maxBy: function(mapper, comparator) {
      return maxFactory(this, comparator, mapper);
    },

    min: function(comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
    },

    minBy: function(mapper, comparator) {
      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
    },

    rest: function() {
      return this.slice(1);
    },

    skip: function(amount) {
      return this.slice(Math.max(0, amount));
    },

    skipLast: function(amount) {
      return reify(this, this.toSeq().reverse().skip(amount).reverse());
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, true));
    },

    skipUntil: function(predicate, context) {
      return this.skipWhile(not(predicate), context);
    },

    sortBy: function(mapper, comparator) {
      return reify(this, sortFactory(this, comparator, mapper));
    },

    take: function(amount) {
      return this.slice(0, Math.max(0, amount));
    },

    takeLast: function(amount) {
      return reify(this, this.toSeq().reverse().take(amount).reverse());
    },

    takeWhile: function(predicate, context) {
      return reify(this, takeWhileFactory(this, predicate, context));
    },

    takeUntil: function(predicate, context) {
      return this.takeWhile(not(predicate), context);
    },

    valueSeq: function() {
      return this.toIndexedSeq();
    },


    // ### Hashable Object

    hashCode: function() {
      return this.__hash || (this.__hash = hashIterable(this));
    }


    // ### Internal

    // abstract __iterate(fn, reverse)

    // abstract __iterator(type, reverse)
  });

  // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
  // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
  // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
  // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

  var IterablePrototype = Iterable.prototype;
  IterablePrototype[IS_ITERABLE_SENTINEL] = true;
  IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
  IterablePrototype.__toJS = IterablePrototype.toArray;
  IterablePrototype.__toStringMapper = quoteString;
  IterablePrototype.inspect =
  IterablePrototype.toSource = function() { return this.toString(); };
  IterablePrototype.chain = IterablePrototype.flatMap;
  IterablePrototype.contains = IterablePrototype.includes;

  mixin(KeyedIterable, {

    // ### More sequential methods

    flip: function() {
      return reify(this, flipFactory(this));
    },

    mapEntries: function(mapper, context) {var this$0 = this;
      var iterations = 0;
      return reify(this,
        this.toSeq().map(
          function(v, k)  {return mapper.call(context, [k, v], iterations++, this$0)}
        ).fromEntrySeq()
      );
    },

    mapKeys: function(mapper, context) {var this$0 = this;
      return reify(this,
        this.toSeq().flip().map(
          function(k, v)  {return mapper.call(context, k, v, this$0)}
        ).flip()
      );
    }

  });

  var KeyedIterablePrototype = KeyedIterable.prototype;
  KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
  KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
  KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
  KeyedIterablePrototype.__toStringMapper = function(v, k)  {return JSON.stringify(k) + ': ' + quoteString(v)};



  mixin(IndexedIterable, {

    // ### Conversion to other types

    toKeyedSeq: function() {
      return new ToKeyedSequence(this, false);
    },


    // ### ES6 Collection methods (ES6 Array and Map)

    filter: function(predicate, context) {
      return reify(this, filterFactory(this, predicate, context, false));
    },

    findIndex: function(predicate, context) {
      var entry = this.findEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    indexOf: function(searchValue) {
      var key = this.keyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    lastIndexOf: function(searchValue) {
      var key = this.lastKeyOf(searchValue);
      return key === undefined ? -1 : key;
    },

    reverse: function() {
      return reify(this, reverseFactory(this, false));
    },

    slice: function(begin, end) {
      return reify(this, sliceFactory(this, begin, end, false));
    },

    splice: function(index, removeNum /*, ...values*/) {
      var numArgs = arguments.length;
      removeNum = Math.max(removeNum | 0, 0);
      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
        return this;
      }
      // If index is negative, it should resolve relative to the size of the
      // collection. However size may be expensive to compute if not cached, so
      // only call count() if the number is in fact negative.
      index = resolveBegin(index, index < 0 ? this.count() : this.size);
      var spliced = this.slice(0, index);
      return reify(
        this,
        numArgs === 1 ?
          spliced :
          spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
      );
    },


    // ### More collection methods

    findLastIndex: function(predicate, context) {
      var entry = this.findLastEntry(predicate, context);
      return entry ? entry[0] : -1;
    },

    first: function() {
      return this.get(0);
    },

    flatten: function(depth) {
      return reify(this, flattenFactory(this, depth, false));
    },

    get: function(index, notSetValue) {
      index = wrapIndex(this, index);
      return (index < 0 || (this.size === Infinity ||
          (this.size !== undefined && index > this.size))) ?
        notSetValue :
        this.find(function(_, key)  {return key === index}, undefined, notSetValue);
    },

    has: function(index) {
      index = wrapIndex(this, index);
      return index >= 0 && (this.size !== undefined ?
        this.size === Infinity || index < this.size :
        this.indexOf(index) !== -1
      );
    },

    interpose: function(separator) {
      return reify(this, interposeFactory(this, separator));
    },

    interleave: function(/*...iterables*/) {
      var iterables = [this].concat(arrCopy(arguments));
      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
      var interleaved = zipped.flatten(true);
      if (zipped.size) {
        interleaved.size = zipped.size * iterables.length;
      }
      return reify(this, interleaved);
    },

    keySeq: function() {
      return Range(0, this.size);
    },

    last: function() {
      return this.get(-1);
    },

    skipWhile: function(predicate, context) {
      return reify(this, skipWhileFactory(this, predicate, context, false));
    },

    zip: function(/*, ...iterables */) {
      var iterables = [this].concat(arrCopy(arguments));
      return reify(this, zipWithFactory(this, defaultZipper, iterables));
    },

    zipWith: function(zipper/*, ...iterables */) {
      var iterables = arrCopy(arguments);
      iterables[0] = this;
      return reify(this, zipWithFactory(this, zipper, iterables));
    }

  });

  IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
  IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



  mixin(SetIterable, {

    // ### ES6 Collection methods (ES6 Array and Map)

    get: function(value, notSetValue) {
      return this.has(value) ? value : notSetValue;
    },

    includes: function(value) {
      return this.has(value);
    },


    // ### More sequential methods

    keySeq: function() {
      return this.valueSeq();
    }

  });

  SetIterable.prototype.has = IterablePrototype.includes;
  SetIterable.prototype.contains = SetIterable.prototype.includes;


  // Mixin subclasses

  mixin(KeyedSeq, KeyedIterable.prototype);
  mixin(IndexedSeq, IndexedIterable.prototype);
  mixin(SetSeq, SetIterable.prototype);

  mixin(KeyedCollection, KeyedIterable.prototype);
  mixin(IndexedCollection, IndexedIterable.prototype);
  mixin(SetCollection, SetIterable.prototype);


  // #pragma Helper functions

  function keyMapper(v, k) {
    return k;
  }

  function entryMapper(v, k) {
    return [k, v];
  }

  function not(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    }
  }

  function neg(predicate) {
    return function() {
      return -predicate.apply(this, arguments);
    }
  }

  function quoteString(value) {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
  }

  function defaultZipper() {
    return arrCopy(arguments);
  }

  function defaultNegComparator(a, b) {
    return a < b ? 1 : a > b ? -1 : 0;
  }

  function hashIterable(iterable) {
    if (iterable.size === Infinity) {
      return 0;
    }
    var ordered = isOrdered(iterable);
    var keyed = isKeyed(iterable);
    var h = ordered ? 1 : 0;
    var size = iterable.__iterate(
      keyed ?
        ordered ?
          function(v, k)  { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
          function(v, k)  { h = h + hashMerge(hash(v), hash(k)) | 0; } :
        ordered ?
          function(v ) { h = 31 * h + hash(v) | 0; } :
          function(v ) { h = h + hash(v) | 0; }
    );
    return murmurHashOfSize(size, h);
  }

  function murmurHashOfSize(size, h) {
    h = imul(h, 0xCC9E2D51);
    h = imul(h << 15 | h >>> -15, 0x1B873593);
    h = imul(h << 13 | h >>> -13, 5);
    h = (h + 0xE6546B64 | 0) ^ size;
    h = imul(h ^ h >>> 16, 0x85EBCA6B);
    h = imul(h ^ h >>> 13, 0xC2B2AE35);
    h = smi(h ^ h >>> 16);
    return h;
  }

  function hashMerge(a, b) {
    return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
  }

  var Immutable = {

    Iterable: Iterable,

    Seq: Seq,
    Collection: Collection,
    Map: Map,
    OrderedMap: OrderedMap,
    List: List,
    Stack: Stack,
    Set: Set,
    OrderedSet: OrderedSet,

    Record: Record,
    Range: Range,
    Repeat: Repeat,

    is: is,
    fromJS: fromJS

  };

  return Immutable;

}));
});

var OptionTypes;
(function (OptionTypes) {
    OptionTypes[OptionTypes["IGNORED_LABELS"] = 0] = "IGNORED_LABELS";
    OptionTypes[OptionTypes["ACCESSED_NODES"] = 1] = "ACCESSED_NODES";
    OptionTypes[OptionTypes["ARGUMENTS_VARIABLES"] = 2] = "ARGUMENTS_VARIABLES";
    OptionTypes[OptionTypes["ASSIGNED_NODES"] = 3] = "ASSIGNED_NODES";
    OptionTypes[OptionTypes["IGNORE_BREAK_STATEMENTS"] = 4] = "IGNORE_BREAK_STATEMENTS";
    OptionTypes[OptionTypes["IGNORE_RETURN_AWAIT_YIELD"] = 5] = "IGNORE_RETURN_AWAIT_YIELD";
    OptionTypes[OptionTypes["NODES_CALLED_AT_PATH_WITH_OPTIONS"] = 6] = "NODES_CALLED_AT_PATH_WITH_OPTIONS";
    OptionTypes[OptionTypes["REPLACED_VARIABLE_INITS"] = 7] = "REPLACED_VARIABLE_INITS";
    OptionTypes[OptionTypes["RETURN_EXPRESSIONS_ACCESSED_AT_PATH"] = 8] = "RETURN_EXPRESSIONS_ACCESSED_AT_PATH";
    OptionTypes[OptionTypes["RETURN_EXPRESSIONS_ASSIGNED_AT_PATH"] = 9] = "RETURN_EXPRESSIONS_ASSIGNED_AT_PATH";
    OptionTypes[OptionTypes["RETURN_EXPRESSIONS_CALLED_AT_PATH"] = 10] = "RETURN_EXPRESSIONS_CALLED_AT_PATH";
})(OptionTypes || (OptionTypes = {}));
var RESULT_KEY = {};
var ExecutionPathOptions = /** @class */ (function () {
    function ExecutionPathOptions(optionValues) {
        this.optionValues = optionValues;
    }
    ExecutionPathOptions.create = function () {
        return new this(immutable.Map());
    };
    ExecutionPathOptions.prototype.get = function (option) {
        return this.optionValues.get(option);
    };
    ExecutionPathOptions.prototype.remove = function (option) {
        return new ExecutionPathOptions(this.optionValues.remove(option));
    };
    ExecutionPathOptions.prototype.set = function (option, value) {
        return new ExecutionPathOptions(this.optionValues.set(option, value));
    };
    ExecutionPathOptions.prototype.setIn = function (optionPath, value) {
        return new ExecutionPathOptions(this.optionValues.setIn(optionPath, value));
    };
    ExecutionPathOptions.prototype.addAccessedNodeAtPath = function (path, node) {
        return this.setIn([OptionTypes.ACCESSED_NODES, node].concat(path, [RESULT_KEY]), true);
    };
    ExecutionPathOptions.prototype.addAccessedReturnExpressionAtPath = function (path, callExpression) {
        return this.setIn([OptionTypes.RETURN_EXPRESSIONS_ACCESSED_AT_PATH, callExpression].concat(path, [RESULT_KEY]), true);
    };
    ExecutionPathOptions.prototype.addAssignedNodeAtPath = function (path, node) {
        return this.setIn([OptionTypes.ASSIGNED_NODES, node].concat(path, [RESULT_KEY]), true);
    };
    ExecutionPathOptions.prototype.addAssignedReturnExpressionAtPath = function (path, callExpression) {
        return this.setIn([OptionTypes.RETURN_EXPRESSIONS_ASSIGNED_AT_PATH, callExpression].concat(path, [RESULT_KEY]), true);
    };
    ExecutionPathOptions.prototype.addCalledNodeAtPathWithOptions = function (path, node, callOptions) {
        return this.setIn([OptionTypes.NODES_CALLED_AT_PATH_WITH_OPTIONS, node].concat(path, [RESULT_KEY, callOptions]), true);
    };
    ExecutionPathOptions.prototype.addCalledReturnExpressionAtPath = function (path, callExpression) {
        return this.setIn([OptionTypes.RETURN_EXPRESSIONS_CALLED_AT_PATH, callExpression].concat(path, [RESULT_KEY]), true);
    };
    ExecutionPathOptions.prototype.getArgumentsVariables = function () {
        return (this.get(OptionTypes.ARGUMENTS_VARIABLES) || []);
    };
    ExecutionPathOptions.prototype.getHasEffectsWhenCalledOptions = function () {
        return this.setIgnoreReturnAwaitYield()
            .setIgnoreBreakStatements(false)
            .setIgnoreNoLabels();
    };
    ExecutionPathOptions.prototype.getReplacedVariableInit = function (variable) {
        return this.optionValues.getIn([OptionTypes.REPLACED_VARIABLE_INITS, variable]);
    };
    ExecutionPathOptions.prototype.hasNodeBeenAccessedAtPath = function (path, node) {
        return this.optionValues.getIn([OptionTypes.ACCESSED_NODES, node].concat(path, [RESULT_KEY]));
    };
    ExecutionPathOptions.prototype.hasNodeBeenAssignedAtPath = function (path, node) {
        return this.optionValues.getIn([OptionTypes.ASSIGNED_NODES, node].concat(path, [RESULT_KEY]));
    };
    ExecutionPathOptions.prototype.hasNodeBeenCalledAtPathWithOptions = function (path, node, callOptions) {
        var previousCallOptions = this.optionValues.getIn([
            OptionTypes.NODES_CALLED_AT_PATH_WITH_OPTIONS,
            node
        ].concat(path, [
            RESULT_KEY
        ]));
        return (previousCallOptions &&
            previousCallOptions.find(function (_, otherCallOptions) {
                return otherCallOptions.equals(callOptions);
            }));
    };
    ExecutionPathOptions.prototype.hasReturnExpressionBeenAccessedAtPath = function (path, callExpression) {
        return this.optionValues.getIn([
            OptionTypes.RETURN_EXPRESSIONS_ACCESSED_AT_PATH,
            callExpression
        ].concat(path, [
            RESULT_KEY
        ]));
    };
    ExecutionPathOptions.prototype.hasReturnExpressionBeenAssignedAtPath = function (path, callExpression) {
        return this.optionValues.getIn([
            OptionTypes.RETURN_EXPRESSIONS_ASSIGNED_AT_PATH,
            callExpression
        ].concat(path, [
            RESULT_KEY
        ]));
    };
    ExecutionPathOptions.prototype.hasReturnExpressionBeenCalledAtPath = function (path, callExpression) {
        return this.optionValues.getIn([
            OptionTypes.RETURN_EXPRESSIONS_CALLED_AT_PATH,
            callExpression
        ].concat(path, [
            RESULT_KEY
        ]));
    };
    ExecutionPathOptions.prototype.ignoreBreakStatements = function () {
        return this.get(OptionTypes.IGNORE_BREAK_STATEMENTS);
    };
    ExecutionPathOptions.prototype.ignoreLabel = function (labelName) {
        return this.optionValues.getIn([OptionTypes.IGNORED_LABELS, labelName]);
    };
    ExecutionPathOptions.prototype.ignoreReturnAwaitYield = function () {
        return this.get(OptionTypes.IGNORE_RETURN_AWAIT_YIELD);
    };
    ExecutionPathOptions.prototype.replaceVariableInit = function (variable, init) {
        return this.setIn([OptionTypes.REPLACED_VARIABLE_INITS, variable], init);
    };
    ExecutionPathOptions.prototype.setArgumentsVariables = function (variables) {
        return this.set(OptionTypes.ARGUMENTS_VARIABLES, variables);
    };
    ExecutionPathOptions.prototype.setIgnoreBreakStatements = function (value) {
        if (value === void 0) { value = true; }
        return this.set(OptionTypes.IGNORE_BREAK_STATEMENTS, value);
    };
    ExecutionPathOptions.prototype.setIgnoreLabel = function (labelName) {
        return this.setIn([OptionTypes.IGNORED_LABELS, labelName], true);
    };
    ExecutionPathOptions.prototype.setIgnoreNoLabels = function () {
        return this.remove(OptionTypes.IGNORED_LABELS);
    };
    ExecutionPathOptions.prototype.setIgnoreReturnAwaitYield = function (value) {
        if (value === void 0) { value = true; }
        return this.set(OptionTypes.IGNORE_RETURN_AWAIT_YIELD, value);
    };
    return ExecutionPathOptions;
}());

var NodeBase = /** @class */ (function () {
    function NodeBase() {
        this.keys = [];
    }
    NodeBase.prototype.bind = function () {
        this.bindChildren();
        this.bindNode();
    };
    /**
     * Override to control on which children "bind" is called.
     */
    NodeBase.prototype.bindChildren = function () {
        this.eachChild(function (child) { return child.bind(); });
    };
    /**
     * Override this to bind assignments to variables and do any initialisations that
     * require the scopes to be populated with variables.
     */
    NodeBase.prototype.bindNode = function () { };
    NodeBase.prototype.eachChild = function (callback) {
        var _this = this;
        this.keys.forEach(function (key) {
            var value = _this[key];
            if (!value)
                return;
            if (Array.isArray(value)) {
                value.forEach(function (child) { return child && callback(child); });
            }
            else {
                callback(value);
            }
        });
    };
    NodeBase.prototype.forEachReturnExpressionWhenCalledAtPath = function (_path, _callOptions, _callback, _options) { };
    NodeBase.prototype.getValue = function () {
        return UNKNOWN_VALUE;
    };
    NodeBase.prototype.hasEffects = function (options) {
        return this.someChild(function (child) { return child.hasEffects(options); });
    };
    NodeBase.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 0;
    };
    NodeBase.prototype.hasEffectsWhenAssignedAtPath = function (_path, _options) {
        return true;
    };
    NodeBase.prototype.hasEffectsWhenCalledAtPath = function (_path, _callOptions, _options) {
        return true;
    };
    NodeBase.prototype.hasIncludedChild = function () {
        return this.included || this.someChild(function (child) { return child.hasIncludedChild(); });
    };
    NodeBase.prototype.includeInBundle = function () {
        var addedNewNodes = !this.included;
        this.included = true;
        this.eachChild(function (childNode) {
            if (childNode.includeInBundle()) {
                addedNewNodes = true;
            }
        });
        return addedNewNodes;
    };
    NodeBase.prototype.includeWithAllDeclaredVariables = function () {
        return this.includeInBundle();
    };
    NodeBase.prototype.initialise = function (parentScope) {
        this.initialiseScope(parentScope);
        this.initialiseNode(parentScope);
        this.initialiseChildren(parentScope);
    };
    NodeBase.prototype.initialiseAndDeclare = function (_parentScope, _kind, _init) { };
    /**
     * Override to change how and with what scopes children are initialised
     */
    NodeBase.prototype.initialiseChildren = function (_parentScope) {
        var _this = this;
        this.eachChild(function (child) { return child.initialise(_this.scope); });
    };
    /**
     * Override to perform special initialisation steps after the scope is initialised
     */
    NodeBase.prototype.initialiseNode = function (_parentScope) { };
    /**
     * Override if this scope should receive a different scope than the parent scope.
     */
    NodeBase.prototype.initialiseScope = function (parentScope) {
        this.scope = parentScope;
    };
    NodeBase.prototype.insertSemicolon = function (code) {
        if (code.original[this.end - 1] !== ';') {
            code.appendLeft(this.end, ';');
        }
    };
    NodeBase.prototype.locate = function () {
        // useful for debugging
        var location = locate(this.module.code, this.start, { offsetLine: 1 });
        location.file = this.module.id;
        location.toString = function () { return JSON.stringify(location); };
        return location;
    };
    NodeBase.prototype.reassignPath = function (_path, _options) { };
    NodeBase.prototype.render = function (code, options) {
        this.eachChild(function (child) { return child.render(code, options); });
    };
    NodeBase.prototype.shouldBeIncluded = function () {
        return this.hasIncludedChild() || this.hasEffects(ExecutionPathOptions.create());
    };
    NodeBase.prototype.someChild = function (callback) {
        var _this = this;
        return this.keys.some(function (key) {
            var value = _this[key];
            if (!value)
                return false;
            if (Array.isArray(value)) {
                return value.some(function (child) { return child && callback(child); });
            }
            return callback(value);
        });
    };
    NodeBase.prototype.someReturnExpressionWhenCalledAtPath = function (_path, _callOptions, predicateFunction, options) {
        return predicateFunction(options)(UNKNOWN_EXPRESSION);
    };
    NodeBase.prototype.toString = function () {
        return this.module.code.slice(this.start, this.end);
    };
    return NodeBase;
}());

var ArrayExpression = /** @class */ (function (_super) {
    __extends(ArrayExpression, _super);
    function ArrayExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ArrayExpression.prototype.hasEffectsWhenAccessedAtPath = function (path) {
        return path.length > 1;
    };
    ArrayExpression.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (path.length === 1) {
            return hasMemberEffectWhenCalled(arrayMembers, path[0], callOptions, options);
        }
        return true;
    };
    ArrayExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (path.length === 1) {
            return someMemberReturnExpressionWhenCalled(arrayMembers, path[0], callOptions, predicateFunction, options);
        }
        return true;
    };
    return ArrayExpression;
}(NodeBase));

var ArrayPattern = /** @class */ (function (_super) {
    __extends(ArrayPattern, _super);
    function ArrayPattern() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ArrayPattern.prototype.reassignPath = function (path, options) {
        path.length === 0 && this.elements.forEach(function (child) { return child && child.reassignPath([], options); });
    };
    ArrayPattern.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (path.length > 0 ||
            this.elements.some(function (child) { return child && child.hasEffectsWhenAssignedAtPath([], options); }));
    };
    ArrayPattern.prototype.initialiseAndDeclare = function (parentScope, kind, _init) {
        this.initialiseScope(parentScope);
        this.elements.forEach(function (child) { return child && child.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION); });
    };
    return ArrayPattern;
}(NodeBase));

var ReassignedPathTracker = /** @class */ (function () {
    function ReassignedPathTracker() {
        this._reassigned = false;
        this._unknownReassignedSubPath = false;
        this._subPaths = new Map();
    }
    ReassignedPathTracker.prototype.isReassigned = function (path) {
        if (path.length === 0) {
            return this._reassigned;
        }
        var subPath = path[0], remainingPath = path.slice(1);
        return (this._unknownReassignedSubPath ||
            (this._subPaths.has(subPath) && this._subPaths.get(subPath).isReassigned(remainingPath)));
    };
    ReassignedPathTracker.prototype.reassignPath = function (path) {
        if (this._reassigned)
            return;
        if (path.length === 0) {
            this._reassigned = true;
        }
        else {
            this._reassignSubPath(path);
        }
    };
    ReassignedPathTracker.prototype._reassignSubPath = function (path) {
        if (this._unknownReassignedSubPath)
            return;
        var subPath = path[0], remainingPath = path.slice(1);
        if (subPath === UNKNOWN_KEY) {
            this._unknownReassignedSubPath = true;
        }
        else {
            if (!this._subPaths.has(subPath)) {
                this._subPaths.set(subPath, new ReassignedPathTracker());
            }
            this._subPaths.get(subPath).reassignPath(remainingPath);
        }
    };
    ReassignedPathTracker.prototype.someReassignedPath = function (path, callback) {
        return this._reassigned
            ? callback(path, UNKNOWN_EXPRESSION)
            : path.length >= 1 && this._onSubPathIfReassigned(path, callback);
    };
    ReassignedPathTracker.prototype._onSubPathIfReassigned = function (path, callback) {
        var subPath = path[0], remainingPath = path.slice(1);
        return this._unknownReassignedSubPath || subPath === UNKNOWN_KEY
            ? callback(remainingPath, UNKNOWN_EXPRESSION)
            : this._subPaths.has(subPath) &&
                this._subPaths.get(subPath).someReassignedPath(remainingPath, callback);
    };
    return ReassignedPathTracker;
}());
var VariableReassignmentTracker = /** @class */ (function () {
    function VariableReassignmentTracker(initialExpression) {
        this._initialExpression = initialExpression;
        this._reassignedPathTracker = new ReassignedPathTracker();
    }
    VariableReassignmentTracker.prototype.reassignPath = function (path, options) {
        if (path.length > 0) {
            this._initialExpression && this._initialExpression.reassignPath(path, options);
        }
        this._reassignedPathTracker.reassignPath(path);
    };
    VariableReassignmentTracker.prototype.forEachAtPath = function (path, callback) {
        this._initialExpression && callback(path, this._initialExpression);
    };
    VariableReassignmentTracker.prototype.someAtPath = function (path, predicateFunction) {
        return (this._reassignedPathTracker.someReassignedPath(path, predicateFunction) ||
            (this._initialExpression && predicateFunction(path, this._initialExpression)));
    };
    return VariableReassignmentTracker;
}());

// To avoid infinite recursions
var MAX_PATH_DEPTH = 7;
var LocalVariable = /** @class */ (function (_super) {
    __extends(LocalVariable, _super);
    function LocalVariable(name, declarator, init) {
        var _this = _super.call(this, name) || this;
        _this.isReassigned = false;
        _this.exportName = null;
        _this.declarations = new Set(declarator ? [declarator] : null);
        _this.boundExpressions = new VariableReassignmentTracker(init);
        return _this;
    }
    LocalVariable.prototype.addDeclaration = function (identifier) {
        this.declarations.add(identifier);
    };
    LocalVariable.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        if (path.length > MAX_PATH_DEPTH)
            return;
        this.boundExpressions.forEachAtPath(path, function (relativePath, node) {
            return !options.hasNodeBeenCalledAtPathWithOptions(relativePath, node, callOptions) &&
                node.forEachReturnExpressionWhenCalledAtPath(relativePath, callOptions, callback, options.addCalledNodeAtPathWithOptions(relativePath, node, callOptions));
        });
    };
    LocalVariable.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return (path.length > MAX_PATH_DEPTH ||
            this.boundExpressions.someAtPath(path, function (relativePath, node) {
                return relativePath.length > 0 &&
                    !options.hasNodeBeenAccessedAtPath(relativePath, node) &&
                    node.hasEffectsWhenAccessedAtPath(relativePath, options.addAccessedNodeAtPath(relativePath, node));
            }));
    };
    LocalVariable.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (this.included ||
            path.length > MAX_PATH_DEPTH ||
            this.boundExpressions.someAtPath(path, function (relativePath, node) {
                return relativePath.length > 0 &&
                    !options.hasNodeBeenAssignedAtPath(relativePath, node) &&
                    node.hasEffectsWhenAssignedAtPath(relativePath, options.addAssignedNodeAtPath(relativePath, node));
            }));
    };
    LocalVariable.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return (path.length > MAX_PATH_DEPTH ||
            (this.included && path.length > 0) ||
            this.boundExpressions.someAtPath(path, function (relativePath, node) {
                return !options.hasNodeBeenCalledAtPathWithOptions(relativePath, node, callOptions) &&
                    node.hasEffectsWhenCalledAtPath(relativePath, callOptions, options.addCalledNodeAtPathWithOptions(relativePath, node, callOptions));
            }));
    };
    LocalVariable.prototype.includeVariable = function () {
        if (!_super.prototype.includeVariable.call(this))
            return false;
        this.declarations.forEach(function (identifier) { return identifier.includeInBundle(); });
        return true;
    };
    LocalVariable.prototype.reassignPath = function (path, options) {
        if (path.length > MAX_PATH_DEPTH)
            return;
        if (path.length === 0) {
            this.isReassigned = true;
        }
        if (!options.hasNodeBeenAssignedAtPath(path, this)) {
            this.boundExpressions.reassignPath(path, options.addAssignedNodeAtPath(path, this));
        }
    };
    LocalVariable.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return (path.length > MAX_PATH_DEPTH ||
            (this.included && path.length > 0) ||
            this.boundExpressions.someAtPath(path, function (relativePath, node) {
                return !options.hasNodeBeenCalledAtPathWithOptions(relativePath, node, callOptions) &&
                    node.someReturnExpressionWhenCalledAtPath(relativePath, callOptions, predicateFunction, options.addCalledNodeAtPathWithOptions(relativePath, node, callOptions));
            }));
    };
    return LocalVariable;
}(Variable));

var ExportDefaultVariable = /** @class */ (function (_super) {
    __extends(ExportDefaultVariable, _super);
    function ExportDefaultVariable(name, exportDefaultDeclaration) {
        var _this = _super.call(this, name, exportDefaultDeclaration, exportDefaultDeclaration.declaration) || this;
        _this.isDefault = true;
        _this.hasId = !!exportDefaultDeclaration.declaration
            .id;
        return _this;
    }
    ExportDefaultVariable.prototype.addReference = function (identifier) {
        this.name = identifier.name;
        if (this._original) {
            this._original.addReference(identifier);
        }
    };
    ExportDefaultVariable.prototype.getName = function (reset) {
        if (!reset && this.safeName)
            return this.safeName;
        if (this._original && !this._original.isReassigned)
            return this._original.getName();
        return this.name;
    };
    ExportDefaultVariable.prototype.referencesOriginal = function () {
        return this._original && !this._original.isReassigned;
    };
    ExportDefaultVariable.prototype.getOriginalVariableName = function () {
        return this._original && this._original.getName();
    };
    ExportDefaultVariable.prototype.setOriginalVariable = function (original) {
        this._original = original;
    };
    return ExportDefaultVariable;
}(LocalVariable));

var Scope = /** @class */ (function () {
    function Scope(options) {
        if (options === void 0) { options = {}; }
        this.parent = options.parent;
        this.isModuleScope = !!options.isModuleScope;
        this.children = [];
        if (this.parent)
            this.parent.children.push(this);
        this.variables = blank();
    }
    /**
     * @param identifier
     * @param {Object} [options] - valid options are
     *        {(Node|null)} init
     *        {boolean} isHoisted
     * @return {Variable}
     */
    Scope.prototype.addDeclaration = function (identifier, options) {
        if (options === void 0) { options = {
            init: null,
            isHoisted: false
        }; }
        var name = identifier.name;
        if (this.variables[name]) {
            var variable = this.variables[name];
            variable.addDeclaration(identifier);
            variable.reassignPath([], ExecutionPathOptions.create());
        }
        else {
            this.variables[name] = new LocalVariable(identifier.name, identifier, options.init || UNKNOWN_EXPRESSION);
        }
        return this.variables[name];
    };
    Scope.prototype.addExportDefaultDeclaration = function (name, exportDefaultDeclaration) {
        this.variables.default = new ExportDefaultVariable(name, exportDefaultDeclaration);
        return this.variables.default;
    };
    Scope.prototype.addReturnExpression = function (expression) {
        this.parent && this.parent.addReturnExpression(expression);
    };
    Scope.prototype.contains = function (name) {
        return !!this.variables[name] || (this.parent ? this.parent.contains(name) : false);
    };
    Scope.prototype.deshadow = function (names, children) {
        var _this = this;
        if (children === void 0) { children = this.children; }
        keys(this.variables).forEach(function (key) {
            var declaration = _this.variables[key];
            // we can disregard exports.foo etc
            if (declaration.exportName && declaration.isReassigned && !declaration.isId)
                return;
            if (declaration.isDefault)
                return;
            var name = declaration.getName(true);
            if (!names.has(name)) {
                return;
            }
            name = declaration.name;
            var deshadowed, i = 1;
            do {
                deshadowed = name + "$$" + i++;
            } while (names.has(deshadowed));
            declaration.setSafeName(deshadowed);
        });
        children.forEach(function (scope) { return scope.deshadow(names); });
    };
    Scope.prototype.findLexicalBoundary = function () {
        return this.parent.findLexicalBoundary();
    };
    Scope.prototype.findVariable = function (name) {
        return this.variables[name] || (this.parent && this.parent.findVariable(name));
    };
    return Scope;
}());

var ReplaceableInitializationVariable = /** @class */ (function (_super) {
    __extends(ReplaceableInitializationVariable, _super);
    function ReplaceableInitializationVariable(name, declarator) {
        return _super.call(this, name, declarator, null) || this;
    }
    ReplaceableInitializationVariable.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return (this._getInit(options).hasEffectsWhenAccessedAtPath(path, options) ||
            _super.prototype.hasEffectsWhenAccessedAtPath.call(this, path, options));
    };
    ReplaceableInitializationVariable.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (this._getInit(options).hasEffectsWhenAssignedAtPath(path, options) ||
            _super.prototype.hasEffectsWhenAssignedAtPath.call(this, path, options));
    };
    ReplaceableInitializationVariable.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return (this._getInit(options).hasEffectsWhenCalledAtPath(path, callOptions, options) ||
            _super.prototype.hasEffectsWhenCalledAtPath.call(this, path, callOptions, options));
    };
    ReplaceableInitializationVariable.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return (this._getInit(options).someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options) || _super.prototype.someReturnExpressionWhenCalledAtPath.call(this, path, callOptions, predicateFunction, options));
    };
    ReplaceableInitializationVariable.prototype._getInit = function (options) {
        return options.getReplacedVariableInit(this) || UNKNOWN_EXPRESSION;
    };
    return ReplaceableInitializationVariable;
}(LocalVariable));

var ParameterVariable = /** @class */ (function (_super) {
    __extends(ParameterVariable, _super);
    function ParameterVariable(identifier) {
        return _super.call(this, identifier.name, identifier) || this;
    }
    return ParameterVariable;
}(ReplaceableInitializationVariable));

var ParameterScope = /** @class */ (function (_super) {
    __extends(ParameterScope, _super);
    function ParameterScope(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this._parameters = [];
        return _this;
    }
    /**
     * Adds a parameter to this scope. Parameters must be added in the correct
     * order, e.g. from left to right.
     * @param {Identifier} identifier
     * @returns {Variable}
     */
    ParameterScope.prototype.addParameterDeclaration = function (identifier) {
        var variable = new ParameterVariable(identifier);
        this.variables[identifier.name] = variable;
        this._parameters.push(variable);
        return variable;
    };
    ParameterScope.prototype.getParameterVariables = function () {
        return this._parameters;
    };
    return ParameterScope;
}(Scope));

var ReturnValueScope = /** @class */ (function (_super) {
    __extends(ReturnValueScope, _super);
    function ReturnValueScope(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this._returnExpressions = new Set();
        return _this;
    }
    ReturnValueScope.prototype.addReturnExpression = function (expression) {
        this._returnExpressions.add(expression);
    };
    ReturnValueScope.prototype.forEachReturnExpressionWhenCalled = function (_callOptions, callback, options) {
        this._returnExpressions.forEach(callback(options));
    };
    ReturnValueScope.prototype.someReturnExpressionWhenCalled = function (_callOptions, predicateFunction, options) {
        return Array.from(this._returnExpressions).some(predicateFunction(options));
    };
    return ReturnValueScope;
}(ParameterScope));

var BlockScope = /** @class */ (function (_super) {
    __extends(BlockScope, _super);
    function BlockScope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockScope.prototype.addDeclaration = function (identifier, options) {
        if (options === void 0) { options = {
            isHoisted: false
        }; }
        if (options.isHoisted) {
            return this.parent.addDeclaration(identifier, options);
        }
        else {
            return _super.prototype.addDeclaration.call(this, identifier, options);
        }
    };
    return BlockScope;
}(Scope));

var NodeType;
(function (NodeType) {
    NodeType["ArrayExpression"] = "ArrayExpression";
    NodeType["ArrayPattern"] = "ArrayPattern";
    NodeType["ArrowFunctionExpression"] = "ArrowFunctionExpression";
    NodeType["AssignmentExpression"] = "AssignmentExpression";
    NodeType["AssignmentPattern"] = "AssignmentPattern";
    NodeType["AwaitExpression"] = "AwaitExpression";
    NodeType["BinaryExpression"] = "BinaryExpression";
    NodeType["BlockStatement"] = "BlockStatement";
    NodeType["BreakStatement"] = "BreakStatement";
    NodeType["CallExpression"] = "CallExpression";
    NodeType["CatchClause"] = "CatchClause";
    NodeType["ClassBody"] = "ClassBody";
    NodeType["ClassDeclaration"] = "ClassDeclaration";
    NodeType["ClassExpression"] = "ClassExpression";
    NodeType["ConditionalExpression"] = "ConditionalExpression";
    NodeType["DoWhileStatement"] = "DoWhileStatement";
    NodeType["EmptyStatement"] = "EmptyStatement";
    NodeType["ExportAllDeclaration"] = "ExportAllDeclaration";
    NodeType["ExportDefaultDeclaration"] = "ExportDefaultDeclaration";
    NodeType["ExportNamedDeclaration"] = "ExportNamedDeclaration";
    NodeType["ExportSpecifier"] = "ExportSpecifier";
    NodeType["ExpressionStatement"] = "ExpressionStatement";
    NodeType["ForStatement"] = "ForStatement";
    NodeType["ForInStatement"] = "ForInStatement";
    NodeType["ForOfStatement"] = "ForOfStatement";
    NodeType["FunctionDeclaration"] = "FunctionDeclaration";
    NodeType["FunctionExpression"] = "FunctionExpression";
    NodeType["Identifier"] = "Identifier";
    NodeType["IfStatement"] = "IfStatement";
    NodeType["Import"] = "Import";
    NodeType["ImportDeclaration"] = "ImportDeclaration";
    NodeType["ImportDefaultSpecifier"] = "ImportDefaultSpecifier";
    NodeType["ImportNamespaceSpecifier"] = "ImportNamespaceSpecifier";
    NodeType["ImportSpecifier"] = "ImportSpecifier";
    NodeType["LabeledStatement"] = "LabeledStatement";
    NodeType["Literal"] = "Literal";
    NodeType["LogicalExpression"] = "LogicalExpression";
    NodeType["MemberExpression"] = "MemberExpression";
    NodeType["MethodDefinition"] = "MethodDefinition";
    NodeType["NewExpression"] = "NewExpression";
    NodeType["ObjectExpression"] = "ObjectExpression";
    NodeType["ObjectPattern"] = "ObjectPattern";
    NodeType["Program"] = "Program";
    NodeType["Property"] = "Property";
    NodeType["RestElement"] = "RestElement";
    NodeType["ReturnStatement"] = "ReturnStatement";
    NodeType["SequenceExpression"] = "SequenceExpression";
    NodeType["SpreadElement"] = "SpreadElement";
    NodeType["SwitchCase"] = "SwitchCase";
    NodeType["SwitchStatement"] = "SwitchStatement";
    NodeType["TaggedTemplateExpression"] = "TaggedTemplateExpression";
    NodeType["TemplateElement"] = "TemplateElement";
    NodeType["TemplateLiteral"] = "TemplateLiteral";
    NodeType["ThisExpression"] = "ThisExpression";
    NodeType["ThrowStatement"] = "ThrowStatement";
    NodeType["TryStatement"] = "TryStatement";
    NodeType["UnaryExpression"] = "UnaryExpression";
    NodeType["UpdateExpression"] = "UpdateExpression";
    NodeType["VariableDeclarator"] = "VariableDeclarator";
    NodeType["VariableDeclaration"] = "VariableDeclaration";
    NodeType["WhileStatement"] = "WhileStatement";
    NodeType["YieldExpression"] = "YieldExpression";
})(NodeType || (NodeType = {}));

var NO_SEMICOLON = { isNoStatement: true };
function findFirstOccurrenceOutsideComment(code, searchString, start) {
    if (start === void 0) { start = 0; }
    var commentStart, searchPos;
    while (true) {
        commentStart = code.indexOf('/', start);
        searchPos = code.indexOf(searchString, start);
        if (commentStart === -1)
            break;
        if (searchPos >= commentStart) {
            searchPos = -1;
        }
        else if (searchPos !== -1)
            break;
        start = commentStart + 1;
        if (code.charCodeAt(start) === 42 /*"*"*/) {
            start = code.indexOf('*/', start) + 2;
        }
        else if (code.charCodeAt(start) === 47 /*"/"*/) {
            start = code.indexOf('\n', start) + 1;
        }
    }
    return searchPos;
}
function findFirstLineBreakOutsideComment(code, start) {
    if (start === void 0) { start = 0; }
    var commentStart, lineBreakPos;
    while (true) {
        commentStart = code.indexOf('/*', start);
        lineBreakPos = code.indexOf('\n', start);
        if (commentStart === -1)
            break;
        if (lineBreakPos >= commentStart) {
            lineBreakPos = -1;
        }
        else if (lineBreakPos !== -1)
            break;
        start = code.indexOf('*/', commentStart) + 2;
    }
    return lineBreakPos;
}
function renderStatementList(statements, code, start, end, options) {
    if (statements.length === 0)
        return;
    var currentNode, currentNodeStart, currentNodeNeedsBoundaries, nextNodeStart;
    var nextNode = statements[0];
    var nextNodeNeedsBoundaries = !nextNode.included || nextNode.needsBoundaries;
    if (nextNodeNeedsBoundaries) {
        nextNodeStart =
            start + findFirstLineBreakOutsideComment(code.original.slice(start, nextNode.start)) + 1;
    }
    for (var nextIndex = 1; nextIndex <= statements.length; nextIndex++) {
        currentNode = nextNode;
        currentNodeStart = nextNodeStart;
        currentNodeNeedsBoundaries = nextNodeNeedsBoundaries;
        nextNode = statements[nextIndex];
        nextNodeNeedsBoundaries =
            nextNode === undefined ? false : !nextNode.included || nextNode.needsBoundaries;
        if (currentNodeNeedsBoundaries || nextNodeNeedsBoundaries) {
            nextNodeStart =
                currentNode.end +
                    findFirstLineBreakOutsideComment(code.original.slice(currentNode.end, nextNode === undefined ? end : nextNode.start)) +
                    1;
            if (currentNode.included) {
                currentNodeNeedsBoundaries
                    ? currentNode.render(code, options, {
                        start: currentNodeStart,
                        end: nextNodeStart
                    })
                    : currentNode.render(code, options);
            }
            else {
                code.remove(currentNodeStart, nextNodeStart);
            }
        }
        else {
            currentNode.render(code, options);
        }
    }
}
// This assumes that the first character is not part of the first node
function getCommaSeparatedNodesWithBoundaries(nodes, code, start, end) {
    var splitUpNodes = [];
    var node, nextNode, nextNodeStart, contentEnd, char;
    var separator = start - 1;
    for (var nextIndex = 0; nextIndex < nodes.length; nextIndex++) {
        nextNode = nodes[nextIndex];
        if (node !== undefined) {
            separator =
                node.end +
                    findFirstOccurrenceOutsideComment(code.original.slice(node.end, nextNode.start), ',');
        }
        nextNodeStart = contentEnd =
            separator +
                2 +
                findFirstLineBreakOutsideComment(code.original.slice(separator + 1, nextNode.start));
        while ((char = code.original.charCodeAt(nextNodeStart), char === 32 /*" "*/ || char === 9 /*"\t"*/ || char === 10 /*"\n"*/ || char === 13) /*"\r"*/)
            nextNodeStart++;
        if (node !== undefined) {
            splitUpNodes.push({
                node: node,
                start: start,
                contentEnd: contentEnd,
                separator: separator,
                end: nextNodeStart
            });
        }
        node = nextNode;
        start = nextNodeStart;
    }
    splitUpNodes.push({
        node: node,
        start: start,
        separator: null,
        contentEnd: end,
        end: end
    });
    return splitUpNodes;
}

function isBlockStatement(node) {
    return node.type === NodeType.BlockStatement;
}
var BlockStatement = /** @class */ (function (_super) {
    __extends(BlockStatement, _super);
    function BlockStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockStatement.prototype.bindImplicitReturnExpressionToScope = function () {
        var lastStatement = this.body[this.body.length - 1];
        if (!lastStatement || lastStatement.type !== NodeType.ReturnStatement) {
            this.scope.addReturnExpression(UNKNOWN_EXPRESSION);
        }
    };
    BlockStatement.prototype.hasEffects = function (options) {
        return this.body.some(function (child) { return child.hasEffects(options); });
    };
    BlockStatement.prototype.includeInBundle = function () {
        var addedNewNodes = !this.included;
        this.included = true;
        this.body.forEach(function (node) {
            if (node.shouldBeIncluded()) {
                if (node.includeInBundle()) {
                    addedNewNodes = true;
                }
            }
        });
        return addedNewNodes;
    };
    BlockStatement.prototype.initialiseAndReplaceScope = function (scope) {
        this.scope = scope;
        this.initialiseNode(scope);
        this.initialiseChildren(scope);
    };
    BlockStatement.prototype.initialiseChildren = function (_parentScope) {
        for (var _i = 0, _a = this.body; _i < _a.length; _i++) {
            var node = _a[_i];
            node.initialise(this.scope);
        }
    };
    BlockStatement.prototype.initialiseScope = function (parentScope) {
        this.scope = new BlockScope({ parent: parentScope });
    };
    BlockStatement.prototype.render = function (code, options) {
        if (this.body.length) {
            renderStatementList(this.body, code, this.start + 1, this.end - 1, options);
        }
        else {
            _super.prototype.render.call(this, code, options);
        }
    };
    return BlockStatement;
}(NodeBase));

var ArrowFunctionExpression = /** @class */ (function (_super) {
    __extends(ArrowFunctionExpression, _super);
    function ArrowFunctionExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ArrowFunctionExpression.prototype.bindNode = function () {
        isBlockStatement(this.body)
            ? this.body.bindImplicitReturnExpressionToScope()
            : this.scope.addReturnExpression(this.body);
    };
    ArrowFunctionExpression.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        path.length === 0 &&
            this.scope.forEachReturnExpressionWhenCalled(callOptions, callback, options);
    };
    ArrowFunctionExpression.prototype.hasEffects = function (_options) {
        return false;
    };
    ArrowFunctionExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 1;
    };
    ArrowFunctionExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, _options) {
        return path.length > 1;
    };
    ArrowFunctionExpression.prototype.hasEffectsWhenCalledAtPath = function (path, _callOptions, options) {
        if (path.length > 0) {
            return true;
        }
        return this.params.some(function (param) { return param.hasEffects(options); }) || this.body.hasEffects(options);
    };
    ArrowFunctionExpression.prototype.initialiseChildren = function () {
        var _this = this;
        this.params.forEach(function (param) { return param.initialiseAndDeclare(_this.scope, 'parameter', null); });
        if (this.body.initialiseAndReplaceScope) {
            this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
        }
        else {
            this.body.initialise(this.scope);
        }
    };
    ArrowFunctionExpression.prototype.initialiseScope = function (parentScope) {
        this.scope = new ReturnValueScope({ parent: parentScope });
    };
    ArrowFunctionExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return (path.length > 0 ||
            this.scope.someReturnExpressionWhenCalled(callOptions, predicateFunction, options));
    };
    return ArrowFunctionExpression;
}(NodeBase));

var AssignmentExpression = /** @class */ (function (_super) {
    __extends(AssignmentExpression, _super);
    function AssignmentExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AssignmentExpression.prototype.bindNode = function () {
        this.left.reassignPath([], ExecutionPathOptions.create());
    };
    AssignmentExpression.prototype.hasEffects = function (options) {
        return _super.prototype.hasEffects.call(this, options) || this.left.hasEffectsWhenAssignedAtPath([], options);
    };
    AssignmentExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return path.length > 0 && this.right.hasEffectsWhenAccessedAtPath(path, options);
    };
    return AssignmentExpression;
}(NodeBase));

var AssignmentPattern = /** @class */ (function (_super) {
    __extends(AssignmentPattern, _super);
    function AssignmentPattern() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AssignmentPattern.prototype.bindNode = function () {
        this.left.reassignPath([], ExecutionPathOptions.create());
    };
    AssignmentPattern.prototype.reassignPath = function (path, options) {
        path.length === 0 && this.left.reassignPath(path, options);
    };
    AssignmentPattern.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return path.length > 0 || this.left.hasEffectsWhenAssignedAtPath([], options);
    };
    AssignmentPattern.prototype.initialiseAndDeclare = function (parentScope, kind, init) {
        this.initialiseScope(parentScope);
        this.right.initialise(parentScope);
        this.left.initialiseAndDeclare(parentScope, kind, init);
    };
    return AssignmentPattern;
}(NodeBase));

var AwaitExpression = /** @class */ (function (_super) {
    __extends(AwaitExpression, _super);
    function AwaitExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AwaitExpression.prototype.hasEffects = function (options) {
        return _super.prototype.hasEffects.call(this, options) || !options.ignoreReturnAwaitYield();
    };
    return AwaitExpression;
}(NodeBase));

var operators = {
    '==': function (left, right) { return left == right; },
    '!=': function (left, right) { return left != right; },
    '===': function (left, right) { return left === right; },
    '!==': function (left, right) { return left !== right; },
    '<': function (left, right) { return left < right; },
    '<=': function (left, right) { return left <= right; },
    '>': function (left, right) { return left > right; },
    '>=': function (left, right) { return left >= right; },
    '<<': function (left, right) { return left << right; },
    '>>': function (left, right) { return left >> right; },
    '>>>': function (left, right) { return left >>> right; },
    '+': function (left, right) { return left + right; },
    '-': function (left, right) { return left - right; },
    '*': function (left, right) { return left * right; },
    '/': function (left, right) { return left / right; },
    '%': function (left, right) { return left % right; },
    '|': function (left, right) { return left | right; },
    '^': function (left, right) { return left ^ right; },
    '&': function (left, right) { return left & right; },
    '**': function (left, right) { return Math.pow(left, right); },
    in: function (left, right) { return left in right; },
    instanceof: function (left, right) { return left instanceof right; }
};
var BinaryExpression = /** @class */ (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BinaryExpression.prototype.getValue = function () {
        var leftValue = this.left.getValue();
        if (leftValue === UNKNOWN_VALUE)
            return UNKNOWN_VALUE;
        var rightValue = this.right.getValue();
        if (rightValue === UNKNOWN_VALUE)
            return UNKNOWN_VALUE;
        var operatorFn = operators[this.operator];
        if (!operatorFn)
            return UNKNOWN_VALUE;
        return operatorFn(leftValue, rightValue);
    };
    BinaryExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 1;
    };
    return BinaryExpression;
}(NodeBase));

var BreakStatement = /** @class */ (function (_super) {
    __extends(BreakStatement, _super);
    function BreakStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BreakStatement.prototype.hasEffects = function (options) {
        return (_super.prototype.hasEffects.call(this, options) ||
            !options.ignoreBreakStatements() ||
            (this.label && !options.ignoreLabel(this.label.name)));
    };
    return BreakStatement;
}(NodeBase));

var pureFunctions = {};
var arrayTypes = 'Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array'.split(' ');
var simdTypes = 'Int8x16 Int16x8 Int32x4 Float32x4 Float64x2'.split(' ');
var simdMethods = 'abs add and bool check div equal extractLane fromFloat32x4 fromFloat32x4Bits fromFloat64x2 fromFloat64x2Bits fromInt16x8Bits fromInt32x4 fromInt32x4Bits fromInt8x16Bits greaterThan greaterThanOrEqual lessThan lessThanOrEqual load max maxNum min minNum mul neg not notEqual or reciprocalApproximation reciprocalSqrtApproximation replaceLane select selectBits shiftLeftByScalar shiftRightArithmeticByScalar shiftRightLogicalByScalar shuffle splat sqrt store sub swizzle xor'.split(' ');
var allSimdMethods = [];
simdTypes.forEach(function (t) {
    simdMethods.forEach(function (m) {
        allSimdMethods.push("SIMD." + t + "." + m);
    });
});
[
    'Array.isArray',
    'Error',
    'EvalError',
    'InternalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',
    'isFinite',
    'isNaN',
    'parseFloat',
    'parseInt',
    'decodeURI',
    'decodeURIComponent',
    'encodeURI',
    'encodeURIComponent',
    'escape',
    'unescape',
    'Object',
    'Object.create',
    'Object.getNotifier',
    'Object.getOwn',
    'Object.getOwnPropertyDescriptor',
    'Object.getOwnPropertyNames',
    'Object.getOwnPropertySymbols',
    'Object.getPrototypeOf',
    'Object.is',
    'Object.isExtensible',
    'Object.isFrozen',
    'Object.isSealed',
    'Object.keys',
    'Boolean',
    'Number',
    'Number.isFinite',
    'Number.isInteger',
    'Number.isNaN',
    'Number.isSafeInteger',
    'Number.parseFloat',
    'Number.parseInt',
    'Symbol',
    'Symbol.for',
    'Symbol.keyFor',
    'Math.abs',
    'Math.acos',
    'Math.acosh',
    'Math.asin',
    'Math.asinh',
    'Math.atan',
    'Math.atan2',
    'Math.atanh',
    'Math.cbrt',
    'Math.ceil',
    'Math.clz32',
    'Math.cos',
    'Math.cosh',
    'Math.exp',
    'Math.expm1',
    'Math.floor',
    'Math.fround',
    'Math.hypot',
    'Math.imul',
    'Math.log',
    'Math.log10',
    'Math.log1p',
    'Math.log2',
    'Math.max',
    'Math.min',
    'Math.pow',
    'Math.random',
    'Math.round',
    'Math.sign',
    'Math.sin',
    'Math.sinh',
    'Math.sqrt',
    'Math.tan',
    'Math.tanh',
    'Math.trunc',
    'Date',
    'Date.UTC',
    'Date.now',
    'Date.parse',
    'String',
    'String.fromCharCode',
    'String.fromCodePoint',
    'String.raw',
    'RegExp',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'ArrayBuffer',
    'ArrayBuffer.isView',
    'DataView',
    'Promise.all',
    'Promise.race',
    'Promise.resolve',
    'Intl.Collator',
    'Intl.Collator.supportedLocalesOf',
    'Intl.DateTimeFormat',
    'Intl.DateTimeFormat.supportedLocalesOf',
    'Intl.NumberFormat',
    'Intl.NumberFormat.supportedLocalesOf'
    // TODO properties of e.g. window...
]
    .concat(arrayTypes, arrayTypes.map(function (t) { return t + ".from"; }), arrayTypes.map(function (t) { return t + ".of"; }), simdTypes.map(function (t) { return "SIMD." + t; }), allSimdMethods)
    .forEach(function (name) { return (pureFunctions[name] = true); });

function isGlobalVariable(variable) {
    return variable.isGlobal;
}
var GlobalVariable = /** @class */ (function (_super) {
    __extends(GlobalVariable, _super);
    function GlobalVariable(name) {
        var _this = _super.call(this, name) || this;
        _this.isExternal = true;
        _this.isGlobal = true;
        _this.isReassigned = false;
        _this.included = true;
        return _this;
    }
    GlobalVariable.prototype.hasEffectsWhenAccessedAtPath = function (path) {
        // path.length == 0 can also have an effect but we postpone this for now
        return (path.length > 0 &&
            !this.isPureFunctionMember(path) &&
            !(this.name === 'Reflect' && path.length === 1));
    };
    GlobalVariable.prototype.hasEffectsWhenCalledAtPath = function (path) {
        return !pureFunctions[[this.name].concat(path).join('.')];
    };
    GlobalVariable.prototype.isPureFunctionMember = function (path) {
        return (pureFunctions[[this.name].concat(path).join('.')] ||
            (path.length >= 1 && pureFunctions[[this.name].concat(path.slice(0, -1)).join('.')]) ||
            (path.length >= 2 &&
                pureFunctions[[this.name].concat(path.slice(0, -2)).join('.')] &&
                path[path.length - 2] === 'prototype'));
    };
    return GlobalVariable;
}(Variable));

function isReference(node, parent) {
    if (node.type === 'MemberExpression') {
        return !node.computed && isReference(node.object, node);
    }
    if (node.type === 'Identifier') {
        // the only time we could have an identifier node without a parent is
        // if it's the entire body of a function without a block statement –
        // i.e. an arrow function expression like `a => a`
        if (!parent)
            return true;
        // TODO is this right?
        if (parent.type === 'MemberExpression' || parent.type === 'MethodDefinition') {
            return parent.computed || node === parent.object;
        }
        // disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
        if (parent.type === 'Property')
            return parent.computed || node === parent.value;
        // disregard the `bar` in `export { foo as bar }`
        if (parent.type === 'ExportSpecifier' && node !== parent.local)
            return false;
        return true;
    }
    return false;
}

function isIdentifier(node) {
    return node.type === NodeType.Identifier;
}
var Identifier = /** @class */ (function (_super) {
    __extends(Identifier, _super);
    function Identifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Identifier.prototype.bindNode = function () {
        if (isReference(this, this.parent)) {
            this.variable = this.scope.findVariable(this.name);
            this.variable.addReference(this);
        }
    };
    Identifier.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        if (!this.isBound)
            this.bind();
        this.variable &&
            this.variable.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
    };
    Identifier.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return this.variable && this.variable.hasEffectsWhenAccessedAtPath(path, options);
    };
    Identifier.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return !this.variable || this.variable.hasEffectsWhenAssignedAtPath(path, options);
    };
    Identifier.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return !this.variable || this.variable.hasEffectsWhenCalledAtPath(path, callOptions, options);
    };
    Identifier.prototype.includeInBundle = function () {
        if (this.included)
            return false;
        this.included = true;
        this.variable && this.variable.includeVariable();
        return true;
    };
    Identifier.prototype.initialiseAndDeclare = function (parentScope, kind, init) {
        this.initialiseScope(parentScope);
        switch (kind) {
            case 'var':
            case 'function':
                this.variable = this.scope.addDeclaration(this, {
                    isHoisted: true,
                    init: init
                });
                break;
            case 'let':
            case 'const':
            case 'class':
                this.variable = this.scope.addDeclaration(this, { init: init });
                break;
            case 'parameter':
                this.variable = this.scope.addParameterDeclaration(this);
                break;
            default:
                throw new Error("Unexpected identifier kind " + kind + ".");
        }
    };
    Identifier.prototype.reassignPath = function (path, options) {
        if (!this.isBound)
            this.bind();
        if (this.variable) {
            if (path.length === 0)
                this.disallowImportReassignment();
            this.variable.reassignPath(path, options);
        }
    };
    Identifier.prototype.disallowImportReassignment = function () {
        if (this.module.imports[this.name] && !this.scope.contains(this.name)) {
            this.module.error({
                code: 'ILLEGAL_REASSIGNMENT',
                message: "Illegal reassignment to import '" + this.name + "'"
            }, this.start);
        }
    };
    Identifier.prototype.renderSystemBindingUpdate = function (code, name) {
        switch (this.parent.type) {
            case NodeType.AssignmentExpression:
                {
                    var expression = this.parent;
                    if (expression.left === this) {
                        code.prependLeft(expression.right.start, "exports('" + this.variable.exportName + "', ");
                        code.prependRight(expression.right.end, ")");
                    }
                }
                break;
            case NodeType.UpdateExpression:
                {
                    var expression = this.parent;
                    if (expression.prefix) {
                        code.overwrite(expression.start, expression.end, "exports('" + this.variable.exportName + "', " + expression.operator + name + ")");
                    }
                    else {
                        var op = void 0;
                        switch (expression.operator) {
                            case '++':
                                op = name + " + 1";
                                break;
                            case '--':
                                op = name + " - 1";
                                break;
                            case '**':
                                op = name + " * " + name;
                                break;
                        }
                        code.overwrite(expression.start, expression.end, "(exports('" + this.variable.exportName + "', " + op + "), " + name + expression.operator + ")");
                    }
                }
                break;
        }
    };
    Identifier.prototype.render = function (code, options) {
        if (this.variable) {
            var name = this.variable.getName();
            if (name !== this.name &&
                !(this.parent.type === NodeType.ClassDeclaration &&
                    this.parent.id === this)) {
                code.overwrite(this.start, this.end, name, {
                    storeName: true,
                    contentOnly: false
                });
                // special case
                if (this.parent.type === NodeType.Property && this.parent.shorthand) {
                    code.appendLeft(this.start, this.name + ": ");
                }
            }
            if (options.systemBindings && this.variable.exportName) {
                this.renderSystemBindingUpdate(code, name);
            }
        }
    };
    Identifier.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (this.variable) {
            return this.variable.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options);
        }
        return predicateFunction(options)(UNKNOWN_EXPRESSION);
    };
    return Identifier;
}(NodeBase));

var CallExpression = /** @class */ (function (_super) {
    __extends(CallExpression, _super);
    function CallExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CallExpression.prototype.reassignPath = function (path, options) {
        var _this = this;
        !options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
            this.callee.forEachReturnExpressionWhenCalledAtPath([], this._callOptions, function (innerOptions) { return function (node) {
                return node.reassignPath(path, innerOptions.addAssignedReturnExpressionAtPath(path, _this));
            }; }, options);
    };
    CallExpression.prototype.bindNode = function () {
        if (isIdentifier(this.callee)) {
            var variable = this.scope.findVariable(this.callee.name);
            if (isNamespaceVariable(variable)) {
                this.module.error({
                    code: 'CANNOT_CALL_NAMESPACE',
                    message: "Cannot call a namespace ('" + this.callee.name + "')"
                }, this.start);
            }
            if (this.callee.name === 'eval' && isGlobalVariable(variable)) {
                this.module.warn({
                    code: 'EVAL',
                    message: "Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",
                    url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
                }, this.start);
            }
        }
    };
    CallExpression.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        this.callee.forEachReturnExpressionWhenCalledAtPath([], this._callOptions, function (innerOptions) { return function (node) {
            return node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, innerOptions);
        }; }, options);
    };
    CallExpression.prototype.hasEffects = function (options) {
        return (this.arguments.some(function (child) { return child.hasEffects(options); }) ||
            this.callee.hasEffectsWhenCalledAtPath([], this._callOptions, options.getHasEffectsWhenCalledOptions()));
    };
    CallExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        var _this = this;
        return (path.length > 0 &&
            !options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
            this.callee.someReturnExpressionWhenCalledAtPath([], this._callOptions, function (innerOptions) { return function (node) {
                return node.hasEffectsWhenAccessedAtPath(path, innerOptions.addAccessedReturnExpressionAtPath(path, _this));
            }; }, options));
    };
    CallExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        var _this = this;
        return (!options.hasReturnExpressionBeenAssignedAtPath(path, this) &&
            this.callee.someReturnExpressionWhenCalledAtPath([], this._callOptions, function (innerOptions) { return function (node) {
                return node.hasEffectsWhenAssignedAtPath(path, innerOptions.addAssignedReturnExpressionAtPath(path, _this));
            }; }, options));
    };
    CallExpression.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        var _this = this;
        return (!options.hasReturnExpressionBeenCalledAtPath(path, this) &&
            this.callee.someReturnExpressionWhenCalledAtPath([], this._callOptions, function (innerOptions) { return function (node) {
                return node.hasEffectsWhenCalledAtPath(path, callOptions, innerOptions.addCalledReturnExpressionAtPath(path, _this));
            }; }, options));
    };
    CallExpression.prototype.initialiseNode = function () {
        this._callOptions = CallOptions.create({
            withNew: false,
            args: this.arguments,
            callIdentifier: this
        });
    };
    CallExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return this.callee.someReturnExpressionWhenCalledAtPath([], this._callOptions, function (innerOptions) { return function (node) {
            return node.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, innerOptions);
        }; }, options);
    };
    return CallExpression;
}(NodeBase));

var CatchScope = /** @class */ (function (_super) {
    __extends(CatchScope, _super);
    function CatchScope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CatchScope.prototype.addDeclaration = function (identifier, options) {
        if (options === void 0) { options = {
            isHoisted: false
        }; }
        if (options.isHoisted) {
            return this.parent.addDeclaration(identifier, options);
        }
        else {
            return _super.prototype.addDeclaration.call(this, identifier, options);
        }
    };
    return CatchScope;
}(ParameterScope));

var CatchClause = /** @class */ (function (_super) {
    __extends(CatchClause, _super);
    function CatchClause() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CatchClause.prototype.initialiseChildren = function () {
        this.param && this.param.initialiseAndDeclare(this.scope, 'parameter', null);
        this.body.initialiseAndReplaceScope(this.scope);
    };
    CatchClause.prototype.initialiseScope = function (parentScope) {
        this.scope = new CatchScope({ parent: parentScope });
    };
    return CatchClause;
}(NodeBase));

var ClassBody = /** @class */ (function (_super) {
    __extends(ClassBody, _super);
    function ClassBody() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassBody.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (path.length > 0) {
            return true;
        }
        return (this.classConstructor &&
            this.classConstructor.hasEffectsWhenCalledAtPath([], callOptions, options));
    };
    ClassBody.prototype.initialiseNode = function () {
        this.classConstructor = this.body.find(function (method) { return method.kind === 'constructor'; });
    };
    return ClassBody;
}(NodeBase));

var ClassNode = /** @class */ (function (_super) {
    __extends(ClassNode, _super);
    function ClassNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassNode.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 1;
    };
    ClassNode.prototype.hasEffectsWhenAssignedAtPath = function (path, _options) {
        return path.length > 1;
    };
    ClassNode.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return (this.body.hasEffectsWhenCalledAtPath(path, callOptions, options) ||
            (this.superClass && this.superClass.hasEffectsWhenCalledAtPath(path, callOptions, options)));
    };
    ClassNode.prototype.initialiseChildren = function (_parentScope) {
        if (this.superClass) {
            this.superClass.initialise(this.scope);
        }
        this.body.initialise(this.scope);
    };
    ClassNode.prototype.initialiseScope = function (parentScope) {
        this.scope = new Scope({ parent: parentScope });
    };
    return ClassNode;
}(NodeBase));

function isClassDeclaration(node) {
    return node.type === NodeType.ClassDeclaration;
}
var ClassDeclaration = /** @class */ (function (_super) {
    __extends(ClassDeclaration, _super);
    function ClassDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassDeclaration.prototype.initialiseChildren = function (parentScope) {
        // Class declarations are like let declarations: Not hoisted, can be reassigned, cannot be redeclared
        if (this.id) {
            this.id.initialiseAndDeclare(parentScope, 'class', this);
            this.id.variable.isId = true;
        }
        _super.prototype.initialiseChildren.call(this, parentScope);
    };
    ClassDeclaration.prototype.render = function (code, options) {
        if (options.systemBindings && this.id && this.id.variable.exportName) {
            code.appendLeft(this.end, " exports('" + this.id.variable.exportName + "', " + this.id.variable.getName() + ");");
        }
        if (this.id) {
            var name = this.id.variable.getName();
            if (name !== this.id.variable.name) {
                code.appendRight(this.start, "let " + this.id.variable.safeName + " = ");
                code.prependLeft(this.end, ';');
            }
        }
        _super.prototype.render.call(this, code, options);
    };
    return ClassDeclaration;
}(ClassNode));

var ClassExpression = /** @class */ (function (_super) {
    __extends(ClassExpression, _super);
    function ClassExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassExpression.prototype.initialiseChildren = function (parentScope) {
        this.id && this.id.initialiseAndDeclare(this.scope, 'class', this);
        _super.prototype.initialiseChildren.call(this, parentScope);
    };
    ClassExpression.prototype.reassignPath = function (_path, _options) { };
    return ClassExpression;
}(ClassNode));

var ConditionalExpression = /** @class */ (function (_super) {
    __extends(ConditionalExpression, _super);
    function ConditionalExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConditionalExpression.prototype.reassignPath = function (path, options) {
        path.length > 0 && this.forEachRelevantBranch(function (node) { return node.reassignPath(path, options); });
    };
    ConditionalExpression.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        this.forEachRelevantBranch(function (node) {
            return node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
        });
    };
    ConditionalExpression.prototype.getValue = function () {
        var testValue = this.test.getValue();
        if (testValue === UNKNOWN_VALUE)
            return UNKNOWN_VALUE;
        return testValue ? this.consequent.getValue() : this.alternate.getValue();
    };
    ConditionalExpression.prototype.hasEffects = function (options) {
        return (this.test.hasEffects(options) || this.someRelevantBranch(function (node) { return node.hasEffects(options); }));
    };
    ConditionalExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return (path.length > 0 &&
            this.someRelevantBranch(function (node) { return node.hasEffectsWhenAccessedAtPath(path, options); }));
    };
    ConditionalExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (path.length === 0 ||
            this.someRelevantBranch(function (node) { return node.hasEffectsWhenAssignedAtPath(path, options); }));
    };
    ConditionalExpression.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return this.someRelevantBranch(function (node) {
            return node.hasEffectsWhenCalledAtPath(path, callOptions, options);
        });
    };
    ConditionalExpression.prototype.initialiseChildren = function (parentScope) {
        _super.prototype.initialiseChildren.call(this, parentScope);
        if (this.module.graph.treeshake) {
            this.testValue = this.test.getValue();
            if (this.testValue === UNKNOWN_VALUE) {
                return;
            }
            else if (this.testValue) {
                this.alternate = null;
            }
            else if (this.alternate) {
                this.consequent = null;
            }
        }
    };
    ConditionalExpression.prototype.render = function (code, options) {
        if (!this.module.graph.treeshake) {
            _super.prototype.render.call(this, code, options);
        }
        else {
            if (this.testValue === UNKNOWN_VALUE) {
                _super.prototype.render.call(this, code, options);
            }
            else {
                var branchToRetain = this.testValue ? this.consequent : this.alternate;
                code.remove(this.start, branchToRetain.start);
                code.remove(branchToRetain.end, this.end);
                if (branchToRetain.type === NodeType.SequenceExpression) {
                    code.prependLeft(branchToRetain.start, '(');
                    code.appendRight(branchToRetain.end, ')');
                }
                branchToRetain.render(code, options);
            }
        }
    };
    ConditionalExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return this.someRelevantBranch(function (node) {
            return node.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options);
        });
    };
    ConditionalExpression.prototype.forEachRelevantBranch = function (callback) {
        if (this.testValue === UNKNOWN_VALUE) {
            callback(this.consequent);
            callback(this.alternate);
        }
        else {
            this.testValue ? callback(this.consequent) : callback(this.alternate);
        }
    };
    ConditionalExpression.prototype.someRelevantBranch = function (predicateFunction) {
        return this.testValue === UNKNOWN_VALUE
            ? predicateFunction(this.consequent) || predicateFunction(this.alternate)
            : this.testValue ? predicateFunction(this.consequent) : predicateFunction(this.alternate);
    };
    return ConditionalExpression;
}(NodeBase));

var DoWhileStatement = /** @class */ (function (_super) {
    __extends(DoWhileStatement, _super);
    function DoWhileStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DoWhileStatement.prototype.hasEffects = function (options) {
        return (this.test.hasEffects(options) || this.body.hasEffects(options.setIgnoreBreakStatements()));
    };
    return DoWhileStatement;
}(NodeBase));

var EmptyStatement = /** @class */ (function (_super) {
    __extends(EmptyStatement, _super);
    function EmptyStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmptyStatement.prototype.render = function (code, _options) {
        if (this.parent.type === NodeType.BlockStatement || this.parent.type === NodeType.Program) {
            code.remove(this.start, this.end);
        }
    };
    return EmptyStatement;
}(NodeBase));

var ExportAllDeclaration = /** @class */ (function (_super) {
    __extends(ExportAllDeclaration, _super);
    function ExportAllDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExportAllDeclaration.prototype.render = function (code, _options, _a) {
        var _b = _a === void 0 ? BLANK : _a, start = _b.start, end = _b.end;
        code.remove(start, end);
    };
    return ExportAllDeclaration;
}(NodeBase));
ExportAllDeclaration.prototype.needsBoundaries = true;
ExportAllDeclaration.prototype.isExportDeclaration = true;

var getParameterVariable = function (path, options) {
    var firstArgNum = parseInt(path[0], 10);
    return ((firstArgNum < options.getArgumentsVariables().length &&
        options.getArgumentsVariables()[firstArgNum]) ||
        UNKNOWN_EXPRESSION);
};
var ArgumentsVariable = /** @class */ (function (_super) {
    __extends(ArgumentsVariable, _super);
    function ArgumentsVariable(parameters) {
        var _this = _super.call(this, 'arguments', null, UNKNOWN_EXPRESSION) || this;
        _this._parameters = parameters;
        return _this;
    }
    ArgumentsVariable.prototype.reassignPath = function (path, options) {
        var firstArgNum = parseInt(path[0], 10);
        if (path.length > 0) {
            if (firstArgNum >= 0 && this._parameters[firstArgNum]) {
                this._parameters[firstArgNum].reassignPath(path.slice(1), options);
            }
        }
    };
    ArgumentsVariable.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return (path.length > 1 &&
            getParameterVariable(path, options).hasEffectsWhenAccessedAtPath(path.slice(1), options));
    };
    ArgumentsVariable.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (path.length === 0 ||
            this.included ||
            getParameterVariable(path, options).hasEffectsWhenAssignedAtPath(path.slice(1), options));
    };
    ArgumentsVariable.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (path.length === 0) {
            return true;
        }
        return getParameterVariable(path, options).hasEffectsWhenCalledAtPath(path.slice(1), callOptions, options);
    };
    ArgumentsVariable.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (path.length === 0) {
            return true;
        }
        return getParameterVariable(path, options).someReturnExpressionWhenCalledAtPath(path.slice(1), callOptions, predicateFunction, options);
    };
    return ArgumentsVariable;
}(LocalVariable));

var ThisVariable = /** @class */ (function (_super) {
    __extends(ThisVariable, _super);
    function ThisVariable() {
        return _super.call(this, 'this', null) || this;
    }
    return ThisVariable;
}(ReplaceableInitializationVariable));

var FunctionScope = /** @class */ (function (_super) {
    __extends(FunctionScope, _super);
    function FunctionScope(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, options) || this;
        _this.variables.arguments = new ArgumentsVariable(_super.prototype.getParameterVariables.call(_this));
        _this.variables.this = new ThisVariable();
        return _this;
    }
    FunctionScope.prototype.findLexicalBoundary = function () {
        return this;
    };
    FunctionScope.prototype.getOptionsWhenCalledWith = function (_a, options) {
        var _this = this;
        var args = _a.args, withNew = _a.withNew;
        return options
            .replaceVariableInit(this.variables.this, withNew ? UNKNOWN_OBJECT_EXPRESSION : UNKNOWN_EXPRESSION)
            .setArgumentsVariables(args.map(function (parameter, index) { return _super.prototype.getParameterVariables.call(_this)[index] || parameter; }));
    };
    return FunctionScope;
}(ReturnValueScope));

var FunctionNode = /** @class */ (function (_super) {
    __extends(FunctionNode, _super);
    function FunctionNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FunctionNode.prototype.bindNode = function () {
        this.body.bindImplicitReturnExpressionToScope();
    };
    FunctionNode.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        path.length === 0 &&
            this.scope.forEachReturnExpressionWhenCalled(callOptions, callback, options);
    };
    FunctionNode.prototype.hasEffects = function (options) {
        return this.id && this.id.hasEffects(options);
    };
    FunctionNode.prototype.hasEffectsWhenAccessedAtPath = function (path) {
        if (path.length <= 1) {
            return false;
        }
        if (path[0] === 'prototype') {
            return path.length > 2;
        }
        return true;
    };
    FunctionNode.prototype.hasEffectsWhenAssignedAtPath = function (path) {
        if (path.length <= 1) {
            return false;
        }
        if (path[0] === 'prototype') {
            return path.length > 2;
        }
        return true;
    };
    FunctionNode.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (path.length > 0) {
            return true;
        }
        var innerOptions = this.scope.getOptionsWhenCalledWith(callOptions, options);
        return (this.params.some(function (param) { return param.hasEffects(innerOptions); }) ||
            this.body.hasEffects(innerOptions));
    };
    FunctionNode.prototype.includeInBundle = function () {
        this.scope.variables.arguments.includeVariable();
        return _super.prototype.includeInBundle.call(this);
    };
    FunctionNode.prototype.initialiseScope = function (parentScope) {
        this.scope = new FunctionScope({ parent: parentScope });
    };
    FunctionNode.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return (path.length > 0 ||
            this.scope.someReturnExpressionWhenCalled(callOptions, predicateFunction, options));
    };
    return FunctionNode;
}(NodeBase));

function isFunctionDeclaration(node) {
    return node.type === NodeType.FunctionDeclaration;
}
var FunctionDeclaration = /** @class */ (function (_super) {
    __extends(FunctionDeclaration, _super);
    function FunctionDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FunctionDeclaration.prototype.initialiseChildren = function (parentScope) {
        var _this = this;
        if (this.id !== null) {
            this.id.initialiseAndDeclare(parentScope, 'function', this);
            this.id.variable.isId = true;
        }
        this.params.forEach(function (param) { return param.initialiseAndDeclare(_this.scope, 'parameter', null); });
        this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
    };
    return FunctionDeclaration;
}(FunctionNode));

var PROPERTY_KINDS_READ = ['init', 'get'];
var PROPERTY_KINDS_WRITE = ['init', 'set'];
function isObjectExpression(node) {
    return node.type === NodeType.ObjectExpression;
}
var ObjectExpression = /** @class */ (function (_super) {
    __extends(ObjectExpression, _super);
    function ObjectExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ObjectExpression.prototype.reassignPath = function (path, options) {
        if (path.length === 0)
            return;
        var _a = this._getPossiblePropertiesWithName(path[0], path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ), properties = _a.properties, hasCertainHit = _a.hasCertainHit;
        (path.length === 1 || hasCertainHit) &&
            properties.forEach(function (property) {
                return (path.length > 1 || property.kind === 'set') &&
                    property.reassignPath(path.slice(1), options);
            });
    };
    ObjectExpression.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        if (path.length === 0)
            return;
        var _a = this._getPossiblePropertiesWithName(path[0], PROPERTY_KINDS_READ), properties = _a.properties, hasCertainHit = _a.hasCertainHit;
        hasCertainHit &&
            properties.forEach(function (property) {
                return property.forEachReturnExpressionWhenCalledAtPath(path.slice(1), callOptions, callback, options);
            });
    };
    ObjectExpression.prototype._getPossiblePropertiesWithName = function (name, kinds) {
        if (name === UNKNOWN_KEY) {
            return { properties: this.properties, hasCertainHit: false };
        }
        var properties = [];
        var hasCertainHit = false;
        for (var index = this.properties.length - 1; index >= 0; index--) {
            var property = this.properties[index];
            if (kinds.indexOf(property.kind) < 0)
                continue;
            if (property.computed) {
                properties.push(property);
            }
            else if (property.key.name === name) {
                properties.push(property);
                hasCertainHit = true;
                break;
            }
        }
        return { properties: properties, hasCertainHit: hasCertainHit };
    };
    ObjectExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        if (path.length === 0)
            return false;
        var _a = this._getPossiblePropertiesWithName(path[0], PROPERTY_KINDS_READ), properties = _a.properties, hasCertainHit = _a.hasCertainHit;
        return ((path.length > 1 && !hasCertainHit) ||
            properties.some(function (property) { return property.hasEffectsWhenAccessedAtPath(path.slice(1), options); }));
    };
    ObjectExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        if (path.length === 0)
            return false;
        var _a = this._getPossiblePropertiesWithName(path[0], path.length === 1 ? PROPERTY_KINDS_WRITE : PROPERTY_KINDS_READ), properties = _a.properties, hasCertainHit = _a.hasCertainHit;
        return ((path.length > 1 && !hasCertainHit) ||
            properties.some(function (property) {
                return (path.length > 1 || property.kind === 'set') &&
                    property.hasEffectsWhenAssignedAtPath(path.slice(1), options);
            }));
    };
    ObjectExpression.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (path.length === 0)
            return true;
        var subPath = path[0];
        if (path.length === 1 && !isUnknownKey(subPath) && objectMembers[subPath]) {
            return false;
        }
        var _a = this._getPossiblePropertiesWithName(path[0], PROPERTY_KINDS_READ), properties = _a.properties, hasCertainHit = _a.hasCertainHit;
        return (!hasCertainHit ||
            properties.some(function (property) {
                return property.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, options);
            }));
    };
    ObjectExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (path.length === 0)
            return true;
        var subPath = path[0];
        if (path.length === 1 && !isUnknownKey(subPath) && objectMembers[subPath]) {
            return predicateFunction(options)(objectMembers[subPath].returns);
        }
        var _a = this._getPossiblePropertiesWithName(subPath, PROPERTY_KINDS_READ), properties = _a.properties, hasCertainHit = _a.hasCertainHit;
        return (!hasCertainHit ||
            properties.some(function (property) {
                return property.someReturnExpressionWhenCalledAtPath(path.slice(1), callOptions, predicateFunction, options);
            }));
    };
    return ObjectExpression;
}(NodeBase));

var WHITESPACE = /\s/;
// The header ends at the first non-white-space after "default"
function getDeclarationStart(code, start) {
    if (start === void 0) { start = 0; }
    start = findFirstOccurrenceOutsideComment(code, 'default', start) + 7;
    while (WHITESPACE.test(code[start]))
        start++;
    return start;
}
function getIdInsertPosition(code, declarationKeyword, start) {
    if (start === void 0) { start = 0; }
    var declarationEnd = findFirstOccurrenceOutsideComment(code, declarationKeyword, start) + declarationKeyword.length;
    code = code.slice(declarationEnd, findFirstOccurrenceOutsideComment(code, '{', declarationEnd));
    var generatorStarPos = findFirstOccurrenceOutsideComment(code, '*');
    if (generatorStarPos === -1) {
        return declarationEnd;
    }
    return declarationEnd + generatorStarPos + 1;
}
var needsToBeWrapped = isObjectExpression;
var ExportDefaultDeclaration = /** @class */ (function (_super) {
    __extends(ExportDefaultDeclaration, _super);
    function ExportDefaultDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExportDefaultDeclaration.prototype.bindNode = function () {
        if (this.declarationName) {
            this.variable.setOriginalVariable(this.scope.findVariable(this.declarationName));
        }
    };
    ExportDefaultDeclaration.prototype.initialiseNode = function () {
        this.declarationName =
            (this.declaration.id &&
                this.declaration.id.name) ||
                this.declaration.name;
        this.variable = this.scope.addExportDefaultDeclaration(this.declarationName || this.module.basename(), this);
    };
    ExportDefaultDeclaration.prototype.render = function (code, options, _a) {
        var _b = _a === void 0 ? BLANK : _a, start = _b.start, end = _b.end;
        var declarationStart = getDeclarationStart(code.original, this.start);
        if (isFunctionDeclaration(this.declaration)) {
            this.renderNamedDeclaration(code, declarationStart, 'function', this.declaration.id === null, options);
        }
        else if (isClassDeclaration(this.declaration)) {
            this.renderNamedDeclaration(code, declarationStart, 'class', this.declaration.id === null, options);
        }
        else if (this.variable.referencesOriginal()) {
            // Remove altogether to prevent re-declaring the same variable
            if (options.systemBindings && this.variable.exportName) {
                code.overwrite(start, end, "exports('" + this.variable.exportName + "', " + this.variable.getName() + ");");
            }
            else {
                code.remove(start, end);
            }
            return;
        }
        else if (this.variable.included) {
            this.renderVariableDeclaration(code, declarationStart, options);
        }
        else {
            this.renderForSideEffectsOnly(code, declarationStart);
        }
        _super.prototype.render.call(this, code, options);
    };
    ExportDefaultDeclaration.prototype.renderNamedDeclaration = function (code, declarationStart, declarationKeyword, needsId, options) {
        var name = this.variable.getName();
        // Remove `export default`
        code.remove(this.start, declarationStart);
        if (needsId) {
            code.appendLeft(getIdInsertPosition(code.original, declarationKeyword, declarationStart), " " + name);
        }
        if (options.systemBindings &&
            isClassDeclaration(this.declaration) &&
            this.variable.exportName) {
            code.appendLeft(this.end, " exports('" + this.variable.exportName + "', " + name + ");");
        }
    };
    ExportDefaultDeclaration.prototype.renderVariableDeclaration = function (code, declarationStart, options) {
        var systemBinding = options.systemBindings && this.variable.exportName
            ? "exports('" + this.variable.exportName + "', "
            : '';
        code.overwrite(this.start, declarationStart, this.module.graph.varOrConst + " " + this.variable.getName() + " = " + systemBinding);
        if (systemBinding) {
            code.appendRight(code.original[this.end - 1] === ';' ? this.end - 1 : this.end, ')');
        }
    };
    ExportDefaultDeclaration.prototype.renderForSideEffectsOnly = function (code, declarationStart) {
        code.remove(this.start, declarationStart);
        if (needsToBeWrapped(this.declaration)) {
            code.appendLeft(declarationStart, '(');
            if (code.original[this.end - 1] === ';') {
                code.prependRight(this.end - 1, ')');
            }
            else {
                code.prependRight(this.end, ');');
            }
        }
    };
    return ExportDefaultDeclaration;
}(NodeBase));
ExportDefaultDeclaration.prototype.needsBoundaries = true;
ExportDefaultDeclaration.prototype.isExportDeclaration = true;

var ExportNamedDeclaration = /** @class */ (function (_super) {
    __extends(ExportNamedDeclaration, _super);
    function ExportNamedDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExportNamedDeclaration.prototype.bindChildren = function () {
        // Do not bind specifiers
        if (this.declaration)
            this.declaration.bind();
    };
    ExportNamedDeclaration.prototype.hasEffects = function (options) {
        return this.declaration && this.declaration.hasEffects(options);
    };
    ExportNamedDeclaration.prototype.render = function (code, options, _a) {
        var _b = _a === void 0 ? BLANK : _a, start = _b.start, end = _b.end;
        if (this.declaration === null) {
            code.remove(start, end);
        }
        else {
            code.remove(this.start, this.declaration.start);
            this.declaration.render(code, options, { start: start, end: end });
        }
    };
    return ExportNamedDeclaration;
}(NodeBase));
ExportNamedDeclaration.prototype.needsBoundaries = true;
ExportNamedDeclaration.prototype.isExportDeclaration = true;

var ExpressionStatement = /** @class */ (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExpressionStatement.prototype.initialiseNode = function (_parentScope) {
        if (this.directive && this.directive !== 'use strict' && this.parent.type === 'Program') {
            this.module.warn(
            // This is necessary, because either way (deleting or not) can lead to errors.
            {
                code: 'MODULE_LEVEL_DIRECTIVE',
                message: "Module level directives cause errors when bundled, '" + this.directive + "' was ignored."
            }, this.start);
        }
        return _super.prototype.initialiseNode.call(this, _parentScope);
    };
    ExpressionStatement.prototype.shouldBeIncluded = function () {
        if (this.directive && this.directive !== 'use strict')
            return this.parent.type !== 'Program';
        return _super.prototype.shouldBeIncluded.call(this);
    };
    ExpressionStatement.prototype.render = function (code, options) {
        _super.prototype.render.call(this, code, options);
        if (this.included)
            this.insertSemicolon(code);
    };
    return ExpressionStatement;
}(NodeBase));

var ForStatement = /** @class */ (function (_super) {
    __extends(ForStatement, _super);
    function ForStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ForStatement.prototype.hasEffects = function (options) {
        return ((this.init && this.init.hasEffects(options)) ||
            (this.test && this.test.hasEffects(options)) ||
            (this.update && this.update.hasEffects(options)) ||
            this.body.hasEffects(options.setIgnoreBreakStatements()));
    };
    ForStatement.prototype.initialiseChildren = function () {
        if (this.init)
            this.init.initialise(this.scope);
        if (this.test)
            this.test.initialise(this.scope);
        if (this.update)
            this.update.initialise(this.scope);
        this.body.initialise(this.scope);
    };
    ForStatement.prototype.initialiseScope = function (parentScope) {
        this.scope = new BlockScope({ parent: parentScope });
    };
    ForStatement.prototype.render = function (code, options) {
        if (this.init)
            this.init.render(code, options, NO_SEMICOLON);
        if (this.test)
            this.test.render(code, options, NO_SEMICOLON);
        if (this.update)
            this.update.render(code, options, NO_SEMICOLON);
        this.body.render(code, options);
    };
    return ForStatement;
}(NodeBase));

var ForInStatement = /** @class */ (function (_super) {
    __extends(ForInStatement, _super);
    function ForInStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ForInStatement.prototype.hasEffects = function (options) {
        return ((this.left &&
            (this.left.hasEffects(options) || this.left.hasEffectsWhenAssignedAtPath([], options))) ||
            (this.right && this.right.hasEffects(options)) ||
            this.body.hasEffects(options.setIgnoreBreakStatements()));
    };
    ForInStatement.prototype.initialiseChildren = function () {
        this.left.initialise(this.scope);
        this.right.initialise(this.scope.parent);
        this.body.initialiseAndReplaceScope
            ? this.body.initialiseAndReplaceScope(this.scope)
            : this.body.initialise(this.scope);
    };
    ForInStatement.prototype.includeInBundle = function () {
        var addedNewNodes = _super.prototype.includeInBundle.call(this);
        if (this.left.includeWithAllDeclaredVariables()) {
            addedNewNodes = true;
        }
        return addedNewNodes;
    };
    ForInStatement.prototype.initialiseScope = function (parentScope) {
        this.scope = new BlockScope({ parent: parentScope });
    };
    ForInStatement.prototype.render = function (code, options) {
        this.left.render(code, options, NO_SEMICOLON);
        this.right.render(code, options, NO_SEMICOLON);
        this.body.render(code, options);
    };
    return ForInStatement;
}(NodeBase));

var ForOfStatement = /** @class */ (function (_super) {
    __extends(ForOfStatement, _super);
    function ForOfStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ForOfStatement.prototype.bindNode = function () {
        this.left.reassignPath([], ExecutionPathOptions.create());
    };
    ForOfStatement.prototype.hasEffects = function (options) {
        return ((this.left &&
            (this.left.hasEffects(options) || this.left.hasEffectsWhenAssignedAtPath([], options))) ||
            (this.right && this.right.hasEffects(options)) ||
            this.body.hasEffects(options.setIgnoreBreakStatements()));
    };
    ForOfStatement.prototype.includeInBundle = function () {
        var addedNewNodes = _super.prototype.includeInBundle.call(this);
        if (this.left.includeWithAllDeclaredVariables()) {
            addedNewNodes = true;
        }
        return addedNewNodes;
    };
    ForOfStatement.prototype.initialiseChildren = function () {
        this.left.initialise(this.scope);
        this.right.initialise(this.scope.parent);
        this.body.initialiseAndReplaceScope
            ? this.body.initialiseAndReplaceScope(this.scope)
            : this.body.initialise(this.scope);
    };
    ForOfStatement.prototype.initialiseScope = function (parentScope) {
        this.scope = new BlockScope({ parent: parentScope });
    };
    ForOfStatement.prototype.render = function (code, options) {
        this.left.render(code, options, NO_SEMICOLON);
        this.right.render(code, options, NO_SEMICOLON);
        this.body.render(code, options);
    };
    return ForOfStatement;
}(NodeBase));

var FunctionExpression = /** @class */ (function (_super) {
    __extends(FunctionExpression, _super);
    function FunctionExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FunctionExpression.prototype.initialiseChildren = function () {
        var _this = this;
        this.id && this.id.initialiseAndDeclare(this.scope, 'function', this);
        this.params.forEach(function (param) { return param.initialiseAndDeclare(_this.scope, 'parameter', null); });
        this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
    };
    return FunctionExpression;
}(FunctionNode));

function isReassignedExportsMember(variable) {
    return (variable.safeName &&
        variable.safeName.indexOf('.') !== -1 &&
        variable.exportName &&
        variable.isReassigned);
}
function isVariableDeclaration(node) {
    return node.type === NodeType.VariableDeclaration;
}
var VariableDeclaration = /** @class */ (function (_super) {
    __extends(VariableDeclaration, _super);
    function VariableDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VariableDeclaration.prototype.reassignPath = function (_path, _options) {
        this.declarations.forEach(function (declarator) {
            return declarator.reassignPath([], ExecutionPathOptions.create());
        });
    };
    VariableDeclaration.prototype.hasEffectsWhenAssignedAtPath = function (_path, _options) {
        return false;
    };
    VariableDeclaration.prototype.includeWithAllDeclaredVariables = function () {
        var addedNewNodes = !this.included;
        this.included = true;
        this.declarations.forEach(function (declarator) {
            if (declarator.includeInBundle()) {
                addedNewNodes = true;
            }
        });
        return addedNewNodes;
    };
    VariableDeclaration.prototype.includeInBundle = function () {
        var addedNewNodes = !this.included;
        this.included = true;
        this.declarations.forEach(function (declarator) {
            if (declarator.shouldBeIncluded()) {
                if (declarator.includeInBundle()) {
                    addedNewNodes = true;
                }
            }
        });
        return addedNewNodes;
    };
    VariableDeclaration.prototype.initialiseChildren = function () {
        var _this = this;
        this.declarations.forEach(function (child) { return child.initialiseDeclarator(_this.scope, _this.kind); });
    };
    VariableDeclaration.prototype.render = function (code, options, nodeRenderOptions) {
        if (nodeRenderOptions === void 0) { nodeRenderOptions = BLANK; }
        if (this.declarations.every(function (declarator) {
            return declarator.included && (!declarator.id.variable || !declarator.id.variable.exportName);
        })) {
            for (var _i = 0, _a = this.declarations; _i < _a.length; _i++) {
                var declarator = _a[_i];
                declarator.render(code, options);
            }
            if (!nodeRenderOptions.isNoStatement &&
                code.original.charCodeAt(this.end - 1) !== 59 /*";"*/) {
                code.appendLeft(this.end, ';');
            }
        }
        else {
            this.renderReplacedDeclarations(code, options, nodeRenderOptions);
        }
    };
    VariableDeclaration.prototype.renderReplacedDeclarations = function (code, options, _a) {
        var _b = _a.start, start = _b === void 0 ? this.start : _b, _c = _a.end, end = _c === void 0 ? this.end : _c, isNoStatement = _a.isNoStatement;
        var separatedNodes = getCommaSeparatedNodesWithBoundaries(this.declarations, code, this.start + this.kind.length, this.end - (code.original.charCodeAt(this.end - 1) === 59 /*";"*/ ? 1 : 0));
        var actualContentEnd, renderedContentEnd;
        if (/\n\s*$/.test(code.slice(this.start, separatedNodes[0].start))) {
            renderedContentEnd = this.start + this.kind.length;
        }
        else {
            renderedContentEnd = separatedNodes[0].start;
        }
        var lastSeparatorPos = renderedContentEnd - 1;
        code.remove(this.start, lastSeparatorPos);
        var isInDeclaration = false;
        var hasRenderedContent = false;
        var separatorString = '', leadingString, nextSeparatorString;
        for (var _i = 0, separatedNodes_1 = separatedNodes; _i < separatedNodes_1.length; _i++) {
            var _d = separatedNodes_1[_i], node = _d.node, start_1 = _d.start, separator = _d.separator, contentEnd = _d.contentEnd, end_1 = _d.end;
            if (!node.included ||
                (isIdentifier(node.id) && isReassignedExportsMember(node.id.variable) && node.init === null)) {
                code.remove(start_1, end_1);
                continue;
            }
            leadingString = '';
            nextSeparatorString = '';
            if (isIdentifier(node.id) && isReassignedExportsMember(node.id.variable)) {
                if (hasRenderedContent) {
                    separatorString += ';';
                }
                isInDeclaration = false;
            }
            else {
                if (options.systemBindings &&
                    node.init !== null &&
                    isIdentifier(node.id) &&
                    node.id.variable.exportName) {
                    code.prependLeft(node.init.start, "exports('" + node.id.variable.exportName + "', ");
                    nextSeparatorString += ')';
                }
                if (isInDeclaration) {
                    separatorString += ',';
                }
                else {
                    if (hasRenderedContent) {
                        separatorString += ';';
                    }
                    leadingString += this.kind + " ";
                    isInDeclaration = true;
                }
            }
            if (renderedContentEnd === lastSeparatorPos + 1) {
                code.overwrite(lastSeparatorPos, renderedContentEnd, separatorString + leadingString);
            }
            else {
                code.overwrite(lastSeparatorPos, lastSeparatorPos + 1, separatorString);
                code.appendLeft(renderedContentEnd, leadingString);
            }
            node.render(code, options);
            actualContentEnd = contentEnd;
            renderedContentEnd = end_1;
            hasRenderedContent = true;
            lastSeparatorPos = separator;
            separatorString = nextSeparatorString;
        }
        if (hasRenderedContent) {
            this.renderDeclarationEnd(code, separatorString, lastSeparatorPos, actualContentEnd, renderedContentEnd, !isNoStatement);
        }
        else {
            code.remove(start, end);
        }
    };
    VariableDeclaration.prototype.renderDeclarationEnd = function (code, separatorString, lastSeparatorPos, actualContentEnd, renderedContentEnd, addSemicolon) {
        if (code.original.charCodeAt(this.end - 1) === 59 /*";"*/) {
            code.remove(this.end - 1, this.end);
        }
        if (addSemicolon) {
            separatorString += ';';
        }
        if (lastSeparatorPos !== null) {
            if (code.original.charCodeAt(actualContentEnd - 1) === 10 /*"\n"*/ &&
                (code.original.charCodeAt(this.end) === 10 /*"\n"*/ ||
                    code.original.charCodeAt(this.end) === 13) /*"\r"*/) {
                actualContentEnd--;
                if (code.original.charCodeAt(actualContentEnd) === 13 /*"\r"*/) {
                    actualContentEnd--;
                }
            }
            if (actualContentEnd === lastSeparatorPos + 1) {
                code.overwrite(lastSeparatorPos, renderedContentEnd, separatorString);
            }
            else {
                code.overwrite(lastSeparatorPos, lastSeparatorPos + 1, separatorString);
                code.remove(actualContentEnd, renderedContentEnd);
            }
        }
        else {
            code.appendLeft(renderedContentEnd, separatorString);
        }
        return separatorString;
    };
    return VariableDeclaration;
}(NodeBase));

// Statement types which may contain if-statements as direct children.
var statementsWithIfStatements = new Set([
    'DoWhileStatement',
    'ForInStatement',
    'ForOfStatement',
    'ForStatement',
    'IfStatement',
    'WhileStatement'
]);
function getHoistedVars(node, scope) {
    var hoistedVars = [];
    function visit(node) {
        if (isVariableDeclaration(node) && node.kind === 'var') {
            node.declarations.forEach(function (declarator) {
                declarator.init = null;
                declarator.initialise(scope);
                extractNames(declarator.id).forEach(function (name) {
                    if (hoistedVars.indexOf(name) < 0)
                        hoistedVars.push(name);
                });
            });
        }
        else if (!/Function/.test(node.type)) {
            node.eachChild(visit);
        }
    }
    visit(node);
    return hoistedVars;
}
var IfStatement = /** @class */ (function (_super) {
    __extends(IfStatement, _super);
    function IfStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IfStatement.prototype.initialiseChildren = function (parentScope) {
        _super.prototype.initialiseChildren.call(this, parentScope);
        if (this.module.graph.treeshake) {
            this.testValue = this.test.getValue();
            if (this.testValue === UNKNOWN_VALUE) {
                return;
            }
            if (this.testValue) {
                if (this.alternate) {
                    this.hoistedVars = getHoistedVars(this.alternate, this.scope);
                    this.alternate = null;
                }
            }
            else {
                this.hoistedVars = getHoistedVars(this.consequent, this.scope);
                this.consequent = null;
            }
        }
    };
    IfStatement.prototype.initialiseNode = function () {
        this.hoistedVars = [];
    };
    IfStatement.prototype.render = function (code, options) {
        var _this = this;
        if (this.module.graph.treeshake) {
            if (this.testValue === UNKNOWN_VALUE) {
                _super.prototype.render.call(this, code, options);
            }
            else {
                code.overwrite(this.test.start, this.test.end, JSON.stringify(this.testValue));
                // TODO if no block-scoped declarations, remove enclosing
                // curlies and dedent block (if there is a block)
                if (this.hoistedVars) {
                    var names = this.hoistedVars
                        .map(function (name) {
                        var variable = _this.scope.findVariable(name);
                        return variable.included ? variable.getName() : null;
                    })
                        .filter(Boolean);
                    if (names.length > 0) {
                        code.appendLeft(this.start, "var " + names.join(', ') + ";\n\n");
                    }
                }
                if (this.testValue) {
                    code.remove(this.start, this.consequent.start);
                    code.remove(this.consequent.end, this.end);
                    this.consequent.render(code, options);
                }
                else {
                    code.remove(this.start, this.alternate ? this.alternate.start : this.end);
                    if (this.alternate) {
                        this.alternate.render(code, options);
                    }
                    else if (statementsWithIfStatements.has(this.parent.type)) {
                        code.prependRight(this.start, '{}');
                    }
                }
            }
        }
        else {
            _super.prototype.render.call(this, code, options);
        }
    };
    IfStatement.prototype.shouldBeIncluded = function () {
        return this.hoistedVars.length > 0 || _super.prototype.shouldBeIncluded.call(this);
    };
    return IfStatement;
}(NodeBase));

var Import = /** @class */ (function (_super) {
    __extends(Import, _super);
    function Import() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Import.prototype.setResolution = function (resolution, interop) {
        this.resolution = resolution;
        this.resolutionInterop = interop;
    };
    Import.prototype.render = function (code, options) {
        // if we have the module in the chunk, inline as Promise.resolve(namespace)
        if (this.resolution instanceof NamespaceVariable) {
            // ideally this should be handled like normal tree shaking
            this.resolution.includeVariable();
            code.overwrite(this.parent.start, this.parent.arguments[0].start, 'Promise.resolve().then(function () { return ');
            code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, this.resolution.getName());
            code.overwrite(this.parent.arguments[0].end, this.parent.end, '; })');
        }
        else {
            if (options.importMechanism) {
                var leftMechanism = (this.resolutionInterop && options.importMechanism.interopLeft) ||
                    options.importMechanism.left;
                code.overwrite(this.parent.start, this.parent.arguments[0].start, leftMechanism);
            }
            if (this.resolution) {
                code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, this.resolution);
            }
            if (options.importMechanism) {
                var rightMechanism = (this.resolutionInterop && options.importMechanism.interopRight) ||
                    options.importMechanism.right;
                code.overwrite(this.parent.arguments[0].end, this.parent.end, rightMechanism);
            }
        }
    };
    return Import;
}(NodeBase));

var ImportDeclaration = /** @class */ (function (_super) {
    __extends(ImportDeclaration, _super);
    function ImportDeclaration() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImportDeclaration.prototype.bindChildren = function () { };
    ImportDeclaration.prototype.render = function (code, _options, _a) {
        var _b = _a === void 0 ? BLANK : _a, start = _b.start, end = _b.end;
        code.remove(start, end);
    };
    return ImportDeclaration;
}(NodeBase));
ImportDeclaration.prototype.isImportDeclaration = true;
ImportDeclaration.prototype.needsBoundaries = true;

var LabeledStatement = /** @class */ (function (_super) {
    __extends(LabeledStatement, _super);
    function LabeledStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LabeledStatement.prototype.hasEffects = function (options) {
        return this.body.hasEffects(options.setIgnoreLabel(this.label.name).setIgnoreBreakStatements());
    };
    return LabeledStatement;
}(NodeBase));

function isLiteral(node) {
    return node.type === NodeType.Literal;
}
var Literal = /** @class */ (function (_super) {
    __extends(Literal, _super);
    function Literal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Literal.prototype.getValue = function () {
        return this.value;
    };
    Literal.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        if (this.value === null) {
            return path.length > 0;
        }
        return path.length > 1;
    };
    Literal.prototype.hasEffectsWhenAssignedAtPath = function (path, _options) {
        return path.length > 0;
    };
    Literal.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (path.length === 1) {
            return hasMemberEffectWhenCalled(this.members, path[0], callOptions, options);
        }
        return true;
    };
    Literal.prototype.initialiseNode = function () {
        this.members = getLiteralMembersForValue(this.value);
    };
    Literal.prototype.render = function (code, _options) {
        if (typeof this.value === 'string') {
            code.indentExclusionRanges.push([this.start + 1, this.end - 1]); // TODO TypeScript: Awaiting MagicString PR
        }
    };
    Literal.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (path.length === 1) {
            return someMemberReturnExpressionWhenCalled(this.members, path[0], callOptions, predicateFunction, options);
        }
        return true;
    };
    return Literal;
}(NodeBase));

var LogicalExpression = /** @class */ (function (_super) {
    __extends(LogicalExpression, _super);
    function LogicalExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LogicalExpression.prototype.reassignPath = function (path, options) {
        path.length > 0 && this._forEachRelevantBranch(function (node) { return node.reassignPath(path, options); });
    };
    LogicalExpression.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        this._forEachRelevantBranch(function (node) {
            return node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
        });
    };
    LogicalExpression.prototype.getValue = function () {
        var leftValue = this.left.getValue();
        if (leftValue === UNKNOWN_VALUE)
            return UNKNOWN_VALUE;
        if ((leftValue && this.operator === '||') || (!leftValue && this.operator === '&&')) {
            return leftValue;
        }
        return this.right.getValue();
    };
    LogicalExpression.prototype.hasEffects = function (options) {
        var leftValue = this.left.getValue();
        return (this.left.hasEffects(options) ||
            ((leftValue === UNKNOWN_VALUE ||
                (!leftValue && this.operator === '||') ||
                (leftValue && this.operator === '&&')) &&
                this.right.hasEffects(options)));
    };
    LogicalExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return (path.length > 0 &&
            this._someRelevantBranch(function (node) { return node.hasEffectsWhenAccessedAtPath(path, options); }));
    };
    LogicalExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (path.length === 0 ||
            this._someRelevantBranch(function (node) { return node.hasEffectsWhenAssignedAtPath(path, options); }));
    };
    LogicalExpression.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return this._someRelevantBranch(function (node) {
            return node.hasEffectsWhenCalledAtPath(path, callOptions, options);
        });
    };
    LogicalExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        return this._someRelevantBranch(function (node) {
            return node.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options);
        });
    };
    LogicalExpression.prototype._forEachRelevantBranch = function (callback) {
        var leftValue = this.left.getValue();
        if (leftValue === UNKNOWN_VALUE) {
            callback(this.left);
            callback(this.right);
        }
        else if ((leftValue && this.operator === '||') || (!leftValue && this.operator === '&&')) {
            callback(this.left);
        }
        else {
            callback(this.right);
        }
    };
    LogicalExpression.prototype._someRelevantBranch = function (predicateFunction) {
        var leftValue = this.left.getValue();
        if (leftValue === UNKNOWN_VALUE) {
            return predicateFunction(this.left) || predicateFunction(this.right);
        }
        if ((leftValue && this.operator === '||') || (!leftValue && this.operator === '&&')) {
            return predicateFunction(this.left);
        }
        return predicateFunction(this.right);
    };
    return LogicalExpression;
}(NodeBase));

function relativeId(id) {
    if (typeof process === 'undefined' || !isAbsolute(id))
        return id;
    return relative(process.cwd(), id);
}

function isExternalVariable(variable) {
    return variable.isExternal;
}
var ExternalVariable = /** @class */ (function (_super) {
    __extends(ExternalVariable, _super);
    function ExternalVariable(module, name) {
        var _this = _super.call(this, name) || this;
        _this.module = module;
        _this.isExternal = true;
        _this.isNamespace = name === '*';
        return _this;
    }
    ExternalVariable.prototype.addReference = function (identifier) {
        if (this.name === 'default' || this.name === '*') {
            this.module.suggestName(identifier.name);
        }
    };
    ExternalVariable.prototype.includeVariable = function () {
        if (this.included) {
            return false;
        }
        this.included = true;
        this.module.used = true;
        return true;
    };
    return ExternalVariable;
}(Variable));

var validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function getPropertyKey(memberExpression) {
    return memberExpression.computed
        ? getComputedPropertyKey(memberExpression.property)
        : memberExpression.property.name;
}
function getComputedPropertyKey(propertyKey) {
    if (isLiteral(propertyKey)) {
        var key = String(propertyKey.value);
        return validProp.test(key) ? key : UNKNOWN_KEY;
    }
    return UNKNOWN_KEY;
}
function getPathIfNotComputed(memberExpression) {
    var nextPathKey = memberExpression.propertyKey;
    var object = memberExpression.object;
    if (isUnknownKey(nextPathKey)) {
        return null;
    }
    if (isIdentifier(object)) {
        return [
            { key: object.name, pos: object.start },
            { key: nextPathKey, pos: memberExpression.property.start }
        ];
    }
    if (isMemberExpression(object)) {
        var parentPath = getPathIfNotComputed(object);
        return (parentPath && parentPath.concat([{ key: nextPathKey, pos: memberExpression.property.start }]));
    }
    return null;
}
function isMemberExpression(node) {
    return node.type === NodeType.MemberExpression;
}
var MemberExpression = /** @class */ (function (_super) {
    __extends(MemberExpression, _super);
    function MemberExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MemberExpression.prototype.bind = function () {
        this.isBound = true;
        var path = getPathIfNotComputed(this);
        var baseVariable = path && this.scope.findVariable(path[0].key);
        if (baseVariable && isNamespaceVariable(baseVariable)) {
            var resolvedVariable = this.resolveNamespaceVariables(baseVariable, path.slice(1));
            if (!resolvedVariable) {
                this.bindChildren();
            }
            else if (typeof resolvedVariable === 'string') {
                this.replacement = resolvedVariable;
            }
            else {
                if (isExternalVariable(resolvedVariable) && resolvedVariable.module) {
                    resolvedVariable.module.suggestName(path[0].key);
                }
                this.variable = resolvedVariable;
            }
        }
        else {
            this.bindChildren();
        }
    };
    MemberExpression.prototype.resolveNamespaceVariables = function (baseVariable, path) {
        if (path.length === 0)
            return baseVariable;
        if (!isNamespaceVariable(baseVariable))
            return null;
        var exportName = path[0].key;
        var variable = baseVariable.module.traceExport(exportName);
        if (!variable) {
            this.module.warn({
                code: 'MISSING_EXPORT',
                missing: exportName,
                importer: relativeId(this.module.id),
                exporter: relativeId(baseVariable.module.id),
                message: "'" + exportName + "' is not exported by '" + relativeId(baseVariable.module.id) + "'",
                url: "https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module"
            }, path[0].pos);
            return 'undefined';
        }
        return this.resolveNamespaceVariables(variable, path.slice(1));
    };
    MemberExpression.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        if (!this.isBound)
            this.bind();
        if (this.variable) {
            this.variable.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
        }
        else {
            this.object.forEachReturnExpressionWhenCalledAtPath([this.propertyKey].concat(path), callOptions, callback, options);
        }
    };
    MemberExpression.prototype.hasEffects = function (options) {
        return (_super.prototype.hasEffects.call(this, options) ||
            (this.arePropertyReadSideEffectsChecked &&
                this.object.hasEffectsWhenAccessedAtPath([this.propertyKey], options)));
    };
    MemberExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        if (path.length === 0) {
            return false;
        }
        if (this.variable) {
            return this.variable.hasEffectsWhenAccessedAtPath(path, options);
        }
        return this.object.hasEffectsWhenAccessedAtPath([this.propertyKey].concat(path), options);
    };
    MemberExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        if (this.variable) {
            return this.variable.hasEffectsWhenAssignedAtPath(path, options);
        }
        return this.object.hasEffectsWhenAssignedAtPath([this.propertyKey].concat(path), options);
    };
    MemberExpression.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        if (this.variable) {
            return this.variable.hasEffectsWhenCalledAtPath(path, callOptions, options);
        }
        return (this.propertyKey === UNKNOWN_KEY ||
            this.object.hasEffectsWhenCalledAtPath([this.propertyKey].concat(path), callOptions, options));
    };
    MemberExpression.prototype.includeInBundle = function () {
        var addedNewNodes = _super.prototype.includeInBundle.call(this);
        if (this.variable && !this.variable.included) {
            this.variable.includeVariable();
            addedNewNodes = true;
        }
        return addedNewNodes;
    };
    MemberExpression.prototype.initialiseNode = function () {
        this.propertyKey = getPropertyKey(this);
        this.arePropertyReadSideEffectsChecked =
            this.module.graph.treeshake && this.module.graph.treeshakingOptions.propertyReadSideEffects;
    };
    MemberExpression.prototype.reassignPath = function (path, options) {
        if (!this.isBound)
            this.bind();
        if (path.length === 0)
            this.disallowNamespaceReassignment();
        if (this.variable) {
            this.variable.reassignPath(path, options);
        }
        else {
            this.object.reassignPath([this.propertyKey].concat(path), options);
        }
    };
    MemberExpression.prototype.disallowNamespaceReassignment = function () {
        if (isIdentifier(this.object) &&
            isNamespaceVariable(this.scope.findVariable(this.object.name))) {
            this.module.error({
                code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
                message: "Illegal reassignment to import '" + this.object.name + "'"
            }, this.start);
        }
    };
    MemberExpression.prototype.render = function (code, options) {
        if (this.variable) {
            code.overwrite(this.start, this.end, this.variable.getName(), {
                storeName: true,
                contentOnly: false
            });
        }
        else if (this.replacement) {
            code.overwrite(this.start, this.end, this.replacement, {
                storeName: true,
                contentOnly: false
            });
        }
        _super.prototype.render.call(this, code, options);
    };
    MemberExpression.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (this.variable) {
            return this.variable.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options);
        }
        return (getPropertyKey(this) === UNKNOWN_KEY ||
            this.object.someReturnExpressionWhenCalledAtPath([this.propertyKey].concat(path), callOptions, predicateFunction, options));
    };
    return MemberExpression;
}(NodeBase));

var MethodDefinition = /** @class */ (function (_super) {
    __extends(MethodDefinition, _super);
    function MethodDefinition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MethodDefinition.prototype.hasEffects = function (options) {
        return this.key.hasEffects(options);
    };
    MethodDefinition.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        return path.length > 0 || this.value.hasEffectsWhenCalledAtPath([], callOptions, options);
    };
    return MethodDefinition;
}(NodeBase));

var NewExpression = /** @class */ (function (_super) {
    __extends(NewExpression, _super);
    function NewExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NewExpression.prototype.hasEffects = function (options) {
        return (this.arguments.some(function (child) { return child.hasEffects(options); }) ||
            this.callee.hasEffectsWhenCalledAtPath([], this._callOptions, options.getHasEffectsWhenCalledOptions()));
    };
    NewExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 1;
    };
    NewExpression.prototype.initialiseNode = function () {
        this._callOptions = CallOptions.create({
            withNew: true,
            args: this.arguments,
            callIdentifier: this
        });
    };
    return NewExpression;
}(NodeBase));

var ObjectPattern = /** @class */ (function (_super) {
    __extends(ObjectPattern, _super);
    function ObjectPattern() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ObjectPattern.prototype.reassignPath = function (path, options) {
        path.length === 0 && this.properties.forEach(function (child) { return child.reassignPath(path, options); });
    };
    ObjectPattern.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return (path.length > 0 ||
            this.properties.some(function (child) { return child.hasEffectsWhenAssignedAtPath([], options); }));
    };
    ObjectPattern.prototype.initialiseAndDeclare = function (parentScope, kind, init) {
        this.initialiseScope(parentScope);
        this.properties.forEach(function (child) { return child.initialiseAndDeclare(parentScope, kind, init); });
    };
    return ObjectPattern;
}(NodeBase));

var Program = /** @class */ (function (_super) {
    __extends(Program, _super);
    function Program() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Program.prototype.render = function (code, options) {
        if (this.body.length) {
            renderStatementList(this.body, code, this.start, this.end, options);
        }
        else {
            _super.prototype.render.call(this, code, options);
        }
    };
    return Program;
}(NodeBase));

var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Property.prototype.reassignPath = function (path, options) {
        var _this = this;
        if (this.kind === 'get') {
            path.length > 0 &&
                this.value.forEachReturnExpressionWhenCalledAtPath([], this._accessorCallOptions, function (innerOptions) { return function (node) {
                    return node.reassignPath(path, innerOptions.addAssignedReturnExpressionAtPath(path, _this));
                }; }, options);
        }
        else if (this.kind !== 'set') {
            this.value.reassignPath(path, options);
        }
    };
    Property.prototype.forEachReturnExpressionWhenCalledAtPath = function (path, callOptions, callback, options) {
        if (this.kind === 'get') {
            this.value.forEachReturnExpressionWhenCalledAtPath([], this._accessorCallOptions, function (innerOptions) { return function (node) {
                return node.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, innerOptions);
            }; }, options);
        }
        else {
            this.value.forEachReturnExpressionWhenCalledAtPath(path, callOptions, callback, options);
        }
    };
    Property.prototype.hasEffects = function (options) {
        return this.key.hasEffects(options) || this.value.hasEffects(options);
    };
    Property.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        var _this = this;
        if (this.kind === 'get') {
            return (this.value.hasEffectsWhenCalledAtPath([], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions()) ||
                (!options.hasReturnExpressionBeenAccessedAtPath(path, this) &&
                    this.value.someReturnExpressionWhenCalledAtPath([], this._accessorCallOptions, function (innerOptions) { return function (node) {
                        return node.hasEffectsWhenAccessedAtPath(path, innerOptions.addAccessedReturnExpressionAtPath(path, _this));
                    }; }, options)));
        }
        return this.value.hasEffectsWhenAccessedAtPath(path, options);
    };
    Property.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        var _this = this;
        if (this.kind === 'get') {
            return (path.length === 0 ||
                this.value.someReturnExpressionWhenCalledAtPath([], this._accessorCallOptions, function (innerOptions) { return function (node) {
                    return node.hasEffectsWhenAssignedAtPath(path, innerOptions.addAssignedReturnExpressionAtPath(path, _this));
                }; }, options));
        }
        if (this.kind === 'set') {
            return (path.length > 0 ||
                this.value.hasEffectsWhenCalledAtPath([], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions()));
        }
        return this.value.hasEffectsWhenAssignedAtPath(path, options);
    };
    Property.prototype.hasEffectsWhenCalledAtPath = function (path, callOptions, options) {
        var _this = this;
        if (this.kind === 'get') {
            return (this.value.hasEffectsWhenCalledAtPath([], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions()) ||
                (!options.hasReturnExpressionBeenCalledAtPath(path, this) &&
                    this.value.someReturnExpressionWhenCalledAtPath([], this._accessorCallOptions, function (innerOptions) { return function (node) {
                        return node.hasEffectsWhenCalledAtPath(path, callOptions, innerOptions.addCalledReturnExpressionAtPath(path, _this));
                    }; }, options)));
        }
        return this.value.hasEffectsWhenCalledAtPath(path, callOptions, options);
    };
    Property.prototype.initialiseAndDeclare = function (parentScope, kind, _init) {
        this.initialiseScope(parentScope);
        this.initialiseNode(parentScope);
        this.key.initialise(parentScope);
        this.value.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION);
    };
    Property.prototype.initialiseNode = function (_parentScope) {
        this._accessorCallOptions = CallOptions.create({
            withNew: false,
            callIdentifier: this
        });
    };
    Property.prototype.render = function (code, options) {
        if (!this.shorthand) {
            this.key.render(code, options);
        }
        this.value.render(code, options);
    };
    Property.prototype.someReturnExpressionWhenCalledAtPath = function (path, callOptions, predicateFunction, options) {
        if (this.kind === 'get') {
            return (this.value.hasEffectsWhenCalledAtPath([], this._accessorCallOptions, options.getHasEffectsWhenCalledOptions()) ||
                this.value.someReturnExpressionWhenCalledAtPath([], this._accessorCallOptions, function (innerOptions) { return function (node) {
                    return node.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, innerOptions);
                }; }, options));
        }
        return this.value.someReturnExpressionWhenCalledAtPath(path, callOptions, predicateFunction, options);
    };
    return Property;
}(NodeBase));

var RestElement = /** @class */ (function (_super) {
    __extends(RestElement, _super);
    function RestElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RestElement.prototype.reassignPath = function (path, options) {
        path.length === 0 && this.argument.reassignPath([], options);
    };
    RestElement.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options);
    };
    RestElement.prototype.initialiseAndDeclare = function (parentScope, kind, _init) {
        this.initialiseScope(parentScope);
        this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION);
    };
    return RestElement;
}(NodeBase));

var ReturnStatement = /** @class */ (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReturnStatement.prototype.hasEffects = function (options) {
        return _super.prototype.hasEffects.call(this, options) || !options.ignoreReturnAwaitYield();
    };
    ReturnStatement.prototype.initialiseNode = function () {
        this.scope.addReturnExpression(this.argument || UNKNOWN_EXPRESSION);
    };
    return ReturnStatement;
}(NodeBase));

var SequenceExpression = /** @class */ (function (_super) {
    __extends(SequenceExpression, _super);
    function SequenceExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SequenceExpression.prototype.getValue = function () {
        return this.expressions[this.expressions.length - 1].getValue();
    };
    SequenceExpression.prototype.hasEffects = function (options) {
        return this.expressions.some(function (expression) { return expression.hasEffects(options); });
    };
    SequenceExpression.prototype.includeInBundle = function () {
        var addedNewNodes = !this.included;
        this.included = true;
        if (this.expressions[this.expressions.length - 1].includeInBundle()) {
            addedNewNodes = true;
        }
        this.expressions.forEach(function (node) {
            if (node.shouldBeIncluded()) {
                if (node.includeInBundle()) {
                    addedNewNodes = true;
                }
            }
        });
        return addedNewNodes;
    };
    SequenceExpression.prototype.render = function (code, options) {
        if (!this.module.graph.treeshake) {
            _super.prototype.render.call(this, code, options);
        }
        else {
            var last = this.expressions[this.expressions.length - 1];
            last.render(code, options);
            if (this.parent.type === NodeType.CallExpression &&
                last.type === NodeType.MemberExpression &&
                this.expressions.length > 1) {
                this.expressions[0].included = true;
            }
            var included = this.expressions
                .slice(0, this.expressions.length - 1)
                .filter(function (expression) { return expression.included; });
            if (included.length === 0) {
                code.remove(this.start, last.start);
                code.remove(last.end, this.end);
            }
            else {
                var previousEnd = this.start;
                for (var _i = 0, included_1 = included; _i < included_1.length; _i++) {
                    var expression = included_1[_i];
                    expression.render(code, options);
                    code.remove(previousEnd, expression.start);
                    code.appendLeft(expression.end, ', ');
                    previousEnd = expression.end;
                }
                code.remove(previousEnd, last.start);
                code.remove(last.end, this.end);
            }
        }
    };
    return SequenceExpression;
}(NodeBase));

var SwitchCase = /** @class */ (function (_super) {
    __extends(SwitchCase, _super);
    function SwitchCase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwitchCase.prototype.includeInBundle = function () {
        var addedNewNodes = !this.included;
        this.included = true;
        if (this.test && this.test.includeInBundle()) {
            addedNewNodes = true;
        }
        this.consequent.forEach(function (node) {
            if (node.shouldBeIncluded()) {
                if (node.includeInBundle()) {
                    addedNewNodes = true;
                }
            }
        });
        return addedNewNodes;
    };
    SwitchCase.prototype.render = function (code, options) {
        if (this.consequent.length) {
            this.test && this.test.render(code, options);
            var testEnd = this.test
                ? this.test.end
                : findFirstOccurrenceOutsideComment(code.original, 'default', this.start) + 7;
            var consequentStart = findFirstOccurrenceOutsideComment(code.original, ':', testEnd) + 1;
            renderStatementList(this.consequent, code, consequentStart, this.end, options);
        }
        else {
            _super.prototype.render.call(this, code, options);
        }
    };
    return SwitchCase;
}(NodeBase));

var SwitchStatement = /** @class */ (function (_super) {
    __extends(SwitchStatement, _super);
    function SwitchStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwitchStatement.prototype.hasEffects = function (options) {
        return _super.prototype.hasEffects.call(this, options.setIgnoreBreakStatements());
    };
    SwitchStatement.prototype.initialiseScope = function (parentScope) {
        this.scope = new BlockScope({ parent: parentScope });
    };
    return SwitchStatement;
}(NodeBase));

var TaggedTemplateExpression = /** @class */ (function (_super) {
    __extends(TaggedTemplateExpression, _super);
    function TaggedTemplateExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TaggedTemplateExpression.prototype.bindNode = function () {
        if (this.tag.type === NodeType.Identifier) {
            var variable = this.scope.findVariable(this.tag.name);
            if (isNamespaceVariable(variable)) {
                this.module.error({
                    code: 'CANNOT_CALL_NAMESPACE',
                    message: "Cannot call a namespace ('" + this.tag.name + "')"
                }, this.start);
            }
            if (this.tag.name === 'eval' && isGlobalVariable(variable)) {
                this.module.warn({
                    code: 'EVAL',
                    message: "Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification",
                    url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval'
                }, this.start);
            }
        }
    };
    TaggedTemplateExpression.prototype.hasEffects = function (options) {
        return (_super.prototype.hasEffects.call(this, options) ||
            this.tag.hasEffectsWhenCalledAtPath([], this._callOptions, options.getHasEffectsWhenCalledOptions()));
    };
    TaggedTemplateExpression.prototype.initialiseNode = function () {
        this._callOptions = CallOptions.create({
            withNew: false,
            callIdentifier: this
        });
    };
    return TaggedTemplateExpression;
}(NodeBase));

var TemplateElement = /** @class */ (function (_super) {
    __extends(TemplateElement, _super);
    function TemplateElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TemplateElement.prototype.hasEffects = function (_options) {
        return false;
    };
    return TemplateElement;
}(NodeBase));

function isTemplateLiteral(node) {
    return node.type === NodeType.TemplateLiteral;
}
var TemplateLiteral = /** @class */ (function (_super) {
    __extends(TemplateLiteral, _super);
    function TemplateLiteral() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TemplateLiteral.prototype.render = function (code, options) {
        code.indentExclusionRanges.push([this.start, this.end]); // TODO TypeScript: Awaiting PR
        _super.prototype.render.call(this, code, options);
    };
    return TemplateLiteral;
}(NodeBase));

var ThisExpression = /** @class */ (function (_super) {
    __extends(ThisExpression, _super);
    function ThisExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ThisExpression.prototype.initialiseNode = function () {
        var lexicalBoundary = this.scope.findLexicalBoundary();
        if (lexicalBoundary.isModuleScope) {
            this.alias = this.module.context;
            if (this.alias === 'undefined') {
                this.module.warn({
                    code: 'THIS_IS_UNDEFINED',
                    message: "The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten",
                    url: "https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined"
                }, this.start);
            }
        }
    };
    ThisExpression.prototype.bindNode = function () {
        this.variable = this.scope.findVariable('this');
    };
    ThisExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, options) {
        return path.length > 0 && this.variable.hasEffectsWhenAccessedAtPath(path, options);
    };
    ThisExpression.prototype.hasEffectsWhenAssignedAtPath = function (path, options) {
        return this.variable.hasEffectsWhenAssignedAtPath(path, options);
    };
    ThisExpression.prototype.render = function (code, _options) {
        if (this.alias) {
            code.overwrite(this.start, this.end, this.alias, {
                storeName: true,
                contentOnly: false
            });
        }
    };
    return ThisExpression;
}(NodeBase));

var ThrowStatement = /** @class */ (function (_super) {
    __extends(ThrowStatement, _super);
    function ThrowStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ThrowStatement.prototype.hasEffects = function (_options) {
        return true;
    };
    return ThrowStatement;
}(NodeBase));

var operators$1 = {
    '-': function (value) { return -value; },
    '+': function (value) { return +value; },
    '!': function (value) { return !value; },
    '~': function (value) { return ~value; },
    typeof: function (value) { return typeof value; },
    void: function () { return undefined; },
    delete: function () { return UNKNOWN_VALUE; }
};
var UnaryExpression = /** @class */ (function (_super) {
    __extends(UnaryExpression, _super);
    function UnaryExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnaryExpression.prototype.bindNode = function () {
        if (this.operator === 'delete') {
            this.argument.reassignPath([], ExecutionPathOptions.create());
        }
    };
    UnaryExpression.prototype.getValue = function () {
        var argumentValue = this.argument.getValue();
        if (argumentValue === UNKNOWN_VALUE)
            return UNKNOWN_VALUE;
        return operators$1[this.operator](argumentValue);
    };
    UnaryExpression.prototype.hasEffects = function (options) {
        return (this.argument.hasEffects(options) ||
            (this.operator === 'delete' && this.argument.hasEffectsWhenAssignedAtPath([], options)));
    };
    UnaryExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        if (this.operator === 'void') {
            return path.length > 0;
        }
        return path.length > 1;
    };
    UnaryExpression.prototype.initialiseNode = function () {
        this.value = this.getValue();
    };
    return UnaryExpression;
}(NodeBase));

var UpdateExpression = /** @class */ (function (_super) {
    __extends(UpdateExpression, _super);
    function UpdateExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UpdateExpression.prototype.bindNode = function () {
        this.argument.reassignPath([], ExecutionPathOptions.create());
        if (isIdentifier(this.argument)) {
            var variable = this.scope.findVariable(this.argument.name);
            variable.isReassigned = true;
        }
    };
    UpdateExpression.prototype.hasEffects = function (options) {
        return (this.argument.hasEffects(options) || this.argument.hasEffectsWhenAssignedAtPath([], options));
    };
    UpdateExpression.prototype.hasEffectsWhenAccessedAtPath = function (path, _options) {
        return path.length > 1;
    };
    return UpdateExpression;
}(NodeBase));

var VariableDeclarator = /** @class */ (function (_super) {
    __extends(VariableDeclarator, _super);
    function VariableDeclarator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VariableDeclarator.prototype.reassignPath = function (path, options) {
        this.id.reassignPath(path, options);
    };
    VariableDeclarator.prototype.initialiseDeclarator = function (parentScope, kind) {
        this.initialiseScope(parentScope);
        this.init && this.init.initialise(this.scope);
        this.id.initialiseAndDeclare(this.scope, kind, this.init);
    };
    return VariableDeclarator;
}(NodeBase));

var WhileStatement = /** @class */ (function (_super) {
    __extends(WhileStatement, _super);
    function WhileStatement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WhileStatement.prototype.hasEffects = function (options) {
        return (this.test.hasEffects(options) || this.body.hasEffects(options.setIgnoreBreakStatements()));
    };
    return WhileStatement;
}(NodeBase));

var YieldExpression = /** @class */ (function (_super) {
    __extends(YieldExpression, _super);
    function YieldExpression() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    YieldExpression.prototype.hasEffects = function (options) {
        return _super.prototype.hasEffects.call(this, options) || !options.ignoreReturnAwaitYield();
    };
    return YieldExpression;
}(NodeBase));

var nodes = {
    ArrayExpression: ArrayExpression,
    ArrayPattern: ArrayPattern,
    ArrowFunctionExpression: ArrowFunctionExpression,
    AssignmentExpression: AssignmentExpression,
    AssignmentPattern: AssignmentPattern,
    AwaitExpression: AwaitExpression,
    BinaryExpression: BinaryExpression,
    BlockStatement: BlockStatement,
    BreakStatement: BreakStatement,
    CallExpression: CallExpression,
    CatchClause: CatchClause,
    ClassBody: ClassBody,
    ClassDeclaration: ClassDeclaration,
    ClassExpression: ClassExpression,
    ConditionalExpression: ConditionalExpression,
    DoWhileStatement: DoWhileStatement,
    EmptyStatement: EmptyStatement,
    ExportAllDeclaration: ExportAllDeclaration,
    ExportDefaultDeclaration: ExportDefaultDeclaration,
    ExportNamedDeclaration: ExportNamedDeclaration,
    ExpressionStatement: ExpressionStatement,
    ForStatement: ForStatement,
    ForInStatement: ForInStatement,
    ForOfStatement: ForOfStatement,
    FunctionDeclaration: FunctionDeclaration,
    FunctionExpression: FunctionExpression,
    Identifier: Identifier,
    IfStatement: IfStatement,
    Import: Import,
    ImportDeclaration: ImportDeclaration,
    LabeledStatement: LabeledStatement,
    Literal: Literal,
    LogicalExpression: LogicalExpression,
    MemberExpression: MemberExpression,
    MethodDefinition: MethodDefinition,
    NewExpression: NewExpression,
    ObjectExpression: ObjectExpression,
    ObjectPattern: ObjectPattern,
    Program: Program,
    Property: Property,
    RestElement: RestElement,
    ReturnStatement: ReturnStatement,
    SequenceExpression: SequenceExpression,
    SwitchCase: SwitchCase,
    SwitchStatement: SwitchStatement,
    TaggedTemplateExpression: TaggedTemplateExpression,
    TemplateElement: TemplateElement,
    TemplateLiteral: TemplateLiteral,
    ThisExpression: ThisExpression,
    ThrowStatement: ThrowStatement,
    TryStatement: NodeBase,
    UnaryExpression: UnaryExpression,
    UpdateExpression: UpdateExpression,
    VariableDeclarator: VariableDeclarator,
    VariableDeclaration: VariableDeclaration,
    WhileStatement: WhileStatement,
    YieldExpression: YieldExpression
};

var UnknownNode = /** @class */ (function (_super) {
    __extends(UnknownNode, _super);
    function UnknownNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnknownNode.prototype.hasEffects = function (_options) {
        return true;
    };
    return UnknownNode;
}(NodeBase));

var keys$1 = {
    Program: ['body'],
    Literal: []
};

function enhance(ast, module, dynamicImportReturnList) {
    enhanceNode(ast, {}, module, module.magicString, dynamicImportReturnList);
    for (var _i = 0, _a = ast.body; _i < _a.length; _i++) {
        var node = _a[_i];
        node.initialise(module.scope);
    }
}
function isArrayOfNodes(raw) {
    return 'length' in raw;
}
function enhanceNode(raw, parent, module, code, dynamicImportReturnList) {
    if (!raw)
        return;
    if (isArrayOfNodes(raw)) {
        for (var i = 0; i < raw.length; i += 1) {
            enhanceNode(raw[i], parent, module, code, dynamicImportReturnList);
        }
        return;
    }
    var rawNode = raw;
    // with e.g. shorthand properties, key and value are
    // the same node. We don't want to enhance an object twice
    if (rawNode.__enhanced)
        return;
    rawNode.__enhanced = true;
    if (!keys$1[rawNode.type]) {
        keys$1[rawNode.type] = Object.keys(rawNode).filter(function (key) { return typeof rawNode[key] === 'object'; });
    }
    rawNode.parent = parent;
    rawNode.module = module;
    rawNode.keys = keys$1[rawNode.type];
    code.addSourcemapLocation(rawNode.start);
    code.addSourcemapLocation(rawNode.end);
    for (var _i = 0, _a = keys$1[rawNode.type]; _i < _a.length; _i++) {
        var key = _a[_i];
        enhanceNode(rawNode[key], rawNode, module, code, dynamicImportReturnList);
    }
    var type = nodes[rawNode.type] || UnknownNode;
    rawNode.__proto__ = type.prototype;
    if (type === Import) {
        dynamicImportReturnList.push(rawNode);
    }
}

function clone(node) {
    if (!node)
        return node;
    if (typeof node !== 'object')
        return node;
    if (Array.isArray(node)) {
        var cloned_1 = new Array(node.length);
        for (var i = 0; i < node.length; i += 1)
            cloned_1[i] = clone(node[i]);
        return cloned_1;
    }
    var cloned = {};
    for (var key in node) {
        cloned[key] = clone(node[key]);
    }
    return cloned;
}

var ModuleScope = /** @class */ (function (_super) {
    __extends(ModuleScope, _super);
    function ModuleScope(module) {
        var _this = _super.call(this, {
            isModuleScope: true,
            parent: module.graph.scope
        }) || this;
        _this.module = module;
        _this.variables.this = new LocalVariable('this', null, UNKNOWN_EXPRESSION);
        return _this;
    }
    ModuleScope.prototype.deshadow = function (names, children) {
        var _this = this;
        if (children === void 0) { children = this.children; }
        var localNames = new Set(names);
        forOwn(this.module.imports, function (specifier) {
            if (specifier.module.isExternal || specifier.module.chunk !== _this.module.chunk) {
                return;
            }
            var addDeclaration = function (declaration) {
                if (isNamespaceVariable(declaration) && !isExternalVariable(declaration)) {
                    declaration.module
                        .getExports()
                        .forEach(function (name) { return addDeclaration(declaration.module.traceExport(name)); });
                }
                localNames.add(declaration.getName());
            };
            specifier.module.getAllExports().forEach(function (name) {
                addDeclaration(specifier.module.traceExport(name));
            });
            if (specifier.name !== '*') {
                var declaration = specifier.module.traceExport(specifier.name);
                if (!declaration) {
                    _this.module.warn({
                        code: 'NON_EXISTENT_EXPORT',
                        name: specifier.name,
                        source: specifier.module.id,
                        message: "Non-existent export '" + specifier.name + "' is imported from " + relativeId(specifier.module.id)
                    }, specifier.specifier.start);
                    return;
                }
                var name = declaration.getName();
                if (name !== specifier.name) {
                    localNames.add(name);
                }
                if (specifier.name !== 'default' &&
                    specifier.specifier.imported.name !== specifier.specifier.local.name) {
                    localNames.add(specifier.specifier.imported.name);
                }
            }
        });
        _super.prototype.deshadow.call(this, localNames, children);
    };
    ModuleScope.prototype.findLexicalBoundary = function () {
        return this;
    };
    ModuleScope.prototype.findVariable = function (name) {
        if (this.variables[name]) {
            return this.variables[name];
        }
        return this.module.trace(name) || this.parent.findVariable(name);
    };
    return ModuleScope;
}(Scope));

var charToInteger$1 = {};
var integerToChar$1 = {};
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('').forEach(function (char, i) {
    charToInteger$1[char] = i;
    integerToChar$1[i] = char;
});
function decode$1(string) {
    var result = [];
    var shift = 0;
    var value = 0;
    for (var i = 0; i < string.length; i += 1) {
        var integer = charToInteger$1[string[i]];
        if (integer === undefined) {
            throw new Error('Invalid character (' + string[i] + ')');
        }
        var hasContinuationBit = integer & 32;
        integer &= 31;
        value += integer << shift;
        if (hasContinuationBit) {
            shift += 5;
        }
        else {
            var shouldNegate = value & 1;
            value >>= 1;
            result.push(shouldNegate ? -value : value);
            // reset
            value = shift = 0;
        }
    }
    return result;
}
function encode$1(value) {
    var result;
    if (typeof value === 'number') {
        result = encodeInteger$1(value);
    }
    else {
        result = '';
        for (var i = 0; i < value.length; i += 1) {
            result += encodeInteger$1(value[i]);
        }
    }
    return result;
}
function encodeInteger$1(num) {
    var result = '';
    if (num < 0) {
        num = (-num << 1) | 1;
    }
    else {
        num <<= 1;
    }
    do {
        var clamped = num & 31;
        num >>= 5;
        if (num > 0) {
            clamped |= 32;
        }
        result += integerToChar$1[clamped];
    } while (num > 0);
    return result;
}

function decodeSegments(encodedSegments) {
    var i = encodedSegments.length;
    var segments = new Array(i);
    while (i--)
        segments[i] = decode$1(encodedSegments[i]);
    return segments;
}
function decode$1$1(mappings) {
    var sourceFileIndex = 0; // second field
    var sourceCodeLine = 0; // third field
    var sourceCodeColumn = 0; // fourth field
    var nameIndex = 0; // fifth field
    var lines = mappings.split(';');
    var numLines = lines.length;
    var decoded = new Array(numLines);
    var i;
    var j;
    var line;
    var generatedCodeColumn;
    var decodedLine;
    var segments;
    var segment;
    var result;
    for (i = 0; i < numLines; i += 1) {
        line = lines[i];
        generatedCodeColumn = 0; // first field - reset each time
        decodedLine = [];
        segments = decodeSegments(line.split(','));
        for (j = 0; j < segments.length; j += 1) {
            segment = segments[j];
            if (!segment.length) {
                break;
            }
            generatedCodeColumn += segment[0];
            result = [generatedCodeColumn];
            decodedLine.push(result);
            if (segment.length === 1) {
                // only one field!
                continue;
            }
            sourceFileIndex += segment[1];
            sourceCodeLine += segment[2];
            sourceCodeColumn += segment[3];
            result.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn);
            if (segment.length === 5) {
                nameIndex += segment[4];
                result.push(nameIndex);
            }
        }
        decoded[i] = decodedLine;
    }
    return decoded;
}
function encode$1$1(decoded) {
    var offsets = {
        generatedCodeColumn: 0,
        sourceFileIndex: 0,
        sourceCodeLine: 0,
        sourceCodeColumn: 0,
        nameIndex: 0 // fifth field
    };
    return decoded.map(function (line) {
        offsets.generatedCodeColumn = 0; // first field - reset each time
        return line.map(encodeSegment).join(',');
    }).join(';');
    function encodeSegment(segment) {
        if (!segment.length) {
            return '';
        }
        var result = new Array(segment.length);
        result[0] = segment[0] - offsets.generatedCodeColumn;
        offsets.generatedCodeColumn = segment[0];
        if (segment.length === 1) {
            // only one field!
            return encode$1(result);
        }
        result[1] = segment[1] - offsets.sourceFileIndex;
        result[2] = segment[2] - offsets.sourceCodeLine;
        result[3] = segment[3] - offsets.sourceCodeColumn;
        offsets.sourceFileIndex = segment[1];
        offsets.sourceCodeLine = segment[2];
        offsets.sourceCodeColumn = segment[3];
        if (segment.length === 5) {
            result[4] = segment[4] - offsets.nameIndex;
            offsets.nameIndex = segment[4];
        }
        return encode$1(result);
    }
}

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode$2 = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode$2 = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var base64 = {
	encode: encode$2,
	decode: decode$2
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$3 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$3 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var base64Vlq = {
	encode: encode$3,
	decode: decode$3
};

var util = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});
var util_1 = util.getArg;
var util_2 = util.urlParse;
var util_3 = util.urlGenerate;
var util_4 = util.normalize;
var util_5 = util.join;
var util_6 = util.isAbsolute;
var util_7 = util.relative;
var util_8 = util.toSetString;
var util_9 = util.fromSetString;
var util_10 = util.compareByOriginalPositions;
var util_11 = util.compareByGeneratedPositionsDeflated;
var util_12 = util.compareByGeneratedPositionsInflated;
var util_13 = util.parseSourceMapInput;
var util_14 = util.computeSourceURL;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has$1 = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has$1.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has$1.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has$1.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet;

var arraySet = {
	ArraySet: ArraySet_1
};

var binarySearch = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});
var binarySearch_1 = binarySearch.GREATEST_LOWER_BOUND;
var binarySearch_2 = binarySearch.LEAST_UPPER_BOUND;
var binarySearch_3 = binarySearch.search;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$2 = arraySet.ArraySet;

var quickSort$1 = quickSort.quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$2.fromArray(names.map(String), true);
  this._sources = ArraySet$2.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort$1(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64Vlq.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort$1(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort$1(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$2();
  this._names = new ArraySet$2();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort$1(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort$1(this.__originalMappings, util.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;

var defaultAcornOptions = {
    // TODO TypeScript waiting for acorn types to be updated
    ecmaVersion: 2018,
    sourceType: 'module',
    preserveParens: false
};
function tryParse(module, parse, acornOptions) {
    try {
        return parse(module.code, Object.assign({}, defaultAcornOptions, acornOptions, {
            onComment: function (block, text, start, end) {
                return module.comments.push({ block: block, text: text, start: start, end: end });
            }
        }));
    }
    catch (err) {
        module.error({
            code: 'PARSE_ERROR',
            message: err.message.replace(/ \(\d+:\d+\)$/, '')
        }, err.pos);
    }
}
function includeFully(node) {
    node.included = true;
    if (node.variable && !node.variable.included) {
        node.variable.includeVariable();
    }
    node.eachChild(includeFully);
}
var Module = /** @class */ (function () {
    function Module(graph, id) {
        this.id = id;
        this.graph = graph;
        this.comments = [];
        if (graph.dynamicImport) {
            this.dynamicImports = [];
            this.dynamicImportResolutions = [];
        }
        this.isEntryPoint = false;
        this.execIndex = null;
        this.entryPointsHash = new Uint8Array(10);
        this.excludeFromSourcemap = /\0/.test(id);
        this.context = graph.getModuleContext(id);
        // all dependencies
        this.sources = [];
        this.dependencies = [];
        // imports and exports, indexed by local name
        this.imports = blank();
        this.exports = blank();
        this.exportsAll = blank();
        this.reexports = blank();
        this.exportAllSources = [];
        this.exportAllModules = null;
        this.declarations = blank();
        this.scope = new ModuleScope(this);
    }
    Module.prototype.setSource = function (_a) {
        var code = _a.code, originalCode = _a.originalCode, originalSourcemap = _a.originalSourcemap, ast = _a.ast, sourcemapChain = _a.sourcemapChain, resolvedIds = _a.resolvedIds;
        this.code = code;
        this.originalCode = originalCode;
        this.originalSourcemap = originalSourcemap;
        this.sourcemapChain = sourcemapChain;
        timeStart('ast');
        if (ast) {
            // prevent mutating the provided AST, as it may be reused on
            // subsequent incremental rebuilds
            this.ast = clone(ast);
            this.astClone = ast;
        }
        else {
            // TODO what happens to comments if AST is provided?
            this.ast = tryParse(this, this.graph.acornParse, this.graph.acornOptions);
            this.astClone = clone(this.ast);
        }
        timeEnd('ast');
        this.resolvedIds = resolvedIds || blank();
        // By default, `id` is the filename. Custom resolvers and loaders
        // can change that, but it makes sense to use it for the source filename
        this.magicString = new MagicString$1(code, {
            filename: this.excludeFromSourcemap ? null : this.id,
            indentExclusionRanges: []
        });
        this.removeExistingSourceMap();
        timeStart('analyse');
        this.analyse();
        timeEnd('analyse');
    };
    Module.prototype.removeExistingSourceMap = function () {
        var _this = this;
        this.comments.forEach(function (comment) {
            if (!comment.block && SOURCEMAPPING_URL_RE.test(comment.text)) {
                _this.magicString.remove(comment.start, comment.end);
            }
        });
    };
    Module.prototype.addExport = function (node) {
        var _this = this;
        var source = node.source && node.source.value;
        // export { name } from './other'
        if (source) {
            if (this.sources.indexOf(source) === -1)
                this.sources.push(source);
            if (node.type === NodeType.ExportAllDeclaration) {
                // Store `export * from '...'` statements in an array of delegates.
                // When an unknown import is encountered, we see if one of them can satisfy it.
                this.exportAllSources.push(source);
            }
            else {
                node.specifiers.forEach(function (specifier) {
                    var name = specifier.exported.name;
                    if (_this.exports[name] || _this.reexports[name]) {
                        _this.error({
                            code: 'DUPLICATE_EXPORT',
                            message: "A module cannot have multiple exports with the same name ('" + name + "')"
                        }, specifier.start);
                    }
                    _this.reexports[name] = {
                        start: specifier.start,
                        source: source,
                        localName: specifier.local.name,
                        module: null // filled in later
                    };
                });
            }
        }
        else if (node.type === NodeType.ExportDefaultDeclaration) {
            // export default function foo () {}
            // export default foo;
            // export default 42;
            var identifier = (node.declaration.id &&
                node.declaration.id.name) ||
                node.declaration.name;
            if (this.exports.default) {
                this.error({
                    code: 'DUPLICATE_EXPORT',
                    message: "A module can only have one default export"
                }, node.start);
            }
            this.exports.default = {
                localName: 'default',
                identifier: identifier
            };
        }
        else if (node.declaration) {
            // export var { foo, bar } = ...
            // export var foo = 42;
            // export var a = 1, b = 2, c = 3;
            // export function foo () {}
            var declaration = node.declaration;
            if (declaration.type === NodeType.VariableDeclaration) {
                declaration.declarations.forEach(function (decl) {
                    extractNames(decl.id).forEach(function (localName) {
                        _this.exports[localName] = { localName: localName };
                    });
                });
            }
            else {
                // export function foo () {}
                var localName = declaration.id.name;
                this.exports[localName] = { localName: localName };
            }
        }
        else {
            // export { foo, bar, baz }
            node.specifiers.forEach(function (specifier) {
                var localName = specifier.local.name;
                var exportedName = specifier.exported.name;
                if (_this.exports[exportedName] || _this.reexports[exportedName]) {
                    _this.error({
                        code: 'DUPLICATE_EXPORT',
                        message: "A module cannot have multiple exports with the same name ('" + exportedName + "')"
                    }, specifier.start);
                }
                _this.exports[exportedName] = { localName: localName };
            });
        }
    };
    Module.prototype.addImport = function (node) {
        var _this = this;
        var source = node.source.value;
        if (this.sources.indexOf(source) === -1)
            this.sources.push(source);
        node.specifiers.forEach(function (specifier) {
            var localName = specifier.local.name;
            if (_this.imports[localName]) {
                _this.error({
                    code: 'DUPLICATE_IMPORT',
                    message: "Duplicated import '" + localName + "'"
                }, specifier.start);
            }
            var isDefault = specifier.type === NodeType.ImportDefaultSpecifier;
            var isNamespace = specifier.type === NodeType.ImportNamespaceSpecifier;
            var name = isDefault
                ? 'default'
                : isNamespace ? '*' : specifier.imported.name;
            _this.imports[localName] = { source: source, specifier: specifier, name: name, module: null };
        });
    };
    Module.prototype.analyse = function () {
        var _this = this;
        enhance(this.ast, this, this.dynamicImports);
        this.ast.body.forEach(function (node) {
            if (node.isImportDeclaration) {
                _this.addImport(node);
            }
            else if (node
                .isExportDeclaration) {
                _this.addExport(node);
            }
        });
    };
    Module.prototype.basename = function () {
        var base = basename(this.id);
        var ext = extname(this.id);
        return makeLegal(ext ? base.slice(0, -ext.length) : base);
    };
    Module.prototype.markExports = function () {
        var _this = this;
        this.getExports().forEach(function (name) {
            var variable = _this.traceExport(name);
            variable.exportName = name;
            variable.includeVariable();
            if (variable.isNamespace) {
                variable.needsNamespaceBlock = true;
            }
        });
        this.getReexports().forEach(function (name) {
            var variable = _this.traceExport(name);
            variable.exportName = name;
            if (variable.isExternal) {
                variable.reexported = variable.module.reexported = true;
            }
            else {
                variable.includeVariable();
            }
        });
    };
    Module.prototype.linkDependencies = function () {
        var _this = this;
        this.sources.forEach(function (source) {
            var id = _this.resolvedIds[source];
            if (id) {
                var module = _this.graph.moduleById.get(id);
                _this.dependencies.push(module);
            }
        });
        [this.imports, this.reexports].forEach(function (specifiers) {
            Object.keys(specifiers).forEach(function (name) {
                var specifier = specifiers[name];
                var id = _this.resolvedIds[specifier.source];
                specifier.module = _this.graph.moduleById.get(id);
            });
        });
        this.exportAllModules = this.exportAllSources.map(function (source) {
            var id = _this.resolvedIds[source];
            return _this.graph.moduleById.get(id);
        });
    };
    Module.prototype.bindReferences = function () {
        this.ast.body.forEach(function (node) { return node.bind(); });
    };
    Module.prototype.getDynamicImportExpressions = function () {
        return this.dynamicImports.map(function (node) {
            var importArgument = node.parent.arguments[0];
            if (isTemplateLiteral(importArgument)) {
                if (importArgument.expressions.length === 0 && importArgument.quasis.length === 1) {
                    return importArgument.quasis[0].value.cooked;
                }
            }
            else if (isLiteral(importArgument)) {
                if (typeof importArgument.value === 'string') {
                    return importArgument.value;
                }
            }
            else {
                return importArgument;
            }
        });
    };
    Module.prototype.getOriginalLocation = function (sourcemapChain, location) {
        var filteredSourcemapChain = sourcemapChain
            .filter(function (sourcemap) { return sourcemap.mappings; })
            .map(function (sourcemap) {
            var encodedSourcemap = sourcemap;
            if (sourcemap.mappings) {
                encodedSourcemap.mappings = encode$1$1(encodedSourcemap.mappings);
            }
            return encodedSourcemap;
        });
        while (filteredSourcemapChain.length > 0) {
            var sourcemap = filteredSourcemapChain.pop();
            var smc = new SourceMapConsumer$1(sourcemap);
            location = smc.originalPositionFor({
                line: location.line,
                column: location.column
            });
        }
        return location;
    };
    Module.prototype.error = function (props, pos) {
        if (pos !== undefined) {
            props.pos = pos;
            var location = locate(this.code, pos, { offsetLine: 1 });
            try {
                location = this.getOriginalLocation(this.sourcemapChain, location);
            }
            catch (e) {
                this.warn({
                    loc: {
                        file: this.id,
                        line: location.line,
                        column: location.column
                    },
                    pos: pos,
                    message: "Error when using sourcemap for reporting an error: " + e.message,
                    code: 'SOURCEMAP_ERROR'
                }, undefined);
            }
            props.loc = {
                file: this.id,
                line: location.line,
                column: location.column
            };
            props.frame = getCodeFrame(this.originalCode, location.line, location.column);
        }
        error(props);
    };
    Module.prototype.getAllExports = function () {
        var allExports = Object.assign(blank(), this.exports, this.reexports);
        this.exportAllModules.forEach(function (module) {
            if (module.isExternal) {
                allExports["*" + module.id] = true;
                return;
            }
            module.getAllExports().forEach(function (name) {
                if (name !== 'default')
                    allExports[name] = true;
            });
        });
        return Object.keys(allExports);
    };
    Module.prototype.getExports = function () {
        return Object.keys(this.exports);
    };
    Module.prototype.getReexports = function () {
        var reexports = blank();
        Object.keys(this.reexports).forEach(function (name) {
            reexports[name] = true;
        });
        this.exportAllModules.forEach(function (module) {
            if (module.isExternal) {
                reexports["*" + module.id] = true;
                return;
            }
            module
                .getExports()
                .concat(module.getReexports())
                .forEach(function (name) {
                if (name !== 'default')
                    reexports[name] = true;
            });
        });
        return Object.keys(reexports);
    };
    Module.prototype.includeAllInBundle = function () {
        this.ast.body.forEach(includeFully);
    };
    Module.prototype.includeInBundle = function () {
        var addedNewNodes = false;
        this.ast.body.forEach(function (node) {
            if (node.shouldBeIncluded()) {
                if (node.includeInBundle()) {
                    addedNewNodes = true;
                }
            }
        });
        return addedNewNodes;
    };
    Module.prototype.namespace = function () {
        if (!this.declarations['*']) {
            this.declarations['*'] = new NamespaceVariable(this);
        }
        return this.declarations['*'];
    };
    Module.prototype.render = function (options) {
        var magicString = this.magicString.clone();
        this.ast.render(magicString, options);
        if (this.namespace().needsNamespaceBlock) {
            magicString.append('\n\n' + this.namespace().renderBlock(options.legacy, options.freeze, '\t')); // TODO use correct indentation
        }
        // TODO TypeScript: It seems magicString is missing type information here
        return magicString.trim();
    };
    Module.prototype.toJSON = function () {
        return {
            id: this.id,
            dependencies: this.dependencies.map(function (module) { return module.id; }),
            code: this.code,
            originalCode: this.originalCode,
            originalSourcemap: this.originalSourcemap,
            ast: this.astClone,
            sourcemapChain: this.sourcemapChain,
            resolvedIds: this.resolvedIds
        };
    };
    Module.prototype.trace = function (name) {
        // TODO this is slightly circular
        if (name in this.scope.variables) {
            return this.scope.variables[name];
        }
        if (name in this.imports) {
            var importDeclaration = this.imports[name];
            var otherModule = importDeclaration.module;
            if (!otherModule.isExternal && importDeclaration.name === '*') {
                return otherModule.namespace();
            }
            var declaration = otherModule.traceExport(importDeclaration.name);
            if (!declaration) {
                this.graph.handleMissingExport(this, importDeclaration.name, otherModule, importDeclaration.specifier.start);
            }
            return declaration;
        }
        return null;
    };
    Module.prototype.traceExport = function (name) {
        if (name[0] === '*') {
            // namespace
            if (name.length === 1) {
                return this.namespace();
                // export * from 'external'
            }
            else {
                var module = this.graph.moduleById.get(name.slice(1));
                return module.traceExport('*');
            }
        }
        // export { foo } from './other'
        var reexportDeclaration = this.reexports[name];
        if (reexportDeclaration) {
            var declaration = reexportDeclaration.module.traceExport(reexportDeclaration.localName);
            if (!declaration) {
                this.graph.handleMissingExport(this, reexportDeclaration.localName, reexportDeclaration.module, reexportDeclaration.start);
            }
            return declaration;
        }
        var exportDeclaration = this.exports[name];
        if (exportDeclaration) {
            var name_1 = exportDeclaration.localName;
            var declaration = this.trace(name_1);
            return declaration || this.graph.scope.findVariable(name_1);
        }
        if (name === 'default')
            return;
        for (var i = 0; i < this.exportAllModules.length; i += 1) {
            var module = this.exportAllModules[i];
            var declaration = module.traceExport(name);
            if (declaration)
                return declaration;
        }
    };
    Module.prototype.warn = function (warning, pos) {
        if (pos !== undefined) {
            warning.pos = pos;
            var _a = locate(this.code, pos, { offsetLine: 1 }), line = _a.line, column = _a.column; // TODO trace sourcemaps, cf. error()
            warning.loc = { file: this.id, line: line, column: column };
            warning.frame = getCodeFrame(this.code, line, column);
        }
        warning.id = this.id;
        this.graph.warn(warning);
    };
    return Module;
}());

var ExternalModule = /** @class */ (function () {
    function ExternalModule(_a) {
        var graph = _a.graph, id = _a.id;
        this.graph = graph;
        this.id = id;
        var parts = id.split(/[\\/]/);
        this.name = makeLegal(parts.pop());
        this.nameSuggestions = blank();
        this.mostCommonSuggestion = 0;
        this.isExternal = true;
        this.used = false;
        this.declarations = blank();
        this.exportsNames = false;
    }
    ExternalModule.prototype.suggestName = function (name) {
        if (!this.nameSuggestions[name])
            this.nameSuggestions[name] = 0;
        this.nameSuggestions[name] += 1;
        if (this.nameSuggestions[name] > this.mostCommonSuggestion) {
            this.mostCommonSuggestion = this.nameSuggestions[name];
            this.name = name;
        }
    };
    ExternalModule.prototype.warnUnusedImports = function () {
        var _this = this;
        var unused = Object.keys(this.declarations)
            .filter(function (name) { return name !== '*'; })
            .filter(function (name) { return !_this.declarations[name].included && !_this.declarations[name].reexported; });
        if (unused.length === 0)
            return;
        var names = unused.length === 1
            ? "'" + unused[0] + "' is"
            : unused
                .slice(0, -1)
                .map(function (name) { return "'" + name + "'"; })
                .join(', ') + " and '" + unused.slice(-1) + "' are";
        this.graph.warn({
            code: 'UNUSED_EXTERNAL_IMPORT',
            source: this.id,
            names: unused,
            message: names + " imported from external module '" + this.id + "' but never used"
        });
    };
    ExternalModule.prototype.traceExport = function (name) {
        if (name !== 'default' && name !== '*')
            this.exportsNames = true;
        if (name === '*')
            this.exportsNamespace = true;
        return this.declarations[name] || (this.declarations[name] = new ExternalVariable(this, name));
    };
    return ExternalModule;
}());

function load(id) {
    return readFileSync(id, 'utf-8');
}
function findFile(file, preserveSymlinks) {
    try {
        var stats = lstatSync(file);
        if (!preserveSymlinks && stats.isSymbolicLink())
            return findFile(realpathSync(file), preserveSymlinks);
        if ((preserveSymlinks && stats.isSymbolicLink()) || stats.isFile()) {
            // check case
            var name = basename(file);
            var files = readdirSync(dirname(file));
            if (files.indexOf(name) !== -1)
                return file;
        }
    }
    catch (err) {
        // suppress
    }
}
function addJsExtensionIfNecessary(file, preserveSymlinks) {
    return findFile(file, preserveSymlinks) || findFile(file + '.js', preserveSymlinks);
}
function resolveId(options) {
    return function (importee, importer) {
        if (typeof process === 'undefined') {
            error({
                code: 'MISSING_PROCESS',
                message: "It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions",
                url: 'https://github.com/rollup/rollup/wiki/Plugins'
            });
        }
        // external modules (non-entry modules that start with neither '.' or '/')
        // are skipped at this stage.
        if (importer !== undefined && !isAbsolute(importee) && importee[0] !== '.')
            return null;
        // `resolve` processes paths from right to left, prepending them until an
        // absolute path is created. Absolute importees therefore shortcircuit the
        // resolve call and require no special handing on our part.
        // See https://nodejs.org/api/path.html#path_path_resolve_paths
        return addJsExtensionIfNecessary(resolve(importer ? dirname(importer) : resolve(), importee), options.preserveSymlinks);
    };
}
function makeOnwarn() {
    var warned = blank();
    return function (warning) {
        var str = warning.toString();
        if (str in warned)
            return;
        console.error(str); //eslint-disable-line no-console
        warned[str] = true;
    };
}
function handleMissingExport(module, name, otherModule, start) {
    module.error({
        code: 'MISSING_EXPORT',
        message: "'" + name + "' is not exported by " + relativeId(otherModule.id),
        url: "https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module"
    }, start);
}

function transform(graph, source, id, plugins) {
    var sourcemapChain = [];
    var originalSourcemap = typeof source.map === 'string' ? JSON.parse(source.map) : source.map;
    if (originalSourcemap && typeof originalSourcemap.mappings === 'string') {
        originalSourcemap.mappings = decode$1$1(originalSourcemap.mappings);
    }
    var originalCode = source.code;
    var ast = source.ast;
    var promise = Promise.resolve(source.code);
    plugins.forEach(function (plugin) {
        if (!plugin.transform)
            return;
        promise = promise.then(function (previous) {
            function augment(object, pos, code) {
                var outObject = typeof object === 'string' ? { message: object } : object;
                if (outObject.code)
                    outObject.pluginCode = outObject.code;
                outObject.code = code;
                if (pos !== undefined) {
                    if (pos.line !== undefined && pos.column !== undefined) {
                        var line = pos.line, column = pos.column;
                        outObject.loc = { file: id, line: line, column: column };
                        outObject.frame = getCodeFrame(previous, line, column);
                    }
                    else {
                        outObject.pos = pos;
                        var _a = locate(previous, pos, { offsetLine: 1 }), line = _a.line, column = _a.column;
                        outObject.loc = { file: id, line: line, column: column };
                        outObject.frame = getCodeFrame(previous, line, column);
                    }
                }
                outObject.plugin = plugin.name;
                outObject.id = id;
                return outObject;
            }
            var throwing;
            var context = {
                parse: function (code, options) {
                    if (options === void 0) { options = {}; }
                    return graph.acornParse(code, Object.assign({}, defaultAcornOptions, options, graph.acornOptions));
                },
                warn: function (warning, pos) {
                    warning = augment(warning, pos, 'PLUGIN_WARNING');
                    graph.warn(warning);
                },
                error: function (err, pos) {
                    err = augment(err, pos, 'PLUGIN_ERROR');
                    throwing = true;
                    error(err);
                }
            };
            var transformed;
            try {
                transformed = plugin.transform.call(context, previous, id);
            }
            catch (err) {
                if (!throwing)
                    context.error(err);
                error(err);
            }
            return Promise.resolve(transformed)
                .then(function (result) {
                if (result == null)
                    return previous;
                if (typeof result === 'string') {
                    result = {
                        code: result,
                        ast: undefined,
                        map: undefined
                    };
                }
                else if (typeof result.map === 'string') {
                    // `result.map` can only be a string if `result` isn't
                    result.map = JSON.parse(result.map);
                }
                if (result.map && typeof result.map.mappings === 'string') {
                    result.map.mappings = decode$1$1(result.map.mappings);
                }
                // strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
                if (result.map !== null) {
                    sourcemapChain.push(result.map || { missing: true, plugin: plugin.name });
                }
                ast = result.ast;
                return result.code;
            })
                .catch(function (err) {
                err = augment(err, undefined, 'PLUGIN_ERROR');
                error(err);
            });
        });
    });
    return promise.then(function (code) { return ({
        code: code,
        originalCode: originalCode,
        originalSourcemap: originalSourcemap,
        ast: ast,
        sourcemapChain: sourcemapChain
    }); });
}

function getStarExcludes(_a) {
    var dependencies = _a.dependencies, exports = _a.exports;
    var starExcludes = new Set(exports.map(function (expt) { return expt.exported; }));
    if (!starExcludes.has('default'))
        starExcludes.add('default');
    // also include reexport names
    dependencies.forEach(function (_a) {
        var reexports = _a.reexports;
        if (reexports)
            reexports.forEach(function (reexport) {
                if (reexport.imported !== '*' && !starExcludes.has(reexport.reexported))
                    starExcludes.add(reexport.reexported);
            });
    });
    return starExcludes;
}
function system(chunk, magicString, _a) {
    var getPath = _a.getPath, t = _a.indentString, intro = _a.intro, outro = _a.outro;
    var _b = chunk.getModuleDeclarations(), dependencies = _b.dependencies, exports = _b.exports;
    var dependencyIds = dependencies.map(function (m) { return "'" + getPath(m.id) + "'"; });
    var importBindings = [];
    var starExcludes;
    var setters = [];
    var varOrConst = chunk.graph.varOrConst;
    dependencies.forEach(function (_a) {
        var imports = _a.imports, reexports = _a.reexports;
        var setter = [];
        if (imports) {
            imports.forEach(function (specifier) {
                importBindings.push(specifier.local);
                if (specifier.imported === '*') {
                    setter.push(specifier.local + " = module;");
                }
                else {
                    setter.push(specifier.local + " = module." + specifier.imported + ";");
                }
            });
        }
        if (reexports) {
            var createdSetter_1 = false;
            // bulk-reexport form
            if (reexports.length > 1 ||
                (reexports.length === 1 &&
                    (reexports[0].reexported === '*' || reexports[0].imported === '*'))) {
                // star reexports
                reexports.forEach(function (specifier) {
                    if (specifier.reexported !== '*')
                        return;
                    // need own exports list for deduping in star export case
                    if (!starExcludes) {
                        starExcludes = getStarExcludes({ dependencies: dependencies, exports: exports });
                    }
                    if (!createdSetter_1) {
                        setter.push(varOrConst + " _setter = {};");
                        createdSetter_1 = true;
                    }
                    setter.push("for (var _$p in module) {");
                    setter.push(t + "if (!_starExcludes[_$p]) _setter[_$p] = module[_$p];");
                    setter.push('}');
                });
                // star import reexport
                reexports.forEach(function (specifier) {
                    if (specifier.imported !== '*' || specifier.reexported === '*')
                        return;
                    setter.push("exports('" + specifier.reexported + "', module);");
                });
                // reexports
                reexports.forEach(function (specifier) {
                    if (specifier.reexported === '*' || specifier.imported === '*')
                        return;
                    if (!createdSetter_1) {
                        setter.push(varOrConst + " _setter = {};");
                        createdSetter_1 = true;
                    }
                    setter.push("_setter." + specifier.reexported + " = module." + specifier.imported + ";");
                });
                if (createdSetter_1) {
                    setter.push('exports(_setter);');
                }
            }
            else {
                // single reexport
                reexports.forEach(function (specifier) {
                    setter.push("exports('" + specifier.reexported + "', module." + specifier.imported + ");");
                });
            }
        }
        setters.push(setter.join("\n" + t + t + t));
    });
    // function declarations hoist
    var functionExports = [];
    exports.forEach(function (expt) {
        if (expt.hoisted)
            functionExports.push("exports('" + expt.exported + "', " + expt.local + ");");
    });
    var starExcludesSection = !starExcludes
        ? ''
        : "\n" + t + varOrConst + " _starExcludes = { " + Array.from(starExcludes).join(': 1, ') + (starExcludes.size ? ': 1' : '') + " };";
    var importBindingsSection = importBindings.length
        ? "\n" + t + "var " + importBindings.join(', ') + ";"
        : '';
    var wrapperStart = "System.register([" + dependencyIds.join(', ') + "], function (exports, module) {\n" + t + "'use strict';" + starExcludesSection + importBindingsSection + "\n" + t + "return {" + (setters.length
        ? "\n" + t + t + "setters: [" + setters
            .map(function (s) { return "function (module) {\n" + t + t + t + s + "\n" + t + t + "}"; })
            .join(', ') + "],"
        : '') + "\n" + t + t + "execute: function () {\n\n" + (functionExports.length ? "" + t + t + t + functionExports.join("\n" + t + t + t) + '\n' : '');
    if (intro)
        magicString.prepend(intro);
    if (outro)
        magicString.append(outro);
    return magicString // TODO TypeScript: Awaiting PR
        .indent("" + t + t + t)
        .append("\n\n" + t + t + "}\n" + t + "};\n});")
        .prepend(wrapperStart);
}

function getInteropBlock(dependencies, options, varOrConst) {
    return dependencies
        .map(function (_a) {
        var name = _a.name, exportsNamespace = _a.exportsNamespace, exportsNames = _a.exportsNames, exportsDefault = _a.exportsDefault;
        if (!exportsDefault || options.interop === false)
            return null;
        if (exportsNamespace)
            return varOrConst + " " + name + "__default = " + name + "['default'];";
        if (exportsNames)
            return varOrConst + " " + name + "__default = 'default' in " + name + " ? " + name + "['default'] : " + name + ";";
        return name + " = " + name + " && " + name + ".hasOwnProperty('default') ? " + name + "['default'] : " + name + ";";
    })
        .filter(Boolean)
        .join('\n');
}

function getExportBlock(exports, dependencies, exportMode, mechanism) {
    if (mechanism === void 0) { mechanism = 'return'; }
    if (exportMode === 'default') {
        var local_1;
        exports.some(function (expt) {
            if (expt.exported === 'default') {
                local_1 = expt.local;
                return true;
            }
            return false;
        });
        // search for reexported default otherwise
        if (!local_1) {
            dependencies.some(function (dep) {
                if (!dep.reexports)
                    return false;
                return dep.reexports.some(function (expt) {
                    if (expt.reexported === 'default') {
                        local_1 = dep.name + "." + expt.imported;
                        return true;
                    }
                    return false;
                });
            });
        }
        return mechanism + " " + local_1 + ";";
    }
    var exportBlock = '';
    // star exports must always output first for precedence
    dependencies.forEach(function (_a) {
        var name = _a.name, reexports = _a.reexports;
        if (reexports && exportMode !== 'default') {
            reexports.forEach(function (specifier) {
                if (specifier.reexported === '*') {
                    exportBlock += (exportBlock ? '\n' : '') + "Object.keys(" + name + ").forEach(function (key) { exports[key] = " + name + "[key]; });";
                }
            });
        }
    });
    dependencies.forEach(function (_a) {
        var name = _a.name, imports = _a.imports, reexports = _a.reexports, isChunk = _a.isChunk;
        if (reexports && exportMode !== 'default') {
            reexports.forEach(function (specifier) {
                if (specifier.imported === 'default' && !isChunk) {
                    var exportsNamesOrNamespace = (imports &&
                        imports.some(function (specifier) { return specifier.imported === '*' || specifier.imported !== 'default'; })) ||
                        (reexports &&
                            reexports.some(function (specifier) { return specifier.imported !== 'default' && specifier.imported !== '*'; }));
                    if (exportsNamesOrNamespace) {
                        exportBlock += (exportBlock ? '\n' : '') + "exports." + specifier.reexported + " = " + name + "__default;";
                    }
                    else {
                        exportBlock += (exportBlock ? '\n' : '') + "exports." + specifier.reexported + " = " + name + ";";
                    }
                }
                else if (specifier.imported !== '*') {
                    exportBlock += (exportBlock ? '\n' : '') + "exports." + specifier.reexported + " = " + name + "." + specifier.imported + ";";
                }
                else if (specifier.reexported !== '*') {
                    exportBlock += (exportBlock ? '\n' : '') + "exports." + specifier.reexported + " = " + name + ";";
                }
            });
        }
    });
    exports.forEach(function (expt) {
        var lhs = "exports." + expt.exported;
        var rhs = expt.local;
        if (lhs === rhs) {
            return;
        }
        if (exportBlock) {
            exportBlock += '\n';
        }
        exportBlock += lhs + " = " + rhs + ";";
    });
    return exportBlock;
}

var esModuleExport = "Object.defineProperty(exports, '__esModule', { value: true });";

var builtins$1 = {
    process: true,
    events: true,
    stream: true,
    util: true,
    path: true,
    buffer: true,
    querystring: true,
    url: true,
    string_decoder: true,
    punycode: true,
    http: true,
    https: true,
    os: true,
    assert: true,
    constants: true,
    timers: true,
    console: true,
    vm: true,
    zlib: true,
    tty: true,
    domain: true
};
// Creating a browser chunk that depends on Node.js built-in modules ('util'). You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins
function warnOnBuiltins(chunk) {
    var externalBuiltins = chunk.getImportIds().filter(function (id) { return id in builtins$1; });
    if (!externalBuiltins.length)
        return;
    var detail = externalBuiltins.length === 1
        ? "module ('" + externalBuiltins[0] + "')"
        : "modules (" + externalBuiltins
            .slice(0, -1)
            .map(function (name) { return "'" + name + "'"; })
            .join(', ') + " and '" + externalBuiltins.slice(-1) + "')";
    chunk.graph.warn({
        code: 'MISSING_NODE_BUILTINS',
        modules: externalBuiltins,
        message: "Creating a browser bundle that depends on Node.js built-in " + detail + ". You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins"
    });
}

function amd(chunk, magicString, _a, options) {
    var exportMode = _a.exportMode, getPath = _a.getPath, indentString = _a.indentString, intro = _a.intro, outro = _a.outro, dynamicImport = _a.dynamicImport;
    warnOnBuiltins(chunk);
    var _b = chunk.getModuleDeclarations(), dependencies = _b.dependencies, exports = _b.exports;
    var deps = dependencies.map(function (m) { return "'" + getPath(m.id) + "'"; });
    var args = dependencies.map(function (m) { return m.name; });
    if (exportMode === 'named') {
        args.unshift("exports");
        deps.unshift("'exports'");
    }
    if (dynamicImport) {
        args.unshift('require');
        deps.unshift("'require'");
    }
    var amdOptions = options.amd || {};
    var params = (amdOptions.id ? "'" + amdOptions.id + "', " : "") + (deps.length ? "[" + deps.join(', ') + "], " : "");
    var useStrict = options.strict !== false ? " 'use strict';" : "";
    var define = amdOptions.define || 'define';
    var wrapperStart = define + "(" + params + "function (" + args.join(', ') + ") {" + useStrict + "\n\n";
    // var foo__default = 'default' in foo ? foo['default'] : foo;
    var interopBlock = getInteropBlock(dependencies, options, chunk.graph.varOrConst);
    if (interopBlock)
        magicString.prepend(interopBlock + '\n\n');
    if (intro)
        magicString.prepend(intro);
    var exportBlock = getExportBlock(exports, dependencies, exportMode);
    if (exportBlock)
        magicString.append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
    if (exportMode === 'named' && options.legacy !== true && chunk.isEntryModuleFacade)
        magicString.append("\n\n" + esModuleExport); // TODO TypeScript: Awaiting PR
    if (outro)
        magicString.append(outro);
    return magicString // TODO TypeScript: Awaiting PR
        .indent(indentString)
        .append('\n\n});')
        .prepend(wrapperStart);
}

function cjs(chunk, magicString, _a, options) {
    var exportMode = _a.exportMode, getPath = _a.getPath, intro = _a.intro, outro = _a.outro;
    intro =
        (options.strict === false ? intro : "'use strict';\n\n" + intro) +
            (exportMode === 'named' && options.legacy !== true && chunk.isEntryModuleFacade
                ? esModuleExport + "\n\n"
                : '');
    var needsInterop = false;
    var varOrConst = chunk.graph.varOrConst;
    var interop = options.interop !== false;
    var _b = chunk.getModuleDeclarations(), dependencies = _b.dependencies, exports = _b.exports;
    var importBlock = dependencies
        .map(function (_a) {
        var id = _a.id, isChunk = _a.isChunk, name = _a.name, reexports = _a.reexports, imports = _a.imports;
        if (!reexports && !imports) {
            return "require('" + getPath(id) + "');";
        }
        if (!interop || isChunk) {
            return varOrConst + " " + name + " = require('" + getPath(id) + "');";
        }
        var usesDefault = (imports && imports.some(function (specifier) { return specifier.imported === 'default'; })) ||
            (reexports && reexports.some(function (specifier) { return specifier.imported === 'default'; }));
        if (!usesDefault) {
            return varOrConst + " " + name + " = require('" + getPath(id) + "');";
        }
        var exportsNamespace = imports && imports.some(function (specifier) { return specifier.imported === '*'; });
        if (exportsNamespace) {
            return (varOrConst + " " + name + " = require('" + getPath(id) + "');" +
                ("\n" + varOrConst + " " + name + "__default = " + name + "['default'];"));
        }
        needsInterop = true;
        var exportsNames = (imports &&
            imports.some(function (specifier) { return specifier.imported !== 'default' && specifier.imported !== '*'; })) ||
            (reexports &&
                reexports.some(function (specifier) { return specifier.imported !== 'default' && specifier.imported !== '*'; }));
        if (exportsNames) {
            return (varOrConst + " " + name + " = require('" + getPath(id) + "');" +
                ("\n" + varOrConst + " " + name + "__default = _interopDefault(" + name + ");"));
        }
        return varOrConst + " " + name + " = _interopDefault(require('" + getPath(id) + "'));";
    })
        .join('\n');
    if (needsInterop) {
        intro += "function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }\n\n";
    }
    if (importBlock) {
        intro += importBlock + '\n\n';
    }
    var exportBlock = getExportBlock(exports, dependencies, exportMode, 'module.exports =');
    magicString.prepend(intro);
    if (exportBlock)
        magicString.append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
    if (outro)
        magicString.append(outro); // TODO TypeScript: Awaiting PR
    return magicString;
}

function es(chunk, magicString, _a) {
    var getPath = _a.getPath, intro = _a.intro, outro = _a.outro;
    var _b = chunk.getModuleDeclarations(), dependencies = _b.dependencies, exports = _b.exports;
    var importBlock = dependencies
        .map(function (_a) {
        var id = _a.id, reexports = _a.reexports, imports = _a.imports, name = _a.name;
        if (!reexports && !imports) {
            return "import '" + getPath(id) + "';";
        }
        var output = '';
        if (imports) {
            var defaultImport_1 = imports.find(function (specifier) { return specifier.imported === 'default'; });
            var starImport_1 = imports.find(function (specifier) { return specifier.imported === '*'; });
            if (starImport_1) {
                output += "import * as " + starImport_1.local + " from '" + getPath(id) + "';";
                if (imports.length > 1)
                    output += '\n';
            }
            if (defaultImport_1 && imports.length === 1) {
                output += "import " + defaultImport_1.local + " from '" + getPath(id) + "';";
            }
            else if (!starImport_1 || imports.length > 1) {
                output += "import " + (defaultImport_1 ? defaultImport_1.local + ", " : '') + "{ " + imports
                    .filter(function (specifier) { return specifier !== defaultImport_1 && specifier !== starImport_1; })
                    .map(function (specifier) {
                    if (specifier.imported === specifier.local) {
                        return specifier.imported;
                    }
                    else {
                        return specifier.imported + " as " + specifier.local;
                    }
                })
                    .join(', ') + " } from '" + getPath(id) + "';";
            }
        }
        if (reexports) {
            if (imports)
                output += '\n';
            var starExport_1 = reexports.find(function (specifier) { return specifier.reexported === '*'; });
            var namespaceReexport_1 = reexports.find(function (specifier) { return specifier.imported === '*' && specifier.reexported !== '*'; });
            if (starExport_1) {
                output += "export * from '" + getPath(id) + "';";
                if (reexports.length === 1) {
                    return output;
                }
                output += '\n';
            }
            if (namespaceReexport_1) {
                if (!imports ||
                    !imports.some(function (specifier) { return specifier.imported === '*' && specifier.local === name; }))
                    output += "import * as " + name + " from '" + getPath(id) + "';\n";
                output += "export { " + (name === namespaceReexport_1.reexported
                    ? name
                    : name + " as " + namespaceReexport_1.reexported) + " };";
                if (reexports.length === (starExport_1 ? 2 : 1)) {
                    return output;
                }
                output += '\n';
            }
            output += "export { " + reexports
                .filter(function (specifier) { return specifier !== starExport_1 && specifier !== namespaceReexport_1; })
                .map(function (specifier) {
                if (specifier.imported === specifier.reexported) {
                    return specifier.imported;
                }
                else {
                    return specifier.imported + " as " + specifier.reexported;
                }
            })
                .join(', ') + " } from '" + getPath(id) + "';";
        }
        return output;
    })
        .join('\n');
    if (importBlock)
        intro += importBlock + '\n\n';
    if (intro)
        magicString.prepend(intro);
    var exportBlock = [];
    var exportDeclaration = [];
    exports.forEach(function (specifier) {
        if (specifier.exported === 'default') {
            exportBlock.push("export default " + specifier.local + ";");
        }
        else {
            exportDeclaration.push(specifier.exported === specifier.local
                ? specifier.local
                : specifier.local + " as " + specifier.exported);
        }
    });
    if (exportDeclaration.length) {
        exportBlock.push("export { " + exportDeclaration.join(', ') + " };");
    }
    if (exportBlock.length)
        magicString.append('\n\n' + exportBlock.join('\n').trim()); // TODO TypeScript: Awaiting PR
    if (outro)
        magicString.append(outro); // TODO TypeScript: Awaiting PR
    return magicString.trim(); // TODO TypeScript: Awaiting PR
}

function getGlobalNameMaker(globals, graph, fallback) {
    if (fallback === void 0) { fallback = null; }
    var fn = typeof globals === 'function' ? globals : function (id) { return globals[id]; };
    return function (dependency) {
        var name = fn(dependency.id);
        if (name)
            return name;
        if (dependency.exportsDefault || dependency.exportsNames || dependency.exportsNamespace) {
            graph.warn({
                code: 'MISSING_GLOBAL_NAME',
                source: module.id,
                guess: dependency.name,
                message: "No name was provided for external module '" + module.id + "' in options.globals \u2013 guessing '" + dependency.name + "'"
            });
            return dependency.name;
        }
        return fallback;
    };
}

// Generate strings which dereference dotted properties, but use array notation `['prop-deref']`
// if the property name isn't trivial
var shouldUseDot = /^[a-zA-Z$_][a-zA-Z0-9$_]*$/;
function property(prop) {
    return shouldUseDot.test(prop) ? "." + prop : "['" + prop + "']";
}
function keypath(keypath) {
    return keypath
        .split('.')
        .map(property)
        .join('');
}

function trimEmptyImports(dependencies) {
    var i = dependencies.length;
    while (i--) {
        var dependency = dependencies[i];
        if (dependency.exportsDefault || dependency.exportsNames || dependency.exportsNamespace) {
            return dependencies.slice(0, i + 1);
        }
    }
    return [];
}

function setupNamespace(name, root, forAssignment, globals) {
    var parts = name.split('.');
    if (globals) {
        parts[0] = (typeof globals === 'function' ? globals(parts[0]) : globals[parts[0]]) || parts[0];
    }
    var last = parts.pop();
    var acc = root;
    if (forAssignment) {
        return parts
            .map(function (part) { return (acc += property(part), acc + " = " + acc + " || {}"); })
            .concat("" + acc + property(last))
            .join(', ');
    }
    else {
        return parts.map(function (part) { return (acc += property(part), acc + " = " + acc + " || {};"); }).join('\n') + '\n';
    }
}

var thisProp = function (name) { return "this" + keypath(name); };
function iife(chunk, magicString, _a, options) {
    var exportMode = _a.exportMode, indentString = _a.indentString, intro = _a.intro, outro = _a.outro;
    var globalNameMaker = getGlobalNameMaker(options.globals || blank(), chunk.graph, 'null');
    var extend = options.extend, name = options.name;
    var isNamespaced = name && name.indexOf('.') !== -1;
    var possibleVariableAssignment = !extend && !isNamespaced;
    var moduleDeclarations = chunk.getModuleDeclarations();
    if (name && possibleVariableAssignment && !isLegal(name)) {
        error({
            code: 'ILLEGAL_IDENTIFIER_AS_NAME',
            message: "Given name (" + name + ") is not legal JS identifier. If you need this you can try --extend option"
        });
    }
    warnOnBuiltins(chunk);
    var external = trimEmptyImports(moduleDeclarations.dependencies);
    var dependencies = external.map(globalNameMaker);
    var args = external.map(function (m) { return m.name; });
    if (exportMode !== 'none' && !name) {
        error({
            code: 'INVALID_OPTION',
            message: "You must supply output.name for IIFE bundles"
        });
    }
    if (extend) {
        dependencies.unshift("(" + thisProp(name) + " = " + thisProp(name) + " || {})");
        args.unshift('exports');
    }
    else if (exportMode === 'named') {
        dependencies.unshift('{}');
        args.unshift('exports');
    }
    var useStrict = options.strict !== false ? indentString + "'use strict';\n\n" : "";
    var wrapperIntro = "(function (" + args + ") {\n" + useStrict;
    if (exportMode !== 'none' && !extend) {
        wrapperIntro =
            (isNamespaced ? thisProp(name) : chunk.graph.varOrConst + " " + name) + (" = " + wrapperIntro);
    }
    if (isNamespaced) {
        wrapperIntro = setupNamespace(name, 'this', false, options.globals) + wrapperIntro;
    }
    var wrapperOutro = "\n\n}(" + dependencies + "));";
    if (!extend && exportMode === 'named') {
        wrapperOutro = "\n\n" + indentString + "return exports;" + wrapperOutro;
    }
    // var foo__default = 'default' in foo ? foo['default'] : foo;
    var interopBlock = getInteropBlock(moduleDeclarations.dependencies, options, chunk.graph.varOrConst);
    if (interopBlock)
        magicString.prepend(interopBlock + '\n\n');
    if (intro)
        magicString.prepend(intro);
    var exportBlock = getExportBlock(moduleDeclarations.exports, moduleDeclarations.dependencies, exportMode);
    if (exportBlock)
        magicString.append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
    if (outro)
        magicString.append(outro); // TODO TypeScript: Awaiting PR
    return magicString
        .indent(indentString) // TODO TypeScript: Awaiting PR
        .prepend(wrapperIntro)
        .append(wrapperOutro);
}

function globalProp(name) {
    if (!name)
        return 'null';
    return "global" + keypath(name);
}
function safeAccess(name) {
    var parts = name.split('.');
    var acc = 'global';
    return parts.map(function (part) { return (acc += property(part), acc); }).join(" && ");
}
var wrapperOutro = '\n\n})));';
function umd(chunk, magicString, _a, options) {
    var exportMode = _a.exportMode, indentString = _a.indentString, getPath = _a.getPath, intro = _a.intro, outro = _a.outro;
    if (exportMode !== 'none' && !options.name) {
        error({
            code: 'INVALID_OPTION',
            message: 'You must supply output.name for UMD bundles'
        });
    }
    warnOnBuiltins(chunk);
    var moduleDeclarations = chunk.getModuleDeclarations();
    var globalNameMaker = getGlobalNameMaker(options.globals || blank(), chunk.graph);
    var amdDeps = moduleDeclarations.dependencies.map(function (m) { return "'" + getPath(m.id) + "'"; });
    var cjsDeps = moduleDeclarations.dependencies.map(function (m) { return "require('" + getPath(m.id) + "')"; });
    var trimmed = trimEmptyImports(moduleDeclarations.dependencies);
    var globalDeps = trimmed.map(function (module) { return globalProp(globalNameMaker(module)); });
    var args = trimmed.map(function (m) { return m.name; });
    if (exportMode === 'named') {
        amdDeps.unshift("'exports'");
        cjsDeps.unshift("exports");
        globalDeps.unshift("(" + setupNamespace(options.name, 'global', true, options.globals) + " = " + (options.extend ? globalProp(options.name) + " || " : '') + "{})");
        args.unshift('exports');
    }
    var amdOptions = options.amd || {};
    var amdParams = (amdOptions.id ? "'" + amdOptions.id + "', " : "") +
        (amdDeps.length ? "[" + amdDeps.join(', ') + "], " : "");
    var define = amdOptions.define || 'define';
    var cjsExport = exportMode === 'default' ? "module.exports = " : "";
    var defaultExport = exportMode === 'default'
        ? setupNamespace(options.name, 'global', true, options.globals) + " = "
        : '';
    var useStrict = options.strict !== false ? " 'use strict';" : "";
    var globalExport;
    if (options.noConflict === true) {
        var factory = void 0;
        if (exportMode === 'default') {
            factory = "var exports = factory(" + globalDeps + ");";
        }
        else if (exportMode === 'named') {
            var module = globalDeps.shift();
            factory = "var exports = " + module + ";\n\t\t\t\tfactory(" + ['exports'].concat(globalDeps) + ");";
        }
        globalExport = "(function() {\n\t\t\t\tvar current = " + safeAccess(options.name) + ";\n\t\t\t\t" + factory + "\n\t\t\t\t" + globalProp(options.name) + " = exports;\n\t\t\t\texports.noConflict = function() { " + globalProp(options.name) + " = current; return exports; };\n\t\t\t})()";
    }
    else {
        globalExport = "(" + defaultExport + "factory(" + globalDeps + "))";
    }
    var wrapperIntro = ("(function (global, factory) {\n\t\t\ttypeof exports === 'object' && typeof module !== 'undefined' ? " + cjsExport + "factory(" + cjsDeps.join(', ') + ") :\n\t\t\ttypeof " + define + " === 'function' && " + define + ".amd ? " + define + "(" + amdParams + "factory) :\n\t\t\t" + globalExport + ";\n\t\t}(this, (function (" + args + ") {" + useStrict + "\n\n\t\t")
        .replace(/^\t\t/gm, '')
        .replace(/^\t/gm, indentString || '\t');
    // var foo__default = 'default' in foo ? foo['default'] : foo;
    var interopBlock = getInteropBlock(moduleDeclarations.dependencies, options, chunk.graph.varOrConst);
    if (interopBlock)
        magicString.prepend(interopBlock + '\n\n');
    if (intro)
        magicString.prepend(intro);
    var exportBlock = getExportBlock(moduleDeclarations.exports, moduleDeclarations.dependencies, exportMode);
    if (exportBlock)
        magicString.append('\n\n' + exportBlock); // TODO TypeScript: Awaiting PR
    if (exportMode === 'named' && options.legacy !== true)
        magicString.append("\n\n" + esModuleExport); // TODO TypeScript: Awaiting PR
    if (outro)
        magicString.append(outro); // TODO TypeScript: Awaiting PR
    return magicString
        .trim() // TODO TypeScript: Awaiting PR
        .indent(indentString)
        .append(wrapperOutro)
        .prepend(wrapperIntro);
}

var finalisers = { system: system, amd: amd, cjs: cjs, es: es, iife: iife, umd: umd };

function badExports(option, keys) {
    error({
        code: 'INVALID_EXPORT_OPTION',
        message: "'" + option + "' was specified for options.exports, but entry module has following exports: " + keys.join(', ')
    });
}
function getExportMode(chunk, _a) {
    var exportMode = _a.exports, name = _a.name, format = _a.format;
    var exportKeys = chunk.getExportNames();
    if (exportMode === 'default') {
        if (exportKeys.length !== 1 || exportKeys[0] !== 'default') {
            badExports('default', exportKeys);
        }
    }
    else if (exportMode === 'none' && exportKeys.length) {
        badExports('none', exportKeys);
    }
    if (!exportMode || exportMode === 'auto') {
        if (exportKeys.length === 0) {
            exportMode = 'none';
        }
        else if (exportKeys.length === 1 && exportKeys[0] === 'default') {
            exportMode = 'default';
        }
        else {
            if (chunk.isEntryModuleFacade && format !== 'es' && exportKeys.indexOf('default') !== -1) {
                chunk.graph.warn({
                    code: 'MIXED_EXPORTS',
                    message: "Using named and default exports together. Consumers of your bundle will have to use " + (name ||
                        'bundle') + "['default'] to access the default export, which may not be what you want. Use `exports: 'named'` to disable this warning",
                    url: "https://rollupjs.org/#exports"
                });
            }
            exportMode = 'named';
        }
    }
    if (!/(?:default|named|none)/.test(exportMode)) {
        error({
            code: 'INVALID_EXPORT_OPTION',
            message: "options.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')"
        });
    }
    return exportMode;
}

function getIndentString(magicString, options) {
    if (options.indent === true) {
        return magicString.getIndentString();
    }
    return options.indent || '';
}

function transformBundle(code, plugins, sourcemapChain, options) {
    return plugins.reduce(function (promise, plugin) {
        if (!plugin.transformBundle)
            return promise;
        return promise.then(function (code) {
            return Promise.resolve()
                .then(function () {
                return plugin.transformBundle(code, options);
            })
                .then(function (result) {
                if (result == null)
                    return code;
                if (typeof result === 'string') {
                    result = {
                        code: result,
                        map: undefined
                    };
                }
                var map = typeof result.map === 'string' ? JSON.parse(result.map) : result.map;
                if (map && typeof map.mappings === 'string') {
                    map.mappings = decode$1$1(map.mappings);
                }
                // strict null check allows 'null' maps to not be pushed to the chain, while 'undefined' gets the missing map warning
                if (map !== null) {
                    sourcemapChain.push(map || { missing: true, plugin: plugin.name });
                }
                return result.code;
            })
                .catch(function (err) {
                error({
                    code: 'BAD_BUNDLE_TRANSFORMER',
                    message: "Error transforming bundle" + (plugin.name ? " with '" + plugin.name + "' plugin" : '') + ": " + err.message,
                    plugin: plugin.name
                });
            });
        });
    }, Promise.resolve(code));
}

var Source = /** @class */ (function () {
    function Source(filename, content) {
        this.isOriginal = true;
        this.filename = filename;
        this.content = content;
    }
    Source.prototype.traceSegment = function (line, column, name) {
        return { line: line, column: column, name: name, source: this };
    };
    return Source;
}());
var Link = /** @class */ (function () {
    function Link(map, sources) {
        this.sources = sources;
        this.names = map.names;
        this.mappings = map.mappings;
    }
    Link.prototype.traceMappings = function () {
        var _this = this;
        var sources = [];
        var sourcesContent = [];
        var names = [];
        var mappings = this.mappings.map(function (line) {
            var tracedLine = [];
            line.forEach(function (segment) {
                var source = _this.sources[segment[1]];
                if (!source)
                    return;
                var traced = source.traceSegment(segment[2], segment[3], _this.names[segment[4]]);
                if (traced) {
                    var sourceIndex = null;
                    var nameIndex = null;
                    segment = [segment[0], null, traced.line, traced.column];
                    // newer sources are more likely to be used, so search backwards.
                    sourceIndex = sources.lastIndexOf(traced.source.filename);
                    if (sourceIndex === -1) {
                        sourceIndex = sources.length;
                        sources.push(traced.source.filename);
                        sourcesContent[sourceIndex] = traced.source.content;
                    }
                    else if (sourcesContent[sourceIndex] == null) {
                        sourcesContent[sourceIndex] = traced.source.content;
                    }
                    else if (traced.source.content != null &&
                        sourcesContent[sourceIndex] !== traced.source.content) {
                        error({
                            message: "Multiple conflicting contents for sourcemap source " + source.filename
                        });
                    }
                    segment[1] = sourceIndex;
                    if (traced.name) {
                        nameIndex = names.indexOf(traced.name);
                        if (nameIndex === -1) {
                            nameIndex = names.length;
                            names.push(traced.name);
                        }
                        segment[4] = nameIndex;
                    }
                    tracedLine.push(segment);
                }
            });
            return tracedLine;
        });
        return { sources: sources, sourcesContent: sourcesContent, names: names, mappings: mappings };
    };
    Link.prototype.traceSegment = function (line, column, name) {
        var segments = this.mappings[line];
        if (!segments)
            return null;
        for (var i = 0; i < segments.length; i += 1) {
            var segment = segments[i];
            if (segment[0] > column)
                return null;
            if (segment[0] === column) {
                var source = this.sources[segment[1]];
                if (!source)
                    return null;
                return source.traceSegment(segment[2], segment[3], this.names[segment[4]] || name);
            }
        }
        return null;
    };
    return Link;
}());
// TODO TypeScript: Fix <any> typecasts
function collapseSourcemaps(bundle, file, map, modules, bundleSourcemapChain) {
    var moduleSources = modules.filter(function (module) { return !module.excludeFromSourcemap; }).map(function (module) {
        var sourcemapChain = module.sourcemapChain;
        var source;
        if (!module.originalSourcemap) {
            source = new Source(module.id, module.originalCode);
        }
        else {
            var sources_1 = module.originalSourcemap.sources;
            var sourcesContent_1 = module.originalSourcemap.sourcesContent || [];
            if (sources_1 == null || (sources_1.length <= 1 && sources_1[0] == null)) {
                source = new Source(module.id, sourcesContent_1[0]);
                sourcemapChain = [module.originalSourcemap].concat(sourcemapChain);
            }
            else {
                // TODO indiscriminately treating IDs and sources as normal paths is probably bad.
                var directory_1 = dirname(module.id) || '.';
                var sourceRoot_1 = module.originalSourcemap.sourceRoot || '.';
                var baseSources = sources_1.map(function (source, i) {
                    return new Source(resolve(directory_1, sourceRoot_1, source), sourcesContent_1[i]);
                });
                source = new Link(module.originalSourcemap, baseSources);
            }
        }
        sourcemapChain.forEach(function (map) {
            if (map.missing) {
                bundle.graph.warn({
                    code: 'SOURCEMAP_BROKEN',
                    plugin: map.plugin,
                    message: "Sourcemap is likely to be incorrect: a plugin" + (map.plugin ? " ('" + map.plugin + "')" : "") + " was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help",
                    url: "https://github.com/rollup/rollup/wiki/Troubleshooting#sourcemap-is-likely-to-be-incorrect"
                });
                map = {
                    names: [],
                    mappings: ''
                };
            }
            source = new Link(map, [source]);
        });
        return source;
    });
    var source = new Link(map, moduleSources);
    bundleSourcemapChain.forEach(function (map) {
        source = new Link(map, [source]);
    });
    var _a = source.traceMappings(), sources = _a.sources, sourcesContent = _a.sourcesContent, names = _a.names, mappings = _a.mappings;
    if (file) {
        var directory_2 = dirname(file);
        sources = sources.map(function (source) { return relative(directory_2, source); });
        map.file = basename(file);
    }
    // we re-use the `map` object because it has convenient toString/toURL methods
    map.sources = sources;
    map.sourcesContent = sourcesContent;
    map.names = names;
    map.mappings = encode$1$1(mappings);
    return map;
}

function callIfFunction(thing) {
    return typeof thing === 'function' ? thing() : thing;
}

var Chunk$1 = /** @class */ (function () {
    function Chunk(graph, orderedModules) {
        var _this = this;
        this.graph = graph;
        this.orderedModules = orderedModules;
        this.exportedVariableNames = new Map();
        this.imports = [];
        this.exports = {};
        this.dependencies = undefined;
        this.entryModule = undefined;
        this.isEntryModuleFacade = orderedModules.length === 0;
        orderedModules.forEach(function (module) {
            if (module.isEntryPoint) {
                if (!_this.entryModule) {
                    _this.entryModule = module;
                    _this.isEntryModuleFacade = true;
                }
                else {
                    _this.isEntryModuleFacade = false;
                }
            }
            module.chunk = _this;
        });
    }
    Chunk.prototype.setId = function (id) {
        this.id = id;
        this.name = makeLegal(id);
    };
    // ensure that the module exports or reexports the given variable
    // we don't replace reexports with the direct reexport from the final module
    // as this might result in exposing an internal module which taints an entryModule chunk
    Chunk.prototype.ensureExport = function (module, variable, exportName) {
        // assert(module.chunk === this || module.isExternal);
        var safeExportName = this.exportedVariableNames.get(variable);
        if (safeExportName) {
            return safeExportName;
        }
        var i = 0;
        safeExportName = exportName;
        while (this.exports[safeExportName]) {
            safeExportName = exportName + '$' + ++i;
        }
        variable.exportName = safeExportName;
        this.exports[safeExportName] = { module: module, name: safeExportName, variable: variable };
        this.exportedVariableNames.set(variable, safeExportName);
        // if we've just exposed an export of a non-entry-point or had to use a safe name,
        // then note we are no longer an entry point chunk
        // we will then need an entry point facade if this is an entry point module
        if (this.isEntryModuleFacade && (!module.isEntryPoint || safeExportName !== exportName)) {
            this.isEntryModuleFacade = false;
        }
        return safeExportName;
    };
    Chunk.prototype.generateEntryExports = function (entryModule) {
        var _this = this;
        entryModule.getAllExports().forEach(function (exportName) {
            var traced = _this.traceExport(entryModule, exportName);
            var variable = traced.module.traceExport(traced.name);
            var tracedName;
            if (traced.module.chunk === _this || traced.module.isExternal) {
                tracedName = traced.name;
            }
            else {
                // if we exposed an export in another module ensure it is exported there
                tracedName = traced.module.chunk.ensureExport(traced.module, variable, traced.name);
            }
            _this.exports[exportName] = {
                module: traced.module,
                name: tracedName,
                variable: variable
            };
            _this.exportedVariableNames.set(variable, exportName);
        });
    };
    Chunk.prototype.collectDependencies = function (entryFacade) {
        var _this = this;
        if (entryFacade) {
            this.dependencies = [entryFacade.chunk];
            return;
        }
        this.dependencies = [];
        this.orderedModules.forEach(function (module) {
            module.dependencies.forEach(function (dep) {
                if (dep.chunk === _this) {
                    return;
                }
                var depModule;
                if (dep instanceof Module) {
                    depModule = dep.chunk;
                }
                else {
                    // unused pure external modules can be skipped
                    if (!dep.used && _this.graph.isPureExternalModule(dep.id)) {
                        return;
                    }
                    depModule = dep;
                }
                if (!_this.dependencies.some(function (dep) { return dep === depModule; })) {
                    _this.dependencies.push(depModule);
                }
            });
        });
        Object.keys(this.exports).forEach(function (exportName) {
            var expt = _this.exports[exportName];
            if (expt.module instanceof ExternalModule) {
                if (!_this.dependencies.some(function (dep) { return dep === expt.module; })) {
                    _this.dependencies.push(expt.module);
                }
            }
            else if (expt.module.chunk !== _this) {
                if (!_this.dependencies.some(function (dep) { return dep === expt.module.chunk; })) {
                    _this.dependencies.push(expt.module.chunk);
                }
            }
        });
    };
    Chunk.prototype.generateImports = function () {
        var _this = this;
        this.orderedModules.forEach(function (module) {
            Object.keys(module.imports).forEach(function (importName) {
                var declaration = module.imports[importName];
                _this.traceImport(declaration.module, declaration.name);
            });
        });
    };
    Chunk.prototype.populateImport = function (variable, tracedExport) {
        if (!variable.included) {
            return;
        }
        var exportName, importModule;
        // ensure that the variable is exported by the other chunk to this one
        if (tracedExport.module instanceof Module) {
            importModule = tracedExport.module.chunk;
            exportName = tracedExport.module.chunk.ensureExport(tracedExport.module, variable, tracedExport.name);
        }
        else {
            importModule = tracedExport.module;
            exportName = variable.name;
        }
        // if we already import this variable skip
        if (this.imports.some(function (impt) { return impt.variables.some(function (v) { return v.variable === variable; }); })) {
            return;
        }
        var impt = this.imports.find(function (impt) { return impt.module === importModule; });
        if (!impt) {
            this.imports.push((impt = { module: importModule, variables: [] }));
        }
        impt.variables.push({
            module: tracedExport.module,
            variable: variable,
            name: exportName[0] === '*' ? '*' : exportName
        });
    };
    Chunk.prototype.getImportIds = function () {
        return this.dependencies.map(function (module) { return module.id; });
    };
    Chunk.prototype.getExportNames = function () {
        return Object.keys(this.exports);
    };
    Chunk.prototype.getJsonModules = function () {
        return this.orderedModules.map(function (module) { return module.toJSON(); });
    };
    Chunk.prototype.traceImport = function (module, exportName) {
        var _this = this;
        var tracedExport = this.traceExport(module, exportName);
        // ignore imports to modules already in this chunk
        if (!tracedExport || tracedExport.module.chunk === this) {
            return tracedExport;
        }
        var variable = tracedExport.module.traceExport(tracedExport.name);
        // namespace variable can indicate multiple imports
        if (tracedExport.name === '*') {
            Object.keys(variable.originals || variable.module.declarations).forEach(function (importName) {
                var original = (variable.originals ||
                    variable.module.declarations)[importName];
                _this.populateImport(original, {
                    name: importName,
                    module: tracedExport.module
                });
            });
            return tracedExport;
        }
        this.populateImport(variable, tracedExport);
        return tracedExport;
    };
    // trace a module export to its exposed chunk module export
    // either in this chunk or in another
    Chunk.prototype.traceExport = function (module, name) {
        if (name === '*') {
            return { name: name, module: module };
        }
        if (module instanceof ExternalModule) {
            return { name: name, module: module };
        }
        if (module.chunk !== this) {
            // we follow reexports if they are not entry points in the hope
            // that we can get an entry point reexport to reduce the chance of
            // tainting an entryModule chunk by exposing other unnecessary exports
            if (module.isEntryPoint)
                return { name: name, module: module };
            return module.chunk.traceExport(module, name);
        }
        var exportDeclaration = module.exports[name];
        if (exportDeclaration) {
            // if export binding is itself an import binding then continue tracing
            var importDeclaration = module.imports[exportDeclaration.localName];
            if (importDeclaration)
                return this.traceImport(importDeclaration.module, importDeclaration.name);
            return { name: name, module: module };
        }
        var reexportDeclaration = module.reexports[name];
        if (reexportDeclaration) {
            return this.traceExport(reexportDeclaration.module, reexportDeclaration.localName);
        }
        if (name === 'default') {
            return;
        }
        // external star exports
        if (name[0] === '*') {
            return { name: '*', module: this.graph.moduleById.get(name.substr(1)) };
        }
        // resolve known star exports
        for (var i = 0; i < module.exportAllModules.length; i++) {
            var exportAllModule = module.exportAllModules[i];
            // we have to ensure the right export all module
            if (exportAllModule.traceExport(name)) {
                return this.traceExport(exportAllModule, name);
            }
        }
    };
    Chunk.prototype.collectAddon = function (initialAddon, addonName, sep) {
        if (sep === void 0) { sep = '\n'; }
        return runSequence([
            { pluginName: 'rollup', source: initialAddon }
        ]
            .concat(this.graph.plugins.map(function (plugin, idx) {
            return {
                pluginName: plugin.name || "Plugin at pos " + idx,
                source: plugin[addonName]
            };
        }))
            .map(function (addon) {
            addon.source = callIfFunction(addon.source);
            return addon;
        })
            .filter(function (addon) {
            return addon.source;
        })
            .map(function (_a) {
            var pluginName = _a.pluginName, source = _a.source;
            return Promise.resolve(source).catch(function (err) {
                error({
                    code: 'ADDON_ERROR',
                    message: "Could not retrieve " + addonName + ". Check configuration of " + pluginName + ".\n\tError Message: " + err.message
                });
            });
        })).then(function (addons) { return addons.filter(Boolean).join(sep); });
    };
    Chunk.prototype.setDynamicImportResolutions = function (_a) {
        var _this = this;
        var format = _a.format;
        var es = format === 'es';
        var dynamicImportMechanism;
        var hasDynamicImports = false;
        if (!es) {
            if (format === 'cjs') {
                dynamicImportMechanism = {
                    left: 'Promise.resolve(require(',
                    right: '))',
                    interopLeft: 'Promise.resolve({ default: require(',
                    interopRight: ') })'
                };
            }
            else if (format === 'amd') {
                dynamicImportMechanism = {
                    left: 'new Promise(function (resolve, reject) { require([',
                    right: '], resolve, reject) })',
                    interopLeft: 'new Promise(function (resolve, reject) { require([',
                    interopRight: '], function (m) { resolve({ default: m }) }, reject) })'
                };
            }
            else if (format === 'system') {
                dynamicImportMechanism = {
                    left: 'module.import(',
                    right: ')'
                };
            }
        }
        this.orderedModules.forEach(function (module) {
            module.dynamicImportResolutions.forEach(function (replacement, index) {
                var node = module.dynamicImports[index];
                hasDynamicImports = true;
                if (!replacement)
                    return;
                if (replacement instanceof Module) {
                    // if we have the module in the chunk, inline as Promise.resolve(namespace)
                    // ensuring that we create a namespace import of it as well
                    if (replacement.chunk === _this) {
                        node.setResolution(replacement.namespace(), false);
                        // for the module in another chunk, import that other chunk directly
                    }
                    else {
                        node.setResolution("\"" + replacement.chunk.id + "\"", false);
                    }
                    // external dynamic import resolution
                }
                else if (replacement instanceof ExternalModule) {
                    node.setResolution("\"" + replacement.id + "\"", true);
                    // AST Node -> source replacement
                }
                else {
                    node.setResolution(replacement, false);
                }
            });
        });
        if (hasDynamicImports)
            return dynamicImportMechanism;
    };
    Chunk.prototype.setIdentifierRenderResolutions = function (options) {
        var _this = this;
        var used = blank();
        var es = options.format === 'es' || options.format === 'system';
        // ensure no conflicts with globals
        Object.keys(this.graph.scope.variables).forEach(function (name) { return (used[name] = 1); });
        function getSafeName(name) {
            var safeName = name;
            while (used[safeName]) {
                safeName = name + "$" + used[name]++;
            }
            used[safeName] = 1;
            return safeName;
        }
        // reserved internal binding names for system format wiring
        if (options.format === 'system') {
            used['_setter'] = used['_starExcludes'] = used['_$p'] = 1;
        }
        var toDeshadow = new Set();
        if (!es) {
            this.dependencies.forEach(function (module) {
                if (module.isExternal) {
                    var safeName = getSafeName(module.name);
                    toDeshadow.add(safeName);
                    module.name = safeName;
                }
            });
        }
        this.imports.forEach(function (impt) {
            impt.variables.forEach(function (_a) {
                var name = _a.name, module = _a.module, variable = _a.variable;
                var safeName;
                if (module.isExternal) {
                    if (variable.name === '*') {
                        safeName = module.name;
                    }
                    else if (variable.name === 'default') {
                        if (module.exportsNamespace || (!es && module.exportsNames)) {
                            safeName = module.name + "__default";
                        }
                        else {
                            safeName = module.name;
                        }
                    }
                    else {
                        safeName = es ? variable.name : module.name + "." + name;
                    }
                    if (es) {
                        safeName = getSafeName(safeName);
                        toDeshadow.add(safeName);
                    }
                }
                else if (es) {
                    safeName = getSafeName(variable.name);
                }
                else {
                    safeName = module.chunk.name + "." + name;
                }
                variable.setSafeName(safeName);
            });
        });
        this.orderedModules.forEach(function (module) {
            forOwn(module.scope.variables, function (variable) {
                if (variable.isDefault && variable.referencesOriginal()) {
                    variable.setSafeName(null);
                    return;
                }
                if (!variable.isDefault || !variable.hasId) {
                    var safeName = void 0;
                    if (es || !variable.isReassigned || variable.isId) {
                        safeName = getSafeName(variable.name);
                    }
                    else {
                        var safeExportName = _this.exportedVariableNames.get(variable);
                        if (safeExportName) {
                            safeName = "exports." + safeExportName;
                        }
                        else {
                            safeName = getSafeName(variable.name);
                        }
                    }
                    variable.setSafeName(safeName);
                }
            });
            // deconflict reified namespaces
            var namespace = module.namespace();
            if (namespace.needsNamespaceBlock) {
                namespace.name = getSafeName(namespace.name);
            }
        });
        this.graph.scope.deshadow(toDeshadow, this.orderedModules.map(function (module) { return module.scope; }));
    };
    Chunk.prototype.getCheckReexportDeclarations = function () {
        var reexportDeclarations = {};
        for (var name in this.exports) {
            var expt = this.exports[name];
            // skip local exports
            if (expt.module.chunk === this)
                continue;
            var depId = void 0;
            if (expt.module.isExternal) {
                depId = expt.module.id;
            }
            else {
                depId = expt.module.chunk.id;
            }
            var exportDeclaration = (reexportDeclarations[depId] = reexportDeclarations[depId] || []);
            exportDeclaration.push({
                imported: expt.name,
                reexported: name[0] === '*' ? '*' : name
            });
        }
        return reexportDeclarations;
    };
    Chunk.prototype.getChunkDependencyDeclarations = function () {
        var _this = this;
        var reexportDeclarations = this.getCheckReexportDeclarations();
        var dependencies = [];
        // shortcut cross-chunk relations can be added by traceExport
        this.imports.forEach(function (impt) {
            if (_this.dependencies.indexOf(impt.module) === -1)
                _this.dependencies.push(impt.module);
        });
        this.dependencies.forEach(function (dep) {
            var importSpecifiers = _this.imports.find(function (impt) { return impt.module === dep; });
            var imports;
            if (importSpecifiers && importSpecifiers.variables.length) {
                imports = [];
                for (var i = 0; i < importSpecifiers.variables.length; i++) {
                    var impt = importSpecifiers.variables[i];
                    imports.push({
                        local: impt.variable.safeName || impt.variable.name,
                        imported: impt.name
                    });
                }
            }
            var reexports = reexportDeclarations[dep.id];
            var exportsNames, exportsNamespace, exportsDefault;
            if (dep.isExternal) {
                exportsNames = dep.exportsNames;
                exportsNamespace = dep.exportsNamespace;
                exportsDefault = 'default' in dep.declarations;
            }
            else {
                exportsNames = true;
                // we don't want any interop patterns to trigger
                exportsNamespace = false;
                exportsDefault = false;
            }
            dependencies.push({
                id: dep.id,
                name: dep.name,
                isChunk: !dep.isExternal,
                exportsNames: exportsNames,
                exportsNamespace: exportsNamespace,
                exportsDefault: exportsDefault,
                reexports: reexports,
                imports: imports
            });
        });
        return dependencies;
    };
    Chunk.prototype.getChunkExportDeclarations = function () {
        var exports = [];
        var _loop_1 = function (name) {
            var expt = this_1.exports[name];
            // skip external exports
            if (expt.module.chunk !== this_1)
                return "continue";
            // determine if a hoisted export (function)
            var hoisted = false;
            if (expt.variable instanceof LocalVariable) {
                expt.variable.declarations.forEach(function (decl) {
                    if (decl.type === NodeType.ExportDefaultDeclaration) {
                        if (decl.declaration.type === NodeType.FunctionDeclaration)
                            hoisted = true;
                    }
                    else if (decl.parent.type === NodeType.FunctionDeclaration) {
                        hoisted = true;
                    }
                });
            }
            exports.push({
                local: expt.variable.getName(),
                exported: name,
                hoisted: hoisted
            });
        };
        var this_1 = this;
        for (var name in this.exports) {
            _loop_1(name);
        }
        return exports;
    };
    Chunk.prototype.getModuleDeclarations = function () {
        return {
            dependencies: this.getChunkDependencyDeclarations(),
            exports: this.getChunkExportDeclarations()
        };
    };
    Chunk.prototype.render = function (options) {
        var _this = this;
        return Promise.resolve()
            .then(function () {
            return Promise.all([
                _this.collectAddon(options.banner, 'banner'),
                _this.collectAddon(options.footer, 'footer'),
                _this.collectAddon(options.intro, 'intro', '\n\n'),
                _this.collectAddon(options.outro, 'outro', '\n\n')
            ]);
        })
            .then(function (_a) {
            var banner = _a[0], footer = _a[1], intro = _a[2], outro = _a[3];
            // Determine export mode - 'default', 'named', 'none'
            var exportMode = _this.isEntryModuleFacade ? getExportMode(_this, options) : 'named';
            var magicString = new Bundle({ separator: '\n\n' });
            var usedModules = [];
            timeStart('render modules');
            var renderOptions = {
                legacy: _this.graph.legacy,
                freeze: options.freeze !== false,
                systemBindings: options.format === 'system',
                importMechanism: _this.graph.dynamicImport && _this.setDynamicImportResolutions(options)
            };
            _this.setIdentifierRenderResolutions(options);
            _this.orderedModules.forEach(function (module) {
                var source = module.render(renderOptions);
                if (source.toString().length) {
                    magicString.addSource(source);
                    usedModules.push(module);
                }
            });
            if (!magicString.toString().trim() && _this.getExportNames().length === 0) {
                _this.graph.warn({
                    code: 'EMPTY_BUNDLE',
                    message: 'Generated an empty bundle'
                });
            }
            timeEnd('render modules');
            var indentString = getIndentString(magicString, options);
            var finalise = finalisers[options.format];
            if (!finalise) {
                error({
                    code: 'INVALID_OPTION',
                    message: "Invalid format: " + options.format + " - valid options are " + Object.keys(finalisers).join(', ')
                });
            }
            timeStart('render format');
            var getPath = _this.createGetPath(options);
            if (intro)
                intro += '\n\n';
            if (outro)
                outro = "\n\n" + outro;
            magicString = finalise(_this, magicString.trim(), // TODO TypeScript: Awaiting MagicString PR
            {
                exportMode: exportMode,
                getPath: getPath,
                indentString: indentString,
                intro: intro,
                outro: outro,
                dynamicImport: !!renderOptions.importMechanism
            }, options);
            timeEnd('render format');
            if (banner)
                magicString.prepend(banner + '\n');
            if (footer)
                magicString.append('\n' + footer); // TODO TypeScript: Awaiting MagicString PR
            var prevCode = magicString.toString();
            var map = null;
            var bundleSourcemapChain = [];
            return transformBundle(prevCode, _this.graph.plugins, bundleSourcemapChain, options).then(function (code) {
                if (options.sourcemap) {
                    timeStart('sourcemap');
                    var file = options.file ? options.sourcemapFile || options.file : _this.id;
                    if (file)
                        file = resolve(typeof process !== 'undefined' ? process.cwd() : '', file);
                    if (_this.graph.hasLoaders ||
                        _this.graph.plugins.find(function (plugin) {
                            return Boolean(plugin.transform || plugin.transformBundle);
                        })) {
                        map = magicString.generateMap({}); // TODO TypeScript: Awaiting missing version in SourceMap type
                        if (typeof map.mappings === 'string') {
                            map.mappings = decode$1$1(map.mappings);
                        }
                        map = collapseSourcemaps(_this, file, map, usedModules, bundleSourcemapChain);
                    }
                    else {
                        map = magicString.generateMap({ file: file, includeContent: true }); // TODO TypeScript: Awaiting missing version in SourceMap type
                    }
                    map.sources = map.sources.map(normalize);
                    timeEnd('sourcemap');
                }
                if (code[code.length - 1] !== '\n')
                    code += '\n';
                return { code: code, map: map }; // TODO TypeScript: Awaiting missing version in SourceMap type
            });
        });
    };
    Chunk.prototype.createGetPath = function (options) {
        var _this = this;
        var optionsPaths = options.paths;
        var getPath = typeof optionsPaths === 'function'
            ? function (id) {
                return optionsPaths(id, _this.id) || _this.graph.getPathRelativeToBaseDirname(id, _this.id);
            }
            : optionsPaths
                ? function (id) {
                    return optionsPaths.hasOwnProperty(id)
                        ? optionsPaths[id]
                        : _this.graph.getPathRelativeToBaseDirname(id, _this.id);
                }
                : function (id) { return _this.graph.getPathRelativeToBaseDirname(id, _this.id); };
        return getPath;
    };
    return Chunk;
}());

var GlobalScope = /** @class */ (function (_super) {
    __extends(GlobalScope, _super);
    function GlobalScope() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GlobalScope.prototype.findVariable = function (name) {
        if (!this.variables[name]) {
            this.variables[name] = new GlobalVariable(name);
        }
        return this.variables[name];
    };
    GlobalScope.prototype.deshadow = function (names, children) {
        if (children === void 0) { children = this.children; }
        _super.prototype.deshadow.call(this, names, children);
    };
    return GlobalScope;
}(Scope));

var CHAR_CODE_A = 97;
var CHAR_CODE_0 = 48;
function intToHex(num) {
    if (num < 10)
        return String.fromCharCode(CHAR_CODE_0 + num);
    else
        return String.fromCharCode(CHAR_CODE_A + (num - 10));
}
function Uint8ArrayToHexString(buffer) {
    var str = '';
    // hex conversion - 2 chars per 8 bit component
    for (var i = 0; i < buffer.length; i++) {
        var num = buffer[i];
        // big endian conversion, but whatever
        str += intToHex(num >> 4);
        str += intToHex(num & 0xf);
    }
    return str;
}
function Uint8ArrayXor(to, from) {
    for (var i = 0; i < to.length; i++)
        to[i] = to[i] ^ from[i];
    return to;
}
function randomUint8Array(len) {
    var buffer = new Uint8Array(len);
    for (var i = 0; i < buffer.length; i++)
        buffer[i] = Math.random() * (2 << 8);
    return buffer;
}

// Return the first non-null or -undefined result from an array of
// sync functions
function firstSync(candidates) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return candidates.reduce(function (result, candidate) {
            return result != null ? result : candidate.apply(void 0, args);
        }, null);
    };
}

function generateChunkName(id, chunkNames, startAtTwo) {
    if (startAtTwo === void 0) { startAtTwo = false; }
    var name = basename(id);
    var ext = extname(name);
    name = name.substr(0, name.length - ext.length);
    if (ext !== '.js' && ext !== '.mjs') {
        name += ext;
        ext = '.js';
    }
    var uniqueName = name;
    var uniqueIndex = startAtTwo ? 2 : 1;
    while (chunkNames[uniqueName])
        uniqueName = name + uniqueIndex++;
    chunkNames[uniqueName] = true;
    return uniqueName + ext;
}
var Graph = /** @class */ (function () {
    function Graph(options) {
        var _this = this;
        this.cachedModules = new Map();
        if (options.cache) {
            options.cache.modules.forEach(function (module) {
                _this.cachedModules.set(module.id, module);
            });
        }
        delete options.cache; // TODO not deleting it here causes a memory leak; needs further investigation
        this.plugins = ensureArray(options.plugins);
        options = this.plugins.reduce(function (acc, plugin) {
            if (plugin.options)
                return plugin.options(acc) || acc;
            return acc;
        }, options);
        if (!options.input) {
            throw new Error('You must supply options.input to rollup');
        }
        this.treeshake = options.treeshake !== false;
        if (this.treeshake) {
            this.treeshakingOptions = {
                propertyReadSideEffects: options.treeshake
                    ? options.treeshake.propertyReadSideEffects !== false
                    : true,
                pureExternalModules: options.treeshake
                    ? options.treeshake.pureExternalModules
                    : false
            };
            if (this.treeshakingOptions.pureExternalModules === true) {
                this.isPureExternalModule = function () { return true; };
            }
            else if (typeof this.treeshakingOptions.pureExternalModules === 'function') {
                this.isPureExternalModule = this.treeshakingOptions.pureExternalModules;
            }
            else if (Array.isArray(this.treeshakingOptions.pureExternalModules)) {
                var pureExternalModules_1 = new Set(this.treeshakingOptions.pureExternalModules);
                this.isPureExternalModule = function (id) { return pureExternalModules_1.has(id); };
            }
            else {
                this.isPureExternalModule = function () { return false; };
            }
        }
        else {
            this.isPureExternalModule = function () { return false; };
        }
        this.resolveId = first([
            (function (id, parentId) {
                return _this.isExternal(id, parentId, false) ? false : null;
            })
        ]
            .concat(this.plugins.map(function (plugin) { return plugin.resolveId; }).filter(Boolean))
            .concat(resolveId(options)));
        var loaders = this.plugins.map(function (plugin) { return plugin.load; }).filter(Boolean);
        this.hasLoaders = loaders.length !== 0;
        this.load = first(loaders.concat(load));
        this.handleMissingExport = firstSync(this.plugins
            .map(function (plugin) { return plugin.missingExport; })
            .filter(Boolean)
            .concat(handleMissingExport));
        this.scope = new GlobalScope();
        // TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
        ['module', 'exports', '_interopDefault'].forEach(function (name) {
            _this.scope.findVariable(name); // creates global variable as side-effect
        });
        this.moduleById = new Map();
        this.modules = [];
        this.externalModules = [];
        this.context = String(options.context);
        var optionsModuleContext = options.moduleContext;
        if (typeof optionsModuleContext === 'function') {
            this.getModuleContext = function (id) { return optionsModuleContext(id) || _this.context; };
        }
        else if (typeof optionsModuleContext === 'object') {
            var moduleContext_1 = new Map();
            Object.keys(optionsModuleContext).forEach(function (key) {
                return moduleContext_1.set(resolve(key), optionsModuleContext[key]);
            });
            this.getModuleContext = function (id) { return moduleContext_1.get(id) || _this.context; };
        }
        else {
            this.getModuleContext = function () { return _this.context; };
        }
        if (typeof options.external === 'function') {
            this.isExternal = options.external;
        }
        else {
            var ids_1 = ensureArray(options.external);
            this.isExternal = function (id) { return ids_1.indexOf(id) !== -1; };
        }
        this.onwarn = options.onwarn || makeOnwarn();
        this.varOrConst = options.preferConst ? 'const' : 'var';
        this.legacy = options.legacy;
        this.acornOptions = options.acorn || {};
        var acornPluginsToInject = [];
        this.dynamicImport =
            typeof options.experimentalDynamicImport === 'boolean'
                ? options.experimentalDynamicImport
                : false;
        if (this.dynamicImport) {
            this.resolveDynamicImport = first(this.plugins.map(function (plugin) { return plugin.resolveDynamicImport; }).filter(Boolean).concat([
                (function (specifier, parentId) {
                    return typeof specifier === 'string' && _this.resolveId(specifier, parentId);
                })
            ]));
            acornPluginsToInject.push(injectDynamicImportPlugin);
            this.acornOptions.plugins = this.acornOptions.plugins || {};
            this.acornOptions.plugins.dynamicImport = true;
        }
        acornPluginsToInject.push.apply(acornPluginsToInject, ensureArray(options.acornInjectPlugins));
        this.acornParse = acornPluginsToInject.reduce(function (acc, plugin) { return plugin(acc); }, acorn).parse;
    }
    Graph.prototype.getPathRelativeToBaseDirname = function (resolvedId, parentId) {
        if (isRelative(resolvedId) || isAbsolute(resolvedId)) {
            var relativeToEntry = normalize(relative(dirname(parentId), resolvedId));
            return isRelative(relativeToEntry) ? relativeToEntry : "./" + relativeToEntry;
        }
        return resolvedId;
    };
    Graph.prototype.loadModule = function (entryName) {
        var _this = this;
        return this.resolveId(entryName, undefined).then(function (id) {
            if (id === false) {
                error({
                    code: 'UNRESOLVED_ENTRY',
                    message: "Entry module cannot be external"
                });
            }
            if (id == null) {
                error({
                    code: 'UNRESOLVED_ENTRY',
                    message: "Could not resolve entry (" + entryName + ")"
                });
            }
            return _this.fetchModule(id, undefined);
        });
    };
    Graph.prototype.link = function () {
        this.modules.forEach(function (module) { return module.linkDependencies(); });
        this.modules.forEach(function (module) { return module.bindReferences(); });
    };
    Graph.prototype.includeMarked = function (modules) {
        if (this.treeshake) {
            var addedNewNodes_1;
            do {
                addedNewNodes_1 = false;
                modules.forEach(function (module) {
                    if (module.includeInBundle()) {
                        addedNewNodes_1 = true;
                    }
                });
            } while (addedNewNodes_1);
        }
        else {
            // Necessary to properly replace namespace imports
            modules.forEach(function (module) { return module.includeAllInBundle(); });
        }
    };
    Graph.prototype.buildSingle = function (entryModuleId) {
        var _this = this;
        // Phase 1 – discovery. We load the entry module and find which
        // modules it imports, and import those, until we have all
        // of the entry module's dependencies
        timeStart('phase 1');
        return this.loadModule(entryModuleId).then(function (entryModule) {
            timeEnd('phase 1');
            // Phase 2 - linking. We populate the module dependency links and
            // determine the topological execution order for the bundle
            timeStart('phase 2');
            _this.link();
            var _a = _this.analyseExecution([entryModule]), orderedModules = _a.orderedModules, dynamicImports = _a.dynamicImports;
            timeEnd('phase 2');
            // Phase 3 – marking. We include all statements that should be included
            timeStart('phase 3');
            entryModule.markExports();
            dynamicImports.forEach(function (dynamicImportModule) {
                if (entryModule !== dynamicImportModule)
                    dynamicImportModule.markExports();
                // all dynamic import modules inlined for single-file build
                dynamicImportModule.namespace().includeVariable();
            });
            // only include statements that should appear in the bundle
            _this.includeMarked(orderedModules);
            // check for unused external imports
            _this.externalModules.forEach(function (module) { return module.warnUnusedImports(); });
            timeEnd('phase 3');
            // Phase 4 – we construct the chunk itself, generating its import and export facades
            timeStart('phase 4');
            // generate the imports and exports for the output chunk file
            var chunk = new Chunk$1(_this, orderedModules);
            chunk.setId(entryModule.id);
            chunk.collectDependencies();
            chunk.generateImports();
            chunk.generateEntryExports(entryModule);
            timeEnd('phase 4');
            return chunk;
        });
    };
    Graph.prototype.buildChunks = function (entryModuleIds) {
        var _this = this;
        // Phase 1 – discovery. We load the entry module and find which
        // modules it imports, and import those, until we have all
        // of the entry module's dependencies
        timeStart('phase 1');
        return Promise.all(entryModuleIds.map(function (entryId) { return _this.loadModule(entryId); })).then(function (entryModules) {
            timeEnd('phase 1');
            // Phase 2 - linking. We populate the module dependency links and
            // determine the topological execution order for the bundle
            timeStart('phase 2');
            _this.link();
            var _a = _this.analyseExecution(entryModules), orderedModules = _a.orderedModules, dynamicImports = _a.dynamicImports;
            dynamicImports.forEach(function (dynamicImportModule) {
                if (entryModules.indexOf(dynamicImportModule) === -1)
                    entryModules.push(dynamicImportModule);
            });
            // Phase 3 – marking. We include all statements that should be included
            timeStart('phase 3');
            entryModules.forEach(function (entryModule) {
                entryModule.markExports();
            });
            // only include statements that should appear in the bundle
            _this.includeMarked(orderedModules);
            // check for unused external imports
            _this.externalModules.forEach(function (module) { return module.warnUnusedImports(); });
            timeEnd('phase 3');
            // Phase 4 – we construct the chunks, working out the optimal chunking using
            // entry point graph colouring, before generating the import and export facades
            timeStart('phase 4');
            // TODO: there is one special edge case unhandled here and that is that any module
            //       exposed as an unresolvable export * (to a graph external export *,
            //       either as a namespace import reexported or top-level export *)
            //       should be made to be its own entry point module before chunking
            var chunkModules = {};
            orderedModules.forEach(function (module) {
                var entryPointsHashStr = Uint8ArrayToHexString(module.entryPointsHash);
                var curChunk = chunkModules[entryPointsHashStr];
                if (curChunk) {
                    curChunk.push(module);
                }
                else {
                    chunkModules[entryPointsHashStr] = [module];
                }
            });
            // create each chunk
            var chunkList = [];
            Object.keys(chunkModules).forEach(function (entryHashSum) {
                var chunk = chunkModules[entryHashSum];
                var chunkModulesOrdered = chunk.sort(function (moduleA, moduleB) { return (moduleA.execIndex > moduleB.execIndex ? 1 : -1); });
                chunkList.push(new Chunk$1(_this, chunkModulesOrdered));
            });
            // for each entry point module, ensure its exports
            // are exported by the chunk itself, with safe name deduping
            entryModules.forEach(function (entryModule) {
                entryModule.chunk.generateEntryExports(entryModule);
            });
            // for each chunk module, set up its imports to other
            // chunks, if those variables are included after treeshaking
            chunkList.forEach(function (chunk) {
                chunk.collectDependencies();
                chunk.generateImports();
            });
            // finally prepare output chunks
            var chunks = {};
            // name the chunks
            var chunkNames = blank();
            chunkNames['chunk'] = true;
            chunkList.forEach(function (chunk) {
                // generate the imports and exports for the output chunk file
                if (chunk.entryModule) {
                    var entryName = generateChunkName(chunk.entryModule.id, chunkNames, true);
                    // if the chunk exactly exports the entry point exports then
                    // it can replace the entry point
                    if (chunk.isEntryModuleFacade) {
                        chunks['./' + entryName] = chunk;
                        chunk.setId('./' + entryName);
                        return;
                        // otherwise we create a special re-exporting entry point
                        // facade chunk with no modules
                    }
                    else {
                        var entryPointFacade = new Chunk$1(_this, []);
                        entryPointFacade.setId('./' + entryName);
                        entryPointFacade.collectDependencies(chunk.entryModule);
                        entryPointFacade.generateImports();
                        entryPointFacade.generateEntryExports(chunk.entryModule);
                        chunks['./' + entryName] = entryPointFacade;
                    }
                }
                // name the chunk itself
                var chunkName = generateChunkName('chunk', chunkNames);
                chunk.setId('./' + chunkName);
                chunks['./' + chunkName] = chunk;
            });
            timeEnd('phase 4');
            return chunks;
        });
    };
    Graph.prototype.analyseExecution = function (entryModules) {
        var _this = this;
        var curEntry, curEntryHash;
        var allSeen = {};
        var ordered = [];
        var dynamicImports = [];
        var visit = function (module, parents) {
            if (parents === void 0) { parents = (_a = {}, _a[module.id] = null, _a); }
            if (module.isEntryPoint && module !== curEntry)
                return;
            // Track entry point graph colouring by tracing all modules loaded by a given
            // entry point and colouring those modules by the hash of its id. Colours are mixed as
            // hash xors, providing the unique colouring of the graph into unique hash chunks.
            // This is really all there is to automated chunking, the rest is chunk wiring.
            Uint8ArrayXor(module.entryPointsHash, curEntryHash);
            module.dependencies.forEach(function (depModule) {
                if (!depModule.isExternal) {
                    if (depModule.id in parents) {
                        if (!allSeen[depModule.id]) {
                            _this.warnCycle(depModule.id, module.id, parents);
                        }
                        return;
                    }
                    parents[depModule.id] = module.id;
                    visit(depModule, parents);
                }
            });
            if (_this.dynamicImport) {
                module.dynamicImportResolutions.forEach(function (module) {
                    if (module instanceof Module) {
                        if (dynamicImports.indexOf(module) === -1) {
                            dynamicImports.push(module);
                        }
                    }
                });
            }
            if (allSeen[module.id])
                return;
            allSeen[module.id] = true;
            module.execIndex = ordered.length;
            ordered.push(module);
            var _a;
        };
        for (var i = 0; i < entryModules.length; i++) {
            curEntry = entryModules[i];
            curEntry.isEntryPoint = true;
            curEntryHash = randomUint8Array(10);
            visit(curEntry);
        }
        // new items can be added during this loop
        for (var i = 0; i < dynamicImports.length; i++) {
            curEntry = dynamicImports[i];
            curEntry.isEntryPoint = true;
            curEntryHash = randomUint8Array(10);
            visit(curEntry);
        }
        return { orderedModules: ordered, dynamicImports: dynamicImports };
    };
    Graph.prototype.warnCycle = function (id, parentId, parents) {
        var path = [relativeId(id)];
        var curId = parentId;
        while (curId !== id) {
            path.push(relativeId(curId));
            curId = parents[curId];
            if (!curId)
                break;
        }
        path.push(path[0]);
        path.reverse();
        this.warn({
            code: 'CIRCULAR_DEPENDENCY',
            importer: path[0],
            message: "Circular dependency: " + path.join(' -> ')
        });
    };
    Graph.prototype.fetchModule = function (id, importer) {
        var _this = this;
        // short-circuit cycles
        var existingModule = this.moduleById.get(id);
        if (existingModule) {
            if (existingModule.isExternal)
                throw new Error("Cannot fetch external module " + id);
            return Promise.resolve(existingModule);
        }
        var module = new Module(this, id);
        this.moduleById.set(id, module);
        return this.load(id)
            .catch(function (err) {
            var msg = "Could not load " + id;
            if (importer)
                msg += " (imported by " + importer + ")";
            msg += ": " + err.message;
            throw new Error(msg);
        })
            .then(function (source) {
            if (typeof source === 'string')
                return source;
            if (source && typeof source === 'object' && typeof source.code === 'string')
                return source;
            // TODO report which plugin failed
            error({
                code: 'BAD_LOADER',
                message: "Error loading " + relativeId(id) + ": plugin load hook should return a string, a { code, map } object, or nothing/null"
            });
        })
            .then(function (source) {
            var sourceDescription = typeof source === 'string'
                ? {
                    code: source,
                    ast: null
                }
                : source;
            if (_this.cachedModules.has(id) &&
                _this.cachedModules.get(id).originalCode === sourceDescription.code) {
                return _this.cachedModules.get(id);
            }
            return transform(_this, sourceDescription, id, _this.plugins);
        })
            .then(function (source) {
            module.setSource(source);
            _this.modules.push(module);
            _this.moduleById.set(id, module);
            return _this.fetchAllDependencies(module).then(function () {
                Object.keys(module.exports).forEach(function (name) {
                    if (name !== 'default') {
                        module.exportsAll[name] = module.id;
                    }
                });
                module.exportAllSources.forEach(function (source) {
                    var id = module.resolvedIds[source];
                    var exportAllModule = _this.moduleById.get(id);
                    if (exportAllModule.isExternal)
                        return;
                    Object.keys(exportAllModule.exportsAll).forEach(function (name) {
                        if (name in module.exportsAll) {
                            _this.warn({
                                code: 'NAMESPACE_CONFLICT',
                                reexporter: module.id,
                                name: name,
                                sources: [module.exportsAll[name], exportAllModule.exportsAll[name]],
                                message: "Conflicting namespaces: " + relativeId(module.id) + " re-exports '" + name + "' from both " + relativeId(module.exportsAll[name]) + " and " + relativeId(exportAllModule.exportsAll[name]) + " (will be ignored)"
                            });
                        }
                        else {
                            module.exportsAll[name] = exportAllModule.exportsAll[name];
                        }
                    });
                });
                return module;
            });
        });
    };
    Graph.prototype.fetchAllDependencies = function (module) {
        var _this = this;
        // resolve and fetch dynamic imports where possible
        var fetchDynamicImportsPromise = !this.dynamicImport
            ? Promise.resolve()
            : Promise.all(module.getDynamicImportExpressions().map(function (dynamicImportExpression, index) {
                return Promise.resolve(_this.resolveDynamicImport(dynamicImportExpression, module.id)).then(function (replacement) {
                    if (!replacement) {
                        module.dynamicImportResolutions[index] = null;
                    }
                    else if (typeof dynamicImportExpression !== 'string') {
                        module.dynamicImportResolutions[index] = replacement;
                    }
                    else if (_this.isExternal(replacement, module.id, true)) {
                        var externalModule = void 0;
                        if (!_this.moduleById.has(replacement)) {
                            externalModule = new ExternalModule({
                                graph: _this,
                                id: replacement
                            });
                            _this.externalModules.push(externalModule);
                            _this.moduleById.set(replacement, module);
                        }
                        else {
                            externalModule = _this.moduleById.get(replacement);
                        }
                        module.dynamicImportResolutions[index] = externalModule;
                        externalModule.exportsNamespace = true;
                    }
                    else {
                        return _this.fetchModule(replacement, module.id).then(function (depModule) {
                            module.dynamicImportResolutions[index] = depModule;
                        });
                    }
                });
            })).then(function () { });
        fetchDynamicImportsPromise.catch(function () { });
        return mapSequence(module.sources, function (source) {
            var resolvedId = module.resolvedIds[source];
            return (resolvedId ? Promise.resolve(resolvedId) : _this.resolveId(source, module.id)).then(function (resolvedId) {
                // TODO types of `resolvedId` are not compatable with 'externalId'.
                // `this.resolveId` returns `string`, `void`, and `boolean`
                var externalId = resolvedId || (isRelative(source) ? resolve(module.id, '..', source) : source);
                var isExternal = _this.isExternal(externalId, module.id, true);
                if (!resolvedId && !isExternal) {
                    if (isRelative(source)) {
                        error({
                            code: 'UNRESOLVED_IMPORT',
                            message: "Could not resolve '" + source + "' from " + relativeId(module.id)
                        });
                    }
                    if (resolvedId !== false) {
                        _this.warn({
                            code: 'UNRESOLVED_IMPORT',
                            source: source,
                            importer: relativeId(module.id),
                            message: "'" + source + "' is imported by " + relativeId(module.id) + ", but could not be resolved \u2013 treating it as an external dependency",
                            url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency'
                        });
                    }
                    isExternal = true;
                }
                if (isExternal) {
                    module.resolvedIds[source] = externalId;
                    if (!_this.moduleById.has(externalId)) {
                        var module_1 = new ExternalModule({ graph: _this, id: externalId });
                        _this.externalModules.push(module_1);
                        _this.moduleById.set(externalId, module_1);
                    }
                    var externalModule_1 = _this.moduleById.get(externalId);
                    // add external declarations so we can detect which are never used
                    Object.keys(module.imports).forEach(function (name) {
                        var importDeclaration = module.imports[name];
                        if (importDeclaration.source !== source)
                            return;
                        externalModule_1.traceExport(importDeclaration.name);
                    });
                }
                else {
                    module.resolvedIds[source] = resolvedId;
                    return _this.fetchModule(resolvedId, module.id);
                }
            });
        }).then(function () { return fetchDynamicImportsPromise; });
    };
    Graph.prototype.warn = function (warning) {
        warning.toString = function () {
            var str = '';
            if (warning.plugin)
                str += "(" + warning.plugin + " plugin) ";
            if (warning.loc)
                str += relativeId(warning.loc.file) + " (" + warning.loc.line + ":" + warning.loc.column + ") ";
            str += warning.message;
            return str;
        };
        this.onwarn(warning);
    };
    return Graph;
}());

function addDeprecations(deprecations, warn) {
    var message = "The following options have been renamed \u2014 please update your config: " + deprecations
        .map(function (option) { return option.old + " -> " + option.new; })
        .join(', ');
    warn({
        code: 'DEPRECATED_OPTIONS',
        message: message,
        deprecations: deprecations
    });
}
function checkInputOptions(options) {
    if (options.transform || options.load || options.resolveId || options.resolveExternal) {
        throw new Error('The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details');
    }
}
function checkOutputOptions(options) {
    if (options.format === 'es6') {
        error({
            message: 'The `es6` output format is deprecated – use `es` instead',
            url: "https://rollupjs.org/#format-f-output-format-"
        });
    }
    if (!options.format) {
        error({
            message: "You must specify options.format, which can be one of 'amd', 'cjs', 'system', 'es', 'iife' or 'umd'",
            url: "https://rollupjs.org/#format-f-output-format-"
        });
    }
    if (options.moduleId) {
        if (options.amd)
            throw new Error('Cannot have both options.amd and options.moduleId');
    }
}
var throwAsyncGenerateError = {
    get: function () {
        throw new Error("bundle.generate(...) now returns a Promise instead of a { code, map } object");
    }
};
function rollup(rawInputOptions) {
    try {
        if (!rawInputOptions) {
            throw new Error('You must supply an options object to rollup');
        }
        var _a = mergeOptions({
            config: rawInputOptions,
            deprecateConfig: { input: true }
        }), inputOptions_1 = _a.inputOptions, deprecations = _a.deprecations, optionError = _a.optionError;
        if (optionError)
            inputOptions_1.onwarn({ message: optionError, code: 'UNKNOWN_OPTION' });
        if (deprecations.length)
            addDeprecations(deprecations, inputOptions_1.onwarn);
        checkInputOptions(inputOptions_1);
        var graph_1 = new Graph(inputOptions_1);
        timeStart('--BUILD--');
        var codeSplitting = inputOptions_1.experimentalCodeSplitting && inputOptions_1.input instanceof Array;
        if (!codeSplitting)
            return graph_1.buildSingle(inputOptions_1.input).then(function (chunk) {
                timeEnd('--BUILD--');
                function normalizeOptions(rawOutputOptions) {
                    if (!rawOutputOptions) {
                        throw new Error('You must supply an options object');
                    }
                    // since deprecateOptions, adds the output properties
                    // to `inputOptions` so adding that lastly
                    var consolidatedOutputOptions = Object.assign({}, {
                        output: Object.assign({}, rawOutputOptions, rawOutputOptions.output, inputOptions_1.output)
                    });
                    var mergedOptions = mergeOptions({
                        // just for backward compatiblity to fallback on root
                        // if the option isn't present in `output`
                        config: consolidatedOutputOptions,
                        deprecateConfig: { output: true }
                    });
                    if (mergedOptions.optionError)
                        mergedOptions.inputOptions.onwarn({
                            message: mergedOptions.optionError,
                            code: 'UNKNOWN_OPTION'
                        });
                    // now outputOptions is an array, but rollup.rollup API doesn't support arrays
                    var outputOptions = mergedOptions.outputOptions[0];
                    var deprecations = mergedOptions.deprecations;
                    if (deprecations.length)
                        addDeprecations(deprecations, inputOptions_1.onwarn);
                    checkOutputOptions(outputOptions);
                    return outputOptions;
                }
                function generate(rawOutputOptions) {
                    var outputOptions = normalizeOptions(rawOutputOptions);
                    timeStart('--GENERATE--');
                    var promise = Promise.resolve()
                        .then(function () { return chunk.render(outputOptions); })
                        .then(function (rendered) {
                        timeEnd('--GENERATE--');
                        graph_1.plugins.forEach(function (plugin) {
                            if (plugin.ongenerate) {
                                plugin.ongenerate(assign({
                                    bundle: result
                                }, outputOptions), rendered);
                            }
                        });
                        flushTime();
                        return rendered;
                    });
                    Object.defineProperty(promise, 'code', throwAsyncGenerateError);
                    Object.defineProperty(promise, 'map', throwAsyncGenerateError);
                    return promise;
                }
                var result = {
                    imports: chunk.getImportIds(),
                    exports: chunk.getExportNames(),
                    modules: chunk.getJsonModules(),
                    generate: generate,
                    write: function (outputOptions) {
                        if (!outputOptions || (!outputOptions.file && !outputOptions.dest)) {
                            error({
                                code: 'MISSING_OPTION',
                                message: 'You must specify output.file'
                            });
                        }
                        return generate(outputOptions).then(function (result) {
                            var file = outputOptions.file;
                            var code = result.code, map = result.map;
                            var promises = [];
                            if (outputOptions.sourcemap) {
                                var url = void 0;
                                if (outputOptions.sourcemap === 'inline') {
                                    url = map.toUrl();
                                }
                                else {
                                    url = basename(file) + ".map";
                                    promises.push(writeFile(file + '.map', map.toString()));
                                }
                                code += "//# " + SOURCEMAPPING_URL + "=" + url + "\n";
                            }
                            promises.push(writeFile(file, code));
                            return (Promise.all(promises)
                                .then(function () {
                                return mapSequence(graph_1.plugins.filter(function (plugin) { return plugin.onwrite; }), function (plugin) {
                                    return Promise.resolve(plugin.onwrite(assign({
                                        bundle: result
                                    }, outputOptions), result));
                                });
                            })
                                .then(function () { }));
                        });
                    }
                };
                return result;
            });
        return graph_1.buildChunks(inputOptions_1.input).then(function (bundle) {
            var chunks = {};
            Object.keys(bundle).forEach(function (chunkName) {
                var chunk = bundle[chunkName];
                chunks[chunkName] = {
                    name: chunkName,
                    imports: chunk.getImportIds(),
                    exports: chunk.getExportNames(),
                    modules: chunk.getJsonModules()
                };
            });
            function generate(rawOutputOptions) {
                var outputOptions = getAndCheckOutputOptions(inputOptions_1, rawOutputOptions);
                if (typeof outputOptions.file === 'string')
                    error({
                        code: 'INVALID_OPTION',
                        message: 'When code splitting, the "dir" output option must be used, not "file".'
                    });
                if (outputOptions.format === 'umd' || outputOptions.format === 'iife') {
                    error({
                        code: 'INVALID_OPTION',
                        message: 'UMD and IIFE output formats are not supported with the experimentalCodeSplitting option.'
                    });
                }
                timeStart('--GENERATE--');
                var generated = {};
                var promise = Promise.all(Object.keys(bundle).map(function (chunkName) {
                    var chunk = bundle[chunkName];
                    return chunk.render(outputOptions).then(function (rendered) {
                        timeEnd('--GENERATE--');
                        graph_1.plugins.forEach(function (plugin) {
                            if (plugin.ongenerate) {
                                var bundle_1 = chunks[chunkName];
                                plugin.ongenerate(assign({ bundle: bundle_1 }, outputOptions), rendered);
                            }
                        });
                        flushTime();
                        generated[chunkName] = rendered;
                    });
                })).then(function () {
                    return generated;
                });
                Object.defineProperty(promise, 'code', throwAsyncGenerateError);
                Object.defineProperty(promise, 'map', throwAsyncGenerateError);
                return promise;
            }
            return {
                chunks: chunks,
                generate: generate,
                write: function (outputOptions) {
                    if (!outputOptions || !outputOptions.dir) {
                        error({
                            code: 'MISSING_OPTION',
                            message: 'You must specify output.dir for multiple inputs'
                        });
                    }
                    return generate(outputOptions).then(function (result) {
                        var dir = outputOptions.dir;
                        return Promise.all(Object.keys(result).map(function (chunkName) {
                            var chunk = result[chunkName];
                            var code = chunk.code, map = chunk.map;
                            var promises = [];
                            if (outputOptions.sourcemap) {
                                var url = void 0;
                                if (outputOptions.sourcemap === 'inline') {
                                    url = map.toUrl();
                                }
                                else {
                                    url = chunkName + ".map";
                                    promises.push(writeFile(dir + '/' + chunkName + '.map', map.toString()));
                                }
                                code += "//# " + SOURCEMAPPING_URL + "=" + url + "\n";
                            }
                            promises.push(writeFile(dir + '/' + chunkName, code));
                            return (Promise.all(promises)
                                .then(function () {
                                return mapSequence(graph_1.plugins.filter(function (plugin) { return plugin.onwrite; }), function (plugin) {
                                    return Promise.resolve(plugin.onwrite(assign({ bundle: chunk }, outputOptions), chunk));
                                });
                            })
                                .then(function () { }));
                        }));
                    });
                }
            };
        });
    }
    catch (err) {
        return Promise.reject(err);
    }
}
function getAndCheckOutputOptions(inputOptions, rawOutputOptions) {
    if (!rawOutputOptions) {
        throw new Error('You must supply an options object');
    }
    // since deprecateOptions, adds the output properties
    // to `inputOptions` so adding that lastly
    var consolidatedOutputOptions = Object.assign({}, {
        output: Object.assign({}, rawOutputOptions, rawOutputOptions.output, inputOptions.output)
    });
    var mergedOptions = mergeOptions({
        // just for backward compatiblity to fallback on root
        // if the option isn't present in `output`
        config: consolidatedOutputOptions,
        deprecateConfig: { output: true }
    });
    if (mergedOptions.optionError)
        throw new Error(mergedOptions.optionError);
    // now outputOptions is an array, but rollup.rollup API doesn't support arrays
    var outputOptions = mergedOptions.outputOptions[0];
    var deprecations = mergedOptions.deprecations;
    if (deprecations.length)
        addDeprecations(deprecations, inputOptions.onwarn);
    checkOutputOptions(outputOptions);
    return outputOptions;
}

var version$1 = "0.56.5";

exports.rollup = rollup;
exports.VERSION = version$1;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=rollup.browser.js.map
