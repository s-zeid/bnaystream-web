var childProcess = require("child_process");
var fs = require("fs");

var express = require("express");
var bodyParser = require("body-parser");
var shellQuote = require("shell-quote");

var common = require("../common.js");


var FIELDS = common.FIELDS;


function safeShellParse(s) {
 var result = [];
 var parsed = shellQuote.parse(s, {});
 for (var i = 0; i < parsed.length; i++) {
  var el = parsed[i];
  if (typeof(el) != "string")
   break;
  result.push(el);
 }
 return result;
}


function BnayStream() {
 if (!(this instanceof BnayStream))
  return new BnayStream();
 
 var self = this;
 
 var subprocess = null;

 function init() {
  for (var name in FIELDS) {
   if (FIELDS.hasOwnProperty(name))
    self[name] = FIELDS[name][1];
  }
 }
 
 self.start = function() {
  self.stop();
  
  var args = [];
  
  args = args.concat(safeShellParse(self["bnaystream-options"]));
  args = args.concat(safeShellParse(self["ffmpeg-input-args"]));
  args.push("-i");
  args.push(self["url"]);
  args = args.concat(safeShellParse(self["ffmpeg-output-args"]));

  subprocess = childProcess.spawn(
                "bnaystream",
                args,
                {"stdio": ["ignore", 1, 2],
                 "detached": true}
               );
  process.stderr.write("bnaystream(1) started: bnaystream \""
                       + args.join('" "') + "\"\n");
  subprocess.on("exit", function(r) {
   subprocess = null;
   process.stderr.write("bnaystream(1) exited with code " + r + "\n");
  });
  process.on("SIGINT", function() {
   self.stop();
   process.exit();
  });
  //subprocess.stdout.on("data", function(data) {
  // process.stdout.write(data);
  //});
  //subprocess.stderr.on("data", function(data) {
  // process.stderr.write(data);
  //});
 };
 
 self.stop = function() {
  if (!self.isRunning())
   return;
  
  process.kill(-subprocess.pid);
 };
 
 self.isRunning = function() {
  return (subprocess != null);
 };
 
 init();
}


function App() {
 if (!(this instanceof App))
  return new App();
 
 var app = this.app = exports.app = express();
 app.use(bodyParser.urlencoded({"extended": true}));
 
 
 var bnaystream = app.locals.bnaystream = new BnayStream();
 
 
 app.use(express.static(__dirname + "/public"));
 
 app.get("*/status", function(req, res) {
  var result = {};
  for (var name in FIELDS) {
   if (FIELDS.hasOwnProperty(name))
    result[name] = bnaystream[name];
  }
  result["_running"] = bnaystream.isRunning();
  res.json(result);
 });
 
 app.post("/*", function(req, res) {
  var changed = false;
  for (var name in req.body) {
   if (FIELDS.hasOwnProperty(name)) {
    var value = req.body[name];
    if (typeof(FIELDS[name][1]) == "boolean")
     value = (value == "on");
    if (bnaystream[name] != value)
     changed = true;
    bnaystream[name] = value;
   }
  }
  if (req.body["_control"] == "stop")
   bnaystream.stop();
  else if (bnaystream["url"])
   bnaystream.start();
  res.redirect(".");
 });
 
 app.use(function(req, res, next) {
  res.sendFile(__dirname + "/public/index.html");
 });
}


app = new App().app;
