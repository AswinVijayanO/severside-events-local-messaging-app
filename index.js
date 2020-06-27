const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var uniqid = require('uniqid');
var formidable = require('formidable');
var path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for GET /events endpoint
function eventsHandler(req, res, next) {
  // Mandatory headers and http status to keep connection open
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  // After client opens connection send all posts as string

  const data = `data: ${JSON.stringify(getPostsForRoom(req.query.room))}\n\n`;

  // Generate an id based on timestamp and save res
  // object of client connection on clients list
  // Later we'll iterate it and send updates to each client
  const clientId = uniqid();

  res.write(data);
  const newClient = {
    id: clientId,
    room:req.query.room,
    res
  };
  clients.push(newClient);

  // When client closes connection we update the clients list
  // avoiding the disconnected one
  req.on('close', () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter(c => c.id !== clientId);
  });
}

// Iterate clients list and use write res object method to send new nest
function sendEventsToAll(newNest) {
  const room = Users.filter((usr)=>usr.name === newNest.username)[0].room;
  clients.filter((client)=>client.room === room).forEach(c => c.res.write(`data: ${JSON.stringify(newNest)}\n\n`))
}
function sendEventsToOne(newNest,clientId) {
  clients.filter((client)=>client.id === clientId).forEach(c => c.res.write(`data: ${JSON.stringify(newNest)}\n\n`))
}
function getUserByName(name){
  return Users.filter((user) => user.name === name)[0]
}
function getPostsForRoom(room){
  return posts.filter((post)=>getUserByName(post.username).room === room);
}
// Middleware for POST /nest endpoint
async function addPost(req, res, next) {
  const newNest = req.body;
  const user = Users.filter(user => user.id === req.body.token)[0];
  newNest.username = !user ? "unknown" : user.name;
  newNest.postId = uniqid() + "_post";
  newNest.likes = 0;
  posts.push(newNest);
  console.log(newNest);
  // Send recently added nest as POST result
  res.json(newNest)

  // Invoke iterate and send function
  return sendEventsToAll(newNest);
}
async function likeTweet(req, res, next) {
  const postId = req.query.postId;
  const userId = req.query.userId;
  console.log(userId);
  const likedPost = posts.filter(post => post.postId === postId)[0];
  if (likedPost.likedBy.filter(user => user === userId).length === 0) {
    likedPost.likedBy.push(userId);
    likedPost.likes = likedPost.likes + 1
    posts = posts.filter(post => post.postId !== postId);
    posts.push(likedPost)
  }
  // Send recently added nest as POST result
  res.json(postId)

  // Invoke iterate and send function
  return sendEventsToAll(likedPost);
}

async function addUser(req, res) {
  if (Users.filter(user => user.name === req.query.name).length == 0) {
    const user = {};
    user.name = req.query.name;
    user.room = req.query.room;
    user.id = uniqid();
    Users.push(user);
    res.json({ token: user.id, username: user.name,room: req.query.room});
    return;
  }
  res.writeHead(500, { 'content-type': 'application/json' });
  res.end();
}
async function getUsers(req, res) {
    const userlist = Users.map((user)=> {return {id:user.id,name:user.name}});
    res.json(userlist);
}
// Set cors and bodyParser middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Define endpoints
app.post('/postTweet', addPost);
app.post('/likeTweet', likeTweet);
app.get('/events', eventsHandler);
app.get('/status', (req, res) => res.json({ clients: clients.length }));
app.get('/login', addUser);
app.get('/activeUsers', getUsers);
app.route('/upload')
  .post(function (req, res, next) {

    var form = new formidable.IncomingForm();
    //Formidable uploads to operating systems tmp dir by default
    form.uploadDir = "./public";       //set upload directory
    form.keepExtensions = true;     //keep file extension
    console.log("file uploaded")
    form.parse(req, function (err, fields, files) {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ fields, files }, null, 2));
      res.end();
    });
  });
const PORT = 5000;

let clients = [];
let Users = [];
let posts = [];

// Start server on 3000 port
app.listen(PORT, () => console.log(`Events service listening on port ${PORT}`));