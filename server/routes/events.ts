import express from 'express'

import { eventDays, capitalise, validateDay } from './helpers.ts'
import * as db from '../db/index.ts'
import {
  getAllLocations,
  addNewEvent,
  deleteEvent,
  updateEvent,
  getEventById,
  getAllLocationsIdName,
} from '../db/index.ts'
import { configDefaults } from 'vitest/dist/config.js'
const router = express.Router()
export default router

// GET /events/add/friday
router.get('/add/:day', async (req, res) => {
  const day = validateDay(req.params.day)
  const days = eventDays.map((eventDay) => ({
    value: eventDay,
    name: capitalise(eventDay),
    selected: eventDay === day ? 'selected' : '',
  }))

  // TODO: Replace this with all of the locations in the database
  const locations = await getAllLocations()

  // [
  //   {
  //     id: 1,
  //     name: 'TangleStage',
  //   },
  //   {
  //     id: 2,
  //     name: 'Yella Yurt',
  //   },
  // ]

  const viewData = { locations, days, day }

  res.render('addEvent', viewData)
})

// POST /events/add
router.post('/add', (req, res) => {
  // ASSISTANCE: So you know what's being posted ;)

  const body = req.body
  body.location_id = body.locationId
  delete body.locationId
  body.location_id = parseInt(body.location_id)

  addNewEvent(req.body)
  console.log('body', body)
  // const { name, description, time, locationId } = req.body
  const day = validateDay(req.body.day)

  // TODO: Add the event to the database and then redirect

  // const day = 'friday' // TODO: Remove this line

  res.redirect(`/schedule/${day}`)
})

// POST /events/delete
router.post('/delete', (req, res) => {
  const id = req.body.id
  const day = validateDay(req.body.day)

  // console.log('delete', req.params)
  // console.log('body', req.body)

  deleteEvent(id)

  console.log('delete', req.body)

  // TODO: Delete the event from the database using its id

  // const day = 'friday' // TODO: Remove this line

  res.redirect(`/schedule/${day}`)
})

// GET /events/3/edit
router.get('/:id/edit', async (req, res) => {
  const id = Number(req.params.id)

  // TODO: Replace event below with the event from the database using its id
  // NOTE: It should have the same shape as this one
  const event = await getEventById(id)
  // {
  //   id: id,
  //   locationId: 1,
  //   day: 'friday',
  //   time: '2pm - 3pm',
  //   name: 'Slushie Apocalypse I',
  //   description:
  //     'This is totally a description of this really awesome event that will be taking place during this festival at the Yella Yurt. Be sure to not miss the free slushies cause they are rad!',
  // }

  console.log('update', event)

  // TODO: Replace locations below with all of the locations from the database
  // NOTE: The objects should have the same shape as these.
  // The selected property should have a value of
  // either 'selected' or '' based on event.locationId above.
  const locations = await getAllLocationsIdName()

  console.log('locations', locations)

  // This is done for you with an array of days imported from the helpers file
  const days = eventDays.map((eventDay) => ({
    value: eventDay,
    name: capitalise(eventDay),
    selected: eventDay === event.day ? 'selected' : '',
  }))

  const viewData = { event, locations, days }

  console.log('viewdata', viewData)
  res.render('editEvent', viewData)
})

// POST /events/edit
router.post('/edit', (req, res) => {
  // ASSISTANCE: So you know what's being posted ;)
  // const { name, description, time } = req.body

  const body = req.body

  const id = Number(req.body.id)

  body.location_id = body.locationId
  delete body.locationId
  body.location_id = parseInt(body.location_id)

  const day = validateDay(req.body.day)

  console.log('edit', body, id)
  // const locationId = Number(req.body.locationId)
  updateEvent(id, body)
  // TODO: Update the event in the database using the identifiers created above

  // const day = 'friday' // TODO: Remove this line

  res.redirect(`/schedule/${day}`)
})
