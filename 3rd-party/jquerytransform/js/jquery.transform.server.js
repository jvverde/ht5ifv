/*
	Transform Plugin
	Copyright (c) 2009 DAER Systems (daersystems.com)
	Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)
	and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.
*/
(function($) {
	$.transform = function(o) {
		var createXmlObj = function(data) {
			if($.browser.msie) {
				var x = $("<xml>")[0];
				x.loadXML(data);
				return x;
			} else {
				var parser = new DOMParser();
				return parser.parseFromString(data,"text/xml");
			}
		};
		
		var call = function(f,o,html,other) {
			if($.isFunction(f)) {
				var arg1 = html;
				if(o.c.dataType.toUpperCase() == "JSON") {
					try {
						arg1 = eval("(" + html + ")");
					} catch(ex) {
						arg1 = {error : "An error occurred while converting HTML to JSON"};
					}
				}
				if(o.c.dataType.toUpperCase() == "XML") {
					arg1 = createXmlObj(html);
				}
				
				try { f.apply(o.c,[arg1,o.c.xslstr,o.c.xmlstr,o.c,other]); } catch(ex) {}
			}
		};
				
		var t = this;
		t.c = {
			cache : false,
			async : true,
			xsl : false,
			xml : false,
			xslstr : false,
			xmlstr : false,
			xslobj : false,
			xmlobj : false,
			xslParams : false,
			error : false,
			success : false,
			complete : false,
			island : false,
			pass : false,
			msg : false,
			dataType : "html"
		};
		$.extend(t.c,o);
		
		if(o.msg) {
			$(o.el).html((typeof(o.msg) == "string")? o.msg : $(o.msg).html());
		}
		
		var id = function(pre) {
			var name = pre + "_" + (Math.round(Math.random() * 999));
			return $("#" + name).length === 0 ? name : id(pre);
		};
		
		var convertToXML = function(xmlobj) {
			if($.browser.msie) {
				return xmlobj.xml;
			} else {
				return new XMLSerializer().serializeToString(xmlobj);
			}
		};
		
		var checkReady = function(o) {
			if((o.c.xslstr || o.c.xslobj) && (o.c.xmlstr || o.c.xmlobj)) {
				if(o.c.island) {
					if(o.c.island === true) {o.c.island = "body";}
					o.c.xslid = id("xsl");
					$(o.c.island).append("<div id='" + o.c.xslid + "' name='" + o.c.xslid + "' style='display:none;'>" + o.c.xslstr + "</div>");
					o.c.xmlid = id("xml");
					$(o.c.island).append("<div id='" + o.c.xmlid + "' name='" + o.c.xmlid + "' style='display:none;'>" + o.c.xmlstr + "</div>");
				}
				
				var params = [];
				for(var x in o.c.xslParams) {
					params[params.length] = x + "|||" + o.c.xslParams[x];
				}
				
				o.c.xmlstr = o.c.xmlstr ? o.c.xmlstr : convertToXML(o.c.xmlobj);
				o.c.xslstr = o.c.xslstr ? o.c.xslstr : convertToXML(o.c.xslobj);
				
				
				var fixxslref = function(xsl) {
					xsl = typeof xsl == "string" ? xsl : xsl.url;
					var xslpath = xsl.substring(0,xsl.lastIndexOf("/")+1);
					if(xsl.substring(0,1) == "/") { xslpath = ".." + xslpath; }
					return $.transform_config.jspath + xslpath;
				};
				
				var data = {
					xmlstr : o.c.xmlstr,
					path : o.c.xsl ? fixxslref(o.c.xsl) : "",
					xslstr : o.c.xslstr
				};
				
				if($.transform_config.language.toUpperCase() == "PHP") {
					data["xslParams[]"] = params;
				} else {
					data["xslParams"] = params;
				}
				
				var req = $.ajax({
					type : "POST",
					cache : false,
					async : o.c.async,
					url : $.transform_config.serverpath,
					data : data,
					error : function(r,s,ex) {
						call(o.c.error,o,"<div></div>",{message:"An error occurred on the server during transformation"});
					},
					success : function(html) {
						if(o.c.el) {
							if(html) { $(o.c.el).html(html); }
						}
						
						call(o.c.success,o,html);
						
						call(o.c.complete,o,html);
					}
				});
				return o.c.async ? "" : req.responseText;
			}
		};
		
		
		var makeCall = function(t,options,type) {
			if(typeof(options) == "string") {
				options = {
					cache:t.c.cache,
					url:options,
					dataType:"xml",
					async:t.c.async,
					pass:t.c.pass
				};
			}
			options.complete = function(r,s) {				
				if(s != "success") {
					if(!t.c.errorThrown) {
						t.c.errorThrown = true;
						call(t.c.error,t,$("<div>" + r.responseText + "</div>"),{message:"Error requesting file " + this.url});
						call(t.c.complete,t,$("<div>" + r.responseText + "</div>"));
					}
					return;
				}
				
				if(type == "XSL") { t.c.xslstr = r.responseText; }
				else { t.c.xmlstr = r.responseText; }
				if(t.c.async) { checkReady(t); }
			};
			$.ajax(options);
		};
		
		if(t.c.xsl) {
			makeCall(t,o.xsl,"XSL");
		}
		
		if(t.c.xml) {
			makeCall(t,o.xml,"XML");
		}
		
		if(!t.c.async || (t.c.xmlstr || t.c.xmlobj) || (t.c.xslstr || t.c.xslobj)) {
			return checkReady(t);
		}
	};
	
	$.fn.transform = function(o) {
		return this.each(function() {
			o = o ? o : {};
			o.el = this;
			var t = new $.transform(o);
		});
	};
})(jQuery);

$().ready(function(){
	$("[transform]").each(function(num,el) {
		$(el).transform(eval("(" + $(el).attr("transform") + ")"));
	});
	
	$.transform_config = {
		language : "asp",
		serverpath : "js/jquery.transform.server.asp",
		jsfile : "js/jquery.transform.server.js",
		jspath : "../"
	};
});
