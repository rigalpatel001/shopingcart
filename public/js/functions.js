$(function(){

    if($('textarea#teditor').length){
         CKEDITOR.replace('teditor');
     }

     $('.confirmDeletion').on('click', function(){
        
             if(!confirm('Are you sure you want to delete it?')) return false;
       
     });
});