/**
 * Created by kerr on 14-3-1.
 */
(function($){
    //debugger;
    $.fn.input=function(fn){
        //debugger;
        return this.each(function(){
            var input = this;
            if(window.addEventListener) { //先执行W3C
                input.addEventListener("input", fn, false);
            } else {
                input.attachEvent("onpropertychange", fn);
            }
            if(window.VBArray && window.addEventListener && input.attachEvent) { //IE9
                input.attachEvent("onkeydown", function() {
                    var key = window.event.keyCode;
                    (key == 8 || key == 46 || key ==9) && fn();//处理回退与删除

                });
                input.attachEvent("oncut", fn);//处理粘贴
            }
        });
    };
}(jQuery));




