module.exports = ((req, res, next) => {
    res.mid_id = false;
    if(req.user.is_admin)
        res.mid_id = true;
    else
        res.mid_id = req.user.id;
    next();
})