const router = require("express").Router();
const Client = require("../models/Client.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const isCarCreator = require("../middleware/isCarCreator.middleware");
const isClientCreator = require("../middleware/isClientCreator.middleware");
const Car = require("../models/Car.model");


//Get list of all cars for all clients
router.get('/cars', isAuthenticated, (req, res, next) => {
    const currentUser = req.payload._id;

    Car.find({creator: {$eq: currentUser}})
        .then(response => res.json(response))
        .catch(error => {
            console.log('Error getting list of cars', error);
            res.status(500).json({
                message: 'Error getting list of clients',
                error: error
            })
        })
})

//Get details of a specific car
router.get('/cars/:carId', isAuthenticated, isCarCreator, (req, res, next) => {
    const {carId} = req.params;

    Car.findById(carId)
        .then(carFound => {
            console.log(carId)
            res.status(201).json(carFound)})
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
    const userId = req.payload._id;
    const initialServices = [];

    const newCar = {
        creator: userId,
        owner: clientId,
        brand: req.body.brand,
        model: req.body.model,
        licensePlate: req.body.licensePlate,
        services: initialServices
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
router.put('/cars/:carId', isAuthenticated, isCarCreator, (req, res, next) => {
    const {carId} = req.params;

    const newCarDetails = {
        brand: req.body.brand,
        model: req.body.model,
        licensePlate: req.body.licensePlate
    }

    Car.findByIdAndUpdate(carId, newCarDetails, {new: true})
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
router.delete('/cars/:carId', isCarCreator, (req, res, next) => {
    const {carId} = req.params;

    Car.findOneAndDelete(carId)
        .then(deletedCar => {
            return Client.findByIdAndUpdate(deletedCar.owner, {$pull: {cars: carId}})
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