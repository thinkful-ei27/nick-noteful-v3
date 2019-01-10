const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
    name: {type: String, required: true, unique: true}
}, {timestamps: true});

// folderSchema.set('timestamps', true); This works, but won't set initially

//Within Mongo, currently returning __v and _id with .find()
//Potential solution (hide from ALL queries): __v: {select: false}
folderSchema.set('toJson', {
    virtuals: true,
    versionKey: false,
    transform: (doc, result) => {
        delete result._id;
    }
});

module.exports = mongoose.model('Folder', folderSchema);