
/* addReview.js */
import { customiseNavbar, file2DataURI, loadPage, secureGet, err_showMessage, suc_showMessage } from '../util.js'
//import Ajv from 'https://esm.sh/ajv' // for JSON schemas
import {validate_restaurant, checkFile} from './schemas/addRestaurant_schema.js' 

export async function setup(node) {
	try {
        const token = localStorage.getItem('authorization')
		if(token === null){
			await loadPage('login')
		} 
		console.log('ADD REVIEW: setup')
		//console.log(node)
		document.querySelector('header h1').innerText = 'Add Review'
		customiseNavbar(['userHome','logout'])
        //checkAutho() // check for authorization

        let FormElm = node.querySelector('form')

        const path = window.location.pathname
        const content = path.split('_')

	    console.log(`path name is: ${content[0]} and restaurant id is: ${content[1]}, restaurant Name is: ${content[2]} and postcode is ${content[3]}`)

        const name = node.getElementById("restaurantName")
        const postcode = node.getElementById("postcode")
      

        name.innerText = content[2]
        postcode.innerText = content[3]
        // FormElm.style.display = "none"
       
        //add an event when user tries to add the restaurant

        //sliders
      

        // let btn = node.getElementById("addReviewBtn")

        // btn.addEventListener('click',()=>{
        //     event.preventDefault()

        //     btn.disabled = true
        //    // btn.style.display = "none"

        // })
        // FormElm.addEventListener('click',()=>{
        //     event.preventDefault()
            
            

        //    // FormElm.style.display = "none"
        //     console.log("button clicked")
        // })
       
        // service slider
        await service_slider(node)

        //food slider
        await food_slider(node)

        // value slider
        await value_slider(node)

        node.onload = (event)=>{
            console.log("loaded like 50 cent")
        }




        FormElm.addEventListener('submit',await addReview)

	} catch(err) { // this will catch any errors in this script
		console.error(err)

	}
}

// var slider = document.getElementById("myRange");
// var output = document.getElementById("demo");
// output.innerHTML = slider.value; // Display the default slider value

// // Update the current slider value (each time you drag the slider handle)
// slider.oninput = function() {
//   output.innerHTML = this.value;
// }



async function addReview(){
    event.preventDefault()
    const token = localStorage.getItem('authorization')
    //get review details

    const formData = new FormData(event.target)
    console.log("FORM DATA")
    //console.log(formData)
    const data = Object.fromEntries(formData.entries())

    
    //add the user who uploaded the new restaurant
    data.user = localStorage.getItem('username')

    // let service_slider = node.getElementById("service")
   
     

  //  data.service = service_slider.value
    // data.value = 
    // data.food = 
    // data.restaurantID = 


    //add the RestaurantID to the review objectconst path2 = window.location.pathname
   // const content = path2.split('_')
		//console(name_id)
	//console.log(`path name is: ${content[0]} and restaurant id is: ${content[1]}, restaurant Name is: ${content[2]} and postcode is ${content[3]}`)
    console.log(data)
    const path = window.location.pathname
    const content = path.split('_')



        //validate
//     console.log("validating data...")
//    // const result = await validate_restaurant(data)
//     // if(result[0] == false){
//     //     showMessage(result[1])
//     //     return
//     // }

    console.log("SENDING REVIEW TO SERVER: ")
    console.log(data)

//     //POST review to the server
    const url = `/api/restaurants/${content[1]}/add-review`
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/vnd.api+json',
            'Authorization': token
        },
        body: JSON.stringify(data)
    }
    
    const response = await fetch(url, options)
    console.log(response)

    if(response.status == 200) {
        const json = await response.json()
        console.log(json)
        suc_showMessage('new Review has been added')
        loadPage(`restaurantDetails_${content[1]}`)

    } else {
        const json = await response.json()
        console.log(json)
        console.log("ERROR when adding Review /addReview")
        const arr = json.errors
        err_showMessage(arr[0].detail)

    }

}

async function service_slider(node){
    let service_slider = node.getElementById("service")
    let service_out = node.getElementById("service_out")
    service_out.innerText = service_slider.value

    service_slider.oninput = function(){
        service_out.innerText = this.value
    }


}
async function food_slider(node){
    let food_slider = node.getElementById("food")
    let food_out = node.getElementById("food_out")
    food_out.innerText = food_slider.value

    food_slider.oninput = function(){
        food_out.innerText = this.value
    }


}

async function value_slider(node){
    let value_slider = node.getElementById("value")
    let value_out = node.getElementById("value_out")
    value_out.innerText = value_slider.value

   value_slider.oninput = function(){
        value_out.innerText = this.value
    }


}
