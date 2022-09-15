

function SetupPagination(items){ 
     let page_count = Math.ceil(items.length/5)
     for (let i=1; i < page_count + 1; i++){
       PaginationButton(i, items);
     }
}
   
function PaginationButton(page,items){ 
     
     let listButton = document.createElement('li'); 
     listButton.classList.add('page-item');
   
     let button = document.createElement('a');
     button.classList.add('page-link');
     button.innerText = page;
   
   
     button.addEventListener('click', function(){
      current_page = page;
       DisplayList(items, rows_per_page, current_page);
     });
   
     listButton.appendChild(button);
   
     return listButton;
   
}






   
