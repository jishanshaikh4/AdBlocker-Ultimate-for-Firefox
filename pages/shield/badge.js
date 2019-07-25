/*
var PageController = function () {
};

PageController.prototype = {

  close: function(){
    contentPage.sendMessage({type: 'closeBadgePanel'});
  }
}
*/
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
	 
$(document).ready(function(){
  //var controller = new PageController();
  $('.padiClose').on('click', function(){
    contentPage.sendMessage({type: 'closeBadgePanel'});
    return false;
    //controller.close();
  });
  $('.padiForm').on('submit', function(){
	contentPage.sendMessage({type: 'openTab', 'url':url});
  });
  $('a').on('click', function(){
    url = createShareLink($(this).attr('data-network'), $(this).attr('data-rank'));
    contentPage.sendMessage({type: 'openTab', 'url':url});
    return false;
  });

  $('input[type="checkbox"]').on('change', function(){
    val = $('input[type="checkbox"]').is(':checked') ? 1 : 2;

    contentPage.sendMessage({type: 'showBadgeAgain', 'val':val});
  });
});