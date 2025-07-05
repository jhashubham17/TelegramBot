require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const fetch = require("node-fetch");

const bot = new Telegraf(process.env.BOT_TOKEN);

// /start
bot.start((ctx) => {
  ctx.reply(
    "🎬 Welcome to MovieBot!\n\nCommands:\n/movie Inception\n/series Breaking Bad\n/random\n/top"
  );
});

// /movie
bot.command("movie", async (ctx) => {
  const query = ctx.message.text.split(" ").slice(1).join(" ");
  if (!query) return ctx.reply("❗ Usage: /movie Inception");

  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${
    process.env.OMDB_API_KEY
  }`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.Response === "False")
    return ctx.reply(`❌ Movie not found: ${data.Error}`);

  const msg = `
🎬 *${data.Title}* (${data.Year})
⭐ IMDb: ${data.imdbRating}
📅 Released: ${data.Released}
🎭 Genre: ${data.Genre}
🧑‍🎤 Actors: ${data.Actors}

📝 ${data.Plot}
`;

  if (data.Poster && data.Poster !== "N/A") {
    await ctx.replyWithPhoto(data.Poster);
  }

  const trailerBtn = Markup.inlineKeyboard([
    Markup.button.url(
      "▶️ Trailer",
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        data.Title
      )} trailer`
    ),
  ]);

  await ctx.replyWithMarkdown(msg, trailerBtn);
});

// /series
bot.command("series", async (ctx) => {
  const query = ctx.message.text.split(" ").slice(1).join(" ");
  if (!query) return ctx.reply("❗ Usage: /series Breaking Bad");

  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(
    query
  )}&type=series&apikey=${process.env.OMDB_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.Response === "False")
    return ctx.reply(`❌ Series not found: ${data.Error}`);

  const msg = `
📺 *${data.Title}* (${data.Year})
⭐ IMDb: ${data.imdbRating}
🎭 Genre: ${data.Genre}
🧑‍🎤 Actors: ${data.Actors}

📝 ${data.Plot}
`;

  if (data.Poster && data.Poster !== "N/A") {
    await ctx.replyWithPhoto(data.Poster);
  }

  const trailerBtn = Markup.inlineKeyboard([
    Markup.button.url(
      "▶️ Trailer",
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        data.Title
      )} trailer`
    ),
  ]);

  await ctx.replyWithMarkdown(msg, trailerBtn);
});

// /random
bot.command("random", async (ctx) => {
  try {
    const res = await fetch(
      "https://api.sampleapis.com/movies/action-adventure"
    );
    const movies = await res.json();
    const movie = movies[Math.floor(Math.random() * movies.length)];

    const msg = `
🎬 *${movie.title}*
📅 Year: ${movie.year}
🎭 Genre: ${movie.genre}

📝 ${movie.description || "No description"}
`;

    await ctx.replyWithMarkdown(msg);
  } catch (e) {
    ctx.reply("⚠️ Error loading random movie.");
  }
});

// /top
bot.command("top", async (ctx) => {
  const topMovies = [
    "Inception",
    "The Dark Knight",
    "Interstellar",
    "Fight Club",
    "The Godfather",
  ];
  let reply = "*🎥 Top Movies:*\n\n";
  topMovies.forEach((movie, i) => {
    reply += `${i + 1}. ${movie}\n`;
  });
  ctx.replyWithMarkdown(reply);
});

// Inline search
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query;
  if (!query) return;

  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${
    process.env.OMDB_API_KEY
  }`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.Response === "False") return;

  const results = [
    {
      type: "article",
      id: data.imdbID,
      title: data.Title,
      description: data.Plot,
      input_message_content: {
        message_text: `🎬 *${data.Title}* (${data.Year})\n⭐ IMDb: ${data.imdbRating}\n\n📝 ${data.Plot}`,
        parse_mode: "Markdown",
      },
      thumb_url: data.Poster !== "N/A" ? data.Poster : undefined,
    },
  ];

  ctx.answerInlineQuery(results);
});

// Launch bot
bot.launch();
