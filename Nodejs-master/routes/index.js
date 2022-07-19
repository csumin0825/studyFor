const express = require("express");
var router = express.Router();
var template = require("../lib/template.js");

// app.get("/", function (req, res) {
//   return res.send("Hello world");
// });

//get : route, routing : 방향을 잡는
//localhost:3000/ 으로 접속할 경우

//route, routing
//app.get('/', (req, res) => res.send('Hello World!'))
router.get("/", function (request, response) {
  //function은 미들웨어임
  var title = "Welcome";
  var description = "Hello, Node.js";
  var list = template.list(request.list);
  var html = template.HTML(
    title,
    list,
    `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">`,
    `<a href="/topic/create">create</a>`
  );
  response.send(html);
});

module.exports = router;
