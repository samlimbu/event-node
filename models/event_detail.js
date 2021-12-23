const mongoose = require('mongoose');
const UsersModel = require('./users');

const EventDetailModel = mongoose.model('event_detail', new mongoose.Schema(
    {
        id: Number,
        event_id: Number,
        title: String,
        username: String,
        response: String,
        user_objid: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    }
))

module.exports = EventDetailModel;
module.exports.getData = function (callback) {
    eventDetailModel.find(callback);
};