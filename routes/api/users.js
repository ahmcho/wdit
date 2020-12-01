const express = require("express");
const router = express.Router();
const auth = require('../../middleware/auth');


// ------ Controllers ------ //
const { 
    getUser,
    getUserTrips, 
    createUser, 
    loginUser, 
    updateUser, 
    deleteUser,
    forgotPassword,
    resetPassword,
} = require('../../controllers/user');

// ------ Routes ------ //
router.get('/me', auth, getUser)
router.get('/:id/trips', getUserTrips);
router.post('/register', createUser)
router.post('/login', loginUser);
router.patch('/me',  auth, updateUser)
router.delete('/me', auth, deleteUser)
router.post('/forgot', forgotPassword);
router.put('/reset/:token', resetPassword)

module.exports = router;