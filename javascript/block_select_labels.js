class block_select_labels extends block{
    constructor(){
        super();
        this.name = 'Select label';

        this.longitud = 125;
        this.altura = 60;

        this.labels = []; //Labels seleccionados
    }

    getJSON(){
        var cadena_json = JSON.stringify({'type':'select_label','labels':this.labels});
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
        cxt.fillText("Select label", pos_text_x, pos_text_y);
        
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
      contenido = contenido.concat("<label for='labels'>Labels:</label>");
      contenido = contenido.concat("<input type='labels' class='form-control' id='labels'>");
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

      document.getElementById("labels").value = this.labels;
    }

    saveOptions(){
        this.labels = document.getElementById("labels").value;
    }
}