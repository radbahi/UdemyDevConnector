const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
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

// @route  DELETE api/profile
// @desc   delete profile, user, and posts
// @access private
router.delete('/', auth, async (req, res) => {
  // don't need auth middleware for this one
  try {
    //@todo remove user's posts
    // will remove profile
    await Profile.findOneAndRemove({
      user: req.user.id,
    });
    // will remove user
    await User.findOneAndRemove({
      _id: req.user.id,
    });

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  PUT api/profile/experience
// @desc   add profile experience
// @access private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      to,
      from,
      current,
      description,
    } = req.body;

    const newExp = {
      // make an object with the above attributes
      title,
      company,
      location,
      to,
      from,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp); // we use unshift to put most recent experience first
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route  DELETE api/profile/experience/:exp_id. every experience has their own id
// @desc   delete profile experience
// @access private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // get remove index
    const removeIndex = profile.experience // go into profile's experience
      .map((item) => item.id) // map through the experiences
      .indexOf(req.params.exp_id); // get the index of the experience matching the experience's id

    profile.experience.splice(removeIndex, 1); // remove the index from the experience array
    await profile.save(); // save profile
    res.json(profile); // return profile as response
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  PUT api/profile/education
// @desc   add profile education
// @access private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('from', 'From date is required').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      to,
      from,
      current,
      description,
    } = req.body;

    const newEdu = {
      // make an object with the above attributes
      school,
      degree,
      fieldofstudy,
      to,
      from,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu); // we use unshift to put most recent experience first
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route  DELETE api/profile/education/:edu_id. every education has their own id
// @desc   delete profile education
// @access private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    // get remove index
    const removeIndex = profile.education // go into profile's education
      .map((item) => item.id) // map through the educations
      .indexOf(req.params.edu_id); // get the index of the education matching the education's id

    profile.education.splice(removeIndex, 1); // remove the index from the education array
    await profile.save(); // save profile
    res.json(profile); // return profile as response
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  GET api/profile/github/:username
// @desc   get user repos from github
// @access public
// NOT WORKING PROPERLY WHEN SENDING REQUEST VIA POSTMAN https://www.udemy.com/course/mern-stack-front-to-back/learn/lecture/14555408#questions
router.get('/github/:username', (req, res) => {
  try {
    const options = {
      // remember that this is an object and to not define the attributes as variables
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }, // needed as there were issues without using this header
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
