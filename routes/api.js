const router = require('express').Router();
const Post = require('../models/Post');


router.get('/posts', async (req,res)=>{
  const posts = await Post.find().populate('author','username');
  res.json(posts);
});


router.post('/posts', async (req,res)=>{
  const post = await Post.create(req.body);
  res.json(post);
});


router.put('/posts/:id', async (req,res)=>{
  const existing = await Post.findOne({ _id: req.params.id });
  if (!existing) return res.status(404).json({ error: 'Post not found' });
  

  const updateData = {};
  if (req.body.title !== undefined) updateData.title = req.body.title;
  if (req.body.body !== undefined) updateData.body = req.body.body;
  if (req.body.content !== undefined) updateData.body = req.body.content;
  
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id },
    updateData,
    { new: true }
  );
  res.json(post);
});


router.delete('/posts/:id', async (req,res)=>{
  await Post.findByIdAndDelete(req.params.id);
  res.json({msg:'deleted'});
});

module.exports = router;
