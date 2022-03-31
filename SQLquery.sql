-- table to store restaurant details

-- CREATE TABLE IF NOT EXISTS restaurants (
--   restaurantID MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--   restaurantName VARCHAR(25) NOT NULL,
--   cuisine VARCHAR(70) NOT NULL,
--   postcode TEXT(500) NOT NULL,
--   restaurant_desc TEXT(1500) NOT NULL,
--   picture_name TEXT NOT NULL,
--   username MEDIUMINT(8) UNSIGNED,
--   date_time DATETIME NOT NULL, -- format: YYYY-MM-DD HH:MI:SS
--   FOREIGN KEY(username) REFERENCES accounts(id)
-- );

--table to store reviews of all the restaurants;

CREATE TABLE IF NOT EXISTS reviews( 
  reviewID MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_rating INT,
  service_food INT,
  service_value INT,
  comment TEXT,
  restaurantID MEDIUMINT(8) UNSIGNED,
  user_id MEDIUMINT(8) UNSIGNED,
  
  FOREIGN KEY(restaurantID) REFERENCES restaurants(restaurantID),
  FOREIGN KEY(user_id) REFERENCES accounts(id)

);

-- SELECT rating. comment FROM reviews WHERE restaurantID == 1;



-- INSERT INTO restaurants(restaurantID,restaurantName, cuisine,streetName,postcode)
-- 	VALUES(1,"Pizza House", "Italian","Gosford St","CV31 2FF");

-- INSERT INTO restaurants(restaurantName, cuisine,streetName,postcode)
-- 	VALUES("Oriental Palace", "Chinese","St Andrew","CV31 6LO");

-- INSERT INTO restaurants(restaurantName, cuisine,streetName,postcode)
-- 	VALUES("Curry House", "Indian","Ashley Rd","CV32 5HH");

-- INSERT INTO restaurants(restaurantName, cuisine,streetName,postcode)
-- 	VALUES("Takeway24/7", "Variety","Maxy St","CV33 5TY");


-- //ADd reviews

-- INSERT INTO reviews(rating , comment , restaurantID)
--   VALUES(1,"aweful",1);

-- INSERT INTO reviews(rating , comment , restaurantID)
--  VALUES(2,"not that tasty but okay, next time I might not even go there",2);

-- INSERT INTO reviews(rating , comment , restaurantID)
--  VALUES(5,"I went there last weekend with my family, i loved the people and the staff, food was excellent",3);

