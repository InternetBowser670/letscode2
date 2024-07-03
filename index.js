const express = require("express")
const bodyParser = require("body-parser")
const multer = require("multer")
const fs = require("fs")
const bcrypt = require("bcrypt")
const Mongo = require("mongodb")
const cookieParser = require("cookie-parser")


const client = new Mongo.MongoClient("mongodb://server.memorialacademy.org:27017")
client.connect();
const db = client.db("letscode_joshua").collection("users")
const sessions = client.db("letscode_joshua").collection("sessions")


const app = express();

app.use(cookieParser());

app.use("/static", express.static("static"));
const upload = multer();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.array());

const login = fs.readFileSync("pages/login.html", "utf8")
const signup = fs.readFileSync("pages/signup.html", "utf8")
const blocked = fs.readFileSync("pages/blocked.html", "utf8")
const protected = fs.readFileSync("pages/protected.html", "utf8")

app.get("/", (req, res) => {
  res.end(signup)
})

app.get("/login", (req, res) => {

  if (req.cookies.sessionId) {
    res.writeHead(200)
    res.write("<p>You are already signed in</p>")
    res.end();
    return
  }
  res.end(login)
})

app.post("/login", async (req, res) => {
  var userQuery = db.findOne({username: req.body.username})
  userQuery.then((user) => {
    if (!user) {
      res.writeHead(400)
      res.end()
      return
    }
    bcrypt.compare(req.body.password, user.password, (err, result) => {
      if (result) {
        var session = generateSessionId(req.body.username)
        res.cookie("sessionId", session)
        res.writeHead(200)
      } else {
        res.writeHead(400)
      }
      res.end()
      })
  })
})
  
  

app.post("/signup", (req, res) => {
  var user = {
    username: "",
    password: ""
  }
 bcrypt.hash(req.body.password, 10, async (err, data) => {
   user.password = data;
   user.username = req.body.username;
   await db.insertOne(user)
   var session = generateSessionId(req.body.username)
   res.cookie("sessionId", session)
   res.writeHead(200)
   res.end()
 })
})

app.get("/dashboard", async (req, res) => {
  try {
    console.log("e")
    var auth = await sessions.findOne({uuid: req.cookies.sessionId})
    if (auth.role == "user") {
      res.writeHead(200);
      res.end(protected) 
    } else {
      throw "Not authorizrd"
    }
  } catch(e){
    res.writeHead(403);
    res.end(blocked);
  }
})

app.get("/logout", (req, res) => {
  sessions.deleteOne({uuid:req.cookies.sessionId})
  res.clearCookie("sessionId")
  res.writeHead(200)
  res.end("<p>You have logged out</p>")
})

function generateSessionId(username) {
  var uuid = crypto.randomUUID()
  sessions.insertOne({
    uuid: uuid,
    user: username,
    role: "user"
  })
  return uuid;
}

app.listen(80)