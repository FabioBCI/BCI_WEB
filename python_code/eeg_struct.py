#Clase que implementa la estructura principal de todo el procesamiento de las señales EEG
#Autor: Fabio R. Llorella Costa
#Fecha: 01/03/2021

import matplotlib.pyplot as plt
import numpy as np
import json
import scipy.io
import dataset

class eeg_struct:

    def __init__(self, num_subjects, num_trials, num_channels, tamano, num_clases):
        #Constructor de la clase
        self.num_subjects = num_subjects
        self.num_trials = num_trials
        self.num_channels = num_channels
        self.num_clases = num_clases
        self.tamano = tamano
        self.fm = 0 #Frecuencia de muestreo
        self.type_database = '' #Nos indica que database se esta utilizando

        self.EEG = [] #Contiene los datos EEG
        self.LABELS = [] #Contiene las etiquetas
    
    def generateSignal(self, amplitud):
        y = 0
        result = []
        x = np.linspace(0, self.tamano, self.tamano)
        for _ in x:
            result.append(y)
            if not amplitud == 0:
                y += (np.random.normal(scale=1)/10)*amplitud
            else:
                y += (np.random.normal(scale=1)/10)
        
        result = np.array(result)
        return result

    def getRandom(self, amplitud):        
        #Nos genera un conjunto de datos aleatorios
        for _ in range(self.num_subjects):
            for _ in range(self.num_trials):
                for _ in range(self.num_channels):
                    self.EEG.append(self.generateSignal(amplitud))

        self.EEG = np.asarray(self.EEG)
        self.EEG = np.reshape(self.EEG, (self.num_subjects, self.num_trials, self.num_channels, self.tamano))

        diccionario = {'labels':np.asarray(self.LABELS).tolist(),'EEG':np.asarray(self.EEG).tolist()}

        return json.dumps(diccionario)
    
    def getBCI_IIIa(self, subject, ch, trial):
        #Abrimos los datos de BCI IIIa        
        fichero = './bd/sujeto'+str(subject)+'.mat'

        data = scipy.io.loadmat(fichero)
        datos = data['datos']
        signal = datos['X']
        labels = datos['Y']
       
        X = np.asarray(signal[0][0])
        labels = np.asarray(labels[0][0])
        Y = np.transpose(labels)

        self.EEG = X.copy()
        self.LABELS = Y.copy()
        diccionario = {'EEG':self.EEG[trial,ch,:].tolist()}

        return json.dumps(diccionario)




