'use strict';

angular.module('openwheels.invoice2.fine.create', [])

.controller('FineCreateController', function ($scope, resourceService, fineService, $uibModal, alertService, $state) {
    $scope.fine = {};
    $scope.params = {};
    $scope.isSaving = false;
    $scope.resource = null;
    $scope.fineStep = 'Draft Fine';
    $scope.preview = null;
    $scope.booking = null;
    $scope.bookingType = null;
    $scope.files = [];
    $scope.dateTime = {
        date: null,
        time: null
    };

    $scope.typeOptions = [
        {label: 'Verkeersboete', value: 'traffic_fine'},
        {label: 'Parkeerboete', value: 'parking_fine'},
        {label: 'Snelheidsovertreding', value: 'speed_​​violation'},
        {label: 'Door rood licht', value: 'red_light'},
        {label: 'Eenrichtingsverkeer', value: 'one_way_traffic'},
        {label: 'Doorgetrokken streep', value: 'road_marking'},
        {label: 'Door kruis rijden', value: 'road_cross'},
        {label: 'Strafbaar feit', value: 'legal_offense'},
        {label: 'Overige', value: 'other'}
    ];

    $scope.isSaveDisabled = function () {
        return $scope.fineDataForm.$invalid || $scope.isSaving;
    };

    $scope.isSearchDisabled = function () {
        return $scope.fineDataForm.$invalid || $scope.isSaving;
    };

    $scope.isPreviewDisabled = function () {
        return $scope.preview === null;
    };

    $scope.searchResources = function ($viewValue) {
        return resourceService.select({
            search: $viewValue
        });
    };

    $scope.formatResource = function ($model) {
        var inputLabel = '';
        if ($model) {
            inputLabel = '[' + $model.id + ']' + ' ' + $model.alias;
        }
        return inputLabel;
    };

    $scope.initDraft = function() {
        $scope.bookingType = null;
    };

    $scope.draft = function () {

        $scope.fine.fineAt = $scope.dateTime.date + ' ' + $scope.dateTime.time;

        $scope.isSaving = true;
        fineService.draftForResource({
            resource: $scope.resource.id,
            booking: $scope.fine.booking,
            newProps: $scope.fine
        }).then(function (draft) {
            $scope.preview = draft;
            $scope.booking = draft.booking;
            $scope.fine.booking = draft.booking.id;
            $scope.bookingType =  draft.booking_type;
            $scope.fineStep = 'Create Fine';
            $scope.isSaving = false;
        }, function (error) {
            $scope.isSaving = false;
            alertService.add('danger', error.message, 5000);
        });
    };

    $scope.resetFiles = function () {
        $scope.files = [];
        $scope.initDraft();
    };

    $scope.$on('fileSelected', function (event, args) {
        $scope.$apply(function (index) {
            $scope.files.push(args.file);
        });
    });

    $scope.create = function () {
        $scope.isSaving = true;
        $scope.fine.booking = $scope.booking.id;
        $scope.fine.person = $scope.booking.person.id;
        fineService.create({
            newProps: $scope.fine
        }, {
            'files[0]': $scope.files[0] ? $scope.files[0] : undefined,
            'files[1]': $scope.files[1] ? $scope.files[1] : undefined,
            'files[2]': $scope.files[2] ? $scope.files[2] : undefined,
            'files[3]': $scope.files[3] ? $scope.files[3] : undefined,
            'files[4]': $scope.files[4] ? $scope.files[4] : undefined,
            'files[5]': $scope.files[5] ? $scope.files[5] : undefined,
            'files[6]': $scope.files[6] ? $scope.files[6] : undefined,
            'files[7]': $scope.files[7] ? $scope.files[7] : undefined,
            'files[8]': $scope.files[8] ? $scope.files[8] : undefined,
            'files[9]': $scope.files[9] ? $scope.files[9] : undefined
        }).then(function (result) {
            alertService.add('success', 'Fine added', 2000);
            $scope.isSaving = true;
        }, function (error) {
            $scope.isSaving = false;
            alertService.add('danger', error.message, 5000);
        });
    };

    $scope.dateConfig = {
        //model
        modelFormat: 'YYYY-MM-DD',
        formatSubmit: 'yyyy-mm-dd',

        //view
        viewFormat: 'DD-MM-YYYY',
        format: 'dd-mm-yyyy',

        //options
        selectMonths: true
    };

    $scope.empty = function () {
        $scope.fineStep = 'Draft Fine';
        $scope.preview = null;
        $scope.booking = null;
        $scope.resource = null;
        $scope.bookingType = null;
        $scope.fine = {};
        $scope.files = [];
        $scope.isSaving = false;
    };

    $scope.previewModal = function () {
        $uibModal.open({
            templateUrl: 'invoice2/fine/preview/fine-preview.tpl.html',
            windowClass: 'modal--xl',
            controller: 'FinePreviewController',
            resolve: {
                preview: function () {
                    return $scope.preview;
                },
                attachments: function () {
                    return $scope.files;
                }
            }
        });
    };

    $scope.goToListPage = function () {
        $state.go('root.invoice2.fine.list');
    };
});
