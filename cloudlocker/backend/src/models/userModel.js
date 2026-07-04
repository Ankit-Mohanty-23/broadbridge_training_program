// Data-access layer for the Users table.
// Controllers never talk to DynamoDB directly - they go through here.

const { PutCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/awsClients');

const TABLE_NAME = 'Users';

async function createUser(username, hashedPassword) {
  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { username, password: hashedPassword },
      // Prevents overwriting an existing user with the same username
      ConditionExpression: 'attribute_not_exists(username)',
    })
  );
}

async function getUserByUsername(username) {
  const result = await ddbDocClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { username },
    })
  );
  return result.Item || null;
}

async function updatePassword(username, newHashedPassword) {
  await ddbDocClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { username },
      UpdateExpression: 'SET #pw = :pw',
      ExpressionAttributeNames: { '#pw': 'password' },
      ExpressionAttributeValues: { ':pw': newHashedPassword },
    })
  );
}

// Username is the partition key so we can't update it in-place.
// Instead: create a new record and delete the old one.
async function renameUser(oldUsername, newUsername, hashedPassword) {
  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { username: newUsername, password: hashedPassword },
      ConditionExpression: 'attribute_not_exists(username)',
    })
  );
  await ddbDocClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { username: oldUsername },
    })
  );
}

module.exports = { createUser, getUserByUsername, updatePassword, renameUser };
