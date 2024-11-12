import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';

const CrudApp = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', dni: '', ficha: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState({ name: '', dni: '', ficha: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const usersCollection = collection(db, 'users');

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getDocs(usersCollection);
    const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUsers(usersData);
    setFilteredUsers(usersData);
    setLoading(false);
  };

  const validateFields = (user) => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!user.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio.';
    } else if (isNaN(user.dni)) {
      newErrors.dni = 'El DNI debe ser numérico.';
    }
    if (!user.ficha.trim()) {
      newErrors.ficha = 'El número de ficha es obligatorio.';
    } else if (isNaN(user.ficha)) {
      newErrors.ficha = 'El número de ficha debe ser numérico.';
    }
    return newErrors;
  };

  const checkIfFichaExists = async (ficha, excludeId = null) => {
    const qFicha = query(usersCollection, where('ficha', '==', ficha));
    const fichaSnapshot = await getDocs(qFicha);

    if (fichaSnapshot.docs.some((doc) => doc.id !== excludeId)) {
      return { error: 'El número de ficha ya está registrado.' };
    }

    return { error: null };
  };

  const checkIfDniExists = async (dni, excludeId = null) => {
    const qDni = query(usersCollection, where('dni', '==', dni));
    const dniSnapshot = await getDocs(qDni);

    if (dniSnapshot.docs.some((doc) => doc.id !== excludeId)) {
      return { error: 'El DNI ya está registrado.' };
    }

    return { error: null };
  };

  const addUser = async () => {
    const newErrors = validateFields(newUser);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dniCheck = await checkIfDniExists(newUser.dni);
    if (dniCheck.error) {
      setErrors({ ...newErrors, dni: dniCheck.error });
      return;
    }

    const fichaCheck = await checkIfFichaExists(newUser.ficha);
    if (fichaCheck.error) {
      setErrors({ ...newErrors, ficha: fichaCheck.error });
      return;
    }

    setErrors({});
    setLoading(true);
    await addDoc(usersCollection, { ...newUser });
    setNewUser({ name: '', dni: '', ficha: '' });
    fetchUsers();
    setLoading(false);
  };

  const updateUser = async (id) => {
    const newErrors = validateFields(editingValue);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dniCheck = await checkIfDniExists(editingValue.dni, id);
    if (dniCheck.error) {
      setErrors({ ...newErrors, dni: dniCheck.error });
      return;
    }

    const fichaCheck = await checkIfFichaExists(editingValue.ficha, id);
    if (fichaCheck.error) {
      setErrors({ ...newErrors, ficha: fichaCheck.error });
      return;
    }

    setErrors({});
    setLoading(true);
    const userDoc = doc(db, 'users', id);
    await updateDoc(userDoc, { ...editingValue });
    setEditingId(null);
    setEditingValue({ name: '', dni: '', ficha: '' });
    fetchUsers();
    setLoading(false);
  };

  const deleteUser = async (id) => {
    setLoading(true);
    const userDoc = doc(db, 'users', id);
    await deleteDoc(userDoc);
    fetchUsers();
    setLoading(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowerCaseTerm = term.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseTerm) ||
        user.dni.includes(lowerCaseTerm) ||
        user.ficha.includes(lowerCaseTerm)
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center">Aplicativo para turnos medicos</h1>

      {/* Formulario para agregar usuarios */}
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
            placeholder="Número de Ficha"
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

      {/* Campo de búsqueda en tiempo real */}
      <div className="row g-3 mb-3 align-items-center">
        <div className="col">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por Nombre, DNI o Ficha"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Spinner de carga */}
      {loading && (
        <div className="text-center mb-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <ul className="list-group">
        {filteredUsers.map((user) => (
          <li
            key={user.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {editingId === user.id ? (
              <div>
                <input
                  type="text"
                  className={`form-control mb-1 ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="Nombre"
                  value={editingValue.name}
                  onChange={(e) => setEditingValue({ ...editingValue, name: e.target.value })}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                <input
                  type="text"
                  className={`form-control mb-1 ${errors.dni ? 'is-invalid' : ''}`}
                  placeholder="DNI"
                  value={editingValue.dni}
                  onChange={(e) => setEditingValue({ ...editingValue, dni: e.target.value })}
                />
                {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
                <input
                  type="text"
                  className={`form-control mb-1 ${errors.ficha ? 'is-invalid' : ''}`}
                  placeholder="Número de Ficha"
                  value={editingValue.ficha}
                  onChange={(e) => setEditingValue({ ...editingValue, ficha: e.target.value })}
                />
                {errors.ficha && <div className="invalid-feedback">{errors.ficha}</div>}
              </div>
            ) : (
              <div>
                <strong>Nombre:</strong> {user.name} <br />
                <strong>DNI:</strong> {user.dni} <br />
                <strong>Ficha:</strong> {user.ficha}
              </div>
            )}
            <div>
              {editingId === user.id ? (
                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={() => updateUser(user.id)}
                >
                  Guardar
                </button>
              ) : (
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => {
                    setEditingId(user.id);
                    setEditingValue(user);
                  }}
                >
                  Editar
                </button>
              )}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteUser(user.id)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CrudApp;
