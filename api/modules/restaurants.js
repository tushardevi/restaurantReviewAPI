import { db } from './db.js'
import { saveFile } from './util.js'
//import {validate_fun} from '../schemas/addRestaurant_schema.js'


export async function getAllRestaurants() {
    console.log("FUNCTION / getAllRestaurants")
    try{
        
        const sql = `SELECT restaurantID,restaurantName,postcode,picture_name FROM restaurants;`
        const allRestaurants = await db.query(sql)
        
        if(allRestaurants.length == 0){
            return JSON.stringify("")
        }
        
        for(const restaurant of allRestaurants){
            const score = await calculate_all_avg_score(restaurant.restaurantID)
            restaurant.average_review_score = score
        }
       
       // console.log("ALL Restaturant DATA:")
       // console.log(allRestaurants)


        allRestaurants.forEach(restaurant => {
		restaurant.url = `https://pony-stop-8080.codio-box.uk/api/restaurants/${restaurant.restaurantID}/details`
	})
        console.log(allRestaurants)
	    return allRestaurants 

    }catch(err){
        console.log(err.message)
    }
	

}

async function calculate_all_avg_score(id){
    try{
        // get all ratings for the restaurant
        let sql = `SELECT service_rating,food_rating,value_rating FROM reviews WHERE restaurantID = ${id}`
        const all_ratings = await db.query(sql)
        console.log("ARRRRRRAAYYY")
        console.log(all_ratings)
        let total = 0
        


        //take sum of all categories
        for(const rating of all_ratings){
                total=  total + rating.service_rating + rating.food_rating + rating.value_rating
        }


        //take average (sum of all categories / total number of ratings)
        const average = total / (all_ratings.length * 3)
        console.log("AVERAGE SCORE IS : " + average)
        return parseInt(average)

    }catch(err){
        console.log(err.message)
    }
    
}

async function calculate_sep_avg_score(id){
    try{
        // get all service-ratings for the restaurant
        
        let sql = `SELECT service_rating FROM reviews WHERE restaurantID = ${id}`
        const all_service = await db.query(sql)
  
        let service_total = 0
    
        //take sum of all service_ratings
        for(const rating of all_service){
                service_total =  service_total  + rating.service_rating
        }

        //take average of service_rating
        const service_avg =  Math.ceil(service_total/all_service.length)


        //********************** *********************/
        //get all food_ratings
        sql = `SELECT food_rating FROM reviews WHERE restaurantID = ${id}`
        const all_food = await db.query(sql)
  
        let food_total = 0
    
        //take sum of all food_ratings
        for(const rating of all_food){
                food_total =  food_total  + rating.food_rating
        }

        //take average of  food_rating
        const food_avg = Math.ceil(food_total/all_food.length)

    //******************************************** */
          //get all value_ratings
        sql = `SELECT value_rating FROM reviews WHERE restaurantID = ${id}`
        const all_value = await db.query(sql)
  
        let value_total = 0
    
        //take sum of all food_ratings
        for(const rating of all_value){
                value_total =  value_total  + rating.value_rating 
        }

        //take average of  food_rating
        const value_avg =  Math.ceil(value_total/all_value.length)




       




        return {service_avg,food_avg,value_avg}

    }catch(err){
        console.log(err.message)
    }
    
}




async function checkRestaurantID(id){
        const check_id = `SELECT count(restaurantID) AS count FROM restaurants WHERE restaurantID="${id}";`
        let records = await db.query(check_id)
	    if(!records[0].count) return -1 
}

async function getDate(restaurant){
        let date_time = restaurant[0].date_time
    
        date_time = date_time.toString(date_time)
        date_time = date_time.split(" ")
       
        date_time = date_time[0] +' '+ date_time[1] +' '+ date_time[2] +' '+ date_time[3]
        restaurant[0].date_time = date_time
        console.log(restaurant[0].date_time)

        return restaurant

}

/** function to get one restaurant details*/ 
export async function getRestaurant(id) {
    try{
        
        const res = await checkRestaurantID(id)
        if(res == -1) return -1
        

        console.log("fetching restaurantDetails from server!")
        
        const sql = `SELECT restaurantID,restaurantName,cuisine,postcode,restaurant_desc,picture_name,date_time FROM restaurants WHERE restaurantID = ${id};`
        let restaurant = await db.query(sql)


        if(restaurant.length == 0){
            return JSON.stringify("")
        }
        restaurant = await getDate(restaurant)
        const all_reviews = await calculate_sep_avg_score(restaurant[0].restaurantID)

        console.log("STUDENTTTT OF YEAAAAAAARRRRR ")
        console.log(JSON.stringify(all_reviews))
        restaurant[0].avg_scores = all_reviews


        console.log(restaurant[0])
        // //attach the reviews to te restaurant object
        // restaurant[0].reviews = Reviews
       

   
	    // return JSON.stringify(restaurant[0])  // Now each restaurant object has a reviews attribute which shows all reviews for that restaurant
        return restaurant[0]
    }catch(err){
        return err
        console.log(err.message)
    }
	

}

