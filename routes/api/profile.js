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
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company; // populate all fields from req
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim());
    }
    // build profile social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.company = company;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id }); // need to use await when using mongoose methods because it returns a promise

      if (profile) {
        // update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route  GET api/profile
// @desc   get all profiles
// @access public
router.get('/', async (req, res) => {
  // don't need auth middleware for this one
  try {
    const profiles = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  GET api/profile/user/:user_id
// @desc   get profile by user id
// @access public
router.get('/user/:user_id', async (req, res) => {
  // don't need auth middleware for this one
  try {
    const profile = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
