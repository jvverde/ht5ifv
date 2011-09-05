<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:ht="http://www.w3.org/1999/xhtml">
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="/*">
        AQUI:<xsl:value-of select="name()"/><br/>
        <xsl:apply-templates select="ht:body"/>
    </xsl:template>
</xsl:stylesheet>
