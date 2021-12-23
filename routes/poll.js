const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const poll = require('../models/poll');

router.post('/', (req, res, next) => {
    console.log('param', req.body);
    poll.saveData(req.body.data, (err, data) => {
        if (err)
            throw err;
        console.log('saved', req.body.data);
        res.json(data);
    })
});

router.post('/addPoll', function (request, response) { //link url in browser
    console.log(request.body)
    var datalength;
    mongoose.model('poll').find({}, function (err, data) {
        datalength = data.length;
        obj = request.body;
        obj['id'] = data.length+1;
        console.log('data length', datalength, request.body);
        mongoose.model('poll').updateOne({ id: datalength+1 }, obj, { upsert: true }, function (err, data) { //db.categories.find()
            if (err) {
                throw err;
            }
            mongoose.model('poll').find({}, function (err, data) { //db.categories.find()

                if (err) {
                    throw err;
                }
                response.json(data);

            }).sort({ id: 1 }); //filter
        });


    });
});



router.get('/', (req, res, next) => {
    console.log('poll //');
    mongoose.model('poll').find({}, (err, data) => {
        if (err) {
            throw err;
        }
        res.json(data);
    })
});

router.get('/:id', (req, res, next) => {
    console.log('param', req.params.id);
    poll.getDatabyQuery({ id: req.params.id }, (err, data) => {
        if (err)
            throw err;
        res.json(data);
    })
});

router.put('/updatePoll', function(req,res,next){
    console.log('put',req.body);
    mongoose.model('poll').updateOne({id: req.body.id},req.body,(err,data)=>{
        if(err)
            throw err;
        res.json(data);
    })
})
//test methods//

router.get('/all', (req, res, next) => {
    console.log('poll /all');
    poll.getData((err, data) => {
        if (err)
            throw err;
        res.json(data);
    })
});

router.get('/model/:id', (req, res, next) => {
    console.log('req.params.id', req.params.id);
    mongoose.model('poll').findOne({id: req.params.id}, (err, data) => {
        if (err)
            throw (err)
        console.log(data);
        res.json(data);
    })
})

router.get('/modelid/:id', (req, res, next) => {
    console.log('req.params.id', req.params.id);
    poll.getDatabyQuery({id:req.params.id},(err,data)=>{
        if (err){
            throw err;
        }
        res.json(data);
    })
})

module.exports = router;