const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// ------ Controllers ------//
const { tripIndex, tripGet, tripUpdate, tripCreate, tripDelete} = require('../../controllers/trip');

// ------ Models ------ //
const Trip = require('../../models/Trip');

router.get('/', auth, tripIndex)
router.get('/:id', auth, tripGet)
router.patch('/:id', auth, tripUpdate);
router.delete('/:id', auth, tripDelete);
router.post('/', auth, tripCreate)

module.exports = router;