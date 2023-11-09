const mongoose = require('mongoose');
const { Schema } = mongoose;

const opticalPropertiseSchema = new Schema({
    datetime: Date,
    sp_ird: {},
    propertise:{}
}, { collection: 'opticalPropertise' });


opticalPropertiseSchema.statics.insertPost = async function ({datetime, sp_ird, propertise}){
    const post = new this({datetime, sp_ird, propertise})
    return post.save()
}

module.exports = mongoose.model('opticalPropertise', opticalPropertiseSchema);
