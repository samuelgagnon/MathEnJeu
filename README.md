# MathEnJeu

Jeu multijoueur où on répond à des questions mathématiques pour progresser.

### Database

- questions storage : "./question_html/answers_html", "./question_html/feedback_html", "./question_html/questions_html", ."/question_html/question-style.css"
- questions generation/modification/creation: ./latex_files
- The database SQL file must be placed in /database.
- If the file name is, for example, 'mathamaze2.sql', make sure to update the docker-entrypoint-initdb command in /database/Dockerfile for 'ADD mathamaze2.sql /docker-entrypoint-initdb.d'.
- The SQL file is only executed when the database Docker container is created the first time. You can completely delete the container and recreate it afterward to force the execution of the SQL file. Make sure to create an SQL dump of your current database before doing so if you don't want to lose any data or structure changes. For more details, please refer to the Docker MySQL official image site : https://hub.docker.com/_/mysql

### Compiles and run for docker (app works on port 8080 and database on port 3306)

```
  For local development:
- docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

- docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

```
  Prod environment:
- docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

- docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

We can also build the data base and the app separately (using dev mode as example):

```
- docker-compose -f docker-compose.yml -f docker-compose.dev.yml build db

- docker-compose -f docker-compose.yml -f docker-compose.dev.yml build app

- docker-compose -f docker-compose.yml -f docker-compose.dev.yml up db

- docker-compose -f docker-compose.yml -f docker-compose.dev.yml up app
```

To build the app and run it in background in a production environment (use these commands to completly restart the server application if it crashes)

```
- docker-compose -f docker-compose.yml -f docker-compose.prod.yml build app

- docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d app
```

### ORM Model generator (Only if we use Entities for our database schema)

If you change the database schema, you'll have to change the ORM model so it matches the tables and their relationships.

To generate the ORM model from the database, first make sure the database Docker container is up.
Next, use this command :
```
npx typeorm-model-generator
```
An ORM model generator wizard will guide you. 
Use 'localhost' as the host, '3306' as the port and 'mathamaze2' for the database.
You'll also need a username and a password.
For more info about the ORM Model generator, please check https://github.com/Kononnable/typeorm-model-generator.
