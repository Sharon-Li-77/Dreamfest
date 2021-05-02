const request = require('supertest')

const server = require('../server')
const db = require('../db/event')
const { sendEventNotifications } = require('../notifications/notificationHelper')
const log = require('../logger')
const { userExists } = require('../db/users')

jest.mock('../db/event')
jest.mock('../logger')
jest.mock('../notifications/notificationHelper')

// mock events for testing guest users
const mockEvents = [{
  id: 1,
  gardenId: 1,
  title: 'Weeding worker Bee',
  date: 'Wed, 27 Sep 2020 20:00:00 GMT',
  description: 'Its time to get these weeds under control.',
  volunteersNeeded: 8
},
{
  id: 2,
  gardenId: 1,
  title: 'Sowing Corn',
  date: 'Wed, 28 Sep 2020 20:00:00 GMT',
  description: 'Help get out the lovely corns in the ground!.',
  volunteersNeeded: 4
}
]

// mock events for testing signed in users
const mockUserEvents = [{
  id: 1,
  gardenId: 1,
  gardenName: 'Kelmarna Gardens',
  gardenAddress: '12 Hukanui Crescent',
  volunteersNeeded: 8,
  title: 'Weeding worker Bee',
  date: '2020-08-27',
  description: 'Its time to get these weeds under control.',
  isVolunteered: false
},
{
  id: 2,
  gardenId: 1,
  gardenName: 'Kelmarna Gardens',
  gardenAddress: '12 Hukanui Crescent',
  volunteersNeeded: 8,
  title: 'Sowing Corn',
  date: '2020-08-27',
  description: 'Its time to get these plants under control.',
  isVolunteered: true
}
]

// mock events for testing admin users
const mockAdminEvents = [{
  id: 1,
  gardenId: 1,
  gardenName: 'Kelmarna Gardens',
  gardenAddress: '12 Hukanui Crescent',
  volunteersNeeded: 8,
  title: 'Weeding worker Bee',
  date: '2020-08-27',
  description: 'Its time to get these weeds under control.',
  volunteers: {
    userId: 3,
    username: 'jdog'
  }
},
{
  id: 2,
  gardenId: 1,
  gardenName: 'Kelmarna Gardens',
  gardenAddress: '12 Hukanui Crescent',
  volunteersNeeded: 8,
  title: 'Sowing Corn',
  date: '2020-08-27',
  description: 'Its time to get these plants under control.',
  volunteers: {
    userId: 2,
    username: 'rdog'
  }
}
]

describe('GET /api/v1/events/:id', () => {
  // tests guest info
  it('responds only with event details for a guest', () => {
    expect.assertions(4)
    db.getEventById.mockImplementation((id) => {
      expect(id).toBe(2)
      return Promise.resolve(mockEvents[1])
    })
    return request(server)
      .get('/api/v1/events/2')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body.title).toBe('Sowing Corn')
        expect(res.body).not.toHaveProperty('isVolunteered')
        expect(res.body).not.toHaveProperty('volunteers')
        return null
      })
  })

  // testing for user route
  it('response includes volunteer status of member', () => {
    expect.assertions(2)
    db.getEventById.mockImplementation((id) => {
      expect(id).toBe(2)
      return Promise.resolve(mockUserEvents[1])
    })
    return request(server)
      .get('/api/v1/events/2')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body.isVolunteered).toBe(true || false)
        return null
      })
  })
  // admin route
  it('response includes volunteers id if Admin', () => {
    expect.assertions(2)
    db.getEventById.mockImplementation((id) => {
      expect(id).toBe(2)
      return Promise.resolve(mockUserEvents[1])
    })
    return request(server)
      .get('/api/v1/events/2')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body).toHaveProperty('volunteers')
        expect(res.body.volunteers).toBe([])
        return null
      })
  })

  it('responds with 500 and correct error object on DB error', () => {
    db.getEventById.mockImplementation(() => Promise.reject(
      new Error('mock getEventById error')
    ))
    return request(server)
      .get('/api/v1/events/999')
      .expect('Content-Type', /json/)
      .expect(500)
      .then(res => {
        expect(log).toHaveBeenCalledWith('mock getEventById error')
        expect(res.body.error.title).toBe('Unable to retrieve event')
        return null
      })
  })
})

describe('POST /api/v1/events', () => {
  it('respond with the event on res body', () => {
    expect.assertions(6)
    db.addEvent.mockImplementation((newEvent) => {
      expect(newEvent.description).toMatch('cool event')
      expect(newEvent.date).toMatch('12-31')
      expect(newEvent.volunteersNeeded).toBe(500)
      expect(newEvent.title).toMatch('Gardening')
      expect(newEvent.gardenId).toBe(3)
      return Promise.resolve({
        id: 4,
        gardenId: 3,
        title: 'Gardening Event',
        date: '2020-12-31',
        volunteersNeeded: 500,
        description: 'supremely cool event'
      })
    })
    sendEventNotifications.mockImplementation(() => Promise.resolve())
    return request(server)
      .post('/api/v1/events')
      .send({
        gardenId: 3,
        title: 'Gardening Event',
        date: '2020-12-31',
        volunteersNeeded: 500,
        description: 'supremely cool event'
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .then(res => {
        expect(res.body.title).toBe('Gardening Event')
        return null
      })
  })

  it('responds with 500 and correct error object on DB error', () => {
    db.addEvent.mockImplementation(() => Promise.reject(
      new Error('mock addEvent error')
    ))
    return request(server)
      .post('/api/v1/events')
      .expect('Content-Type', /json/)
      .expect(500)
      .then(res => {
        expect(log).toHaveBeenCalledWith('mock addEvent error')
        expect(res.body.error.title).toBe('Unable to add event')
        return null
      })
  })
})

describe('PATCH /api/v1/events/:id', () => {
  it('responds with the correct event by id on res body', () => {
    expect.assertions(6)
    db.updateEvent.mockImplementation((updatedEvent) => {
      expect(updatedEvent.description).toMatch('best event')
      expect(updatedEvent.id).toBe(2)
      expect(updatedEvent.title).toBe('cooler event')
      expect(updatedEvent.volunteersNeeded).toBe(1000)
      expect(updatedEvent.date).toBe('2021-01-01')
      return Promise.resolve({
        id: 2,
        title: 'cooler event',
        date: '2021-01-01',
        volunteersNeeded: 1000,
        description: 'the best event ever'
      })
    })
    return request(server)
      .patch('/api/v1/events/2')
      .send({
        id: 2,
        title: 'cooler event',
        date: '2021-01-01',
        volunteersNeeded: 1000,
        description: 'the best event ever'
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        expect(res.body.title).toBe('cooler event')
        return null
      })
  })

  it('responds with 500 and correct error object on DB error', () => {
    db.updateEvent.mockImplementation(() => Promise.reject(
      new Error('mock updateEvent error')
    ))
    return request(server)
      .patch('/api/v1/events/999')
      .expect('Content-Type', /json/)
      .expect(500)
      .then(res => {
        expect(log).toHaveBeenCalledWith('mock updateEvent error')
        expect(res.body.error.title).toBe('Unable to update event')
        return null
      })
  })
})
