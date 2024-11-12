import React from "react";

const UserList = ({
  users,
  editingId,
  setEditingId,
  editingValue,
  setEditingValue,
  errors,
  updateUser,
  deleteUser,
}) => (
  <ul className="list-group">
    {users.map((user) => (
      <li
        key={user.id}
        className="list-group-item d-flex justify-content-between align-items-center"
      >
        {editingId === user.id ? (
          <div>
            <input
              type="text"
              className={`form-control mb-1 ${errors.name ? "is-invalid" : ""}`}
              placeholder="Nombre"
              value={editingValue.name}
              onChange={(e) =>
                setEditingValue({ ...editingValue, name: e.target.value })
              }
            />
            {errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
            <input
              type="text"
              className={`form-control mb-1 ${errors.dni ? "is-invalid" : ""}`}
              placeholder="DNI"
              value={editingValue.dni}
              onChange={(e) =>
                setEditingValue({ ...editingValue, dni: e.target.value })
              }
            />
            {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
            <input
              type="text"
              className={`form-control mb-1 ${
                errors.ficha ? "is-invalid" : ""
              }`}
              placeholder="Número de Ficha"
              value={editingValue.ficha}
              onChange={(e) =>
                setEditingValue({ ...editingValue, ficha: e.target.value })
              }
            />
            {errors.ficha && (
              <div className="invalid-feedback">{errors.ficha}</div>
            )}
          </div>
        ) : (
          <div className="row" style={{ width: '75%' }}>
            <div className="col-6">
              <strong>Nombre:</strong> {user.name} <br />
              <strong>DNI:</strong> {user.dni} <br />
            </div>
            <div className="col-6 d-flex align-items-center">
              <strong className="h4 text-success">Ficha:</strong>{" "}
              <span className="h4 text-success">{user.ficha} </span>
            </div>
          </div>
        )}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center">
          {editingId === user.id ? (
            <button
              className="btn btn-success btn-sm m-2"
              onClick={() => updateUser(user.id)}
            >
              Guardar
            </button>
          ) : (
            <button
              className="btn btn-warning btn-sm m-2"
              onClick={() => {
                setEditingId(user.id);
                setEditingValue(user);
              }}
            >
              Editar
            </button>
          )}
          <button
            className="btn btn-danger btn-sm m-2"
            onClick={() => deleteUser(user.id)}
          >
            Eliminar
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default UserList;
