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
            addPictures(map, scope.pictures, scope);

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

    function onlyDisplayablePictures(picture) {
        return picture.location && picture.location.lng && picture.location.lat && picture.width && picture.height;
    }

    function pictureToGeoJson(picture) {
        var iconSize = calculateIconSize(picture);

        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [picture.location.lng, picture.location.lat]
            },
            properties: {
                title: picture.caption,
                pictureName: picture.name,
                icon: {
                    iconUrl: picture.url,
                    iconSize: iconSize,
                    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
                    popupAnchor: [0, iconSize[1] / 2 * -1],
                    className: 'picture-marker'
                }
            }
        };
    }

    function calculateIconSize(picture) {
        var longEdge = 150;

        if (picture.width > picture.height) {
            return [longEdge, picture.height * (longEdge / picture.width)];
        }

        return [picture.width * (longEdge / picture.height), longEdge];
    }

    function addGpsPoints(map, gpsPoints) {
        polyline = L.polyline(gpsPoints, {color: 'red'}).addTo(map);
        map.fitBounds(polyline.getBounds());
    }

    function addPictures(map, pictures, scope) {
        if (pictures && pictures.length > 0) {
            var pictureLayer = L.mapbox.featureLayer();

            pictureLayer.on('layeradd', function (e) {
                var marker = e.layer,
                    feature = marker.feature;

                marker.setIcon(L.icon(feature.properties.icon));
            });

            pictureLayer.setGeoJSON(pictures.filter(onlyDisplayablePictures).map(pictureToGeoJson));

            var clusterGroup = new L.MarkerClusterGroup();
            pictureLayer.eachLayer(function (layer) {
                clusterGroup.addLayer(layer);
            });
            map.addLayer(clusterGroup);

            pictureLayer.on('click', function(e) {
                scope.$emit('triplogOpenPicture', e.layer.feature.properties.pictureName);
            });
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