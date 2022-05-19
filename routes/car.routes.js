const router = require("express").Router();

const { default: mongoose } = require("mongoose");
const Client = require("../models/Client.model");
const Service = require("../models/Service.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const User = require("../models/User.model");

//Get list of all cars for a specific Client
router.get('/clients/:clientId/cars', (req, res, next) => {
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
router.post('/clients/:clientId/cars', (req, res, next) => {
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





module.exports = router;