<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:output method="text" encoding="UTF-8" indent="no" />
	
	<xsl:strip-space elements="*"/>
	
	<xsl:template match="*">
		<xsl:param name="base" select="'0'"/>
		<xsl:param name="start" select="'0'"/>
		<xsl:param name="inArray" select="'0'"/>
		
		<xsl:if test="position() &gt; 1">,</xsl:if>
		
		<xsl:if test="$base = '0'">{</xsl:if>
		
		<xsl:if test="$start = '0' and $inArray = '0'"><xsl:value-of select="name()"/>:{</xsl:if>
		
		<!--Add attributes and sub-nodes-->
		<xsl:variable name="attcount" select="count(@*)"/>
		<xsl:variable name="nodecount" select="count(*)"/>
		
		<xsl:if test="$attcount &gt; 0 or $nodecount &gt; 0">
				<xsl:for-each select="@*">
					<xsl:if test="position() &gt; 1">,</xsl:if>
					<xsl:value-of select="local-name()"/>:<xsl:call-template name="val"><xsl:with-param name="t" select="."/></xsl:call-template>
				</xsl:for-each>
				
				<xsl:for-each select="*">
					<xsl:sort select="name()"/>
					<xsl:if test="$attcount &gt; 0 and position() = 1">,</xsl:if>
					<xsl:if test="position() &gt; 1">,</xsl:if>
					<xsl:variable name="ismulti">
						<xsl:choose>
							<xsl:when test="name() = name(preceding-sibling::*[1]) or name() = name(following-sibling::*[1])">1</xsl:when>
							<xsl:otherwise>0</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					
					<xsl:variable name="ismultistart">
						<xsl:choose>
							<xsl:when test="name() = name(preceding-sibling::*[1])">0</xsl:when>
							<xsl:otherwise>1</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					
					<xsl:variable name="ismultiend">
						<xsl:choose>
							<xsl:when test="name() = name(following-sibling::*[1])">0</xsl:when>
							<xsl:otherwise>1</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					
					<xsl:variable name="isstart">
						<xsl:choose>
							<xsl:when test="$ismulti = '1'">0</xsl:when>
							<xsl:otherwise>1</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					
					<xsl:if test="$ismulti = '0'"><xsl:value-of select="local-name()"/>:</xsl:if>
					<xsl:if test="$ismulti = '1' and $ismultistart = '1'"><xsl:value-of select="local-name()"/>:[</xsl:if>
					<xsl:text>{</xsl:text>
					<xsl:apply-templates select=".">
						<xsl:with-param name="base" select="'1'"/>
						<xsl:with-param name="start" select="$isstart"/>
						<xsl:with-param name="inArray" select="$ismulti"/>
					</xsl:apply-templates>
					
					<xsl:if test="count(./@*) &gt; 0 or count(*) &gt; 0">,</xsl:if>
					<xsl:text>text:</xsl:text><xsl:call-template name="val"><xsl:with-param name="t" select="text()"/></xsl:call-template>
					<xsl:text>}</xsl:text>
					<xsl:if test="$ismulti = '1' and $ismultiend = '1'">]</xsl:if>
				</xsl:for-each>
		</xsl:if>
		<!--End attributes and sub-nodes-->
		<xsl:if test="$base = '0'">}</xsl:if>
		
		<xsl:if test="$start = '0' and $inArray = '0'">}</xsl:if>
		
	</xsl:template>
	
	<xsl:template name="val">
		<xsl:param name="t" select="''"/>
		
		<xsl:choose>
			<xsl:when test="string(number($t)) != 'NaN'"><xsl:value-of select="normalize-space($t)"/></xsl:when>
			<xsl:when test="$t = 'true' or $t = 'false'"><xsl:value-of select="normalize-space($t)"/></xsl:when>
			<xsl:otherwise>"<xsl:call-template name="replace-string"><xsl:with-param name="text" select="normalize-space($t)"/><xsl:with-param name="replace">"</xsl:with-param><xsl:with-param name="with">\"</xsl:with-param></xsl:call-template>"</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="replace-string">
		<xsl:param name="text"/>
		<xsl:param name="replace"/>
		<xsl:param name="with"/>
		<xsl:choose>
			<xsl:when test="contains($text,$replace)">
				<xsl:value-of select="substring-before($text,$replace)"/>
				<xsl:value-of select="$with"/>
				<xsl:call-template name="replace-string">
					<xsl:with-param name="text" select="substring-after($text,$replace)"/>
					<xsl:with-param name="replace" select="$replace"/>
					<xsl:with-param name="with" select="$with"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$text"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	
</xsl:stylesheet>
