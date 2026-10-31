require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const supportedLanguages = {
    en: {
        language_prompt: "🌐 Please select your preferred language:",
        welcome: "👋 Welcome {name} to PSC Helpdesk. Please choose from the following options:",
        menu: "📌 *IT Support Menu*\n\n1️⃣ Log a new IT issue\n2️⃣ View my previous tickets\n\nPlease reply with a number (1 or 2).",
        invalid_selection: "⚠️ Invalid selection. Please try again.",
        describe_issue: "📝 Please describe your issue in full detail:",
        thanks_feedback: "✅ Thank you for your feedback. Have a great day!",
        suggested_solution: "Suggested Solution:",
        no_solution_found: "⚠️ Our Helpdesk team will rectify the problem however:",
        category_selected: "🔧 You selected *{category}*. What is the issue in short:",
        ticket_success: "✅ Your ticket has been logged successfully! Your ticket number is *{ticket}*.\n\n➡️ Please type *2* to view your tickets.",
        ticket_error: "❌ An error occurred while logging your ticket. Please try again.",
        category_not_found: "❌ Error: Unable to find the selected category. Please try again.",
        user_not_found: "❌ Error: Unable to find your account. Please contact admin.",
        unexpected_error: "❌ An unexpected error occurred. Please try again later.",
        ticket_fetch_error: "❌ An error occurred while retrieving your tickets.",
        no_tickets: "❌ No tickets found. Type *1* to log a new issue.",
        ticket_header: "📜 *Your Tickets*:",
        name: "Name",
        email: "Email",
        ticket_number: "Ticket Number",
        title: "Title",
        description: "Description",
        status: "Status",
        priority: "Priority",
        created_at: "Created At",
        user_input_thanks: "🔧 Thank you for providing the details. Your ticket has been logged successfully. Enter 2 to view your ticket"

    },
    sn: {
        language_prompt: "🌐 Sarudza mutauro waunoda kushandisa:",
        welcome: "👋 Mauya {name} kuPSC Helpdesk. Ndapota sarudza kubva pazvinotevera:",
        menu: "📌 *Menyu yeRubatsiro*\n\n1️⃣ Nyora dambudziko reIT\n2️⃣ Ona matikiti ako\n\nNdapota pindura nenhamba (1 kana 2).",
        invalid_selection: "⚠️ Sarudzo isiriyo. Edzazve.",
        describe_issue: "📝 Ndapota tsanangura dambudziko rako zvizere:Nechirungu",
        thanks_feedback: "✅ Tinotenda nemhinduro yenyu. Rambai muine zuva rakanaka!",
        suggested_solution: "Mhinduro Yakakurudzirwa:",
        no_solution_found: "⚠️ Chikwata chedu cheHelpdesk chichagadzirisa dambudziko iri, zvisinei:",
        category_selected: "🔧 Wasarudza *{category}*. Ndapota tsanangura dambudziko rako muchidimbu: Nechirungu)",
        ticket_success: "✅ Tikiti renyu ranyoreswa zvinobudirira! Nhamba yetikiti renyu ndeye *{ticket}*.\n\n➡️ Ndapota nyora *2* kuti muone matikiti enyu.",
        ticket_error: "❌ Pane chakakanganisika pakunyoresa tikiti yako. Edzazve.",
        category_not_found: "❌ Hatina kukwanisa kuwana chikamu chakasarudzwa. Edzazve.",
        user_not_found: "❌ Hatina kukwanisa kukuona mudhatabhesi. Bata admin.",
        unexpected_error: "❌ Pane chakaitika chisina kutarisirwa. Edzazve.",
        ticket_fetch_error: "❌ Pakaitika kukanganisa pakutora matikiti ako.",
        no_tickets: "❌ Hapana matikiti awanikwa. Nyora *1* kunyoresa dambudziko.",
        ticket_header: "📜 *Matikiti Ako:*",
        name: "Zita",
        email: "Imeyili",
        ticket_number: "Nhamba yetikiti",
        title: "Musoro",
        description: "Tsananguro",
        status: "Chimiro",
        priority: "Kukosha",
        created_at: "Zvakaitika",
        user_input_thanks: "🔧 Tinotenda. Tikiti renyu ranyoreswa zvinobudirira. Nyora 2 kuti muone tikiti renyu"

    },
    nd: {
        language_prompt: "🌐 Khetha ulimi oluthandayo:",
        welcome: "👋 Siyakwamukela {name} kuPSC Helpdesk. Khetha kuzakwenzakalayo:",
        menu: "📌 *IT Helpdesk Menu*\n\n1️⃣ Bika inkinga entsha ye-IT\n2️⃣ Bona amathikithi wakho\n\nPhendula ngenombolo (1 noma 2).",
        invalid_selection: "⚠️ Ukukhetha akulona. Zama futhi.",
        describe_issue: "📝 Sicela uchaze inkinga yakho:",
        thanks_feedback: "✅ Siyabonga ngempendulo yakho. Hamba kahle!",
        suggested_solution: "Isixazululo Esiphakanyisiwe:",
        no_solution_found: "⚠️ Ithimba lethu le-Helpdesk lizalungisa inkinga le, kodwa-ke:English",
        category_selected: "🔧 Ukhethe *{category}*. Sicela uchaze inkinga ngokugcweleyo:",
        ticket_success: "✅ Ithikithi lakho libhaliswe ngempumelelo! Inombolo yethikithi lakho *{ticket}*.\n\n➡️ Bhala *2* ukuze ubone amathikithi akho.",
        ticket_error: "❌ Kube lephutha ngesikhathi kubhaliswa ithikithi lakho. Zama futhi.",
        category_not_found: "❌ Ayikwazanga ukuthola isigaba osikhethile. Zama futhi.",
        user_not_found: "❌ Asikwazanga ukukuthola ku-database. Xhumana le-admin.",
        unexpected_error: "❌ Kube lephutha elingalindelekanga. Zama futhi.",
        ticket_fetch_error: "❌ Kube lephutha ngesikhathi kutholakala amathikithi akho.",
        no_tickets: "❌ Akulathikithi elitholakeleyo. Bhala *1* ukubika inkinga entsha.",
        ticket_header: "📜 *Amathikithi Akho:*",
        name: "Igama",
        email: "Imeili",
        ticket_number: "Inombolo yethikithi",
        title: "Isihloko",
        description: "Incazelo",
        status: "Isimo",
        priority: "Kubalulekile",
        created_at: "Idethi",
        user_input_thanks: "🔧 Siyabonga. Ithikithi lakho selibhalisiwe ngempumelelo. Bhala u-2 ukuze ubone ithikithi lakho"

    }

};

