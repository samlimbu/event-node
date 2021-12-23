const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const eventModel = require('../models/event');
const sse = require('../models/sse')
function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

router.get('/search',(req,res,next)=>{
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    let re = new RegExp(req.query.q,'i');
    console.log(req.query.q);
    eventModel.find({"$or":[{'title' : re}, {'date' : re}, {'category' : re}]},(err,data)=>{
        res.json(data);
        if (err)
            throw err;
    }).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage);
   
})

router.get('/all', (req, res, next) => {
    eventModel.find({})
    .populate({ path: "category_objid", select: {}}).exec((err, data) => {
        if (err)
            throw err;
        console.log(data);
        res.json(data);
    });
})

router.get('/by_category_id/:id', (req, res, next) => {
    console.log('cat id', req.params.id);
    eventModel.find({category_objid: req.params.id}).sort({ date:1 })
    .populate({ path: "category_objid", select: {}}).exec((err, data) => {
        if (err)
            throw err;
        res.json(data);
    });
})


router.get('/', (req, res, next) => {
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    console.log('get/');
    eventModel.find({}, (err, data) => {
        console.log('evet');
        if (err)
            throw err;
        res.json(data);
    }).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage);
})

router.get('/id/:id', (req, res, next) => {
   
    if (!isNaN(req.params.id)) {
        console.log(req.params.id);
        eventModel.find({ id: req.params.id }, (err, data) => {
            if (err)
                throw err;
            res.json(data);
        });
    }
    else {
        res.json([]);
    }
})

router.put('/update/:id', (req, res, next) => {
 
    console.log('update', req.params.id);
    eventModel.findOneAndUpdate({ id: req.params.id }, req.body, (err, data) => {
        if (err)
            throw err;
            console.log(data);
        res.json(data);
    });
})

router.get('/count', (req, res, next) => {
    eventModel.count({}, (err, data) => {
        res.json(data);
    })
})

router.post('/delete', (req, res, next) => {

    eventModel.deleteOne({ id: req.body.id }, (err, data) => {
        if (err)
            throw err;
        res.json(data);
    })
});


router.post('/add', (req, res, next) => {
    mongoose.model('event').find({}, (err, data) => {
        if (err) {
            throw err;
        }
        let latestId;
        let obj = req.body;

        if (data === undefined || data == null || data.length <= 0) {
            console.log('length 0');
            latestId = 0;

        } else {

            latestId = data[0]['id'];


        }
        obj['id'] = latestId + 1;
        console.log("latestId", latestId);


        mongoose.model('event').updateOne({ id: latestId + 1 }, req.body, { upsert: true }, function (err, data) {
            if (err) {
                throw err;
            }
            console.log('addd event', req.body);
            sse.setStream({msg: `${req.body.title} event created`,icon:'event'});
            mongoose.model('event').find({}, function (err, data) {

                if (err) {
                    throw err;
                }
                res.json(data);

            }).sort({ id: 1 });
        });
    }).sort({ id: -1 }).limit(1)
})
module.exports = router;