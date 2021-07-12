
class linea {
    constructor() {
        this.bloque_origen = null;
        this.bloque_destino = null;
        this.canvas = null;
        this.line_delete = 0; //Nos indica si tenemos que eliminar esta linea
    }

    delete(){
        //Funcion que marca la linea para su eliminacion
        this.line_delete = 1;
    }

    getDelete(){
        return this.line_delete;
    }
    
    contieneBloque(bloque){
        //Funcion que nos indica si el bloque pasado por parametro
        //Se encuentra tanto en el origine como en el destino, si es el caso
        //Elimina dichas lineas
        if(this.bloque_origen.getID() == bloque.getID())
            return 1;

        if(this.bloque_destino.getID() == bloque.getID())
            return 1;
        
        return -1;
    }

    setCanvas(c) {
        this.canvas = c;
    }

    setOrigen(bloque1) {
        this.bloque_origen = bloque1;
    }

    setDestino(bloque2) {
        this.bloque_destino = bloque2;
    }

    draw() {
        if(this.line_delete == 0)
        {
            //Dibujamos la linea si no esta marcada como delete
            if (this.bloque_origen.getPosX() < this.bloque_destino.getPosX()) {
                var x1 = this.bloque_destino.getPosX() - 4;
                var y1 = this.bloque_destino.getPosY() + 30;
                var x2 = this.bloque_origen.getPosX() + this.bloque_origen.getLongitud() + 4;
                var y2 = this.bloque_origen.getPosY() + 30;
            }

            else {
                var x1 = this.bloque_origen.getPosX() - 4;
                var y1 = this.bloque_origen.getPosY() + 30;
                var x2 = this.bloque_destino.getPosX() + this.bloque_destino.getLongitud() + 4;
                var y2 = this.bloque_destino.getPosY() + 30;
            }

            var ctx = this.canvas.getContext("2d");
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgb(102, 204, 0)';

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}