/*
    Autor: Fabio R. Llorella Costa
    Fecha: 18/02/2020

    Descripcion: Indica que el bloque de datos es el de BCI Competition II
                 Hereda de la clase Block

*/

class random_eeg extends block_adquisition{
    constructor(){
        super();
        this.name = 'Random EEG';

        this.longitud = 175;
        this.altura = 60;
        this.open_modal = 0;

        this.subject = 1;
        this.trial = 1;
        this.channel = 1;

        this.num_subjects = 0;
        this.num_trials = 0;
        this.num_channels = 0;
        this.tamano = 0;
        this.num_clases = 0;
        this.amplitud = 0;
        this.fm = 0;
    }

    /*var json_to_send = JSON.stringify({'type_block':'random','subjects':this.num_subjects,'trials':this.num_trials,'channels':this.num_channels,
    'size':this.tamano, 'num_clases':this.num_clases,'amp':this.amplitud});*/

    getJSON(){
        var cadena_json = JSON.stringify({'type':'random','subjects':this.num_subjects,'trials':this.num_trials,
        'channels':this.num_channels,'size':this.tamano, 'num_clases':this.num_clases,'amp':this.amplitud,'fm':this.fm,'trial':1});

        return cadena_json;
    }

    setParamsView(params){
        //Funcion para asignar parametros a la hora de graficar los datos

        var pos_sujeto = params[0];
        var pos_trial = params[1];
        var channel = params[2];

        if(pos_sujeto != 0)
            this.subject = pos_sujeto;
        if(pos_trial !=0)
            this.trial = pos_trial;
        if(channel != 0)
            this.channel = channel;

    }

    block_process(){
        //Funcion que hace llamada al servidor para pedir los datos EEG de la base de datos seleccionada

         //Enviamos el JSON de los bloques, para que el servidor los pueda procesar
        console.log('request database ...');
        var json_to_send = JSON.stringify({'type':'random','subjects':this.num_subjects,'trials':this.num_trials,'channels':this.num_channels,
                                    'size':this.tamano, 'num_clases':this.num_clases,'amp':this.amplitud,'fm':this.fm,'trial':1});

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

    

    saveOptions(){
        this.num_subjects = parseInt(document.getElementById("sujetos").value);
        this.num_trials = parseInt(document.getElementById("trials").value);
        this.num_channels = parseInt(document.getElementById("canales").value);
        this.tamano = parseInt(document.getElementById("tamano").value);
        this.num_clases = parseInt(document.getElementById("clases").value);
        this.amplitud = parseInt(document.getElementById("amplitud").value);
        this.fm = parseInt(document.getElementById("fm").value);
    }

    options(){
        var contenido = "<div class='modal fade' id='exampleModal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>";
        contenido =contenido.concat("<div class='modal-dialog' role='document'>");
        contenido =contenido.concat("<div class='modal-content'>");
        contenido =contenido.concat("<div class='modal-header'>");
        contenido =contenido.concat("<h5 class='modal-title' id='exampleModalLabel'>EEG DataBase</h5>");
        contenido =contenido.concat("<button type='button' class='close' data-dismiss='modal' aria-label='Close'>");
        contenido =contenido.concat("<span aria-hidden='true'>&times;</span>");
        contenido =contenido.concat("</button>");
        contenido =contenido.concat("</div>");
        contenido =contenido.concat("<div class='modal-body'>");

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='order'>Num. Sujetos:</label>");
        contenido = contenido.concat("<input type='sujetos' class='form-control' id='sujetos'>");
        contenido = contenido.concat("</div>");  
        
        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='low'>Num. Trials:</label>");
        contenido = contenido.concat("<input type='trials' class='form-control' id='trials'>");
        contenido = contenido.concat("</div>");  

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='low'>Num. Canales:</label>");
        contenido = contenido.concat("<input type='canales' class='form-control' id='canales'>");
        contenido = contenido.concat("</div>");  

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='low'>Tamano trial:</label>");
        contenido = contenido.concat("<input type='tamano' class='form-control' id='tamano'>");
        contenido = contenido.concat("</div>");  

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='clases'>Num. Clases:</label>");
        contenido = contenido.concat("<input type='clases' class='form-control' id='clases'>");
        contenido = contenido.concat("</div>");  

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='amplitud'>Factor.Amplitud:</label>");
        contenido = contenido.concat("<input type='amplitud' class='form-control' id='amplitud'>");
        contenido = contenido.concat("</div>");  

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<label for='fm'>Frecuencia muestreo:</label>");
        contenido = contenido.concat("<input type='fm' class='form-control' id='fm'>");
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
        $('.modal-backdrop').addClass('background-backdrop');
        $("#exampleModal").modal({
            backdrop: false,
        });

        
        document.getElementById("sujetos").value = this.num_subjects;
        document.getElementById("trials").value = this.num_trials;
        document.getElementById("canales").value = this.num_channels;
        document.getElementById("tamano").value = this.tamano;
        document.getElementById("clases").value = this.num_clases;
        document.getElementById("amplitud").value = this.amplitud;
        document.getElementById("fm").value = this.fm;
    }

    drawBlock(){
        //Funcion para dibujar el bloque
        var cxt = this.canvas.getContext('2d');
        
        var pos_text_x = this.pos_x + 20;
        var pos_text_y = this.pos_y + 35;       

        cxt.fillStyle="rgb(130,224,170)"; //color relleno 
        cxt.strokeStyle="rgb(39,174,96)"; //color contorno 
        cxt.lineWidth=5; //grosor de contorno
        cxt.globalAlpha=1; //Transparencia 0.7
        cxt.strokeRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar contorno cuadrado
        cxt.fillRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar relleno cuadrado

        cxt.fillStyle="rgb(23,32,42)"; //color contorno 
        cxt.font = "bold 17px Arial";
        cxt.fillText("Random EEG", pos_text_x, pos_text_y);
        
        if(this.next_block !=-1){
            this.next_block.drawBlock();
        }
    }
}