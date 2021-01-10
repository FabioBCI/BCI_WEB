/*
    Autor: Fabio R. Llorella Costa
    Fecha: 10/01/2021

    Descripcion: Esta clase implementa la estructura de una pipeline de Brain-Computer Interface no invasivo
                 basado en señales EEG

                 Esta clase implementa la pipeline de forma lineal

                 pipleline |-> bloque_inicial -> bloque1 -> ... -> bloque n -|
                 
                 El bloque inicial apunta a los distintos bloques de la pipeline

                 Un bloque solamente puede estar en una pipeline
*/

class pipeline{
    constructor(){
        //Constructor de la clase
        this.id = 0; //Identificador de la pipeline
        this.bloque_inicial = -1; //puntero al bloque inicial de la pipeline
        this.canvas = 0; //Contiene el canvas donde se tiene que dibujar la pipeline
    }

    setCanvas(nombre_canvas){
        this.canvas = document.getElementById(nombre_canvas); //Obtenemos el nombre del canvas por defecto
    }

    setStartBlock(block){
        this.bloque_inicial = block; //Asignamos el bloque inicial, que sera el punto de entrada a la pipeline
    }

    setDelete(){
        //Funcion para eliminar toda la pipeline, borra todos los bloques asociados a dicha pipeline
        //El borrado se realiza de forma recursiva, se llama al borrado del bloque inicial y este va llamando
        //El borrado de los bloques a los que apunta

        if (this.bloque_inicial > -1) {
            this.bloque_inicial.delete(); //Llamamos a la funcion delete del bloque incial
            this.bloque_inicial = -1; //Inicializamos el puntero al bloque inicial
        }
    }

    createJSON(){
        //Funcion que crea el json para ser enviado hacia el servidor
        //Para hacerlo debemos recorrer los bloques que configuran la pipeline
    }
}