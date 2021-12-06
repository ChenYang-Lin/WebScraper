const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    groupURL: {
        type: String,
        required: true
    }
}, { timestamps: true});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;