define([
		'main/ajaxRequest',
		'jquery',
		'jasmineSignals'
	], function (AjaxRequest, $, spyOnSignal) {

		'use strict';
		
		describe('AjaxRequest', function () {
			var request;
			var options;
			var mockAjax;
			
			beforeEach(function () {
				mockAjax = spyOn($, 'ajax');
				options = { url: 'http://example.com' };
				request = new AjaxRequest(options);
			});

			it('should use jQuery to send Ajax request', function () {
				request.send();

				expect($.ajax).toHaveBeenCalled();
			});

			it('should signal when response received', function () {
				var result = {};
				mockAjax.andCallFake(function (onSuccessOptions) {
					onSuccessOptions.success(result, null, null);
				});
				spyOnSignal(request.on.responseReceived);

				request.send();

				expect(request.on.responseReceived).toHaveBeenDispatched(1);
			});

			it('should set data if specified', function () {
				var requestOptions = {
					url: 'http://example.com',
					data: { os_authType: 'basic' }
				};
				mockAjax.andCallFake(function (ajaxOptions) {
					expect(ajaxOptions.data).toBeDefined();
					expect(ajaxOptions.data.os_authType).toBe('basic');
				});

				request = new AjaxRequest(requestOptions);
				request.send();

				expect(mockAjax).toHaveBeenCalled();
			});

			it('should set dataType if specified', function () {
				var requestOptions = {
					url: 'http://example.com',
					dataType: 'xml'
				};
				mockAjax.andCallFake(function (ajaxOptions) {
					expect(ajaxOptions.dataType).toBe(requestOptions.dataType);
				});

				request = new AjaxRequest(requestOptions);
				request.send();

				expect(mockAjax).toHaveBeenCalled();
			});

			describe('authentication', function () {

				it('should set basic authentication if username specified', function () {
					var requestOptions = {
						url: 'http://example.com',
						username: 'username1',
						password: 'password123'
					};
					mockAjax.andCallFake(function (ajaxOptions) {
						expect(ajaxOptions.headers.Authorization).toBe('Basic dXNlcm5hbWUxOnBhc3N3b3JkMTIz');
					});

					request = new AjaxRequest(requestOptions);
					request.send();

					expect(mockAjax).toHaveBeenCalled();
				});

			});

			it('should set RequestHeader if specified', function () {
				var requestOptions = {
					url: 'http://example.com',
					dataType: 'xml'
				};
				mockAjax.andCallFake(function (ajaxOptions) {
					var map = { };
					var beforeSendRequest = {
						setRequestHeader: function (key, value) {
							map[key] = value;
						}
					};
					ajaxOptions.beforeSend(beforeSendRequest);
					expect(map.Accept).toBe('application/xml');
				});

				request = new AjaxRequest(requestOptions);
				request.send();

				expect(mockAjax).toHaveBeenCalled();
			});

			it('should set json dataType as default', function () {
				var requestOptions = {
					url: 'http://example.com'
				};
				mockAjax.andCallFake(function (ajaxOptions) {
					expect(ajaxOptions.dataType).toBe('json');
				});

				request = new AjaxRequest(requestOptions);
				request.send();

				expect(mockAjax).toHaveBeenCalled();
			});

			it('should set RequestHeader to json by default', function () {
				var requestOptions = {
					url: 'http://example.com'
				};
				mockAjax.andCallFake(function (ajaxOptions) {
					var map = {};
					var beforeSendRequest = {
						setRequestHeader: function (key, value) {
							map[key] = value;
						}
					};
					ajaxOptions.beforeSend(beforeSendRequest);
					expect(map.Accept).toBe('application/json');
				});

				request = new AjaxRequest(requestOptions);
				request.send();

				expect(mockAjax).toHaveBeenCalled();
			});

			describe('error handling', function () {

				it('should signal on failure', function () {
					mockAjax.andCallFake(function (onErrorOptions) {
						onErrorOptions.error(null, null, null);
					});
					spyOnSignal(request.on.errorReceived);

					request.send();

					expect(request.on.errorReceived).toHaveBeenDispatched(1);
				});

				it('should signal error when response parsing fails', function () {
					mockAjax.andCallFake(function (onErrorOptions) {
						onErrorOptions.error(null, 'parsererror', {});
					});
					spyOnSignal(request.on.errorReceived);

					request.on.errorReceived.addOnce(function (errorInfo) {
						expect(errorInfo.message).toBe('Unrecognized response');
					});
					request.send();

					expect(request.on.errorReceived).toHaveBeenDispatched(1);
				});

				it('should fail if url not present', function () {
					expect(function () { var request = new AjaxRequest({ url: null }); }).toThrow();
				});

				it('should fail if success callback not present', function () {
					expect(function () { var request = new AjaxRequest({ success: undefined }); }).toThrow();
				});

				it('should fail if error callback not present', function () {
					expect(function () { var request = new AjaxRequest({ error: undefined }); }).toThrow();
				});

			});
		});
	});