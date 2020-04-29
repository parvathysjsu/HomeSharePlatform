//Author: Yul Choi
//Calculator App
//index.js

var express = require('express');
var app = express();
var crypto = require('crypto');
const mysql = require('mysql');


// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    //password : '1234',
    database : 'home_share_platform'
});

// Connect
db.connect((err) => {
    if (err) {
        console.log(err);
        throw err;
    } else {
        console.log('MySql Connected');
    }
});

var bodyParser = require('body-parser');
var session = require('express-session');
var cors = require('cors');
app.set('view engine', 'ejs');
const fileUpload = require('express-fileupload');

//use cors to allow cross origin resource sharing
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

//use express session to maintain session data
app.use(session({
    secret              : '226_homeshare',
    resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration            : 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration      :  5 * 60 * 1000,
}));

// app.use(bodyParser.urlencoded({
//     extended: true
//   }));
app.use(bodyParser.json({
    extended: true,
    limit: '50mb'
}));
app.use(fileUpload());

//Allow Access Control
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var loggedInUserid = -1;
var acctTypeGlobal = "no";



//Get Home (list of classes)
app.get('/home', function(req,res) {
    console.log("Inside Home (list of classes");
    console.log("Getting course list for: ", req.body);
});

var myuserid;
//Route to handle Post Request Call
app.post('/login', function(req,res) {
    console.log("Inside Login Post Request");
    console.log("Req Body : ", req.body);
    let inputUsername = req.body.username;
    let inputPassword = req.body.password;
    let acctType = req.body.acctType

    let sql = ``;
    if (acctType == "admin") {

    } else if (acctType == "host") {
    	sql = `SELECT * FROM host WHERE Email_addr = '${inputUsername}'`
    } else if (acctType == "guest") {
    	sql = `SELECT * FROM guests WHERE Email_addr = '${inputUsername}'`
    } else {
    	console.log("Error1");
    }



    //let sql = `SELECT * FROM user WHERE username = '${inputUsername}' and password = '${inputPassword}'`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        console.log(result.length + "," + result);
        if (err) {
            throw err;
        } else if (result.length > 0) {
            console.log(result);
		    let hash1 = crypto.createHash('sha512');
		    let hash2 = crypto.createHash('sha512');
		    hash1.update(inputPassword);
		    hash2.update(hash1.digest('hex'));
		    const encrypted = hash2.digest('hex');
		    if(encrypted === result[0].Password_encrypted){
		        hash1 = undefined;
		        hash2 = undefined;
		        req.session.user = {username: inputUsername, authorization: result[0].authorization};
	            res.cookie('cookie',"admin",{maxAge: 900000, httpOnly: false, path : '/', userid: result[0].userid});
	            res.writeHead(200,{
	                'Content-Type' : 'text/plain'
	            })
	            //loggedInUserid = result[0].userid;
	            acctTypeGlobal = acctType;
	            //myuserid = result[0].userid;
	            //console.log("Userid set: ", result[0].userid);
	            console.log("accttype: ", acctTypeGlobal);
	            //^ this makes line below unneccesary
	            //res.write(JSON.stringify(result[0].userid));
	            res.send();
		    } else {
		    	console.log('Credentials not found!');
	            res.writeHead(201,{
	                'Content-Type' : 'text/plain'
	            })
		        res.send();
		    }

        } else {
            
        }
    })
});

//Logout User
app.get('/logout', function(req, res) {
    loggedInUserid = -1;
    acctTypeGlobal = "no";
    console.log("Userid reset!");
    res.end();
});

//Signup New User
app.post('/signup', function(req, res) {
    console.log("Inside Signup Request");
    console.log("Req Body : ", req.body);
    let inputUsername = req.body.username;
    let inputPassword = req.body.password;
    let inputAuthorization = req.body.authorization;
    let acctType = req.body.acctType;
    let password = req.body.password;
    let phone = req.body.phone;
    let email = req.body.email;
    let fname = req.body.fname;
    let lname = req.body.lname;
    let gender = req.body.gender;

    let sql = ``;
    if (acctType == "admin") {
    	console.log("test");
    } else if (acctType == "host") {
    	sql = `INSERT INTO host SET ?`;
    } else if (acctType == "guest") {
    	sql = `INSERT INTO guests SET ?`;
    } else {
    	console.log("Error");
    	res.send("Acct Type Error");
    }

    let extra = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
      extra += possible.charAt(Math.floor(Math.random() * possible.length));

    let hash1 = crypto.createHash("sha512");
    let hash2 = crypto.createHash("sha512");
    hash1.update(req.body.password);
    hash2.update(hash1.digest("hex"));

    //let post = {username: inputUsername, password: inputPassword, authorization: inputAuthorization};
    let post = {Email_addr: email, Password_encrypted: hash2.digest("hex") , Phone_num: phone, F_name: fname, L_name: lname, Gender: gender};

    console.log(post);
    let query = db.query(sql, post, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send('User inserted!');
        }
    })
});

