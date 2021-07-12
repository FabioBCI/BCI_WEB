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
    constructor(URL){
        //Constructor de la clase
        this.id = 0; //Identificador de la pipeline
        this.canvas = 0; //Contiene el canvas donde se tiene que dibujar la pipeline
        this.array_lineas = []; //Hace de pila de las conexiones entre bloques
        this.array_blocks = []; //Hace de pila de los bloques
        this.last_block = -1;
        this.id_block = -1;
        this.url = URL; //URL del servidor
        this.estado = [1,1,1]; //[Nº.sujeto,Nº.trial, canal]

        this.subject = '';
        this.labels = [];
        this.num_subjects = 0;
        this.json_pipeline = "";
        this.json_result = -1;

    }

    setSubject(subject)
    {
        this.suject = subject;
    }

    pipeOptions(){
        var contenido = "<div class='modal fade' id='exampleModal' tabindex='-1' role='dialog' aria-labelledby='exampleModalLabel' aria-hidden='true'>";
        contenido =contenido.concat("<div class='modal-dialog' role='document'>");
        contenido =contenido.concat("<div class='modal-content'>");
        contenido =contenido.concat("<div class='modal-header'>");
        contenido =contenido.concat("<h5 class='modal-title' id='exampleModalLabel'>Pipeline Options</h5>");
        contenido =contenido.concat("<button type='button' class='close' data-dismiss='modal' aria-label='Close'>");
        contenido =contenido.concat("<span aria-hidden='true'>&times;</span>");
        contenido =contenido.concat("</button>");
        contenido =contenido.concat("</div>");
        contenido =contenido.concat("<div class='modal-body'>");

        contenido = contenido.concat("<label for='channel' id='sujeto_pipe'>Sujeto :  </label>");
        contenido = contenido.concat("<select id='seleccion_sujetos' multiple")

        for(let i=0; i<=this.num_subjects; i++)
        {
            contenido = contenido.concat("<option value = '"+i.toString()+"'> "+i.toString()+"</option>");
        }

        contenido = contenido.concat("</select>")
            
        contenido =contenido.concat("</div>");
        contenido =contenido.concat("<div class='modal-footer'>");
        contenido =contenido.concat("<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cerrar</button>");
        contenido =contenido.concat("<button type='submit' class='btn btn-primary' onClick='saveOptionsPipe()' data-dismiss='modal'>Ejecutar</button>");
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

    
    }

    setSujetos(sujetos){
     
    }

    execute(){
        //Funcion para ejecutar la pipeline

        //1-Configuracion de los parametros para la ejecucion       
        this.pipeOptions();        
    }   

    getJSON(){
       return this.json_pipeline;
    }

    async transmitir_json(json)
    {
        //Esta funcion envia el json de la estructura de datos a los bloques para que actuen
        //segun convengan

        console.log('Send json ...');
        console.log(json);

        var result =  await fetch(this.url, {
            method: 'POST',
            headers: {
                "Accept": "application/json"
                },
            body: json
        }).then(response => {return response.json()});
        
        //result = result.split('"').join('');
        this.json_final = result;
        
        var cm = this.json_final["cm"];
        //Debemos mostrar en el cliente los resultados en forma de grafico
  

        //Debemos crear un accordeon en la pagina principal    
        var contenido = "<button type='button' class='btn btn-info btn-small' data-toggle='collapse' data-target='#facts'>Results</button>";
        contenido = contenido.concat("<div id='facts' class='collapse'>");
        contenido = contenido.concat("<div class='contents'>");
        contenido = contenido.concat("<div id='canvasBox1'>");
        contenido = contenido.concat("<canvas id='pop_results_acc'>");
        contenido = contenido.concat("</div>");
        contenido = contenido.concat("<div id='canvasBox2'>");
        contenido = contenido.concat("<canvas id='pop_results_kappa'>");
        contenido = contenido.concat("</div>");    
        
        //contenido = contenido.concat("<div id='canvasBox3'>");
        //contenido = contenido.concat("<canvas id='pop_results_cm'>");
        //contenido = contenido.concat("</div>"); 
        
        contenido = contenido.concat("</div>");        
        contenido = contenido.concat("</div>");
        contenido = contenido.concat("</div>");

        document.getElementById("resultados").innerHTML = contenido;
        
        const plugin = {
            id: 'custom_canvas_background_color',
            beforeDraw: (chart) => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          };

        var popCanvasAcc = document.getElementById("pop_results_acc");
        var barChart = new Chart(popCanvasAcc, {
            type: 'doughnut',
            data: {
              labels: ["Accuracy","Error"],
              datasets: [{
                label: 'Accuracy',
                data: [this.json_final["acc"],(100-this.json_final["acc"])],
                backgroundColor: [
                    'rgb(0, 204, 0)',
                    'rgb(255, 0, 0)'
                ]
              }]
            },
            plugins : [plugin]
          });

          var popCanvasKappa = document.getElementById("pop_results_kappa");
          var barChart2 = new Chart(popCanvasKappa, {
              type: 'bar',
              data: {
                labels: ["Kappa"],
                datasets: [{
                  label: 'Kappa',
                  data: [this.json_final["kappa"]],
                  backgroundColor: [
                      'rgb(0, 204, 0)',
                  ]
                }]
              },
              plugins : [plugin]
            });
        
          var labels = [];
          var datos = [];
          var indice = 0;
          cm.forEach(element => {
            labels.push("class ".concat(indice.toString()));
            datos.push(element);
            indice = indice + 1;
          });
       
          /*var popCanvasCM = document.getElementById("pop_results_cm");
          var barChart2 = new Chart(popCanvasCM, {
              type: 'bar',
              data: {
                labels: labels,
                datasets: [{
                  label: '',
                  data: datos,
                  backgroundColor: [
                      'rgb(0, 204, 0)',
                  ]
                }]
              },
              plugins : [plugin]
            });*/
    }

    setState(estado){
        this.estado = estado;
    }

    setCanvas(nombre_canvas){
        this.canvas = nombre_canvas; //Obtenemos el nombre del canvas por defecto
    }

    setStartBlock(block){
        this.bloque_inicial = block; //Asignamos el bloque inicial, que sera el punto de entrada a la pipeline
    }

    addBlock(block_type){
        //Funcion para añadir un bloque del tipo pasado como parametro
        var suma_distancia = 135;
        switch(block_type)
        {
            case 'bci_ii':
                var bloque = new block_bci_competition();
                break;
            case 'band_pas':
                var bloque = new block_band_pas();
                break;
            case 'high_pas':
                var bloque = new block_filter_high();
                break;
            case 'low_pas':
                var bloque = new block_filter_low();
                break;
            case 'random':
                var bloque = new random_eeg();
                break;
            case 'normalizar':
                var bloque = new block_normalizar();
                break;
            case 'hjorth':
                var bloque = new block_hjorth();
                break;
            case 'LDA':
                var bloque = new block_lda();
                break;
            case 'k_fold':
                var bloque = new block_k_fold();
                break;
            case 'cut_trial':
                var bloque = new block_cut_trial();
                break;
            case 'select_label':
                var bloque = new block_select_labels();
                break;
            case 'statistics':
                var bloque = new block_statistics();
                break;

        }
        
        bloque.setURL(this.url); //Asignamos la URL del servidor
        
        if(this.last_block != -1)
        {
            if(this.last_block.getName() == 'bci_competition')
            {
                suma_distancia = 195;
            }

            if(this.last_block.getName() == 'Random EEG')
            {
                suma_distancia = 195;
            }

            if(this.last_block.getName() == 'Normalization')
            {
                suma_distancia = 180;
            }

            bloque.setPosX(this.last_block.getPosX()+suma_distancia);
            bloque.setPosY(this.last_block.getPosY());
        }
        
        this.id_block = this.id_block + 1;
        bloque.setID(this.id_block);

        bloque.setCanvas(this.canvas);
        this.last_block = bloque;
        this.array_blocks.push(bloque);
    }

    setDelete(){
        //Funcion para eliminar toda la pipeline, borra todos los bloques asociados a dicha pipeline
        //El borrado se realiza de forma recursiva, se llama al borrado del bloque inicial y este va llamando
        //El borrado de los bloques a los que apunta
        this.array_blocks.forEach(element => {
            element.delete();
        });
        
        this.array_lineas.forEach(element => {
            element.delete();
        });

        this.array_blocks = [];
        this.array_lineas = [];
    }

    createJSON(){
        //Funcion que crea el JSON para ser enviado hacia el servidor
        //Para hacerlo debemos recorrer los bloques que configuran la pipeline
        //Recorremos todos los bloques y vamos concatenando los JSON
        this.json_pipeline = [];
        this.array_blocks.forEach(element=>{
            this.json_pipeline.push(element.getJSON());
            //this.json_pipeline += element.getJSON();
        });

        console.log(this.json_pipeline);
    }

    getBlock(x,y){
        //Devuelve el bloque que esta en la coordenada x,y     
        var bloque;
        var no_search = 0;
        this.array_blocks.forEach(element => {
            if(no_search == 0)
            {
                bloque = element.pointInside(x,y);
                if(bloque != -1)
                    no_search = 1; 
            }           
        });   

        if(bloque != -1)
            return bloque;
        else
            return null;
    }

    drawPipeline(){
        //Funcion que dibuja la pipeline

        this.array_blocks.forEach(element => {
            element.drawBlock();
        });

        //Debemos redibujar las lineas
        this.array_lineas.forEach(element => {
            element.draw();
        });
    }

    drawLine(bloque1,bloque2){
        //Funcion que dibuja una linea entre el bloque 1 y el bloque 2
        if(bloque1 !== bloque2)
        {
            var linea1 = new linea(); //Creamos un objeto linea
            
            linea1.setCanvas(this.canvas);
            linea1.setOrigen(bloque1);
            //bloque1.setNextBlock(bloque2);
            linea1.setDestino(bloque2);
            linea1.draw();

            this.array_lineas.push(linea1);
        }
    }

    erasePipeline(){
        //Funcion que borra la pipeline
        const context = this.canvas.getContext('2d');
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.restore();
    }

    showPipeline(){
        
    }

    deleteBlock(bloque){
        //Funcion que elimina un bloque de la pipeline
        //Debemos identificar el bloque por un ID y borrar ese bloque
        //this.drawPipeline(); //Redibujamos la pipeline
        var position = 0;
        this.array_blocks.forEach(element => {
            if(element.getID() == bloque.getID()){
                element.deleteBlock(); //Eliminamos el bloque de la pantalla, pero debemos eliminarlo de la pipeline también
                if(this.last_block.getID() == element.getID())
                {   
                    if(position !=0)
                        this.last_block = this.array_blocks[position-1];
                }

                this.array_blocks.splice(position,1);
            }
            else
                position = position + 1;
        });

        //Una vez eliminado el bloque, tenemos que eliminar las conexiones que apuntaban a dicho bloque
        var pos_linea = 0;
        this.array_lineas.forEach(element => {
            if(element.contieneBloque(bloque) == 1){
                //Tenemos que eliminar el elemento del array de lineas
                element.delete();
            }
        });

        this.array_lineas.forEach(element => {
            if(element.getDelete() == 1)
                this.array_lineas.slice(pos_linea,1);
            pos_linea += 1;
        });
    }
}