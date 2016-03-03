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
        expect($rootScope.$broadcast).toHaveBeenCalledWith(EVENT_NAMES.syncServiceItemsSynced);
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
        expect($rootScope.$broadcast).toHaveBeenCalledWith(EVENT_NAMES.syncServiceItemsSynced);
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
            {resourceName: 'StepsResource', method: 'update', config: {tripId: 'testTrip2', stepId: 'testStep'}, payload: {content: 'blubb'}},
            {resourceName: 'TripsResource', method: 'update', config: {tripId: 'testTrip3'}, payload: {content: 'bla'}}
        ];
        localStorage = {};
        localStorage[LOCAL_STORAGE_KEYS.processQueue] = processQueue;

        $rootScope.isOnline = true;
        $rootScope.loggedIn = true;
    }
});