function getMessage(key, lang = "en") {
    return supportedLanguages[lang]?.[key] || supportedLanguages.en[key] || key;
}

const TOKEN = process.env.WHATSAPP_TOKEN; 
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME  
});

db.connect((err) => {
    if (err) throw err;
    console.log("✅ MySQL Connected!");  
});

const userInputs = {};

async function sendUserTypeSelection(to) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: "🔐 Are you a Guest or Staff?" },
            action: {
                buttons: [
                    { type: "reply", reply: { id: "user_guest", title: "Guest User" } },
                    { type: "reply", reply: { id: "user_staff", title: "Staff" } }
                ]
            }
        }
    };

    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

    try {
        await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        console.error("❌ Error sending user type selection:", error.response?.data || error.message);
    }
}

async function sendLanguageSelection(to) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: "🌐 Please select your preferred language:" },
            action: {
                buttons: [
                    { type: "reply", reply: { id: "lang_en", title: "English" } },
                    { type: "reply", reply: { id: "lang_sn", title: "Shona" } },
                    { type: "reply", reply: { id: "lang_nd", title: "Ndebele" } }
                ]
            }
        }
    };

    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

    try {
        await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            }
        });
    } catch (error) {
        console.error("❌ Error sending language selection:", error.response?.data || error.message);
    }
}


