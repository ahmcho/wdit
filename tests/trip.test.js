const request = require('supertest');
const app = require('../app');
const Trip = require('../models/Trip');
const {
    userOneId,
    userOne,
    userTwo,
    userTwoId,
    tripOneId,
    tripOne,
    tripTwoId,
    tripTwo,
    tripThreeId,
    tripThree,
    setupDatabase
} = require('./fixtures/db');

beforeEach(setupDatabase);
beforeEach(async () => {
    const response = await request(app)
                                .post('/api/users/login')
                                .send({
                                    email: userOne.email,
                                    password: userOne.password
                                })
    token = response.body.data;
})

//GET trips
test('Should fetch page of trips', async () => {
    const response = await request(app)
                            .get('/api/trips')
                            .set('Authorization',token)
                            .send().expect(200)
});


//POST trips
test('Should create a trip for user', async () => {
    const response = await request(app)
                            .post('/api/trips')
                            .set('Authorization',token)
                            .send({
                                "description": "Planned to visit Arbat",
                                "location": "Moscow,Russia"
                            })
                            .expect(201)
    const trip = await Trip.findById(response.body.data._id)
    expect(trip).not.toBeNull();
    expect(trip.rating).toEqual(0);
});

test('Should not create trip with inavlid data', async () => {
    const response = await request(app)
                            .post('/api/trips')
                            .set('Authorization',token)
                            .send({
                                description: false,
                                location: false
                            }).expect(400)
})

//GET trips/:id
test('Should get trip by its id', async () => {
    const response = await request(app)
                            .get(`/api/trips/${tripTwoId}`)
                            .set('Authorization',token)
                            .send()
                            .expect(200)
})

//DELETE trips/:id
test('Should not delete other users trips', async () => {
    const response = await request(app)
                           .delete(`/api/trips/${tripTwoId}`)
                           .set('Authorization',token)
                           .send()
                           .expect(404);
    //Verify trip
    const trip = await Trip.findById(tripTwo._id);
    expect(trip).not.toBeNull();                   
})

test('Should delete user trip', async () => {
    const response = await request(app)
                                .post('/api/users/login')
                                .send({
                                    email: userTwo.email,
                                    password: userTwo.password
                                })
    const userTwoToken = response.body.data;
    await request(app)
                .delete(`/api/trips/${tripTwoId}`)
                .set('Authorization',userTwoToken)
                .send()
                .expect(200)
    //Verify that trip is null
    const trip = await Trip.findById(tripTwoId);
    expect(trip).toBeNull();
})

test('Should not delete trip if unauthenticated', async () => {
    await request(app).delete(`/api/trips/${tripOneId}`).send().expect(401)
    const trip = await Trip.findById(tripOneId);
    expect(trip).not.toBeNull();
})


//PATCH trips/:id
test('Should not update trip with invalid data', async () => {
    const response = await request(app)
                            .patch(`/api/trips/${tripThreeId}`)
                            .set('Authorization', token)
                            .send({
                                name: 'Blah'
                            });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeTruthy();
    expect(response.body.message).toMatch('Invalid updates!');
})

test('Should not fetch user trip by id if unauthenticated', async() => {
    const response = await request(app).get(`/api/trips/${tripTwoId}`).send();
    expect(response.status).toBe(401);
    expect(response.body.error).toBeTruthy();
    expect(response.body.message).toMatch('Unauthorized access!');
})