const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    lastUpdate: {
        type: String,
        required: true
    },
    errorMessages: [
        {
            type: String,
        }
    ],
}, { timestamps: true});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;