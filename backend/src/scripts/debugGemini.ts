import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env vars manually to be sure
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
const dotEnvResult = dotenv.config({ path: envPath });
if (dotEnvResult.error) console.error('Error loading .env:', dotEnvResult.error);

async function main() {
  console.log('--- STARTING DEBUG SCRIPT ---');
  
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('CREDENTIALS PATH RAW:', credsPath);
  
  if (credsPath) {
      console.log('Path char codes:');
      for (let i = 0; i < credsPath.length; i++) {
          process.stdout.write(`${credsPath.charCodeAt(i)}[${credsPath[i]}] `);
      }
      console.log('\n');
      
      // Try resolving it manually
      try {
          const fs = await import('fs');
          if (fs.existsSync(credsPath)) {
              console.log('File EXISTS via fs.existsSync');
          } else {
              console.log('File DOES NOT EXIST via fs.existsSync');
          }
      } catch (err) {
          console.error('FS check error:', err);
      }
  }

  // Dynamic import to ensure process.env is set before module evaluates
  const { generateContentWithGemini, checkGeminiConnection } = await import('../services/geminiService.js');

  console.log('PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
  console.log('LOCATION:', process.env.GOOGLE_CLOUD_LOCATION);
  
  try {
    console.log('Testing connection...');
    const result = await checkGeminiConnection();
    console.log('SUCCESS Result:', result);
  } catch (error: any) {
    console.error('--- ERROR CAUGHT ---');
    console.error('Error message:', error.message);
    if (error.response) {
         console.error('Response data:',  JSON.stringify(error.response, null, 2));
    } else {
        console.error('Full error:', error);
    }
  }
}

main();
