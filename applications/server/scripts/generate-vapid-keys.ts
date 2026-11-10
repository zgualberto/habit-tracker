import webPush from 'web-push';

const generatedKeys = webPush.generateVAPIDKeys();

console.log('Add the following values to your environment (never commit real keys):');
console.log('');
console.log(`VAPID_PUBLIC_KEY=${generatedKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${generatedKeys.privateKey}`);
