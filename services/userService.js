import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from '../utils/fileHelpers.js';
import { DATA_FILE, SALT_ROUNDS } from '../config/constants.js';

export async function registerUser(userData) {
    const { Name, Lastname, Email, Password } = userData;

    const users = await readFile(DATA_FILE);
    const existingUser = users.find((u) => u.Email === Email);

    if (existingUser) {
        throw new Error('User already exists');
    }

    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(Password, SALT_ROUNDS);

    const newUser = {
        Id: userId,
        Name,
        Lastname,
        Email,
        Password: passwordHash,
    };

    users.push(newUser);
    await writeFile(DATA_FILE, users);

    return { userId, Name };
}

export async function loginUser(email, password) {
    const users = await readFile(DATA_FILE);
    const user = users.find((u) => u.Email === email);

    if (!user) {
        throw new Error('User not found');
    }

    const isValid = await bcrypt.compare(password, user.Password);

    if (!isValid) {
        throw new Error('Wrong password');
    }

    const payload = {
        Id: user.Id,
        Name: user.Name,
        Lastname: user.Lastname,
        Email: user.Email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { token, userEmail: user.Email };
}

export async function updateUserProfile(email, name, lastname) {
    const users = await readFile(DATA_FILE);
    const userIndex = users.findIndex((u) => u.Email === email);

    if (userIndex === -1) {
        throw new Error('User not found');
    }

    users[userIndex].Name = name;
    users[userIndex].Lastname = lastname;

    await writeFile(DATA_FILE, users);

    return { name, lastname };
}
