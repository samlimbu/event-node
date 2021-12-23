const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/users');
var atob = require('atob');
require('../config/passport')(passport)
router.get('/', (req, res, next) => {
    console.log(typeof (req.query.pageSize + 0));
    const itemperpage = parseInt(req.query.pageSize, 10);
    const pageNo = parseInt(req.query.page, 10);
    let reg = new RegExp(req.query.q, 'i');
    User.find({ "$or": [{ username: reg }, { first_name: reg }, { last_name: reg }, { email: reg }] }, (err, data) => {
        console.log('evet');
        if (err)
            throw err;
        res.json(data);
    }).sort([[req.query.sortby, req.query.order]]).skip(itemperpage * (pageNo - 1)).limit(itemperpage);
})

router.get('/count', (req, res, next) => {
    User.count({}, (err, data) => {
        res.json(data);
    })
})

router.post('/delete', (req, res, next) => {
    User.deleteOne({ username: req.body.username }, (err, data) => {
        if (err)
            throw err;
        res.json(data);
    })
});

router.post('/insert_many', (req, res, next) => {

    User.insertMany(req.body, { ordered: false }, (err, data) => {
        if (err) {
            console.log('err..to string...', err.toString());
            console.log('err.....', err);
            //  next(err);
            res.json(err);

        } else {
            res.json(data);
        }
    })
})






router.post('/register', (req, res, next) => {
    console.log(req.body);
    User.getUserByUsername(req.body.username, (err, user) => {
        console.log(req.body);
        if (err) {
            throw err
        }
        if (user) {
            return res.json({ success: false, msg: 'Username already registered ! Please choose another username' });
        } else if (!user) {
            let newUser = new User({
                first_name: req.body.first_name,
                middle_name: req.body.middle_name,
                last_name: req.body.last_name,
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                roles: ['User']
            });
            User.addUser(newUser, (err, user) => {
                if (err) {
                    res.json({ success: false, msg: 'Failed to register user' });
                }
                else {
                    res.json({ success: true, msg: 'User registered' });
                }
            });
        }

    });
});
//Authenticate
router.post('/authenticate', (req, res, next) => {

    console.log('auth', req.body);
    //const auth = atob(req.body.auth).split(':');
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) {
            throw err
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        User.comparePassword(password, user.password, (err, isMatch) => {

            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({ data: user }, config.secret, {
                    expiresIn: 604800 //1week in secs
                });
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                    }
                })
            }
            else {
                return res.json({
                    success: false,
                    msg: 'The password is incorrect.'
                });
            }
        });

    });
});
//profile 
router.post('/profile', (req, res, next) => {
    console.log('/profile', req.body);
    User.getUserByUsername(req.body.username, (err, user) => {
        if (err) {
            throw err
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        } else if (user) {
            res.json(user);
        }

    });
});
//reset password
router.post('/reset_password', (req, res, next) => {
    console.log('reset pass', req.body);
    console.log(atob(req.body.password));
    let newUser = new User({
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        roles: req.body.roles
    });
    console.log('new user body', newUser);
    User.changePassword(newUser, (err, data) => {
        if (err) {
            console.log(err);
            throw err
        }
        if (!data) {
            return res.json({ success: false, msg: 'User not found' });
        }
        console.log('res change password', data);
        return res.json(data);
    });
});


//change password
router.post('/change_password', (req, res, next) => {
    const auth = atob(req.body.auth).split(':');
    console.log(req.body);
    const username = auth[0];
    const password = auth[1];
    const newPassword = auth[2];
    console.log(username, password);
    console.log(newPassword);
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            throw err
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            console.log('.....', user);
            if (err) throw err;
            if (isMatch) {
                console.log('isMatch', isMatch, user);
                // let newUser = new User({
                //     first_name: user.first_name,
                //     last_name: user.last_name,
                //     middle_name: user.middle_name,
                //     username: user.username,
                //     email: user.email,
                //     roles: user.roles,
                //     password: newPassword
                // });
                user.password = newPassword;
                console.log('afterrrrrrrrrrrrrrrrrrrrrrrrrrrrr', user);
                User.changePassword(user, (err, user) => {
                    if (err) {
                        return res.json({ sucess: false, msg: 'failed to change password' });

                    }
                    else {
                        return res.json({ sucess: true, msg: 'password change success' });
                    }
                });
            }
            else {
                return res.json({
                    sucess: false,
                    msg: 'The password is incorrect.'
                });
            }
        });
    });
});

router.post('/update_user', (req, res, next) => {
    const auth = atob(req.body.auth).split(':');
    console.log('update user///////////', req.body);
    const username = auth[0];
    const password = auth[1];
    console.log(username, password);
    User.getUserByUsername(username, (err, user) => {
        if (err) {
            throw err
        }
        if (!user) {
            return res.json({ success: false, msg: 'User not found' });
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            console.log('.....', user);
            if (err) throw err;
            if (isMatch) {
                let newUser = {
                    username: username,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    middle_name: req.body.middle_name,
                    email: req.body.email
                };

                console.log('afterrrrrrrrrrrrrrrrrrrrrrrrrrrrr', newUser);
                User.findOneAndUpdate({ username: username }, newUser, (err, data) => {
                    if (err) {
                        console.log(err);
                        return res.json({ sucess: false, msg: 'failed to change password' });
                    }
                    else {
                        return res.json({ sucess: true, msg: 'User Updated', data: data });
                    }
                });

            }
            else {
                return res.json({
                    sucess: false,
                    msg: 'The password is incorrect.'
                });
            }
        });
    });
});

//change role
router.post('/change_role', (req, res, next) => {
    console.log('change role', req.body);
    User.findOneAndUpdate({ username: req.body.username }, req.body, (err, data) => {
        if (err) {
            console.log(err);
            throw err
        }
        if (!data) {
            return res.json({ success: false, msg: 'User not found' });
        }
        console.log('res change role', data);
        return res.json(data);
    });
});

//test
router.get('/status', (req, res, next) => {
    console.log('/status');
    res.json({ user: req.user });
});
router.get('/status2', (req, res, next) => {
    console.log('/status');
    res.json({ user: req.user });
});
router.post('/find', (req, res, next) => {
    User.findOne({ username: req.body.username }, (err, data) => { //returns null if not found
        console.log(data);
        res.json(data);
    })
})

module.exports = router;
