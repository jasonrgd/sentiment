module.exports = function (app) {
    console.log("hello");
    app.use(function (req, res, next) {
        res.setHeader("Permissions-Policy", "display-capture=*");
        res.setHeader("Content-Security-Policy", "frame-ancestors http://localhost:8730");
        next();
    });
};