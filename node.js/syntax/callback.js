// function a() {
//   console.log("A");
// }

var a = function () {
  //익명 함수
  console.log("A");
};
//자바스크립트에서는 함수가 값이다.

// a();
//a라는 변수가 담고있는 값(함수)를 실행할 수 있다.

function slowfunc(callback) {
  callback();
}

slowfunc(a);
