/*
    Autor: Fabio R. Llorella Costa
    Fecha: 27/02/2020

    Descripcion: Indica que el bloque de datos es el de BCI Competition II
                 Hereda de la clase Block

*/

class block_band_pas extends block{
    constructor(){
        super();
        this.name = 'Band Pass';

        this.longitud = 110;
        this.altura = 60;

        //Variables del bloque
        this.order = 0;
        this.high_pass = 0;
        this.low_pass = 0;
    }

    getJSON(){
        var cadena_json = JSON.stringify({'type':'BandPass','order':this.order,'high':this.high_pass, 'low':this.low_pass});
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
        cxt.fillText("Band Pass", pos_text_x, pos_text_y);
        
        if(this.next_block !=-1){
            this.next_block.drawBlock();
        }
    }

    saveOptions(){
        this.order = document.getElementById("order").value;
        this.low_pass = document.getElementById("low").value;
        this.high_pass = document.getElementById("high").value;
    }

    options(){
        //Funcion para mostrar las opciones del bloque
         //Opciones del bloque
      var contenido = "<div class='modal fade' id='exampleModal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>";
      contenido =contenido.concat("<div class='modal-dialog' role='document'>");
      contenido =contenido.concat("<div class='modal-content'>");
      contenido =contenido.concat("<div class='modal-header'>");
      contenido =contenido.concat("<h5 class='modal-title' id='exampleModalLabel'>Band Pass Filter</h5>");
      contenido =contenido.concat("<button type='button' class='close' data-dismiss='modal' aria-label='Close'>");
      contenido =contenido.concat("<span aria-hidden='true'>&times;</span>");
      contenido =contenido.concat("</button>");
      contenido =contenido.concat("</div>");
      contenido =contenido.concat("<div class='modal-body'>");

      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='order'>Order:</label>");
      contenido = contenido.concat("<input type='order' class='form-control' id='order'>");
      contenido = contenido.concat("</div>");  

      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='low'>Low:</label>");
      contenido = contenido.concat("<input type='low' class='form-control' id='low'>");
      contenido = contenido.concat("</div>");  
      
      contenido = contenido.concat("<div class='form-group'>");
      contenido = contenido.concat("<label for='high'>High:</label>");
      contenido = contenido.concat("<input type='high' class='form-control' id='high'>");
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

      document.getElementById("order").value = this.order;
      document.getElementById("low").value = this.low_pass;
      document.getElementById("high").value = this.high_pass;
    }

    block_process(){
        //Funcion que hace llamada al servidor para pedir los datos EEG de la base de datos seleccionada

         //Enviamos el JSON de los bloques, para que el servidor los pueda procesar
        console.log('request database ...');
        var json_to_send = JSON.stringify({'type':'competition','number_bci':this.type_data,'subject':this.subject,'trial':this.trial,
                                        'channel':this.channel});


        var json_response = fetch(this.url, {
            method: 'POST',
            body: json_to_send
        }).then(response => Promise.resolve(response)).then(response => response.json()).then(response =>  {            
            //this.EEG = response.EEG;
            this.json = response;
            this.num_channels = response.channels;
            this.size_trials = response.size;
            this.num_trials = response.num_trials;
            this.labels = response.labels;
        });

        console.log('PROCESS');
        const graficar = async () => {
            const a = await json_response;
            //Tenemos que graficar estos datos
            var estado = [this.subject,this.trial,this.channel];
            this.viewSignals(estado);
        }

        graficar(); //Es una llamada asincrona al servidor    
    }

}