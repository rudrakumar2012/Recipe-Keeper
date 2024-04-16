import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
})