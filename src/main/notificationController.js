define([
	'main/serviceController',
	'common/resourceFinder',
	'common/timer',
	'mout/string/interpolate',
	'mout/array/remove'
], function (serviceController, resourceFinder, Timer, interpolate, remove) {

	'use strict';
	
	var notificationTimeoutInSec = 5;

	function notificationController() {

		function onBrokenBuild(buildEvent) {
			var notificationInfo = {
				message: interpolate('Build failed - {{0}}', [buildEvent.serviceName]),
				details: buildEvent.buildName + (buildEvent.group ? ' (' + buildEvent.group + ')' : ''),
				url: buildEvent.url,
				sticky: !reloading,
				icon: buildEvent.icon,
				serviceName: buildEvent.serviceName,
				group: buildEvent.group,
				buildName: buildEvent.buildName
			};
			showNotification(notificationInfo);
		}

		function onFixedBuild(buildEvent) {
			var notificationInfo = {
				message: interpolate('Build fixed - {{0}}', [buildEvent.serviceName]),
				details: buildEvent.buildName + (buildEvent.group ? ' (' + buildEvent.group + ')' : ''),
				url: buildEvent.url,
				sticky: false,
				icon: buildEvent.icon,
				serviceName: buildEvent.serviceName,
				group: buildEvent.group,
				buildName: buildEvent.buildName
			};
			showNotification(notificationInfo);
		}

		function showNotification(notificationInfo) {
			hideOutdated(notificationInfo);
			var notification = createNotification(notificationInfo);
			notification.show();
			visibleNotifications.push({ notification: notification, notificationInfo: notificationInfo });
			if (!notificationInfo.sticky) {
				var timer = new Timer();
				timer.on.elapsed.addOnce(function () { notification.cancel(); });
				timer.start(notificationTimeoutInSec);
			}
		}

		function hideOutdated(notificationInfo) {
			visibleNotifications.filter(function (d) {
				return d.notificationInfo.serviceName === notificationInfo.serviceName &&
					d.notificationInfo.buildName === notificationInfo.buildName &&
					d.notificationInfo.group === notificationInfo.group;
			}).forEach(function (d) {
				d.notification.cancel();
			});
		}

		function onReloading() {
			reloading = true;
		}

		function onStartedAll() {
			reloading = false;
		}

		function createNotification(notificationInfo) {

			function onNotificationClick() {
				chrome.tabs.create({'url': notificationInfo.url}, function (tab) {
					notification.cancel();
				});
			}

			function onNotificationClose() {
				visibleNotifications.filter(function (d) {
					return d.notification === this;
				}).forEach(function (d) {
					remove(visibleNotifications, d);
				});
			}

			var notification = window.webkitNotifications.createNotification(
				resourceFinder.icon(notificationInfo.icon),
				notificationInfo.message,
				notificationInfo.details
			);
			notification.onclick = onNotificationClick;
			notification.onclose = onNotificationClose;
			return notification;
		}

		var visibleNotifications = [];
		var reloading = false;
		serviceController.on.brokenBuild.add(onBrokenBuild);
		serviceController.on.fixedBuild.add(onFixedBuild);
		serviceController.on.reloading.add(onReloading);
		serviceController.on.startedAll.add(onStartedAll);
	}
	
	notificationController.notificationTimeoutInSec = function (value) {
		if (!arguments.count) { return notificationTimeoutInSec; }
		notificationTimeoutInSec = value;
		return notificationController;
	};

	return notificationController;
});
