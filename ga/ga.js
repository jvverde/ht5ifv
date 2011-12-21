var _gaq = _gaq || [];
 _gaq.push(['_setAccount', 'UA-25549750-1']);
 _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
	


	
	(function(){	//google+
		var $body = document.getElementsByTagName('body')[0];
		var $div = document.createElement('span');
		$div.innerHTML = '<g:plusone annotation="inline"></g:plusone>';
		$body.appendChild($div);
		(function() {
			var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
			po.src = 'https://apis.google.com/js/plusone.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
		})();
	})();


	(function(d, s, id) { //facebook
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		var $body = d.getElementsByTagName('body')[0];
		var $div = d.createElement('span');
		console.log($div);
		$div.innerHTML = '<div id="fb-root"></div><div class="fb-like-box" data-href="http://www.facebook.com/ht5ifv" data-width="600" ' 
			+ 'data-show-faces="false" data-stream="false" data-header="true"></div>';
		$body.appendChild($div);
		js = d.createElement(s); js.id = id;
		js.src = "http://connect.facebook.net/en_US/all.js#xfbml=1";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));



