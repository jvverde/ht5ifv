<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
<xsl:output method="xml" indent="yes"/>

  <xsl:param name="test" select="'Not Set'"/>
  <xsl:template match="/catalog">
	<ul>
    <li>
      Test Param - <xsl:value-of select="$test"/>
    </li>
		<xsl:for-each select="cd">
     
			<li>
				<xsl:apply-templates select="title" /> - 
				<xsl:apply-templates select="country" /> - 
				<xsl:apply-templates select="price" />
			</li>
		</xsl:for-each>

	</ul>
  </xsl:template>
  
  <xsl:template match="title">
	<a style='color:blue;'><xsl:value-of select="text()"/></a>
  </xsl:template>
  
  <xsl:template match="country">
	<xsl:value-of select="text()"/>
  </xsl:template>
  
  <xsl:template match="price">
	$<xsl:value-of select="text()"/>
  </xsl:template>

</xsl:stylesheet>