app.post("/webhook", async (req, res) => {
    const data = req.body;
    if (data.object) {
        const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        if (message) {
            const sender = message.from;
            const type = message.type;
            const text = message.text?.body?.trim() || "";

            if (!userInputs[sender]) {
                if (text.toLowerCase() !== "help") {
                    await sendMessage(sender, "⚠️ Please type 'Help' to proceed with the PSC Helpdesk services.");
                    return res.sendStatus(200);
                }

                userInputs[sender] = {
                    sessionActive: true,
                    awaitingUserType: true,
                    step: "usertype"
                };

                await sendUserTypeSelection(sender);
                return res.sendStatus(200);
            }

            const inputState = userInputs[sender];

            if (inputState.awaitingGuestName) {
                userInputs[sender].guestName = text;
                userInputs[sender].language = "en";
                await sendMessage(sender, `👋 Hello ${text}, how can we assist you today? Please describe your issue.`);
                userInputs[sender].step = "guestIssue";
                return res.sendStatus(200);
            }

            if (inputState.step === "guestIssue") {
                await sendMessage(sender, `📝 Thank you for your message: "${text}". Our team will get back to you shortly.`);
                delete userInputs[sender];
                return res.sendStatus(200);
            }

            if (type === "interactive") {
                const buttonId = message.interactive?.button_reply?.id;

                if (buttonId === "user_guest") {
                    userInputs[sender] = {
                        step: "guestName",
                        awaitingGuestName: true
                    };
                    await sendMessage(sender, "👤 Please enter your name:");
                    return res.sendStatus(200);
                }

                if (buttonId === "user_staff") {
                    userInputs[sender] = {
                        step: "language"
                    };
                    await sendLanguageSelection(sender);
                    return res.sendStatus(200);
                }

                if (buttonId.startsWith("lang_")) {
                    const langCode = buttonId.replace("lang_", "");
                    userInputs[sender].language = langCode;
                    userInputs[sender].awaitingLanguage = false;
                    const user = await getUserFromDB(sender);
                    const languagePack = supportedLanguages[langCode];
                    await sendMessage(sender, languagePack.welcome.replace("{name}", user.name));
                    await sendMessage(sender, languagePack.menu);
                    return res.sendStatus(200);
                }

                await handleButtonClick(sender, buttonId);
            } else if (type === "text") {
                if (text.toLowerCase() === "1") {
                    await createTicket(sender);
                } else if (text.toLowerCase() === "2") {
                    await viewTickets(sender);
                    if (userInputs[sender]?.expectingViewTickets) delete userInputs[sender];
                } else if (userInputs[sender]) {
                    await handleTicketCreation(sender, text);
                } else {
                    await handleUserInput(sender, text);
                }
            }
        }
    }
    res.sendStatus(200);
});

function formatBotMessage(message, langCode = "en") {
    const branding = {
        en: "🤖 *PSC Helpdesk*: ",
        sn: "🤖 *PSC Helpdesk*: ",
        nd: "🤖 *PSC Helpdesk*: ",
    };
    return `${branding[langCode] || branding["en"]}${message}`;
}

// Function to Show Welcome Message After Checking User Existence
async function showWelcomeMessage(to) {
    try {
        const user = await getUserFromDB(to);
        
        if (user) {
            const lang = userInputs[to]?.language || "en";
            const messages = supportedLanguages[lang];
            await sendMessage(to, messages.welcome.replace("{name}", user.name));
            await sendMessage(to, messages.menu);


        } else {
            await sendMessage(to, "⚠️ You are not registered in our system. Please contact the admin to be added.");
        }
    } catch (error) {
        console.error("❌ Error checking user in database:", error);
        await sendMessage(to, "⚠️ An error occurred while verifying your registration. Please try again later.");
    }
}

