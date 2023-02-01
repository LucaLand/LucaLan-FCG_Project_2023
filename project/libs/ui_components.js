//button 
function btn(id, x, y, w, h, callback, name, color, mode) {
  let button = document.createElement('button');
        button.id = id;
        button.innerHTML = name;
        document.body.appendChild(button);
        button.style.background = color;
        button.style.position= 'absolute';
        button.style.left = x;
        button.style.top = y;
        button.style.width = w;
        button.style.height = h;
        button.disabled = mode;
        button.style.display = 'flex';
        button.addEventListener('click', callback);
}

//input generico
function npt(id, x, y, w, h, value, mode){ 
    let input = document.createElement('input');
    input.id = id;
    document.body.appendChild(input);
    input.style.position= 'absolute';
    input.value=value;
    input.style.left=x;
    input.style.top=y;
    input.style.width = w;
    input.style.height = h;
    input.style.display = 'flex';
    input.disabled = mode;
    input.classList.add('extra');
}

//label 
function lbl(id, x, y, w, h, title){ 
    let label = document.createElement('label');
    label.id = id;
    label.innerHTML = title;
    document.body.appendChild(label);
    label.style.left = x;
    label.style.top = y;
    label.style.width = w;
    label.style.height = h;
    label.style.position= 'absolute';
    label.style.display = 'flex';
    label.classList.add('extra');
}

//checkbox
function chk(id, x, y, w, h, value, callback, mode, check){ 
    let checkbox = document.createElement('input');
    checkbox.setAttribute("type", "checkbox");
    checkbox.checked = check;
    checkbox.id = id; 
    checkbox.value = value;
    document.body.appendChild(checkbox);
    checkbox.style.position= 'absolute';
    checkbox.style.left = x;
    checkbox.style.top = y;
    checkbox.style.width= w;
    checkbox.style.height = h;
    checkbox.disabled = mode;
    checkbox.addEventListener('change', callback); 
    checkbox.style.display = 'flex';
    checkbox.classList.add("extra");
}

//upload scegli file
function pld(id, x, y, w, h, callback){ 
    let file = document.createElement('input');
    file.setAttribute("type", "file");
    file.id=id;
    document.body.appendChild(file);
    file.style.position= 'absolute';
    file.style.left = x;
    file.style.top = y;
    file.style.width = w;
    file.style.height = h;
    file.style.display = 'flex';
    file.addEventListener('change', callback);
    file.classList.add('extra');
}

//contenitore box div
function div(id, x, y, w, h){
    let div = document.createElement('div');
    div.id = id;
    document.body.appendChild(div);
    div.style.position= 'absolute';
    div.style.left = x;
    div.style.top = y;
    div.style.width = w;
    div.style.height = h;
    div.classList.add('extra');
}

//radio button
function rdo(id, x, y, w, h, value, callback, mode, check){ 
    let radio = document.createElement('input');
    radio.setAttribute("type", "radio");
    radio.id=id; 
    radio.value = value;
    document.body.appendChild(radio);
    radio.style.position= 'absolute';
    radio.style.left = x;
    radio.style.top = y;
    radio.style.width = w;
    radio.style.height = h;
    radio.checked = check;
    radio.disabled = mode;
    radio.addEventListener('change', callback);
    radio.style.display = 'flex';
    radio.classList.add('extra');
}

//slider range-bar
function rng(id, x, y, w, h, value, callback, min, max, step){ 
    let slider = document.createElement('input');
    slider.setAttribute("type", "range");
    slider.value = value;
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.step = step;
    document.body.appendChild(slider);
    slider.style.position = 'absolute';
    slider.style.left = x;
    slider.style.top = y;
    slider.style.width = w;
    slider.style.height = h;
    slider.addEventListener('input', callback);
    slider.addEventListener('change', callback);
    slider.style.display = 'flex';
    slider.classList.add('extra');
}

function updateValue(value) {
  valueElem.textContent = (value * step * uiMult).toFixed(uiPrecision);
}

//textbox
function txt(id, x, y, w, h, value){ 
    let textbox = document.createElement('input');
    textbox.setAttribute("type", "text");
    textbox.id = id;
    textbox.value = value;
    document.body.appendChild(textbox);
    textbox.style.position = 'absolute';
    textbox.style.left = x;
    textbox.style.top = y;
    textbox.style.width = w;
    textbox.style.height = h;
    textbox.classList.add('extra');
    //aggiungere input disabled
}

//select event change
function slc(id, x, y, w, h, array, callback) { 
  let list = array;
  let select = document.createElement('select');
  select.id = id;
  document.body.appendChild(select);
  select.style.position = 'absolute';
  select.style.left = x;
  select.style.top = y;
  select.style.width = w;
  select.style.height = h;
  for (let i=0; i < list.length; i++){
    let option = document.createElement('option');
    option.value = list[i];
    option.text = list[i];
    select.appendChild(option); 
    select.addEventListener('change', callback);
  }
}

//widget cursor-btn
function cbtn(id, x, y, w, h, callback, name, color, mode) {
  let button = document.createElement('button');
        button.id = id;
        button.innerHTML = name;
        document.body.appendChild(button);
        button.style.background = color;
        button.style.position= 'absolute';
        button.style.left = x;
        button.style.top = y;
        button.style.width = w;
        button.style.height = h;
        button.disabled = mode;
        button.addEventListener('click', callback);
}

//remove element/object
//richiamata con: rmv('id oggetto da eliminare');
  function rmv(id){
    let obj = document.getElementById(id);
    obj.remove();
  }

  function loadFile(){
      var file = event.target.files[0];
      if(file.size > 900) {
            alert('non sono consentiti file di dimensione maggiore di 900B');
            return false;
          }
      var fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = function (event) {    
            $("#upload1").html(event.target.result);
          };
  }

  function saveFile(file){
      mytitle = document.getElementById("titleSaveFile").value; ////
      const savingfile = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const link = document.createElement('a');
      link.href = savingfile;
      link.download = mytitle + '.png'; //nome file scaricato
      document.body.appendChild(link);
      link.click();
     document.body.removeChild(link);
  }

function detector(){
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  // true for mobile device
  //document.innerHTML = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">';
}else{
  // false for not mobile device
  $(document).ready(function(){
  $(document).keydown(function(event) {
            if (event.ctrlKey==true &&
              (event.which == '61' 
                || event.which == '107' 
                || event.which == '173' 
                || event.which == '109'  
                || event.which == '187'  
                || event.which == '189' 
              ) ) 
              {
              alert('Disabling zooming');
            }
              if (event.metaKey==true &&
              (event.which == '61' 
                || event.which == '107' 
                || event.which == '173' 
                || event.which == '109'  
                || event.which == '187'  
                || event.which == '189' 
              ) ) 
              {
              alert('Disabling zooming'); 
    event.preventDefault();
       }
  });
  $(window).bind('mousewheel DOMMouseScroll', function () {
         if (event.ctrlKey == true) {
           alert('Disabling zooming. To zoom on the canvas use the appropriate button or the scroll of the mouse.'); 
         }
  });
});
}
}
