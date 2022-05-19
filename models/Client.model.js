const { Schema, model, default: mongoose } = require("mongoose");

const clientSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
  },
  fiscalNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  cars: [
    {
      type: Schema.Types.ObjectId,
      ref: "Car",
    },
  ],
});

const Client = model("Client", clientSchema);

module.exports = Client;
