# Recipe-Keeper

Recipe-Keeper is a web application that allows users to search for recipes using a public API, save their favorite recipes to a database, and add notes to saved recipes.

## Features

- Search and display recipes using a public API (EDAMAM API).
- Save favorite recipes to a PostgreSQL database.
- Add, edit, and delete notes for saved recipes.

## Technologies Used

- Node.js
- Express.js
- EJS (Embedded JavaScript) for templating
- PostgreSQL (pg module) for database management
- Axios for making HTTP requests to the EDAMAM API
- HTML/CSS/JavaScript for front-end

## Prerequisites

Before running this application, ensure you have the following installed on your machine:

- Node.js: Download and install from [nodejs.org](https://nodejs.org/)
- PostgreSQL: Download and install from [postgresql.org](https://www.postgresql.org/)

## Getting Started

1. Clone the repository to your local machine:
```
git clone <repository_url>
```
2. Navigate to the project directory:
```
cd Recipe-Keeper
```
3. Install dependencies:
```
npm install
```
4. Set up environment variables:Create a `.env` file in the root directory and provide the following variables:
```
PORT=3000
EDAMAM_API_KEY=<your_edamam_api_key>
EDAMAM_APP_ID=<your_edamam_app_id>
DB_PASSWORD=<your_postgres_password>
```
Replace <your_edamam_api_key>, <your_edamam_app_id>, and <your_postgres_password> with your actual values.

5. Set up the PostgreSQL database:
- Create a database named `recipe-keeper`.
- Ensure PostgreSQL is running locally.
- You can use tools like pgAdmin or the `psql` command-line interface to create the database.
6. Run the application:
```
npm start
```
The application should now be running on `http://localhost:3000`.

## Database Setup

The application uses PostgreSQL to store favorite recipes. Here is the SQL query to create the necessary table:

```
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  recipe_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  source_url VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  preparation_time INT,
  servings INT,
  note TEXT
);
```

## Usage
- Visit http://localhost:3000 in your web browser to access the Recipe-Keeper application.
- Use the search functionality to find and display recipes.
- Save recipes to your favorites and add notes to them.
- View and manage your favorite recipes on the "Favorites" page.

## Contributing
Contributions are welcome! If you have suggestions, bug reports, or feature requests, please open an issue or create a pull request.

## License

This project is licensed under the MIT License.

```vbnet

Make sure to replace `<repository_url>` with the actual URL of your GitHub repository where this project is hosted. Additionally, update the placeholders `<your_edamam_api_key>`, `<your_edamam_app_id>`, and `<your_postgres_password>` with your actual API key, app ID from EDAMAM API, and PostgreSQL password respectively.

This README provides a comprehensive guide on setting up, running, and using your Recipe-Keeper application locally. Users can follow these instructions to get started with the project and understand its functionality.

Feel free to further customize this README to include additional details or sections based on your project's specific requirements or functionalities.

```