//function to normalize phone-numbers
// Normalize phone number to a consistent format (e.g., 2637XXXXXXX)
function normalizePhoneNumber(phone) {
    if (!phone) return "";

    // Remove all non-numeric characters
    phone = phone.replace(/\D/g, "");

    // If it starts with 0, convert to 263
    if (phone.startsWith("0")) {
        return "263" + phone.slice(1);
    }

    // If it starts with +263, remove the +
    if (phone.startsWith("263")) {
        return phone;
    }

    return phone;
}


//Function to get user from db
async function getUserFromDB(phoneNumber) {
    const normalized = normalizePhoneNumber(phoneNumber);

    return new Promise((resolve, reject) => {
        db.query(
            `SELECT name FROM users 
             WHERE phone = ? OR phone = ? OR phone = ?`,
            [normalized, "0" + normalized.slice(3), "+263" + normalized.slice(3)],
          (err, results) => {
            if (err) {
                console.error("❌ Database query error:", err);
                return reject(err);
            }
            resolve(results.length > 0 ? results[0] : null);
        });
    });
}


//Function too get solution based on selected category
async function getSolutionFromDB(categoryName, title) {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT description FROM solutions WHERE category_id = ? AND title = ?",
            [categoryName, title],
            (err, results) => {
                if (err) {
                    console.error("❌ Database query error:", err);
                    return reject(err);
                }
                resolve(results.length > 0 ? results[0] : null);
            }
        );
    });
}

// Function to Ask for Feedback
async function askForFeedback(to) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: "Has this helped?" },
            action: {
                buttons: [
                    { type: "reply", reply: { id: "yes", title: "Yes" } },
                    { type: "reply", reply: { id: "no", title: "No" } }
                ]
            }
        }
    };

    try {
        const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
        const response = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }
        });
        console.log("✅ Feedback prompt sent:", response.data);
    } catch (error) {
        console.error("❌ Error sending feedback prompt:", error.response?.data || error.message);
    }
}

// Function to Send Category Selection
async function sendCategorySelection(to) {
    const categories = await getCategoriesFromDB();
    const chunkSize = 3;
    const chunks = [];

    for (let i = 0; i < categories.length; i += chunkSize) {
        chunks.push(categories.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunks.length; i++) {
        const buttons = chunks[i].map(category => ({
            type: "reply",
            reply: { id: category.name, title: category.name } // Use `name` instead of `categoryName`
        }));

        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: "Please choose the category of your issue:" },
                action: { buttons }
            }
        };

        try {
            const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
            const response = await axios.post(url, payload, {
                headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }
            });
            console.log("✅ Category selection sent:", response.data);
        } catch (error) {
            console.error("❌ Error sending category selection:", error.response?.data || error.message);
        }
    }
}


// Function to Get Categories from Database
async function getCategoriesFromDB() {
    return new Promise((resolve, reject) => {
        db.query("SELECT name FROM categories", (err, results) => {
            if (err) {
                console.error("❌ Database query error:", err);
                return reject(err);
            }
            resolve(results || []);
        });
    });
}

//Function to sendcreateticket button
async function sendCreateTicketButton(to) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: "Click below to create a new ticket" },
            action: {
                buttons: [
                    { type: "reply", reply: { id: "create_ticket", title: "Create Ticket" } }
                ]
            }
        }
    };

    try {
        const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
        const response = await axios.post(url, payload, {
            headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" }
        });
        console.log("✅ 'Create Ticket' button sent:", response.data);
    } catch (error) {
        console.error("❌ Error sending 'Create Ticket' button:", error.response?.data || error.message);
    }
}

//function to create ticket to
async function createTicket(to) {
    // Ensure user has selected a category first
    if (!userInputs[to] || !userInputs[to].categoryName) {
        await sendCategorySelection(to);
        return;
    }

    // Prompt user for the issue title:`);
    const lang = userInputs[to].language || "en";
    const languagePack = supportedLanguages[lang];

    userInputs[to].step = 1;
    await sendMessage(to, `🔧 ${languagePack.describe_issue}`);

}

