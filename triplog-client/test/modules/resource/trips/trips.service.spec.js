'use strict';

describe('Trips Serivce', function () {
    var service,
        $httpBackend,
        $rootScope,
        $q,
        localStorageService,
        localStorage,
        TRIP_STORAGE_KEYS,
        REST_URL_PREFIX,
        tripsRaw = [
            {tripId: 'trip1', tripName: 'trip 1', tripDate: '2015-02-01', steps: []},
            {tripId: 'trip2', tripName: 'trip 2', tripDate: '2016-01-13', steps: []}
        ],
        tripsRawAdmin = [
            {tripId: 'trip1', tripName: 'trip 1', tripDate: '2015-02-01', steps: []},
            {tripId: 'trip3', tripName: 'trip 3', tripDate: '2016-01-20', steps: []},
            {tripId: 'trip2', tripName: 'trip 2', tripDate: '2016-01-13', steps: []}
        ],
        tripsProcessed = [
            {tripId: 'trip2', tripName: 'trip 2', tripDate: '2016-01-13', displayName: 'trip 2 2016', steps: []},
            {tripId: 'trip1', tripName: 'trip 1', tripDate: '2015-02-01', displayName: 'trip 1 2015', steps: []}
        ],
        tripsProcessedAdmin = [
            {tripId: 'trip3', tripName: 'trip 3', tripDate: '2016-01-20', displayName: 'trip 3 2016', steps: []},
            {tripId: 'trip2', tripName: 'trip 2', tripDate: '2016-01-13', displayName: 'trip 2 2016', steps: []},
            {tripId: 'trip1', tripName: 'trip 1', tripDate: '2015-02-01', displayName: 'trip 1 2015', steps: []}
        ];

    beforeEach(module('tripsResource', function ($provide) {
        localStorageService = {
            get: function (key) {
                return localStorage[key];
            },

            set: function (key, value) {
                localStorage[key] = value;
            }
        };

        $provide.value('localStorageService', localStorageService);
    }));

    beforeEach(inject(function (_TripsService_, _TRIP_STORAGE_KEYS_, _REST_URL_PREFIX_, _$httpBackend_, _$rootScope_, _$q_) {
        service = _TripsService_;
        TRIP_STORAGE_KEYS = _TRIP_STORAGE_KEYS_;
        REST_URL_PREFIX = _REST_URL_PREFIX_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $q = _$q_;
    }));

    describe('Load all trips', function () {
        beforeEach(function () {
            localStorage = {};
        });

        it('should fetch trips from backend if online and store in normal local storage if not logged in', function (done) {
            // given
            $rootScope.isOnline = true;
            $rootScope.loggedIn = false;

            // when
            service.getTrips().then(function (data) {
                expect(data.length).toBe(tripsProcessed.length);

                expect(data[0].tripId).toEqual(tripsProcessed[0].tripId);
                expect(data[0].displayName).toEqual(tripsProcessed[0].displayName);

                expect(data[1].tripId).toEqual(tripsProcessed[1].tripId);
                expect(data[1].displayName).toEqual(tripsProcessed[1].displayName);

                expect(localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS]).toEqual(data);
                expect(localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN]).toBeUndefined();

                done();
            });

            $httpBackend.expectGET(REST_URL_PREFIX + '/trips').respond(tripsRaw);
            $httpBackend.flush();
        });

        it('should fetch trips from backend if online and store in admin local storage if logged in', function (done) {
            // given
            $rootScope.isOnline = true;
            $rootScope.loggedIn = true;

            // when
            service.getTrips().then(function (data) {
                expect(data.length).toBe(tripsProcessedAdmin.length);

                expect(data[0].tripId).toEqual(tripsProcessedAdmin[0].tripId);
                expect(data[0].displayName).toEqual(tripsProcessedAdmin[0].displayName);

                expect(data[1].tripId).toEqual(tripsProcessedAdmin[1].tripId);
                expect(data[1].displayName).toEqual(tripsProcessedAdmin[1].displayName);

                expect(data[2].tripId).toEqual(tripsProcessedAdmin[2].tripId);
                expect(data[2].displayName).toEqual(tripsProcessedAdmin[2].displayName);

                expect(localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS]).toBeUndefined();
                expect(localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN]).toEqual(data);

                done();
            });

            $httpBackend.expectGET(REST_URL_PREFIX + '/trips').respond(tripsRawAdmin);
            $httpBackend.flush();
        });

        it('should load trips from local storage if backend responds with error', function (done) {
            // given
            $rootScope.isOnline = true;
            $rootScope.loggedIn = false;

            localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS] = tripsProcessed;

            // when
            service.getTrips().then(function (data) {
                expect(data.length).toBe(tripsProcessed.length);
                expect(data[0].tripId).toEqual(tripsProcessed[0].tripId);
                expect(data[1].tripId).toEqual(tripsProcessed[1].tripId);

                done();
            });

            $httpBackend.expectGET(REST_URL_PREFIX + '/trips').respond(500, 'backend error');
            $httpBackend.flush();
        });

        it('should return error if backend responds with error and no trips are stored in local storage', function (done) {
            // given
            $rootScope.isOnline = true;
            $rootScope.loggedIn = false;

            // when
            service.getTrips().then(function () {
                done.fail('Should not resolve if no trips are in local storage');
            }, function (error) {
                expect(error.status).toEqual(500);
                expect(error.data).toEqual('Trips could not be fetched from server and there are no locally cached trips.');
                done();
            });

            $httpBackend.expectGET(REST_URL_PREFIX + '/trips').respond(500, 'backend error');
            $httpBackend.flush();
        });

        it('should load trips from normal local storage if offline and not logged in', function (done) {
            // given
            $rootScope.isOnline = false;
            $rootScope.loggedIn = false;

            localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS] = tripsProcessed;

            // when
            service.getTrips().then(function (data) {
                expect(data.length).toBe(tripsProcessed.length);
                expect(data[0].tripId).toEqual(tripsProcessed[0].tripId);
                expect(data[1].tripId).toEqual(tripsProcessed[1].tripId);

                done();
            });

            $rootScope.$digest();
        });

        it('should load trips from admin local storage if offline and logged in', function (done) {
            // given
            $rootScope.isOnline = false;
            $rootScope.loggedIn = true;

            localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN] = tripsProcessedAdmin;

            // when
            service.getTrips().then(function (data) {
                expect(data.length).toBe(tripsProcessedAdmin.length);
                expect(data[0].tripId).toEqual(tripsProcessedAdmin[0].tripId);
                expect(data[1].tripId).toEqual(tripsProcessedAdmin[1].tripId);
                expect(data[2].tripId).toEqual(tripsProcessedAdmin[2].tripId);

                done();
            });

            $rootScope.$digest();
        });

        it('should return error if offline and no locally cached trips', function (done) {
            // given
            $rootScope.isOnline = false;
            $rootScope.loggedIn = false;

            // when
            service.getTrips().then(function () {
                done.fail('Should not resolve if no trips are in local storage');
            }, function (error) {
                expect(error.status).toEqual('offline');
                expect(error.data).toEqual('You seem to be offline and there are no stored trips to show... :(');
                done();
            });

            $rootScope.$digest();
        });
    });

    describe('Load single trip', function () {
        beforeEach(function () {
            localStorage = {};
        });

        it('should fetch all trips and return the one with the correct id', function (done) {
            // given
            $rootScope.isOnline = true;
            $rootScope.loggedIn = false;
            var tripId = 'trip2';

            // when
            service.getTrip(tripId).then(function (trip) {
                expect(typeof trip).toEqual('object');
                expect(trip.tripId).toEqual(tripId);

                done();
            });

            $httpBackend.expectGET(REST_URL_PREFIX + '/trips').respond(tripsRaw);
            $httpBackend.flush();
        });

        it('should refect promise if trip with given id could not be found', function (done) {
            // given
            $rootScope.isOnline = true;
            $rootScope.loggedIn = false;
            var tripId = 'trip3';

            // when
            service.getTrip(tripId).then(function () {
                done.fail('Should not resolve promise if trip could not be found!');
            }, function (error) {
                expect(error.status).toEqual(404);
                expect(error.data).toEqual('Trip with ID ' + tripId + ' could not be found.');
                done();
            });

            $httpBackend.expectGET(REST_URL_PREFIX + '/trips').respond(tripsRaw);
            $httpBackend.flush();
        });
    });

    describe('Delete Trip', function () {
        beforeEach(function () {
            localStorage = {};
            localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN] = tripsProcessed;
        });

        it('should delete trip on server if online', function (done) {
            // given
            $rootScope.isOnline = true;
            var tripId = 'trip2';

            // when
            service.deleteTrip(tripId).then(function () {
                localStorage[TRIP_STORAGE_KEYS.ALL_TRIPS_ADMIN].forEach(function (trip) {
                    expect(trip.tripId).not.toEqual(tripId);
                });
                done();
            });

            $httpBackend.expectDELETE(REST_URL_PREFIX + '/trips/' + tripId).respond(200);
            $httpBackend.flush();
        });
    });
});