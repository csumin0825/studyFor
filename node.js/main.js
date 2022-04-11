var http = require("http");
var fs = require("fs");
var url = require("url");

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        console.log(filelist);
        var title = "Welcome";
        var description = "Hello, Node.js";
        // var list = `<ul>
        //   <li><a href="/?id=HTML">HTML</a></li>
        //   <li><a href="/?id=CSS">CSS</a></li>
        //   <li><a href="/?id=JAVASCRIPT">JavaScript</a></li>
        // </ul>`;
        var list = "<ul>";
        var i = 0;
        while (i < filelist.length) {
          list = list + `<li>${filelist[i]}<li>`;
          i = i + 1;
        }
        list = list + "</ul>";
        var template = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8" />
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          <h2>${title}</h2>
          <p>${description}</p>
        </body>
        </html>
      `;
        response.writeHead(200); // 200: 파일을 성공적으로 전송
        response.end(template);
      });
    } else {
      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        var title = queryData.id;
        var template = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8" />
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <ul>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JAVASCRIPT">JavaScript</a></li>
        </ul>
        <h2>${title}</h2>
        <p>${description}</p>
      </body>
    </html>
    
      `;
        response.writeHead(200); // 200: 파일을 성공적으로 전송
        response.end(template);
      });
    }
  } else {
    response.writeHead(404); // 404: 에러발생
    response.end("Not Found");
  }
});
app.listen(3000);
