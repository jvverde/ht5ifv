<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

  <xsl:param name="test" select="'Not Set'"/>
  
  <xsl:template match="/catalog|/CATALOG">
	<ul>
    <li>
      Test Params - <xsl:value-of select="$test"/>
    </li>
		<xsl:for-each select="cd|CD">
     
			<li>	
				<xsl:apply-templates select="title2|TITLE2"/><xsl:apply-templates select="title|TITLE" /> - 
				<xsl:apply-templates select="country|COUNTRY" /> - 
				<xsl:apply-templates select="price|PRICE" />
			</li>
		</xsl:for-each>

	</ul>
  </xsl:template>
  
  <xsl:template match="title2|TITLE2">
	<a style='color:blue;'><xsl:value-of select="text()"/></a>
  </xsl:template>
  
  <xsl:template match="title|TITLE">
	<a style='color:blue;'><xsl:value-of select="text()"/></a>
  </xsl:template>
  
  <xsl:template match="country|COUNTRY">
	<xsl:value-of select="text()"/>
  </xsl:template>
  
  <xsl:template match="price|PRICE">
	$<xsl:value-of select="text()"/>
  </xsl:template>

</xsl:stylesheet>
