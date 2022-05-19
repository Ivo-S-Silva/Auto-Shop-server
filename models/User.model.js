const { Schema, model, default: mongoose } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    username: String,
    password: {
      type: String,
      required: true
    },
    clients: [{
      type: Schema.Types.ObjectId,
      ref: 'Client'
    }],
    services: [{
      type: Schema.Types.ObjectId,
      ref: 'Service'
    }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
