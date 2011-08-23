$(document).ready(function(){
	var $n = $('body').data('n');
	try{
		$('head>title').html('ht5ifv - example ' + $n);
	}catch(e){
	}
	$('fieldset>legend').html(' Example ' + $n);

	var $code = (function(){
		if ($n == 0){ //very specif situation
				$html = $('head').html();
				return $html.replace(/<title(.|\n|\r)*?<\/title>|<style(.|\n|\r)*?\/style>|<meta(.|\n|\r)*?>/ig,'');
		}else{
			return $('head script').not('[src]').html();
		}
	})();
	
	var $replace = (function(){
		var $exp = { 
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;'				
		};
		return function($v){
			return $exp[$v];
		};
	})();
	$code = $code.replace(/\t/g,'  ').replace(/[<>&]/g,$replace) //remove special caracters and replace each tab by 2 spaces

	//add CSS for navigation section
	$('<link rel="stylesheet" type="text/css" href="common/nav.css">').appendTo("head");

	//add html for navigation section
	$.get('common/nav.html', function(data){	
		$('body').append(data);

	
		$('pre').html($code);	
		$('input[type="button"],input[type="submit"],input[type="reset"]').hover(
			function(){
				$(this).addClass('ui-state-hover');
			},
			function(){
				$(this).removeClass('ui-state-hover');
			}
		);
		$.ajax({
			url: '../docs/docs.html',
			type:'HEAD',
			success:function(){
				$('div#nav input#top').click(function(){
					window.location.href = '../docs/docs.html';
				})
			},
			error:function(){
				$('div#nav input#top').remove();
			}
		});
		var $next = 'ex' + ($n + 1) + '.html'
		$.ajax({
			url: $next,
			type:'HEAD',
			success:function(){
				$('div#nav input#next').click(function(){
					window.location.href = $next;
				})
			},
			error:function(){
				$('div#nav input#next').remove();
			}
		});
		var $prev = 'ex' + ($n - 1) + '.html'
		$.ajax({
			url: $prev,
			type:'HEAD',
			success:function(){
				$('div#nav input#prev').click(function(){
					var $prev = $n - 1;
					window.location.href = 'ex' + $prev + '.html';
				})
			},
			error:function(){
				$('div#nav input#prev').remove();
			}
		});
	})
});
//This function is called when the form is submited. 
//In fact it is submited to this javascript function
//Its here just to visual inspect when and what is sent to the "server"
var $cnt = 1;
function local_submit(){
	var $d = $('<div>Submited string ('+($cnt++)+'):</div>').append($('#fexample1').serialize());
	$('#result').prepend($d);
	$d.show().fadeOut(60000,function(){$d.remove()});
}