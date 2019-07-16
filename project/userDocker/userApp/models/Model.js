var mongoose = require('mongoose')
var Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1:27017/user')

var UserSchema = new mongoose.Schema({
  username : {
  	type : String ,
  	required : true 
  } ,
  password :{
  	type : String ,
  } 
})

let RequestSchema = new mongoose.Schema({
	count : {
		type : Number
	}
})

module.exports = mongoose.model('User' ,UserSchema)
module.exports = mongoose.model('Req' ,RequestSchema)

