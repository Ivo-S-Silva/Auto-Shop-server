const router = require("express").Router();
const Client = require("../models/Client.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const isClientCreator = require("../middleware/isClientCreator.middleware");
const Car = require("../models/Car.model");


//Create new service
router.post('/clients/:clientId/:carId/services', isAuthenticated, isClientCreator, (req, res, next) => {
    const {carId} = req.params;

    const newService = {
        serviceDate: req.body.serviceDate,
        serviceDetails: req.body.serviceDetails,
    }

    Car.findByIdAndUpdate(carId, {$push: {services: newService}}, {new: true})
        .then(updatedCar => res.status(201).json("Service created successfully."))
        .catch(error => {
            console.log("Error creating new service for this car", error)
            res.status(500).json({
                message: "Error creating new service for this car",
                error: error
            });
        })
})

//Update service
router.put('/clients/:clientId/:carId/:serviceId', isAuthenticated, isClientCreator, (req, res, next) => {
    const {carId, serviceId} = req.params;
    const {serviceDate, serviceDetails, serviceStatus} = req.body;



    Car.findOneAndUpdate({_id: carId, "services._id": serviceId},{$set: {"services.$.serviceDate": serviceDate, "services.$.serviceDetails": serviceDetails, "services.$.serviceStatus": serviceStatus}}, {new: true})
        .then(updatedCar => {
            res.status(201).json(updatedCar)
        })
        .catch(error => {
            console.log("There was an error updating the service information", error);
            res.status(500).json({
                message: "There was an error updating the service information",
                error: error
            })
        })
})

//Delete service
router.delete('/clients/:clientId/:carId/:serviceId', isAuthenticated, isClientCreator, (req, res, next) => {
    const {carId, serviceId} = req.params;

    Car.findOneAndUpdate({_id: carId}, {$pull: {services: {_id: serviceId}}}, {new: true})
        .then(updatedCar => {
            res.status(201).json(updatedCar);
        })
        .catch(error => {
            console.log("There was an error deleting the service information", error);
            res.status(500).json({
                message: "There was an error deleting the service information",
                error: error
            })
        })
})


module.exports = router;