import { sqliteConnect } from "../index.js"
import { createConversations, createMessages } from "./createTables.js"

const migrationsRun = (async ()=>{
    const schemas  = [
        createConversations,
        createMessages
    ].join(";\n")

    sqliteConnect()
    .then(db=>db.exec(schemas))
    .catch(error => console.error(error))
})()

