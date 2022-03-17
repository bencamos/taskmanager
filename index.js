const exec = require("child_process").exec;
var pidusage = require("pidusage");

var fs = require("fs");
var http = require("http");
var url = require("url");
var os = require("os");

async function winProc(data) {
  var temp = data.split("\r\n");
  var data = [];
  temp.shift();
  temp.shift();
  temp.shift();
  await temp.forEach( async (element) => {
    var x = element.replace(/,(?=[^,]*$)/, "").replace(/\"/g, "").replace(" K", "000").split(",");
    x.splice(2, 1);
    x.splice(2, 1);
    data.push(x);
  });
  return data;
}

async function getPs(sort) {
  var full = {system: {} };

  var platform = process.platform;
  var cmd = "";
  var proc;

  console.time("PS")
  if (platform == "win32") {
    cmd = `tasklist /FO csv`;
    proc = winProc;
  } else {
    cmd = `ps -ax | grep ${query}`;
  }
  var xx = "";
  exec(cmd, async (err, stdout, stderr) => {
    xx = await proc(stdout);
  });
  while (!xx) {
    await new Promise((r) => setTimeout(r, 1));
  }
  var pids = [];
  // Grabbing the amount of valid pids
  await (async function loop() {
    for (var i = 0; i < xx.length; i++) {
      if (!isNaN(xx[i][1])) pids.push(xx[i][1]);
    }
  })();
  // Grabbing the usage of each pid
  var stats = await pidusage(pids);
  stats = JSON.parse(JSON.stringify(stats));
  var i = 0;
  // .lengths counts from 1, not 0 so we -1
  while (i < pids.length - 1) {
    // adding the process name to the stats
    if (stats[pids[i]]) stats[pids[i]].name = xx[i][0];
    i++;
  }
  // just in case
  while (!i == stats.length) {
    await new Promise((r) => setTimeout(r, 1));
  }
  full.system = stats;
  return JSON.stringify(full);
}

var api = http.createServer(async function (req, res) {
  /* 
API Usage;
The api will only send a result if the request is valid.
All requests should be GET for the time being (no POST).
If you send a malformed request, the api will not respond at all as if its offline.
Check the console for debugging information.

    Arguments;
        x: Authentication key. Currently "!"

*/
  res.setHeader("Content-Type", "application/json");
  var query = url.parse(req.url, true).query;
  var uri = req.url.split("?")[0]; // Remove args from URI
  if (`${query.x}` == "!") {
    // Checking authentication
    res.statusCode = 200;
    var uri = uri.split("/");
    uri.shift();
    var data = { uri: uri, query: query, res: res, req: req };
    switch (uri[0]) {
      case "cpu": {
        res.end(`${process.cpuUsage().system}`.substring(0, 4) + "%");
        break;
      }
      case "mem": {
        res.end((((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
          .toString()
          .substring(0, 4));
          break;
      }
      case "cpuCores": {
        res.end(`${os.cpus().length}`);
        break;
      }
      case "memAval": {
        res.end(`${os.totalmem()}`);
        break;
      }
      case "ps": {
        res.end(await getPs(data.query.sort));
        break;
      }
      case "taskmgr": {
        await (async function () {
          data.res.setHeader("Content-Type", "text/html");
          res.end(fs.readFileSync("index.html", "utf8"));
        })();
        break;
      }
      default : {
        console.log("Invalid request", data.uri, data.query);
        break;
      }
    }
  }
});

api.listen(81, "0.0.0.0", function () {
  console.log("API is running on port 81");
});