const axios = require('axios');
axios.post('http://localhost:5000/api/spec-labels', { category_id: 2, spec_label: "HI LABEL" })
  .then(res => console.log(res.data))
  .catch(e => console.error(e.response?.data || e.message));
