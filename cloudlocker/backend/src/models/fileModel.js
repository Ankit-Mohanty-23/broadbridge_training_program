// Data-access layer for the Files table.

const { PutCommand, GetCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { ddbDocClient } = require('../config/awsClients');

const TABLE_NAME = 'Files';

async function createFile(file) {
  await ddbDocClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: file,
    })
  );
  return file;
}

async function getFileById(id) {
  const result = await ddbDocClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return result.Item || null;
}

async function getFilesByOwner(username) {
  // Scan is fine at this project's scale. For a larger real app you'd
  // add a Global Secondary Index on `uploader` and Query instead of Scan.
  const result = await ddbDocClient.send(new ScanCommand({ TableName: TABLE_NAME }));
  const items = result.Items || [];
  return items.filter((item) => item.uploader === username);
}

async function deleteFile(id) {
  await ddbDocClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
}

module.exports = { createFile, getFileById, getFilesByOwner, deleteFile };
