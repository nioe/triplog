'use strict';

function TriplogMapDirective() {
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
        transclude: true,
        replace: true,
        templateUrl: 'triplogMap.tpl.html',
        scope: {
            gpsPoints: '='
        },
        link: function (scope, element) {
            L.mapbox.accessToken = 'pk.eyJ1IjoibmVvemVyb29uZSIsImEiOiI5YjRmODE4YzM2OGNhOTNhYmE5NjQwYTkwMzlhYzQ2NyJ9.RdoIup-zRJ-ve3e0cWwiKw';
            var map = L.mapbox.map(element.children()[0], 'mapbox.outdoors');

            console.log(element.children()[0]);

            var polyline = L.polyline(scope.gpsPoints, {color: 'red'}).addTo(map);
            map.fitBounds(polyline.getBounds());

            var coveredDistance = calcDistance(polyline._latlngs);
            console.log('coveredDistance', coveredDistance.distance + ' ' + coveredDistance.unit);
        }
    };
}

module.exports = TriplogMapDirective;