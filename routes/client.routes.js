const router = require("express").Router();

const { default: mongoose } = require("mongoose");
const Client = require("../models/Client.model");
const Service = require("../models/Service.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const User = require("../models/User.model");

//Create new client
router.post('/clients', isAuthenticated, (req, res, next) => {
    const {name, fiscalNumber, cars} = req.body;

    const newClient = {
        name,
        fiscalNumber,
        cars: {
            brand: cars.brand,
            model: cars.model,
            licensePlate: cars.licensePlate
        }
    }

    Client.create(newClient)
        .then(response => {
            const newClientId = response._id;
            return User.findByIdAndUpdate(req.payload._id, {$push: {clients: newClientId}}, {new: true});
        })
        .then(userFromDb => {
            return userFromDb.populate("clients");
        })
        .then(updatedUser => {
            return res.status(201).json(updatedUser.clients);
        })
        .catch(error => {
            console.log("Error creating new client.", error);
            res.status(500).json({
                message: "Error creating a new client.",
                error: error
            })
        })
})

//Get list of clients
router.get('/clients', isAuthenticated, (req,res,next) => {
    const currentUser = req.payload._id
    
    User.findById(currentUser)
        .populate("clients")
        .then(userFound => {
            res.json(userFound.clients);
        })
        .catch(error => {
            console.log("Error getting list of clients", error);
            res.status(500).json({
                message: "Error getting list of clients", 
                error: error
            })
        })
})



module.exports = router;