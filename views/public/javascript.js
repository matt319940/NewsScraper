$( document ).ready(function() {

    $(".btn-warning").on("click", function(){

        if($(this)[0].innerHTML == "Save Article"){
            var header = $(this).parent().parent().find('.headline').text();
            var summary = $(this).parent().parent().parent().find('.summary').text();
            var url = $(this).parent().parent().parent().find('a')[0].href;
            var article = {
                Headline: header,
                Summary: summary,
                URL: url
            }
            $(this)[0].innerHTML = "Saved"
            $.post("/save", article);
        }
    });

    $(".btn-danger").on("click", function(){
        
        var header = $(this).parent().parent().find('.headline').text();
        var summary = $(this).parent().parent().parent().find('.summary').text();
        var url = $(this).parent().parent().parent().find('a')[0].href;
        var article = {
            Headline: header,
            Summary: summary,
            URL: url
        }
        $.post("/delete", article);
        location.reload();
    });

    $('#comments').on('shown.bs.modal', function () {
        $('#input').trigger('focus')
    });
    
    $(".btn-info").on("click", function(){
        $.get("comments/", function(data){
            $(".modal-body").text(data);
        });
    });

    $(".btn-primary").on("click", function(){
    var comment = $("#comment-text").val();
    var comment = {
        comment
    }
    
    $.post("/comment", comment);
    });
});