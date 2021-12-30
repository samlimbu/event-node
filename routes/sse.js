const express = require('express');
const router = express.Router();
const sse = require('../models/sse');

router.get('/', (request, response, next) => {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });

        sse.Stream.on('push', (event, data) => {
        response.write('event: ' + String(event) + '\n' + 'data: ' + JSON.stringify(data) + '\n' + 'retry: 10000\n' + '\n\n');

    });
})
router.get('/get_messages', (request, response, next) => {
 
    console.log(request.query);
    const itemperpage = parseInt(request.query.itemperpage);
    const pageNo = parseInt(request.query.pageNo);
    console.log(parseInt(itemperpage));
    sse.sseModel.find({},(err,data)=>{  
        if(err)
        throw(err);
        response.json(data);
    }).sort({ _id: -1 }).skip(itemperpage * (pageNo - 1)).limit(itemperpage);

   
})

router.post('/send_message', (req, res, next) => {
    console.log(req.body);
    sse.setStream(req.body)
    res.json(req.body);
})

module.exports = router;