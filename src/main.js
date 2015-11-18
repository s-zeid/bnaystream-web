var childProcess = require("child_process");

var common = require("./common.js");


childProcess.spawn("make", [], {
 "cwd": __dirname + "/client",
 "stdio": "inherit"
}).on("close", function(r) {
 if (r != 0)
  process.exit(r);
 
 var host = "127.0.0.1";
 var port = process.argv[2] || 26299;
 
 var server = require("./server/server.js");
 process.stderr.write("Listening on <http://" + host + ":" + port + "/>...\n");
 server.app.listen(port);
});
