function getPageScroll() {
	return document.body.scrollTop || jQuery(window).scrollTop();
}

function quickMobile(){
	Fluid.init({
		680: 'mobile',
		1060: 'tablet',
		1330: 'six-to-five-column'
	});
}

var MenuScript = {
	init: function(){
		jQuery('#menu-button').click(function(){
			if(jQuery('#header').hasClass('menu-active')){
				jQuery('#menu').fadeOut(700).promise().done(function(){
					jQuery('#header').removeClass('full-height');
				});
				jQuery('#header').removeClass('menu-active');
			
			} else{
				jQuery('#header').addClass('menu-active');
				jQuery('#header').addClass('full-height');
				jQuery('#menu').fadeIn(700);
			}
		});
		if (location.search.indexOf('switch_language') > -1 && jQuery('body').hasClass('tablet')) {
			jQuery('#header').addClass('menu-active');
			jQuery('#menu').show();
		}
	},
};

var HomeScript = {
	SLIDE_CHANGE_DELAY: 8000,
	SLIDE_CHANGE_SPEED: 3000,
	quote_container: null,
	quotes: [],
	current: 0,
	slideChangeInterval: null,
	
	init: function(){
		var me = this;
		me.quote_container = jQuery('#quote-container');
		jQuery('#quote-container .quote').each(function(){
			var quote = jQuery(this);
			me.quotes.push(quote);
			quote.css({'z-index': 3});
		});
		me.current = 0;
		me.quotes[me.current].css({'z-index': 5});
		
		jQuery(window).on('fluid_resize', function(){
			var height = jQuery(this).height();
			me.quote_container.height(height);
		}).trigger('fluid_resize');
		
		me.slideChangeInterval = setInterval(function(){
			var next = me.current + 1 >= me.quotes.length ? 0 : me.current + 1;
			me.changeSlide(next);
		},me.SLIDE_CHANGE_DELAY);
	},
	
	changeSlide: function(toIndex){
		var me = this;
		var current = me.current;
		me.quotes[toIndex].css({'z-index': 4}).find('.quote-text').show();
		me.quotes[current].find('.quote-text').fadeOut(me.SLIDE_CHANGE_SPEED / 15);
		me.quotes[current].fadeOut(me.SLIDE_CHANGE_SPEED/2).promise().done(function(){
			me.quotes[toIndex].css({'z-index': 5});//.find('.quote-text').fadeIn(me.SLIDE_CHANGE_SPEED / 3);
			me.quotes[current].css({'z-index': 3}).show();
		});
		me.current = toIndex;
		
	}
};

var HomeImageScript = {
	IMAGE_CHANGE_DELAY: 8000,
	IMAGE_CHANGE_SPEED: 3000,
	image_container: null,
	images: [],
	current: 0,
	slideChangeInterval: null,
	disableClick: false,
	
	init: function(){
		var me = this;
		me.image_container = jQuery('#home-image-slider');
		me.image_container.find('img').each(function(){
			me.images.push(jQuery(this));
			jQuery(this).css({'z-index': 3});
		});
		me.current = 0;
		me.images[me.current].css({'z-index': 5});
		
		jQuery(window).on('fluid_resize', function(){
			me.image_container.height(jQuery(this).height());
		}).trigger('fluid_resize');
		
		jQuery('#home-image-slider').click(function(){
			if(me.disableClick)
				return false;
			clearInterval(me.slideChangeInterval);
			me.slideChangeInterval = null;
			me.disableClick = true;
			var next = me.current + 1 >= me.images.length ? 0 : me.current + 1;
			me.changeImage(next);
			me.slideChangeInterval = setInterval(function(){
				var next = me.current + 1 >= me.images.length ? 0 : me.current + 1;
				me.changeImage(next);
			},me.IMAGE_CHANGE_DELAY);
			setTimeout(function(){
				me.disableClick = false;
			}, 1500);
		});
		
		me.slideChangeInterval = setInterval(function(){
			var next = me.current + 1 >= me.images.length ? 0 : me.current + 1;
			me.changeImage(next);
		},me.IMAGE_CHANGE_DELAY);
	},
	
	changeImage: function(toIndex){
		var me = this;
		var current = me.current;
		me.images[toIndex].css({'z-index': 4});
		me.images[current].fadeOut(me.IMAGE_CHANGE_SPEED/2).promise().done(function(){
			me.images[toIndex].css({'z-index': 5});//.find('.quote-text').fadeIn(me.SLIDE_CHANGE_SPEED / 3);
			me.images[current].css({'z-index': 3}).show();
		});
		me.current = toIndex;
		
	}
};

