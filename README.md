# gulp-angular-module-dependencies

## Install
```
$ npm i --save-dev gulp-angular-module-dependencies
```

## Description

This module helps you to find all `Angular.js` modules declared in your project and automatically add them as dependencies to the main app module.
Preserve all declared dependencies and the declaration order.

## Usage
```javascript
var gulp = require('gulp');
var moduleDependencies = require('gulp-angular-module-dependencies');

gulp.task('add-dependencies', function(){
    return gulp.src(['app.js', 'module.js'])
        .pipe(moduleDependencies('myApp'))
        .pipe(gulp.dest('./'));
})
```

__The `app.js`__
```javascript
angular.module('myApp', ['ui-router']);
angular.module('myApp').controller(function(){/*...*/});
```

__The `module.js`__
```javascript
angular.module('myApp.module', ['ngResources']);
angular.module('myApp.anotherModule', ['ngAnimate']);
```

__Only `app.js` is modified into the following output:__
```javascript
angular.module('myApp',[
	'myApp.anotherModule',
	'myApp.module',
	'ui-router'
]);
angular.module('app').controller(function () {/*...*/ });
```

___

## API

__moduleDependencies([*moduleName*], [*options*])__

______

*__moduleName__ string*  default: _`app`_

The module where add all dependencies found.
___

*__options__ object*  default: _`{}`_
The options object with the following options:

*__options.angularObjectName__ string*  default: _`angular`_