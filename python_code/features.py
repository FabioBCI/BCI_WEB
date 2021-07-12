import numpy as np
from scipy.signal import welch
from scipy.integrate import simps
from matplotlib import pyplot as plt
from scipy import signal
import numpy.fft as fft
from sklearn.preprocessing import StandardScaler

class features:
    def __init__(self, X, Y):
        self.X = X.copy()
        self.Y = Y.copy()
        
        self.features = []
        self.labels = Y.copy()
    
        self.num_channels = self.X.shape[1]
        self.num_trials = self.X.shape[0]
        self.size_trials = self.X.shape[2]
    
    def getDatos(self):
        return self.features, self.labels
    
    def calc_hjorth(self, x):
        first_deriv = np.diff(x)
        second_deriv= np.diff(x, 2)
        var_zero = np.mean(x**2)
        var_d1 = np.mean(first_deriv**2)
        var_d2 = np.mean(second_deriv**2)
        activity = var_zero
        mobility = np.sqrt(var_d1/var_zero)
        complexity = np.sqrt(var_d2/var_d1) / mobility

        return activity, mobility, complexity
    
    def _embed(self, x, order=3, delay=1):
        """Time-delay embedding.
        Parameters
        ----------
        x : 1d-array
            Time series, of shape (n_times)
        order : int
            Embedding dimension (order).
        delay : int
            Delay.
        Returns
        -------
        embedded : ndarray
            Embedded time-series, of shape (n_times - (order - 1) * delay, order)
        """
        N = len(x)
        if order * delay > N:
            raise ValueError("Error: order * delay should be lower than x.size")
        if delay < 1:
            raise ValueError("Delay has to be at least 1.")
        if order < 2:
            raise ValueError("Order has to be at least 2.")
        Y = np.zeros((order, N - (order - 1) * delay))
        for i in range(order):
            Y[i] = x[(i * delay):(i * delay + Y.shape[1])]
        return Y.T

    def perm_entropy(self, x, order=3, delay=1, normalize=False):
        '''Permutation Entropy.
        Parameters
        ----------
        x : list or np.array
            One-dimensional time series of shape (n_times)
        order : int
            Order of permutation entropy. Default is 3.
        delay : int
            Time delay (lag). Default is 1.
        normalize : bool
            If True, divide by log2(order!) to normalize the entropy between 0
            and 1. Otherwise, return the permutation entropy in bit.
        Returns
        -------
        pe : float
            Permutation Entropy.
        Notes
        -----
        The permutation entropy is a complexity measure for time-series first
        introduced by Bandt and Pompe in 2002.
        The permutation entropy of a signal :math:`x` is defined as:
        .. math:: H = -\\sum p(\\pi)\\log_2(\\pi)
        where the sum runs over all :math:`n!` permutations :math:`\\pi` of order
        :math:`n`. This is the information contained in comparing :math:`n`
        consecutive values of the time series. It is clear that
        :math:`0 ≤ H (n) ≤ \\log_2(n!)` where the lower bound is attained for an
        increasing or decreasing sequence of values, and the upper bound for a
        completely random system where all :math:`n!` possible permutations appear
        with the same probability.'''

        from math import factorial, log
        x = np.array(x)
        ran_order = range(order)
        hashmult = np.power(order, ran_order)
        # Embed x and sort the order of permutations
        sorted_idx = self._embed(x, order=order, delay=delay).argsort(kind='quicksort')
        # Associate unique integer to each permutations
        hashval = (np.multiply(sorted_idx, hashmult)).sum(1)
        # Return the counts
        _, c = np.unique(hashval, return_counts=True)
        # Use np.true_divide for Python 2 compatibility
        p = np.true_divide(c, c.sum())
        pe = -np.multiply(p, np.log2(p)).sum()
        if normalize:
            pe /= np.log2(factorial(order))
        return pe

    def permutation_entropy(self):
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                pe = self.perm_entropy(segmento)
                feature.extend([pe])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()

    
    def calc_higuchi(self, a, k_max = 5):
        L = []
        x = []
        N = a.size

        for k in range(1,k_max):
            Lk = 0
            for m in range(0,k):
                #we pregenerate all idxs
                idxs = np.arange(1,int(np.floor((N-m)/k)),dtype=np.int32)

                Lmk = np.sum(np.abs(a[m+idxs*k] - a[m+k*(idxs-1)]))
                Lmk = (Lmk*(N - 1)/(((N - m)/ k)* k)) / k
                Lk += Lmk


        L.append(np.log(Lk/(m+1)))
        x.append([np.log(1.0/ k), 1])

        (p, r1, r2, s)=np.linalg.lstsq(x, L)
        return p[0]

    def hjorth(self):
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                activity, mobility, complexity = self.calc_hjorth(segmento)
                
                feature.extend([activity, mobility, complexity])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    
    def statistics_features(self, mean_b, std_b, max_b, min_b, kurtosis_b, wave_b):
        from scipy.stats import kurtosis

        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                f = []
                if mean_b == 1:
                    a = np.mean(segmento)
                    f.append(a)
                if std_b == 1:
                    a = np.std(segmento)
                    f.append(a)
                if max_b == 1:
                    a = max(segmento)
                    f.append(a)
                if min_b == 1:
                    a = min(segmento)
                    f.append(a)
                if kurtosis_b == 1:
                    a = kurtosis(segmento)
                    f.append(a)
                if wave_b == 1:
                    a = self.wave_length(segmento)
                    f.append(a)
                
                f = np.asarray(f)

                feature.extend(f)
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()

    
    def butter_bandpass(self, lowcut, highcut, fm = 250, order=5):
        from scipy.signal import butter, welch, filtfilt, lfilter
        from scipy import signal

        nyq = 0.5 * fm
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype='band')
        
        return b, a
    

    def hjorth_freq(self, fm = 250):
        from scipy.signal import butter, welch, filtfilt, lfilter
        from scipy import signal

        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]

                b1, a1 = self.butter_bandpass(1, 4, fm, 5)
                b2, a2 = self.butter_bandpass(4, 7, fm, 5)
                b3, a3 = self.butter_bandpass(8, 12, fm, 5)
                b4, a4 = self.butter_bandpass(13, 30, fm, 5)
                b5, a5 = self.butter_bandpass(31, 45, fm, 5)

                channel = np.asarray(np.concatenate((segmento, segmento)))
                tamano = channel.shape[0]  

                y1 = lfilter(b1, a1, channel)
                y1 = y1[0:tamano]

                y2 = lfilter(b2, a2, channel)
                y2 = y2[0:tamano]

                y3 = lfilter(b3, a3, channel)
                y3 = y3[0:tamano]

                y4 = lfilter(b4, a4, channel)
                y4 = y4[0:tamano]

                y5 = lfilter(b5, a5, channel)
                y5 = y5[0:tamano]



                activity1, mobility1, complexity1 = self.calc_hjorth(y1)
                activity2, mobility2, complexity2 = self.calc_hjorth(y2)
                activity3, mobility3, complexity3 = self.calc_hjorth(y3)
                activity4, mobility4, complexity4 = self.calc_hjorth(y4)
                activity5, mobility5, complexity5 = self.calc_hjorth(y5)
                
                f = [activity1, mobility1, complexity1, activity2, mobility2, complexity2,
                                activity3, mobility3, complexity3, activity4, mobility4, complexity4,
                                activity5, mobility5, complexity5]
                f = (f-np.min(f))/(np.max(f)-np.min(f)) #Normalizamos las features
                feature.extend(f)
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    
    def higuchi(self, k=5):
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                activity = self.calc_higuchi(segmento, k)
                feature.extend([activity])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()

    def CPT5(sef, x):
        den = len(x)*np.exp(np.std(x))
        return sum(np.exp(x))/den
    
    def SSC(self, x):
        x = np.array(x)
        x = np.append(x[-1], x)
        x = np.append(x,x[1])
        xn = x[1:len(x)-1]
        xn_i2 = x[2:len(x)]    # xn+1 
        xn_i1 = x[0:len(x)-2]  # xn-1
        ans = np.heaviside((xn-xn_i1)*(xn-xn_i2),0)
        return sum(ans[1:]) 

    def wave_length(self, x):
        x = np.array(x)
        x = np.append(x[-1], x)
        x = np.append(x,x[1])
        xn = x[1:len(x)-1]
        xn_i2 = x[2:len(x)]    # xn+1 
        return sum(abs(xn_i2-xn))

    def SRAV(self, x):    
        SRA = sum(np.sqrt(abs(x)))
        return np.power(SRA/len(x),2)

    def mean_abs(self, x):
        return sum(abs(x))/len(x)
        
    def statics(self,):
        from scipy.stats import kurtosis

        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                segmento = StandardScaler().fit_transform(segmento.reshape(-1,1)).reshape(1,-1)[0]
                p1 =  self.CPT5(segmento)
                p2 = self.SSC(segmento)
                p3 = self.wave_length(segmento)
                p4 = self.SRAV(segmento)
                p5 = self.mean_abs(segmento)              

                feature.extend([p1,p2,p3,p4,p5])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    
    def statics_hjorth(self,):
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                p1 = np.mean(segmento)
                p2 = np.std(segmento)
                p3 = max(segmento)
                p4 = min(segmento)
                p5 = sum(segmento)
                activity, mobility, complexity = self.calc_hjorth(segmento)

                feature.extend([p1, p2, p3, p4, p5,  activity, mobility, complexity])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    
    def calculate_entropy(self, list_values):
        counter_values = Counter(list_values).most_common()
        probabilities = [elem[1]/len(list_values) for elem in counter_values]
        entropy=scipy.stats.entropy(probabilities)
        return entropy
    
    def calculate_statistics(self, list_values):
        n5 = np.nanpercentile(list_values, 5)
        n25 = np.nanpercentile(list_values, 25)
        n75 = np.nanpercentile(list_values, 75)
        n95 = np.nanpercentile(list_values, 95)
        median = np.nanpercentile(list_values, 50)
        mean = np.nanmean(list_values)
        std = np.nanstd(list_values)
        var = np.nanvar(list_values)
        rms = np.nanmean(np.sqrt(list_values**2))
        # New features
        kur = kurtosis(list_values)
        MeanAbs = mean_abs(list_values)
        norm_ent = norm_entropy(list_values)
        skewness = skew(list_values)
        CPT_5 = CPT5(list_values)
        SSC_1 = SSC(list_values)
        WL = wave_length(list_values)
        SRAV_1 = SRAV(list_values)
        return [n5, n25, n75, n95, median, mean, std, var, rms, kur, MeanAbs, norm_ent, skewness, CPT_5, SSC_1, WL, SRAV_1]

    def calculate_crossings(self, list_values):
        zero_crossing_indices = np.nonzero(np.diff(np.array(list_values) > 0))[0]
        no_zero_crossings = len(zero_crossing_indices)
        mean_crossing_indices = np.nonzero(np.diff(np.array(list_values) > np.nanmean(list_values)))[0]
        no_mean_crossings = len(mean_crossing_indices)
        return [no_zero_crossings, no_mean_crossings]

    def get_features(self, list_values):
        '''entropy = self.calculate_entropy(list_values)
        crossings = self.calculate_crossings(list_values)'''
        statistics = self.calculate_statistics(list_values)
        return statistics
        #return [entropy] + crossings + statistics 

    def wavelet(self, level):
        import pywt

        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]

                data_std = StandardScaler().fit_transform(segmento.reshape(-1,1)).reshape(1,-1)[0]            

                # WPD tree
                wptree = pywt.WaveletPacket(data=data_std, wavelet='db5', mode='symmetric', maxlevel=level)
                levels = wptree.get_level(level, order = "freq")            

                #Feature extraction for each node     
                for node in levels:
                    data_wp = node.data
                    '''activity, mobility, complexity = self.calc_hjorth(data_wp)
                    feature.extend([activity, mobility, complexity])'''
                    # Features group
                    feature.extend(self.get_features(data_wp))
                
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    

    def bandpower(self, data, band, fm, window_sec=None, relative=False):
        """Compute the average power of the signal x in a specific frequency band.

        Parameters
        ----------
        data : 1d-array
            Input signal in the time-domain.
        sf : float
            Sampling frequency of the data.
        band : list
            Lower and upper frequencies of the band of interest.
        window_sec : float
            Length of each window in seconds.
            If None, window_sec = (1 / min(band)) * 2
        relative : boolean
            If True, return the relative power (= divided by the total power of the signal).
            If False (default), return the absolute power.

        Return
        ------
        bp : float
            Absolute or relative band power.
        """

        band = np.asarray(band)
        low, high = band
      
     
        # Define window length
        if window_sec is not None:
            nperseg = window_sec * fm
        else:
            nperseg = (2 / low) * fm

        # Compute the modified periodogram (Welch)
        freqs, psd = welch(data, fm, nperseg=nperseg)

        # Frequency resolution
        freq_res = freqs[1] - freqs[0]
     

        # Find closest indices of band in frequency vector
        idx_band = np.logical_and(freqs >= low, freqs <= high)
   

        # Integral approximation of the spectrum using Simpson's rule.
        bp = simps(psd[idx_band], dx=freq_res)
        

        if relative:
            bp /= simps(psd, dx=freq_res)

        return bp
    
    def BP(self, banda1, banda2, fm):
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                b = self.bandpower(segmento,[banda1,banda2],fm)
                feature.extend([b])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    
    def psd(self, fm):
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                freqs, psd = welch(segmento, fm, nperseg=125)
                
                idx_band = np.logical_and(freqs >= 1, freqs <= 25)
                feature.extend(psd[idx_band])
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()

    def bands_alpha_beta(self, fm):
        from scipy.fft import fft, ifft

        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]

                fft_wave  = np.fft.fft(segmento)
                fft_fre = np.fft.fftfreq(n=segmento.size, d=1/fm)
                #Cojo los valores de 8-12 Hz, 13-24 Hz, 25-30 Hz

                idx_band1 = np.logical_and(fft_fre >= 8, fft_fre <= 12)
                idx_band2 = np.logical_and(fft_fre >= 13, fft_fre <= 24)
                idx_band3 = np.logical_and(fft_fre >= 25, fft_fre <= 30)

                alpha = sum(fft_wave.real[idx_band1])
                beta1 = sum(fft_wave.real[idx_band2])
                beta2 = sum(fft_wave.real[idx_band3])

                feature.extend([alpha, beta1, beta2])

                '''plt.subplot(211)
                plt.plot(fft_fre, fft_wave.real, label="Real part")
                plt.xlim(-50,50)
                plt.ylim(-600,600)
                plt.legend(loc=1)
                plt.title("FFT in Frequency Domain")

                plt.subplot(212)
                plt.plot(fft_fre, fft_wave.imag,label="Imaginary part")
                plt.legend(loc=1)
                plt.xlim(-50,50)
                plt.ylim(-600,600)
                plt.xlabel("frequency (Hz)")

                plt.show()'''
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()

    def calculate_entropy(self,list_values):
        from collections import Counter
        import scipy

        counter_values = Counter(list_values).most_common()
        probabilities = [elem[1]/len(list_values) for elem in counter_values]
        entropy=scipy.stats.entropy(probabilities)
        return entropy

    def calculate_statistics(self,list_values):
        n5 = np.nanpercentile(list_values, 5)
        n25 = np.nanpercentile(list_values, 25)
        n75 = np.nanpercentile(list_values, 75)
        n95 = np.nanpercentile(list_values, 95)
        median = np.nanpercentile(list_values, 50)
        mean = np.nanmean(list_values)
        std = np.nanstd(list_values)
        var = np.nanvar(list_values)
        rms = np.nanmean(np.sqrt(list_values**2))
        return [n5, n25, n75, n95, median, mean, std, var, rms]


    def get_features(self,list_values):
        #entropy = self.calculate_entropy(list_values)
        statistics = self.calculate_statistics(list_values)
        return statistics #[entropy] + statistics


    def entropy_statics(self):
        from sklearn import preprocessing
        import pywt
        
        features = []
        for trial in self.X:
            feature = []
            for ch in range(trial.shape[0]):
                segmento = trial[ch,:]
                #[cfs, _] = pywt.cwt(segmento, scales, waveletname, 1)
                #power = (abs(cfs)) ** 2
                
                feature += self.get_features(segmento)
                #print(np.asarray(feature).shape)
                
                '''power = (abs(cfs)) ** 2

                period = 1. / frequencies
                levels = [0.0625, 0.125, 0.25, 0.5, 1, 2, 4, 8]
                f, ax = plt.subplots(figsize=(15, 10))
                ax.contourf(time, np.log2(period), np.log2(power), np.log2(levels),
                            extend='both')

                ax.set_title('%s Wavelet Power Spectrum (%s)' % ('Nino1+2', waveletname))
                ax.set_ylabel('Period (seconds)')
                Yticks = 2 ** np.arange(np.ceil(np.log2(period.min())),
                                        np.ceil(np.log2(period.max())))
                ax.set_yticks(np.log2(Yticks))
                ax.set_yticklabels(Yticks)
                ax.invert_yaxis()
                ylim = ax.get_ylim()
                ax.set_ylim(ylim[0], -1)

                plt.show()'''
                
            
            features.append(feature)
        
        self.features = np.asarray(features).copy()
    
    def create_cwt_images(self, n_scales, rescale_size, wavelet_name = "morl"):
        import pywt
        
        n_samples = self.X.shape[0]
        n_signals = self.X.shape[1]

        X_cwt = np.ndarray(shape=(n_samples, rescale_size, rescale_size, n_signals), dtype = 'float32')
    
        scales = np.arange(1, n_scales + 1) 
        for sample in range(n_samples):
            for ch in range(self.X[sample].shape[0]):
                segmento = self.X[sample,ch,:]
                coeffs, _ = pywt.cwt(segmento, scales, wavelet_name)
                rescale_coeff = np.resize(coeffs,(rescale_size, rescale_size))                                
                X_cwt[sample,:,:,ch] = rescale_coeff
       
        self.features = X_cwt.copy()
    
    def create_time_images(self, fm):
        import math
        import pywt        
        
        n_samples = self.X.shape[0]
        n_signals = self.X.shape[1]

        rescale_size = int(math.sqrt(fm))
        X_cwt = np.ndarray(shape=(n_samples, rescale_size, rescale_size, n_signals), dtype = 'float32')
     
        for sample in range(n_samples):
            for ch in range(self.X[sample].shape[0]):
                segmento = self.X[sample,ch,:]
                segmento = np.resize(segmento,(rescale_size, rescale_size))                                
                X_cwt[sample,:,:,ch] = segmento


        self.features = X_cwt.copy()
    
    def create_STFT(self):
        import math
        import pywt        
        
        n = 16

        features = []
        for sample in range(len(self.X)):
            features_segment = []
            for ch in range(self.X[sample].shape[0]):
                segmento = self.X[sample,ch,:]
                s = self.stft(segmento, n, Nfft=n*2)
                t, f = self.stftbins(segmento, n, Nfft=n*2, d=1 / 250)
                assert (len(t) == s.shape[0])
                assert (len(f) == s.shape[1])

                '''plt.imshow(np.abs(s), aspect="auto", extent=[f[0], f[-1], t[-1], t[0]])
                plt.xlabel('frequency (Hertz)')
                plt.ylabel('time (seconds (start of chunk))')
                plt.title('STFT with chirp example')
                plt.grid()
                plt.show()'''

                s = np.abs(s)
                s = np.asarray(s)
                feature = np.reshape(s,(s.shape[0]*s.shape[1]))
                features_segment.extend(feature)

            features.append(features_segment)
        
        self.features = np.asarray(features)
            #self.features[sample,:,:,ch] = f

    def stft(self, x, Nwin, Nfft=None):
        """
        Short-time Fourier transform: convert a 1D vector to a 2D array
        The short-time Fourier transform (STFT) breaks a long vector into disjoint
        chunks (no overlap) and runs an FFT (Fast Fourier Transform) on each chunk.
        The resulting 2D array can 
        Parameters
        ----------
        x : array_like
            Input signal (expected to be real)
        Nwin : int
            Length of each window (chunk of the signal). Should be ≪ `len(x)`.
        Nfft : int, optional
            Zero-pad each chunk to this length before FFT. Should be ≥ `Nwin`,
            (usually with small prime factors, for fastest FFT). Default: `Nwin`.
        Returns
        -------
        out : complex ndarray
            `len(x) // Nwin` by `Nfft` complex array representing the STFT of `x`.
        
        See also
        --------
        istft : inverse function (convert a STFT array back to a data vector)
        stftbins : time and frequency bins corresponding to `out`
        """
        Nfft = Nfft or Nwin
        Nwindows = x.size // Nwin
        # reshape into array `Nwin` wide, and as tall as possible. This is
        # optimized for C-order (row-major) layouts.
        arr = np.reshape(x[:Nwindows * Nwin], (-1, Nwin))
        stft = fft.rfft(arr, Nfft)
        return stft


    def stftbins(self, x, Nwin, Nfft=None, d=1.0):
        """
        Time and frequency bins corresponding to short-time Fourier transform.
        Call this with the same arguments as `stft`, plus one extra argument: `d`
        sample spacing, to get the time and frequency axes that the output of
        `stft` correspond to.
        Parameters
        ----------
        x : array_like
            same as `stft`
        Nwin : int
            same as `stft`
        Nfft : int, optional
            same as `stft`
        d : float, optional
            Sample spacing of `x` (or 1 / sample frequency), units of seconds.
            Default: 1.0.
        Returns
        -------
        t : ndarray
            Array of length `len(x) // Nwin`, in units of seconds, corresponding to
            the first dimension (height) of the output of `stft`.
        f : ndarray
            Array of length `Nfft`, in units of Hertz, corresponding to the second
            dimension (width) of the output of `stft`.
        """
        Nfft = Nfft or Nwin
        Nwindows = x.size // Nwin
        t = np.arange(Nwindows) * (Nwin * d)
        f = fft.rfftfreq(Nfft, d)
        return t, f
    

        