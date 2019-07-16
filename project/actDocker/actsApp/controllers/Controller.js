var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Category = mongoose.model('Category'),
  Act = mongoose.model('Act'),
  Req = mongoose.model('Req'),
  Crash = mongoose.model('Crash'),
  crypto = require('crypto'),
  base64Img = require('base64-img'),
  date = require('date-and-time'),
  request = require('request'),
  healthcheck = require('express-healthcheck'),
  fs = require('fs'),
  isBase64 = require('is-base64');

var mongoHealthcheck = require('mongo-healthcheck');
global.crash = 0;

exports.list_category = function (req,res) {
  console.log(crash)
  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request");

    Category.find({})
      .then(category => {
        // console.log(category);
        if(category.length<1){
          console.log("No Content");
          res.status(204).send({});
        }
        else{
          category_list = new Map();
          for(var i = 0;i<category.length; i++){
            var catName = category[i].categoryName;
            var count = category[i].actCount;
            category_list[catName] = count;
          }
          res.status(200).json(category_list);
        }
      })
      .catch(err => {
        console.log("Error in finding category in DB");
        res.status(400).send({});
      })
  }
};

exports.create_category = function (req, res) {
  
  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request to create category");

    console.log(req.body);
    Category.find({categoryName : req.body.categoryName})
      .then(result => {
        if(result.length!=0){
          console.log("Category Exists!\n");
          return res.status(400).send({});
        }
        else{
          var new_cat = new Category({
            categoryName : req.body[0],
            actCount : 0
          });
          new_cat.save()
            .then(category => {
              console.log("Category created \n");
              res.status(201).json({});
            })
            .catch(err => {
              console.log("Category name required!\n");
              res.status(400).send({});
            });
        }
      })
      .catch(err => {
        res.status(400).send({});
      })
  }
    
};


exports.error = function (req,res) {
  
  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request");

    console.log("Method Not Allowed");
    res.status(405).send({});
  }
};


