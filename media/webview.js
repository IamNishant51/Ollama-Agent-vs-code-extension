"use strict";(()=>{var Ld=Object.create;var Mu=Object.defineProperty;var Md=Object.getOwnPropertyDescriptor;var Dd=Object.getOwnPropertyNames;var Id=Object.getPrototypeOf,Od=Object.prototype.hasOwnProperty;var Nt=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var jd=(e,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let l of Dd(t))!Od.call(e,l)&&l!==n&&Mu(e,l,{get:()=>t[l],enumerable:!(r=Md(t,l))||r.enumerable});return e};var Ql=(e,t,n)=>(n=e!=null?Ld(Id(e)):{},jd(t||!e||!e.__esModule?Mu(n,"default",{value:e,enumerable:!0}):n,e));var Vu=Nt(D=>{"use strict";var wn=Symbol.for("react.element"),Fd=Symbol.for("react.portal"),bd=Symbol.for("react.fragment"),Ad=Symbol.for("react.strict_mode"),Ud=Symbol.for("react.profiler"),Bd=Symbol.for("react.provider"),Rd=Symbol.for("react.context"),Hd=Symbol.for("react.forward_ref"),Vd=Symbol.for("react.suspense"),$d=Symbol.for("react.memo"),Wd=Symbol.for("react.lazy"),Du=Symbol.iterator;function Qd(e){return e===null||typeof e!="object"?null:(e=Du&&e[Du]||e["@@iterator"],typeof e=="function"?e:null)}var ju={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Fu=Object.assign,bu={};function Rt(e,t,n){this.props=e,this.context=t,this.refs=bu,this.updater=n||ju}Rt.prototype.isReactComponent={};Rt.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Rt.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Au(){}Au.prototype=Rt.prototype;function Yl(e,t,n){this.props=e,this.context=t,this.refs=bu,this.updater=n||ju}var Gl=Yl.prototype=new Au;Gl.constructor=Yl;Fu(Gl,Rt.prototype);Gl.isPureReactComponent=!0;var Iu=Array.isArray,Uu=Object.prototype.hasOwnProperty,Xl={current:null},Bu={key:!0,ref:!0,__self:!0,__source:!0};function Ru(e,t,n){var r,l={},o=null,i=null;if(t!=null)for(r in t.ref!==void 0&&(i=t.ref),t.key!==void 0&&(o=""+t.key),t)Uu.call(t,r)&&!Bu.hasOwnProperty(r)&&(l[r]=t[r]);var u=arguments.length-2;if(u===1)l.children=n;else if(1<u){for(var s=Array(u),c=0;c<u;c++)s[c]=arguments[c+2];l.children=s}if(e&&e.defaultProps)for(r in u=e.defaultProps,u)l[r]===void 0&&(l[r]=u[r]);return{$$typeof:wn,type:e,key:o,ref:i,props:l,_owner:Xl.current}}function Kd(e,t){return{$$typeof:wn,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function Zl(e){return typeof e=="object"&&e!==null&&e.$$typeof===wn}function Yd(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var Ou=/\/+/g;function Kl(e,t){return typeof e=="object"&&e!==null&&e.key!=null?Yd(""+e.key):t.toString(36)}function vr(e,t,n,r,l){var o=typeof e;(o==="undefined"||o==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(o){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case wn:case Fd:i=!0}}if(i)return i=e,l=l(i),e=r===""?"."+Kl(i,0):r,Iu(l)?(n="",e!=null&&(n=e.replace(Ou,"$&/")+"/"),vr(l,t,n,"",function(c){return c})):l!=null&&(Zl(l)&&(l=Kd(l,n+(!l.key||i&&i.key===l.key?"":(""+l.key).replace(Ou,"$&/")+"/")+e)),t.push(l)),1;if(i=0,r=r===""?".":r+":",Iu(e))for(var u=0;u<e.length;u++){o=e[u];var s=r+Kl(o,u);i+=vr(o,t,n,s,l)}else if(s=Qd(e),typeof s=="function")for(e=s.call(e),u=0;!(o=e.next()).done;)o=o.value,s=r+Kl(o,u++),i+=vr(o,t,n,s,l);else if(o==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return i}function hr(e,t,n){if(e==null)return e;var r=[],l=0;return vr(e,r,"","",function(o){return t.call(n,o,l++)}),r}function Gd(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var ce={current:null},yr={transition:null},Xd={ReactCurrentDispatcher:ce,ReactCurrentBatchConfig:yr,ReactCurrentOwner:Xl};function Hu(){throw Error("act(...) is not supported in production builds of React.")}D.Children={map:hr,forEach:function(e,t,n){hr(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return hr(e,function(){t++}),t},toArray:function(e){return hr(e,function(t){return t})||[]},only:function(e){if(!Zl(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};D.Component=Rt;D.Fragment=bd;D.Profiler=Ud;D.PureComponent=Yl;D.StrictMode=Ad;D.Suspense=Vd;D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Xd;D.act=Hu;D.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=Fu({},e.props),l=e.key,o=e.ref,i=e._owner;if(t!=null){if(t.ref!==void 0&&(o=t.ref,i=Xl.current),t.key!==void 0&&(l=""+t.key),e.type&&e.type.defaultProps)var u=e.type.defaultProps;for(s in t)Uu.call(t,s)&&!Bu.hasOwnProperty(s)&&(r[s]=t[s]===void 0&&u!==void 0?u[s]:t[s])}var s=arguments.length-2;if(s===1)r.children=n;else if(1<s){u=Array(s);for(var c=0;c<s;c++)u[c]=arguments[c+2];r.children=u}return{$$typeof:wn,type:e.type,key:l,ref:o,props:r,_owner:i}};D.createContext=function(e){return e={$$typeof:Rd,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Bd,_context:e},e.Consumer=e};D.createElement=Ru;D.createFactory=function(e){var t=Ru.bind(null,e);return t.type=e,t};D.createRef=function(){return{current:null}};D.forwardRef=function(e){return{$$typeof:Hd,render:e}};D.isValidElement=Zl;D.lazy=function(e){return{$$typeof:Wd,_payload:{_status:-1,_result:e},_init:Gd}};D.memo=function(e,t){return{$$typeof:$d,type:e,compare:t===void 0?null:t}};D.startTransition=function(e){var t=yr.transition;yr.transition={};try{e()}finally{yr.transition=t}};D.unstable_act=Hu;D.useCallback=function(e,t){return ce.current.useCallback(e,t)};D.useContext=function(e){return ce.current.useContext(e)};D.useDebugValue=function(){};D.useDeferredValue=function(e){return ce.current.useDeferredValue(e)};D.useEffect=function(e,t){return ce.current.useEffect(e,t)};D.useId=function(){return ce.current.useId()};D.useImperativeHandle=function(e,t,n){return ce.current.useImperativeHandle(e,t,n)};D.useInsertionEffect=function(e,t){return ce.current.useInsertionEffect(e,t)};D.useLayoutEffect=function(e,t){return ce.current.useLayoutEffect(e,t)};D.useMemo=function(e,t){return ce.current.useMemo(e,t)};D.useReducer=function(e,t,n){return ce.current.useReducer(e,t,n)};D.useRef=function(e){return ce.current.useRef(e)};D.useState=function(e){return ce.current.useState(e)};D.useSyncExternalStore=function(e,t,n){return ce.current.useSyncExternalStore(e,t,n)};D.useTransition=function(){return ce.current.useTransition()};D.version="18.3.1"});var xr=Nt((u0,$u)=>{"use strict";$u.exports=Vu()});var es=Nt(F=>{"use strict";function to(e,t){var n=e.length;e.push(t);e:for(;0<n;){var r=n-1>>>1,l=e[r];if(0<wr(l,t))e[r]=t,e[n]=l,n=r;else break e}}function Oe(e){return e.length===0?null:e[0]}function Sr(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;e:for(var r=0,l=e.length,o=l>>>1;r<o;){var i=2*(r+1)-1,u=e[i],s=i+1,c=e[s];if(0>wr(u,n))s<l&&0>wr(c,u)?(e[r]=c,e[s]=n,r=s):(e[r]=u,e[i]=n,r=i);else if(s<l&&0>wr(c,n))e[r]=c,e[s]=n,r=s;else break e}}return t}function wr(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}typeof performance=="object"&&typeof performance.now=="function"?(Wu=performance,F.unstable_now=function(){return Wu.now()}):(Jl=Date,Qu=Jl.now(),F.unstable_now=function(){return Jl.now()-Qu});var Wu,Jl,Qu,He=[],lt=[],Zd=1,_e=null,oe=3,Er=!1,_t=!1,Sn=!1,Gu=typeof setTimeout=="function"?setTimeout:null,Xu=typeof clearTimeout=="function"?clearTimeout:null,Ku=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function no(e){for(var t=Oe(lt);t!==null;){if(t.callback===null)Sr(lt);else if(t.startTime<=e)Sr(lt),t.sortIndex=t.expirationTime,to(He,t);else break;t=Oe(lt)}}function ro(e){if(Sn=!1,no(e),!_t)if(Oe(He)!==null)_t=!0,oo(lo);else{var t=Oe(lt);t!==null&&io(ro,t.startTime-e)}}function lo(e,t){_t=!1,Sn&&(Sn=!1,Xu(En),En=-1),Er=!0;var n=oe;try{for(no(t),_e=Oe(He);_e!==null&&(!(_e.expirationTime>t)||e&&!qu());){var r=_e.callback;if(typeof r=="function"){_e.callback=null,oe=_e.priorityLevel;var l=r(_e.expirationTime<=t);t=F.unstable_now(),typeof l=="function"?_e.callback=l:_e===Oe(He)&&Sr(He),no(t)}else Sr(He);_e=Oe(He)}if(_e!==null)var o=!0;else{var i=Oe(lt);i!==null&&io(ro,i.startTime-t),o=!1}return o}finally{_e=null,oe=n,Er=!1}}var Cr=!1,kr=null,En=-1,Zu=5,Ju=-1;function qu(){return!(F.unstable_now()-Ju<Zu)}function ql(){if(kr!==null){var e=F.unstable_now();Ju=e;var t=!0;try{t=kr(!0,e)}finally{t?kn():(Cr=!1,kr=null)}}else Cr=!1}var kn;typeof Ku=="function"?kn=function(){Ku(ql)}:typeof MessageChannel<"u"?(eo=new MessageChannel,Yu=eo.port2,eo.port1.onmessage=ql,kn=function(){Yu.postMessage(null)}):kn=function(){Gu(ql,0)};var eo,Yu;function oo(e){kr=e,Cr||(Cr=!0,kn())}function io(e,t){En=Gu(function(){e(F.unstable_now())},t)}F.unstable_IdlePriority=5;F.unstable_ImmediatePriority=1;F.unstable_LowPriority=4;F.unstable_NormalPriority=3;F.unstable_Profiling=null;F.unstable_UserBlockingPriority=2;F.unstable_cancelCallback=function(e){e.callback=null};F.unstable_continueExecution=function(){_t||Er||(_t=!0,oo(lo))};F.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Zu=0<e?Math.floor(1e3/e):5};F.unstable_getCurrentPriorityLevel=function(){return oe};F.unstable_getFirstCallbackNode=function(){return Oe(He)};F.unstable_next=function(e){switch(oe){case 1:case 2:case 3:var t=3;break;default:t=oe}var n=oe;oe=t;try{return e()}finally{oe=n}};F.unstable_pauseExecution=function(){};F.unstable_requestPaint=function(){};F.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=oe;oe=e;try{return t()}finally{oe=n}};F.unstable_scheduleCallback=function(e,t,n){var r=F.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?r+n:r):n=r,e){case 1:var l=-1;break;case 2:l=250;break;case 5:l=1073741823;break;case 4:l=1e4;break;default:l=5e3}return l=n+l,e={id:Zd++,callback:t,priorityLevel:e,startTime:n,expirationTime:l,sortIndex:-1},n>r?(e.sortIndex=n,to(lt,e),Oe(He)===null&&e===Oe(lt)&&(Sn?(Xu(En),En=-1):Sn=!0,io(ro,n-r))):(e.sortIndex=l,to(He,e),_t||Er||(_t=!0,oo(lo))),e};F.unstable_shouldYield=qu;F.unstable_wrapCallback=function(e){var t=oe;return function(){var n=oe;oe=t;try{return e.apply(this,arguments)}finally{oe=n}}}});var ns=Nt((a0,ts)=>{"use strict";ts.exports=es()});var id=Nt(Ne=>{"use strict";var Jd=xr(),Ee=ns();function x(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var aa=new Set,Wn={};function Ut(e,t){an(e,t),an(e+"Capture",t)}function an(e,t){for(Wn[e]=t,e=0;e<t.length;e++)aa.add(t[e])}var qe=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Lo=Object.prototype.hasOwnProperty,qd=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,rs={},ls={};function ef(e){return Lo.call(ls,e)?!0:Lo.call(rs,e)?!1:qd.test(e)?ls[e]=!0:(rs[e]=!0,!1)}function tf(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function nf(e,t,n,r){if(t===null||typeof t>"u"||tf(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function pe(e,t,n,r,l,o,i){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=l,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=o,this.removeEmptyString=i}var re={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){re[e]=new pe(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];re[t]=new pe(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){re[e]=new pe(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){re[e]=new pe(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){re[e]=new pe(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){re[e]=new pe(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){re[e]=new pe(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){re[e]=new pe(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){re[e]=new pe(e,5,!1,e.toLowerCase(),null,!1,!1)});var Si=/[\-:]([a-z])/g;function Ei(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Si,Ei);re[t]=new pe(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Si,Ei);re[t]=new pe(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Si,Ei);re[t]=new pe(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){re[e]=new pe(e,1,!1,e.toLowerCase(),null,!1,!1)});re.xlinkHref=new pe("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){re[e]=new pe(e,1,!1,e.toLowerCase(),null,!0,!0)});function Ci(e,t,n,r){var l=re.hasOwnProperty(t)?re[t]:null;(l!==null?l.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(nf(t,n,l,r)&&(n=null),r||l===null?ef(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):l.mustUseProperty?e[l.propertyName]=n===null?l.type===3?!1:"":n:(t=l.attributeName,r=l.attributeNamespace,n===null?e.removeAttribute(t):(l=l.type,n=l===3||l===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var rt=Jd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Nr=Symbol.for("react.element"),$t=Symbol.for("react.portal"),Wt=Symbol.for("react.fragment"),Ni=Symbol.for("react.strict_mode"),Mo=Symbol.for("react.profiler"),ca=Symbol.for("react.provider"),da=Symbol.for("react.context"),_i=Symbol.for("react.forward_ref"),Do=Symbol.for("react.suspense"),Io=Symbol.for("react.suspense_list"),zi=Symbol.for("react.memo"),it=Symbol.for("react.lazy");Symbol.for("react.scope");Symbol.for("react.debug_trace_mode");var fa=Symbol.for("react.offscreen");Symbol.for("react.legacy_hidden");Symbol.for("react.cache");Symbol.for("react.tracing_marker");var os=Symbol.iterator;function Cn(e){return e===null||typeof e!="object"?null:(e=os&&e[os]||e["@@iterator"],typeof e=="function"?e:null)}var W=Object.assign,uo;function Dn(e){if(uo===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);uo=t&&t[1]||""}return`
`+uo+e}var so=!1;function ao(e,t){if(!e||so)return"";so=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(c){var r=c}Reflect.construct(e,[],t)}else{try{t.call()}catch(c){r=c}e.call(t.prototype)}else{try{throw Error()}catch(c){r=c}e()}}catch(c){if(c&&r&&typeof c.stack=="string"){for(var l=c.stack.split(`
`),o=r.stack.split(`
`),i=l.length-1,u=o.length-1;1<=i&&0<=u&&l[i]!==o[u];)u--;for(;1<=i&&0<=u;i--,u--)if(l[i]!==o[u]){if(i!==1||u!==1)do if(i--,u--,0>u||l[i]!==o[u]){var s=`
`+l[i].replace(" at new "," at ");return e.displayName&&s.includes("<anonymous>")&&(s=s.replace("<anonymous>",e.displayName)),s}while(1<=i&&0<=u);break}}}finally{so=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?Dn(e):""}function rf(e){switch(e.tag){case 5:return Dn(e.type);case 16:return Dn("Lazy");case 13:return Dn("Suspense");case 19:return Dn("SuspenseList");case 0:case 2:case 15:return e=ao(e.type,!1),e;case 11:return e=ao(e.type.render,!1),e;case 1:return e=ao(e.type,!0),e;default:return""}}function Oo(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Wt:return"Fragment";case $t:return"Portal";case Mo:return"Profiler";case Ni:return"StrictMode";case Do:return"Suspense";case Io:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case da:return(e.displayName||"Context")+".Consumer";case ca:return(e._context.displayName||"Context")+".Provider";case _i:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case zi:return t=e.displayName||null,t!==null?t:Oo(e.type)||"Memo";case it:t=e._payload,e=e._init;try{return Oo(e(t))}catch{}}return null}function lf(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Oo(t);case 8:return t===Ni?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function wt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function pa(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function of(e){var t=pa(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var l=n.get,o=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return l.call(this)},set:function(i){r=""+i,o.call(this,i)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(i){r=""+i},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function _r(e){e._valueTracker||(e._valueTracker=of(e))}function ga(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=pa(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function el(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function jo(e,t){var n=t.checked;return W({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function is(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=wt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function ma(e,t){t=t.checked,t!=null&&Ci(e,"checked",t,!1)}function Fo(e,t){ma(e,t);var n=wt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?bo(e,t.type,n):t.hasOwnProperty("defaultValue")&&bo(e,t.type,wt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function us(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function bo(e,t,n){(t!=="number"||el(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var In=Array.isArray;function nn(e,t,n,r){if(e=e.options,t){t={};for(var l=0;l<n.length;l++)t["$"+n[l]]=!0;for(n=0;n<e.length;n++)l=t.hasOwnProperty("$"+e[n].value),e[n].selected!==l&&(e[n].selected=l),l&&r&&(e[n].defaultSelected=!0)}else{for(n=""+wt(n),t=null,l=0;l<e.length;l++){if(e[l].value===n){e[l].selected=!0,r&&(e[l].defaultSelected=!0);return}t!==null||e[l].disabled||(t=e[l])}t!==null&&(t.selected=!0)}}function Ao(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(x(91));return W({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function ss(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(x(92));if(In(n)){if(1<n.length)throw Error(x(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:wt(n)}}function ha(e,t){var n=wt(t.value),r=wt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function as(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function va(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Uo(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?va(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var zr,ya=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,l){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,l)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(zr=zr||document.createElement("div"),zr.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=zr.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Qn(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var Fn={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},uf=["Webkit","ms","Moz","O"];Object.keys(Fn).forEach(function(e){uf.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),Fn[t]=Fn[e]})});function xa(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||Fn.hasOwnProperty(e)&&Fn[e]?(""+t).trim():t+"px"}function wa(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,l=xa(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,l):e[n]=l}}var sf=W({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Bo(e,t){if(t){if(sf[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(x(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(x(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(x(61))}if(t.style!=null&&typeof t.style!="object")throw Error(x(62))}}function Ro(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ho=null;function Pi(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Vo=null,rn=null,ln=null;function cs(e){if(e=cr(e)){if(typeof Vo!="function")throw Error(x(280));var t=e.stateNode;t&&(t=Pl(t),Vo(e.stateNode,e.type,t))}}function ka(e){rn?ln?ln.push(e):ln=[e]:rn=e}function Sa(){if(rn){var e=rn,t=ln;if(ln=rn=null,cs(e),t)for(e=0;e<t.length;e++)cs(t[e])}}function Ea(e,t){return e(t)}function Ca(){}var co=!1;function Na(e,t,n){if(co)return e(t,n);co=!0;try{return Ea(e,t,n)}finally{co=!1,(rn!==null||ln!==null)&&(Ca(),Sa())}}function Kn(e,t){var n=e.stateNode;if(n===null)return null;var r=Pl(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(x(231,t,typeof n));return n}var $o=!1;if(qe)try{Ht={},Object.defineProperty(Ht,"passive",{get:function(){$o=!0}}),window.addEventListener("test",Ht,Ht),window.removeEventListener("test",Ht,Ht)}catch{$o=!1}var Ht;function af(e,t,n,r,l,o,i,u,s){var c=Array.prototype.slice.call(arguments,3);try{t.apply(n,c)}catch(m){this.onError(m)}}var bn=!1,tl=null,nl=!1,Wo=null,cf={onError:function(e){bn=!0,tl=e}};function df(e,t,n,r,l,o,i,u,s){bn=!1,tl=null,af.apply(cf,arguments)}function ff(e,t,n,r,l,o,i,u,s){if(df.apply(this,arguments),bn){if(bn){var c=tl;bn=!1,tl=null}else throw Error(x(198));nl||(nl=!0,Wo=c)}}function Bt(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function _a(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function ds(e){if(Bt(e)!==e)throw Error(x(188))}function pf(e){var t=e.alternate;if(!t){if(t=Bt(e),t===null)throw Error(x(188));return t!==e?null:e}for(var n=e,r=t;;){var l=n.return;if(l===null)break;var o=l.alternate;if(o===null){if(r=l.return,r!==null){n=r;continue}break}if(l.child===o.child){for(o=l.child;o;){if(o===n)return ds(l),e;if(o===r)return ds(l),t;o=o.sibling}throw Error(x(188))}if(n.return!==r.return)n=l,r=o;else{for(var i=!1,u=l.child;u;){if(u===n){i=!0,n=l,r=o;break}if(u===r){i=!0,r=l,n=o;break}u=u.sibling}if(!i){for(u=o.child;u;){if(u===n){i=!0,n=o,r=l;break}if(u===r){i=!0,r=o,n=l;break}u=u.sibling}if(!i)throw Error(x(189))}}if(n.alternate!==r)throw Error(x(190))}if(n.tag!==3)throw Error(x(188));return n.stateNode.current===n?e:t}function za(e){return e=pf(e),e!==null?Pa(e):null}function Pa(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Pa(e);if(t!==null)return t;e=e.sibling}return null}var Ta=Ee.unstable_scheduleCallback,fs=Ee.unstable_cancelCallback,gf=Ee.unstable_shouldYield,mf=Ee.unstable_requestPaint,K=Ee.unstable_now,hf=Ee.unstable_getCurrentPriorityLevel,Ti=Ee.unstable_ImmediatePriority,La=Ee.unstable_UserBlockingPriority,rl=Ee.unstable_NormalPriority,vf=Ee.unstable_LowPriority,Ma=Ee.unstable_IdlePriority,Cl=null,Qe=null;function yf(e){if(Qe&&typeof Qe.onCommitFiberRoot=="function")try{Qe.onCommitFiberRoot(Cl,e,void 0,(e.current.flags&128)===128)}catch{}}var Ue=Math.clz32?Math.clz32:kf,xf=Math.log,wf=Math.LN2;function kf(e){return e>>>=0,e===0?32:31-(xf(e)/wf|0)|0}var Pr=64,Tr=4194304;function On(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function ll(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,l=e.suspendedLanes,o=e.pingedLanes,i=n&268435455;if(i!==0){var u=i&~l;u!==0?r=On(u):(o&=i,o!==0&&(r=On(o)))}else i=n&~l,i!==0?r=On(i):o!==0&&(r=On(o));if(r===0)return 0;if(t!==0&&t!==r&&!(t&l)&&(l=r&-r,o=t&-t,l>=o||l===16&&(o&4194240)!==0))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-Ue(t),l=1<<n,r|=e[n],t&=~l;return r}function Sf(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Ef(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,l=e.expirationTimes,o=e.pendingLanes;0<o;){var i=31-Ue(o),u=1<<i,s=l[i];s===-1?(!(u&n)||u&r)&&(l[i]=Sf(u,t)):s<=t&&(e.expiredLanes|=u),o&=~u}}function Qo(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Da(){var e=Pr;return Pr<<=1,!(Pr&4194240)&&(Pr=64),e}function fo(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function sr(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-Ue(t),e[t]=n}function Cf(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var l=31-Ue(n),o=1<<l;t[l]=0,r[l]=-1,e[l]=-1,n&=~o}}function Li(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-Ue(n),l=1<<r;l&t|e[r]&t&&(e[r]|=t),n&=~l}}var j=0;function Ia(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var Oa,Mi,ja,Fa,ba,Ko=!1,Lr=[],ft=null,pt=null,gt=null,Yn=new Map,Gn=new Map,st=[],Nf="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function ps(e,t){switch(e){case"focusin":case"focusout":ft=null;break;case"dragenter":case"dragleave":pt=null;break;case"mouseover":case"mouseout":gt=null;break;case"pointerover":case"pointerout":Yn.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Gn.delete(t.pointerId)}}function Nn(e,t,n,r,l,o){return e===null||e.nativeEvent!==o?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:o,targetContainers:[l]},t!==null&&(t=cr(t),t!==null&&Mi(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,l!==null&&t.indexOf(l)===-1&&t.push(l),e)}function _f(e,t,n,r,l){switch(t){case"focusin":return ft=Nn(ft,e,t,n,r,l),!0;case"dragenter":return pt=Nn(pt,e,t,n,r,l),!0;case"mouseover":return gt=Nn(gt,e,t,n,r,l),!0;case"pointerover":var o=l.pointerId;return Yn.set(o,Nn(Yn.get(o)||null,e,t,n,r,l)),!0;case"gotpointercapture":return o=l.pointerId,Gn.set(o,Nn(Gn.get(o)||null,e,t,n,r,l)),!0}return!1}function Aa(e){var t=Tt(e.target);if(t!==null){var n=Bt(t);if(n!==null){if(t=n.tag,t===13){if(t=_a(n),t!==null){e.blockedOn=t,ba(e.priority,function(){ja(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function $r(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Yo(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Ho=r,n.target.dispatchEvent(r),Ho=null}else return t=cr(n),t!==null&&Mi(t),e.blockedOn=n,!1;t.shift()}return!0}function gs(e,t,n){$r(e)&&n.delete(t)}function zf(){Ko=!1,ft!==null&&$r(ft)&&(ft=null),pt!==null&&$r(pt)&&(pt=null),gt!==null&&$r(gt)&&(gt=null),Yn.forEach(gs),Gn.forEach(gs)}function _n(e,t){e.blockedOn===t&&(e.blockedOn=null,Ko||(Ko=!0,Ee.unstable_scheduleCallback(Ee.unstable_NormalPriority,zf)))}function Xn(e){function t(l){return _n(l,e)}if(0<Lr.length){_n(Lr[0],e);for(var n=1;n<Lr.length;n++){var r=Lr[n];r.blockedOn===e&&(r.blockedOn=null)}}for(ft!==null&&_n(ft,e),pt!==null&&_n(pt,e),gt!==null&&_n(gt,e),Yn.forEach(t),Gn.forEach(t),n=0;n<st.length;n++)r=st[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<st.length&&(n=st[0],n.blockedOn===null);)Aa(n),n.blockedOn===null&&st.shift()}var on=rt.ReactCurrentBatchConfig,ol=!0;function Pf(e,t,n,r){var l=j,o=on.transition;on.transition=null;try{j=1,Di(e,t,n,r)}finally{j=l,on.transition=o}}function Tf(e,t,n,r){var l=j,o=on.transition;on.transition=null;try{j=4,Di(e,t,n,r)}finally{j=l,on.transition=o}}function Di(e,t,n,r){if(ol){var l=Yo(e,t,n,r);if(l===null)xo(e,t,r,il,n),ps(e,r);else if(_f(l,e,t,n,r))r.stopPropagation();else if(ps(e,r),t&4&&-1<Nf.indexOf(e)){for(;l!==null;){var o=cr(l);if(o!==null&&Oa(o),o=Yo(e,t,n,r),o===null&&xo(e,t,r,il,n),o===l)break;l=o}l!==null&&r.stopPropagation()}else xo(e,t,r,null,n)}}var il=null;function Yo(e,t,n,r){if(il=null,e=Pi(r),e=Tt(e),e!==null)if(t=Bt(e),t===null)e=null;else if(n=t.tag,n===13){if(e=_a(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return il=e,null}function Ua(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(hf()){case Ti:return 1;case La:return 4;case rl:case vf:return 16;case Ma:return 536870912;default:return 16}default:return 16}}var ct=null,Ii=null,Wr=null;function Ba(){if(Wr)return Wr;var e,t=Ii,n=t.length,r,l="value"in ct?ct.value:ct.textContent,o=l.length;for(e=0;e<n&&t[e]===l[e];e++);var i=n-e;for(r=1;r<=i&&t[n-r]===l[o-r];r++);return Wr=l.slice(e,1<r?1-r:void 0)}function Qr(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Mr(){return!0}function ms(){return!1}function Ce(e){function t(n,r,l,o,i){this._reactName=n,this._targetInst=l,this.type=r,this.nativeEvent=o,this.target=i,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(n=e[u],this[u]=n?n(o):o[u]);return this.isDefaultPrevented=(o.defaultPrevented!=null?o.defaultPrevented:o.returnValue===!1)?Mr:ms,this.isPropagationStopped=ms,this}return W(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Mr)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Mr)},persist:function(){},isPersistent:Mr}),t}var hn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Oi=Ce(hn),ar=W({},hn,{view:0,detail:0}),Lf=Ce(ar),po,go,zn,Nl=W({},ar,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ji,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==zn&&(zn&&e.type==="mousemove"?(po=e.screenX-zn.screenX,go=e.screenY-zn.screenY):go=po=0,zn=e),po)},movementY:function(e){return"movementY"in e?e.movementY:go}}),hs=Ce(Nl),Mf=W({},Nl,{dataTransfer:0}),Df=Ce(Mf),If=W({},ar,{relatedTarget:0}),mo=Ce(If),Of=W({},hn,{animationName:0,elapsedTime:0,pseudoElement:0}),jf=Ce(Of),Ff=W({},hn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),bf=Ce(Ff),Af=W({},hn,{data:0}),vs=Ce(Af),Uf={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Bf={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Rf={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Hf(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Rf[e])?!!t[e]:!1}function ji(){return Hf}var Vf=W({},ar,{key:function(e){if(e.key){var t=Uf[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Qr(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Bf[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ji,charCode:function(e){return e.type==="keypress"?Qr(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Qr(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),$f=Ce(Vf),Wf=W({},Nl,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),ys=Ce(Wf),Qf=W({},ar,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ji}),Kf=Ce(Qf),Yf=W({},hn,{propertyName:0,elapsedTime:0,pseudoElement:0}),Gf=Ce(Yf),Xf=W({},Nl,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Zf=Ce(Xf),Jf=[9,13,27,32],Fi=qe&&"CompositionEvent"in window,An=null;qe&&"documentMode"in document&&(An=document.documentMode);var qf=qe&&"TextEvent"in window&&!An,Ra=qe&&(!Fi||An&&8<An&&11>=An),xs=" ",ws=!1;function Ha(e,t){switch(e){case"keyup":return Jf.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Va(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Qt=!1;function ep(e,t){switch(e){case"compositionend":return Va(t);case"keypress":return t.which!==32?null:(ws=!0,xs);case"textInput":return e=t.data,e===xs&&ws?null:e;default:return null}}function tp(e,t){if(Qt)return e==="compositionend"||!Fi&&Ha(e,t)?(e=Ba(),Wr=Ii=ct=null,Qt=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Ra&&t.locale!=="ko"?null:t.data;default:return null}}var np={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function ks(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!np[e.type]:t==="textarea"}function $a(e,t,n,r){ka(r),t=ul(t,"onChange"),0<t.length&&(n=new Oi("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var Un=null,Zn=null;function rp(e){tc(e,0)}function _l(e){var t=Gt(e);if(ga(t))return e}function lp(e,t){if(e==="change")return t}var Wa=!1;qe&&(qe?(Ir="oninput"in document,Ir||(ho=document.createElement("div"),ho.setAttribute("oninput","return;"),Ir=typeof ho.oninput=="function"),Dr=Ir):Dr=!1,Wa=Dr&&(!document.documentMode||9<document.documentMode));var Dr,Ir,ho;function Ss(){Un&&(Un.detachEvent("onpropertychange",Qa),Zn=Un=null)}function Qa(e){if(e.propertyName==="value"&&_l(Zn)){var t=[];$a(t,Zn,e,Pi(e)),Na(rp,t)}}function op(e,t,n){e==="focusin"?(Ss(),Un=t,Zn=n,Un.attachEvent("onpropertychange",Qa)):e==="focusout"&&Ss()}function ip(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return _l(Zn)}function up(e,t){if(e==="click")return _l(t)}function sp(e,t){if(e==="input"||e==="change")return _l(t)}function ap(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Re=typeof Object.is=="function"?Object.is:ap;function Jn(e,t){if(Re(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var l=n[r];if(!Lo.call(t,l)||!Re(e[l],t[l]))return!1}return!0}function Es(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Cs(e,t){var n=Es(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=Es(n)}}function Ka(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Ka(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Ya(){for(var e=window,t=el();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=el(e.document)}return t}function bi(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function cp(e){var t=Ya(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&Ka(n.ownerDocument.documentElement,n)){if(r!==null&&bi(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var l=n.textContent.length,o=Math.min(r.start,l);r=r.end===void 0?o:Math.min(r.end,l),!e.extend&&o>r&&(l=r,r=o,o=l),l=Cs(n,o);var i=Cs(n,r);l&&i&&(e.rangeCount!==1||e.anchorNode!==l.node||e.anchorOffset!==l.offset||e.focusNode!==i.node||e.focusOffset!==i.offset)&&(t=t.createRange(),t.setStart(l.node,l.offset),e.removeAllRanges(),o>r?(e.addRange(t),e.extend(i.node,i.offset)):(t.setEnd(i.node,i.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var dp=qe&&"documentMode"in document&&11>=document.documentMode,Kt=null,Go=null,Bn=null,Xo=!1;function Ns(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Xo||Kt==null||Kt!==el(r)||(r=Kt,"selectionStart"in r&&bi(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Bn&&Jn(Bn,r)||(Bn=r,r=ul(Go,"onSelect"),0<r.length&&(t=new Oi("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=Kt)))}function Or(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Yt={animationend:Or("Animation","AnimationEnd"),animationiteration:Or("Animation","AnimationIteration"),animationstart:Or("Animation","AnimationStart"),transitionend:Or("Transition","TransitionEnd")},vo={},Ga={};qe&&(Ga=document.createElement("div").style,"AnimationEvent"in window||(delete Yt.animationend.animation,delete Yt.animationiteration.animation,delete Yt.animationstart.animation),"TransitionEvent"in window||delete Yt.transitionend.transition);function zl(e){if(vo[e])return vo[e];if(!Yt[e])return e;var t=Yt[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in Ga)return vo[e]=t[n];return e}var Xa=zl("animationend"),Za=zl("animationiteration"),Ja=zl("animationstart"),qa=zl("transitionend"),ec=new Map,_s="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function St(e,t){ec.set(e,t),Ut(t,[e])}for(jr=0;jr<_s.length;jr++)Fr=_s[jr],zs=Fr.toLowerCase(),Ps=Fr[0].toUpperCase()+Fr.slice(1),St(zs,"on"+Ps);var Fr,zs,Ps,jr;St(Xa,"onAnimationEnd");St(Za,"onAnimationIteration");St(Ja,"onAnimationStart");St("dblclick","onDoubleClick");St("focusin","onFocus");St("focusout","onBlur");St(qa,"onTransitionEnd");an("onMouseEnter",["mouseout","mouseover"]);an("onMouseLeave",["mouseout","mouseover"]);an("onPointerEnter",["pointerout","pointerover"]);an("onPointerLeave",["pointerout","pointerover"]);Ut("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Ut("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Ut("onBeforeInput",["compositionend","keypress","textInput","paste"]);Ut("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Ut("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Ut("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var jn="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),fp=new Set("cancel close invalid load scroll toggle".split(" ").concat(jn));function Ts(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,ff(r,t,void 0,e),e.currentTarget=null}function tc(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],l=r.event;r=r.listeners;e:{var o=void 0;if(t)for(var i=r.length-1;0<=i;i--){var u=r[i],s=u.instance,c=u.currentTarget;if(u=u.listener,s!==o&&l.isPropagationStopped())break e;Ts(l,u,c),o=s}else for(i=0;i<r.length;i++){if(u=r[i],s=u.instance,c=u.currentTarget,u=u.listener,s!==o&&l.isPropagationStopped())break e;Ts(l,u,c),o=s}}}if(nl)throw e=Wo,nl=!1,Wo=null,e}function U(e,t){var n=t[ti];n===void 0&&(n=t[ti]=new Set);var r=e+"__bubble";n.has(r)||(nc(t,e,2,!1),n.add(r))}function yo(e,t,n){var r=0;t&&(r|=4),nc(n,e,r,t)}var br="_reactListening"+Math.random().toString(36).slice(2);function qn(e){if(!e[br]){e[br]=!0,aa.forEach(function(n){n!=="selectionchange"&&(fp.has(n)||yo(n,!1,e),yo(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[br]||(t[br]=!0,yo("selectionchange",!1,t))}}function nc(e,t,n,r){switch(Ua(t)){case 1:var l=Pf;break;case 4:l=Tf;break;default:l=Di}n=l.bind(null,t,n,e),l=void 0,!$o||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(l=!0),r?l!==void 0?e.addEventListener(t,n,{capture:!0,passive:l}):e.addEventListener(t,n,!0):l!==void 0?e.addEventListener(t,n,{passive:l}):e.addEventListener(t,n,!1)}function xo(e,t,n,r,l){var o=r;if(!(t&1)&&!(t&2)&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var u=r.stateNode.containerInfo;if(u===l||u.nodeType===8&&u.parentNode===l)break;if(i===4)for(i=r.return;i!==null;){var s=i.tag;if((s===3||s===4)&&(s=i.stateNode.containerInfo,s===l||s.nodeType===8&&s.parentNode===l))return;i=i.return}for(;u!==null;){if(i=Tt(u),i===null)return;if(s=i.tag,s===5||s===6){r=o=i;continue e}u=u.parentNode}}r=r.return}Na(function(){var c=o,m=Pi(n),h=[];e:{var g=ec.get(e);if(g!==void 0){var w=Oi,S=e;switch(e){case"keypress":if(Qr(n)===0)break e;case"keydown":case"keyup":w=$f;break;case"focusin":S="focus",w=mo;break;case"focusout":S="blur",w=mo;break;case"beforeblur":case"afterblur":w=mo;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":w=hs;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":w=Df;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":w=Kf;break;case Xa:case Za:case Ja:w=jf;break;case qa:w=Gf;break;case"scroll":w=Lf;break;case"wheel":w=Zf;break;case"copy":case"cut":case"paste":w=bf;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":w=ys}var C=(t&4)!==0,A=!C&&e==="scroll",d=C?g!==null?g+"Capture":null:g;C=[];for(var a=c,f;a!==null;){f=a;var v=f.stateNode;if(f.tag===5&&v!==null&&(f=v,d!==null&&(v=Kn(a,d),v!=null&&C.push(er(a,v,f)))),A)break;a=a.return}0<C.length&&(g=new w(g,S,null,n,m),h.push({event:g,listeners:C}))}}if(!(t&7)){e:{if(g=e==="mouseover"||e==="pointerover",w=e==="mouseout"||e==="pointerout",g&&n!==Ho&&(S=n.relatedTarget||n.fromElement)&&(Tt(S)||S[et]))break e;if((w||g)&&(g=m.window===m?m:(g=m.ownerDocument)?g.defaultView||g.parentWindow:window,w?(S=n.relatedTarget||n.toElement,w=c,S=S?Tt(S):null,S!==null&&(A=Bt(S),S!==A||S.tag!==5&&S.tag!==6)&&(S=null)):(w=null,S=c),w!==S)){if(C=hs,v="onMouseLeave",d="onMouseEnter",a="mouse",(e==="pointerout"||e==="pointerover")&&(C=ys,v="onPointerLeave",d="onPointerEnter",a="pointer"),A=w==null?g:Gt(w),f=S==null?g:Gt(S),g=new C(v,a+"leave",w,n,m),g.target=A,g.relatedTarget=f,v=null,Tt(m)===c&&(C=new C(d,a+"enter",S,n,m),C.target=f,C.relatedTarget=A,v=C),A=v,w&&S)t:{for(C=w,d=S,a=0,f=C;f;f=Vt(f))a++;for(f=0,v=d;v;v=Vt(v))f++;for(;0<a-f;)C=Vt(C),a--;for(;0<f-a;)d=Vt(d),f--;for(;a--;){if(C===d||d!==null&&C===d.alternate)break t;C=Vt(C),d=Vt(d)}C=null}else C=null;w!==null&&Ls(h,g,w,C,!1),S!==null&&A!==null&&Ls(h,A,S,C,!0)}}e:{if(g=c?Gt(c):window,w=g.nodeName&&g.nodeName.toLowerCase(),w==="select"||w==="input"&&g.type==="file")var E=lp;else if(ks(g))if(Wa)E=sp;else{E=ip;var P=op}else(w=g.nodeName)&&w.toLowerCase()==="input"&&(g.type==="checkbox"||g.type==="radio")&&(E=up);if(E&&(E=E(e,c))){$a(h,E,n,m);break e}P&&P(e,g,c),e==="focusout"&&(P=g._wrapperState)&&P.controlled&&g.type==="number"&&bo(g,"number",g.value)}switch(P=c?Gt(c):window,e){case"focusin":(ks(P)||P.contentEditable==="true")&&(Kt=P,Go=c,Bn=null);break;case"focusout":Bn=Go=Kt=null;break;case"mousedown":Xo=!0;break;case"contextmenu":case"mouseup":case"dragend":Xo=!1,Ns(h,n,m);break;case"selectionchange":if(dp)break;case"keydown":case"keyup":Ns(h,n,m)}var z;if(Fi)e:{switch(e){case"compositionstart":var L="onCompositionStart";break e;case"compositionend":L="onCompositionEnd";break e;case"compositionupdate":L="onCompositionUpdate";break e}L=void 0}else Qt?Ha(e,n)&&(L="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(L="onCompositionStart");L&&(Ra&&n.locale!=="ko"&&(Qt||L!=="onCompositionStart"?L==="onCompositionEnd"&&Qt&&(z=Ba()):(ct=m,Ii="value"in ct?ct.value:ct.textContent,Qt=!0)),P=ul(c,L),0<P.length&&(L=new vs(L,e,null,n,m),h.push({event:L,listeners:P}),z?L.data=z:(z=Va(n),z!==null&&(L.data=z)))),(z=qf?ep(e,n):tp(e,n))&&(c=ul(c,"onBeforeInput"),0<c.length&&(m=new vs("onBeforeInput","beforeinput",null,n,m),h.push({event:m,listeners:c}),m.data=z))}tc(h,t)})}function er(e,t,n){return{instance:e,listener:t,currentTarget:n}}function ul(e,t){for(var n=t+"Capture",r=[];e!==null;){var l=e,o=l.stateNode;l.tag===5&&o!==null&&(l=o,o=Kn(e,n),o!=null&&r.unshift(er(e,o,l)),o=Kn(e,t),o!=null&&r.push(er(e,o,l))),e=e.return}return r}function Vt(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function Ls(e,t,n,r,l){for(var o=t._reactName,i=[];n!==null&&n!==r;){var u=n,s=u.alternate,c=u.stateNode;if(s!==null&&s===r)break;u.tag===5&&c!==null&&(u=c,l?(s=Kn(n,o),s!=null&&i.unshift(er(n,s,u))):l||(s=Kn(n,o),s!=null&&i.push(er(n,s,u)))),n=n.return}i.length!==0&&e.push({event:t,listeners:i})}var pp=/\r\n?/g,gp=/\u0000|\uFFFD/g;function Ms(e){return(typeof e=="string"?e:""+e).replace(pp,`
`).replace(gp,"")}function Ar(e,t,n){if(t=Ms(t),Ms(e)!==t&&n)throw Error(x(425))}function sl(){}var Zo=null,Jo=null;function qo(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var ei=typeof setTimeout=="function"?setTimeout:void 0,mp=typeof clearTimeout=="function"?clearTimeout:void 0,Ds=typeof Promise=="function"?Promise:void 0,hp=typeof queueMicrotask=="function"?queueMicrotask:typeof Ds<"u"?function(e){return Ds.resolve(null).then(e).catch(vp)}:ei;function vp(e){setTimeout(function(){throw e})}function wo(e,t){var n=t,r=0;do{var l=n.nextSibling;if(e.removeChild(n),l&&l.nodeType===8)if(n=l.data,n==="/$"){if(r===0){e.removeChild(l),Xn(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=l}while(n);Xn(t)}function mt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function Is(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var vn=Math.random().toString(36).slice(2),We="__reactFiber$"+vn,tr="__reactProps$"+vn,et="__reactContainer$"+vn,ti="__reactEvents$"+vn,yp="__reactListeners$"+vn,xp="__reactHandles$"+vn;function Tt(e){var t=e[We];if(t)return t;for(var n=e.parentNode;n;){if(t=n[et]||n[We]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Is(e);e!==null;){if(n=e[We])return n;e=Is(e)}return t}e=n,n=e.parentNode}return null}function cr(e){return e=e[We]||e[et],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Gt(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(x(33))}function Pl(e){return e[tr]||null}var ni=[],Xt=-1;function Et(e){return{current:e}}function B(e){0>Xt||(e.current=ni[Xt],ni[Xt]=null,Xt--)}function b(e,t){Xt++,ni[Xt]=e.current,e.current=t}var kt={},ae=Et(kt),ve=Et(!1),Ot=kt;function cn(e,t){var n=e.type.contextTypes;if(!n)return kt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var l={},o;for(o in n)l[o]=t[o];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=l),l}function ye(e){return e=e.childContextTypes,e!=null}function al(){B(ve),B(ae)}function Os(e,t,n){if(ae.current!==kt)throw Error(x(168));b(ae,t),b(ve,n)}function rc(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var l in r)if(!(l in t))throw Error(x(108,lf(e)||"Unknown",l));return W({},n,r)}function cl(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||kt,Ot=ae.current,b(ae,e),b(ve,ve.current),!0}function js(e,t,n){var r=e.stateNode;if(!r)throw Error(x(169));n?(e=rc(e,t,Ot),r.__reactInternalMemoizedMergedChildContext=e,B(ve),B(ae),b(ae,e)):B(ve),b(ve,n)}var Ge=null,Tl=!1,ko=!1;function lc(e){Ge===null?Ge=[e]:Ge.push(e)}function wp(e){Tl=!0,lc(e)}function Ct(){if(!ko&&Ge!==null){ko=!0;var e=0,t=j;try{var n=Ge;for(j=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}Ge=null,Tl=!1}catch(l){throw Ge!==null&&(Ge=Ge.slice(e+1)),Ta(Ti,Ct),l}finally{j=t,ko=!1}}return null}var Zt=[],Jt=0,dl=null,fl=0,ze=[],Pe=0,jt=null,Xe=1,Ze="";function zt(e,t){Zt[Jt++]=fl,Zt[Jt++]=dl,dl=e,fl=t}function oc(e,t,n){ze[Pe++]=Xe,ze[Pe++]=Ze,ze[Pe++]=jt,jt=e;var r=Xe;e=Ze;var l=32-Ue(r)-1;r&=~(1<<l),n+=1;var o=32-Ue(t)+l;if(30<o){var i=l-l%5;o=(r&(1<<i)-1).toString(32),r>>=i,l-=i,Xe=1<<32-Ue(t)+l|n<<l|r,Ze=o+e}else Xe=1<<o|n<<l|r,Ze=e}function Ai(e){e.return!==null&&(zt(e,1),oc(e,1,0))}function Ui(e){for(;e===dl;)dl=Zt[--Jt],Zt[Jt]=null,fl=Zt[--Jt],Zt[Jt]=null;for(;e===jt;)jt=ze[--Pe],ze[Pe]=null,Ze=ze[--Pe],ze[Pe]=null,Xe=ze[--Pe],ze[Pe]=null}var Se=null,ke=null,R=!1,Ae=null;function ic(e,t){var n=Te(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function Fs(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,Se=e,ke=mt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,Se=e,ke=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=jt!==null?{id:Xe,overflow:Ze}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Te(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,Se=e,ke=null,!0):!1;default:return!1}}function ri(e){return(e.mode&1)!==0&&(e.flags&128)===0}function li(e){if(R){var t=ke;if(t){var n=t;if(!Fs(e,t)){if(ri(e))throw Error(x(418));t=mt(n.nextSibling);var r=Se;t&&Fs(e,t)?ic(r,n):(e.flags=e.flags&-4097|2,R=!1,Se=e)}}else{if(ri(e))throw Error(x(418));e.flags=e.flags&-4097|2,R=!1,Se=e}}}function bs(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Se=e}function Ur(e){if(e!==Se)return!1;if(!R)return bs(e),R=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!qo(e.type,e.memoizedProps)),t&&(t=ke)){if(ri(e))throw uc(),Error(x(418));for(;t;)ic(e,t),t=mt(t.nextSibling)}if(bs(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(x(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){ke=mt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}ke=null}}else ke=Se?mt(e.stateNode.nextSibling):null;return!0}function uc(){for(var e=ke;e;)e=mt(e.nextSibling)}function dn(){ke=Se=null,R=!1}function Bi(e){Ae===null?Ae=[e]:Ae.push(e)}var kp=rt.ReactCurrentBatchConfig;function Pn(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(x(309));var r=n.stateNode}if(!r)throw Error(x(147,e));var l=r,o=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===o?t.ref:(t=function(i){var u=l.refs;i===null?delete u[o]:u[o]=i},t._stringRef=o,t)}if(typeof e!="string")throw Error(x(284));if(!n._owner)throw Error(x(290,e))}return e}function Br(e,t){throw e=Object.prototype.toString.call(t),Error(x(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function As(e){var t=e._init;return t(e._payload)}function sc(e){function t(d,a){if(e){var f=d.deletions;f===null?(d.deletions=[a],d.flags|=16):f.push(a)}}function n(d,a){if(!e)return null;for(;a!==null;)t(d,a),a=a.sibling;return null}function r(d,a){for(d=new Map;a!==null;)a.key!==null?d.set(a.key,a):d.set(a.index,a),a=a.sibling;return d}function l(d,a){return d=xt(d,a),d.index=0,d.sibling=null,d}function o(d,a,f){return d.index=f,e?(f=d.alternate,f!==null?(f=f.index,f<a?(d.flags|=2,a):f):(d.flags|=2,a)):(d.flags|=1048576,a)}function i(d){return e&&d.alternate===null&&(d.flags|=2),d}function u(d,a,f,v){return a===null||a.tag!==6?(a=Po(f,d.mode,v),a.return=d,a):(a=l(a,f),a.return=d,a)}function s(d,a,f,v){var E=f.type;return E===Wt?m(d,a,f.props.children,v,f.key):a!==null&&(a.elementType===E||typeof E=="object"&&E!==null&&E.$$typeof===it&&As(E)===a.type)?(v=l(a,f.props),v.ref=Pn(d,a,f),v.return=d,v):(v=qr(f.type,f.key,f.props,null,d.mode,v),v.ref=Pn(d,a,f),v.return=d,v)}function c(d,a,f,v){return a===null||a.tag!==4||a.stateNode.containerInfo!==f.containerInfo||a.stateNode.implementation!==f.implementation?(a=To(f,d.mode,v),a.return=d,a):(a=l(a,f.children||[]),a.return=d,a)}function m(d,a,f,v,E){return a===null||a.tag!==7?(a=It(f,d.mode,v,E),a.return=d,a):(a=l(a,f),a.return=d,a)}function h(d,a,f){if(typeof a=="string"&&a!==""||typeof a=="number")return a=Po(""+a,d.mode,f),a.return=d,a;if(typeof a=="object"&&a!==null){switch(a.$$typeof){case Nr:return f=qr(a.type,a.key,a.props,null,d.mode,f),f.ref=Pn(d,null,a),f.return=d,f;case $t:return a=To(a,d.mode,f),a.return=d,a;case it:var v=a._init;return h(d,v(a._payload),f)}if(In(a)||Cn(a))return a=It(a,d.mode,f,null),a.return=d,a;Br(d,a)}return null}function g(d,a,f,v){var E=a!==null?a.key:null;if(typeof f=="string"&&f!==""||typeof f=="number")return E!==null?null:u(d,a,""+f,v);if(typeof f=="object"&&f!==null){switch(f.$$typeof){case Nr:return f.key===E?s(d,a,f,v):null;case $t:return f.key===E?c(d,a,f,v):null;case it:return E=f._init,g(d,a,E(f._payload),v)}if(In(f)||Cn(f))return E!==null?null:m(d,a,f,v,null);Br(d,f)}return null}function w(d,a,f,v,E){if(typeof v=="string"&&v!==""||typeof v=="number")return d=d.get(f)||null,u(a,d,""+v,E);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Nr:return d=d.get(v.key===null?f:v.key)||null,s(a,d,v,E);case $t:return d=d.get(v.key===null?f:v.key)||null,c(a,d,v,E);case it:var P=v._init;return w(d,a,f,P(v._payload),E)}if(In(v)||Cn(v))return d=d.get(f)||null,m(a,d,v,E,null);Br(a,v)}return null}function S(d,a,f,v){for(var E=null,P=null,z=a,L=a=0,Y=null;z!==null&&L<f.length;L++){z.index>L?(Y=z,z=null):Y=z.sibling;var M=g(d,z,f[L],v);if(M===null){z===null&&(z=Y);break}e&&z&&M.alternate===null&&t(d,z),a=o(M,a,L),P===null?E=M:P.sibling=M,P=M,z=Y}if(L===f.length)return n(d,z),R&&zt(d,L),E;if(z===null){for(;L<f.length;L++)z=h(d,f[L],v),z!==null&&(a=o(z,a,L),P===null?E=z:P.sibling=z,P=z);return R&&zt(d,L),E}for(z=r(d,z);L<f.length;L++)Y=w(z,d,L,f[L],v),Y!==null&&(e&&Y.alternate!==null&&z.delete(Y.key===null?L:Y.key),a=o(Y,a,L),P===null?E=Y:P.sibling=Y,P=Y);return e&&z.forEach(function(Ie){return t(d,Ie)}),R&&zt(d,L),E}function C(d,a,f,v){var E=Cn(f);if(typeof E!="function")throw Error(x(150));if(f=E.call(f),f==null)throw Error(x(151));for(var P=E=null,z=a,L=a=0,Y=null,M=f.next();z!==null&&!M.done;L++,M=f.next()){z.index>L?(Y=z,z=null):Y=z.sibling;var Ie=g(d,z,M.value,v);if(Ie===null){z===null&&(z=Y);break}e&&z&&Ie.alternate===null&&t(d,z),a=o(Ie,a,L),P===null?E=Ie:P.sibling=Ie,P=Ie,z=Y}if(M.done)return n(d,z),R&&zt(d,L),E;if(z===null){for(;!M.done;L++,M=f.next())M=h(d,M.value,v),M!==null&&(a=o(M,a,L),P===null?E=M:P.sibling=M,P=M);return R&&zt(d,L),E}for(z=r(d,z);!M.done;L++,M=f.next())M=w(z,d,L,M.value,v),M!==null&&(e&&M.alternate!==null&&z.delete(M.key===null?L:M.key),a=o(M,a,L),P===null?E=M:P.sibling=M,P=M);return e&&z.forEach(function(Ul){return t(d,Ul)}),R&&zt(d,L),E}function A(d,a,f,v){if(typeof f=="object"&&f!==null&&f.type===Wt&&f.key===null&&(f=f.props.children),typeof f=="object"&&f!==null){switch(f.$$typeof){case Nr:e:{for(var E=f.key,P=a;P!==null;){if(P.key===E){if(E=f.type,E===Wt){if(P.tag===7){n(d,P.sibling),a=l(P,f.props.children),a.return=d,d=a;break e}}else if(P.elementType===E||typeof E=="object"&&E!==null&&E.$$typeof===it&&As(E)===P.type){n(d,P.sibling),a=l(P,f.props),a.ref=Pn(d,P,f),a.return=d,d=a;break e}n(d,P);break}else t(d,P);P=P.sibling}f.type===Wt?(a=It(f.props.children,d.mode,v,f.key),a.return=d,d=a):(v=qr(f.type,f.key,f.props,null,d.mode,v),v.ref=Pn(d,a,f),v.return=d,d=v)}return i(d);case $t:e:{for(P=f.key;a!==null;){if(a.key===P)if(a.tag===4&&a.stateNode.containerInfo===f.containerInfo&&a.stateNode.implementation===f.implementation){n(d,a.sibling),a=l(a,f.children||[]),a.return=d,d=a;break e}else{n(d,a);break}else t(d,a);a=a.sibling}a=To(f,d.mode,v),a.return=d,d=a}return i(d);case it:return P=f._init,A(d,a,P(f._payload),v)}if(In(f))return S(d,a,f,v);if(Cn(f))return C(d,a,f,v);Br(d,f)}return typeof f=="string"&&f!==""||typeof f=="number"?(f=""+f,a!==null&&a.tag===6?(n(d,a.sibling),a=l(a,f),a.return=d,d=a):(n(d,a),a=Po(f,d.mode,v),a.return=d,d=a),i(d)):n(d,a)}return A}var fn=sc(!0),ac=sc(!1),pl=Et(null),gl=null,qt=null,Ri=null;function Hi(){Ri=qt=gl=null}function Vi(e){var t=pl.current;B(pl),e._currentValue=t}function oi(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function un(e,t){gl=e,Ri=qt=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(he=!0),e.firstContext=null)}function Me(e){var t=e._currentValue;if(Ri!==e)if(e={context:e,memoizedValue:t,next:null},qt===null){if(gl===null)throw Error(x(308));qt=e,gl.dependencies={lanes:0,firstContext:e}}else qt=qt.next=e;return t}var Lt=null;function $i(e){Lt===null?Lt=[e]:Lt.push(e)}function cc(e,t,n,r){var l=t.interleaved;return l===null?(n.next=n,$i(t)):(n.next=l.next,l.next=n),t.interleaved=n,tt(e,r)}function tt(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var ut=!1;function Wi(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function dc(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Je(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function ht(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,O&2){var l=r.pending;return l===null?t.next=t:(t.next=l.next,l.next=t),r.pending=t,tt(e,n)}return l=r.interleaved,l===null?(t.next=t,$i(r)):(t.next=l.next,l.next=t),r.interleaved=t,tt(e,n)}function Kr(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Li(e,n)}}function Us(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var l=null,o=null;if(n=n.firstBaseUpdate,n!==null){do{var i={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};o===null?l=o=i:o=o.next=i,n=n.next}while(n!==null);o===null?l=o=t:o=o.next=t}else l=o=t;n={baseState:r.baseState,firstBaseUpdate:l,lastBaseUpdate:o,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function ml(e,t,n,r){var l=e.updateQueue;ut=!1;var o=l.firstBaseUpdate,i=l.lastBaseUpdate,u=l.shared.pending;if(u!==null){l.shared.pending=null;var s=u,c=s.next;s.next=null,i===null?o=c:i.next=c,i=s;var m=e.alternate;m!==null&&(m=m.updateQueue,u=m.lastBaseUpdate,u!==i&&(u===null?m.firstBaseUpdate=c:u.next=c,m.lastBaseUpdate=s))}if(o!==null){var h=l.baseState;i=0,m=c=s=null,u=o;do{var g=u.lane,w=u.eventTime;if((r&g)===g){m!==null&&(m=m.next={eventTime:w,lane:0,tag:u.tag,payload:u.payload,callback:u.callback,next:null});e:{var S=e,C=u;switch(g=t,w=n,C.tag){case 1:if(S=C.payload,typeof S=="function"){h=S.call(w,h,g);break e}h=S;break e;case 3:S.flags=S.flags&-65537|128;case 0:if(S=C.payload,g=typeof S=="function"?S.call(w,h,g):S,g==null)break e;h=W({},h,g);break e;case 2:ut=!0}}u.callback!==null&&u.lane!==0&&(e.flags|=64,g=l.effects,g===null?l.effects=[u]:g.push(u))}else w={eventTime:w,lane:g,tag:u.tag,payload:u.payload,callback:u.callback,next:null},m===null?(c=m=w,s=h):m=m.next=w,i|=g;if(u=u.next,u===null){if(u=l.shared.pending,u===null)break;g=u,u=g.next,g.next=null,l.lastBaseUpdate=g,l.shared.pending=null}}while(!0);if(m===null&&(s=h),l.baseState=s,l.firstBaseUpdate=c,l.lastBaseUpdate=m,t=l.shared.interleaved,t!==null){l=t;do i|=l.lane,l=l.next;while(l!==t)}else o===null&&(l.shared.lanes=0);bt|=i,e.lanes=i,e.memoizedState=h}}function Bs(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],l=r.callback;if(l!==null){if(r.callback=null,r=n,typeof l!="function")throw Error(x(191,l));l.call(r)}}}var dr={},Ke=Et(dr),nr=Et(dr),rr=Et(dr);function Mt(e){if(e===dr)throw Error(x(174));return e}function Qi(e,t){switch(b(rr,t),b(nr,e),b(Ke,dr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Uo(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Uo(t,e)}B(Ke),b(Ke,t)}function pn(){B(Ke),B(nr),B(rr)}function fc(e){Mt(rr.current);var t=Mt(Ke.current),n=Uo(t,e.type);t!==n&&(b(nr,e),b(Ke,n))}function Ki(e){nr.current===e&&(B(Ke),B(nr))}var V=Et(0);function hl(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var So=[];function Yi(){for(var e=0;e<So.length;e++)So[e]._workInProgressVersionPrimary=null;So.length=0}var Yr=rt.ReactCurrentDispatcher,Eo=rt.ReactCurrentBatchConfig,Ft=0,$=null,Z=null,q=null,vl=!1,Rn=!1,lr=0,Sp=0;function ie(){throw Error(x(321))}function Gi(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!Re(e[n],t[n]))return!1;return!0}function Xi(e,t,n,r,l,o){if(Ft=o,$=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Yr.current=e===null||e.memoizedState===null?_p:zp,e=n(r,l),Rn){o=0;do{if(Rn=!1,lr=0,25<=o)throw Error(x(301));o+=1,q=Z=null,t.updateQueue=null,Yr.current=Pp,e=n(r,l)}while(Rn)}if(Yr.current=yl,t=Z!==null&&Z.next!==null,Ft=0,q=Z=$=null,vl=!1,t)throw Error(x(300));return e}function Zi(){var e=lr!==0;return lr=0,e}function $e(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return q===null?$.memoizedState=q=e:q=q.next=e,q}function De(){if(Z===null){var e=$.alternate;e=e!==null?e.memoizedState:null}else e=Z.next;var t=q===null?$.memoizedState:q.next;if(t!==null)q=t,Z=e;else{if(e===null)throw Error(x(310));Z=e,e={memoizedState:Z.memoizedState,baseState:Z.baseState,baseQueue:Z.baseQueue,queue:Z.queue,next:null},q===null?$.memoizedState=q=e:q=q.next=e}return q}function or(e,t){return typeof t=="function"?t(e):t}function Co(e){var t=De(),n=t.queue;if(n===null)throw Error(x(311));n.lastRenderedReducer=e;var r=Z,l=r.baseQueue,o=n.pending;if(o!==null){if(l!==null){var i=l.next;l.next=o.next,o.next=i}r.baseQueue=l=o,n.pending=null}if(l!==null){o=l.next,r=r.baseState;var u=i=null,s=null,c=o;do{var m=c.lane;if((Ft&m)===m)s!==null&&(s=s.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:e(r,c.action);else{var h={lane:m,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};s===null?(u=s=h,i=r):s=s.next=h,$.lanes|=m,bt|=m}c=c.next}while(c!==null&&c!==o);s===null?i=r:s.next=u,Re(r,t.memoizedState)||(he=!0),t.memoizedState=r,t.baseState=i,t.baseQueue=s,n.lastRenderedState=r}if(e=n.interleaved,e!==null){l=e;do o=l.lane,$.lanes|=o,bt|=o,l=l.next;while(l!==e)}else l===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function No(e){var t=De(),n=t.queue;if(n===null)throw Error(x(311));n.lastRenderedReducer=e;var r=n.dispatch,l=n.pending,o=t.memoizedState;if(l!==null){n.pending=null;var i=l=l.next;do o=e(o,i.action),i=i.next;while(i!==l);Re(o,t.memoizedState)||(he=!0),t.memoizedState=o,t.baseQueue===null&&(t.baseState=o),n.lastRenderedState=o}return[o,r]}function pc(){}function gc(e,t){var n=$,r=De(),l=t(),o=!Re(r.memoizedState,l);if(o&&(r.memoizedState=l,he=!0),r=r.queue,Ji(vc.bind(null,n,r,e),[e]),r.getSnapshot!==t||o||q!==null&&q.memoizedState.tag&1){if(n.flags|=2048,ir(9,hc.bind(null,n,r,l,t),void 0,null),ee===null)throw Error(x(349));Ft&30||mc(n,t,l)}return l}function mc(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=$.updateQueue,t===null?(t={lastEffect:null,stores:null},$.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function hc(e,t,n,r){t.value=n,t.getSnapshot=r,yc(t)&&xc(e)}function vc(e,t,n){return n(function(){yc(t)&&xc(e)})}function yc(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!Re(e,n)}catch{return!0}}function xc(e){var t=tt(e,1);t!==null&&Be(t,e,1,-1)}function Rs(e){var t=$e();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:or,lastRenderedState:e},t.queue=e,e=e.dispatch=Np.bind(null,$,e),[t.memoizedState,e]}function ir(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=$.updateQueue,t===null?(t={lastEffect:null,stores:null},$.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function wc(){return De().memoizedState}function Gr(e,t,n,r){var l=$e();$.flags|=e,l.memoizedState=ir(1|t,n,void 0,r===void 0?null:r)}function Ll(e,t,n,r){var l=De();r=r===void 0?null:r;var o=void 0;if(Z!==null){var i=Z.memoizedState;if(o=i.destroy,r!==null&&Gi(r,i.deps)){l.memoizedState=ir(t,n,o,r);return}}$.flags|=e,l.memoizedState=ir(1|t,n,o,r)}function Hs(e,t){return Gr(8390656,8,e,t)}function Ji(e,t){return Ll(2048,8,e,t)}function kc(e,t){return Ll(4,2,e,t)}function Sc(e,t){return Ll(4,4,e,t)}function Ec(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Cc(e,t,n){return n=n!=null?n.concat([e]):null,Ll(4,4,Ec.bind(null,t,e),n)}function qi(){}function Nc(e,t){var n=De();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&Gi(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function _c(e,t){var n=De();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&Gi(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function zc(e,t,n){return Ft&21?(Re(n,t)||(n=Da(),$.lanes|=n,bt|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,he=!0),e.memoizedState=n)}function Ep(e,t){var n=j;j=n!==0&&4>n?n:4,e(!0);var r=Eo.transition;Eo.transition={};try{e(!1),t()}finally{j=n,Eo.transition=r}}function Pc(){return De().memoizedState}function Cp(e,t,n){var r=yt(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Tc(e))Lc(t,n);else if(n=cc(e,t,n,r),n!==null){var l=fe();Be(n,e,r,l),Mc(n,t,r)}}function Np(e,t,n){var r=yt(e),l={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Tc(e))Lc(t,l);else{var o=e.alternate;if(e.lanes===0&&(o===null||o.lanes===0)&&(o=t.lastRenderedReducer,o!==null))try{var i=t.lastRenderedState,u=o(i,n);if(l.hasEagerState=!0,l.eagerState=u,Re(u,i)){var s=t.interleaved;s===null?(l.next=l,$i(t)):(l.next=s.next,s.next=l),t.interleaved=l;return}}catch{}finally{}n=cc(e,t,l,r),n!==null&&(l=fe(),Be(n,e,r,l),Mc(n,t,r))}}function Tc(e){var t=e.alternate;return e===$||t!==null&&t===$}function Lc(e,t){Rn=vl=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Mc(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Li(e,n)}}var yl={readContext:Me,useCallback:ie,useContext:ie,useEffect:ie,useImperativeHandle:ie,useInsertionEffect:ie,useLayoutEffect:ie,useMemo:ie,useReducer:ie,useRef:ie,useState:ie,useDebugValue:ie,useDeferredValue:ie,useTransition:ie,useMutableSource:ie,useSyncExternalStore:ie,useId:ie,unstable_isNewReconciler:!1},_p={readContext:Me,useCallback:function(e,t){return $e().memoizedState=[e,t===void 0?null:t],e},useContext:Me,useEffect:Hs,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Gr(4194308,4,Ec.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Gr(4194308,4,e,t)},useInsertionEffect:function(e,t){return Gr(4,2,e,t)},useMemo:function(e,t){var n=$e();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=$e();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=Cp.bind(null,$,e),[r.memoizedState,e]},useRef:function(e){var t=$e();return e={current:e},t.memoizedState=e},useState:Rs,useDebugValue:qi,useDeferredValue:function(e){return $e().memoizedState=e},useTransition:function(){var e=Rs(!1),t=e[0];return e=Ep.bind(null,e[1]),$e().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=$,l=$e();if(R){if(n===void 0)throw Error(x(407));n=n()}else{if(n=t(),ee===null)throw Error(x(349));Ft&30||mc(r,t,n)}l.memoizedState=n;var o={value:n,getSnapshot:t};return l.queue=o,Hs(vc.bind(null,r,o,e),[e]),r.flags|=2048,ir(9,hc.bind(null,r,o,n,t),void 0,null),n},useId:function(){var e=$e(),t=ee.identifierPrefix;if(R){var n=Ze,r=Xe;n=(r&~(1<<32-Ue(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=lr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=Sp++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},zp={readContext:Me,useCallback:Nc,useContext:Me,useEffect:Ji,useImperativeHandle:Cc,useInsertionEffect:kc,useLayoutEffect:Sc,useMemo:_c,useReducer:Co,useRef:wc,useState:function(){return Co(or)},useDebugValue:qi,useDeferredValue:function(e){var t=De();return zc(t,Z.memoizedState,e)},useTransition:function(){var e=Co(or)[0],t=De().memoizedState;return[e,t]},useMutableSource:pc,useSyncExternalStore:gc,useId:Pc,unstable_isNewReconciler:!1},Pp={readContext:Me,useCallback:Nc,useContext:Me,useEffect:Ji,useImperativeHandle:Cc,useInsertionEffect:kc,useLayoutEffect:Sc,useMemo:_c,useReducer:No,useRef:wc,useState:function(){return No(or)},useDebugValue:qi,useDeferredValue:function(e){var t=De();return Z===null?t.memoizedState=e:zc(t,Z.memoizedState,e)},useTransition:function(){var e=No(or)[0],t=De().memoizedState;return[e,t]},useMutableSource:pc,useSyncExternalStore:gc,useId:Pc,unstable_isNewReconciler:!1};function Fe(e,t){if(e&&e.defaultProps){t=W({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function ii(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:W({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Ml={isMounted:function(e){return(e=e._reactInternals)?Bt(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=fe(),l=yt(e),o=Je(r,l);o.payload=t,n!=null&&(o.callback=n),t=ht(e,o,l),t!==null&&(Be(t,e,l,r),Kr(t,e,l))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=fe(),l=yt(e),o=Je(r,l);o.tag=1,o.payload=t,n!=null&&(o.callback=n),t=ht(e,o,l),t!==null&&(Be(t,e,l,r),Kr(t,e,l))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=fe(),r=yt(e),l=Je(n,r);l.tag=2,t!=null&&(l.callback=t),t=ht(e,l,r),t!==null&&(Be(t,e,r,n),Kr(t,e,r))}};function Vs(e,t,n,r,l,o,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,o,i):t.prototype&&t.prototype.isPureReactComponent?!Jn(n,r)||!Jn(l,o):!0}function Dc(e,t,n){var r=!1,l=kt,o=t.contextType;return typeof o=="object"&&o!==null?o=Me(o):(l=ye(t)?Ot:ae.current,r=t.contextTypes,o=(r=r!=null)?cn(e,l):kt),t=new t(n,o),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=Ml,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=l,e.__reactInternalMemoizedMaskedChildContext=o),t}function $s(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&Ml.enqueueReplaceState(t,t.state,null)}function ui(e,t,n,r){var l=e.stateNode;l.props=n,l.state=e.memoizedState,l.refs={},Wi(e);var o=t.contextType;typeof o=="object"&&o!==null?l.context=Me(o):(o=ye(t)?Ot:ae.current,l.context=cn(e,o)),l.state=e.memoizedState,o=t.getDerivedStateFromProps,typeof o=="function"&&(ii(e,t,o,n),l.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(t=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),t!==l.state&&Ml.enqueueReplaceState(l,l.state,null),ml(e,n,l,r),l.state=e.memoizedState),typeof l.componentDidMount=="function"&&(e.flags|=4194308)}function gn(e,t){try{var n="",r=t;do n+=rf(r),r=r.return;while(r);var l=n}catch(o){l=`
Error generating stack: `+o.message+`
`+o.stack}return{value:e,source:t,stack:l,digest:null}}function _o(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function si(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var Tp=typeof WeakMap=="function"?WeakMap:Map;function Ic(e,t,n){n=Je(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){wl||(wl=!0,yi=r),si(e,t)},n}function Oc(e,t,n){n=Je(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var l=t.value;n.payload=function(){return r(l)},n.callback=function(){si(e,t)}}var o=e.stateNode;return o!==null&&typeof o.componentDidCatch=="function"&&(n.callback=function(){si(e,t),typeof r!="function"&&(vt===null?vt=new Set([this]):vt.add(this));var i=t.stack;this.componentDidCatch(t.value,{componentStack:i!==null?i:""})}),n}function Ws(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new Tp;var l=new Set;r.set(t,l)}else l=r.get(t),l===void 0&&(l=new Set,r.set(t,l));l.has(n)||(l.add(n),e=Vp.bind(null,e,t,n),t.then(e,e))}function Qs(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Ks(e,t,n,r,l){return e.mode&1?(e.flags|=65536,e.lanes=l,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=Je(-1,1),t.tag=2,ht(n,t,1))),n.lanes|=1),e)}var Lp=rt.ReactCurrentOwner,he=!1;function de(e,t,n,r){t.child=e===null?ac(t,null,n,r):fn(t,e.child,n,r)}function Ys(e,t,n,r,l){n=n.render;var o=t.ref;return un(t,l),r=Xi(e,t,n,r,o,l),n=Zi(),e!==null&&!he?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,nt(e,t,l)):(R&&n&&Ai(t),t.flags|=1,de(e,t,r,l),t.child)}function Gs(e,t,n,r,l){if(e===null){var o=n.type;return typeof o=="function"&&!uu(o)&&o.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=o,jc(e,t,o,r,l)):(e=qr(n.type,null,r,t,t.mode,l),e.ref=t.ref,e.return=t,t.child=e)}if(o=e.child,!(e.lanes&l)){var i=o.memoizedProps;if(n=n.compare,n=n!==null?n:Jn,n(i,r)&&e.ref===t.ref)return nt(e,t,l)}return t.flags|=1,e=xt(o,r),e.ref=t.ref,e.return=t,t.child=e}function jc(e,t,n,r,l){if(e!==null){var o=e.memoizedProps;if(Jn(o,r)&&e.ref===t.ref)if(he=!1,t.pendingProps=r=o,(e.lanes&l)!==0)e.flags&131072&&(he=!0);else return t.lanes=e.lanes,nt(e,t,l)}return ai(e,t,n,r,l)}function Fc(e,t,n){var r=t.pendingProps,l=r.children,o=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},b(tn,we),we|=n;else{if(!(n&1073741824))return e=o!==null?o.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,b(tn,we),we|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=o!==null?o.baseLanes:n,b(tn,we),we|=r}else o!==null?(r=o.baseLanes|n,t.memoizedState=null):r=n,b(tn,we),we|=r;return de(e,t,l,n),t.child}function bc(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function ai(e,t,n,r,l){var o=ye(n)?Ot:ae.current;return o=cn(t,o),un(t,l),n=Xi(e,t,n,r,o,l),r=Zi(),e!==null&&!he?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~l,nt(e,t,l)):(R&&r&&Ai(t),t.flags|=1,de(e,t,n,l),t.child)}function Xs(e,t,n,r,l){if(ye(n)){var o=!0;cl(t)}else o=!1;if(un(t,l),t.stateNode===null)Xr(e,t),Dc(t,n,r),ui(t,n,r,l),r=!0;else if(e===null){var i=t.stateNode,u=t.memoizedProps;i.props=u;var s=i.context,c=n.contextType;typeof c=="object"&&c!==null?c=Me(c):(c=ye(n)?Ot:ae.current,c=cn(t,c));var m=n.getDerivedStateFromProps,h=typeof m=="function"||typeof i.getSnapshotBeforeUpdate=="function";h||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u!==r||s!==c)&&$s(t,i,r,c),ut=!1;var g=t.memoizedState;i.state=g,ml(t,r,i,l),s=t.memoizedState,u!==r||g!==s||ve.current||ut?(typeof m=="function"&&(ii(t,n,m,r),s=t.memoizedState),(u=ut||Vs(t,n,u,r,g,s,c))?(h||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(t.flags|=4194308)):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=s),i.props=r,i.state=s,i.context=c,r=u):(typeof i.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{i=t.stateNode,dc(e,t),u=t.memoizedProps,c=t.type===t.elementType?u:Fe(t.type,u),i.props=c,h=t.pendingProps,g=i.context,s=n.contextType,typeof s=="object"&&s!==null?s=Me(s):(s=ye(n)?Ot:ae.current,s=cn(t,s));var w=n.getDerivedStateFromProps;(m=typeof w=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(u!==h||g!==s)&&$s(t,i,r,s),ut=!1,g=t.memoizedState,i.state=g,ml(t,r,i,l);var S=t.memoizedState;u!==h||g!==S||ve.current||ut?(typeof w=="function"&&(ii(t,n,w,r),S=t.memoizedState),(c=ut||Vs(t,n,c,r,g,S,s)||!1)?(m||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(r,S,s),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(r,S,s)),typeof i.componentDidUpdate=="function"&&(t.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof i.componentDidUpdate!="function"||u===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=S),i.props=r,i.state=S,i.context=s,r=c):(typeof i.componentDidUpdate!="function"||u===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),r=!1)}return ci(e,t,n,r,o,l)}function ci(e,t,n,r,l,o){bc(e,t);var i=(t.flags&128)!==0;if(!r&&!i)return l&&js(t,n,!1),nt(e,t,o);r=t.stateNode,Lp.current=t;var u=i&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&i?(t.child=fn(t,e.child,null,o),t.child=fn(t,null,u,o)):de(e,t,u,o),t.memoizedState=r.state,l&&js(t,n,!0),t.child}function Ac(e){var t=e.stateNode;t.pendingContext?Os(e,t.pendingContext,t.pendingContext!==t.context):t.context&&Os(e,t.context,!1),Qi(e,t.containerInfo)}function Zs(e,t,n,r,l){return dn(),Bi(l),t.flags|=256,de(e,t,n,r),t.child}var di={dehydrated:null,treeContext:null,retryLane:0};function fi(e){return{baseLanes:e,cachePool:null,transitions:null}}function Uc(e,t,n){var r=t.pendingProps,l=V.current,o=!1,i=(t.flags&128)!==0,u;if((u=i)||(u=e!==null&&e.memoizedState===null?!1:(l&2)!==0),u?(o=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(l|=1),b(V,l&1),e===null)return li(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(i=r.children,e=r.fallback,o?(r=t.mode,o=t.child,i={mode:"hidden",children:i},!(r&1)&&o!==null?(o.childLanes=0,o.pendingProps=i):o=Ol(i,r,0,null),e=It(e,r,n,null),o.return=t,e.return=t,o.sibling=e,t.child=o,t.child.memoizedState=fi(n),t.memoizedState=di,e):eu(t,i));if(l=e.memoizedState,l!==null&&(u=l.dehydrated,u!==null))return Mp(e,t,i,r,u,l,n);if(o){o=r.fallback,i=t.mode,l=e.child,u=l.sibling;var s={mode:"hidden",children:r.children};return!(i&1)&&t.child!==l?(r=t.child,r.childLanes=0,r.pendingProps=s,t.deletions=null):(r=xt(l,s),r.subtreeFlags=l.subtreeFlags&14680064),u!==null?o=xt(u,o):(o=It(o,i,n,null),o.flags|=2),o.return=t,r.return=t,r.sibling=o,t.child=r,r=o,o=t.child,i=e.child.memoizedState,i=i===null?fi(n):{baseLanes:i.baseLanes|n,cachePool:null,transitions:i.transitions},o.memoizedState=i,o.childLanes=e.childLanes&~n,t.memoizedState=di,r}return o=e.child,e=o.sibling,r=xt(o,{mode:"visible",children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function eu(e,t){return t=Ol({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function Rr(e,t,n,r){return r!==null&&Bi(r),fn(t,e.child,null,n),e=eu(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Mp(e,t,n,r,l,o,i){if(n)return t.flags&256?(t.flags&=-257,r=_o(Error(x(422))),Rr(e,t,i,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(o=r.fallback,l=t.mode,r=Ol({mode:"visible",children:r.children},l,0,null),o=It(o,l,i,null),o.flags|=2,r.return=t,o.return=t,r.sibling=o,t.child=r,t.mode&1&&fn(t,e.child,null,i),t.child.memoizedState=fi(i),t.memoizedState=di,o);if(!(t.mode&1))return Rr(e,t,i,null);if(l.data==="$!"){if(r=l.nextSibling&&l.nextSibling.dataset,r)var u=r.dgst;return r=u,o=Error(x(419)),r=_o(o,r,void 0),Rr(e,t,i,r)}if(u=(i&e.childLanes)!==0,he||u){if(r=ee,r!==null){switch(i&-i){case 4:l=2;break;case 16:l=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:l=32;break;case 536870912:l=268435456;break;default:l=0}l=l&(r.suspendedLanes|i)?0:l,l!==0&&l!==o.retryLane&&(o.retryLane=l,tt(e,l),Be(r,e,l,-1))}return iu(),r=_o(Error(x(421))),Rr(e,t,i,r)}return l.data==="$?"?(t.flags|=128,t.child=e.child,t=$p.bind(null,e),l._reactRetry=t,null):(e=o.treeContext,ke=mt(l.nextSibling),Se=t,R=!0,Ae=null,e!==null&&(ze[Pe++]=Xe,ze[Pe++]=Ze,ze[Pe++]=jt,Xe=e.id,Ze=e.overflow,jt=t),t=eu(t,r.children),t.flags|=4096,t)}function Js(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),oi(e.return,t,n)}function zo(e,t,n,r,l){var o=e.memoizedState;o===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:l}:(o.isBackwards=t,o.rendering=null,o.renderingStartTime=0,o.last=r,o.tail=n,o.tailMode=l)}function Bc(e,t,n){var r=t.pendingProps,l=r.revealOrder,o=r.tail;if(de(e,t,r.children,n),r=V.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Js(e,n,t);else if(e.tag===19)Js(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(b(V,r),!(t.mode&1))t.memoizedState=null;else switch(l){case"forwards":for(n=t.child,l=null;n!==null;)e=n.alternate,e!==null&&hl(e)===null&&(l=n),n=n.sibling;n=l,n===null?(l=t.child,t.child=null):(l=n.sibling,n.sibling=null),zo(t,!1,l,n,o);break;case"backwards":for(n=null,l=t.child,t.child=null;l!==null;){if(e=l.alternate,e!==null&&hl(e)===null){t.child=l;break}e=l.sibling,l.sibling=n,n=l,l=e}zo(t,!0,n,null,o);break;case"together":zo(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function Xr(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function nt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),bt|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(x(153));if(t.child!==null){for(e=t.child,n=xt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=xt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Dp(e,t,n){switch(t.tag){case 3:Ac(t),dn();break;case 5:fc(t);break;case 1:ye(t.type)&&cl(t);break;case 4:Qi(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,l=t.memoizedProps.value;b(pl,r._currentValue),r._currentValue=l;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(b(V,V.current&1),t.flags|=128,null):n&t.child.childLanes?Uc(e,t,n):(b(V,V.current&1),e=nt(e,t,n),e!==null?e.sibling:null);b(V,V.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return Bc(e,t,n);t.flags|=128}if(l=t.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),b(V,V.current),r)break;return null;case 22:case 23:return t.lanes=0,Fc(e,t,n)}return nt(e,t,n)}var Rc,pi,Hc,Vc;Rc=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};pi=function(){};Hc=function(e,t,n,r){var l=e.memoizedProps;if(l!==r){e=t.stateNode,Mt(Ke.current);var o=null;switch(n){case"input":l=jo(e,l),r=jo(e,r),o=[];break;case"select":l=W({},l,{value:void 0}),r=W({},r,{value:void 0}),o=[];break;case"textarea":l=Ao(e,l),r=Ao(e,r),o=[];break;default:typeof l.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=sl)}Bo(n,r);var i;n=null;for(c in l)if(!r.hasOwnProperty(c)&&l.hasOwnProperty(c)&&l[c]!=null)if(c==="style"){var u=l[c];for(i in u)u.hasOwnProperty(i)&&(n||(n={}),n[i]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(Wn.hasOwnProperty(c)?o||(o=[]):(o=o||[]).push(c,null));for(c in r){var s=r[c];if(u=l?.[c],r.hasOwnProperty(c)&&s!==u&&(s!=null||u!=null))if(c==="style")if(u){for(i in u)!u.hasOwnProperty(i)||s&&s.hasOwnProperty(i)||(n||(n={}),n[i]="");for(i in s)s.hasOwnProperty(i)&&u[i]!==s[i]&&(n||(n={}),n[i]=s[i])}else n||(o||(o=[]),o.push(c,n)),n=s;else c==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,u=u?u.__html:void 0,s!=null&&u!==s&&(o=o||[]).push(c,s)):c==="children"?typeof s!="string"&&typeof s!="number"||(o=o||[]).push(c,""+s):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(Wn.hasOwnProperty(c)?(s!=null&&c==="onScroll"&&U("scroll",e),o||u===s||(o=[])):(o=o||[]).push(c,s))}n&&(o=o||[]).push("style",n);var c=o;(t.updateQueue=c)&&(t.flags|=4)}};Vc=function(e,t,n,r){n!==r&&(t.flags|=4)};function Tn(e,t){if(!R)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function ue(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags&14680064,r|=l.flags&14680064,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)n|=l.lanes|l.childLanes,r|=l.subtreeFlags,r|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function Ip(e,t,n){var r=t.pendingProps;switch(Ui(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ue(t),null;case 1:return ye(t.type)&&al(),ue(t),null;case 3:return r=t.stateNode,pn(),B(ve),B(ae),Yi(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Ur(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,Ae!==null&&(ki(Ae),Ae=null))),pi(e,t),ue(t),null;case 5:Ki(t);var l=Mt(rr.current);if(n=t.type,e!==null&&t.stateNode!=null)Hc(e,t,n,r,l),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(x(166));return ue(t),null}if(e=Mt(Ke.current),Ur(t)){r=t.stateNode,n=t.type;var o=t.memoizedProps;switch(r[We]=t,r[tr]=o,e=(t.mode&1)!==0,n){case"dialog":U("cancel",r),U("close",r);break;case"iframe":case"object":case"embed":U("load",r);break;case"video":case"audio":for(l=0;l<jn.length;l++)U(jn[l],r);break;case"source":U("error",r);break;case"img":case"image":case"link":U("error",r),U("load",r);break;case"details":U("toggle",r);break;case"input":is(r,o),U("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!o.multiple},U("invalid",r);break;case"textarea":ss(r,o),U("invalid",r)}Bo(n,o),l=null;for(var i in o)if(o.hasOwnProperty(i)){var u=o[i];i==="children"?typeof u=="string"?r.textContent!==u&&(o.suppressHydrationWarning!==!0&&Ar(r.textContent,u,e),l=["children",u]):typeof u=="number"&&r.textContent!==""+u&&(o.suppressHydrationWarning!==!0&&Ar(r.textContent,u,e),l=["children",""+u]):Wn.hasOwnProperty(i)&&u!=null&&i==="onScroll"&&U("scroll",r)}switch(n){case"input":_r(r),us(r,o,!0);break;case"textarea":_r(r),as(r);break;case"select":case"option":break;default:typeof o.onClick=="function"&&(r.onclick=sl)}r=l,t.updateQueue=r,r!==null&&(t.flags|=4)}else{i=l.nodeType===9?l:l.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=va(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=i.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=i.createElement(n,{is:r.is}):(e=i.createElement(n),n==="select"&&(i=e,r.multiple?i.multiple=!0:r.size&&(i.size=r.size))):e=i.createElementNS(e,n),e[We]=t,e[tr]=r,Rc(e,t,!1,!1),t.stateNode=e;e:{switch(i=Ro(n,r),n){case"dialog":U("cancel",e),U("close",e),l=r;break;case"iframe":case"object":case"embed":U("load",e),l=r;break;case"video":case"audio":for(l=0;l<jn.length;l++)U(jn[l],e);l=r;break;case"source":U("error",e),l=r;break;case"img":case"image":case"link":U("error",e),U("load",e),l=r;break;case"details":U("toggle",e),l=r;break;case"input":is(e,r),l=jo(e,r),U("invalid",e);break;case"option":l=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},l=W({},r,{value:void 0}),U("invalid",e);break;case"textarea":ss(e,r),l=Ao(e,r),U("invalid",e);break;default:l=r}Bo(n,l),u=l;for(o in u)if(u.hasOwnProperty(o)){var s=u[o];o==="style"?wa(e,s):o==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,s!=null&&ya(e,s)):o==="children"?typeof s=="string"?(n!=="textarea"||s!=="")&&Qn(e,s):typeof s=="number"&&Qn(e,""+s):o!=="suppressContentEditableWarning"&&o!=="suppressHydrationWarning"&&o!=="autoFocus"&&(Wn.hasOwnProperty(o)?s!=null&&o==="onScroll"&&U("scroll",e):s!=null&&Ci(e,o,s,i))}switch(n){case"input":_r(e),us(e,r,!1);break;case"textarea":_r(e),as(e);break;case"option":r.value!=null&&e.setAttribute("value",""+wt(r.value));break;case"select":e.multiple=!!r.multiple,o=r.value,o!=null?nn(e,!!r.multiple,o,!1):r.defaultValue!=null&&nn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof l.onClick=="function"&&(e.onclick=sl)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return ue(t),null;case 6:if(e&&t.stateNode!=null)Vc(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(x(166));if(n=Mt(rr.current),Mt(Ke.current),Ur(t)){if(r=t.stateNode,n=t.memoizedProps,r[We]=t,(o=r.nodeValue!==n)&&(e=Se,e!==null))switch(e.tag){case 3:Ar(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Ar(r.nodeValue,n,(e.mode&1)!==0)}o&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[We]=t,t.stateNode=r}return ue(t),null;case 13:if(B(V),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(R&&ke!==null&&t.mode&1&&!(t.flags&128))uc(),dn(),t.flags|=98560,o=!1;else if(o=Ur(t),r!==null&&r.dehydrated!==null){if(e===null){if(!o)throw Error(x(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(x(317));o[We]=t}else dn(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;ue(t),o=!1}else Ae!==null&&(ki(Ae),Ae=null),o=!0;if(!o)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||V.current&1?J===0&&(J=3):iu())),t.updateQueue!==null&&(t.flags|=4),ue(t),null);case 4:return pn(),pi(e,t),e===null&&qn(t.stateNode.containerInfo),ue(t),null;case 10:return Vi(t.type._context),ue(t),null;case 17:return ye(t.type)&&al(),ue(t),null;case 19:if(B(V),o=t.memoizedState,o===null)return ue(t),null;if(r=(t.flags&128)!==0,i=o.rendering,i===null)if(r)Tn(o,!1);else{if(J!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(i=hl(e),i!==null){for(t.flags|=128,Tn(o,!1),r=i.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)o=n,e=r,o.flags&=14680066,i=o.alternate,i===null?(o.childLanes=0,o.lanes=e,o.child=null,o.subtreeFlags=0,o.memoizedProps=null,o.memoizedState=null,o.updateQueue=null,o.dependencies=null,o.stateNode=null):(o.childLanes=i.childLanes,o.lanes=i.lanes,o.child=i.child,o.subtreeFlags=0,o.deletions=null,o.memoizedProps=i.memoizedProps,o.memoizedState=i.memoizedState,o.updateQueue=i.updateQueue,o.type=i.type,e=i.dependencies,o.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return b(V,V.current&1|2),t.child}e=e.sibling}o.tail!==null&&K()>mn&&(t.flags|=128,r=!0,Tn(o,!1),t.lanes=4194304)}else{if(!r)if(e=hl(i),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),Tn(o,!0),o.tail===null&&o.tailMode==="hidden"&&!i.alternate&&!R)return ue(t),null}else 2*K()-o.renderingStartTime>mn&&n!==1073741824&&(t.flags|=128,r=!0,Tn(o,!1),t.lanes=4194304);o.isBackwards?(i.sibling=t.child,t.child=i):(n=o.last,n!==null?n.sibling=i:t.child=i,o.last=i)}return o.tail!==null?(t=o.tail,o.rendering=t,o.tail=t.sibling,o.renderingStartTime=K(),t.sibling=null,n=V.current,b(V,r?n&1|2:n&1),t):(ue(t),null);case 22:case 23:return ou(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?we&1073741824&&(ue(t),t.subtreeFlags&6&&(t.flags|=8192)):ue(t),null;case 24:return null;case 25:return null}throw Error(x(156,t.tag))}function Op(e,t){switch(Ui(t),t.tag){case 1:return ye(t.type)&&al(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return pn(),B(ve),B(ae),Yi(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return Ki(t),null;case 13:if(B(V),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(x(340));dn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return B(V),null;case 4:return pn(),null;case 10:return Vi(t.type._context),null;case 22:case 23:return ou(),null;case 24:return null;default:return null}}var Hr=!1,se=!1,jp=typeof WeakSet=="function"?WeakSet:Set,N=null;function en(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){Q(e,t,r)}else n.current=null}function gi(e,t,n){try{n()}catch(r){Q(e,t,r)}}var qs=!1;function Fp(e,t){if(Zo=ol,e=Ya(),bi(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var l=r.anchorOffset,o=r.focusNode;r=r.focusOffset;try{n.nodeType,o.nodeType}catch{n=null;break e}var i=0,u=-1,s=-1,c=0,m=0,h=e,g=null;t:for(;;){for(var w;h!==n||l!==0&&h.nodeType!==3||(u=i+l),h!==o||r!==0&&h.nodeType!==3||(s=i+r),h.nodeType===3&&(i+=h.nodeValue.length),(w=h.firstChild)!==null;)g=h,h=w;for(;;){if(h===e)break t;if(g===n&&++c===l&&(u=i),g===o&&++m===r&&(s=i),(w=h.nextSibling)!==null)break;h=g,g=h.parentNode}h=w}n=u===-1||s===-1?null:{start:u,end:s}}else n=null}n=n||{start:0,end:0}}else n=null;for(Jo={focusedElem:e,selectionRange:n},ol=!1,N=t;N!==null;)if(t=N,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,N=e;else for(;N!==null;){t=N;try{var S=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(S!==null){var C=S.memoizedProps,A=S.memoizedState,d=t.stateNode,a=d.getSnapshotBeforeUpdate(t.elementType===t.type?C:Fe(t.type,C),A);d.__reactInternalSnapshotBeforeUpdate=a}break;case 3:var f=t.stateNode.containerInfo;f.nodeType===1?f.textContent="":f.nodeType===9&&f.documentElement&&f.removeChild(f.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(x(163))}}catch(v){Q(t,t.return,v)}if(e=t.sibling,e!==null){e.return=t.return,N=e;break}N=t.return}return S=qs,qs=!1,S}function Hn(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&e)===e){var o=l.destroy;l.destroy=void 0,o!==void 0&&gi(t,n,o)}l=l.next}while(l!==r)}}function Dl(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function mi(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function $c(e){var t=e.alternate;t!==null&&(e.alternate=null,$c(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[We],delete t[tr],delete t[ti],delete t[yp],delete t[xp])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function Wc(e){return e.tag===5||e.tag===3||e.tag===4}function ea(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Wc(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function hi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=sl));else if(r!==4&&(e=e.child,e!==null))for(hi(e,t,n),e=e.sibling;e!==null;)hi(e,t,n),e=e.sibling}function vi(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(vi(e,t,n),e=e.sibling;e!==null;)vi(e,t,n),e=e.sibling}var te=null,be=!1;function ot(e,t,n){for(n=n.child;n!==null;)Qc(e,t,n),n=n.sibling}function Qc(e,t,n){if(Qe&&typeof Qe.onCommitFiberUnmount=="function")try{Qe.onCommitFiberUnmount(Cl,n)}catch{}switch(n.tag){case 5:se||en(n,t);case 6:var r=te,l=be;te=null,ot(e,t,n),te=r,be=l,te!==null&&(be?(e=te,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):te.removeChild(n.stateNode));break;case 18:te!==null&&(be?(e=te,n=n.stateNode,e.nodeType===8?wo(e.parentNode,n):e.nodeType===1&&wo(e,n),Xn(e)):wo(te,n.stateNode));break;case 4:r=te,l=be,te=n.stateNode.containerInfo,be=!0,ot(e,t,n),te=r,be=l;break;case 0:case 11:case 14:case 15:if(!se&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){l=r=r.next;do{var o=l,i=o.destroy;o=o.tag,i!==void 0&&(o&2||o&4)&&gi(n,t,i),l=l.next}while(l!==r)}ot(e,t,n);break;case 1:if(!se&&(en(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(u){Q(n,t,u)}ot(e,t,n);break;case 21:ot(e,t,n);break;case 22:n.mode&1?(se=(r=se)||n.memoizedState!==null,ot(e,t,n),se=r):ot(e,t,n);break;default:ot(e,t,n)}}function ta(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new jp),t.forEach(function(r){var l=Wp.bind(null,e,r);n.has(r)||(n.add(r),r.then(l,l))})}}function je(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var l=n[r];try{var o=e,i=t,u=i;e:for(;u!==null;){switch(u.tag){case 5:te=u.stateNode,be=!1;break e;case 3:te=u.stateNode.containerInfo,be=!0;break e;case 4:te=u.stateNode.containerInfo,be=!0;break e}u=u.return}if(te===null)throw Error(x(160));Qc(o,i,l),te=null,be=!1;var s=l.alternate;s!==null&&(s.return=null),l.return=null}catch(c){Q(l,t,c)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)Kc(t,e),t=t.sibling}function Kc(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(je(t,e),Ve(e),r&4){try{Hn(3,e,e.return),Dl(3,e)}catch(C){Q(e,e.return,C)}try{Hn(5,e,e.return)}catch(C){Q(e,e.return,C)}}break;case 1:je(t,e),Ve(e),r&512&&n!==null&&en(n,n.return);break;case 5:if(je(t,e),Ve(e),r&512&&n!==null&&en(n,n.return),e.flags&32){var l=e.stateNode;try{Qn(l,"")}catch(C){Q(e,e.return,C)}}if(r&4&&(l=e.stateNode,l!=null)){var o=e.memoizedProps,i=n!==null?n.memoizedProps:o,u=e.type,s=e.updateQueue;if(e.updateQueue=null,s!==null)try{u==="input"&&o.type==="radio"&&o.name!=null&&ma(l,o),Ro(u,i);var c=Ro(u,o);for(i=0;i<s.length;i+=2){var m=s[i],h=s[i+1];m==="style"?wa(l,h):m==="dangerouslySetInnerHTML"?ya(l,h):m==="children"?Qn(l,h):Ci(l,m,h,c)}switch(u){case"input":Fo(l,o);break;case"textarea":ha(l,o);break;case"select":var g=l._wrapperState.wasMultiple;l._wrapperState.wasMultiple=!!o.multiple;var w=o.value;w!=null?nn(l,!!o.multiple,w,!1):g!==!!o.multiple&&(o.defaultValue!=null?nn(l,!!o.multiple,o.defaultValue,!0):nn(l,!!o.multiple,o.multiple?[]:"",!1))}l[tr]=o}catch(C){Q(e,e.return,C)}}break;case 6:if(je(t,e),Ve(e),r&4){if(e.stateNode===null)throw Error(x(162));l=e.stateNode,o=e.memoizedProps;try{l.nodeValue=o}catch(C){Q(e,e.return,C)}}break;case 3:if(je(t,e),Ve(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Xn(t.containerInfo)}catch(C){Q(e,e.return,C)}break;case 4:je(t,e),Ve(e);break;case 13:je(t,e),Ve(e),l=e.child,l.flags&8192&&(o=l.memoizedState!==null,l.stateNode.isHidden=o,!o||l.alternate!==null&&l.alternate.memoizedState!==null||(ru=K())),r&4&&ta(e);break;case 22:if(m=n!==null&&n.memoizedState!==null,e.mode&1?(se=(c=se)||m,je(t,e),se=c):je(t,e),Ve(e),r&8192){if(c=e.memoizedState!==null,(e.stateNode.isHidden=c)&&!m&&e.mode&1)for(N=e,m=e.child;m!==null;){for(h=N=m;N!==null;){switch(g=N,w=g.child,g.tag){case 0:case 11:case 14:case 15:Hn(4,g,g.return);break;case 1:en(g,g.return);var S=g.stateNode;if(typeof S.componentWillUnmount=="function"){r=g,n=g.return;try{t=r,S.props=t.memoizedProps,S.state=t.memoizedState,S.componentWillUnmount()}catch(C){Q(r,n,C)}}break;case 5:en(g,g.return);break;case 22:if(g.memoizedState!==null){ra(h);continue}}w!==null?(w.return=g,N=w):ra(h)}m=m.sibling}e:for(m=null,h=e;;){if(h.tag===5){if(m===null){m=h;try{l=h.stateNode,c?(o=l.style,typeof o.setProperty=="function"?o.setProperty("display","none","important"):o.display="none"):(u=h.stateNode,s=h.memoizedProps.style,i=s!=null&&s.hasOwnProperty("display")?s.display:null,u.style.display=xa("display",i))}catch(C){Q(e,e.return,C)}}}else if(h.tag===6){if(m===null)try{h.stateNode.nodeValue=c?"":h.memoizedProps}catch(C){Q(e,e.return,C)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===e)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===e)break e;for(;h.sibling===null;){if(h.return===null||h.return===e)break e;m===h&&(m=null),h=h.return}m===h&&(m=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:je(t,e),Ve(e),r&4&&ta(e);break;case 21:break;default:je(t,e),Ve(e)}}function Ve(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(Wc(n)){var r=n;break e}n=n.return}throw Error(x(160))}switch(r.tag){case 5:var l=r.stateNode;r.flags&32&&(Qn(l,""),r.flags&=-33);var o=ea(e);vi(e,o,l);break;case 3:case 4:var i=r.stateNode.containerInfo,u=ea(e);hi(e,u,i);break;default:throw Error(x(161))}}catch(s){Q(e,e.return,s)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function bp(e,t,n){N=e,Yc(e,t,n)}function Yc(e,t,n){for(var r=(e.mode&1)!==0;N!==null;){var l=N,o=l.child;if(l.tag===22&&r){var i=l.memoizedState!==null||Hr;if(!i){var u=l.alternate,s=u!==null&&u.memoizedState!==null||se;u=Hr;var c=se;if(Hr=i,(se=s)&&!c)for(N=l;N!==null;)i=N,s=i.child,i.tag===22&&i.memoizedState!==null?la(l):s!==null?(s.return=i,N=s):la(l);for(;o!==null;)N=o,Yc(o,t,n),o=o.sibling;N=l,Hr=u,se=c}na(e,t,n)}else l.subtreeFlags&8772&&o!==null?(o.return=l,N=o):na(e,t,n)}}function na(e){for(;N!==null;){var t=N;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:se||Dl(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!se)if(n===null)r.componentDidMount();else{var l=t.elementType===t.type?n.memoizedProps:Fe(t.type,n.memoizedProps);r.componentDidUpdate(l,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var o=t.updateQueue;o!==null&&Bs(t,o,r);break;case 3:var i=t.updateQueue;if(i!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}Bs(t,i,n)}break;case 5:var u=t.stateNode;if(n===null&&t.flags&4){n=u;var s=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":s.autoFocus&&n.focus();break;case"img":s.src&&(n.src=s.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var c=t.alternate;if(c!==null){var m=c.memoizedState;if(m!==null){var h=m.dehydrated;h!==null&&Xn(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(x(163))}se||t.flags&512&&mi(t)}catch(g){Q(t,t.return,g)}}if(t===e){N=null;break}if(n=t.sibling,n!==null){n.return=t.return,N=n;break}N=t.return}}function ra(e){for(;N!==null;){var t=N;if(t===e){N=null;break}var n=t.sibling;if(n!==null){n.return=t.return,N=n;break}N=t.return}}function la(e){for(;N!==null;){var t=N;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{Dl(4,t)}catch(s){Q(t,n,s)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var l=t.return;try{r.componentDidMount()}catch(s){Q(t,l,s)}}var o=t.return;try{mi(t)}catch(s){Q(t,o,s)}break;case 5:var i=t.return;try{mi(t)}catch(s){Q(t,i,s)}}}catch(s){Q(t,t.return,s)}if(t===e){N=null;break}var u=t.sibling;if(u!==null){u.return=t.return,N=u;break}N=t.return}}var Ap=Math.ceil,xl=rt.ReactCurrentDispatcher,tu=rt.ReactCurrentOwner,Le=rt.ReactCurrentBatchConfig,O=0,ee=null,X=null,ne=0,we=0,tn=Et(0),J=0,ur=null,bt=0,Il=0,nu=0,Vn=null,me=null,ru=0,mn=1/0,Ye=null,wl=!1,yi=null,vt=null,Vr=!1,dt=null,kl=0,$n=0,xi=null,Zr=-1,Jr=0;function fe(){return O&6?K():Zr!==-1?Zr:Zr=K()}function yt(e){return e.mode&1?O&2&&ne!==0?ne&-ne:kp.transition!==null?(Jr===0&&(Jr=Da()),Jr):(e=j,e!==0||(e=window.event,e=e===void 0?16:Ua(e.type)),e):1}function Be(e,t,n,r){if(50<$n)throw $n=0,xi=null,Error(x(185));sr(e,n,r),(!(O&2)||e!==ee)&&(e===ee&&(!(O&2)&&(Il|=n),J===4&&at(e,ne)),xe(e,r),n===1&&O===0&&!(t.mode&1)&&(mn=K()+500,Tl&&Ct()))}function xe(e,t){var n=e.callbackNode;Ef(e,t);var r=ll(e,e===ee?ne:0);if(r===0)n!==null&&fs(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&fs(n),t===1)e.tag===0?wp(oa.bind(null,e)):lc(oa.bind(null,e)),hp(function(){!(O&6)&&Ct()}),n=null;else{switch(Ia(r)){case 1:n=Ti;break;case 4:n=La;break;case 16:n=rl;break;case 536870912:n=Ma;break;default:n=rl}n=nd(n,Gc.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function Gc(e,t){if(Zr=-1,Jr=0,O&6)throw Error(x(327));var n=e.callbackNode;if(sn()&&e.callbackNode!==n)return null;var r=ll(e,e===ee?ne:0);if(r===0)return null;if(r&30||r&e.expiredLanes||t)t=Sl(e,r);else{t=r;var l=O;O|=2;var o=Zc();(ee!==e||ne!==t)&&(Ye=null,mn=K()+500,Dt(e,t));do try{Rp();break}catch(u){Xc(e,u)}while(!0);Hi(),xl.current=o,O=l,X!==null?t=0:(ee=null,ne=0,t=J)}if(t!==0){if(t===2&&(l=Qo(e),l!==0&&(r=l,t=wi(e,l))),t===1)throw n=ur,Dt(e,0),at(e,r),xe(e,K()),n;if(t===6)at(e,r);else{if(l=e.current.alternate,!(r&30)&&!Up(l)&&(t=Sl(e,r),t===2&&(o=Qo(e),o!==0&&(r=o,t=wi(e,o))),t===1))throw n=ur,Dt(e,0),at(e,r),xe(e,K()),n;switch(e.finishedWork=l,e.finishedLanes=r,t){case 0:case 1:throw Error(x(345));case 2:Pt(e,me,Ye);break;case 3:if(at(e,r),(r&130023424)===r&&(t=ru+500-K(),10<t)){if(ll(e,0)!==0)break;if(l=e.suspendedLanes,(l&r)!==r){fe(),e.pingedLanes|=e.suspendedLanes&l;break}e.timeoutHandle=ei(Pt.bind(null,e,me,Ye),t);break}Pt(e,me,Ye);break;case 4:if(at(e,r),(r&4194240)===r)break;for(t=e.eventTimes,l=-1;0<r;){var i=31-Ue(r);o=1<<i,i=t[i],i>l&&(l=i),r&=~o}if(r=l,r=K()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*Ap(r/1960))-r,10<r){e.timeoutHandle=ei(Pt.bind(null,e,me,Ye),r);break}Pt(e,me,Ye);break;case 5:Pt(e,me,Ye);break;default:throw Error(x(329))}}}return xe(e,K()),e.callbackNode===n?Gc.bind(null,e):null}function wi(e,t){var n=Vn;return e.current.memoizedState.isDehydrated&&(Dt(e,t).flags|=256),e=Sl(e,t),e!==2&&(t=me,me=n,t!==null&&ki(t)),e}function ki(e){me===null?me=e:me.push.apply(me,e)}function Up(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var l=n[r],o=l.getSnapshot;l=l.value;try{if(!Re(o(),l))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function at(e,t){for(t&=~nu,t&=~Il,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-Ue(t),r=1<<n;e[n]=-1,t&=~r}}function oa(e){if(O&6)throw Error(x(327));sn();var t=ll(e,0);if(!(t&1))return xe(e,K()),null;var n=Sl(e,t);if(e.tag!==0&&n===2){var r=Qo(e);r!==0&&(t=r,n=wi(e,r))}if(n===1)throw n=ur,Dt(e,0),at(e,t),xe(e,K()),n;if(n===6)throw Error(x(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Pt(e,me,Ye),xe(e,K()),null}function lu(e,t){var n=O;O|=1;try{return e(t)}finally{O=n,O===0&&(mn=K()+500,Tl&&Ct())}}function At(e){dt!==null&&dt.tag===0&&!(O&6)&&sn();var t=O;O|=1;var n=Le.transition,r=j;try{if(Le.transition=null,j=1,e)return e()}finally{j=r,Le.transition=n,O=t,!(O&6)&&Ct()}}function ou(){we=tn.current,B(tn)}function Dt(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,mp(n)),X!==null)for(n=X.return;n!==null;){var r=n;switch(Ui(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&al();break;case 3:pn(),B(ve),B(ae),Yi();break;case 5:Ki(r);break;case 4:pn();break;case 13:B(V);break;case 19:B(V);break;case 10:Vi(r.type._context);break;case 22:case 23:ou()}n=n.return}if(ee=e,X=e=xt(e.current,null),ne=we=t,J=0,ur=null,nu=Il=bt=0,me=Vn=null,Lt!==null){for(t=0;t<Lt.length;t++)if(n=Lt[t],r=n.interleaved,r!==null){n.interleaved=null;var l=r.next,o=n.pending;if(o!==null){var i=o.next;o.next=l,r.next=i}n.pending=r}Lt=null}return e}function Xc(e,t){do{var n=X;try{if(Hi(),Yr.current=yl,vl){for(var r=$.memoizedState;r!==null;){var l=r.queue;l!==null&&(l.pending=null),r=r.next}vl=!1}if(Ft=0,q=Z=$=null,Rn=!1,lr=0,tu.current=null,n===null||n.return===null){J=1,ur=t,X=null;break}e:{var o=e,i=n.return,u=n,s=t;if(t=ne,u.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){var c=s,m=u,h=m.tag;if(!(m.mode&1)&&(h===0||h===11||h===15)){var g=m.alternate;g?(m.updateQueue=g.updateQueue,m.memoizedState=g.memoizedState,m.lanes=g.lanes):(m.updateQueue=null,m.memoizedState=null)}var w=Qs(i);if(w!==null){w.flags&=-257,Ks(w,i,u,o,t),w.mode&1&&Ws(o,c,t),t=w,s=c;var S=t.updateQueue;if(S===null){var C=new Set;C.add(s),t.updateQueue=C}else S.add(s);break e}else{if(!(t&1)){Ws(o,c,t),iu();break e}s=Error(x(426))}}else if(R&&u.mode&1){var A=Qs(i);if(A!==null){!(A.flags&65536)&&(A.flags|=256),Ks(A,i,u,o,t),Bi(gn(s,u));break e}}o=s=gn(s,u),J!==4&&(J=2),Vn===null?Vn=[o]:Vn.push(o),o=i;do{switch(o.tag){case 3:o.flags|=65536,t&=-t,o.lanes|=t;var d=Ic(o,s,t);Us(o,d);break e;case 1:u=s;var a=o.type,f=o.stateNode;if(!(o.flags&128)&&(typeof a.getDerivedStateFromError=="function"||f!==null&&typeof f.componentDidCatch=="function"&&(vt===null||!vt.has(f)))){o.flags|=65536,t&=-t,o.lanes|=t;var v=Oc(o,u,t);Us(o,v);break e}}o=o.return}while(o!==null)}qc(n)}catch(E){t=E,X===n&&n!==null&&(X=n=n.return);continue}break}while(!0)}function Zc(){var e=xl.current;return xl.current=yl,e===null?yl:e}function iu(){(J===0||J===3||J===2)&&(J=4),ee===null||!(bt&268435455)&&!(Il&268435455)||at(ee,ne)}function Sl(e,t){var n=O;O|=2;var r=Zc();(ee!==e||ne!==t)&&(Ye=null,Dt(e,t));do try{Bp();break}catch(l){Xc(e,l)}while(!0);if(Hi(),O=n,xl.current=r,X!==null)throw Error(x(261));return ee=null,ne=0,J}function Bp(){for(;X!==null;)Jc(X)}function Rp(){for(;X!==null&&!gf();)Jc(X)}function Jc(e){var t=td(e.alternate,e,we);e.memoizedProps=e.pendingProps,t===null?qc(e):X=t,tu.current=null}function qc(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=Op(n,t),n!==null){n.flags&=32767,X=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{J=6,X=null;return}}else if(n=Ip(n,t,we),n!==null){X=n;return}if(t=t.sibling,t!==null){X=t;return}X=t=e}while(t!==null);J===0&&(J=5)}function Pt(e,t,n){var r=j,l=Le.transition;try{Le.transition=null,j=1,Hp(e,t,n,r)}finally{Le.transition=l,j=r}return null}function Hp(e,t,n,r){do sn();while(dt!==null);if(O&6)throw Error(x(327));n=e.finishedWork;var l=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(x(177));e.callbackNode=null,e.callbackPriority=0;var o=n.lanes|n.childLanes;if(Cf(e,o),e===ee&&(X=ee=null,ne=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Vr||(Vr=!0,nd(rl,function(){return sn(),null})),o=(n.flags&15990)!==0,n.subtreeFlags&15990||o){o=Le.transition,Le.transition=null;var i=j;j=1;var u=O;O|=4,tu.current=null,Fp(e,n),Kc(n,e),cp(Jo),ol=!!Zo,Jo=Zo=null,e.current=n,bp(n,e,l),mf(),O=u,j=i,Le.transition=o}else e.current=n;if(Vr&&(Vr=!1,dt=e,kl=l),o=e.pendingLanes,o===0&&(vt=null),yf(n.stateNode,r),xe(e,K()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)l=t[n],r(l.value,{componentStack:l.stack,digest:l.digest});if(wl)throw wl=!1,e=yi,yi=null,e;return kl&1&&e.tag!==0&&sn(),o=e.pendingLanes,o&1?e===xi?$n++:($n=0,xi=e):$n=0,Ct(),null}function sn(){if(dt!==null){var e=Ia(kl),t=Le.transition,n=j;try{if(Le.transition=null,j=16>e?16:e,dt===null)var r=!1;else{if(e=dt,dt=null,kl=0,O&6)throw Error(x(331));var l=O;for(O|=4,N=e.current;N!==null;){var o=N,i=o.child;if(N.flags&16){var u=o.deletions;if(u!==null){for(var s=0;s<u.length;s++){var c=u[s];for(N=c;N!==null;){var m=N;switch(m.tag){case 0:case 11:case 15:Hn(8,m,o)}var h=m.child;if(h!==null)h.return=m,N=h;else for(;N!==null;){m=N;var g=m.sibling,w=m.return;if($c(m),m===c){N=null;break}if(g!==null){g.return=w,N=g;break}N=w}}}var S=o.alternate;if(S!==null){var C=S.child;if(C!==null){S.child=null;do{var A=C.sibling;C.sibling=null,C=A}while(C!==null)}}N=o}}if(o.subtreeFlags&2064&&i!==null)i.return=o,N=i;else e:for(;N!==null;){if(o=N,o.flags&2048)switch(o.tag){case 0:case 11:case 15:Hn(9,o,o.return)}var d=o.sibling;if(d!==null){d.return=o.return,N=d;break e}N=o.return}}var a=e.current;for(N=a;N!==null;){i=N;var f=i.child;if(i.subtreeFlags&2064&&f!==null)f.return=i,N=f;else e:for(i=a;N!==null;){if(u=N,u.flags&2048)try{switch(u.tag){case 0:case 11:case 15:Dl(9,u)}}catch(E){Q(u,u.return,E)}if(u===i){N=null;break e}var v=u.sibling;if(v!==null){v.return=u.return,N=v;break e}N=u.return}}if(O=l,Ct(),Qe&&typeof Qe.onPostCommitFiberRoot=="function")try{Qe.onPostCommitFiberRoot(Cl,e)}catch{}r=!0}return r}finally{j=n,Le.transition=t}}return!1}function ia(e,t,n){t=gn(n,t),t=Ic(e,t,1),e=ht(e,t,1),t=fe(),e!==null&&(sr(e,1,t),xe(e,t))}function Q(e,t,n){if(e.tag===3)ia(e,e,n);else for(;t!==null;){if(t.tag===3){ia(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(vt===null||!vt.has(r))){e=gn(n,e),e=Oc(t,e,1),t=ht(t,e,1),e=fe(),t!==null&&(sr(t,1,e),xe(t,e));break}}t=t.return}}function Vp(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=fe(),e.pingedLanes|=e.suspendedLanes&n,ee===e&&(ne&n)===n&&(J===4||J===3&&(ne&130023424)===ne&&500>K()-ru?Dt(e,0):nu|=n),xe(e,t)}function ed(e,t){t===0&&(e.mode&1?(t=Tr,Tr<<=1,!(Tr&130023424)&&(Tr=4194304)):t=1);var n=fe();e=tt(e,t),e!==null&&(sr(e,t,n),xe(e,n))}function $p(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),ed(e,n)}function Wp(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,l=e.memoizedState;l!==null&&(n=l.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(x(314))}r!==null&&r.delete(t),ed(e,n)}var td;td=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||ve.current)he=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return he=!1,Dp(e,t,n);he=!!(e.flags&131072)}else he=!1,R&&t.flags&1048576&&oc(t,fl,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;Xr(e,t),e=t.pendingProps;var l=cn(t,ae.current);un(t,n),l=Xi(null,t,r,e,l,n);var o=Zi();return t.flags|=1,typeof l=="object"&&l!==null&&typeof l.render=="function"&&l.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,ye(r)?(o=!0,cl(t)):o=!1,t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,Wi(t),l.updater=Ml,t.stateNode=l,l._reactInternals=t,ui(t,r,e,n),t=ci(null,t,r,!0,o,n)):(t.tag=0,R&&o&&Ai(t),de(null,t,l,n),t=t.child),t;case 16:r=t.elementType;e:{switch(Xr(e,t),e=t.pendingProps,l=r._init,r=l(r._payload),t.type=r,l=t.tag=Kp(r),e=Fe(r,e),l){case 0:t=ai(null,t,r,e,n);break e;case 1:t=Xs(null,t,r,e,n);break e;case 11:t=Ys(null,t,r,e,n);break e;case 14:t=Gs(null,t,r,Fe(r.type,e),n);break e}throw Error(x(306,r,""))}return t;case 0:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Fe(r,l),ai(e,t,r,l,n);case 1:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Fe(r,l),Xs(e,t,r,l,n);case 3:e:{if(Ac(t),e===null)throw Error(x(387));r=t.pendingProps,o=t.memoizedState,l=o.element,dc(e,t),ml(t,r,null,n);var i=t.memoizedState;if(r=i.element,o.isDehydrated)if(o={element:r,isDehydrated:!1,cache:i.cache,pendingSuspenseBoundaries:i.pendingSuspenseBoundaries,transitions:i.transitions},t.updateQueue.baseState=o,t.memoizedState=o,t.flags&256){l=gn(Error(x(423)),t),t=Zs(e,t,r,n,l);break e}else if(r!==l){l=gn(Error(x(424)),t),t=Zs(e,t,r,n,l);break e}else for(ke=mt(t.stateNode.containerInfo.firstChild),Se=t,R=!0,Ae=null,n=ac(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(dn(),r===l){t=nt(e,t,n);break e}de(e,t,r,n)}t=t.child}return t;case 5:return fc(t),e===null&&li(t),r=t.type,l=t.pendingProps,o=e!==null?e.memoizedProps:null,i=l.children,qo(r,l)?i=null:o!==null&&qo(r,o)&&(t.flags|=32),bc(e,t),de(e,t,i,n),t.child;case 6:return e===null&&li(t),null;case 13:return Uc(e,t,n);case 4:return Qi(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=fn(t,null,r,n):de(e,t,r,n),t.child;case 11:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Fe(r,l),Ys(e,t,r,l,n);case 7:return de(e,t,t.pendingProps,n),t.child;case 8:return de(e,t,t.pendingProps.children,n),t.child;case 12:return de(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,l=t.pendingProps,o=t.memoizedProps,i=l.value,b(pl,r._currentValue),r._currentValue=i,o!==null)if(Re(o.value,i)){if(o.children===l.children&&!ve.current){t=nt(e,t,n);break e}}else for(o=t.child,o!==null&&(o.return=t);o!==null;){var u=o.dependencies;if(u!==null){i=o.child;for(var s=u.firstContext;s!==null;){if(s.context===r){if(o.tag===1){s=Je(-1,n&-n),s.tag=2;var c=o.updateQueue;if(c!==null){c=c.shared;var m=c.pending;m===null?s.next=s:(s.next=m.next,m.next=s),c.pending=s}}o.lanes|=n,s=o.alternate,s!==null&&(s.lanes|=n),oi(o.return,n,t),u.lanes|=n;break}s=s.next}}else if(o.tag===10)i=o.type===t.type?null:o.child;else if(o.tag===18){if(i=o.return,i===null)throw Error(x(341));i.lanes|=n,u=i.alternate,u!==null&&(u.lanes|=n),oi(i,n,t),i=o.sibling}else i=o.child;if(i!==null)i.return=o;else for(i=o;i!==null;){if(i===t){i=null;break}if(o=i.sibling,o!==null){o.return=i.return,i=o;break}i=i.return}o=i}de(e,t,l.children,n),t=t.child}return t;case 9:return l=t.type,r=t.pendingProps.children,un(t,n),l=Me(l),r=r(l),t.flags|=1,de(e,t,r,n),t.child;case 14:return r=t.type,l=Fe(r,t.pendingProps),l=Fe(r.type,l),Gs(e,t,r,l,n);case 15:return jc(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,l=t.pendingProps,l=t.elementType===r?l:Fe(r,l),Xr(e,t),t.tag=1,ye(r)?(e=!0,cl(t)):e=!1,un(t,n),Dc(t,r,l),ui(t,r,l,n),ci(null,t,r,!0,e,n);case 19:return Bc(e,t,n);case 22:return Fc(e,t,n)}throw Error(x(156,t.tag))};function nd(e,t){return Ta(e,t)}function Qp(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Te(e,t,n,r){return new Qp(e,t,n,r)}function uu(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Kp(e){if(typeof e=="function")return uu(e)?1:0;if(e!=null){if(e=e.$$typeof,e===_i)return 11;if(e===zi)return 14}return 2}function xt(e,t){var n=e.alternate;return n===null?(n=Te(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function qr(e,t,n,r,l,o){var i=2;if(r=e,typeof e=="function")uu(e)&&(i=1);else if(typeof e=="string")i=5;else e:switch(e){case Wt:return It(n.children,l,o,t);case Ni:i=8,l|=8;break;case Mo:return e=Te(12,n,t,l|2),e.elementType=Mo,e.lanes=o,e;case Do:return e=Te(13,n,t,l),e.elementType=Do,e.lanes=o,e;case Io:return e=Te(19,n,t,l),e.elementType=Io,e.lanes=o,e;case fa:return Ol(n,l,o,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case ca:i=10;break e;case da:i=9;break e;case _i:i=11;break e;case zi:i=14;break e;case it:i=16,r=null;break e}throw Error(x(130,e==null?e:typeof e,""))}return t=Te(i,n,t,l),t.elementType=e,t.type=r,t.lanes=o,t}function It(e,t,n,r){return e=Te(7,e,r,t),e.lanes=n,e}function Ol(e,t,n,r){return e=Te(22,e,r,t),e.elementType=fa,e.lanes=n,e.stateNode={isHidden:!1},e}function Po(e,t,n){return e=Te(6,e,null,t),e.lanes=n,e}function To(e,t,n){return t=Te(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function Yp(e,t,n,r,l){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=fo(0),this.expirationTimes=fo(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=fo(0),this.identifierPrefix=r,this.onRecoverableError=l,this.mutableSourceEagerHydrationData=null}function su(e,t,n,r,l,o,i,u,s){return e=new Yp(e,t,n,u,s),t===1?(t=1,o===!0&&(t|=8)):t=0,o=Te(3,null,null,t),e.current=o,o.stateNode=e,o.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Wi(o),e}function Gp(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:$t,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function rd(e){if(!e)return kt;e=e._reactInternals;e:{if(Bt(e)!==e||e.tag!==1)throw Error(x(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(ye(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(x(171))}if(e.tag===1){var n=e.type;if(ye(n))return rc(e,n,t)}return t}function ld(e,t,n,r,l,o,i,u,s){return e=su(n,r,!0,e,l,o,i,u,s),e.context=rd(null),n=e.current,r=fe(),l=yt(n),o=Je(r,l),o.callback=t??null,ht(n,o,l),e.current.lanes=l,sr(e,l,r),xe(e,r),e}function jl(e,t,n,r){var l=t.current,o=fe(),i=yt(l);return n=rd(n),t.context===null?t.context=n:t.pendingContext=n,t=Je(o,i),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=ht(l,t,i),e!==null&&(Be(e,l,i,o),Kr(e,l,i)),i}function El(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function ua(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function au(e,t){ua(e,t),(e=e.alternate)&&ua(e,t)}function Xp(){return null}var od=typeof reportError=="function"?reportError:function(e){console.error(e)};function cu(e){this._internalRoot=e}Fl.prototype.render=cu.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(x(409));jl(e,t,null,null)};Fl.prototype.unmount=cu.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;At(function(){jl(null,e,null,null)}),t[et]=null}};function Fl(e){this._internalRoot=e}Fl.prototype.unstable_scheduleHydration=function(e){if(e){var t=Fa();e={blockedOn:null,target:e,priority:t};for(var n=0;n<st.length&&t!==0&&t<st[n].priority;n++);st.splice(n,0,e),n===0&&Aa(e)}};function du(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function bl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function sa(){}function Zp(e,t,n,r,l){if(l){if(typeof r=="function"){var o=r;r=function(){var c=El(i);o.call(c)}}var i=ld(t,r,e,0,null,!1,!1,"",sa);return e._reactRootContainer=i,e[et]=i.current,qn(e.nodeType===8?e.parentNode:e),At(),i}for(;l=e.lastChild;)e.removeChild(l);if(typeof r=="function"){var u=r;r=function(){var c=El(s);u.call(c)}}var s=su(e,0,!1,null,null,!1,!1,"",sa);return e._reactRootContainer=s,e[et]=s.current,qn(e.nodeType===8?e.parentNode:e),At(function(){jl(t,s,n,r)}),s}function Al(e,t,n,r,l){var o=n._reactRootContainer;if(o){var i=o;if(typeof l=="function"){var u=l;l=function(){var s=El(i);u.call(s)}}jl(t,i,e,l)}else i=Zp(n,t,e,l,r);return El(i)}Oa=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=On(t.pendingLanes);n!==0&&(Li(t,n|1),xe(t,K()),!(O&6)&&(mn=K()+500,Ct()))}break;case 13:At(function(){var r=tt(e,1);if(r!==null){var l=fe();Be(r,e,1,l)}}),au(e,1)}};Mi=function(e){if(e.tag===13){var t=tt(e,134217728);if(t!==null){var n=fe();Be(t,e,134217728,n)}au(e,134217728)}};ja=function(e){if(e.tag===13){var t=yt(e),n=tt(e,t);if(n!==null){var r=fe();Be(n,e,t,r)}au(e,t)}};Fa=function(){return j};ba=function(e,t){var n=j;try{return j=e,t()}finally{j=n}};Vo=function(e,t,n){switch(t){case"input":if(Fo(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var l=Pl(r);if(!l)throw Error(x(90));ga(r),Fo(r,l)}}}break;case"textarea":ha(e,n);break;case"select":t=n.value,t!=null&&nn(e,!!n.multiple,t,!1)}};Ea=lu;Ca=At;var Jp={usingClientEntryPoint:!1,Events:[cr,Gt,Pl,ka,Sa,lu]},Ln={findFiberByHostInstance:Tt,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},qp={bundleType:Ln.bundleType,version:Ln.version,rendererPackageName:Ln.rendererPackageName,rendererConfig:Ln.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:rt.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=za(e),e===null?null:e.stateNode},findFiberByHostInstance:Ln.findFiberByHostInstance||Xp,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Mn=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Mn.isDisabled&&Mn.supportsFiber))try{Cl=Mn.inject(qp),Qe=Mn}catch{}var Mn;Ne.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Jp;Ne.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!du(t))throw Error(x(200));return Gp(e,t,null,n)};Ne.createRoot=function(e,t){if(!du(e))throw Error(x(299));var n=!1,r="",l=od;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(l=t.onRecoverableError)),t=su(e,1,!1,null,null,n,!1,r,l),e[et]=t.current,qn(e.nodeType===8?e.parentNode:e),new cu(t)};Ne.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(x(188)):(e=Object.keys(e).join(","),Error(x(268,e)));return e=za(t),e=e===null?null:e.stateNode,e};Ne.flushSync=function(e){return At(e)};Ne.hydrate=function(e,t,n){if(!bl(t))throw Error(x(200));return Al(null,e,t,!0,n)};Ne.hydrateRoot=function(e,t,n){if(!du(e))throw Error(x(405));var r=n!=null&&n.hydratedSources||null,l=!1,o="",i=od;if(n!=null&&(n.unstable_strictMode===!0&&(l=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onRecoverableError!==void 0&&(i=n.onRecoverableError)),t=ld(t,null,e,1,n??null,l,!1,o,i),e[et]=t.current,qn(e),r)for(e=0;e<r.length;e++)n=r[e],l=n._getVersion,l=l(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,l]:t.mutableSourceEagerHydrationData.push(n,l);return new Fl(t)};Ne.render=function(e,t,n){if(!bl(t))throw Error(x(200));return Al(null,e,t,!1,n)};Ne.unmountComponentAtNode=function(e){if(!bl(e))throw Error(x(40));return e._reactRootContainer?(At(function(){Al(null,null,e,!1,function(){e._reactRootContainer=null,e[et]=null})}),!0):!1};Ne.unstable_batchedUpdates=lu;Ne.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!bl(n))throw Error(x(200));if(e==null||e._reactInternals===void 0)throw Error(x(38));return Al(e,t,n,!1,r)};Ne.version="18.3.1-next-f1338f8080-20240426"});var ad=Nt((d0,sd)=>{"use strict";function ud(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(ud)}catch(e){console.error(e)}}ud(),sd.exports=id()});var dd=Nt(fu=>{"use strict";var cd=ad();fu.createRoot=cd.createRoot,fu.hydrateRoot=cd.hydrateRoot;var f0});var fd=Ql(xr()),pd=Ql(dd());var p=Ql(xr()),le=acquireVsCodeApi();function pu(){let[e,t]=(0,p.useState)([]),[n,r]=(0,p.useState)(""),[l,o]=(0,p.useState)(""),[i,u]=(0,p.useState)(""),[s,c]=(0,p.useState)("Ready"),[m,h]=(0,p.useState)(!1),[g,w]=(0,p.useState)(0),[S,C]=(0,p.useState)(!1),[A,d]=(0,p.useState)(!0),a=(0,p.useRef)(null),[f,v]=(0,p.useState)([]),[E,P]=(0,p.useState)(""),[z,L]=(0,p.useState)(!1),Y=(0,p.useRef)(null),[M,Ie]=(0,p.useState)("read"),[Ul,fr]=(0,p.useState)(!1),[Bl,gd]=(0,p.useState)("General"),[Rl,md]=(0,p.useState)("GitHub"),[pr,hd]=(0,p.useState)(""),[gu,vd]=(0,p.useState)(!0),[r0,yd]=(0,p.useState)([]),[mu,hu]=(0,p.useState)(""),[vu,yu]=(0,p.useState)("localhost"),[xu,wu]=(0,p.useState)(11434),[ku,Su]=(0,p.useState)(!1),[Eu,Hl]=(0,p.useState)(!1);(0,p.useEffect)(()=>{e0();try{let k=le.getState?.()||{};if(k&&Array.isArray(k.threads))v(k.threads),P(k.currentId||k.threads[0]?.id||""),typeof k.historyOpen=="boolean"&&L(k.historyOpen),setTimeout(()=>{let _=(k.threads||[]).find(T=>T.id===(k.currentId||""));_&&a.current&&(a.current.innerHTML=_.html||"")},0);else{let _=_u();v([_]),P(_.id)}}catch{}let y=k=>{let _=k.data;switch(_.type){case"models":t(_.models||[]),(_.models||[]).length&&!n&&r((_.models||[])[0]),(_.models||[]).length>1&&!l&&o((_.models||[])[1]);break;case"prefill":u(_.text||"");break;case"config":Ie(_.mode),_.host&&yu(_.host),_.port&&wu(_.port),_.apiKey&&hu(_.apiKey);break;case"configSaved":Hl(!1);break;case"chatStart":C(!1),h(!1),w(T=>{let I=T+1;return c("Streaming"),I}),gr(_.model,!0);break;case"chatResume":h(!1),c("Streaming");break;case"chatChunk":Ed(_.text);break;case"chatDone":w(T=>{let I=Math.max(0,T-1);return c(I>0?"Streaming":"Ready"),I}),h(!1),Nd(),yn();break;case"error":case"chatError":C(!1),w(0),c("Error"),gr(`Error: ${"message"in _?_.message:""}`),yn();break;default:{_.type==="openReadmeGenerator"&&fr(!0),_.type==="switchThread"&&_.id&&Tu(_.id),_.type==="deleteThread"&&_.id&&Lu(_.id),_.type==="newThread"&&Wl();break}}};return window.addEventListener("message",y),le.postMessage({type:"requestModels"}),le.postMessage({type:"requestConfig"}),()=>window.removeEventListener("message",y)},[]);function Cu(){let y=n||e[0]||"",k=M==="combine"&&(l||e[1])||"";if(!y||!i.trim())return;if(M==="combine"&&!k){gr("Error: Combine mode requires two different models to be selected.");return}let T=(i.match(/@([\w\-\.\/]+)/g)||[]).map(I=>I.slice(1));Nu(i),C(!0),c("Streaming"),M==="combine"?le.postMessage({type:"startChat",models:[y,k],prompt:i,useChat:A,attachedFiles:T,mode:"combine"}):le.postMessage({type:"startChat",models:[y],prompt:i,useChat:A,attachedFiles:T,mode:M}),u(""),yd([])}function xd(){try{le.postMessage({type:"stop"})}catch{}C(!1),h(!1),c("Ready"),w(0)}function wd(){let y=n||e[0]||"";y&&(le.postMessage({type:"startReadme",model:y,style:Bl,placement:Rl,notes:pr,deep:gu}),Nu(`Generate a ${Bl} README for ${Rl}${pr?" with notes: "+pr:""}`))}function kd(){Hl(!0),le.postMessage({type:"updateConfig",config:{host:vu,port:xu,apiKey:mu}}),setTimeout(()=>{Hl(!1),Su(!1)},800)}function Vl(y){let k=y||(M==="read"?"agent":M==="agent"?"combine":"read");Ie(k),le.postMessage({type:"updateConfig",config:{mode:k}})}function Sd(){m?(le.postMessage({type:"resume"}),h(!1),c("Streaming")):(le.postMessage({type:"pause"}),h(!0),c("Ready"))}function Nu(y){let k=a.current,_=document.createElement("div");_.className="msg";let T=document.createElement("div");T.className="bubble user",T.textContent=y,_.appendChild(T),k.appendChild(_),k.scrollTop=k.scrollHeight;let I=zu();if(I&&(I.title==="New chat"||!I.title)){let H=zd(y);Pu(I.id,{title:H})}yn()}let ge=null;function gr(y,k=!1){let _=a.current,T=document.createElement("div");if(T.className="msg",y){let G=document.createElement("div");G.className="meta",G.textContent=y,T.appendChild(G)}let I=document.createElement("div");I.className="bubble assistant"+(k?" loading":""),k?I.innerHTML='<div class="ai-typing-indicator"><span></span><span></span><span></span></div>':I.textContent="",T.appendChild(I);let H=document.createElement("button");H.className="copy-all",H.title="Copy response",H.setAttribute("aria-label","Copy response"),H.innerHTML=`
      <svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `,H.addEventListener("click",async G=>{G.stopPropagation();try{await navigator.clipboard.writeText(I.textContent||""),H.classList.add("copied"),setTimeout(()=>H.classList.remove("copied"),1200)}catch{}}),I.appendChild(H),_.appendChild(T),_.scrollTop=_.scrollHeight,ge=I}function Ed(y){ge||gr(void 0,!0),ge.classList.contains("loading")&&(ge.classList.remove("loading"),ge.innerHTML=""),ge.textContent+=y;let k=a.current;k.scrollTop=k.scrollHeight}function $l(y){return y.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Cd(y){let k=$l(y);return k=k.replace(/```(\w+)?\n([\s\S]*?)```/g,(_,T,I)=>{let H=T||"plaintext",G=$l(I);return`<pre class="code-block" data-lang="${H}"><code class="language-${H}">${G}</code></pre>`}),k=k.replace(/`([^`]+)`/g,(_,T)=>`<code class="inline-code">${$l(T)}</code>`),k=k.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),k=k.replace(/\*([^*]+)\*/g,"<em>$1</em>"),k=k.replace(/^\s*[-*]\s+(.+)$/gm,"<li>$1</li>"),k=k.replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>"),k=k.replace(/^###\s+(.+)$/gm,"<h3>$1</h3>"),k=k.replace(/^##\s+(.+)$/gm,"<h2>$1</h2>"),k=k.replace(/^#\s+(.+)$/gm,"<h1>$1</h1>"),k=k.split(/\n\n+/).map(_=>_.trim().startsWith("<pre")||_.trim().startsWith("<h")||_.trim().startsWith("<ul")||_.trim().startsWith("<li")?_:`<p>${_.replace(/\n/g,"<br/>")}</p>`).join(""),k}function Nd(){if(!ge)return;let y=ge.textContent||"";if(ge.innerHTML=Cd(y),Y.current=ge,ge.querySelectorAll("pre.code-block").forEach(T=>{let I=T.getAttribute("data-lang")||"",H=document.createElement("div");H.className="code-header",H.innerHTML=`<span class="code-lang">${I}</span>`;let G=document.createElement("button");G.className="copy-code-btn",G.innerHTML=`
        <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="copy-text">Copy</span>
      `,G.addEventListener("click",async()=>{let Td=T.querySelector("code")?.textContent||"";try{await navigator.clipboard.writeText(Td),G.classList.add("copied");let mr=G.querySelector(".copy-text");mr&&(mr.textContent="Copied!"),setTimeout(()=>{G.classList.remove("copied"),mr&&(mr.textContent="Copy")},2e3)}catch{}}),H.appendChild(G),T.insertBefore(H,T.firstChild)}),!ge.querySelector(".copy-all")){let T=document.createElement("button");T.className="copy-all",T.title="Copy response",T.innerHTML=`
        <svg class="icon-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `,T.addEventListener("click",async I=>{I.stopPropagation();try{await navigator.clipboard.writeText(y),T.classList.add("copied"),setTimeout(()=>T.classList.remove("copied"),1200)}catch{}}),ge.appendChild(T)}try{let T=_d(y);if(T&&Array.isArray(T.changes)&&T.changes.length>0){let I=document.createElement("div");I.style.display="flex",I.style.gap="6px",I.style.marginTop="6px";let H=document.createElement("button");H.className="send",H.textContent="Review edits",H.addEventListener("click",()=>le.postMessage({type:"previewEdits",payload:T}));let G=document.createElement("button");G.className="send",G.textContent="Apply edits",G.addEventListener("click",()=>le.postMessage({type:"applyEdits",payload:T})),I.appendChild(H),I.appendChild(G),ge.parentElement?.appendChild(I),M==="agent"&&le.postMessage({type:"applyEdits",payload:T})}}catch{}}function _d(y){let k=y.match(/```(edits|json)\n([\s\S]*?)```/i);if(!k)return null;let _=k[2];try{let T=JSON.parse(_);if(T&&Array.isArray(T.changes))return T}catch{}return null}function zd(y){return y.trim().split(/\s+/).slice(0,8).join(" ")||"New chat"}function _u(){return{id:String(Date.now())+Math.random().toString(36).slice(2),title:"New chat",html:"",createdAt:Date.now()}}function zu(){return f.find(y=>y.id===E)}function Pu(y,k){v(_=>{let T=_.map(I=>I.id===y?{...I,...k}:I);return xn(T,E,z),T})}function yn(){let y=zu();if(!y||!a.current)return;let k=a.current.innerHTML||"";Pu(y.id,{html:k})}function Tu(y){yn(),P(y);let k=f.find(_=>_.id===y);k&&a.current&&(a.current.innerHTML=k.html||""),xn(f,y,z)}function Wl(){yn();let y=_u(),k=[y,...f];v(k),P(y.id),a.current&&(a.current.innerHTML=""),xn(k,y.id,z)}function Lu(y){let k=f.filter(T=>T.id!==y),_=E;y===E&&(_=k[0]?.id||"",a.current&&(a.current.innerHTML=k.find(T=>T.id===_)?.html||"")),v(k),P(_),xn(k,_,z)}function xn(y,k,_){try{le.setState?.({threads:y,currentId:k,historyOpen:_})}catch{}try{le.postMessage({type:"threadsUpdate",threads:y,currentId:k})}catch{}}(0,p.useEffect)(()=>{xn(f,E,z)},[z]),(0,p.useEffect)(()=>{try{le.postMessage({type:"threadsUpdate",threads:f,currentId:E})}catch{}},[E]);let Pd=(0,p.useMemo)(()=>({container:{fontFamily:"var(--vscode-font-family)",color:"var(--vscode-foreground)"}}),[]);return p.default.createElement("div",{className:"panel",style:Pd.container},(S||g>0)&&p.default.createElement("div",{className:"progress","aria-hidden":"true"}),p.default.createElement("div",{className:"toolbar"},p.default.createElement("span",{className:"title"},"Ollama"),p.default.createElement("div",{className:"model"},p.default.createElement("span",{className:"model-label"},"Model ",M==="combine"?"1":""),p.default.createElement("div",{className:"select-wrap"},p.default.createElement("select",{className:"select",value:n,onChange:y=>r(y.target.value),disabled:e.length===0},e.length===0?p.default.createElement("option",{value:""},"No models"):e.map(y=>p.default.createElement("option",{key:y,value:y},y))))),M==="combine"&&p.default.createElement("div",{className:"model"},p.default.createElement("span",{className:"model-label"},"Model 2"),p.default.createElement("div",{className:"select-wrap"},p.default.createElement("select",{className:"select",value:l,onChange:y=>o(y.target.value),disabled:e.length===0},e.length===0?p.default.createElement("option",{value:""},"No models"):e.map(y=>p.default.createElement("option",{key:y,value:y},y))))),p.default.createElement("span",{className:"tag"},m?"Paused":s,!m&&s==="Streaming"?p.default.createElement("span",{className:"dot-pulse"}):null),p.default.createElement("span",{className:"spacer"}),p.default.createElement("button",{className:"btn",onClick:()=>fr(y=>!y)},"\u{1F4C4} README"),(S||g>0)&&p.default.createElement("button",{className:"btn",onClick:Sd},m?"Resume":"Pause"),p.default.createElement("button",{className:`btn ${M==="combine"?"combine-active":""}`,onClick:()=>Vl("combine"),title:"Combine two AI models for better responses"},p.default.createElement("span",{className:"btn-icon"},"\u{1F500}"),p.default.createElement("span",{className:"btn-text"},"Combine Mode")),p.default.createElement("button",{className:"btn secondary",onClick:Wl},p.default.createElement("span",{className:"btn-icon"},"\uFF0B"),p.default.createElement("span",{className:"btn-text"},"New Chat")),p.default.createElement("div",{className:"mode-toggle"},p.default.createElement("button",{className:`mode-btn ${M==="read"?"active":""}`,onClick:()=>Vl("read")},p.default.createElement("span",{className:"btn-icon"},"\u{1F4D6}"),p.default.createElement("span",{className:"btn-text"},"Read")),p.default.createElement("button",{className:`mode-btn ${M==="agent"?"active":""}`,onClick:()=>Vl("agent")},p.default.createElement("span",{className:"btn-icon"},"\u{1F916}"),p.default.createElement("span",{className:"btn-text"},"Agent"))),p.default.createElement("label",{style:{display:"flex",gap:6,alignItems:"center"}},p.default.createElement("input",{type:"checkbox",checked:A,onChange:y=>d(y.target.checked)})," Chat API")),p.default.createElement("div",{className:`layout ${z?"with-history":""}`},p.default.createElement("aside",{className:"history","aria-label":"Conversations"},p.default.createElement("div",{className:"history-header"},p.default.createElement("span",null,"History"),p.default.createElement("button",{className:"icon",title:"New chat",onClick:Wl},"\uFF0B")),p.default.createElement("div",{className:"history-list"},f.map(y=>p.default.createElement("div",{key:y.id,className:`history-item ${y.id===E?"active":""}`},p.default.createElement("button",{className:"history-title",onClick:()=>Tu(y.id),title:y.title},y.title||"New chat"),p.default.createElement("button",{className:"icon del",title:"Delete",onClick:()=>Lu(y.id)},"\u2715"))),f.length===0&&p.default.createElement("div",{className:"history-empty"},"No conversations yet")),p.default.createElement("div",{className:"settings-section"},p.default.createElement("button",{className:"settings-toggle",onClick:()=>Su(!ku)},p.default.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2"},p.default.createElement("circle",{cx:"12",cy:"12",r:"3"}),p.default.createElement("path",{d:"M12 1v6m0 6v6m5.66-9l-3 5.2m-3.46 0l-3-5.2m-1.29 8.66l5.2-3m0-3.46l-5.2-3m14.49 1.29l-5.2 3m0 3.46l5.2 3"})),"Settings"),ku&&p.default.createElement("div",{className:"settings-panel"},p.default.createElement("h3",{style:{margin:"0 0 12px 0",fontSize:14}},"Connection Settings"),p.default.createElement("label",{className:"setting-label"},p.default.createElement("span",null,"Host"),p.default.createElement("input",{type:"text",value:vu,onChange:y=>yu(y.target.value),placeholder:"localhost"})),p.default.createElement("label",{className:"setting-label"},p.default.createElement("span",null,"Port"),p.default.createElement("input",{type:"number",value:xu,onChange:y=>wu(Number(y.target.value)),placeholder:"11434"})),p.default.createElement("label",{className:"setting-label"},p.default.createElement("span",null,"API Key (Optional)"),p.default.createElement("input",{type:"password",value:mu,onChange:y=>hu(y.target.value),placeholder:"Optional API Key"})),p.default.createElement("button",{className:"send",onClick:kd,disabled:Eu,style:{width:"100%",marginTop:8}},Eu?p.default.createElement(p.default.Fragment,null,p.default.createElement("span",{className:"spinner"})," Saving..."):"Save Settings")))),p.default.createElement("main",{className:"chat"},Ul&&p.default.createElement("div",{className:"readme-form"},p.default.createElement("div",{className:"readme-header"},p.default.createElement("h3",null,"\u{1F4C4} Generate README"),p.default.createElement("button",{className:"close-btn",onClick:()=>fr(!1),title:"Close"},"\u2715")),p.default.createElement("div",{className:"readme-options"},p.default.createElement("label",{className:"readme-field"},p.default.createElement("span",{className:"field-label"},"\u{1F4DD} Style"),p.default.createElement("select",{value:Bl,onChange:y=>gd(y.target.value)},p.default.createElement("option",null,"General"),p.default.createElement("option",null,"Technical (Functionality/API)"),p.default.createElement("option",null,"Product/Showcase"),p.default.createElement("option",null,"Library/Package"),p.default.createElement("option",null,"CLI Tool"),p.default.createElement("option",null,"Backend Service"))),p.default.createElement("label",{className:"readme-field"},p.default.createElement("span",{className:"field-label"},"\u{1F3AF} Placement"),p.default.createElement("select",{value:Rl,onChange:y=>md(y.target.value)},p.default.createElement("option",null,"GitHub"),p.default.createElement("option",null,"VS Code Marketplace"),p.default.createElement("option",null,"Internal Wiki"),p.default.createElement("option",null,"Website"))),p.default.createElement("label",{className:"readme-checkbox"},p.default.createElement("input",{type:"checkbox",checked:gu,onChange:y=>vd(y.target.checked)}),p.default.createElement("span",null,"\u{1F50D} Deep scan codebase (slower but more detailed)"))),p.default.createElement("textarea",{className:"readme-notes",placeholder:"\u2728 Additional notes: highlight key features, target audience, add badges, mention license, special instructions...",value:pr,onChange:y=>hd(y.target.value)}),p.default.createElement("div",{className:"readme-actions"},p.default.createElement("button",{className:"send",onClick:wd},p.default.createElement("span",null,"\u2728 Generate README")),p.default.createElement("button",{className:"btn",onClick:()=>fr(!1)},"Cancel"))),p.default.createElement("div",{id:"content",ref:a,className:"content","aria-live":"polite"}),p.default.createElement("div",{className:"composer"},p.default.createElement("textarea",{className:"prompt",value:i,onChange:y=>u(y.target.value),placeholder:"Ask anything... Type @filename to attach files (e.g., @src/app.ts)",onKeyDown:y=>{y.key==="Enter"&&!y.shiftKey&&(y.preventDefault(),Cu())}}),p.default.createElement("button",{className:"send",onClick:()=>g>0?xd():Cu(),disabled:S&&g===0},g>0?p.default.createElement("span",{style:{color:"#ff6b6b",fontWeight:700}},"Stop"):S?p.default.createElement(p.default.Fragment,null,p.default.createElement("span",{className:"spinner"})," Sending\u2026"):"Send")))))}function e0(){let e=`
    :root { color-scheme: dark; }
    html, body, #root { height: 100%; }
    body {
      font-family: Inter, 'Segoe UI', sans-serif;
      margin: 0;
      color: var(--vscode-editor-foreground, #e6e6e6);
      background: var(--vscode-editor-background, #1e1e1e);
      display: flex;
      height: 100vh;
      overflow: hidden; 
    }

    #root { width: 100%; display: flex; }

    .panel {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      backdrop-filter: blur(12px);
      background: var(--vscode-sideBar-background, rgba(30, 30, 30, 0.95));
      border: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.05));
    }

    /* Toolbar */
    .toolbar {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.08));
      background: var(--vscode-titleBar-activeBackground, rgba(30, 30, 30, 0.95));
      position: sticky;
      top: 0;
      z-index: 3;
      backdrop-filter: blur(14px);
      flex-wrap: wrap;
      min-height: 48px;
    }

    .toolbar .title {
      font-weight: 600;
      font-size: 15px;
      color: var(--vscode-titleBar-activeForeground, #ffffff);
      margin-right: auto;
    }
    
    .toolbar .spacer {
      flex: 1;
      min-width: 20px;
    }

    .icon, .btn, .send {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--vscode-button-secondaryForeground, #e6e6e6);
      border-radius: 10px;
      padding: 8px 14px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .icon:hover, .btn:hover, .send:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px) scale(1.05);
      box-shadow: 
        0 8px 20px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }

    .btn.secondary {
      background: linear-gradient(135deg, 
        rgba(14, 99, 156, 0.9) 0%, 
        rgba(14, 99, 156, 0.8) 100%);
      color: var(--vscode-button-foreground, #ffffff);
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 4px 16px rgba(14, 99, 156, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    .btn.secondary:hover {
      background: linear-gradient(135deg, 
        rgba(14, 99, 156, 1) 0%, 
        rgba(14, 99, 156, 0.9) 100%);
      box-shadow: 
        0 8px 24px rgba(14, 99, 156, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }

    .btn.combine-active {
      background: linear-gradient(135deg, 
        rgba(255, 107, 107, 0.9) 0%,
        rgba(238, 90, 111, 0.85) 50%,
        rgba(255, 107, 107, 0.9) 100%);
      color: white;
      font-weight: 700;
      border: 2px solid rgba(255, 255, 255, 0.4);
      box-shadow: 
        0 8px 32px rgba(255, 107, 107, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      animation: pulse-combine 2s ease-in-out infinite;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .btn.combine-active:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 
        0 12px 40px rgba(255, 107, 107, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    }

    @keyframes pulse-combine {
      0%, 100% {
        box-shadow: 
          0 8px 32px rgba(255, 107, 107, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }
      50% {
        box-shadow: 
          0 12px 48px rgba(255, 107, 107, 0.7),
          0 0 30px rgba(255, 107, 107, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.4),
          inset 0 -1px 0 rgba(0, 0, 0, 0.2);
      }
    }

    /* Responsive button text/icons */
    .btn-text {
      display: inline;
    }
    
    .btn-icon {
      display: none;
    }

    /* Keep Combine button always prominent */
    .btn.combine-active .btn-text {
      display: inline !important;
    }

    @media (max-width: 1200px) {
      .toolbar {
        gap: 8px;
        padding: 10px 12px;
      }
      .model {
        flex-direction: column;
        gap: 4px;
        align-items: flex-start;
        padding: 4px 8px;
      }
      .select {
        min-width: 180px;
        padding: 10px 38px 10px 44px;
        font-size: 13px;
      }
    }

    @media (max-width: 900px) {
      .btn-text:not(.combine-active .btn-text) {
        display: none;
      }
      .btn-icon {
        display: inline;
      }
      .mode-btn {
        padding: 6px 10px;
      }
      .select {
        min-width: 160px;
        padding: 10px 36px 10px 42px;
        font-size: 12px;
      }
      .model-label {
        font-size: 11px;
      }
      /* Combine button stays visible with icon and text */
      .btn.combine-active {
        padding: 8px 12px;
      }
    }

    .model { 
      display:flex; 
      align-items:center; 
      gap:10px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .model-label { 
      font-size: 13px;
      font-weight: 600;
      color: var(--vscode-foreground, #e6e6e6);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    .select-wrap { 
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .select-wrap::before {
      content: '\u{1F916}';
      position: absolute;
      left: 16px;
      font-size: 18px;
      pointer-events: none;
      z-index: 2;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    .select {
      min-width: 220px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.1) 0%, 
        rgba(255, 255, 255, 0.05) 50%,
        rgba(255, 255, 255, 0.08) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      color: var(--vscode-input-foreground, #ffffff);
      border-radius: 16px;
      padding: 12px 42px 12px 48px;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-size: 14px;
      font-weight: 600;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      letter-spacing: 0.5px;
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      position: relative;
      overflow: hidden;
    }
    .select::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.1), 
        transparent);
      transition: left 0.5s ease;
    }
    .select:hover::before {
      left: 100%;
    }
    .select:hover {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.15) 0%, 
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.12) 100%);
      border-color: rgba(100, 150, 255, 0.4);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 12px 40px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1),
        0 0 20px rgba(100, 150, 255, 0.15);
    }
    .select:focus {
      outline: none;
      border-color: rgba(100, 150, 255, 0.8);
      background: linear-gradient(135deg, 
        rgba(100, 150, 255, 0.15) 0%, 
        rgba(100, 150, 255, 0.08) 50%,
        rgba(100, 150, 255, 0.12) 100%);
      box-shadow: 
        0 16px 48px rgba(0, 0, 0, 0.25),
        0 0 0 4px rgba(100, 150, 255, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.3),
        inset 0 -1px 0 rgba(0, 0, 0, 0.1);
      transform: translateY(-2px) scale(1.02);
    }
    .select:active {
      transform: translateY(0) scale(1);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.15),
        inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .select option {
      background: rgba(30, 30, 30, 0.98);
      color: var(--vscode-dropdown-foreground, #ffffff);
      padding: 12px 16px;
      font-weight: 600;
      backdrop-filter: blur(20px);
    }
    .select-wrap::after {
      content: '\u25BC';
      position: absolute; 
      right: 16px;
      top: 50%; 
      transform: translateY(-50%);
      font-size: 10px;
      opacity: .6;
      pointer-events: none;
      color: var(--vscode-foreground, #e6e6e6);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }
    .select:hover + .select-wrap::after,
    .select:focus + .select-wrap::after {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }

    /* Layout */
    .layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      min-height: 0;
      flex: 1;
      overflow: hidden;
    }

    .layout:not(.with-history) { grid-template-columns: 0 1fr; }

    /* Sidebar */
    .history {
      overflow-y: auto;
      border-right: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
      background: var(--vscode-sideBar-background, rgba(30, 30, 30, 0.95));
      backdrop-filter: blur(12px);
      transition: all 0.3s ease;
    }

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
    }

    .history-list {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .history-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid var(--vscode-list-inactiveSelectionBackground, rgba(255,255,255,0.08));
      border-radius: 10px;
      padding: 8px 10px;
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.03));
      transition: all 0.25s ease;
    }

    .history-item:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.06));
      transform: scale(1.01);
    }

    .history-item.active {
      border-color: var(--vscode-list-activeSelectionBackground, rgba(14, 99, 156, 0.5));
      background: var(--vscode-list-activeSelectionBackground, rgba(14, 99, 156, 0.3));
    }

    .history-title {
      background: transparent;
      border: none;
      color: var(--vscode-foreground, #e6e6e6);
      flex: 1;
      text-align: left;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Chat */
    .chat {
      display: flex;
      flex-direction: column;
      min-width: 0;
      min-height: 0; 
      height: 100%;
      background: var(--vscode-editor-background, rgba(30,30,30,0.95));
      backdrop-filter: blur(14px);
    }

    .content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Messages */
    .msg {
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: fadeIn 0.3s ease forwards;
    }

    .bubble {
      display: inline-block; 
      max-width: 90%;
      padding: 14px 16px;
      border-radius: 14px;
      line-height: 1.5;
      font-size: 14px;
      box-shadow: 0 0 8px rgba(255,255,255,0.05);
      overflow-wrap: anywhere;
    }

    .assistant {
      background: linear-gradient(145deg, rgba(40,40,40,0.9), rgba(25,25,25,0.9));
      border: 1px solid rgba(255,255,255,0.08);
      align-self: flex-start;
      position: relative;
    }

    .user {
      background: linear-gradient(145deg, #1a73e8, #1559b3);
      color: white;
      align-self: flex-end;
      border: none;
    }

    .meta {
      font-size: 11px;
      opacity: 0.7;
    }

    
    .bubble p { margin: 0 0 8px; }
    .bubble p:last-child { margin-bottom: 0; }

    pre.code { max-width: 100%; margin: 8px 0; }

    /* Composer */
    .composer {
     
      position: sticky;
      bottom: 0;
      background: var(--vscode-editor-background, rgba(30,30,30,0.95));
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
      padding: 10px 14px;
      display: flex;
      gap: 10px;
      align-items: flex-end;
    }

    .prompt {
      flex: 1;
      min-height: 60px;
      resize: none;
      background: var(--vscode-input-background, rgba(255,255,255,0.05));
      color: var(--vscode-input-foreground, #e6e6e6);
      border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.08));
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
    }

    .prompt:focus {
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 1));
      background: var(--vscode-input-background, rgba(255,255,255,0.08));
    }

    .send {
      border-radius: 10px;
      font-weight: 500;
      padding: 10px 18px;
      background: var(--vscode-button-background, linear-gradient(135deg, #1a73e8, #1559b3));
      color: var(--vscode-button-foreground, white);
      border: none;
    }

    .send:hover {
      background: var(--vscode-button-hoverBackground, linear-gradient(135deg, #1a73e8, #1559b3));
      filter: brightness(1.1);
      transform: scale(1.03);
    }

    /* README Generator Form */
    .readme-form {
      padding: 20px;
      border-bottom: 1px solid var(--vscode-panel-border, rgba(255,255,255,0.08));
      background: var(--vscode-editor-background, rgba(30,30,30,0.98));
      border-radius: 12px;
      margin: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .readme-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .readme-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--vscode-foreground, #ffffff);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: var(--vscode-foreground, #cccccc);
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.1));
      color: var(--vscode-errorForeground, #f48771);
    }

    .readme-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 12px;
    }

    .readme-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--vscode-foreground, #cccccc);
      opacity: 0.9;
    }

    .readme-field select {
      background: var(--vscode-dropdown-background, rgba(60,60,60,0.95));
      border: 1px solid var(--vscode-dropdown-border, rgba(255,255,255,0.12));
      color: var(--vscode-dropdown-foreground, #e6e6e6);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .readme-field select:hover {
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 0.8));
    }

    .readme-field select:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 1));
    }

    .readme-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      grid-column: 1 / -1;
      padding: 8px;
      border-radius: 6px;
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.03));
    }

    .readme-checkbox input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .readme-checkbox span {
      font-size: 13px;
      color: var(--vscode-foreground, #cccccc);
    }

    .readme-notes {
      width: 100%;
      min-height: 80px;
      resize: vertical;
      background: var(--vscode-input-background, rgba(255,255,255,0.05));
      color: var(--vscode-input-foreground, #e6e6e6);
      border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.08));
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 13px;
      font-family: inherit;
      margin-bottom: 12px;
    }

    .readme-notes:focus {
      outline: none;
      border-color: var(--vscode-focusBorder, rgba(14, 99, 156, 1));
    }

    .readme-notes::placeholder {
      color: var(--vscode-input-placeholderForeground, rgba(255,255,255,0.5));
    }

    .readme-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .copy-all {
      position: absolute;
      top: 8px; right: 8px;
      width: 28px; height: 28px;
      display: inline-flex;
      align-items: center; justify-content: center;
      background: rgba(255,255,255,0.06);
      color: #e6e6e6;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      cursor: pointer;
      opacity: .85;
      transition: all .2s ease;
    }
    .copy-all:hover { background: rgba(255,255,255,0.12); opacity: 1; }
    .copy-all .icon-check { display: none; }
    .copy-all.copied { color: #45c46b; transform: scale(1.05); }
    .copy-all.copied .icon-copy { display: none; }
    .copy-all.copied .icon-check { display: inline; }

    /* Effects */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.1);
      color: #fff;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
    }

    .dot-pulse {
      width: 6px; height: 6px;
      background: #1a73e8;
      border-radius: 50%;
      animation: pulse 1s infinite ease-in-out;
    }

    @keyframes pulse {
      0%,100% { opacity: .4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.3); }
    }

    /* Responsive */
    @media (max-width: 900px) {
      .layout {
        grid-template-columns: 0 1fr;
      }
      .layout.with-history {
        grid-template-columns: min(70vw, 240px) 1fr;
      }
      .toolbar {
        flex-wrap: wrap;
        gap: 8px;
      }
      .model { width: 100%; }
      .select { min-width: 0; width: 100%; }
    }

    .progress {
      position: sticky;
      top: 0;
      height: 2px;
      background: transparent;
      overflow: hidden;
    }

    .progress::before {
      content: '';
      display: block;
      height: 100%;
      width: 30%;
      background: #1a73e8;
      animation: indet 1.2s infinite;
    }

    @keyframes indet {
      0% { margin-left: -30%; }
      50% { margin-left: 50%; }
      100% { margin-left: 100%; }
    }

    /* Settings Panel */
    .settings-section {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .settings-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 10px 12px;
      color: #e6e6e6;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .settings-toggle:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.15);
    }

    .settings-toggle svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
      transition: transform 0.2s ease;
    }

    .settings-panel {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      margin-top: 8px;
    }

    .settings-panel.show {
      max-height: 400px;
    }

    .setting-label {
      display: block;
      color: #b3b3b3;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 4px;
      margin-top: 12px;
    }

    .settings-panel input {
      width: 100%;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      padding: 8px 12px;
      color: #e6e6e6;
      font-size: 13px;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .settings-panel input:focus {
      outline: none;
      background: rgba(255,255,255,0.08);
      border-color: #1a73e8;
      box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
    }

    .settings-panel button {
      width: 100%;
      margin-top: 16px;
      padding: 10px;
      background: linear-gradient(135deg, #1a73e8, #1559b3);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .settings-panel button:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .settings-panel button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Composer Actions & Mode Toggle */
    .composer-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
    }

    .mode-toggle {
      display: flex;
      gap: 6px;
      background: var(--vscode-input-background, rgba(255,255,255,0.04));
      border-radius: 8px;
      padding: 4px;
      border: 1px solid var(--vscode-input-border, rgba(255,255,255,0.1));
    }

    .mode-btn {
      padding: 6px 14px;
      background: transparent;
      border: none;
      color: var(--vscode-foreground, #b3b3b3);
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .mode-btn:hover {
      background: var(--vscode-list-hoverBackground, rgba(255,255,255,0.06));
      color: var(--vscode-foreground, #e6e6e6);
    }

    .mode-btn.active {
      background: var(--vscode-button-background, linear-gradient(135deg, #1a73e8, #1559b3));
      color: var(--vscode-button-foreground, white);
      box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }

    /* AI Response Loading Animation */
    @keyframes typing {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .ai-typing-indicator {
      display: inline-flex;
      gap: 4px;
      padding: 14px 16px;
      align-items: center;
    }

    .ai-typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--vscode-textLink-foreground, #4db8ff);
      animation: typing 1.4s infinite;
    }

    .ai-typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .ai-typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    /* Enhanced Code Blocks */
    .code-block {
      position: relative;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      margin: 12px 0;
      overflow: hidden;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .code-lang {
      font-size: 11px;
      font-weight: 600;
      color: #b3b3b3;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .copy-code-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 5px;
      color: #e6e6e6;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .copy-code-btn:hover {
      background: rgba(255,255,255,0.12);
      border-color: rgba(255,255,255,0.2);
    }

    .copy-code-btn.copied {
      background: rgba(69, 196, 107, 0.15);
      border-color: rgba(69, 196, 107, 0.3);
      color: #45c46b;
    }

    .copy-code-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
    }

    .code-block pre {
      margin: 0;
      padding: 14px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.6;
      color: #e6e6e6;
    }

    .code-block code {
      display: block;
      font-family: inherit;
      white-space: pre;
    }

    /* Inline Code */
    .inline-code {
      display: inline;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 4px;
      padding: 2px 6px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      color: #f0f0f0;
    }

    /* Syntax Highlighting */
    .language-javascript .keyword, .language-typescript .keyword, .language-js .keyword, .language-ts .keyword {
      color: #c586c0;
    }

    .language-javascript .string, .language-typescript .string, .language-js .string, .language-ts .string {
      color: #ce9178;
    }

    .language-javascript .function, .language-typescript .function, .language-js .function, .language-ts .function {
      color: #dcdcaa;
    }

    .language-javascript .comment, .language-typescript .comment, .language-js .comment, .language-ts .comment {
      color: #6a9955;
      font-style: italic;
    }

    .language-python .keyword {
      color: #569cd6;
    }

    .language-python .string {
      color: #ce9178;
    }

    .language-python .function {
      color: #dcdcaa;
    }

    .language-python .comment {
      color: #6a9955;
      font-style: italic;
    }

    .language-html .tag, .language-xml .tag {
      color: #569cd6;
    }

    .language-html .attr-name, .language-xml .attr-name {
      color: #9cdcfe;
    }

    .language-html .attr-value, .language-xml .attr-value {
      color: #ce9178;
    }

    .language-css .property {
      color: #9cdcfe;
    }

    .language-css .value {
      color: #ce9178;
    }

    .language-css .selector {
      color: #d7ba7d;
    }

    .language-json .property {
      color: #9cdcfe;
    }

    .language-json .string {
      color: #ce9178;
    }

    .language-json .number {
      color: #b5cea8;
    }

    /* Loading Spinner */
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #1a73e8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Improved Bubble Styling - Remove Card Appearance */
    .bubble.assistant {
      background: transparent;
      border: none;
      box-shadow: none;
      padding: 0;
      margin: 16px 0;
    }

    .bubble.assistant p {
      margin: 8px 0;
      line-height: 1.6;
      color: #e6e6e6;
    }

    .bubble.assistant h1,
    .bubble.assistant h2,
    .bubble.assistant h3,
    .bubble.assistant h4 {
      margin: 16px 0 8px 0;
      font-weight: 600;
      color: #f0f0f0;
      line-height: 1.4;
    }

    .bubble.assistant h1 {
      font-size: 1.8em;
      border-bottom: 2px solid rgba(255,255,255,0.1);
      padding-bottom: 8px;
    }

    .bubble.assistant h2 {
      font-size: 1.5em;
    }

    .bubble.assistant h3 {
      font-size: 1.3em;
    }

    .bubble.assistant ul,
    .bubble.assistant ol {
      margin: 8px 0;
      padding-left: 24px;
      line-height: 1.8;
    }

    .bubble.assistant li {
      margin: 4px 0;
      color: #e6e6e6;
    }

    .bubble.assistant strong {
      font-weight: 600;
      color: #f0f0f0;
    }

    .bubble.assistant em {
      font-style: italic;
      color: #d0d0d0;
    }

    .bubble.assistant blockquote {
      margin: 12px 0;
      padding: 8px 16px;
      border-left: 4px solid rgba(26, 115, 232, 0.5);
      background: rgba(26, 115, 232, 0.05);
      color: #d0d0d0;
      font-style: italic;
    }

    .bubble.assistant a {
      color: #1a73e8;
      text-decoration: none;
      border-bottom: 1px solid rgba(26, 115, 232, 0.3);
      transition: all 0.2s ease;
    }

    .bubble.assistant a:hover {
      border-bottom-color: #1a73e8;
    }
  `,t=document.createElement("style");t.textContent=e,document.head.appendChild(t)}var t0=document.getElementById("root"),n0=(0,pd.createRoot)(t0);n0.render(fd.default.createElement(pu,null));})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.min.js:
  (**
   * @license React
   * scheduler.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.min.js:
  (**
   * @license React
   * react-dom.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
