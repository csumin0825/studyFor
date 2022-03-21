// import { hello } from "./module.js";

import { createServer } from "http";
import { readFileSync } from "fs";
var app = createServer(function (request, response) {
  var url = request.url;
  if (request.url == "/") {
    url = "/index.html";
  }
  if (request.url == "/favicon.ico") {
    return response.writeHead(404);
  }
  response.writeHead(200);
  response.end(readFileSync(__dirname + url));
});
app.listen(3000);

let val = hello(); // val is "Hello";
alert(val);