exports.delete_category = function (req, res) {

  if(crash==1)
    res.status(500).send({});
  else{
    console.log(req.params)
    if(req.method == 'OPTIONS'){
    res.status(200).send();
    }
    else if(req.method == 'DELETE'){
      Req.create({count : 1});
      console.log("Request");

      console.log("DELETE Category")
      if(!req.params){
        return res.status(400).send({});
      }

      Category.find({categoryName: req.params.categoryName}).limit(1)
        .then(category => {
          console.log(category);
          if(category.length==0){
            console.log("Category doesn't exist\n");
            res.status(400).send({});
          }
          else{
            Category.remove({categoryName: req.params.categoryName}, function(err, cat) {
            if (err)
              res.status(400).send({});
            else{
              Act.remove({categoryName:req.params.categoryName},function(err,act){
                res.status(200).json({});  
              })
            }
            
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

      res.status(405).send({});
    }
  }  
};


exports.category_actcount = function (req,res) {
  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request");

    if(req.method == 'GET'){
      console.log(req.params)
      Category.findOne({categoryName : req.params.name})
        .then( result => {
          if(result.length == 0){
            // console.log("Category doesn't exist \n");
            return res.status(204).send({});
          }
          else{
            response = []
            // console.log(result.actCount);
            response.push(result.actCount);
            return res.status(200).json(response).send({});
          }
        })
        .catch(err => {
          return res.status(400).send({});
        })
    }
    else{
      console.log("Method not allowed");
      res.status(405).send({});
    }
  }
};



exports.upload_act = function (req,res) {

  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request");

    var new_act = new Act({
            actId : req.body.actId,
            username : req.body.username,
            caption : req.body.caption,
            categoryName : req.body.categoryName,
            timestamp:req.body.timestamp,
            upvotes : 0,
            imgB64 : req.body.imgB64
          });

    var valid = 1;
    if(!req.body){
      res.status(400).send({});
    }

    else if(req.body.upvotes){
      valid = 0;
      console.log("upvotes");
      res.status(400).send({});
    }
    else if(!isBase64(req.body.imgB64)){
      valid = 0;
      console.log('image');
      res.status(400).send({});
    }
    else if(!date.isValid(req.body.timestamp,'DD-MM-YYYY:ss-mm-hh'))
    {
      valid = 0;
      console.log("Date");
      res.status(400).send({});
    }
    else{
      request.get("http://3.208.117.5:80/api/v1/users", (error, response, body) => {
      if(error) {
          return console.log(error);
      }
      user = JSON.parse(body);
      var flag = 0;
      for(var index = 0;index<user.length;++index){
        var u = user[index];
        if(u == req.body.username){
          flag = 1;
        }
      }

      if(flag == 0 || user.length == 0){
        valid = 0;
        console.log('no user')
        res.status(400).send({});
      }
      else if(flag == 1){
        console.log("User exists");
        Category.find({categoryName : req.body.categoryName})
          .then(cat => {
            console.log(cat)
            if(cat.length == 0)
            {
              valid = 0;
              console.log("Category doesn't exist!")
              res.status(400).send({});
            }
            else{
              if(valid!==0){
                new_act.save()
                  .then(act => {
                    console.log(act)
                    Category.update({categoryName : req.body.categoryName},{$inc : {actCount:1}})
                      .then(resp => {
                        console.log(resp);
                        if(resp['n'] == 0){
                          res.status(400).send({});
                        }
                        else{
                          console.log("Act Created!");
                          res.status(201).send({});
                        }
                      })
                      .catch(errors => {
                        console.log(errors);
                      })
                  })
                  .catch(e => {
                    console.log("Act Id should be unique")
                    return res.status(400).send({});
                  })
              }
            }
          });
        }
        else{
          res.status(400).send();
        }
      });
    }
  } 
};


exports.delete_act = function (req,res) {

  if(crash==1)
    res.status(500).send({});
  else{
    console.log('DELETE ACT')
    console.log(req.params)
    if(req.method == 'OPTIONS'){
      res.status(200).send();
    }
    else if(req.method == 'DELETE'){
      Req.create({count : 1});
      console.log("Request");

      if(!req.body){
        console.log("Category name empty \n");
        return res.status(400).send({});
      }

      Act.find({actId : req.params.aid}).limit(1)
        .then(act => {
          console.log(act);
          if(act.length==0)
            return res.status(400).send({});
          else{
            var catName = act[0].categoryName;
            Act.remove({actId : req.params.aid}, function(err, actt) {
            if (err)
              return res.status(400).send({});
            else{
              Category.update({categoryName : catName},{$inc:{actCount:-1}},function(er,cat){
                res.status(200).json({});
              })
            }
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
      return res.status(405).send({});
    }
  }
};


exports.upvote_act = function (req,res) {
  if(crash==1)
    res.status(500).send({});
  else{
    if(req.method == 'OPTIONS'){
      res.status(200).send();
    }
    else if(req.method == 'POST'){
      Req.create({count : 1});
      console.log("Request");

      console.log("Upvote")
      console.log(req.body);
      if(!req.body){
        console.log("Category Name cannot be empty");
        return res.status(400).send({});
      }
      Act.find({actId : req.body[0]}).limit(1)
        .then(act => {
          if(act.length == 0){

            res.status(400).send({});
          }
          else{
            var query = { actId : req.body[0] };
            var newvalues = { $inc : { upvotes : 1 } };
            Act.update(query,newvalues,function(err,resp){
              if(err)
                res.status(400).send({});
              else
                res.status(200).send({});
            })
          }
        })
        .catch(err => {
          res.status(400).send({});
        })
    }
    else{
      Req.create({count : 1});
      console.log("Request");

      res.status(405).send({});
    }
  }
}

exports.list_acts = function (req,res) {
  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request");

    console.log("LISTING")
    console.log(req.params);
    if(req.method == 'GET'){
      console.log(req.query)
      if(Object.keys(req.query).length === 0){
        Category.find({categoryName : req.params.catName})
          .then(result => {
            if(result.length == 0){
              res.status(204).send({});
            }
            else{
              Act.find({categoryName : req.params.catName})
                .then(act => {
                  if(act.length == 0){
                    return res.status(204).send({});
                  }
                  else if(act.length<100){
                    // console.log(act);
                    response = []
                    for(var j=0;j<act.length;j++){
                      var r = {"actId"    : act[j].actId ,
                               "username" : act[j].username ,
                               "timestamp": act[j].timestamp ,
                               "caption"  : act[j].caption ,
                               "upvotes"  : act[j].upvotes ,
                               "imgB64"   : act[j].imgB64}
                      // console.log(r);
                      response.push(r);               
                    }
                    console.log(response);
                    return res.status(200).json(response);
                  }
                  else{
                    return res.status(413).send({});
                  }
                })
                .catch(err => {
                  res.status(400).send({});
                })
            }
          })
          .catch(err => {
            res.status(400).send({});
          })

      }

      else if(Object.keys(req.query).length){
        console.log("HI")
        Category.find({categoryName : req.params.catName})
          .then(result => {
            console.log(result)
            if(result.length == 0){
              res.status(204).send({});
            }
            else{
              if(req.query.start == 0 || req.query.end == 0){
                return res.status(400).send({});
              }
              else if(req.query.start <1 || req.query.end >result[0].actCount){
  	      console.log("HIIIIII");
                return res.status(400).send({});
              }
              else if((req.query.end-req.query.start+1)>100)
                return res.status(413).send({});
              else{
                console.log(typeof parseInt(req.query.start-1))
                Act.find({categoryName : req.params.catName}).sort({_id:-1}).skip(parseInt(req.query.start-1)).limit(parseInt(req.query.end))
                  .then(act => {
                    console.log(act)
                    if(act.length == 0){
                      return res.status(204).send({});
                    }
                    else{
                      response = []
                      for(var j=0;j<act.length;j++){
                        var r = {"actId"    : act[j].actId ,
                                 "username" : act[j].username ,
                                 "timestamp": act[j].timestamp ,
                                 "caption"  : act[j].caption ,
                                 "upvotes"  : act[j].upvotes ,
                                 "imgB64"   : act[j].imgB64}
                        // console.log(r);
                        response.push(r);               
                      }
                      console.log(response);
                      return res.status(200).json(response);
                    }
                  })
                  .catch(err=> {
                    return res.status(400).send({});
                  })
              }              
            }
          })
        }
      }
    else{
      res.status(405).send({});
    }
  }
};


exports.actcount = function (req,res) {
  if(crash==1)
    res.status(500).send({});
  else{
    Req.create({count : 1});
    console.log("Request");

    if(req.method == "GET"){
      var count = 0;
      var response = [];
      Category.find({})
        .then(category => {
          // console.log(category);
          if(category.length<1){
            console.log("No Content");
          }
          else{
            category_list = new Map();
            for(var i = 0;i<category.length; i++){
              var categoryCount = category[i].actCount;
              count += categoryCount;
            }
            response.push(count);
            res.status(200).json(response);
          }
        })
    }
    else{
      res.status(405).send({});
    }
  }
};


exports.httpreq = function (req,res) {
  if(crash==1)
    res.status(500).send({});
  else{
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
  }
};

exports.health = function (req,res) {
  if(crash==1)
    res.status(500).send({});
  else{

    if(req.method == "GET"){
      console.log("\n====HEALTH CHECK ====")
      var isError = false;
      var mongoResult;
      try {
        mongoResult = mongoHealthcheck(mongoose);
      } catch (err) {
        isError = true;
        mongoResult = err;
      }
      console.log(mongoResult);
      if(mongoResult!='Connected')
        res.status(500).send({});
      else{
        // var usage = fs.readFile('/sys/fs/cgroup/memory/memory.usage_in_bytes')
        // var limit = fs.readFile('/sys/fs/cgroup/memory/memory.limit_in_bytes')
        // console.log(usage,+"  "+limit);
        res.status(200).send({});
      }
    }
  }
};

exports.crash = function (req,res) {
  console.log(crash);
  if(crash==0){
    console.log('======CRASH=====')
    crash = 1;
    res.status(200).send({});
  }
  else{
    console.log('===SERVER IS CRASHED====')
    res.status(500).send({});
  }
    
};

