from flask import Flask,redirect
from flask import request
import requests
import docker
from itertools import cycle
import time
from apscheduler.schedulers.background import BackgroundScheduler
from threading import Lock
from threading import *

from xmlReader import reader

serv = {}

lock = Lock()

app = Flask(__name__)

request_count = 0
start_time = 0
start = False

@app.route("/")
def server():
    return "" 

def create_container(temp,ports):
  print(temp,ports)
  cont = client.containers.run(temp['image'],detach=temp['detach'],ports=ports,mem_limit=temp['mem_limit'])
  return cont

@app.route("/<path:url>",methods=['GET','POST','DELETE'])
def categories(url):
    global request_count
    global start
    global start_time
    global serv
    print('\n==========API REQUEST============')
    request_count += 1
    print("Request count : ",request_count)
    if(serv['alarm'] == True):
      if(start == False):
        print('-----------Timer starts--------------')
        start = True
        start_time = time.time() 
    selected_port = str(next(pool))
    print('PORT : ',selected_port)
    print(request.method)
    if(request.method == 'GET'):
        print(request.host)
        path = "http://localhost:"+selected_port+"/"+url
        print(path)
        return requests.get(path).content
    elif(request.method == 'POST'):
        path = "http://localhost:"+selected_port+"/"+url
        print(path)
        return requests.post(path,json=request.get_json()).content
    elif(request.method == 'DELETE'):
        path = "http://localhost:"+selected_port+"/"+url
        print(path)
        return requests.delete(path).content
    return ""

def poll():
   global pool
   global ports
   global container_id
   global request_count
   global lock
   global start
   global start_time
   global serv
   print('\nTime Elapsed : ',round(time.time()-start_time))
   if(round(time.time()-start_time)< (serv['time'])):
       for p in ports:
           resp = requests.get("http://localhost:"+str(p)+serv['health'])
           print(p,resp.status_code)
           if(resp.status_code == 500):
               lock.acquire()
               ports.remove(p)
               pool = cycle(ports)
               lock.release()
               client = docker.from_env()
               del_container = client.containers.get(container_id[str(p)])
               print('Deleting container with id',container_id[str(p)])
               del_container.kill()
               time.sleep(2)
               new_container = create_container(serv,ports={serv['mapping'][1]:p})
               print('New Container created with id ',new_container.id," port ",p)
               time.sleep(3)
               lock.acquire()
               container_id[str(p)] = new_container.id
               ports.append(p)
               pool = cycle(ports)
               lock.release()
               print(ports)
   else:
       print('----- 2 MINUTES OVER-------------')
       container_count =int((request_count/serv['threshold'])+1)
       print('==============CONTAINER COUNT============',container_count)
       extra_container = container_count - len(ports)
       print('Need to create ',extra_container,' more containers')
       if(extra_container>0):
           print('============CREATING NEW CONTAINER=====')
           for i in range(0,extra_container):
               next_available_port = str(max(ports)+1)
               print(next_available_port)
               client = docker.from_env() 
               # scaled_container = client.containers.run("acts",detach=True,ports={'3000/tcp': next_available_port})
               scaled_container = create_container(serv,ports={serv['mapping'][1]:next_available_port})
               print(scaled_container.id)
               time.sleep(3)
               lock.acquire()
               container_id[next_available_port] = scaled_container.id
               ports.append(int(next_available_port))
               pool = cycle(ports)
               lock.release()
           request_count = 0
           start = True
           start_time = time.time()
           print(ports)
       else:
           for i in range(extra_container,0):
               print('------DELETING CONTAINERS----')
               remove_port = str(max(ports))
               print(remove_port)
               client = docker.from_env() 
               del_container = client.containers.get(container_id[str(remove_port)])
               del_container.kill()
               time.sleep(3)
               lock.acquire()
               ports.remove(int(remove_port))
               del container_id[remove_port]
               pool = cycle(ports)
               lock.release()
           start = True
           request_count = 0
           start_time = time.time()

if __name__ == "__main__":

    time.sleep(1)
    obj = reader('generic.xml')
    serv = obj.serv

    print(serv)
    
    client = docker.from_env()

    if('database' in serv):
      create_container(serv['database'],ports={serv['database']['mapping'][1]:serv['database']['mapping'][0]})
    for i in range(int(serv['count'])):
      container = create_container(serv,ports={serv['mapping'][1]:str(int(serv['mapping'][0])+i)})
      ports.append(int(serv['mapping'][0])+i)
      print(ports)
      container_id[str(int(serv['mapping'][0])+i)] = container.id
      pool = cycle(ports)
    
#    t = Timer(1.0, poll)
#    t.start()
    REFRESH_INTERVAL = 1
    scheduler = BackgroundScheduler()
    scheduler.start()
    scheduler.add_job(poll, 'interval', seconds = REFRESH_INTERVAL,id='poll')
    app.debug = False
    app.run(port=80,host='0.0.0.0')
