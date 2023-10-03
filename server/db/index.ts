import knexFile from './knexfile.js'
import knex from 'knex'
import type { Location, LocationData } from '../../models/Location.ts'
import type { Event, EventData, EventWithLocation } from '../../models/Event.ts'
import { s } from 'vitest/dist/types-198fd1d9.js'

type Environment = 'production' | 'test' | 'development'

const environment = (process.env.NODE_ENV || 'development') as Environment
const config = knexFile[environment]
const db = knex.default(config)

export interface updatedLocation {
  id: string
  name: string
  description: string
}

export interface events {
  id: number
  name: string
  description: string
  location: string
  time: string
}

export async function getAllLocations() {
  // TODO: use knex to get the real location data from the database
  return await db('locations').select('id', 'name', 'description')
}

// TODO: write some more database functions

export async function getEventsByDay(day: string) {
  return await db('locations')
    .join('events', 'events.location_id', 'locations.id')
    .where('day', day)
    .select(
      'events.id',
      'events.day',
      'events.time',
      'events.name as eventName',
      'events.description as eventDescription',
      'locations.name as locationName'
    )
}
export async function getLocationById(id: number) {
  return await db('locations')
    .where('id', id)
    .select('id', 'name', 'description')
    .first()
}

export async function updateLocation(location: updatedLocation) {
  return await db('locations').where('id', location.id).update(location)
}

export async function addNewEvent(event: events) {
  return await db('events').insert(event)
}

export async function deleteEvent(id: string) {
  return await db('events').where('id', id).del()
}

export async function updateEvent(id: number, updatedEvent: events) {
  return await db('events').where('id', id).update(updatedEvent)
}

export async function getEventById(id: number) {
  return await db('events').where('id', id).select().first()
}

export async function getAllLocationsIdName() {
  return await db('locations').select('id', 'name')
}
