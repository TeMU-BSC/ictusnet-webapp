const express = require('express')
const cors = require('cors')
const {
  uploadsDir,
  ctakesDir,
} = require('./constants')
const {
  createPublicDirIfNotExists,
  parseGenericTsv,
} = require('./io')
const { db } = require('./database/mongodb')
const { insertDemoReports } = require('./database/demo')
const reportsRoute = require('./routes/reports.js')

const app = express()

// cross-origin-resource-sharing enabled to allow http requests
// from different IP addresses than the server where this node app is running
app.use(cors())

// allow accessing the body of PUT/PATCH requests
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// make sure that directories for uploads and ctakes exist
createPublicDirIfNotExists(uploadsDir)
createPublicDirIfNotExists(ctakesDir)

// base endpoints
app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})
app.get('/variables', (req, res) => {
  const variables = parseGenericTsv('./config/variables.tsv')
  res.send(variables)
})
app.get('/options', (req, res) => {
  const options = parseGenericTsv('./config/options.tsv')
  res.send(options)
})
app.delete('/database', async (req, res) => {
  await db.dropDatabase()
  await insertDemoReports()
  res.send({ message: 'MongoDB `ictusnet` database has been deleted and then freshly recerated with the demo reports.' })
})

// routes
app.use('/reports', reportsRoute)

// start the server
const port = 3000
app.listen(port, () => console.log(`ICTUSnet backend listening on http://localhost:${port}`))
