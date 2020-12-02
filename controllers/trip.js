const Trip = require('../models/Trip');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_API_KEY;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

module.exports = {
    async tripIndex(req,res,next) {
        const id = req.user._id;
        const trips = await Trip.find({ owner: id}).populate('owner','name').exec();
        if(trips.length === 0){
            return res.status(404).send({
                error: true,
                message: 'No trips for this user'
            });
        }
        res.status(200).json({
            error: false,
            message: 'Found trips',
            data: trips
        })
    },
    async tripCreate (req, res, next){
        const trip = await new Trip({ ...req.body, owner: req.user._id })
        if(req.body.location && typeof req.body.location === 'string'){
            let response = await geocodingClient.forwardGeocode({
                query: req.body.location,
                limit: 1
            }).send();
            trip.geometry = response.body.features[0].geometry;
            try {
                await trip.save();
                return res.status(201).send({
                    error: false,
                    message: 'Trip successfully created!',
                    data: trip
                });
            } catch (error) {
                return res.status(400).send({
                    error: true,
                    message: error.message
                });
            }
        }
        return res.status(400).send({ 
            error: true,
            message: 'Location must be provided as a string value'
        });
        
    },
    async tripGet(req, res) {
        const id = req.params.id;
        try {
            const foundTrip = await Trip.findById(id).populate('owner','name').exec();
            if(!foundTrip){
                return res.status(404).send({ 
                    error:true,
                    message: "Not found!" 
                })
            }
            res.status(200).send({
                error: false,
                message: "Trip found!",
                data: foundTrip
            })
        } catch (error) {
            res.status(500).send();
        }
    },
    async tripUpdate(req,res,next){
        const userId = req.user._id;
        const id = req.params.id;
        const updates = Object.keys(req.body);
        const allowedUpdates = ['rating','date','description'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update))
        if(!isValidOperation){
            return res.status(400).send({ 
                error: true,
                message: 'Invalid updates!'
            })
        }
        try {
            const trip = await Trip.findOne({_id: id, owner: userId});
            if(!trip){
                return res.status(404).send({ 
                    error: true,
                    message: 'Not found!'
                })
            }
            updates.forEach( update => trip[update] = req.body[update])
            await trip.save();  
            res.status(200).send({ 
                error: false,
                message: 'Updated successfully',
                data: req.body
            });

        } catch (error) {
            res.status(400).send({ 
                error: true,
                message: error.message
            })
        }
    },
    async tripDelete(req, res,next){
        const userId = req.user._id;
        const id = req.params.id;
        try {
            const foundTrip = await Trip.findOne({_id: id, owner: userId});
            if(!foundTrip){
                return res.status(404).send({ 
                    error:true, 
                    message: "Not found!" })
            }
            await foundTrip.remove();
            res.status(200).send({
                error: false,
                message: "Trip deleted!",
            })
        } catch (error) {
            res.status(500).send();
        }

    }
}