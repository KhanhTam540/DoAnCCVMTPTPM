var express  = require('express');
let router = express.Router();
var bookingModel  = require('../models/booking.model');
var { verifyToken }  = require('../middlewares/auth');

router.get('/garages', async (req, res) => {
  try {
    let garages = await bookingModel.getAllGarages();
    res.json(garages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    let result = await bookingModel.createBooking({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ message: 'Đặt lịch thành công', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    let userId = req.user.id;
    let bookings = await bookingModel.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;