//Function to store unresolved questions
async function storeUnresolvedQuestion(phone, question) {
    return new Promise((resolve, reject) => {
        db.query(
            "INSERT INTO unresolved_questions (phone, question) VALUES (?, ?)",
            [normalizePhoneNumber(phone), question],
            (err) => {
                if (err) {
                    console.error("❌ Error storing unresolved question:", err);
                    return reject(err);
                }
                console.log("📥 Unresolved question stored.");
                resolve();
            }
        );
    });
}

async function queryRasa(message) {
    try {
        const response = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
            sender: "user",
            message: message
        });

        if (response.data && response.data.length > 0) {
            return response.data.map(r => r.text).join("\n");
        } else {
            return null;
        }
    } catch (error) {
        console.error("❌ Error querying Rasa:", error.response?.data || error.message);
        return null;
    }
}

// Add Gemini fallback (used if no solution in DB and no Rasa match)
async function queryGemini(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = await response.text();
        return text;
    } catch (error) {
        console.error("❌ Error querying Gemini:", error);
        return null;
    }
}


//handleTitleInput uses Gemini if Rasa fails
async function handleTitleInput(to, title) {
    if (!userInputs[to] || !userInputs[to].categoryName) {
        const lang = userInputs[to]?.language || "en";
        const languagePack = supportedLanguages[lang];
        await sendMessage(to, languagePack.invalid_selection || "⚠️ Please select a category first.");
        return;
    }

    userInputs[to].title = title;
    const lang = userInputs[to].language || "en";
    const languagePack = supportedLanguages[lang];

    const solution = await getSolutionFromDB(userInputs[to].categoryName, title);

    if (solution) {
        await sendMessage(to, `💡 *${languagePack.suggested_solution || "Suggested Solution:"}*\n\n${solution.description}`);
        await askForFeedback(to);
    } else {
        const rasaResponse = await queryRasa(title);

        if (rasaResponse) {
            await sendMessage(
                to,
                `⚠️ ${languagePack.no_solution_found || "No solution found, but this might help:"}\n\n🤖 *HelpdeskBot says:*\n\n${rasaResponse}`
            );
            await askForFeedback(to);
        } else {
            const geminiResponse = await queryGemini(title);

            if (geminiResponse) {
                await sendMessage(
                    to,
                    `⚠️ ${languagePack.no_solution_found || "No solution found, but this might help:"}\n\n🤖 *Gemini suggests:*\n\n${geminiResponse}`
                );
                await askForFeedback(to);
            } else {
                await storeUnresolvedQuestion(to, title);
                await sendMessage(to, languagePack.no_solution_found || "⚠️ No solution found. Would you like to create a ticket?");
                await sendCreateTicketButton(to);
            }
        }
    }
}
// Function to Handle Category Selection
async function handleCategorySelection(to, categoryName) {
    if (!userInputs[to]) userInputs[to] = {};
    userInputs[to].categoryName = categoryName;
    userInputs[to].step = 1;

    const lang = userInputs[to].language || "en";
    const languagePack = supportedLanguages[lang];

    // Use a template string or language string with a placeholder if you want
    // For now, we'll just replace the message with a simple multilingual prompt:
    const message = languagePack.category_selected
        ? languagePack.category_selected.replace("{category}", categoryName)
        : `🔧 You selected *${categoryName}*. What is the issue specifically:`;

    await sendMessage(to, message);
}


//Function to check if category exists
async function categoryExists(categoryName) {
    return new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS count FROM categories WHERE name = ?", [categoryName], (err, results) => {
            if (err) {
                console.error("❌ Database query error (Category Check):", err);
                return reject(err);
            }
            resolve(results[0].count > 0);
        });
    });
}



//Funtion to handle ticket creation
async function handleTicketCreation(to, text) {
    if (!userInputs[to]) {
        userInputs[to] = { step: 1, categoryName: "", title: "", description: "" };
    }

    const userInput = userInputs[to];

    switch (userInput.step) {
        case 1:
            await handleTitleInput(to, text); // Call the new function
            break;
        case 2:
            userInput.description = text;
            await finalizeTicket(to, userInput, to);
            delete userInputs[to]; // Clear input storage after ticket is created
            break; 
    }
}


