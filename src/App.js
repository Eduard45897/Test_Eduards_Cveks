import "./App.css";
import React, { Suspense, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import TabButton from './TabButton.js';
import ChartPage from './Chart.js';
import TablePage from './Table.js';

async function fileReader() {
  try {
    const response = await axios.get(
      "https://opendata.ecdc.europa.eu/covid19/casedistribution/json/"
    );
    return response.data.records;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function formatDate(dateString) {
  const parts = dateString.split("/");
  return `${parts[1]}/${parts[0]}/${parts[2]}`;
}

function maxDate(data) {
  if (data.length === 0) {
    return null;
  }

  let maxDate = new Date(formatDate(data[0].dateRep));

  for (let i = 1; i < data.length; i++) {
    const currentDate = new Date(formatDate(data[i].dateRep));
    if (!isNaN(currentDate.getTime()) && currentDate > maxDate) {
      maxDate = currentDate;
    }
  }

  return maxDate;
}

function minDate(data) {
  if (data.length === 0) {
    return null;
  }

  let minDate = new Date(formatDate(data[0].dateRep));

  for (let i = 1; i < data.length; i++) {
    const currentDate = new Date(formatDate(data[i].dateRep));
    if (!isNaN(currentDate.getTime()) && currentDate < minDate) {
      minDate = currentDate;
    }
  }

  return minDate;
}

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tab, setTab] = useState('Table');

  useEffect(() => {
    async function fetchData() {
      const data = await fileReader();
      setData(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      const minDateValue = minDate(data);
      const maxDateValue = maxDate(data);
      setStartDate(minDateValue);
      setEndDate(maxDateValue);
    }
  }, [loading, data]);

  if (loading || (!startDate && !endDate)) {
    return <h1>Loading...</h1>;
  }

  return (
    <section className="data">
      <h1 className="title">Статистика по COVID-19</h1>
      <h1 className="period">Период от</h1>
      <DatePicker
        className="datePicker"
        dateFormat="yyyy/MM/dd"
        selectsStart
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        startDate={startDate}
      />
      <h1 className="period">до</h1>
      <DatePicker
        className="datePicker"
        dateFormat="yyyy/MM/dd"
        selectsEnd
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        endDate={endDate}
        startDate={startDate}
        minDate={startDate}
      />
      <div className="tabs">
        <Suspense fallback={<h1>🌀 Loading...</h1>}>
          <TabButton
            isActive={tab === 'Table'}
            onClick={() => setTab('Table')}
            className="tab-button" 
          >
            Таблица
          </TabButton>
          <TabButton
            isActive={tab === 'Chart'}
            onClick={() => setTab('Chart')}
            className="tab-button"
          >
            График
          </TabButton>
          {tab === 'Table' && <TablePage data={data} startDate={startDate} endDate={endDate} />}
          {tab === 'Chart' && <ChartPage data={data} startDate={startDate} endDate={endDate}/>}
        </Suspense>
      </div>
    </section>
  );
}
