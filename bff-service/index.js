const express = require('express');
const cors = require('cors');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const app = express();
app.use(cors());
app.use(express.json());

// Cliente de AWS SNS (toma la región de variables de entorno)
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Endpoint de salud que solicita API Gateway / Frontend
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'BFF EC2' });
});

// Endpoint para recibir la petición de Vercel y publicar en SNS
app.post('/api/report', async (req, res) => {
  const { data } = req.body;

  const params = {
    Message: JSON.stringify({ data, timestamp: new Date() }),
    TopicArn: process.env.SNS_TOPIC_ARN // ARN de tu tema SNS
  };

  try {
    const command = new PublishCommand(params);
    const result = await snsClient.send(command);
    res.status(200).json({ message: 'Informe en proceso', messageId: result.MessageId });
  } catch (error) {
    console.error('Error publicando en SNS:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BFF corriendo en puerto ${PORT}`));