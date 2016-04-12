'use strict';

module.exports = TimelineMomentController;

// @ngInject
function TimelineMomentController() {
    var vm = this;
    
    vm.appearAnimated = function (element) {
        element.removeClass('hiddenBefore');
        element.addClass('animated appearAnimated');
    };
}