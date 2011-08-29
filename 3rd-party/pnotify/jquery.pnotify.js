/*
 * jQuery Pines Notify (pnotify) Plugin 1.0
 *
 * Copyright (c) 2009 Hunter Perrin
 *
 * Licensed (along with all of Pines) under the GNU Affero GPL:
 *	  http://www.gnu.org/licenses/agpl.html
 */

(function($) {
	var first_top;
	var history_handle_top;
	var timer;
	$.extend({
		pnotify_remove_all: function () {
			var body = $("body");
			var body_data = body.data("pnotify");
			$.each(body_data, function(){
				if (this.pnotify_remove)
					this.pnotify_remove();
			});
		},
		pnotify_position_all: function () {
			timer = null;
			var body = $("body");
			var next = first_top;
			var body_data = body.data("pnotify");
			$.each(body_data, function(){
				var postop;
				var display = this.css("display");
				if (display != "none") {
					// Calculate the top value, disregarding the scroll, since position=fixed.
					postop = this.offset().top - $(window).scrollTop();
					if (!first_top) {
						first_top = postop;
						next = first_top;
					}
				}
				if (next) {
					if (postop > next) {
						this.animate({top: next+"px"}, {duration: 500, queue: false});
					} else {
						this.css("top", next+"px");
					}
				}
				if (display != "none") {
					next += this.height() + 10;
				}
			});
		},
		pnotify: function(options) {
			var body = $("body");
			var closer;
			
			// Build main options.
			var opts;
			if (typeof options == "string") {
				opts = $.extend({}, $.pnotify.defaults);
				opts.pnotify_text = options;
			} else {
				opts = $.extend({}, $.pnotify.defaults, options);
			}

			if (opts.pnotify_before_init) {
				if (opts.pnotify_before_init(opts) === false) {
					return null;
				}
			}
			
			var pnotify = $("<div />").addClass("ui-widget ui-helper-clearfix ui-pnotify");
			pnotify.container = $("<div />").addClass("ui-corner-all ui-pnotify-container");
			pnotify.append(pnotify.container);

			pnotify.pnotify_version = "1.0.0";

			pnotify.pnotify_init = function() {
				body.append(pnotify);

				// Add events to stop fading when the user mouses over.
				if (opts.pnotify_hide) {
					pnotify.mouseenter(function(){
						pnotify.stop();
						pnotify.fadeTo("fast", opts.pnotify_opacity);
						pnotify.pnotify_cancel_remove();
					}).mouseleave(function(){
						pnotify.pnotify_queue_remove();
						$.pnotify_position_all();
					});
				}

				if (opts.pnotify_closer) {
					if (closer) closer.remove();
					closer = $("<div />").addClass("ui-pnotify-closer").css("cursor", "pointer");
					closer.append($("<span />").addClass("ui-icon ui-icon-circle-close"));
					closer.click(function(){
						pnotify.pnotify_remove();
					});
					closer.hide();
					pnotify.container.prepend(closer);
					pnotify.hover(function(){
						closer.show();
					}, function(){
						closer.hide();
					});
				}
			};

			pnotify.pnotify_queue_position = function() {
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout($.pnotify_position_all, 10);
			};

			pnotify.pnotify_display = function() {
				if (pnotify.parent().get()) {
					pnotify.pnotify_init();
				}
				if (opts.pnotify_before_open)
					opts.pnotify_before_open(pnotify);
				pnotify.pnotify_queue_position();
				// First show it, then set its opacity to 0, then fade into the set opacity.
				pnotify.show().fadeTo(0, 0).fadeTo(opts.pnotify_fade_speed, opts.pnotify_opacity, function(){
					if (opts.pnotify_after_open)
						opts.pnotify_after_open(pnotify);
				
					// Now set it to hide.
					if (opts.pnotify_hide) {
						pnotify.pnotify_queue_remove();
					}
				});
			};

			pnotify.pnotify_remove = function() {
				if (opts.pnotify_before_close)
					opts.pnotify_before_close(pnotify);
				if (pnotify.timer) {
					window.clearTimeout(pnotify.timer);
					pnotify.timer = null;
				}
				pnotify.fadeOut(opts.pnotify_fade_speed, function(){
					if (opts.pnotify_after_close)
						opts.pnotify_after_close(pnotify);
					pnotify.pnotify_queue_position();
					if (opts.pnotify_remove)
						pnotify.remove();
				});
			};

			pnotify.pnotify_cancel_remove = function() {
				if (pnotify.timer) {
					window.clearTimeout(pnotify.timer);
				}
			};

			pnotify.pnotify_queue_remove = function() {
				pnotify.pnotify_cancel_remove();
				pnotify.timer = window.setTimeout(function(){
					pnotify.pnotify_remove();
				}, (isNaN(opts.pnotify_delay) ? 0 : opts.pnotify_delay));
			};

			if (opts.pnotify_type == "error") {
				pnotify.container.addClass("ui-state-error");
			} else if (opts.pnotify_type == "notice") {
				pnotify.container.addClass("ui-state-highlight");
			}

			if ((opts.pnotify_notice_icon && opts.pnotify_type == "notice") || (opts.pnotify_error_icon && opts.pnotify_type == "error")) {
				var icon = $("<div />").addClass("ui-pnotify-icon");
				icon.append($("<span />").addClass(opts.pnotify_type == "notice" ? opts.pnotify_notice_icon : opts.pnotify_error_icon));
				pnotify.container.append(icon);
			}

			if (typeof opts.pnotify_title == "string") {
				var title = $("<span />").addClass("ui-pnotify-title");
				title.html(opts.pnotify_title);
				pnotify.container.append(title);
			}

			if (typeof opts.pnotify_text == "string") {
				var text = $("<span />").addClass("ui-pnotify-text");
				text.html(opts.pnotify_text);
				pnotify.container.append(text);
			}

			if (typeof opts.pnotify_width == "string") {
				pnotify.css("width", opts.pnotify_width);
			}

			if (typeof opts.pnotify_min_height == "string") {
				pnotify.container.css("min-height", opts.pnotify_min_height);
			}

			pnotify.hide();
			
			var body_data = body.data("pnotify");
			if (typeof body_data != "object")
				body_data = Array();
			body_data = $.merge(body_data, [pnotify]);
			body.data("pnotify", body_data);

			if (opts.pnotify_after_init)
				opts.pnotify_after_init(pnotify);

			pnotify.pnotify_display();

			if (opts.pnotify_history) {
				var body_history = body.data("pnotify_history");
				if (typeof body_history == "undefined") {
					body_history = $("<div />").addClass("ui-pnotify-history-container ui-state-default ui-corner-bottom");
					body.append(body_history);
					
					body_history.append($("<div>Redisplay</div>").addClass("ui-pnotify-history-header"));
					body_history.append($("<button>All</button>").addClass("ui-pnotify-history-all ui-state-default ui-corner-all").hover(function(){
						$(this).addClass("ui-state-hover");
					}, function(){
						$(this).removeClass("ui-state-hover");
					}).click(function(){
						$.each(body_data, function(){
							if (this.pnotify_display)
								this.pnotify_display();
						});
					}));
					body_history.append($("<button>Last</button>").addClass("ui-pnotify-history-last ui-state-default ui-corner-all").hover(function(){
						$(this).addClass("ui-state-hover");
					}, function(){
						$(this).removeClass("ui-state-hover");
					}).click(function(){
						if (body_data[body_data.length - 1] && body_data[body_data.length - 1].pnotify_display)
							body_data[body_data.length - 1].pnotify_display();
					}));

					var handle = $("<span></span>").addClass("ui-pnotify-history-pulldown ui-icon ui-icon-grip-dotted-horizontal").mouseenter(function(){
						body_history.animate({top: "0"}, {duration: 100, queue: false})
					});
					body_history.append(handle);
					history_handle_top = handle.offset().top + 2;

					body_history.mouseleave(function(){
						body_history.animate({top: "-"+history_handle_top+"px"}, {duration: 100, queue: false});
					});
					body_history.css({top: "-"+history_handle_top+"px"});

					body.data("pnotify_history", body_history);
				}
			}

			return pnotify;
		}
	});

	$.pnotify.defaults = {
		// Display a pull down menu to redisplay previous notices.
		pnotify_history: true,
		// Width of the notice.
		pnotify_width: "300px",
		// Minimum height of the notice. It will expand to fit content.
		pnotify_min_height: "16px",
		// Type of the notice. "notice" or "error".
		pnotify_type: "notice",
		// The icon class to use if type is notice.
		pnotify_notice_icon: "ui-icon ui-icon-info",
		// The icon class to use if type is error.
		pnotify_error_icon: "ui-icon ui-icon-alert",
		// Speed at which the notice fades in and out. "slow", "def", "fast" or number of milliseconds.
		pnotify_fade_speed: "slow",
		// Opacity to fade to.
		pnotify_opacity: 1,
		// Provide a button for the user to manually close a notice.
		pnotify_closer: true,
		// After a delay, make the notice disappear.
		pnotify_hide: true,
		// Delay in milliseconds before the notice disappears.
		pnotify_delay: 8000,
		// Remove the notice from the DOM after it disappears.
		pnotify_remove: true
	};
})(jQuery);