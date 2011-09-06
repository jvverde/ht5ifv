<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns="http://www.w3.org/1999/xhtml">
	<xsl:output method="xml" indent="yes" omit-xml-declaration="yes"/>

	<xsl:param name="global" select="false()"/>
	<xsl:param name="perCountry" select="false()"/>
	<xsl:param name="IBAN" select="false()"/>
	<xsl:param name="BBAN" select="false()"/>
	<xsl:param name="struct" select="false()"/>
	<xsl:param name="len" select="false()"/>
	<xsl:param name="checksum" select="false()"/>
	<xsl:param name="spaces" select="false()"/>
	<xsl:param name="dots" select="false()"/>
	<xsl:param name="dashes" select="false()"/>

	<xsl:variable name="IBANchecksum">
	<xsl:text>
		function isValidIBAN($v){ //This function check if the checksum if correct
			$v = $v.replace(/^(.{4})(.*)$/,"$2$1"); //Move the first 4 chars from left to the right
			$v = $v.replace(/[A-Z]/g,function($e){return $e.charCodeAt(0) - 'A'.charCodeAt(0) + 10}); //Convert A-Z to 10-25
			var $sum = 0;
			var $ei = 1; //First exponent 
			for(var $i = $v.length - 1; $i >= 0; $i--){
				$sum += $ei * parseInt($v.charAt($i),10); //multiply the digit by it's exponent 
				$ei = ($ei * 10) % 97; //compute next base 10 exponent  in modulus 97
			}; 
			return $sum % 97 == 1;
		}
		</xsl:text>
	</xsl:variable>

	<xsl:variable name="BBANchecksum">
		<xsl:text>
		function isValidBBAN($v){ //This function check if the checksum if correct
			$v = $v.replace(/[A-Z]/g,function($e){return $e.charCodeAt(0) - 'A'.charCodeAt(0) + 10}); //Convert A-Z to 10-25
			var $sum = 0;
			var $ei = 1; //First exponent 
			for(var $i = $v.length - 1; $i >= 0; $i--){
				$sum += $ei * parseInt($v.charAt($i),10); //multiply the digit by it's exponent 
				$ei = ($ei * 10) % 97; //compute next base 10 exponent  in modulus 97
			}; 
			return $sum % 97 == 1;
		}
		</xsl:text>
	</xsl:variable>

	<xsl:template match="node()|@*"/>
	
	<xsl:template match="/">
		<R>
			<xsl:apply-templates select="/ibans"/>
		</R>
	</xsl:template>

	<!--xsl:template match="country/patterns/*/@struct[concat(.,$struct)]"-->
	<xsl:template match="country/patterns/*/@struct">
		<xsl:if test="$struct and not($len)">
			<xsl:value-of select="."/>
		</xsl:if>
	</xsl:template>
	<xsl:template match="country/patterns/*/@len">
		<xsl:if test="$len and not($struct)">
			<xsl:value-of select="."/>
		</xsl:if>
	</xsl:template>
	<xsl:template match="country/patterns/*/@both">
		<xsl:if test="$len and $struct">
			<xsl:value-of select="."/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="countries">
		<xsl:if test="$perCountry">
			<xsl:apply-templates select="*"/>
		</xsl:if>
	</xsl:template>

	<xsl:template match="country">
		<xsl:if test="$IBAN">
			<xsl:text>
				IBAN-</xsl:text>
					<xsl:value-of select="@cc"/>
					<xsl:text>: function($v){ //</xsl:text>
						<xsl:value-of select="name"/>
						<xsl:apply-templates select="." mode="remove"/>
						<xsl:text> 
					return /</xsl:text>
						<xsl:apply-templates select="patterns/iban/@*"/>
						<xsl:text>/.test($v)</xsl:text>
						<xsl:apply-templates select="patterns/iban" mode="check"/>
			<xsl:text>
				},</xsl:text> 
		</xsl:if>
		<xsl:if test="$BBAN">
			<xsl:text>
				BBAN-</xsl:text>
					<xsl:value-of select="@cc"/>
					<xsl:text>: function($v){ //</xsl:text>
						<xsl:value-of select="name"/>
						<xsl:apply-templates select="." mode="remove"/>
						<xsl:text> 
					return /</xsl:text>
						<xsl:apply-templates select="patterns/bban/@*"/>
						<xsl:text>/.test($v)</xsl:text>
						<xsl:apply-templates select="patterns/bban" mode="check"/>
				<xsl:text>
				},</xsl:text> 
		</xsl:if>
	</xsl:template>
	<xsl:template match="/ibans/patterns/*/struct">
		<xsl:if test="$struct and not($len)">
			<xsl:value-of select ="."/>
		</xsl:if>
	</xsl:template>	
	<xsl:template match="/ibans/patterns/*/len">
		<xsl:if test="$len and not($struct)">
			<xsl:value-of select ="."/>
		</xsl:if>
	</xsl:template>	
	<xsl:template match="/ibans/patterns/*/both">
		<xsl:if test="$len and$struct">
			<xsl:value-of select ="."/>
		</xsl:if>
	</xsl:template>	
	<xsl:template match="/ibans/patterns">
		<xsl:if test="$global">
			<xsl:apply-templates select="*"/>
		</xsl:if>
	</xsl:template>
	<xsl:template match="/ibans/patterns/iban">
		<xsl:if test="$IBAN">
			<xsl:text>
				IBAN: function($v){</xsl:text>
						<xsl:apply-templates select="." mode="remove"/>
						<xsl:text> 
					return /</xsl:text>
						<xsl:apply-templates select="*"/>
						<xsl:text>/.test($v)</xsl:text>
						<xsl:apply-templates select="." mode="check"/>
				<xsl:text>		
				},</xsl:text>
		</xsl:if>
	</xsl:template>
	<xsl:template match="/ibans/patterns/bban">
		<xsl:if test="$BBAN">
			<xsl:text>
				BBAN: function($v){</xsl:text>
						<xsl:apply-templates select="." mode="remove"/>
						<xsl:text> 
					return /</xsl:text>
						<xsl:apply-templates select="*"/>
						<xsl:text>/.test($v)</xsl:text>
						<xsl:apply-templates select="." mode="check"/>
				<xsl:text>		
				},</xsl:text>
		</xsl:if>
	</xsl:template>

	<xsl:template match="/ibans">
		<xsl:apply-templates select="." mode="check"/>
		<xsl:text>var $patterns:{ //Map automatic generated by IBAN-Patterns Online Tool</xsl:text>
			<xsl:apply-templates select="*"/>
		<xsl:text>
		};</xsl:text>
	</xsl:template>
	
	<!-- to compute checsum -->	
	<xsl:template match="*" mode="check"/>
	<xsl:template match="patterns/iban" mode="check">
		<xsl:if test="$checksum">
			<xsl:text> &amp;&amp; isValidIBAN($v);</xsl:text>
		</xsl:if>
	</xsl:template>
	<xsl:template match="patterns/bban" mode="check">
		<xsl:if test="$checksum">
			<xsl:text> &amp;&amp; isValidBBAN($v);</xsl:text>
		</xsl:if>
	</xsl:template>
	<xsl:template match="/ibans" mode="check">
		<xsl:if test="$checksum">
			<xsl:if test="$IBAN">
				<xsl:value-of select="$IBANchecksum"/>
			</xsl:if>
			<xsl:if test="$BBAN">
				<xsl:value-of select="$BBANchecksum"/>
			</xsl:if>
		</xsl:if>
	</xsl:template>	
	<!-- remove spaces, dashes and dots -->
	<xsl:template match="*" mode="remove">
		<xsl:if test="$dashes or $dots or $spaces">
			<xsl:text>
					$v = $v.replace(/[</xsl:text>
				<xsl:if test="$dashes">
					<xsl:text>-</xsl:text>
				</xsl:if>
				<xsl:if test="$dots">
					<xsl:text>.</xsl:text>
				</xsl:if>
				<xsl:if test="$spaces">
					<xsl:text> </xsl:text>
				</xsl:if>			
			<xsl:text>]/g,'');</xsl:text>
		</xsl:if>
	</xsl:template>	
</xsl:stylesheet>
