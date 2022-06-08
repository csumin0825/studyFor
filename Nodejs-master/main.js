var express = require("express"); //모듈을 불러오기
var app = express(); //express(함수)의 리턴값을 app에 저장
var fs = require("fs");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var qs = require("querystring");
var bodyParser = require("body-parser");
var compression = require("compression");

// bodyParser.urlencoded({ extended: false }) : body-parser가 만들어내는 미들웨어를 표현하는 표현식
// 사용자가 요청할 떄마다 표현식에 의해 만들어진 미들웨어가 실행됨 (미들웨어가 어떻게 생겼는지는 모름)
// 사용자가 전송한 post 데이터를 내부적으로 분석해서 경로에 해당되는 콜백함수를 호출하기로 약속
// 호출하면서 콜백의 첫번째 인자(req.body)인 req에 body라는 프로퍼티를 만들어줌
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get("*", function (requset, response, next) {
  // get 방식의 모든('*') 요청에 filelist 제공(post방식은 사용X)
  fs.readdir("./data", function (error, filelist) {
    requset.list = filelist; // 모든 route안에서 request 객체의 list 프로퍼티를 이용해서 글 목록에 접근 가능
    next(); // 그 다음에 호출되어야할 미들웨어
  });
});

// app.get("/", function (req, res) {
//   return res.send("Hello world");
// });

//get : route, routing : 방향을 잡는
//localhost:3000/ 으로 접속할 경우
app.get("/", (request, response) => {
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`
  );
  response.send(html);
});

//localhost:3000/page 로 접속할 경우
app.get("/page/:pageId", function (request, response) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    var title = request.params.pageId;
    var sanitizedTitle = sanitizeHtml(title);
    var sanitizedDescription = sanitizeHtml(description, {
      allowedTags: ["h1"],
    });
    var list = template.list(request.list);
    var html = template.HTML(
      sanitizedTitle,
      list,
      `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
      ` <a href="/create">create</a>
                    <a href="/update/${sanitizedTitle}">update</a>
                    <form action="/delete_process" method="post">
                      <input type="hidden" name="id" value="${sanitizedTitle}">
                      <input type="submit" value="delete">
                    </form>`
    );
    response.send(html);
  });
});

app.get("/create", function (request, response) {
  var title = "WEB - create";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,
    ""
  );
  response.send(html);
});

app.post("/create_process", function (request, response) {
  var post = request.body;
  var title = post.title;
  var description = post.description;
  fs.writeFile(`data/${title}`, description, "utf8", function (err) {
    response.writeHead(302, { Location: `/?id=${title}` });
    response.end();
  });
});

app.get("/update/:pageId", function (request, response) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    var title = request.params.pageId;
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `<form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
           <p>
            <input type="submit">
           </p>
        </form>
        `,
      `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
    );
    response.writeHead(200);
    response.end(html);
  });
});

app.post("/update_process", function (request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      response.redirect(`/page/${title}`);
    });
  });
});

app.post("/delete_process", function (request, response) {
  console.log("-------------------");
  console.log(request.body);
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    response.redirect("/");
  });
});

//listen : 3000번 포트에 리스닝, 성공하면 console.log 실행
app.listen(3000, function () {
  console.log(`Example app listening on port 3000`);
});

// var http = require('http');
// var url = require('url');

// var app = http.createServer(function(request,response){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;
//     if(pathname === '/'){
//       if(queryData.id === undefined){

//       } else {

//       }
//     } else if(pathname === '/create'){
//
//     } else if(pathname === '/create_process'){
//     } else if(pathname === '/update'){
//
//     } else if(pathname === '/update_process'){
//
//     } else if(pathname === '/delete_process'){
//
//     } else {
//       response.writeHead(404);
//       response.end('Not found');
//     }
// });
// app.listen(3000);
