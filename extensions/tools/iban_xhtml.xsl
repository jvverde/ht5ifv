<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:ht="http://www.w3.org/1999/xhtml">
    <xsl:output method="xml" indent="yes"/>
    <xsl:param name="by" select="2"/>
    <xsl:key name="k1" match="ht:table[ht:tr[1]/ht:th/text()='Country' and ht:tr[1]/ht:th/text()='Chars']/ht:tr" use="ht:td[2]"/>
    <xsl:key name="k2" match="ht:table[ht:tr[1]/ht:th/text()='Country' and ht:tr[1]/ht:th/text()='Chars']/ht:tr" use="ht:td[3]"/>
    <xsl:template match="ht:tr[count(. | key('k1', ht:td[2])[1]) = 1]" mode="top"> 
        <ht:span style="padding-left:1em"><xsl:value-of select="ht:td[2]"/></ht:span>
    </xsl:template> 
    <xsl:template match="ht:tr" mode="top"></xsl:template> 
    <xsl:template match="ht:tr[count(. | key('k2', ht:td[3])[1]) = 1]" mode="top2"> 
        <ht:span style="padding-left:1em"><xsl:value-of select="ht:td[3]"/></ht:span>
    </xsl:template> 
    <xsl:template match="ht:tr" mode="top2"></xsl:template> 
    <xsl:template match="/">
        <xsl:apply-templates select="//ht:table[ht:tr[1]/ht:th/text()='Country' and ht:tr[1]/ht:th/text()='Chars']"/>
    </xsl:template>
    <xsl:template match="ht:table[ht:tr[1]/ht:th/text()='Country' and ht:tr[1]/ht:th/text()='Chars']">
        <ht:div>Sorted by column: <xsl:value-of select ="$by"/></ht:div>
        <ht:div  id="iban_sizes">IBAN size values:
            <xsl:apply-templates select="ht:tr" mode="top">
                <xsl:sort select="ht:td[2]/text()"/> 
            </xsl:apply-templates>
        </ht:div>
        <ht:div id="iban_formats">BBAN formats:
            <xsl:apply-templates select="ht:tr" mode="top2">
                <xsl:sort select="ht:td[3]/text()"/> 
            </xsl:apply-templates>
        </ht:div>
        <ht:table>
            <xsl:apply-templates select="ht:tr[1]"/>
            <xsl:apply-templates select="ht:tr[position()&gt;1]">
                <xsl:sort select="ht:td[$by]/text()"/> 
            </xsl:apply-templates>
        </ht:table>
    </xsl:template>
    <xsl:template match="ht:tr">
        <xsl:copy-of select="."/>
    </xsl:template>
</xsl:stylesheet>
