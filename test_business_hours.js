// Test script for business hours algorithm
// Gece yarısını aşan çalışma saatlerini test et

// Backend'deki algoritmayı test et
const isWithinBusinessHours = (openingTime, closingTime, testTime = null) => {
  const now = testTime ? new Date(testTime) : new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [openHour, openMin] = openingTime.split(':').map(Number);
  const [closeHour, closeMin] = closingTime.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  console.log(`Testing time: ${String(Math.floor(currentTime/60)).padStart(2,'0')}:${String(currentTime%60).padStart(2,'0')}`);
  console.log(`Business hours: ${openingTime} - ${closingTime}`);
  console.log(`Open time (minutes): ${openTime}, Close time (minutes): ${closeTime}, Current time (minutes): ${currentTime}`);
  
  // Eğer kapanış saati açılış saatinden küçükse (gece geçiyor)
  if (closeTime < openTime) {
    console.log('Overnight hours detected');
    const result = currentTime >= openTime || currentTime < closeTime;
    console.log(`Should be open: ${result} (current >= open: ${currentTime >= openTime} OR current < close: ${currentTime < closeTime})`);
    return result;
  } else {
    console.log('Same day hours');
    const result = currentTime >= openTime && currentTime < closeTime;
    console.log(`Should be open: ${result} (current >= open: ${currentTime >= openTime} AND current < close: ${currentTime < closeTime})`);
    return result;
  }
};

// Test scenarios
console.log('=== Test Case 1: Normal Hours (09:00-22:00) ===');
console.log('Test at 14:30:');
isWithinBusinessHours('09:00', '22:00', new Date('2024-01-01 14:30:00'));
console.log('\nTest at 23:30:');
isWithinBusinessHours('09:00', '22:00', new Date('2024-01-01 23:30:00'));

console.log('\n=== Test Case 2: Overnight Hours (15:00-04:00) ===');
console.log('Test at 16:00 (should be OPEN):');
isWithinBusinessHours('15:00', '04:00', new Date('2024-01-01 16:00:00'));
console.log('\nTest at 02:00 (should be OPEN):');
isWithinBusinessHours('15:00', '04:00', new Date('2024-01-01 02:00:00'));
console.log('\nTest at 10:00 (should be CLOSED):');
isWithinBusinessHours('15:00', '04:00', new Date('2024-01-01 10:00:00'));
console.log('\nTest at 05:00 (should be CLOSED):');
isWithinBusinessHours('15:00', '04:00', new Date('2024-01-01 05:00:00'));

console.log('\n=== Test Case 3: Edge Cases ===');
console.log('Test at exactly opening time 15:00:');
isWithinBusinessHours('15:00', '04:00', new Date('2024-01-01 15:00:00'));
console.log('\nTest at exactly closing time 04:00:');
isWithinBusinessHours('15:00', '04:00', new Date('2024-01-01 04:00:00'));

console.log('\n=== Test Case 4: Late Night Hours (22:00-08:00) ===');
console.log('Test at 23:00 (should be OPEN):');
isWithinBusinessHours('22:00', '08:00', new Date('2024-01-01 23:00:00'));
console.log('\nTest at 07:00 (should be OPEN):');
isWithinBusinessHours('22:00', '08:00', new Date('2024-01-01 07:00:00'));
console.log('\nTest at 15:00 (should be CLOSED):');
isWithinBusinessHours('22:00', '08:00', new Date('2024-01-01 15:00:00'));
