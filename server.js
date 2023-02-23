const express = require('express')
const multer = require('multer')
const fs = require('fs')
const bodyParser = require('body-parser')
const nodemailer = require("nodemailer")
const textflow = require("textflow.js");
require("dotenv").config();
const cors = require("cors")
const app = express()
const port = process.env.PORT || 8000;

textflow.useKey(process.env.TEXTFLOW_API);

const storage = multer.diskStorage({
  destination:function (req,file,cb) {
    if (!fs.existsSync(__dirname + '/file')) {
      fs.mkdirSync(__dirname + '/file')
    }
    cb(null, "./file")
  },
  filename:function(req,file,cb) {
    cb(null,file.originalname)
  }
})

const upload = multer({ storage: storage })

app.use(express.json())
app.use(cors())
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.json("Hello World");
});

// Start send email message
app.post("/send-email", function (req, response) {
  const {from,to,subject,message} = req.body
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user:process.env.USER,
      pass:process.env.PASS
    }
  })
  var mailOptions = {
    from:from,
    to:to,
    subject:subject,
    text:message
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log("Email Sent: " + info.response)
    }
    response.redirect("/")
  })
})
// End send Email message

// Start Upload Resume
app.get("/resume", upload.array('attachments'),(req, res) => {
  let {email,name,position} = req.body
  let attachments = []
  for (let i = 0; i < req.files.length; i++) {
    let fileDetails = {
      filename: req.files[i].filename,
      path: req.files[i].path
    }
    attachments.push(fileDetails)
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user:process.env.USER,
      pass:process.env.PASS
    }
  })
  var mailOptions = {
    from:email,
    to:"marriageorbit@gmail.com",
    subject:"Resume",
    text:`I am ${name} This is my Resume Position ${position} Email id ${email}`,
    attachments:attachments
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log("Email Sent: " + info.response)
    }
    res.json("Done")
  })

})
// End Upload Resume

// Start Send SMS Message
app.post("/send-message", async (req, res) => {
  const {number,email} = req.body
  const message = `Congratulations, your account has been successfully created. Marriageorbit.com This is Your Email Id ${email}`
  let result = await textflow.sendSMS(`+91${number}`,message);
  if (result.ok) {
      return res.status(result.status).json(result.message)
  }else{
      return res.status(result.status).json(result.message)
  }
})
// End Send SMS Message

// Start Send OTP Message
app.post("/send-otp", async (req, res) => {
  const { number } = req.body
  const verificationOptions = {
      "service_name": "Hey Cool",
      "seconds": 600
  }
  const result = await textflow.sendVerificationSMS(`+91${number}`, verificationOptions);
  if (result.ok) {
      return res.status(result.status).json(result.message)
  } else {
      return res.status(result.status).json(result.message)
  }
})
// End Send OTP Message

// Start Verify OTP Message
app.post("/verify-otp", async (req, res) => {
  const { number, code } = req.body
  let result = await textflow.verifyCode(`+91${number}`, code);
  if (result.valid) {
      return res.status(result.status).json(result.message)
  } else {
      return res.status(result.status).json(result.message)
  }
})
// End Verify OTP Message

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})