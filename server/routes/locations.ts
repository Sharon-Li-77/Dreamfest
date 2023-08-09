import express from 'express'

import * as db from '../db/index.ts'
import {
  getAllLocations,
  getLocationById,
  updateLocation,
} from '../db/index.ts'

const router = express.Router()

// GET /locations
router.get('/', async (req, res) => {
  // TODO: Replace this with all of the locations in the database
  const locations = await getAllLocations()

  const viewData = { locations }

  // console.log(viewData)

  res.render('showLocations', viewData)
})

// GET /locations/4/edit
router.get('/:id/edit', async (req, res) => {
  const id = Number(req.params.id)

  // TODO: Get the location based on its id and replace this viewData
  const viewData = await getLocationById(id)

  console.log('data', viewData)

  // id: id
  // name: 'TangleStage',
  // description:
  //   'Not the biggest stage, but perhaps the most hip. Not the biggest stage, but perhaps the most hip. Not the biggest stage, but perhaps the most hip.',

  res.render('editLocation', viewData)
})

// POST /locations/edit
router.post('/edit', async (req, res) => {
  // ASSISTANCE: So you know what's being posted ;)
  // const { id, name, description } = req.body

  // TODO: Update the location in the database based on its id

  await updateLocation(req.body)
  const data = Object.assign({}, req.body)

  console.log('req', data)

  res.redirect('/locations')
})

export default router
