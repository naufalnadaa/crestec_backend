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

exports.login = (req,res) => {
    tUsers.findOne({
        where: 
        {email: {[Op.eq]: req.body.email}, deleted: {[Op.eq]: 0}}
    }).then(data => {
        if(data){
            
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error while login"
        })
    })

}

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
    tUsers.findAll({ where: {deleted: {[Op.eq]: 0}} })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};
// Find a single Tutorial with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    Tutorial.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Cannot find Tutorial with id=${id}.`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving Tutorial with id=" + id
            });
        });
};
// Update a Tutorial by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;
    Tutorial.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Tutorial was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Tutorial with id=" + id
            });
        });
};
// Delete a Tutorial with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;
    Tutorial.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Tutorial was deleted successfully!"
                });
            } else {
                res.send({
                    message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete Tutorial with id=" + id
            });
        });
};
// Delete all Tutorials from the database.
exports.deleteAll = (req, res) => {
    Tutorial.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} Tutorials were deleted successfully!` });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all tutorials."
            });
        });
};
// Find all published Tutorials
exports.findAllPublished = (req, res) => {
    Tutorial.findAll({ where: { published: true } })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};