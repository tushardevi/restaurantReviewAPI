
/* routes.js */

import { Router } from 'https://deno.land/x/oak@v6.5.1/mod.ts'

import { extractCredentials, saveFile } from './modules/util.js'
import { login, register } from './modules/accounts.js'
import { getAllRestaurants, getRestaurant, addRestaurant,checkDuplicates,addReview,getAllReviews,checkForReview } from './modules/restaurants.js'
//import Ajv from 'https://esm.sh/ajv'

const router = new Router()
//my notes:
// 
// the routes defined here
router.get('/', async context => {
	console.log('GET /')
	const data = await Deno.readTextFile('spa/index.html')
	context.response.body = data
})

router.get('/api/accounts', async context => {
	console.log('GET /api/accounts')
	const token = context.request.headers.get('Authorization')
	console.log(`auth: ${token}`)
	try {
		const credentials = extractCredentials(token)
		console.log(credentials)
		const username = await login(credentials)
		console.log(`username: ${username}`)
		context.response.body = JSON.stringify(
			{
				data: { username }
			}, null, 2)
	} catch(err) {
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})


router.post('/api/accounts', async context => {
	console.log('POST /api/accounts')
	const body  = await context.request.body()
	const data = await body.value
	console.log("coming from taled : ", data)
	await register(data)
	context.response.status = 201
	context.response.body = JSON.stringify({ status: 'success', msg: 'account created' })
})



//************ */
//GET request to get all the resturants as json format
router.get('/api/restaurants', async context => {
	console.log('GET restaurants')
	try {
		//const credentials = extractCredentials(token)
		// SEND THE DATA TO THE CLIENT
		context.response.body = await getAllRestaurants()
		

	} catch(err) {
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})
// app.get('/articles/:articleId/comments', (req, res) => {
//   const { articleId } = req.params;
//   const comments = [];
//   // code to get comments by articleId
//   res.json(comments);
// });
//GET request route to request a specific resturant by its ID(as object)
router.get('/api/restaurants/:id/restaurant-details', async context => {
	
	try {
		
		const id = context.params.id
		console.log(`GET restaurants/${id}`)
		
		const details= await getRestaurant(id)
		if(details == -1 )throw new Error(`restaurant with id : ${id} not found`)
		console.log("SPIDER MAN DETAILS for restaurant with id : " + id)
		console.log("*********")
		console.log(details)

		const token = context.request.headers.get('Authorization')
	
		const credentials = extractCredentials(token)
		
		//call function and store status of whether the user has reviewed for the restautant
		const flag = await checkForReview(id,credentials.user)

		//send the restaurant details with the status
		const response_buffer = {data: details,reviewStatus: flag}

		console.log("RESPONSE BUFFER ")
		console.log(response_buffer)

		context.response.body = response_buffer
		
	} catch(err) {
		console.log("ERROR IN /api/restaurants/:id/restaurant-details")

		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})
//GET route to get all reviews for a specifc restaurant

router.get('/api/restaurants/:id/all-reviews', async context => {
	try {
		const id = context.params.id
		console.log(`GET reviews for restaurant/${id}`)
		
		const details= await getAllReviews(id)
		if(details == -1 )throw new Error(`restaurant with id : ${id} not found`)

		console.log("reviews for restaurant with id : " + id)
		//console.log(details)

		context.response.body = details
		
	} catch(err) {
		console.log("ERROR IN /api/restaurants/:id/all-reviews")
		if(err.message == `restaurant with id : ${id} not found`)
		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})




// POST route to add new review to an existing restaurant
router.post('/api/restaurants/:id/add-review', async context => {
	console.log('POST request to add new review')

	try {
		const id = context.params.id
		console.log(`POST /api/restaurants/${id}/add-review}`)

		//extract the credentials from token
		const token = context.request.headers.get('Authorization')
		console.log(`auth to add a Review: ${token}`)
		

		// get all the content from the client
		const body  = await context.request.body()
		const data = await body.value
		
		//we going to have all the 3 slider ratings + comment + username + (restauran id from URL)

		data.restaurantID = id
		const details= await addReview(data)
		if(details == -1 )throw new Error(`restaurant with id : ${id} not found`)
		console.log("details for restaurant with id : " + id)
		console.log(details)
			//context.response.status = 201
			context.response.body = JSON.stringify({
			message: "Your review has been added!"
		}) 
		
	} catch(err) {
		console.log("ERROR IN /api/restaurants/addReview/")

		context.response.status = 401
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '401 Unauthorized.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})

// make sure user only uploads images, chekc for vlaidation in client side


// orgonaze code for clientside, create functions.

// when adding the postocode, format it so there is not space inbetween and all characters are in upper case when saved to the database
// and when storing the restaurant name, do the same. Maybe take out the spaces and check if the restaurant already exists in the DB

// send a reasonsable code back at get and post requests , look online for http codes
// route to post a new restaurant 
router.post('/api/restaurants/add', async context => {
	

	console.log('POST New Restaturant')
	//const body  = await context.request.body()

	try {
		
		//extract the credentials from token
		const token = context.request.headers.get('Authorization')
		console.log(`auth from server: ${token}`)
		const credentials= extractCredentials(token)
		console.log(credentials)
		// get all the content from the client
		const body  = await context.request.body()
		const data = await body.value

		data.user = credentials.user
		//console.log("this id the API add and the username is: "+  credentials.user)
		//check for duplicate restaurants, (in case client adds an already existing restaurant)
		const flag = await checkDuplicates(data.postcode,data.restaurantName)
		if(flag == false){
			const msg = `A restaurant with name:  ${data.restaurantName} and postcode: ${data.postcode} already exists.`
			throw new Error(msg)
		} 

		//else add the restaurant to the DB
		await addRestaurant(data)

		//send a msg back to the client
		//context.response.status = 201
		context.response.body = JSON.stringify({
			message: "new restaurant added"
		}) 
		
		
	} catch(err) {
		console.log("ERROR HAPPENING in addrestaurant/route :  " + err)
		context.response.status = 400
		context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '400 Error.',
						detail: err.message
					}
				]
			}
		, null, 2)
	}
})






//*************** */
// dont write routes here, they will never get executed
router.get("/(.*)", async context => {      
// 	const data = await Deno.readTextFile('static/404.html')
// 	context.response.body = data
	const data = await Deno.readTextFile('spa/index.html')
	context.response.body = data
})

// dont write routes here, they will never get executed

export default router // to import to other files

