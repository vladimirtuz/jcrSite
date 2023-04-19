var Fluid = {
	/*
	 * One set of triggers fire for portrait, the other for landscape
	 * The triggers come in pairs - detected width: forced width if less than detected
	 */
	triggers: {
		portrait: {
			680: 640,
			1060: 1000	
		},
		landscape: {
			680: 640,
			1060: 1000	
		}
	},
	ORIENTATION_PORTRAIT: 'portrait',
	ORIENTATION_LANDSCAPE: 'landscape',
	opts: {},
	last_resize: 0,
	body: '',
	
	init: function(opts) {
		this.opts = opts;
		this.body = jQuery('body');
		jQuery(window).resize(function() {
			Fluid.resize();
		});	
		this.resize();
		
		
		var last_orientation = this.getOrientation();
		if(screen.width < 1024 && last_orientation == 'portrait')
			jQuery('body').addClass('portrait');
		else
			jQuery('body').removeClass('portrait');
		setInterval(function() {
			var o = Fluid.getOrientation();
			if (o != last_orientation) {
				last_orientation = o;
				if(screen.width < 1024 && last_orientation == 'portrait')
					jQuery('body').addClass('portrait');
				else
					jQuery('body').removeClass('portrait');
				Fluid.orientationChange();
			}
		}, 250); 
	},
	
	orientationChange: function() {
		jQuery('#viewport').attr('content','width=device-width');
		
		this.resize();
	},
	
	getOrientation: function() {
		if (typeof window.orientation == 'undefined')
			return this.ORIENTATION_PORTRAIT;
		var o = window.orientation;
		if (o == 0 || o == 180 || o == -180)
			return this.ORIENTATION_PORTRAIT;
		else
			return this.ORIENTATION_LANDSCAPE;
	},
	
	getCurrentLayout: function(){
		var me = this;
		var classes = me.body.attr('class');
		if(classes == undefined)
			classes = '';
		if(classes.indexOf('mobile') >= 0)
			return 2;
		else if(classes.indexOf('tablet') >= 0)
			return 1;
		else
			return 0;
		
	},
	
	resize: function() {
		var width = jQuery(window).width();
		var orientation = this.getOrientation();
		
		for (var trigger_width in this.triggers[orientation]) {
			if (width < trigger_width) {
				jQuery('#viewport').attr('content', 'width=' + this.triggers[orientation][trigger_width]);
				break;	
			}
		}
				
		for (var w in this.opts) {
			var c = this.opts[w];
			if (width < w){
				jQuery('body').addClass(c);
			}
			else{
				jQuery('body').removeClass(c);
			}
		}
		jQuery(window).trigger('fluid_resize');
	}
};

