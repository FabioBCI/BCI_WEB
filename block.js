/*
    Autor: Fabio R. Llorella Costa
    Fecha: 10/01/2020

    Descripcion: Implementa la clase block, que sera la clase que represente a las acciones que queremos realizar
                 Esta es una clase plantilla, las demas clases heredaran de esta clase

*/

class block{
    constructor(){
        //Constructor de la clase
        this.id = -1; //Identificador del objeto
        this.name = ""; //Nombre que aparecera por pantalla al ver el bloque
        this.next_block = -1; //Puntero al siguiente bloque
        this.form = 0; //Forma con la que se visualizara el bloque por pantalla, es decir un cuadrado, circulo, etc
        this.color = 0; //Color con el que aparacera el bloque por pantalla
    }

    delete(){
        //Destructur del objeto bloque, este llama al destructor del bloque al que apunta
        if(this.next_block > -1){
            this.next_block.delete(); //Llamamos al delete del bloque al que apunta este bloque
        }
    }

    getId(){
        return this.id;
    }

    addBlock(block){
        //Añadimos un bloque
        this.next_block = block.getID();
    }

    getJSON(){
        //Esta funcion sera implementada por los objetos que hereden de este bloque
        //Es un prototipo
    }
}