// Function to Finalize Ticket Creation
async function finalizeTicket(to, userInput, phoneNumber) {        
    const ticket_number = `PSC-${Math.floor(100000 + Math.random() * 900000)}`;
    const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Get user's preferred language
    const lang = userInputs[to]?.language || "en";
    const languagePack = supportedLanguages[lang];

    try {
        const category_id = await getCategoryIdFromDB(userInput.categoryName);
        if (!category_id) {
            await sendMessage(to, languagePack.category_not_found || "❌ Error: Unable to find the selected category.");
            return;
        }

        const user_id = await getUserIdFromDB(phoneNumber);
        if (!user_id) {
            await sendMessage(to, languagePack.user_not_found || "❌ Error: Unable to find your account.");
            return;
        }

        db.query(
            `INSERT INTO tickets 
             (title, ticket_number, description, status, priority, category_id, engineer_id, user_id, created_at) 
             VALUES (?, ?, ?, 'Pending', 'Medium', ?, NULL, ?, ?)`,
            [userInput.title, ticket_number, userInput.description, category_id, user_id, created_at],
            async (err) => {
                if (err) {
                    console.error("❌ Error inserting ticket:", err);
                    await sendMessage(to, languagePack.ticket_error || "❌ An error occurred while logging your ticket.");
                    return;
                }

                console.log("✅ Ticket created successfully.");
                const successMsg = languagePack.ticket_success
                       ? languagePack.ticket_success.replace("{ticket}", ticket_number)
                       : `✅ Your ticket has been logged successfully! Your ticket number is *${ticket_number}*.\n\n➡️ Please type *2* to view your tickets.`;

                await sendMessage(to, successMsg);

               // Set flag to expect user to type '2' next
                userInputs[to] = { expectingViewTickets: true, language: lang };

                
                }
        );
    } catch (error) {
        console.error("❌ Error creating ticket:", error);
        await sendMessage(to, languagePack.unexpected_error || "❌ An unexpected error occurred. Please try again later.");
    }
}


// Function to get category_id from database
async function getCategoryIdFromDB(categoryName) {
    return new Promise((resolve, reject) => {
        db.query("SELECT id FROM categories WHERE name = ?", [categoryName], (err, results) => {
            if (err) {
                console.error("❌ Database query error (Category):", err);
                return reject(err);
            }
            resolve(results.length > 0 ? results[0].id : null);
        });
    });
}

// Function to get user_id from database
async function getUserIdFromDB(phoneNumber) {
    const normalized = normalizePhoneNumber(phoneNumber);

    return new Promise((resolve, reject) => {
        db.query(
            "SELECT id FROM users WHERE phone = ? OR phone = ? OR phone = ?",
            [normalized, "0" + normalized.slice(3), "+263" + normalized.slice(3)],
            (err, results) => {
                if (err) {
                    console.error("❌ Database query error (User):", err);
                    return reject(err);
                }
                resolve(results.length > 0 ? results[0].id : null);
            }
        );
    });
}

