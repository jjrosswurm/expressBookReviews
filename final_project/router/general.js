const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();





public_users.get("/server/asynbooks", async function (req,res) {
    try {
      let response = await axios.get("http://localhost:5000/");
      console.log(response.data);
      return res.status(200).json(response.data);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({message: "Error getting book list"});
    }
  });

  public_users.get("/server/asynbooks/isbn/:isbn", function (req,res) {
    let {isbn} = req.params;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(function(response){
      console.log(response.data);
      return res.status(200).json(response.data);
    })
    .catch(function(error){
        console.log(error);
        return res.status(500).json({message: "Error while fetching book details."})
    })
  });

  public_users.get("/server/asynbooks/author/:author", function (req,res) {
    let {author} = req.params;
    axios.get(`http://localhost:5005/author/${author}`)
    .then(function(response){
      console.log(response.data);
      return res.status(200).json(response.data);
    })
    .catch(function(error){
        console.log(error);
        return res.status(500).json({message: "Error retrieving book details."})
    })
  });

public_users.post("/login", (req,res) => {
    const { username, password } = req.body;

      return res.status(400).json({ message: "Login successful" });

  });

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (users.find((user) => user.username === username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    return res.json(books[isbn]);

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;  
    const authorBooks = [];  
    
    for (const book in books) {  
      if (books[book].author === author) {  
        authorBooks.push(books[book]);
      }
    }
    
    if (authorBooks.length > 0) {  
      res.send(authorBooks);  
    } else {
      res.status(404).send('No books found for author');  
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
    if(filteredBooks.length > 0){
        return res.status(200).json(filteredBooks);
    }
    else{
        return res.status(404).json({message: "Book not found"});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    const reviews = books[isbn].reviews;
    return res.status(200).json({ reviews: reviews });
});


public_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.username;
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!books[isbn]) {
      return res.status(404).json({message: "Book not found"});
    }
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    if (books[isbn].reviews[username]) {
      books[isbn].reviews[username] = review;
      return res.json({message: "Review modified successfully"});
    }
    books[isbn].reviews[username] = review;
    return res.json({message: "Review added successfully"});
  });

  public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username;
    //const user = req.body.username;
    console.log(isbn);
  
    //if (!username) {
    //  return res.status(401).json({message: "Unauthorized"});
    //}
  
    if (!isValid(username)) {
      return res.status(401).json({message: "Invalid username"});
    }
  
    if (!books[isbn]) {
      return res.status(400).json({message: "Invalid ISBN"});
    }
  
    if (!books[isbn].reviews[username]) {
      return res.status(400).json({message: "Review not found for the given ISBN and username"});
    }
  
    delete books[isbn].reviews[username];
    return res.status(200).json({message: "Review deleted successfully"});
  });

module.exports.general = public_users;
