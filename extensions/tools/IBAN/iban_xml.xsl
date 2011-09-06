<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:ex="urn:schemas-microsoft-com:office:spreadsheet">
    <xsl:output method="xml" indent="yes"/>
    <xsl:template match="ex:Worksheet/ex:Table">
        <tr class="country">
            <td class="name">
                <xsl:value-of select="ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'Name of country')]/ex:Cell[2]/ex:Data/text()"/>
            </td>
            <td class="cc">
                <xsl:value-of select="ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'Country code') or starts-with(ex:Cell[1]/ex:Data/text(),'IBAN Structure')]/ex:Cell[2]/ex:Data/text()"/>
            </td>
            <td class="ibanStruct">
                <xsl:value-of select="ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'IBAN structure') or starts-with(ex:Cell[1]/ex:Data/text(),'IBAN Structure')]/ex:Cell[2]/ex:Data/text()"/>
            </td>
            <td class="ibanLen">
                <xsl:value-of select="ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'IBAN length')]/ex:Cell[2]/ex:Data/text()"/>
            </td>
            <td class="bbanStruct">
                <xsl:value-of select="ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'BBAN structure')]/ex:Cell[2]/ex:Data/text()"/>
            </td>
            <td class="bbanLen">
                <xsl:value-of select="ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'BBAN length')]/ex:Cell[2]/ex:Data/text()"/>
            </td>
        </tr>
    </xsl:template>
    <xsl:template match="/*">
        <table>
            <thead>
                <tr>
                    <th class="name" rowspan="2">Name of country</th>
                    <th class="cc" rowspan="2">Country Code</th>                    
                    <th colspan="2" id="ibanHeader">IBAN</th>
                    <th colspan="2" id="bbanHeader">BBAN</th>
                </tr>
                <tr>
                    <th class="ibanStruct">Structure</th>
                    <th class="ibanLen">Length</th>
                    <th class="bbanStruct">Structure</th>
                    <th class="bbanLen">length</th>
                </tr>
            </thead>
            <tbody>
                <xsl:apply-templates select="/ex:Workbook/ex:Worksheet/ex:Table[ex:Row[starts-with(ex:Cell[1]/ex:Data/text(),'Name of country')]]"/>
            </tbody>
        </table>
    </xsl:template>
</xsl:stylesheet>