export async function addRestaurant(data) {
    //If there is already a restaurant in the database that shares the same name and postcode (not case sensitive), the restaurant should not be added.
    try{
        
        console.log("Adding new restaurant to the DB")
        const datetime = await getDateTime()
        console.log("current time is: " + datetime)
        const userID = await getUserID(data.user)

        let filename = 'placeholder.png'

        //if photo is available then save it
        if(data.file){
            if(data.file.base64){
            console.log("PHOTO IS AVAILABLE...")
            filename =  saveFile(data.file.base64, data.user)
        }

        }
        
        
        
        //postocode to uppercase
        let up_postcode = data.postcode
        up_postcode = up_postcode.toUpperCase()

        //set the first letter of restaurant name to upper case
        let low_restaurant = data.restaurantName
        low_restaurant = low_restaurant.toLowerCase()

        //insert all details to the DB
        const sql = `INSERT INTO restaurants(restaurantName,  cuisine, postcode,restaurant_desc,picture_name,username,date_time) \
        VALUES("${low_restaurant}", "${data.cuisine}","${up_postcode}","${data.restaurant_desc}",\
        "${filename}","${userID}","${datetime}")`

        await db.query(sql)

        console.log("new restaurant uploaded by " + data.user + " on " + datetime)

        
       

    }catch(err){
        throw err
        console.log(err.message)
    }
	

}

//function to add a review to a particular restaurant
export async function addReview(data,username) {

    try{
        console.log("ADD REVIEW DB")
        console.log(data)

        const res = await checkRestaurantID(data.restaurantID)
        if(res == -1) return -1
         

        const userID = await getUserID(data.user)

        console.log("adding review to restaurant " + data.restaurantID)

       // const userID = await getUserID(data.user)

        //insert review details to the DB
        const sql = `INSERT INTO reviews(service_rating,  food_rating, value_rating,comment,restaurantID,user_id) \
        VALUES( "${data.service}", "${data.food}","${data.value}","${data.comment}",\
        "${data.restaurantID}","${userID}")`

        await db.query(sql)

        console.log(`new review for restaurant id : ${data.restaurantID} by username: ${data.user}`)
        return 1
        
       

    }catch(err){
        throw err
        console.log(err.message)
    }
	

}

export async function checkForReview(restaurantID,user){

    try{
        console.log("CHECK FOR REVIEW/")
       
        const userID = await getUserID(user)
        
        console.log("Checking if user :" + user + " has already reviewed for restaurant with ID: " + restaurantID)
        let sql = `SELECT count(reviewID) AS count FROM reviews WHERE user_id="${userID}" AND restaurantID = "${restaurantID}";`

        let reviews = await db.query(sql)
        console.log(reviews)
	    if(reviews[0].count == 0){
            console.log("NOT reviewed")
            return false // If user has not reviewed for restaurant

        } else{
            console.log("ALready reviewed")
            return true // if user has already reviewed for resturant
        }


    }catch(err){
        return err
        console.log(err.message)
    }

}


export async function getAllReviews(restaurantID) {
    console.log("FUNCTION / getAllReviews")

     const res = await checkRestaurantID(restaurantID)
        if(res == -1) return -1

    try{

        let sql = `SELECT service_rating,food_rating,value_rating,comment,user_id FROM reviews WHERE restaurantID = ${restaurantID};`
        const allReviews= await db.query(sql)
        
        if(allReviews.length == 0){
            return JSON.stringify("No reviews were found for this restaurant")
        }
        //console.log("alll reviews here :")
        //console.log(allReviews)

        
        for(let review of allReviews){
            sql = `SELECT user FROM accounts WHERE id = ${review.user_id}`
            const username = await db.query(sql)
            review.username = username[0].user
            
            delete review.user_id
        }

        console.log("AFTER attaching username all reviews")
        //console.log(allReviews)

        //console.log("ALL Restaturant DATA:")
        //console.log(allRestaurants)


   
	    return allReviews

    }catch(err){
        console.log(err.message)
    }
	

}







//function to check if the restaurants exists in the database
export async function checkDuplicates(postcode,restaurantName){
    console.log("DUPLICATES FUCNTION")
    let up_postcode = postcode.toUpperCase()
    let low_restaurant = restaurantName.toLowerCase()

    try{
        const sql = `SELECT count(restaurantID) AS count FROM restaurants WHERE postcode="${up_postcode}" AND restaurantName = "${low_restaurant}";`
		const records = await db.query(sql)
        console.log(records)
		if(records[0].count > 0){
            console.log(`Restaurant with name:  ${restaurantName} and postcode:  ${postcode} already exists!`)
            return false
            }
        return true

    }catch(err){
        console.log("error in checkDuplicates function")
        console.log(err.message)
    }
}

//function to get the userID by giving the username as the argument
async function getUserID(username){
    try{
        console.log("user is : "+ username)
        const sql = `SELECT id FROM accounts WHERE user = "${username}"`
        const userid = await db.query(sql)
        return userid[0].id

    }catch(err){
        console.log("error in getUserID function")
        console.log(err.message)
    }
    

}

//function which formats a date time to SQL datetime format
async function getDateTime(){

    const currentDate = new Date();
    const time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    

    let cMonth = currentDate.getMonth() + 1 
    if (cMonth  < 10){
        cMonth = '0'+cMonth
    }
    const datetime = currentDate.getFullYear() +'-' + cMonth+ '-' + currentDate.getDate() + ' ' + time

    return datetime


}

export async function deleteRestaurant(id){
    try{
        const res = await checkRestaurantID(id)
        if(res == -1) {
            console.log("restaurants exists")
            return -1
        }
        console.log("deleting restautant")
        const sql = `DELETE FROM restaurants WHERE restaurantID = "${id}"`
        await db.query(sql)
        return 1
    }catch(err){
        console.log("ERROR WHEN DELETING A RESTAURANT")
        console.log(err.message)

    }
    

}





export default {getAllRestaurants, getRestaurant, addRestaurant,deleteRestaurant}