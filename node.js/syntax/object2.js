var f = function () {
  console.log(1 + 1);
  console.log(1 + 2);
};

//array
var a = [f];
a[0]();

//object
var o = {
  func: f,
};
o.func();
