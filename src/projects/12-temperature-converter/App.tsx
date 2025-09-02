import React, { useState } from 'react';

function floorTo4Decimals(num: number): number {
  return Math.floor(num * 10000) / 10000;
}

export default function App(): React.ReactElement {
  const [celsius, setCelsius] = useState<string>('');
  const [fahrenheit, setFahrenheit] = useState<string>('');

  const handleCelsiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow blank input and minus sign
    if (inputValue === '' || inputValue === '-') {
      setCelsius(inputValue);
      setFahrenheit('');
      return;
    }

    const celsiusValue = parseFloat(inputValue);

    // If input is not a valid number, keep the input as is
    if (isNaN(celsiusValue)) {
      setCelsius(inputValue);
      setFahrenheit('');
      return;
    }

    setCelsius(inputValue);
    const fahrenheitValue = (celsiusValue * 9) / 5 + 32;
    setFahrenheit(floorTo4Decimals(fahrenheitValue).toString());
  };

  const handleFahrenheitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow blank input and minus sign
    if (inputValue === '' || inputValue === '-') {
      setFahrenheit(inputValue);
      setCelsius('');
      return;
    }

    const fahrenheitValue = parseFloat(inputValue);

    // If input is not a valid number, keep the input as is
    if (isNaN(fahrenheitValue)) {
      setFahrenheit(inputValue);
      setCelsius('');
      return;
    }

    setFahrenheit(inputValue);
    const celsiusValue = ((fahrenheitValue - 32) * 5) / 9;
    setCelsius(floorTo4Decimals(celsiusValue).toString());
  };

  return (
    <div className="container">
      <div>
        <label htmlFor="celsius">Celsius</label>
        <input
          type="number"
          id="celsius"
          value={celsius}
          onChange={handleCelsiusChange}
        />
      </div>

      <div>
        <label htmlFor="fahrenheit">Fahrenheit</label>
        <input
          type="number"
          id="fahrenheit"
          value={fahrenheit}
          onChange={handleFahrenheitChange}
        />
      </div>
    </div>
  );
}
