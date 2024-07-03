/* username: "string",
  password: "string"
*/
var users = [];

exports.users = users;

exports.find = (username) => {
  for (var user of users) {
    if (user.username == username) {
      return user;
    }
  }
  throw "no user";
};
