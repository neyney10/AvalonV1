
$('.spanremove').click(function(){
    console.log($(this).parent().text()); 
    var t = $(this);
    jQuery.post( '/delete',{user: $(this).parent().text()} , function(){t.parent().remove();}, 'text'  );
    
});

$('.fa-user-edit').click(function(){
    alert( "Handler for .click() called." );
});