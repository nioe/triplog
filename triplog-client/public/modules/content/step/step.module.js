'use strict';

module.exports = angular.module('step', [
    require('modules/triplogGallery').name,
    require('modules/triplogMap').name,
    require('modules/config').name,
    require('modules/modalMessage').name,
    require('modules/markdownPreview').name,
    require('modules/triplogDateOutput').name,
    require('modules/country').name,

    // Template module dependencies (created with browserify-ng-html2js)
    require('./step.tpl.html'),
    require('./step.view.tpl.html'),
    require('./step.edit.tpl.html'),
    require('./step.add.tpl.html')
]);

module.exports.controller('StepController', require('./step.controller'));
module.exports.controller('StepAddController', require('./stepAdd.controller'));