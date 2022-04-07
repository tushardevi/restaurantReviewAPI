
/* home.js */

import { customiseNavbar,loadPage,err_showMessage, suc_showMessage } from '../util.js'

export async function setup(node) {
	console.log('Restaurant Details: setup')
	try {
		const token = localStorage.getItem('authorization')
		if(token === null){
			await loadPage('login')
		} 
		//customiseNavbar(['home', 'register', 'login','foo']) //navbar if logged out
		//console.log(node)
		document.querySelector('header h1').innerText = 'Restaurant Details'
		customiseNavbar(['userHome', 'logout']) // navbar if logged in

         await addContent_details(node)
         await addContent_reviews(node)
     

        
		
        
	} catch(err) {
		console.error(err)
	}
}

// this example loads the data from a JSON file stored in the uploads directory
async function addContent_details(node) {
	console.log("making fetch call to get 1 Restaurant detail")
	const token = localStorage.getItem('authorization')
	//GET the data to the server

    const path2 = window.location.pathname
    const name_id = path2.split('_')
		//console(name_id)
	console.log(`path name is: ${name_id[0]} and restaurant id is: ${name_id[1]}`)

    const url = `/api/restaurants/${name_id[1]}/restaurant-details`
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/vnd.api+json',
			'Authorization':token
        }
    }
    const response = await fetch(url,options)
    console.log(response)


	
    if(response.status == 200) {
        console.log("sucessful")

        const restaurant = await response.json()

        console.log("the details of one restaurant:")
        console.log(restaurant.data)
		await showRestaurant(restaurant.data,node)
        //await getAllReviews(name_id[1])
		
} 	else {
        const json = await response.json()
        console.log(json)
        console.log("error when retrieving restaurant details from API")
        const arr = json.errors
        
        err_showMessage(arr[0].detail)

    }



}

async function addContent_reviews(node) {
	console.log("making fetch call to get all reviews")
	const token = localStorage.getItem('authorization')
	//GET the data to the server

    const path2 = window.location.pathname
    const name_id = path2.split('_')
		//console(name_id)
	console.log(`path name is: ${name_id[0]} and restaurant id is: ${name_id[1]}`)

    const url = `/api/restaurants/${name_id[1]}/all-reviews`
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/vnd.api+json',
			'Authorization':token
        }
    }
    const response = await fetch(url,options)
    console.log(response)


	
    if(response.status == 200) {
        console.log("sucessful in getting all reviews")
        const reviews = await response.json()
         
         console.log(reviews)
        await getAllReviews(reviews.data,node)     
            
    } 	else {
        const json = await response.json()
        console.log(json)
        console.log("error when retrieving reviews from API")
        const arr = json.errors
        
        err_showMessage(arr[0].detail)

    }



}

async function getAllReviews(reviews,node){
	console.log("getting all reviews :")
	console.log(reviews)
	const template = document.querySelector('template#restaurantDetails')

    
    if(reviews == "No reviews were found for this restaurant"){
            let para = document.createElement('h2')
            para.innerText = "No reviews were found for this restaurant"
            node.appendChild(para)
        }else{
	// // </section>
            let review_h = document.createElement('h3')
            review_h.innerText = "All Reviews:"
        
            node.appendChild(review_h)
            for(let review of reviews) {
                const fragment = template.content.cloneNode(true)

                //create section to display reviews
                let container = document.createElement('section')
                container.classList.add("output_reviews")

                //create headers for all attributes in review obj
                //and append each one of them into the review section
                let username_h = document.createElement('h2')
                username_h.innerText = "Reviewed by:"
                container.appendChild(username_h)

                //username who reviewed the restaurant
                let username = document.createElement('p')
                username.innerText = review.username
                container.appendChild(username)

                //ratings
                let ratings_h = document.createElement('h2')
                ratings_h.innerText = "Ratings (out of 5):"
                container.appendChild(ratings_h)

                let service_h = document.createElement('h2')
                service_h.innerText = "Service:"
                container.appendChild(service_h)

                let service_rating = document.createElement('p')
                service_rating.innerText = review.service_rating
                container.appendChild(service_rating)

                let food_h = document.createElement('h2')
                food_h.innerText = "Food:"
                container.appendChild(food_h)

                let food_rating = document.createElement('p')
                food_rating.innerText = review.food_rating
                container.appendChild(food_rating)

                
                let value_h = document.createElement('h2')
                value_h.innerText = "Value:"
                container.appendChild(value_h)

                let value_rating = document.createElement('p')
                value_rating.innerText = review.value_rating
                container.appendChild(value_rating)

                //comment
                let comment_h = document.createElement('h2')
                comment_h.innerText = "Comment:"
                container.appendChild(comment_h)

                let comment= document.createElement('textarea')
                comment.innerText = review.comment
                comment.disabled = true
                comment.style="background-color:pink;"
                container.appendChild(comment)

                //appened the container to the template and proceed to the 
                //next review 
                fragment.appendChild(container)
                
                node.appendChild(fragment)
            }
    }

	
}






