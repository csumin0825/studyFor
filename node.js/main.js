var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

function templateHTML(title, list, body, control) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
`;
}

function templateList(filelist) {
  var list = "<ul>";
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }

  list = list + "</ul>";
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./data", function (error, filelist) {
        var title = "Welcome";
        var description = "Hello, Node.js";

        var list = templateList(filelist);

        var template = templateHTML(
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href ="/create">create</a>`
        );
        response.writeHead(200); // 200: 파일을 성공적으로 전송
        response.end(template);
      });
    } else {
      fs.readdir("./data", function (error, filelist) {
        fs.readFile(
          `data/${queryData.id}`,
          "utf8",
          function (err, description) {
            var title = queryData.id;
            var list = templateList(filelist);
            var template = templateHTML(
              title,
              list,
              `<h2>${title}</h2>${description}`,
              `<a href ="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
            response.writeHead(200); // 200: 파일을 성공적으로 전송
            response.end(template);
          }
        );
      });
    }
  } else if (pathname === "/create") {
    fs.readdir("./data", function (error, filelist) {
      var title = "WEB - create";

      var list = templateList(filelist);

      var template = templateHTML(
        title,
        list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder = "title"/></p>
          <p><textarea name="description" placeholder = "description"></textarea></p>
          <p><input type="submit" /></p>
        </form>`,
        ""
      );
      response.writeHead(200); // 200: 파일을 성공적으로 전송
      response.end(template);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    request.on("data", function (data) {
      //웹브라우저가 POST방식으로 데이터를 전송할 때,
      //데이터가 매우 많으면 한번에 처리하지 못하기 떄문에 작은 데이터를 서버에서 수신할때마다
      //콜백함수를 호출, data라는 인자를 통해 수신한 데이터도 전달
      body = body + data; // body에 data를 추가
    });
    request.on("end", function () {
      //더이상 들어올 정보가 없으면 콜백함수 실행
      var post = qs.parse(body); //post에 post정보가 들어있을 것이다? (qs를 이용하여 정보를 객체화)
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", function (err) {
        response.writeHead(302, { Location: `/?id=${title}` }); // 302: 페이지를 다른곳으로 리다이렉션
        response.end("success");
      });
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function (error, filelist) {
      fs.readFile(`data/${queryData.id}`, "utf8", function (err, description) {
        var title = queryData.id;
        var list = templateList(filelist);
        var template = templateHTML(
          title,
          list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name ="id" value = "${title}"/>
            <p><input type="text" name="title" placeholder = "title" value=${title}></p>
            <p><textarea name="description" placeholder = "description">${description}</textarea></p>
            <p><input type="submit" /></p>
          </form>
          `,
          `<a href ="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200); // 200: 파일을 성공적으로 전송
        response.end(template);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function (data) {
      body = body + data; // body에 data를 추가
    });
    request.on("end", function () {
      //더이상 들어올 정보가 없으면 콜백함수 실행
      var post = qs.parse(body); //post에 post정보가 들어있을 것이다? (qs를 이용하여 정보를 객체화)
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, "utf8", function (err) {
          response.writeHead(302, { Location: `/?id=${title}` }); // 302: 페이지를 다른곳으로 리다이렉션
          response.end();
        });
      });
    });
  } else {
    //pathname이 / or /create가 아닐경우
    response.writeHead(404); // 404: 에러발생
    response.end("Not Found");
  }
});
app.listen(3000);
