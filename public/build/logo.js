var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function r(t){return"function"==typeof t}function c(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function s(t){t.parentNode.removeChild(t)}function i(t,n,e){t.classList[e?"add":"remove"](n)}let u;function a(t){u=t}const l=[],f=[],d=[],p=[],h=Promise.resolve();let m=!1;function $(t){d.push(t)}let g=!1;const b=new Set;function v(){if(!g){g=!0;do{for(let t=0;t<l.length;t+=1){const n=l[t];a(n),x(n.$$)}for(a(null),l.length=0;f.length;)f.pop()();for(let t=0;t<d.length;t+=1){const n=d[t];b.has(n)||(b.add(n),n())}d.length=0}while(l.length);for(;p.length;)p.pop()();m=!1,g=!1,b.clear()}}function x(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach($)}}const y=new Set;function C(t,n){-1===t.$$.dirty[0]&&(l.push(t),m||(m=!0,h.then(v)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function _(c,i,l,f,d,p,h=[-1]){const m=u;a(c);const g=c.$$={fragment:null,ctx:null,props:p,update:t,not_equal:d,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(m?m.$$.context:[]),callbacks:e(),dirty:h,skip_bound:!1};let b=!1;if(g.ctx=l?l(c,i.props||{},((t,n,...e)=>{const o=e.length?e[0]:n;return g.ctx&&d(g.ctx[t],g.ctx[t]=o)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](o),b&&C(c,t)),n})):[],g.update(),b=!0,o(g.before_update),g.fragment=!!f&&f(g.ctx),i.target){if(i.hydrate){const t=function(t){return Array.from(t.childNodes)}(i.target);g.fragment&&g.fragment.l(t),t.forEach(s)}else g.fragment&&g.fragment.c();i.intro&&((x=c.$$.fragment)&&x.i&&(y.delete(x),x.i(_))),function(t,e,c,s){const{fragment:i,on_mount:u,on_destroy:a,after_update:l}=t.$$;i&&i.m(e,c),s||$((()=>{const e=u.map(n).filter(r);a?a.push(...e):o(e),t.$$.on_mount=[]})),l.forEach($)}(c,i.target,i.anchor,i.customElement),v()}var x,_;a(m)}function w(n){let e,o,r;return{c(){var t,o,r,c;t="div",e=document.createElement(t),e.innerHTML='<svg width="493px" height="476px" viewBox="0 0 493 576" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="svelte-1du4tp0"><path d="M113.2,268.5 C113,237.6 112.9,102.1 112.9,60.3 C112.9,53.5 118.4,48 125.2,48 L500.1,48 C507.2,48 512.9,53.7 512.9,60.8 L512.9,251.1 C514.1,308.2 496.2,367.7 457.4,415.7 C422.2,459.4 374.9,491.3 315.8,505.6 C313.9,506.1 311.9,506.1 309.9,505.7 C217.6,485.2 168.3,415.7 168.3,415.7 C168.3,415.7 205.5,417.4 251.9,406 C287.5,396.7 314.8,385.3 335.9,373 C432.5,316.7 415.1,227.2 403.8,206.7 C397.4,193.4 408.5,184.9 412.8,183.8 C414.8,183.26 422.86,180.67 436.99,176.03 C437.69,175.39 438.05,174.53 438.05,173.46 C437.95,171.86 436.99,171.01 436.99,171.01 C436.99,171.01 412.8,156.20 412.8,156.20 C411.3,154.50 405.5,137.9 383.8,131.5 C364.4,125.8 349.6,133.7 346.6,135 C317.9,149.7 319,179.7 319,179.7 L186.2,310.7 L38,410.7" class="svelte-1du4tp0"></path></svg>',o=e,r="class",null==(c="svelte-1du4tp0")?o.removeAttribute(r):o.getAttribute(r)!==c&&o.setAttribute(r,c),i(e,"preload",n[2]),i(e,"anim",n[0]),i(e,"bob",n[1])},m(t,c){var s,i,u,a;!function(t,n,e){t.insertBefore(n,e||null)}(t,e,c),o||(s=e,i="click",u=n[3],s.addEventListener(i,u,a),r=()=>s.removeEventListener(i,u,a),o=!0)},p(t,[n]){4&n&&i(e,"preload",t[2]),1&n&&i(e,"anim",t[0]),2&n&&i(e,"bob",t[1])},i:t,o:t,d(t){t&&s(e),o=!1,r()}}}function k(t,n,e){let o=!1,r=!1,c=!0;return[o,r,c,function(){e(2,c=!1),o?(e(0,o=!1),e(1,r=!1)):(e(0,o=!0),setTimeout((function(){e(1,r=!0),setTimeout((function(){e(1,r=!1)}),200)}),5e3))}]}return new class extends class{$destroy(){!function(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),_(this,t,k,w,c,{})}}({target:document.body})}();
//# sourceMappingURL=logo.js.map
