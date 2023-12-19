import express from 'express';
import User from './userModel';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Password validator function
const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
};

// Get all users
router.get('/', async (req, res) => {
    const users = await User.find();
    res.status(200).json(users);
});

// register(Create)/Authenticate User
router.post('/', asyncHandler(async (req, res) => {
    if (req.query.action === 'register') {
        // Validate password before saving to DB
        if (!isPasswordValid(req.body.password)) {
            return res.status(400).json({
                code: 400,
                msg: 'Password must be at least 8 characters long and contain at least one letter, one digit, and one special character.',
            });
        }

        await User(req.body).save();
        res.status(201).json({
            code: 201,
            msg: 'Successfully created a new user.',
        });
    } else {
        const user = await User.findOne(req.body);
        if (!user) {
            return res.status(401).json({ code: 401, msg: 'Authentication failed' });
        } else {
            return res.status(200).json({ code: 200, msg: 'Authentication Successful', token: 'TEMPORARY_TOKEN' });
        }
    }
}));

// Update a user
router.put('/:id', async (req, res) => {
    if (req.body._id) delete req.body._id;

    // Validate password before updating user
    if (req.body.password && !isPasswordValid(req.body.password)) {
        return res.status(400).json({
            code: 400,
            msg: 'Password must be at least 8 characters long and contain at least one letter, one digit, and one special character.',
        });
    }

    const result = await User.updateOne({
        _id: req.params.id,
    }, req.body);

    if (result.matchedCount) {
        res.status(200).json({ code: 200, msg: 'User Updated Successfully' });
    } else {
        res.status(404).json({ code: 404, msg: 'Unable to Update User' });
    }
});

export default router;