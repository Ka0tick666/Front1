const axios = require('axios');

exports.handler = async (event) => {
  for (const record of event.Records) {
 
    const body = JSON.parse(record.body);
    const message = JSON.parse(body.Message);

    console.log('Mensaje recibido de SQS:', message);

    try {

      const response = await axios.post('https://api.claudioviajando.com/api/notice', {
        event: 'REPORT_GENERATED',
        payload: message
      });

      console.log('Notificación enviada con éxito:', response.status);
    } catch (error) {
      console.error('Error enviando notificación:', error.message);
      throw error; 
    }
  }

  return { statusCode: 200, body: 'Procesado correctamente' };
};