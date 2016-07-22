'use strict';

// @ngInject
function TriplogMapDirective($rootScope, MAP_BOX_ACCESS_TOKEN, MAP_BOX_STYLES, EVENT_NAMES) {

    var polyline;

    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'triplogMap.tpl.html',
        scope: {
            gpsPoints: '=',
            multipleTracks: '=',
            pictures: '=',
            showCoveredDistance: '='
        },
        link: function (scope, element) {
            L.mapbox.accessToken = MAP_BOX_ACCESS_TOKEN;
            var mapContainer = element[0],
                map = L.mapbox.map(mapContainer, null);
            map.scrollWheelZoom.disable();

            var bounds = [];

            addLayers(map);
            addFullScreenControl(map);
            bounds.push(addGpsPoints(map, scope.gpsPoints));
            bounds.push(addMultipleTracks(map, scope.multipleTracks));
            bounds.push(addPictures(map, scope.pictures));
            addCoveredDistance(mapContainer, scope.showCoveredDistance);

            map.fitBounds(bounds);
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
                    iconUrl: picture.url + '/thumbnail',
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

    function addLayers(map) {
        var layers = {};
        for (var name in MAP_BOX_STYLES) {
            if (MAP_BOX_STYLES.hasOwnProperty(name)) {
                layers[name] = L.mapbox.tileLayer(MAP_BOX_STYLES[name]);
            }
        }

        layers.Streets.addTo(map);
        L.control.layers(layers).addTo(map);
    }

    function addGpsPoints(map, gpsPoints) {
        if (gpsPoints && gpsPoints.length > 0) {
            polyline = L.polyline(gpsPoints, {color: 'red', clickable: false}).addTo(map);
            return polyline.getBounds();
        }
    }

    function addMultipleTracks(map, multipleTracks) {
        if (multipleTracks && multipleTracks.length > 0) {
            var polylines = multipleTracks.map(toPolylines);
            addConnections(polylines, multipleTracks);

            var featureGroup = L.featureGroup(polylines);

            featureGroup.addTo(map);
            return featureGroup.getBounds();
        }
    }

    function toPolylines(track, index) {
        var polyline = L.polyline(track.gpsPoints, {color: index % 2 === 0 ? 'red' : 'orange', opacity: 0.8});
        polyline.on('click', function () {
            $rootScope.$broadcast(EVENT_NAMES.trackClicked, track);
        });

        polyline.bindPopup('<b>' + track.stepName + '</b>');
        polyline.on('mouseover', function () {
            this.openPopup();
        });
        polyline.on('mouseout', function () {
            this.closePopup();
        });

        return polyline;
    }

    function addConnections(polylines, multipleTracks) {
        for (var i = 1; i < multipleTracks.length; i++) {
            var startPoint = multipleTracks[i - 1].gpsPoints.slice(-1)[0];
            var endPoint = multipleTracks[i].gpsPoints[0];
            polylines.push(L.polyline([startPoint, endPoint], {color: 'green', opacity: 0.8, 'dashArray': '20, 10', 'clickable': false}));
        }
    }

    function addPictures(map, pictures) {
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

            pictureLayer.on('click', function (e) {
                $rootScope.$broadcast(EVENT_NAMES.triplogOpenPicture, e.layer.feature.properties.pictureName);
            });

            return pictureLayer.getBounds();
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

    function addCoveredDistance(mapContainer, showCoveredDistance) {
        if (showCoveredDistance === false) {
            return;
        }

        var coveredDistance = calcDistance(),
            displayText = 'Covered distance: ' + coveredDistance.distance + ' ' + coveredDistance.unit;

        mapContainer.getElementsByClassName('covered-distance')[0].innerText = displayText;
    }
}

module.exports = TriplogMapDirective;