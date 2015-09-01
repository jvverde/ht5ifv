$().ready(function() {
	$(".ex").each(function(num,el) {
		$(el).after("&nbsp;&nbsp;<a href='javascript:void(0);' onclick='showCode(" + num + ");'>[Code]</a>");
	});
	
	$("#countries").transform({xml:"xml/catalog.xml",xsl:"xsl/countries.xsl"});
});

function showCode(num) {
	var el = $($(".ex")[num]);
	var func = el[0].onclick.toString();
	func = func.substring(func.indexOf("{")+1,func.lastIndexOf("}"));
	if(el.parent().find(".code").length == 0) {
		el.parent().append("<div class='code' style='display:none;'>" + func + "</div>");
	}
	
	el.parent().find(".code").slideToggle();
}

function onError(html,xsl,xml,obj,ex) {
	alert("Error: " + ex.message);
}
function onSuccess(html,xsl,xml,obj) {
	alert("Success");
}

function onComplete() {
	alert("Complete");
}

function passSuccess(html,xsl,xml,obj) {
	var str = "File transformed successfully.\r\nPassed values:\r\n";
	for(var x in obj.pass) {
		str += x + ": " + obj.pass[x] + "\r\n";
	}
	alert(str);
}

function passComplete(html,xsl,xml,obj) {
	var str = "File transform complete.\r\nPassed values:\r\n";
	for(var x in obj.pass) {
		str += x + ": " + obj.pass[x] + "\r\n";
	}
	alert(str);
}

function successClear(html,xsl,xml,obj) {
	alert("Transform succeeded. Clearing result div");
	$("#result").empty();
	alert("Result empty. Transforming passed XML and XSL as strings and now passing a parameter.");
	$("#result").transform({xmlstr:xml,xslstr:xsl,xslParams:{test:"Parameter has been set"}});
}

function islandSuccess(html,xsl,xml,obj) {
	alert("XSL\r\nID: " + obj.xslid + "\r\nXSL: " + $("#" + obj.xslid).html());
	alert("XML\r\nID: " + obj.xmlid + "\r\nXML: " + $("#" + obj.xmlid).html());
	$("#" + obj.xslid).remove();
	$("#" + obj.xmlid).remove();
}

function multiSuccess(html,xsl,xml,obj) {
	$(obj.el).find("li").append(" - Successful completion of transformation " + obj.pass);
}

function showMsg() {
	alert("Prompt to show display of msg");
}

function twoXML() {
	$("#result").empty().append("<div></div><div></div>").find("div").each(function(num,el) {
		$(el).transform({xml:"xml/file" + (num + 1) + ".xml",xsl:"xsl/value-is" + (num + 1) + ".xsl"});
	});
	
}

function asXMLSuccess(xml,xsl,xmlorig) {
	$("#result").transform({xmlobj:xml,xsl:"xsl/cds.xsl", xslParams:{test:"This was transformed by setting dataType to xml in the initial request which returned an XML Document as the first argument. Then it set xmlobj in the subsequent request with that XML Document."},
		error : function(html,xsl,xml,obj,ex){
			alert("Error - " + ex.message);
		}
	});
}

function asJSONSuccess(json,xsl,xml) {
	var html = "";
	var cds = json.catalog.cd;
	for(var x=0;x<cds.length; x++) {
		html += "<li>" + cds[x].artist.text + " - " + cds[x].title.text + "</li>";
	}
	$("#result").html("<ul>" + html + "</ul>");
}