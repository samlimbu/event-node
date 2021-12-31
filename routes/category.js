const express = require('express');
const router = express.Router();
const categoryModel = require('../models/category');
const passport = require('passport');
require('../config/passport')(passport) 

router.get('/all', passport.authenticate('jwt', { session: false }), (req, res) => {
    let num = 1;
    console.log(req.query);
    if(req.query.file){
        num = parseInt(req.query.file);
    }
    categoryModel.find({},{file: num}, (err, data) => {
        if (err) {
            throw err;
        }
        res.json(data);
    })
})
router.get('/all_fields', (req, res) => {

    categoryModel.find({}, (err, data) => {
        if (err) {
            throw err;
        }
        res.json(data);
    })
})
router.get('/id/:id', (req, res) => {
    categoryModel.find({ _id: req.params.id }, (err, data) => {
        if (err) {
            throw err;
        }
        res.json(data);
    })
})
router.put('/update/:id', (req, res) => {
    console.log(req.params, req.body);
            categoryModel.findOneAndUpdate({ _id: req.params.id },req.body ,(err, data) => {
                if (err) {
                    throw err;
                }
                res.json(data);
            })
})
    router.get('/', (req, res, next) => {
        console.log(typeof (req.query.pageSize + 0));
        console.log(req.headers);
        console.log(req.query.page);
        const itemperpage = parseInt(req.query.pageSize, 10);
        const pageNo = parseInt(req.query.page, 10);
        console.log('getcategory/');
        categoryModel.find({}, { file: 0 }, (err, data) => {
            console.log('category');
            if (err)
                throw err;
            res.json(data);
        }).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage);
    })

    router.post('/add', (req, res, next) => {
        console.log('add',req.body);
        categoryModel.findOne({ name: req.body.name }, (err, data) => {
            if (err) {
                throw err;
            }
            if (data) {
                res.json({ success: false, msg: 'Category already exists' });
            }
            else if (!data) {
                categoryModel.create(req.body, (err, data) => {
                    if (err) {
                        throw err;
                    }
                    res.json(data);
                });
            }
        })

    })

    router.get('/count', (req, res, next) => {
        categoryModel.count({}, (err, data) => {
            res.json(data);
        })
    })

    module.exports = router;