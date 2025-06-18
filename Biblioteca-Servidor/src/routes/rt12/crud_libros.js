const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/suma1', (req, res) => {
  res.render('rt12/suma');
});

router.post('/sumar', async (req, res) => {
  const { num1, num2 } = req.body;

  try {
    const response = await axios.post('http://localhost:5001/sumar', {
      num1: parseFloat(num1),
      num2: parseFloat(num2)
    });

    res.render('rt12/suma', { resultado: response.data.resultado });
  } catch (error) {
    console.error(error);
    res.send('Error al conectar con el microservicio');
  }
});

module.exports = router;
