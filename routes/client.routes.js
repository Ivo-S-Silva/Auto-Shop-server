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

//Get details of specific client
router.get('/clients/:clientId', isAuthenticated, (req, res, next) => {
    const {clientId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Client.findById(clientId)
        .populate('services')
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
router.put('/clients/:clientId', isAuthenticated, (req,res,next) => {
    const {clientId} = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    const newDetails = {
        name: req.body.name,
        fiscalNumber: req.body.fiscalNumber,
    }

    Client.findByIdAndUpdate(clientId, newDetails, {new: true})
    .then(updatedClient => res.json(updatedClient))
    .catch(error => {
        console.log("Error updating client details", error);
        res.status(500).json({
            message: "E",
            error: error
        });
    })
})

// Delete client data
router.delete('/clients/:clientId', isAuthenticated, (req,res,next) => {
    const {clientId} = req.params;
    const currentUserId = req.payload._id

    Client.findByIdAndRemove(clientId)
        .then(deletedClient => {
            return Service.deleteMany({_id: {$in: deletedClient.services}});
        })
        .then(() => {
            return User.findByIdAndUpdate(currentUserId, {$pull : {clients: clientId}})
        })
        .then(() => {
            res.json({message: `Client and all associated services was removed successfully.`})
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