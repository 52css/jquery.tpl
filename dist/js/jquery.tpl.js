/**
 * Created by Ivan on 14-2-28.
 * Version: 0.0.1
 */(function($, sFnName) {
    /**
     * 文件加密用的
     */
    String.prototype.encodeHTML = (function(){
        var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': '&#34;', "'": '&#39;', "/": '&#47;' },
            matchHTML = /&(?!#?\w+;)|<|>|"|'|\//g;
        return function() {
            return this ? this.replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : this;
        };
    }());

    var /**
         定义临时函数
         */
            fnTemp = function(tpl){
            return new oTemp.init(tpl);
        },
        /**
         * 文件格式函数 仿c#
         * @param str
         * @returns {XML|string|void}
         */
            fnFormat = function(str){
            var args = arguments;
            return str.replace(/\{(\d+)\}/g,function($0,$1){
                return args[+$1+1];
            });
        },
        eachIndex = 0,
        noFirstWrap = false,
        oTemp = fnTemp.prototype = {
            init:function(tpl){
                var self = this;
                self.tpl(tpl);
                return self;
            },
            do_write:function(str){
                if(str =="")
                    return "";
                return "rtv += ( "+ str +" ) ;\n";
            },
            do_array:function(str){
                if(str==""){
                    return "\t}\n}\n";
                }
                var arr = str.split(":"),
                    obj = arr[0],
                    value = arr[1] || "value",
                    index = arr[2] || "index";
                noFirstWrap = true;
                return fnFormat("var obj{0} = {1};\n\
if (obj{0}) {\n\
    var {2}, {3} = -1,\n\
        l1 = obj{0}.length - 1;\n\
    while ({3} < l1) {\n\
        {2} = obj{0}[{3} += 1];\n",
                    eachIndex++,
                    obj,
                    value,
                    index);
            },
            do_object:function(str){
                if(str==""){
                    return "\t\t}\n\t}\n}\n";
                }
                var arr = str.split(":"),
                    obj = arr[0],
                    value = arr[1] || "value",
                    key = arr[2] || "key";
                noFirstWrap = true;
                return fnFormat("var obj{0} = {1};\n\
if(obj{0}){\n\
    var {2}, {3};\n\
    for({3} in obj{0}){\n\
        if({}.hasOwnProperty.call(obj{0},{3})){\n\
            {2} = obj{0}[{3}];\n",
                    eachIndex++,obj,value,key);
            },
            do_encode:function(str){
                if(str=="")
                    return "";

                return "rtv += ( "+ str +" ).toString().encodeHTML() ;\n";
            },
            do_if:function(str){
                if(str==""){
                    return "}\n";
                }
                noFirstWrap = true;
                return "if (" + str + ") {\n";
            },
            do_else:function(str){
                noFirstWrap = true;
                if(str==""){
                    return "} else {\n";
                }
                return "} else if ( " + str+ "){\n";
            },
            do_use:function(str){
                if(str =="")
                    return "";
                return "rtv += ("+fnTemp.varname+"._def"+str+" || function(){})();\n";
            },
            compile:function(fn){
                var self = this;
                if(fn!==void(0)){
                    self._compile = fn;
                    return self;
                }
                return self._compile.toString();
            },
            tpl:function(tpl){
                var self = this;
                //set tpl
                if(tpl!==void(0)){
                    self._tpl = tpl;
                    //alert(tpl);
                    self._compileStr = (function fnTpl(tpl){
                        var code = "var rtv ='';\n",
                            cursor = 0,
                            reg = fnTemp.code,
                            refDef = /\{\{##([^\s]+)[^\s]*[\s\n]([\s\S]+?)#\1\}\}/g,
                            match;
                        //console.log(fnTemp.wrap);
                        function fnString(tpl,from,len){
                            if(len ==0 || from >= tpl.length){
                                return ;
                            }
                            tpl = tpl.slice(from, len).replace(/\\/g,"\\\\").replace(/'/g,"\\'");

                            if (fnTemp.wrap) {

                                if (noFirstWrap) {
                                    //debugger;
                                    tpl = tpl.replace(/^\s*\n/,"");
                                    //console.log(tpl);
                                    noFirstWrap = false;
                                }
                                tpl = tpl.replace(/\r/g, "\\r").replace(/\n/g,"\\n");
                            } else {
                                tpl = tpl.replace(/\r|\n/g,"");
                            }
                            code += "rtv +='" + tpl + "';\n";
                        }
                        if(refDef.test(tpl)){
                            tpl = tpl.replace(refDef,function($0,$1,$2){
                                code += fnFormat("{0}._def{1}=function (){\n {2} \n}\n",fnTemp.varname,$1,fnTpl($2));
                                return "";
                            })
                        }


                        while(match = reg.exec(tpl)) {
                            fnString(tpl,cursor,match.index);
                            var subMatch = match[1],
                                subMatchSlice0 = subMatch.slice(0,1),
                                subMatchSlice1 = $.trim(subMatch.slice(1)),
                                fn = fnTemp.fn ,
                                fnHasOwn = {}.hasOwnProperty,
                                fnName;

                            if(fnHasOwn.call(fn,subMatchSlice0)){
                                //debugger;
                                fnName = "do_" + fn[subMatchSlice0];
                                if( fnHasOwn.call(oTemp,fnName)){
                                    code += oTemp[fnName](subMatchSlice1);
                                }
                            }else{
                                code +=  subMatch;
                            }
                            cursor = match.index + match[0].length;
                        }

                        fnString(tpl,cursor);
                        code += "return rtv;";
                        //Fso.writeUtf8("log.txt",code);
                        //console.log(code);
                        return code;
                    }(tpl));
                    self._compile = Function(fnTemp.varname, self._compileStr);
                    return self;
                }
                //get tpl
                return self._tpl;
            },
            model: function(data){
                //debugger;
                var self = this,
                    obj = {};
                if(self._compile === void(0)) return "";

                return self._compile(obj[fnTemp.varname]=data);
            }
        };
    oTemp.init.prototype = oTemp;
    $.extend(fnTemp,{
        code:/\{\{([\s\S]+?\}*)\}\}/g,
        fn:{
            "=":"write",
            "!":"encode",
            "~":"object",
            "@":"array",
            "?":"if",
            "&":"else",
            "#":"use"
        },
        varname: 'it',
        wrap:false
    });

    $[sFnName] = fnTemp;

    $.fn[sFnName] = function(data){
        return this.each(function(){
            var $this = $(this);
            if(!$this.data("viewModel")){
                $this.data("viewModel",$.viewModel($this.attr("data-viewModel") || $this.html()))
            }
            $this.html($this.data("viewModel").model(data));
        });
    }
}(jQuery, "viewModel"));