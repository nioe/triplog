'use strict';

// @ngInject
function TriplogMapDirective(MAP_BOX_ACCESS_TOKEN) {
    function calcDistance(latlngs) {
        var coveredDistance = 0;
        for (var i = 1; i < latlngs.length; i++) {
            coveredDistance += latlngs[i - 1].distanceTo(latlngs[i]);
        }

        if (coveredDistance >= 10000) {
            // Show distance in km
            return {
                distance: Math.round(coveredDistance / 100) / 10,
                unit: 'km'
            };
        } else {
            // Show distance in m
            return {
                distance: Math.round(coveredDistance * 10) / 10,
                unit: 'm'
            };
        }
    }

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'triplogMap.tpl.html',
        scope: {
            gpsPoints: '='
        },
        link: function (scope, element) {
            L.mapbox.accessToken = MAP_BOX_ACCESS_TOKEN;
            var map = L.mapbox.map(element[0], 'mapbox.outdoors');
            map.scrollWheelZoom.disable();

            L.control.fullscreen().addTo(map);

            var polyline = L.polyline(scope.gpsPoints, {color: 'red'}).addTo(map);
            map.fitBounds(polyline.getBounds());

            var coveredDistance = calcDistance(polyline._latlngs);
            console.log('coveredDistance', coveredDistance.distance + ' ' + coveredDistance.unit);
        }
    };
}

module.exports = TriplogMapDirective;