/*
    Autor: Fabio R. Llorella Costa
    Fecha: 28/02/2020

    Descripcion: Este bloque agrupa a los bloques de adquisicion

*/

class block_adquisition extends block{
    constructor(){
        super();
        this.name = 'adquisition';

        this.type_data = 0; //Nos indica que tipo de datos queremos cargar
        this.longitud = 85;
        this.altura = 60;
        this.color_HEX = [];

        this.EEG = [];
        this.labels = [];
    }

    block_process(){
        //Funcion que hace llamada al servidor para pedir los datos EEG de la base de datos seleccionada

         //Enviamos el JSON de los bloques, para que el servidor los pueda procesar
         console.log('request database ...');
         
         var json_to_send = JSON.stringify({'database':this.type_data});

         let json_response = fetch(this.url, {
             method: 'POST',
             body: json_to_send,
         }).then(response => response.text()).then(text => {return text;});
        
         var position = json_response.indexOf("HTTP");
         json_response = json_response.substr(0,position);        
        
         console.log(json_response);

    }

    options(){
       
    }

    

}