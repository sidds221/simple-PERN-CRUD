let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let pg = require('pg');
let cors = require('cors');
const PORT = 3000;

let pool = new pg.Pool({
	port: 5432,
	password: 'test',
	database: 'countries',
	max: 10,
	host: 'localhost',
	user: 'postgres'
});




let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('dev'));

app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next(); 
});

app.delete('/api/remove/:id', (request, response)=>{
	const id = request.params.id;
	pool.connect((err,db,done)=>{
		if(err){
			return response.status(400).send(err);
		}
			db.query('DELETE FROM country WHERE id=$1',[id], (err, result)=>{
				done();
				if(err){
					return response.status(400).send(err);
				}
					return response.status(200).send({message: 'success'});
				
			});
		
	});
});

app.get('/api/countries', (request, response)=>{
	pool.connect((err,db,done)=>{
		if(err){
			return response.status(400).send(err);
		}else{
			db.query('SELECT * FROM country', function(err, table){
				done();
				if(err){
					return response.status(400).send(err)
				}
					return response.status(200).send(table.rows)
				
			});
		}
	});
});

app.post('/api/new-country',function(request, response){
	var country_name = request.body.country_name;
	var continent_name = request.body.continent_name;
	var id = request.body.id;
	let values = [country_name, continent_name, id];

	pool.connect((err, db, done) => {
	if(err){
		return response.status(400).send(err);
	}
	
		db.query('INSERT INTO country (country_name, continent_name, id) VALUES ($1, $2, $3)',[...values] ,(err, table) => {
			if(err){
				return response.status(400).send(err);
			}
			
				//console.log(table.rows[0].country_name);
				console.log('DATA INSERTED');
				response.status(201).send({message: 'Data Inserted'});
			
		});
	
});
});

app.listen(PORT, () => console.log('listening to port '+PORT));