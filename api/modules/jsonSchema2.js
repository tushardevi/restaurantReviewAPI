import Ajv from './ajv.js'

const ajv = new Ajv({allErrors: true})

const restaurant_details =  JSON.stringify({
 // "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "businessName": {
      "type": "string"
       minLength: 3
    },
    "cuisine": {
      "type": "string"
      minLength: 3
    },
    "review": {
      "type": "array",
      "items": [
        {
          "type": "object",
          "properties": {
            "rating": {
              "type": "integer"
              minimum : 1,
              maximum: 5
            },
            "comment": {
              "type": "string"
            }
          },
          "required": [
            "rating"
          ]
        }
      ]
    },
    "address": {
      "type": "object",
      "properties": {
        "StreetName": {
          "type": "string"
        },
        "postcode": {
          "type": "string"
        }
      },
      "required": [
        "StreetName",
        "postcode"
      ]
    }
  },
  "required": [
    "id", // where will i generate ar random id? before puting it into db ?
    "businessName",
    "cuisine",
    "review",
    "address"
  ]
})


export const restaurant_details_schema = ajv.compile(restaurant_details)
