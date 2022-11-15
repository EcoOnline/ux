
let cmad = {}; //global namespace to avoid collisions

cmad.loadHomeAd = function() {
    cmad.ifrm = document.createElement("iframe");
    cmad.ifrm.setAttribute("src", "http://google.com/");
    cmad.ifrm.style.width = "640px";
    cmad.ifrm.style.height = "480px";
    cmad.ifrm.style.position = "absolute";
    cmad.ifrm.style.top = 0;
    cmad.ifrm.style.right = 0;
    cmad.loadPoint.appendChild(cmad.ifrm);
}

cmad.loadPoint = Array.from(document.querySelectorAll('div.text-h2'))
  .find(el => el.textContent.trim() === 'Chemical Manager').parentNode;

if(cmad.loadPoint) {
    cmad.loadHomeAd()
}




/*document demo hack to load this script
const script = document.createElement('script');
script.setAttribute('src', 'https://ecoonline.github.io/ux/src/cmad.js');
script.setAttribute('async', '');
document.head.appendChild(script);
*/