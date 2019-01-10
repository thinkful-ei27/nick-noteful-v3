const mongoose = require('mongoose');

const folderSchema = mongoose.Schema({
    name: {Type: String, Required: true, Unique: true}
}, {timestamps: true});

// folderSchema.set('timestamps', true); This works, but won't set initially

folderSchema.set('toJson', {
    virtuals: true,
    versionKey: false,
    transform: (doc, result) => {
        delete result._id;
    }
});

module.exports = mongoose.model('Folder', folderSchema);