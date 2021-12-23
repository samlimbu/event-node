const EventEmitter = require('events');
const Stream = new EventEmitter();
const mongoose = require('mongoose');
const sseSchema = new mongoose.Schema({
    icon: String,
    msg: String,
    response: String,
},{ capped:true, size: 2, max: 2})
const sseModel = mongoose.model('sse', sseSchema);

setStream = function (obj) {
    console.log('setSream');
    sseModel.create(obj, (err, data) => {
        if(err)
        throw(err);
        sseModel.find({},(err,data)=>{
            if(err)
            throw(err);
            Stream.emit('push', 'message', data);
        })
      
    })
}

module.exports = { Stream, setStream, sseModel }