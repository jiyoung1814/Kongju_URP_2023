const mongoose = require('mongoose');
const { Schema } = mongoose;

const NSP32Schema = new Schema({
    datetime: Date,
    intgtime: Number,
    saturation: Boolean,
    numOfPoints: Number,
    spd:{}
}, { collection: 'NSP32' });

NSP32Schema.statics.insertPost = async function ({datetime, intgtime, saturation, numOfPoints, spd}){
    const post = new this({datetime, intgtime, saturation, numOfPoints, spd})
    return post.save()
}

module.exports = mongoose.model('NSP32', NSP32Schema);