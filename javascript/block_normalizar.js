/*
    Autor: Fabio R. Llorella Costa
    Fecha: 18/03/2021

    Descripcion: Indica que el bloque de datos es el de BCI Competition II
                 Hereda de la clase Block

*/

class block_normalizar extends block{
    constructor(){
        super();
        this.name = 'Normalization';

        this.longitud = 150;
        this.altura = 60;
    }

    getJSON(){
        var cadena_json = JSON.stringify({'type':'Normalization'});
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
        cxt.fillText("Normalization", pos_text_x, pos_text_y);
        
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

    }
}