// https://stackoverflow.com/a/9517879
let s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
s.id = "injectedscript";
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
