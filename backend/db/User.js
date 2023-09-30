const mongoose = require('mongoose')
//schema for users collection/table
//shema used to perform insert, delete, update data to table
//data joh add krtey hai voh define krna padta hai schema ke undar..this is not valid for get data..in this case it is blank..only insert,update , delete
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})
//schema mae table ke andar joh fields hai voh define krtey hai

//model for users collection
module.exports = mongoose.model('users',userSchema)