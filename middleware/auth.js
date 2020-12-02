const passport = require("passport");
const User = require('../models/User');

const auth = async (req,res, next) => {
    
    passport.authenticate("jwt", { session: false }, async (err,token) => {
            if(err || !token){
                return res.status(401).send({
                    error: true,
                    message: 'Unauthorized access!'
                })
            }
            try {
                const user = await User.findOne({
                    _id: token._id
                })
                req.user = user;
                next();
            } catch (error) {
                res.status(401).send({
                    error: true,
                    message: 'Unauthorized access!'
                })
            }
    })(req,res,next);
}
module.exports = auth;