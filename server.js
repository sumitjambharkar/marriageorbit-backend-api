const express = require('express')
const multer = require('multer')
const fs = require('fs')
const bodyParser = require('body-parser')
const nodemailer = require("nodemailer")
const fast2sms = require('fast-two-sms')
require("dotenv").config();

const port = process.env.PORT || 8000;
const bodyparser = require('body-parser')

const app = express()
const cors = require("cors")

app.use(bodyparser.urlencoded({ extended: false }))

app.use(bodyparser.json())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(__dirname + '/file')) {
      fs.mkdirSync(__dirname + '/file')
    }
    cb(null, "./file")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
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
  const { from, to, subject, message } = req.body
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    }
  })
  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: message
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
app.post("/resume", upload.array('attachments'), (req, res) => {
  let { email, name, position } = req.body
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
      user: process.env.USER,
      pass: process.env.PASS
    }
  })
  var mailOptions = {
    from: email,
    to: "marriageorbit@gmail.com",
    subject: "Resume",
    text: `I am ${name} This is my Resume Position ${position} Email id ${email}`,
    attachments: attachments
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

// End Send SMS Message

// Start Send OTP Message

app.post('/send-otp', (req, res) => {
  let radom = Math.floor(Math.random() * 900000) + 10000
  sendMessage(radom, req.body.number, res)
})
function sendMessage(radom, number, res) {
  var options = {
    authorization:process.env.FAST_SMS_API,
    message: `This Your OTP ${radom}`,
    numbers: [number],
  };

  // send this message

  fast2sms
    .sendMessage(options)
    .then((response) => {
      res.json({response,"otp":radom})
    })
    .catch((error) => {
      res.json(error)
    });
}
// End Send OTP Message

// Start Verify OTP Message

// End Verify OTP Message


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})