const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
    description:{
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(value) {
                return !value.includes('true') && !value.includes('false');
            },
            message: props => `${props.value} is not a string value!`
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    location:{
        type: String,
        required: false,
        validate:{
            validator: function(value) {
                return !value.includes('true')
            },
            message: props => `${props.value} is not a string value!`
        }
    },
    geometry:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rating: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
})

TripSchema.index({ geometry: '2dsphere'});

const Trip = mongoose.model('Trip', TripSchema);
module.exports = Trip;