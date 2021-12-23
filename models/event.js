const mongoose = require('mongoose');
const categoryModel = require('../models/category');
const eventModel = mongoose.model('event', new mongoose.Schema(
    {
        id: Number,
        title: String,
        subtitle: String,
        date: String,
        createdOn: String,
        category: String,
        lat:Number,
        lon:Number,
        detail: String,
        options: [],
        category_objid: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]
    }
))

module.exports = eventModel;
module.exports.getData = function (callback) {
    eventModel.find(callback);
};