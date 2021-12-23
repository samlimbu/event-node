const mongoose = require('mongoose');
const pollSchema = new mongoose.Schema(
    {
        id: Number,
        user_id:String,
        question: String,
        options:[]
    }
)
const pollModel = module.exports = mongoose.model('poll',pollSchema);

module.exports.getData = function(callback){
    pollModel.find(callback);
}

module.exports.getDatabyId = function(id,callback){
    pollModel.findById(id,callback);
}
module.exports.getDatabyQuery=function(query, callback){
    pollModel.findOne(query,callback);
}

module.exports.saveData = (data,callback)=>{
    pollModel.saveData(data,callback);
}

