(function(){ //International Telephone Number
    //From Regular Expression Cookbook (ISBN: 978-0-596-52068-7)
    var $handler = function($node,$ignoreEmpty){
        var $v = $node.val();
        return !$v && $ignoreEmpty || $v.match(/^\+(?:[0-9] ?){6,14}[0-9]|\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/);
    }
    $.ht5ifv('registerType','iTelNumber',$handler);               //can be used as a type with name iTelNumber
    $.ht5ifv('registerRestriction','data-iTelNumber',$handler);   //can me used as restriction with name data-iTelNumber
    /* The user decides if it will be used as a type or as atring and the name should be provide by the user  */  
    $.ht5ifv('register','_iTelNumber',function($mode,$name){     
        var $options = {};
        if (!$name || typeof $name == 'string' && $name.length == 0){
            console.warn('ht5ifv.iTelNumber - No name provided for the type/restriction');
        }else{
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
        }
        return $options;
    });
})();