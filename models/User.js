const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const Trip = require("./Trip");

const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error('Email is invalid');
        }
    }
  },
  age: {
      type: Number,
      validate(value){
          if(value < 0){
            throw new Error('Age must be a positive number.')
          } 
          if(value < 13){
              throw new Error('Sorry, you are too young to use this service')
          }
      }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(value){
        if(value.toLowerCase().includes('password')){
            throw new Error(`${value} is not a secure password`);
        }
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  avatar: {
      type: Buffer
  }
}, {
    timestamps: true
});

UserSchema.virtual('trips', {
    ref: 'Trip',
    localField: '_id',
    foreignField: 'owner'
});

UserSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
}

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user){
        throw new Error('Unable to login. Email/password combination is not correct')
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Unable to login. Email/password combination is not correct');
    }
    return user;
}

UserSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});


UserSchema.pre('remove', async function(next){
    const user = this;
    await Trip.deleteMany({ owner: user._id });
    next();
})

const User = mongoose.model("User", UserSchema)

module.exports = User;
