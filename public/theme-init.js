(function(){
 var key="elmam.theme";
 function read(){try{return localStorage.getItem(key)==="dark"?"dark":"light"}catch(e){return "light"}}
 function apply(theme){var light=theme==="light",root=document.documentElement;root.dataset.theme=light?"light":"dark";root.classList.toggle("dark",!light);root.style.colorScheme=light?"light":"dark";var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=light?"#F6F9FC":"#000000";document.querySelectorAll("[data-theme-toggle]").forEach(function(button){button.textContent=light?"الوضع الداكن":"الوضع الفاتح";button.setAttribute("aria-label",light?"تفعيل الوضع الداكن":"تفعيل الوضع الفاتح")})}
 apply(read());
 document.addEventListener("DOMContentLoaded",function(){apply(read())});
 document.addEventListener("click",function(e){if(!e.target.closest("[data-theme-toggle]"))return;var theme=document.documentElement.dataset.theme==="light"?"dark":"light";try{localStorage.setItem(key,theme)}catch(e){}apply(theme)});
 addEventListener("storage",function(e){if(e.key===key)apply(read())});
})();
