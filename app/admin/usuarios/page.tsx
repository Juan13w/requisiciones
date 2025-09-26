'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

type User = {
  id: number;
  email: string;
  role: 'coordinator' | 'purchaser';
  empresa?: string;
  clave?: string;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<{ coordinators: any[]; purchasers: any[] }>({ coordinators: [], purchasers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'coordinator' as 'coordinator' | 'purchaser',
    empresa: '',
    clave: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      
      if (data.success) {
        console.log('Datos recibidos de la API:', JSON.stringify(data.data, null, 2));
        
        // Mapear los datos de la API al formato esperado por el estado
        const formattedData = {
          coordinators: data.data.coordinators || [],
          purchasers: data.data.purchasers || []
        };
        
        console.log('Datos formateados:', JSON.stringify(formattedData, null, 2));
        setUsers(formattedData);
      } else {
        console.error('Error en la respuesta:', data);
        toast.error(data.message || 'Error al cargar los usuarios');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al cargar los usuarios: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'coordinator' | 'purchaser',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('El correo es requerido');
      return;
    }

    if (formData.role === 'coordinator' && !formData.empresa) {
      toast.error('La empresa es requerida para coordinadores');
      return;
    }

    try {
      const url = editingId 
        ? `/api/admin/users/${editingId}`
        : '/api/admin/users';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          empresa: formData.role === 'coordinator' ? formData.empresa : undefined,
          clave: formData.clave || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente');
        resetForm();
        fetchUsers();
        setIsAdding(false);
      } else {
        console.error('Error en la respuesta:', data);
        toast.error(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al guardar el usuario: ${errorMessage}`);
    }
  };

  const handleEdit = (user: any, role: 'coordinator' | 'purchaser') => {
    // Usar el ID del usuario
    setEditingId(user.id);
    setFormData({
      email: user.correo || user.email,
      role,
      empresa: user.empresa || '',
      clave: user.clave || '',
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: number, role: 'coordinator' | 'purchaser') => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/admin/users/${id}?role=${role}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Usuario eliminado');
        fetchUsers();
      } else {
        console.error('Error en la respuesta:', data);
        toast.error(data.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al eliminar el usuario: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      role: 'coordinator',
      empresa: '',
      clave: '',
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const allUsers = [
    ...users.coordinators.map(c => ({
      ...c,
      id: c.coordinador_id,
      role: 'coordinator' as const,
    })),
    ...users.purchasers.map(p => ({
      ...p,
      id: p.usuario_id,
      role: 'purchaser' as const,
    })),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" />
          {isAdding ? 'Cancelar' : 'Agregar Usuario'}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {editingId ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña'}
                </label>
                <Input
                  type="password"
                  name="clave"
                  value={formData.clave || ''}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  minLength={6}
                  required={!editingId}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordinator">Coordinador</SelectItem>
                    <SelectItem value="purchaser">Compras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'coordinator' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Empresa</label>
                  <Input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    placeholder="Nombre de la empresa"
                    required={formData.role === 'coordinator'}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Coordinadores</h2>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.coordinators.length > 0 ? (
                  users.coordinators.map((user) => (
                    <TableRow key={`coord-${user.id}`}>
                      <TableCell>{user.correo}</TableCell>
                      <TableCell>{user.empresa}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user, 'coordinator')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id, 'coordinator')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No hay coordinadores registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Personal de Compras</h2>
          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo Electrónico</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.purchasers.length > 0 ? (
                  users.purchasers.map((user) => (
                    <TableRow key={`purchaser-${user.id}`}>
                      <TableCell>{user.correo}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(user, 'purchaser')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.usuario_id, 'purchaser')}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4">
                      No hay personal de compras registrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
