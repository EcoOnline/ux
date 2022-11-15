
let cmad = {}; //global namespace to avoid collisions

cmad.loadHomeAd = function() {
    cmad.ifrm = document.createElement("iframe");
    cmad.ifrm.setAttribute("src", "//ecoonline.github.io/ux/public/cmad.html");
    cmad.ifrm.setAttribute("allowtransparency","true");
    cmad.ifrm.style.width = "640px";
    cmad.ifrm.style.height = "177px";
    cmad.ifrm.style.border = "none";
    cmad.ifrm.style.position = "absolute";
    cmad.ifrm.style.top = 0;
    cmad.ifrm.style.right = 0;
    cmad.loadPoint.appendChild(cmad.ifrm);
}

//check for home page
if(window.location.href.split('#/')[1] == 'main') {

    //this is very brittle way of trying to find where to attach the ad
    cmad.loadPoint = Array.from(document.querySelectorAll('div.text-h2'))
    .find(el => el.textContent.trim() === 'Chemical Manager').parentNode;

    //finding language would be even worse.. there is nothing in the head to indicate it (html lang is always en)
    //would have to seek out a known module like 'search' and map 'Buscar' = spanish



    //dont load if no loadpoint found and on small devices
    if(cmad.loadPoint && window.innerWidth > 600) {
        cmad.loadPoint.style.position = 'relative;'
        cmad.loadHomeAd()
    }


}





/*document demo hack to load this script
const script = document.createElement('script');
script.setAttribute('src', 'https://ecoonline.github.io/ux/src/cmad.js');
script.setAttribute('async', '');
document.head.appendChild(script);
*/