import * as authService from '../services/auth.service.js';
import { signToken } from '../utils/token.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await authService.verifyCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.findUserById(req.user.sub);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
}
