var perfKeeperExtensions=function(t){"use strict";var a=function(){return(a=Object.assign||function(t){for(var e,n=1,r=arguments.length;n<r;n++)for(var a in e=arguments[n])Object.prototype.hasOwnProperty.call(e,a)&&(t[a]=e[a]);return t}).apply(this,arguments)},h=Function("return this")(),r=h.document,y=h.performance,g=y&&y.now?function(){return y.now()}:Date.now;function E(t){"complete"===r.readyState?t():h.addEventListener("DOMContentLoaded",t)}var b,e,u=[];function z(a,o,c){var i={};return[function(t,e,n,r){var a=i;u.concat(t).forEach(function(t){var e=a.nested||(a.nested={});a=e[t]||(e[t]={name:t})}),null!=a.end?a.end+=n-e:(a.start=e,a.end=n,a.unit=r)},function(t,e,n,r){i.name=t?a+"-"+t:a,i.start=e,i.end=n,function e(t,n){var r=t.nested,a=r?Object.keys(r):u;if(a.length){var i=(n||o).group(t.name,t.start);i._=!0,i.unit=c||"ms",a.sort().forEach(function(t){e(r[t],i)}),i.stop(t.end)}else n.add(t.name,t.start,t.end),n.entries[n.entries.length-1].unit=t.unit||n.unit}(i,null),r&&(i={})}]}var T,o=[],c=0,S=0,s=0,k=!1,w=300;var n="0px";function f(){o.length=0,c=g(),e.left=e.left===n?window.innerWidth/2+"px":n,null!=h.mozPaintCount?s=h.mozPaintCount:i()}function i(){var t=+h.getComputedStyle(b,null).left.slice(0,-2);t&&o.push(t),S=requestAnimationFrame(i)}function d(){var t=g()-c,e=0;if(null!=h.mozPaintCount)e=h.mozPaintCount-s;else{cancelAnimationFrame(S);for(var n=0,r=-1,a=0;a<o.length;a++){var i=o[a];i==r?n++:r=i}e=o.length-n}k&&(T(Math.min(Math.round(1e3*e/t),60)),f())}function l(){b||((b=r.createElement("div")).id="FPSMeterHelper",(e=b.style).position="absolute",e.backgroundColor="transparent",e.width="1px",e.height="1px",e.left=n,e.bottom=n,e.transition="left "+w+"ms linear",b.addEventListener("transitionend",d,!1))}function C(){k&&(l(),r.body.appendChild(b),setTimeout(f,0))}E(l);var x={rate:300,scrollableName:function(t){return t===document?"page":null}};function m(s,f){var d;void 0===f&&(f=x);var a=!1,i=0,t=0,e=!1,l=[],o=0,m=0;function c(t){l.push(t)}function u(){e||(e=!0,t=i,setTimeout(n,f.rate))}function n(){e=!1,t===i?(a=!1,k&&(k=!1,cancelAnimationFrame(S),b&&r.body.removeChild(b)),v()):u()}function v(){var t=f.scrollableName?f.scrollableName(d):null,e=z("pk-fps"+(t?"-"+t:""),s,"fps"),n=e[0],r=e[1],a=l.length,i=Math.floor(a/2),o=0,c=60,u=0;(l=l.sort()).forEach(function(t){c=Math.min(c,t),u=Math.max(u,t),o+=t}),0<a&&(o/=a,n("latency",0,m,"ms"),n("min",0,c),n("max",0,u),n("avg",0,o),n("median",0,a%2?l[i]:(l[i-1]+l[i])/2),r(null,0,o),l.length=0)}function p(){m=g()-o}h.addEventListener("scroll",function(t){var e,n,r=t.target;a?d!==r&&(v(),o=g(),requestAnimationFrame(p)):(o=g(),a=!0,e=c,n=f.rate,T=e,n&&(w=n),k=!0,E(C),requestAnimationFrame(p)),d=r,i++,u()},!0)}var p={};function v(t,e){void 0===e&&(e=p);var n=z("pk-navigation",t),o=n[0],c=n[1];try{var r=y.timing,a=r.navigationStart,i=r.redirectStart,u=r.redirectEnd,s=r.fetchStart,f=r.domainLookupStart,d=r.domainLookupEnd,l=r.requestStart,m=r.responseStart,v=r.responseEnd;o("redirect",i,u),o("app-cache",s,f),o("dns",f,d),o("tcp",d,l),o("request",l,m),o("response",m,v),c("net",a,v,!0)}catch(e){}E(function t(){try{var e=y.timing,n=e.responseEnd,r=e.domInteractive,a=e.domContentLoadedEventEnd,i=e.domComplete;if(!i)return void setTimeout(t,250);o("interactive",n,r),o("content-loaded",r,a),o("complete",a,i),c("dom-ready",n,i,!0)}catch(t){}}),E(function t(){try{var e=y.timing,n=e.responseEnd,r=e.domComplete,a=e.loadEventEnd;if(!a)return void setTimeout(t,250);o("ready",n,r),o("load",r,a),c("dom-load",n,a)}catch(t){}})}var L={};function M(t,e){void 0===e&&(e=L);var n=z("pk-paint",t),a=n[0],i=n[1];E(function t(){try{var e=y.getEntriesByType("paint");if(1<e.length){var n=0,r=0;e.sort(function(t,e){return t.startTime-e.startTime}).forEach(function(t){r=t.startTime,n=Math.max(n,r),a(t.name,0,r)}),i(null,0,n,!0)}else setTimeout(t,250)}catch(t){}})}var O={minLatency:100,ttiDelay:2e3};function B(t,r){void 0===r&&(r=O);var n,a,i={},o=!1,e=z("pk-performance",t),c=e[0],u=e[1],s=["click","touchup","submit","abort","blur","contextmenu","deviceorientation","offline","online","paint","popstate","resize","wheel","scroll"];function f(){Object.keys(i).forEach(function(t){var e=i[t];e.values.forEach(function(t){c(t[0],t[1],t[2])}),u(t,e.start,e.end,!0)}),o=!(i={})}function d(t,e,n,r){void 0===n&&(n=0),void 0===r&&(r=g());var a=i[t]=i[t]||{start:0,end:0,values:[]};a.start=Math.min(a.start,n),a.end=Math.max(a.end,r),a.values.push([e,n,r]),!o&&setTimeout(f),o=!0}F(s,function(t){d("first-"+t,"value")}),F(["beforeunload"],function(){d("tab-unload","value")}),["click","touchup","input","submit","resize","scroll"].forEach(function(e){var n;function t(){var t=g();t-n>=r.minLatency&&d("latency-"+e,"value",n,t)}h.addEventListener(e,function(){n=g(),requestAnimationFrame(t)},!0)});try{(a=new PerformanceObserver(function(t){n=t.getEntries().pop()})).observe({entryTypes:["longtask"]})}catch(t){}E(function(){if(a){var t,e=function(){n?(t=n.startTime+n.duration,g()-t>=r.ttiDelay?(d("tti","value",0,t),a.disconnect()):setTimeout(e,r.ttiDelay)):t?(d("tti","value",0,t),a.disconnect()):(t=g(),setTimeout(e,500))};e()}F(s,function(t){d("first-"+t,"after-ready")})})}function F(t,r,a){t.forEach(function(e){var n=function(t){h.removeEventListener(e,n,!0),r(e,t)};(a=a||h).addEventListener(e,n,!0)})}var P=/^https?:\/\/(?:www\.)?(.*?)\.[a-z]+\//,j=6e4,q={};function A(t,e){void 0===e&&(e=q);var n=z("pk-resource-traffic",t,"KiB"),i=n[0],o=n[1],r=z("pk-resource-traffic-cached",t,"KiB"),c=r[0],u=r[1],a=z("pk-resource-stats",t,"KiB"),d=a[0],l=a[1],m=e.resourceName||function(t){var e=P.exec(t.name);return e?[t.initiatorType,e[1]]:null},v=e.resourceCategoryName,p=e.intervals||[["15sec",15e3],["1min",j],["5min",5*j],["15min",15*j],["30min",30*j],["1hour",60*j],["1day",1440*j],["2days",2880*j]];E(function(){var s={size:0,cached:0,cachedSize:0,transfered:0,transferedSize:0,unmeasurable:0,duration:0},n=[],r="start";function f(t,e,n){e&&(t?c:i)(e,0,n)}function a(){var t=y.getEntriesByType("resource");t&&0<t.length&&(n=n.concat(t)),y.clearResourceTimings()}try{!function t(){a(),n.forEach(function(t){var e=t.duration,n=t.transferSize,r=t.entryType,a=t.nextHopProtocol,i=t.initiatorType,o=n||t.encodedBodySize||t.decodedBodySize,c=!n;if("navigation"===i&&(i="html"),i&&0<o&&(f(c,a,o),f(c,r,o),f(c,i,o),"html"!==i)){var u=function(t,e,n){(0!==e||t!==a&&t!==r&&t!==i)&&f(c,n.slice(0,e+1),o)};m(t).forEach(u),v&&v(t).forEach(u)}s.size+=o,s.duration+=e,s[i]=(s[i]||0)+1,c?(s.cached++,s.cachedSize+=o):0<o?(s.transfered++,s.transferedSize+=o):s.unmeasurable++}),Object.keys(s).forEach(function(t){d(t,0,s[t],"duration"===t?"ms":/size/i.test(t)?"KiB":"raw")}),l(r,0,s.size),0<s.transfered&&o(r,0,s.transferedSize),0<s.cachedSize&&u(r,0,s.cachedSize),n.length=0;var e=p.shift();e&&(r=e[0],setTimeout(t,e[1]))}(),y.onresourcetimingbufferfull=function(){a()}}catch(t){}})}return t.set=function(r,t){function e(t,e,n){t(r,a({},Object(n),Object(e)))}e(m,t.fps,x),e(v,t.navigation,p),e(M,t.paint,L),e(B,t.performance,O),e(A,t.resource,q)},t}({});