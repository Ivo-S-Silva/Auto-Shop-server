const router = require("express").Router();

const { default: mongoose } = require("mongoose");
const Client = require("../models/Client.model");
const Car = require("../models/Car.model");

const {isAuthenticated} = require("../middleware/jwt.middleware");
const User = require("../models/User.model");
const isClientCreator = require("../middleware/isClientCreator.middleware");

//Create new client
router.post('/clients', isAuthenticated, (req, res, next) => {
    const {name, fiscalNumber} = req.body;

    const newClient = {
        creator: req.payload._id,
        name,
        fiscalNumber
    }

    Client.findOne({fiscalNumber})
        .then(foundClient => {
            if (foundClient) {
                const customError = new Error();
                customError.name = "clientExists";
                customError.message = "A client with that fiscal number already exists.";
                throw customError; //we throw an error to break the promise chain (ie. to avoid going to the next .then() )
            }

            return Client.create(newClient);
        })
        .then(response => {
            return res.status(201).json(response);
        })
        .catch(error => {
            console.log("Error creating new client.", error);
            if(error.name === "clientExists"){
                res.status(400).json({message: error.message})
            } else {
            res.status(500).json({
                message: "Error creating a new client.",
                error: error
            })
        }
        })
})

//Get list of clients
router.get('/clients', isAuthenticated, (req,res,next) => {
    const currentUser = req.payload._id
    
    Client.find({creator: {$eq: currentUser}})
        .populate("cars")
        .then(response => res.json(response))
        .catch(error => {
            console.log("Error getting list of clients", error);
            res.status(500).json({
                message: "Error getting list of clients", 
                error: error
            })
        })
})

//Get details of specific client
router.get('/clients/:clientId', isAuthenticated, isClientCreator, (req, res, next) => {
    const {clientId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Client.findById(clientId)
        .populate('cars')
        .then(client => res.json(client))
        .catch(error => {
            console.log("Error getting the details of the client", error);
            res.status(500).json({
                message: "Error getting the details of the client",
                error: error
            });
        })
})

//Update client data
router.put('/clients/:clientId', isAuthenticated, isClientCreator,  (req,res,next) => {
    const {clientId} = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    const newDetails = {
        name: req.body.name,
        fiscalNumber: req.body.fiscalNumber,
    }

    Client.findOne({fiscalNumber})
        .then(foundClient => {
            if (foundClient) {
                const customError = new Error();
                customError.name = "clientExists";
                customError.message = "A client with that fiscal number already exists.";
                throw customError; //we throw an error to break the promise chain (ie. to avoid going to the next .then() )
            }

            return Client.findByIdAndUpdate(clientId, newDetails, {new: true})
        })
        .then(updatedClient => res.json(updatedClient))
        .catch(error => {
        console.log("Error updating client details", error);
        if(error.name === "clientExists"){
            res.status(400).json({message: error.message})
        } else {
        res.status(500).json({
            message: "Error updating client details",
            error: error
        });
    }
    })
})

// Delete client data
router.delete('/clients/:clientId', isAuthenticated, isClientCreator, (req,res,next) => {
    const {clientId} = req.params;
    const currentUserId = req.payload._id

    Client.findByIdAndRemove(clientId)
        .then(deletedClient => {
            return Car.deleteMany({_id: {$in: deletedClient.cars}});
        })
        .then(() => {
            res.json({message: `Client and all associated cars and services were removed successfully.`})
        })
        .catch(error => {
            console.log("Error removing client.", error);
            res.status(500).json({
                message: "Error removing client.",
                error: error
            });
        })
})

module.exports = router;