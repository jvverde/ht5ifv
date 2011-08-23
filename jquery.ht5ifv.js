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
		targets: {
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
			restrictions:{
				required: function($node){
					return $node.is(':checked')
				},
			},		
		},
		radio:{
			restrictions:{
				required:function ($radioGroup,$node){
					return $radioGroup.filter(':checked').length > 0
				},
			},
		},
		textarea:{
			events:{
				validate: 'focus.ht5ifv keyup.ht5ifv',
				check: 'blur.ht5ifv',
			}
		},
		select:{
			restrictions:{
				required:function ($node){
					return $node.val() != null;
				},
			},
		},
		events:{
			validate: 'change.ht5ifv',
			check: 'change.ht5ifv',
		},	
		restrictions:{
			required:function ($node){
				return $node.val() != ''
			},
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
			
			$.each($defaults,function($i,$e){		//check if each default option was provided as an object 
				if ($i == 'classes') return;		//don't test classes as it could be a primitive string 
				if (!($options[$i] instanceof Object)) throw 'ht5ifv: Wrong Options ( the option '+$i+' must be an object)';
			});
			var $allRestrictions = (function(){		//We need to know, in advance, all possible restrictions.
				var $restrictions = ['valid','invalid'];
				$.each($options.restrictions,function($r){
					$restrictions.push($r);
				})
				$.each(['select','textarea','checkbox','radio'],function($n,$e){
					if($options[$e].restrictions && $options[$e].restrictions instanceof Object) 
						$.each($options[$e].restrictions,function($r){
							$restrictions.push($r);
						});
				});
				$.each($options.types,function($e,$x){
					if($options.types[$e].restrictions && $options.types[$e].restrictions instanceof Object) 
						$.each($options.types[$e].restrictions,function($r){
							$restrictions.push($r);
						});
				});				
				return $restrictions;
			})();
			var $verify = function($n,$f){
				if (!$f || !($f instanceof Object)) 
					throw 'ht5ifv: $options' + $n + ' must exits and must be an Object';
				//first decompose classes if it is provided as a string or an array
				if (typeof $f.classes == 'string'){
					var $class = $f.classes;
					$f.classes = {};
					$f.classes.invalid = $class;
					$f.classes.valid = '';
					$.each($allRestrictions,function($n,$r){
						$f.classes[$r] = '';
					});
				}else if($f.classes instanceof Array){
					var $i = $f.classes[1];
					var $v = $f.classes[0];
					$f.classes = {};
					$f.classes.invalid = $i;
					$f.classes.valid = $v;
					$.each($allRestrictions,function($n,$r){
						$f.classes[$r] = '';
					});
				}
				$.each(['events','classes','targets','callbacks','restrictions'], function($k,$i){
					if (!$f[$i] || !($f[$i] instanceof Object))
						throw 'ht5ifv: $options' + $n + '.' + $i + ' must exist and must be an Object';
				});
				//Decompose targets if it is provided as Function
				if ($f.targets instanceof Function){
					var $target = $f.targets; 
					$f.targets = {};
					$.each($allRestrictions,function($n,$r){
						$f.targets[$r] = function($node){return $target($node,$r)};
					});
				}
				if ($f.callbacks instanceof Function){
					var $callback = $f.callbacks; 
					$f.callbacks = {};
					$.each($allRestrictions,function($n,$r){
						$f.callbacks[$r] = function($node){$callback($node,$r)};
					});
				}
				var $checkIt = function($r){					//check if classes, targets and callbacks are defined
					if (typeof $f.classes[$r] != 'string'){
						$f.classes[$r] = '';
						console.warn('$options%s.classes.%s set to a null string',$n,$r);
					}
					if (typeof $f.targets[$r] != 'function'){
						$f.targets[$r] = function($this){return $this};
						console.warn('$options%s.targets.%s set to a "function($this){return $this}"',$n,$r);
					}
					if (typeof $f.callbacks[$r]  != 'function'){
						$f.callbacks[$r] = function($this){};
						console.warn('$options%s.callbacks.%s set to a "function($this){}"',$n,$r);
					}
				} 
				$.each($f.restrictions,$checkIt);		//Test if each context restriction has a class, a target and a callback
				$.each({valid:1,invalid:1},$checkIt); 	//Including valid and invalid
				if (!$f.events.validate ||  typeof $f.events.validate != 'string')
					throw 'ht5ifv: the event validate for select must me a non null string'
				if (!$f.events.check ||  typeof $f.events.check != 'string')
					throw 'ht5ifv: the event check for select must be a non null string'
				$.each($f.restrictions,function($r,$obj){
					if (!($obj instanceof Function) && $obj instanceof Object && $obj.handler && $obj.handler instanceof Function){
						var $restrictions = {};
						$restrictions[$r] = $obj.handler;	
						var $new = {restrictions: $restrictions};
						if ($obj.classe !== undefined){
							$new.classes = {};
							$new.classes[$r] = $obj.classe;
						}
						if ($obj.target !== undefined){
							$new.targets = {};
							$new.targets[$r] = $obj.target;
						}
						if ($obj.callback !== undefined){
							$new.callbacks = {};
							$new.callbacks[$r] = $obj.callback;
						}
						//console.log('new=',$new);
						//console.log('bef=',$.extend(true,{},$f));
						$.extend(true,$f,$new);
						//console.log('aft=',$f);
					}
				})
			};
			/****************just a bunch of some sanity and uniformization tests*********************/
					
			$verify('',$options);
			console.log($options);
			//return;


			//Repeat for targets
			if (!($options.targets instanceof Function)) $.each($options.targets, function($n,$t){ //the if isn't need, but... just in case
				if (!($t instanceof Function)) throw 'ht5ifv: The target.'+$i+' must be a Function';
			})
			//Repeat also for callbacks
			if (!($options.callbacks instanceof Function)) $.each($options.callbacks,function($i,$c){
				if (!($c instanceof Function)) throw 'ht5ifv: The callbacks.'+$i+' must be a Function';
			})
			
			if (!($options.filter instanceof Function)) throw 'ht5ifv: The filter option must be a Function'; 			
			
			if (!$options.types._defaults || !($options.types._defaults instanceof Object)){
				throw 'The element options.types._defaults must be present and must be a Object';
			}
			/****************END: just a bunch of some sanity and uniformization tests****************/
			
			//demultiplexing the defaults and apply its members to each html form field if not specifically defined
			function demux_defaults($obj){
				return $.extend(true,{},
					{classes: $options.classes},
					{targets: $options.targets},
					{events: $options.events},
					{restrictions: $options.restrictions},
					{callbacks: $options.callbacks},
					$obj
				);
			}

			$options.select = demux_defaults($options.select);
			$verify('.select',$options.select);
			$options.textarea = demux_defaults($options.textarea);
			$verify('.textarea',$options.textarea);
			$options.radio = demux_defaults($options.radio);
			$verify('.radio',$options.radio);
			$options.checkbox = demux_defaults($options.checkbox);
			$verify('.checkbox',$options.checkbox);
			
			//Inputs are a special case
			//For now we just desmultiplex the global defaults and apply it to input defaults 
			//Later it will be applied to each type, when the types are already known. 
			$options.types._defaults = demux_defaults($options.types._defaults); 	
			$verify('.types._defaults',$options.types._defaults);
			console.log($options);

			//Now the real coding
			return this.each(function(){
				var $form = $(this);
				if($options.browserValidate != true){
					$form.attr('novalidate','novalidate');
				}
				var $controls = $options.filter(
					$('input,textarea,select',$form).not('[type="reset"],[type="submit"],[type="image"],[type="button"]')
				);
				var $inputs = $controls.filter('input').not('[type="checkbox"],[type="radio"]');
				var $checkboxes = $controls.filter('input[type="checkbox"]');
				var $radios = $controls.filter('input[type="radio"]');
				var $textareas = $controls.filter('textarea');
				var $selects = $controls.filter('select');
				
				//for each input type, find a correspondent entry in $options.types and complement it with defaults if it is (partial) missing
				$inputs.each(function(){ 
					var $self = $(this);
					var $type = $self.attr('type');
					if ($type){ //apply _defaults if missing
						$options.types[$type] = $.extend(true,{},$options.types._defaults,$options.types[$type]);
						$verify('.types.'+$type,$options.types[$type]);
					}
				});

				/*****************Begin of the binding events ********************/

		
				/* clear event */
				function bind_clearEvent($node,$definitions){
					var $restrictions = $definitions.restrictions;
					$node.bind('clear.ht5ifv',function(){ //chear the visual signals errors = status classes + display classes
						var $self = $(this);
						$.each($statusClasses,function($s, $statusClass){ 	//status (include error) classes are removed from element
							$self.removeClass($statusClass);
						});
						$.each($restrictions,function($r){ 	//Removed from targets classes associated with restrictions errors
							var $target = $definitions.targets[$r]($self);
							var $class = $definitions.classes[$r];
							$target.removeClass($class);
						});
						$.each(['valid','invalid'],function($i,$r){ 	//Removed from targets classes associated with status errors
							try{
								var $target = $definitions.targets[$r]($self);
								var $class = $definitions.classes[$r];
								$target.removeClass($class);
							}catch($e){
								console.error($e);
								console.log('The object Error is: %o',$e);
								throw 'ht5ifv: "clear" error ('+$e+')';
							}
						});
						return false; //stop propagation
					});
				}
				/* compute the valid or invalide state */
				function bind_checkEvent($node,$definitions){
					var $targetv = $definitions.targets['valid']($node);
					var $callbackv = $definitions.callbacks['valid'];
					var $classv = $definitions.classes['valid'];
					var $targeti = $definitions.targets['invalid']($node);
					var $callbacki = $definitions.callbacks['invalid'];
					var $classi = $definitions.classes['invalid'];
					$node.bind('check.ht5ifv',function(){
						var $self = $(this);
						if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
						if($options.safeValidate) $self.trigger('validate.ht5ifv');
						var $notErrors = true;
						$.each($errorClasses,function($type, $errorClass){
							if ($self.hasClass($errorClass)){	//the test fail if (at least) one error (class) is found 
								$notErrors = false;
							} 
						});
						if ($notErrors){
							$targeti.removeClass($classi);
							$self.removeClass($statusClasses.invalid);
							var $showIt = $self.val() !='' || !$options.ignoreEmptyFields; 
							if($showIt && !($self.hasClass($statusClasses.valid) && $options.callbackOnlyStatusTransitions)){ 
								try{
									$callbackv($self);
								}catch($e){
									throw 'ht5ifv: error in "valid" callback ('+$e+')';
								}	
							}
							if($showIt){
								$targetv.addClass($classv);
								$self.addClass($statusClasses.valid);	
							}else{	
								$targetv.removeClass($classv);
								$self.removeClass($statusClasses.valid);	//this is a tri-state (not valid and not invalid)
							}
						}else{
							$targetv.removeClass($classv);
							$targeti.addClass($classi);
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
					})
				}
				
				/*install events (validate, check and clear) for each restriction */
				function install_restriction($node,$definitions){
					var $restrictions = $definitions.restrictions;
					if(!$restrictions) return;
					$.each($restrictions,function($restriction,$evaluate){		//for each restriction
						if($node.is('[' + $restriction + ']')){		//if the restriction is present on this field
							var $errorClass = $errorClasses[$restriction] = 'ht5ifv-' + $restriction +'-error'; //add restriction to global errorClasses
							//var $target = getAndCheckTarget($restriction,$node);
							//var $callback = $options.callbacks[$restriction];
							var $target = $definitions.targets[$restriction]($node);
							var $callback = $definitions.callbacks[$restriction];
							var $class = $definitions.classes[$restriction];
							$node.bind('validate.ht5ifv',function(){		//bind a validate event	
								if ($evaluate($node,$options.ignoreEmptyFields)){	
									$target.removeClass($class);
									$node.removeClass($errorClass);	
								}else if (!($options.checkDisable && $node.parents('form,fieldset').andSelf().is('[disabled]'))){
									$target.addClass($class);
									if(!($node.hasClass($errorClass) && $options.callbackOnlyErrorTransitions)){
										$node.addClass($errorClass);	
										try{
											$callback($node);	
										}catch($e){
											throw 'ht5ifv: error in callback ('+$e+')';
										}	
									}
								}
							}).addClass($monitClass);
							bind_checkEvent($node,$definitions); //install check event
							bind_clearEvent($node,$definitions);
							$node.bind($definitions.events.validate,function(){
								$(this).trigger('validate.ht5ifv');
							}).bind($definitions.events.check,function(){
								$(this).trigger('check.ht5ifv');
							});
						} //if end	
					});
				}
				/* install_restrictions for inputs*/
				$inputs.each(function(){
					var $self = $(this);
					var $type = $self.attr('type') || '_defaults';
					var $field = $options.types[$type];
					install_restriction($self,$field);
				});
				/* install_restrictions for textareas*/
				$textareas.each(function(){ 
					install_restriction($(this),$options.textarea);
				});
				/* install_restrictions for selects*/
				$selects.each(function(){ 
					install_restriction($(this),$options.select);
				});				
				/* install_restrictions for checkboxes*/
				$checkboxes.each(function(){ 
					install_restriction($(this),$options.checkbox);
				});
				
				/* Radio buttons are a very special case and needs a very special treatment*/
				
				$radios.each(function(){//required constrain for radio. Needs a very special treatment
					var $self = $(this);
					var $definitions = $options.radio;
					var $restrictions = $definitions.restrictions;
					$.each($restrictions,function($restriction,$evaluate){
						if($self.is('[' + $restriction + ']')){
							var $errorClass = $errorClasses[$restriction] = 'ht5ifv-' + $restriction +'-error'; //add restriction to global errorClasses
							var $target = $definitions.targets[$restriction]($self);
							var $callback = $definitions.callbacks[$restriction];
							var $class = $definitions.classes[$restriction];
							var $sameform = $self.parents('form').add($form).first();
							//get the radio group with same name in the same form
							var $radioGroup = $('input[type="radio"][name="' + $self.attr('name') + '"]',$sameform);
							if ($radioGroup.filter('[' + $restriction + ']').first().is($self)){ //avoid to bind the event multiple times
								//bind to all radios from same group regardless the restriction is present or not
								//If we are here, it means at least one radio, in this group, has this restriction set. 
								//As so, all of them must perform validation
								$radioGroup.bind('validate.ht5ifv',function(){	
									var $self = $(this);
									if ($options.checkDisable && $self.parents('form,fieldset').andSelf().is('[disabled]')) return;
									if (!$self.hasClass('ht5ifv-radioControlGroup')){ 
										//if it the first from the group also trigger the others
										$radioGroup.addClass('ht5ifv-radioControlGroup'); //flag it
										$radioGroup.not($self.get(0)).trigger('validate.ht5ifv'); //trigger the others
									};
									$self.removeClass('ht5ifv-radioControlGroup'); //remove the flag;
									if($evaluate($radioGroup,$self,$options.ignoreEmptyFields)){
										$target.removeClass($class);
										$self.removeClass($errorClass);	
									}else{				
										$target.addClass($class);
										if(!($self.hasClass($errorClass) && $options.callbackOnlyErrorTransitions)){
											$self.addClass($errorClass);	
											try{
												$callback($self);	
											}catch($e){
												throw 'ht5ifv: error in callback ('+$e+')';
											}	
										}
									}
								}).addClass($monitClass);
								bind_checkEvent($radioGroup,$definitions); //install check event
								bind_clearEvent($radioGroup,$definitions);
								$radioGroup.bind($definitions.events.validate,function(){
									$(this).trigger('validate.ht5ifv');
								}).bind($definitions.events.check,function(){
									$(this).trigger('check.ht5ifv');
								});
							};
						};
					});		
				});
				
				
				var $statusClasses = $.extend({},$errorClasses,{ //Very important to be here, don't move it
					valid: 'ht5ifv-valid-status',
					invalid: 'ht5ifv-invalid-status',
				});
				
				/************************************Last things************************************************/
				var $monitoredControls = $controls.filter('.'+$monitClass);
				
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
	};
	var $staticMethods = {
		extend: function($definitions,$force){
			$defaults = $force ? $.extend(true,$defaults,$definitions) : $.extend(true,$defaults,$definitions,$defaults);
		}
	}
	$.ht5ifv = function($staticMethod){
		if ($staticMethods[$staticMethod]){
      		return $staticMethods[$staticMethod].apply( this, Array.prototype.slice.call(arguments, 1));
    	} else {
      		$.error('Static Method ' +  $staticMethod + ' does not exist on jQuery.ht5ifv plugin');
    	}
	}
})(jQuery);
