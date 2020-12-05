const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { userOneId, userOne, userTwo, userTwoId, setupDatabase } = require('./fixtures/db');

// let token;
// beforeAll(async () => {
//     const response = await request(app)
//                                 .post('/api/users/login')
//                                 .send({
//                                     email: userOne.email,
//                                     password: userOne.password
//                                 })
//     token = response.body.data;
// })


beforeEach(setupDatabase);

test('Should sign up a new user', async done => {
    const response = await request(app).post('/api/users/register').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'peepeepoopoo123',
        age: 18
    }).expect(201);
    const user =  await User.findById(response.body.data.user._id);
    expect(user).not.toBeNull();
    done();
})

test('Should not signup user with invalid name/email/password', async () => {
    const response = await request(app)
                        .post('/api/users/register')
                        .send({
                            name: 123,
                            email: 'test',
                            password: 'password'
                        }).expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/api/users/login').send({
        email: userTwo.email,
        password: userTwo.password
    }).expect(200);
    const token = response.body.data;
    const userDecoded = await jwt.decode(token.split('Bearer ')[1], process.env.JWT_SECRET);
    const user = await User.findById(userTwoId);
    expect(userDecoded.name).toBe(user.name);
});

test('Should not login non-existing user', async () =>{
    await request(app).post('/api/users/login').send({
        email: 'ahmad@ahmad.com',
        password: 'personal_grudges123'
    }).expect(400);
})

test('Should get profile for user', async () => {
    const response = await request(app).post('/api/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
    //Get token
    const token = response.body.data;
    await request(app)
            .get('/api/users/me')
            .set('Authorization',token)
            .send()
            .expect(200);
});

test('Should not get profile for unauthenciated user', async () => {
    await request(app)
            .get('/api/users/me')
            .send()
            .expect(401)
});

test('Should delete user profile', async () => {
    const response = await request(app).post('/api/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);
    //Get token
    const token = response.body.data;

    await request(app)
        .delete('/api/users/me')
        .set('Authorization',token)
        .send()
        .expect(200)
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete unauthenticated user', async () => {
    await request(app)
        .delete('/api/users/me')
        .send()
        .expect(401) 
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
          .patch('/api/users/me')
          .send()
          .expect(401)
})

test('Should update valid user fields', async () => {
    const response = await request(app).post('/api/users/login').send({
        email: userTwo.email,
        password: userTwo.password
    }).expect(200);
    //Get token
    const token = response.body.data;

    await request(app)
                .patch('/api/users/me')
                .set('Authorization', token)
                .send({
                    name: 'Administrator'
                }).expect(200);
    const updatedUser = await User.findById(userTwoId);
    expect(updatedUser.name).toBe('Administrator');      
})

test('Should not update invalid user fields', async () => {
    const response = await request(app).post('/api/users/login').send({
        email: userTwo.email,
        password: userTwo.password
    }).expect(200);
    //Get token
    const token = response.body.data;

    await request(app)
            .patch('/api/users/me')
            .set('Authorization', token)
            .send({
                location: 'Baku'
            }).expect(400);
})