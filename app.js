import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "recipe-keeper",
  password: process.env.DB_PASSWORD,
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/**
 * Route for fetching recipes from Spoonacular API.
 *
 * @api {get}
 * /recipes Fetch recipes
 * @apiName FetchRecipes
 * @apiGroup Recipes
 *
 * @apiParam {String} query Search query for recipes
 *
 * @apiSuccess {Object[]} recipes Array of recipe objects
 * @apiSuccess {String} recipes.title Title of recipe
 * @apiSuccess {Number} recipes.readyInMinutes Preparation time in minutes
 * @apiSuccess {Number} recipes.servings Number of servings
 * @apiSuccess {String} recipes.sourceUrl URL to recipe page
 *
 * @apiError (500 Internal Server Error) {String} message Error message
 */
app.get("/recipes", async (req, res) => {
    try {
      const { query } = req.query; // Extract query parameter from request
      const apiKey = process.env.SPOONACULAR_API_KEY;
      const apiUrl = `https://api.spoonacular.com/recipes/search?query=${query}&apiKey=${apiKey}`;
  
      const response = await axios.get(apiUrl); // Make GET request to Spoonacular API
      const recipes = response.data.results; // Extract recipes from API response

      res.render("recipes.ejs", { recipes }); // Render recipes.ejs template with fetched recipes
    } catch (error) {
      console.error("Error fetching recipes:", error.message);
      res.status(500).send("Error fetching recipes");
    }
  });

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
