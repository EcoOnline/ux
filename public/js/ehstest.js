var head  = document.getElementsByTagName('head')[0];
var link  = document.createElement('link');
link.rel  = 'stylesheet';
link.type = 'text/css';
link.href = 'https://ecoonline.github.io/ux/public/css/ehstest.css?cache=' + Math.random();
head.appendChild(link);