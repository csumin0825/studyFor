var express = require("express"); //모듈을 불러오기
var app = express(); //express(함수)의 리턴값을 app에 저장
var fs = require("fs");
var path = require("path");
var qs = require("querystring");
var bodyParser = require("body-parser");
var sanitizeHtml = require("sanitize-html");
var compression = require("compression");
var template = require("./lib/template.js");

app.use(express.static("public"));
// bodyParser.urlencoded({ extended: false }) : body-parser가 만들어내는 미들웨어를 표현하는 표현식
// 사용자가 요청할 떄마다 표현식에 의해 만들어진 미들웨어가 실행됨 (미들웨어가 어떻게 생겼는지는 모름)
// 사용자가 전송한 post 데이터를 내부적으로 분석해서 경로에 해당되는 콜백함수를 호출하기로 약속
// 호출하면서 콜백의 첫번째 인자(req.body)인 req에 body라는 프로퍼티를 만들어줌
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); //app.use를 통해서 compression 모듈을 호출. compression 모듈이 미들웨어를 return. app.use를 통해서 미들웨어 장착
app.get("*", function (request, response, next) {
  //function은 미들웨어
  fs.readdir("./data", function (error, filelist) {
    request.list = filelist;
    next();
  });
});
// // 요청이 들어올때마다 body-parser, compression 실행

// app.get("/", function (req, res) {
//   return res.send("Hello world");
// });

//get : route, routing : 방향을 잡는
//localhost:3000/ 으로 접속할 경우

//route, routing
//app.get('/', (req, res) => res.send('Hello World!'))
app.get("/", function (request, response) {
  //function은 미들웨어임
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
    <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">`,
    `<a href="/create">create</a>`
  );
  response.send(html);
});

//localhost:3000/page 로 접속할 경우
app.get("/page/:pageId", function (request, response, next) {
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
    if (err) {
      next(err); //바로 에러 핸들링 미들웨어 호출
    } else {
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
    }
  });
});

app.get("/create", function (request, response) {
  var title = "WEB - create";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `
      <form action="/create_process" method="post">
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
      `
        <form action="/update_process" method="post">
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
    response.send(html);
  });
});

app.post("/update_process", function (request, response) {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function (error) {
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      response.redirect(`/?id=${title}`);
    });
  });
});

app.post("/delete_process", function (request, response) {
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function (error) {
    response.redirect("/");
  });
});

//존재하지 않는 페이지를 찾을 경우 404 에러
app.use(function (req, res, next) {
  res.status(404).send("Sorry cant find that!");
});

//인자가 err,req,res,next 4개인 함수는 에러를 핸들링하기 위한 미들웨어로 하자는 약속이 되어있음
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//listen : 3000번 포트에 리스닝, 성공하면 console.log 실행
app.listen(3000, function () {
  console.log("Example app listening on port 3000!");
});
