const {Schema, model} = require("mongoose");

const carSchema = new Schema({
    brand: {
        type: String,
        required: true,
      },
      model: {
        type: String,
        required: true,
      },
      licensePlate: {
        type: String,
        required: true,
        unique: true,
      },
      services: [
        {
          serviceDate: Date,
          serviceDetails: String,
          serviceStatus: {
            type: String,
            enum: ["waiting", "onShop", "readyToDeliver", "delivered"],
            default: "waiting",
          },
        },
      ]
})

const Car = model("Car", carSchema);

module.exports = Car;