import { useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { Supplier } from "../types";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const q = query(collection(db, "suppliers"), orderBy("name"));
    const unsub = onSnapshot(q, snap => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addSupplier = (data: Omit<Supplier, "id">) =>
    addDoc(collection(db, "suppliers"), data);

  const updateSupplier = (id: string, data: Partial<Supplier>) =>
    updateDoc(doc(db, "suppliers", id), data);

  const deleteSupplier = (id: string) =>
    deleteDoc(doc(db, "suppliers", id));

  return { suppliers, loading, addSupplier, updateSupplier, deleteSupplier };
}
