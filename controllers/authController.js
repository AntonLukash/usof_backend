const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const nodemailer = require('nodemailer');

const JWT_SECRET = 'secret_key_verify';
const JWT_EXPIRES_IN = '1h';
const EMAIL_SECRET = 'email_secret_verify';
const EMAIL_FROM = 'antonlukash05@gmail.com';
const EMAIL_PASSWORD = 'yqds spla qmmv zape';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_FROM,
        pass: EMAIL_PASSWORD,
    },
});

const register = async (req, res) => {
    const { login, password, passwordConfirmation, email } = req.body;

    if (password !== passwordConfirmation) {
        return res.status(400).json({ error: 'Passwords dont match' });
    }

    try {
        const existingUser = await userModel.getUserByLoginOrEmail(login || null, email || null);
        if (existingUser) {
            return res.status(400).json({ error: 'A user with the same login or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { login, password: hashedPassword, email };
        const result = await userModel.createUser(newUser);

        const emailToken = jwt.sign({ userId: result.insertId, email }, EMAIL_SECRET, { expiresIn: '1h' });
        const url = `http://localhost:3000/api/auth/confirm-email/${emailToken}`;

        await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: 'Confirm email',
            text: `Follow the link to confirm your email: ${url}`,
        });

        res.status(201).json({ message: 'The user is registered. Check your email to confirm.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const confirmEmail = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, EMAIL_SECRET);
        await userModel.confirmUserEmail(decoded.userId);
        res.json({ message: 'Email has been successfully confirmed. You can now log in.' });
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

const login = async (req, res) => {
    const { login, email, password } = req.body;

    try {
        const user = await userModel.getUserByLoginOrEmail(login || null, email || null);
        if (!user) {
            return res.status(400).json({ error: 'Invalid login or password' });
        }

        if (!user.email_confirmed) {
            return res.status(403).json({ error: 'Confirm your email to login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid login or password' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const logout = (req, res) => {
    res.json({ message: 'Exit successful' });
};

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User with this email was not found' });
        }

        const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' });
        const resetUrl = `http://localhost:3000/api/auth/password-reset/${resetToken}`;

        await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject: 'Password reset',
            text: `Follow the link to reset your password: ${resetUrl}`,
        });

        res.json({ message: 'An email with a link to reset password has been sent' });
    } catch (error) {
        res.status(500).json({ error: 'Error sending email' });
    }
};

const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userModel.updateUserPassword(decoded.userId, hashedPassword);
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(400).json({ error: 'Token is invalid or expired' });
    }
};

module.exports = {
    register,
    confirmEmail,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
};
