var timekeeperAnalytics=function(e){"use strict";var r=Function("return this")(),g={useTabName:function(e){var n=e.pathname;return("/"===n?"index":n).replace(/[\/\.]+/g,"-").replace(/^-|-$/g,"")}};return e.googleAnalytics=function(n,a){void 0===a&&(a=g);var t=[],i=function(e){n?n("send",e):t.push(e)};return n||function e(){(n=r.gtag?function(e,n){r.gtag("event","timing_complete",{name:n.timingVar,value:n.timingValue,event_category:n.timingCategory,event_label:n.timingLabel})}:r.ga)?(t.forEach(i),t.length=0):setTimeout(e,500)}(),function(e){var n=e.name,t="value";if(e.parent)for(t=e.name;;){if(!(e=e.parent).parent){n=e.name;break}t=e.name+"_"+t}i({hitType:"timing",timingCategory:n,timingVar:t,timingValue:Math.round(e.end-e.start),timingLabel:a.useTabName?a.useTabName(r.location):void 0})}},e}({});
