# Lambda Function with SQS Queue Processing

> Event-driven message processing from Amazon SQS using AWS Lambda with automatic retries and dead-letter queue

## Overview

This pattern demonstrates how to build a scalable, event-driven message processing system using AWS Lambda and Amazon SQS. When messages are added to an SQS queue, Lambda functions are automatically triggered to process them. The pattern includes built-in retry logic, dead-letter queues for handling failures, and CloudWatch monitoring for observability.

**Key Benefits:**
- **Serverless**: No infrastructure to manage
- **Auto-scaling**: Automatically scales based on queue depth
- **Cost-effective**: Pay only for what you use
- **Reliable**: Built-in retries and error handling
- **Decoupled**: Producers and consumers are independent

**When to use this pattern:**
- Processing asynchronous workloads
- Decoupling microservices
- Building event-driven architectures
- Handling variable or unpredictable traffic
- Background job processing

**When NOT to use this pattern:**
- Real-time processing with sub-millisecond latency requirements
- Large messages > 256 KB (consider S3 with SQS extended client)
- Processing times > 15 minutes (Lambda timeout limit)
- Strict message ordering required (use SQS FIFO queues)

## Architecture

![Architecture Diagram](diagrams/architecture.png)

### Components

1. **Amazon SQS Queue**: Main queue that receives messages from producers
2. **AWS Lambda Function**: Processes messages from the queue
3. **Dead Letter Queue (DLQ)**: Stores messages that failed processing after max retries
4. **CloudWatch Logs**: Captures Lambda function logs for debugging
5. **CloudWatch Metrics**: Monitors queue depth, processing time, and errors
6. **IAM Role**: Grants Lambda permission to read from SQS and write to CloudWatch

### Data Flow

1. **Message Arrival**: Producer applications send messages to the SQS queue
2. **Polling**: Lambda service polls the SQS queue for messages
3. **Batch Processing**: Lambda retrieves up to 10 messages per batch
4. **Processing**: Lambda function processes each message
5. **Deletion**: Successfully processed messages are deleted from the queue
6. **Retry**: Failed messages are returned to the queue for retry
7. **DLQ**: Messages exceeding max retries are moved to the dead-letter queue
8. **Monitoring**: All activities are logged to CloudWatch

## Prerequisites

Before implementing this pattern, ensure you have:

- [x] AWS Account with appropriate IAM permissions
- [x] AWS CLI installed and configured (`aws --version`)
- [x] AWS SAM CLI installed (`sam --version`)
- [x] Node.js 18+ or Python 3.9+ installed
- [x] Basic understanding of Lambda and SQS concepts

## Implementation

### Step 1: Create the SQS Queues

Create the main queue and dead-letter queue:

```bash
# Create the dead-letter queue
aws sqs create-queue \
  --queue-name message-processing-dlq \
  --attributes VisibilityTimeout=300

# Get the DLQ ARN
DLQ_ARN=$(aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name message-processing-dlq --output text) \
  --attribute-names QueueArn \
  --query 'Attributes.QueueArn' \
  --output text)

# Create the main queue with DLQ configuration
aws sqs create-queue \
  --queue-name message-processing-queue \
  --attributes '{
    "VisibilityTimeout": "300",
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"'$DLQ_ARN'\",\"maxReceiveCount\":\"3\"}"
  }'
```

### Step 2: Create the Lambda Function

Create a file `index.js` with the following code:

```javascript
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const results = {
    successful: [],
    failed: []
  };

  for (const record of event.Records) {
    try {
      // Parse message body
      const message = JSON.parse(record.body);
      console.log('Processing message:', message);

      // Your business logic here
      await processMessage(message);

      results.successful.push(record.messageId);
    } catch (error) {
      console.error('Error processing message:', error);
      results.failed.push({
        messageId: record.messageId,
        error: error.message
      });
    }
  }

  console.log('Processing results:', results);

  // Return failed messages for retry
  if (results.failed.length > 0) {
    throw new Error(`Failed to process ${results.failed.length} messages`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Processing complete',
      results
    })
  };
};

async function processMessage(message) {
  // Implement your message processing logic here
  // Example: save to database, call external API, transform data, etc.
  console.log('Processing:', message);

  // Simulate some processing time
  await new Promise(resolve => setTimeout(resolve, 100));

  return { success: true };
}
```

### Step 3: Deploy with AWS SAM

Create a `template.yaml` file:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  ProcessingFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: message-processor
      Handler: index.handler
      Runtime: nodejs18.x
      Timeout: 30
      MemorySize: 256
      Events:
        SQSEvent:
          Type: SQS
          Properties:
            Queue: !GetAtt MessageQueue.Arn
            BatchSize: 10

  MessageQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: message-processing-queue
      VisibilityTimeout: 300
      RedrivePolicy:
        deadLetterTargetArn: !GetAtt DeadLetterQueue.Arn
        maxReceiveCount: 3

  DeadLetterQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: message-processing-dlq

Outputs:
  QueueUrl:
    Value: !Ref MessageQueue
  FunctionArn:
    Value: !GetAtt ProcessingFunction.Arn
```

Deploy the stack:

```bash
sam build
sam deploy --guided
```

## Configuration

### Key Parameters

| Parameter | Description | Recommended Value |
|-----------|-------------|-------------------|
| BatchSize | Number of messages per Lambda invocation | 10 (max) |
| VisibilityTimeout | Time message is hidden after being received | 6x function timeout |
| MaxReceiveCount | Retries before moving to DLQ | 3 |
| FunctionTimeout | Lambda execution timeout | 30-300 seconds |
| MemorySize | Lambda memory allocation | 256-512 MB |

### Environment Variables

Configure these in your Lambda function:

- `LOG_LEVEL`: Set logging verbosity (INFO, DEBUG, ERROR)
- `MAX_RETRY_ATTEMPTS`: Override default retry logic
- `PROCESSING_TIMEOUT`: Custom timeout for message processing

## Testing

### Manual Testing

Send a test message to the queue:

```bash
# Get queue URL
QUEUE_URL=$(aws sqs get-queue-url \
  --queue-name message-processing-queue \
  --query 'QueueUrl' \
  --output text)

