const db = require("../../models");
const tUsers = db.users
const Op = db.Sequelize.Op;
const bcrypt = require('bcryptjs')
const crypto = require("crypto");
const sendMail = require("../../utils/email");

exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.username || !req.body.password || !req.body.email) {
        res.status(400).send({
            message: "Parameter tidak lengkap!"
        });
        return;
    }

        // let user = await tUsers.findOne({ email: req.body.email })
        // if (user.email == req.body.email) {
        //     return res.status(400).send("Email already exist!")
        // }

    const dataCreate = {
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
        token: crypto.randomBytes(32).toString("hex")
    };

    const result = await tUsers.create(dataCreate)
    const messages = `${process.env.BASE_URL}/user/verify/${result.username}/${result.token}`
    const html_email =
        `
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
        </head>
        <body>
            <div style="background-color:#C5E6E2; padding-top:20px;padding-bottom:20px">
                <h2 style="text-align:center">Job Request Assistant</h2>
                <div style="width:400px; height:400px; background-color:white; padding:20px; display:block; margin-left:auto; margin-right:auto;">
                    <h2>Halo!</h2>
                    <p style="font-size:14px">
                        Anda menerima email ini karena kami telah menerima
                        permintaan verifikasi email pada akun Anda. 
                    </p>
                    <button style="display:block; margin-left:auto; margin-right:auto; width:200px; height:50px; background-color:#494B4A; border-radius:10px"><a href=${messages} style="text-decoration:none; color:white; font-size:14px;">Klik Disini Untuk Verifikasi</a></button>
                    <h5 style="font-size:14px">Salam,<br/>Admin Job Request Assistant</h5>
                </div>
            </div>
        </body>
    `

    if (result) {
        res.send(result)
        await sendMail(result.email, "Verify Email", html_email)
        res.send("An Email sent to your account please verify")
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const user = await tUsers.findOne({
            where: {
                username: { [Op.eq]: req.params.username },
                token: { [Op.eq]: req.params.token },
                deleted: { [Op.eq]: 0 }
            }
        })
        if (!user) {
            return res.status(400).send("<h1>(404) Error Not Found!</h1>")
        }

        user.set({
            email_verified: true,
            token: null
        })

        const result2 = await user.save()
        res.status(200).render('index')
    } catch (error) {
        res.status(400).send({ message: "An error occured", error })
    }
}

exports.login = async (req, res) => {
    const user = await tUsers.findOne({
        where: {
            username: { [Op.eq]: req.body.username },
            email_verified: { [Op.eq]: 1 },
            deleted: { [Op.eq]: 0 }
        }
    })

    if (!user) {
        return res.status(404).send({ message: "User not found!" })
    }

    const isPassword = bcrypt.compare(req.body.password, user.password)
    if (!isPassword) {
        return res.status(404).send({ message: "Invalid Password" })
    } else {
        return res.status(200).send({ message: "Valid Password" })
    }
}

exports.forget = async (req, res) => {
    try {
        const result = await tUsers.findOne({
            where: {
                email: { [Op.eq]: req.body.email },
                email_verified: { [Op.eq]: 1 },
                deleted: { [Op.eq]: 0 }
            }
        })

        if (!result) {
            return res.status(400).send({ message: "Email not found!" })
        }

        const messages = `${process.env.BASE_URL}/user/reset/${result.username}/${result.email}`
        const html_email =
            `
            <div style="background-color:#C5E6E2; padding-top:20px;padding-bottom:20px">
                <h2 style="text-align:center">Job Request Assistant</h2>
                <div style="width:400px; height:400px; background-color:white; padding:20px; display:block; margin-left:auto; margin-right:auto;">
                    <h2>Halo!</h2>
                    <p style="font-size:14px">
                        Anda menerima email ini karena kami telah menerima
                        permintaan pemulihan kata sandi pada akun Anda. 
                    </p>
                    <button style="display:block; margin-left:auto; margin-right:auto; width:200px; height:50px; background-color:#494B4A; border-radius:10px"><a href=${messages} style="text-decoration:none; color:white; font-size:14px;">Klik Disini Untuk Ubah Kata Sandi</a></button>
                    <h5 style="font-size:14px">Salam,<br/>Admin Job Request Assistant</h5>
                </div>
            </div>
        `

        if (result) {
            res.send(result)
            await sendMail(result.email, "Verify Email", html_email)
            res.send("An Email sent to your account please verify")
        }
    } catch (error) {
        res.send(error)
    }
}

exports.verifyForget = async (req, res) => {
    try {
        const user = await tUsers.findOne({
            where: {
                username: { [Op.eq]: req.params.username },
                email: { [Op.eq]: req.params.email },
                deleted: { [Op.eq]: 0 }
            }
        })
        if (!user) {
            return res.status(400).send("<h1>(404) Error Not Found!</h1>")
        }

        let link = `http://localhost:3000/reset-password?email=${user.email}`

        res.status(200).render('reset_success', { link: link })
    } catch (error) {
        res.status(400).send({ message: "An error occured", error })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const user = await tUsers.findOne({
            where: {
                email: { [Op.eq]: req.query.email },
                deleted: { [Op.eq]: 0 }
            }
        })
        if (!user) {
            return res.status(400).send("<h1>(404) Error Not Found!</h1>")
        }
        const dataUpdate = {
            password: bcrypt.hashSync(req.body.password, 8)
        }
        const whereClause = {
            where: {
                email: { [Op.eq]: req.query.email },
                deleted: { [Op.eq]: 0 }
            }
        }
        const result = await tUsers.update(dataUpdate, whereClause)
        if (!result) {
            return res.status(404).send("<h1>(404) Update Failed!</h1>")
        }
        return res.status(200).send(result)
    } catch (error) {
        return res.status(400).send({ message: "An error occured", error })
    }
}