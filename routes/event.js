const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const eventModel = require('../models/event');
const sse = require('../models/sse')


router.get('/search', (req, res, next) => {
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    let re = new RegExp(req.query.q, 'i');
    console.log(req.query.q);
    eventModel.find({ "$or": [{ 'title': re }, { 'date': re }, { 'category': re }] }, (err, data) => {
        res.json(data);
        if (err)
            throw err;
    }).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage);

})

router.get('/all', (req, res, next) => {
    eventModel.find({})
        .populate({ path: "category_objid", select: {} }).exec((err, data) => {
            if (err)
                throw err;
            console.log(data);
            res.json(data);
        });
})

router.get('/allevent_categories', (req, res, next) => {

    eventModel.aggregate([
        {

            $group: {
                _id: '$category',
                count: { $sum: 1 }
            }
        }
    ],
        (err, data) => {
            if (err)
                throw err;
            console.log(data);
            res.json(data);
        });
})

router.get('/by_category_id/:id', (req, res, next) => {
    wait(500);
    console.log(req.query);
    let query = { category_objid: req.params.id };
    if (req.query.expired == 'true') {
        query.date = { $lte: req.query.date };
        console.log(query);
    }
    else if (req.query.expired == 'false') {
        query.date = { $gte: req.query.date };
        console.log(query);
    }
    //, $lte:

    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    eventModel.find(query).sort({ date: 1 }).skip(itemperpage * (pageNo - 1)).limit(itemperpage)
        .populate({ path: "category_objid", select: {} }).exec((err, data) => {
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

router.get('/count_by_id/:id', (req, res, next) => {
    console.log('rq count', req.query);
    let query = { category_objid: req.params.id };
    if (req.query.expired == 'true') {
        query.date = { $lte: req.query.date };
        console.log(query);
    }
    else if (req.query.expired == 'false') {
        query.date = { $gte: req.query.date };
        console.log(query);
    }
    console.log('query...', query);
    eventModel.count(query, (err, data) => {
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
            sse.setStream({ msg: `${req.body.title} event created`, icon: 'event' });
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