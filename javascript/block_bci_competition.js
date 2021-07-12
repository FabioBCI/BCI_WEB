/*
    Autor: Fabio R. Llorella Costa
    Fecha: 18/02/2020

    Descripcion: Indica que el bloque de datos es el de BCI Competition II
                 Hereda de la clase Block

*/

//const { assertTSImportEqualsDeclaration } = require("@babel/types");

class block_bci_competition extends block_adquisition{
    constructor(){
        super();
        this.name = 'bci_competition';

        this.subject = '';
        this.trial = 1;
        this.channel = 1;
        this.open_modal = 0;
        
        this.longitud = 175;
        this.altura = 60;

        this.num_channels = 1;
        this.size_trials = 1;
        this.num_trials = 1;

        this.json = '';
        //this.num_subjects = 0;
    }

    getJSON(){
        if(this.type_data == 31)
        {
            var tipo = 'IIIa';
        }
        if(this.type_data == 41)
        {
            var tipo = 'IV_2a';
        }
        console.log(this.subject);
        var cadena_json = JSON.stringify({'type':tipo, 'subject':this.subject,'trial':this.trial});
        return cadena_json;
    }

    getSujetos(){
        if(this.type_data == 31)
        {
            this.num_subjects = 3;
        }
        if(this.type_data == 31)
        {
            this.num_subjects = 3;
        }

        return this.num_subjects;
    }
    
    saveOptions(){
        var seleccion = document.getElementById("database").value;
        
        this.type_data = parseInt(seleccion);  

        var opcion = parseInt($("#db_sujeto")[0].selectedIndex);
        if(opcion == 0)
        {
            this.subject = 'k3b';
        }

        if(opcion == 1)
        {
            this.subject = 'k6b';
        }

        if(opcion == 2)
        {
            this.subject = 'l1b';
        }
    }

    generarLetra(){
        var letras = ["a","b","c","d","e","f","0","1","2","3","4","5","6","7","8","9"];
        var numero = (Math.random()*15).toFixed(0);
        return letras[numero];
    }

    colorHEX(){
        var coolor = "";
        for(var i=0;i<6;i++){
            coolor = coolor + this.generarLetra() ;
        }
        return "#" + coolor;

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

        contenido = contenido.concat("<select name='database' id='database' onchange='mostrarSujetos()'>");
        contenido = contenido.concat("<optgroup label='BCI III'>");
        contenido = contenido.concat("<option value='31' label='BCI Competition IIIa'></option>");
        contenido = contenido.concat("</optgroup>");

        contenido = contenido.concat("<optgroup label='BCI IV'>");
        contenido = contenido.concat("<option value='41' label='BCI Competition IV 2a'></option>");  
        contenido = contenido.concat("<option value='42' label='BCI Competition IV 2b'></option>");  
        contenido = contenido.concat("</optgroup>");
        contenido = contenido.concat("</select>");
            
        contenido = contenido.concat("</div>");
        contenido = contenido.concat("<div class='modal-body' id='sujetos_modal'>");
        contenido = contenido.concat("</div>");

        contenido =contenido.concat("<div class='modal-footer'>");
        contenido =contenido.concat("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cerrar</button>");
        contenido =contenido.concat("<button type='submit' class='btn btn-primary' onClick='saveOptions()' data-dismiss='modal'>Aplicar</button>");
        contenido =contenido.concat("</div>");
        contenido =contenido.concat("</div>");
        contenido =contenido.concat("</div>");
        contenido =contenido.concat("</div>");

        
        document.getElementById("config").innerHTML = contenido;
        $('#exampleModal').modal('show'); 
        
        document.getElementById("database").value = this.type_data;        
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
        cxt.fillText("BCI Competition", pos_text_x, pos_text_y);
        
        if(this.next_block !=-1){
            this.next_block.drawBlock();
        }
    }

    setParamsView(params){
        //Funcion para asignar parametros a la hora de graficar los datos

        var pos_sujeto = params[0];
        var pos_trial = params[1];
        var channel = params[2];

        /*if(pos_sujeto != 0)
            this.subject = pos_sujeto;*/
        if(pos_trial !=0)
            this.trial = pos_trial;
        if(channel != 0)
            this.channel = channel;

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