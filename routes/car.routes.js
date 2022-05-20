const router = require("express").Router();
const Client = require("../models/Client.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const isClientCreator = require("../middleware/isClientCreator.middleware");
const Car = require("../models/Car.model");

//Get list of all cars for a specific Client
router.get('/clients/:clientId/cars', isAuthenticated, isClientCreator, (req, res, next) => {
    const {clientId} = req.params;

    Client.findById(clientId)
        .populate("cars")
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

//Get details of a specific car
router.get('/clients/:clientId/:carId', isAuthenticated, isClientCreator, (req, res, next) => {
    const {carId} = req.params;

    Car.findById(carId)
        .then(carFound => res.status(201).json(carFound))
        .catch(error => {
            console.log("Error getting the details of this car", error)
            res.status(500).json({
                message: "Error getting the details of this car",
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

    Car.create(newCar)
        .then(createdCar => {
            return Client.findByIdAndUpdate(clientId, {$push: {cars: createdCar._id}}, {new: true})
        })
        .then(() => res.status(201).json("Car created Successfully"))
        .catch(error => {
            console.log("Error creating new car for this client", error)
            res.status(500).json({
                message: "Error creating new car for this client",
                error: error
            });
        })
});

//Edit car details
router.put('/clients/:clientId/:carId', (req, res, next) => {
    const {clientId, carId} = req.params;


    Car.findOneAndUpdate(carId, req.body, {new: true})
        .then(updatedCar => res.json(updatedCar))
        .catch(error => {
            console.log("Error updating car details for this car.", error);
            res.status(500).json({
                message: "Error updating car details for this car.",
                error: error
            });
        })
})

//Delete car from specific client
router.delete('/clients/:clientId/:carId', (req, res, next) => {
    const {clientId, carId} = req.params;

    Car.findOneAndDelete(carId)
        .then(() => {
            return Client.findByIdAndUpdate(clientId, {$pull: {cars: carId}})
        })
        .then(() => res.json("Car removed successfully"))
        .catch(error => {
            console.log("Error removing car from the database.", error);
            res.status(500).json({
                message: "Error removing car from the database.",
                error: error
            });
        })
})

module.exports = router;