/**
 * ht5ifv extensions module
 * Copyright(c) 2011 Isidro Vila Verde (jvverde@gmail.com)
 * Dual licensed under the MIT and GPL licenses
 * Version: 1.0.1
 * Last Revision: 2011-09-12
 *
 * Requires jQuery 1.6.2 and  ht5ifv 0.9.5
 *
 * This module implement a set validation rules which must be
 * used as a ht5ivf extension 
 *
 */
 
(function(){
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
	};
	function isValidBBAN($v){ //This function check if the checksum if correct
		$v = $v.replace(/[A-Z]/g,function($e){return $e.charCodeAt(0) - 'A'.charCodeAt(0) + 10}); //Convert A-Z to 10-25
		var $sum = 0;
		var $ei = 1; //First exponent 
		for(var $i = $v.length - 1; $i >= 0; $i--){
			$sum += $ei * parseInt($v.charAt($i),10); //multiply the digit by it's exponent 
			$ei = ($ei * 10) % 97; //compute next base 10 exponent  in modulus 97
		}; 
		return $sum % 97 == 1;
	};
	function make($name,$function){ //install handler as a new input type and rew restriction
		var $handler = function($node,$ignoreEmpty){
				var $v = $node.val();
				return !$v && $ignoreEmpty || $function($v);
		}
		$.ht5ifv('registerType',$name,$handler);               	//can be used as a type under the name $name
		$.ht5ifv('registerRestriction','data-'+$name,$handler); //can be used as restriction under the name data-$name
		/* The user decides if it will be used as a type or as a string. The (type or restriction) name should be provide by the user  */  
		$.ht5ifv('register','_'+$name,function($mode,$newname){ 
			//Use example1: 
				//JS -> $.ht5ifv('use',['_CreditCard','type','CC']) //use CreditCard module as CC type   
				//HTML -> <input type="CC"/>		
			//Use example2: 
				//JS -> $.ht5ifv('use',['_CreditCard','restriction','CC']) //use CreditCard module as CC restriction    
				//HTML -> <input type="text" data-CC="1"/>
				var $options = {};
				if (!$newname || typeof $newname == 'string' && $newname.length == 0){
						//console.warn('ht5ifv.%S - No name provided for the type/restriction',$name);
				}else{
						if (!$mode || $mode === 'type'){ //by default or when mode is type
								$options.types = (function($o){
										$o[$newname] = {restrictions:{type: $handler}};
										return $o;
								})({});
						}else if($mode === 'restriction'){
								$options.restrictions = (function($o){
										$o['data-' + $newname] = $handler;
										return $o;
								})({});
						};
				}
				return $options;
		});
	}// function make
	var $formats = {
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)
		iTelNumber: function($v){return /^(\+(?:[0-9] ?){6,14}[0-9]|\+[0-9]{1,3}\.[0-9]{4,14}(x.+)?)$/.test($v)},
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7) and http://blog.stevenlevithan.com/archives/validate-phone-number
		'US-PN': function($v){ //North American Numbering Plan (NANP) numbers
				return /^\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})$/.test($v);
		},
		//http://www.anacom.pt/render.jsp?categoryId=2109
		'PT-PN':function($v){ //Portuguese Phone number
				$v = $v.replace(/[\s.-]/g,'');
				return /^(?!0|4|5)\d{9}$|1\d{1,9}$/.test($v);
		},
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7) and http://www.merriampark.com/anatomycc.htm
		creditCard:  function($v){
			$v = $v.replace(/[\s.-]/g,'');
			return /^4[0-9]{12}([0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(0[0-5]|[68][0-9])[0-9]{11}|(2131|1800|35\d{3})\d{11}$/.test($v)
					&& (function(){ //and checksum algorithm
							var $sum = 0;
							for(var $i = $v.length - 2; $i >= 0 ; $i -= 2){
									var $n = 2 * $v.charAt($i);
									if ($n > 9) $sum += $n - 9
									else $sum += $n;
							} 
							for(var $i = $v.length - 1; $i >= 0 ; $i -= 2){
									$sum += 1 * $v.charAt($i);
							}
							return $sum % 10 == 0
					})()
		},
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)   
		ISBN: function($v){
				return /^(ISBN(-1[03])?:? )?(?=[-0-9 ]{17}$|[-0-9X ]{13}$|[0-9X]{10}$)(97[89][- ]?)?[0-9]{1,5}[- ]?([0-9]+[- ]?){2}[0-9X]$/.test($v)
						&& (function(){
										var $chars = $v.replace(/[^0-9X]/g,'').split('');
										var $sum = parseInt($chars.pop(),10);
										if ($chars.length == 9){ //ISBN-10
												if ($sum == 'X') $sum = 10;
												var $k = 2;
												var $c;
												while(($c = $chars.pop()) !== undefined ){
														$sum = $sum + $k++ * parseInt($c);
												}; 
												return $sum % 11 == 0
										}else{ //ISBN-13          
												for(var $i = 0 ; $i < $chars.length; $i += 2){
														$sum += parseInt($chars[$i],10) + 3 *  parseInt($chars[$i+1],10);
												}
												return $sum % 10 == 0;
										}
								})()    
		},
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)
		VAT: function($v){ //European VAT Numbers
				return /^((AT)?U[0-9]{8}|(BE)?0?[0-9]{9}|(BG)?[0-9]{9,10}|(CY)?[0-9]{8}L|(CZ)?[0-9]{8,10}|(DE)?[0-9]{9}|(DK)?[0-9]{8}|(EE)?[0-9]{9}|(EL|GR)?[0-9]{9}|(ES)?[0-9A-Z][0-9]{7}[0-9A-Z]|(FI)?[0-9]{8}|(FR)?[0-9A-Z]{2}[0-9]{9}|(GB)?([0-9]{9}([0-9]{3})?|[A-Z]{2}[0-9]{3})|(HU)?[0-9]{8}|(IE)?[0-9]S[0-9]{5}L|(IT)?[0-9]{11}|(LT)?([0-9]{9}|[0-9]{12})|(LU)?[0-9]{8}|(LV)?[0-9]{11}|(MT)?[0-9]{8}|(NL)?[0-9]{9}B[0-9]{2}|(PL)?[0-9]{10}|(PT)?[0-9]{9}|(RO)?[0-9]{2,10}|(SE)?[0-9]{12}|(SI)?[0-9]{8}|(SK)?[0-9]{10})$/i.test($v)
		},
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)
		'US-PC': function($v){ //US Zip Code
				return /^[0-9]{5}(-[0-9]{4})?$/.test($v);
		},
		//From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)
		'CA-PC': function($v){ //Canadian Postal code
				return /^(?!.*[DFIOQU])[A-VXY][0-9][A-Z] [0-9][A-Z][0-9]$/.test($v);
		},
		'PT-PC': function($v){ //Portuguese Postal Code (Códigos Postais)
				return /^[0-9]{4}-[0-9]{3}$/.test($v);
		},
		'DE-PC': function($v){ //Germany Postal Code
				return /^[0-9]{5}$/.test($v);
		},
		//From http://en.wikipedia.org/wiki/Postcodes_in_the_United_Kingdom#Validation
		'UK-PC':function($v){ //UK postcodes
				return /^(GIR 0AA)|(((A[BL]|B[ABDHLNRSTX]?|C[ABFHMORTVW]|D[ADEGHLNTY]|E[HNX]?|F[KY]|G[LUY]?|H[ADGPRSUX]|I[GMPV]|JE|K[ATWY]|L[ADELNSU]?|M[EKL]?|N[EGNPRW]?|O[LX]|P[AEHLOR]|R[GHM]|S[AEGKLMNOPRSTY]?|T[ADFNQRSW]|UB|W[ADFNRSV]|YO|ZE)[1-9]?[0-9]|((E|N|NW|SE|SW|W)1|EC[1-4]|WC[12])[A-HJKMNPR-Y]|(SW|W)([2-9]|[1-9][0-9])|EC[1-9][0-9]) [0-9][ABD-HJLNP-UW-Z]{2})$/.test($v);
		},
		//Fom http://www.socialsecurity.gov/history/ssn/geocard.html and http://ssa-custhelp.ssa.gov/app/answers/detail/a_id/425
		'US-SSN': function(){ // US Social Security Number
				return /^(?!000|666)([0-8][0-9]{3})-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/.test($v)
		},
		IP: function($v){ //IP network address
				return /^(?!.*(25[6-9]|2[6-9]\d|[3-9]\d\d).*$|0{1,3}\.)(\d{1,3}\.){3}\d{1,3}$/.test($v);
		},
		'PT-BI':function($v){//Portuguese Identification Card (Bilhete de Identidade - deve de incluir o digito de controlo)
				return /\d{6,7}[- ]?\d/.test($v)
						&& (function(){
								$v = $v.replace(/[^0-9]/g,'');
								var $c = parseInt($v.charAt($v.length-1),10);
								var $sum = $c;
								console.log('$c=%d',$sum);
								for(var $i = 2; $i <= $v.length; $i++){
												$sum += $i * parseInt($v.charAt($v.length - $i),10);
												console.log('sum=%d, i=%i, d = ',$sum,$i, $v.charAt($v.length - $i));
								}; 
								return $sum % 11 == 0 || $c == 0 && ($sum + 10) % 11 == 0
						})()
		},
		'PT-NIF': function($v){//Portuguese VAT (Número de contribuinte)
				return /\d{9}/.test($v)
						&& (function(){
								var $c = parseInt($v.charAt($v.length-1),10);
								var $sum = $c;
								for(var $i = 2; $i <= $v.length; $i++){
												$sum += $i * parseInt($v.charAt($v.length - $i),10);
								}; 
								return $sum % 11 == 0 || $c == 0 && ($sum + 10) % 11 == 0
						})()
		},
		'PT-NIB': function($v){ //Portuguese NIB (Bank Identification Number)
				return /^((\d{4}[ .-]?){5}\d{1})|((\d{4}[ .-]?){2}\d{11}[ .-]?\d{2})$/.test($v)
						&& isValidBBAN($v)
		},

		/*
			All the IBAB/BBAN patterns (below) have been generated automatically  by IBAN 
			Regular Expression Patterns tool (http://serprest.pt/jquery/ht5ifv/extensions/tools/IBAN/)
		*/
		IBAN: function($v){
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{28}$)AL\d{10}[0-9A-Z]{16}$|^(?=[0-9A-Z]{24}$)AD\d{10}[0-9A-Z]{12}$|^(?=[0-9A-Z]{20}$)AT\d{18}$|^(?=[0-9A-Z]{22}$)BH\d{2}[A-Z]{4}[0-9A-Z]{14}$|^(?=[0-9A-Z]{16}$)BE\d{14}$|^(?=[0-9A-Z]{20}$)BA\d{18}$|^(?=[0-9A-Z]{22}$)BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$|^(?=[0-9A-Z]{21}$)HR\d{19}$|^(?=[0-9A-Z]{28}$)CY\d{10}[0-9A-Z]{16}$|^(?=[0-9A-Z]{24}$)CZ\d{22}$|^(?=[0-9A-Z]{18}$)DK\d{16}$|^FO\d{16}$|^GL\d{16}$|^(?=[0-9A-Z]{28}$)DO\d{2}[0-9A-Z]{4}\d{20}$|^(?=[0-9A-Z]{20}$)EE\d{18}$|^(?=[0-9A-Z]{18}$)FI\d{16}$|^(?=[0-9A-Z]{27}$)FR\d{12}[0-9A-Z]{11}\d{2}$|^(?=[0-9A-Z]{22}$)GE\d{2}[A-Z]{2}\d{16}$|^(?=[0-9A-Z]{22}$)DE\d{20}$|^(?=[0-9A-Z]{23}$)GI\d{2}[A-Z]{4}[0-9A-Z]{15}$|^(?=[0-9A-Z]{27}$)GR\d{9}[0-9A-Z]{16}$|^(?=[0-9A-Z]{28}$)HU\d{26}$|^(?=[0-9A-Z]{26}$)IS\d{24}$|^(?=[0-9A-Z]{22}$)IE\d{2}[A-Z]{4}\d{14}$|^(?=[0-9A-Z]{23}$)IL\d{21}$|^(?=[0-9A-Z]{27}$)IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^(?=[0-9A-Z]{20}$)KZ\d{5}[0-9A-Z]{13}$|^(?=[0-9A-Z]{30}$)KW\d{2}[A-Z]{4}22!$|^(?=[0-9A-Z]{21}$)LV\d{2}[A-Z]{4}[0-9A-Z]{13}$|^(?=[0-9A-Z]{,28}$)LB\d{6}[0-9A-Z]{20}$|^(?=[0-9A-Z]{21}$)LI\d{7}[0-9A-Z]{12}$|^(?=[0-9A-Z]{20}$)LT\d{18}$|^(?=[0-9A-Z]{20}$)LU\d{5}[0-9A-Z]{13}$|^(?=[0-9A-Z]{19}$)MK\d{5}[0-9A-Z]{10}\d{2}$|^(?=[0-9A-Z]{31}$)MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$|^(?=[0-9A-Z]{27}$)MR13\d{23}$|^(?=[0-9A-Z]{30}$)MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$|^(?=[0-9A-Z]{27}$)MC\d{12}[0-9A-Z]{11}\d{2}$|^(?=[0-9A-Z]{22}$)ME\d{20}$|^(?=[0-9A-Z]{18}$)NL\d{2}[A-Z]{4}\d{10}$|^(?=[0-9A-Z]{15}$)NO\d{13}$|^(?=[0-9A-Z]{28}$)PL\d{10}[0-9A-Z]{,16}n$|^(?=[0-9A-Z]{25}$)PT\d{23}$|^(?=[0-9A-Z]{24}$)RO\d{2}[A-Z]{4}[0-9A-Z]{16}$|^(?=[0-9A-Z]{27}$)SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$|^(?=[0-9A-Z]{,24}$)SA\d{4}[0-9A-Z]{18}$|^(?=[0-9A-Z]{22}$)RS\d{20}$|^(?=[0-9A-Z]{24}$)SK\d{22}$|^(?=[0-9A-Z]{19}$)SI\d{17}$|^(?=[0-9A-Z]{24}$)ES\d{22}$|^(?=[0-9A-Z]{24}$)SE\d{22}$|^(?=[0-9A-Z]{21}$)CH\d{7}[0-9A-Z]{12}$|^(?=[0-9A-Z]{24}$)TN59\d{20}$|^(?=[0-9A-Z]{26}$)TR\d{7}[0-9A-Z]{17}$|^(?=[0-9A-Z]{,23}$)AE\d{21}$|^(?=[0-9A-Z]{22}$)GB\d{2}[A-Z]{4}\d{14}$/.test($v) && isValidIBAN($v);		
		},
		BBAN: function($v){
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)\d{8}[0-9A-Z]{16}$|^(?=[0-9A-Z]{20}$)\d{8}[0-9A-Z]{12}$|^(?=\d{16}$)\d{16}$|^(?=[0-9A-Z]{18}$)[A-Z]{4}[0-9A-Z]{14}$|^(?=\d{12}$)\d{12}$|^(?=\d{16}$)\d{16}$|^(?=[0-9A-Z]{18}$)[A-Z]{4}\d{6}[0-9A-Z]{8}$|^(?=\d{17}$)\d{17}$|^(?=[0-9A-Z]{24}$)\d{8}[0-9A-Z]{16}$|^(?=\d{20}$)\d{20}$|^(?=\d{14}$)\d{14}$|^(?=\d{24}$)[0-9A-Z]{4}\d{20}$|^(?=\d{16}$)\d{16}$|^(?=\d{14}$)\d{14}$|^(?=[0-9A-Z]{23}$)\d{10}[0-9A-Z]{11}\d{2}$|^(?=[0-9A-Z]{18}$)[A-Z]{2}\d{16}$|^(?=\d{18}$)\d{18}$|^(?=[0-9A-Z]{19}$)[A-Z]{4}[0-9A-Z]{15}$|^(?=[0-9A-Z]{23}$)\d{7}[0-9A-Z]{16}$|^(?=\d{24}$)\d{24}$|^(?=\d{22}$)\d{22}$|^(?=[0-9A-Z]{18}$)[A-Z]{4}\d{14}$|^(?=\d{19}$)\d{19}$|^(?=[0-9A-Z]{23}$)[A-Z]\d{10}[0-9A-Z]{12}$|^(?=[0-9A-Z]{16}$)\d{3}[0-9A-Z]{13}$|^(?=[0-9A-Z]{26}$)[A-Z]{4}[0-9A-Z]{22}$|^(?=[0-9A-Z]{17}$)[A-Z]{4}[0-9A-Z]{13}$|^(?=[0-9A-Z]{,24}$)\d{4}[0-9A-Z]{20}$|^(?=[0-9A-Z]{17}$)\d{5}[0-9A-Z]{12}$|^(?=\d{16}$)\d{16}$|^(?=[0-9A-Z]{16}$)\d{3}[0-9A-Z]{13}$|^(?=[0-9A-Z]{15}$)\d{3}[0-9A-Z]{10}\d{2}$|^(?=[0-9A-Z]{27}$)[A-Z]{4}\d{5}[0-9A-Z]{18}$|^(?=\d{23}$)\d{23}$|^(?=[0-9A-Z]{26}$)[A-Z]{4}\d{19}[A-Z]{3}$|^(?=[0-9A-Z]{23}$)\d{10}[0-9A-Z]{11}\d{2}$|^(?=\d{18}$)\d{18}$|^(?=[0-9A-Z]{14}$)[A-Z]{4}\d{10}$|^(?=\d{11}$)\d{11}$|^(?=\d{24}$)\d{24}$|^(?=\d{21}$)\d{21}$|^(?=[0-9A-Z]{20}$)[A-Z]{4}[0-9A-Z]{16}$|^(?=[0-9A-Z]{23}$)[A-Z]\d{10}[0-9A-Z]{12}$|^(?=[0-9A-Z]{,20}$)\d{2}[0-9A-Z]{18}$|^(?=\d{18}$)\d{18}$|^(?=\d{20}$)\d{20}$|^(?=\d{15}$)\d{15}$|^(?=\d{20}$)\d{20}$|^(?=\d{20}$)\d{20}$|^(?=[0-9A-Z]{17}$)\d{5}[0-9A-Z]{12}$|^(?=\d{20}$)\d{20}$|^(?=[0-9A-Z]{22}$)\d{5}[0-9A-Z]{17}$|^(?=\d{19}$)\d{19}$|^(?=[0-9A-Z]{18}$)[A-Z]{4}\d{14}$/.test($v) && isValidBBAN($v);		
		},
		'IBAN-AL': function($v){ //Albania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{28}$)AL\d{10}[0-9A-Z]{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-AL': function($v){ //Albania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)\d{8}[0-9A-Z]{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-AD': function($v){ //Andorra
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)AD\d{10}[0-9A-Z]{12}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-AD': function($v){ //Andorra
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)\d{8}[0-9A-Z]{12}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-AT': function($v){ //Austria
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)AT\d{18}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-AT': function($v){ //Austria
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{16}$)\d{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-BH': function($v){ //Kingdom of Bahrain
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)BH\d{2}[A-Z]{4}[0-9A-Z]{14}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-BH': function($v){ //Kingdom of Bahrain
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)[A-Z]{4}[0-9A-Z]{14}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-BE': function($v){ //Belgium
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{16}$)BE\d{14}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-BE': function($v){ //Belgium
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{12}$)\d{12}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-BA': function($v){ //Bosnia and Herzegovina
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)BA\d{18}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-BA': function($v){ //Bosnia and Herzegovina
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{16}$)\d{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-BG': function($v){ //Bulgaria
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-BG': function($v){ //Bulgaria
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)[A-Z]{4}\d{6}[0-9A-Z]{8}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-HR': function($v){ //Croatia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{21}$)HR\d{19}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-HR': function($v){ //Croatia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{17}$)\d{17}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-CY': function($v){ //Cyprus
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{28}$)CY\d{10}[0-9A-Z]{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-CY': function($v){ //Cyprus
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)\d{8}[0-9A-Z]{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-CZ': function($v){ //Czech Republic
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)CZ\d{22}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-CZ': function($v){ //Czech Republic
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{20}$)\d{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-DK': function($v){ //Denmark
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)DK\d{16}$|^FO\d{16}$|^GL\d{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-DK': function($v){ //Denmark
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{14}$)\d{14}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-DO': function($v){ //Dominican Republic
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{28}$)DO\d{2}[0-9A-Z]{4}\d{20}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-DO': function($v){ //Dominican Republic
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{24}$)[0-9A-Z]{4}\d{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-EE': function($v){ //Estonia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)EE\d{18}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-EE': function($v){ //Estonia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{16}$)\d{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-FI': function($v){ //Finland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)FI\d{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-FI': function($v){ //Finland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{14}$)\d{14}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-FR': function($v){ //France
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)FR\d{12}[0-9A-Z]{11}\d{2}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-FR': function($v){ //France
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)\d{10}[0-9A-Z]{11}\d{2}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-GE': function($v){ //Georgia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)GE\d{2}[A-Z]{2}\d{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-GE': function($v){ //Georgia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)[A-Z]{2}\d{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-DE': function($v){ //Germany
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)DE\d{20}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-DE': function($v){ //Germany
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{18}$)\d{18}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-GI': function($v){ //Gibraltar
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)GI\d{2}[A-Z]{4}[0-9A-Z]{15}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-GI': function($v){ //Gibraltar
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{19}$)[A-Z]{4}[0-9A-Z]{15}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-GR': function($v){ //Greece
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)GR\d{9}[0-9A-Z]{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-GR': function($v){ //Greece
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)\d{7}[0-9A-Z]{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-HU': function($v){ //Hungary
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{28}$)HU\d{26}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-HU': function($v){ //Hungary
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{24}$)\d{24}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-IS': function($v){ //Iceland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{26}$)IS\d{24}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-IS': function($v){ //Iceland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{22}$)\d{22}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-IE': function($v){ //Ireland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)IE\d{2}[A-Z]{4}\d{14}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-IE': function($v){ //Ireland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)[A-Z]{4}\d{14}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-IL': function($v){ //Israel
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)IL\d{21}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-IL': function($v){ //Israel
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{19}$)\d{19}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-IT': function($v){ //Italy
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-IT': function($v){ //Italy
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)[A-Z]\d{10}[0-9A-Z]{12}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-KZ': function($v){ //Kazakhstan
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)KZ\d{5}[0-9A-Z]{13}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-KZ': function($v){ //Kazakhstan
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{16}$)\d{3}[0-9A-Z]{13}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-KW': function($v){ //KUWAIT
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{30}$)KW\d{2}[A-Z]{4}22!$/.test($v) && isValidIBAN($v);
		},
		'BBAN-KW': function($v){ //KUWAIT
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{26}$)[A-Z]{4}[0-9A-Z]{22}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-LV': function($v){ //Latvia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{21}$)LV\d{2}[A-Z]{4}[0-9A-Z]{13}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-LV': function($v){ //Latvia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{17}$)[A-Z]{4}[0-9A-Z]{13}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-LB': function($v){ //LEBANON
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{,28}$)LB\d{6}[0-9A-Z]{20}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-LB': function($v){ //LEBANON
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{,24}$)\d{4}[0-9A-Z]{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-LI': function($v){ //Liechtenstein (Principality of)
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{21}$)LI\d{7}[0-9A-Z]{12}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-LI': function($v){ //Liechtenstein (Principality of)
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{17}$)\d{5}[0-9A-Z]{12}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-LT': function($v){ //Lithuania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)LT\d{18}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-LT': function($v){ //Lithuania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{16}$)\d{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-LU': function($v){ //Luxembourg
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)LU\d{5}[0-9A-Z]{13}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-LU': function($v){ //Luxembourg
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{16}$)\d{3}[0-9A-Z]{13}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-MK': function($v){ //Macedonia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{19}$)MK\d{5}[0-9A-Z]{10}\d{2}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-MK': function($v){ //Macedonia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{15}$)\d{3}[0-9A-Z]{10}\d{2}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-MT': function($v){ //Malta
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{31}$)MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-MT': function($v){ //Malta
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)[A-Z]{4}\d{5}[0-9A-Z]{18}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-MR': function($v){ //Mauritania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)MR13\d{23}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-MR': function($v){ //Mauritania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{23}$)\d{23}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-MU': function($v){ //Mauritius
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{30}$)MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-MU': function($v){ //Mauritius
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{26}$)[A-Z]{4}\d{19}[A-Z]{3}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-MC': function($v){ //Monaco
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)MC\d{12}[0-9A-Z]{11}\d{2}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-MC': function($v){ //Monaco
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)\d{10}[0-9A-Z]{11}\d{2}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-ME': function($v){ //Montenegro
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)ME\d{20}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-ME': function($v){ //Montenegro
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{18}$)\d{18}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-NL': function($v){ //The Netherlands
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)NL\d{2}[A-Z]{4}\d{10}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-NL': function($v){ //The Netherlands
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{14}$)[A-Z]{4}\d{10}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-NO': function($v){ //Norway
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{15}$)NO\d{13}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-NO': function($v){ //Norway
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{11}$)\d{11}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-PL': function($v){ //Poland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{28}$)PL\d{10}[0-9A-Z]{,16}n$/.test($v) && isValidIBAN($v);
		},
		'BBAN-PL': function($v){ //Poland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{24}$)\d{24}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-PT': function($v){ //Portugal
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{25}$)PT\d{23}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-PT': function($v){ //Portugal
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{21}$)\d{21}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-RO': function($v){ //Romania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)RO\d{2}[A-Z]{4}[0-9A-Z]{16}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-RO': function($v){ //Romania
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{20}$)[A-Z]{4}[0-9A-Z]{16}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-SM': function($v){ //San Marino
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{27}$)SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-SM': function($v){ //San Marino
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{23}$)[A-Z]\d{10}[0-9A-Z]{12}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-SA': function($v){ //Saudi Arabia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{,24}$)SA\d{4}[0-9A-Z]{18}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-SA': function($v){ //Saudi Arabia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{,20}$)\d{2}[0-9A-Z]{18}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-RS': function($v){ //Serbia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)RS\d{20}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-RS': function($v){ //Serbia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{18}$)\d{18}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-SK': function($v){ //Slovak Republic
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)SK\d{22}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-SK': function($v){ //Slovak Republic
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{20}$)\d{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-SI': function($v){ //Slovenia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{19}$)SI\d{17}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-SI': function($v){ //Slovenia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{15}$)\d{15}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-ES': function($v){ //Spain
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)ES\d{22}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-ES': function($v){ //Spain
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{20}$)\d{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-SE': function($v){ //Sweden
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)SE\d{22}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-SE': function($v){ //Sweden
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{20}$)\d{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-CH': function($v){ //Switzerland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{21}$)CH\d{7}[0-9A-Z]{12}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-CH': function($v){ //Switzerland
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{17}$)\d{5}[0-9A-Z]{12}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-TN': function($v){ //Tunisia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{24}$)TN59\d{20}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-TN': function($v){ //Tunisia
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{20}$)\d{20}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-TR': function($v){ //Turkey
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{26}$)TR\d{7}[0-9A-Z]{17}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-TR': function($v){ //Turkey
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)\d{5}[0-9A-Z]{17}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-AE': function($v){ //United Arab Emirates
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{,23}$)AE\d{21}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-AE': function($v){ //United Arab Emirates
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=\d{19}$)\d{19}$/.test($v) && isValidBBAN($v);
		},
		'IBAN-GB': function($v){ //United Kingdom
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{22}$)GB\d{2}[A-Z]{4}\d{14}$/.test($v) && isValidIBAN($v);
		},
		'BBAN-GB': function($v){ //United Kingdom
			$v = $v.replace(/[-. ]/g,''); 
			return /^(?=[0-9A-Z]{18}$)[A-Z]{4}\d{14}$/.test($v) && isValidBBAN($v);
		}
	};

	$.each($formats,function($name,$handler){
			 make($name,$handler);
	});
})();