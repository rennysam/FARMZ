const app = express();

app.engine("ejs", ejsMate); // we tell express thats the one we wanna use istead the default one
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); //it will parse the req body for us
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //telling express to serve one public directory named public
// // To remove data, use:
// app.use(mongoSanitize());

// Or, to replace prohibited characters with _, use:
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const secret = process.env.SECRET || "thisshouldbeabettersecret!";

const store = new MongoDBStore({
  //configuring mongoStore for session's storage
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60, //time period in seconds
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store, //shortcut of store:store, //telling to use store insteed of default memory
  name: "session", //since we dont want the default name 'connect.sid' which people can directly get to know so we put our own name it could be anything we are just changing name not hiding it
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, //these are little security features we can refer to docs to know more
    // secure:true, // enabling this will make cookie work only on http and since localhost is not http cookies will not work on localhost but we definitely want this while deploying
    express: Date.now() + 1000 * 60 * 60 * 24 * 7, //setting to expire in 7 days in millisecondss
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet()); 