var Shield = function () {

	var self = this;
	var i18n = {
		getMessage: function (id) {
			return self.localization[id];
		}
	};
	var createShareLink = function(network, rank)
	  {
	    var shareURL = 'https://adblockultimate.net/'+rank;
	 
	  	var messageMark = {};
	  	shareLinks = {
	    facebook: ["https://www.facebook.com/dialog/feed", {
	      app_id: "759703234176582",
	      link: shareURL,
	      redirect_uri: "https://www.facebook.com/",
	      ref: "adcounter",
	      name: messageMark,
	      actions: JSON.stringify([
	        {
	          name: 'Download AdBlocker Ultimate',
	          link: shareURL
	        }
	      ])
	    }],
	    gplus: ["https://plus.google.com/share", {
	      url: shareURL
	    }],
	    twitter: ["https://twitter.com/intent/tweet", {
	      text: messageMark,
	      url: shareURL,
	      via: "AdblockUltimate"
	    }]
	  };
	    var url = shareLinks[network][0];
	    var params = shareLinks[network][1];
	    var querystring = [];
	    for (var key in params)
	    {
	      var value = params[key];
	      if (value == messageMark){
		value = '';
	      }
	      querystring.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
	    }
	    return url + "?" + querystring.join("&");
	  };
	this.init = function(rank){
		var width = 718;
		var height = 482;
		var offset = 25;
		var viewPort = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		var positions = {
			left: viewPort.width - width - offset,
			top: offset
		};
		var cssStyle = {
			width: width,
			height: height,
			position: 'fixed',
			left: positions.left,
			top: positions.top,
			'z-index': 99999999999
		};
		var iframe = $('<iframe />').attr({
			frameBorder: 0,
			allowTransparency: 'false'
		}).css(cssStyle).appendTo('body');
/*
		var script = $('<script />', {'type': 'text/javascript', 
			'src': rank['baseUrl']+'../../lib/pages/i18n.js'
		});
		script.insertBefore($(rank['template']).first('link'));
*/
		iframe.contents().find('head').append('<meta charset="utf-8"/>');

		rank['template'] = $.parseHTML(rank['template']);
		$(rank['template']).first('link').attr('href', rank['baseUrl']+rank['fname']+'.css');

		$.each($(rank['template']).find('img'), function(){
			$(this).attr('src', rank['baseUrl'] + $(this).attr('src'));
		});
		$(rank['template']).find('.padiClose').on('click', function(){
			iframe.remove();
			return false;
		});
		$(rank['template']).find('input[type="checkbox"]').on('change', function(){
    		val = $(this).is(':checked') ? 1 : 2;
    		contentPage.sendMessage({type: 'showBadgeAgain', 'val':val}); 
  		});
  		$(rank['template']).find('#share-buttons a').on('click', function(){
  			url = createShareLink($(this).attr('data-network'), $(this).attr('data-rank'));
		    contentPage.sendMessage({type: 'openTab', 'url':url});
		    return false;
  		});
  		$(rank['template']).find('.padiForm').on('submit', function(){
			contentPage.sendMessage({type: 'openTab', 'url': rank['buttonUrl']});
			contentPage.sendMessage({type: 'updateUserRated', 'val':1});
			iframe.remove();
  		});
  		/*
		$(rank['template']).find('.padiPop4Wrap').css('background-image', 'url('+rank['baseUrl']+'img/'+rank['fname']+'.png)');
		$(rank['template']).find('.padiButton').css('background-image', 'url('+rank['baseUrl']+'img/'+rank['action']+'.jpg)');
		*/
		$.each($(rank['template']).find("[i18n]"), function () {
			contentPage.sendMessage({type: 'getShieldLocalization', 'key': $(this).attr("i18n"), 'value': $(this).attr('i18n-plhr')}, function (message) {
				$.each($(rank['template']).find("[i18n="+message.key+"]"), function(){
					I18nHelper.translateElement(this, message.message);
				});
			});
		});

		setTimeout(
		function(){
		iframe.contents().find('body').html(rank['template']);
		}, 3000);
			//iframe.contents().find('body').append(rank['template']);

/*
		contentPage.sendMessage({type: 'getShieldLocalization'}, function (response) {
			$.each($(rank['template']).find("[i18n]"), function () {
				var message = response[$(this).attr("i18n")];
	  			if($(this).attr('i18n-plhr')){
					message.replace('$1', $(this).attr('i18n-plhr'));

				}
				I18nHelper.translateElement(this, message);
			});
			iframe.contents().find('body').append(rank['template']);
		});
		
		*/
		
	}
};

if (window.top === window && document.documentElement instanceof HTMLElement) {
	if(typeof browser !== "undefined"){
	browser.runtime.onMessage.addListener(request => {
        switch (request.type) {
            case 'initShield':
            	var shield = new Shield();
            	shield.init(request.rank);
                break;
        }
	});
}else{
	contentPage.onMessage.addListener(function (message) {
		console.log(message);
        switch (message.type) {
            case 'initShield':
            	var shield = new Shield();
            	shield.init(message.rank);
                break;
        }
    });
    }
}
/*
if (window.top === window && document.documentElement instanceof HTMLElement) {
	contentPage.onMessage.addListener(function (message) {
		console.log(message);
        switch (message.type) {
            case 'initShield':
            	var shield = new Shield();
            	shield.init(message.rank);
                break;
        }
    });
}
*/