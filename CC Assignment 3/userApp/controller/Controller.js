var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  crypto = require('crypto'),
  base64Img = require('base64-img'),
  date = require('date-and-time'),
  isBase64 = require('is-base64');

exports.create_user = function (req, res) {

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
    res.status(405).send();
  }
};


exports.list_users = function (req,res) {
  User.find({})
    .then(user => {
      console.log(user);
      if(user.length<1){
        console.log("No Content");
        res.status(204).send({});
      }
      else{
        res.status(200).json(user);
      }
    })
    .catch(err => {
      console.log("Error in finding user in DB");
      res.status(400).send({});
    })
};

exports.error = function (req,res) {
  console.log("Method Not Allowed");
  res.status(405).send({});
};
