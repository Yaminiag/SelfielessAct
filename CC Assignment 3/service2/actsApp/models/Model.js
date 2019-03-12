var mongoose = require('mongoose')
var Schema = mongoose.Schema;

mongoose.connect(`mongodb://127.0.0.1:27017/act`)

var UserSchema = new mongoose.Schema({
  username : {
  	type : String ,
  	required : true 
  } ,
  password :{
  	type : String ,
  } 
})

var CategorySchema = new mongoose.Schema({
  categoryName : {
  	type : String ,
  	unique : true,
  	required : true
  } ,
  actCount : {
  	type : Number
  } 
})

var ActSchema = new mongoose.Schema({
	actId : {
		type : Number ,
		index :{unique:true}
	},
	username : {
		type : String 
	},
	timestamp : {
		type : String
	},
	caption : {
		type : String 
	},
	categoryName : {
		type : String
	},
	upvotes : {
		type : Number
	},
	imgB64 : {
		type : String
	}
})

module.exports = mongoose.model('User' ,UserSchema)
module.exports = mongoose.model('Category' ,CategorySchema)
module.exports = mongoose.model('Act' ,ActSchema)

