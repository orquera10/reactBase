import React from 'react';

const UserForm = ({ errors, newUser, setNewUser, addUser }) => (
  <div className="row g-3 mb-3 align-items-center">
    <div className="col">
      <input
        type="text"
        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
        placeholder="Nombre"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
    </div>
    <div className="col">
      <input
        type="text"
        className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
        placeholder="DNI"
        value={newUser.dni}
        onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
      />
      {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
    </div>
    <div className="col">
      <input
        type="text"
        className={`form-control ${errors.ficha ? 'is-invalid' : ''}`}
        placeholder="Ficha"
        value={newUser.ficha}
        onChange={(e) => setNewUser({ ...newUser, ficha: e.target.value })}
      />
      {errors.ficha && <div className="invalid-feedback">{errors.ficha}</div>}
    </div>
    <div className="col-auto">
      <button className="btn btn-primary" onClick={addUser}>
        Agregar Usuario
      </button>
    </div>
  </div>
);

export default UserForm;