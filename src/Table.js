import React, { useState, useEffect } from "react";
import { Dropdown } from 'flowbite-react';
import Stack from '@mui/material/Stack';
import Pagination from './CustomPagination';

// Компонент выпадающего списка для выбора поля фильтрации
function DropDownList({ handleFilterFieldChange, selectedField }) {

  const handleItemClick = (field) => {
    handleFilterFieldChange(field);
  };

  return (
    <div className="dropdown-wrapper">
      <Dropdown
        label={selectedField || "Выбрать поле для фильтрации..."}
        className="dropdown-menu"
      >
        <Dropdown.Item onClick={() => handleItemClick('Количество случаев')}>Количество случаев</Dropdown.Item>
        <Dropdown.Item onClick={() => handleItemClick('Количество смертей')}>Количество смертей</Dropdown.Item>
        <Dropdown.Item onClick={() => handleItemClick('Количество случаев всего')}>Количество случаев всего</Dropdown.Item>
        <Dropdown.Item onClick={() => handleItemClick('Количество смертей всего')}>Количество смертей всего</Dropdown.Item>
        <Dropdown.Item onClick={() => handleItemClick('Количество случаев на 1000 жителей')}>Количество случаев на 1000 жителей</Dropdown.Item>
        <Dropdown.Item onClick={() => handleItemClick('Количество смертей на 1000 жителей')}>Количество смертей на 1000 жителей</Dropdown.Item>
      </Dropdown>
    </div>
  );
}

//Функция извлечения списка стран
export function countries(data) {
  const countries = {};

  data.forEach((item) => {
    const country = item.countriesAndTerritories;
    countries[country] = true;
  });

  return Object.keys(countries);
}

//Функция подсчета количества случаев всего
function casesCountTotal(data) {
  const casesArr = {};

  data.forEach((item) => {
    const country = item.countriesAndTerritories;
    const cases = parseInt(item.cases);

    if (!isNaN(cases)) {
      if (!casesArr[country]) {
        casesArr[country] = 0;
      }
      casesArr[country] += cases;
    }
  });

  return casesArr;
}

//Функция подсчета количества случаев за определённый период
export function casesCountByDate(data, startDate, endDate) {
  const casesByDate = {};

  data.forEach(item => {
    const dateParts = item.dateRep.split('/'); 
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Месяцы в JavaScript начинаются с 0
    const year = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);

    const country = item.countriesAndTerritories;
    const cases = parseInt(item.cases);

    if (date >= startDate && date <= endDate) {
      if (!casesByDate[country]) {
          casesByDate[country] = 0;
      }
      casesByDate[country] += cases;
    }
  });

  return casesByDate;
}

//Функция подсчета количества смертей всего
function deathsCountTotal(data) {
  const deathsArr = {};

  data.forEach((item) => {
    const country = item.countriesAndTerritories;
    const deaths = parseInt(item.deaths);

    if (!isNaN(deaths)) {
      if (!deathsArr[country]) {
        deathsArr[country] = 0;
      }
      deathsArr[country] += deaths;
    }
  });

  return deathsArr;
}

//Функция подсчета количества смертей за определённый период
export function deathsCountByDate(data, startDate, endDate) {
  const deathsByDate = {};

  data.forEach(item => {
    const dateParts = item.dateRep.split('/'); 
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Месяцы в JavaScript начинаются с 0
    const year = parseInt(dateParts[2]);
    
    const date = new Date(year, month, day);

    const country = item.countriesAndTerritories;
    const deaths = parseInt(item.deaths);

    if (date >= startDate && date <= endDate) {
      if (!deathsByDate[country]) {
        deathsByDate[country] = 0;
      }
      deathsByDate[country] += deaths;
    }
  });

  return deathsByDate;
}

//Функция извлечения списка населения каждой страны
function population(data) {
  const pop = {};

  data.forEach((item) => {
    const country = item.countriesAndTerritories;
    const population = parseInt(item.popData2019);
    pop[country] = population;
  });

  return pop;
}

//Функция рассчета случаев на 1000 жителей
function calculateCasesPerThousand(cases, population) {
  const casesPerThousand = (cases / population) * 1000;
  return Number(casesPerThousand.toFixed(10)); 
}

//Функция рассчета смертей на 1000 жителей
function calculateDeathsPerThousand(deaths, population) {
  const deathsPerThousand = (deaths / population) * 1000;
  return Number(deathsPerThousand.toFixed(10)); 
}