//Get Auth
app.get('/getauth', function(req,res) {
    console.log("Inside Get /Auth Request");
    console.log(acctTypeGlobal);
    res.send(acctTypeGlobal);
    // let sql = `SELECT authorization FROM user WHERE userid = ${loggedInUserid}`;
    // console.log(sql);
    // let query = db.query(sql, (err, result) => {
    //     console.log(result);
    //     if (err) {
    //         throw err;
    //     } else if (result.length > 0) {
    //         console.log(result);
    //         res.send(result);
    //     } else {
    //         console.log('User not Found!');
    //     }
    // })
});

//Get Profile
app.get('/getprofile', function(req,res) {
    console.log("Inside Get Profile Request");
    console.log("userid:", myuserid);
    let sql = `SELECT * FROM profile WHERE userid = ${loggedInUserid}`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        console.log(result);
        if (err) {
            throw err;
        } else if (result.length > 0) {
            console.log(result);
            res.send(result);
        } else {
            console.log('User not Found!');
        }
    })
});

//Update Profile
app.post('/updateprofile', function(req, res) {
    console.log("Inside Profile Update Request");
    console.log("Req Body : ", req.body);
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let aboutme = req.body.aboutme;
    let city = req.body.city;
    let country = req.body.country;
    let company = req.body.company;
    let school = req.body.school;
    let hometown = req.body.hometown;
    let language = req.body.languages;
    let gender = req.body.gender;
    let image = req.body.image;

    let post = {name: name, email: email, phone: phone, aboutme: aboutme, city: city, country: country, company: company, school: school, hometown: hometown, language: language, gender, image: image};
    console.log("Session userid: ", myuserid);
    let sql = `UPDATE profile SET ? WHERE userid = ${myuserid}`;
    let query = db.query(sql, post, (err, result) => {
        if (err) {
            throw err;
        } else {
            if (result.changedRows < 1) {
                sql = 'INSERT INTO profile SET ?'
                post = {userid: myuserid, name: name, email: email, phone: phone, aboutme: aboutme, city: city, country: country, company: company, school: school, hometown: hometown, language: language, gender, image: image};
                query = db.query(sql, post, (err2, result2) => {
                    if (err2) {
                        console.log(err2);
                        throw err2;
                    } else {
                        console.log(result2);
                        res.send('New User Profile Created!');
                    }
                })
            } else {
                console.log(result);
                res.send('User profile updated!');
            }
        }
    })  
});

// ** FACULTY START **
//Get Course List
app.get('/getcourselistfaculty', function(req, res) {
    console.log("Inside Get Faculty User's Course List");
    let sql = `SELECT * FROM course WHERE facultyid = ${loggedInUserid}`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send(result);
        }
    })
})

//Create Course
app.post('/createcourse', function(req, res) {
    console.log("Inside Create Course");
    let post = { title: req.body.title, department: req.body.department, description: req.body.description, room: req.body.room, capacity: req.body.capacity, waitlistcapacity: req.body.waitlistcapacity, term: req.body.term, facultyid: loggedInUserid }
    let sql = `INSERT INTO course SET ?`;
    console.log(post);
    let query = db.query(sql, post, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send(result);
        }
    })
});

//Get Enrolled Students
app.get('/getenrolledstudents', function(req, res) {
    console.log("Inside Get Enrolled Students");
    let courseid = req.query.courseid;
    let sql = `SELECT profile.userid, courseid, name FROM coursestudent, profile WHERE coursestudent.userid = profile.userid AND coursestudent.courseid = ${courseid}`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

//Get Waitlist Students
app.get('/getwaitliststudents', function(req, res) {
    console.log("Inside Get Waitlist Students");
    let courseid = req.query.courseid;
    let sql = `SELECT profile.userid, courseid, name FROM coursestudentwaitlist, profile WHERE coursestudentwaitlist.userid = profile.userid AND coursestudentwaitlist.courseid = ${courseid}`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

//Drop Student
app.post('/dropstudent', function(req, res) {
    console.log("Inside Drop Student");
    let sql = `DELETE FROM coursestudent WHERE courseid = ${req.body.courseid} AND userid = ${req.body.userid}`;
    console.log(sql);
    let query = db.query(sql, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

//Submit Permission Code
app.post('/submitpermissioncode', function(req, res) {
    console.log("Inside Submit Permission Code");
    let post = { courseid: req.body.courseid, userid: req.body.userid, code: makeid() }
    let sql = `INSERT INTO permissioncode SET ?`;
    console.log(post);
    let query = db.query(sql, post, (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log(result);
            console.log("Code Sent; Delete From Waitlist");
            let sql = `DELETE FROM coursestudentwaitlist WHERE courseid = ${req.body.courseid} AND userid = ${req.body.userid}`;
            console.log(sql);
            let query = db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                } else {
                    console.log(result);
                    res.send(result);
                }
            });
        }
    })
});
function makeid() {
    var length = 7;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

//start your server on port 3001
app.listen(3001);
console.log("Server Listening on port 3001");