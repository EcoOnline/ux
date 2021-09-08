var cssId = 'ehstest';  // you could encode the css path itself to generate id..
if (!document.getElementById(cssId)) {
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'http://website.com/css/stylesheet.css';
    link.media = 'all';
    head.appendChild(link);
}