import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { readFile, writeFile } from '../common/fileHelpers.js';
import { USERMESSAGES } from '../common/messages.js';
import type { RegisterUserInput, User } from '../types/types.js';

export async function registerUser(
    userData: RegisterUserInput
): Promise<{ userId: string; Name: string }> {
    const { Name, Lastname, Email, Password } = userData;

    const users = await readFile<User[]>(process.env.DATA_FILE as string);
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

    const newUser: User = {
        Id: userId,
        Name,
        Lastname,
        Email,
        Password: passwordHash,
    };

    users.push(newUser);
    await writeFile(process.env.DATA_FILE as string, users);

    return { userId, Name };
}

export async function loginUser(
    email: string,
    password: string
): Promise<{ token: string; userEmail: string }> {
    const users = await readFile<User[]>(process.env.DATA_FILE as string);
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

    const secret = process.env.JWT_SECRET as jwt.Secret;
    const options: jwt.SignOptions = {};
    const expiresIn = process.env.JWT_EXPIRES_IN;
    if (expiresIn) {
        options.expiresIn = expiresIn as jwt.SignOptions['expiresIn'];
    }

    const token = jwt.sign(payload, secret, options);

    return { token, userEmail: user.Email };
}

export async function updateUserProfile(
    email: string,
    name: string,
    lastname: string
): Promise<{ name: string; lastname: string }> {
    const users = await readFile<User[]>(process.env.DATA_FILE as string);
    const userIndex = users.findIndex((u) => u.Email === email);

    if (userIndex === -1) {
        throw new Error(USERMESSAGES.USER_NOT_FOUND);
    }

    users[userIndex].Name = name;
    users[userIndex].Lastname = lastname;

    await writeFile(process.env.DATA_FILE as string, users);

    return { name, lastname };
}
