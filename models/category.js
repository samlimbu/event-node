const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema({
    name: String,
    detail: String,
    file:String
})
const Category = mongoose.model("Category",CategorySchema);
Category.getCategory = function(callback){
    Category.find(callback);
}

module.exports = Category;