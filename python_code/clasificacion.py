import json
import numpy as np
from matplotlib import pyplot as plt
from sklearn.model_selection import KFold, StratifiedKFold
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.ensemble import AdaBoostClassifier
import xgboost as xgb
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2
from sklearn.metrics import cohen_kappa_score
from sklearn.metrics import accuracy_score
from sklearn.metrics import precision_score
from sklearn.metrics import f1_score, mutual_info_score
from sklearn.utils import shuffle
from sklearn import svm

class clasificacion:
    def __init__(self, X, Y):
        self.X = X.copy()
        self.Y = Y.copy()
    
        self.acc = 0
        self.std = 0
        self.kappa = 0
        self.precision = 0
        self.f1 = 0
        self.cm = []
        self.pi = 0
        self.mi = 0
        self.TPR = 0
        self.FPR = 0
        self.m_clf = []
    
    def getJSON(self):
        cm = np.asarray(self.cm).flatten().tolist()
        json_cm = json.dumps(cm)

        json_resultat = {"acc":self.acc,"std":self.std,"kappa":self.kappa,"tpr":self.TPR,"fpr":self.FPR,"cm":json_cm}
        json_resultat = json.dumps(json_resultat)

        '''json_resultat = json_resultat.replace('[','{')
        json_resultat = json_resultat.replace(']','}')'''

        print('CLASIFICADOR : ', json_resultat)
        return json_resultat

    def getResults(self):
        return self.acc, self.std, self.kappa, self.precision, self.f1, self.cm, self.mi, self.pi, self.TPR, self.FPR
    
    def showResults(self):
        print('')
        print('RESULTADOS')
        print('')
        print('  -> Acc : ' + str(self.acc) + ' +/- '+str(self.std)+' -> Kappa :'+str(self.kappa))
        print(' Precision -> : '+str(self.precision)+'  -> F1-score : '+str(self.f1))
        print(' P : ' + str(self.pi) + ' MI : ' + str(self.mi))
        print('')
        print('Confusion Matrix : ')
        print(self.cm)

    def getClasificador(self):
        return self.m_clf

    def k_fold_validation(self, clasificador, n=0, pcav=0, components=10, k=5):      
        from sklearn.base import clone  
        from sklearn.neighbors import DistanceMetric
        from sklearn.decomposition import PCA
            
        acc_t = 0
        kappa_t = 0
        array_acc = []

        accuracy = 0
        precision = 0
        f1 = 0
        cm_aux = np.zeros(len(np.unique(self.Y)))
        pi = 0
        mi = 0

        maximo = -1

        kf = StratifiedKFold(n_splits=k, random_state=None, shuffle=True)

        for train_index, test_index in kf.split(self.X, self.Y):
            X_train, X_test = self.X[train_index], self.X[test_index]
            y_train, y_test = self.Y[train_index], self.Y[test_index]

            if pcav == 1:
               pca1 = PCA(n_components=components)
               pca1.fit(X_train)
               X_train = pca1.transform(X_train)
               X_test = pca1.transform(X_test)

            if clasificador == 'LDA':
                clf = LinearDiscriminantAnalysis()
                clf.fit(X_train, y_train)
            elif clasificador == 'KNN':
                clf = KNeighborsClassifier(n_neighbors=n)
                clf.fit(X_train, y_train)
            elif clasificador == 'SVM':
                clf = svm.SVC(kernel='rbf', gamma='auto') #Usa gamma = 1/number features
                clf.fit(X_train, y_train)
            elif clasificador == 'ADA':
                clf = AdaBoostClassifier(n_estimators=n)
                clf.fit(X_train, y_train)
            elif clasificador == 'VNN':
                pass
            elif clasificador == 'RF':
                clf = RandomForestClassifier(max_depth=n, random_state=0)
                clf.fit(X_train, y_train)

            elif clasificador == 'XBOOST':
                clf=xgb.XGBClassifier(seed= 0, #for reproducibility
                learning_rate= 0.05,
                n_estimators= 500)
                clf.fit(X_train, y_train)


            y_pred = clf.predict(X_test)
            
            kappa = cohen_kappa_score(y_test, y_pred)
            cm = confusion_matrix(y_test, y_pred, normalize='true')
            try:
                cm_aux = cm_aux + cm
            except:
                cm = np.zeros(len(np.unique(self.Y)))
            
            pi += np.trace(cm)/len(np.unique(self.Y))
            try:
                mi += mutual_info_score(y_test.flatten(), y_pred.flatten())
            except:
                mi += mutual_info_score(y_test.flatten(), y_pred)

            kappa_t = kappa_t + kappa

            accuracy = accuracy_score(y_test, y_pred)*100#((tp+tn)/(tp+tn+fp+fn))*100
            precision = precision + precision_score(y_test, y_pred, average='weighted')*100
            f1 = f1 + f1_score(y_test, y_pred, average='weighted')*100

            acc_t = acc_t + accuracy
            array_acc.extend([accuracy])

            if kappa > maximo:
                m_clf = clf

        cm = confusion_matrix(y_test, y_pred)
        FP = cm.sum(axis=0) - np.diag(cm)  
        FN = cm.sum(axis=1) - np.diag(cm)
        TP = np.diag(cm)
        TN = cm.sum() - (FP + FN + TP)

        FP = FP.astype(float)
        FN = FN.astype(float)
        TP = TP.astype(float)
        TN = TN.astype(float)

        # Sensitivity, hit rate, recall, or true positive rate
        TPR = TP/(TP+FN)
        # Specificity or true negative rate
        TNR = TN/(TN+FP) 
        # Precision or positive predictive value
        PPV = TP/(TP+FP)
        # Negative predictive value
        NPV = TN/(TN+FN)
        # Fall out or false positive rate
        FPR = FP/(FP+TN)
        # False negative rate
        FNR = FN/(TP+FN)
        # False discovery rate
        FDR = FP/(TP+FP)

  
        self.TPR = np.mean(TPR/k)
        self.FPR = np.mean(FPR/k)

        self.acc = acc_t/k
        self.std = np.std(array_acc)
        self.kappa = kappa_t/k
        self.precision = precision/k
        self.f1 = f1/k
        self.cm = cm_aux/k
        self.mi = mi/k
        self.pi = pi/k
                

    def k_fold_validation_clasificador(self, clf, x_test, y_test, show=0):
        acc_t = 0
        kappa_t = 0
        array_acc = []
        tpr_t = 0
        fpr_t = 0

        k = 1

        accuracy = 0
        precision = 0
        f1 = 0
        cm_aux = np.zeros(len(np.unique(y_test)))
        pi = 0
        mi = 0    

        try:
            y_pred = clf.predict_classes(x_test)
        except:
            y_pred = clf.predict(x_test)
        
        kappa = cohen_kappa_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred, normalize='true')
        try:
            cm_aux = cm_aux + cm
        except:
            cm = np.zeros(len(np.unique(y_test)))
        
        pi += np.trace(cm)/len(np.unique(y_test))
        try:
            mi += mutual_info_score(y_test.flatten(), y_pred.flatten())
        except:
            mi += mutual_info_score(y_test, y_pred)

        kappa_t = kappa_t + kappa

        accuracy = accuracy_score(y_test, y_pred)*100#((tp+tn)/(tp+tn+fp+fn))*100
        precision = precision + precision_score(y_test, y_pred, average='weighted')*100
        f1 = f1 + f1_score(y_test, y_pred, average='weighted')*100

        acc_t = acc_t + accuracy
        array_acc.extend([accuracy])

        cm = confusion_matrix(y_test, y_pred)
        FP = cm.sum(axis=0) - np.diag(cm)  
        FN = cm.sum(axis=1) - np.diag(cm)
        TP = np.diag(cm)
        TN = cm.sum() - (FP + FN + TP)

        FP = FP.astype(float)
        FN = FN.astype(float)
        TP = TP.astype(float)
        TN = TN.astype(float)

        # Sensitivity, hit rate, recall, or true positive rate
        TPR = TP/(TP+FN)
        # Specificity or true negative rate
        TNR = TN/(TN+FP) 
        # Precision or positive predictive value
        PPV = TP/(TP+FP)
        # Negative predictive value
        NPV = TN/(TN+FN)
        # Fall out or false positive rate
        FPR = FP/(FP+TN)
        # False negative rate
        FNR = FN/(TP+FN)
        # False discovery rate
        FDR = FP/(TP+FP)

  
        self.TPR = np.mean(TPR/k)
        self.FPR = np.mean(FPR/k)

        self.acc = acc_t/k
        self.std = np.std(array_acc)
        self.kappa = kappa_t/k
        self.precision = precision/k
        self.f1 = f1/k
        self.cm = cm_aux/k
        self.mi = mi/k
        self.pi = pi/k

        if show == 1:
            plt.step(np.asarray([i for i in range(len(y_test[0:25]))]), y_test[0:25])
            plt.step(np.asarray([i for i in range(len(y_pred[0:25]))]), y_pred[0:25])
            plt.show()
    
    def validation_CNN(self, clf, x_test, y_test):
        acc_t = 0
        kappa_t = 0
        array_acc = []
        k = 1

        accuracy = 0
        precision = 0
        f1 = 0
        cm_aux = np.zeros(len(np.unique(self.Y)))
        pi = 0
        mi = 0    
        
        y_pred = clf.predict_classes(x_test)

        kappa = cohen_kappa_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred, normalize='true')
        try:
            cm_aux = cm_aux + cm
        except:
            cm = np.zeros(len(np.unique(self.Y)))
        
        pi += np.trace(cm)/len(np.unique(self.Y))
        mi += mutual_info_score(y_test.flatten(), y_pred.flatten())
        kappa_t = kappa_t + kappa

        accuracy = accuracy_score(y_test, y_pred)*100#((tp+tn)/(tp+tn+fp+fn))*100
        precision = precision + precision_score(y_test, y_pred, average='weighted')*100
        f1 = f1 + f1_score(y_test, y_pred, average='weighted')*100

        acc_t = acc_t + accuracy
        array_acc.extend([accuracy])

        self.acc = acc_t/k
        self.std = np.std(array_acc)
        self.kappa = kappa_t/k
        self.precision = precision/k
        self.f1 = f1/k
        self.cm = cm_aux/k
        self.mi = mi/k
        self.pi = pi/k
    
    