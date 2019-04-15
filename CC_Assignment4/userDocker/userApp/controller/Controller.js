var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Req = mongoose.model('Req'),
  crypto = require('crypto'),
  base64Img = require('base64-img'),
  date = require('date-and-time'),
  isBase64 = require('is-base64');

exports.create_user = function (req, res) {

  Req.create({count : 1});
  console.log("Request");

  var new_user = new User({
  username : req.body.username,
  password : req.body.password
  });

  var re = /^[0-9A-Fa-f]{40}$/i;
  if(!re.test(req.body.password)){
    console.log("password is not sha1")
    res.status(400).send({});
  }
  else{
    User.find({username : req.body.username})
      .then(data => {
        if(data.length!=0){
          console.log("User Exists!")
          res.status(400).send({});
        }
        else{
          new_user.save()
            .then(user => {
              res.status(201).send({});
              console.log('User added successfully')
            })
            .catch(err => {
              console.log("Bad Request");
              res.status(400).send({});
            });
        }
      })
      .catch(err => {
        console.log("Bad Request");
        res.status(400).send({});
      })
  }
};
  
exports.delete_user = function (req, res) {
  console.log(req.params)
  if(req.method == 'OPTIONS'){
    res.status(200).send();
  }
  else if(req.method == 'DELETE'){
  Req.create({count : 1});
  console.log("Request");

  User.find({username : req.params.username})
    .then(data => {
      if(data.length == 0){
        console.log("User doesn't exist.")
        res.status(400).send({});
      }
      else{
        User.remove({username: req.params.username},function(err, user) {
          if (err)
            res.status(400).send({});
          res.status(200).send({});
        }); 
      }
    })
    .catch(err => {
      res.status(400).send({});
    })    
  }
  else{
    Req.create({count : 1});
    console.log("Request");
    res.status(405).send();
  }
};


exports.list_users = function (req,res) {
  Req.create({count : 1});
  console.log("Request");

  userResp = []
  User.find({})
    .then(user => {
      console.log(user);
      if(user.length<1){
        console.log("No Content");
        res.status(204).send({});
      }
      else{
  for(var index = 0;index<user.length;++index){
          var u = user[index];
          console.log(u.username);
          userResp.push(u.username);
        }
        res.status(200).json(userResp);
      }
    })
    .catch(err => {
      console.log("Error in finding user in DB");
      res.status(400).send({});
    })
};

exports.error = function (req,res) {
  Req.create({count : 1});
  console.log("Request");
  
  console.log("Method Not Allowed");
  res.status(405).send({});
};

exports.httpreq = function (req,res) {
  if(req.method == "GET"){
    console.log("\n====HTTP REQUEST ====")
    var response = []
    Req.find({})
      .then(data => {
        console.log(data);
        var Reqcount = data.length;
        response.push(Reqcount);
        res.status(200).json(response);
      })
  }
  else if(req.method == "DELETE"){
    Req.deleteMany({count : 1})
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      })
    res.status(200).send({});
  }
  else{
    res.status(405).send({});
  }
    
};
