# File document web scrapper

This project is a little job for public administration, and its intended to be a useful tool to view (only) public information about file documents located in public systems and registries via web scrapping.
The user can login to the system using the (existing) system's credentials, upload a .csv file with the file document' numbers, and then view the file document' status, being able to do some small operations according to its current authorization in the system.

## Usage

Backend runs prod enviroment in docker (see Make file). 
To run the entire project, you can use the following command:

Run the backend:

```bash
make start-prod
```

Run the frontend:

```bash
npm run preview
```

### Tech stack

- typescript
- vite + react
- vite + node
- playwright
- express / jwt / better-sqlite3
- docker



