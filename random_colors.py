#! /bin/env python
import time
import json
import requests
import random

import pprint
pp = pprint.PrettyPrinter(indent=4).pprint

# config
hostname = "http://192.168.86.180"

device_type = "my_hue_app#my_hostname"
hue_max = 65535
hue_step = 500

with open ('api_key', 'r+') as file:
    api_key = file.readline()

    ## Get API key
    if not api_key:
        r = requests.post(hostname+"/api", data=json.dumps({"devicetype": device_type}))
        r = r.json()
        if 'success' in r[0]:
            api_key = r[0]['success']['username']
            print(api_key)
            file.write(api_key)
        else:
            print("ERROR while requesting api key:")
            print(r)

url = hostname+"/api/"+api_key+"/"

# init lights
r = requests.get(url).json()
pp(r)
lights = {i:l['state'] for i,l in r['lights'].items() if l['state']['on']}
pp(lights)

# r = requests.put(url+"lights/1/state", data=json.dumps({'hue': 0}))
# pp(r.json())
# lights = {'1': lights['1']}

# seed lights
for i in lights:
    lights[i]['hue'] = random.random()*hue_max

while True:
    time.sleep(0.1)
    # time.sleep(2)
    # x += 1
    for i,l in lights.items():
        x = random.random()*hue_step # one way
        lights[i]['hue'] = int(l['hue']+x) if l['hue']+x <= hue_max else 0
        print(i, x, lights[i]['hue'])
        r = requests.put(url+"lights/"+i+"/state", data=json.dumps({'hue': lights[i]['hue']}))
        pp(r.json())
