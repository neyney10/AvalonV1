
$('.spanremove').click(function(){
    console.log($(this).parent().text()); 
    var t = $(this);
    jQuery.post( '/delete',{user: $(this).parent().text()} , function(){t.parent().remove();}, 'text'  );
    
});

$('.fa-user-edit').click(function(){
    alert( "Handler for .click() called." );
});



///////////// AUTO - COMPLETE ////////////////
var autoc = document.getElementById('search-input');

function closeList() {
    var l = document.getElementById("autocomplete-panel");
    if(l) {
        l.parentNode.removeChild(l);
    }
}

autoc.addEventListener('input',function(){
    var data =[];

    jQuery.post( '/usersearch',{user: this.value } , function(users){
        data = JSON.parse(users);
        console.log('recieved data');
        console.log(data);

        console.log(data.length);
    if(data.length > 0) {

        //remove/close existing list
        closeList();

        var a = document.createElement("div");
        a.setAttribute("id", "autocomplete-panel"); //?
        a.setAttribute("class", "autocomplete-items");

        autoc.parentNode.appendChild(a);
        for(var i = 0; i < data.length; i++)
        {
            var b = document.createElement("div");
            b.innerHTML = "<strong>" + data[i].substr(0, autoc.value.length) + "</strong>";
            b.innerHTML += data[i].substr(autoc.value.length);
            b.addEventListener('click', function(){
                autoc.value = this.textContent;
            });

            a.appendChild(b);
        }
    }
    },"text");

    

});

document.addEventListener("click", function (e) {
    //closeAllLists(e.target);
    closeList();
    });