async function showRestaurant(restaurant,node){
	console.log("DISPLAYING SINGLE RESTAURANT DETAIL :")
	console.log(restaurant)
    const restaurant_details = restaurant.data
    console.log(restaurant_details)
    
	const template = document.querySelector('template#restaurantDetails')

    //const fragment = template.content.cloneNode(true)

    //creating table
    let table = node.querySelector('table')
    table.classList.add("timecard")
 
    //add caption to table
    let caption = node.querySelector('caption')
    caption.innerText = "Average Ratings:"


    //get all the scores for each rating category
    const scores = restaurant_details.avg_scores
    // add the average review score for food
    let show_scores= document.createElement('p')

    show_scores.innerText = "  Value:" + scores.food_avg + "  Service:" + scores.service_avg + "  Food :" + scores.food_avg
    show_scores.style.color = "yellow"
    caption.appendChild(show_scores)

    



    //set all the headers
    let headers = node.querySelectorAll('th')
    console.log(headers)
    for(const header of headers){
        if(header.id == "restaurantName_h") header.innerText = "Restaurant Name"
        if(header.id == "cuisine_h") header.innerText = "Cuisine"
        if(header.id == "postcode_h") header.innerText = "Postcode"
        if(header.id == "restaurant_desc_h") header.innerText = "Description"
        if(header.id == "date_time_h") header.innerText = "Date Added"
        if(header.id == "picture_h") header.innerText = "Picture"

    }
   


   // upload the restaurant details
    let restaurantName = node.getElementById("restaurantName")
    restaurantName.innerText =  restaurant_details.restaurantName

    let postcode = node.getElementById("postcode")
    postcode.innerText =  restaurant_details.postcode

    let restaurant_desc = node.getElementById("restaurant_desc")
    restaurant_desc.innerText =  restaurant_details.restaurant_desc

    let cuisine = node.getElementById("cuisine")
    cuisine.innerText =  restaurant_details.cuisine

     let date_time = node.getElementById("date_time")
    date_time.innerText =  restaurant_details.date_time

    let img_element = node.getElementById("picture")
    let img = img_element.querySelector('img')
    img.src = `${window.location.origin}/uploads/restaurantPictures/${ restaurant_details.picture_name}`
    img.width = "500"
    img.height = "300"

    //

    let link = document.createElement('a')
	const url = `addReview_${restaurant_details.restaurantID}_${ restaurant_details.restaurantName}_${ restaurant_details.postcode}`
    link.innerText = "Add Review"
	link.href = url

    let th = node.getElementById("link")
    //if the user has not reviewed for the restaurant then show the add review button
    if(restaurant.reviewStatus == false) th.appendChild(link)
    console.log("URL linked :")
    console.log(url)

  
    
    
    // let addReviewBtn = node.getElementById("addReview")
    

    // addReviewBtn.addEventListener('click', async() => {
    //             console.log("clicke34")
    //     })

    //node.appendChild(addReviewBtn)

    //fragment.querySelector('td').innerText = restaurant.restaurantName
    //fragment.querySelector('p').innerText = restaurant.postcode
    //const img_element = fragment.querySelector('img')
    //img_element.src = `${window.location.origin}/uploads/restaurantPictures/${restaurant.picture_name}`
  //  node.appendChild(fragment)

}
