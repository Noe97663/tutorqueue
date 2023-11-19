/* 
Noel Martin Poothokaran
CSC 337: PA8 - OSTAA
This js file contains the JavaScript for the Translator Part 2
This file makes use of the express and line-reader modules to 
build a basic invenotry system for a store. Users can ping this
server with a AJAX request of the correct format to receive data.
*/


//setup modules and server vars
const mongoose = require('mongoose');
const express = require('express')
const bp = require('body-parser')
const fs = require('fs')
const cookieParser = require('cookie-parser');
const multer = require('multer');
const app = express()

app.use(bp.json());
app.use(cookieParser());   
app.use(express.json())
app.set('json spaces', 2)
const upload = multer({dest: __dirname + '/public_html/images'});
const port = 80
const server = "http://127.0.0.1"

let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = {id: sid, time: now};
  return sid;
}

function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    //if (last + 120000 < now) {
    if (last + 3000000 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

setInterval(removeSessions, 2000);

function authenticate(req, res, next) {
  let c = req.cookies;
  console.log('auth request:');
  console.log(req.cookies);
  if (c != undefined) {
    if (sessions[c.login.username] != undefined && 
      sessions[c.login.username].id == c.login.sessionID) {
      next();
    } else {
      res.redirect('/index.html');
    }
  }  else {
    res.redirect('/index.html');
  }
}


async function main() {

  // DB stuff
  const db = mongoose.connection;
  const mongoDBURL = 'mongodb://127.0.0.1/market';
  await mongoose.connect(mongoDBURL, { useNewUrlParser: true });
  db.on('error', () => { console.log('MongoDB connection error:') });

  //set up schemas
  var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    listings: [String],
    purchases: [String]
  });

  var itemSchema = new mongoose.Schema({
    title: String,
    description: String,
    image: String,
    price: Number,
    stat: String
  });

  var Item = mongoose.model('item', itemSchema)
  var User = mongoose.model('user', userSchema);
  app.use(express.static('public_html'))

  //get users
  app.get('/get/users/', function (req, res) {
    let p = User.find({}).exec();
    p.then((documents) => {
      res.end(JSON.stringify(documents, null, 4))
    });
  });

  //get items
  app.get('/get/items/', function (req, res) {
    let p = Item.find({}).exec();
    p.then((documents) => {
      res.end(JSON.stringify(documents, null, 4))
    });
  });

  //get listings of a specific user
  app.get('/get/listings/:user', function (req, res) {
    let user = req.params.user;
    User.findOne({ username: user }).exec()
      .then((document) => {
        if (document) {
          const listings = document.listings;
          res.end(JSON.stringify(listings, null, 4));
        } else {
          res.status(404).send("User not found");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error retrieving listings");
      });
  });
  
  //get purchases of a specific user
  app.get('/get/purchases/:user', function (req, res) {
    let user = req.params.user;
    User.findOne({ username: user }).exec()
      .then((document) => {
        if (document) {
          const purchases = document.purchases;
          res.end(JSON.stringify(purchases, null, 4));
        } else {
          res.status(404).send("User not found");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error retrieving purchases");
      });
  });

  //find users with a keyword
  app.get('/search/users/:keyword', function (req, res) {
    let word = req.params.keyword;
    User.find({ username: { $regex: word, $options: 'i' } }).exec()
    .then((users) => {
      res.end(JSON.stringify(users, null, 4));
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving users");
    });
  });

  //find items with a keyword
  app.get('/search/items/:keyword', function (req, res) {
    let word = req.params.keyword;
    Item.find({ description: { $regex: word, $options: 'i' } }).exec()
    .then((users) => {
      res.end(JSON.stringify(users, null, 4));
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving items");
    });
  });

  //add a user to the database
  app.post('/add/user/', (req, res) => {
    let user = req.body.username;
    let password = req.body.password;

    User.findOne({ username: user }).exec()
      .then((document) => {
        if (document) {
          res.end("Failure. Duplicate username found.");
        }
        else{
          let newUser = new User({
            username: user, password: password,
            listings: [], purchases: []
          });
          return newUser.save().then((result) => {
            res.end("Successfully added user.")
          }).catch((err) => {
            console.log(err)
          });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error searching User database");
      });


  });

  //add an item to the database
  app.post('/add/item/:user/', upload.single('image'), (req, res) => {
    let user = req.params.user;
    let title = req.body.title;
    let desc = req.body.description;
    let img = req.file.filename; // Use the filename generated by multer
    let price = req.body.price;
    let status = req.body.itemStatus;
  
    let newItem = new Item({
      title: title, description: desc, image: img,
      price: price, stat: status
    });
  
    return newItem.save()
      .then((result) => {
        return User.findOneAndUpdate(
          { username: user },
          { $push: { listings: result._id } },
          { new: true }
        );
      })
      .then((updatedUser) => {
        if (updatedUser) {
          res.status(200).send("Added item and updated user's listings");
          console.log("adding item was successful")
        } else {
          res.status(404).send("User not found");
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error adding item or updating user");
      });
  });

  app.post('/login/', (req, res) => { 
    console.log(sessions);
    let u = req.body;
    let p1 = User.find({username: u.username, password: u.password}).exec();
    p1.then( (results) => { 
      if (results.length == 0) {
        res.end('Failure.');
      } else {
        let sid = addSession(u.username);  
        res.cookie("login", 
          {username: u.username, sessionID: sid}, 
          {maxAge: 600000 * 2 });
        res.end('SUCCESS');
      }
    });
  });

  app.get('/sell/:item/:user/', (req, res) => {
    let user = req.params.user;
    let itemId = req.params.item;
  
    Item.findOneAndUpdate(
      { _id: itemId },
      { $set: { stat: 'SOLD' } },
      { new: true }
    )
    .then(updatedItem => {
      if (updatedItem) {
        // Successfully updated the item
        console.log("Item marked as SOLD");
  
        // Nest the User update inside the first .then block
        User.findOneAndUpdate(
          { username: user },
          { $push: { purchases: itemId } },
          { new: true }
        )
        .then(updatedUser => {
          if (updatedUser) {
            res.status(200).send("Added item and updated user's purchases");
            console.log("Adding item was successful");
          } else {
            res.status(404).send("User not found");
          }
        });
      } else {
        // Item not found
        console.log("Item not found");
        res.status(404).send("Item not found");
      }
    })
    .catch(error => {
      // Handle errors
      console.error(error);
      res.status(500).send("Error updating item or user");
    });
  });
  

  app.listen(port, () =>
    console.log(
      `Ostaa Server listening at ${server}:${port}`));
}

main()