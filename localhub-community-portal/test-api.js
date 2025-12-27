// Quick test to check if the towns API is working
fetch('http://localhost:3000/api/communities/towns?cityId=1')
  .then(res => res.json())
  .then(data => {
    console.log('API Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('API Error:', error);
  });
