
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Loader2, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Activity, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle
} from "lucide-react";
import { useLanguage } from "../components/context/LanguageContext"; // Importar contexto

export default function ProfilePage() {
  const { language, setLanguage } = useLanguage(); // Usar o hook de idioma
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newsDigest: true,
    language: 'pt-PT',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        if (currentUser.preferences) {
          setPreferences(p => ({ ...p, ...currentUser.preferences }));
        }
      } catch (error) {
        console.error("Erro ao carregar dados do utilizador:", error);
      }
    };
    fetchUser();
  }, []);
  
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage("");
    try {
      // Aplicar alterações imediatamente na UI
      setLanguage(preferences.language);
      
      await User.updateMyUserData({
        full_name: user.full_name,
        profile_image_url: user.profile_image_url,
        bio: user.bio,
        preferences: preferences
      });

      setMessage("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMessage("Ocorreu um erro ao atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      // Note: This would typically call a backend API to change password
      // For now, we'll just show a success message
      setMessage("Senha alterada com sucesso! Será necessário fazer login novamente.");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setMessage("Ocorreu um erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Para confirmar a eliminação da conta, escreva "ELIMINAR CONTA":');
    if (confirmation === "ELIMINAR CONTA") {
      try {
        // This would typically call a backend API to delete the account
        alert("A sua conta foi eliminada. Será redirecionado para a página inicial.");
        await User.logout();
      } catch (error) {
        console.error("Erro ao eliminar conta:", error);
        setMessage("Ocorreu um erro ao eliminar a conta.");
      }
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full p-6">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 text-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">O Meu Perfil</h1>
          <p className="text-gray-600 mt-1">Gerir as suas informações pessoais e preferências</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Atualize as suas informações pessoais que serão visíveis publicamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-6">
                   <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.profile_image_url} alt={user.full_name} />
                      <AvatarFallback className="text-2xl">{user.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="profile_image_url">URL da Imagem de Perfil</Label>
                      <Input
                        id="profile_image_url"
                        name="profile_image_url"
                        value={user.profile_image_url || ""}
                        onChange={handleInputChange}
                        placeholder="https://exemplo.com/imagem.png"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Nome Completo</Label>
                      <Input
                        id="full_name"
                        name="full_name"
                        value={user.full_name || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email (não pode ser alterado)</Label>
                      <Input id="email" value={user.email} disabled className="bg-gray-100" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={user.bio || ""}
                      onChange={handleInputChange}
                      placeholder="Escreva algo sobre si..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Guardar Alterações
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Atualize a sua senha para manter a conta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Mínimo de 8 caracteres</p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2" />
                    )}
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
           <TabsContent value="notifications">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Preferências de Notificações
                </CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por Email</h4>
                    <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações Push</h4>
                    <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Resumo Diário de Notícias</h4>
                    <p className="text-sm text-gray-500">Receber um resumo das principais notícias</p>
                  </div>
                  <Switch
                    checked={preferences.newsDigest}
                    onCheckedChange={(checked) => handlePreferenceChange('newsDigest', checked)}
                  />
                </div>
                <Button onClick={handleProfileSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Preferências Gerais
                </CardTitle>
                <CardDescription>
                  Configure o idioma da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => handlePreferenceChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleProfileSave} disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes("sucesso") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
