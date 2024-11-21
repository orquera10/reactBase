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
  orderBy,
} from "firebase/firestore";
import Swal from "sweetalert2";

import UserForm from "./UserForm";
import UserList from "./UserList";
import SearchBar from "./SearchBar";
import LoadingSpinner from "./LoadingSpinner";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Login from "../components/Login";

const CrudApp = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    dni: "",
    ficha: "",
    carnet: "",
    obraSocial: "",
    telefono: "", // Nuevo campo
  });
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState({
    name: "",
    dni: "",
    ficha: "",
    carnet: "",
    obraSocial: "",
    telefono: "", // Nuevo campo
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const usersCollection = collection(db, "users");

  // Convertir a mayúsculas
  const toUpperCase = (str) => str.trim().toUpperCase();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const q = query(usersCollection, orderBy("ficha", "asc"));
    const data = await getDocs(q);
    const usersData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setUsers(usersData);
    setFilteredUsers(usersData);
    setLoading(false);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) fetchUsers();
    });
  }, [fetchUsers]);

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
    if (!user.ficha.trim())
      newErrors.ficha = "El número de ficha es obligatorio.";
    return newErrors;
  };

  const checkIfExists = async (field, value, excludeId = null) => {
    const q = query(usersCollection, where(field, "==", value.toUpperCase()));
    const snapshot = await getDocs(q);
    return snapshot.docs.some((doc) => doc.id !== excludeId)
      ? `El campo ${field} ya está registrado.`
      : null;
  };

  const capitalizeName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const addUser = async () => {
    const newErrors = validateFields(newUser);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const fichaError = await checkIfExists("ficha", newUser.ficha);

    if (fichaError) {
      setErrors({
        ...newErrors,
        ficha: fichaError,
      });
      return;
    }

    setLoading(true);
    const capitalizedName = capitalizeName(newUser.name);
    const upperCaseFicha = toUpperCase(newUser.ficha);
    const upperCaseObraSocial = toUpperCase(newUser.obraSocial);

    await addDoc(usersCollection, {
      ...newUser,
      name: capitalizedName,
      ficha: upperCaseFicha,
      obraSocial: upperCaseObraSocial
    });

    fetchUsers();
    setNewUser({
      name: "",
      dni: "",
      ficha: "",
      carnet: "",
      obraSocial: "",
      telefono: "",
    });
    setErrors({});
    setLoading(false);
  };

  const updateUser = async (id) => {
    const newErrors = validateFields(editingValue);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const fichaError = await checkIfExists("ficha", editingValue.ficha, id);

    if (fichaError) {
      setErrors({
        ...newErrors,
        ficha: fichaError,
      });
      return;
    }

    setLoading(true);
    const capitalizedName = capitalizeName(editingValue.name);
    const upperCaseFicha = toUpperCase(editingValue.ficha);
    const upperCaseObraSocial = toUpperCase(editingValue.obraSocial);

    await updateDoc(doc(db, "users", id), {
      ...editingValue,
      name: capitalizedName,
      ficha: upperCaseFicha,
      obraSocial: upperCaseObraSocial
    });

    fetchUsers();
    setEditingId(null);
    setErrors({});
    setLoading(false);
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
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
          (user.name || "").toLowerCase().includes(lowerCaseTerm) ||
          (user.dni || "").includes(lowerCaseTerm) ||
          (user.ficha || "").includes(lowerCaseTerm) ||
          (user.carnet || "").toLowerCase().includes(lowerCaseTerm) ||
          (user.obraSocial || "").toLowerCase().includes(lowerCaseTerm) ||
          (user.telefono || "").toLowerCase().includes(lowerCaseTerm) // Nuevo campo incluido en la búsqueda
      )
    );
  };

  return (
    <div className="container mt-5">
      <button
        onClick={handleLogout}
        className="btn btn-danger rounded-circle position-absolute top-0 end-0 m-3"
        style={{
          width: "50px",
          height: "50px",
          fontSize: "24px",
          padding: "0",
        }}
      >
        <i className="fas fa-sign-out-alt"></i>
      </button>
      <h1 className="text-center mb-4">FICHAS MÉDICAS</h1>
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
