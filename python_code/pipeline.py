
#Autor: Fabio R. Llorella Costa
#Fecha: 11/05/2021
#Clase para implementar una pipeline

import numpy as np
import json
import dataset
import preprocesamiento
import features
import clasificacion

class pipeline:
    def __init__(self, json_string):
        #Recibe un JSON y lo ejecuta paso a paso
        #Se ejecuta segun el orden de los bloques
        self.JSON = json_string
        self.subject = 0
        self.X = []
        self.Y = []
        self.fm = 0

        self.k_fold = 0
        self.k = 0
        self.respuesta = ''
    
    def exec_block(self, tipo, block):
        dataset1 = dataset.dataset() #Creamos el objeto dataset

        if tipo == 'sujeto':
            num = int(block['num'])
            self.subject = num

        if tipo == 'random':            
            print('[+]- Random : Processed')
            
            num_clases = block['num_clases']
            self.fm = block['fm']
            num_trials = block['trials']
            num_channels = block['channels']
            amplitud = block['amp']
            tamano = block['size']
            trial = block['trial']
           
            self.X, self.Y = dataset1.load_random_signals(num_clases, self.fm, num_trials, num_channels, amplitud, tamano)

            diccionario = {'num_trials':self.X.shape[0],'channels':self.X.shape[1],'size':self.X.shape[2]} #Cogemos el primer trial

            for ch in range(0, self.X.shape[1]):
                string_canal = 'canal'+str(ch)
                dicc = {string_canal:self.X[trial,ch,:].tolist()}
                diccionario.update(dicc)

            
            self.respuesta =  json.dumps(diccionario)
    
        if tipo == 'IIIa':
            #Tenemos que tener en cuenta el sujeto
            #tipo_bci = block['number_bci']
            #if tipo_bci == 31:
                #Estamos ante BCI Competicion IIIa
            sujeto = block['subject']
            trial = block['trial']
            self.fm = 250
            self.X, self.Y = dataset1.load_IIIa(sujeto)

            diccionario = {'num_trials':self.X.shape[0],'channels':self.X.shape[1],'size':self.X.shape[2]} #Cogemos el primer trial

            for ch in range(0, self.X.shape[1]):
                string_canal = 'canal'+str(ch)
                dicc = {string_canal:self.X[trial,ch,:].tolist()}
                diccionario.update(dicc)

            
            self.respuesta =  json.dumps(diccionario)

            print('[+]- IIIa : Processed')
        
        if tipo == 'BandPass':
            print('[+]- Band Pass : Processed')

            banda1 = int(block['high'])
            banda2 = int(block['low'])
            order = int(block['order'])
            pre1 = preprocesamiento.preprocesamiento(self.X, self.Y, self.fm)
            pre1.filtrar_butter(banda1, banda2, order)

            self.X, self.Y = pre1.getDatos()
        
        if tipo == 'cut_trial':
            #Bloque para particionar los trials
            print('[+]- Cut : Processed')

            overlap = int(block['overlap'])
            size = int(block['size'])
            start_task = int(block['start'])
            end_task = int(block['end'])
            pre1 = preprocesamiento.preprocesamiento(self.X, self.Y, self.fm)
            pre1.cut(start_task, end_task, size, overlap)
            self.X, self.Y = pre1.getDatos()
        
        if tipo == "select_label":
            #Seleccionamos los labels
            print('[+]- Select labels : Processed')
            labels = block['labels']

            a_list = labels.split()
            map_object = map(int, a_list)
            clases = list(map_object)
    
            print(clases)
            pre1 = preprocesamiento.preprocesamiento(self.X, self.Y, self.fm)
            pre1.select_classes(clases)
            self.X, self.Y = pre1.getDatos()

        if tipo == 'Hjorth':
            print('[+]- Hjorth : Processed')

            feat1 = features.features(self.X, self.Y)
            feat1.hjorth()
            self.X, self.Y = feat1.getDatos()  

            print(self.X.shape)
            print(self.Y.shape)
        
        if tipo == 'statistics':
            print('[+]- Statistics : Processed')

            meanb = int(block['mean'])
            stdb = int(block['std'])
            maxb = int(block['max'])
            minb = int(block['min'])
            kurtosisb = int(block['kurtosis'])
            waveb = int(block['wave_length'])

            feat1 = features.features(self.X, self.Y)
            feat1.statistics_features(meanb, stdb, maxb, minb, kurtosisb, waveb)
            self.X, self.Y = feat1.getDatos()  

            print(self.X.shape)
            print(self.Y.shape)

        if tipo == 'KFold':
            print('[+]- KFold : Processed')
            self.k_fold = 1
            self.k = int(block['k'])

        if tipo == 'LDA':
            print('[+]- LDA : Processed')

            clas1 = clasificacion.clasificacion(self.X, self.Y)
            if self.k_fold == 1:
                clas1.k_fold_validation('LDA', 0, 0, 0, self.k)
                self.respuesta = clas1.getJSON() #Aqui mas que show deberia ser devolver un JSON con los resultados

    def execute(self):
        #Ejecutamos la pipeline que viene determinada por el JSON

        for bloque in self.JSON:
            json_string = json.loads(bloque)
            tipo_bloque = json_string['type']
            self.exec_block(tipo_bloque, json_string)

        return self.respuesta
    





