var nav_menu_show = false;
var nav_menu_modal = document.getElementById('nav-menu-content');

var navbar_account = document.getElementById('account');
console.log(navbar_account);
if(navbar_account !== null) 
navbar_account.addEventListener('click',function(){
    if(nav_menu_show === false) {
        nav_menu_modal.style.display = 'block';
        nav_menu_show = true;
    }
    else {
        nav_menu_close();
    }
});

var nav_menu_btn_close = document.getElementById("nav-menu-btn-close");
nav_menu_btn_close.addEventListener('click',nav_menu_close);

function nav_menu_close() {
    nav_menu_modal.style.display = 'none';
    nav_menu_show = false;
}