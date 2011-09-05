(function(){ //International Telephone Number
    //From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)
    var $handler = function($node,$ignoreEmpty){
        var $v = $node.val();
        return !$v && $ignoreEmpty || $v.match(/^\+(?:[0-9] ?){6,14}[0-9]|\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/);
    }
    $.ht5ifv(registerType,'iTelNumber',$handler);
    $.ht5ifv(registerRestriction,'data-iTelNumber',$handler);
    $.ht5ifv(register,'iTelNumber',function(($mode,$name)){
        if (!$name || typeof $name == 'string' && $name.length == 0) $name = 'iTelNumber';
        var $options = {};
        if (!$mode || $mode === 'type'){ //by default or when mode is type
            $options.types = (function($o){
                $o[$name] = {restrictions:{type: $handler}};
                return $o;
            })({});
        }else if($mode === 'restriction'){
            $options.restrictions = (function($o){
                $o[$name] = $handler;
                return $o;
            })({});
        };
        return $options;
    });
})();