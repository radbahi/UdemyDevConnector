const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // get auth middleware then add as paramater to get route
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profile/me
// @desc   get current user's profile
// @access private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      // find exact id of current user that is in token.
      user: req.user.id,
    }).populate('user', ['name', 'avatar']); // using populate also adds stuff from the corresponding file to the query. here we're bringing in the name and avatar
    if (!profile) {
      // if no profile found, return error below...
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile); //... else return profile
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
