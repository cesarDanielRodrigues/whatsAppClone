export const createConversations = `
CREATE TABLE IF NOT EXISTS tb_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation TEXT UNIQUE
);
`

export const createMessages = `
CREATE TABLE IF NOT EXISTS tb_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_conversation INTEGER,
    message TEXT,
    sender TEXT,
    datetime TEXT,
    FOREIGN KEY (id_conversation) REFERENCES tb_conversations(id)
);
`