module.exports = {
    protectAdmin: (req, res, next) => {
        if(req.isAuthenticated()){
            return next()
        }
        req.flash("error_msg", "Você precisa ser um administrador para acessar essa página")
        res.redirect("/")
    }
}