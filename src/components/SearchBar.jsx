import React from 'react';  

const SearchBar = ({ searchTerm, handleSearch }) => (  
  <div className="row g-3 mb-3 align-items-center">  
    <div className="col">  
      <input  
        type="text"  
        className="form-control"  
        placeholder="Buscar por Nombre, DNI, Ficha, Obra Social o Carnet"  
        value={searchTerm}  
        onChange={(e) => handleSearch(e.target.value)}  
      />  
    </div>  
  </div>  
);  

export default SearchBar;  