<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

  <xsl:template match="/catalog">
	<select>
	<xsl:for-each select="cd[not(country = preceding-sibling::cd/country)]">
		<xsl:sort select="country"/>
		<option><xsl:value-of select="country"/></option>
	</xsl:for-each>
	</select>
  </xsl:template>

</xsl:stylesheet>
