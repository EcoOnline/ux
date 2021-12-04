var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function r(e){e.forEach(t)}function o(e){return"function"==typeof e}function i(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function a(e,t){e.appendChild(t)}function s(e,t,n){e.insertBefore(t,n||null)}function l(e){e.parentNode.removeChild(e)}function u(e){return document.createElement(e)}function c(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function f(e){return document.createTextNode(e)}function d(){return f(" ")}function g(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function p(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function h(e,t){e.value=null==t?"":t}function m(e,t,n,r){e.style.setProperty(t,n,r?"important":"")}function S(e,t,n){e.classList[n?"add":"remove"](t)}let v;function b(e){v=e}const y=[],C=[],x=[],P=[],w=Promise.resolve();let F=!1;function I(e){x.push(e)}let D=!1;const U=new Set;function T(){if(!D){D=!0;do{for(let e=0;e<y.length;e+=1){const t=y[e];b(t),E(t.$$)}for(b(null),y.length=0;C.length;)C.pop()();for(let e=0;e<x.length;e+=1){const t=x[e];U.has(t)||(U.add(t),t())}x.length=0}while(y.length);for(;P.length;)P.pop()();F=!1,D=!1,U.clear()}}function E(e){if(null!==e.fragment){e.update(),r(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(I)}}const G=new Set;function R(e,t){-1===e.$$.dirty[0]&&(y.push(e),F||(F=!0,w.then(T)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function L(i,a,s,u,c,f,d=[-1]){const g=v;b(i);const p=i.$$={fragment:null,ctx:null,props:f,update:e,not_equal:c,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(g?g.$$.context:[]),callbacks:n(),dirty:d,skip_bound:!1};let h=!1;if(p.ctx=s?s(i,a.props||{},((e,t,...n)=>{const r=n.length?n[0]:t;return p.ctx&&c(p.ctx[e],p.ctx[e]=r)&&(!p.skip_bound&&p.bound[e]&&p.bound[e](r),h&&R(i,e)),t})):[],p.update(),h=!0,r(p.before_update),p.fragment=!!u&&u(p.ctx),a.target){if(a.hydrate){const e=function(e){return Array.from(e.childNodes)}(a.target);p.fragment&&p.fragment.l(e),e.forEach(l)}else p.fragment&&p.fragment.c();a.intro&&((m=i.$$.fragment)&&m.i&&(G.delete(m),m.i(S))),function(e,n,i,a){const{fragment:s,on_mount:l,on_destroy:u,after_update:c}=e.$$;s&&s.m(n,i),a||I((()=>{const n=l.map(t).filter(o);u?u.push(...n):r(n),e.$$.on_mount=[]})),c.forEach(I)}(i,a.target,a.anchor,a.customElement),T()}var m,S;b(g)}var $="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var M,A=(function(e,t){(function(){var n=function(e){return e instanceof n?e:this instanceof n?void(this.EXIFwrapped=e):new n(e)};e.exports&&(t=e.exports=n),t.EXIF=n;var r=n.Tags={36864:"ExifVersion",40960:"FlashpixVersion",40961:"ColorSpace",40962:"PixelXDimension",40963:"PixelYDimension",37121:"ComponentsConfiguration",37122:"CompressedBitsPerPixel",37500:"MakerNote",37510:"UserComment",40964:"RelatedSoundFile",36867:"DateTimeOriginal",36868:"DateTimeDigitized",37520:"SubsecTime",37521:"SubsecTimeOriginal",37522:"SubsecTimeDigitized",33434:"ExposureTime",33437:"FNumber",34850:"ExposureProgram",34852:"SpectralSensitivity",34855:"ISOSpeedRatings",34856:"OECF",37377:"ShutterSpeedValue",37378:"ApertureValue",37379:"BrightnessValue",37380:"ExposureBias",37381:"MaxApertureValue",37382:"SubjectDistance",37383:"MeteringMode",37384:"LightSource",37385:"Flash",37396:"SubjectArea",37386:"FocalLength",41483:"FlashEnergy",41484:"SpatialFrequencyResponse",41486:"FocalPlaneXResolution",41487:"FocalPlaneYResolution",41488:"FocalPlaneResolutionUnit",41492:"SubjectLocation",41493:"ExposureIndex",41495:"SensingMethod",41728:"FileSource",41729:"SceneType",41730:"CFAPattern",41985:"CustomRendered",41986:"ExposureMode",41987:"WhiteBalance",41988:"DigitalZoomRation",41989:"FocalLengthIn35mmFilm",41990:"SceneCaptureType",41991:"GainControl",41992:"Contrast",41993:"Saturation",41994:"Sharpness",41995:"DeviceSettingDescription",41996:"SubjectDistanceRange",40965:"InteroperabilityIFDPointer",42016:"ImageUniqueID"},o=n.TiffTags={256:"ImageWidth",257:"ImageHeight",34665:"ExifIFDPointer",34853:"GPSInfoIFDPointer",40965:"InteroperabilityIFDPointer",258:"BitsPerSample",259:"Compression",262:"PhotometricInterpretation",274:"Orientation",277:"SamplesPerPixel",284:"PlanarConfiguration",530:"YCbCrSubSampling",531:"YCbCrPositioning",282:"XResolution",283:"YResolution",296:"ResolutionUnit",273:"StripOffsets",278:"RowsPerStrip",279:"StripByteCounts",513:"JPEGInterchangeFormat",514:"JPEGInterchangeFormatLength",301:"TransferFunction",318:"WhitePoint",319:"PrimaryChromaticities",529:"YCbCrCoefficients",532:"ReferenceBlackWhite",306:"DateTime",270:"ImageDescription",271:"Make",272:"Model",305:"Software",315:"Artist",33432:"Copyright"},i=n.GPSTags={0:"GPSVersionID",1:"GPSLatitudeRef",2:"GPSLatitude",3:"GPSLongitudeRef",4:"GPSLongitude",5:"GPSAltitudeRef",6:"GPSAltitude",7:"GPSTimeStamp",8:"GPSSatellites",9:"GPSStatus",10:"GPSMeasureMode",11:"GPSDOP",12:"GPSSpeedRef",13:"GPSSpeed",14:"GPSTrackRef",15:"GPSTrack",16:"GPSImgDirectionRef",17:"GPSImgDirection",18:"GPSMapDatum",19:"GPSDestLatitudeRef",20:"GPSDestLatitude",21:"GPSDestLongitudeRef",22:"GPSDestLongitude",23:"GPSDestBearingRef",24:"GPSDestBearing",25:"GPSDestDistanceRef",26:"GPSDestDistance",27:"GPSProcessingMethod",28:"GPSAreaInformation",29:"GPSDateStamp",30:"GPSDifferential"},a=n.IFD1Tags={256:"ImageWidth",257:"ImageHeight",258:"BitsPerSample",259:"Compression",262:"PhotometricInterpretation",273:"StripOffsets",274:"Orientation",277:"SamplesPerPixel",278:"RowsPerStrip",279:"StripByteCounts",282:"XResolution",283:"YResolution",284:"PlanarConfiguration",296:"ResolutionUnit",513:"JpegIFOffset",514:"JpegIFByteCount",529:"YCbCrCoefficients",530:"YCbCrSubSampling",531:"YCbCrPositioning",532:"ReferenceBlackWhite"},s=n.StringValues={ExposureProgram:{0:"Not defined",1:"Manual",2:"Normal program",3:"Aperture priority",4:"Shutter priority",5:"Creative program",6:"Action program",7:"Portrait mode",8:"Landscape mode"},MeteringMode:{0:"Unknown",1:"Average",2:"CenterWeightedAverage",3:"Spot",4:"MultiSpot",5:"Pattern",6:"Partial",255:"Other"},LightSource:{0:"Unknown",1:"Daylight",2:"Fluorescent",3:"Tungsten (incandescent light)",4:"Flash",9:"Fine weather",10:"Cloudy weather",11:"Shade",12:"Daylight fluorescent (D 5700 - 7100K)",13:"Day white fluorescent (N 4600 - 5400K)",14:"Cool white fluorescent (W 3900 - 4500K)",15:"White fluorescent (WW 3200 - 3700K)",17:"Standard light A",18:"Standard light B",19:"Standard light C",20:"D55",21:"D65",22:"D75",23:"D50",24:"ISO studio tungsten",255:"Other"},Flash:{0:"Flash did not fire",1:"Flash fired",5:"Strobe return light not detected",7:"Strobe return light detected",9:"Flash fired, compulsory flash mode",13:"Flash fired, compulsory flash mode, return light not detected",15:"Flash fired, compulsory flash mode, return light detected",16:"Flash did not fire, compulsory flash mode",24:"Flash did not fire, auto mode",25:"Flash fired, auto mode",29:"Flash fired, auto mode, return light not detected",31:"Flash fired, auto mode, return light detected",32:"No flash function",65:"Flash fired, red-eye reduction mode",69:"Flash fired, red-eye reduction mode, return light not detected",71:"Flash fired, red-eye reduction mode, return light detected",73:"Flash fired, compulsory flash mode, red-eye reduction mode",77:"Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",79:"Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",89:"Flash fired, auto mode, red-eye reduction mode",93:"Flash fired, auto mode, return light not detected, red-eye reduction mode",95:"Flash fired, auto mode, return light detected, red-eye reduction mode"},SensingMethod:{1:"Not defined",2:"One-chip color area sensor",3:"Two-chip color area sensor",4:"Three-chip color area sensor",5:"Color sequential area sensor",7:"Trilinear sensor",8:"Color sequential linear sensor"},SceneCaptureType:{0:"Standard",1:"Landscape",2:"Portrait",3:"Night scene"},SceneType:{1:"Directly photographed"},CustomRendered:{0:"Normal process",1:"Custom process"},WhiteBalance:{0:"Auto white balance",1:"Manual white balance"},GainControl:{0:"None",1:"Low gain up",2:"High gain up",3:"Low gain down",4:"High gain down"},Contrast:{0:"Normal",1:"Soft",2:"Hard"},Saturation:{0:"Normal",1:"Low saturation",2:"High saturation"},Sharpness:{0:"Normal",1:"Soft",2:"Hard"},SubjectDistanceRange:{0:"Unknown",1:"Macro",2:"Close view",3:"Distant view"},FileSource:{3:"DSC"},Components:{0:"",1:"Y",2:"Cb",3:"Cr",4:"R",5:"G",6:"B"}};function l(e){return!!e.exifdata}function u(e,t){function r(r){var o=c(r);e.exifdata=o||{};var i=function(e){var t=new DataView(e);if(255!=t.getUint8(0)||216!=t.getUint8(1))return!1;for(var n=2,r=e.byteLength,o=function(e,t){return 56===e.getUint8(t)&&66===e.getUint8(t+1)&&73===e.getUint8(t+2)&&77===e.getUint8(t+3)&&4===e.getUint8(t+4)&&4===e.getUint8(t+5)};n<r;){if(o(t,n)){var i=t.getUint8(n+7);return i%2!=0&&(i+=1),0===i&&(i=4),d(e,n+8+i,t.getUint16(n+6+i))}n++}}(r);if(e.iptcdata=i||{},n.isXmpEnabled){var a=function(e){if("DOMParser"in self){var t=new DataView(e);if(255!=t.getUint8(0)||216!=t.getUint8(1))return!1;for(var n=2,r=e.byteLength,o=new DOMParser;n<r-4;){if("http"==h(t,n,4)){var i=n-1,a=t.getUint16(n-2)-1,s=h(t,i,a),l=s.indexOf("xmpmeta>")+8,u=(s=s.substring(s.indexOf("<x:xmpmeta"),l)).indexOf("x:xmpmeta")+10;return s=s.slice(0,u)+'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tiff="http://ns.adobe.com/tiff/1.0/" xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '+s.slice(u),v(o.parseFromString(s,"text/xml"))}n++}}}(r);e.xmpdata=a||{}}t&&t.call(e)}if(e.src)if(/^data\:/i.test(e.src))r(function(e,t){t=t||e.match(/^data\:([^\;]+)\;base64,/im)[1]||"",e=e.replace(/^data\:([^\;]+)\;base64,/gim,"");for(var n=atob(e),r=n.length,o=new ArrayBuffer(r),i=new Uint8Array(o),a=0;a<r;a++)i[a]=n.charCodeAt(a);return o}(e.src));else if(/^blob\:/i.test(e.src))(i=new FileReader).onload=function(e){r(e.target.result)},function(e,t){var n=new XMLHttpRequest;n.open("GET",e,!0),n.responseType="blob",n.onload=function(e){200!=this.status&&0!==this.status||t(this.response)},n.send()}(e.src,(function(e){i.readAsArrayBuffer(e)}));else{var o=new XMLHttpRequest;o.onload=function(){if(200!=this.status&&0!==this.status)throw"Could not load image";r(o.response),o=null},o.open("GET",e.src,!0),o.responseType="arraybuffer",o.send(null)}else if(self.FileReader&&(e instanceof self.Blob||e instanceof self.File)){var i;(i=new FileReader).onload=function(e){r(e.target.result)},i.readAsArrayBuffer(e)}}function c(e){var t=new DataView(e);if(255!=t.getUint8(0)||216!=t.getUint8(1))return!1;for(var n=2,r=e.byteLength;n<r;){if(255!=t.getUint8(n))return!1;if(225==t.getUint8(n+1))return m(t,n+4,t.getUint16(n+2));n+=2+t.getUint16(n+2)}}var f={120:"caption",110:"credit",25:"keywords",55:"dateCreated",80:"byline",85:"bylineTitle",122:"captionWriter",105:"headline",116:"copyright",15:"category"};function d(e,t,n){for(var r,o,i,a,s=new DataView(e),l={},u=t;u<t+n;)28===s.getUint8(u)&&2===s.getUint8(u+1)&&(a=s.getUint8(u+2))in f&&(i=s.getInt16(u+3),o=f[a],r=h(s,u+5,i),l.hasOwnProperty(o)?l[o]instanceof Array?l[o].push(r):l[o]=[l[o],r]:l[o]=r),u++;return l}function g(e,t,n,r,o){var i,a,s=e.getUint16(n,!o),l={};for(a=0;a<s;a++)i=n+12*a+2,l[r[e.getUint16(i,!o)]]=p(e,i,t,0,o);return l}function p(e,t,n,r,o){var i,a,s,l,u,c,f=e.getUint16(t+2,!o),d=e.getUint32(t+4,!o),g=e.getUint32(t+8,!o)+n;switch(f){case 1:case 7:if(1==d)return e.getUint8(t+8,!o);for(i=d>4?g:t+8,a=[],l=0;l<d;l++)a[l]=e.getUint8(i+l);return a;case 2:return h(e,i=d>4?g:t+8,d-1);case 3:if(1==d)return e.getUint16(t+8,!o);for(i=d>2?g:t+8,a=[],l=0;l<d;l++)a[l]=e.getUint16(i+2*l,!o);return a;case 4:if(1==d)return e.getUint32(t+8,!o);for(a=[],l=0;l<d;l++)a[l]=e.getUint32(g+4*l,!o);return a;case 5:if(1==d)return u=e.getUint32(g,!o),c=e.getUint32(g+4,!o),(s=new Number(u/c)).numerator=u,s.denominator=c,s;for(a=[],l=0;l<d;l++)u=e.getUint32(g+8*l,!o),c=e.getUint32(g+4+8*l,!o),a[l]=new Number(u/c),a[l].numerator=u,a[l].denominator=c;return a;case 9:if(1==d)return e.getInt32(t+8,!o);for(a=[],l=0;l<d;l++)a[l]=e.getInt32(g+4*l,!o);return a;case 10:if(1==d)return e.getInt32(g,!o)/e.getInt32(g+4,!o);for(a=[],l=0;l<d;l++)a[l]=e.getInt32(g+8*l,!o)/e.getInt32(g+4+8*l,!o);return a}}function h(e,t,n){var r="";for(let o=t;o<t+n;o++)r+=String.fromCharCode(e.getUint8(o));return r}function m(e,t){if("Exif"!=h(e,t,4))return!1;var n,l,u,c,f,d=t+6;if(18761==e.getUint16(d))n=!1;else{if(19789!=e.getUint16(d))return!1;n=!0}if(42!=e.getUint16(d+2,!n))return!1;var p=e.getUint32(d+4,!n);if(p<8)return!1;if((l=g(e,d,d+p,o,n)).ExifIFDPointer)for(u in c=g(e,d,d+l.ExifIFDPointer,r,n)){switch(u){case"LightSource":case"Flash":case"MeteringMode":case"ExposureProgram":case"SensingMethod":case"SceneCaptureType":case"SceneType":case"CustomRendered":case"WhiteBalance":case"GainControl":case"Contrast":case"Saturation":case"Sharpness":case"SubjectDistanceRange":case"FileSource":c[u]=s[u][c[u]];break;case"ExifVersion":case"FlashpixVersion":c[u]=String.fromCharCode(c[u][0],c[u][1],c[u][2],c[u][3]);break;case"ComponentsConfiguration":c[u]=s.Components[c[u][0]]+s.Components[c[u][1]]+s.Components[c[u][2]]+s.Components[c[u][3]]}l[u]=c[u]}if(l.GPSInfoIFDPointer)for(u in f=g(e,d,d+l.GPSInfoIFDPointer,i,n)){switch(u){case"GPSVersionID":f[u]=f[u][0]+"."+f[u][1]+"."+f[u][2]+"."+f[u][3]}l[u]=f[u]}return l.thumbnail=function(e,t,n,r){var o=function(e,t,n){var r=e.getUint16(t,!n);return e.getUint32(t+2+12*r,!n)}(e,t+n,r);if(!o)return{};if(o>e.byteLength)return{};var i=g(e,t,t+o,a,r);if(i.Compression)switch(i.Compression){case 6:if(i.JpegIFOffset&&i.JpegIFByteCount){var s=t+i.JpegIFOffset,l=i.JpegIFByteCount;i.blob=new Blob([new Uint8Array(e.buffer,s,l)],{type:"image/jpeg"})}break;case 1:console.log("Thumbnail image format is TIFF, which is not implemented.");break;default:console.log("Unknown thumbnail image format '%s'",i.Compression)}else 2==i.PhotometricInterpretation&&console.log("Thumbnail image format is RGB, which is not implemented.");return i}(e,d,p,n),l}function S(e){var t={};if(1==e.nodeType){if(e.attributes.length>0){t["@attributes"]={};for(var n=0;n<e.attributes.length;n++){var r=e.attributes.item(n);t["@attributes"][r.nodeName]=r.nodeValue}}}else if(3==e.nodeType)return e.nodeValue;if(e.hasChildNodes())for(var o=0;o<e.childNodes.length;o++){var i=e.childNodes.item(o),a=i.nodeName;if(null==t[a])t[a]=S(i);else{if(null==t[a].push){var s=t[a];t[a]=[],t[a].push(s)}t[a].push(S(i))}}return t}function v(e){try{var t={};if(e.children.length>0)for(var n=0;n<e.children.length;n++){var r=e.children.item(n),o=r.attributes;for(var i in o){var a=o[i],s=a.nodeName,l=a.nodeValue;void 0!==s&&(t[s]=l)}var u=r.nodeName;if(void 0===t[u])t[u]=S(r);else{if(void 0===t[u].push){var c=t[u];t[u]=[],t[u].push(c)}t[u].push(S(r))}}else t=e.textContent;return t}catch(e){console.log(e.message)}}n.enableXmp=function(){n.isXmpEnabled=!0},n.disableXmp=function(){n.isXmpEnabled=!1},n.getData=function(e,t){return!((self.Image&&e instanceof self.Image||self.HTMLImageElement&&e instanceof self.HTMLImageElement)&&!e.complete||(l(e)?t&&t.call(e):u(e,t),0))},n.getTag=function(e,t){if(l(e))return e.exifdata[t]},n.getIptcTag=function(e,t){if(l(e))return e.iptcdata[t]},n.getAllTags=function(e){if(!l(e))return{};var t,n=e.exifdata,r={};for(t in n)n.hasOwnProperty(t)&&(r[t]=n[t]);return r},n.getAllIptcTags=function(e){if(!l(e))return{};var t,n=e.iptcdata,r={};for(t in n)n.hasOwnProperty(t)&&(r[t]=n[t]);return r},n.pretty=function(e){if(!l(e))return"";var t,n=e.exifdata,r="";for(t in n)n.hasOwnProperty(t)&&("object"==typeof n[t]?n[t]instanceof Number?r+=t+" : "+n[t]+" ["+n[t].numerator+"/"+n[t].denominator+"]\r\n":r+=t+" : ["+n[t].length+" values]\r\n":r+=t+" : "+n[t]+"\r\n");return r},n.readFromBinaryFile=function(e){return c(e)}}).call($)}(M={exports:{}},M.exports),M.exports);function O(e,t,n){const r=e.slice();return r[17]=t[n],r[19]=n,r}function k(e){let t,n,r;function o(){return e[12](e[19])}return{c(){t=u("div"),p(t,"class","thumbnail svelte-aa7czp"),m(t,"background-image","url("+e[17]+")")},m(e,i){s(e,t,i),n||(r=g(t,"click",o),n=!0)},p(n,r){e=n,1&r&&m(t,"background-image","url("+e[17]+")")},d(e){e&&l(t),n=!1,r()}}}function B(t){let n,o,i,v,b,y,C,x,P,w,F,I,D,U,T,E,G,R,L,$,M,A,B=JSON.stringify(t[1],null,4)+"",N=t[0].photo,_=[];for(let e=0;e<N.length;e+=1)_[e]=k(O(t,N,e));return{c(){n=u("div"),o=u("div"),i=u("div"),v=u("div"),b=f("Upload\n                "),y=c("svg"),C=c("path"),x=d(),P=u("input"),w=d();for(let e=0;e<_.length;e+=1)_[e].c();F=d(),I=u("div"),D=u("div"),U=u("label"),U.textContent="Location",T=d(),E=u("input"),G=d(),R=u("pre"),L=u("code"),$=f(B),p(C,"fill-rule","evenodd"),p(C,"clip-rule","evenodd"),p(C,"d","M3 26C2.44772 26 2 25.5523 2 25V8C2 7.44772 2.44772 7 3 7H9.46L11.17 4.45C11.354 4.17061 11.6655 4.00173 12 4H20C20.3345 4.00173 20.646 4.17061 20.83 4.45L22.54 7H29C29.5523 7 30 7.44772 30 8V25C30 25.5523 29.5523 26 29 26H3ZM10 16C10 19.3137 12.6863 22 16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16ZM12 16C12 13.7909 13.7909 12 16 12C18.2091 12 20 13.7909 20 16C20 18.2091 18.2091 20 16 20C13.7909 20 12 18.2091 12 16ZM28 24H4V9H10C10.3345 8.99827 10.646 8.82939 10.83 8.55L12.54 6H19.46L21.17 8.55C21.354 8.82939 21.6655 8.99827 22 9H28V24Z"),p(C,"fill","#1A1919"),p(y,"width","32"),p(y,"height","32"),p(y,"viewBox","0 0 32 32"),p(y,"fill","none"),p(y,"xmlns","http://www.w3.org/2000/svg"),p(y,"class","svelte-aa7czp"),p(P,"type","file"),p(P,"accept","image/jpg, image/jpeg"),p(P,"capture","camera"),p(P,"class","svelte-aa7czp"),p(v,"class","photo_button drop_region svelte-aa7czp"),p(v,"ondragover","return false"),S(v,"highlight",t[3]),p(i,"class","step svelte-aa7czp"),m(i,"height","auto"),p(U,"for","event_location"),p(U,"class","svelte-aa7czp"),p(E,"id","event_location"),p(E,"type","text"),p(E,"class","form-control svelte-aa7czp"),p(D,"class","form-row svelte-aa7czp"),p(I,"class","step svelte-aa7czp"),m(I,"height","auto"),p(o,"class","pane svelte-aa7czp"),p(n,"class","single_page")},m(e,r){s(e,n,r),a(n,o),a(o,i),a(i,v),a(v,b),a(v,y),a(y,C),a(v,x),a(v,P),t[10](P),t[11](v),a(i,w);for(let e=0;e<_.length;e+=1)_[e].m(i,null);a(o,F),a(o,I),a(I,D),a(D,U),a(D,T),a(D,E),h(E,t[0].event_location),a(I,G),a(I,R),a(R,L),a(L,$),M||(A=[g(P,"change",t[6]),g(v,"click",t[5]),g(v,"drop",t[7]),g(v,"dragenter",t[8]),g(v,"dragleave",t[9]),g(E,"input",t[13])],M=!0)},p(e,[t]){if(8&t&&S(v,"highlight",e[3]),1&t){let n;for(N=e[0].photo,n=0;n<N.length;n+=1){const r=O(e,N,n);_[n]?_[n].p(r,t):(_[n]=k(r),_[n].c(),_[n].m(i,null))}for(;n<_.length;n+=1)_[n].d(1);_.length=N.length}1&t&&E.value!==e[0].event_location&&h(E,e[0].event_location),2&t&&B!==(B=JSON.stringify(e[1],null,4)+"")&&function(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}($,B)},i:e,o:e,d(e){e&&l(n),t[10](null),t[11](null),function(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}(_,e),M=!1,r(A)}}}function N(e,t,n){A.EXIF.enableXmp();let r,o,i={photo:[]},a={},s=!1,l=new FileReader;function u(){n(3,s=!1)}function c(e){for(var t=0,n=e.length;t<n;t++)l.readAsDataURL(e[t])}l.onload=function(e){i.photo.push(e.target.result),n(0,i);let t=document.createElement("img");t.src=e.target.result,document.body.appendChild(t),A.EXIF.getData(t,(function(){n(1,a=A.EXIF.getAllTags(this)),console.log("img",a,A.EXIF.pretty(t))})),setTimeout((()=>{n(4,o.value="",o)}),100)};return[i,a,r,s,o,function(){o.click()},function(){c(o.files)},function(e){e.preventDefault(),c(e.dataTransfer.files),u()},function(){n(3,s=!0)},u,function(e){C[e?"unshift":"push"]((()=>{o=e,n(4,o)}))},function(e){C[e?"unshift":"push"]((()=>{r=e,n(2,r)}))},e=>{i.photo.splice(e,1),n(0,i)},function(){i.event_location=this.value,n(0,i)}]}return new class extends class{$destroy(){!function(e,t){const n=e.$$;null!==n.fragment&&(r(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),L(this,e,N,B,i,{})}}({target:document.getElementById("app")})}();
//# sourceMappingURL=image_location.js.map
