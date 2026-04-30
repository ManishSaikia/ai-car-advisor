const testApi = async () => {
  const scenarios = [
    {
      name: "Scenario 1: Budget city car",
      messages: [
        { role: "user", content: "I am looking for a budget friendly car for city driving. Mileage is very important. Budget is around 10 lakhs." }
      ]
    },
    {
      name: "Scenario 2: Premium Family SUV",
      messages: [
        { role: "user", content: "Need a premium 7-seater SUV for family trips. Must have a panoramic sunroof and top safety rating." }
      ]
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\nTesting ${scenario.name}...`);
    try {
      const response = await fetch('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: scenario.messages })
      });
      
      const data = await response.json();
      console.log(`Status: ${response.status}`);
      console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
  }
};

testApi();
