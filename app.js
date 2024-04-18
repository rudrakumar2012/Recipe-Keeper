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

// Route to fetch random recipes from Spoonacular API
app.get("/random-recipes", async (req, res) => {
  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    const apiUrl = `https://api.spoonacular.com/recipes/random?number=5&apiKey=${apiKey}`;

    const response = await axios.get(apiUrl);
    const recipes = response.data.recipes;

    res.render("recipes.ejs", { recipes });
  } catch (error) {
    console.error("Error fetching random recipes:", error.message);
    res.status(500).send("Error fetching random recipes");
  }
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Route to display favorite recipes
app.get("/favorites", async (req, res) => {
  try {
    const queryText = `
          SELECT * FROM favorites ORDER BY id ASC ;
      `;
    const { rows } = await db.query(queryText);

    res.render("favorites.ejs", { favorites: rows });
  } catch (error) {
    console.error("Error fetching favorite recipes:", error.message);
    res.status(500).send("Error fetching favorite recipes");
  }
});

// Add favorite recipe
app.post("/favorites/add", async (req, res) => {
  try {
    const { recipeId, title, sourceUrl } = req.body;

    // Check if the recipe with this recipeId already exists in favorites
    const checkQuery = `
      SELECT * FROM favorites WHERE recipe_id = $1;
    `;
    const checkValues = [recipeId];
    const { rows } = await db.query(checkQuery, checkValues);

    if (rows.length > 0) {
      // Recipe already exists in favorites
      res.redirect("/favorites");
    } else {
      // Add the recipe to favorites
      const insertQuery = `
        INSERT INTO favorites (recipe_id, title, source_url)
        VALUES ($1, $2, $3);
      `;
      const insertValues = [recipeId, title, sourceUrl];
      await db.query(insertQuery, insertValues);

      res.redirect("/favorites");
    }
  } catch (error) {
    console.error("Error adding favorite recipe:", error.message);
    res.status(500).send("Error adding favorite recipe");
  }
});

// Delete favorite recipe
app.post("/favorites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
          DELETE FROM favorites
          WHERE id = $1;
      `;

    const values = [id];
    await db.query(queryText, values);

    res.redirect("/favorites"); // Redirect to favorite recipes page after deletion
  } catch (error) {
    console.error("Error deleting favorite recipe:", error.message);
    res.status(500).send("Error deleting favorite recipe");
  }
});

// Add or Update note for a favorite recipe
app.post("/favorites/:id/note", async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    let queryText = '';
    let values = [];

    if (note) {
      // Update existing note
      queryText = `
        UPDATE favorites
        SET note = $1
        WHERE id = $2;
      `;
      values = [note, id];
    } else {
      // Add new note (if note is empty, remove existing note)
      queryText = `
        UPDATE favorites
        SET note = NULL
        WHERE id = $1;
      `;
      values = [id];
    }

    await db.query(queryText, values);

    res.redirect("/favorites"); // Redirect back to favorites page after updating note
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).send("Error updating note");
  }
});
// Delete note for a favorite recipe
app.delete("/favorites/:id/note", async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = `
      UPDATE favorites
      SET note = NULL
      WHERE id = $1;
    `;

    const values = [id];
    await db.query(queryText, values);

    res.sendStatus(204); // Send a success response with no content
  } catch (error) {
    console.error("Error deleting note:", error.message);
    res.status(500).send("Error deleting note");
  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
