var express = require("express"); //모듈을 불러오기
var app = express(); //express(함수)의 리턴값을 app에 저장
var fs = require("fs");
var bodyParser = require("body-parser");
var compression = require("compression");
var helmat = require("helmat");
app.use(helmat());

var indexRouter = require("./routes/index");
var topicRouter = require("./routes/topic");

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

// '/topic'으로 시작하는 주소들에게 topicRouter라는 미들웨어를 적용함
app.use("/topic", topicRouter);
app.use("/", indexRouter);

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
