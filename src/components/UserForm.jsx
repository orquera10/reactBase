import React from "react";

const UserForm = ({ errors, newUser, setNewUser, addUser }) => (
  <div className="card p-3 mb-3">
    <div className="row g-3 align-items-center">

      {/* Campo Ficha */}
      <div className="col-12 col-md-2">
        <input
          type="text"
          className={`form-control ${errors.ficha ? "is-invalid" : ""}`}
          placeholder="Ficha"
          value={newUser.ficha}
          onChange={(e) => setNewUser({ ...newUser, ficha: e.target.value })}
        />
        {errors.ficha && <div className="invalid-feedback">{errors.ficha}</div>}
      </div>
      
      {/* Campo Nombre */}
      <div className="col-12 col-md-2">
        <input
          type="text"
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          placeholder="Nombre"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>

      {/* Campo DNI */}
      <div className="col-12 col-md-2">
        <input
          type="text"
          className={`form-control ${errors.dni ? "is-invalid" : ""}`}
          placeholder="DNI"
          value={newUser.dni}
          onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
        />
        {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
      </div>

      {/* Campo Carnet */}
      <div className="col-12 col-md-2">
        <input
          type="text"
          className={`form-control ${errors.carnet ? "is-invalid" : ""}`}
          placeholder="Carnet"
          value={newUser.carnet}
          onChange={(e) => setNewUser({ ...newUser, carnet: e.target.value })}
        />
        {errors.carnet && <div className="invalid-feedback">{errors.carnet}</div>}
      </div>

      {/* Campo Obra Social */}
      <div className="col-12 col-md-2">
        <input
          type="text"
          className={`form-control ${errors.obraSocial ? "is-invalid" : ""}`}
          placeholder="Obra Social"
          value={newUser.obraSocial}
          onChange={(e) => setNewUser({ ...newUser, obraSocial: e.target.value })}
        />
        {errors.obraSocial && (
          <div className="invalid-feedback">{errors.obraSocial}</div>
        )}
      </div>

      {/* Botón Agregar */}
      <div className="col-12 col-md-2">
        <button className="btn btn-primary w-100" onClick={addUser}>
          Agregar Paciente
        </button>
      </div>
    </div>
  </div>
);

export default UserForm;


