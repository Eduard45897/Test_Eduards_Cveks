import React, { useState, useEffect } from "react";
import { Dropdown } from 'flowbite-react';
import { Line } from "react-chartjs-2";
import { countries } from './Table.js';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Legend, Title } from 'chart.js/auto';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, Legend, Title);

function ShowChart({ data, selectedCountry, startDate, endDate }) {
  const [casesData, setCasesData] = useState([]);
  const [deathsData, setDeathsData] = useState([]);

  useEffect(() => {
    if (selectedCountry) {
      function parseDate(dateString) {
        const parts = dateString.split('/');
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
  
      // Создаем объект для хранения данных по дням в формате { "дата": { "cases": 0, "deaths": 0 } }
      const dailyData = {};
      let currentDate = new Date(startDate);
  
      // Заполняем объект dailyData нулями для всех дней в заданном периоде
      while (currentDate <= endDate) {
        const formattedDate = currentDate.toLocaleDateString('default', { day: '2-digit', month: '2-digit', year: 'numeric' });
        dailyData[formattedDate] = { cases: 0, deaths: 0 };
        currentDate.setDate(currentDate.getDate() + 1); 
      }
  
      // Фильтруем данные для выбранной страны за указанный период и добавляем их в dailyData
      data.forEach(entry => {
        const date = parseDate(entry.dateRep);
        if (entry.countriesAndTerritories === selectedCountry && date >= startDate && date <= endDate) {
          const formattedDate = date.toLocaleDateString('default', { day: '2-digit', month: '2-digit', year: 'numeric' });
          dailyData[formattedDate] = { cases: entry.cases, deaths: entry.deaths };
        }
      });
  
      const cases = Object.values(dailyData).map(item => item.cases);
      const deaths = Object.values(dailyData).map(item => item.deaths);
  
      setCasesData(cases);
      setDeathsData(deaths);
    }
  }, [selectedCountry, startDate, endDate, data]);

  const periodLabels = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    periodLabels.push(currentDate.toLocaleString('default', { day: 'numeric', month: 'numeric', year: 'numeric' }));
    currentDate.setDate(currentDate.getDate() + 1); 
  }

  const lineChartData = {
    labels: periodLabels,
    datasets: [
      {
        data: casesData,
        label: "Заболевания",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.3
      },
      {
        data: deathsData,
        label: "Смерти",
        borderColor: "#ff3333",
        backgroundColor: "rgba(255, 0, 0, 0.5)",
        fill: true,
        lineTension: 0.3
      }
    ]
  };

  return (
    <Line
      type="line"
      width={800}
      height={400}
      data={lineChartData}
      options={{
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'Black'
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Период'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Количество'
            }
          }
        }
      }}
    />
  );
}

export default function ChartPage({data, startDate, endDate}) {
  const countryList = countries(data);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    handleDropdownClose();
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="tableFrame">
      <div className="chartDropdownWrapper">
        <h1 className="country">Страна</h1>
        <Dropdown label={selectedCountry ? selectedCountry : "Выбрать страну"} dismissOnClick={true} isopen={isDropdownOpen.toString()} toggle="dropdown">
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {countryList.map((country, index) => (
              <Dropdown.Item key={index} onClick={() => handleCountrySelect(country)}>{country}</Dropdown.Item>
            ))}
          </div>
        </Dropdown>
      </div>
      <ShowChart data={data} selectedCountry={selectedCountry} startDate={startDate} endDate={endDate}/>
    </div>
  );
}
