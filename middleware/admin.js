module.exports = ((req, res, next) => {
    console.log(req.user);
    if(!req.user.is_admin) return res.status(401).send("you don't have permission to access that details.");
    next();
})