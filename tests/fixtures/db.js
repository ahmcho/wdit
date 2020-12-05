const mongoose = require('mongoose');

// ======= Models ====== 
const User = require('../../models/User');
const Trip = require('../../models/Trip');

// ====== Users ======
const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Nillbert',
    email: 'nillbert@nullingsworth.com',
    password: 'potatoes69420'
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: 'Mamed',
    email: 'mamedov@mamed.com',
    password: 'poopiedie20'
}

// ====== Trips ======
const tripOneId = new mongoose.Types.ObjectId();
const tripOne = {
    "geometry": {
        "type": "Point",
        "coordinates": [
            28.8575,
            47.00556
        ]
    },
    "rating": 1,
    "_id": tripOneId,
    "description": "Visited Marcesia",
    "location": "Chisinau,Moldova",
    "owner": userOne._id,
}

const tripTwoId = new mongoose.Types.ObjectId();
const tripTwo = {
    "geometry": {
        "type": "Point",
        "coordinates": [
            28.96028,
            41.01
        ]
    },
    "rating": 3,
    "_id": tripTwoId,
    "description": "Very first trip",
    "location": "Istanbul,Turkey",
    "owner": userTwo._id
}

const tripThreeId = new mongoose.Types.ObjectId();
const tripThree = {
    "geometry": {
        "type": "Point",
        "coordinates": [
            8.54,
            47.37861
        ]
    },
    "rating": 0,
    "_id": tripThreeId,
    "description": "Visited Elchin",
    "location": "Zurich,Switzerland",
    "owner": userOne._id,
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Trip.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Trip(tripOne).save();
    await new Trip(tripTwo).save();
    await new Trip(tripThree).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    tripOneId,
    tripOne,
    tripTwoId,
    tripTwo,
    tripThree,
    tripThreeId,
    setupDatabase
}