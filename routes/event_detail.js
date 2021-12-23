const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const eventDetailModel = require('../models/event_detail');
const sse = require('../models/sse');

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

router.get('/all', (req, res, next) => {
    eventDetailModel.find({}, (err, data) => {
        console.log('evet');
        if (err)
            throw err;
        res.json(data);
    })
})

router.get('/username/:username', (req, res, next) => {
    console.log(req.query);
    console.log(req.params);
    eventDetailModel.find({ username: req.params.username }, (err, data) => {
        console.log('evet');
        if (err)
            throw err;
        res.json(data);
    })
})

router.get('/', (req, res, next) => {
    wait(500);
    console.log(typeof (req.query.pageSize + 0));
    console.log(req.headers);
    console.log(req.query.page);
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    console.log('get/');
    eventDetailModel.find({}, (err, data) => {
        console.log('evet');
        if (err)
            throw err;
        res.json(data);
    }).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage);
})

router.get('/id/:id', (req, res, next) => {
    wait(500);
    if (!isNaN(req.params.id)) {
        console.log(req.params.id);
        eventDetailModel.find({ id: req.params.id }, (err, data) => {
            if (err)
                throw err;
            res.json(data);
        });
    }
    else {
        res.json([]);
    }
})

router.get('/event_id/:id', (req, res, next) => {
    console.log(req.query, req.params);
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    const query = { event_id: req.params.id };
    if (!isNaN(req.params.id)) {
        console.log(req.params.id);
        eventDetailModel.find(query).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage)
            .populate({ path: "user_objid", select: { password: 0 } }).exec((err, data) => {
                if (err)
                    throw err;

                res.json(data);
            });
    }
    else {
        res.json([]);
    }
})

router.get('/event_id/all/:id', (req, res, next) => {
    console.log(req.query, req.params);
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    const query = { event_id: req.params.id };
    if (!isNaN(req.params.id)) {
        console.log(req.params.id);
        eventDetailModel.find(query)
            .populate({ path: "user_objid", select: { password: 0 } }).exec((err, data) => {
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
    wait(500);
    console.log('update', req.params.id);
    eventDetailModel.findOneAndUpdate({ id: req.params.id }, req.body, (err, data) => {
        if (err)
            throw err;
        console.log(data);
        res.json(data);
    });
})

router.get('/count', (req, res, next) => {
    eventDetailModel.count({}, (err, data) => {
        res.json(data);
    })
})

router.post('/delete', (req, res, next) => {
    wait(1000);
    eventDetailModel.deleteOne({ id: req.body.id }, (err, data) => {
        if (err)
            throw err;
        res.json(data);
    })
});


router.post('/add', (req, res, next) => {

    mongoose.model('event_detail').find({}, (err, data) => {
        if (err) {
            throw err;
        }
        let latestId;
        let obj = req.body;

        if (data === undefined || data == null || data.length <= 0) {

            latestId = 0;
        } else {

            latestId = data[0]['id'];
        }
        obj['id'] = latestId + 1;


        let query = { event_id: req.body.event_id, username: req.body.username };
        mongoose.model('event_detail').updateOne(query, req.body, { upsert: true }, function (err, data) {
            if (err) {
                throw err;
            }
            let updateBody = req.body;

            mongoose.model('event_detail').find({ username: req.body.username }, function (err, data) {

                if (err) {
                    throw err;
                }
              //  sse.setStream({msg: `${updateBody.username} has ${updateBody.response} event ${updateBody.title}`,response: updateBody.response});
                console.log(updateBody);
                res.json(data);

            }).sort({ id: 1 });
        });
    }).sort({ id: -1 }).limit(1)
})

module.exports = router;