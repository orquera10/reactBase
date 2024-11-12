import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import Swal from "sweetalert2"; // Importar SweetAlert2

import UserForm from "./UserForm";
import UserList from "./UserList";
import SearchBar from "./SearchBar";
import LoadingSpinner from "./LoadingSpinner";
import { orderBy } from "firebase/firestore";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "../components/Login";

const CrudApp = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", dni: "", ficha: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState({
    name: "",
    dni: "",
    ficha: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const usersCollection = collection(db, "users");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const q = query(usersCollection, orderBy("ficha", "asc"));
    const data = await getDocs(q);
    const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUsers(usersData);
    setFilteredUsers(usersData);
    setLoading(false);
  }, [usersCollection]);

  useEffect(() => {
    // Verifica si el usuario está autenticado
    onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) fetchUsers();
    });
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  const validateFields = (user) => {
    const newErrors = {};
    if (!user.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!user.dni.trim()) newErrors.dni = "El DNI es obligatorio.";
    else if (isNaN(user.dni)) newErrors.dni = "El DNI debe ser numérico.";
    if (!user.ficha.trim())
      newErrors.ficha = "El número de ficha es obligatorio.";
    else if (isNaN(user.ficha))
      newErrors.ficha = "El número de ficha debe ser numérico.";
    return newErrors;
  };

  const checkIfExists = async (field, value, excludeId = null) => {
    const q = query(usersCollection, where(field, "==", value));
    const snapshot = await getDocs(q);
    return snapshot.docs.some((doc) => doc.id !== excludeId)
      ? `El ${field} ya está registrado.`
      : null;
  };

  // Función para capitalizar la primera letra de cada palabra en el nombre
  const capitalizeName = (name) => {
    return name
      .split(" ") // Divide el nombre en palabras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza la primera letra de cada palabra
      .join(" "); // Une las palabras de nuevo en un solo string
  };

  const addUser = async () => {
    const newErrors = validateFields(newUser);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const dniError = await checkIfExists("dni", newUser.dni);
    const fichaError = await checkIfExists("ficha", newUser.ficha);
    if (dniError || fichaError) {
      setErrors({ ...newErrors, dni: dniError, ficha: fichaError });
      return;
    }

    setLoading(true);
    const capitalizedName = capitalizeName(newUser.name); // Capitalizar el nombre antes de guardarlo
    await addDoc(usersCollection, { ...newUser, name: capitalizedName });
    fetchUsers();
    setNewUser({ name: "", dni: "", ficha: "" });
    setLoading(false);
  };

  const updateUser = async (id) => {
    const newErrors = validateFields(editingValue);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const dniError = await checkIfExists("dni", editingValue.dni, id);
    const fichaError = await checkIfExists("ficha", editingValue.ficha, id);
    if (dniError || fichaError) {
      setErrors({ ...newErrors, dni: dniError, ficha: fichaError });
      return;
    }

    setLoading(true);
    const capitalizedName = capitalizeName(editingValue.name); // Capitalizar el nombre antes de actualizar
    await updateDoc(doc(db, "users", id), { ...editingValue, name: capitalizedName });
    fetchUsers();
    setEditingId(null);
    setLoading(false);
  };

  const deleteUser = async (id) => {
    // Mostrar un mensaje de confirmación con SweetAlert2 antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      setLoading(true);
      await deleteDoc(doc(db, "users", id));
      fetchUsers();
      setLoading(false);
    }
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

  return (
    <div className="container mt-5">
      <button
        onClick={handleLogout}
        className="btn btn-danger rounded-circle position-absolute top-0 end-0 m-3"
        style={{ width: '50px', height: '50px', fontSize: '24px', padding: '0' }}
      >
        <i className="fas fa-sign-out-alt"></i>
      </button>
      <h1 className="text-center mb-4">FICHAS MEDICAS</h1>
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