# Send test message
aws sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body '{"orderId": "12345", "action": "process"}'
```

Check the CloudWatch Logs:

```bash
aws logs tail /aws/lambda/message-processor --follow
```

### Expected Results

1. Lambda function is invoked automatically
2. Message is processed successfully
3. Message is deleted from the queue
4. Processing logged in CloudWatch

### Testing Failures

Send a malformed message to test DLQ:

```bash
aws sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body 'invalid-json'
```

After 3 retries, the message should move to the DLQ.

## Monitoring and Observability

### Key Metrics to Monitor

1. **Queue Metrics**:
   - `ApproximateNumberOfMessagesVisible`: Messages in queue
   - `ApproximateAgeOfOldestMessage`: Oldest message age
   - `NumberOfMessagesDeleted`: Successfully processed

2. **Lambda Metrics**:
   - `Invocations`: Number of executions
   - `Errors`: Failed invocations
   - `Duration`: Processing time
   - `ConcurrentExecutions`: Scaling level

3. **DLQ Metrics**:
   - `ApproximateNumberOfMessagesVisible`: Failed messages

### CloudWatch Alarms

Set up alarms for:

```bash
# Alarm for DLQ messages
aws cloudwatch put-metric-alarm \
  --alarm-name dlq-messages-alarm \
  --alarm-description "Alert when messages in DLQ" \
  --metric-name ApproximateNumberOfMessagesVisible \
  --namespace AWS/SQS \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold

# Alarm for old messages
aws cloudwatch put-metric-alarm \
  --alarm-name queue-age-alarm \
  --alarm-description "Alert when messages are too old" \
  --metric-name ApproximateAgeOfOldestMessage \
  --namespace AWS/SQS \
  --statistic Maximum \
  --period 300 \
  --threshold 3600 \
  --comparison-operator GreaterThanThreshold
```

## Cost Estimation

**Assumptions:**
- 1 million messages per month
- Average message size: 10 KB
- Lambda execution time: 100ms per message
- 256 MB memory allocation

**Monthly costs:**
- SQS requests: $0.40 (1M requests × $0.40/million)
- Lambda invocations: $0.20 (100K invocations at 10 messages/batch)
- Lambda compute: $0.42 (100K × 100ms × $0.0000166667)
- CloudWatch Logs: ~$0.50

**Total: ~$1.52/month**

For higher volumes or larger messages, costs scale linearly.

## Security Considerations

### IAM Best Practices

1. **Least Privilege**: Lambda role has only required permissions
2. **Encryption**: Enable encryption at rest for SQS queues
3. **VPC**: Deploy Lambda in VPC if accessing private resources
4. **Secrets**: Use AWS Secrets Manager for sensitive data

### Example IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:*:*:message-processing-queue"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Troubleshooting

### Issue 1: Messages Not Being Processed

**Symptom**: Messages stay in queue, Lambda not invoked

**Cause**: Event source mapping not configured or IAM permissions missing

**Solution**:
```bash
# Check event source mapping
aws lambda list-event-source-mappings \
  --function-name message-processor

# Verify IAM role has sqs:ReceiveMessage permission
```

### Issue 2: Messages Going to DLQ Immediately

**Symptom**: All messages move to DLQ without processing

**Cause**: Lambda function throwing errors, timeout too short

**Solution**:
- Check CloudWatch Logs for error details
- Increase function timeout
- Fix application code errors

### Issue 3: Lambda Throttling

**Symptom**: High queue depth, slow processing

**Cause**: Concurrent execution limit reached

**Solution**:
```bash
# Increase reserved concurrency
aws lambda put-function-concurrency \
  --function-name message-processor \
  --reserved-concurrent-executions 100
```

## Cleanup

Remove all resources:

```bash
# Delete SAM stack
sam delete

# Or delete manually
aws lambda delete-function --function-name message-processor
aws sqs delete-queue --queue-url $QUEUE_URL
aws sqs delete-queue --queue-url $DLQ_URL
```

## Limitations

- **Lambda timeout**: Maximum 15 minutes per execution
- **Message size**: 256 KB maximum per message
- **Batch size**: Maximum 10 messages per batch (standard queue)
- **Ordering**: No guaranteed order in standard queues
- **Visibility timeout**: Must be > 6× Lambda timeout

## Alternatives

Consider these alternatives depending on your needs:

1. **SQS FIFO + Lambda**: When strict ordering is required
2. **EventBridge + Lambda**: For event routing and filtering
3. **Kinesis + Lambda**: For real-time streaming data
4. **Step Functions**: For complex, multi-step workflows

## Related Patterns

- [Lambda with SNS Fan-out](../lambda-sns-fanout/README.md)
- [EventBridge to Lambda Processing](../eventbridge-lambda-processing/README.md)

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon SQS Documentation](https://docs.aws.amazon.com/sqs/)
- [Using Lambda with SQS](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html)
- [SQS Best Practices](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-best-practices.html)

## License

MIT License

## Author

- **Name**: John Architect
- **GitHub**: [@johnarchitect](https://github.com/johnarchitect)
- **Email**: john@example.com
- **Organization**: Tech Solutions Inc

## Changelog

### Version 1.0.0 (2024-11-01)
- Initial release
- Basic Lambda + SQS integration
- Dead-letter queue configuration
- CloudWatch monitoring setup
