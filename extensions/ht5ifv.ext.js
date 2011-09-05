(function(){
    function make($name,$function){
        var $handler = function($node,$ignoreEmpty){
            var $v = $node.val();
            //return !$v && $ignoreEmpty || $function.apply($node,[$v]);//$v.match();
            return !$v && $ignoreEmpty || $function($v);
        }
        $.ht5ifv('registerType',$name,$handler);               //can be used as a type with name $name
        $.ht5ifv('registerRestriction','data-'+$name,$handler);   //can me used as restriction with name data-$name
        /* The user decides if it will be used as a type or as atring and the name should be provide by the user  */  
        $.ht5ifv('register','_'+$name,function($mode,$newname){     
            var $options = {};
            if (!$newname || typeof $newname == 'string' && $newname.length == 0){
                console.warn('ht5ifv.%S - No name provided for the type/restriction',$name);
            }else{
                if (!$mode || $mode === 'type'){ //by default or when mode is type
                    $options.types = (function($o){
                        $o[$newname] = {restrictions:{type: $handler}};
                        return $o;
                    })({});
                }else if($mode === 'restriction'){
                    $options.restrictions = (function($o){
                        $o[$newname] = $handler;
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
            //$v = $v.replace(/[\s-]/g,'');
            return /^(?!0|4|5)\d{9}|1\d+$/.test($v);
        },
        //From Regular Expression Cookbook (ISBN: 978-0-596-52068-7) and http://www.merriampark.com/anatomycc.htm
        creditCard:  function($v){
            //$v = $v.replace(/[\s-]/g,'');
            return /^4[0-9]{12}([0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(0[0-5]|[68][0-9])[0-9]{11}|(2131|1800|35\d{3})\d{11}$/.test($v)
                && (function(){
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
        IP: function($v){
            return /^(?!.*(25[6-9]|2[6-9]\d|[3-9]\d\d).*$|0{1,3}\.)(\d{1,3}\.){3}\d{1,3}$/.test($v);
        },
        'PT-NSS':function($v){
            
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
        'PT-NIF': function($v){//Portuguese VAT (NÃºmero de contribuinte)
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
                && (function(){
                    $v = $v.replace(/\D/g,'');
                    var $sum = 0;
                    var $ai = 1;
                    for(var $i = $v.length - 1; $i >= 0; $i--){
                        $sum += $ai * parseInt($v.charAt($i),10);
                        $ai = ($ai * 10) % 97;
                    }; 
                    return $sum % 97 == 1;
                })()
        },
        'IBAN': function($v){ //IBAN
			$v = $v.replace(/[^\dA-Z]/g,'');
			var $s = ["(^AL\d{10}[0-9A-Z]{16}$)","(^AD\d{10}[0-9A-Z]{12}$)","(^AT\d{18}$)","(^BH\d{2}[A-Z]{4}[0-9A-Z]{14}$)","(^BE\d{14}$)","(^BA\d{18}$)","(^BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$)","(^HR\d{19}$)","(^CY\d{10}[0-9A-Z]{16}$)","(^CZ\d{22}$)","(^DK\d{16})","(FO\d{16})","(GL\d{16}$)","(^DO\d{2}[0-9A-Z]{4}\d{20}$)","(^EE\d{18}$)","(^FI\d{16}$)","(^FR\d{12}[0-9A-Z]{11}\d{2}$)","(^GE\d{2}[A-Z]{2}\d{16}$)","(^DE\d{20}$)","(^GI\d{2}[A-Z]{4}[0-9A-Z]{15}$)","(^GR\d{9}[0-9A-Z]{16}$)","(^HU\d{26}$)","(^IS\d{24}$)","(^IE\d{2}[A-Z]{4}\d{14}$)","(^IL\d{21}$)","(^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$)","(^[A-Z]{2}\d{5}[0-9A-Z]{13}$)","(^KW\d{2}[A-Z]{4}22!$)","(^LV\d{2}[A-Z]{4}[0-9A-Z]{13}$)","(^LB\d{6}[0-9A-Z]{20}$)","(^LI\d{7}[0-9A-Z]{12}$)","(^LT\d{18}$)","(^LU\d{5}[0-9A-Z]{13}$)","(^MK\d{5}[0-9A-Z]{10}\d{2}$)","(^MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$)","(^MR13\d{23}$)","(^MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$)","(^MC\d{12}[0-9A-Z]{11}\d{2}$)","(^ME\d{20}$)","(^NL\d{2}[A-Z]{4}\d{10}$)","(^NO\d{13}$)","(^PL\d{10}[0-9A-Z]{,16}n$)","(^PT\d{23}$)","(^RO\d{2}[A-Z]{4}[0-9A-Z]{16}$)","(^SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$)","(^SA\d{4}[0-9A-Z]{18}$)","(^RS\d{20}$)","(^SK\d{22}$)","(^SI\d{17}$)","(^ES\d{22}$)","(^SE\d{22}$)","(^CH\d{7}[0-9A-Z]{12}$)","(^TN59\d{20}$)","(^TR\d{7}[0-9A-Z]{17}$)","(^AE\d{21}$)","(^GB\d{2}[A-Z]{4}\d{14}$)"];
            return $v.replace(/(^AL\d{10}[0-9A-Z]{16}$)|(^AD\d{10}[0-9A-Z]{12}$)|(^AT\d{18}$)|(^BH\d{2}[A-Z]{4}[0-9A-Z]{14}$)|(^BE\d{14}$)|(^BA\d{18}$)|(^BG\d{2}[A-Z]{4}\d{6}[0-9A-Z]{8}$)|(^HR\d{19}$)|(^CY\d{10}[0-9A-Z]{16}$)|(^CZ\d{22}$)|(^DK\d{16})|(FO\d{16})|(GL\d{16}$)|(^DO\d{2}[0-9A-Z]{4}\d{20}$)|(^EE\d{18}$)|(^FI\d{16}$)|(^FR\d{12}[0-9A-Z]{11}\d{2}$)|(^GE\d{2}[A-Z]{2}\d{16}$)|(^DE\d{20}$)|(^GI\d{2}[A-Z]{4}[0-9A-Z]{15}$)|(^GR\d{9}[0-9A-Z]{16}$)|(^HU\d{26}$)|(^IS\d{24}$)|(^IE\d{2}[A-Z]{4}\d{14}$)|(^IL\d{21}$)|(^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$)|(^[A-Z]{2}\d{5}[0-9A-Z]{13}$)|(^KW\d{2}[A-Z]{4}22!$)|(^LV\d{2}[A-Z]{4}[0-9A-Z]{13}$)|(^LB\d{6}[0-9A-Z]{20}$)|(^LI\d{7}[0-9A-Z]{12}$)|(^LT\d{18}$)|(^LU\d{5}[0-9A-Z]{13}$)|(^MK\d{5}[0-9A-Z]{10}\d{2}$)|(^MT\d{2}[A-Z]{4}\d{5}[0-9A-Z]{18}$)|(^MR13\d{23}$)|(^MU\d{2}[A-Z]{4}\d{19}[A-Z]{3}$)|(^MC\d{12}[0-9A-Z]{11}\d{2}$)|(^ME\d{20}$)|(^NL\d{2}[A-Z]{4}\d{10}$)|(^NO\d{13}$)|(^PL\d{10}[0-9A-Z]{,16}n$)|(^PT\d{23}$)|(^RO\d{2}[A-Z]{4}[0-9A-Z]{16}$)|(^SM\d{2}[A-Z]\d{10}[0-9A-Z]{12}$)|(^SA\d{4}[0-9A-Z]{18}$)|(^RS\d{20}$)|(^SK\d{22}$)|(^SI\d{17}$)|(^ES\d{22}$)|(^SE\d{22}$)|(^CH\d{7}[0-9A-Z]{12}$)|(^TN59\d{20}$)|(^TR\d{7}[0-9A-Z]{17}$)|(^AE\d{21}$)|(^GB\d{2}[A-Z]{4}\d{14}$)/,
            //return $v.replace(/(^PT\d{23}$)/,
					function(){
						for(var $i = 1 ; $i < arguments.length -1; $i++){
							if (arguments[$i]) console.log('i = %d -> %s ->', $i, arguments[$i], $s[$i-1]);
						}
						return 1;
					});
                /*&& (function(){
					console.log(RegExp);
					$v = $v.replace(/^(.{4})(.*)$/,"$2$1"); //Remove first 4 chars from left and append it to the right
                	$v = $v.replace(/[A-Z]/g,function($e){return $e.charCodeAt(0) - 'A'.charCodeAt(0) + 10}); //convert A-Z to 10-25
                    var $sum = 0;
                    var $ai = 1;
                    for(var $i = $v.length - 1; $i >= 0; $i--){
                        $sum += $ai * parseInt($v.charAt($i),10);
                        console.log('sum=%d, i=%i, d = %d, ai=%d',$sum,$i, $v.charAt($i), $ai);
                        $ai = ($ai * 10) % 97;
                    }; 
                    return $sum % 97 == 1;
                })()*/
        }          
    }
    $.each($formats,function($name,$handler){
         make($name,$handler);
    });
})();