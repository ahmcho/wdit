const crypto = require('crypto');
const User = require('../models/User');
const Trip = require('../models/Trip');
const jwt = require("jsonwebtoken");
const {sendWelcomeEmail, sendCancellationEmail,sendResetPasswordEmail, sendPasswordChangedEmail} = require('../emails');

module.exports = {
    async getUser(req, res, next) {
        res.send(req.user);
    },
    async getUserTrips(req,res,next){
        const _id = req.params.id;
        try {
            const userTrips = await Trip.find({ owner: _id});
            res.status(200).send({ 
                error: false,
                message: 'Found trips',
                data: userTrips
            });
        } catch (error) {
            res.status(400).send({
                error: true,
                message: error.message
            });
        }
    },
    async createUser(req, res, next) {
        const user = new User(req.body);
        let message;
        try {
            await user.save();
            res.status(201).send({ 
                error: false,
                messsage: 'User created successfully',
                data: {user} 
            });
            sendWelcomeEmail(user.email, user.name);
        } catch (err) {
            if(err.message.includes("duplicate") && err.message.includes("email")){
              message = "This email is already in use"  
            } 
            res.status(400).send({
                error: true,
                message: message || err.message
            });
        }
    },
    async loginUser(req, res, next) {
        try {
            const user = await User.findByCredentials(req.body.email, req.body.password);
            const payload = {
                id: user._id,
                name: user.name
            }
            //Send token in response
            jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 31556926}, (err, token) => {
                res.status(200).send({ 
                    error: false,
                    message:'Logged in',
                    data: `Bearer ${token}` 
                });  
            })
        } catch (error) {
            res.status(400).send({ 
                error: true,
                message: error.message 
            })
        }
    },
    async updateUser(req, res, next){
        const _id = req.params.id;
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name','email'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
        if(!isValidOperation){
            return res.status(400).send({
                error: true,
                message: 'Invalid updates!'
            });
        }
    
        try {
            updates.forEach((update) => req.user[update] = req.body[update]);
            await req.user.save();
            res.send({
                error: false,
                message: 'Updated successfully',
                data: req.user.name
            });
        } catch (error) {
            res.status(400).send({
                error: true,
                message: error.message
            });
        }
    },
    async deleteUser(req, res, next){
        try {
            await req.user.remove();
            sendCancellationEmail(req.user.email, req.user.name);
            res.send({ 
                error: false,
                message: 'User is deleted'
            })
        } catch (error) {
            res.send({
                error: true,
                message: error.message
            })
        }
    },
    async forgotPassword(req,res,next){
        const token = await crypto.randomBytes(20).toString('hex');
        const { email } = req.body;
        const  host  = process.env.PROD_URL
        
        const user = await User.findOne({ email });
        
        if (!user) {
			return res.status(404).send({
                error: true,
                message: 'User not found'
            });
        }

        user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        sendResetPasswordEmail(email, host, token);
        res.send({ 
            error: false,
            message: 'Reset instructions successfully sent to your email'
        })
    },
    async resetPassword(req, res, next){
        try {
            const resetPasswordToken = req.params.token;
            const {password, confirm} = req.body;
            const user = await User.findOne({resetPasswordToken, resetPasswordExpires: { $gt: Date.now() }});
            if(user){
                if(password === confirm){
                    user.password = password;
                    user.resetPasswordToken = null;
                    user.resetPasswordExpires = null;
                    await user.save();
                    res.send({
                        error: false,
                        message: 'Password update was successful. We\'ve sent you a confirmation email as well.'
                    });
                    sendPasswordChangedEmail(user.email)
                    return next();
                }
            }
            return res.status(404).send({
                error: true,
                message: 'Reset token is wrong or expired. Please, request a new token.'
            })
        } catch (error) {
            res.status(500).send({
                error: true,
                message: error.message
            })
        }
    }
}