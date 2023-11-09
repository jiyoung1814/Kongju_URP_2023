const express = require('express');
const router = express.Router();
const request = require('request');
const tcp = require('../../tcp/')

PACKET = {
    'stx' :'02',
    "device": '01',
    'cmd': 'N',
    "intg": '1000',
    "etx": '03'
}
data ={};

router.get('/sensing', (req, res)=>{

    res.json(
        {
            'cmd': PACKET.cmd,
            "IntgTime": PACKET.intg

        }
    );
    
});

router.post('sensingValue', (req, res)=>{
    
})




module.exports = router;