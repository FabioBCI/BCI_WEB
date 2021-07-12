/*
    Autor: Fabio R. Llorella Costa
    Fecha: 12/04/2021

    Descripcion: Indica que el bloque de datos es el de BCI Competition II
                 Hereda de la clase Block

*/

class block_statistics extends block{
    constructor(){
        super();
        this.name = 'Statistics';

        this.longitud = 110;
        this.altura = 60;

        this.mean = 0;
        this.std = 0;
        this.max = 0;
        this.min = 0;
        this.kurtosis = 0;
        this.wave = 0;

        //Variables del bloque
    }

    getJSON(){
        var cadena_json = JSON.stringify({'type':'statistics','mean':this.mean,'std':this.std,'max':this.max,
                                         'min':this.min,'kurtosis':this.kurtosis,'wave_length':this.wave});
        return cadena_json;
    }

    drawBlock(){
        //Funcion para dibujar el bloque
        var cxt = this.canvas.getContext('2d');
        
        var pos_text_x = this.pos_x + 20;
        var pos_text_y = this.pos_y + 35;       

        cxt.fillStyle="rgb(213,178,21)"; //color relleno 
        cxt.strokeStyle="rgb(200,167,20)"; //color contorno 
        cxt.lineWidth=5; //grosor de contorno
        cxt.globalAlpha=1; //Transparencia 0.7
        cxt.strokeRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar contorno cuadrado
        cxt.fillRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar relleno cuadrado

        cxt.fillStyle="rgb(23,32,42)"; //color contorno 
        cxt.font = "bold 15px Arial";
        cxt.fillText("Statistics", pos_text_x, pos_text_y);
        
        if(this.next_block !=-1){
            this.next_block.drawBlock();
        }
    }

    saveOptions(){
        if ($("#cbox_mean").is(":checked") == true)
            this.mean = 1;
        else
            this.mean = 0;

        if ($("#cbox_std").is(":checked") == true)
            this.std = 1;
        else
            this.std = 0;

        if ($("#cbox_max").is(":checked") == true)
            this.max = 1;
        else
            this.max = 0;

        if ($("#cbox_min").is(":checked") == true)
            this.min = 1;
        else
            this.min = 0;
        
        if ($("#cbox_kurtosis").is(":checked") == true)
            this.kurtosis = 1;
        else
            this.kurtosis = 0;

        if ($("#cbox_wave").is(":checked") == true)
            this.wave = 1;
        else
            this.wave = 0;
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
        contenido = contenido.concat("<input type='checkbox' id='cbox_mean' value='1'> <label for='cbox2'>Mean</label>");
        contenido = contenido.concat("</div>");      
        
        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<input type='checkbox' id='cbox_std' value='1'> <label for='cbox3'>Std</label>");
        contenido = contenido.concat("</div>");  

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<input type='checkbox' id='cbox_max' value='1'> <label for='cbox4'>Max</label>");
        contenido = contenido.concat("</div>"); 

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<input type='checkbox' id='cbox_min' value='1'> <label for='cbox5'>Min</label>");
        contenido = contenido.concat("</div>"); 

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<input type='checkbox' id='cbox_kurtosis' value='1'> <label for='cbox5'>Kurtosis</label>");
        contenido = contenido.concat("</div>"); 

        contenido = contenido.concat("<div class='form-group'>");
        contenido = contenido.concat("<input type='checkbox' id='cbox_wave' value='1'> <label for='cbox6'>Wave length</label>");
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
        
        if(this.mean == 1)
            document.getElementById("cbox_mean").checked = true;
        else
            document.getElementById("cbox_mean").checked = false;
        
        if(this.std == 1)
            document.getElementById("cbox_std").checked = true;
        else
            document.getElementById("cbox_std").checked = false;
        
        if(this.max == 1)
            document.getElementById("cbox_max").checked = true;
        else
            document.getElementById("cbox_max").checked = false;
        
        if(this.min == 1)
            document.getElementById("cbox_min").checked = true;
        else
            document.getElementById("cbox_min").checked = false;
        
        if(this.kurtosis == 1)
            document.getElementById("cbox_kurtosis").checked = true;
        else
            document.getElementById("cbox_kurtosis").checked = false;
        
        if(this.wave == 1)
            document.getElementById("cbox_wave").checked = true;
        else
            document.getElementById("cbox_wave").checked = false;
    }
}