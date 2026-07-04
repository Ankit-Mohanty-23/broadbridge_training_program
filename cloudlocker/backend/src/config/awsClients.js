// Central place for AWS SDK clients.
// IMPORTANT: no access keys are hardcoded here.
// - Locally: the SDK reads AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from your .env
// - On EC2: the SDK automatically uses the attached IAM role's temporary
//   credentials instead - same code, no changes needed.

const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const REGION = process.env.AWS_REGION || 'us-east-2';

const s3Client = new S3Client({ region: REGION });

const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

module.exports = { s3Client, ddbDocClient, REGION };
