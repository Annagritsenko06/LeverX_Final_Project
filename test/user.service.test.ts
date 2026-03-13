import { test, before, mock , beforeEach} from 'node:test';
import assert from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../dist/users/users.service.js';
import { UsersRepository } from '../dist/users/users.repository.js';
import { v4 as uuidv4 } from 'uuid'; 
import { PasswordHashGenerator } from '../dist/common/passwordHashGenerator.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

 const userData = {
            name: "Anna",
            lastname: "Gritsenko",
            email: "email@test.com",
            password: "password123"
        };
 

export interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
}

test('UserService', async (t) => {
    let service: UserService;
    let module: TestingModule;

interface IUserRepository {
  findUserByEmail(email: string): Promise<User | null>;
  addUser(userData: any): Promise<User>;
  updateUser(name?: string, lastname?: string, email?: string): Promise<boolean>;
   getUsersWithFirstPostAndLikes(options:any) :  Promise<unknown[]> ;
}

let mockUserRepository: {
  [K in keyof IUserRepository]: ReturnType<typeof mock.fn>;
};

    before(async () => {
       
        mockUserRepository = {
            findUserByEmail: mock.fn(async (email: string) => {
                return null;
            }),
            addUser: mock.fn(async (userData: any) => ({
                id: uuidv4(),
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            })),
             updateUser: mock.fn(async (name: string, lastname: string, email: string) => {
    return true;
  }),
  getUsersWithFirstPostAndLikes : mock.fn(async (): Promise<unknown[]> => []),

         };

        module = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UsersRepository,
                    useValue: mockUserRepository,
                },
                 {
      provide: PasswordHashGenerator,  
      useClass: PasswordHashGenerator,
    },
            ],
        }).compile();
        
        service = module.get<UserService>(UserService);
    });
    
beforeEach(() => {
        mockUserRepository.findUserByEmail.mock.resetCalls?.();
        mockUserRepository.addUser.mock.resetCalls?.();
    });
    await t.test('should register user successfully', async () => {
       
        const result = await service.registerUser(userData);

        assert.ok(result.userId);
        assert.strictEqual(result.name, userData.name);

        assert.strictEqual(mockUserRepository.findUserByEmail.mock.calls.length, 1);
                
        assert.strictEqual(mockUserRepository.addUser.mock.calls.length, 1);
     const calls = mockUserRepository.addUser.mock.calls;
    if (calls.length > 0 && calls[0] && calls[0][0]) {
        const savedUserData = calls[0][0] as any;
        assert.ok(savedUserData.password.startsWith('$2b$')); 
    }});
await t.test('registerUser accepts empty name (controller validates)', async () => {
  const result = await service.registerUser({ ...userData, name: '' });
  assert.ok(result.userId, 'Service processes empty name');
  assert.strictEqual(result.name, '');
});

