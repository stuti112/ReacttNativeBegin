import Config from 'react-native-config';

let BACKEND_URL;

if (false) {
    BACKEND_URL = Config.REACT_APP_URL_BACKEND;
} else {
    BACKEND_URL = "https://e6f1-2406-7400-81-cf3c-6d11-4af9-e57e-7de6.ngrok-free.app";
}

console.log('BACKEND_URL:', BACKEND_URL);

export { BACKEND_URL };
