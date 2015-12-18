'use strict';

// @ngInject
function MarkdownPreviewController() {
    var vm = this;

    vm.preview = false;

    vm.toggle = function () {
        vm.preview = !vm.preview;
    };
}

module.exports = MarkdownPreviewController;