require('dotenv').config();
const { DynamoDBClient, ListTablesCommand, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION || 'us-east-2';
const BUCKET = process.env.S3_BUCKET;

// AWS SDK clients automatically pick up AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from process.env
const ddbClient = new DynamoDBClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

async function checkS3Bucket() {
  console.log('\n--- Checking S3 Connection ---');
  if (!BUCKET) {
    console.error('❌ Error: S3_BUCKET is not defined in your .env file.');
    return;
  }

  console.log(`Checking S3 bucket: "${BUCKET}" in region: "${REGION}"...`);
  try {
    // HeadBucketCommand returns empty metadata if the bucket exists and you have permissions
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
    console.log(`✅ Success: S3 bucket "${BUCKET}" exists and is accessible!`);
  } catch (error) {
    console.error(`❌ S3 Error for bucket "${BUCKET}":`);
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.error(`   -> The bucket "${BUCKET}" does not exist in region "${REGION}". Please create it or update S3_BUCKET in your .env file.`);
    } else if (error.name === 'Forbidden' || error.$metadata?.httpStatusCode === 403) {
      console.error(`   -> Access Denied (403). The credentials in .env do not have permission to access "${BUCKET}".`);
    } else {
      console.error(`   -> ${error.message || error}`);
    }
  }
}

async function setupDynamoDB() {
  console.log('\n--- Checking DynamoDB Connection & Tables ---');
  try {
    // 1. List existing tables
    console.log(`Checking DynamoDB in region: "${REGION}"...`);
    const listResult = await ddbClient.send(new ListTablesCommand({}));
    const tables = listResult.TableNames || [];
    console.log('Currently existing tables:', tables);

    // 2. Create Users Table if not present
    if (!tables.includes('Users')) {
      console.log("Creating 'Users' table...");
      await ddbClient.send(
        new CreateTableCommand({
          TableName: 'Users',
          KeySchema: [{ AttributeName: 'username', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'username', AttributeType: 'S' }],
          BillingMode: 'PAY_PER_REQUEST',
        })
      );
      console.log("✅ Table 'Users' created successfully.");
    } else {
      console.log("✅ Table 'Users' already exists.");
    }

    // 3. Create Files Table if not present
    if (!tables.includes('Files')) {
      console.log("Creating 'Files' table...");
      await ddbClient.send(
        new CreateTableCommand({
          TableName: 'Files',
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          BillingMode: 'PAY_PER_REQUEST',
        })
      );
      console.log("✅ Table 'Files' created successfully.");
    } else {
      console.log("✅ Table 'Files' already exists.");
    }
  } catch (error) {
    console.error('❌ DynamoDB Error:', error.message || error);
  }
}

async function run() {
  console.log('==============================================');
  console.log('         AWS CONNECTION & SETUP CHECK         ');
  console.log('==============================================');
  
  await setupDynamoDB();
  await checkS3Bucket();
  
  console.log('\n==============================================');
}

run();
