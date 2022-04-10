
/* routes.js */

import { Router } from 'https://deno.land/x/oak@v6.5.1/mod.ts'

import { extractCredentials, saveFile } from './modules/util.js'
import { login, register } from './modules/accounts.js'
import { getAllRestaurants, getRestaurant, addRestaurant,checkDuplicates,addReview,getAllReviews,checkForReview, deleteRestaurant} from './modules/restaurants.js'
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

router.get('/api/', async context => {
	console.log('GET /api/')
	const token = context.request.headers.get('Authorization')
	context.request.headers.get('Content-Type')
	try{
		const restaurants = {
		openapi: '3.0.1',
		info:{
  			title:  'Restaurants Review API',
  			description: 'API which allows to add new restaurants, and also lets you to add/view the latest reviews ',
  			version: '1.0.0',
		},
		paths:{
			'/api/' :{
				get:{
					tags: 'API homepage',
					summary: 'a simple homepage for user interaction with API'

				}
			}
		},
        
		links: [
			{
			    title: 'restaurants',
				description: 'list of restaurants',
				href: `https://pony-stop-8080.codio-box.uk/api/restaurants`
			},
			
		]
	}
	//context.response.status = Status.OK
	context.response.body = JSON.stringify(restaurants, null, 2)

	}catch(err){
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
		
		let all_restaurants= await getAllRestaurants()


		const restaurants = {
		openapi: '3.0.1',
		info:{
  			title:  'All the restaurants',
  			description: 'API call to get all the available restaurants',
  			version: '1.0.0',
		},
		paths:{
			'/api/restaurants' :{
				get:{
					tags: 'get all restaurants',
					summary: 'this paths gets all the restaurants'

				}
			}
		},
        
		data:all_restaurants
			
		
	}
	
	
	context.response.body = JSON.stringify(restaurants,null,2)
		

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

//GET request route to request a specific resturant by its ID(as object)
router.get('/api/restaurants/:id/details', async context => {
	
	try {
		
		const id = context.params.id
		console.log(`GET restaurants/${id}/details`)
		
		const details= await getRestaurant(id)
		if(details == -1 ){
			{
			context.response.status = 404
			context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '404 Not Found',
						detail: `Restaurant with id ${id} not found.`
					}
				]
			}
		, null, 2)
			//throw new Error(`restaurant with id : ${id} not found`)
			return
		}
		}
		console.log("DETAILS for restaurant with id : " + id)
		//console.log("*********")
		//console.log(details)

		const token = context.request.headers.get('Authorization')
	
		const credentials = extractCredentials(token)
		
		//call function and store status of whether the user has reviewed for the restautant
		const flag = await checkForReview(id,credentials.user)

		//send the restaurant details with the status
		const response_buffer = {data: details,reviewStatus: flag}
		response_buffer.data.all_reviews = `https://pony-stop-8080.codio-box.uk/api/restaurants/${id}/all-reviews`

		//console.log(response_buffer)
		const restaurant = {
		openapi: '3.0.1',
		info:{
  			title:  'detail of one restaurant',
  			description: 'API call to get details of one restaurant',
  			version: '1.0.0',
		},
		paths:{
			"/api/restaurants/:id/restaurant-details": {
				get:{
					tags: 'the details for one restaurant',
					summary: "get all the details of restaurant id : "+ id

				}
			}
		},
        
		data:response_buffer
			
		
	}
	
	context.response.body = JSON.stringify(restaurant,null,2)

		console.log("RESPONSE BUFFER ")
		console.log(response_buffer)

		//context.response.body = response_buffer
		
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
		if(details == -1 ){
			context.response.status = 404
			context.response.body = JSON.stringify(
			{
				errors: [
					{
						title: '404 Not Found',
						detail: `Restaurant with id ${id} not found.`
					}
				]
			}
		, null, 2)
			
			return
		}

		console.log("reviews for restaurant with id : " + id)
		console.log(details)

		const all_reviews = {
		openapi: '3.0.1',
		info:{
  			title:  'all reviews from specific restaurants',
  			description: 'API call to get all reviews of a restaurant',
  			version: '1.0.0',
		},
		paths:{
			"/api/restaurants/:id/all-reviews": {
				get:{
					tags: 'the all reviews of a restaurant',
					summary: "get all the reviews of restaurant id : "+ id

				}
			}
		},
        
		data:details
		
	}
	
	context.response.body = all_reviews

		//context.response.body = details
		
	} catch(err) {
		console.log("ERROR IN /api/restaurants/:id/all-reviews")
	
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


// send a reasonsable code back at get and post requests , look online for http codes
// route to post a new restaurant 
router.post('/api/restaurants/add', async context => {
	

	console.log('POST New Restaturant')
	
	const body  = await context.request.body()
	console.log(body)
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

		const flag = await checkDuplicates(data.postcode,data.restaurantName)
		if(flag == false){
			//const msg = `A restaurant with name:  ${data.restaurantName} and postcode: ${data.postcode} already exists.`
			//throw new Error(msg)
			context.response.status = 409
			context.response.body = JSON.stringify(
				{
					errors: [
						{
							title: '409 (Conflict) resource already exists',
							detail: `A restaurant with name:  ${data.restaurantName} and postcode: ${data.postcode} already exists.`
						}
					]
				}       
			, null, 2)

			return
		}
		

		//else add the restaurant to the DB
		await addRestaurant(data)

		//send a msg back to the client
		context.response.status = 201
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



//Delete method, to delete a restaurant by USING the id as parameters
router.delete('/api/restaurants/:id/delete', async context => {
	try {

		const id = context.params.id
		console.log(`DELETE /api/restaurants/${id}/delete`)

		//extract the credentials from token
		const token = context.request.headers.get('Authorization')

		const res = await deleteRestaurant(id)

		if(res == -1){
			console.log("4000444 ERRORRRR")
			context.response.status = 404
			context.response.body = JSON.stringify(
				{
					errors: [
						{
							title: '404 Not Found.',
							detail: `Restaurant with ID : ${id} not found`
						}
					]
				}
			, null, 2)
		return

	}else{
		context.response.body = JSON.stringify(
				{
					message: [
						{
							title: '200 resource deleted.',
							detail: `Restaurant with ID : ${id} has been sucessfully deleted`
						}
					]
				}
			, null, 2)
	}
		
	
		
	} catch(err) {
		console.log("ERROR IN /api/restaurants/:id/delete-restaurant")
	
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









// dont write routes here, they will never get executed

export default router // to import to other files

