'use strict';

describe('Content Controller', function () {

    var controller;

    beforeEach(module('content'));

    beforeEach(inject(function ($controller) {
        controller = $controller;
    }));

    it('should not show navigation after initialization', function () {
        expect(controller.navigationIsShown).toBeFalsy();
    });

});