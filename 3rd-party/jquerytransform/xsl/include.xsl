<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:include href="cds.xsl"/>

  <xsl:output method="xml" indent="yes"/>

  <xsl:template match="//title">
    <a style='color:red;'>
      (include) <xsl:value-of select="text()"/>
    </a>
  </xsl:template>
</xsl:stylesheet>
