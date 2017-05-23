#!/bin/env node
'use strict';

var fs = require('fs');
var request = require('request-promise-native');
var blessed = require('blessed');

var hostname = 'http://192.168.86.180'
var device_type = "my_hue_app#my_hostname"
var url;

process.title = 'hue_mungus';
process.on('unhandledRejection', (err, promise) => { throw err; /* =[ */ });

async function main() {
  var api_key = await login();
  url = hostname+"/api/"+api_key+"/";
  var lights = await getLights();
  console.log("LIGHTS: ", lights)

  var screen, lights_box, controls, scripts, box, bar;
  screen = blessed.screen({
    fastCSR: true
  });
  screen.title = process.title;

  lights_box = blessed.box({
    parent: screen,
    top: 0,
    left: 0,
    width: '20%',
    //tags: true,
    border: {
      type: 'line',
      left: false,
      top: false,
      right: true,
      bottom: false
    },
  });

  controls = blessed.box({
    parent: screen,
    top: 0,
    right: 0,
    //bottom: 1,
    width: '80%',
    //height: 1,
    //tags: true,
    border: {
      type: 'line',
      left: false,
      top: false,
      right: false,
      bottom: true,
    },
  });

  scripts = blessed.box({
    parent: screen,
    right: 0,
    //top: 1,
    bottom: 0,
    height: 3,
    width: '80%',
    //tags: true,
    border: {
      type: 'line',
      left: false,
      top: true,
      right: false,
      bottom: false,
    },
  });

  //box = blessed.box({
    //parent: screen,
    //left: 1,
    //height: 1,
    ////tags: true,
  //});

  //bar = blessed.box({
    //parent: screen,
    //left: 1,
    //height: 1,
    ////tags: true,
  //});

  lights_box.setContent("lights")
  controls.setContent("controls")
  scripts.setContent("scripts")
  //box.setContent("box")
  //bar.setContent("bar")
  screen.render();
} main();


// ============ //
async function login() {
  try {
    return fs.readFileSync('api_key').toString();
  } catch(e) {}
  const response = await request({
    url: hostname+'/api',
    body: '{"devicetype":"'+device_type+'"}',
    method: 'POST',
  });
  var body = JSON.parse(response)[0]
  if (!body.success) {
    if (body.error.description == "link button not pressed")
      console.log("press button on hub then run again")
    else console.log("ERROR:", body.error.description)
    process.exit(1)
  } else {
    fs.writeFileSync('api_key', body.success.username);
    return Promise.resolve(body.success.username)
  }
}

async function getLights() {
  var ll;
  var state = JSON.parse(await request(url))
  for (var g in state.groups) {
    for (var l in state.groups[g].lights) {
      ll = state.lights[ state.groups[g].lights[l] ];
      ll.group_name = state.groups[g].name;
      ll.group_index = l;
    }
  }
  return (state.lights);
}

