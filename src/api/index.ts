import express, { Request, Response } from 'express';
import cors from 'cors';
import { Seam } from 'seamapi';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.static(path.join(__dirname, '../../dist/public')));

app.use(express.json());

const seam = new Seam(process.env.SEAM_API_KEY);

console.log('Seam API Key:', process.env.SEAM_API_KEY ? 'Present' : 'Missing');

app.get('/get-client-session-token', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || 'single_user_11';
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

app.get('/get-devices', async (req: Request, res: Response) => {
  try {
    const devices = await seam.devices.list();
    res.json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.post('/update-device-nickname', async (req: Request, res: Response) => {
  await handleUpdateDeviceNickname(req, res);
});

async function handleUpdateDeviceNickname(req: Request, res: Response) {
  try {
    const { deviceId, nickname } = req.body;
    if (!deviceId || !nickname) {
      return res.status(400).json({ error: 'Device ID and nickname are required' });
    }

    await seam.devices.update({
      device_id: req.body.deviceId,
      nickname: req.body.nickname
    } as any);
    
    res.json({ message: 'Device nickname updated successfully' });
  } catch (error) {
    console.error('Error updating device nickname:', error);
    res.status(500).json({ error: 'Failed to update device nickname' });
  }
}

app.get('/update-nickname', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../dist/public/update-nickname.html'));
});

app.post('/update-device-display-name', async (req: Request, res: Response) => {
  await handleUpdateDeviceDisplayName(req, res);
});

async function handleUpdateDeviceDisplayName(req: Request, res: Response) {
  try {
    const { deviceId, display_name } = req.body;
    if (!deviceId || !display_name) {
      return res.status(400).json({ error: 'Device ID and Device Name are required' });
    }

    await seam.devices.update({
      device_id: req.body.deviceId,
      display_name: req.body.display_name
    } as any);
    
    res.json({ message: 'Device name updated successfully' });
  } catch (error) {
    console.error('Error updating device name:', error);
    res.status(500).json({ error: 'Failed to update device name' });
  }
}

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
