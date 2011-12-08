$(document).ready(function(){
	var $nav = {};
	$.each(navigator,function($i,$e){
		if ($i === 'mimeTypes' || $i === 'plugins') return;
		$nav[$i] = $e;
	});
	var $report = JSON.stringify($nav);
	$.ajax({
		type:'POST',
		url:'common/fb.cgi',
		data:{report:$report},	
		success:function(){
			$('<link type="text/css" rel="stylesheet" href="common/fb.css">').appendTo($('head'));
			var $fb = $('<div/>').load('common/fb.html', function(){
				$fb.find('#fb_yes').click(vote('yes'));
				$fb.find('#fb_no').click(vote('no'));
				$fb.find('#fb_partially').click(vote('partially'));				
			});
			$fb.insertAfter($('div#nav'));
			function vote($v){
				return function(){
					$.ajax({
						url:'common/fb.cgi',
						data:{vote:$v,report:$report},
						success: function(){
							$fb.find('.fb').html('Thank you for your feedback');
						}
					});
				}
			}
		}
	});
});
