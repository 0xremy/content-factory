const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { password } = req.body;
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'DASHBOARD_PASSWORD not set on server' });
  }
  if (password !== expected) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '2h' });
  res.json({ token });
};
