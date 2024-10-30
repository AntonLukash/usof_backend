const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error getting users' });
    }
};

const getUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userModel.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error while retrieving user data' });
    }
};

const createUser = async (req, res) => {
    const { login, password, passwordConfirmation, email, role } = req.body;

    if (password !== passwordConfirmation) {
        return res.status(400).json({ error: 'Passwords dont match' });
    }

    try {
        const existingUser = await userModel.getUserByLoginOrEmail(login, email);
        if (existingUser) {
            return res.status(400).json({ error: 'A user with the same login or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { login, password: hashedPassword, email, role: role || 'user' };
        await userModel.createUser(newUser);

        res.status(201).json({ message: 'User successfully created' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

const updateAvatar = async (req, res) => {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'Avatar was not loaded' });
    }

    const avatarPath = path.join('uploads', 'avatars', file.filename);

    try {
        await userModel.updateUserAvatar(userId, avatarPath);
        res.json({ message: 'Avatar successfully updated', avatarPath });
    } catch (err) {
        res.status(500).json({ error: 'Avatar update error' });
    }
};

const updateUserData = async (req, res) => {
    const userId = req.params.userId;
    const { login, email, password } = req.body;

    try {
        const user = await userModel.getUserById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updateData = { login, email };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await userModel.updateUser(userId, updateData);
        res.json({ message: 'User data has been successfully updated' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating user data' });
    }
};

const deleteUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const result = await userModel.deleteUser(userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateAvatar,
    updateUserData,
    deleteUser,
};