// Function to View Existing Tickets
async function viewTickets(to) {
    const lang = userInputs[to]?.language || "en";
    const languagePack = supportedLanguages[lang];

    try {
        const user = await getUserFromDB(to);
        if (!user) {
            await sendMessage(to, languagePack.user_not_found || "❌ You are not registered in our system. Please contact the admin.");
            return;
        }

        const userId = await getUserIdFromDB(to);

        db.query(
            `SELECT 
                tickets.ticket_number, tickets.title, tickets.description, 
                tickets.status, tickets.priority, tickets.created_at,
                users.name, users.email 
            FROM tickets 
            JOIN users ON tickets.user_id = users.id 
            WHERE tickets.user_id = ?`,
            [userId],
            async (err, results) => {
                if (err) {
                    console.error("❌ Error fetching tickets:", err);
                    await sendMessage(to, languagePack.ticket_fetch_error || "❌ An error occurred while retrieving your tickets.");
                    return;
                }

                if (results.length === 0) {
                    await sendMessage(to, languagePack.no_tickets || "❌ No tickets found. Type *1* to log a new issue.");
                } else {
                    let response = `${languagePack.ticket_header || "📜 *Your Tickets*:"}\n\n`;
                    results.forEach((ticket) => {
                        response += `👤 *${languagePack.name || "Name"}:* ${ticket.name}\n`;
                        response += `📧 *${languagePack.email || "Email"}:* ${ticket.email}\n\n`;
                        response += `🔹 *${languagePack.ticket_number || "Ticket Number"}:* ${ticket.ticket_number}\n`;
                        response += `📌 *${languagePack.title || "Title"}:* ${ticket.title}\n`;
                        response += `📝 *${languagePack.description || "Description"}:* ${ticket.description}\n`;
                        response += `🟢 *${languagePack.status || "Status"}:* ${ticket.status}\n`;
                        response += `⚡ *${languagePack.priority || "Priority"}:* ${ticket.priority}\n`;
                        response += `📅 *${languagePack.created_at || "Created At"}:* ${ticket.created_at}\n\n`;
                    });

                    await sendMessage(to, response);
                }
            }
        );
    } catch (error) {
        console.error("❌ Error in viewTickets:", error);
        await sendMessage(to, languagePack.unexpected_error || "❌ An unexpected error occurred. Please try again later.");
    }
}


// Function to Handle User Input
async function handleUserInput(to, text) {
    const lang = userInputs[to]?.language || "en";
    const languagePack = supportedLanguages[lang];

    const message = languagePack.user_input_thanks || 
        "🔧 Thank you for providing the details. Your ticket has been logged successfully. Enter 2 to view your ticket";

    await sendMessage(to, message);
}

// Function to Generate Ticket Number
function generateTicketNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to Send WhatsApp Messages
async function sendMessage(to, message, langCode = "en") {
    const formatted = formatBotMessage(message, langCode);
    
    const payload = {
        messaging_product: "whatsapp",
        to,
        text: { body: formatted },
    };

    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

    try {
        await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("❌ Failed to send message:", error.response?.data || error.message);
    }
}



//Function to handle button click
async function handleButtonClick(to, buttonId) {
    // 🌐 Handle language selection
    if (buttonId.startsWith("lang_")) {
        const lang = buttonId.split("_")[1]; // Get 'en', 'sn', or 'nd'
        userInputs[to].language = lang;
        userInputs[to].step = "menu"; // Now ready for main menu

        const message = getMessage("welcome", lang).replace("{name}", (await getUserFromDB(to)).name);
        await sendMessage(to, message);
        await sendMenu(to, lang); // Show main menu in selected language
        return;
    }

    switch (buttonId) {
        case "yes":
            await sendMessage(to, getMessage("thanks_feedback", getUserLang(to)));
            delete userInputs[to];
            break;
        case "no":
            await sendCreateTicketButton(to);
            break;
        case "create_ticket":
            await sendMessage(to, getMessage("describe_issue", getUserLang(to)));
            userInputs[to].step = 2;
            break;
        default:
            if (await categoryExists(buttonId)) {
                await handleCategorySelection(to, buttonId);
            } else {
                await sendMessage(to, getMessage("invalid_selection", getUserLang(to)));
            }
            break;
    }
}
function getUserLang(to) {
    return userInputs[to]?.language || "en";
}

// Function to Send Menu
async function sendMenu(to, lang = "en") {
    const menu = getMessage("menu", lang);
    await sendMessage(to, menu);
}

// Webhook Verification (Required by WhatsApp API)
app.get("/webhook", (req, res) => {
    if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === VERIFY_TOKEN) {
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        res.sendStatus(403);
    }
});



const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
