const axios = require("axios");
const bcrypt = require("bcryptjs");

const { authenticate } = require("../auth/authenticate");
const tokenService = require("../auth/token-service.js");
const Users = require("../database/users-model.js");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  Users.add(user)
    .then(saved => {
      const token = tokenService.generateToken(saved);
      res.status(201).json({ token });
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

function login(req, res) {
  let { username, password } = req.body;
  Users.findBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user[0].password)) {
        const token = tokenService.generateToken(user);
        res.status(200).json({
          message: `Welcome ${user[0].username}!, have a token...`,
          token,
          roles: token.roles
        });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
