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

//Fetch recipes
app.get("/recipes", async (req, res) => {
  try {
    const { query } = req.query;
    const apiKey = process.env.EDAMAM_API_KEY;
    const appId = process.env.EDAMAM_APP_ID;
    const searchUrl = `https://api.edamam.com/search?q=${query}&app_id=${appId}&app_key=${apiKey}`;
    const response = await axios.get(searchUrl);
    const recipes = response.data.hits.map(hit => hit.recipe);
    res.render("recipes.ejs", { recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error.message);
    res.status(500).send("Error fetching recipes");
  }
});

//Fetch random recipes
app.get("/random-recipes", async (req, res) => {
  try {
    const apiKey = process.env.EDAMAM_API_KEY;
    const appId = process.env.EDAMAM_APP_ID;
    const defaultQuery = "recipe";
    const maxIndex = 95; 
    const randomFrom = Math.floor(Math.random() * maxIndex); 
    const randomTo = randomFrom + 5; 
    const apiUrl = `https://api.edamam.com/search?q=${defaultQuery}&app_id=${appId}&app_key=${apiKey}&from=${randomFrom}&to=${randomTo}`;
    const response = await axios.get(apiUrl);
    const recipes = response.data.hits.map(hit => hit.recipe);
    res.render("recipes.ejs", { recipes });
  } catch (error) {
    console.error("Error fetching random recipes:", error.message);
    res.status(500).send("Error fetching random recipes");
  }
});

app.get("/", (req, res) => {
  res.render("index.ejs");
})

//Favorites
app.get("/favorites", async (req, res) => {
  try {
    const queryText = "SELECT * FROM favorites ORDER BY id ASC";
    const { rows } = await db.query(queryText);

    res.render("favorites.ejs", { favorites: rows });
  } catch (error) {
    console.error("Error fetching favorite recipes:", error.message);
    res.status(500).send("Error fetching favorite recipes");
  }
});

//Add favorite
app.post("/favorites/add", async (req, res) => {
  try {
    const { recipeId, title, sourceUrl, imageUrl, preparationTime, servings } = req.body;

    // Extract the recipeId from the URI format returned by Edamam
    const cleanRecipeId = recipeId.split("#").pop(); // Extract the unique ID

    const checkQuery = "SELECT * FROM favorites WHERE recipe_id = $1";
    const { rows } = await db.query(checkQuery, [cleanRecipeId]);

    if (rows.length > 0) {
      res.redirect("/favorites");
    } else {
      const insertQuery = `
        INSERT INTO favorites (recipe_id, title, source_url, image_url, preparation_time, servings)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await db.query(insertQuery, [cleanRecipeId, title, sourceUrl, imageUrl, preparationTime, servings]);

      res.redirect("/favorites");
    }
  } catch (error) {
    console.error("Error adding favorite recipe:", error.message);
    res.status(500).send("Error adding favorite recipe");
  }
});

//Remove favorite
app.post("/favorites/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = "DELETE FROM favorites WHERE id = $1";
    await db.query(queryText, [id]);

    res.redirect("/favorites");
  } catch (error) {
    console.error("Error deleting favorite recipe:", error.message);
    res.status(500).send("Error deleting favorite recipe");
  }
});

//Add or update note
app.post("/favorites/:id/note", async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    let queryText = "";
    let values = [];

    if (note) {
      queryText = "UPDATE favorites SET note = $1 WHERE id = $2";
      values = [note, id];
    } else {
      queryText = "UPDATE favorites SET note = NULL WHERE id = $1";
      values = [id];
    }

    await db.query(queryText, values);

    res.redirect("/favorites");
  } catch (error) {
    console.error("Error updating note:", error.message);
    res.status(500).send("Error updating note");
  }
});

//Delete note
app.delete("/favorites/:id/note", async (req, res) => {
  try {
    const { id } = req.params;

    const queryText = 
    "UPDATE favorites SET note = NULL WHERE id = $1;";

    const values = [id];
    await db.query(queryText, values);

    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting note:", error.message);
    res.status(500).send("Error deleting note");
  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