await t.test('registerUser accepts invalid email (controller validates)', async () => {
  const result = await service.registerUser({ ...userData, email: 'invalid' });
  assert.ok(result.userId, 'Service processes invalid email');
  assert.strictEqual(result.name, userData.name);
});


    await t.test('should throw error if user already exists', async () => {
        mockUserRepository.findUserByEmail.mock.resetCalls();
        
           mockUserRepository.findUserByEmail = mock.fn(async (email: string) => {
            return {
                id: uuidv4(),
                name: userData.name,
                lastname: userData.lastname,
                email: email,
                password: "hashed_password",
                toJSON: function() {
                    return {
                        id: this.id,
                        name: this.name,
                        lastname: this.lastname,
                        email: this.email,
                        password: this.password
                    };
                }
            };
        });

               try {
            await service.registerUser(userData);
            assert.fail('Should have thrown an error');
        } catch (error) {
            assert.strictEqual(error.message, 'User already exists');
        }

        assert.strictEqual(mockUserRepository.addUser.mock.calls.length, 0);
    });



    await t.test('should login user successfully', async () => {

    mockUserRepository.findUserByEmail.mock.mockImplementation(async () => ({
      id: "1",
      name: "Anna",
      lastname: "Gritsenko",
      email: userData.email,
      password: "hashed_password"
    }));

    mock.method(bcrypt, 'compare', async () => true);

    mock.method(jwt, 'sign', () => "fake-jwt-token");

    process.env.JWT_SECRET = "secret";

    const result = await service.loginUser(userData.email, userData.password);

    assert.equal(result.token, "fake-jwt-token");
    assert.equal(result.userEmail, userData.email);
    
        assert.strictEqual(mockUserRepository.findUserByEmail.mock.calls.length, 1);
  });


  await t.test('should throw error because of wrong parameters', async () => {
  mockUserRepository.findUserByEmail.mock.mockImplementation(async () => null);
  
  await assert.rejects(
    () => service.loginUser('', userData.password), 
    {
      message: 'User not found' 
    }
  ); 
  await assert.rejects(
    () => service.loginUser(userData.email, ''), 
    {
      message: 'User not found' 
    }
  );

  });



  await t.test('should throw error if user not found', async () => {

    mockUserRepository.findUserByEmail.mock.mockImplementation(async () => null);

    await assert.rejects(
      () => service.loginUser(userData.email, userData.password),
      {
        message: 'User not found'
      }
    );
  });


  await t.test('should throw error if password incorrect', async () => {

    mockUserRepository.findUserByEmail.mock.mockImplementation(async () => ({
      id: "1",
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      password: "hashed"
    }));

    mock.method(bcrypt, 'compare', async () => false);

    await assert.rejects(
      () => service.loginUser(userData.email, userData.password),
      {
        message: 'Wrong password'
      }
    );
  });


  await t.test('should update profile', async () => {

    mockUserRepository.updateUser.mock.mockImplementation(async () => true);

    const result = await service.updateUserProfile(
      userData.email,
      "NewName",
      "NewLastname"
    );

    assert.equal(result.name, "NewName");
    assert.equal(result.lastname, "NewLastname");
    
  });

  
await t.test('should throw error if user not found on update', async () => {
   mockUserRepository.updateUser = mock.fn(async (name?: string, lastname?: string, email?: string) => {
    return false;
  });

  await assert.rejects(
    () => service.updateUserProfile(userData.email, "NewName", "NewLastname"),
    { message: 'User not found' }
  );
});

await t.test('should return users with posts', async () => {
  const mockUsersWithPosts = [
    { id: 'user1', name: 'Anna', lastname: 'Gritz', email: 'anna@gmail.com', firstPostId: 'post1', firstPostTitle: 'Anna post', likesCount: 5 },
    { id: 'user2', name: 'Mila', lastname: 'Lilili', email: 'milka_super@mail.ru', firstPostId: 'post2', firstPostTitle: 'Milka post', likesCount: 2 }
  ];
 
  mockUserRepository.getUsersWithFirstPostAndLikes = mock.fn(async (options: any) => {
    if (options.name === 'ann') return [mockUsersWithPosts[0]];
    if (options.sortBy === 'email' && options.sortOrder === 'DESC') return [...mockUsersWithPosts].reverse();
    return mockUsersWithPosts;
  });

  const result: any[] = await service.getUsersWithFirstPostAndLikes({
    page: 1, limit: 10, sortBy: 'name', sortOrder: 'ASC'
  });

  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].name, 'Anna');
  assert.strictEqual(result[0].likesCount, 5);
});


await t.test('getUsersWithFirstPostAndLikes - edge pagination', async () => {
  mockUserRepository.getUsersWithFirstPostAndLikes.mock.mockImplementation(async (options) => {
    if (options.limit === 0) throw new Error('Invalid limit');
    if (options.page < 1) throw new Error('Invalid page');
    return [];
  });

  await assert.rejects(
    () => service.getUsersWithFirstPostAndLikes({ page: 1, limit: 0 }),
    { message: 'Invalid limit' }
  );
});

});