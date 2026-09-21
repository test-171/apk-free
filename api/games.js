const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const games = [
  { id: 1, title: 'Temple Run', category: 'Action', price: 0, rating: 4.6 },
  { id: 2, title: 'Minecraft', category: 'Adventure', price: 0, rating: 4.8 },
  { id: 3, title: 'Subway Surfers', category: 'Runner', price: 0, rating: 4.5 },
  { id: 4, title: '2048', category: 'Puzzle', price: 0, rating: 4.3 }
];

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/games', (req, res) => {
  res.json(games);
});

app.get('/api/games/:id', (req, res) => {
  const game = games.find((item) => item.id === Number(req.params.id));

  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }

  return res.json(game);
});

app.post('/api/games', (req, res) => {
  const { title, category, price, rating } = req.body;

  if (!title || !category) {
    return res.status(400).json({ message: 'Title and category are required' });
  }

  const newGame = {
    id: games.length ? games[games.length - 1].id + 1 : 1,
    title,
    category,
    price: Number(price) || 0,
    rating: Number(rating) || 0
  };

  games.push(newGame);
  return res.status(201).json(newGame);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
