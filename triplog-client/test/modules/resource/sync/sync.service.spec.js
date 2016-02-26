'use strict';

describe('Sync service', function () {
    var $rootScope,
        $log,
        service,
        localStorageService,
        localStorage,
        processQueue,
        PROCESS_QUEUE_STORAGE_KEYS,
        ITEMS_SYNCED_EVENT,
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

    beforeEach(inject(function (_$rootScope_, _$log_, _SyncService_, _PROCESS_QUEUE_STORAGE_KEYS_, _ITEMS_SYNCED_EVENT_, _REST_URL_PREFIX_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $log = _$log_;
        service = _SyncService_;
        PROCESS_QUEUE_STORAGE_KEYS = _PROCESS_QUEUE_STORAGE_KEYS_;
        ITEMS_SYNCED_EVENT = _ITEMS_SYNCED_EVENT_;
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
        expect($rootScope.$broadcast).toHaveBeenCalledWith(ITEMS_SYNCED_EVENT);
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
        expect($rootScope.$broadcast).not.toHaveBeenCalledWith(ITEMS_SYNCED_EVENT);
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
        expect($rootScope.$broadcast).toHaveBeenCalledWith(ITEMS_SYNCED_EVENT);
        expect($log.warn).toHaveBeenCalledWith('Error while syncing: StepsResource.update({"tripId":"testTrip2","stepId":"testStep"}, {"content":"blubb"});', 500);
    });

    function setUpProcessQueue() {
        processQueue = [
            {resourceName: 'TripsResource', method: 'delete', config: {tripId: 'testTrip'}},
            {resourceName: 'StepsResource', method: 'update', config: {tripId: 'testTrip2', stepId: 'testStep'}, payload: {content: 'blubb'}},
            {resourceName: 'TripsResource', method: 'update', config: {tripId: 'testTrip3'}, payload: {content: 'bla'}}
        ];
        localStorage = {};
        localStorage[PROCESS_QUEUE_STORAGE_KEYS.PROCESS_QUEUE] = processQueue;

        $rootScope.isOnline = true;
        $rootScope.loggedIn = true;
    }
});