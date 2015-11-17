'use strict';

// @ngInject
function TriplogMapDirective(MAP_BOX_ACCESS_TOKEN, MAP_BOX_STYLE) {

    var polyline;

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'triplogMap.tpl.html',
        scope: {
            gpsPoints: '=',
            pictures: '='
        },
        link: function (scope, element) {
            L.mapbox.accessToken = MAP_BOX_ACCESS_TOKEN;
            var map = L.mapbox.map(element[0], MAP_BOX_STYLE);
            map.scrollWheelZoom.disable();

            addFullScreenControl(map);
            addGpsPoints(map, scope.gpsPoints);
            addPictures(map, scope.pictures);

            var coveredDistance = calcDistance();
            console.log('coveredDistance', coveredDistance.distance + ' ' + coveredDistance.unit);
        }
    };


    function calcDistance() {
        var latlngs = polyline._latlngs,
            coveredDistance = 0;

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

    function onlyPicturesWithLocation(pictrue) {
        return pictrue.location && pictrue.location.lng && pictrue.location.lat;
    }

    function pictureToGeoJson(picture) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [picture.location.lng, picture.location.lat]
            },
            properties: {
                title: picture.caption,
                icon: {
                    iconUrl: picture.url,
                    iconSize: [100, 100],
                    iconAnchor: [50, 50],
                    popupAnchor: [0, -50],
                    className: 'dot'
                }
            }
        };
    }

    function addGpsPoints(map, gpsPoints) {
        polyline = L.polyline(gpsPoints, {color: 'red'}).addTo(map);
        map.fitBounds(polyline.getBounds());
    }

    function addPictures(map, pictures) {
        if (pictures && pictures.length > 0) {
            var pictureLayer = L.mapbox.featureLayer();

            pictureLayer.on('layeradd', function (e) {
                var marker = e.layer,
                    feature = marker.feature;

                marker.setIcon(L.icon(feature.properties.icon));
            });

            pictureLayer.setGeoJSON(pictures.filter(onlyPicturesWithLocation).map(pictureToGeoJson));

            var clusterGroup = new L.MarkerClusterGroup();
            pictureLayer.eachLayer(function (layer) {
                clusterGroup.addLayer(layer);
            });
            map.addLayer(clusterGroup);
        }
    }

    function addFullScreenControl(map) {
        L.control.fullscreen().addTo(map);

        map.on('enterFullscreen', function () {
            map.scrollWheelZoom.enable();
        });

        map.on('exitFullscreen', function () {
            map.scrollWheelZoom.disable();
        });
    }
}

module.exports = TriplogMapDirective;