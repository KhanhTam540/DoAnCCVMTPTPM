var yearModel  = require('../models/year.model');

// GET /api/v1/years/:id/compatibility
let getCompatibleParts = async (req, res) => {
  try {
    let parts = await yearModel.findPartsByModelYearId(req.params.id);
    res.json({ success: true, data: parts });
  } catch (error) {
    console.error('Get compatible parts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCompatibleParts };
