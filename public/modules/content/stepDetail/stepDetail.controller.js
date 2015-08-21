'use strict';

// @ngInject
function StepDetailController() {
    var vm = this;

    vm.pictures = [
        'http://www.china-tour.cn/images/China_Pictures/Chinese_Mountains/Wuyi_Mountain.jpg',
        'https://sandiego.ncsy.org/files/2013/10/mountain-04.jpg',
        'http://c0278592.cdn.cloudfiles.rackspacecloud.com/original/449444.jpg',
        'http://www.hdwallpapers.in/walls/marmoleda_mountain_reflections-wide.jpg',
        'http://www.hdwallpapersnew.net/wp-content/uploads/2015/05/mountain-lake-landscape-widescreen-high-definition-wallpaper-free-beautiful-images.jpg',
        'http://media1.santabanta.com/full1/Outdoors/Mountain/mountain-252a.jpg',
        'http://zermatt.com/wp-content/uploads/2014/03/Peak_of_the_Matterhorn_seen_from_Zermatt_Switzerland.jpg',
        'http://webneel.com/wallpaper/sites/default/files/images/04-2013/redy-mountain-wallpaper.jpg'
    ];

    vm.gpsPoints = require('./dummyGpsPoints.json');
}

module.exports = StepDetailController;