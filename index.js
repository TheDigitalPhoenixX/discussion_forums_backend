const express =require("express")
const cors=require("cors")
var app  = express();
app.use(cors());
app.options('*', cors())
var apis=require("./app/app")
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


var jwt = require('jsonwebtoken');
var bcrypt=require('bcryptjs')
const auth=require('./middleware/auth')
const db = require("./app/models")
const port=process.env.PORT||8000;




db.sequelize.sync()
  .then((result) => {
    app.listen(port, () => {
      console.log('Server started');
    })
  })
  .catch((err) => {
    console.log(err);
  })


 app.get('/courses',auth, async (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    const result=  await apis.getCourses(req.user) 
    res.send(result)
})

app.get(`/courses/:courseId/discussions`,auth,async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  const {course,discussions}=  await apis.getDiscussions(req.params.courseId) 
  if(!course){
    res.status(404)
    res.send({error:"Course not found"})
    return;
  }
  res.send({course,discussions})
})


app.get('/user/:userId',auth,async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  const user=await apis.getUser(req.params.userId)
  if (!user){
    res.status(404)
    res.send({error:"user not found"})
    return;
  }
  res.send(user)
})


app.post(`/courses/:courseId/discussions`,auth,async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, POST, PUT")
  res.setHeader("Access-Control-Allow-Headers", "Origin", "Content-Type"," X-Auth-Token")
  console.log(req.user)
  const result=await  apis.createDiscussion(req.body,parseInt(req.params.courseId),req.user)
  res.statusCode=201
  res.send()
}
)

app.post(`/discussions/:discussionId/comments`,auth,async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  const result=await apis.createComment(req.body,parseInt(req.params.discussionId),req.user)
  res.statusCode=201
  res.send()
}
)

app.get(`/discussions/:discussionId/comments`,async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  const {discussion,comments}=  await apis.getComments(req.params.discussionId)
  if(!discussion){
    res.status(404)
    res.send({error:"Discssion not found"})
    return;
  }
  res.send({discussion,comments})
  // res.setHeader('Access-Control-Allow-Origin', '*');
  // const result= await apis.getComments(req.params.discussionId)
  // console.log(result)
  // res.send(result)
})

app.post('/login',async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
    // Get user input
    const email = req.body.email;
    const password=req.body.password;
    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
  const user = await apis.login(email,password)
  res.send(user)
});




app.post("/register", async (req, res) => {

  // Our register logic starts here
  try {
    // Get user input
    const { studentName, email, password } = req.body;

    // Validate user input
    if (!(email && password &&  studentName)) {
      res.status(400).send("All input is required");
    }
    encryptedPassword = await bcrypt.hash(password, 10);
 
    const user = await db.users.create({
      studentName,
      userRole:"Student",   
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      pwHash: encryptedPassword,
    });
    res.send(user)
  }
  catch(err){
    console.log(err);
  
  }

});