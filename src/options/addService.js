define([
	'common/resourceFinder',
	'signals',
	'jquery',
	'hbs!templates/addServiceItem',
	'bootstrap'
], function (resourceFinder, signals, $, addServiceItemTemplate) {

	'use strict';

	var on = {
		selected: new signals.Signal()
	};
	var serviceTypeName;
	var serviceTypes;
	var container;

	var initialize = function (selector, availableServices) {
		container = $(selector);
		serviceTypeName = undefined;
		serviceTypes = availableServices;
		var templateInput = createTemplateInput(serviceTypes);
		$('.service-add-list ul', container).html(addServiceItemTemplate(templateInput));
		$('.thumbnails a', container).click(serviceAddSelect);
		$('.service-add-form', container).submit(function () {
			serviceAdd();
			return false;
		});
		$('.btn-primary', container).click(serviceAdd);
		$('#service-add-name', container).on('input', function () {
			if ($(this).val() === '') {
				$('.btn-primary', container).addClass('disabled');
			} else {
				$('.btn-primary', container).removeClass('disabled');
			}
		});
	};

	var createTemplateInput = function (serviceTypes) {
		var input = [];
		serviceTypes.forEach(function (d) {
			input.push({
				typeName: d.typeName,
				logo: resourceFinder.logo(d.logo)
			});
		});
		return { services: input };
	};

	var show = function () {
		$('.btn-primary', container).addClass('disabled');
		$('#service-add-name', container).val('');
		unselectAll();
		container.show();
	};

	var hide = function () {
		container.hide();
	};

	var serviceAddSelect = function (sender) {
		var serviceElement = $(sender.currentTarget).closest('a');
		serviceTypeName = serviceElement.data('service');
		unselectAll();
		serviceElement.addClass('active');
		$('#service-add-name', container).removeAttr('disabled');
		$('#service-add-name', container).focus();
	};

	var unselectAll = function () {
		$('.thumbnail.active', container).removeClass('active');
	};

	var serviceAdd = function () {
		if ($('.btn-primary', container).hasClass('disabled')) {
			return;
		}
		var selected = serviceTypes.filter(function (d) {
			return d.typeName === serviceTypeName;
		})[0];
		selected.name = $('#service-add-name', container).val();
		on.selected.dispatch(selected);
	};

	return {
		initialize: initialize,
		show: show,
		hide: hide,
		on: on
	};
});