const { Schema, model, default: mongoose } = require("mongoose");

const carSchema = new Schema({
  creator: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Client",
  },
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
  imageurl: {
    type: String,
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
  ],
});

const Car = model("Car", carSchema);

module.exports = Car;
