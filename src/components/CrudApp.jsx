import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';

import UserForm from './UserForm';
import UserList from './UserList';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const data = await getDocs(usersCollection);
    const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUsers(usersData);
    setFilteredUsers(usersData);
    setLoading(false);
  }, [usersCollection]);

  const validateFields = (user) => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = 'El nombre es obligatorio.';
    if (!user.dni.trim()) newErrors.dni = 'El DNI es obligatorio.';
    else if (isNaN(user.dni)) newErrors.dni = 'El DNI debe ser numérico.';
    if (!user.ficha.trim()) newErrors.ficha = 'El número de ficha es obligatorio.';
    else if (isNaN(user.ficha)) newErrors.ficha = 'El número de ficha debe ser numérico.';
    return newErrors;
  };

  const checkIfExists = async (field, value, excludeId = null) => {
    const q = query(usersCollection, where(field, '==', value));
    const snapshot = await getDocs(q);
    return snapshot.docs.some((doc) => doc.id !== excludeId)
      ? `El ${field} ya está registrado.`
      : null;
  };

  const addUser = async () => {
    const newErrors = validateFields(newUser);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const dniError = await checkIfExists('dni', newUser.dni);
    const fichaError = await checkIfExists('ficha', newUser.ficha);
    if (dniError || fichaError) {
      setErrors({ ...newErrors, dni: dniError, ficha: fichaError });
      return;
    }

    setLoading(true);
    await addDoc(usersCollection, newUser);
    fetchUsers();
    setNewUser({ name: '', dni: '', ficha: '' });
    setLoading(false);
  };

  const updateUser = async (id) => {
    const newErrors = validateFields(editingValue);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const dniError = await checkIfExists('dni', editingValue.dni, id);
    const fichaError = await checkIfExists('ficha', editingValue.ficha, id);
    if (dniError || fichaError) {
      setErrors({ ...newErrors, dni: dniError, ficha: fichaError });
      return;
    }

    setLoading(true);
    await updateDoc(doc(db, 'users', id), editingValue);
    fetchUsers();
    setEditingId(null);
    setLoading(false);
  };

  const deleteUser = async (id) => {
    setLoading(true);
    await deleteDoc(doc(db, 'users', id));
    fetchUsers();
    setLoading(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowerCaseTerm = term.toLowerCase();
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(lowerCaseTerm) ||
          user.dni.includes(lowerCaseTerm) ||
          user.ficha.includes(lowerCaseTerm)
      )
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-5">Aplicativo para turnos médicos</h1>
      <UserForm
        errors={errors}
        newUser={newUser}
        setNewUser={setNewUser}
        addUser={addUser}
      />
      <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
      {loading && <LoadingSpinner />}
      <UserList
        users={filteredUsers}
        editingId={editingId}
        setEditingId={setEditingId}
        editingValue={editingValue}
        setEditingValue={setEditingValue}
        errors={errors}
        updateUser={updateUser}
        deleteUser={deleteUser}
      />
    </div>
  );
};

export default CrudApp;