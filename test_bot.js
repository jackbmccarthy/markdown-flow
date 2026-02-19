require("reflect-metadata");
const { DataSource } = require("typeorm");
const { randomBytes } = require("crypto");
const { hash } = require("bcryptjs");

const User = require("./src/entities/User").User;
const ApiKey = require("./src/entities/ApiKey").ApiKey;
const Project = require("./src/entities/Project").Project;

async function run() {
    const dataSource = new DataSource({
        type: "sqlite",
        database: "markdown_flow.sqlite",
        entities: [User, ApiKey, Project, require("./src/entities/File").File, require("./src/entities/FileVersion").FileVersion, require("./src/entities/Comment").Comment]
    });

    await dataSource.initialize();
    const userRepo = dataSource.getRepository(User);
    const admin = await userRepo.findOneBy({ email: "admin" });
    if (!admin) {
        console.log("Admin not found!");
        process.exit(1);
    }

    const rawKey = "sk-" + randomBytes(32).toString("hex");
    const hashedKey = await hash(rawKey, 10);
    const prefix = rawKey.substring(0, 10) + "...";

    const apiKey = new ApiKey();
    apiKey.name = "Test Bot Key";
    apiKey.keyHash = hashedKey;
    apiKey.keyPrefix = prefix;
    apiKey.user = admin;
    apiKey.userId = admin.id;
    await dataSource.getRepository(ApiKey).save(apiKey);

    console.log("Created API Key:", rawKey);

    // Now, upload file via fetch to the API
    const res = await fetch("http://localhost:3000/api/bot/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": rawKey
        },
        body: JSON.stringify({
            projectName: "Bot Project 1",
            name: "README.md",
            content: "# Hello World\n\nThis is a test upload from the bot.\n\n- Bullet 1\n- Bullet 2"
        })
    });

    const data = await res.json();
    console.log("Upload Response:", data);
    process.exit(0);
}

run().catch(console.error);
