const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const serviceSchema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    car: {
        type: String,
        required: true
    },
    serviceDate: {
        type: Date,
        required: true
    },
    serviceDetails: {
        type: String,
        required: true
    },
    serviceStatus: {
        type: String,
        enum: [waiting, onShop, readyToDeliver, delivered],
        default: 'waiting'
    }


});

const Service = model("Service", serviceSchema);

module.exports = Service;
