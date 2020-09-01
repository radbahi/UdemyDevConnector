const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // get auth middleware then add as paramater to get route
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

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

// @route  POST api/profile
// @desc   create or update user profile
// @access private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ], // need these middlewares to authorize and to require status and skills
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // check if any errors
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twiiter,
      instagram,
      linkedin,
    } = req.body;
  }
);

module.exports = router;
