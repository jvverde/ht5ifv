/**
 * $ XSLT Processor wrapper Plugin
 * Copyright(c) 2011 Isidro Vila Verde (jvverde@gmail.com)
 * Dual licensed under the MIT and GPL licenses
 * Version: 0.9
 * Last Revision: 2011-09-08
 *
 * Requires jQuery 1.6.2
 *
 *
*/
(function($){
	function xml2String($xml){
		try{
				return (new XMLSerializer()).serializeToString($xml);
		}catch(e){
				return $xml.xml;
		}
	};

	var transform = function($xml,$xsl,$param){		
		if($.browser.msie){
			var $xsldoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.6.0");
			$xsldoc.async = false;
			$xsldoc.loadXML($xsl); 
			if ($xsldoc.parseError.errorCode){
					console.warn("You have errors in xsl document: " + $xsldoc.parseError.reason);
				 throw ("You have errors in xsl document: " + $xsldoc.parseError.reason);
			}
			var $xmldoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
			$xmldoc.async = false;
			$xmldoc.loadXML($xml);
			if ($xmldoc.parseError.errorCode){
				console.warn("You have errors in xml document: " + $xmldoc.parseError.reason);
				throw ("You have errors in xml document: " + $xmldoc.parseError.reason);
			}
			var $xslt = new ActiveXObject("Msxml2.XSLTemplate.6.0");
			$xslt.stylesheet = $xsldoc; 
			var $proc = $xslt.createProcessor();
			$proc.input = $xmldoc;
			if ($param && $param instanceof Object) $.each($param,function($n,$v){
				if($v !== undefined) $proc.addParameter($n, $v);
			});
			$proc.transform(); 
			return $proc.output;
		}else{
			var $parser = new DOMParser();
			var $xmlobj = $parser.parseFromString($xml,"text/xml");
			var $xslobj = $parser.parseFromString($xsl,"text/xml");
			var $proc = new XSLTProcessor();
			if ($param && $param instanceof Object) $.each($param,function($n,$v){
				if($v !== undefined) $proc.setParameter(null, $n, $v);
			});
			$proc.importStylesheet($xslobj);
			var $resultDocument = $proc.transformToDocument($xmlobj);
			return xml2String($resultDocument)
		}
	}
	var load = function($url,$callback){
		$.ajax({
			url: $url,
			dataType: 'text',
			async:false,
			success:$callback,
			error:function(){
				throw ("I couldn't the file load from " + $url)
			}
		});
	}
	var $methods = {
		transform: function($o){
			var $xmlstring = $o.xmlstring;
			var $xslstring = $o.xslstring;
			if($o.xmlurl){
				load($o.xmlurl,function($r){$xmlstring = $r});
			}else if (!$xmlstring){
				console.warn('The xmlstring or xmlurl must be provided');
				throw ('The xmlstring or xmlurl must be provided');
			}
			if($o.xslurl){
				load($o.xslurl,function($r){$xslstring = $r});
			}else  if (!$xslstring){
				console.warn('The xslstring or xslurl must be provided');
				throw ('The xslstring or xslurl must be provided');
			}
			return transform($xmlstring,$xslstring,$o.params)
		}
	};
	$.XSLTransform = $methods.transform;			
})(jQuery);
               
