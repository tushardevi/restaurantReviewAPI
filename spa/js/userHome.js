
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
		await showRestaurants(restaurants.data,node)
		

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
		let caption =fragment.querySelector('caption')
		caption.innerText = "Average Review Score:"

		
		//add a paragrpah to add the Average review Score
		let show_score = document.createElement('p')
		show_score.innerText = restaurant.average_review_score + "/5"
		caption.appendChild(show_score)

		// add a class to table
		let table = fragment.querySelector('table')
		table.classList.add("timecard")
		table.style.margin = '1px 275px'

		// label the headers of the table
		let headers = fragment.querySelectorAll('th')

		for(const header of headers){
        if(header.id == "restaurantName_h") header.innerText = "Restaurant Name"
        if(header.id == "picture_h") header.innerText = "Picture"
        if(header.id == "postcode_h") header.innerText = "Postcode"
    	}




		// add the values for each column in the table
		let restaurantName = fragment.getElementById("restaurantName")
		restaurantName.innerText = restaurant.restaurantName

		let postcode = fragment.getElementById("postcode")
		postcode.innerText = restaurant.postcode

		//create a new img tag and append it to the table
		let img_element = fragment.getElementById("picture")
		let img = document.createElement('img')
		img.src = `${window.location.origin}/uploads/restaurantPictures/${restaurant.picture_name}`
		img.width = 400
		img.height = 300

		img_element.appendChild(img)
	

		// create a new link tag and append it to the table
		let td_link = fragment.getElementById('link')
		let link = document.createElement('a')
		link.innerText = "More Details"
		const url = `restaurantDetails_${restaurant.restaurantID}`
		link.href = url
	
		td_link.appendChild(link)
		


		// append the fragment to the html 
		node.appendChild(fragment)
}

	
}
