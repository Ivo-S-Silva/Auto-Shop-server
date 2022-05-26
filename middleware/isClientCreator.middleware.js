const Client = require('../models/Client.model');

module.exports = (req, res, next) => {
    const clientId = req.params.clientId;
    const userId = req.headers.currentuserid


    Client.findById(clientId)
        .then(clientFound => {
            clientFound.creator == userId ? next() : res.json({message: "You don't have permission to access this information."});
        })
}