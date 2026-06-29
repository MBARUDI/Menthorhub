import { useState, useEffect } from 'react';
import { User, Shield, Bell, Settings as SettingsIcon, Database, HelpCircle, Info, Users, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = ({ user, updateUser, systemSettings, updateSystemSettings, helpInfo, updateHelpInfo }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [localSystemSettings, setLocalSystemSettings] = useState(systemSettings);
  const [localHelpInfo, setLocalHelpInfo] = useState(helpInfo);
  const [localUser, setLocalUser] = useState(user);
  const [systemUsers, setSystemUsers] = useState([]);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '', email: '', password: '', role: 'técnico', allowed_categories: []
  });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    id: null, name: '', email: '', password: '', role: 'técnico', allowed_categories: []
  });

  const availableCategories = ['Informática/TI', 'Elétrica', 'Predial/Civil', 'Segurança', 'Telecom'];

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setSystemUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        fetchUsers();
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
      }
    }
  };

  const handleOpenEditModal = (userToEdit) => {
    setEditUserForm({
      id: userToEdit.id,
      name: userToEdit.name,
      email: userToEdit.email,
      password: '', // Mantém em branco para não sobreescrever se não for digitada nova
      role: userToEdit.role,
      allowed_categories: userToEdit.allowed_categories ? userToEdit.allowed_categories.split(',') : []
    });
    setShowEditUserModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editUserForm,
        allowed_categories: editUserForm.allowed_categories.join(',')
      };
      const res = await fetch(`/api/users/${editUserForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowEditUserModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao editar usuário');
      }
    } catch (err) {
      console.error('Erro ao editar usuário:', err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newUserForm,
        allowed_categories: newUserForm.allowed_categories.join(',')
      };
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowNewUserModal(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'técnico', allowed_categories: [] });
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao criar usuário');
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
    }
  };

  const handleProfileSave = () => {
    updateUser(localUser);
    alert('Perfil atualizado com sucesso!');
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalUser({ ...localUser, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSystemSave = () => {
    updateSystemSettings(localSystemSettings);
    alert('Configurações do sistema atualizadas!');
  };

  const handleHelpSave = () => {
    updateHelpInfo(localHelpInfo);
    alert('Informações de ajuda atualizadas!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSystemSettings({ ...localSystemSettings, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    ...(user?.role?.toLowerCase() === 'administrador' ? [{ id: 'users', label: 'Usuários', icon: Users }] : []),
    { id: 'security', label: 'Segurança', icon: Shield },
    ...(user?.role?.toLowerCase() === 'administrador' ? [
      { id: 'system', label: 'Sistema', icon: SettingsIcon },
      { id: 'categories', label: 'Categorias & Status', icon: Database },
    ] : []),
    { id: 'help', label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <div className="p-8 flex-1">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-navy-900 tracking-tight mb-2">Configurações</h2>
        <p className="text-slate-500 font-medium">Personalize sua experiência e gerencie as preferências do sistema.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navegação de Abas */}
        <div className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da Aba */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Perfil do Usuário</h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                    {localUser.avatar ? (
                      <img src={localUser.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <User size={40} className="text-slate-400" />
                    )}
                  </div>
                  <input type="file" id="avatar-upload" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all scale-90 group-hover:scale-100 cursor-pointer">
                    <SettingsIcon size={14} />
                  </label>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{localUser.name}</h4>
                  <p className="text-slate-500 text-sm">{user.role.toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={localUser.name} 
                    onChange={(e) => setLocalUser({...localUser, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
                  <input 
                    type="email" 
                    value={localUser.email}
                    onChange={(e) => setLocalUser({...localUser, email: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleProfileSave}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Salvar Perfil
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-800">Gestão de Usuários</h3>
                <button 
                  onClick={() => setShowNewUserModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Novo Usuário
                </button>
              </div>
              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Cargo</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">E-mail</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {systemUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 capitalize">{u.role}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleOpenEditModal(u)} className="text-xs font-bold text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => handleDeleteUser(u.id, u.name)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal de Novo Usuário */}
              {showNewUserModal && (
                <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                  >
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                      <h3 className="font-bold text-xl text-slate-800">Novo Usuário</h3>
                      <button onClick={() => setShowNewUserModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                          <input required type="text" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                          <input required type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Senha Temporária</label>
                          <input required type="text" value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                          <select required value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700">
                            <option value="técnico">Técnico</option>
                            <option value="administrador">Administrador</option>
                            <option value="cliente">Cliente</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Áreas Permitidas (Categorias)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableCategories.map(cat => (
                            <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={newUserForm.allowed_categories.includes(cat)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewUserForm({...newUserForm, allowed_categories: [...newUserForm.allowed_categories, cat]});
                                  } else {
                                    setNewUserForm({...newUserForm, allowed_categories: newUserForm.allowed_categories.filter(c => c !== cat)});
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              {cat}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setShowNewUserModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">Criar Usuário</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Modal de Editar Usuário */}
              {showEditUserModal && (
                <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                  >
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                      <h3 className="font-bold text-xl text-slate-800">Editar Usuário</h3>
                      <button onClick={() => setShowEditUserModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                      </button>
                    </div>
                    
                    <form onSubmit={handleEditUser} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Nome</label>
                          <input required type="text" value={editUserForm.name} onChange={(e) => setEditUserForm({...editUserForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                          <input required type="email" value={editUserForm.email} onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Nova Senha</label>
                          <input type="text" placeholder="Deixe em branco para manter" value={editUserForm.password} onChange={(e) => setEditUserForm({...editUserForm, password: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                          <select required value={editUserForm.role} onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})} className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700">
                            <option value="técnico">Técnico</option>
                            <option value="administrador">Administrador</option>
                            <option value="cliente">Cliente</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Áreas Permitidas (Categorias)</label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableCategories.map(cat => (
                            <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={editUserForm.allowed_categories.includes(cat)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditUserForm({...editUserForm, allowed_categories: [...editUserForm.allowed_categories, cat]});
                                  } else {
                                    setEditUserForm({...editUserForm, allowed_categories: editUserForm.allowed_categories.filter(c => c !== cat)});
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              {cat}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 flex justify-end gap-3 mt-4">
                        <button type="button" onClick={() => setShowEditUserModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancelar</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">Salvar Alterações</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Segurança e Acesso</h3>
              <div className="max-w-md space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha Atual</label>
                  <input type="password" underline className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nova Senha</label>
                  <input type="password" underline className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirmar Nova Senha</label>
                  <input type="password" underline className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                </div>
                <button className="w-full py-3 bg-navy-900 text-white font-bold rounded-xl hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20">
                  Trocar Senha
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Personalização do Sistema</h3>
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                    {localSystemSettings.logo ? (
                      <img src={localSystemSettings.logo} className="w-full h-full object-cover" />
                    ) : (
                      <SettingsIcon className="text-slate-300" size={32} />
                    )}
                  </div>
                  <div>
                    <input type="file" id="logo-upload" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                    <label htmlFor="logo-upload" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-all">
                      Alterar Logo
                    </label>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">PNG ou JPG, máx 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Título do Site</label>
                    <input 
                      type="text" 
                      value={localSystemSettings.title} 
                      onChange={(e) => setLocalSystemSettings({...localSystemSettings, title: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subtítulo</label>
                    <input 
                      type="text" 
                      value={localSystemSettings.subtitle} 
                      onChange={(e) => setLocalSystemSettings({...localSystemSettings, subtitle: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>
                </div>

                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                  <h4 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                    <Info size={18} /> Zona de Perigo
                  </h4>
                  <p className="text-red-600 text-sm mb-4">Esta ação não pode ser desfeita. Todos os chamados serão permanentemente removidos do banco de dados.</p>
                  <button 
                    onClick={() => {
                      const confirm = window.prompt(`Para confirmar a exclusão de TODOS os chamados, digite o nome de usuário do administrador (${user.name}):`);
                      if (confirm === user.name) {
                        onClearAllTickets();
                        alert('Todos os chamados foram excluídos.');
                      } else if (confirm !== null) {
                        alert('Confirmação incorreta.');
                      }
                    }}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
                  >
                    Excluir Todos os Chamados
                  </button>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={handleSystemSave}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Salvar Sistema
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Categorias e Status</h3>
                  <p className="text-slate-500 text-sm">Gerencie as opções disponíveis para os chamados.</p>
                </div>
                <button className="px-4 py-2 bg-navy-900 text-white text-sm font-bold rounded-xl hover:bg-navy-800 transition-all">
                  Nova Categoria
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-4 bg-blue-500 rounded-full"></span>
                    Categorias
                  </h4>
                  <ul className="space-y-2">
                    {['Informática/TI', 'Elétrica', 'Predial/Civil', 'Segurança', 'Telecom'].map((cat, i) => (
                      <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                        <span className="text-sm font-medium text-slate-600">{cat}</span>
                        <button className="text-xs font-bold text-red-500 hover:text-red-700">Remover</button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-2 h-4 bg-amber-500 rounded-full"></span>
                    Status de Chamados
                  </h4>
                  <ul className="space-y-2">
                    {['Pendente', 'Em Progresso', 'Validando', 'Concluído', 'Cancelado'].map((status, i) => (
                      <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                        <span className="text-sm font-medium text-slate-600">{status}</span>
                        <button className="text-xs font-bold text-red-500 hover:text-red-700">Remover</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'help' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-xl font-bold text-slate-800 mb-6">Informações de Ajuda</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Texto de Ajuda (Máx 20 caracteres)</label>
                  <input 
                    type="text" 
                    maxLength={20} 
                    value={localHelpInfo.text}
                    onChange={(e) => setLocalHelpInfo({...localHelpInfo, text: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail de Suporte</label>
                    <input 
                      type="email" 
                      value={localHelpInfo.email}
                      onChange={(e) => setLocalHelpInfo({...localHelpInfo, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Telefone de Suporte</label>
                    <input 
                      type="text" 
                      value={localHelpInfo.phone}
                      onChange={(e) => setLocalHelpInfo({...localHelpInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Site de Documentação</label>
                  <input 
                    type="url" 
                    value={localHelpInfo.site}
                    onChange={(e) => setLocalHelpInfo({...localHelpInfo, site: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleHelpSave}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  Atualizar Ajuda
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
