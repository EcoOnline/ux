var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function r(t){return"function"==typeof t}function i(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function l(t){t.parentNode.removeChild(t)}let s;function a(t){s=t}const c=[],u=[],f=[],d=[],h=Promise.resolve();let m=!1;function p(t){f.push(t)}let g=!1;const $=new Set;function b(){if(!g){g=!0;do{for(let t=0;t<c.length;t+=1){const n=c[t];a(n),y(n.$$)}for(a(null),c.length=0;u.length;)u.pop()();for(let t=0;t<f.length;t+=1){const n=f[t];$.has(n)||($.add(n),n())}f.length=0}while(c.length);for(;d.length;)d.pop()();m=!1,g=!1,$.clear()}}function y(t){if(null!==t.fragment){t.update(),o(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(p)}}const _=new Set;function x(t,n){-1===t.$$.dirty[0]&&(c.push(t),m||(m=!0,h.then(b)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function k(i,c,u,f,d,h,m=[-1]){const g=s;a(i);const $=i.$$={fragment:null,ctx:null,props:h,update:t,not_equal:d,bound:e(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(g?g.$$.context:[]),callbacks:e(),dirty:m,skip_bound:!1};let y=!1;if($.ctx=u?u(i,c.props||{},((t,n,...e)=>{const o=e.length?e[0]:n;return $.ctx&&d($.ctx[t],$.ctx[t]=o)&&(!$.skip_bound&&$.bound[t]&&$.bound[t](o),y&&x(i,t)),n})):[],$.update(),y=!0,o($.before_update),$.fragment=!!f&&f($.ctx),c.target){if(c.hydrate){const t=function(t){return Array.from(t.childNodes)}(c.target);$.fragment&&$.fragment.l(t),t.forEach(l)}else $.fragment&&$.fragment.c();c.intro&&((k=i.$$.fragment)&&k.i&&(_.delete(k),k.i(w))),function(t,e,i,l){const{fragment:s,on_mount:a,on_destroy:c,after_update:u}=t.$$;s&&s.m(e,i),l||p((()=>{const e=a.map(n).filter(r);c?c.push(...e):o(e),t.$$.on_mount=[]})),u.forEach(p)}(i,c.target,c.anchor,c.customElement),b()}var k,w;a(g)}function w(n){let e;return{c(){var t,n,o,r;t="div",e=document.createElement(t),e.innerHTML="<h1>EcoOnline UX Tools &amp; Experiments</h1> \n    <h4>Who am I</h4> \n    <ul><li><b>Hayden Chambers</b></li> \n        <li>Role: Senior Product Dsigner, UX team</li> \n        <li>Came on board with Engage team</li> \n        <li>started with them nearly 4 years ago as a &#39;frontend&#39;</li> \n        <li>- ux/ui</li> \n        <li>- fronted coding</li></ul> \n    <h4>What do I do now?</h4> \n    <ul><li>Started with the rebrand</li> \n        <li>Assist with Design System components</li> \n        <li>Create icons and ux mockups</li> \n        <li>Make Arnfinn lose more hair</li> \n        <li>And...</li> \n        <li>Tools and experiments</li></ul>",n=e,o="class",null==(r="page")?n.removeAttribute(o):n.getAttribute(o)!==r&&n.setAttribute(o,r)},m(t,n){!function(t,n,e){t.insertBefore(n,e||null)}(t,e,n)},p:t,i:t,o:t,d(t){t&&l(e)}}}return new class extends class{$destroy(){!function(t,n){const e=t.$$;null!==e.fragment&&(o(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(t){var n;this.$$set&&(n=t,0!==Object.keys(n).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}{constructor(t){super(),k(this,t,null,w,i,{})}}({target:document.body})}();
//# sourceMappingURL=what_is_it.js.map
