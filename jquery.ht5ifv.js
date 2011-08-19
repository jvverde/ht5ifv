/**
 * $ HTML5 Inline Form Validator (ht5ifv) Plugin
 * Copyright(c) 2011 Isidro Vila Verde (jvverde@gmail.com)
 * Dual licensed under the MIT and GPL licenses
 * Version: 0.9
 * Last Revision: 2011-08-19
 *
 */
(function($){
	function checkDateFormat($val){
		//http://www.w3.org/TR/html5/common-microsyntaxes.html#valid-date-string
		return $val.match(/^(\d{4})-(\d{2})-(\d{2})$/) && (function(){
			var $m = parseInt(RegExp.$2,10);
			var $d = parseInt(RegExp.$3,10);
			var $maxDay = [
				function(){return false}, //0 is not a month
				function(){return $d <= 31},
				function(){
					var $y = parseInt(RegExp.$1);
					return ($d <= 28) || ($d == 29) && ($y % 4 == 0) && (($y % 100 != 0) || ($y % 400 == 0));
				},		
				function(){return $d <= 31},
				function(){return $d <= 30},
				function(){return $d <= 31},
				function(){return $d <= 30},
				function(){return $d <= 31},
				function(){return $d <= 31},
				function(){return $d <= 30},
				function(){return $d <= 31},
				function(){return $d <= 30},
				function(){return $d <= 31}
			];
			return $m < 13 && $d < 32 && $m > 0 && $d > 0 && $maxDay[$m]()
		})()
	};
	function checkTimeFormat($val){
		//http://www.w3.org/TR/html5/common-microsyntaxes.html#valid-time-string
		return /^([01][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9](\.\d+)?)?$/.test($val)
	};
	var $inputTypes = { //Defines restrictions for each input type
		color: {
			restrictions:{
				//http://www.w3.org/TR/html5/common-microsyntaxes.html#rules-for-serializing-simple-color-values
				type: function($node,$ignoreEmpty){
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) || /^#[0-9A-F]{6}$/i.test($val)
				}
			}
		},
		date: {
			restrictions:{
				type: function($node,$ignoreEmpty){ 
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) || checkDateFormat($val);
				},
				min:function($node){
					var $min = new Date ($node.attr('min'));
					var $val = new Date ($node.val());
					return isNaN($val) || $min <= $val
				},
				max:function($node){
					var $max = new Date ($node.attr('max'));
					var $val = new Date ($node.val());
					return isNaN($val) || $val <= $max
				},
			},
		},
		datetime: {
			restrictions:{
				//http://www.w3.org/TR/html5/common-microsyntaxes.html#valid-global-date-and-time-string
				type: function($node,$ignoreEmpty){
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) 
						|| $val.match(/^(\d{4}-\d{2}-\d{2})T(.+)(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/) 
						&& (function(){
							var $date = RegExp.$1;
							var $time = RegExp.$2;
							return checkDateFormat($date) && checkTimeFormat($time);
						})()
				},
				min:function($node){return $inputTypes.date.restrictions.min($node)},
				max:function($node){return $inputTypes.date.restrictions.max($node)},
			}
		},
		//http://www.w3.org/TR/html5/states-of-the-type-attribute.html#local-date-and-time-state
		'datetime-local': {
			restrictions:{
				type: function($node,$ignoreEmpty){
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) 
						|| $val.match(/^(\d{4}-\d{2}-\d{2})T(.+)$/)
						&& (function(){
							var $date = RegExp.$1;
							var $time = RegExp.$2;
							return checkDateFormat($date) && checkTimeFormat($time);
						})()
				},
				min:function($node){return $inputTypes.date.restrictions.min($node)},
				max:function($node){return $inputTypes.date.restrictions.max($node)},
			},
		},
		email: {
			restrictions:{
				//From http://bassistance.de/jquery-plugins/jquery-plugin-validation/
				type: function($node,$ignoreEmpty){
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test($val)
				}
			}, 
		}, 
		month: (function(){
			//http://www.w3.org/TR/html5/the-input-element.html#attr-input-type
			var $RE = /^(\d{4})-(0[1-9]|1[0-2])$/;
			return {
				restrictions:{
					type: function($node,$ignoreEmpty){
						var $val = $node.val();
						return ($val == '' && $ignoreEmpty) || $RE.test($val);
					},
					min:function($node){
						$RE.test($node.val());
						var $yv = parseInt(RegExp.$1,10); 
						var $mv = parseInt(RegExp.$2,10);
						$RE.test($node.attr('min'));
						var $ym = parseInt(RegExp.$1,10); 
						var $mm = parseInt(RegExp.$2,10);
						return isNaN($yv) || isNaN($mv) || isNaN($ym) || isNaN($mm) || $ym < $yv || $ym == $yv && $mm <= $mv;
					},
					max:function($node){
						$RE.test($node.val());
						var $yv = parseInt(RegExp.$1,10); 
						var $mv = parseInt(RegExp.$2,10);
						$RE.test($node.attr('max'));
						var $ym = parseInt(RegExp.$1,10); 
						var $mm = parseInt(RegExp.$2,10);
						return isNaN($yv) || isNaN($mv) || isNaN($ym) || isNaN($mm) || $yv < $ym || $yv == $ym && $mv <= $mm;
					},
				},
			}
		})(),
		number: {
			restrictions:{
				//From http://www.w3.org/TR/html5/common-microsyntaxes.html#real-numbers
				type: function($node,$ignoreEmpty){ 
						var $val = $node.val();
						return ($val == '' && $ignoreEmpty) || /^-?[0-9]+(\.[0-9]*)?(E(-|\+)?[0-9]+)?$/i.test($val)
				},
				min: function($node){
					var $min = parseFloat($node.attr('min'),10);
					var $val = parseFloat($node.val(),10);
					return isNaN($val) || $min <= $val
				},	
				max: function($node){
					var $max = parseFloat($node.attr('max'),10);
					var $val = parseFloat($node.val(),10);
					return isNaN($val) || $val <= $max
				},
			},
		},
		password: {
			restrictions:{
				type: function($node,$ignoreEmpty){return $inputTypes.text.restrictions.type($node,$ignoreEmpty)} //the same as text fields
			}
		},	
		range: {	//the same as number fields
			restrictions:{
				type: function($node,$ignoreEmpty){ return $inputTypes.number.restrictions.type($node,$ignoreEmpty)}, 
				min: function(val){ return $inputTypes.number.restrictions.min(val)},	
				max: function(val){ return $inputTypes.number.restrictions.max(val)},
			}
		},
		search: {
			restrictions:{
				type: function($node,$ignoreEmpty){return $inputTypes.text.restrictions.type($node,$ignoreEmpty)}	//the same as text fields
			},
		},
		tel: {
			restrictions:{
				type: function($node,$ignoreEmpty){return $inputTypes.text.restrictions.type($node,$ignoreEmpty)},	//the same as text fields
			},
		},
		text: {
			restrictions:{
				//http://www.w3.org/TR/html5/states-of-the-type-attribute.html#text-state-and-search-state
				type: function($node,$ignoreEmpty){
						var $val = $node.val();
						return ($val == '' && $ignoreEmpty) || /^[^\n\r]*$/.test($val)}
			},
		},	
		time: {
			restrictions:{
				type: function($node,$ignoreEmpty){
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) || checkTimeFormat($val)
				},
				min:function($node){
					var $min = new Date ('2000-01-01T'+$node.attr('min'));
					var $val = new Date ('2000-01-01T'+$node.val());
					return isNaN($val) || $min <= $val
				},
				max:function($node){
					var $max = new Date ('2000-01-01T'+$node.attr('max'));
					var $val = new Date ('2000-01-01T'+$node.val());
					return isNaN($val) || $val <= $max
				},
			},
		},
		url: {
			restrictions:{
				//RE copied from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
				type: function($node,$ignoreEmpty){ 
					var $val = $node.val();
					return ($val == '' && $ignoreEmpty) || /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test($val)
				},
			},
		},			
		week: (function(){
			function numberOfWeeks(Y) { //From http://www.merlyn.demon.co.uk/weekinfo.htm#WPY
				var X1, X2, NW;
				with (X1 = new Date(Y, 0, 4)) {
					setDate(getDate() - (6 + getDay()) % 7);
				}
				with (X2 = new Date(Y, 11, 28)) {
					setDate(getDate() + (7 - getDay()) % 7);
				}
				NW = Math.round((X2 - X1) / 604800000); //60*60*24*7*1000
				return NW;
			};
			//http://www.w3.org/TR/html5/common-microsyntaxes.html#valid-week-string
			var $RE = /^(\d{4})-W(0[1-9]|[1-4][0-9]|5[0-3])$/;
			return {
				restrictions:{
					type: function($node,$ignoreEmpty){
						var $val = $node.val();
						return ($val == '' && $ignoreEmpty) || $RE.test($val) && RegExp.$2 <= numberOfWeeks(RegExp.$1);
					},
					min:function($node){
						$RE.test($node.val());
						var $yv = parseInt(RegExp.$1,10); 
						var $wv = parseInt(RegExp.$2,10);
						$RE.test($node.attr('min'));
						var $ym = parseInt(RegExp.$1,10); 
						var $wm = parseInt(RegExp.$2,10);
						return isNaN($yv) || isNaN($wv) || isNaN($ym) || isNaN($wm) || $ym < $yv || $ym == $yv && $wm <= $wv;
					},
					max:function($node){
						$RE.test($node.val());
						var $yv = parseInt(RegExp.$1,10); 
						var $wv = parseInt(RegExp.$2,10);
						$RE.test($node.attr('max'));
						var $ym = parseInt(RegExp.$1,10); 
						var $wm = parseInt(RegExp.$2,10);
						return isNaN($yv) || isNaN($wv) || isNaN($ym) || isNaN($wm) || $yv < $ym || $yv == $ym && $wv <= $wm;
					},
				},
			};
		})(),
		_defaults:{
			restrictions:{
				type: function(){return true},
				pattern: function($node,$ignoreEmpty){ //as this is the same for all types it is defined here in _defaults
					var $pattern = $node.attr('pattern');
					var $val = $node.val();
					var $re = new RegExp('^'+$pattern+'$');
					return (!$val && $ignoreEmpty) || $re.test($val);	
				},				
			},
			events:{  //by default this are the events which trigger validate and check actions.
				validate: 'focus.ht5ifv keyup.ht5ifv',
				check: 'blur.ht5ifv',
			},
		},
	};
	var $monitClass = 'ht5ifv-monitoring'; //Each field under monitoring process has this class
	var $errorClasses = { //these classes are used internaly to signal if the field is in error and what type of error
		min: 'ht5ifv-min-error',
		max: 'ht5ifv-max-error',
		type: 'ht5ifv-type-error',
		pattern: 'ht5ifv-pattern-error',
		required: 'ht5ifv-required-error',
	};
	var $defaults = {
		classes: {
			invalid: 'ht5ifv-show-invalid',
			valid: 'ht5ifv-show-valid',
			min: 'ht5ifv-show-min',
			max: 'ht5ifv-show-max',
			type: 'ht5ifv-show-type',
			pattern: 'ht5ifv-show-pattern',
			required: 'ht5ifv-show-required',
		},	
		target: {
			invalid: function($this){return $this},
			valid: function($this){return $this},
			min: function($this){return $this},
			max: function($this){return $this},
			type: function($this){return $this},
			pattern: function($this){return $this},
			required: function($this){return $this},
		},
		callbacks:{
			invalid: function($elem){},
			valid: function($elem){},
			min: function($elem){},
			max: function($elem){},
			type: function($elem){},
			pattern: function($elem){},
			required: function($elem){},
		},
		filter: function($inputs){return $inputs.not('[type="hidden"]');},
		types:$inputTypes,
		checkbox:{
			events:{
				validate: 'change.ht5ifv',
				check: 'change.ht5ifv',
			}
		},
		radio:{
			events:{
				validate: 'change.ht5ifv',
				check: 'change.ht5ifv'
			}
		},
		textarea:{
			events:{
				validate: 'focus.ht5ifv keyup.ht5ifv',
				check: 'blur.ht5ifv'
			}
		},
		select:{
			events:{
				validate: 'change.ht5ifv',
				check: 'change.ht5ifv'
			}
		},	
	};
	var $methods = {
		init: function($o){
			var $options = $.extend(true,{
				browserValidate:false,
				showNullTargetWarn:true,
				callbackOnlyStatusTransitions: true,
				callbackOnlyErrorTransitions: true,
				ignoreEmptyFields: true,	
				safeValidate: true,
				checkDisable:true,
			},$defaults,$o);
			var $statusExist = (function(){ 							//get all possible error status
				var $keys = {valid:true,invalid:true,required:true,type:true, pattern:true}; 	//these status exist by default
				$.each($options.types,function($k,$t){						//find more
					if($t.restrictions) $.each($t.restrictions,function($r){
						$keys[$r] = true;
					});
				});
				return $keys;
			})();
			var $statusName = (function(){ //get a list of names of all possible status
				var $result = [];
				$.each($statusExist,function($k){
					$result.push($k);		
				});
				return $result;	
			})();
			//just a bunch of some sanity checks
			$.each($defaults,function($i,$e){		//check if each default option was provided as an object 
				if (!($options[$i] instanceof Object)) throw 'ht5ifv: Wrong Options ( the option '+$i+' must be an object)';
			});
			if (!($options.filter instanceof Function)) throw 'ht5ifv: The filter option must be a Function'; 
			$.each($options.classes, function($i,$e){ 	//if each class name is a string
				if (!$statusExist[$i]){
					delete $options.classes[$i];
					console.warn("The class %s was removed from options as we don't find a correspondent restriction", $i);
				}else if (typeof $options.classes[$i] !== 'string') throw 'ht5ifv: The Classes.'+$i+' must be a String';
			});
			$.each($statusName, function($n,$i){ 		//the if two or more (non null) classes have the same name
				var $c = $options.classes[$i];
				if ($c == '') return; 			//we don't need to test null values	
				for ($j in $options.classes) {
					if ( $j !== $i && $c === $options.classes[$j]){
						console.warn('ht5ifv: The same class (%s) is used for "%s" and for "%s"!!! '+
							'I can live with that but, your users, may not notice some particular errors situations. '+
							'This can occur in situations where one restriction is verified and another, with same class, is not', 
							$c, $i, $j); 
					}
				}
			});
			if (!$options.types._defaults || !($options.types._defaults instanceof Object)){
				throw 'The element options.types._defaults must be present and must be a Object';
			}
			if (!$options.types._defaults.events || !$options.types._defaults.events.validate || !$options.types._defaults.events.check){
				throw 'The element events cannot be suppressed from options.types._defaults';
			}
			if (!$options.types._defaults.restrictions || !($options.types._defaults.restrictions instanceof Object)){
				throw 'The elemtent options.types._defaults.restrictions must be present and must be a Object';
			}
			$.each($options.types,function($typeName,$type){
				if (!($type instanceof Object)) throw 'The element options.types.' + $typeName + ' if present must be a Object'; 
				if ($type.restriction && !($type.restrictions instanceof Object)) 
					throw 'The element options.types.' + $typeName + '.restriction if present must be a Object'; 
				else if ($type.restriction) $.each($type.restrictions, function($name, $rest){
					if (!($rest instanceof Function)) 
						throw 'The element options.types.' + $typeName + '.restriction.' + $name + ' if present must be a Object'; 
				});
			});
			//End of bunch of tests
			//If we give some flexibility to programmers with need to deal with it
			if ($options.target instanceof Function){	//if the programmer just provides a function we need to desmultiplex it
				var $f = $options.target;
				$options.target = [];
				$.each($statusName, function($n,$i){
					$options.target[$i] = (function($name){
						return function($this){return $f($this,$name)}
					})($i);
				});
			}else{						//it the user provides a object we need to check if each field is a function
				$.each($statusName, function($n,$i){
					if ($options.target[$i] === undefined ) $options.target[$i] = function($this){return $this};
					else if (!($options.target[$i] instanceof Function)) throw 'ht5ifv: The target.'+$i+' must be a Function';
				})
				$.each($options.target,function($i,$e){
					if (!$statusExist[$i]){
						delete $options.target[$i];
						console.warn("The target %s was removed from options as we don't find a correspondent restriction", $i);
					}; 
				})
			}
			if ($options.callbacks instanceof Function){	//The same as for target (above)
				var $f = $options.callbacks;
				$options.callbacks = [];
				$.each($statusName, function($n,$i){
					$options.callbacks[$i] = (function($name){ 		//transform the call in a two parameters call
						return function($this){return $f($this,$name)}	//the user function $f will be called with $this and the name of restriction
					})($i);	
				});	
			}else{						//if the user provides a object we need to check if each field is a function
				$.each($statusName, function($n,$i){
					if ($options.callbacks[$i] === undefined ) $options.callbacks[$i] = function(){}; //by default
					else if (!($options.callbacks[$i] instanceof Function)) throw 'ht5ifv: The callbacks.'+$i+' must be a Function';
				});
				$.each($options.callbacks,function($i,$e){
					if (!$statusExist[$i]){
						delete $options.callbacks[$i];
						console.warn("The callback %s was removed from options as we don't find a correspondent restriction", $i);
					}; 
				})
			}

			//Now the real coding
			return this.each(function(){
				var $form = $(this);
				if($options.browserValidate != true){
					$form.attr('novalidate','novalidate');
				}
				var $controls = $options.filter($('input,textarea,select',$form).not('[type="reset"],[type="submit"],[type="image"],[type="button"]'));
				var $inputs = $controls.filter('input').not('[type="checkbox"],[type="radio"]');
				var $checkboxes = $controls.filter('input[type="checkbox"]');
				var $radios = $controls.filter('input[type="radio"]');
				var $textareas = $controls.filter('textarea');
				var $selects = $controls.filter('select');
				function getAndCheckTarget($restriction,$field){ //this a utility function to avoid to repeat this multiple time in lines bellow
					if ($options.target[$restriction]){	//In fact this never happen to be false. The checks above don't allow it
						var $target = $options.target[$restriction]($field);
						if(!$target.addClass){
							throw 'ht5ifv: The function for target ' + $restriction + ' does not return a jQuery Object'
						}else if ($options.showNullTargetWarn && $target.length == 0){
							console.warn('The target "%s" for field %o is null. Check the code provided by you in the option target.min',$restriction, $field);
						}
						return $target;
					}else return $field //if programmer does not provide a target use the field itself
				}
				//for each input type, find a correspondent entry in $options.types and complement it with defaults if it is (partial) missing
				$inputs.each(function(){ 
					var $self = $(this);
					var $type = $self.attr('type');
					if ($type){ //apply _defaults if missing
						$options.types[$type] = $.extend(true,{},$options.types._defaults,$options.types[$type],null);
					}
				});

				/*****************Begin of the binding events ********************/
				/*The required restriction needs a special treatment */ 
				/*First define it for inputs, textareas and selects */  
				$inputs.add($textareas).add($selects).filter('[required]').each(function(){//required constrain for inputs,textareas and selects 
					var $self = $(this);	
					var $target = getAndCheckTarget('required',$self);
					var $callback = $options.callbacks.required;
					$self.bind('validate.ht5ifv',function(){
						if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
						var $val = $self.val();
						if($self.val()){		//if control is not empty remove error signal 
							$target.removeClass($options.classes.required);
							$self.removeClass($errorClasses.required);	
						}else{				//else signal the error
							$target.addClass($options.classes.required);
							if(!($self.hasClass($errorClasses.required) && $options.callbackOnlyErrorTransitions)){
								$self.addClass($errorClasses.required);	
								try{
									$callback($self);	
								}catch($e){
									throw 'ht5ifv: error in "required" callback ('+$e+')';
								}	
							}
						}
					}).addClass($monitClass);	
				});
				/* now, the behaviour on required restrictio for the radio buttons */
				$radios.filter('[required]').each(function(){//required constrain for radio. Needs a very special treatment
					var $self = $(this);	
					var $target = getAndCheckTarget('required',$self);
					var $callback = $options.callbacks.required;
					var $radioGroup = $radios.filter('[name="'+$self.attr('name')+'"]'); 	//get the radio group with same name
					if ($radioGroup.first().filter($self).length > 0){			//avoid to bind the event multiple times
						//bind to all radios from same group regardless the required atribute is present or not
						//If we are here, it means at leat on radio has the required attribute. As so, all of them must perform validation
						$radioGroup.bind('validate.ht5ifv',function(){	
							var $self = $(this);
							if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
							if (!$self.hasClass('ht5ifv-radioControlGroup')){ //if it the first from the group also trigger the others
								$radioGroup.addClass('ht5ifv-radioControlGroup'); //flag it
								$radioGroup.not($self.get(0)).trigger('validate.ht5ifv');
							};
							$self.removeClass('ht5ifv-radioControlGroup'); //remove the flag;
							if($radioGroup.filter(':checked').length > 0){		//if at least one control is checked
								//var $target = $options.target.required($($self));
								$target.removeClass($options.classes.required);
								$self.removeClass($errorClasses.required);	
							}else{				
								//var $target = $options.target.required($self);
								$target.addClass($options.classes.required);
								if(!($self.hasClass($errorClasses.required) && $options.callbackOnlyErrorTransitions)){
									$self.addClass($errorClasses.required);	
									try{
										$callback($self);	
									}catch($e){
										throw 'ht5ifv: error in "required" callback ('+$e+')';
									}	
								}
							}
						}).addClass($monitClass);
					}		
				});
				/* And last for the checkboxes */
				$checkboxes.filter('[required]').each(function(){//required constrain for checkbox
					var $self = $(this);	
					var $target = getAndCheckTarget('required',$self);
					var $callback = $options.callbacks.required;
					$self.bind('validate.ht5ifv',function(){
						if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
						if($self.is(':checked')){		//if control is checked
							$target.removeClass($options.classes.required);
							$self.removeClass($errorClasses.required);	
						}else{				
							$target.addClass($options.classes.required);
							if(!($self.hasClass($errorClasses.required) && $options.callbackOnlyErrorTransitions)){ 
								$self.addClass($errorClasses.required);	
								try{
									$callback($self);	
								}catch($e){
									throw 'ht5ifv: error in "required" callback ('+$e+')';
								}	
							}
						}
					}).addClass($monitClass);	
				});
				/* Define the generic code to bind validate events to every possible restriction */	
				$inputs.each(function(){
					var $self = $(this);
					var $type = $self.attr('type') || '_defaults';
					var $field = $options.types[$type]; 
					if(!$field.restrictions) return; //forget if this field does not have resctrictions
					$.each($field.restrictions,function($restriction,$evaluate){		//for each restriction
						if($self.is('[' + $restriction + ']')){				//if present on this field
							$errorClasses[$restriction] = 'ht5ifv-' + $restriction +'-error';
							var $target = getAndCheckTarget($restriction,$self);
							var $callback = $options.callbacks[$restriction];
							$self.bind('validate.ht5ifv',function(){		//bind a validate event	
								if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
								if ($evaluate($self,$options.ignoreEmptyFields)){	
									$target.removeClass($options.classes[$restriction]);
									$self.removeClass($errorClasses[$restriction]);	
								}else{					
									$target.addClass($options.classes[$restriction]);
									if(!($self.hasClass($errorClasses[$restriction]) && $options.callbackOnlyErrorTransitions)){
										$self.addClass($errorClasses[$restriction]);	
										try{
											$callback($self);//only if provided by the user	
										}catch($e){
											throw 'ht5ifv: error in "max" callback ('+$e+')';
										}	
									}
								}
							}).addClass($monitClass);
						} //if end	
					});
				});
				var $statusClasses = $.extend({},$errorClasses,{ 
					valid: 'ht5ifv-valid-status',
					invalid: 'ht5ifv-invalid-status',
				});
				/************************************check************************************************/
				var $monitoredControls = $controls.filter('.'+$monitClass);
				$monitoredControls.each(function(){  
					var $self = $(this);	
					var $targetv = getAndCheckTarget('valid',$self);
					var $targeti = getAndCheckTarget('invalid',$self);
					var $callbackv = $options.callbacks.valid;
					var $callbacki = $options.callbacks.invalid;
					$self.bind('check.ht5ifv',function(){
						if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
						if($options.safeValidate) $self.trigger('validate.ht5ifv');
						var $notErrors = true;
						var $this = $(this);
						$.each($errorClasses,function($type, $errorClass){
							if ($this.hasClass($errorClass)){	//the test fail if (at least) one error (class) is found 
								$notErrors = false;
							} 
						});
						if ($notErrors){
							$targeti.removeClass($options.classes.invalid);
							$self.removeClass($statusClasses.invalid);
							var $showIt = $this.val() !='' || !$options.ignoreEmptyFields; 
							if($showIt && !($self.hasClass($statusClasses.valid) && $options.callbackOnlyStatusTransitions)){ 
								try{
									$callbackv($self);
								}catch($e){
									throw 'ht5ifv: error in "valid" callback ('+$e+')';
								}	
							}
							if($showIt){
								$targetv.addClass($options.classes.valid);
								$self.addClass($statusClasses.valid);	
							}else{	
								$targetv.removeClass($options.classes.valid);
								$self.removeClass($statusClasses.valid);	//this is a tri-state (not valid and not invalid)
							}
						}else{
							$targetv.removeClass($options.classes.valid);
							$targeti.addClass($options.classes.invalid);
							$self.removeClass($statusClasses.valid);
							if(!($self.hasClass($statusClasses.invalid) && $options.callbackOnlyStatusTransitions)){ 
								$self.addClass($statusClasses.invalid);	
								try{
									$callbacki($self);
								}catch($e){
									throw 'ht5ifv: error in "invalid" callback ('+$e+')';
								}
							}	
						}
					});
				});
				$monitoredControls.bind('clear.ht5ifv',function(){ //chear the visual signals errors = status classes + display classes
					var $this = $(this);
					$.each($statusClasses,function($s, $statusClass){ 	//status (include error) classes are removed from element
						$this.removeClass($statusClass);
					});
					var $targets = $options.target;
					$.each($options.classes,function($type, $oClass){ 	//display classes are also removed from targets
						$targets[$type]($this).removeClass($oClass);
					});
					return false; //stop propagation
				});
				var $validateIt = function(){
					$(this).trigger('validate.ht5ifv');
				};
				var $checkIt = function(){
					$(this).trigger('check.ht5ifv');
				};
				//bind browser events to our validate/check events
				//First validate and then check! This order is importante;
				$textareas.filter('.'+$monitClass).bind($options.textarea.events.validate,$validateIt).bind($options.textarea.events.check,$checkIt);
				$selects.filter('.'+$monitClass).bind($options.select.events.validate,$validateIt).bind($options.select.events.check,$checkIt);
				$checkboxes.filter('.'+$monitClass).bind($options.checkbox.events.validate,$validateIt).bind($options.checkbox.events.check,$checkIt);
				$radios.filter('.'+$monitClass).bind($options.radio.events.validate,$validateIt).bind($options.radio.events.check,$checkIt);
				$inputs.filter('.'+$monitClass).each(function(){
					var $self = $(this);
					var $typeName = $self.attr('type') || '_defaults'; //VERificaificarr ISTO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					var $type = $options.types[$typeName];
					$self.bind($type.events.validate,$validateIt).bind($type.events.check,$checkIt);
				});	
				$("input[type='reset']",$form).click(function(){	//also clear the signaling classes when the reset button is pressed
					$monitoredControls.trigger('clear.ht5ifv');
				});
				$form.bind('submit.ht5ifv',function(){			//before submit check it. This is the only event attached to the form
					return $check();	
				});
				var $check = function(){ //to be used internally
					$monitoredControls.trigger('validate.ht5ifv').trigger('check.ht5ifv'); 	//first validate each control
					var $valid = true;				//then compute valid status
					$monitoredControls.each(function(){
						$valid = $valid && !$(this).hasClass($statusClasses.invalid);
					});
					return $valid;
				}
				function setDefaults(){ //apply the default values to each control type
					$selects.each(function(){
						var $self = $(this);
						var $list = new Array;
						$.each($('option[selected]',$self),function(){
							var $t = $(this);
							var $v = $t.attr('value') || $t.text();
							$list.push($v)
						});
						$self.val($list);
					});
					$checkboxes.each(function(){
						var $self = $(this);
						var $list = new Array;
						$checkboxes.filter('[name="'+$self.attr('name')+'"]').each(function(){
							if(this.defaultChecked){
								var $o = $(this);
								var $v = $o.attr('value');
								$list.push($v)
							};
						});
						if ( $list.length > 0 ) $self.val($list);
					});
					$radios.each(function(){
						var $self = $(this);
						if(this.defaultChecked){
							var $v = $self.attr('value');
							$self.val([$v]);
						};
					});
					$inputs.add($textareas).each(function(){//set de default value
						var $this = $(this);	
						var $default = this.defaultValue || '';			
						$this.val($default);
					});
				};
				$form.data('ht5ifv',{ 					//store these values for future accesses
					form: $form,
					method:{
						_validate: function(){$monitoredControls.trigger('validate.ht5ifv').trigger('check.ht5ifv');},
						_check:$check,
						_reset:function(){
							$monitoredControls.trigger('clear.ht5ifv');
							try{
								$form.get(0).reset();
							}catch(e){ //The user could hide the reset by defining something like this <input id="reset" ... />
								console.warn('The DOM reset method does not exist. It was problably overriden. '+
									'Chech in your form for a tag with the value "reset" assigned to an attribute id or name. '+
									'It just a hint. I will try again in a different way');
								var $resetButton = $('[type="reset"]',$form);
								if($resetButton.length){
									$resetButton.first().click();
								}else{ 			//third and the last attemp 
									console.warn('Reset form: the last try. Fallback to reset_fields only');
									setDefaults();
									//$.each($monitoredControls,function(i,e){//set de default value
								} 
							}
						},
						_defaults:function(){
							setDefaults();
						},
						_clean:function(){
							$monitoredControls.trigger('clear.ht5ifv');
							$inputs.val('');//set controls value to null string
							$textareas.val('');//set controls value to null string
							$checkboxes.val(['__ht5ifv__some_unprobably_text_algum_texto_']);
							$radios.val(['__ht5ifv__some_unprobably_text_algum_texto_']);
							$selects.val(['__ht5ifv__some_unprobably_text_algum_texto_']);
						},
						_destroy:function(){
							$monitoredControls.unbind('.ht5ifv');
							$form.unbind('.ht5ifv');
						},
					},
				});
			});//end of each
		},//end of init method
		validate: function(){ //just validate and apply the classes
			return this.each(function(){
				try{
					$(this).data('ht5ifv').method._validate();
				}catch($e){
					console.error($e);
					console.log('The object Error is: %o',$e);
					throw 'ht5ifv: "validate" error ('+$e+')';
				}
			});
		},
		valid: function(){ //validate and check 
			var $test = true;
			this.each(function(){
				try{
					$test = $test && $(this).data('ht5ifv').method._check();
				}catch($e){
					throw 'ht5ifv: "valid" error ('+$e+')';
				}
			});
			return $test;
		},
		reset: function(){ //reset the form (values and views)
			return this.each(function(){
				try{
					var $d = $(this).data('ht5ifv');
					$(this).data('ht5ifv').method._reset();
				}catch($e){
					throw 'ht5ifv: "reset" error ('+$e+')';
				}
			});
		},
		reset_fields: function(){ //reset the form (values and views)
			return this.each(function(){
				try{
					var $d = $(this).data('ht5ifv');
					$(this).data('ht5ifv').method._defaults();
				}catch($e){
					throw 'ht5ifv: "default" error ('+$e+')';
				}
			});
		},
		clean: function(){ //reset the form (values and views)
			return this.each(function(){
				try{
					$(this).data('ht5ifv').method._clean();
				}catch($e){
					throw 'ht5ifv: "clean" error ('+$e+')';
				}
			});
		},
		destroy: function(){
			return this.each(function(){
				try{
					$(this).data('ht5ifv').method._destroy();
				}catch($e){
					throw 'ht5ifv: "destroy" error ('+$e+')';
				}
			})
		}
	}
	$.fn.ht5ifv = function($method){
		if ($methods[$method]){
      			return $methods[$method].apply( this, Array.prototype.slice.call(arguments, 1));
    		} else if ($method instanceof Object || ! $method){
      			return $methods.init.apply(this, arguments);
    		} else {
      			$.error('Method ' +  $method + ' does not exist on jQuery.ht5ifv plugin');
    		}    
	}
})(jQuery);
