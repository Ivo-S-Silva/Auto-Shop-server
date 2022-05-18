const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const clientSchema = new Schema({
    name: String,
    fiscalNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    cars: [{
        brand: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        licensePlate: {
            type: String,
            required: true,
            unique: true
        }

    }]

});

const Client = model("Client", clientSchema);

module.exports = Client;
