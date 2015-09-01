<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
	<catalog>
	<xsl:for-each select="cd[country = 'USA']">
		<cd>
			<title2><xsl:value-of select="title/text()"/></title2>
			<price><xsl:value-of select="price/text()"/></price>
			<country><xsl:value-of select="country/text()"/></country>
		</cd>
	</xsl:for-each>
	</catalog>
  </xsl:template>

</xsl:stylesheet>