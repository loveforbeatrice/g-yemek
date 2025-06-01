// Test gece yarısını geçen açılış saatleri algoritması
function testBusinessHours() {
  const testCases = [
    {
      name: "Normal saatler (09:00-22:00)",
      openingTime: "09:00",
      closingTime: "22:00",
      testTimes: [
        { time: "08:30", expected: false },
        { time: "09:30", expected: true },
        { time: "15:00", expected: true },
        { time: "21:30", expected: true },
        { time: "22:30", expected: false }
      ]
    },
    {
      name: "Gece yarısı geçen saatler (15:00-04:00)",
      openingTime: "15:00",
      closingTime: "04:00",
      testTimes: [
        { time: "08:00", expected: false },
        { time: "14:30", expected: false },
        { time: "15:30", expected: true },
        { time: "23:00", expected: true },
        { time: "01:00", expected: true },
        { time: "03:30", expected: true },
        { time: "04:30", expected: false },
        { time: "10:00", expected: false }
      ]
    },
    {
      name: "Gece yarısı geçen saatler (22:00-06:00)",
      openingTime: "22:00",
      closingTime: "06:00",
      testTimes: [
        { time: "21:30", expected: false },
        { time: "22:30", expected: true },
        { time: "00:00", expected: true },
        { time: "03:00", expected: true },
        { time: "05:30", expected: true },
        { time: "06:30", expected: false },
        { time: "12:00", expected: false }
      ]
    }
  ];

  const isWithinBusinessHours = (openingTime, closingTime, testTime) => {
    const [testHour, testMin] = testTime.split(':').map(Number);
    const currentTime = testHour * 60 + testMin;
    
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    // Eğer kapanış saati açılış saatinden küçükse (gece geçiyor)
    if (closeTime < openTime) {
      // Şu anki saat açılış saatinden sonra VEYA kapanış saatinden önce
      return currentTime >= openTime || currentTime < closeTime;
    } else {
      // Normal durum: açılış ve kapanış aynı gün içinde
      return currentTime >= openTime && currentTime < closeTime;
    }
  };

  testCases.forEach(testCase => {
    console.log(`\n=== ${testCase.name} ===`);
    testCase.testTimes.forEach(test => {
      const result = isWithinBusinessHours(testCase.openingTime, testCase.closingTime, test.time);
      const status = result === test.expected ? "✓ PASS" : "✗ FAIL";
      console.log(`${test.time}: ${result} (expected: ${test.expected}) ${status}`);
    });
  });
}

testBusinessHours();
