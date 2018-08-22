
var hide = true;

console.log(userstringid);

$('#showchange').click(function() {
    console.log('clicked');
    if(hide === false){
        $('#passchange').fadeOut(200);
        hide=true;
    }
    else{
        $('#passchange').fadeIn(200);
        hide=false;
    }
    
    
});

$('#changenow').click(function(){
    var newpass = $('input')[0].value;
    jQuery.post( '/passwordchange',{userstringid: userstringid, newpass: newpass} , function(){alert('סיסמה שונתה בהצלחה')}, 'text' );
});


$('#btn_addcomment').click(function(){
    var comment = $('#input_comment').val();
    console.log("comment:" +comment);
    jQuery.post( '/addComment',{"comment": comment,"userstringid":userstringid} , function(){alert('הוספה תגובה בהצלחה')}, 'text' );
});