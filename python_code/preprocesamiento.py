from scipy.signal import butter, welch, filtfilt, lfilter
from scipy import signal
from matplotlib import pyplot as plt
import numpy as np


class preprocesamiento:
    def __init__(self, X, Y, fm):
        self.X = np.asarray(X.copy())
        self.Y = np.asarray(Y.copy())
        self.fm = fm


        self.num_channels = self.X.shape[1]
        self.num_trials = self.X.shape[0]
        self.size_trials = self.X.shape[2] 
    
    def copy(self, pre):
        self.X = pre.X.copy()
        self.Y = pre.Y.copy()
        self.fm = pre.fm.copy()

        self.num_channels = self.X.shape[1]
        self.num_trials = self.X.shape[0]
        self.size_trials = self.X.shape[2] 
    
    def getDatos(self):
        return self.X.copy(), self.Y.copy()
    
    def get_fm(self):
        return self.fm
    
    def promediar_trials(self, cantidad):
        #Los trials que son del mismo tipo deben ser promediados
        #N=4 (se promediaran 4 trials)
        clase1 = []
        clase2 = []

        clases = np.unique(self.Y)
        for (i,trial) in zip(self.Y,self.X):
            if i == clases[0]:
                clase1.append(trial)
            else:
                clase2.append(trial)
        
        clase1 = np.asarray(clase1)
        clase2 = np.asarray(clase2)
        resultado1 = []
        N = 0
        while (N+cantidad)<len(clase1):
            grupo = clase1[N:(N+cantidad),:,:]
            grupo_m = np.mean(grupo, axis=0)
            resultado1.append(grupo_m)
            N = N+cantidad
        
        resultado2 = []
        N = 0
        while (N+cantidad)<len(clase1):
            grupo = clase2[N:(N+cantidad),:,:]
            grupo_m = np.mean(grupo, axis=0)
            resultado2.append(grupo_m)
            N = N+cantidad
        
        X = []
        X.append(resultado1)
        X.append(resultado2)
        Y = []
        Y.extend(np.zeros(len(resultado1)))
        Y.extend(np.ones(len(resultado2)))

        X = np.asarray(X)
        Y = np.asarray(Y)

        X = np.reshape(X, (X.shape[0]*X.shape[1], X.shape[2], X.shape[3]))

        self.X = X.copy()
        self.Y = Y.copy()
        self.num_trials = len(X)
    
    def promediar_clase(self, cantidad, clase):
        trials = []
        resultado = []
        Y = []
        N = 0

        for (i,trial) in zip(self.Y,self.X):
            if i == clase:
                trials.append(trial)
        
        trials = np.asarray(trials)
        

        while (N+cantidad)<len(trials):
            grupo = trials[N:(N+cantidad),:,:]
            grupo_m = np.mean(grupo, axis=0)
            resultado.append(grupo_m)
            N = N+cantidad
            Y.append(clase)

        resultado = np.asarray(resultado)
        Y = np.array(Y)

        return resultado, Y
    
    def promediar_todas_clases(self, cantidad):
        clases = np.unique(self.Y)
        resultados, y = self.promediar_clase(cantidad, clases[0])
        indice = 1

        labels = []
        labels.extend(y)

        while indice < len(clases):
            r, y = self.promediar_clase(cantidad, clases[indice])
            resultados = np.concatenate((resultados, r), axis=0)
            labels.extend(y)
            indice += 1
        
        resultados = np.asarray(resultados)
        labels = np.asarray(labels)
    
    def promediar_trials_canal(self, canal):
        #Funcion que devuelve el promedio de los trials
        clases = np.unique(self.Y)
        promedios = []
        for c in clases:
            p = self.X[[pos for pos,x1 in enumerate(self.Y) if x1 == c],:,:]
            print(p.shape)
            media = p.mean(0)[canal]
            print(p.shape)
            promedios.append(media)
        
        promedios = np.asarray(promedios)

        return promedios
    
    def select_classes(self, clases):
        new_X = []
        new_Y = []
        position = 0
       
        for i in self.Y:
            if i in clases:
                new_X.append(self.X[position])
                if len(np.unique(clases)) == 2:
                    if i == clases[0]:
                    #if i > 0:
                        new_Y.extend([1])
                    else:
                        new_Y.extend([0])
                else:
                    new_Y.extend([i])
            position += 1
        
        self.X = np.asarray(new_X)
        self.Y = np.asarray(new_Y)     

        self.num_channels = self.X.shape[1]
        self.num_trials = self.X.shape[0]
        self.size_trials = self.X.shape[2]    
    
    def particionar_en_trozos_trial(self, size_trozos, start_task=3):
        #Hasta el segundo 3 estamos ante no actividad
        #A partir del segundo 3 estamos ante una clase de imaginacion tanto motora
        #como visual

        cantidad = int(self.X.shape[2]/(size_trozos*self.fm))*self.X.shape[0]
        X = np.zeros((cantidad, self.X.shape[1], int(size_trozos*self.fm)))
        Y = np.zeros(cantidad, dtype=int)

        indice = 0

        for trial, etiqueta in zip(self.X, self.Y):
            inicio = 1
            final = inicio + int(size_trozos*self.fm)
            while final <= trial.shape[1]:
                trozo = trial[:, inicio:final]
                X[indice,:,:] = trozo
                if final<= (start_task*self.fm):
                    Y[indice] = 0 #No imaginacion
                else:
                    if etiqueta == 0:
                        Y[indice] = etiqueta + 1 #Se marca con la etiqueta de la clase
                    else:
                        Y[indice] = etiqueta

                indice += 1

                inicio = final
                final = inicio + int(size_trozos*self.fm)

        X = X[0:indice,:,:]
        Y = Y[0:indice]

        self.X = X.copy()
        self.Y = Y.copy()               
        

    def asignar_etiqueta_binaria(self):
        new_y = []
        etiquetas = np.unique(self.Y)
        for i in self.Y:
            if etiquetas[0] == i:
                new_y.extend([0])
            else:
                new_y.extend([1])
        
        self.Y = new_y.copy()            

    def delete_bad_channels(self, show=0):
            #Funcion para eliminar los canales con mucho ruido
            x_mean = self.X.mean(0)
            #Calculamos la desviacion estandard de cada canal
            array_canales = []
            for ch in range(x_mean.shape[0]):
                canal = x_mean[ch,:]
                array_canales.extend([np.std(canal)]) 
            
            array_canales = np.asarray(array_canales)
            mean_std = array_canales.mean()
            new_ch = []
            for ch in range(len(array_canales)):
                if array_canales[ch] > 2*mean_std:
                    #Se elimina el canal
                    self.num_channels -= 1
                    if show == 1:
                        print('[+] - Delete channel : ', ch)
                else:
                    new_ch.extend([ch])
            
            self.X = self.X[:,new_ch,:]

    def seleccionar_canales(self, canales):
        self.X = self.X[:,canales,:]
        self.num_channels = len(canales)

    def cut(self, ini_task, end_task, ventana=1, solape=0):
        #Funcion para cortar los trials
        pos = 0
        chunks = []
        labels = []
        end_t = end_task*self.fm

        for tarea in self.X:
            start_chunk = int((ini_task)*self.fm)
            end_chunk = start_chunk + int(ventana*self.fm)
            
            while end_chunk <= end_t:
                chunk = tarea[:,start_chunk:end_chunk]
                start_chunk = (end_chunk) - int(solape*self.fm)
                end_chunk = start_chunk + int(ventana*self.fm)                   
                chunks.append(chunk)
                labels.extend([self.Y[pos]])
            
            pos = pos + 1
        
        self.Y = np.asarray(labels).copy()
        self.X = np.asarray(chunks).copy()
    
        self.num_trials = self.X.shape[0]
        self.size_trials = self.X.shape[2]

    
    def delete_DC(self):
        #Eliminamos la linea base de los canales
        for i in range(self.num_trials):
            for ch in range(self.num_channels):
                channel = self.X[i,ch,:]
                self.X[i,ch,:] = channel - np.mean(channel)


    def normalizar(self):
        for i in range(self.num_trials):
            for ch in range(self.num_channels):
                channel = self.X[i,ch,:]
                self.X[i,ch,:] = (channel-np.min(channel))/(np.max(channel)-np.min(channel))
    
    def z_normalizar(self):
        for i in range(self.num_trials):
            for ch in range(self.num_channels):
                channel = self.X[i,ch,:]
                self.X[i,ch,:] = (channel-np.mean(channel))/(np.std(channel))
    
    def resamplear(self, new_fm):
        newNumSamples = int((self.size_trials / self.fm) * new_fm)
        X_new = np.zeros((self.X.shape[0], self.X.shape[1], newNumSamples))
        for i in range(self.num_trials):
            for ch in range(self.num_channels):
                channel = self.X[i,ch,:]
                newNumSamples = int((channel.shape[0] / self.fm) * new_fm)
                y = signal.resample(channel, newNumSamples)
                X_new[i,ch,:] = y
        
        self.X = X_new.copy()
        self.fm = new_fm
        self.size_trials = newNumSamples


    def butter_bandpass(self, lowcut, highcut, order=5):
        nyq = 0.5 * self.fm
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype='band')
        
        return b, a
    
    def filtrar_butter(self, band1, band2, order):
        b, a = self.butter_bandpass(band1, band2, order)
        for i in range(self.num_trials):
            for ch in range(self.num_channels):
                channel = self.X[i,ch,:]  
                tamano = channel.shape[0]   
                channel = np.concatenate((channel, channel))         
                y = lfilter(b, a, channel)
                y = y[0:tamano]
                self.X[i,ch,:] = y

    def filtrar_conv(self):
        '''We design a FIR filter using the window method. We'll pass in 400 as the first argument (we're using 400 taps). 
        Higher numbers mean more precise filtering (the cutoff at our chosen frequencies will be steeper), but more processing and, 
        in a real-time setting, increased latency. The latency when filtering using n stops is about n/2 samples, 
        so in this case we would get a latency of about 200 milliseconds. 
        For our purposes, the precise choice of this first parameter is not very critical.'''
        
        filtro = signal.firwin(400, [0.01, 0.06], pass_zero=False)
        for i in range(self.num_trials):
            for ch in range(self.num_channels):
                channel = self.X[i,ch,:]             
                y = signal.convolve(channel, filtro, mode='same')     
                self.X[i,ch,:] = y
    

    def promediar(self, trial, canal):
        suma = np.zeros(trial.shape[1])

        for ch in range(trial.shape[0]):
            if not ch == canal:
                suma = suma + trial[ch, :]

        return suma/trial.shape[0]
    
    def CAR(self):
        '''Implementacion de un filtro CAR'''
        new_trials = np.zeros((self.X.shape[0], self.X.shape[1], self.X.shape[2]))
        posicion = 0

        for posicion in range(0, self.X.shape[0]):
            trial = self.X[posicion]
            for ch in range(trial.shape[0]):
                canal = trial[ch, :]
                #Promediamos los otros canales
                promedio = self.promediar(trial, ch)
                canal_CAR = canal - promedio
                new_trials[posicion,ch,:] = canal_CAR
            
            posicion +=1

        self.X = new_trials

    