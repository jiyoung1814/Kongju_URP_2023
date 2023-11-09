const express = require('express');
const router = express.Router();
const nsp32_db = require('../../db/NSP32');


router.post('/sensing', async(req, res)=>{
    // console.log(req.body.spd)

    let datetime = new Date();

    intgtime = req.body.intgtime
    saturation = req.body.saturation
    numOfPoints = req.body.numOfPoints
    spd_arr = req.body.spd
    spd ={}

    for(let i = 0; i< spd_arr. length; i++){
        spd[i] = spd_arr[i]
    }

    try{
        before_calibration = nsp32_db.insertPost({datetime, intgtime, saturation, numOfPoints, spd});
    }catch(err){
        console.log("save nsp32 error: "+err);
    }

    res.json("ok")
})

module.exports = router;