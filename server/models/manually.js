const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const manuallySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    dateTime: {
        type: String,
        required: true
    },
    linkToOriginalPost: {
        type: String
    },
    detailDateTime: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    organizationInfo: [
        {
            name: {
                type: String,
                required: true
            },
            link: {
                type: String,
            }
        }
    ],
    ticket: {
        type: Boolean,
        required: true
    },
    ticketLink: {
        type: String
    },
    eventBy: {
        type: String,
    },
    location: {
        type: String,
    },
    category: [
        {
            type: String,
        }
    ],
    isManuallyAdded: {
        type: Boolean,
        required: true
    },
    dateObject: {
        type: String,
        required: true
    },
    uuid: {
        type: String,
        required: true
    },
});

const Manually = mongoose.model("manually", manuallySchema);

module.exports = Manually;