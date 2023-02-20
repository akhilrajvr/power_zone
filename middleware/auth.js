
module.exports = {

    adminSession: (req, res, next) => {
        if (req.session.adminLogin) {
            next()
        }
        else {
            res.redirect('/Admin')
        }
    },

    userSession: (req, res, next) => {
        if (req.session.userlogin) {
            next()
        }
        else {
            res.redirect('/') 
        }
    }

  
};

  
