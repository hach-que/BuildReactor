define([
	'services/cruisecontrol.net/buildService'
], function (BuildService) {

	'use strict';

	describe('services/cruisecontrol.net/buildService', function () {

		var settings;
		var ccBuildInfo;

		beforeEach(function () {
			settings = {
				typeName: 'CruiseControl.NET',
				baseUrl: 'cruisecontrol.net',
				icon: 'cruisecontrol.net/icon.png',
				url: 'http://example.com/',
				name: 'CC.NET instance'
			};
			ccBuildInfo = {
				serviceName: 'service name',
				buildName: 'build name',
				group: 'group name',
				url: 'http://example.com/link',
				icon: 'ci/icon.png'
			};
		});

		it('should provide default settings', function () {
			var defaultSettings = BuildService.settings();

			expect(defaultSettings.typeName).toBe('CruiseControl.NET');
			expect(defaultSettings.baseUrl).toBe('cruisecontrol.net');
			expect(defaultSettings.icon).toBe('cruisecontrol.net/icon.png');
			expect(defaultSettings.logo).toBe('cruisecontrol.net/logo.png');
			expect(defaultSettings.urlHint).toBe('http://build.nauck-it.de/');
		});

		it('should define cctray xml location', function () {
			var service = new BuildService(settings);

			expect(service.cctrayLocation).toBe('XmlStatusReport.aspx');
		});

	});

});