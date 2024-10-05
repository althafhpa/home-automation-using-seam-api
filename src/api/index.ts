import express from 'express';
import cors from 'cors';
import { Seam } from 'seamapi';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

const corsOptions = {
  origin: 'https://frontend-vuejs.vercel.app',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

const seam = new Seam(process.env.SEAM_API_KEY);

console.log('Seam API Key:', process.env.SEAM_API_KEY ? 'Present' : 'Missing');

app.get('/get-client-session-token', async (req, res) => {
  try {
    const userId = req.query.userId as string || 'single_user_11';
    console.log(`Attempting to get/create session for user: ${userId}`);

    const clientSession = await seam.clientSessions.getOrCreate({
      user_identifier_key: userId,
    });

    console.log('Client session obtained successfully');
    res.json({ clientSessionToken: clientSession.token });
  } catch (error) {
    console.error('Error handling client session:', error);
    res.status(500).json({
      error: 'Failed to handle client session',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/get-devices', async (req, res) => {
  try {
    const devices = await seam.devices.list();
    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