// Функция для отображения данных о случаях и смертности по странам.
function DataComponent({ data, startDate, endDate, foundCountry }) {
  const popData = population(data);

  function getRowStyle(country) {
    return foundCountry === country ? { fontWeight: 'bold', color: 'darkblue', border: '3px solid purple' } : {};
  }

  return (
    <DataShow
      countries={countries(data)}
      casesTotal={casesCountTotal(data)}
      deaths={deathsCountTotal(data)}
      casesByDate={casesCountByDate(data, startDate, endDate)}
      deathsByDate={deathsCountByDate(data, startDate, endDate)}
      calculateCasesPerThousand={(cases, country) => calculateCasesPerThousand(cases, popData[country])}
      calculateDeathsPerThousand={(deaths, country) => calculateDeathsPerThousand(deaths, popData[country])}
      getRowStyle={getRowStyle}
      foundCountry={foundCountry}
    />
  );
}

// Отображение данных в таблице
function DataShow({ countries, casesTotal, deaths, casesByDate, deathsByDate, calculateCasesPerThousand, 
  calculateDeathsPerThousand, getRowStyle, foundCountry }) { 

    const [sortType, setSortType] = useState({
      column: null,
      order: 'asc', // 'asc' - по возрастанию, 'desc' - по убыванию
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [countriesPerPage] = useState(20);

    const handleSort = (column) => {
      setSortType(prevState => ({
        column: column,
        order: prevState.column === column && prevState.order === 'asc' ? 'desc' : 'asc',
      }));
    };

    const sortedCountries = countries.map(country => ({
      country,
      casesByDate: casesByDate[country],
      deathsByDate: deathsByDate[country],
      casesTotal: casesTotal[country],
      deaths: deaths[country],
      casesPerThousand: calculateCasesPerThousand(casesByDate[country], country),
      deathsPerThousand: calculateDeathsPerThousand(deathsByDate[country], country)
    }));

    sortedCountries.sort((a, b) => {
      if (sortType.column) {
        let comparison = 0;
        if (a[sortType.column] > b[sortType.column]) {
          comparison = 1;
        } else if (a[sortType.column] < b[sortType.column]) {
          comparison = -1;
        }
        return sortType.order === 'desc' ? comparison * -1 : comparison;
      }
      return 0;
    });

    // Перемещение найденной страны в начало списка
    if (foundCountry) {
      const index = sortedCountries.findIndex(country => country.country === foundCountry);
      if (index !== -1 && index !== 0) {
        const foundCountryData = sortedCountries[index];
        sortedCountries.splice(index, 1);
        sortedCountries.unshift(foundCountryData);
      }
    }

    // Определение индексов стран для текущей страницы
    const indexOfLastCountry = currentPage * countriesPerPage;
    const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
    const currentCountries = sortedCountries.slice(indexOfFirstCountry, indexOfLastCountry);

    // Функция для изменения текущей страницы
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
      <div>
        <table className="data-table">
        <thead>
          <tr>
            <th scope="col">
              Страна
              <button onClick={() => handleSort('country')}>
                {sortType.column === 'country' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
            <th scope="col">
              Количество случаев
              <button onClick={() => handleSort('casesByDate')}>
                {sortType.column === 'casesByDate' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
            <th scope="col">
              Количество смертей
              <button onClick={() => handleSort('deathsByDate')}>
                {sortType.column === 'deathsByDate' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
            <th scope="col">
              Количество случаев всего
              <button onClick={() => handleSort('casesTotal')}>
                {sortType.column === 'casesTotal' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
            <th scope="col">
              Количество смертей всего
              <button onClick={() => handleSort('deaths')}>
                {sortType.column === 'deaths' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
            <th scope="col">
              Количество случаев на 1000 жителей
              <button onClick={() => handleSort('casesPerThousand')}>
                {sortType.column === 'casesPerThousand' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
            <th scope="col">
              Количество смертей на 1000 жителей
              <button onClick={() => handleSort('deathsPerThousand')}>
                {sortType.column === 'deathsPerThousand' && sortType.order === 'asc' ? '▼' : '▲'}
              </button>
            </th>
          </tr>
        </thead>
          <tbody>
            {currentCountries.map((countryData, index) => (
              <tr key={index} style={getRowStyle(countryData.country)}>
                <td>{countryData.country}</td>
                <td>{countryData.casesByDate}</td>
                <td>{countryData.deathsByDate}</td>
                <td>{countryData.casesTotal}</td>
                <td>{countryData.deaths}</td>
                <td>{countryData.casesPerThousand}</td>
                <td>{countryData.deathsPerThousand}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Stack className="pagination" spacing={2}>
        <Pagination
          countriesPerPage={countriesPerPage}
          totalCountries={countries.length}
          paginate={paginate}
        />
        </Stack>
      </div>
    );
}

export default function TablePage({ data, startDate, endDate }) {
  const [searchValue, setSearchValue] = useState('');
  const [foundCountry, setFoundCountry] = useState(null);
  const [filterField, setFilterField] = useState('');
  const [filterValueFrom, setFilterValueFrom] = useState('');
  const [filterValueTo, setFilterValueTo] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const countriesList = countries(data);

  // Функция для поиска страны
  function handleCountrySearch() {
    const found = countrySearch(searchValue, countriesList);
    setFoundCountry(found);
    if (!found) {
      alert('Страна не найдена');
    }
  }

  // Функция для поиска страны в списке
  function countrySearch(value, countriesList) {
    return countriesList.find(country => country.toLowerCase() === value.toLowerCase());
  }

  // Обработчик изменения значения в поле поиска
  function handleSearchInputChange(e) {
    setSearchValue(e.target.value);
  }

  // Обработчик нажатия клавиши Enter в поле поиска
  function handleSearchInputKeyDown(e) {
    if (e.key === 'Enter') {
      handleCountrySearch();
    }
  }

  // useEffect используется для фильтрации данных в зависимости от выбранных значений
  useEffect(() => {
    function filterData() {
      const casesByDate = casesCountByDate(data, startDate, endDate);
      const deathsByDate = deathsCountByDate(data, startDate, endDate);
      const allCases = casesCountTotal(data);
      const allDeaths = deathsCountTotal(data);
  
      const parsedFrom = parseInt(filterValueFrom);
      const parsedTo = parseInt(filterValueTo);
  
      const filtered = data.filter(item => {
        let passFilter = true;
        
        if (filterField === 'Количество случаев') {
          const cases = casesByDate[item.countriesAndTerritories];
          passFilter = passFilter && cases >= parsedFrom && cases <= parsedTo;
        }
        if (filterField === 'Количество смертей') {
          const deaths = deathsByDate[item.countriesAndTerritories];
          passFilter = passFilter && deaths >= parsedFrom && deaths <= parsedTo;
        }
        if (filterField === 'Количество случаев всего') {
          const casesTotal = allCases[item.countriesAndTerritories];
          passFilter = passFilter && casesTotal >= parsedFrom && casesTotal <= parsedTo;
        }
        if (filterField === 'Количество смертей всего') {
          const deathsTotal = allDeaths[item.countriesAndTerritories];
          passFilter = passFilter && deathsTotal >= parsedFrom && deathsTotal <= parsedTo;
        }
        if (filterField === 'Количество случаев на 1000 жителей') {
          const casesPer1000Inh = calculateCasesPerThousand(casesByDate[item.countriesAndTerritories], parseInt(item.popData2019));
          passFilter = passFilter && casesPer1000Inh >= parsedFrom && casesPer1000Inh <= parsedTo;
        }
        if (filterField === 'Количество смертей на 1000 жителей') {
          const deathsPer1000Inh = calculateDeathsPerThousand(deathsByDate[item.countriesAndTerritories], parseInt(item.popData2019));
          passFilter = passFilter && deathsPer1000Inh >= parsedFrom && deathsPer1000Inh <= parsedTo;
        }
        return passFilter;
      });
  
      setFilteredData(filtered);
    }
  
    filterData();
  }, [data, filterField, filterValueFrom, filterValueTo, startDate, endDate]);

  // Функция для обновления поля фильтрации
  function handleFilterFieldChange(value) {
    setFilterField(value);
  }

  // Обработчик изменения значения в поле "Значение от"
  function handleFilterValueFromChange(value) {
    setFilterValueFrom(value);
  }

  // Обработчик изменения значения в поле "Значение до"
  function handleFilterValueToChange(value) {
    setFilterValueTo(value);
    
    // Если значение "до" изменилось и не пустое, то проверяем наличие данных
    if (value.trim() !== '') {
      if (filteredData.length === 0) {
        alert('Данные не найдены');
      }
    }
  }

  // Функция для сброса всех фильтров и возвращения к начальному состоянию.
  function handleResetFilters() {
    setSearchValue(''); // Очищает строку поиска.
    setFoundCountry(null); // Сбрасывает найденную страну.
    setFilterField(''); // Сбрасывает поле фильтрации.
    setFilterValueFrom(''); // Сбрасывает значение "Значение от".
    setFilterValueTo(''); // Сбрасывает значение "Значение до".
    setFilteredData(data); // Устанавливает фильтрованные данные равными исходным данным.
  }

  return (
    <div className="tableFrame">
      <div className="input-wrapper">
        <input
          className="countryInput"
          placeholder="Поиск страны..."
          value={searchValue}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchInputKeyDown}
        />
        <DropDownList handleFilterFieldChange={handleFilterFieldChange} selectedField={filterField} />
      </div>
      <input className="valueFrom" placeholder="Значение от" value={filterValueFrom}
        onChange={(e) => handleFilterValueFromChange(e.target.value)}/>
      <input className="valueTo" placeholder="Значение до" value={filterValueTo}
        onChange={(e) => handleFilterValueToChange(e.target.value)}/>
      <button className="reset" onClick={handleResetFilters} >Сбросить фильтры</button>
      <DataComponent data={filteredData} startDate={startDate} endDate={endDate} foundCountry={foundCountry}/>
    </div>
  );
}