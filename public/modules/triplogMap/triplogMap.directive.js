'use strict';

function TriplogMapDirective() {
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
            var map = L.mapbox.map(element[0], 'mapbox.outdoors');

            // create a red polyline from an arrays of LatLng points
            var polyline = L.polyline(scope.gpsPoints, {color: 'red'}).addTo(map);

            // zoom the map to the polyline
            map.fitBounds(polyline.getBounds());
        }
    };
}

module.exports = TriplogMapDirective;