const User = require('../models/User.model');

module.exports = (req, res, next) => {
    const clientId = req.params.clientId;
    const userId = req.payload._id;

    User.findById(userId)
        .then(userFound => {
            const isCreator = userFound.clients.find(client => client === clientId);
            console.log(isCreator);
            isCreator ? next() : res.json({message: "You don't have permission to access this information."});
        })
}