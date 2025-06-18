import express from "express"
import { db } from "./db.js";
import User from "./model/userModel.js";
import Post from "./model/postModel.js";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import upload from "./config/multerconfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) 
const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.use(cookieParser())

app.set('views', path.join(__dirname, 'views'));

db().catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
})

app.get('/', isLoggedIn, async(req, res) => {
    const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user")
    .lean();
    res.render('index',{posts:posts,user:req.user})
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/profile',isLoggedIn, async (req, res) => {
    const user = await User.findOne({email: req.user.email})
    const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
    console.log(user)
    res.render('profile',{user,posts})
})

app.get('/upload/file', (req, res) =>{
    res.render('uploadFile')
})

app.post('/upload', isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }); 

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.profilePicture = req.file.filename;
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


app.post('/register', async (req, res) => {
    const {name, username, email, age, password} = await req.body;

    let user = await User.findOne({email})
    if(user){
        return res.status(500).send('User already exists');
    }

    const newUser = new User({
        name,
        username,
        email,
        age, 
        password
    })

    await newUser.save()

  
    res.redirect("/login")
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(500).send('User not exists');
    }

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: user.email, userid: user._id }, "shhhh");
            res.cookie("token", token);
            res.redirect('/profile');
        } else {
            res.render('login'); 
        }
    });
});


app.get('/logout', (req, res) =>{
    res.cookie("token","")
    res.redirect("login")
})

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const data = jwt.verify(token, "shhhh");
    req.user = data;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
}


app.post('/create', isLoggedIn, async(req, res) =>{
   try {
    const user = await User.findOne({email: req.user.email})
    const {content} = req.body;
 
    const newPost = new Post({
     user: user._id,
     content: content
    })
 
    await newPost.save();
    user.posts.push(newPost._id)
    await user.save
      res.status(200).send("Post created successfully");
   } catch (error) {
     console.error("Error creating post:", err);
    res.status(500).send("Something went wrong");
   }
})

app.get('/like/:id',isLoggedIn, async (req,res) =>{
    const post = await Post.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
      post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }

    
    await post.save();
    res.redirect('/profile')
})

app.get('/like2/:id',isLoggedIn, async (req,res) =>{
    const post = await Post.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
      post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }

    
    await post.save();
    res.redirect('/')
})
app.get('/edit/:id',isLoggedIn, async (req,res) =>{
    const posts = await Post.findOne({_id: req.params.id}).populate("user");

     res.render('edit',{posts:posts})
})

app.post('/update/:id', isLoggedIn, async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, { content: req.body.content });
    res.redirect('/profile');
});

const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

export default app;  