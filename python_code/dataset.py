from matplotlib import pyplot as plt
import numpy as np
import scipy.io

class dataset():
    def __init__(self):
        self.X = [] #Datos
        self.Y = [] #Labels
        self.fm = 0
    
    def generateSignal(self, amplitud, tamano):
        y = 0
        result = []
        x = np.linspace(0, tamano, tamano)
        for _ in x:
            result.append(y)
            if not amplitud == 0:
                y += (np.random.normal(scale=1)/10)*amplitud
            else:
                y += (np.random.normal(scale=1)/10)
        
        result = np.array(result)
        return result

    def load_random_signals(self, num_clases, fm, num_trials, num_channels, amplitud, tamano):
        #Generamos señales de forma aleatoria
        self.fm = fm

        self.X = []
        self.Y = []

        self.X = np.zeros((num_trials, num_channels, tamano))

        for trial in range(num_trials):
            self.Y.extend([np.random.randint(0, num_clases)])
            for ch in range(num_channels):
                self.X[trial,ch,:] = self.generateSignal(amplitud, tamano)
        
        self.X = np.asarray(self.X)
        self.Y = np.asarray(self.Y)

        return self.X, self.Y
    
    def load_IIIa(self, sujeto):
        directory = '../db/IIIa/'
        if sujeto == 'k3b':
            directory += 'k3b.mat'
        elif sujeto == 'k6b':
            directory += 'k6b.mat'
        elif sujeto == 'l1b':
            directory += 'l1b.mat'
        
       
        data = scipy.io.loadmat(directory)
        datos = data['datos']
        signal = datos['x_train']
        labels = datos['y_train']

        self.fm = 250
        self.X = np.asarray(signal[0][0])
        labels = np.asarray(labels[0][0])
        self.Y = []

        for l in labels:
            self.Y.append(l-1)
        self.Y = np.asarray(self.Y[0])
        #self.Y = np.transpose(self.Y)

     
        #self.Y = np.transpose(labels)
           
        #self.Y = self.Y - 1 #Para tener las etiquetas del 0 a n-1

        return self.X, self.Y
  