import React from 'react';
import Pagination from '@mui/material/Pagination';

function CustomPagination({ countriesPerPage, totalCountries, paginate }) {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalCountries / countriesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination
      count={pageNumbers.length} 
      variant="outlined"
      shape="rounded"
      onChange={(event, value) => paginate(value)}
    />
  );
}

export default CustomPagination;