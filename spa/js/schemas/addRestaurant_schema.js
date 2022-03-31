/* addRestaurant_schema.js */

import Ajv from 'https://esm.sh/ajv' 

const ajv = new Ajv({ allErrors: true })

/** Function to validate data using JSON schema */

export async function validate_restaurant(data){
    console.log("JSON SCHEMA : /addRestaurant_schema")
    const ajv = new Ajv({ allErrors: true })
    // creating a schema for checking restaurants details
    const addRestaurant_schema = {
        // @async:true,
        title: "addRestaurant",
        description: 'schema to add restaurant details',
        properties:{
            restaurantName:{
                type:'string',
                minLength: 2,
                maxLength: 30
                },
            cuisine:{
                type:'string',
                minLength: 2,
                maxLength: 20
                },
            postcode:{
                type:'string',
                minLength: 7,
                maxLength: 7
                },
            restaurant_desc:{
                type:'string',
                maxLength: 250
                }
        }
    }
    //compile the schema
    const validate= ajv.compile(addRestaurant_schema)
    
    //create a temp variable to store the data
    const temporary_data = JSON.stringify(data)
    

    //clonned the data to new variable
    const clonned_data = JSON.parse(temporary_data)
    //console.log(clonned_data)

    delete clonned_data['file']
    //console.log("clonned after deleting files")
    //console.log(clonned_data)

    const valid = validate(clonned_data)

    //if not valid then send a an error msg to the user
    if(valid == false){
        let path = validate.errors[0].instancePath
        path = path.split('/')
        console.log(path[0])
        const msg = validate.errors[0].message
        // throw new Error(msg)
        const err_msg = msg + " at  "+path[1]
        return [false,err_msg]

    }else{
        return [true,-1]
    }

}

/** Function to check the file format */
export async function checkFile(fileInfo) {
    console.log("CHECKING FILE FORMAT: /check ")
   
    const includes = fileInfo.includes('image')
    if(!includes) {
        return false
    }
    else{
        return true
    }

}





