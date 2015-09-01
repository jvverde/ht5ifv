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
		
		var call = function(f,o,tel,other) {
			if($.isFunction(f)) {
				var arg1 = tel.html();
				if(o.c.dataType.toUpperCase() == "JSON") {
					try {
						arg1 = eval("(" + tel.text() + ")");
					} catch(ex) {
						arg1 = {error : "An error occurred while converting HTML to JSON"};
					}
				}
				if(o.c.dataType.toUpperCase() == "XML") {
					arg1 = createXmlObj(tel.html());
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
		
		var replaceref = function(val, o) {
			o.c.xsl = o.c.xsl?o.c.xsl:"";
			var c = location.protocol == "file:" && $.browser.msie ? "\\" : "/";
			var path1 = location.protocol + c + c + location.host;
			var path2 = location.pathname.substring(0,location.pathname.lastIndexOf(c) + 1) + o.c.xsl.substring(0,o.c.xsl.lastIndexOf("/") + 1);
			
			if(val.substring(0,1) == c) {
				return path1 + val;
			}
			else if(val.substring(0,2) == "..") {
				var count = 0;
				while(val.indexOf("..") != -1) {
					val = val.substring(val.indexOf("..") + 3);
					count += 1;
				}
				
				var p = path1 + path2.substring(0,path2.length - 1);
				
				for(var x=0;x<count;x++) {
					p = p.substring(0,p.lastIndexOf(c));
				}
				return p + c + val;
			}
			else {
				return path1 + path2 + val;
			}
		};
		
		var checkReady = function(o) {
			if((o.c.xslstr || o.c.xslobj) && (o.c.xmlstr || o.c.xmlobj)) {
				var fail = false;
				var tel = $("<div>");
				if(o.c.throwerror) {
					call(o.c.error,o,tel,{message:"Bad XML or XSL call"}); 
					return;
				}
				
				if(o.c.island) {
					if(o.c.island === true) {o.c.island = "body";}
					o.c.xslid = id("xsl");
					$(o.c.island).append("<div id='" + o.c.xslid + "' name='" + o.c.xslid + "' style='display:none;'>" + o.c.xslstr + "</div>");
					o.c.xmlid = id("xml");
					$(o.c.island).append("<div id='" + o.c.xmlid + "' name='" + o.c.xmlid + "' style='display:none;'>" + o.c.xmlstr + "</div>");
				}
				
				o.c.xslobj = o.c.xslobj ? o.c.xslobj : createXmlObj(o.c.xslstr);
				o.c.xmlobj = o.c.xmlobj ? o.c.xmlobj : createXmlObj(o.c.xmlstr);
				
				var fixref,addparams;
				if($.browser.msie) {
				    try {					
						
						fixref = function(ref,xObj) {
							var vals = xObj.selectNodes(ref);
							for(var x = 0; x<vals.length; x++) {
								vals[x].setAttribute("href",replaceref(vals[x].getAttribute("href"),o));
							}
						};
						
						fixref("//xsl:include",o.c.xslobj);
						fixref("//xsl:import",o.c.xslobj);
						
						addparams = function(op, xObj) {
							for(var p in op) {
			                    var strParam = "//xsl:param[@name='" + p + "']";
			                    
			                    try {			                        
									var v = op[p];
									if(typeof v === "boolean") {
										v = "'" + v + "'";
									} else {
										if(isNaN(parseInt(v)) && v.indexOf("'") < 0) {
											v = "'" + v + "'";
										}
									}
				    				var xslParam = xObj.selectSingleNode(strParam);
									if(xslParam == null) {
										var newparam = xObj.createElement("xsl:param");
										newparam.setAttribute("name",p);
										xObj.documentElement.insertBefore(newparam,xObj.selectSingleNode("//xsl:template"));
										xslParam = xObj.selectSingleNode(strParam);
									}
					    			xslParam.setAttribute("select",v);
					            } catch(ex) {
					                //param failed
					            }
			                }
						};
						if(o.c.xslParams) {
							addparams(o.c.xslParams,o.c.xslobj);
							o.c.xslobj = createXmlObj(o.c.xslobj.xml); //reload xml
						}
						tel.empty().html(o.c.xmlobj.transformNode(o.c.xslobj)); 
					} catch(ex) {
						fail = true;
						call(o.c.error,o,tel,ex); 
					}
				} else {
					try {
						var proc = new XSLTProcessor();
						
						var childNodes = function(obj,find) {
							var cns = [];
							var objs = obj.getElementsByTagName(find);
							for(var x=0;x<objs.length;x++) {
								if(objs[x].parentNode == obj) {
									cns[cns.length] = objs[x];
								}
							}
							
							return cns;
						};
						
						var safariimportincludefix = function(xObj,rootConfig) {
							var vals = $.merge($.makeArray(xObj.getElementsByTagName("import")),$.makeArray(xObj.getElementsByTagName("include")));
							
							for(var x=0;x<vals.length;x++) {
								var node = vals[x];
								$.ajax({
									passData : { node : node, xObj : xObj, rootConfig : rootConfig},
									dataType : "xml",
									async : false,
									url : replaceref(node.getAttribute("href"),rootConfig),
									success : function(xhr) {
										try {
											var _ = this.passData;
											xhr = safariimportincludefix(xhr,_.rootConfig);
											
											var imports = $.merge(childNodes(xhr.getElementsByTagName("stylesheet")[0],"param"),childNodes(xhr.getElementsByTagName("stylesheet")[0],"template"));
											
											var existingNodes = $.merge(childNodes(_.xObj.getElementsByTagName("stylesheet")[0],"param"),childNodes(_.xObj.getElementsByTagName("stylesheet")[0],"template"));
											var existingNames = [];
											var existingMatches = [];
											for(var a=0;a<existingNodes.length;a++) {
												if(existingNodes[a].getAttribute("name")) {
													existingNames[existingNodes[a].getAttribute("name")] = true;
												} else {
													existingMatches[existingNodes[a].getAttribute("match")] = true;
												}
											}
											
											var pn = _.node.parentNode;
											for(var y=0;y<imports.length;y++) {
												if(!existingNames[imports[y].getAttribute("name")] && !existingMatches[imports[y].getAttribute("match")]) {
													var clonednode = _.xObj.importNode(imports[y],true);
													pn.insertBefore(clonednode,_.xObj.getElementsByTagName("template")[0]);
												}
											}
											pn.removeChild(_.node);
										} catch(ex) { 
											
										}
									}
								});
							}
							
							return xObj;
						};
						
						fixref = function(ref,xObj) {
							ref = $.browser.mozilla && $.browser.version.substring(0,3) == "1.9" ? "xsl:" + ref : ref;
							
							var vals = xObj.getElementsByTagName(ref);
							for(var x=0; x<vals.length;x++) {
								vals[x].setAttribute("href",replaceref(vals[x].getAttribute("href"),o));
							}
						};
						
						if($.browser.safari) {
							o.c.xslobj = safariimportincludefix(o.c.xslobj,o);
						} else {						
							fixref("import",o.c.xslobj);
							fixref("include",o.c.xslobj);
						}
						
						addparams = function(op) {
							for(var p in op) {
								try { proc.setParameter(null, p, op[p]); } catch(ex) {}
							}
						};
						addparams(o.c.xslParams);
						
						var doc = document.implementation.createDocument("","",null);
						proc.importStylesheet(o.c.xslobj);
						tel.empty().append(proc.transformToFragment(o.c.xmlobj,doc));
					} catch(ex) {
						fail = true;
						call(o.c.error,o,tel,ex);
					}
				}
				
				if(o.c.el) {
					if(tel.html()) { $(o.c.el).html(tel.html()); }
				}
				if(!fail) {
					call(o.c.success,o,tel);
				}
				call(o.c.complete,o,tel);
				
				return tel.html();
			}
		};
		
		var makeCall = function(t,options,type) {
			if(typeof(options) == "string") {
				options = {
					cache:false,
					url:options,
					dataType:"xml",
					async:t.c.async,
					pass:t.c.pass
				};
			}
			
			options.complete = function(r,s) {
				if(s != "success") {
					if(!t.c.threwError) {
						t.c.threwError = true;
						call(t.c.error,t,$("<div>" + r.responseText + "</div>"),{message:"Error requesting file " + this.url});
						call(t.c.complete,t,$("<div>" + r.responseText + "</div>"));
					}
					return;
				}
				
				if(type == "XSL") { if(r.status == 200) { t.c.xslstr = r.responseText; } else { t.c.xslstr = "error"; t.c.throwerror=true; } }
				else { if(r.status == 200) { t.c.xmlstr = r.responseText;} else { t.c.xmlstr = "error"; t.c.throwerror=true; } }
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

$().ready(function() {
	$("[transform]").each(function(num,el) {
		$(el).transform(eval("(" + $(el).attr("transform") + ")"));
	});
	
});
