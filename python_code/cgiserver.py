#!/usr/bin/env python3
"""
Very simple HTTP server in python for logging requests
Usage::
    ./server.py [<port>]
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
from requests import Request, Session
from datetime import datetime
from os import listdir, remove
import pandas as pd
import numpy as np
import jsonpickle
import requests
import logging
import json
import cgi
import os
import io

import process_request
import pipeline

array_data = []
  

class S(BaseHTTPRequestHandler):
    def _set_response(self):
        self.send_response(200)        
        self.send_header('Content-type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', '*')                
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.end_headers()

    def do_GET(self):
        #logging.info("GET request,\nPath: %s\nHeaders:\n%s\n", str(self.path), str(self.headers))
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself        

        self._set_response()
        self.wfile.write("GET request for {}".format(self.path).encode('utf-8'))

    def crear_objeto_json(self, datos_entrada):
        objetos = []
        bloque = ''
        cantidad = 0
        while cantidad < len(datos_entrada):
            if not datos_entrada[cantidad] == '}':
                bloque += datos_entrada[cantidad]
            else:
                bloque += '}'
                objetos.append(bloque)
                bloque = ''
                cantidad += 1

            cantidad += 1
        
        return np.asarray(objetos)


    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself           
        #Una vez finalizado debemos enviar estos datos  a una funcion para crear el JSON y crear la pipeline
        #En este punto el servidor debe pocesar los datos en formato JSON que recibe
        
        string_datos = post_data.decode("utf-8")

        print(string_datos)

        objeto_json = self.crear_objeto_json(string_datos)
        print(objeto_json)
        pipe1 = pipeline.pipeline(objeto_json)
        json_final = pipe1.execute()

        #proces1 = process_request.process_request(string_datos)
        #resultado = proces1.process_block()
          
        #data = resultado.encode('utf-8')
        
        print('********************')
        self.stream_data(json_final) #Enviamos los resultados al front-end
        self._set_response()
        self.wfile.write("POST request for {}".format(self.path).encode('utf-8'))
        

    def do_OPTIONS(self):           
        #En cada opcion se debe elegir las funciones a realizar, hacer el servidor es complicado
        #El servidor debe gestionar las peticiones que le llegan, y lo que le llega es conjunto de datos
        #que son los ficheros en EEG y los ficheros evento y un JSON con la pipeline que se debe ejecutar
        
        self._set_response()
        self.wfile.write("OPTIONS request for {}".format(self.path).encode('utf-8'))      
        '''self.send_header('Access-Control-Allow-Origin', '*')                
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With") '''


    def stream_data(self, stream):
        #Consumes a stream in chunks to produce the response's output
        print('[+]- Streaming started...')             
        jsonData = stream
        #jsonData = (stream.to_json(orient='split'))         
        data = jsonData.encode('utf-8')

        self.send_response(200)
               

		#Luego, enviamos las cabezeras, yo enviare solo el tipo del contenido
		#Usamos el metodo send_header, pasandole como argumento la informacion deseada
        
        self.send_header('Content-type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*') 
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept")
        self.send_header("Content-Length", str(len(data)))
        
		#Con el metodo end_headers, terminamos de colocar las cabezeras del servidor
        self.end_headers()
        self.wfile.write(data)
        #Creamos una variable que contendra nuestro mensaje.
        #Fijense que estoy usando etiquetas HTML, ya que lo defini el los headers
       

        #Ahora, escribimos la respuesta en el cuerpo de la pagina
       
        

        print('[+]- Streaming end...')
        

def run(server_class=HTTPServer, handler_class=S, port=8080):
    #logging.basicConfig(level=logging.INFO)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('[+]- Start httpd ... \n')
    #logging.info('Starting httpd...\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
       print('Error en el servidor !!!')

    httpd.server_close()
    print('[+]- Stopping httpd... \n')
    #logging.info('Stopping httpd...\n')

if __name__ == '__main__':
    from sys import argv

    if len(argv) == 2:
        try:
            run(port=int(argv[1]))
        except:
            print('Error en el servidor !!!')

    else:
        run()