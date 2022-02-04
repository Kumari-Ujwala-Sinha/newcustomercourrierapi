const Users = require('../models/userModel')
const Otp = require('../models/otpModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sendMail = require('./sendMail')

const {google} = require('googleapis')
const {OAuth2} = google.auth
const fetch = require('node-fetch')

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID)

const {CLIENT_URL} = process.env

const userCtrl = {
    register: async (req, res) => {
        try {
            const {name, email, password, phoneNo, profileImg, businessCustomer,businessName,gstNumber,panCardNo,adhaarCardNumber } = req.body
            
            if(!name || !email || !password || !phoneNo )
                return res.status(400).json({msg: "Please fill in all fields."})

            if(!validateEmail(email))
                return res.status(400).json({msg: "Invalid emails."})

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({msg: "This email already exists."})

            if(password.length < 6)
                return res.status(400).json({msg: "Password must be at least 6 characters."})

            const passwordHash = await bcrypt.hash(password, 12)

            const newUser = {
                name, email, password: passwordHash, phoneNo, profileImg, businessCustomer,businessName,gstNumber,panCardNo,adhaarCardNumber
            }

            const activation_token = createActivationToken(newUser)
            let otpcode = Math.floor(100000 + Math.random() * 900000)
            let otpData= new Otp({
                emailv:email,
                
                activation_tokenv:activation_token,
                code:otpcode,
                expireIn: new Date().getTime()+40000*1000
            })
           const otpdata = await otpData.save()
           

            const url = `${otpcode}`
            sendMail(email, url, "Verify your email address")


            res.json({msg: "Register Success! Please activate your email to start.",otp:otpcode})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req, res) => {
        try {
            const {otpverify_id,activation_token} = req
            
            const user = jwt.verify(activation_token, process.env.ACTIVATION_TOKEN_SECRET)

            const {name, email, password, phoneNo, profileImg, businessCustomer,businessName,gstNumber,panCardNo,adhaarCardNumber} = user

            const check = await Users.findOne({email})
            if(check) return res.status(400).json({msg:"This email already exists."})

            const newUser = new Users({
                name, email, password, phoneNo, profileImg, businessCustomer,businessName,gstNumber,panCardNo,adhaarCardNumber
            })

            await newUser.save()
            await Otp.findByIdAndDelete(otpverify_id)

            const access_token = createAccessToken({id: newUser._id})

            const refresh_token = createRefreshToken({id: newUser._id})
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7 days
            })

            res.json({msg: 'Register Success!',
            access_token,
            user: {
                ...newUser._doc,
                password: ''
            }})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    login: async (req, res) => {
        try {
            const {email, password} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "This email does not exist."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Password is incorrect."})
            const access_token = createAccessToken({id: user._id})

            const refresh_token = createRefreshToken({id: user._id})
            res.cookie('refreshtoken', refresh_token, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7 days
            })

            res.json({msg: 'Login Success!',
            access_token,
            user: {
                ...user._doc,
                password: ''
            }})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getAccessToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if(!rf_token) return res.status(400).json({msg: "Please login now!"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, async(err, result) => {
                if(err) return res.status(400).json({msg: "Please login now."})

                const user = await Users.findById(result.id).select("-password")
               
                if(!user) return res.status(400).json({msg: "This does not exist."})

                const access_token = createAccessToken({id: result.id})

                res.json({
                    access_token,
                    user
                })
            })

           
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const {email} = req.body
            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "This email does not exist."})

            const access_token = createAccessToken({id: user._id})
            let otpcode = Math.floor(100000 + Math.random() * 900000)
            let otpData= new Otp({
                emailv:email,
                
                activation_tokenv:access_token,
                code:otpcode,
                expireIn: new Date().getTime()+4000*1000
            })
           const otpdata = await otpData.save()
            const url = `${otpcode}`

            sendMail(email, url, "Reset your password")
            res.json({msg: "Re-send the password, please check your email."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    resetPassword: async (req, res) => {
        try {
            const {otpverify_id,emailv} = req
            const {password} = req.body
            console.log(password)
            const passwordHash = await bcrypt.hash(password, 12)

            await Users.findOneAndUpdate({email: emailv}, {
                password: passwordHash
            })
            await Otp.findByIdAndDelete(otpverify_id)

            res.json({msg: "Password successfully changed!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserInfor: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')

            res.json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUsersAllInfor: async (req, res) => {
        try {
            const users = await Users.find().select('-password')

            res.json(users)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshtoken', {path: '/user/refresh_token'})
            return res.json({msg: "Logged out."})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUser: async (req, res) => {
        try {
            const {name, email, phoneNo, profileImg, businessCustomer,homeAddress,officeAddress } = req.body
            await Users.findOneAndUpdate({_id: req.user.id}, {
                name, email, phoneNo, profileImg, businessCustomer,homeAddress,officeAddress
            })

            res.json({msg: "Update Success!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateUsersRole: async (req, res) => {
        try {
            const {role} = req.body

            await Users.findOneAndUpdate({_id: req.params.id}, {
                role
            })

            res.json({msg: "Update Success!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteUser: async (req, res) => {
        try {
            await Users.findByIdAndDelete(req.params.id)

            res.json({msg: "Deleted Success!"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}





function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

const createActivationToken = (payload) => {
    return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {expiresIn: '5m'})
}

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'})
}

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = userCtrl