const express = require('express');
const router = express.Router();

const tcp = require('../../tcp/index');
const HamamatusDB = require('../../db/Hamamtus');
const Calibration = require('../../db/Calibration');
const color = require('../python/color');

let read_packet = {
    'stx' :'02',
    "device": '01',
    'cmd': 'A',
    "intgtime": '1000',
    "etx": '03'
}

let raw ={};

router.post('/sensing', async(req, res)=>{

    // console.log(req.body)
    read_packet['cmd'] = req.body.cmd;
    read_packet['intgtime'] = req.body.intgtime;
    console.log(read_packet)


    if(tcp.getTcpState()){

        let datetime = new Date();

         //[tcp] 센서 측정 시작
        raw = await tcp.writePacket(read_packet);

        //raw data 저장
        let raw_save = null;

        let intgtime = raw['intgtime']
        let pixel = raw['pixel']

        try {
            raw_save = await HamamatusDB.insertPost({datetime, intgtime, pixel})
        } catch (error) {
            console.log("save Hamamatus DB error: "+error);
        }
        
        // raw -> darkcurrent_remove, leveling data 저장
        if(Object.keys(raw).length != 0){ //센싱값이 잘 들어옴
            
            // //python 서버로 픽셀값 전달 -> get optical data
            let res_optical = await color.getOptical(raw);

            // let optical = res_optical['data']['calibrated'];

            // let propertise_save = null;
            
            // let sp_ird = optical['spd'];
            // let propertise ={
            //     'cct': optical['CCT'],
            //     'XYZ': optical['XYZ'],
            //     'xyz': optical['xyz'],
            //     'cri': optical['CRI'],
            //     'cqs': optical['CQS']

            // }

            let before_calibration = null
            let lagrange= res_optical['data']['lagrange'];
            let remove_dark_current = res_optical['data']['remove_dark_current'];
            let leveling= res_optical['data']['leveling'];

            try{
                before_calibration = Calibration.insertPost({datetime, lagrange, remove_dark_current, leveling});
            }catch(err){
                console.log("save calibration error: "+err);
            }

            res.json("ok")
            
        }
        else{
            console.log("재측정 필요")
            res.json("false")
        }

        // raw = {};
        tcp.setinitValue();
    }

   


})

module.exports = router;