import { DynamoDBStreamEvent, Context } from 'aws-lambda';
import { DynamoDB } from "aws-sdk";
import { upsertEntity } from "../lib/handler";
import { instrumentLambdaHandler } from "../lib/request";
import { EntityViewBaseShape } from "../interfaces";

const _onStreamEvent = async (event: DynamoDBStreamEvent, context: Context) => {
  console.log('here');
  context.callbackWaitsForEmptyEventLoop = false;

  const operations = event.Records.map(
    (record) => {
      const entityType = record.eventSourceARN?.replace(/.*:table\/([^/-]+).*/g, '$1').toLowerCase();
      const entity = DynamoDB.Converter.unmarshall(record.dynamodb?.NewImage || {});
      if (!entity || !entityType) return Promise.resolve();
      return upsertEntity(entity as unknown as EntityViewBaseShape, entityType);
    }
  );
  await Promise.all(operations);
};

export const onStreamEvent = instrumentLambdaHandler(_onStreamEvent);