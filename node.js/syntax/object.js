var members = ["sumin", "egoing", "hoya"];
console.log(members[1]); //egoing

var i = 0;
while (i < members.length) {
  console.log("array loop", members[i]);
  i = i + 1;
}

var roles = {
  programmer: "sumin",
  designer: "egoing",
  manager: "hoya",
};
console.log(roles.designer); //egoing
console.log(roles["designer"]); //egoing

for (var name in roles) {
  console.log("object=>", name, "value=>", roles[name]);
}
