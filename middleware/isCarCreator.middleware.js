const Car = require('../models/Car.model');

module.exports = (req, res, next) => {
    const carId = req.params.carId;
    const userId = req.headers.currentuserid;

    Car.findById(carId)
        .then(carFound => {
            carFound.creator == userId ? next() : res.json({message: "You don't have permission to access this information."});
        })
}