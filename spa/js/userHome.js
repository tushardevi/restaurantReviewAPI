
/* home.js */

import { customiseNavbar,loadPage } from '../util.js'

export async function setup(node) {
	console.log('userHome: setup')
	try {
		const token = localStorage.getItem('authorization')
		if(token === null){
			await loadPage('login')
		} 
		//customiseNavbar(['home', 'register', 'login','foo']) //navbar if logged out
		//console.log(node)
		document.querySelector('header h1').innerText = 'Home'
		customiseNavbar(['addRestaurant', 'logout']) // navbar if logged in
		await addContent(node)
	} catch(err) {
		console.error(err)
	}
}

// this example loads the data from a JSON file stored in the uploads directory
async function addContent(node) {
	console.log("making fetch call to get all Restaurant details")
	const token = localStorage.getItem('authorization')
	//GET the data to the server
    const url = '/api/restaurants'
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/vnd.api+json',
			'Authorization':token
        }
    }
    const response = await fetch(url,options)
    //console.log(response)


	//
    if(response.status == 200) {
        const restaurants = await response.json()
		await showRestaurants(restaurants,node)
		

} 	else {
        const json = await response.json()
        console.log(json)
        console.log("error when retrieving all restaurants from API??")
        const arr = json.errors
        showMessage(arr[0].detail)

    }



}

async function showRestaurants(restaurants,node){
	console.log("ready to upload data :")
	console.log(restaurants)
	const template = document.querySelector('template#userHome')
	
	for(const restaurant of restaurants) {
		
		const fragment = template.content.cloneNode(true)
		let restaurantName = fragment.getElementById("restaurantName")
		restaurantName.innerText = restaurant.restaurantName

		let postcode = fragment.getElementById("postcode")
		postcode.innerText = restaurant.postcode


		let img_element = fragment.getElementById("picture")
		let img = img_element.querySelector('img')
		img.src = `${window.location.origin}/uploads/restaurantPictures/${restaurant.picture_name}`

		
		let link = fragment.getElementById("link")
		const url = `restaurantDetails_${restaurant.restaurantID}`
		link.href = url
		//fragment.querySelector('td').innerText = restaurant.restaurantName
		//fragment.querySelector('p').innerText = restaurant.postcode
		//const img_element = fragment.querySelector('img')
		//img_element.src = `${window.location.origin}/uploads/restaurantPictures/${restaurant.picture_name}`
		node.appendChild(fragment)
}

	
}
