<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

  <xsl:param name="number" select="'Not Set'"/>
  <xsl:template match="/catalog">
    <li>
      Transformation result <xsl:value-of select="$number"/>
    </li>
  </xsl:template>

</xsl:stylesheet>
