// Lambda Function Handler for SQS Message Processing
exports.handler = async (event) => {
  console.log('Processing SQS messages:', event.Records.length);

  for (const record of event.Records) {
    try {
      // Parse message body
      const messageBody = JSON.parse(record.body);
      console.log('Processing message:', messageBody);

      // Process your business logic here
      await processMessage(messageBody);

      // Message will be automatically deleted from queue on success
    } catch (error) {
      console.error('Error processing message:', error);
      // Message will be retried based on queue configuration
      throw error;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ processed: event.Records.length })
  };
};

async function processMessage(message) {
  // Add your business logic here
  console.log('Business logic for:', message);
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 100));
}
