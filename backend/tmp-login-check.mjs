import { login } from './src/controllers/authController.js';

const req = { body: { email: 'admin@empresa.local', password: 'Admin123*' } };
const res = {
  status(code) {
    console.log('STATUS', code);
    return { json: (payload) => console.log(payload) };
  },
  json(payload) {
    console.log(payload);
  }
};

try {
  await login(req, res);
} catch (err) {
  console.error(err);
}
