var hide = false;

$('ul').on("click","li",function() {
    $(this).toggleClass("completed");
});

$('ul').on("click","span",function(event) {
    $(this).parent().fadeOut(500,function() {
       $(this).remove();
    });
    event.stopPropagation();
});

$("input[type='text']").keypress(function(event){
    if(event.which === 13){
        //append new todo
        var todoText = $(this).val();

        $('ul').append("<li><span><i class=\"fas fa-trash\"></i></span> "+todoText+"</li>")
   
        $(this).val("");
    }
});

$(".fa-plus-square").click(function() {
    if(hide==false){
        $("input").fadeOut(500,function() {
        hide=true;
    });
    }
    else 
    {
        $("input").fadeIn(500,function() {
        hide=false;
    });
    }
});