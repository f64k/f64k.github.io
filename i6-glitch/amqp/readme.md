

https://github.com/cloudamqp/amqp-client.js/?tab=readme-ov-file

запрос:
connect with AMQPWebSocketClient to dog.lmq.cloudamqp.com LavinMQ

https://www.cloudamqp.com/docs/amqp_over_websockets.html
AMQP over WebSockets
This feature is available on all CloudAMQP plans

NOTE: When connecting to CloudAMQP via AMQP WebSockets, you should use a connection URL like:
const url = 'wss://test-small-ivory-rat.rmq2.cloudamqp.com/ws/amqp'
const amqp = new AMQPWebSocketClient(url, "VHOST", "USERNAME", "YOUR_PASSWORD")

