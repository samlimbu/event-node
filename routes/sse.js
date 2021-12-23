const express = require('express');
const router = express.Router();
const sse = require('../models/sse');

router.get('/', (request, response, next) => {
    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });

    sse.sseModel.find({},(err,data)=>{
        if(err)
        throw(err);
        sse.Stream.emit('push', 'message', data);
    });
    //{msg: 'admin has decline event fsad', response: 'decline', icon: 'clear'} {msg: 'admin has accept event fsad', response: 'accept', icon: 'check'}

    sse.Stream.on('push', (event, data) => {
        response.write('event: ' + String(event) + '\n' + 'data: ' + JSON.stringify(data) + '\n' + 'retry: 10000\n' + '\n\n');

    });
})

router.post('/send_message', (req, res, next) => {
    console.log(req.body);
    sse.setStream(req.body)
    res.json(req.body);
})

module.exports = router;