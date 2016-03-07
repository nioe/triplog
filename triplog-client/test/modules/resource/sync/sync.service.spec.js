'use strict';

describe('Sync service', function () {
    var $rootScope,
        $log,
        service,
        localStorageService,
        localStorage,
        processQueue,
        LOCAL_STORAGE_KEYS,
        EVENT_NAMES,
        REST_URL_PREFIX,
        $httpBackend;

    beforeEach(module('sync', function ($provide) {
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

    beforeEach(inject(function (_$rootScope_, _$log_, _SyncService_, _LOCAL_STORAGE_KEYS_, _EVENT_NAMES_, _REST_URL_PREFIX_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $log = _$log_;
        service = _SyncService_;
        LOCAL_STORAGE_KEYS = _LOCAL_STORAGE_KEYS_;
        EVENT_NAMES = _EVENT_NAMES_;
        REST_URL_PREFIX = _REST_URL_PREFIX_;
        $httpBackend = _$httpBackend_;
    }));


    describe('Process queue has items', function () {

        beforeEach(setUpProcessQueue);

        it('should sync queued actions', function () {
            // given
            $httpBackend.expectDELETE(REST_URL_PREFIX + '/trips/testTrip').respond(200);
            $httpBackend.expectPUT(REST_URL_PREFIX + '/trips/testTrip2/steps/testStep', {content: 'blubb'}).respond(200);
            $httpBackend.expectPUT(REST_URL_PREFIX + '/trips/testTrip3', {content: 'bla'}).respond(200);

            spyOn($rootScope, '$broadcast');

            // when
            service.sync();
            $httpBackend.flush();

            // then
            expect(processQueue.length).toBe(0);
            expect($rootScope.$broadcast).toHaveBeenCalledWith(EVENT_NAMES.syncServiceItemsSynced, {
                trips: [{tripId: 'testTrip'}, {tripId: 'testTrip3'}],
                steps: [{tripId: 'testTrip2', stepId: 'testStep'}]
            });
        });

        it('should not try to sync more items after one fails', function () {
            // given
            $httpBackend.expectDELETE(REST_URL_PREFIX + '/trips/testTrip').respond(500, 'error');

            spyOn($rootScope, '$broadcast');
            spyOn($log, 'warn');

            // when
            service.sync();
            $httpBackend.flush();

            // then
            expect(processQueue.length).toBe(3);
            expect($rootScope.$broadcast).not.toHaveBeenCalledWith(EVENT_NAMES.syncServiceItemsSynced);
            expect($log.warn).toHaveBeenCalledWith('Error while syncing: TripsResource.delete({"tripId":"testTrip"}, undefined);', 500);
        });

        it('should keep original order in process queue', function () {
            // given
            $httpBackend.expectDELETE(REST_URL_PREFIX + '/trips/testTrip').respond(200);
            $httpBackend.expectPUT(REST_URL_PREFIX + '/trips/testTrip2/steps/testStep', {content: 'blubb'}).respond(500, 'error');

            spyOn($rootScope, '$broadcast');
            spyOn($log, 'warn');

            // when
            service.sync();
            $httpBackend.flush();

            // then
            expect(processQueue.length).toBe(2);
            expect(processQueue[0].resourceName).toEqual('StepsResource');
            expect(processQueue[1].resourceName).toEqual('TripsResource');
            expect($rootScope.$broadcast).toHaveBeenCalledWith(EVENT_NAMES.syncServiceItemsSynced, {
                trips: [{tripId: 'testTrip'}],
                steps: []
            });
            expect($log.warn).toHaveBeenCalledWith('Error while syncing: StepsResource.update({"tripId":"testTrip2","stepId":"testStep"}, {"content":"blubb"});', 500);
        });

        it('should not start sync process more than once at a time', function () {
            // given
            $httpBackend.expectDELETE(REST_URL_PREFIX + '/trips/testTrip').respond(200);
            $httpBackend.expectPUT(REST_URL_PREFIX + '/trips/testTrip2/steps/testStep', {content: 'blubb'}).respond(500, 'error');

            // when
            service.sync();
            service.sync();
            $httpBackend.flush();

            // then
            expect(processQueue.length).toBe(2);
            expect(processQueue[0].resourceName).toEqual('StepsResource');
            expect(processQueue[1].resourceName).toEqual('TripsResource');
        });

        function setUpProcessQueue() {
            processQueue = [
                {resourceName: 'TripsResource', method: 'delete', config: {tripId: 'testTrip'}},
                {
                    resourceName: 'StepsResource',
                    method: 'update',
                    config: {tripId: 'testTrip2', stepId: 'testStep'},
                    payload: {content: 'blubb'}
                },
                {
                    resourceName: 'TripsResource',
                    method: 'update',
                    config: {tripId: 'testTrip3'},
                    payload: {content: 'bla'}
                }
            ];
            localStorage = {};
            localStorage[LOCAL_STORAGE_KEYS.processQueue] = processQueue;

            $rootScope.isOnline = true;
            $rootScope.loggedIn = true;
        }
    });

    describe('Empty process queue', function () {
        it('should do nothing if process queue is empty', function () {
            // given
            localStorage = {};
            $rootScope.isOnline = true;
            $rootScope.loggedIn = true;

            // when
            service.sync();
        });
    });

    describe('ElemtnsSynced Event', function () {
        it('should get the tripId and stepId from the response object if content is saved', function () {
            // given
            processQueue = [
                {
                    resourceName: 'TripsResource',
                    method: 'save',
                    config: {},
                    payload: {content: 'blubb'}
                },
                {
                    resourceName: 'StepsResource',
                    method: 'save',
                    config: {tripId: 'testTrip'},
                    payload: {content: 'blubb'}
                }
            ];
            localStorage = {};
            localStorage[LOCAL_STORAGE_KEYS.processQueue] = processQueue;

            $rootScope.isOnline = true;
            $rootScope.loggedIn = true;

            $httpBackend.expectPOST(REST_URL_PREFIX + '/trips', {content: 'blubb'}).respond(200, {tripId: 'testTrip'});
            $httpBackend.expectPOST(REST_URL_PREFIX + '/trips/testTrip/steps', {content: 'blubb'}).respond(200, {tripId: 'testTrip', stepId: 'testStep'});

            spyOn($rootScope, '$broadcast');

            // when
            service.sync();
            $httpBackend.flush();

            // then
            expect($rootScope.$broadcast).toHaveBeenCalledWith(EVENT_NAMES.syncServiceItemsSynced, {
                trips: [{tripId: 'testTrip'}],
                steps: [{tripId: 'testTrip', stepId: 'testStep'}]
            });
        });
    });
});