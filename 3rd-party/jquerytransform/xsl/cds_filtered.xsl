<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

  <xsl:param name="country" />
  <xsl:template match="/catalog">
	<ul>
		<xsl:for-each select="cd[country = $country]">
			<li>
				<a style='color:blue;'><xsl:value-of select="title"/></a> - 
				<xsl:value-of select="country"/> - 
				$<xsl:value-of select="price"/>
			</li>
		</xsl:for-each>

	</ul>
  </xsl:template>

</xsl:stylesheet>
