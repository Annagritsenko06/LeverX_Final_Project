import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from '../common/fileHelpers.js';
import { USERMESSAGES } from '../common/messages.js';

export async function registerUser(userData) {
    const { Name, Lastname, Email, Password } = userData;

    const users = await readFile(process.env.DATA_FILE);
    const existingUser = users.find((u) => u.Email === Email);

    if (existingUser) {
        throw new Error(USERMESSAGES.USER_ALREADY_EXISTS);
    }

    const userId = randomUUID();
    const saltRounds =
        typeof process.env.SALT_ROUNDS === 'string'
            ? Number(process.env.SALT_ROUNDS)
            : process.env.SALT_ROUNDS;
    const passwordHash = await bcrypt.hash(Password, saltRounds || 10);

    const newUser = {
        Id: userId,
        Name,
        Lastname,
        Email,
        Password: passwordHash,
    };

    users.push(newUser);
    await writeFile(process.env.DATA_FILE, users);

    return { userId, Name };
}

export async function loginUser(email, password) {
    const users = await readFile(process.env.DATA_FILE);
    const user = users.find((u) => u.Email === email);

    if (!user) {
        throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    const isValid = await bcrypt.compare(password, user.Password);

    if (!isValid) {
        throw new Error(USERMESSAGES.WRONG_PASSWORD);
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
    const users = await readFile(process.env.DATA_FILE);
    const userIndex = users.findIndex((u) => u.Email === email);

    if (userIndex === -1) {
        throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    users[userIndex].Name = name;
    users[userIndex].Lastname = lastname;

    await writeFile(process.env.DATA_FILE, users);

    return { name, lastname };
}
