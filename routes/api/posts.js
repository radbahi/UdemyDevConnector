const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  POST api/posts
// @desc   create a post
// @access private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password'); // .select('-password) is used to not send back password. better security.

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  }
);

// @route  GET api/posts
// @desc   get all posts
// @access private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); // date: -1 sorts by most recent
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// @route  GET api/post/:id
// @desc   get post by id
// @access private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      // if the kind of error is an ObjectId error, meaning an invalid id instead of just no id, return below
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send(err.message);
  }
});

// @route  DELETE api/post/:id
// @desc   DELETE post by id
// @access private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      // if the kind of error is an ObjectId error, meaning an invalid id instead of just no id, return below
      return res.status(404).json({ msg: 'Post not found' });
    }
    // check user
    if (post.user.toString() !== req.user.id) {
      // req.user.id is a string and post.user is not, so we need to called toString() to make it match
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      // if the kind of error is an ObjectId error, meaning an invalid id instead of just no id, return below
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send(err.message);
  }
});

// @route  PUT api/post/like/:id
// @desc   like a post
// @access private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // check if post already liked
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length >
      0
      // if statement works like this: filter post's likes array for users that clicked on like. if result of filter is greater than 0, that means user is already in array and therefore already liked the post
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// @route  PUT api/post/unlike/:id
// @desc   unlike a post
// @access private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // check if post already unliked
    if (
      post.likes.filter((like) => like.user.toString() == req.user.id).length ==
      0
      // if statement works like this: filter post's likes array for users that clicked on like. if result of filter is = to 0, that means user is not in array and therefore didn't like the post
    ) {
      return res.status(400).json({ msg: 'Post not liked' });
    }
    // get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// @route  POST api/posts/comment/:id
// @desc   comment on a post
// @access private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password'); // .select('-password) is used to not send back password. better security.
      const post = await Post.findById(req.params.id);

      const newComment = {
        // comment is not actual mongodb collection, so this is just an object
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send(err.message);
    }
  }
);

// @route  DELETE api/posts/comment/:id/:comment_id
// @desc   delete comment on a post
// @access private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // get comment from post
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // get remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

module.exports = router;