var customselect = {
	SLIDE_SPEED: 250,
	KEY_UP: 38,
	KEY_DOWN: 40,
	KEY_ENTER: 13,
	KEY_ESCAPE: 27,
	KEY_BACKSPACE: 8,
	MAX_ELAPSED_KEY: 1000,
	
	init: function(selector) {
		jQuery(selector).each(function() {
			customselect.create(jQuery(this));
		});
	},
	
	create_multiple: function(jq) {				
		function close_box() {
			cslist.stop().slideUp(customselect.SLIDE_SPEED);
			box_open = false;
		}
		function open_box() {
			cslist.attr('style','display: none').slideDown(customselect.SLIDE_SPEED);
			box_open = true;
		}
		function check_close() {
			if (box_open && !box_focused && !list_focused && !list_item_focused) {
				close_box();		
			}
		}
		function create_li(value, text, selected_values) {
			var li = jQuery('<li><input type="checkbox" value="' + value + '" data-label="' + text + '" />' + text + '</li>');
			var li_chk = li.children('input');
			
			for (var i in selected_values) {
				if (selected_values[i] == value) {
					li.addClass('selected');
					li_chk.attr('checked','checked');					
					break;	
				}
			}
			
			li_chk.focus(function() {
				list_item_focused = true;
			}).blur(function() {
				list_item_focused = false;
			}).change(function() {
				var is_selected = li_chk.is(':checked');
				
				if (is_selected)
					li.addClass('selected');
				else
					li.removeClass('selected');
					
				update_value();						
								
			}).click(function(e) {
				e.stopPropagation();
			});
			
			li.click(function() {
				li_chk.click();				
			});
			
			return li;
		}
		function update_value() {
			var label = "";
			var val = [];
			cslist.find('input:checked').each(function() {
				var jq_inp = jQuery(this);
				val.push( jq_inp.val() );
				label = jq_inp.data('label');
			});	
			jq.val(val);
			
			if (val.length > 1)
				label = "Multiple";
				
			csbox.html(label);
		}
		
		var box_focused = false,
			list_focused = false,
			list_item_focused = false,
			box_open = false;

		var csbox = jQuery('<div class="csbox" tabindex="0"></div>');
		var cslist = jQuery('<ul class="cslist" tabindex="0"></ul>');
		
		var container = jQuery('<div class="customselect"></div>');
		container.addClass(jq.attr('class'));
		container.append(csbox).append(cslist); 
		
		jq.hide();
		jq.after(container);
		
		var current_val = jq.val();		
		if (!current_val)
			current_val = [];
		
		var options = jq.children();
		for (var i=0; i<options.length; i++) {
			var opt = jQuery(options[i]);
			var v = opt.val();
			var li_text = opt.text();
						
			cslist.append( create_li(v, li_text, current_val) );
		}
		
		update_value();
		
		csbox.mousedown(function() {
			if (box_focused) {
				if (!box_open)
					open_box();
				else
					close_box();	
			}				
		}).focus(function() {
			box_focused = true;
			if (!box_open)
				open_box();
			else
				close_box();
		}).blur(function() {
			box_focused = false;
		});
		
		cslist.focus(function() {
			list_focused = true;
		}).blur(function() {
			list_focused = false;
		});
		
		setInterval(function() {
			check_close();
		}, 100);
	},
	
	create: function(jq, is_fixed) {
		if (jq.hasClass('nocustomselect'))
			return;
		if (jq.data('is_custom_select')) {
			
			return;
		}
		jq.data('is_custom_select', true);
		
		if (jq.attr('multiple') == 'multiple') {
			customselect.create_multiple(jq);
			return;	
		}
		
		if (typeof is_fixed == 'undefined') {
			is_fixed = false;
		}
		if (jq.hasClass('is_fixed')) {
			is_fixed = true;
		}
		
		var append_class = false;
		if (jq.hasClass('append-class'))
			append_class = true;
		
		var is_combobox = jq.hasClass('combobox');
		
		var is_url_list = jq.hasClass('url-list');
		
		jq.on('hide', function() {
			container.hide();
		});
		jq.on('show', function() {
			container.show();
		});
		
		function select_item(item) {
			item.addClass('selected');

			if (!is_combobox) {
				csbox.html(item.html());
			} else {
				csbox.val(item.text());	
			}
			
			if (item.data('value') != jq.val()) {
				jq.val(item.data('value'));
				jq.trigger('change');
				if (is_url_list && jq.val().length > 0) {
					location.href = jq.val();	
				} 
			}			
			
			if (append_class) {
				if (csbox.data('last-value')) {
					csbox.removeClass('value-' + csbox.data('last-value'));	
				}
				csbox.data('last-value', item.data('value'));
				csbox.addClass('value-' + item.data('value'));	
			}

			if (typeof item.position() == 'undefined')
				return;			
			var pos = item.position().top + cslist.scrollTop() + cslist.height() / -2;	
			cslist.scrollTop(pos);
		}
		function close_box() {
			if (csbox.hasClass('focused')) {
				csbox.removeClass('focused');
				cslist.stop().removeClass('opening').slideUp(customselect.SLIDE_SPEED);
			}
		}
		function list_move(dir, combobox_move) {
			if (typeof combobox_move == 'undefined')
				combobox_move = false;
			
			if (combobox_move) {
				var children = cslist.children(':visible');
				
				var selected_child = children.filter('.selected');
				
				if (selected_child.length == 0) {
					cslist.children('.selected').removeClass('selected');
					if (children.length > 0) {
						jQuery(children[0]).addClass('selected');
					}	
				} else {
					var selected_index = 0;
					for(var i=0; i<children.length; i++) {
						if (jQuery(children[i]).hasClass('selected')) {
							selected_index = i;	
						}	
					}
					var next_index = selected_index + dir;
					if (next_index < 0)
						next_index = children.length - 1;
					else if (next_index >= children.length)
						next_index = 0;
						
					selected_child.removeClass('selected');
					jQuery(children[next_index]).addClass('selected');
				}
				
			} else {				
				var index = jq.prop('selectedIndex');
				var children = cslist.children();
				
				var next_index = index + dir;
				if (next_index < 0)
					next_index = children.length - 1;
				else if (next_index >= children.length)
					next_index = 0;
					
				if (dir == 0) {
					cslist.find('.selected').removeClass('selected');
				} else {
					jQuery(children[index]).removeClass('selected');
				}
				
				var next = jQuery(children[next_index]);
				
				select_item(next);
			}
		}
		jq.on('customselect-update', function() {
			list_move(0);
		});
		
		function list_search(s) {
			var t = new Date().getTime();
			var last_string = csbox.data('last_string');
			var last_time = parseInt(csbox.data('last_time'));
			if (isNaN(last_time)) 
				last_time = 0;
				
			if (t - last_time > customselect.MAX_ELAPSED_KEY) {
				last_time = t;
				last_string = "";
			}
			if (s == 'backspace') {
				last_string = last_string.substr(0, last_string.length - 1);
			} else {
				last_string = last_string + s;
			}
			csbox.data('last_time', t);
			csbox.data('last_string', last_string);
			
			var children = cslist.children();
			for (var i=0; i<children.length; i++) {
				var item = jQuery(children[i]);
				var cur = item.text().substr(0, last_string.length); 
				if (cur.toLowerCase() == last_string.toLowerCase()) {
					var index = jq.prop('selectedIndex');
					jQuery(children[index]).removeClass('selected');
					select_item(item);						
					break;
				}
			}
		}
		jq.hide();
		
		if (!is_combobox) {
			var csbox = jQuery('<div class="csbox" tabindex="0"></div>');
		} else {
			var csbox = jQuery('<input type="text" class="csbox" />');
			
			var placeholder = jq.data('combo-placeholder');
			if (placeholder)
				csbox.attr('placeholder', placeholder);
			
			csbox.keydown(function(e) {
				if (e.keyCode == customselect.KEY_DOWN) {
					list_move(1, true);
					return false;
				} else if (e.keyCode == customselect.KEY_UP) {
					list_move(-1, true);
					return false;
				} else if (e.keyCode == customselect.KEY_ENTER) {
					select_item(cslist.children('.selected:visible'));
					csbox.blur();
					return false;
				} else if (e.keyCode == customselect.KEY_ESCAPE) {
					csbox.blur();
					return false;
				}
			});
			csbox.keyup(function() {
				var val = csbox.val().toLowerCase();
				var children = cslist.children();
				
				if (val == '')
					children.show();
				else {
					for (var i=0; i<children.length; i++) {
						var item = jQuery(children[i]);
						var item_text = item.text().toLowerCase();
						if (item_text.indexOf(val) > -1) {
							item.show();	
						} else {
							item.hide();	
						}
					}	
					list_move(0, true);
				}
			});
			csbox.focus(function() {
				csbox.val('').keyup();
			});
			csbox.blur(function() {
				csbox.val( jq.children(':selected').text() );
			});
			
		}
		var cslist = jQuery('<ul class="cslist"></ul>');
		
		var container = jQuery('<div class="customselect"></div>');
		container.addClass(jq.attr('class'));
		container.append(csbox).append(cslist); 
		
		jq.after(container);
		
		var current_val = jq.val();			
		
		var options = jq.children();
		var selected_index = 0;
		for (var i=0; i<options.length; i++) {
			var opt = jQuery(options[i]);
			var c = '';
			var v = opt.val();
			var li_text = opt.text();
			li_text = li_text.replace('**', '<strong>');
			li_text = li_text.replace('**', '</strong>');
			
			var li = jQuery('<li data-value="' + v + '">' + li_text + '</li>');
			if (append_class)
				li.addClass('value-' + v);
			li.mousedown(function() {
				var me = jQuery(this);
				cslist.children().removeClass('selected');
				select_item(me);
				close_box();
			});
			cslist.append(li);
			if (v == current_val) {
				selected_index = i;
			}
		}
		if (options.length > 9)
			container.addClass('large-list');
		
		
		var children = cslist.children();
		var sel_item = jQuery(children[selected_index]);
		select_item(sel_item);
		
		var fixed_top_offset = parseInt(cslist.css('top'));

		csbox.mousedown(function() {
			if (csbox.hasClass('focused') && !cslist.hasClass('opening')) {
				csbox.blur();
				return false;
			}
		});
		csbox.focus(function() {
			cslist.attr('style','display: none');
			csbox.addClass('focused');
			
			if (is_fixed) {
				var offset = csbox.offset();
				var window_offset = jQuery(window).scrollTop();
				cslist.css({top: offset.top + fixed_top_offset - window_offset, left: offset.left});
			}
						
			cslist.addClass('opening').slideDown(customselect.SLIDE_SPEED, function() {
				jQuery(this).removeClass('opening');
			});
		});
		csbox.blur(function() {
			close_box();
		});
		
		if (!is_combobox)
		csbox.keydown(function(e) {
			if (e.keyCode == customselect.KEY_DOWN) {
				list_move(1);
				return false;
			} else if (e.keyCode == customselect.KEY_UP) {
				list_move(-1);
				return false;
			} else if (e.keyCode == customselect.KEY_ENTER || e.keyCode == customselect.KEY_ESCAPE) {
				close_box();
				return false;
			} else if (e.keyCode == customselect.KEY_BACKSPACE) {
				list_search("backspace");
				return false;
			} else {
				var k = e.keyCode;
				if (k >= 96 && k <= 105) {
					//keypad 0-9
					k -= 48;
				}
				if (
					(k >= 65 && k <= 90) //a-z
					|| (k >= 48 && k <= 57) //0-9 
					|| (k == 32)
				) {
					list_search(String.fromCharCode(k));
					return false;
				}
			}
		});
		
		if (is_fixed) {
			cslist.addClass('is_fixed');
		}
	}
};
jQuery(function() {
	customselect.init('select.custom');
});
var slider = {
	instances: [],
	
	init: function(opts) {
		if (typeof opts == 'undefined')
			opts = {};
		if (typeof opts.selector == 'undefined')
			opts.selector = '.slider';
			
		jQuery(opts.selector).each(function() {
			slider.instances.push(new slider.slider_instance(jQuery(this), opts));
		});	
	},
	
	slider_instance: function(jq, opts) {
		if (jq.hasClass('slider-init'))
			return;
		jq.addClass('slider-init');
		
		var jq_image_list = jq.find('ul').first(),
			jq_win = jQuery(window),
			jq_body = jQuery('body'),
			jq_image_list_container,
			slides = [],
			left = 0,
			left_delta = 0,
			min_left = 0,
			total_width = 0,
			first_index = 0,
			view_width = 0,
			last_reported_index = -1,
			auto_move_timer = 0;
			
		if (typeof opts.after_create == 'undefined')
			opts.after_create = function(jq, slides, opts) {};
			
		if (typeof opts.index_update == 'undefined')
			opts.index_update = function(jq, slides, index, opts) {};
			
		if (typeof opts.swipe_maximum_touch_duration == 'undefined')
			opts.swipe_maximum_touch_duration = 500;
			
		if (typeof opts.swipe_minimum_movement == 'undefined')
			opts.swipe_minimum_movement = 100;
			
		if (typeof opts.click_maximum_movement == 'undefined')
			opts.click_maximum_movement = 10;
		
		if (typeof opts.click_maximum_touch_duration == 'undefined')
			opts.click_maximum_touch_duration = 350;
			
		if (typeof opts.center_view_delay == 'undefined')
			opts.center_view_delay = 250;
			
		if (typeof opts.transition == 'undefined')
			opts.transition = 'swipe';
			
		if (typeof opts.auto_movement == 'undefined')
			opts.auto_movement = false;
		
		if (typeof opts.auto_move_delay == 'undefined')
			opts.auto_move_delay = 8000;
			
		if (typeof opts.track_mouse == 'undefined')
			opts.track_mouse = false;
			
		function resize() {
			view_width = jq.width();
			
         	var width_counter = 0;
         	for(var index in slides) {
         		var slide = slides[index];
         		slide.width = slide.jq.width();
         		
         		if (opts.transition == 'swipe') {
	         		slide.jq.css({
    	     			left: width_counter
        	 		});
        	 	}
         		
         		width_counter += slide.width;         		
         	};
         	total_width = width_counter;
         	left = left_delta = min_left = first_index = 0;
         	
         	if (opts.transition == 'swipe') {
	         	jq_image_list.css({left: left});
    	     	move_complete();
    	     }
		}
		
		function start_auto_move() {
			if (opts.auto_movement) {
				stop_auto_move();
				auto_move_timer = setInterval(function() {
					jq.trigger('slider_next');
				}, opts.auto_move_delay);
			}	
		}
		
		function stop_auto_move() {
			if (opts.auto_movement) {
				if (auto_move_timer)
					clearInterval(auto_move_timer);
			}
		}
						
		function init() {
			jq_image_list.wrap('<div class="slider-image-list" />');
			jq_image_list_container = jq_image_list.parent();
			jq_image_list_container.css({
			    overflow: 'hidden',
            	position: 'relative',
            	width: '100%',
            	height: '100%'
         	});
         	
         	if (opts.track_mouse) {
         		jq_image_list_container.css({cursor: 'move'});
         	}
         	
         	jq_image_list.css({
         		'list-style': 'none',
         		position: 'relative',
         		left: 0
         	});
         	
         	jq_image_list.children('li').each(function() {
         		var slide = {
         			jq: jQuery(this)
         		};
         		slide.jq.css({
        			position: 'absolute',
         			top: 0,
         			overflow: 'hidden'
         		});
         		
         		slides.push(slide);    		
         	});
         	
         	opts.after_create(jq, slides, opts);
         	
         	resize();
         	move_complete();
         	
         	start_auto_move();
         	
         	//sets up mouse/touch movements
         	//includes swipe logic
         	//includes window movement
         	//includes click logic
         	var timer_start = 0;
         	var last_mouse_x = 0;
         	var start_index = 0;
         	var scroll_top = 0;
         	var last_x_pos = 0;
         	track_movement(jq_image_list, function(start_x, start_y) {
         		timer_start = Date.now();
         		last_mouse_x = left_delta = 0;
         		start_index = get_center_slide_index(0);
         		scroll_top = jq_body.scrollTop();
         		last_x_pos = start_x;
         		stop_auto_move();
         	}, function(x, y, x_pos, y_pos) {
         		if (opts.transition == 'swipe') {
         			move_slides(x,y);
         		}
         		last_mouse_x = x;
         		
         		jq_body.scrollTop(scroll_top - y);
         		
         		last_x_pos = x_pos;
         	}, function() {
         		start_auto_move();
         		var total_time = Date.now() - timer_start;
         		var end_index = get_center_slide_index(last_mouse_x);
         		
         		var swipe = false;
         		if (end_index == start_index) {
         			//swipe logic
	         		if (total_time <= opts.swipe_maximum_touch_duration) {
    	     			if (Math.abs(last_mouse_x) >= opts.swipe_minimum_movement) {
        	 				swipe = last_mouse_x;       	 					
	         			}
	         		}
	         		//click logic
	         		if (swipe === false && total_time <= opts.click_maximum_touch_duration) {
    	     			if (Math.abs(last_mouse_x) <= opts.click_maximum_movement) {
    	     				//its a click!

							for(var i in slides) {
								var cur_left = slides[i].jq.position().left + left;
								var cur_width = slides[i].width;
								
								if (cur_left < last_x_pos && cur_left + cur_width > last_x_pos) {
									
									slides[i].jq.trigger('slide_click');
									
									break;	
								}
							}

    	     				
	         			}	         			
	         		}	         		
         		}			
         		         		         		
         		if (opts.transition == 'swipe' || swipe !== false) {
	         		move_complete(swipe);
	         	}	
         	}, opts.track_mouse);

		}
		
		function move_slides(x,y) {
			left_delta = x;
			var cur_x = left + left_delta;
			
			jq_image_list.css({left: cur_x});
			
			shift_slides(cur_x);
			
			update_index(x);
			
			
		}
		
		function shift_slides(cur_x) {
			
			if (cur_x >= min_left) {
				//if the left side is about to show nothing, move the last item to the first position
				first_index--;
				if (first_index < 0)
					first_index = slides.length - 1;
				
				slides[first_index].jq.css({left: -min_left - slides[first_index].width});
				
				min_left += slides[first_index].width;
			} else if (cur_x + total_width <= min_left + view_width) {
				//if the right side is about to show nothing, move the first item to the last position
				slides[first_index].jq.css({left: -min_left + total_width});
				
				first_index++;
				if (first_index > slides.length - 1)
					first_index = 0;
				
				min_left -= slides[first_index].width;
			}			
		}
		
		function update_index(left_shift) {
			var cur_index = get_center_slide_index(left_shift);
			
			if (cur_index != last_reported_index) {
				last_reported_index = cur_index;
				opts.index_update(jq, slides, last_reported_index, opts);
			}
		}
		
		function get_center_slide_index(left_shift) {
			if (opts.transition == 'swipe') {
				var center_view = view_width / 2; 
				for(var i in slides) {
					var cur_left = slides[i].jq.position().left + left + left_shift;
					var cur_width = slides[i].width;
					
					if (cur_left < center_view && cur_left + cur_width > center_view) {
						
						return i;
						
						break;	
					}
				}
			} else if (opts.transition == 'fade') {
				for(var i in slides) {
					if (slides[i].jq.is(':visible'))
						return i;	
				}	
			}
			return 0;
		}
		
		function move_complete(swipe) {
			if (typeof swipe == 'undefined')
				swipe = false;
				
			start_auto_move();
			
			//first wrap elements if necessary
			left = left + left_delta;
			
			if (left > total_width) {
				left -= total_width;	
				
				for(var i in slides)
					slides[i].jq.css({left: '+=' + total_width});
				
				jq_image_list.css({left: left});
				
				min_left -= total_width;
			} else if (-left > total_width) {
				left += total_width;	
				
				for(var i in slides)
					slides[i].jq.css({left: '-=' + total_width});
				
				jq_image_list.css({left: left});
				
				min_left += total_width;
			}
			
			
			//next center the current view
			var center_index = get_center_slide_index(0);
			
			if (swipe !== false) {
				if (swipe > 0) {
					center_index--;
					if (center_index < 0)
						center_index = slides.length - 1;
				} else {
					center_index++;				
					if (center_index >= slides.length)
						center_index = 0;	
				}
			}

			move_to_index(center_index);
		}
		
		function move_to_index(index) {
			start_auto_move();
			if (opts.transition == 'swipe') {
				var center_view = view_width / 2; 
	
				var cur_left = slides[index].jq.position().left + left;
				var cur_width = slides[index].width;
				
				//adjust screen so this one is centered
				//~~ forces a nice round number (it's faster than round)
				var delta = ~~(center_view -  (cur_left + cur_width / 2));
				
				jq_image_list.stop(false,true).animate({left: left + delta}, opts.center_view_delay);
				
				left += delta;
				
				shift_slides(left);
				update_index(0);
			} else if (opts.transition == 'fade') {
				var prev_item = jq.find('li:visible');
				if (prev_item.length > 0) {
					prev_item.animate({opacity:0}, opts.center_view_delay);	
				}
				slides[index].jq.css({
					display: 'block',					
					'z-index': 10,
					opacity: 0
				}).animate({
					opacity: 1	
				}, opts.center_view_delay, function() {
					jq_image_list.children('li').hide();
					slides[index].jq.css({'z-index':'',display:'block'});
					update_index(0);
				});	
			}
			
			
		}
		
		jq.on('slider_move', function(jq, index) {
			move_to_index(index);
		});
		jq.on('slider_previous', function(jq, index) {
			move_complete(1);
		});
		jq.on('slider_next', function(jq, index) {
			move_complete(-1);
		});
		
		jq_win.resize(function() {
			resize();
		});
		
		this.move_to_index = move_to_index;
		this.slides = slides;
		
		init();
	}
};

