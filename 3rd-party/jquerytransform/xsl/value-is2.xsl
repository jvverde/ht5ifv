<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
<xsl:output method="xml" indent="yes"/>

	<xsl:template match="value">
		The value is - <xsl:value-of select="is"/>
	</xsl:template>
</xsl:stylesheet>
