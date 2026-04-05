var compareModel  = require('../models/compare.model');

// GET /api/v1/compare?ids=1,2,3
let getCompareData = async (req, res) => {
  try {
    let { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ success: false, message: 'ids parameter is required (e.g., ?ids=1,2,3)' });
    }

    let partIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

    if (partIds.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 product IDs are required for comparison' });
    }
    if (partIds.length > 4) {
      return res.status(400).json({ success: false, message: 'Maximum 4 products can be compared at once' });
    }

    let parts = await compareModel.findPartsByIds(partIds);

    if (parts.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found' });
    }

    let specs = await compareModel.findSpecificationsByPartIds(partIds);

    let avgRatings = await compareModel.findAverageRatingsByPartIds(partIds);
    let reviews = await compareModel.findReviewsByPartIds(partIds);

    let compatibility = await compareModel.findCompatibilityByPartIds(partIds);

    // Nhóm dữ liệu theo part_id
    let result = parts.map(part => {
      let partSpecs = specs.filter(s => s.part_id === part.id);
      let partRating = avgRatings.find(r => r.part_id === part.id) || {
        review_count: 0, avg_rating: 0,
        star_5: 0, star_4: 0, star_3: 0, star_2: 0, star_1: 0
      };
      let partReviews = reviews.filter(r => r.part_id === part.id);
      let partCompatibility = compatibility.filter(c => c.part_id === part.id);

      return {
        ...part,
        specifications: partSpecs,
        rating_summary: partRating,
        reviews: partReviews,
        compatible_vehicles: partCompatibility
      };
    });

    // Lấy tất cả spec names duy nhất để tạo bảng so sánh
    let allSpecNames = [...new Set(specs.map(s => s.spec_name))].sort();

    // Lấy tất cả xe duy nhất
    let allVehicles = [...new Map(
      compatibility.map(c => [
        `${c.brand_name}-${c.model_name}-${c.year}`,
        { brand_name: c.brand_name, model_name: c.model_name, year: c.year }
      ])
    ).values()].sort((a, b) => 
      a.brand_name.localeCompare(b.brand_name) || 
      a.model_name.localeCompare(b.model_name) || 
      a.year - b.year
    );

    res.json({
      success: true,
      data: {
        parts: result,
        all_spec_names: allSpecNames,
        all_vehicles: allVehicles
      }
    });
  } catch (error) {
    console.error('Compare error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCompareData };
