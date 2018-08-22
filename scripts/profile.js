
//UTILLITIES FROM WEB

/**
 * Get the value of a querystring
 * @param  {String} field The field to get the value of
 * @param  {String} url   The URL to get the value from (optional)
 * @return {String}       The field value
 */
var getQueryString = function ( field, url ) {
	var href = url ? url : window.location.href;
	var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
	var string = reg.exec(href);
	return string ? string[1] : null;
};

//////////////////////////////////




var hide = true;

var userstringid = getQueryString('userid');

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
    jQuery.post( '/passwordchange',{userstringid: loggeduser_stringid, newpass: newpass} , function(){alert('סיסמה שונתה בהצלחה')}, 'text' );
});


$('#btn_addcomment').click(function(){
    var comment = $('#input_comment').val();
    console.log("comment:" +comment);
    jQuery.post( '/addComment',{"comment": comment,"userstringid":userstringid} , function(){
        var a = document.createElement("li");
        a.innerHTML = comment +"<br> <i>by:</i> <strong><a href='/profile?userid="+loggeduser_stringid+"'>"+loggeduser_name+"</a></strong>";
        a.classList.add("new-comment");
        document.getElementById('comments').appendChild(a);
        alert('הוספה תגובה בהצלחה');

    }, 'text' );
});











