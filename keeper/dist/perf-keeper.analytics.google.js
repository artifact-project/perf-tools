var perfKeeperAnalyticsGoogle=function(e){"use strict";var o=Function("return this")(),t={useTabName:function(e){var n=e.pathname;return("/"===n?"index":n).replace(/[\/\.]+/g,"-").replace(/^-|-$/g,"")}};function a(e,n){return e&&n in e?e[n]:t[n]}return e.googleAnalytics=function(e,n){var i=a(e,"prefix"),r=a(e,"useTabName"),t=[],g=function(e){n?n("send",e):t.push(e)};return n||function e(){(n=o.gtag?function(e,n){o.gtag("event","timing_complete",{name:n.timingVar,value:n.timingValue,event_category:n.timingCategory,event_label:n.timingLabel})}:o.ga)?(t.forEach(g),t.length=0):setTimeout(e,500)}(),function(e){var n=e.name,t="value",a=e.parent;if(a)for(t=e.name;;){if(!a.parent){n=a.name;break}t=a.name+"_"+t,a=a.parent}g({hitType:"timing",timingCategory:""+i+n,timingVar:t,timingValue:Math.round(e.end-e.start),timingLabel:r?r(o.location):void 0})}},e}({});
