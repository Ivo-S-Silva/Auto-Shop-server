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
    const {carId} = req.params.carId;


    Car.findById(req.params.carId)
        .then(carFound => {
            console.log(carFound)
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
        imageUrl: req.body.imageUrl,
        services: initialServices
    }

    Car.findOne({licensePlate: req.body.licensePlate})
        .then(foundCar => {
            if (foundCar) {
                const customError = new Error();
                customError.name = "carExists";
                customError.message = "A car with that license plate already exists.";
                throw customError; //we throw an error to break the promise chain (ie. to avoid going to the next .then() )
            }

            return Car.create(newCar);
        })
        .then(createdCar => {
            return Client.findByIdAndUpdate(clientId, {$push: {cars: createdCar._id}}, {new: true})
        })
        .then(() => res.status(201).json("Car created Successfully"))
        .catch(error => {
            console.log("Error creating new car for this client", error)
            if(error.name === "carExists"){
                res.status(400).json({message: error.message})
            } else {
            res.status(500).json({
                message: "Error creating new car for this client",
                error: error
            });
        }
        })
});

//Edit car details
router.put('/cars/:carId', isAuthenticated, isCarCreator, (req, res, next) => {
    const {carId} = req.params;
    let newBrand, newModel, newLicensePlate;

    if (req.body.brand) newBrand = req.body.brand;
    if (req.body.model) newModel = req.body.model;
    if (req.body.licensePlate) newLicensePlate = req.body.licensePlate;

    const newCarDetails = {
        brand: newBrand,
        model: newModel,
        licensePlate: newLicensePlate,
        imageUrl: req.body.imageUrl,
    }

    Car.findOne({licensePlate: req.body.licensePlate})
        .then(foundCar => {
                if (foundCar && foundCar._id != carId) {
                    const customError = new Error();
                    customError.name = "carExists";
                    customError.message = "A car with that license plate already exists.";
                    throw customError; 
                }
            return Car.findByIdAndUpdate(carId, newCarDetails, {new: true})
        })
        .then(updatedCar => res.json(updatedCar))
        .catch(error => {
            console.log("Error updating car details for this car.", error);
            if(error.name === "carExists"){
                res.status(400).json({message: error.message})
            } else {
            res.status(500).json({
                message: "Error updating car details for this car.",
                error: error
            });
        }
        })
})

//Delete car from specific client
router.delete('/cars/:carId', isCarCreator, (req, res, next) => {
    const {carId} = req.params;

    Car.findOneAndDelete({_id: carId})
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