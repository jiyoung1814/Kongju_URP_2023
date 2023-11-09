const express = require('express');
const router = express.Router();
const request = require('request');
const db = require('../../db/index');

flag = false;
cnt = 0;
index = 0;
data ={};
CMD = 'A'
INTGTIME = 1000;
final_data = {};


// json res
router.post('/sensingValue', async(req, res)=>{

    console.log(req.body.v)

    req_data = req.body.v;


    // // if(req_data.length ==1 && req_data[0] =='0'){flag = true} 
    
    if (flag && cnt >=0 && cnt <= 95 && typeof req_data != 'number'){
        data_value = req.body.v.split(',');
        
        for(i = 0; i< data_value.length; i++ ){
            data[index] = parseInt(data_value[i])
            index += 1;
        }
        cnt += 1;
    }
    if(cnt>95){
        // delete data['-1'];
        await getOptical(data);
        // await console.log(data);

        //init value
        index = 0;
        cnt = 0;
        flag = false;
        data ={};
    }

    
    if(typeof req_data  == 'number'){ 
        flag = true;
        data['intgtime'] = req_data;
    }

    
    
});

router.get('/sensing', (req, res)=>{

    res.json(
        {
            'cmd': CMD,
            "IntgTime": INTGTIME

        }
    );
    
});


router.post('/getValue', (req, res)=>{
    // console.log(req)
    CMD = req.body.cmd;
    INTGTIME = parseInt(req.body.intgtime);
    // console.log(Object.keys(final_data).length)
    // final_data = {};



    final_data['Intagtime'] = data['intgtime'];
    res.json(final_data);
})


const getOptical = async(data) =>{

    option = {
        url: 'http://localhost:9000/color/getOptical',
        method: 'POST',
        body:data,
        json: true
    }

    request.post(option, async function(res, body){
        // console.log(res);
        // console.log(body)
        final_data = body.body;
        console.log(final_data)

        await saveDB(final_data);

        CMD = 'N';
        INTGTIME = 1000;
    })

}


router.post('/getValue', (req, res)=>{

    CMD = req.body.cmd;
    INTGTIME = req.body.intgtime;

    res.json(final_data);

})


// const saveDB =(data)=>{

//     let today = new Date();
//     let year = today.getFullYear();
//     let month = ('0' + (today.getMonth() + 1)).slice(-2);
//     let day = ('0' + today.getDate()).slice(-2);

//     let hours = ('0' + today.getHours()).slice(-2); 
//     let minutes = ('0' + today.getMinutes()).slice(-2);
//     let seconds = ('0' + today.getSeconds()).slice(-2);

//     let datetimeString = '\''+year + '-' + month  + '-' + day+ " "+hours + ':' + minutes  + ':' + seconds+'\'';

//     let spd = data['spd'];
//     let wavelength = Object.keys(spd);

//     let spd1 = "\'";
//     let spd2 = "\'";
//     let spd3 = "\'";

//     for(let i=0; i<wavelength.length;i++){
//         if(i<132){
//             spd1 += Number(spd[wavelength[i]]).toFixed(3)+", ";
//         }
//         else if(i>=132 && i<264){
//             spd2 += Number(spd[wavelength[i]]).toFixed(3)+", ";
//         }
//         else{
//             spd3 += Number(spd[wavelength[i]]).toFixed(3)+", ";
//         }
//     }

//     spd1 = spd1.substring(0,spd1.length-1)+"\'";
//     spd2 = spd2.substring(0,spd2.length-1)+"\'";
//     spd3 = spd3.substring(0,spd3.length-1)+"\'";

//     console.log(spd1)

//     cct = data.CCT;
//     illum = data.lux;

//     cri = []
//     criIdex = Object.keys(data.CRI)
//     for(let i=0; i< criIdex.length;i++){
//         cri[i] = data.CRI[criIdex[i]]
//     }

//     cqs = data.CQS.vsa

//     // console.log('INSERT INTO sensor.hamamatus VALUES ('+datetimeString+','+spd1+','+spd2+','+cct+','+illum+','
//     // +cri[0]+','+cri[1]+','+cri[2]+','+cri[3]+','+cri[4]+','+cri[5]+','+cri[6]+','+cri[7]+','+cri[8]+','+cri[9]+','+cri[10]+','+cri[11]+','+cri[12]+','+cri[13]+','+cri[14]
//     // +','+cqs+');');
    
//     // db.query('INSERT INTO sensor.hamamatus VALUES ('+datetimeString+','+cct+','+illum+','
//     // +cri[0]+','+cri[1]+','+cri[2]+','+cri[3]+','+cri[4]+','+cri[5]+','+cri[6]+','+cri[7]+','+cri[8]+','+cri[9]+','+cri[10]+','+cri[11]+','+cri[12]+','+cri[13]+','+cri[14]
//     // +','+cqs+');',
//     // function(err){
//     //     if(err){console.log(err)}
//     // })
// 
// 
// 
// }

module.exports = router;