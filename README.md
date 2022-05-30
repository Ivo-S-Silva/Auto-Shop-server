# Auto-Shop - Server

* This repo contains all the back-end code for the Auto-Shop fullstack application. For the react app, visit: https://github.com/Ivo-S-Silva/auto-shop-client
* This provides the database structure for the react app to manage the clients, cars and services of the auto repair businesses that use the app.
* It uses MongoDb for the database, ExpressJs for the back-end application and Mongoose to connect to the database.

# Getting started

## Setting up a project

* Fork this repository: 'https://github.com/Ivo-S-Silva/Auto-Shop-server'
* Clone the forked repository to your local project folder
* Open the cloned project with your code editor of choice
* Install the dependencies: `npm install`

## Working on the project

* Move into the project directory and open the project with your code editor of choice
* Run the development task: `npm run dev`
    * Starts a server running at http://localhost:5005
    * Automatically restarts when any of your files change
* Create the environmental variables in a .env file:
    * PORT=5005 - Specifies a different port for the server to run (Port 5005 in this example.)
    * ORIGIN='http://localhost:3000' - Specifies the port the front-end application will run at, to prevent CORS errors. (Port 3000 in this example)
    * TOKEN_SECRET='YOUR_SECRET_OF_CHOICE' - Needed for user authentication and token validation.

# Databases

By default, the template is configured to connect to a MongoDB database using Mongoose. 

# Deployment

Requires the [Heroku CLI client](https://devcenter.heroku.com/articles/heroku-command-line).

## Setting up the project on Heroku

* Go to heroku website and follow the online instructions to create a new project using mongoDb.
    * You will be provided with a link such as this example: mongodb+srv://userName:userPassword@cluster0.bk2sc.mongodb.net/?retryWrites=true&w=majority
* You will also need to configure on Heroku the same environmental variables configured in your local machine, under settings on the heroku website.

## Deploying to Heroku

* Push your code to Heroku: `git push heroku main`
