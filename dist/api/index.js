"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const seamapi_1 = require("seamapi");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../dist/public')));
app.use(express_1.default.json());
const seam = new seamapi_1.Seam(process.env.SEAM_API_KEY);
console.log('Seam API Key:', process.env.SEAM_API_KEY ? 'Present' : 'Missing');
app.get('/get-client-session-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId || 'single_user_11';
        console.log(`Attempting to get/create session for user: ${userId}`);
        const clientSession = yield seam.clientSessions.getOrCreate({
            user_identifier_key: userId,
        });
        console.log('Client session obtained successfully');
        res.json({ clientSessionToken: clientSession.token });
    }
    catch (error) {
        console.error('Error handling client session:', error);
        res.status(500).json({
            error: 'Failed to handle client session',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}));
app.get('/get-devices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const devices = yield seam.devices.list();
        res.json({ devices });
    }
    catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: 'Failed to fetch devices' });
    }
}));
app.post('/update-device-nickname', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleUpdateDeviceNickname(req, res);
}));
function handleUpdateDeviceNickname(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { deviceId, nickname } = req.body;
            if (!deviceId || !nickname) {
                return res.status(400).json({ error: 'Device ID and nickname are required' });
            }
            yield seam.devices.update({
                device_id: req.body.deviceId,
                nickname: req.body.nickname
            });
            res.json({ message: 'Device nickname updated successfully' });
        }
        catch (error) {
            console.error('Error updating device nickname:', error);
            res.status(500).json({ error: 'Failed to update device nickname' });
        }
    });
}
app.get('/update-nickname', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../dist/public/update-nickname.html'));
});
app.post('/update-device-display-name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield handleUpdateDeviceDisplayName(req, res);
}));
function handleUpdateDeviceDisplayName(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { deviceId, display_name } = req.body;
            if (!deviceId || !display_name) {
                return res.status(400).json({ error: 'Device ID and Device Name are required' });
            }
            yield seam.devices.update({
                device_id: req.body.deviceId,
                display_name: req.body.display_name
            });
            res.json({ message: 'Device name updated successfully' });
        }
        catch (error) {
            console.error('Error updating device name:', error);
            res.status(500).json({ error: 'Failed to update device name' });
        }
    });
}
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
exports.default = app;
