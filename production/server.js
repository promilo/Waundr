const express = require('express');
const cors = require('cors')
const app = express();
const uuidv4 = require('uuid/v4');

const morgan = require('morgan')

const redis = require('redis');
const client = redis.createClient();
const usersRoutes = require("./routes/users")
const markerRoutes = require("./routes/markers")
const bodyParser = require('body-parser')

const SocketServer = require('ws').Server;

const PORT = 3001;
const ExpTime = 7200000;

let events = [];

app.use(morgan('dev'));

client.on('connect', function() {
    console.log('redis connected');
});

client.keys('*', (err, keys) => {
  if (err) return console.log(err);

  for (let i = 0; i < keys.length; i++) {
    client.hgetall(keys[i], (err, obj) => {
      obj.lat = parseFloat(obj.lat)
      obj.lng = parseFloat(obj.lng)
      obj.time = parseInt(obj.time, 10)
      obj.confirms = obj.confirms ? obj.confirms.split(',') : []
      obj.rejects = obj.rejects ? obj.rejects.split(',') : []
      obj.priv = (obj.priv == 'true')
      events.push(obj)
    })
  }
})

// client.flushdb( function (err, succeeded) {
//     console.log("flushing redis.."+ succeeded); // will be true if successfull
// });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


server = app.use(express.static('public'))
   .use("/users", usersRoutes()) //routes for handling user logins
   .use("/markers", markerRoutes(client)) //markers needs redis client
   .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.broadcast = (message) => {
  console.log("broadcasting to all users")
  wss.clients.forEach((c) => {
    c.send(JSON.stringify(message));
  });
}

setInterval( () => {
  for (let i = 0; i < events.length; i++) {
    if (events[i].time + ExpTime < Date.now()) {

      wss.broadcast({type: 'expire', data: events[i].id})
      client.del(events[i].id)
      events.splice(i, 1);

    }
  }
  // wss.broadcast({type: 'notification', data: 'timer test'})
}, 30000)


app.get('/events.json', (req, res) => {
  res.json(events)
})

app.post('/events', (req, res) => {
  console.log('post came in ' + req.body.id, req.body.user, req.body.confirm)
  let id = req.body.id;
  let user = req.body.user;
  let confirm = req.body.confirm;
  console.log(events)

  for (event of events) {
    if (event.id === id) {
      if (confirm === 'confirm') {
        if (event.confirms.includes(user)) {
          event.confirms.splice(event.confirms.indexOf(user), 1)
        } else {
          event.confirms.push(user)
        }
      } else {
        if (event.rejects.includes(user)) {
          event.rejects.splice(event.rejects.indexOf(user), 1)
        } else {
          event.rejects.push(user)
        }
      }
      wss.broadcast({type: 'update specific', data: id})
    }
  }
  console.log(events)
  res.send()
})


// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');

  const broadcastElse = (message) => {
    console.log("broadcasting to all users except client")
    wss.clients.forEach((c) => {
      if (c != ws) {
        c.send(JSON.stringify(message));
      }
    });
  }

  ws.on('message', function incoming(message) {
    let newMarker = JSON.parse(message);
    newMarker.lat = newMarker.loc.lat;
    newMarker.lng = newMarker.loc.lng;
    delete newMarker.loc;
    newMarker.id = uuidv4();
    newMarker.time = Date.now();
    events.push(newMarker);

    client.hmset(newMarker.id, newMarker)

    let info = {};
    info.type = 'update markers';
    wss.broadcast(info)
    info.type = 'notification';
    info.data = newMarker.type;
    broadcastElse(info);
    client.hgetall(newMarker.id, (err, obj) => {
      console.log(obj)
    })

  })

 // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
});
