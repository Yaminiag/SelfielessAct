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

ports = [8000]
container_id = {'8000':'b8b580fbee08'}
pool = cycle(ports)
request_count = 0
start = False
start_time = 0
 
@app.route("/")
def server():
    client = docker.from_env()
    print(client)
    mongo = client.containers.run("mongo",detach=True)
    print(mongo.id)
    container1 = client.containers.run("acts",detach=True,ports={'3000/tcp': 8000})
    print(container1.id)
    container2 = client.containers.run("acts", detach=True,ports={'3000/tcp': 8001})
    print(container2.id)
    container3 = client.containers.run("acts", detach=True,ports={'3000/tcp': 8002})
    print(container3.id)
    return "" 

@app.route("/api/v1/<path:url>",methods=['GET','POST','DELETE'])
def categories(url):
    global request_count
    global start
    print('==========API REQUEST============')
    request_count += 1
    print(request_count)
    if(start == False):
        print('Timer starts')
        start = True
        scheduler.add_job(autoscale, 'interval', minutes = 2) 
    selected_port = str(next(pool))
    print(selected_port)
    print(request.method)
    if(request.method == 'GET'):
        print(request.host)
        path = "http://"+request.host+":"+selected_port+"/api/v1/"+url
        print(path)
        return redirect(path)
    elif(request.method == 'POST'):
        path = "http://"+request.host+":"+selected_port+"/api/v1/"+url
        print(path)
        return redirect(path,code=307)
    elif(request.method == 'DELETE'):
        path = "http://"+request.host+":"+selected_port+"/api/v1/"+url
        print(path)
        return redirect(path,code=307)
    return ""

def poll():
   global pool
   global ports
   global container_id
   global lock
   while True:
       for p in ports:
           resp = requests.get("http://50.17.105.116:"+str(p)+"/api/v1/_health")
           print(p,resp.status_code)
           if(resp.status_code == 500):
               lock.acquire()
               ports.remove(p)
               pool = cycle(ports)
               lock.release()
               client = docker.from_env()
               del_container = client.containers.get(container_id[str(p)])
               del_container.kill()
               new_container = client.containers.run("acts",detach=True,ports={'3000/tcp': p})
               print(new_container)
               time.sleep(5)
               lock.acquire()
               container_id[str(p)] = new_container.id
               ports.append(p)
               pool = cycle(ports)
               lock.release()
               print(ports)

def autoscale():
    global request_count
    global ports
    global container_id
    global pool
    global start
    global start_time
    global lock
    print('=============AUTOSCALE===========')
    container_count =int((request_count/20)+1)
    print('==============CONTAINER COUNT============',container_count)
    extra_container = container_count - len(ports)
    print(extra_container)
    if(extra_container>0):
        for i in range(0,extra_container):
            next_available_port = str(max(ports)+1)
            print(next_available_port)
            client = docker.from_env()
            scaled_container = client.containers.run("acts",detach=True,ports={'3000/tcp': next_available_port})
            print(scaled_container.id)
            time.sleep(5)
            container_id[next_available_port] = scaled_container.id
            lock.acquire()
            ports.append(int(next_available_port))
            pool = cycle(ports)
            request_count = 0
            start = True
            start_time = time.time()
            lock.release()
            print(ports)
    elif(extra_container<0):
        for i in range(extra_container,0):
            remove_port = str(max(ports))
            print(remove_port)
            client = docker.from_env()
            del_container = client.containers.get(container_id[str(remove_port)])
            del_container.kill()
            time.sleep(5)
            #lock.acquire()
            ports.remove(int(remove_port))
            del container_id[remove_port]
            pool = cycle(ports)
            #lock.release()
            start = True
            request_count = 0
            start_time = time.time()
    else:
        start = True
        request_count = 0
        start_time = time.time()


if __name__ == "__main__":
    
    REFRESH_INTERVAL = 1 #seconds
    t = Timer(1.0, poll)
    t.start()
    scheduler = BackgroundScheduler()
    scheduler.start()
    scheduler.add_job(poll, 'interval', seconds = REFRESH_INTERVAL,id='poll')
    app.debug = False
    app.run(port=80,host='0.0.0.0')
