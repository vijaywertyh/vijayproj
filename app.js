const express = require('express');
const port = 3000;
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');



// You can choose a different port if needed
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
let db = undefined
// free online mysql hosting server::
try {
    db = mysql.createConnection({
        host: 'sql12.freesqldatabase.com',
        user: 'sql12659261',
        password: 'fTHfPg5wbS',
        database: 'sql12659261',
    });
    console.log('connection established successfully');

} catch (e) {
    console.error(e);
    console.log("error in mysql connection - " + e.message);
}


// User registration
app.post('/register', (req, res) => {

    try {
        let { first_name, last_name } = req.body;
        let userExistenceQuery = `SELECT * FROM users WHERE first_name=${JSON.stringify(first_name)} AND last_name=${JSON.stringify(last_name)}`;
        db.query(userExistenceQuery, (userExistenceErr, userExistenceResults) => {
            if (userExistenceErr) {
                console.error(userExistenceErr);
                res.status(500).json({ error: 'Failed to check user existence' });
            } else if (userExistenceResults && userExistenceResults.length > 0) {
                res.status(500).json({ error: 'User alredy existed' });
            } else {
                let query = 'INSERT INTO users (first_name, last_name) VALUES (?, ?)';
                db.query(query, [first_name, last_name], (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).json({ error: 'Failed to register user' });
                    } else {
                        console.log(result);
                        res.json({ message: 'User registered successfully', userId: result.userId, status: 200 });
                    }
                })
            }
        })
    } catch (e) {
        console.log("error in register - " + e.message);
        res.status(500).json({ error: 'Internal server error in register api',status:500 });
    }

});



// Combined API for Vehicle Selection and Booking
app.post('/user/book/vehicle', (req, res) => {
    try {
        let resultId = undefined
        const { type, model, vehicle } = req.body;
        if (type == undefined || type == null) {
            type = ''
        }
        let start_date = new Date()// should come from payload 
        let end_date = new Date()// should come from payload 
        //  continue with the vehicle selection and booking logic
        if (type != undefined || type != null) {
            if (model) {
                if (model && vehicle) {
                    // Check for overlapping bookings
                    const overlapQuery = 'SELECT * FROM bookings WHERE vehicle_type = ? AND vehicle_model = ? AND vehicle_name = ? AND start_date <= ? AND end_date >= ?';
                    db.query(overlapQuery, [type, model, vehicle, end_date, start_date], (overlapErr, overlapResults) => {
                        if (overlapErr) {
                            console.error(overlapErr);
                            res.status(500).json({ error: 'Failed to check for overlapping bookings' });
                        } else if (overlapResults.length > 0) {
                            res.status(400).json({ error: 'Overlapping bookings found' });
                        } else {
                            // Insert the booking into the database:
                            const insertQuery = 'INSERT INTO bookings (user_id, vehicle_type, vehicle_model, vehicle_name, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)';
                            db.query(insertQuery, [resultId, type, model, vehicle, start_date, end_date], (insertErr, insertResult) => {
                                if (insertErr) {
                                    console.error(insertErr);
                                    res.status(500).json({ error: 'Failed to submit the booking' });
                                } else {
                                    res.json({ message: 'Vehicle Book successfully', status: 200 });
                                }
                            });
                        }
                    });
                } else {
                    //database to retrieve available vehicles for the selected type and model
                    const vehicleQuery = 'SELECT vehicle_name FROM vehicles WHERE TYPE = ? AND model = ?';
                    db.query(vehicleQuery, [type, model], (vehicleErr, vehicleResults) => {
                        if (vehicleErr) {
                            console.error(vehicleErr);
                            res.status(500).json({ error: 'Failed to get available vehicles' });
                        } else {
                            const availableVehicles = vehicleResults.map((result) => result.vehicle_name);
                            res.json({ availableVehicles,status:200 });
                        }
                    });
                }
            } else {
                // database to retrieve available models for the selected type
                const modelQuery = 'SELECT DISTINCT model FROM vehicles WHERE type = ?';
                db.query(modelQuery, [type], (modelErr, modelResults) => {
                    if (modelErr) {
                        console.error(modelErr);
                        res.status(500).json({ error: 'Failed to get available models' });
                    } else {
                        const availableModels = modelResults.map((result) => result.model);
                        res.json({ availableModels,status:200 });
                    }
                });
            }
        } else {
            res.status(400).json({ error: 'Vehicle type is required',status:400 });
        }


    } catch (e) {
        console.log('Error in vehicle selection/booking - ' + e.message);
        res.status(500).json({ error: 'Internal server error while booking',status:500 });
    }
});

app.get('*', function response(req, res) {
	res.send('Car booikng');
});

app.listen(3000 || port, () => {
    console.log('Server is running on port 3000');
});