class block_cut_trial extends block{
    constructor(){
        super();
        this.name = 'Cut trial';

        this.longitud = 110;
        this.altura = 60;

        this.start_chunk = 0;
        this.end_chunk = 0;
        this.size_chunk = 0;
        this.overlap = 0;
    }

    getJSON(){
        var cadena_json = JSON.stringify({'type':'cut_trial','start':this.start_chunk,'end':this.end_chunk,
                                          'size':this.size_chunk,'overlap':this.overlap});
        return cadena_json;
    }

    drawBlock(){
        //Funcion para dibujar el bloque
        var cxt = this.canvas.getContext('2d');
        
        var pos_text_x = this.pos_x + 20;
        var pos_text_y = this.pos_y + 35;       

        cxt.fillStyle="rgb(61,226,249)"; //color relleno 
        cxt.strokeStyle="rgb(21,188,211)"; //color contorno 
        cxt.lineWidth=5; //grosor de contorno
        cxt.globalAlpha=1; //Transparencia 0.7
        cxt.strokeRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar contorno cuadrado
        cxt.fillRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar relleno cuadrado

        cxt.fillStyle="rgb(23,32,42)"; //color contorno 
        cxt.font = "bold 15px Arial";
        cxt.fillText("Cut trial", pos_text_x, pos_text_y);
        
        if(this.next_block !=-1){
            this.next_block.drawBlock();
        }
    }

    options(){
        //Funcion para mostrar las opciones del bloque
         //Opciones del bloque
      var contenido = "<div class='modal fade' id='exampleModal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>";
      contenido =contenido.concat("<div class='modal-dialog' role='document'>");
      contenido =contenido.concat("<div class='modal-content'>");
      contenido =contenido.concat("<div class='modal-header'>");
      contenido =contenido.concat("<h5 class='modal-title' id='exampleModalLabel'>Cut trials</h5>");
      contenido =contenido.concat("<button type='button' class='close' data-dismiss='modal' aria-label='Close'>");
      contenido =contenido.concat("<span aria-hidden='true'>&times;</span>");
      contenido =contenido.concat("</button>");
      contenido =contenido.concat("</div>");
      contenido =contenido.concat("<div class='modal-body'>");

      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='start'>Start (s):</label>");
      contenido = contenido.concat("<input type='start' class='form-control' id='start'>");
      contenido = contenido.concat("</div>");  

      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='end'>End (s):</label>");
      contenido = contenido.concat("<input type='end' class='form-control' id='end'>");
      contenido = contenido.concat("</div>");  
      
      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='size'>Size (s):</label>");
      contenido = contenido.concat("<input type='size' class='form-control' id='size'>");
      contenido = contenido.concat("</div>");     

      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='overlap'>Overlap (s):</label>");
      contenido = contenido.concat("<input type='overlap' class='form-control' id='overlap'>");
      contenido = contenido.concat("</div>");    
        

      contenido =contenido.concat("</div>");
      contenido =contenido.concat("<div class='modal-footer'>");
      contenido =contenido.concat("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cerrar</button>");
      contenido =contenido.concat("<button type='submit' class='btn btn-primary' onClick='saveOptions()' data-dismiss='modal'>Aplicar</button>");
      contenido =contenido.concat("</div>");
      contenido =contenido.concat("</div>");
      contenido =contenido.concat("</div>");
      contenido =contenido.concat("</div>");

      
      document.getElementById("config").innerHTML = contenido;
      $('#exampleModal').modal('show');

      document.getElementById("start").value = this.start_chunk;
      document.getElementById("end").value = this.end_chunk;
      document.getElementById("size").value = this.size_chunk;
      document.getElementById("overlap").value = this.overlap;
    }

    saveOptions(){
        this.start_chunk = document.getElementById("start").value;
        this.end_chunk = document.getElementById("end").value;
        this.size_chunk = document.getElementById("size").value;
        this.overlap = document.getElementById("overlap").value;
    }
}