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
        this.next_blocks = []; //Es un array que contiene los bloques que lo siguen
        this.form = 0; //Forma con la que se visualizara el bloque por pantalla, es decir un cuadrado, circulo, etc
        this.color = 0; //Color con el que aparacera el bloque por pantalla

        this.pos_x = 10;
        this.pos_y = 10;
        this.longitud = 85;
        this.altura = 60;
        this.canvas = null;
        this.url = ""; //URL en donde esta el servidor
        this.num_subjects = 0;
    }

    getSujetos(){
        return this.num_subjects;
    }
    
    setURL(URL){
        this.url = URL;
    }

    getName(){
        return this.name
    }

    setID(id){
        this.id = id; 
    }

    getID(){
        return this.id;
    }

    setPosX(x){
        this.pos_x = x;
    }

    setPosY(y){
        this.pos_y = y;
    }
    
    setSubject(){

    }

    setParamsView(params){
        //Funcion para asignar parametros a la hora de graficar los datos
    }
    
    getLongitud(){
        return this.longitud;
    }

    getAltura(){
        return this.altura;
    }

    getNextBlock(){
        //Funcion que devuelve el bloque siguiente
        return this.next_block;
    }

    setCanvas(c){
        this.canvas = c;
    }

    generarLetra()
    {
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

    pointInside(x,y){
        //Funcion que indica si un punto (x,y) se encuentra dentro del bloque
        var var_x1 = this.pos_x + (this.longitud);
        var var_y1 = this.pos_y + (this.altura);
    
        if((x<=var_x1) && (y<=var_y1)){
            return this;
        }
        else{
            
            if(this.next_block==-1)
                return -1;
            else
                return this.next_block.pointInside(x,y);
        }
    }

    getId(){
        return this.id;
    }

    getPosX(){
        return this.pos_x;
    }

    getPosY(){
        return this.pos_y;
    }

    addBlock(block){
        //Añadimos un bloque
        //Debemos sumar unas posiciones al bloque
        var add_x = this.pos_x + 125;
        var add_y = this.pos_y;

        block.moveBlock(add_x, add_y);

        this.next_block = block;//block.getID();
    }

    moveBlock(x,y)
    {
        this.pos_x = x;
        this.pos_y = y;
    }

    getJSON(){
        //Esta funcion sera implementada por los objetos que hereden de este bloque
        //Es un prototipo
      
    }

    
    text(){
       
    }

    options(){

    }

    block_process(){
    }

    drawBlock(){
        //Funcion que dibuja el bloque
        var cxt = this.canvas.getContext('2d');

        cxt.fillStyle="rgb(174,214,241)"; //color relleno 
        cxt.strokeStyle="rgb(52,152,219)"; //color contorno 
        cxt.lineWidth=5; //grosor de contorno
        cxt.globalAlpha=0.4; //Transparencia 0.7
        cxt.strokeRect(this.pos_x,this.pos_y,85,60); //dibujar contorno cuadrado
        cxt.fillRect(this.pos_x,this.pos_y,85,60); //dibujar relleno cuadrado

        if(this.next_block !=-1){
            //this.next_block.drawBlock();
        }
        
    }

    changeIlumination(){
        var cxt = this.canvas.getContext('2d');

        cxt.fillStyle="rgb(205, 92, 92)"; //color relleno 
        cxt.strokeStyle="rgb(205, 92, 92)"; //color contorno 
        cxt.lineWidth=5; //grosor de contorno
        cxt.globalAlpha=1; //Transparencia 0.7
        cxt.strokeRect(this.pos_x,this.pos_y,85,60); //dibujar contorno cuadrado
        cxt.fillRect(this.pos_x,this.pos_y,85,60); //dibujar relleno cuadrado
    }

    deleteBlock()
    {
        if(!!this.canvas)
        {
            var ctx = this.canvas.getContext('2d');              
            ctx.clearRect(this.pos_x-5, this.pos_y-5, 95, 95);  
        }
        else
        {
            alert("No hay un canvas asignado!!!");
        }
    }

    setNextBlock(bloque){
        this.next_block = bloque;
    }

    delete(bloque){
        //Si el this es igual al bloque eliminamos este bloque
        if(this.pos_x == bloque.getPosX() && this.pos_y == bloque.getPosY())
        {
            var ctx = this.canvas.getContext('2d');              
            ctx.clearRect(this.pos_x-5, this.pos_y-5, 95, 95);
            return 1;
        }
        else{
            if(this.next_block != -1)
                var d = this.next_block.delete(bloque);
                if(d==1)
                    this.next_block = -1;
        }

        return -1;
    }

    block_process(){
        //Funcion que hace llamada al servidor para pedir los datos EEG de la base de datos seleccionada

         //Enviamos el JSON de los bloques, para que el servidor los pueda procesar
    }


    viewSignals(params){
        var pos_sujeto = params[0];
        var pos_trial = params[1];
        var channel = params[2];

       
        if(pos_sujeto != 0)
        {
            this.subject = pos_sujeto;
        }

        if(pos_trial !=0)
        {
            this.trial = pos_trial;
        }
        if(channel != 0)
        {
            this.channel = channel;
        }

        this.subject = pos_sujeto;
        this.trial = pos_trial;
        this.channel = channel;
        
        if(this.open_modal == 0)
        {
            //Debemos mostrar un grafico con las señales EEG del trial que seleccionemos
            var contenido = "<div class='modal fade' id='exampleModal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>";
            contenido = contenido.concat("<div class='modal-dialog' role='document'>");
            contenido = contenido.concat("<div id='modal_content' class='modal-content'>");
            contenido = contenido.concat("<div id='modal_body' style='width:750px'>");
            contenido = contenido.concat("<label for='sujeto_label'> Nº.Trial :  </label>");
            contenido = contenido.concat("<select name='trial' id='trial' onchange='viewSignalsLoads()'></select>");

            contenido = contenido.concat("</div>");
            contenido = contenido.concat("</div>");
            contenido = contenido.concat("</div>");
            contenido = contenido.concat("</div>");
            document.getElementById("config").innerHTML = contenido;
            this.open_modal = 1;
        }

        var time = [];
        var conjunto_datos = [];
        var llenar_time = true;    
       
        var numero_canales = this.num_channels;
        var longitud_trials = this.size_trials;
        for(var ch=0;ch<numero_canales;ch++)
        {
            for(var i=0;i<longitud_trials;i++)
            {                 
                if(llenar_time == true)
                { 
                    time.push(i);                    
                } 
            }

            this.color_HEX.push(this.colorHEX());            
            conjunto_datos.push({label:"Canal".concat(ch.toString()),data:this.json['canal'+ch],borderColor:this.color_HEX[ch],fill:false});
            llenar_time = false;
        }        

        var box = document.getElementById("modal_body");     
        var newDiv = document.createElement("div"); //Creamos un nuevo div
        newDiv.id = "trials"+this.id.toString();
        newDiv.className = "trials";

        box.childNodes.forEach(element => {
            if(element.id == "trials"+this.id.toString() )
            {
                box.removeChild(element);
            }
        });
        
        var newCanvas = document.createElement("canvas");
        newCanvas.id = "popChart_trials"+this.id.toString();     
        newCanvas.className = "pop_chart"; 
        
        var newBotons = document.createElement("div");
        newBotons.id = "wrapper_botones_chart"+this.id.toString();

        newDiv.appendChild(newBotons);
       
        newDiv.appendChild(newCanvas);
        box.appendChild(newDiv);

        var popCanvas = $("#popChart_trials"+this.id.toString());
        var popCanvas = document.getElementById("popChart_trials"+this.id.toString());
        var popCanvas = document.getElementById("popChart_trials"+this.id.toString()).getContext("2d");
        
        var barChart = new Chart(popCanvas, {
            type: 'line',
            data: {       
                    labels:time,     
                    datasets:conjunto_datos
                }
        });     

   
       
        //Rellenamos los select box
        var num_trials = this.num_trials;

        /*var select = document.getElementById("sujeto");        
        select.options[0] = new Option('',0);
        for(var i=1;i<=num_sujetos;i++)
        {
            select.options[i] = new Option(i,i-1);
        }

        document.getElementById("sujeto").options.item(this.subject).selected = this.subject;*/

        
        var select = document.getElementById("trial");
        select.options[0] = new Option('',0);
        for(var i=1;i<=num_trials;i++)
        {
            select.options[i] = new Option(i,i-1);
        }

        //document.getElementById("trial").options.item(this.trial).selected = this.trial;
        
        /*switch(this.type_data)
        {
            case 31:
                var select = document.getElementById("channel");
                select.options[0] = new Option('',0);       
                for(var i=1;i<=60;i++)
                {
                    select.options[i] = new Option(i,i-1);
                }
                break;
        }      

        document.getElementById("channel").options.item(this.channel).selected = this.channel;*/

        $('#exampleModal').modal('show');
        $("#popChart_trials"+this.id.toString()).css('backgroundColor','white');
    }
}