const axios = require('axios');

let optical_data ={};
const url = 'http://localhost:9000/color/getOptical'

exports.getOptical = async(data) =>{

    optical_data = await axios.post(url, data);

    return optical_data;

}
