var express = require("express")

exports.checkSession = (req,res,next) => {
    if(!req.header('x-admin-token')){
        return res.status(404).send({message: "Unauthorized"})
    }
    next()
}