function track_movement(jq, start_callback, move_callback, release_callback, track_mouse) {
 	var is_down = false;
 	var start_x = 0;
 	var start_y = 0;
 	
 	if (typeof track_mouse == 'undefined')
 		track_mouse = false;
 	
 	if (track_mouse)
	jq.on('mousedown', function(ev) {
		is_down = true;
 		start_x = ev.clientX;
 		start_y = ev.clientY;
 		start_callback(start_x, start_y);
 		return false;
	});	
	
	if (track_mouse)
	jq.on('mouseup mouseout', function(ev) {
		if (is_down) {
			is_down = false;
			release_callback();
		}
	});	
	
	if (track_mouse)
	jq.on('mousemove', function(ev) {
		if (is_down) {
         	var x_delta = ev.clientX - start_x;
			var y_delta = ev.clientY - start_y;
			move_callback(x_delta, y_delta, ev.clientX, ev.clientY);
			return false;			
		}		
	});
	
	jq.on('touchstart', function(ev) {
		var touches = ev.originalEvent.touches;
		if (touches.length >= 1) {
			start_x = touches[0].clientX;
			start_y = touches[0].clientY;
			is_down = true;
			start_callback(start_x, start_y);
		}
	});
	jq.on('touchend', function(ev) {
		if (is_down) {
			is_down = false;
			release_callback();
		}
	});
	jq.on('touchmove', function(ev) {
		var touches = ev.originalEvent.touches;
		if (touches.length >= 1) {
			var x_delta = touches[0].clientX - start_x;
			var y_delta = touches[0].clientY - start_y;
			move_callback(x_delta, y_delta, touches[0].clientX, touches[0].clientY);
			return false;
		}
	});
}
var center_images = {
	jq_win: {},
	images: [],
	
	resize: function() {
		if (this.images.length > 0) {
			for(var i in this.images)
				this.resize_image(this.images[i]);
		}
	},
	
	resize_image: function(info) {
		var jq = info[0];
		var jq_parent = info[1];
		var w = info[2];
		var h = info[3];
		
		var parent_w = jq_parent.width();
		var parent_h = jq_parent.height();
		
		var r = w/h;
		var parent_r = parent_w/parent_h;
				
		/*
		 * r		500 x 300	1.67
		 * 
		 * parent_r	400 x 200	2
		 * 
		 *	r > pr		 full height
		 * 	else		full width
		 */
		
		var final_w, final_h, final_l, final_t;
		if (r < parent_r) {
			final_t = 0;
			final_h = '100%';
			
			final_w = (parent_h/h)*w;
			final_l = (final_w - parent_w) / -2; 	
		} else {
			final_w = '100%';
			final_l = 0;
			
			final_h = (parent_w/w)*h;
			final_t = (final_h - parent_h) / -2;	
		}
		
		jq.css({
			top: final_t,
			left: final_l,
			width: final_w,
			height: final_h
		});
		
	},
	
	init: function() {
		var me = this;
		jQuery('.center-images img').each(function() {
			me.init_item(jQuery(this));
		});
		this.jq_win = jQuery(window);
		
		setInterval(function() {
			me.resize();		
		}, 250);
		jQuery(window).resize(function() {
			me.resize();
		});
	},
	
	init_item: function(jq) {
		
		if (jq.hasClass('center-image-init'))
			return;
		jq.addClass('center-image-init');
		jq.css({position: 'relative'});
		
		var jq_parent = jq.parent();
		
		var me = this;
		this.wait_for_dimensions(jq, function(w,h, iterations) {
			me.images.push([jq,jq_parent,w,h]);						
		});		
	},
	
	wait_for_dimensions: function(jq, callback, iterations) {
		if (typeof iterations == 'undefined')
			iterations = 0;
			
		var item = jq.get(0);
		if (typeof item.naturalWidth != 'undefined' && item.naturalWidth > 0) {
			callback(item.naturalWidth, item.naturalHeight, iterations);	
		} else {		
			var me = this;
			//slowly increase the time between each call
			setTimeout(function() {
				me.wait_for_dimensions(jq, callback, ++iterations);
			}, iterations + 1);
		}
	}
};

jQuery(function() {
	//center_images.init();
});

var shareWork = {
	init: function() {
		var me = this;
		jQuery('body').on('click', '.share-work a', function() {
			return me.process_click(jQuery(this));
		});	
	},
	
	process_click: function(jq) {
		var url = "";
		var info = jq.parents('.share-work');
		
		if (jq.hasClass('facebook')) {
			url = 'http://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(info.data('share-url'));
		} else if (jq.hasClass('twitter')) {
			url = 'https://twitter.com/share?text=' + encodeURIComponent(info.data('share-text')) + 
					'&url=' +encodeURIComponent(info.data('share-url'));
		}
		
		if (url.length > 0) {
			window.open(url, 'share_dialog', 'width=610,height=460');
			return false;	
		}
		return true;
	}
}
jQuery(function() {
	shareWork.init();
});
