const mongoose = require('mongoose');
const { Schema } = mongoose;

const CalibrationSchema = new Schema({
    datetime: Date,
    remove_dark_current: {},
    lagrange:{},
    leveling: {}
}, { collection: 'hamamtusCalibration' });


CalibrationSchema.statics.insertPost = async function ({datetime, lagrange, remove_dark_current, leveling}){
    const post = new this({datetime, lagrange, remove_dark_current, leveling})
    return post.save()
}

module.exports = mongoose.model('hamamtusCalibration', CalibrationSchema);