var LanguageSwitcher = {
	EXPIRE_TIME: 1000*60*60*24*365, //in milliseconds - 1 year
	
	init: function(){
		var me = this;
		jQuery('#menu .language-switcher div, #desktop-language-search-contain .language-switcher div').click(function(){
			if(!jQuery(this).hasClass('inactive'))
				return;
			var new_language = jQuery(this).data('lang').toLowerCase();
			me.setCookie("language", new_language, me.EXPIRE_TIME);
			
			var hr = location;
			if (location.search.length > 0 && location.search.indexOf("switch_language") < 0)
				hr.search += '&switch_language=1';
			else if(location.search.indexOf("switch_language") < 0){
				hr.search += '?switch_language=1';
			} else{
				location.href = hr.href;
				location.reload();
			}
		});
	},
	
	getCookie: function(cookieName){
		var value = "; " + document.cookie;
		var parts = value.split("; " + cookieName + "=");
		if(parts.length == 2) return parts.pop().split(";").shift();
	},
	
	setCookie: function(name, val, expireTime){
		var d = new Date();
		d.setTime(d.getTime() + expireTime);
		var expires = "expires="+d.toUTCString();
		document.cookie = name+ "=" + val + "; " + expires + ';path=/';
	},
}



var hash_links = jQuery(function() {
	jQuery('[data-hash!=""][data-hash]').click(function() {
		var jq = jQuery(this);
		var hash_group = jq.data('hash-group');
		var hash = jq.data('hash');
		var hashes = location.hash.substr(1).split('/');
		
		hashes[hash_group] = hash;
		
		var hash_str = hashes.join('/');
				
		location.hash = hash_str;
		
		last_hash = location.hash;
	});
	
	function delay_click(hash, group) {
		//this will set a very short timer waiting for the object to exist, and once it does, gives other 
		//scripts a small period of time to setup handlers
		//initial interval is probably unnecessary, but the load times may vary wildly
		var max_attempts = 200;
		var attempts = 0;
		function do_click() {
			var hash_obj = jQuery('[data-hash="' + hash + '"][data-hash-group="' + group + '"]');
			if (hash_obj.length > 0) {
				clearInterval(click_interval);
				setTimeout(function() {
					hash_obj.click();
				}, 250);
			}			
		}
		var click_interval = setInterval(function() {
			do_click();
			if (attempts++ > max_attempts) {
				clearInterval(click_interval);	
			}
		}, 20);		
	}
	
	function check_new_hashes() {
		var hashes = location.hash.substr(1).split('/');
		if (hashes.length > 1) {
			for(var i=1; i<hashes.length; i++) {
				var h = hashes[i];
				if (h.length > 0) {
					delay_click(h, i);	
				}	
			}	
		}
	}
	
	check_new_hashes();
	
	var last_hash = location.hash;
	
	setInterval(function() {
		var new_hash = location.hash;
		if (new_hash != last_hash) {
			last_hash = new_hash;
			check_new_hashes();	
		}
	}, 350);
});

var NavHider = {
	DELTA_THRESHOLD: 40,
	prevScroll: 0,
	scrollInterval: null,
	header: null,
	
	init: function(){
		var me = this;
		me.header = jQuery('#header');
		
		if(!jQuery('#page').hasClass('home')){
			me.scrollInterval = setInterval(function(){
				var curScroll = getPageScroll();
				var delta = curScroll - me.prevScroll;
				var absDelta = delta < 0 ? -delta : delta;
				if(absDelta >= me.DELTA_THRESHOLD){
					if(delta > 0){ //scrolling down
						me.header.addClass('hidden');
					} else{ //scrolling up
						me.header.removeClass('hidden');
					}
					me.prevScroll = curScroll >= 0 ? curScroll : 0;
					
				}
			}, 40);
		}
	},
};

var script_inits = jQuery(function(){
	MenuScript.init();
	LanguageSwitcher.init();
	
	jQuery('.back-to-top').click(function(){
		jQuery('html, body').animate({
			scrollTop: 0,
		}, 1200, 'easeInOutCubic');
	});
	
	NavHider.init();
});

var desktop_nav_activator = jQuery(function(){
	var href = window.location.href;
	if(href.indexOf("work") > -1){
		jQuery('#desktop-menu .nav li:first-child').addClass('active');
	} else if(href.indexOf("news") > -1 || href.indexOf("social-media") > -1){
		jQuery('#desktop-menu .nav li:nth-child(3)').addClass('active');
	} else if(href.indexOf("studio") > -1 || href.indexOf("methodology") > -1 || href.indexOf("clients") > -1
	|| href.indexOf("team") > -1 || href.indexOf("awards") > -1 || href.indexOf("contact") > -1){
		jQuery('#desktop-menu .nav li:nth-child(2)').addClass('active');
	}
	
	if(jQuery('#page').hasClass('home')){
		jQuery('#header').addClass('home');
	}
});