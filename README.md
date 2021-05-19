# MathEnJeu

Jeu multijoueur où on répond à des questions mathématiques pour progresser.
Mutliplayer game where players answer mathematic questions to progress.

### Mandatory files

Required files for questions : 
 - "./question_images/" : Folder containing all the included images in questions, answers and feedbacks LaTex file.
 - "./question_html/answers_html/" : Folder containing all the generated html files for answers. 
 - "./question_html/feedback_html/" : Folder containing all the generated html files for feedbacks.
 - "./question_html/questions_html/" : Folder containing all the generated html files for questions.
 - "/question_html/question-style.css" : File describing the style of questions
 - "/question_html/append.html" : File used in the html files generation process.
 - "./latex_files/" : Folder used in the html files generation process.

Required file for environment variables :
 - "./env"

Once HTML files are generated from LaTex sources, you can copy the required files in your project.

### Database
The database SQL dump file must be placed in the folder "./database/". 
 -  If the file name is, for example, 'mathamaze2.sql', make sure to update the docker-entrypoint-initdb command in "./database/Dockerfile" for 'ADD mathamaze2.sql /docker-entrypoint-initdb.d'.
 - The SQL file is only executed when the database Docker container is created the first time. You can completely delete the container and recreate it afterward to force the execution of the SQL file. Make sure to create an SQL dump of your current database before doing so if you don't want to lose any data or structure changes. 
 - For more details, please refer to the Docker MySQL official image site : https://hub.docker.com/_/mysql

The database contains all the structure and the data for the questions. It also contains the structure for the reported errors and games statistics.

### Compiles and run for docker (app works on port 8080 and database on port 3306)

Execute those commands in the root of the project to build and start the project

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

Use these commands to build the app and run it in background in a production environment. If the server application crashes in production environment, use these commands to completly restart the server.

```
- docker-compose -f docker-compose.yml -f docker-compose.prod.yml build app

- docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d app
```

### ORM Model generator

For now, we only use typeORM to establish a connection and send raw sql requests to the database. In some sense, we're not really using the ORM.

If, at some point, we actively use the concept of entitites, those instructions might be helpful : 
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
