const mongoose = require('mongoose');
const { Schema } = mongoose;

const hamamatusSchema = new Schema({
    datetime: Date,
    intgtime: Number,
    pixel:{}
}, { collection: 'hamamatus' });


hamamatusSchema.statics.insertPost = async function ({datetime, intgtime, pixel}){
    const post = new this({datetime, intgtime, pixel})
    return post.save()
}

module.exports = mongoose.model('hamamatus', hamamatusSchema);
