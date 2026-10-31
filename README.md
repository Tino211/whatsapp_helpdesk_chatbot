A multilingual helpdesk chatbot for WhatsApp, built with Node.js and MySQL. It answers support questions automatically using a knowledge base and Google Gemini AI, and keeps track of support requests as tickets. It shares its MySQL database with the helpdesk website, so users see the same information on WhatsApp and on the website.

Features
Receives and answers support messages over WhatsApp
Multilingual user interaction ([list your languages, e.g. English, Shona, Ndebele])
AI-generated answers using Google Gemini
Reads its data from a MySQL database that is shared with the helpdesk website
Stays in sync with the website: users get the same, up-to-date information on WhatsApp and on the website
Ticket management for support requests [e.g. creating a ticket when the bot cannot answer]
Configuration through environment variables (no secrets in the code)
Tech Stack
Runtime: Node.js
Database: MySQL
AI: Google Gemini API
Messaging: WhatsApp - WhatsApp Business API]
Project Structure
.
├── index.js          # Entry point: WhatsApp connection and message handling
├── gemini.js         # Communication with the Gemini API
├── schema.sql        # Database structure []
├── package.json
├── .env.example      # Template for required environment variables
└── .gitignore
Getting Started
Prerequisites
Node.js [version, e.g. 18 or newer]
A MySQL server
A Google Gemini API key
[WhatsApp requirements, e.g. a phone with WhatsApp to scan a QR code]
Installation
Clone the repository:
bash
   git clone https://github.com/Tino211/whatsapp_helpdesk_chatbot.git
   cd whatsapp_helpdesk_chatbot
Install the dependencies:
bash
   npm install
Create the database and import the structure:
bash
   mysql -u your_user -p your_database < schema.sql
Create your own .env file from the template and fill in your values:
bash
   cp .env.example .env

Never commit the .env file. It is listed in .gitignore.

Start the bot:
bash
   node index.js

[you can scan a QR code on first start]

Configuration

All settings are read from environment variables. See .env.example for the full list. Typical entries:

Variable	Description
DB_HOST	MySQL host
DB_USER	MySQL user
DB_PASSWORD	MySQL password
DB_NAME	Database name
GEMINI_API_KEY	Google Gemini API key

How It Works
A user sends a message to the WhatsApp number.
The bot reads the relevant information (for example knowledge base content and tickets) from the MySQL database, which is shared with the helpdesk website. [Adjust to how your bot really works.]
If needed, the bot asks Google Gemini to generate a helpful reply.
[if the bot cannot help, a ticket is created.]
Website synchronization

The chatbot and the helpdesk website use the same MySQL database. When information changes on one side, for example a ticket status or an entry in the knowledge base, the other side shows the same data. A user therefore gets consistent answers whether they write on WhatsApp or use the website.

What I Learned
Integrating a messaging API with a Node.js backend
Using a generative AI API in a real application
Designing a database for tickets and knowledge base content
Keeping secrets out of the repository with environment variables

Future Improvements
[Docker support, tests, an admin dashboard for tickets]
Author

Tinotenda Katso, LinkedIn
