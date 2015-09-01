<%	
	Dim xmlobj : Set xmlobj = Server.CreateObject("Microsoft.XMLDOM")
	xmlobj.async = false
	xmlobj.loadXML(Request.Form("xmlstr"))
	
	Dim xslobj : Set xslobj = Server.CreateObject("MSXML.FreeThreadedDOMDocument")
	xslobj.async = false
	xslobj.LoadXML(Request.Form("xslstr"))
	
	FixHREF xslobj,"//xsl:import"
	FixHREF xslobj,"//xsl:include"
	
	
	Dim template, processor : Set template = Server.CreateObject("MSXML2.XSLTemplate")
	template.stylesheet = xslobj
	Set processor = template.createProcessor()	
	
	For i = 1 to Request.Form("xslParams").Count
		Dim n : n = Split(Request.Form("xslParams")(i),"|||")(0)
		Dim v : v = Split(Request.Form("xslParams")(i),"|||")(1)
		processor.addParameter n, v
	Next
	
	processor.input = xmlobj
	processor.transform()
	
	Response.Write(processor.output)
	
Sub FixHREF(xobj,sel)
	Dim nl : Set nl = xobj.selectNodes(sel)
	For Each node in nl
		Dim href : href = Server.MapPath(Request.Form("path") & node.getAttribute("href"))
		node.setAttribute "href", href
	Next
End Sub
%>