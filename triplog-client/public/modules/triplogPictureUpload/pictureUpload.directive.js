'use strict';

module.exports = PictureUpload;

// @ngInject
function PictureUpload($rootScope, REST_URL_PREFIX) {

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'pictureUpload.tpl.html',
        scope: {
            tripId: '@',
            stepId: '@'
        },
        link: link
    };

    function link(scope, element) {

        var config = {
            url: REST_URL_PREFIX + '/trips/' + scope.tripId + '/steps/' + scope.stepId + '/pictures',
            headers: {
                'X-AUTH-TOKEN': $rootScope.xAuthToken
            },
            acceptedFiles: 'image/*',
            parallelUploads: 1
        };

        var pictureDropzone = new Dropzone(element[0], config);

        pictureDropzone.on('sending', function (file, xhr, formData) {
            var filename = file.name;
            formData.append('filename', filename);
        });
    }
}
