var perfKeeperAnalyticsMailru=function(e){"use strict";var v=Function("return this")(),r={prefix:"",normalize:function(e){return e},sendZeroValues:!1,useTabName:function(e){var n=e.pathname;return("/"===n?"index":n).replace(/[\/\.]+/g,"-").replace(/^-|-$/g,"")}};function n(e,n){return e&&n in e?e[n]:r[n]}return e.mailruAnalytics=function(e,u){var i=n(e,"prefix"),l=n(e,"project"),o=n(e,"normalize"),c=n(e,"sendZeroValues"),f=n(e,"useTabName"),p=[],s=function(e){if(u){var n=e.group,r=e.label,a=e.value,t=[n];r&&t.push(r),u(""+i+o(t).join("_")+"&v="+a+(l?"&p="+l:"")),f&&u(""+i+o(t.concat(f(v.location))).join("_")+"&v="+a+(l?"&p="+l:""))}else p.push(e)};return u||function e(){(u=function(){var n=v.require,r=v.xray;try{r=n("@mail/xray")}catch(e){try{r=n("mrg-xray")}catch(e){}}return"function"==typeof r?r:null}())?(p.forEach(s),p.length=0):setTimeout(e,500)}(),function(e){if(!(null===(n=e).start||null===n.end||null===n.parent&&function(e){var n=e.entries,r=!1;if(n)for(var a=n.length;a--;)if("value"===n[a].name){r=!0;break}return r}(n))){var n,r=e.name,a="value",t=e.parent;if(t)for(a=e.name;;){if(!t.parent){r=t.name;break}a=t.name+"_"+a,t=t.parent}var u=Math.round(e.end-e.start);(u||c)&&s({group:r,label:a,value:u})}}},e}({});
