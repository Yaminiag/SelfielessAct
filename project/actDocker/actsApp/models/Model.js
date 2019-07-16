var mongoose = require('mongoose')
var Schema = mongoose.Schema;

mongoose.connect(`mongodb://172.17.0.2:27017/ac`)

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

let RequestSchema = new mongoose.Schema({
	count : {
		type : Number
	}
})

let CrashSchema = new mongoose.Schema({
	crash : {
		type : Number
	}
})

module.exports = mongoose.model('User' ,UserSchema)
module.exports = mongoose.model('Category' ,CategorySchema)
module.exports = mongoose.model('Act' ,ActSchema)
module.exports = mongoose.model('Req' ,RequestSchema)
module.exports = mongoose.model('Crash' ,CrashSchema)

