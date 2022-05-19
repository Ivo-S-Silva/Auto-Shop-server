const router = require("express").Router();

const { default: mongoose } = require("mongoose");
const Client = require("../models/Client.model");
const Service = require("../models/Car.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const User = require("../models/User.model");
const isClientCreator = require("../middleware/isClientCreator.middleware");

//Get list of all cars for a specific Client
router.get('/clients/:clientId/cars', isAuthenticated, isClientCreator, (req, res, next) => {
    const {clientId} = req.params;

    Client.findById(clientId)
        .then(clientFound => {
            res.json(clientFound.cars);
        })
        .catch(error => {
            console.log("Error getting car list for this client", error);
            res.status(500).json({
                message: "Error getting car list for this client",
                error: error
            });
        })
})

//Add new car to specific client
router.post('/clients/:clientId/cars', isAuthenticated, isClientCreator, (req, res, next) => {
    const {clientId} = req.params;

    const newCar = {
        brand: req.body.brand,
        model: req.body.model,
        licensePlate: req.body.licensePlate
    }

    Client.findByIdAndUpdate(clientId, {$push: {cars: newCar}}, {new: true})
        .then(response => res.status(201).json(response.cars))
        .catch(error => {
            console.log("Error creating new car for this client", error)
            res.status(500).json({
                message: "Error creating new car for this client",
                error: error
            });
        });
});

//Edit car details for a specific client
router.put('/clients/:clientId/:carId', (req, res, next) => {
    const {clientId, carId} = req.params;

    Client.findOneAndUpdate({_id: clientId, "cars._id": carId}, {$set: {"cars.$.brand": req.body.brand,"cars.$.model": req.body.model,"cars.$.licensePlate": req.body.licensePlate}})
        .then(updatedClient => res.json(updatedClient))
        .catch(error => {
            console.log("Error updating car details for this user.", error);
            res.status(500).json({
                message: "Error updating car details for this user.",
                error: error
            });
        })
})

//Delete car from specific client
router.delete('/clients/:clientId/:carId', (req, res, next) => {
    const {clientId, carId} = req.params;

    Client.findOneAndDelete()
})




module.exports = router;