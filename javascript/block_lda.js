/*
    Autor: Fabio R. Llorella Costa
    Fecha: 12/04/2021

    Descripcion: Indica que el bloque de datos es el de BCI Competition II
                 Hereda de la clase Block

*/

class block_lda extends block{
    constructor(){
        super();
        this.name = 'LDA';

        this.longitud = 110;
        this.altura = 60;

        //Variables del bloque
    
    }

    getJSON(){
        var cadena_json = JSON.stringify({'type':'LDA'});
        return cadena_json;
    }

    drawBlock(){
        //Funcion para dibujar el bloque
        var cxt = this.canvas.getContext('2d');
        
        var pos_text_x = this.pos_x + 20;
        var pos_text_y = this.pos_y + 35;       

        cxt.fillStyle="rgb(91,34,191)"; //color relleno 
        cxt.strokeStyle="rgb(57,13,135)"; //color contorno 
        cxt.lineWidth=5; //grosor de contorno
        cxt.globalAlpha=1; //Transparencia 0.7
        cxt.strokeRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar contorno cuadrado
        cxt.fillRect(this.pos_x,this.pos_y,this.longitud,this.altura); //dibujar relleno cuadrado

        cxt.fillStyle="rgb(23,32,42)"; //color contorno 
        cxt.font = "bold 15px Arial";
        cxt.fillText("LDA", pos_text_x, pos_text_y);
        
        if(this.next_block !=-1){
            this.next_block.drawBlock();
        }
    }

    saveOptions(){
        
    }

    options(){
        //Funcion para mostrar las opciones del bloque
         //Opciones del bloque
    }
}