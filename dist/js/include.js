/**
 * Created by Ivan on 14-2-28.
 * Version: 0.0.1
 *//**
 * Created by Ivan on 13-12-4.
 */
(function(win){
    var aScripts =[]; //缓存要运行的script
    function fnDifferentDomain(url){
        if ( 0 === url.indexOf('http://') || 0 === url.indexOf('https://') ) {
            var mainDomain = document.location.protocol +
                "://" + document.location.host + "/";
            return ( 0 !== url.indexOf(mainDomain) );
        }
        return false;
    };
    function fnLoadScriptDomElement(url,callback){
        var script = document.createElement('script');
        script.type = 'text/javascript';
        if (callback)
            script.onload = script.onreadystatechange = function() {
                if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete')
                    return;
                script.onreadystatechange = script.onload = null;
                callback();
            };
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild (script);
    };
    function fnLoadScriptDocWrite(url, onload){
        document.write('<scr' + 'ipt src="' + url + '" type="text/javascript"></scr' + 'ipt>');
        if ( onload ) {
            // we can't tie it to the script's onload, so use window
            // thus, it doesn't fire as early as it might have
            fnAddEvent(window, "load", onload);
        }
    };
    function fnInjectScripts() {
        var len = aScripts.length;
        for ( var i = 0; i < len; i++ ) {
            var qScript = aScripts[i];
            if ( ! qScript.done ) {
                if ( ! qScript.response ) {
                    // STOP! need to wait for this response
                    break;
                }else {
                    var se = document.createElement('script');
                    document.getElementsByTagName('head')[0].appendChild(se);
                    se.text = qScript.response;
                    if ( qScript.onload ) {
                        qScript.onload();
                    }
                    qScript.done = true;
                }
            }
        }
    };
    function fnGetXHRObject() {
        var xhrObj = false;
        try {
            xhrObj = new XMLHttpRequest();
        }
        catch(e){
            var aTypes = ["Msxml2.XMLHTTP.6.0",
                "Msxml2.XMLHTTP.3.0",
                "Msxml2.XMLHTTP",
                "Microsoft.XMLHTTP"];
            var len = aTypes.length;
            for ( var i=0; i < len; i++ ) {
                try {
                    xhrObj = new ActiveXObject(aTypes[i]);
                }
                catch(e) {
                    continue;
                }
                break;
            }
        }
        finally {
            return xhrObj;
        }
    };
    function fnLoadScriptXhrInjection(url, onload, bOrder) {
        var iQueue = aScripts.length;
        if ( bOrder ) {
            var qScript = { response: null, onload: onload, done: false };
            aScripts[iQueue] = qScript;
        }

        var xhrObj = fnGetXHRObject();
        xhrObj.onreadystatechange = function() {
            if ( xhrObj.readyState == 4 ) {
                if ( bOrder ) {
                    aScripts[iQueue].response = xhrObj.responseText;
                    fnInjectScripts();
                }
                else {
                    var se = document.createElement('script');
                    document.getElementsByTagName('head')[0].appendChild(se);
                    se.text = xhrObj.responseText;
                    if ( onload ) {
                        onload();
                    }
                }
            }
        };
        xhrObj.open('GET', url, true);
        xhrObj.send('');
    };
    function fnAddEvent(elem, type, func){
        if ( elem.addEventListener ) {
            elem.addEventListener(type, func, false);
        }
        else if ( elem.attachEvent ) {
            elem.attachEvent("on" + type, func);
        }
    };
    function fnType(oObject,sType){
        var tp=function(obj){
                return String({}.toString.call(obj).slice(8,-1));
            },
            myType=tp(oObject);
        return sType!==null&&tp(sType)==="String"?myType==sType:myType;
    };
    function fnGetRealyPath(file){
        return document.location.href.replace(/\/[^/]+?$/g,"") + fnTemp.path + file;
    };
    function fnTemp(){
// first pass: see if any of the js are on a different domain
        var args = arguments,
            argsLen = arguments.length,
            doOne = function(file,fn){
                fnLoadScriptDomElement(fnGetRealyPath(file),fn);
            },
            doAll = function(aUrls,onload){
                var bDifferent = false,
                    nUrls = aUrls.length;
                for ( var i = 0; i < nUrls; i++ ) {
                    if ( fnDifferentDomain(aUrls[i]) ) {
                        bDifferent = true;
                        break;
                    }
                }
                // pick the best loading function
                var loadFunc = fnLoadScriptXhrInjection;
                if ( bDifferent ) {
                    loadFunc = -1 != navigator.userAgent.indexOf('Firefox') || -1 != navigator.userAgent.indexOf('Opera') ? fnLoadScriptDomElement : fnLoadScriptDocWrite;
                }

                // second pass: load the js
                for ( var i = 0; i < nUrls; i++ ) {
                    loadFunc(fnGetRealyPath(aUrls[i]), ( i+1 == nUrls ? onload : null ), true);
                }
            };
        switch (argsLen){
            case 1:
                fnAddEvent(window, "load", args[0]);
                break;
            case 2:
                var aUrls = args[0],
                    onload = args[1];
                if(fnType(aUrls,"Array")){
                    var nUrls = aUrls.length;
                    if(nUrls==1){
                        doOne(aUrls[0],onload);
                    }else{
                        doAll(aUrls,onload);
                    }
                }else{
                    doOne(aUrls,onload);
                }
                break;
            default :
                var arr=Array.prototype.slice.call(arguments);
                arr.pop();
                doAll(arr,args[argsLen-1]);
        }
    }
    fnTemp.path="/js/"
    win.include = fnTemp;
}(window));
