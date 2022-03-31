
/* userhOME.js */
import { customiseNavbar, file2DataURI, loadPage, secureGet, err_showMessage, suc_showMessage} from '../util.js'
//import Ajv from 'https://esm.sh/ajv' // for JSON schemas
import {validate_restaurant, checkFile} from './schemas/addRestaurant_schema.js'
export async function setup(node) {
	try {
        const token = localStorage.getItem('authorization')
		if(token === null){
			await loadPage('login')
		} 
		console.log('ADD RESTAURANT: setup')
		//console.log(node)
		document.querySelector('header h1').innerText = 'Add Restaurant'
		customiseNavbar(['userHome','logout'])
        //checkAutho() // check for authorization

         let FormElm = node.querySelector('form')
        // FormElm.style.display = "none"


        //add an event when user tries to add the restaurant
        FormElm.addEventListener('submit',await addRestaurant)

	} catch(err) { // this will catch any errors in this script
		console.error(err)

	}
}


async function addRestaurant(){
    event.preventDefault()
    const token = localStorage.getItem('authorization')

    //get restaurant details
    const formData = new FormData(event.target)
    console.log("FORM DATA")
    console.log(formData)
    const data = Object.fromEntries(formData.entries())

    
    //add the user who uploaded the new restaurant
    data.user = localStorage.getItem('username')

    console.log("actual data")
    console.log(data)
    
    //get restaurant photo
    const file = document.querySelector('input[name="file"]').files[0]
    
    //if photo exists, check its format type
    if (file){
        const check = await checkFile(data.file.type)
        if(check == false){
            const msg = 'invalid file format, only images allowed'
            err_showMessage(msg)
            return
        }
        //add base64 and username keys to the file object
        console.log("Converting file to base64")
        file.base64 = await file2DataURI(file)
        
    }
    
        //validate
    console.log("validating data...")
    const result = await validate_restaurant(data)
    if(result[0] == false){
        err_showMessage(result[1])
        return
    }

    console.log("SENDING DATA TO SERVER: ")
    console.log(data)

    //POST the data to the server
    const url = '/api/restaurants/add'
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/vnd.api+json',
            'Authorization': token
        },
        body: JSON.stringify(data)
    }
    
    const response = await fetch(url, options)
    //console.log(response)

    if(response.status == 200) {
        const json = await response.json()
        console.log(json)
        suc_showMessage('new restaurant added')
        loadPage('userHome')

    } else {
        const json = await response.json()
        console.log(json)
        console.log("ERROR BABY KASE HAI TU??")
        const arr = json.errors
        err_showMessage(arr[0].detail)

    }

}
