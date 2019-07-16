from flask import Flask,redirect
from flask import request
import requests
import docker
from itertools import cycle
import time
from apscheduler.schedulers.background import BackgroundScheduler
from threading import Lock
from threading import *

lock = Lock()

app = Flask(__name__)

request_count = 0
start_time = 0
start = False

@app.route("/")
def server():
    return "" 

@app.route("/api/v1/<path:url>",methods=['GET','POST','DELETE'])
def categories(url):
    global request_count
    global start
    global start_time
    print('==========API REQUEST============')
    request_count += 1
    print("Request count : ",request_count)
    if(start == False):
        print('-----------Timer starts--------------')
        start = True
        start_time = time.time() 
    selected_port = str(next(pool))
    print(selected_port)
    print(request.method)
    if(request.method == 'GET'):
        print(request.host)
        path = "http://3.214.48.23:"+selected_port+"/api/v1/"+url
        print(path)
        return redirect(path)
    elif(request.method == 'POST'):
        path = "http://3.214.48.23:"+selected_port+"/api/v1/"+url
        print(path)
        return redirect(path,code=307)
    elif(request.method == 'DELETE'):
        path = "http://3.214.48.23:"+selected_port+"/api/v1/"+url
        print(path)
        return redirect(path,code=307)
    return ""

def poll():
   global pool
   global ports
   global container_id
   global request_count
   global lock
   global start
   global start_time
   while True:
       print('Time Elapsed : ',round(time.time()-start_time))
       if(round(time.time()-start_time)!=120):
           for p in ports:
               resp = requests.get("http://localhost:"+str(p)+"/api/v1/_health")
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
                   new_container = client.containers.run("acts",detach=True,ports={'3000/tcp': p})
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
           container_count =int((request_count/20)+1)
           print('==============CONTAINER COUNT============',container_count)
           extra_container = container_count - len(ports)
           print('Need to create ',extra_container,' more containers')
           if(extra_container>0):
               print('============CREATING NEW CONTAINER=====')
               for i in range(0,extra_container):
                   next_available_port = str(max(ports)+1)
                   print(next_available_port)
                   client = docker.from_env() 
                   scaled_container = client.containers.run("acts",detach=True,ports={'3000/tcp': next_available_port})
                   print(scaled_container.id)
                   time.sleep(3)
                   container_id[next_available_port] = scaled_container.id
                   lock.acquire()
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
    
    client = docker.from_env()
    mongo = client.containers.run("mongo",detach=True)
    print("Mongo container id : ",mongo.id)
    time.sleep(5)
    container1 = client.containers.run("acts",detach=True,ports={'3000/tcp': 8000})
    print("Container running on port 8000",container1.id)
    time.sleep(5)
      
    ports = [8000]
    container_id = {'8000':container1.id}
    pool = cycle(ports)
    
    t = Timer(1.0, poll)
    t.start()
#    REFRESH_INTERVAL = 1
#    scheduler = BackgroundScheduler()
#    scheduler.start()
#    scheduler.add_job(poll, 'interval', seconds = REFRESH_INTERVAL,id='poll')
    app.debug = False
    app.run(port=80,host='0.0.0.0')
