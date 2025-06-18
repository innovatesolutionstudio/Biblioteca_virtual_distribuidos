const express = require('express'); 
const router = express.Router();


router.get('/dashboard', (req, res) => {
  res.render('dashboard/dashboard', { session: req.session });
});


module.exports = router;
