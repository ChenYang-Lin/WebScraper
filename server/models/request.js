const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    email: {
        type: String,
        required: true
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

const Request = mongoose.model("request", requestSchema);

module.exports = Request;