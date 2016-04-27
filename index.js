// Dependencies.
var arrayUnique = require('array-unique');
var gutil = require('gulp-util');
var stripComments = require("strip-comments");
var through = require('through2');

// Utils.
var File = gutil.File;
var PluginError = gutil.PluginError;

// Constants.
const PLUGIN_NAME = 'gulp-angular-module-dependency';

function angularModuleDependency(options) {
    options = options || {};
    options.module = options.module || "app";
    options.angularObjectName = options.angularObjectName || "angular";
    
    // Stores all module found and the module to add dependencies.
    var mainModuleFile,
        moduleList = [];
    
    function cleanFileContents(contents) {
        // Removes all new lines.
        contents = contents.replace(/(\r\n|\n|\r)/gm, '');
        
        // Removes all white spaces
        contents = contents.replace(/( )/gm, '');
        
        // Removes all comments.
        contents = stripComments(contents);
        
        return contents;
    }
    
    function getModuleNames(file, enc, cb) {
        // Do nothing if no content.
        if (file.isNull()) {
            return cb(null, file);
        }
        
        // No stream support.
        if (file.isStream()) {
            throw new PluginError(PLUGIN_NAME, 'Streams not supported!');
        }
        
        var contents = file.contents.toString(),
            regex = new RegExp(options.angularObjectName + '\\.module\\(["\']([a-zA-Z0-9:._-]*)["\'],\\[(([\'"][a-zA-Z0-9:._-]*[\'"],?){0,})\\]', 'g'),
            match;
        
        // Remove all possible problems from code style.
        contents = cleanFileContents(contents);
        
        while (match = regex.exec(contents)) {
            var moduleName = match[1],
                moduleDependencies = match[2] || '';
            
            // Removes all quotes from module dependency names.
            moduleDependencies = moduleDependencies.replace(/['"]/g, '').split(',');
            
            if (moduleName === options.module) {
                // Store the file containing the module to add dependencies.
                mainModuleFile = file;
                
                // Preserve all ready defined dependencies.
                moduleList = moduleList.concat(moduleDependencies);
            }
            else {
                moduleList.push(moduleName);
            }
        }
        cb(null, file);
    }
    
    function isEmptyString(element) {
        return element && element.length > 0;
    }
    
    function sendBack(cb) {
        console.log(typeof mainModuleFile !== 'object');
        if (typeof mainModuleFile !== 'object') {
            throw new PluginError(PLUGIN_NAME, 'The "' + options.module + '" module was not found in any file.');
        }
        
        if (!mainModuleFile.contents) {
            throw new PluginError(PLUGIN_NAME, 'Something was wrong retrieving the module file.');
        }
        
        var dependencies = arrayUnique(moduleList).filter(isEmptyString).sort().join("',\n\t'"),
            contents = mainModuleFile.contents.toString(),
            regex = new RegExp(options.angularObjectName + '\\.module[\\s]*\\([\\s]*["\']' + options.module + '["\'][\\s]*,[\\s]*\\[[^\\]]*\\]', 'g');
        
        // Adds all dependencies found.
        contents = contents.replace(regex, options.angularObjectName + ".module('" + options.module + "',[\n\t'" + dependencies + "'\n]");
        mainModuleFile.contents = new Buffer(contents);
        this.push(mainModuleFile);
        
        cb();
    }
    
    return through.obj(getModuleNames, sendBack);
}

module.exports = angularModuleDependency;