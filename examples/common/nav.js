$(document).ready(function(){
    var $n = $('body').data('n');
    try{
        $('head>title').html('ht5ifv - example ' + $n);
    }catch(e){
    }
    $('fieldset>legend').html(' Example ' + $n);

    
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
    
  var $JScode = (function(){
        if ($n == 0){ //very specif situation
                $html = $('head').html();
                return $html.replace(/<title(.|\n|\r)*?<\/title>|<style(.|\n|\r)*?\/style>|<meta(.|\n|\r)*?>/ig,'');
        }else{
            return $('head script').not('[src]').html();
        }
    })();
  var $CSScode = $('head style').html()
  var $HTMLcode ='';
    $('body .exhibit').wrap('<div/>').parent().each(function(){
        $HTMLcode += '\n...\n\t\t\t' + $(this).html();
    }).end().unwrap();
    
    $JScode = $JScode.replace(/\t/g,'  ').replace(/[<>&]/g,$replace) //remove special caracters and replace each tab by 2 spaces
    if ($CSScode) $CSScode = $CSScode.replace(/\t/g,'  ').replace(/[<>&]/g,$replace) //remove special caracters and replace each tab by 2 spaces
    if ($HTMLcode) $HTMLcode = '    ' + $HTMLcode
        .replace(/\t/g,'  ')
        .replace(/[<>&]/g,$replace)
        .replace(/class\s*=\s*"[^"]*"/g,'');        //remove special caracters and replace each tab by 2 spaces

    //add CSS for navigation section
    $('<link rel="stylesheet" type="text/css" href="common/nav.css">').appendTo("head");

    //add html for navigation section
    $.get('common/nav.html', function(data){    
        $('body').append(data);

    
        $('#ht5ifv_code_js pre').html($JScode);
        if($CSScode){
                $('#ht5ifv_code_css pre').html($CSScode);
        }else{
                $('#ht5ifv_code_css').remove();
        }
        if($HTMLcode){
                $('#ht5ifv_code_html pre').html($HTMLcode + '\n...');
        }else{
                $('#ht5ifv_code_html').remove();
        }
        
        $('input[type="button"],input[type="submit"],input[type="reset"]').hover(
            function(){
                $(this).addClass('ui-state-hover');
            },
            function(){
                $(this).removeClass('ui-state-hover');
            }
        );
        $.ajax({
            url: 'index.html',
            type:'HEAD',
            dataTypeString:'html',
            success:function(){
                $('div#nav input#top').click(function(){
                    window.location.href = 'index.html';
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
            dataTypeString:'html',
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
            dataTypeString:'html',
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
    },'html');
	$.getScript('../3rd-party/JSON/json2.js', function(){
		$.getScript('common/fb.js',function(){
			$.getScript('../ga/ga.js');
		});
	});
});
//This function is called when the form is submited. 
//In fact it is submited to this javascript function
//Its here just to visual inspect when and what is sent to the "server"
var $cnt = 1;
function local_submit($this){
    var $d = $('<div>Submited string ('+($cnt++)+'):</div>').append($this.serialize());
    $('#result').prepend($d);
    $d.show().fadeOut(60000,function(){$d.remove()});
}
