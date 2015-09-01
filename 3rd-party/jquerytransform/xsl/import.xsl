<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:import href="cds.xsl"/>
<xsl:output method="xml" indent="yes"/>
  
	<xsl:template match="title">
		(import) <a style='color:green;'><xsl:value-of select="text()"/></a>
	</xsl:template>
	
	<xsl:template match="price">
	<a style='color:red;'>$<xsl:value-of select="text()"/></a>
  </xsl:template>
</xsl:stylesheet>
