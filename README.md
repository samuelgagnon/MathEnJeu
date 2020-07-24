# MathEnJeu

Jeu multijoueur où on répond à des questions mathématiques pour progresser.

### Database

- questions storage : game/src/server/question_png/'question_file_name'/1.png
- The database SQL file must be placed in /database.
- If the file name is, for example, 'mathamaze2.sql', make sure to update the docker-entrypoint-initdb command in /database/Dockerfile for 'ADD mathamaze2.sql /docker-entrypoint-initdb.d'.

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


### ORM Model generator

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
