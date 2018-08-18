var curr_card;

$('#content img').click(function(){
    curr_card = $(this).attr('src');
    curr_card_name = $(this).attr('data-name');
    console.log(curr_card);
    $('#card-details-content-card-img').attr('src',curr_card);
    $('#card-details-content-card-name').text(curr_card_name);
    $('#card-details-content').show();
});


var modal = document.getElementById('card-details-content');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    console.log('clicked');
    console.log( event.target.tagName);
    if (event.target !== modal && event.target.tagName != 'IMG') {
        console.log('outside');
        modal.style.display = "none";
        
    }
}