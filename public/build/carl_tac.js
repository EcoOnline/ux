var app=function(){"use strict";function e(){}function t(e){return e()}function i(){return Object.create(null)}function s(e){e.forEach(t)}function a(e){return"function"==typeof e}function n(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function l(e,t){e.appendChild(t)}function u(e,t,i){e.insertBefore(t,i||null)}function r(e){e.parentNode.removeChild(e)}function o(e){return document.createElement(e)}function c(e){return document.createTextNode(e)}function p(){return c(" ")}function d(e,t,i,s){return e.addEventListener(t,i,s),()=>e.removeEventListener(t,i,s)}function m(e,t,i){null==i?e.removeAttribute(t):e.getAttribute(t)!==i&&e.setAttribute(t,i)}function v(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}let f;function g(e){f=e}const h=[],q=[],b=[],$=[],x=Promise.resolve();let S=!1;function y(e){b.push(e)}let _=!1;const k=new Set;function P(){if(!_){_=!0;do{for(let e=0;e<h.length;e+=1){const t=h[e];g(t),w(t.$$)}for(g(null),h.length=0;q.length;)q.pop()();for(let e=0;e<b.length;e+=1){const t=b[e];k.has(t)||(k.add(t),t())}b.length=0}while(h.length);for(;$.length;)$.pop()();S=!1,_=!1,k.clear()}}function w(e){if(null!==e.fragment){e.update(),s(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(y)}}const D=new Set;function L(e,t){e&&e.i&&(D.delete(e),e.i(t))}function M(e,i,n,l){const{fragment:u,on_mount:r,on_destroy:o,after_update:c}=e.$$;u&&u.m(i,n),l||y((()=>{const i=r.map(t).filter(a);o?o.push(...i):s(i),e.$$.on_mount=[]})),c.forEach(y)}function E(e,t){const i=e.$$;null!==i.fragment&&(s(i.on_destroy),i.fragment&&i.fragment.d(t),i.on_destroy=i.fragment=null,i.ctx=[])}function C(e,t){-1===e.$$.dirty[0]&&(h.push(e),S||(S=!0,x.then(P)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function N(t,a,n,l,u,o,c=[-1]){const p=f;g(t);const d=t.$$={fragment:null,ctx:null,props:o,update:e,not_equal:u,bound:i(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:[]),callbacks:i(),dirty:c,skip_bound:!1};let m=!1;if(d.ctx=n?n(t,a.props||{},((e,i,...s)=>{const a=s.length?s[0]:i;return d.ctx&&u(d.ctx[e],d.ctx[e]=a)&&(!d.skip_bound&&d.bound[e]&&d.bound[e](a),m&&C(t,e)),i})):[],d.update(),m=!0,s(d.before_update),d.fragment=!!l&&l(d.ctx),a.target){if(a.hydrate){const e=function(e){return Array.from(e.childNodes)}(a.target);d.fragment&&d.fragment.l(e),e.forEach(r)}else d.fragment&&d.fragment.c();a.intro&&L(t.$$.fragment),M(t,a.target,a.anchor,a.customElement),P()}g(p)}class I{$destroy(){E(this,1),this.$destroy=e}$on(e,t){const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(t),()=>{const e=i.indexOf(t);-1!==e&&i.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}function T(e,t,i){const s=e.slice();return s[4]=t[i],s[5]=t,s[6]=i,s}function Q(e){let t,i,s,a=e[0].label+"";return{c(){t=o("label"),i=c(a),m(t,"for",s=e[0].id)},m(e,s){u(e,t,s),l(t,i)},p(e,n){1&n&&a!==(a=e[0].label+"")&&v(i,a),1&n&&s!==(s=e[0].id)&&m(t,"for",s)},d(e){e&&r(t)}}}function j(e){let t,i,s=e[0].hint+"";return{c(){t=o("p"),i=c(s),m(t,"class","svelte-1wnxz4y")},m(e,s){u(e,t,s),l(t,i)},p(e,t){1&t&&s!==(s=e[0].hint+"")&&v(i,s)},d(e){e&&r(t)}}}function A(e){let t,i,a,n,f,g,h,q,b,$,x,S=e[4].text+"";function y(){e[2].call(a,e[5],e[6])}function _(){return e[3](e[4],e[5],e[6])}return{c(){t=o("div"),i=o("label"),a=o("input"),n=p(),f=o("span"),g=p(),h=o("span"),q=c(S),b=p(),m(a,"type","checkbox"),m(a,"class","svelte-1wnxz4y"),m(f,"class","slider svelte-1wnxz4y"),m(i,"class","switch svelte-1wnxz4y"),m(t,"class","switch-holder svelte-1wnxz4y")},m(s,r){u(s,t,r),l(t,i),l(i,a),a.checked=e[4].value,l(i,n),l(i,f),l(t,g),l(t,h),l(h,q),l(t,b),$||(x=[d(a,"change",y),d(h,"click",_)],$=!0)},p(t,i){e=t,1&i&&(a.checked=e[4].value),1&i&&S!==(S=e[4].text+"")&&v(q,S)},d(e){e&&r(t),$=!1,s(x)}}}function z(t){let i,s,a,n=t[0].label&&Q(t),c=t[0].hint&&j(t),d=t[0].options,v=[];for(let e=0;e<d.length;e+=1)v[e]=A(T(t,d,e));return{c(){i=o("div"),n&&n.c(),s=p(),c&&c.c(),a=p();for(let e=0;e<v.length;e+=1)v[e].c();m(i,"class","form-item")},m(e,t){u(e,i,t),n&&n.m(i,null),l(i,s),c&&c.m(i,null),l(i,a);for(let e=0;e<v.length;e+=1)v[e].m(i,null)},p(e,[t]){if(e[0].label?n?n.p(e,t):(n=Q(e),n.c(),n.m(i,s)):n&&(n.d(1),n=null),e[0].hint?c?c.p(e,t):(c=j(e),c.c(),c.m(i,a)):c&&(c.d(1),c=null),1&t){let s;for(d=e[0].options,s=0;s<d.length;s+=1){const a=T(e,d,s);v[s]?v[s].p(a,t):(v[s]=A(a),v[s].c(),v[s].m(i,null))}for(;s<v.length;s+=1)v[s].d(1);v.length=d.length}},i:e,o:e,d(e){e&&r(i),n&&n.d(),c&&c.d(),function(e,t){for(let i=0;i<e.length;i+=1)e[i]&&e[i].d(t)}(v,e)}}}function H(e,t,i){let{f:s}=t,{channel:a="ANSWER"}=t;return e.$$set=e=>{"f"in e&&i(0,s=e.f),"channel"in e&&i(1,a=e.channel)},[s,a,function(e,t){e[t].value=this.checked,i(0,s)},(e,t,a)=>{i(0,t[a].value=!e.value,s)}]}class O extends I{constructor(e){super(),N(this,e,H,z,n,{f:0,channel:1})}}function R(t){let i,s,a,n,c,v,f,g,h,q,b,$,x,S,y,_,k,P,w;return x=new O({props:{f:t[0]}}),{c(){var e;i=o("div"),s=o("div"),a=o("div"),a.innerHTML="<h1>SAFETY POLICY</h1>",n=p(),c=o("div"),v=o("p"),v.innerHTML="<i>Last updated Feb 24th 2022</i>",f=p(),g=o("h4"),g.textContent="AGREEMENT TO TERMS",h=p(),q=o("div"),q.innerHTML="<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p> \n                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel euismod libero. Donec id convallis velit. Suspendisse pellentesque neque sit amet sapien porttitor, at pharetra enim vulputate. Maecenas vel risus accumsan, pulvinar velit sollicitudin, sagittis libero.</p> \n                <p>Pellentesque a felis luctus, ullamcorper ipsum quis, malesuada tellus. Duis vestibulum semper sagittis. Sed auctor augue quis elit placerat posuere. Sed facilisis lacinia est nec maximus. Integer at odio sit amet dolor venenatis pulvinar nec ac neque. Curabitur ullamcorper vitae tortor id ultrices. Quisque eget lacinia lacus. Nulla dapibus quam at leo dignissim aliquam.</p>",b=p(),$=o("div"),(e=x.$$.fragment)&&e.c(),S=p(),y=o("div"),_=o("span"),_.textContent="Submit",m(a,"class","card-header"),m(q,"class","tac-content svelte-cajhik"),m($,"class","tac"),m(_,"class","btn"),m(c,"class","card-body svelte-cajhik"),m(s,"class","card svelte-cajhik"),m(i,"class","page svelte-cajhik")},m(e,r){u(e,i,r),l(i,s),l(s,a),l(s,n),l(s,c),l(c,v),l(c,f),l(c,g),l(c,h),l(c,q),l(c,b),l(c,$),M(x,$,null),l(c,S),l(c,y),l(y,_),k=!0,P||(w=d(_,"click",t[1]),P=!0)},p:e,i(e){k||(L(x.$$.fragment,e),k=!0)},o(e){!function(e,t,i,s){if(e&&e.o){if(D.has(e))return;D.add(e),(void 0).c.push((()=>{D.delete(e),s&&(i&&e.d(1),s())})),e.o(t)}}(x.$$.fragment,e),k=!1},d(e){e&&r(i),E(x),P=!1,w()}}}function F(e){let t={options:[{value:!1,text:"I agree to the terms and conditions"}]};return[t,function(){void 0!==window.messageHandler&&messageHandler.postMessage(t.options[0].value)}]}return new class extends I{constructor(e){super(),N(this,e,F,R,n,{})}}({target:document.body})}();
//# sourceMappingURL=carl_tac.js.map